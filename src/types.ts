export type Lang = 'zh' | 'ja' | 'en';

export type Trilingual = {
  zh: string;
  ja: string;
  en: string;
};

export type PhaseId = 'ingestion' | 'silver' | 'gold' | 'scale';

export interface QuizQuestion {
  question: Trilingual;
  options: Trilingual[];
  correctIndex: number;
  explanation: Trilingual;
}

export interface CodeBlock {
  title: Trilingual;
  filePath: string;
  language: 'python' | 'sql' | 'bash';
  code: string;
  highlights: Trilingual[];
}

export interface LearningModule {
  id: string;
  number: string;
  phase: PhaseId;
  title: Trilingual;
  subtitle: Trilingual;
  notebookPath: string;
  sourceFiles: string[];
  adrs: string[];
  badges?: ('interviewHot' | 'core' | 'declarative')[];
  pipelineStage: 'landing' | 'bronze' | 'silver' | 'scd2' | 'gate' | 'gold' | 'lakeflow';
  overview: Trilingual;
  whyItMatters: Trilingual;
  keyTakeaways: Trilingual[];
  codeBlock: CodeBlock;
  tryItYourself: {
    command: string;
    prompt: Trilingual;
  };
  interviewPitch: Trilingual;
  quiz: QuizQuestion[];
}

export interface ComparisonDimension {
  id: string;
  title: Trilingual;
  summary: Trilingual;
  imperative: {
    file: string;
    approach: Trilingual;
    code: string;
    pros: Trilingual;
  };
  declarative: {
    file: string;
    approach: Trilingual;
    code: string;
    pros: Trilingual;
  };
}

export interface ADRItem {
  id: string;
  title: Trilingual;
  category: 'ingestion' | 'silver' | 'gold' | 'architecture';
  problem: Trilingual;
  decision: Trilingual;
  tradeoff: Trilingual;
  file: string;
}

export type SqlCategory = 'bronze' | 'quality' | 'silver' | 'gold' | 'dashboard';

export interface SqlSnippet {
  id: string;
  category: SqlCategory;
  title: Trilingual;
  sourceFile: string;
  lineRange: string;
  description: Trilingual;
  idioms: Trilingual[];
  sql: string;
}

