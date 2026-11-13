import { ADRItem } from '../types';

export const ADRS: ADRItem[] = [
  {
    id: 'ADR-0001',
    title: {
      zh: '幂等摄取与两层去重策略',
      ja: '冪等な取り込みと2段階の重複排除',
      en: 'Idempotent Ingestion and Two-Level Deduplication',
    },
    category: 'ingestion',
    file: 'docs/adr/zh/0001-idempotent-ingestion-and-dedup.md',
    problem: {
      zh: '文件可能被重传、作业可能重试，同一订单明细可能在同一文件或跨天重复到达，导致 GMV 翻倍。',
      ja: 'ファイル再送やジョブのリトライにより、同じ注文明細がバッチ内・バッチ間で重複し売上が二重計上される。',
      en: 'File re-deliveries and job retries cause duplicate order items intra-batch and cross-day, double-counting GMV.',
    },
    decision: {
      zh: 'Auto Loader checkpoint 保证文件级只读一次；批内用 row_number() 去重；跨批用 WHEN NOT MATCHED THEN INSERT 的 Delta MERGE。',
      ja: 'Auto Loader でファイル単位の1回読込を保証し、バッチ内は row_number()、バッチ間は INSERT のみの MERGE を採用。',
      en: 'Auto Loader checkpoints ensure once-per-file reads; row_number() deduplicates intra-batch; insert-only MERGE deduplicates cross-batch.',
    },
    tradeoff: {
      zh: 'insert-only MERGE 会忽略对已存在主键的合法更新，因此仅适用于不可变 append 数据源（order_items, reviews）。',
      ja: 'INSERT のみの MERGE は既存キーの更新を無視するため、不変な append フィード専用とする。',
      en: 'Insert-only MERGE ignores updates to existing keys, so it is strictly limited to immutable append feeds.',
    },
  },
  {
    id: 'ADR-0002',
    title: {
      zh: '只前进的 CDC MERGE（防止乱序状态回退）',
      ja: '前進のみの CDC MERGE（順序逆転による状態後退の防止）',
      en: 'Forward-Only CDC MERGE',
    },
    category: 'silver',
    file: 'docs/adr/zh/0002-cdc-forward-only-merge.md',
    problem: {
      zh: '订单状态变更可能乱序到达（delivered 先于 shipped 到达），直接覆盖会让已送达订单倒退。',
      ja: 'CDC イベントが順不同で届くと、単純な上書き更新では配達済み注文が発送済みに戻ってしまう。',
      en: 'Out-of-order CDC events (delivered before shipped) regress order status under naive overwrite MERGEs.',
    },
    decision: {
      zh: '在 MERGE 的 whenMatchedUpdate 中强制加上条件 source.change_seq > target.change_seq，并在批内先取最大 change_seq。',
      ja: 'MERGE の更新条件に source.change_seq > target.change_seq を強制し、バッチ内でも最大 seq のみを抽出する。',
      en: 'Enforce condition source.change_seq > target.change_seq in MERGE after keeping max change_seq per batch.',
    },
    tradeoff: {
      zh: '要求上游提供单调递增的变更序列号 change_seq（比依赖易受时钟偏移影响的时间戳更可靠）。',
      ja: '送信元が単調増加する change_seq を付与する必要がある（時刻ズレの影響を受けるタイムスタンプより安全）。',
      en: 'Requires a monotonic producer sequence number (safer than wall-clock timestamps).',
    },
  },
  {
    id: 'ADR-0003',
    title: {
      zh: '卖家历史 SCD Type 2 与时点关联',
      ja: 'セラー履歴の SCD Type 2 とポイントインタイム結合',
      en: 'Seller History SCD Type 2 & Point-in-Time Joins',
    },
    category: 'silver',
    file: 'docs/adr/zh/0003-scd2-sellers.md',
    problem: {
      zh: '卖家迁址后，历史订单的地区配送表现必须归属到“下单当时”卖家所在的州，而非当前新地址。',
      ja: 'セラー移転後、過去の注文の地域別実績は現在の住所ではなく「注文時点」の住所で集計する必要がある。',
      en: 'When sellers relocate, historical regional delivery metrics must reflect where the seller was on the order date.',
    },
    decision: {
      zh: '用属性哈希 + 双行 staged MERGE 维护 valid_from / valid_to / is_current，首版起点设为 1900-01-01，快照中缺失不视为删除。',
      ja: 'ハッシュ比較 + 2行展開 MERGE で履歴を保持。初回は 1900-01-01 開始とし、スナップショット欠落は削除扱いしない。',
      en: 'Hash diffing + two-row staged MERGE for [valid_from, valid_to), anchored at 1900-01-01; missing from snapshot != deleted.',
    },
    tradeoff: {
      zh: 'Gold 事实表关联需要区间范围 Join（>= valid_from AND < valid_to），而非简单的等值 Join。',
      ja: 'Gold 側の結合が等値結合ではなく範囲結合（valid_from 〜 valid_to）になる。',
      en: 'Fact-to-dimension join becomes a range join instead of a simple equality join.',
    },
  },
  {
    id: 'ADR-0004',
    title: {
      zh: '迟到数据的 3 天容忍窗口与回溯修正',
      ja: '遅延データの 3 日間許容ウィンドウと遡及修正',
      en: 'Late-Arriving Data: 3-Day Tolerance & Retroactive Updates',
    },
    category: 'silver',
    file: 'docs/adr/zh/0004-late-data.md',
    problem: {
      zh: '昨天的订单明细可能今天或后天才送达，按摄取日期算会扭曲每日营收，全拒绝又会丢数据。',
      ja: '昨日の売上が数日遅れて届く場合、取り込み日基準では日次売上が歪み、全拒否するとデータが欠損する。',
      en: 'Order items arriving days late distort daily revenue if dated by ingestion, yet dropping them loses real sales.',
    },
    decision: {
      zh: '事实表按销售发生日归集；迟到 ≤ 3 天的数据正常接收并通过 MERGE 回溯更新 Gold；超过 3 天进隔离区 too_late。',
      ja: '売上発生日基準で集計し、3日以内の遅延は受け入れて MERGE で過去分を補正。3日超は too_late として隔離。',
      en: 'Date facts by sale date; accept ≤3 days late and MERGE into Gold; quarantine >3 days late as too_late.',
    },
    tradeoff: {
      zh: '最近 3 天的 Gold 报表数字可能随迟到数据微调（需向业务方说明 T+3 稳定口径）。',
      ja: '直近3日間の Gold の数値は遅延到着により更新される可能性がある。',
      en: 'The last 3 days of Gold metrics can shift slightly until the window closes.',
    },
  },
  {
    id: 'ADR-0005',
    title: {
      zh: '行级隔离、规则指标与 5% 质量闸门',
      ja: '行単位隔離・品質メトリクス・5% サーキットブレーカー',
      en: 'Row Quarantine, DQ Metrics & 5% Circuit Breaker Gate',
    },
    category: 'silver',
    file: 'docs/adr/zh/0005-data-quality-gate.md',
    problem: {
      zh: '少量脏行不应阻断整个管道，但上游大规模故障（如 50% 坏行）绝不能污染 Gold 报表。',
      ja: '数行の不正でジョブ全体を止めるべきではないが、上流障害による大量のゴミデータは Gold に流してはならない。',
      en: 'A few bad rows should not break the job, but systemic upstream failures must not poison Gold.',
    },
    decision: {
      zh: '每行记录所有违反的规则 _failed_rules；坏行写入 ops.quarantine，计数写入 ops.dq_metrics；单批坏行 > 5% 时由 dq_gate 阻断 Gold。',
      ja: '違反ルール配列を付与して ops.quarantine に隔離し ops.dq_metrics を記録。不正率 5% 超でゲートが Gold を停止。',
      en: 'Attach _failed_rules per row, route to ops.quarantine, log ops.dq_metrics, and halt Gold if bad rate > 5%.',
    },
    tradeoff: {
      zh: '5% 是经验阈值，需要随着数据成熟度按表或按业务线微调。',
      ja: '5% という閾値は運用実績に応じて調整が必要になる。',
      en: 'The 5% threshold is a global heuristic that may need per-feed tuning over time.',
    },
  },
  {
    id: 'ADR-0006',
    title: {
      zh: '显式数据契约与 _rescued_data（拒绝自动推断）',
      ja: '明示的データ契約と _rescued_data（スキーマ推論の回避）',
      en: 'Explicit Data Contracts & _rescued_data Over Inference',
    },
    category: 'ingestion',
    file: 'docs/adr/zh/0006-data-contracts-and-rescued-data.md',
    problem: {
      zh: 'Schema 自动推断会让上游意外新增字段或变更类型直接穿透并破坏下游表。',
      ja: 'スキーマ自動推論を許すと、送信元の予期せぬ列追加や型変更がテーブル構造を破壊する。',
      en: 'Schema inference lets upstream producers silently alter table schemas and break downstream queries.',
    },
    decision: {
      zh: 'Bronze 按文本读取 JSON 并用显式契约解析，未知字段存入 _rescued_data，原始行存入 _raw。',
      ja: 'JSON をテキストで読み明示的契約でパースし、未知フィールドは _rescued_data、生行は _raw に保持。',
      en: 'Read JSON as text, parse against explicit contracts, store extra fields in _rescued_data and raw lines in _raw.',
    },
    tradeoff: {
      zh: '上游新增合法字段需要手动更新 contracts.py 并从 _raw 回填，换取下游绝对稳定。',
      ja: '正当な新カラムを昇格させるには contracts.py の更新と _raw からの再処理が必要。',
      en: 'Promoting new legitimate fields requires updating contracts.py and backfilling from _raw.',
    },
  },
  {
    id: 'ADR-0007',
    title: {
      zh: '客户身份归并（customer_unique_id vs customer_id）',
      ja: '顧客名寄せ（customer_unique_id vs customer_id）',
      en: 'Customer Identity Resolution (customer_unique_id)',
    },
    category: 'gold',
    file: 'docs/adr/zh/0007-customer-identity.md',
    problem: {
      zh: 'Olist 每次下单都会生成一个新的 customer_id，直接用它建表会导致复购率为 0。',
      ja: 'Olist は注文ごとに新しい customer_id を発行するため、そのままではリピート分析が不可能。',
      en: 'Olist issues a new customer_id per order, making repeat-customer metrics 0 if used directly.',
    },
    decision: {
      zh: '按自然人标识 customer_unique_id 构建 dim_customer，地址取该客户最近一次订单的值。',
      ja: '自然人キーである customer_unique_id 単位で dim_customer を構築し、最新注文の住所を採用。',
      en: 'Build dim_customer at the customer_unique_id grain using the address from their latest order.',
    },
    tradeoff: {
      zh: 'dim_customer 不做 SCD2（认为客户当前所在城市即可满足分析，卖家才需要历史归属）。',
      ja: '顧客ディメンションは SCD2 にせず最新住所のみを保持する割り切り。',
      en: 'dim_customer is SCD Type 1 (current address only), unlike dim_seller which is SCD Type 2.',
    },
  },
  {
    id: 'ADR-0008',
    title: {
      zh: '命令式 PySpark 与声明式 Lakeflow 范式对比',
      ja: '命令型 PySpark vs 宣言型 Lakeflow の比較',
      en: 'Imperative PySpark vs Declarative Lakeflow',
    },
    category: 'architecture',
    file: 'docs/adr/zh/0008-imperative-vs-declarative.md',
    problem: {
      zh: '团队在 Databricks 上应选择手写 PySpark + MERGE 还是 Lakeflow Declarative Pipelines？',
      ja: 'Databricks 上で手書き PySpark + MERGE と Lakeflow 宣言型のどちらを選ぶべきか？',
      en: 'When should a team choose hand-written PySpark + MERGE vs Lakeflow Declarative Pipelines?',
    },
    decision: {
      zh: '记录两者在代码量（1,070 vs 550 行）、本地可测性、平台托管增量刷新与复杂控制流上的权衡。',
      ja: 'コード量（1,070 vs 550行）、ローカルテスト容易性、自動増分更新、制御柔軟性の観点で整理。',
      en: 'Document trade-offs across code volume (1,070 vs 550 LOC), local testability, managed MVs, and control flow.',
    },
    tradeoff: {
      zh: 'Lakeflow 极大减少样板代码，但目前无法在本地笔记本离线运行单元测试。',
      ja: 'Lakeflow はコード量を半減できるが、ローカル環境単体でのテスト実行ができない。',
      en: 'Lakeflow halves boilerplate code but cannot run unit tests locally offline.',
    },
  },
  {
    id: 'ADR-0009',
    title: {
      zh: '订单履约的累积快照事实表',
      ja: '注文フルフィルメントの累積スナップショット',
      en: 'Accumulating Snapshot for Order Fulfillment',
    },
    category: 'gold',
    file: 'docs/adr/zh/0009-accumulating-snapshot-fulfillment.md',
    problem: {
      zh: '事务明细表难以直接回答“从审核到发货平均耗时几小时”及送达延误对评分的影响。',
      ja: '明細ファクトだけでは「承認から出荷までの平均所要時間」や遅延と評価スコアの相関を追いにくい。',
      en: 'Transaction item facts do not directly answer stage-to-stage lead times or delay-vs-review correlation.',
    },
    decision: {
      zh: '建立 fact_order_fulfillment（每单一行），原地更新各里程碑时间戳、阶段耗时及评分，负时长置 NULL。',
      ja: '1注文1行の fact_order_fulfillment を構築し、各工程タイムスタンプと所要時間・評価を保持（負値は NULL）。',
      en: 'Build fact_order_fulfillment (1 row/order) with milestone timestamps, stage hours (NULL if negative), and review score.',
    },
    tradeoff: {
      zh: '分析耗时时必须注意过滤未送达的右删失订单（通过 is_delivered 标记简化）。',
      ja: '平均時間集計時に未完了の右側打ち切り注文を除外する意識が必要（is_delivered フラグで補助）。',
      en: 'Analysts must filter right-censored open orders via is_delivered when averaging lead times.',
    },
  },
  {
    id: 'ADR-0010',
    title: {
      zh: '每日订单积压的周期快照事实表',
      ja: '日次注文残の定期スナップショット',
      en: 'Periodic Snapshot for Daily Order Backlog',
    },
    category: 'gold',
    file: 'docs/adr/zh/0010-periodic-snapshot-backlog.md',
    problem: {
      zh: '当前状态表无法还原过去任意一天还有多少订单积压未完成。',
      ja: '最新状態テーブルからは「過去の任意の日に何件の注文が滞留していたか」を復元できない。',
      en: 'Current-state tables cannot reconstruct historical open order counts on any past day.',
    },
    decision: {
      zh: '在 Silver 保留只追加的 order_changes 日志，在 Gold 按 日期 × 状态 × 客户州 构建周期快照。',
      ja: 'Silver に追記専用ログ order_changes を残し、Gold で 日付 × ステータス × 州 の定期スナップショットを生成。',
      en: 'Keep append-only silver.order_changes and build a day × status × state periodic snapshot in Gold.',
    },
    tradeoff: {
      zh: '需要额外维护一份只追加审计日志表并按日期脊柱展开计算。',
      ja: '追記専用ログテーブルの保持と日付軸での展開計算コストが増える。',
      en: 'Adds an append-only audit table and date-spine expansion cost.',
    },
  },
  {
    id: 'ADR-0011',
    title: {
      zh: '使用 Delta Change Data Feed 增量处理 Gold',
      ja: 'Delta Change Data Feed による Gold の増分処理',
      en: 'Incremental Gold Processing with Delta CDF',
    },
    category: 'gold',
    file: 'docs/adr/zh/0011-incremental-gold-cdf.md',
    problem: {
      zh: '每日只变动 1-2% 订单却全量重建 Gold 浪费计算资源。',
      ja: '日次で1〜2%しか変わらないのに Gold を毎回全件再構築するのは非効率。',
      en: 'Rebuilding all of Gold daily when only 1-2% of orders change wastes compute.',
    },
    decision: {
      zh: '读取 Silver 表的 CDF 变更，汇总受影响的 order_id 局部重建 Gold，并在 MERGE 成功后推进 ops.gold_watermarks。',
      ja: 'Silver の CDF から影響 order_id を特定して局所 MERGE し、成功後に ops.gold_watermarks を更新。',
      en: 'Read Silver CDF changes, rebuild affected order_ids, MERGE Gold, and advance ops.gold_watermarks post-commit.',
    },
    tradeoff: {
      zh: '增加了水位线管理与版本过期时退回全量重建的复杂度。',
      ja: 'ウォーターマーク管理と CDF 履歴切れ時の全件フォールバック実装が必要になる。',
      en: 'Adds watermark state management and full-refresh fallback logic.',
    },
  },
  {
    id: 'ADR-0012',
    title: {
      zh: '与 Lakeflow 版本对比及对账发现的快照倒退问题',
      ja: 'Lakeflow 比較と突き合わせで見つかったスナップショット逆転',
      en: 'Lakeflow Comparison & Snapshot Regression Discovery',
    },
    category: 'architecture',
    file: 'docs/adr/zh/0012-lakeflow-comparison.md',
    problem: {
      zh: '早期测试未能发现历史快照重投递时卖家维度可能被旧数据覆盖的问题。',
      ja: '初期テストでは古いスナップショットが再投入された際のセラー情報先祖返りに気付けなかった。',
      en: 'Initial tests missed a regression where re-delivered older seller snapshots overwrote newer locations.',
    },
    decision: {
      zh: '通过与 Lakeflow 声明式实现逐行对账暴露出该缺陷，并在命令式 SCD2 中严格限制只按更晚快照日期推进。',
      ja: 'Lakeflow 版との突き合わせでバグを検知し、より新しい日付のスナップショットのみを適用するよう修正。',
      en: 'Reconciliation against Lakeflow surfaced the bug; enforced strict chronological snapshot ordering.',
    },
    tradeoff: {
      zh: '需要在测试中显式覆盖乱序重投递快照的场景。',
      ja: 'スナップショットの順不同再送をテストケースに組み込む必要がある。',
      en: 'Requires explicit test coverage for out-of-order snapshot re-delivery.',
    },
  },
  {
    id: 'ADR-0013',
    title: {
      zh: '两套完整实现与每日 16 表逐行对账架构',
      ja: '2つの完全実装と毎日16テーブルの行単位突合',
      en: 'Two Full Implementations Reconciled Across 16 Tables Daily',
    },
    category: 'architecture',
    file: 'docs/adr/zh/0013-two-implementations.md',
    problem: {
      zh: 'Lakeflow 声明式管道只能在云端 Databricks 运行，如何在 CI/CD 和日常运行中确保其逻辑 100% 正确？',
      ja: 'クラウド上でしか動かない Lakeflow 宣言型パイプラインの正確性をどう担保するか？',
      en: 'How to continuously verify a cloud-only Lakeflow pipeline that cannot run unit tests on a laptop?',
    },
    decision: {
      zh: '将本地经过 71 个 pytest 验证的命令式管道作为“标准答案”，每日 Job 并行运行两套实现并在最后用 EXCEPT ALL 比对全部 16 张表。',
      ja: 'ローカルの 71 pytest で検証済みの命令型を正解オラクルとし、毎日並行実行して最後に 16 テーブルを EXCEPT ALL で比較する。',
      en: 'Use the locally tested imperative pipeline as the oracle; run both daily and assert zero EXCEPT ALL diffs across 16 tables.',
    },
    tradeoff: {
      zh: '日常运维中会运行两份计算，作为学习与架构验证工程极具价值，真实生产通常二选一。',
      ja: '計算コストは2倍になるが、検証・学習用ポートフォリオとして圧倒的な信頼性を実現。',
      en: 'Doubles daily compute for verification; in typical production you pick one paradigm after validation.',
    },
  },
];
