import { SqlSnippet } from '../types';

export const SQL_SNIPPETS: SqlSnippet[] = [
  {
    id: 'sdp-bronze',
    category: 'bronze',
    title: {
      zh: 'Bronze 增量摄取与 _rescued_data 契约解析',
      ja: 'Bronze 増分取り込みと _rescued_data 契約パース',
      en: 'Bronze Streaming Ingestion & _rescued_data Contract Parsing',
    },
    sourceFile: 'lakeflow/olist_sdp.sql',
    lineRange: 'L14-L30',
    description: {
      zh: '使用 STREAM read_files 按纯文本读取 JSON，再结合 from_json(..., MAP<STRING, STRING>) 与 map_filter 精准提取契约之外的新字段存入 _rescued_data，同时保留 _raw 原文。',
      ja: 'STREAM read_files で JSON をテキストとして読み、from_json と map_filter で契約外の未知フィールドを _rescued_data に退避し、_raw も保持します。',
      en: 'Reads JSON as text via STREAM read_files, parses against the contract, and captures unknown keys into _rescued_data using map_filter while keeping _raw.',
    },
    idioms: [
      {
        zh: 'STREAM read_files(..., format => "text")：Lakeflow 原生增量文件读取',
        ja: 'STREAM read_files(..., format => "text")：Lakeflow ネイティブの増分読込',
        en: 'STREAM read_files(..., format => "text"): Lakeflow native incremental file source',
      },
      {
        zh: '_metadata.file_path + regexp_extract：从分区路径中提取 batch_date',
        ja: '_metadata.file_path + regexp_extract：パスから batch_date を抽出',
        en: '_metadata.file_path + regexp_extract: extracts batch_date from directory partitioning',
      },
    ],
    sql: `CREATE OR REFRESH STREAMING TABLE bronze_order_items AS
SELECT p.r.*,
       CASE WHEN size(p.extra) > 0 THEN to_json(p.extra) END AS _rescued_data,
       p.m IS NULL AS _malformed,
       p.value AS _raw,
       p._source_file,
       to_date(regexp_extract(p._source_file, 'batch_date=(\\\\d{4}-\\\\d{2}-\\\\d{2})', 1)) AS _batch_date,
       current_timestamp() AS _ingested_at
FROM (
  SELECT value, _source_file, m,
         from_json(value, 'order_id STRING, order_item_id INT, product_id STRING, seller_id STRING, order_purchase_ts TIMESTAMP, shipping_limit_ts TIMESTAMP, price DECIMAL(12,2), freight_value DECIMAL(12,2)') AS r,
         map_filter(m, (k, v) -> NOT array_contains(array('order_id', 'order_item_id', 'product_id', 'seller_id', 'order_purchase_ts', 'shipping_limit_ts', 'price', 'freight_value'), k)) AS extra
  FROM (
    SELECT value, _metadata.file_path AS _source_file, from_json(value, 'MAP<STRING, STRING>') AS m
    FROM STREAM read_files('\${olist.landing}/order_items', format => 'text')
  )
) p;`,
  },
  {
    id: 'sdp-quality-expectations',
    category: 'quality',
    title: {
      zh: '单次规则评估 + EXPECT 命名约束 + 隔离流',
      ja: '単一ルール評価 + EXPECT 名前付き制約 + 隔離フロー',
      en: 'Single-Pass Rule Evaluation + Named EXPECT + Quarantine Flow',
    },
    sourceFile: 'lakeflow/olist_sdp.sql',
    lineRange: 'L119-L201',
    description: {
      zh: '在 SELECT 中用 filter(array(...), r -> r IS NOT NULL) 计算一次 _failed_rules，CONSTRAINT EXPECT 只按规则名引用，避免规则逻辑写两遍。随后通过 INSERT INTO quarantine BY NAME 将坏行分流。',
      ja: 'SELECT 内で _failed_rules を一度だけ計算し、EXPECT は配列内のルール名を参照するだけにすることでロジックの二重管理を回避。その後 INSERT INTO quarantine BY NAME で隔離します。',
      en: 'Computes _failed_rules once in SELECT; EXPECT constraints reference rule names so the event log counts every rule without duplicating logic. Failed rows flow into quarantine.',
    },
    idioms: [
      {
        zh: 'filter(array(CASE WHEN ... END), r -> r IS NOT NULL)：优雅构建动态违规规则数组',
        ja: 'filter(array(CASE WHEN ... END), r -> r IS NOT NULL)：違反ルール配列の生成',
        en: 'filter(array(CASE WHEN ... END), r -> r IS NOT NULL): clean SQL pattern for multi-rule tagging',
      },
      {
        zh: 'CREATE FLOW ... AS INSERT INTO quarantine BY NAME：多表统一写入隔离区',
        ja: 'CREATE FLOW ... AS INSERT INTO quarantine BY NAME：複数ソースを単一隔離テーブルへ集約',
        en: 'CREATE FLOW ... AS INSERT INTO quarantine BY NAME: fan-in multiple feeds to one quarantine table',
      },
    ],
    sql: `CREATE OR REFRESH STREAMING TABLE checked_order_items (
  CONSTRAINT malformed_record   EXPECT (NOT array_contains(_failed_rules, 'malformed_record')),
  CONSTRAINT missing_key        EXPECT (NOT array_contains(_failed_rules, 'missing_key')),
  CONSTRAINT price_not_positive EXPECT (NOT array_contains(_failed_rules, 'price_not_positive')),
  CONSTRAINT too_late           EXPECT (NOT array_contains(_failed_rules, 'too_late'))
) AS
SELECT *, filter(array(
         CASE WHEN _malformed THEN 'malformed_record' END,
         CASE WHEN order_id IS NULL OR order_item_id IS NULL THEN 'missing_key' END,
         CASE WHEN price IS NULL OR price <= 0 THEN 'price_not_positive' END,
         CASE WHEN _batch_date > DATE'\${olist.backfill_date}'
               AND datediff(_batch_date, to_date(order_purchase_ts)) > \${olist.late_tolerance_days} THEN 'too_late' END
       ), r -> r IS NOT NULL) AS _failed_rules
FROM (
  SELECT i.*, coalesce(p._product_known, false) AS _product_known
  FROM STREAM bronze_order_items i
  LEFT JOIN (SELECT product_id, true AS _product_known FROM silver_products) p USING (product_id)
);

CREATE FLOW quarantine_order_items AS INSERT INTO quarantine BY NAME
SELECT 'order_items' AS table_name, _batch_date AS batch_date, _failed_rules AS failed_rules,
       coalesce(_raw, to_json(struct(order_id, order_item_id, product_id, price))) AS record,
       _source_file AS source_file, current_timestamp() AS quarantined_at
FROM STREAM checked_order_items
WHERE size(_failed_rules) > 0;`,
  },
  {
    id: 'sdp-silver-cdc',
    category: 'silver',
    title: {
      zh: 'Silver 只前进 CDC 与自动去重 (AUTO CDC)',
      ja: 'Silver 前進のみ CDC と自動重複排除 (AUTO CDC)',
      en: 'Silver Forward-Only CDC & Deduplication (AUTO CDC)',
    },
    sourceFile: 'lakeflow/olist_sdp.sql',
    lineRange: 'L257-L280',
    description: {
      zh: '在 Lakeflow SQL 中，AUTO CDC INTO 配合 SEQUENCE BY change_seq 自动完成批内与跨批的乱序丢弃和状态推进，无需手写窗口函数和 MERGE。',
      ja: 'Lakeflow SQL では AUTO CDC INTO と SEQUENCE BY change_seq だけで、バッチ内外の重複排除と順序逆転ガードが自動実行されます。',
      en: 'AUTO CDC INTO with SEQUENCE BY change_seq handles deduplication and out-of-order suppression declaratively without manual windows or MERGE.',
    },
    idioms: [
      {
        zh: 'AUTO CDC INTO ... KEYS (order_id) SEQUENCE BY change_seq',
        ja: 'AUTO CDC INTO ... KEYS (order_id) SEQUENCE BY change_seq',
        en: 'AUTO CDC INTO ... KEYS (order_id) SEQUENCE BY change_seq',
      },
    ],
    sql: `CREATE OR REFRESH STREAMING TABLE silver_orders;

CREATE FLOW orders_cdc AS AUTO CDC INTO silver_orders
FROM (
  SELECT order_id, customer_id, order_status, order_purchase_ts, order_approved_ts,
         order_delivered_carrier_ts, order_delivered_customer_ts, order_estimated_delivery_ts,
         change_seq, change_ts
  FROM STREAM checked_orders_cdc
  WHERE size(_failed_rules) = 0
)
KEYS (order_id)
SEQUENCE BY change_seq;`,
  },
  {
    id: 'sdp-dq-gate',
    category: 'quality',
    title: {
      zh: '质量指标汇总与 5% 闸门熔断 (dq_metrics & dq_gate)',
      ja: '品質メトリクス集計と 5% ゲート遮断 (dq_metrics & dq_gate)',
      en: 'DQ Metrics Aggregation & 5% Circuit Breaker (dq_metrics & dq_gate)',
    },
    sourceFile: 'lakeflow/olist_sdp.sql',
    lineRange: 'L318-L370',
    description: {
      zh: 'dq_metrics 物化视图用 LATERAL VIEW explode(_failed_rules) 统计每条规则命中数；dq_gate 只检查最新批次的坏行率，配合 ON VIOLATION FAIL UPDATE 在超标时立即终止管道刷新。',
      ja: 'dq_metrics でルール別件数を集計し、dq_gate が最新バッチのみを対象に ON VIOLATION FAIL UPDATE で 5% 超を検知・停止します。',
      en: 'dq_metrics explodes _failed_rules into per-rule counts; dq_gate checks the latest batch only and halts the update via ON VIOLATION FAIL UPDATE if bad_ratio > 5%.',
    },
    idioms: [
      {
        zh: 'count_if(...) + try_divide(...) + GROUP BY ALL：Databricks SQL 简洁聚合语法',
        ja: 'count_if(...) + try_divide(...) + GROUP BY ALL：Databricks SQL の簡潔な集計構文',
        en: 'count_if(...) + try_divide(...) + GROUP BY ALL: concise Databricks SQL aggregations',
      },
      {
        zh: 'ON VIOLATION FAIL UPDATE：让 Lakeflow 任务失败从而阻止下游 Gold 刷新',
        ja: 'ON VIOLATION FAIL UPDATE：更新を失敗させて後続 Gold の実行を阻止',
        en: 'ON VIOLATION FAIL UPDATE: fails the first refresh so the second Gold refresh never runs',
      },
    ],
    sql: `CREATE OR REFRESH MATERIALIZED VIEW dq_gate (
  CONSTRAINT bad_ratio_within_threshold
    EXPECT (bad_ratio <= \${olist.dq_max_bad_ratio}) ON VIOLATION FAIL UPDATE
) AS
SELECT table_name, batch_date, failed_rows AS bad_rows, total_rows,
       try_divide(failed_rows, total_rows) AS bad_ratio
FROM dq_metrics
WHERE rule = '__all__'
  AND batch_date = (SELECT max(batch_date) FROM dq_metrics);`,
  },
  {
    id: 'sdp-gold-scd2-fact',
    category: 'gold',
    title: {
      zh: 'Gold 物化视图：SCD2 1900-01-01 锚定与时点关联',
      ja: 'Gold マテリアライズドビュー：SCD2 1900-01-01 アンカーと期間結合',
      en: 'Gold Materialized Views: SCD2 1900-01-01 Anchor & Point-in-Time Join',
    },
    sourceFile: 'lakeflow/olist_sdp.sql',
    lineRange: 'L418-L462',
    description: {
      zh: 'dim_seller 将每位卖家最早版本的 __START_AT 锚定为 1900-01-01，确保更早的历史订单都能关联上；fact_order_item 通过区间条件 f.order_date >= s.valid_from AND (s.valid_to IS NULL OR f.order_date < s.valid_to) 完成时点关联。',
      ja: 'dim_seller で各セラーの初回有効日を 1900-01-01 に補正し、fact_order_item が注文日による区間結合を行います。',
      en: 'dim_seller anchors each seller’s earliest __START_AT to 1900-01-01 so historical orders always match; fact_order_item performs the range join on order_date.',
    },
    idioms: [
      {
        zh: 'xxhash64(seller_id, valid_from) AS seller_sk：生成确定性代理键',
        ja: 'xxhash64(seller_id, valid_from) AS seller_sk：決定論的なサロゲートキー生成',
        en: 'xxhash64(seller_id, valid_from) AS seller_sk: deterministic surrogate key',
      },
    ],
    sql: `CREATE OR REFRESH MATERIALIZED VIEW dim_seller AS
WITH h AS (
  SELECT seller_id, seller_zip_code_prefix, seller_city, seller_state,
         CASE WHEN __START_AT = min(__START_AT) OVER (PARTITION BY seller_id) THEN DATE'1900-01-01'
              ELSE to_date(CAST(__START_AT AS STRING), 'yyyyMMdd') END AS valid_from,
         to_date(CAST(__END_AT AS STRING), 'yyyyMMdd') AS valid_to
  FROM silver_seller_history
)
SELECT xxhash64(seller_id, valid_from) AS seller_sk,
       seller_id, seller_zip_code_prefix, seller_city, seller_state, valid_from, valid_to,
       valid_to IS NULL AS is_current
FROM h;

CREATE OR REFRESH MATERIALIZED VIEW fact_order_item AS
...
FROM f
LEFT JOIN dim_seller s
  ON s.seller_id = f.seller_id
 AND f.order_date >= s.valid_from
 AND (s.valid_to IS NULL OR f.order_date < s.valid_to);`,
  },
  {
    id: 'dash-dq-queries',
    category: 'dashboard',
    title: {
      zh: 'AI/BI 看板：数据质量监控 SQL (DQ-1 ~ DQ-4)',
      ja: 'AI/BI ダッシュボード：データ品質監視 SQL (DQ-1 ~ DQ-4)',
      en: 'AI/BI Dashboard: Data Quality Queries (DQ-1 ~ DQ-4)',
    },
    sourceFile: 'docs/dashboard_queries.sql',
    lineRange: 'L4-L29',
    description: {
      zh: '直接查询 workspace.olist_ops 下的 dq_metrics、dq_gate_log 和 quarantine，驱动 Databricks AI/BI 质量看板。',
      ja: 'workspace.olist_ops の dq_metrics・dq_gate_log・quarantine をクエリし、Databricks AI/BI 品質ダッシュボードを描画します。',
      en: 'Queries workspace.olist_ops.{dq_metrics, dq_gate_log, quarantine} to power the Databricks AI/BI Data Quality dashboard.',
    },
    idioms: [
      {
        zh: "WHERE rule = '__all__'：汇总行直接计算批次总坏行率",
        ja: "WHERE rule = '__all__'：サマリー行でバッチ全体の不正率を算出",
        en: "WHERE rule = '__all__': summary row for batch-level bad ratio",
      },
      {
        zh: 'GROUP BY ALL：无需重复写出所有非聚合列名',
        ja: 'GROUP BY ALL：非集計列の列挙を省略する Databricks SQL 構文',
        en: 'GROUP BY ALL: automatically groups by all non-aggregated select columns',
      },
    ],
    sql: `-- [DQ-1] 每批次与每张表的坏行率趋势（对比 5% 阈值）
SELECT batch_date, table_name,
       SUM(failed_rows) / SUM(total_rows) AS bad_ratio
FROM workspace.olist_ops.dq_metrics
WHERE rule = '__all__'
GROUP BY ALL
ORDER BY batch_date;

-- [DQ-2] 各质量规则命中行数（堆叠柱状图）
SELECT batch_date, table_name, rule, severity, SUM(failed_rows) AS rows
FROM workspace.olist_ops.dq_metrics
WHERE rule <> '__all__' AND failed_rows > 0
GROUP BY ALL
ORDER BY batch_date;

-- [DQ-3] 闸门判定历史
SELECT evaluated_at, run_id, table_name, bad_rows, total_rows,
       ROUND(bad_ratio * 100, 2) AS bad_pct, passed
FROM workspace.olist_ops.dq_gate_log
ORDER BY evaluated_at DESC;`,
  },
  {
    id: 'dash-biz-queries',
    category: 'dashboard',
    title: {
      zh: 'AI/BI 看板：业务指标与 SCD2 归属 SQL (BIZ-1 ~ BIZ-3)',
      ja: 'AI/BI ダッシュボード：ビジネス指標・SCD2 SQL (BIZ-1 ~ BIZ-3)',
      en: 'AI/BI Dashboard: Business & SCD2 Analytics SQL (BIZ-1 ~ BIZ-3)',
    },
    sourceFile: 'docs/dashboard_queries.sql',
    lineRange: 'L31-L59',
    description: {
      zh: '基于 Gold 星型模型与 Mart 表计算月度 GMV、准时交付率以及按订单时点卖家所在州的区域绩效。',
      ja: 'Gold スタースキーマとマートから月次 GMV、定時配達率、注文時点の州別パフォーマンスを集計します。',
      en: 'Computes monthly GMV, on-time delivery rate, and point-in-time seller state performance from Gold star schema & mart tables.',
    },
    idioms: [
      {
        zh: 'JOIN dim_seller s ON s.seller_sk = f.seller_sk：直接利用代理键实现时点关联',
        ja: 'JOIN dim_seller s ON s.seller_sk = f.seller_sk：サロゲートキーで注文時点の州を取得',
        en: 'JOIN dim_seller s ON s.seller_sk = f.seller_sk: leverages pre-resolved SCD2 surrogate key',
      },
      {
        zh: 'NULLIF(SUM(delivered_orders), 0)：防止除零错误',
        ja: 'NULLIF(SUM(delivered_orders), 0)：ゼロ除算ガード',
        en: 'NULLIF(SUM(delivered_orders), 0): division-by-zero guard',
      },
    ],
    sql: `-- [BIZ-1] 月度 GMV 与准时交付率
SELECT d.year_month,
       SUM(CASE WHEN NOT f.is_cancelled THEN f.price END) AS gmv,
       AVG(CASE WHEN f.is_delivered THEN CAST(f.is_on_time AS INT) END) AS on_time_rate
FROM workspace.olist_gold.fact_order_item f
JOIN workspace.olist_gold.dim_date d ON d.date_key = f.order_date_key
GROUP BY ALL
ORDER BY d.year_month;

-- [BIZ-2] 按下单时点卖家所在州 (SCD2) 统计绩效
SELECT s.seller_state,
       COUNT(DISTINCT f.order_id) AS orders,
       SUM(f.price) AS gmv,
       AVG(CASE WHEN f.is_delivered THEN CAST(f.is_on_time AS INT) END) AS on_time_rate
FROM workspace.olist_gold.fact_order_item f
JOIN workspace.olist_gold.dim_seller s ON s.seller_sk = f.seller_sk
WHERE NOT f.is_cancelled
GROUP BY ALL
ORDER BY gmv DESC;

-- [BIZ-3] Top 20 卖家（GMV、准时率、评分）
SELECT seller_id, seller_state,
       SUM(gmv) AS gmv, SUM(orders) AS orders,
       SUM(on_time_orders) / NULLIF(SUM(delivered_orders), 0) AS on_time_rate,
       AVG(avg_review_score) AS avg_review_score
FROM workspace.olist_gold.mart_seller_delivery_performance
GROUP BY ALL
ORDER BY gmv DESC
LIMIT 20;`,
  },
];
