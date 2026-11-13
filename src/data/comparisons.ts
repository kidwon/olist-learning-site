import { ComparisonDimension, Trilingual } from '../types';

export const COMPARISON_DIMENSIONS: ComparisonDimension[] = [
  {
    id: 'ingestion',
    title: {
      zh: '1. 文件增量摄取与契约解析',
      ja: '1. ファイル増分取り込みと契約パース',
      en: '1. Incremental File Ingestion & Contract Parsing',
    },
    summary: {
      zh: '两者都保证每个文件只摄取一次，并将 JSON 按纯文本读取后对照契约解析，将未知字段放入 _rescued_data。',
      ja: 'どちらも各ファイルを1度だけ取り込み、JSON をテキストとして読んで契約通りにパースし、未知列を _rescued_data に退避します。',
      en: 'Both ingest every file exactly once and parse JSON text against explicit contracts, capturing unknown fields in _rescued_data.',
    },
    imperative: {
      file: 'src/olist_pipeline/bronze.py',
      approach: {
        zh: '使用 Spark Structured Streaming readStream + Auto Loader (cloudFiles) 配合 checkpoint 与 trigger(availableNow=True)。',
        ja: 'Spark Structured Streaming readStream + Auto Loader (cloudFiles) と checkpoint + availableNow=True を使用。',
        en: 'Spark Structured Streaming readStream + Auto Loader (cloudFiles) with explicit checkpoint and trigger(availableNow=True).',
      },
      code: `df = (
    spark.readStream.format(fmt)
    .option("cloudFiles.format", "text")
    .option("cloudFiles.schemaLocation", checkpoint)
    .load(landing_path)
)
parsed = parse_json_lines(df, contract)
parsed.writeStream.option("checkpointLocation", checkpoint)
      .trigger(availableNow=True).toTable(bronze_table)`,
      pros: {
        zh: '可在本地 Spark（用 file stream 替代 cloudFiles）直接运行并做单元测试。',
        ja: 'ローカル Spark でそのまま単体テスト可能。',
        en: 'Runs locally on standard Spark for fast unit & E2E testing.',
      },
    },
    declarative: {
      file: 'lakeflow/olist_sdp.sql',
      approach: {
        zh: '使用 STREAM read_files(..., format => "text") 定义 STREAMING TABLE，平台自动管理 checkpoint 与增量状态。',
        ja: 'STREAM read_files(..., format => "text") で STREAMING TABLE を定義し、チェックポイントはプラットフォームが自動管理。',
        en: 'Defines a STREAMING TABLE using STREAM read_files(..., format => "text"); Lakeflow manages checkpoints automatically.',
      },
      code: `CREATE OR REFRESH STREAMING TABLE bronze_order_items AS
SELECT p.r.*,
       CASE WHEN size(p.extra) > 0 THEN to_json(p.extra) END AS _rescued_data,
       p.m IS NULL AS _malformed,
       p.value AS _raw, p._source_file
FROM (
  SELECT value, _metadata.file_path AS _source_file,
         from_json(value, 'MAP<STRING, STRING>') AS m,
         from_json(value, 'order_id STRING, ...') AS r,
         map_filter(m, (k, v) -> NOT array_contains(array(...), k)) AS extra
  FROM STREAM read_files('\${olist.landing}/order_items', format => 'text')
) p;`,
      pros: {
        zh: '无需手动维护 checkpoint 路径和流式写入样板代码，声明即所得。',
        ja: 'チェックポイントパスや writeStream のボイラープレートが一切不要。',
        en: 'Zero checkpoint management or writeStream boilerplate.',
      },
    },
  },
  {
    id: 'dedup-cdc',
    title: {
      zh: '2. 去重与只前进的 CDC',
      ja: '2. 重複排除と前進のみの CDC',
      en: '2. Deduplication & Forward-Only CDC',
    },
    summary: {
      zh: '防止重复明细导致营收翻倍，同时防止乱序到达的旧状态覆盖已送达状态。',
      ja: '重複明細による売上二重計上と、遅延した古い状態による上書きを防ぎます。',
      en: 'Prevents double-counted order items and stops stale out-of-order CDC events from regressing state.',
    },
    imperative: {
      file: 'src/olist_pipeline/silver.py',
      approach: {
        zh: '批内用 row_number() 去重；跨批用只有 WHEN NOT MATCHED THEN INSERT 的 MERGE；CDC 用带 s.change_seq > t.change_seq 条件的 MERGE。',
        ja: 'バッチ内は row_number()、バッチ間は INSERT のみの MERGE、CDC は s.change_seq > t.change_seq 条件付き MERGE。',
        en: 'Intra-batch row_number(), insert-only MERGE for append feeds, and conditional MERGE (s.change_seq > t.change_seq) for CDC.',
      },
      code: `DeltaTable.forName(spark, target).alias("t")
  .merge(latest.alias("s"), "t.order_id = s.order_id")
  .whenMatchedUpdate(
      condition="s.change_seq > t.change_seq",
      set={c: f"s.{c}" for c in cols}
  )
  .whenNotMatchedInsertAll()
  .execute()`,
      pros: {
        zh: '每一步逻辑完全透明可控，可用几行手写 DataFrame 在 pytest 中精准断言边界条件。',
        ja: '各ステップの挙動が完全に透明で、pytest で境界値を厳密にテスト可能。',
        en: 'Full control over every join predicate and easy to unit test in pytest.',
      },
    },
    declarative: {
      file: 'lakeflow/olist_sdp.sql',
      approach: {
        zh: '使用 AUTO CDC INTO ... KEYS (...) SEQUENCE BY change_seq，平台自动处理批内批间去重与乱序丢弃。',
        ja: 'AUTO CDC INTO ... KEYS (...) SEQUENCE BY change_seq を宣言するだけで重複排除と順序制御を自動化。',
        en: 'AUTO CDC INTO ... KEYS (...) SEQUENCE BY handles deduplication and out-of-order suppression natively.',
      },
      code: `CREATE OR REFRESH STREAMING TABLE silver_orders;

CREATE FLOW orders_cdc_flow AS
AUTO CDC INTO silver_orders
FROM STREAM valid_orders_cdc
KEYS (order_id)
SEQUENCE BY change_seq;`,
      pros: {
        zh: '仅需 5 行 SQL 即可替代数十行窗口函数 + foreachBatch + Delta MERGE 代码。',
        ja: 'わずか数行の SQL でウィンドウ関数 + foreachBatch + MERGE を代替できます。',
        en: 'Replaces dozens of lines of window functions + foreachBatch + MERGE with 5 lines of SQL.',
      },
    },
  },
  {
    id: 'scd2',
    title: {
      zh: '3. 卖家历史 SCD Type 2',
      ja: '3. セラー履歴 SCD Type 2',
      en: '3. Seller History SCD Type 2',
    },
    summary: {
      zh: '每日收到全量卖家快照，需要按日期顺序回放变更，保留历史版本区间 [valid_from, valid_to)。',
      ja: '日次の全件スナップショットを日付順に処理し、履歴期間 [valid_from, valid_to) を保持します。',
      en: 'Processes daily full seller snapshots in chronological order, maintaining [valid_from, valid_to) intervals.',
    },
    imperative: {
      file: 'src/olist_pipeline/scd2.py',
      approach: {
        zh: '用属性哈希检测变更，构造双行 source（merge_key=seller_id 关闭旧行 + merge_key=NULL 插入新行），单次原子 MERGE 完成。',
        ja: '属性ハッシュで変更を検知し、2行展開テクニック（旧行クローズ用 + NULLキー挿入用）で1回の MERGE で完結。',
        en: 'Hash-based diffing + two-row staged MERGE trick (natural key to close old row, NULL key to insert new row).',
      },
      code: `# 首次出现 valid_from = 1900-01-01
# 变更卖家拆成两行：
#   (seller_id, ..., merge_key=seller_id) -> WHEN MATCHED UPDATE valid_to
#   (seller_id, ..., merge_key=None)      -> WHEN NOT MATCHED INSERT`,
      pros: {
        zh: '可以直接控制首次出现日期（1900-01-01）以及快照缺失不等于删除的语义。',
        ja: '初回有効日（1900-01-01）やスナップショット欠落を無視する仕様を直接記述可能。',
        en: 'Explicitly controls initial 1900-01-01 start date and ignores missing sellers.',
      },
    },
    declarative: {
      file: 'lakeflow/sellers_scd2.py',
      approach: {
        zh: 'SQL 版 AUTO CDC FROM SNAPSHOT 只能看当前表，因此必须使用 Lakeflow Python API (create_auto_cdc_from_snapshot_flow) 按天递交快照，再加一个视图把首版起点转为 1900-01-01。',
        ja: 'SQL 版の制約を避けるため Python API (create_auto_cdc_from_snapshot_flow) で日次順にスナップショットを渡し、ビューで初回開始日を 1900-01-01 に調整。',
        en: 'Uses Lakeflow Python API (create_auto_cdc_from_snapshot_flow) to feed daily snapshots in date order, plus a view to anchor initial valid_from at 1900-01-01.',
      },
      code: `dp.create_streaming_table(name="silver_seller_history")

dp.create_auto_cdc_from_snapshot_flow(
    target="silver_seller_history",
    source=next_snapshot_and_version,  # 按 yyyyMMdd 顺序返回下一个快照
    keys=["seller_id"],
    stored_as_scd_type=2,
)`,
      pros: {
        zh: '无需手写哈希比对与双行 MERGE，但仍需理解 Python Snapshot API 才能处理历史回放。',
        ja: 'ハッシュ比較や2行 MERGE は不要ですが、過去スナップショットの順次再生には Python API が必要。',
        en: 'Eliminates manual hashing and MERGE staging, while Python API handles ordered historical snapshots.',
      },
    },
  },
  {
    id: 'dq-gate',
    title: {
      zh: '4. 质量规则、隔离与 5% 闸门',
      ja: '4. 品質ルール・隔離・5% ゲート',
      en: '4. DQ Rules, Quarantine & 5% Gate',
    },
    summary: {
      zh: '坏行带着 _failed_rules 进入隔离区，超过 5% 坏行时阻断 Gold 发布。',
      ja: '不正行は _failed_rules 付きで隔離され、5%超で Gold 公開を停止します。',
      en: 'Bad rows go to quarantine with _failed_rules; >5% bad rate halts Gold.',
    },
    imperative: {
      file: 'src/olist_pipeline/quality.py & gate.py',
      approach: {
        zh: 'Python 规则列表动态拼接 Column 表达式，将指标写入 ops.dq_metrics；独立任务 gate.py 检查比例并在超标时抛异常阻断 DAG 下游。',
        ja: 'Python ルールリストから式を生成し ops.dq_metrics へ書き込み、独立タスク gate.py が 5% 超で例外を投げて DAG を停止。',
        en: 'Python Rule objects evaluate _failed_rules and write ops.dq_metrics; gate.py raises DataQualityGateError before Gold task.',
      },
      code: `if bad_rate > cfg.dq_max_bad_rate:
    raise DataQualityGateError(f"bad_rate={bad_rate:.2%}")`,
      pros: {
        zh: 'Job DAG 天然支持任务依赖，闸门阻断非常直观。',
        ja: 'Job DAG のタスク依存でゲート停止が直感的。',
        en: 'Natural task-level gating in Databricks Jobs DAG.',
      },
    },
    declarative: {
      file: 'lakeflow/olist_sdp.sql & resources/olist_jobs.yml',
      approach: {
        zh: 'checked_* 表计算一次 _failed_rules，EXPECT 约束按名字引用以让事件日志自动计数；通过把管道拆成两次刷新（sdp_silver_and_gate 失败则不触发 sdp_gold）实现闸门。',
        ja: 'checked_* で _failed_rules を1度だけ計算し EXPECT で参照。パイプラインを2回のリフレッシュに分割して 5% ゲートを実現。',
        en: 'checked_* computes _failed_rules once and EXPECT references rule names for event log metrics. Two pipeline refreshes enforce the 5% gate.',
      },
      code: `CREATE OR REFRESH MATERIALIZED VIEW dq_gate (
  CONSTRAINT bad_rate_within_limit
    EXPECT (bad_rate <= \${olist.dq_max_bad_rate}) ON VIOLATION FAIL UPDATE
) AS SELECT ...`,
      pros: {
        zh: '无需自建 ops.dq_metrics 写入逻辑，Lakeflow Event Log 自动记录每条 EXPECT 的通过/失败数。',
        ja: 'メトリクス集計コードが不要で、Lakeflow Event Log が自動でルール別件数を記録。',
        en: 'Lakeflow Event Log automatically tracks per-expectation pass/fail counts.',
      },
    },
  },
  {
    id: 'gold-incremental',
    title: {
      zh: '5. 增量 Gold 更新',
      ja: '5. Gold 層の増分更新',
      en: '5. Incremental Gold Processing',
    },
    summary: {
      zh: '避免每日全量重算 10 万订单，只处理发生变更的订单。',
      ja: '毎日 10 万件を全量再計算せず、変更があった注文だけを処理します。',
      en: 'Avoids full 100k-order rebuilds daily by processing only changed orders.',
    },
    imperative: {
      file: 'src/olist_pipeline/incremental.py',
      approach: {
        zh: '显式开启 Silver 表的 Delta Change Data Feed，读取水位线之后的变更，反查受影响的 order_id，局部重算并 MERGE，成功后推进 ops.gold_watermarks。',
        ja: 'Delta CDF を有効化し、ウォーターマーク以降の変更から影響 order_id を抽出して局所 MERGE し、成功後に水位線を更新。',
        en: 'Reads Delta CDF since ops.gold_watermarks, computes affected order_ids, MERGEs Gold, and advances watermarks post-commit.',
      },
      code: `# 必须手动维护每张上游表的水位线与全量降级逻辑
affected = union_affected_orders(cdf_changes)
rebuild_and_merge(gold_table, affected)
advance_watermarks(ops_watermarks, new_versions)`,
      pros: {
        zh: '跨多张上游表的复杂实体级增量逻辑完全可控，且可精确统计每次重算比例。',
        ja: '複数テーブルを跨ぐ複雑な増分ロジックを完全に制御し、再計算割合も計測可能。',
        en: 'Full control over multi-source entity-level incremental logic and rebuild telemetry.',
      },
    },
    declarative: {
      file: 'lakeflow/olist_sdp.sql',
      approach: {
        zh: '直接声明为 MATERIALIZED VIEW（物化视图），由 Databricks Serverless 引擎自动决定采用增量刷新、全量重算还是跳过（NO_OP）。',
        ja: 'MATERIALIZED VIEW として宣言するだけで、プラットフォームが自動的（増分・全量・NO_OP スキップ）に最適化実行。',
        en: 'Declared as MATERIALIZED VIEWs; the Databricks serverless engine chooses incremental refresh, full recompute, or NO_OP skip automatically.',
      },
      code: `CREATE OR REFRESH MATERIALIZED VIEW fact_order_item AS
SELECT ...
FROM silver_order_items i
JOIN silver_orders o USING (order_id)
LEFT JOIN silver_seller_history s
  ON i.seller_id = s.seller_id
 AND o.order_purchase_ts >= s.__START_AT
 AND (o.order_purchase_ts < s.__END_AT OR s.__END_AT IS NULL);`,
      pros: {
        zh: '完全不需要自己写水位线表、CDF 读取和回退逻辑。',
        ja: 'ウォーターマーク管理も CDF 読み取りもフォールバック処理も一切不要。',
        en: 'Zero watermark tables, zero CDF plumbing, and automatic NO_OP skipping.',
      },
    },
  },
];

export const RECONCILE_BUGS: { title: Trilingual; detail: Trilingual }[] = [
  {
    title: {
      zh: 'Bug 1 (ADR-0012)：重投递的卖家快照导致地址版本倒退',
      ja: 'Bug 1 (ADR-0012)：セラー スナップショットの再配信による先祖返り',
      en: 'Bug 1 (ADR-0012): Re-delivered seller snapshots caused address regression',
    },
    detail: {
      zh: '对账发现两个版本的 dim_seller 存在差异，排查出当较旧的快照文件被重新投递时，手写版本未严格校验日期先后顺序，导致卖家地址退回旧城市。',
      ja: '突合で dim_seller に差分が発生。古いスナップショットの再配信時に日付順チェックが不十分で、セラー住所が過去の都市に巻き戻っていたバグを発見。',
      en: 'Reconciliation caught dim_seller diffs: when older snapshots were re-dropped, the imperative code lacked strict date ordering and regressed seller cities.',
    },
  },
  {
    title: {
      zh: 'Bug 2 (ADR-0013)：一次读取多天文件时按读取时间排序出错',
      ja: 'Bug 2 (ADR-0013)：複数日分のファイルを一括読込した際の順序誤り',
      en: 'Bug 2 (ADR-0013): Multi-day catch-up ordered by read time instead of batch_date',
    },
    detail: {
      zh: '在补跑连续多天堆积的文件时，按 _ingested_at（文件读取时间）排序而不是按路径中的 batch_date 排序，导致跨天变更顺序错乱。',
      ja: '複数日分をまとめて処理する際、パスの batch_date ではなく取り込み時刻 _ingested_at で並べていたため、日次変更の順序が崩れていたことを特定。',
      en: 'During multi-day catch-up runs, ordering by _ingested_at rather than landing batch_date scrambled cross-day updates.',
    },
  },
];
