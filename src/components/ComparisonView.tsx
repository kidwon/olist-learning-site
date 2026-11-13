import React, { useState } from 'react';
import { GitCompare, Code2, Sparkles, Bug } from 'lucide-react';
import { Lang } from '../types';
import { UI_TEXT } from '../data/i18n';
import { COMPARISON_DIMENSIONS, RECONCILE_BUGS } from '../data/comparisons';
import { CodeHighlight } from './CodeHighlight';

interface Props {
  lang: Lang;
}

export const ComparisonView: React.FC<Props> = ({ lang }) => {
  const [activeDim, setActiveDim] = useState(COMPARISON_DIMENSIONS[0].id);
  const t = UI_TEXT[lang];
  const dim = COMPARISON_DIMENSIONS.find((d) => d.id === activeDim) ?? COMPARISON_DIMENSIONS[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900/80 p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <GitCompare className="w-5 h-5 text-lava-500" />
              {t.compare.title}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{t.compare.subtitle}</p>
          </div>
          <div className="flex items-center gap-3 font-mono text-xs">
            <span className="rounded-lg bg-slate-100 dark:bg-navy-950 px-3 py-1.5 text-slate-700 dark:text-slate-300">
              Python: ~1,070 LOC
            </span>
            <span className="rounded-lg bg-lava-500/15 px-3 py-1.5 text-lava-600 dark:text-lava-400 font-semibold">
              Lakeflow: ~550 LOC
            </span>
          </div>
        </div>

        {/* Topic Selector */}
        <div className="flex flex-wrap gap-2 mt-5">
          {COMPARISON_DIMENSIONS.map((d) => (
            <button
              key={d.id}
              type="button"
              onClick={() => setActiveDim(d.id)}
              className={`rounded-lg px-3 py-2 text-xs font-medium transition-all border ${
                d.id === dim.id
                  ? 'border-lava-500 bg-lava-500 text-white shadow-sm'
                  : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-navy-950 text-slate-700 dark:text-slate-300 hover:border-slate-400'
              }`}
            >
              {d.title[lang]}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Banner */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900/70 px-5 py-3.5 text-sm text-slate-700 dark:text-slate-300">
        {dim.summary[lang]}
      </div>

      {/* Side-by-Side Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Imperative */}
        <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900/70 overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-navy-950 flex items-center justify-between">
            <span className="inline-flex items-center gap-2 text-xs font-bold text-sky-600 dark:text-sky-400">
              <Code2 className="w-4 h-4" />
              {t.compare.imperativeLabel}
            </span>
            <span className="font-mono text-[11px] text-slate-500">{dim.imperative.file}</span>
          </div>
          <div className="p-4 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
            {dim.imperative.approach[lang]}
          </div>
          <div className="mx-4 rounded-lg overflow-hidden flex-1 bg-slate-950">
            <CodeHighlight code={dim.imperative.code} language="python" />
          </div>
          <div className="p-4 text-xs text-emerald-700 dark:text-emerald-400">
            ✓ {dim.imperative.pros[lang]}
          </div>
        </div>

        {/* Declarative */}
        <div className="rounded-xl border border-lava-500/30 bg-white dark:bg-navy-900/70 overflow-hidden flex flex-col">
          <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 bg-lava-500/5 flex items-center justify-between">
            <span className="inline-flex items-center gap-2 text-xs font-bold text-lava-600 dark:text-lava-400">
              <Sparkles className="w-4 h-4" />
              {t.compare.declarativeLabel}
            </span>
            <span className="font-mono text-[11px] text-slate-500">{dim.declarative.file}</span>
          </div>
          <div className="p-4 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
            {dim.declarative.approach[lang]}
          </div>
          <div className="mx-4 rounded-lg overflow-hidden flex-1 bg-slate-950">
            <CodeHighlight code={dim.declarative.code} language={dim.id === 'scd2' ? 'python' : 'sql'} />
          </div>
          <div className="p-4 text-xs text-emerald-700 dark:text-emerald-400">
            ✓ {dim.declarative.pros[lang]}
          </div>
        </div>
      </div>

      {/* Real Bugs Caught by Daily Reconciliation */}
      <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 dark:bg-amber-500/10 p-5 space-y-4">
        <div className="flex items-center gap-2 text-sm font-bold text-amber-800 dark:text-amber-300">
          <Bug className="w-4 h-4" />
          {t.compare.reconcileTitle}
        </div>
        <p className="text-xs text-slate-700 dark:text-slate-300">{t.compare.reconcileDesc}</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {RECONCILE_BUGS.map((bug, i) => (
            <div
              key={i}
              className="rounded-lg border border-amber-500/20 bg-white/80 dark:bg-navy-950/70 p-4 space-y-1.5"
            >
              <div className="text-xs font-semibold text-slate-900 dark:text-white">
                {bug.title[lang]}
              </div>
              <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                {bug.detail[lang]}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
