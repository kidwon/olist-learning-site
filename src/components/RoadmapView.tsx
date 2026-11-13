import React, { useState } from 'react';
import {
  CheckCircle2,
  Circle,
  Copy,
  Check,
  Terminal,
  MessageSquareQuote,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
  FileCode2,
  Flame,
  BookOpen,
} from 'lucide-react';
import { Lang, LearningModule, PhaseId } from '../types';
import { MODULES } from '../data/modules';
import { UI_TEXT } from '../data/i18n';
import { MedallionDiagram } from './MedallionDiagram';
import { CodeHighlight } from './CodeHighlight';

interface Props {
  lang: Lang;
  completedIds: string[];
  onToggleComplete: (id: string) => void;
  onOpenSource?: (filePath: string) => void;
}

const PHASES: PhaseId[] = ['ingestion', 'silver', 'gold', 'scale'];

export const RoadmapView: React.FC<Props> = ({ lang, completedIds, onToggleComplete, onOpenSource }) => {
  const [activeId, setActiveId] = useState<string>(MODULES[0].id);
  const [copied, setCopied] = useState(false);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, number>>({});
  const t = UI_TEXT[lang];

  const activeIdx = MODULES.findIndex((m) => m.id === activeId);
  const mod: LearningModule = MODULES[activeIdx] ?? MODULES[0];
  const isCompleted = completedIds.includes(mod.id);

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Left Sidebar: 4 Phases + 11 Modules */}
      <aside className="lg:col-span-4 xl:col-span-3 space-y-5">
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900/70 p-4">
          <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
            <span>{t.progress}</span>
            <span className="font-mono font-semibold text-slate-900 dark:text-slate-100">
              {completedIds.length} / {MODULES.length}
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-slate-100 dark:bg-navy-950 overflow-hidden">
            <div
              className="h-full bg-lava-500 transition-all duration-300"
              style={{ width: `${(completedIds.length / MODULES.length) * 100}%` }}
            />
          </div>
        </div>

        <div className="space-y-4">
          {PHASES.map((phase) => {
            const items = MODULES.filter((m) => m.phase === phase);
            return (
              <div key={phase} className="space-y-1.5">
                <h3 className="px-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  {t.phases[phase]}
                </h3>
                <div className="space-y-1">
                  {items.map((item) => {
                    const done = completedIds.includes(item.id);
                    const selected = item.id === mod.id;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => setActiveId(item.id)}
                        className={`w-full flex items-start gap-2.5 rounded-lg px-3 py-2.5 text-left transition-all border ${
                          selected
                            ? 'border-lava-500/50 bg-lava-500/10 text-slate-900 dark:text-white'
                            : 'border-transparent hover:bg-slate-100 dark:hover:bg-navy-800/60 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <span className="mt-0.5 flex-shrink-0">
                          {done ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          ) : (
                            <Circle
                              className={`w-4 h-4 ${selected ? 'text-lava-500' : 'text-slate-300 dark:text-slate-600'}`}
                            />
                          )}
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-mono text-[11px] font-semibold text-lava-500">
                              {item.number}
                            </span>
                            {item.badges?.includes('interviewHot') && (
                              <span className="inline-flex items-center gap-0.5 rounded bg-amber-500/15 px-1.5 py-0.5 text-[10px] font-medium text-amber-600 dark:text-amber-400">
                                <Flame className="w-2.5 h-2.5" />
                                {t.badges.interviewHot}
                              </span>
                            )}
                          </div>
                          <p className="text-xs font-medium leading-snug mt-0.5 line-clamp-2">
                            {item.title[lang]}
                          </p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </aside>

      {/* Main Lesson Canvas */}
      <main className="lg:col-span-8 xl:col-span-9 space-y-6">
        {/* Header Card */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900/80 p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center rounded-md bg-lava-500/15 px-2.5 py-0.5 font-mono text-xs font-semibold text-lava-600 dark:text-lava-400">
                  Module {mod.number}
                </span>
                {mod.adrs.map((adr) => (
                  <span
                    key={adr}
                    className="inline-flex items-center rounded-md bg-slate-100 dark:bg-navy-800 px-2 py-0.5 font-mono text-xs text-slate-600 dark:text-slate-300"
                  >
                    {adr}
                  </span>
                ))}
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                {mod.title[lang]}
              </h2>
              <p className="text-sm text-slate-600 dark:text-slate-400">{mod.subtitle[lang]}</p>
            </div>

            <button
              type="button"
              onClick={() => onToggleComplete(mod.id)}
              className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                isCompleted
                  ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                  : 'bg-lava-500 hover:bg-lava-600 text-white shadow-sm'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              {isCompleted ? t.completedBtn : t.markComplete}
            </button>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <button
              type="button"
              onClick={() => onOpenSource?.(mod.notebookPath)}
              className="inline-flex items-center gap-1.5 font-mono bg-lava-500/10 text-lava-600 dark:text-lava-400 hover:bg-lava-500/20 px-2.5 py-1 rounded-md transition-colors"
              title="View full notebook"
            >
              <BookOpen className="w-3.5 h-3.5" />
              {mod.notebookPath}
            </button>
            {mod.sourceFiles.map((sf) => (
              <button
                key={sf}
                type="button"
                onClick={() => onOpenSource?.(sf)}
                className="inline-flex items-center gap-1 font-mono bg-slate-100 dark:bg-navy-950 hover:border-lava-500/50 border border-transparent hover:text-lava-500 px-2.5 py-1 rounded-md transition-colors"
                title="View full source"
              >
                <FileCode2 className="w-3 h-3 text-slate-400" />
                {sf}
              </button>
            ))}
          </div>
        </div>

        {/* Medallion Map */}
        <MedallionDiagram
          activeStage={mod.pipelineStage}
          lang={lang}
          onSelectStage={(targetId) => setActiveId(targetId)}
        />

        {/* Overview & Why It Matters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900/70 p-5 space-y-2">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              {t.sections.overview}
            </h3>
            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300">
              {mod.overview[lang]}
            </p>
          </div>
          <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 dark:bg-amber-500/10 p-5 space-y-2">
            <h3 className="text-sm font-semibold text-amber-700 dark:text-amber-300">
              {t.sections.whyItMatters}
            </h3>
            <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">
              {mod.whyItMatters[lang]}
            </p>
          </div>
        </div>

        {/* Key Takeaways */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900/70 p-5 space-y-3">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
            {t.sections.keyTakeaways}
          </h3>
          <ul className="space-y-2">
            {mod.keyTakeaways.map((point, i) => (
              <li key={i} className="flex items-start gap-2.5 text-sm text-slate-700 dark:text-slate-300">
                <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-lava-500 flex-shrink-0" />
                <span>{point[lang]}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Production Code Walkthrough */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900/70 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-navy-950/80">
            <div className="flex items-center gap-2">
              <FileCode2 className="w-4 h-4 text-lava-500" />
              <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                {mod.codeBlock.title[lang]}
              </span>
            </div>
            <span className="font-mono text-[11px] text-slate-500">{mod.codeBlock.filePath}</span>
          </div>
          <CodeHighlight code={mod.codeBlock.code} language={mod.codeBlock.language} />
          <div className="px-4 py-3 bg-slate-50/70 dark:bg-navy-950/40 border-t border-slate-200 dark:border-slate-800 space-y-1">
            {mod.codeBlock.highlights.map((hl, i) => (
              <p key={i} className="text-xs text-slate-600 dark:text-slate-400">
                💡 {hl[lang]}
              </p>
            ))}
          </div>
        </div>

        {/* Try It Yourself & Interview Pitch */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900/70 p-5 space-y-3">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
              <Terminal className="w-4 h-4 text-emerald-500" />
              {t.sections.tryItYourself}
            </div>
            <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-300">
              {mod.tryItYourself.prompt[lang]}
            </p>
            <div className="flex items-center justify-between gap-2 rounded-lg bg-slate-950 px-3 py-2 font-mono text-xs text-emerald-400">
              <span className="truncate">{mod.tryItYourself.command}</span>
              <button
                type="button"
                onClick={() => handleCopy(mod.tryItYourself.command)}
                className="text-slate-400 hover:text-white flex-shrink-0"
                title="Copy command"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 dark:bg-indigo-500/10 p-5 space-y-2.5">
            <div className="flex items-center gap-2 text-sm font-semibold text-indigo-700 dark:text-indigo-300">
              <MessageSquareQuote className="w-4 h-4" />
              {t.sections.interviewPitch}
            </div>
            <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300 italic">
              {mod.interviewPitch[lang]}
            </p>
          </div>
        </div>

        {/* Knowledge Check Quiz */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900/70 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900 dark:text-white">
              <HelpCircle className="w-4 h-4 text-lava-500" />
              {t.sections.quiz}
            </div>
            <span className="text-xs text-slate-400">{t.quizCheck}</span>
          </div>

          {mod.quiz.map((q, qIdx) => {
            const key = `${mod.id}-${qIdx}`;
            const chosen = quizAnswers[key];
            const answered = chosen !== undefined;
            const isRight = chosen === q.correctIndex;

            return (
              <div key={key} className="space-y-3">
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
                  {q.question[lang]}
                </p>
                <div className="space-y-2">
                  {q.options.map((opt, oIdx) => {
                    const isSelected = chosen === oIdx;
                    let cls =
                      'border-slate-200 dark:border-slate-700 hover:border-slate-400 dark:hover:border-slate-500 bg-slate-50/50 dark:bg-navy-950/40';
                    if (answered) {
                      if (oIdx === q.correctIndex) {
                        cls = 'border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300';
                      } else if (isSelected) {
                        cls = 'border-rose-500 bg-rose-500/10 text-rose-700 dark:text-rose-300';
                      }
                    }
                    return (
                      <button
                        key={oIdx}
                        type="button"
                        onClick={() => setQuizAnswers((prev) => ({ ...prev, [key]: oIdx }))}
                        className={`w-full text-left rounded-lg border px-3.5 py-2.5 text-xs transition-all ${cls}`}
                      >
                        {opt[lang]}
                      </button>
                    );
                  })}
                </div>
                {answered && (
                  <div
                    className={`rounded-lg p-3 text-xs leading-relaxed ${
                      isRight
                        ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                        : 'bg-amber-500/10 text-amber-800 dark:text-amber-300'
                    }`}
                  >
                    <span className="font-semibold">
                      {isRight ? t.quizCorrect : t.quizWrong}{' '}
                    </span>
                    {q.explanation[lang]}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Bottom Prev/Next Navigation */}
        <div className="flex items-center justify-between pt-2">
          <button
            type="button"
            disabled={activeIdx <= 0}
            onClick={() => setActiveId(MODULES[activeIdx - 1].id)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-800 px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-300 disabled:opacity-40 hover:bg-slate-100 dark:hover:bg-navy-800"
          >
            <ChevronLeft className="w-4 h-4" />
            {t.prevModule}
          </button>
          <button
            type="button"
            disabled={activeIdx >= MODULES.length - 1}
            onClick={() => setActiveId(MODULES[activeIdx + 1].id)}
            className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-3.5 py-2 text-xs font-medium disabled:opacity-40 hover:opacity-90"
          >
            {t.nextModule}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </main>
    </div>
  );
};
