import { Lang } from '../types';

export const UI_TEXT: Record<
  Lang,
  {
    brandTitle: string;
    brandSub: string;
    tabs: {
      roadmap: string;
      simulator: string;
      compare: string;
      sql: string;
      adrs: string;
    };
    progress: string;
    completed: string;
    markComplete: string;
    completedBtn: string;
    phases: {
      ingestion: string;
      silver: string;
      gold: string;
      scale: string;
    };
    badges: {
      interviewHot: string;
      core: string;
      declarative: string;
    };
    sections: {
      overview: string;
      whyItMatters: string;
      keyTakeaways: string;
      codeWalkthrough: string;
      tryItYourself: string;
      interviewPitch: string;
      quiz: string;
    };
    prevModule: string;
    nextModule: string;
    quizCheck: string;
    quizCorrect: string;
    quizWrong: string;
    sim: {
      title: string;
      subtitle: string;
      presets: string;
      customAnomalies: string;
      runBatch: string;
      reset: string;
      gatePass: string;
      gateBlocked: string;
      badRate: string;
      threshold: string;
    };
    compare: {
      title: string;
      subtitle: string;
      imperativeLabel: string;
      declarativeLabel: string;
      reconcileTitle: string;
      reconcileDesc: string;
    };
    adrs: {
      title: string;
      subtitle: string;
      all: string;
      problem: string;
      decision: string;
      tradeoff: string;
      checklistTitle: string;
    };
  }
> = {
  zh: {
    brandTitle: 'Olist Lakehouse Academy',
    brandSub: 'Databricks 数据工程实战指南',
    tabs: {
      roadmap: '闯关路线图',
      simulator: '数据流模拟器',
      compare: '命令式 vs Lakeflow',
      sql: 'SQL 实战手册',
      adrs: 'ADR 与面试准备',
    },
    progress: '学习进度',
    completed: '已完成',
    markComplete: '标记本节已完成',
    completedBtn: '已完成本节',
    phases: {
      ingestion: '第一阶段：摄取与契约',
      silver: '第二阶段：Silver 清洗与质量',
      gold: '第三阶段：Gold 星型建模',
      scale: '第四阶段：增量与双实现',
    },
    badges: {
      interviewHot: '面试高频',
      core: '核心',
      declarative: '声明式',
    },
    sections: {
      overview: '核心概念',
      whyItMatters: '为什么生产环境需要它',
      keyTakeaways: '关键工程要点',
      codeWalkthrough: '生产代码解析',
      tryItYourself: '动手实验（本地 / Databricks）',
      interviewPitch: '面试 30 秒话术',
      quiz: '随堂测验',
    },
    prevModule: '上一节',
    nextModule: '下一节',
    quizCheck: '点击选项立即验证',
    quizCorrect: '回答正确！',
    quizWrong: '再想想，看看解析：',
    sim: {
      title: 'Medallion 数据流与质量闸门模拟器',
      subtitle: '点击注入真实生产异常，观察数据如何流经 Landing → Bronze → Silver → Ops → DQ Gate → Gold',
      presets: '预设场景',
      customAnomalies: '自定义注入异常',
      runBatch: '运行今日批次',
      reset: '重置状态',
      gatePass: '闸门通过 (PASS) — Gold 已发布',
      gateBlocked: '闸门拦截 (BLOCKED) — 坏行 > 5%，Gold 停止发布',
      badRate: '本批坏行率',
      threshold: '阈值 ≤ 5.0%',
    },
    compare: {
      title: '命令式 (PySpark + MERGE) vs 声明式 (Lakeflow SDP)',
      subtitle: '同一套规格在项目中实现了两遍，每日由 16 张表逐行对账验证一致（ADR-0013）',
      imperativeLabel: '命令式实现 (src/olist_pipeline/)',
      declarativeLabel: '声明式实现 (lakeflow/)',
      reconcileTitle: '每日对账抓出的 2 个真实 Bug',
      reconcileDesc: '声明式管道无法在本地运行，因此用每日 16 张表 `EXCEPT ALL` 对账作为测试；对账反过来暴露了手写版本中的两个隐蔽缺陷：',
    },
    adrs: {
      title: '13 篇架构决策记录 (ADR) 与面试自检',
      subtitle: '理解每个技术选型背后的权衡取舍，是初中级向高级数据工程师进阶的关键',
      all: '全部',
      problem: '工程问题',
      decision: '设计决策',
      tradeoff: '权衡与代价',
      checklistTitle: '数据工程面试高频自检清单',
    },
  },
  ja: {
    brandTitle: 'Olist Lakehouse Academy',
    brandSub: 'Databricks データエンジニアリング実践ガイド',
    tabs: {
      roadmap: '学習ロードマップ',
      simulator: 'パイプラインシミュレータ',
      compare: '命令型 vs Lakeflow',
      sql: 'SQL プレイブック',
      adrs: 'ADR・面接対策',
    },
    progress: '学習進捗',
    completed: '完了',
    markComplete: 'この章を完了にする',
    completedBtn: '完了済み',
    phases: {
      ingestion: 'Phase 1: 取り込みとデータ契約',
      silver: 'Phase 2: Silver クレンジングと品質',
      gold: 'Phase 3: Gold スタースキーマ',
      scale: 'Phase 4: 増分処理と二重実装',
    },
    badges: {
      interviewHot: '面接頻出',
      core: 'コア',
      declarative: '宣言型',
    },
    sections: {
      overview: '概要',
      whyItMatters: 'なぜ本番環境で重要なのか',
      keyTakeaways: '重要なエンジニアリングポイント',
      codeWalkthrough: '本番コード解説',
      tryItYourself: 'ハンズオン（ローカル / Databricks）',
      interviewPitch: '面接での 30 秒説明',
      quiz: '理解度チェック',
    },
    prevModule: '前の章',
    nextModule: '次の章',
    quizCheck: '選択肢をクリックして確認',
    quizCorrect: '正解です！',
    quizWrong: '惜しい！解説を確認しましょう：',
    sim: {
      title: 'Medallion データフロー & 品質ゲートシミュレータ',
      subtitle: '本番で起きる異常を注入し、Landing → Bronze → Silver → Ops → DQ Gate → Gold の挙動を可視化します',
      presets: 'シナリオプリセット',
      customAnomalies: '異常データのカスタム注入',
      runBatch: '日次バッチを実行',
      reset: 'リセット',
      gatePass: 'ゲート通過 (PASS) — Gold 公開済み',
      gateBlocked: 'ゲート停止 (BLOCKED) — 不正行 > 5% のため Gold 停止',
      badRate: '今回の不正行率',
      threshold: '閾値 ≤ 5.0%',
    },
    compare: {
      title: '命令型 (PySpark + MERGE) vs 宣言型 (Lakeflow SDP)',
      subtitle: '同一仕様を2通りで実装し、毎日16テーブルを行単位で突き合わせ検証（ADR-0013）',
      imperativeLabel: '命令型実装 (src/olist_pipeline/)',
      declarativeLabel: '宣言型実装 (lakeflow/)',
      reconcileTitle: '日次突き合わせで発見された 2 つの実バグ',
      reconcileDesc: '宣言型パイプラインはローカル実行できないため、16テーブルの `EXCEPT ALL` 突き合わせがテストになります。これにより手書き版の2つのバグが判明しました：',
    },
    adrs: {
      title: '13 のアーキテクチャ決定記録 (ADR) と面接対策',
      subtitle: '各設計判断の背景とトレードオフを理解することが、実務レベルへの鍵になります',
      all: 'すべて',
      problem: '課題',
      decision: '決定',
      tradeoff: 'トレードオフ',
      checklistTitle: 'データエンジニア面接チェックリスト',
    },
  },
  en: {
    brandTitle: 'Olist Lakehouse Academy',
    brandSub: 'Databricks Data Engineering Interactive Guide',
    tabs: {
      roadmap: 'Learning Roadmap',
      simulator: 'Pipeline Simulator',
      compare: 'Imperative vs Lakeflow',
      sql: 'SQL Playbook',
      adrs: 'ADRs & Interview Prep',
    },
    progress: 'Progress',
    completed: 'Completed',
    markComplete: 'Mark Module Complete',
    completedBtn: 'Module Completed',
    phases: {
      ingestion: 'Phase 1: Ingestion & Contracts',
      silver: 'Phase 2: Silver & Data Quality',
      gold: 'Phase 3: Gold Dimensional Modeling',
      scale: 'Phase 4: Incremental & Dual Impl',
    },
    badges: {
      interviewHot: 'Interview Hot',
      core: 'Core',
      declarative: 'Declarative',
    },
    sections: {
      overview: 'Core Concept',
      whyItMatters: 'Why It Matters in Production',
      keyTakeaways: 'Key Engineering Takeaways',
      codeWalkthrough: 'Production Code Walkthrough',
      tryItYourself: 'Try It Yourself (Local / Databricks)',
      interviewPitch: 'In the Interview (30s Pitch)',
      quiz: 'Knowledge Check',
    },
    prevModule: 'Previous',
    nextModule: 'Next',
    quizCheck: 'Select an option to check immediately',
    quizCorrect: 'Correct!',
    quizWrong: 'Not quite — see explanation:',
    sim: {
      title: 'Medallion Data Flow & DQ Gate Simulator',
      subtitle: 'Inject real-world anomalies and watch how rows flow through Landing → Bronze → Silver → Ops → DQ Gate → Gold',
      presets: 'Scenario Presets',
      customAnomalies: 'Custom Anomaly Injection',
      runBatch: 'Run Daily Batch',
      reset: 'Reset',
      gatePass: 'GATE PASSED — Gold Published',
      gateBlocked: 'GATE BLOCKED — Bad Rate > 5%, Gold Halted',
      badRate: 'Batch Bad Rate',
      threshold: 'Threshold ≤ 5.0%',
    },
    compare: {
      title: 'Imperative (PySpark + MERGE) vs Declarative (Lakeflow SDP)',
      subtitle: 'The full spec is implemented twice and reconciled row-by-row across 16 tables daily (ADR-0013)',
      imperativeLabel: 'Imperative (src/olist_pipeline/)',
      declarativeLabel: 'Declarative (lakeflow/)',
      reconcileTitle: '2 Real Bugs Caught by Daily Reconciliation',
      reconcileDesc: 'Because Lakeflow SDP cannot run on a laptop, daily `EXCEPT ALL` reconciliation across 16 tables acts as its test—and exposed two real bugs in the hand-written version:',
    },
    adrs: {
      title: '13 Architecture Decision Records (ADRs) & Interview Prep',
      subtitle: 'Mastering the trade-offs behind each design choice bridges the gap from junior to senior data engineer',
      all: 'All',
      problem: 'Problem',
      decision: 'Decision',
      tradeoff: 'Trade-offs',
      checklistTitle: 'Data Engineering Interview Readiness Checklist',
    },
  },
};
