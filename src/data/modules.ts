import { LearningModule } from '../types';

export const MODULES: LearningModule[] = [
  {
    id: '00-overview',
    number: '00',
    phase: 'ingestion',
    title: {
      zh: '总览：Medallion Lakehouse 架构全景',
      ja: '全体像：Medallion Lakehouse パイプライン構成',
      en: 'Overview: How the Lakehouse Pipeline Fits Together',
    },
    subtitle: {
      zh: '理解 7 个作业任务、6 个数据源与双实现架构',
      ja: '7つのジョブタスク、6つのフィード、二重実装の全体像',
      en: 'Understanding the 7 job tasks, 6 feeds, and dual implementations',
    },
    notebookPath: 'notebooks/walkthrough/00_overview.py',
    sourceFiles: ['src/olist_pipeline/cli.py', 'resources/olist_jobs.yml'],
    adrs: ['ADR-0013'],
    badges: ['core'],
    pipelineStage: 'landing',
    overview: {
      zh: 'Olist 数据集（约 10 万巴西电商订单）原本是一份静态 Kaggle 导出文件。为了模拟真实生产环境，replay.py 将其拆分为“每日投递的文件”，并故意注入重复、乱序、非法值、schema 变更等异常。每日作业依次执行：replay_batch → bronze → silver → dim_seller_scd2 → dq_gate → gold → mart，同时并行运行 Lakeflow 声明式管道并在最后逐行对账 16 张表。',
      ja: 'Olist データセット（約10万件のブラジルEC注文）は本来静的な Kaggle ダンプです。本番環境を再現するため、replay.py が日次ファイル配信へ変換し、重複・順序逆転・不正値・スキーマ変更などの異常を注入します。日次ジョブは replay_batch → bronze → silver → dim_seller_scd2 → dq_gate → gold → mart を実行し、並行して Lakeflow 宣言型パイプラインを動かして最後に16テーブルを突き合わせます。',
      en: 'The Olist dataset (~100k Brazilian e-commerce orders) is a static Kaggle dump. To simulate production reality, replay.py turns it into daily file drops with injected duplicates, out-of-order CDC, invalid values, and schema drift. The daily job runs 7 tasks: replay_batch → bronze → silver → dim_seller_scd2 → dq_gate → gold → mart, alongside a Lakeflow declarative pipeline reconciled across 16 tables.',
    },
    whyItMatters: {
      zh: '大多数教程只用干净的 CSV 跑一遍全量覆盖（overwrite），这在生产中一碰即碎。真正的工程挑战在于：如何幂等地增量摄取、如何在不破坏下游的前提下隔离脏数据、以及如何保留历史状态。',
      ja: '多くのチュートリアルは綺麗な CSV を全件上書き（overwrite）するだけですが、本番では通用しません。真の課題は、冪等な増分取り込み、下流を壊さない不正データの隔離、そして履歴の保持にあります。',
      en: 'Most tutorials run a full overwrite on clean CSVs—which breaks on day one in production. Real data engineering is about idempotent incremental ingestion, isolating bad rows without breaking downstream tables, and preserving history.',
    },
    keyTakeaways: [
      {
        zh: '每个 Walkthrough Notebook 都直接导入 src/olist_pipeline/ 的真实生产函数，拒绝“演示专用假代码”。',
        ja: 'すべてのウォークスルーは src/olist_pipeline/ の本番関数を直接インポートしており、デモ用の偽ロジックは一切ありません。',
        en: 'Every walkthrough notebook imports the exact production functions from src/olist_pipeline/, not toy copies.',
      },
      {
        zh: '6 个数据源分为 3 类：append（订单明细、评论）、cdc（订单状态变更）、snapshot（卖家、商品、客户）。',
        ja: '6つのフィードは append（明細・レビュー）、cdc（注文状態変更）、snapshot（セラー・商品・顧客）の3種類に分類されます。',
        en: '6 feeds fall into 3 ingestion patterns: append (order_items, reviews), cdc (orders_cdc), and snapshot (sellers, products, customers).',
      },
      {
        zh: '本地无需 Databricks 账号即可通过 uv run pytest（71 个测试）或 python 脚本运行所有核心逻辑。',
        ja: 'Databricks アカウントがなくても、ローカルで uv run pytest（71テスト）や Python スクリプトとして実行できます。',
        en: 'Everything in the imperative pipeline runs locally without a Databricks account via uv run pytest (71 tests).',
      },
    ],
    codeBlock: {
      title: {
        zh: '每日作业 DAG 结构 (resources/olist_jobs.yml)',
        ja: '日次ジョブ DAG 構造 (resources/olist_jobs.yml)',
        en: 'Daily Job DAG Structure (resources/olist_jobs.yml)',
      },
      filePath: 'resources/olist_jobs.yml',
      language: 'bash',
      code: `replay_batch ─┬─▶ bronze ─▶ silver ─▶ dim_seller_scd2 ─▶ dq_gate ─▶ gold ─▶ mart ─┬─▶ reconcile
              └─▶ sdp_silver_and_gate ─▶ sdp_gold (Lakeflow, 2 refreshes) ───────┘`,
      highlights: [
        {
          zh: '命令式（下方）与声明式（上方）并行处理同一批 landing 文件',
          ja: '命令型（下）と宣言型（上）が同じ landing ファイルを並行処理',
          en: 'Imperative (bottom) and Declarative (top) run in parallel on the exact same landing files',
        },
        {
          zh: 'reconcile 任务在两者都完成后逐行比较 16 张表，差异必须为 0',
          ja: 'reconcile タスクが両者完了後に16テーブルを行単位で比較し、差分0を検証',
          en: 'reconcile compares 16 tables row-by-row after both finish, failing the job on any diff',
        },
      ],
    },
    tryItYourself: {
      command: 'uv run python notebooks/walkthrough/00_overview.py',
      prompt: {
        zh: '查看项目目录 src/olist_pipeline/ 与 lakeflow/，对照代码地图理解每个文件对应的架构层级。',
        ja: 'src/olist_pipeline/ と lakeflow/ のディレクトリを確認し、各ファイルがどの層に対応するか把握しましょう。',
        en: 'Inspect src/olist_pipeline/ and lakeflow/ and map each module to its Medallion layer.',
      },
    },
    interviewPitch: {
      zh: '“我构建了一个基于 Olist 电商数据的端到端 Databricks Lakehouse 管道。为了模拟真实生产环境，我把静态数据拆分成每日投递流并注入了重复、乱序 CDC、迟到和 schema 漂移。整套架构采用 Medallion 分层，实现了命令式（PySpark + MERGE）和声明式（Lakeflow SDP）两套完整版本，每天通过 16 张表逐行对账确保零差异。”',
      ja: '「Olist ECデータを使ったエンドツーエンドの Databricks Lakehouse パイプラインを構築しました。静的データを日次フィードに変換し、重複・順序逆転・遅延・スキーマ変更を注入しています。Medallion アーキテクチャに基づき、命令型（PySpark + MERGE）と宣言型（Lakeflow SDP）の2通りを実装し、毎日16テーブルを行単位で突き合わせて完全一致を保証しています。」',
      en: '"I built an end-to-end Databricks Lakehouse pipeline on the Olist e-commerce dataset. To mirror production, I replay static CSVs into daily drops with injected duplicates, out-of-order CDC, late data, and schema drift. I implemented the full spec twice—imperative PySpark+MERGE and declarative Lakeflow SDP—reconciling 16 tables row-by-row daily."',
    },
    quiz: [
      {
        question: {
          zh: '为什么本项目要把同一套规格实现两遍（命令式 + Lakeflow 声明式）？',
          ja: 'なぜこのプロジェクトは同一仕様を命令型と Lakeflow 宣言型の2通りで実装しているのですか？',
          en: 'Why does this project implement the full pipeline specification twice (Imperative & Lakeflow)?',
        },
        options: [
          {
            zh: '为了比较代码量并利用每日 16 张表对账来验证无法在本地运行的声明式管道',
            ja: 'コード量を比較し、ローカルで動かせない宣言型パイプラインを日次16テーブル突き合わせでテストするため',
            en: 'To compare trade-offs and test the cloud-only Lakeflow pipeline via daily 16-table reconciliation against the locally tested imperative reference',
          },
          {
            zh: '因为 Databricks 不允许在同一个 Job 中只运行 PySpark',
            ja: 'Databricks が1つのジョブで PySpark だけを実行することを許可していないため',
            en: 'Because Databricks jobs require at least one Lakeflow task',
          },
          {
            zh: '为了把数据复制两份以防止硬盘损坏',
            ja: 'ディスク障害に備えてデータを二重保存するため',
            en: 'To store duplicate backups in case Delta Lake corrupts files',
          },
        ],
        correctIndex: 0,
        explanation: {
          zh: 'Lakeflow SDP 无法在本地笔记本电脑上运行，因此经过 71 个本地 pytest 测试的命令式版本作为“标准答案”，每天通过 reconcile 任务验证 Lakeflow 产出完全一致（ADR-0013）。',
          ja: 'Lakeflow SDP はローカルPCで実行できないため、71の pytest で検証済みの命令型を「正解」とし、毎日の reconcile で一致を保証しています（ADR-0013）。',
          en: 'Lakeflow SDP cannot run locally on a laptop, so the locally-tested imperative pipeline acts as the reference oracle via daily reconciliation (ADR-0013).',
        },
      },
    ],
  },
  {
    id: '01-replay',
    number: '01',
    phase: 'ingestion',
    title: {
      zh: 'Replay：将静态数据转为每日异常数据流',
      ja: 'Replay：静的データを異常入り日次フィードへ変換',
      en: 'Replay: Turning a Static Dataset into a Daily Dirty Feed',
    },
    subtitle: {
      zh: '构建 CDC 变更镜像与 Ground Truth 异常注入机制',
      ja: 'CDC 変更後イメージの生成と正解ラベル付き異常注入',
      en: 'Generating CDC after-images and ground-truth anomaly manifests',
    },
    notebookPath: 'notebooks/walkthrough/01_replay.py',
    sourceFiles: ['src/olist_pipeline/replay.py', 'src/olist_pipeline/config.py'],
    adrs: ['ADR-0002', 'ADR-0004'],
    pipelineStage: 'landing',
    overview: {
      zh: 'Olist 原始订单表是“每个订单一行”，包含下单、审批、交给承运商、送达等多个时间戳。replay.py 中的 build_orders_cdc 将其拆解（explode）为“每次状态变更一行”的 CDC 流，按时间戳排序并分配单调递增的 change_seq。同时，prepare 阶段会故意注入负价格、同批重复、跨天重复、乱序 CDC 和新字段 discount_amount，并在 ops.replay_manifest 中记录标准答案（_anomaly）。',
      ja: 'Olist の元データは「1注文1行」で複数段階のタイムスタンプを持ちます。replay.py の build_orders_cdc はこれを「ステータス変更ごとに1行」の CDC ストリームに展開し、change_seq を付与します。さらに prepare 段階で負の価格・重複・順序逆転・新カラム discount_amount などを意図的に注入し、ops.replay_manifest に正解を記録します。',
      en: 'Raw Olist orders have one row per order with multiple stage timestamps. build_orders_cdc explodes them into one row per status change with a monotonic change_seq. Meanwhile, prepare injects negative prices, duplicates, out-of-order CDC, and a new field (discount_amount), recording ground-truth tags in ops.replay_manifest.',
    },
    whyItMatters: {
      zh: '管道自身绝不读取 _anomaly 标签；测试会在管道跑完后，核对管道自己的监控指标 ops.dq_metrics 是否 100% 抓住了注入的每一类异常。在真实数据中，这还暴露了“发货时间早于下单时间”等 166 条真实脏数据！',
      ja: 'パイプライン本体は _anomaly タグを一切読みません。テストがパイプラインのメトリクス ops.dq_metrics と正解を突き合わせます。実データでは「購入前に配送業者へ引き渡し」のような実在の異常データも166件発見されました。',
      en: 'The pipeline never reads the _anomaly tags; end-to-end tests verify that ops.dq_metrics catches 100% of injected anomalies. Running on real Olist data even uncovered 166 real orders shipped months before purchase!',
    },
    keyTakeaways: [
      {
        zh: '回填日期（backfill_date）之前的所有历史数据打包为一次全量回填，之后的每天按 batch_date=YYYY-MM-DD 分区投递。',
        ja: 'backfill_date より前のデータは初回バックフィルとして一括投入され、それ以降は batch_date=YYYY-MM-DD ごとに配信されます。',
        en: 'Data before backfill_date lands in one backfill batch; subsequent days land one partition per batch_date=YYYY-MM-DD.',
      },
      {
        zh: '真实脏数据往往比合成数据更离奇：例如品类翻译 CSV 带有 UTF-8 BOM 头，部分订单发货时间早于下单时间。',
        ja: '実データはテストデータより過酷です。カテゴリ翻訳CSVの UTF-8 BOM や、購入日時より前の発送日時などが見つかりました。',
        en: 'Real data exposes edge cases synthetic fixtures miss, such as UTF-8 BOM headers and carrier timestamps predating purchase.',
      },
    ],
    codeBlock: {
      title: {
        zh: '将订单时间戳展开为 CDC 变更流 (01_replay.py)',
        ja: '注文タイムスタンプを CDC ストリームへ展開 (01_replay.py)',
        en: 'Exploding Order Timestamps into CDC Stream (01_replay.py)',
      },
      filePath: 'notebooks/walkthrough/01_replay.py',
      language: 'python',
      code: `# 真实 Olist 脏数据示例：下单 2018-07-16，交给承运商却在 2018-01-26！
raw_orders = spark.createDataFrame([
    ("o3", "c3", "delivered", "2018-07-16 18:40:53", "2018-07-16 18:50:22",
     "2018-01-26 13:35:00", "2018-07-23 20:04:45", "2018-08-07 00:00:00")
], schema)
cdc = replay.build_orders_cdc(raw_orders, cfg)
# 按时间排序后，"shipped" 成为 change_seq=1（发生在下单前），将被 Silver 的 change_before_purchase 规则拦截`,
      highlights: [
        {
          zh: '每条 CDC 记录只暴露截止该变更时刻已知的时间戳（after-image）',
          ja: '各 CDC レコードはその時点で既知のタイムスタンプのみを保持（変更後イメージ）',
          en: 'Each CDC row only exposes timestamps known at that moment (after-image)',
        },
      ],
    },
    tryItYourself: {
      command: 'uv run python notebooks/walkthrough/01_replay.py',
      prompt: {
        zh: '运行 01_replay.py，观察 o1、o2、o3 三条订单如何被展开为多条带 change_seq 的 CDC 记录。',
        ja: '01_replay.py を実行し、o1, o2, o3 がどのように change_seq 付きの CDC 行へ展開されるか確認しましょう。',
        en: 'Run 01_replay.py and observe how orders o1, o2, and o3 expand into sequenced CDC events.',
      },
    },
    interviewPitch: {
      zh: '“为了避免用干净数据自欺欺人，我写了一个确定性的回放与异常注入器。它把静态数据集变成按天投递的分区，注入重复、乱序 CDC、迟到和 schema 变更，并生成独立的 manifest 作为标准答案来端到端验证管道的质量可观测性。”',
      ja: '「綺麗なデータだけでテストするのを避けるため、決定論的なリプレイと異常注入器を作りました。日次パーティション配信を再現し、重複や順序逆転などを注入した上で、独立したマニフェストを正解としてパイプラインの品質検知をE2Eで検証しています。」',
      en: '"To avoid testing only on clean data, I built a deterministic replay harness that emits daily drops with injected duplicates, out-of-order CDC, lateness, and schema drift, asserting that pipeline metrics match the ground-truth manifest 100%."',
    },
    quiz: [
      {
        question: {
          zh: '为什么在 replay_manifest 中记录 _anomaly 标签，而管道代码绝对不能读取它？',
          ja: 'replay_manifest に _anomaly タグを記録しつつ、パイプライン本体がそれを読んではいけない理由は？',
          en: 'Why does replay_manifest store _anomaly tags while the pipeline code never reads them?',
        },
        options: [
          {
            zh: '为了作为独立“标准答案”来验证管道自身的质量检测逻辑是否漏报或误报',
            ja: 'パイプライン自身の品質検知ロジックに漏れや誤検知がないかを検証する独立した「正解データ」とするため',
            en: 'To act as an independent ground-truth oracle for E2E tests verifying zero missed or false-positive anomalies',
          },
          {
            zh: '因为 Spark 无法读取下划线开头的列',
            ja: 'Spark がアンダースコア始まりの列を読めないため',
            en: 'Because Spark cannot read columns starting with underscores',
          },
        ],
        correctIndex: 0,
        explanation: {
          zh: '如果管道读取了注入标签就成了作弊。测试通过比对“注入了多少”和“ops.dq_metrics 报告了多少”来证明质量规则有效。',
          ja: 'パイプラインが正解タグを読んではテストになりません。注入数と ops.dq_metrics の報告数の一致をアサートすることで品質ルールを証明します。',
          en: 'Reading the tag would defeat the test. E2E tests assert that injected counts equal reported ops.dq_metrics counts.',
        },
      },
    ],
  },
  {
    id: '02-bronze',
    number: '02',
    phase: 'ingestion',
    title: {
      zh: 'Bronze：数据契约与 _rescued_data',
      ja: 'Bronze：データ契約と _rescued_data',
      en: 'Bronze: Data Contracts and _rescued_data',
    },
    subtitle: {
      zh: '为什么拒绝 Schema 自动推断，以及如何优雅应对 Schema 漂移',
      ja: 'スキーマ推論を避け、スキーマ変更を安全に吸収する設計',
      en: 'Why explicit contracts beat schema inference and how to handle drift',
    },
    notebookPath: 'notebooks/walkthrough/02_bronze_contracts.py',
    sourceFiles: ['src/olist_pipeline/contracts.py', 'src/olist_pipeline/bronze.py'],
    adrs: ['ADR-0001', 'ADR-0006'],
    badges: ['core'],
    pipelineStage: 'bronze',
    overview: {
      zh: 'Bronze 层承担两个核心职责：1）通过 Auto Loader（带 checkpoint 与 availableNow=True）确保每个文件只摄取一次；2）将 JSON 文件作为纯文本读取，严格按 contracts.py 中的显式 Schema 进行 from_json 解析。契约之外的新字段（如 discount_amount）不会改变表结构，而是被捕获到 _rescued_data 列；非 JSON 坏行标记为 _malformed = true；原始行始终保留在 _raw 列以便未来回填。',
      ja: 'Bronze 層の役割は2つです。1）Auto Loader（チェックポイント + availableNow=True）で各ファイルを一度だけ取り込むこと。2）JSON をテキストとして読み、contracts.py の明示的なスキーマでパースすること。未知のフィールドはテーブル構造を変えずに _rescued_data に退避し、不正な JSON は _malformed = true にし、元の行は _raw に保持します。',
      en: 'Bronze has two jobs: 1) ingest every file exactly once via Auto Loader (checkpoint + availableNow=True); 2) read JSON as text and parse against explicit contracts in contracts.py. Unknown fields go to _rescued_data without mutating table schema, invalid JSON sets _malformed = true, and _raw preserves the original line for future backfills.',
    },
    whyItMatters: {
      zh: '如果开启 Spark 自动推断 Schema，上游系统一旦多传一个字段或把数字写成字符串，你的表结构就会被擅自篡改甚至导致下游任务崩溃。显式契约 + _rescued_data + _raw 实现了“表结构稳定”与“数据零丢失”的兼得。',
      ja: 'スキーマ推論に任せると、送信元が列を増やしたり型を変えたりした瞬間に下流が壊れます。明示的契約 + _rescued_data + _raw により、スキーマ安定性とデータ非損失を両立できます。',
      en: 'Schema inference lets upstream producers mutate your tables silently and break downstream jobs. Explicit contracts + _rescued_data + _raw guarantee schema stability with zero data loss.',
    },
    keyTakeaways: [
      {
        zh: '按文本读取 JSON 再解析，使所有 4 种情况（正常、未知字段、类型错误、非 JSON）都能被精确捕获而不崩溃。',
        ja: 'JSON をテキストとして読んでからパースすることで、正常・未知列・型エラー・非JSON の4パターンすべてをクラッシュせずに処理できます。',
        en: 'Reading JSON as text before parsing handles normal rows, extra fields, type mismatches, and malformed lines without failing the stream.',
      },
      {
        zh: '保留 _raw 原始字符串列，意味着未来升级契约版本时可以直接从 Bronze 表重算回填，无需重新扫描海量历史文件。',
        ja: '_raw 列を残すことで、将来契約を改訂した際にファイルを読み直さず Bronze からバックフィルできます。',
        en: 'Keeping _raw lets you backfill from Bronze when contracts evolve without re-reading landing files.',
      },
    ],
    codeBlock: {
      title: {
        zh: '显式契约解析四类输入行 (02_bronze_contracts.py)',
        ja: '明示的契約による4パターンのパース (02_bronze_contracts.py)',
        en: 'Contract Parsing Across 4 Input Cases (02_bronze_contracts.py)',
      },
      filePath: 'notebooks/walkthrough/02_bronze_contracts.py',
      language: 'python',
      code: `# 1. 正常行 -> 正常解析为强类型列
# 2. 含未知字段 (discount_amount) -> 保留在 _rescued_data，表 Schema 不变
# 3. 类型错误 (price: "abc") -> price 解析为 NULL，交由 Silver 规则隔离
# 4. 非 JSON 字符串 -> _malformed = True，交由 Silver 隔离
parsed = bronze.parse_json_lines(lines_df, ORDER_ITEMS)`,
      highlights: [
        {
          zh: 'Lakeflow 版本使用 from_json(value, "MAP<STRING, STRING>") + map_filter 实现完全一致的 _rescued_data 语义',
          ja: 'Lakeflow 版も MAP<STRING, STRING> + map_filter を使って全く同じ _rescued_data を生成します',
          en: 'Lakeflow uses MAP<STRING, STRING> + map_filter to produce identical _rescued_data semantics',
        },
      ],
    },
    tryItYourself: {
      command: 'uv run python notebooks/walkthrough/02_bronze_contracts.py',
      prompt: {
        zh: '尝试在测试行中加入一个新字段或非法价格，观察 _rescued_data 和 _malformed 列的变化。',
        ja: 'テスト行に新しいフィールドや不正な価格を追加して、_rescued_data と _malformed の変化を確認しましょう。',
        en: 'Add a custom extra field or bad type to the sample lines and inspect _rescued_data and _malformed.',
      },
    },
    interviewPitch: {
      zh: '“在 Bronze 层我坚持显式数据契约而不是 Schema 推断。我们将 JSON 按文本摄取并对照契约解析：未知字段自动落入 _rescued_data 避免破坏下游，非法类型变成 NULL 交由 Silver 隔离，同时保留 _raw 原始行支持随时回溯重算。”',
      ja: '「Bronze 層ではスキーマ推論ではなく明示的なデータ契約を採用しました。JSON をテキストとして取り込み契約に沿ってパースすることで、未知フィールドは _rescued_data に退避して下流を守り、_raw により将来の再処理も可能にしています。」',
      en: '"In Bronze, I enforce explicit data contracts rather than schema inference. Unknown fields land in _rescued_data without breaking downstream schemas, malformed lines are flagged, and _raw is retained for contract backfills."',
    },
    quiz: [
      {
        question: {
          zh: '当上游突然在订单明细 JSON 中新增了一个契约外字段 discount_amount 时，Bronze 层会如何处理？',
          ja: '送信元が契約にない新フィールド discount_amount を追加した場合、Bronze 層はどう処理しますか？',
          en: 'When upstream adds an unexpected discount_amount field to order_items JSON, how does Bronze handle it?',
        },
        options: [
          {
            zh: '将该字段保存到 _rescued_data JSON 字符串中，保持 Bronze 表结构不变',
            ja: 'テーブルのスキーマを変更せず、そのフィールドを _rescued_data に退避する',
            en: 'Captures it in _rescued_data while keeping the Bronze table schema unchanged',
          },
          {
            zh: '自动为 Bronze 表添加一列 discount_amount',
            ja: '自動的に Bronze テーブルに discount_amount 列を追加する',
            en: 'Automatically alters the Bronze table to add a discount_amount column',
          },
          {
            zh: '整行丢弃并报错停止管道',
            ja: '行を破棄してパイプラインをエラー停止させる',
            en: 'Drops the row and crashes the stream',
          },
        ],
        correctIndex: 0,
        explanation: {
          zh: '契约保护下游不被突发字段破坏，而 _rescued_data 确保新字段信息不会丢失，方便后续评估是否正式纳入契约。',
          ja: '契約により下流の破壊を防ぎつつ、_rescued_data によってデータ欠損も防ぎます。',
          en: 'Contracts protect downstream consumers while _rescued_data ensures zero data loss.',
        },
      },
    ],
  },
  {
    id: '03-silver-cdc',
    number: '03',
    phase: 'silver',
    title: {
      zh: 'Silver：批内/跨批去重与只前进的 CDC',
      ja: 'Silver：重複排除と前進のみの CDC (Forward-Only)',
      en: 'Silver: Deduplication and Forward-Only CDC',
    },
    subtitle: {
      zh: '防止营收重复计算与乱序状态回退的核心模式',
      ja: '売上の二重計上と順序逆転によるステータス後退を防ぐ',
      en: 'Preventing double-counted revenue and out-of-order status regression',
    },
    notebookPath: 'notebooks/walkthrough/03_silver_dedup_cdc.py',
    sourceFiles: ['src/olist_pipeline/silver.py'],
    adrs: ['ADR-0001', 'ADR-0002'],
    badges: ['interviewHot', 'core'],
    pipelineStage: 'silver',
    overview: {
      zh: '订单数据进入 Silver 时面临两大经典难题：1）订单明细重复（同文件内重复或次日重传），若不拦截会导致 GMV 翻倍；2）订单状态 CDC 乱序到达（delivered 比 shipped 先到）。silver.py 分两步解决：批内用 row_number() 窗口函数去重，跨批用只有 WHEN NOT MATCHED THEN INSERT 的幂等 MERGE；对 CDC 则根据上游单调序号 change_seq 执行“只前进 MERGE”（仅当 source.change_seq > target.change_seq 时更新）。',
      ja: '注文データには2つの典型的な問題があります。1）明細の重複再送（売上二重計上の原因）。2）CDC の順序逆転（delivered が shipped より先に届く）。silver.py ではバッチ内を row_number() で重複排除し、バッチ間は WHEN NOT MATCHED THEN INSERT のみの MERGE で冪等に取り込みます。CDC には source.change_seq > target.change_seq のときだけ更新する前進限定 MERGE を使います。',
      en: 'Order feeds face two classic hazards: 1) duplicate order_items (within a batch or re-delivered next day) that double-count revenue; 2) out-of-order CDC where "delivered" arrives before "shipped". silver.py solves this with window row_number() intra-batch, insert-only MERGE cross-batch, and forward-only MERGE (update only when source.change_seq > target.change_seq).',
    },
    whyItMatters: {
      zh: '这是数据工程面试中最高频的问题之一！如果只用 dropDuplicates()，只能解决单个微批内的重复，无法防住昨天的重传数据；如果 CDC 直接覆盖更新，乱序消息会让“已送达”订单退回“已发货”。',
      ja: 'これはデータエンジニア面接で最もよく聞かれるテーマです！dropDuplicates() だけでは昨日の再送を防げず、単純な上書き MERGE では配送済み注文が発送済みに巻き戻ってしまいます。',
      en: 'This is the #1 most asked interview topic. dropDuplicates() only sees one batch and fails on yesterday’s re-delivery; naive overwrite MERGE regresses delivered orders back to shipped.',
    },
    keyTakeaways: [
      {
        zh: '批内去重（keep_first）：按业务键 (order_id, order_item_id) 分区，row_number() = 1。',
        ja: 'バッチ内重複排除（keep_first）：業務キー (order_id, order_item_id) ごとに row_number() = 1 を残す。',
        en: 'Intra-batch dedup (keep_first): row_number() = 1 partitioned by (order_id, order_item_id).',
      },
      {
        zh: '跨批幂等（merge_insert_new）：MERGE 仅写 WHEN NOT MATCHED THEN INSERT，重跑 100 次结果不变。',
        ja: 'バッチ間冪等性（merge_insert_new）：WHEN NOT MATCHED THEN INSERT のみの MERGE で何度再実行しても安全。',
        en: 'Cross-batch idempotency (merge_insert_new): insert-only MERGE ignores already-loaded keys safely.',
      },
      {
        zh: '只前进 CDC（merge_cdc_forward_only）：优先使用生产者序列号 change_seq，而非不可靠的到达时间戳。',
        ja: '前進のみ CDC（merge_cdc_forward_only）：到着時刻ではなく送信元の連番 change_seq を比較条件にする。',
        en: 'Forward-only CDC: compare producer change_seq rather than unreliable arrival timestamps.',
      },
    ],
    codeBlock: {
      title: {
        zh: '只前进的 CDC MERGE 逻辑 (src/olist_pipeline/silver.py)',
        ja: '前進のみの CDC MERGE ロジック (src/olist_pipeline/silver.py)',
        en: 'Forward-Only CDC MERGE Logic (src/olist_pipeline/silver.py)',
      },
      filePath: 'src/olist_pipeline/silver.py',
      language: 'python',
      code: `# 批内先取 change_seq 最大的一条，再与 Silver 表执行只前进 MERGE
(
    DeltaTable.forName(spark, target_table).alias("t")
    .merge(latest_per_order.alias("s"), "t.order_id = s.order_id")
    .whenMatchedUpdate(
        condition="s.change_seq > t.change_seq",  # 核心：旧变更绝不覆盖新状态！
        set={col: f"s.{col}" for col in cols}
    )
    .whenNotMatchedInsertAll()
    .execute()
)`,
      highlights: [
        {
          zh: 'condition="s.change_seq > t.change_seq" 是防止状态回退的唯一防线',
          ja: 'condition="s.change_seq > t.change_seq" がステータス後退を防ぐ決定的な条件',
          en: 'condition="s.change_seq > t.change_seq" prevents stale events from overwriting newer states',
        },
      ],
    },
    tryItYourself: {
      command: 'uv run python notebooks/walkthrough/03_silver_dedup_cdc.py',
      prompt: {
        zh: '运行 03_silver_dedup_cdc.py，观察同一天重跑两次后营收总额是否保持不变。',
        ja: '03_silver_dedup_cdc.py を実行し、同じ日を2回実行しても売上が二重計上されないことを確認しましょう。',
        en: 'Run 03_silver_dedup_cdc.py and verify revenue stays identical when day 2 is retried.',
      },
    },
    interviewPitch: {
      zh: '“我们把去重分成两层：微批内用窗口函数 row_number() 去重，跨批次用只插入不更新的 Delta MERGE（WHEN NOT MATCHED THEN INSERT）保证幂等；对于乱序 CDC，我们不依赖到达时间，而是基于上游 change_seq 做条件更新（s.change_seq > t.change_seq），确保状态只前进不回退。”',
      ja: '「重複排除はバッチ内（row_number）とバッチ間（INSERTのみの Delta MERGE）の2段構えで冪等性を担保しました。CDC の順序逆転に対しては、到着時刻ではなく送信元の change_seq を使い、s.change_seq > t.change_seq の条件付き MERGE で状態の後退を防いでいます。」',
      en: '"We handle dedup at two levels: row_number() intra-batch and insert-only Delta MERGE cross-batch for idempotency. For out-of-order CDC, we use a conditional MERGE (s.change_seq > t.change_seq) so older events never regress newer state."',
    },
    quiz: [
      {
        question: {
          zh: '为什么在判断 CDC 变更谁新谁旧时，推荐使用 change_seq 而不是到达时间戳 _ingested_at？',
          ja: 'CDC の新旧判定で、到着時刻 _ingested_at ではなく change_seq を使うべき理由は？',
          en: 'Why should CDC ordering rely on change_seq rather than _ingested_at?',
        },
        options: [
          {
            zh: '因为网络延迟或重试可能导致旧状态在更晚的时间到达，按到达时间会误判为“最新状态”',
            ja: 'ネットワーク遅延やリトライにより古い状態が遅れて届くことがあり、到着時刻では最新の状態と誤認するため',
            en: 'Network delays or retries can make older events arrive later, causing arrival-time ordering to regress state',
          },
          {
            zh: '因为 Spark 不支持时间戳排序',
            ja: 'Spark がタイムスタンプでのソートに対応していないため',
            en: 'Because Spark cannot sort by timestamp columns',
          },
        ],
        correctIndex: 0,
        explanation: {
          zh: '事件发生顺序（producer sequence / event time）与系统摄取时间（ingestion time）在分布式系统中往往不一致。',
          ja: '分散システムではイベントの発生順序と取り込み時刻は一致しないため、プロデューサ側の連番を使うのが鉄則です。',
          en: 'In distributed systems, ingestion time does not equal event order; producer sequence numbers are authoritative.',
        },
      },
    ],
  },
  {
    id: '04-scd2',
    number: '04',
    phase: 'silver',
    title: {
      zh: 'SCD Type 2：卖家历史与时点关联',
      ja: 'SCD Type 2：セラー履歴とポイントインタイム結合',
      en: 'SCD Type 2: Seller History & Point-in-Time Joins',
    },
    subtitle: {
      zh: '用单次原子 MERGE 维护版本区间，避免迁址改写历史营收归属',
      ja: '単一のアトミック MERGE で履歴を管理し、過去の売上地域を正確に保つ',
      en: 'Single atomic MERGE for version intervals & accurate historical attribution',
    },
    notebookPath: 'notebooks/walkthrough/04_scd2.py',
    sourceFiles: ['src/olist_pipeline/scd2.py'],
    adrs: ['ADR-0003', 'ADR-0012'],
    badges: ['interviewHot'],
    pipelineStage: 'scd2',
    overview: {
      zh: '卖家表每天以全量快照形式到达，且卖家偶尔会跨州迁址。如果直接覆盖更新，过去订单的地区配送统计就会被改写。scd2.py 使用 valid_from、valid_to、is_current 追踪每次变更：首次出现的卖家从 1900-01-01 开始生效；发生变更时，通过 stage_changes 让该卖家在源表出现两次（一次带 merge_key=seller_id 用于关闭旧版本，一次带 merge_key=NULL 用于插入新版本），从而在一次原子 MERGE 中同时完成关旧开新。',
      ja: 'セラーデータは毎日全件スナップショットで届き、ときどき移転します。上書きすると過去の地域別集計が書き換わるため、scd2.py は valid_from / valid_to / is_current で履歴を保持します。変更時は stage_changes が同じセラーを2行（旧バージョンを閉じる merge_key=seller_id と、新規挿入用の merge_key=NULL）生成し、1回の MERGE でアトミックに更新・挿入を行います。',
      en: 'Sellers arrive as daily full snapshots and occasionally relocate. Overwriting would rewrite historical regional delivery metrics. scd2.py tracks versions with valid_from, valid_to, and is_current (initial versions start at 1900-01-01). When a seller moves, stage_changes emits two rows—one with merge_key=seller_id to close the old row and one with merge_key=NULL to insert the new row—in a single atomic MERGE.',
    },
    whyItMatters: {
      zh: '1）单次 MERGE 实现 SCD2（利用 NULL 永不匹配特性）是 Databricks/Delta Lake 最经典的工程技巧；2）快照中某天缺失的卖家不等于被删除（可能是上游导出遗漏），不能误关闭其有效状态。',
      ja: '1）NULL が絶対にマッチしない性質を利用した「1回の MERGE による SCD2」は Delta Lake の定番テクニックです。2）スナップショットからの一時的な欠落を削除とみなさない設計も実務では重要です。',
      en: '1) The two-row staged MERGE trick (NULL merge_key) makes SCD2 atomic in Delta Lake. 2) Missing a seller in one daily snapshot does not close their version—preventing false deletes.',
    },
    keyTakeaways: [
      {
        zh: '双行技巧：merge_key = seller_id 触发 WHEN MATCHED UPDATE 关闭旧行；merge_key = NULL 触发 WHEN NOT MATCHED INSERT 插入新行。',
        ja: '2行テクニック：merge_key = seller_id で旧行を閉じ、merge_key = NULL で新行を挿入します。',
        en: 'Two-row trick: merge_key = seller_id closes the old version; merge_key = NULL inserts the new version.',
      },
      {
        zh: '使用属性哈希（attr_hash）比逐列写 OR 条件更简洁地检测变更，且幂等（同一快照重跑不会产生新版本）。',
        ja: '属性ハッシュ（attr_hash）で変更検知を簡潔にし、同じスナップショットの再実行でも冪等を保ちます。',
        en: 'Attribute hashing (attr_hash) detects changes cleanly and keeps re-runs idempotent.',
      },
      {
        zh: 'Gold 层事实表按下单日期 order_purchase_date >= valid_from AND < valid_to 进行时点关联（Point-in-time Join）。',
        ja: 'Gold 層では注文日をもとに valid_from <= order_purchase_date < valid_to でポイントインタイム結合します。',
        en: 'Gold fact tables join on order_purchase_date >= valid_from AND < valid_to (point-in-time join).',
      },
    ],
    codeBlock: {
      title: {
        zh: '单次原子 MERGE 实现 SCD2 (src/olist_pipeline/scd2.py)',
        ja: '単一のアトミック MERGE による SCD2 (src/olist_pipeline/scd2.py)',
        en: 'Atomic Single-MERGE SCD2 Pattern (src/olist_pipeline/scd2.py)',
      },
      filePath: 'src/olist_pipeline/scd2.py',
      language: 'python',
      code: `# stage_changes 为发生变更的卖家生成两行：
#   行1: merge_key = seller_id  (匹配当前 is_current=True 的行并关闭它)
#   行2: merge_key = None       (永远匹配不上，触发 INSERT 新版本)
(
    DeltaTable.forName(spark, target_table).alias("t")
    .merge(staged.alias("s"), "t.seller_id = s.merge_key AND t.is_current = true")
    .whenMatchedUpdate(set={"valid_to": "s.valid_from", "is_current": "false"})
    .whenNotMatchedInsert(values={...})
    .execute()
)`,
      highlights: [
        {
          zh: '首次出现的卖家 valid_from 设为 1900-01-01，确保更早的历史订单也能关联上卖家维度',
          ja: '初登場のセラーは valid_from = 1900-01-01 とし、過去の注文が孤立しないようにします',
          en: 'First-seen sellers start at 1900-01-01 so earlier orders never fail to match a dimension key',
        },
      ],
    },
    tryItYourself: {
      command: 'uv run python notebooks/walkthrough/04_scd2.py',
      prompt: {
        zh: '运行 04_scd2.py，观察卖家 s1 迁址后，2018-06-01 与 2018-06-05 两笔订单分别关联到哪个州的 seller_sk。',
        ja: '04_scd2.py を実行し、セラー s1 の移転前後で2つの注文がどの州の seller_sk に結合されるか確認しましょう。',
        en: 'Run 04_scd2.py and see how orders before and after s1’s move resolve to different seller_sk values.',
      },
    },
    interviewPitch: {
      zh: '“我们用单次 Delta MERGE 实现卖家 SCD2：先把变更记录拆成两行——一行带主键用于关闭旧版本，一行带 NULL 键用于插入新版本，这样无需分两步写 UPDATE+INSERT，保证原子性。首次出现的卖家有效起始日设为 1900-01-01，事实表按下单日期做区间关联。”',
      ja: '「セラーの SCD2 は1回の Delta MERGE でアトミックに実装しました。変更行を主キー付き（旧行クローズ用）と NULL キー（新行挿入用）の2行に展開することで、UPDATE と INSERT を分けずに済みます。初登場は 1900-01-01 開始とし、ファクトは注文日で期間結合します。」',
      en: '"We implement SCD2 in one atomic Delta MERGE using the two-row staged trick: one row with the natural key closes the active version, and one with a NULL merge key inserts the new version. Gold joins by order date against [valid_from, valid_to)."',
    },
    quiz: [
      {
        question: {
          zh: '在单次 MERGE 实现 SCD2 时，为什么新版本那一行要把 merge_key 设为 NULL？',
          ja: '1回の MERGE で SCD2 を実装する際、新バージョン側の行の merge_key を NULL にするのはなぜですか？',
          en: 'Why does the new-version row set merge_key to NULL in single-MERGE SCD2?',
        },
        options: [
          {
            zh: '在 SQL 中 NULL = anything 永远为假，从而强制走 WHEN NOT MATCHED 分支插入新行',
            ja: 'SQL では NULL との比較が常に偽になるため、確実に WHEN NOT MATCHED 分岐で新規挿入されるから',
            en: 'Because NULL never matches in SQL join predicates, forcing it into WHEN NOT MATCHED THEN INSERT',
          },
          {
            zh: '因为 Delta Lake 不允许在同一张表插入非空主键',
            ja: 'Delta Lake が非 NULL キーの挿入を禁止しているため',
            en: 'Because Delta Lake forbids inserting non-null keys',
          },
        ],
        correctIndex: 0,
        explanation: {
          zh: '利用 SQL 三值逻辑中 NULL 无法匹配目标表任何行的特性，让同一次 MERGE 既能更新旧行又能插入新行。',
          ja: 'SQL の NULL 比較特性を活かすことで、1回の MERGE でクローズと新規挿入を同時に完結させます。',
          en: 'SQL NULL semantics guarantee the second row never matches, triggering INSERT alongside the UPDATE.',
        },
      },
    ],
  },
  {
    id: '05-quality-gate',
    number: '05',
    phase: 'silver',
    title: {
      zh: '数据质量：规则评估、隔离区与 5% 闸门',
      ja: 'データ品質：ルール評価・隔離・5% ゲート',
      en: 'Data Quality: Rules, Quarantine, Metrics & the 5% Gate',
    },
    subtitle: {
      zh: '坏行去哪里、谁能看见、何时阻断 Gold 发布',
      ja: '不正行の行き先・可観測性・Gold 公開を止める基準',
      en: 'Where bad rows go, observability metrics, and halting Gold on poisoned runs',
    },
    notebookPath: 'notebooks/walkthrough/05_quality_gate.py',
    sourceFiles: ['src/olist_pipeline/quality.py', 'src/olist_pipeline/gate.py'],
    adrs: ['ADR-0004', 'ADR-0005'],
    badges: ['interviewHot', 'core'],
    pipelineStage: 'gate',
    overview: {
      zh: '生产数据一定会有脏数据。quality.py 为每张表定义规则列表，评估后生成 _failed_rules 数组（记录一行违反的所有规则，而非遇到第一条就停）。通过校验的进入 Silver；失败的写入 ops.quarantine（附带失败原因与 _raw），同时将各规则计数写入 ops.dq_metrics 供 Dashboard 监控。在进入 Gold 前，gate.py 检查本次运行的坏行比例是否超过 5%：一旦超过，立即抛出异常阻断 Gold，防止污染下游报表。',
      ja: '本番では不正行が必ず届きます。quality.py は違反した全ルールを配列 _failed_rules に記録し、合格行を Silver へ、不合格行を理由と _raw 付きで ops.quarantine へ送ります。各ルールの件数は ops.dq_metrics に記録されます。Gold の直前で gate.py が不正行率 5% 超を検知するとジョブを停止し、汚染された数値の公開を防ぎます。',
      en: 'Bad rows are inevitable. quality.py evaluates all rules per row into a _failed_rules array: clean rows proceed to Silver, failed rows go to ops.quarantine with reasons and _raw, and per-rule counts land in ops.dq_metrics. Before Gold runs, gate.py halts the pipeline if the run’s bad-row rate exceeds 5%.',
    },
    whyItMatters: {
      zh: '既不能“一有坏行就整个管道挂掉”（10 万行里坏 3 行很正常），也不能“静默丢弃或放行坏行”（上游故障发来 50% 垃圾数据会把报表毁掉）。隔离 + 指标 + 阈值闸门（Circuit Breaker）是数据可观测性的黄金组合。',
      ja: '10万行中3行のエラーで毎日止まるのも、50%のゴミデータがそのままレポートに出るのもダメです。隔離・メトリクス・閾値ゲート（サーキットブレーカー）の組み合わせが不可欠です。',
      en: 'Failing the whole job on 3 bad rows is brittle; silently passing or dropping 50% garbage destroys trust. Quarantine + metrics + threshold gate acts as a production circuit breaker.',
    },
    keyTakeaways: [
      {
        zh: '规则条件为 NULL 视为通过：这样缺失 product_id 时只报 missing_product_id，不会重复报 unknown_product_id。',
        ja: '条件が NULL なら合格とみなす設計により、product_id 欠損時に missing と unknown の二重カウントを防ぎます。',
        en: 'NULL rule conditions evaluate as pass—preventing a missing product_id from double-firing unknown_product_id.',
      },
      {
        zh: '迟到容忍（ADR-0004）：迟到 ≤ 3 天的数据正常接收并按销售发生日归集修正 Gold；超过 3 天进隔离区 too_late。',
        ja: '遅延許容（ADR-0004）：3日以内の遅延は受け入れて過去の売上日を補正し、3日超は too_late として隔離します。',
        en: 'Late data (ADR-0004): ≤ 3 days late are accepted and retroactively update Gold; > 3 days are quarantined as too_late.',
      },
    ],
    codeBlock: {
      title: {
        zh: '质量闸门判定逻辑 (src/olist_pipeline/gate.py)',
        ja: '品質ゲート判定ロジック (src/olist_pipeline/gate.py)',
        en: 'Data Quality Gate Check (src/olist_pipeline/gate.py)',
      },
      filePath: 'src/olist_pipeline/gate.py',
      language: 'python',
      code: `bad_rate = bad_rows / total_rows if total_rows > 0 else 0.0
passed = bad_rate <= cfg.dq_max_bad_rate  # 默认 0.05 (5%)
# 结果写入 ops.dq_gate_log 供审计与 Dashboard 展示
if not passed:
    raise DataQualityGateError(
        f"DQ gate failed for run_id={cfg.run_id}: bad_rate={bad_rate:.2%} > {cfg.dq_max_bad_rate:.2%}"
    )`,
      highlights: [
        {
          zh: '端到端测试专门模拟第 6 天投毒 12% 坏行，验证只有当天被拦截，次日恢复正常后 Gold 自动追上',
          ja: 'E2Eテストでは6日目に12%の不正行を注入し、当日のみゲートが停止し翌日に回復することを検証しています',
          en: 'E2E tests poison day 6 with ~12% bad rows, verifying only day 6 is blocked and day 7 catches up cleanly',
        },
      ],
    },
    tryItYourself: {
      command: 'uv run python notebooks/walkthrough/05_quality_gate.py',
      prompt: {
        zh: '试着在模拟器 Tab 中点击“投毒批次（>5% 坏行）”，或在 notebook 中调整 bad_rows 数量触发闸门阻断。',
        ja: 'シミュレータタブの「毒入りバッチ (>5% 不正)」を試すか、ノートブックで不正行数を増やしてゲート停止を体験しましょう。',
        en: 'Try the "Poisoned Batch (>5%)" preset in the Pipeline Simulator tab to see the gate halt Gold!',
      },
    },
    interviewPitch: {
      zh: '“我们没有采用非黑即白的管道策略，而是设计了三层防护：行级规则打标后将坏行分流到 ops.quarantine 保留现场，规则计数写入 ops.dq_metrics 驱动告警看板，并在 Silver 和 Gold 之间设置 5% 阈值闸门——单批坏行超过 5% 立即熔断，保护 Gold 层不被上游故障污染。”',
      ja: '「オール・オア・ナッシングではなく3段構えの防御を実装しました。行単位で違反理由を付けて ops.quarantine に隔離し、ops.dq_metrics で可視化し、Silver と Gold の間に5%閾値の品質ゲートを置いて異常バッチの公開を遮断します。」',
      en: '"We built a three-tier defense: row-level rules route bad rows with reasons to ops.quarantine, counts stream to ops.dq_metrics, and a 5% circuit-breaker gate halts Gold publishing if a batch is poisoned."',
    },
    quiz: [
      {
        question: {
          zh: '为什么 DQ Gate（质量闸门）要放在 Silver 之后、Gold 之前，而不是放在 Bronze 之前？',
          ja: '品質ゲート（DQ Gate）を Bronze の前ではなく Silver の後・Gold の前に置く理由は？',
          en: 'Why is the DQ Gate placed between Silver and Gold rather than before Bronze?',
        },
        options: [
          {
            zh: 'Bronze 需要无条件保留原始数据以供审计和回溯，而业务规则校验与隔离发生在 Silver 阶段，阻断 Gold 可防止脏数据影响分析报表',
            ja: 'Bronze は監査用に生データを無条件で保持する必要があり、ルール評価は Silver で行われるため、Gold の直前で止めるのが最も効果的だから',
            en: 'Bronze must preserve raw inputs for audit/replay, while Silver evaluates rules; gating before Gold protects analytics without losing raw evidence',
          },
          {
            zh: '因为 Bronze 层不能运行 Python 代码',
            ja: 'Bronze 層では Python コードが動かないため',
            en: 'Because Bronze cannot execute Python code',
          },
        ],
        correctIndex: 0,
        explanation: {
          zh: 'Bronze 的职责是忠实记录收到的每一行；Silver 负责规则校验并产出质量指标；Gate 基于这些指标决定是否允许发布 Gold。',
          ja: 'Bronze は受け取った事実の保存、Silver はルール検証とメトリクス集計、Gate はその指標に基づく公開可否の判断という明確な責務分離です。',
          en: 'Bronze preserves raw evidence, Silver evaluates rules and emits metrics, and Gate decides whether Gold can publish.',
        },
      },
    ],
  },
  {
    id: '06-gold',
    number: '06',
    phase: 'gold',
    title: {
      zh: 'Gold：星型模型、客户归并与 GMV 口径',
      ja: 'Gold：スタースキーマ、顧客の名寄せ、GMV の定義',
      en: 'Gold: Star Schema, Customer Identity & GMV',
    },
    subtitle: {
      zh: '从事务事实表到业务指标口径的陷阱规避',
      ja: 'トランザクションファクトと実務指標定義の落とし穴',
      en: 'Transaction facts, customer_unique_id deduplication, and GMV rules',
    },
    notebookPath: 'notebooks/walkthrough/06_gold.py',
    sourceFiles: ['src/olist_pipeline/gold.py'],
    adrs: ['ADR-0004', 'ADR-0007'],
    badges: ['core'],
    pipelineStage: 'gold',
    overview: {
      zh: 'Gold 层直接服务分析师与 BI 看板，包含事务事实表 fact_order_item（粒度：订单明细）、4 张维度表（dim_customer, dim_seller, dim_product, dim_date）以及汇总表 mart_seller_delivery_performance。本节重点揭示真实业务数据中的大坑：Olist 每下一个订单都会生成一个新的 customer_id，直接按它统计客户数会把复购率算成 0！必须按 customer_unique_id 归并。',
      ja: 'Gold 層はアナリスト向けのスタースキーマ（fact_order_item、4つのディメンション、マート）を提供します。ここで重要なのが顧客の名寄せです。Olist は注文ごとに新しい customer_id を発行するため、そのまま集計するとリピート率が0%になります。customer_unique_id 単位で名寄せし、最新注文の住所を採用します。',
      en: 'Gold serves analysts with fact_order_item (grain: order item), 4 dimensions, and mart_seller_delivery_performance. A critical real-data trap: Olist generates a new customer_id for every order—counting it yields 0% repeat customers! dim_customer must deduplicate by customer_unique_id using the latest order’s address.',
    },
    whyItMatters: {
      zh: '数据建模最怕“技术上跑通了，业务口径全错了”。在真实 Olist 数据中，82,406 个 customer_id 归并后实际只有 79,682 位真实客户；同时，canceled/unavailable 状态的订单绝不能计入 GMV。',
      ja: '技術的に動いてもビジネス指標が間違っていては意味がありません。実データでは 82,406 件の customer_id が 79,682 人に名寄せされ、またキャンセル注文は GMV から除外する必要があります。',
      en: 'In real Olist data, 82,406 customer_ids collapse to 79,682 real people. Also, canceled and unavailable orders must be excluded from GMV.',
    },
    keyTakeaways: [
      {
        zh: '客户维度粒度：1 行 = 1 位真实用户（customer_unique_id），取其最近一次订单的城市/州。',
        ja: '顧客ディメンションの粒度：1行 = 1人の実ユーザー（customer_unique_id）、住所は直近の注文から取得。',
        en: 'dim_customer grain: 1 row per customer_unique_id, taking address from their most recent order.',
      },
      {
        zh: 'GMV 口径：排除 canceled 和 unavailable 状态的订单明细，price + freight_value（或按业务定义）。',
        ja: 'GMV 定義：canceled と unavailable ステータスを除外して集計。',
        en: 'GMV excludes canceled and unavailable orders.',
      },
    ],
    codeBlock: {
      title: {
        zh: '按 customer_unique_id 归并客户维度 (src/olist_pipeline/gold.py)',
        ja: 'customer_unique_id による顧客名寄せ (src/olist_pipeline/gold.py)',
        en: 'Customer Identity Resolution (src/olist_pipeline/gold.py)',
      },
      filePath: 'src/olist_pipeline/gold.py',
      language: 'python',
      code: `# 每个 customer_unique_id 只保留最近一次下单对应的地址
w = Window.partitionBy("customer_unique_id").orderBy(F.col("order_purchase_ts").desc_nulls_last())
dim_customer = (
    customers_with_orders
    .withColumn("_rn", F.row_number().over(w))
    .filter(F.col("_rn") == 1)
    .drop("_rn")
)`,
      highlights: [
        {
          zh: '真实数据中 82,406 个 customer_id 归并为 79,682 个真实客户，复购指标由此恢复准确',
          ja: '実データの 82,406 件の customer_id が 79,682 人に集約され、リピート分析が可能になります',
          en: '82,406 customer_ids resolve to 79,682 unique people, unlocking accurate repeat-purchase analytics',
        },
      ],
    },
    tryItYourself: {
      command: 'uv run python notebooks/walkthrough/06_gold.py',
      prompt: {
        zh: '运行 06_gold.py，查看 c1 和 c2 两个不同 customer_id 如何归并成同一个人 ana。',
        ja: '06_gold.py を実行し、異なる customer_id (c1, c2) が同一人物 ana に名寄せされる様子を確認しましょう。',
        en: 'Run 06_gold.py and see how c1 and c2 collapse into one dim_customer row for ana.',
      },
    },
    interviewPitch: {
      zh: '“在建 Gold 星型模型时，我们专门做了业务语义校验，发现了 Olist 数据中每单生成一个新 customer_id 的陷阱，于是按 customer_unique_id 归并维度表并取最新订单地址；同时在 fact_order_item 中通过时点关联绑定卖家当时所在州，并明确排除了取消订单对 GMV 的干扰。”',
      ja: '「Gold 層のスタースキーマ構築では、注文ごとに発行される customer_id の罠を回避するため customer_unique_id で名寄せを行い、セラーは注文時点の州でポイントインタイム結合し、キャンセル注文を GMV から除外するビジネスロジックを徹底しました。」',
      en: '"When modeling Gold, we caught Olist’s per-order customer_id trap and resolved dim_customer by customer_unique_id, point-in-time joined dim_seller for historical state attribution, and excluded canceled orders from GMV."',
    },
    quiz: [
      {
        question: {
          zh: '如果不按 customer_unique_id 归并，直接用 customer_id 作为 dim_customer 主键会导致什么后果？',
          ja: 'customer_unique_id で名寄せせず customer_id をそのまま主キーにすると何が起きますか？',
          en: 'What happens if you use customer_id instead of customer_unique_id as the dim_customer grain?',
        },
        options: [
          {
            zh: '每个订单都有不同的 customer_id，导致所有客户的复购率指标全部变成 0',
            ja: '注文ごとに別IDが振られるため、すべての顧客のリピート率が 0% になってしまう',
            en: 'Every order gets a new customer_id, making all repeat-customer metrics come out as zero',
          },
          {
            zh: '会导致 Delta Lake 写入报错',
            ja: 'Delta Lake への書き込みエラーになる',
            en: 'Delta Lake refuses to write the table',
          },
        ],
        correctIndex: 0,
        explanation: {
          zh: '这是电商数据建模的典型实体解析（Entity Resolution）问题，必须识别出代表“自然人”的业务键。',
          ja: '実務でよくあるエンティティ解決の課題であり、真の「人」を表すキーを見極める必要があります。',
          en: 'This is a classic entity resolution issue: always distinguish an account/order token from the real person.',
        },
      },
    ],
  },
  {
    id: '07-fulfillment',
    number: '07',
    phase: 'gold',
    title: {
      zh: '累积快照：订单履约全周期与右删失',
      ja: '累積スナップショット：注文フルフィルメントと右側打ち切り',
      en: 'Accumulating Snapshot: Order Fulfillment & Right-Censoring',
    },
    subtitle: {
      zh: 'Kimball 第二类事实表：跟踪下单→审核→发货→送达各阶段耗时',
      ja: 'Kimball 第2のファクト：各マイルストーンの所要時間とデータ異常の扱い',
      en: 'Kimball’s 2nd fact type: tracking milestone timestamps and stage durations',
    },
    notebookPath: 'notebooks/walkthrough/07_fulfillment.py',
    sourceFiles: ['src/olist_pipeline/gold.py'],
    adrs: ['ADR-0009'],
    badges: ['interviewHot'],
    pipelineStage: 'gold',
    overview: {
      zh: 'Kimball 理论把事实表分为三种：事务事实表（06）、累积快照事实表（本节）和周期快照事实表（08）。fact_order_fulfillment 每个订单一行，随着订单经历下单、付款审核、交给承运商、送达客户，这一行被原地更新，并计算每个阶段的耗时（小时）及送达评分关联。针对真实数据中 628 个阶段时间倒挂的订单，将负时长设为 NULL 并打标记。',
      ja: 'Kimball の3種類のファクトのうち、累積スナップショット（fact_order_fulfillment）は「1プロセス（注文）1行」で、購入→承認→出荷→配達の進展に合わせてその行を更新し、各段階の所要時間を算出します。実データの628件に見られた工程順序の逆転（負の所要時間）は NULL に丸めて警告フラグを立てます。',
      en: 'fact_order_fulfillment is a Kimball accumulating snapshot: one row per order, updated in place as milestones (purchase → approved → carrier → delivered) arrive, computing stage durations in hours. For the 628 real orders with inverted timestamps, negative durations become NULL with anomaly flags.',
    },
    whyItMatters: {
      zh: '在分析“平均配送耗时”时，尚未送达的在途订单（右删失数据，Right-Censoring）如果强行填 0 或当前时间，会严重拉低平均耗时；而真实数据中还发现迟到 8 天以上的订单评分骤降至 1.66 星（准时订单为 4.27 星）。',
      ja: 'まだ配達完了していない注文（右側打ち切り：Right-Censoring）を平均所要時間に含めると値が歪みます。また実データ分析により、8日以上遅延した注文は評価が 1.66 星まで急落する（定時は 4.27 星）ことが判明しました。',
      en: 'Including in-flight orders (right-censored data) skews average delivery time. Real data also shows delivery >8 days late drops review scores from 4.27★ to 1.66★.',
    },
    keyTakeaways: [
      {
        zh: '累积快照粒度：每个订单一行，随生命周期更新，非常适合漏斗转化与 SLA 耗时分析。',
        ja: '粒度：1注文1行でライフサイクルに沿って更新。リードタイム・SLA分析に最適です。',
        en: 'Grain: 1 row per order lifecycle, ideal for funnel and SLA duration analysis.',
      },
      {
        zh: '对尚未到达的里程碑以及顺序颠倒的负时长保持 NULL，避免误导平均值聚合。',
        ja: '未到達のマイルストーンや逆転した負の時間は NULL のままにし、集計の歪みを防ぎます。',
        en: 'Keep unreached milestones and inverted negative durations as NULL so averages remain honest.',
      },
    ],
    codeBlock: {
      title: {
        zh: '累积快照阶段耗时与负时长防护 (src/olist_pipeline/gold.py)',
        ja: '累積スナップショットの所要時間と負値ガード (src/olist_pipeline/gold.py)',
        en: 'Accumulating Snapshot Duration & Negative Guard (src/olist_pipeline/gold.py)',
      },
      filePath: 'src/olist_pipeline/gold.py',
      language: 'python',
      code: `def _hours_between(start_col, end_col):
    diff_hours = (F.unix_timestamp(end_col) - F.unix_timestamp(start_col)) / 3600.0
    # 真实数据中存在未审核就发货等顺序颠倒情况：负时长设为 NULL，不计入平均耗时
    return F.when(diff_hours >= 0, F.round(diff_hours, 2))`,
      highlights: [
        {
          zh: 'is_delivered / is_late 等布尔标记让分析师无需自己写复杂日期判断即可过滤右删失数据',
          ja: 'is_delivered や is_late フラグを用意し、アナリストが右側打ち切りデータを容易に除外できるようにしています',
          en: 'Helper flags like is_delivered and is_late let analysts filter right-censored orders effortlessly',
        },
      ],
    },
    tryItYourself: {
      command: 'uv run python notebooks/walkthrough/07_fulfillment.py',
      prompt: {
        zh: '运行 07_fulfillment.py，观察在途订单 o4 与顺序颠倒订单 o3 在累积快照表中的呈现结果。',
        ja: '07_fulfillment.py を実行し、配送中の注文 o4 と順序逆転の注文 o3 がどう表現されるか確認しましょう。',
        en: 'Run 07_fulfillment.py and inspect how in-flight order o4 and inverted order o3 appear in the table.',
      },
    },
    interviewPitch: {
      zh: '“除了常见的订单明细事务表，我还为履约 SLA 分析建了 Kimball 累积快照事实表 fact_order_fulfillment，每个订单一行，随 CDC 变更原地更新各阶段时间与耗时，并专门处理了在途订单的右删失问题和真实数据中 0.76% 的时间倒挂异常。”',
      ja: '「通常の明細ファクトに加え、リードタイム分析用に Kimball の累積スナップショット fact_order_fulfillment を構築しました。注文ごとに1行を更新し、配送中注文の右側打ち切りや実データの時間逆転（0.76%）を安全に処理しています。」',
      en: '"Alongside the transaction fact, I built a Kimball accumulating snapshot (fact_order_fulfillment) tracking milestone durations per order, safely handling right-censored in-flight orders and inverted real-world timestamps."',
    },
    quiz: [
      {
        question: {
          zh: '累积快照事实表（Accumulating Snapshot）最适合回答哪类业务问题？',
          ja: '累積スナップショット・ファクトが最も適している分析テーマはどれですか？',
          en: 'Which analytics question is an Accumulating Snapshot fact table best suited for?',
        },
        options: [
          {
            zh: '订单从下单到审核、发货、送达各阶段耗时多久、卡在哪个环节',
            ja: '注文から承認・出荷・配達までの各工程のリードタイムとボトルネック分析',
            en: 'How long orders take between lifecycle milestones and where bottlenecks occur',
          },
          {
            zh: '每天结束时仓库里还剩多少未发货订单',
            ja: '毎日の終了時点で未発送の注文が何件残っているか',
            en: 'How many orders were still open at the end of each day',
          },
        ],
        correctIndex: 0,
        explanation: {
          zh: '“每天结束时还剩多少”属于周期快照（08节）；“跨阶段耗时”正是累积快照的核心场景。',
          ja: '「日末時点の残高・残件数」は定期スナップショット（08章）の領分であり、工程間の所要時間分析が累積スナップショットの役割です。',
          en: 'End-of-day counts belong to periodic snapshots (Module 08); lifecycle stage durations are the core use case for accumulating snapshots.',
        },
      },
    ],
  },
  {
    id: '08-backlog',
    number: '08',
    phase: 'gold',
    title: {
      zh: '周期快照：每日订单积压与迟到修正',
      ja: '定期スナップショット：日次注文残と遅延データ補正',
      en: 'Periodic Snapshot: Daily Order Backlog & Late Backfills',
    },
    subtitle: {
      zh: 'Kimball 第三类事实表：从只追加变更日志重放历史任意一天的积压状态',
      ja: 'Kimball 第3のファクト：追記ログから過去の任意の日の未完了注文を再現',
      en: 'Kimball’s 3rd fact type: replaying append-only change logs for daily backlog',
    },
    notebookPath: 'notebooks/walkthrough/08_backlog.py',
    sourceFiles: ['src/olist_pipeline/gold.py'],
    adrs: ['ADR-0010'],
    pipelineStage: 'gold',
    overview: {
      zh: '如果你只保留订单的“最新状态”（silver.orders），你就永远无法回答“上周三有多少订单处于待发货状态”。因此 Silver 层还保留了一份只追加的审计日志 silver.order_changes。build_fact_daily_order_backlog 将日期脊柱与变更日志结合，计算出每天结束时处于未完成状态的订单数、金额、滞留天数中位数与逾期数；若某天迟到数据到达，只重建受影响日期的快照即可修正历史。',
      ja: '最新状態（silver.orders）だけでは「先週水曜日に処理中だった注文数」は分かりません。そのため Silver は追記専用ログ silver.order_changes を保持します。build_fact_daily_order_backlog は日付軸とログを結合し、日末時点の未完了注文数・金額・滞留日数中央値・遅延件数を集計します。遅延データが届けば該当日のスナップショットを再計算して過去を補正します。',
      en: 'If you only keep current state (silver.orders), you can never answer "how many orders were stuck processing last Wednesday?". That’s why Silver keeps the append-only silver.order_changes log. build_fact_daily_order_backlog replays it across a date spine per day × status × customer state, and late arrivals cleanly recompute affected past days.',
    },
    whyItMatters: {
      zh: '这集齐了 Kimball 数仓建模的全部三种事实表（事务、累积快照、周期快照），并展示了“只追加变更日志 + 幂等重放”在修正迟到历史数据时的威力。',
      ja: 'これで Kimball の3大ファクトテーブルがすべて揃い、追記専用ログと冪等な再計算による遅延データの過去補正パターンを習得できます。',
      en: 'This completes all three Kimball fact table types and demonstrates how an append-only change log enables accurate retroactive corrections for late data.',
    },
    keyTakeaways: [
      {
        zh: '周期快照粒度：日期（snapshot_date）× 订单状态 × 客户所在州。',
        ja: '粒度：日付（snapshot_date）× 注文ステータス × 顧客の州。',
        en: 'Grain: snapshot_date × order_status × customer_state.',
      },
      {
        zh: '核心指标：未完成订单数、积压金额、滞留天数中位数、超 30 天积压数、已过预计送达日订单数。',
        ja: '主要指標：未完了件数、金額、経過日数中央値、30日超滞留数、配達予定日超過数。',
        en: 'Metrics: open orders, backlog value, median age, >30d stale count, and past-estimated-delivery count.',
      },
    ],
    codeBlock: {
      title: {
        zh: '基于只追加变更日志构建每日积压快照 (08_backlog.py)',
        ja: '追記ログから日次注文残スナップショットを構築 (08_backlog.py)',
        en: 'Building Daily Backlog Snapshot from Change Log (08_backlog.py)',
      },
      filePath: 'notebooks/walkthrough/08_backlog.py',
      language: 'python',
      code: `# 对于日期脊柱中的每一天 d，取每个订单 change_ts <= d 的最后一条状态变更
# 若该状态不是终态 (delivered / canceled / unavailable)，则计入当天积压
backlog = gold.build_fact_daily_order_backlog(
    dates_df, order_changes_df, order_items_df, customers_df
)`,
      highlights: [
        {
          zh: '把真实 Olist 数据中 300 多个从 5 月起就卡在 processing 的僵尸订单清晰暴露出来',
          ja: '実データで5月からずっと processing のまま停滞していた300件以上の注文を明確に可視化できます',
          en: 'Surfaces 300+ real Olist orders stuck in "processing" since May that current-state tables hide',
        },
      ],
    },
    tryItYourself: {
      command: 'uv run python notebooks/walkthrough/08_backlog.py',
      prompt: {
        zh: '运行 08_backlog.py，观察订单 o1、o2 在不同日期进入终态后如何自动退出每日积压统计。',
        ja: '08_backlog.py を実行し、注文 o1, o2 が完了ステータスになると日次注文残から抜ける様子を確認しましょう。',
        en: 'Run 08_backlog.py and watch orders o1 and o2 drop out of the daily backlog once delivered or canceled.',
      },
    },
    interviewPitch: {
      zh: '“为了监控订单积压趋势，我们在 Silver 保留了只追加的 order_changes 日志，并在 Gold 构建了周期快照表 fact_daily_order_backlog，按天×状态×州统计未完成订单的数量、滞留中位数和逾期数。因为是按天重放日志，即使有 3 天内的迟到状态变更，也能精准修正过去几天的积压曲线。”',
      ja: '「注文残の推移を把握するため、Silver に追記専用の order_changes ログを残し、Gold で日次定期スナップショットを構築しました。日付×ステータス×州ごとに未完了数や滞留日数を集計し、3日以内の遅延データによる過去分の補正も容易にしています。」',
      en: '"To track operational backlog over time, we keep an append-only order_changes log in Silver and build a periodic snapshot (fact_daily_order_backlog) by day × status × state, allowing clean recomputation when late updates arrive."',
    },
    quiz: [
      {
        question: {
          zh: '为什么周期快照表 fact_daily_order_backlog 需要依赖 silver.order_changes 而不是 silver.orders？',
          ja: '定期スナップショット fact_daily_order_backlog が silver.orders ではなく silver.order_changes に依存する理由は？',
          en: 'Why does fact_daily_order_backlog read from silver.order_changes instead of silver.orders?',
        },
        options: [
          {
            zh: 'silver.orders 只保存每个订单的最新状态，丢失了订单在过去每一天所处的历史状态',
            ja: 'silver.orders は最新状態のみを保持しており、過去の各日時点でどのステータスだったかが失われているため',
            en: 'silver.orders only holds the latest state per order, losing what status each order was in on past days',
          },
          {
            zh: 'silver.orders 不包含 order_id 列',
            ja: 'silver.orders には order_id 列がないため',
            en: 'silver.orders has no order_id column',
          },
        ],
        correctIndex: 0,
        explanation: {
          zh: '只有只追加的变更日志能还原“历史任意时间点的快照”。',
          ja: '過去の任意の時点の状態を再現するには、追記専用の状態変更履歴が不可欠です。',
          en: 'Only an append-only event/change log allows time-traveling back to reconstruct past daily snapshots.',
        },
      },
    ],
  },
  {
    id: '09-incremental',
    number: '09',
    phase: 'scale',
    title: {
      zh: '增量 Gold：Delta Change Data Feed 与水位线',
      ja: '増分 Gold：Delta Change Data Feed とウォーターマーク',
      en: 'Incremental Gold: Change Data Feed & Watermarks',
    },
    subtitle: {
      zh: '只重算受影响的订单，并在 MERGE 成功后安全推进水位线',
      ja: '影響を受けた注文だけを再構築し、MERGE 成功後にウォーターマークを進める',
      en: 'Rebuilding only affected orders and advancing watermarks after MERGE',
    },
    notebookPath: 'notebooks/walkthrough/09_incremental.py',
    sourceFiles: ['src/olist_pipeline/incremental.py', 'src/olist_pipeline/gold.py'],
    adrs: ['ADR-0011'],
    badges: ['interviewHot'],
    pipelineStage: 'gold',
    overview: {
      zh: '每天批处理只变动 10 万订单中的一两千行，每次全量重建 Gold 极其浪费算力。开启 Delta Lake Change Data Feed（CDF）后，incremental.py 读取每张上游 Silver 表自上次水位线以来的变更版本，汇总出“受影响的 order_id 集合”，仅重算这些订单并通过 MERGE 更新 Gold。水位线保存在 ops.gold_watermarks，且严格保证只有在 Gold MERGE 成功后才推进；若遇到历史版本被 VACUUM 清理或首次运行，则自动优雅降级为全量重建。',
      ja: '毎日 10 万件中 1〜2 千行しか変わらないのに Gold を全件再構築するのは非効率です。Delta Change Data Feed (CDF) を有効にすると、incremental.py が前回バージョン以降の変更行だけを読み、影響を受けた order_id の集合だけを特定して Gold を MERGE 更新します。ウォーターマーク（ops.gold_watermarks）は MERGE 成功後にのみ更新され、初回や履歴切れ時は自動で全件処理にフォールバックします。',
      en: 'Rebuilding all 100k orders daily when only 1-2k rows change wastes compute. With Delta Change Data Feed (CDF), incremental.py reads changes since the last version in ops.gold_watermarks, derives the set of affected order_ids, and rebuilds only those orders via MERGE. Watermarks advance only after MERGE succeeds, with automatic fallback to full refresh if needed.',
    },
    whyItMatters: {
      zh: '“水位线先于写入推进”是增量管道丢数据的头号元凶；而“如何从多张上游表的 CDF 变更汇总出同一批受影响实体”则是大规模 Lakehouse 降本增效的标准模式。',
      ja: '「書き込み前にウォーターマークを進めてしまう」のは増分パイプラインでデータ欠損が起きる最大の原因です。複数テーブルの CDF から影響エンティティを逆算する手法は、大規模 Lakehouse の定番パターンです。',
      en: 'Advancing watermarks before MERGE commits causes silent data loss on failures. Deriving affected entities across multiple CDF sources is the gold standard for scalable Lakehouse incremental processing.',
    },
    keyTakeaways: [
      {
        zh: '即使数据规模小，增量重建也只触碰约 1-2% 的订单，且结果被测试证明与全量重建逐行一致。',
        ja: '再構築対象を全体の約1〜2%の注文に絞りつつ、全件再構築と1行の狂いもなく一致することを検証しています。',
        en: 'Rebuilds only ~1-2% of orders per daily batch while matching full-refresh output row-for-row.',
      },
      {
        zh: '支持 full_refresh=True 参数和 CDF 版本过期自动退回全量重建（full-refresh fallback）。',
        ja: 'full_refresh=True 指定や CDF バージョン期限切れ時の自動全件フォールバックを備えています。',
        en: 'Supports explicit full_refresh=True and automatic fallback when CDF history is unavailable.',
      },
    ],
    codeBlock: {
      title: {
        zh: '读取 CDF 变更并提取受影响订单 (src/olist_pipeline/incremental.py)',
        ja: 'CDF 変更の読み取りと影響注文の抽出 (src/olist_pipeline/incremental.py)',
        en: 'Reading CDF Changes & Affected Orders (src/olist_pipeline/incremental.py)',
      },
      filePath: 'src/olist_pipeline/incremental.py',
      language: 'python',
      code: `# 1. 读取自 watermark 之后的所有 CDF 变更
changes = (
    spark.read.format("delta")
    .option("readChangeFeed", "true")
    .option("startingVersion", last_ver + 1)
    .table(source_table)
)
# 2. 提取受影响的 order_id，仅重算这些订单并 MERGE 进 Gold
# 3. 只有 MERGE 成功后，才将 ops.gold_watermarks 更新为最新版本号`,
      highlights: [
        {
          zh: '每次增量运行都会将重建订单数与占比记录到 ops.gold_incremental_stats',
          ja: '毎回の再構築件数と割合は ops.gold_incremental_stats に記録されます',
          en: 'Each run logs rebuilt order counts and share to ops.gold_incremental_stats',
        },
      ],
    },
    tryItYourself: {
      command: 'uv run python notebooks/walkthrough/09_incremental.py',
      prompt: {
        zh: '运行 09_incremental.py，对比增量重建与全量重建的结果，查看每次运行实际重算的订单比例。',
        ja: '09_incremental.py を実行し、増分処理と全件再構築の結果が一致すること、再構築された注文割合を確認しましょう。',
        en: 'Run 09_incremental.py and verify incremental Gold matches full refresh while touching a fraction of orders.',
      },
    },
    interviewPitch: {
      zh: '“为了避免每日全量重算 Gold，我们开启了 Delta Change Data Feed，通过记录每张 Silver 表的水位线，增量读取变更行并反查受影响的 order_id，只对这些订单做局部重算和 MERGE。水位线严格在 MERGE 成功后才推进，保证崩溃恢复时的端到端一致性。”',
      ja: '「Gold の全件再計算を避けるため、Delta Change Data Feed とウォーターマーク管理を導入しました。各 Silver テーブルの差分バージョンから影響を受ける order_id だけを特定して局所的に MERGE し、コミット成功後にのみウォーターマークを更新することで耐障害性を担保しています。」',
      en: '"To avoid full Gold rebuilds, we enabled Delta Change Data Feed with watermarks in ops.gold_watermarks. We derive affected order_ids from Silver changes, MERGE only those orders, and commit watermarks strictly after MERGE succeeds."',
    },
    quiz: [
      {
        question: {
          zh: '如果 Gold MERGE 成功写入，但紧接着在更新 ops.gold_watermarks 时作业崩溃了，下一次重跑会发生什么？',
          ja: 'Gold の MERGE は成功したものの、ops.gold_watermarks の更新直前にジョブがクラッシュした場合、次回実行はどうなりますか？',
          en: 'If Gold MERGE succeeds but the job crashes before updating ops.gold_watermarks, what happens on retry?',
        },
        options: [
          {
            zh: '下一次会从旧水位线重新读取这批变更并再次执行幂等 MERGE，数据不丢不重',
            ja: '古いウォーターマークから同じ変更を再読込して冪等な MERGE をやり直すだけで、データ欠損も重複も起きない',
            en: 'The retry re-reads the same CDF range and runs an idempotent MERGE—zero data loss or duplication',
          },
          {
            zh: '这批数据在 Gold 表中会永久丢失',
            ja: 'そのバッチのデータが Gold から永久に失われる',
            en: 'Those rows are permanently lost from Gold',
          },
        ],
        correctIndex: 0,
        explanation: {
          zh: '这就是“At-least-once 读取 + 幂等 MERGE + 后置水位线”组合提供的强一致性保障。',
          ja: '「少なくとも1回の読み取り + 冪等な MERGE + 後置ウォーターマーク」の組み合わせが安全なリトライを保証します。',
          en: 'At-least-once CDF reads + idempotent MERGE + post-commit watermark advancement guarantees safe retries.',
        },
      },
    ],
  },
  {
    id: '10-lakeflow',
    number: '10',
    phase: 'scale',
    title: {
      zh: 'Lakeflow 声明式对比与 16 表每日对账',
      ja: 'Lakeflow 宣言型パイプライン比較と 16 テーブル日次突合',
      en: 'Lakeflow Declarative vs Imperative & Daily Reconciliation',
    },
    subtitle: {
      zh: '550 行声明式 SQL+Python 如何等价实现 1,070 行命令式代码',
      ja: '550行の宣言型コードと1,070行の命令型コードを毎日突合して見えた違い',
      en: 'How ~550 lines of Lakeflow SDP match ~1,070 lines of imperative PySpark',
    },
    notebookPath: 'notebooks/walkthrough/10_lakeflow_comparison.py',
    sourceFiles: ['lakeflow/olist_sdp.sql', 'lakeflow/sellers_scd2.py', 'src/olist_pipeline/reconcile.py'],
    adrs: ['ADR-0008', 'ADR-0012', 'ADR-0013'],
    badges: ['declarative', 'interviewHot'],
    pipelineStage: 'lakeflow',
    overview: {
      zh: '本项目用 Lakeflow Spark Declarative Pipelines（原 Delta Live Tables）将整套规格重写了一遍：SQL 处理 STREAM read_files、EXPECT 质量期望、AUTO CDC ... SEQUENCE BY 和物化视图；Python API（sellers_scd2.py）按日期顺序回放卖家历史快照做 SCD2。由于坏行超过 5% 需阻断 Gold，Job 把 Lakeflow 拆成两次刷新（先 Silver+Gate，通过后再刷新 Gold）。最后 reconcile.py 用 EXCEPT ALL 逐行比对两套实现的 16 张表。',
      ja: '同一仕様を Lakeflow Spark Declarative Pipelines（旧 DLT）でも完全実装しました。SQL で STREAM read_files・EXPECT・AUTO CDC・マテリアライズドビューを記述し、sellers_scd2.py で日次スナップショットを順番に SCD2 処理します。5%ゲートのためにパイプラインを2回リフレッシュし、最後に reconcile.py が16テーブルを EXCEPT ALL で突合します。',
      en: 'The entire spec is also written in Lakeflow Spark Declarative Pipelines: SQL handles STREAM read_files, EXPECT rules, AUTO CDC ... SEQUENCE BY, and Materialized Views, while sellers_scd2.py replays daily snapshots in order for SCD2. Two refreshes enforce the 5% gate, and reconcile.py compares 16 tables row-by-row via EXCEPT ALL.',
    },
    whyItMatters: {
      zh: '对比两种范式让你真正理解什么时候该用声明式（代码减半、平台自动管依赖和增量刷新），什么时候需要命令式（复杂控制流、本地单元测试），以及跨实现对照测试如何抓出隐蔽 Bug。',
      ja: '2つのパラダイムを比較することで、宣言型（コード半減・依存管理自動化）と命令型（柔軟な制御・ローカル単体テスト）の使い分けと、対照テストの威力を体得できます。',
      en: 'Comparing both paradigms teaches when declarative wins (half the code, managed orchestration/MVs) vs imperative (local unit tests, custom control flow), and how cross-implementation reconciliation catches subtle bugs.',
    },
    keyTakeaways: [
      {
        zh: '代码量对比：命令式 Python 约 1,070 行，声明式 SQL + Python 约 550 行（减少近一半）。',
        ja: 'コード量：命令型 Python 約 1,070 行 vs 宣言型 SQL + Python 約 550 行。',
        en: 'Code volume: ~1,070 LOC imperative Python vs ~550 LOC declarative SQL + Python.',
      },
      {
        zh: '对账抓出的真实 Bug：当一次批处理同时读取多天文件时，按读取时间排序快照会导致卖家地址版本倒退（ADR-0012 / ADR-0013）。',
        ja: '突き合わせで発覚した実バグ：複数日分のファイルを一度に読むと、取り込み順でのスナップショット処理でセラー住所が先祖返りする問題を発見。',
        en: 'Real bugs caught by reconciliation: multi-day catch-up runs regressed seller addresses when ordered by read time instead of batch_date (ADR-0012/0013).',
      },
    ],
    codeBlock: {
      title: {
        zh: 'Lakeflow 声明式 CDC 与 Expect 规则 (lakeflow/olist_sdp.sql)',
        ja: 'Lakeflow 宣言型 CDC と Expect ルール (lakeflow/olist_sdp.sql)',
        en: 'Lakeflow Declarative CDC & Expectations (lakeflow/olist_sdp.sql)',
      },
      filePath: 'lakeflow/olist_sdp.sql',
      language: 'sql',
      code: `CREATE OR REFRESH STREAMING TABLE checked_orders_cdc (
  CONSTRAINT delivered_before_purchase EXPECT (NOT array_contains(_failed_rules, 'delivered_before_purchase')),
  CONSTRAINT change_before_purchase    EXPECT (NOT array_contains(_failed_rules, 'change_before_purchase'))
) AS SELECT ... FROM STREAM bronze_orders_cdc;

-- 只前进的 CDC 只需声明 SEQUENCE BY change_seq：
CREATE FLOW orders_cdc_flow AS
AUTO CDC INTO silver_orders
FROM STREAM valid_orders_cdc
KEYS (order_id)
SEQUENCE BY change_seq;`,
      highlights: [
        {
          zh: '声明式只需声明 SEQUENCE BY change_seq，平台自动完成去重和只前进更新',
          ja: '宣言型では SEQUENCE BY change_seq を書くだけでプラットフォームが重複排除と前進更新を自動実行します',
          en: 'Declarative AUTO CDC handles dedup and forward-only ordering via a single SEQUENCE BY change_seq clause',
        },
      ],
    },
    tryItYourself: {
      command: 'uv run python notebooks/walkthrough/10_lakeflow_comparison.py',
      prompt: {
        zh: '切换到“命令式 vs Lakeflow”标签页，逐项对比 7 个模块在两种范式下的具体代码差异！',
        ja: '「命令型 vs Lakeflow」タブを開き、7つの観点での具体的なコードの違いを比較しましょう！',
        en: 'Open the "Imperative vs Lakeflow" tab to compare all 7 engineering dimensions side by side!',
      },
    },
    interviewPitch: {
      zh: '“我用 PySpark 手写命令式和 Lakeflow 声明式把管道完整实现了一遍。声明式代码量减少了一半，AUTO CDC 和物化视图极大简化了样板代码；但命令式方便在本地跑 71 个 pytest。两者每天通过 16 张表的 EXCEPT ALL 对账保持零差异，还帮我抓出了多日补跑时的快照排序 Bug。”',
      ja: '「PySpark の命令型と Lakeflow 宣言型の両方でパイプラインを実装しました。宣言型はコード量が半減し AUTO CDC や MV が強力ですが、命令型はローカルで71個の単体テストを回せる強みがあります。毎日16テーブルを EXCEPT ALL で突き合わせることで、複数日リプレイ時のスナップショット順序バグも発見できました。」',
      en: '"I built both imperative PySpark and declarative Lakeflow SDP versions. Lakeflow cuts code in half with AUTO CDC and Materialized Views, while imperative enables 71 fast local pytest tests. Daily 16-table EXCEPT ALL reconciliation guarantees parity and caught real multi-day ordering bugs."',
    },
    quiz: [
      {
        question: {
          zh: '在 Lakeflow SQL 中，为了不把质量规则条件写两遍（一次在 _failed_rules，一次在 EXPECT），项目采用了什么技巧？',
          ja: 'Lakeflow SQL で品質ルールを二重定義（_failed_rules と EXPECT）しないために採用した工夫は？',
          en: 'How does lakeflow/olist_sdp.sql avoid duplicating quality rule logic between _failed_rules and EXPECT?',
        },
        options: [
          {
            zh: '只在 SELECT 中计算一次 _failed_rules 数组，EXPECT 约束只按规则名检查 NOT array_contains(_failed_rules, name)',
            ja: 'SELECT 内で _failed_rules 配列を一度だけ計算し、EXPECT は配列にルール名が含まれないことだけを参照する',
            en: 'Compute _failed_rules once in SELECT and have each EXPECT constraint reference NOT array_contains(_failed_rules, rule_name)',
          },
          {
            zh: '完全不使用 EXPECT 约束',
            ja: 'EXPECT 制約を一切使わない',
            en: 'It skips EXPECT constraints completely',
          },
        ],
        correctIndex: 0,
        explanation: {
          zh: '这样既能让 Lakeflow 事件日志精确统计每条规则的失败次数，又避免了逻辑重复导致的口径漂移。',
          ja: 'これによりイベントログでルール別の違反件数を自動集計しつつ、ロジックの二重管理を防いでいます。',
          en: 'This lets the Lakeflow event log count every rule accurately with a single source of truth for rule logic.',
        },
      },
    ],
  },
];
