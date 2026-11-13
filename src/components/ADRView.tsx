import React, { useState } from 'react';
import { Scale, CheckSquare, Square } from 'lucide-react';
import { Lang, Trilingual } from '../types';
import { UI_TEXT } from '../data/i18n';
import { ADRS } from '../data/adrs';

interface Props {
  lang: Lang;
  checkedSkills: string[];
  onToggleSkill: (id: string) => void;
}

const INTERVIEW_SKILLS: { id: string; label: Trilingual }[] = [
  {
    id: 'idempotent-dedup',
    label: {
      zh: '能讲清 Auto Loader checkpoint + 批内 row_number + 跨批 insert-only MERGE 三层幂等',
      ja: 'Auto Loader + バッチ内 row_number + INSERTのみ MERGE の3段冪等性を説明できる',
      en: 'Explain 3-layer idempotency: Auto Loader + row_number() + insert-only MERGE',
    },
  },
  {
    id: 'forward-cdc',
    label: {
      zh: '能解释为什么用 s.change_seq > t.change_seq 而不是到达时间来防 CDC 乱序回退',
      ja: '到着時刻ではなく s.change_seq > t.change_seq で CDC 後退を防ぐ理由を説明できる',
      en: 'Explain why s.change_seq > t.change_seq beats arrival-time for out-of-order CDC',
    },
  },
  {
    id: 'scd2-merge',
    label: {
      zh: '能手写出单次原子 MERGE 实现 SCD2 的双行 NULL merge_key 技巧及 1900-01-01 起点',
      ja: 'NULL merge_key を使った1回 MERGE による SCD2 と 1900-01-01 開始の設計を説明できる',
      en: 'Explain the NULL merge_key two-row single-MERGE SCD2 trick & 1900-01-01 anchor',
    },
  },
  {
    id: 'dq-gate',
    label: {
      zh: '能说明隔离区 + 指标 + 5% 闸门如何兼顾“小错不停机”与“大故障不污染 Gold”',
      ja: '隔離・メトリクス・5% ゲートで小規模エラーの継続と大規模汚染の遮断を両立できる',
      en: 'Explain how quarantine + metrics + 5% gate balances resilience and safety',
    },
  },
  {
    id: 'kimball-3',
    label: {
      zh: '能区分 Kimball 三种事实表（事务、累积快照、周期快照）在 Olist 中的落地表名与粒度',
      ja: 'Kimball の3種ファクト（明細・累積・定期スナップショット）の粒度と使い分けを説明できる',
      en: 'Distinguish all 3 Kimball fact types (transaction, accumulating, periodic) in Olist',
    },
  },
  {
    id: 'cdf-watermark',
    label: {
      zh: '能解释为什么 Delta CDF 的水位线必须严格在 Gold MERGE 成功后才推进',
      ja: 'Delta CDF のウォーターマークを Gold MERGE 成功後にのみ進める理由を説明できる',
      en: 'Explain why Delta CDF watermarks must advance strictly post-MERGE commit',
    },
  },
];

export const ADRView: React.FC<Props> = ({ lang, checkedSkills, onToggleSkill }) => {
  const [filter, setFilter] = useState<'all' | 'ingestion' | 'silver' | 'gold' | 'architecture'>('all');
  const t = UI_TEXT[lang];

  const filtered = filter === 'all' ? ADRS : ADRS.filter((a) => a.category === filter);

  return (
    <div className="space-y-6">
      {/* Header & Filter */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900/80 p-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Scale className="w-5 h-5 text-lava-500" />
          {t.adrs.title}
        </h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{t.adrs.subtitle}</p>

        <div className="flex flex-wrap gap-2 mt-4">
          {(['all', 'ingestion', 'silver', 'gold', 'architecture'] as const).map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setFilter(cat)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium capitalize border transition-all ${
                filter === cat
                  ? 'border-lava-500 bg-lava-500 text-white'
                  : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-navy-950 text-slate-700 dark:text-slate-300'
              }`}
            >
              {cat === 'all' ? t.adrs.all : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Interview Checklist */}
      <div className="rounded-xl border border-indigo-500/25 bg-indigo-500/5 dark:bg-indigo-500/10 p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold text-indigo-700 dark:text-indigo-300">
            {t.adrs.checklistTitle}
          </h3>
          <span className="font-mono text-xs text-indigo-600 dark:text-indigo-400">
            {checkedSkills.length} / {INTERVIEW_SKILLS.length}
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
          {INTERVIEW_SKILLS.map((sk) => {
            const done = checkedSkills.includes(sk.id);
            return (
              <button
                key={sk.id}
                type="button"
                onClick={() => onToggleSkill(sk.id)}
                className={`flex items-start gap-2.5 rounded-lg border p-3 text-left text-xs transition-all ${
                  done
                    ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-800 dark:text-emerald-200'
                    : 'border-slate-200 dark:border-slate-800 bg-white/70 dark:bg-navy-950/60 text-slate-700 dark:text-slate-300'
                }`}
              >
                {done ? (
                  <CheckSquare className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                ) : (
                  <Square className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                )}
                <span>{sk.label[lang]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ADR Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.map((adr) => (
          <div
            key={adr.id}
            className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900/70 p-5 space-y-3 flex flex-col"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-xs font-bold text-lava-500 bg-lava-500/10 px-2 py-0.5 rounded">
                {adr.id}
              </span>
              <span className="font-mono text-[11px] text-slate-400 truncate">{adr.file}</span>
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">{adr.title[lang]}</h3>
            <div className="space-y-2 text-xs leading-relaxed flex-1">
              <p className="text-slate-600 dark:text-slate-400">
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {t.adrs.problem}:{' '}
                </span>
                {adr.problem[lang]}
              </p>
              <p className="text-slate-600 dark:text-slate-400">
                <span className="font-semibold text-emerald-700 dark:text-emerald-400">
                  {t.adrs.decision}:{' '}
                </span>
                {adr.decision[lang]}
              </p>
              <p className="text-slate-500 dark:text-slate-400">
                <span className="font-semibold text-amber-700 dark:text-amber-400">
                  {t.adrs.tradeoff}:{' '}
                </span>
                {adr.tradeoff[lang]}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
