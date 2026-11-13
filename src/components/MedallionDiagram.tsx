import React from 'react';
import { ArrowRight, ShieldAlert, Database, Layers, Sparkles, GitCompare } from 'lucide-react';
import { Lang } from '../types';

interface Props {
  activeStage: 'landing' | 'bronze' | 'silver' | 'scd2' | 'gate' | 'gold' | 'lakeflow';
  lang: Lang;
  onSelectStage?: (moduleId: string) => void;
}

export const MedallionDiagram: React.FC<Props> = ({ activeStage, lang, onSelectStage }) => {
  const nodes = [
    {
      stage: 'landing',
      targetId: '01-replay',
      label: 'Landing',
      sub: 'JSON / Parquet',
      icon: Database,
    },
    {
      stage: 'bronze',
      targetId: '02-bronze',
      label: 'Bronze',
      sub: 'Contracts + _raw',
      icon: Layers,
    },
    {
      stage: 'silver',
      targetId: '03-silver-cdc',
      label: 'Silver',
      sub: 'Dedup + CDC',
      icon: Layers,
    },
    {
      stage: 'scd2',
      targetId: '04-scd2',
      label: 'SCD2',
      sub: 'Seller History',
      icon: Layers,
    },
    {
      stage: 'gate',
      targetId: '05-quality-gate',
      label: 'DQ Gate',
      sub: 'bad ≤ 5%',
      icon: ShieldAlert,
    },
    {
      stage: 'gold',
      targetId: '06-gold',
      label: 'Gold',
      sub: 'Star + Marts',
      icon: Sparkles,
    },
    {
      stage: 'lakeflow',
      targetId: '10-lakeflow',
      label: 'Reconcile',
      sub: '16 Tables = 0',
      icon: GitCompare,
    },
  ] as const;

  const caption =
    lang === 'zh'
      ? '点击任意节点可快速跳转到对应章节'
      : lang === 'ja'
        ? '各ノードをクリックして該当章へジャンプ'
        : 'Click any stage to jump to its lesson';

  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900/70 p-4">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Medallion Architecture Map
        </span>
        <span className="text-xs text-slate-400 dark:text-slate-500">{caption}</span>
      </div>
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {nodes.map((node, idx) => {
          const Icon = node.icon;
          const isActive = node.stage === activeStage;
          return (
            <React.Fragment key={node.stage}>
              <button
                type="button"
                onClick={() => onSelectStage?.(node.targetId)}
                className={`flex-shrink-0 flex flex-col items-start gap-1 rounded-lg border px-3 py-2 text-left transition-all ${
                  isActive
                    ? 'border-lava-500 bg-lava-500/10 text-lava-600 dark:text-lava-400 shadow-sm ring-1 ring-lava-500/30'
                    : 'border-slate-200 dark:border-slate-700/80 bg-slate-50/60 dark:bg-navy-950/60 hover:border-slate-300 dark:hover:border-slate-600 text-slate-700 dark:text-slate-300'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-lava-500' : 'text-slate-400'}`} />
                  <span className="text-xs font-semibold">{node.label}</span>
                </div>
                <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">{node.sub}</span>
              </button>
              {idx < nodes.length - 1 && (
                <ArrowRight className="w-3.5 h-3.5 text-slate-400 dark:text-slate-600 flex-shrink-0" />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};
