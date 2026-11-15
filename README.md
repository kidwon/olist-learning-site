# Olist Lakehouse Academy (`olist-learning-site`)

一个面向 **Databricks 数据工程实战** 的交互式学习平台，作为 [olist-lakehouse-pipeline](https://github.com/kidwon/olist-lakehouse-pipeline) 工程的配套可视化教程与代码导览站点。支持 **中文 / 日本語 / English** 三语切换与明暗主题，覆盖从 Medallion 架构（Bronze → Silver → Gold）到 Lakeflow Spark Declarative Pipelines（SDP）的完整数据工程链路。

---

## 核心功能

站点包含 5 个核心交互视图：

1. **闯关路线图（Roadmap）**
   - 涵盖 `00-overview` 至 `10-lakeflow` 共 **11 个学习模块**，划分为 4 个阶段：`ingestion`（接入与回放）、`silver`（清洗、去重与 SCD2）、`gold`（星型模型与指标聚合）、`scale`（增量合并与 Lakeflow 声明式演进）。
   - 内置交互式 **Medallion 架构流转图**、核心代码导览、动手实践命令、面试表达要点（Interview Pitch）及随堂测验（Quiz）。
   - 支持本地学习进度与技能清单持久化（`localStorage`），并可通过右侧 **源码抽屉（SourceDrawer）** 直接浏览同步自上游仓库的真实工程文件。

2. **数据流模拟器（Pipeline Simulator）**
   - 内置 6 种预设场景：**干净批次**、**重复投递（批内 + 跨天）**、**CDC 乱序到达**、**Schema 漂移**、**卖家迁址（SCD2）**、**投毒批次（>5% 触发 Quality Gate 熔断）**。
   - 支持自由勾选异常注入项，直观观察数据在 Bronze、Silver Dedup/CDC、Quarantine 隔离表、Quality Gate 闸门及 Gold 层的流转与拦截状态。

3. **范式对比（Imperative vs. Declarative）**
   - 从 **数据接入**、**去重与 CDC**、**SCD2 缓慢变化维**、**数据质量闸门**、**Gold 增量计算** 5 个维度，对比传统命令式 PySpark 实现与 Lakeflow 声明式 SQL/Python 实现的差异与权衡。

4. **SQL 实战手册（SQL Playbook）**
   - 收录 7 组来自工程源码的 SQL 模板（SDP Bronze/Silver/Gate/Gold 以及仪表盘 DQ/业务查询），附带源码行号定位与关键语法解析。

5. **架构决策与复盘（ADRs）**
   - 整理 `ADR-0001` 至 `ADR-0013` 共 **13 份架构决策记录**，按 Problem / Decision / Trade-off 结构拆解工程中的关键取舍。

---

## 技术栈

- **前端框架**：React 18 + TypeScript 5.6
- **构建工具**：Vite 6（`base: './'`，支持 GitHub Pages 静态部署）
- **样式方案**：Tailwind CSS 3.4（支持 `class` 模式暗黑主题，自定义 `lava` / `navy` 配色与 `Inter` / `JetBrains Mono` 字体）
- **图标库**：`lucide-react`

---

## 目录结构

```text
olist-learning-site/
├── .github/workflows/
│   └── deploy.yml              # GitHub Pages 自动构建与每日定时同步部署
├── scripts/
│   └── sync-sources.mjs        # 从上游 pipeline 仓库同步源码至 generatedSources.json
├── src/
│   ├── components/
│   │   ├── ADRView.tsx         # 架构决策记录与技能清单视图
│   │   ├── CodeHighlight.tsx   # 代码高亮组件
│   │   ├── ComparisonView.tsx  # 命令式 vs 声明式对比视图
│   │   ├── MedallionDiagram.tsx# Medallion 架构交互图
│   │   ├── PipelineSimulator.tsx # 数据流与异常注入模拟器
│   │   ├── RoadmapView.tsx     # 11 模块闯关路线图
│   │   ├── SourceDrawer.tsx    # 上游工程源码侧边抽屉
│   │   └── SqlExplorerView.tsx # SQL 实战手册视图
│   ├── data/
│   │   ├── adrs.ts             # 13 份 ADR 数据
│   │   ├── comparisons.ts      # 5 组范式对比数据
│   │   ├── generatedSources.json # 同步生成的 29 个上游源码文件快照
│   │   ├── i18n.ts             # 中 / 日 / 英三语 UI 文案
│   │   ├── modules.ts          # 11 个学习模块内容与测验题
│   │   └── sqlPlaybook.ts      # 7 组 SQL 实战片段
│   ├── App.tsx                 # 主应用与导航、主题/语言/进度状态管理
│   ├── main.tsx
│   ├── index.css
│   └── types.ts                # 核心 TypeScript 类型定义
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

---

## 本地开发与构建

### 1. 安装依赖

```bash
npm install
```

### 2. 同步上游源码（可选）

`predev` 与 `prebuild` 钩子会自动执行 `node scripts/sync-sources.mjs`：
- 默认查找同级目录下的 `../olist-lakehouse-pipeline`（可通过环境变量 `OLIST_REPO_DIR` 指定路径）。
- 同步目标包括 `src/olist_pipeline/`、`lakeflow/`、`notebooks/walkthrough/` 下的 `.py`/`.sql` 文件，以及 `docs/dashboard_queries.sql` 和 `resources/olist_jobs.yml`。
- 若本地不存在上游仓库目录，脚本会自动保留仓库中已有的 `src/data/generatedSources.json`，不影响正常开发与构建。

手动指定上游仓库路径同步示例：

```bash
OLIST_REPO_DIR=/path/to/olist-lakehouse-pipeline npm run sync-sources
```

### 3. 启动本地开发服务器

```bash
npm run dev
```

### 4. 类型检查与生产构建

```bash
npm run build
npm run preview
```

---

## 自动部署（GitHub Actions）

项目通过 [.github/workflows/deploy.yml](.github/workflows/deploy.yml) 自动部署到 **GitHub Pages**，触发条件包括：
- 推送到 `main` 分支
- 手动触发（`workflow_dispatch`）
- 每日定时任务（`0 3 * * *` UTC），自动拉取最新的 `kidwon/olist-lakehouse-pipeline` 源码重新生成 `generatedSources.json` 并发布站点。

