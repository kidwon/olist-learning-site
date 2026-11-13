import React, { useState } from 'react';
import { Play, RotateCcw, ShieldCheck, ShieldAlert, AlertTriangle, CheckCircle2, Sparkles } from 'lucide-react';
import { Lang, Trilingual } from '../types';
import { UI_TEXT } from '../data/i18n';

interface Props {
  lang: Lang;
}

interface SimFlags {
  duplicateItem: boolean;
  outOfOrderCdc: boolean;
  negativePrice: boolean;
  tooLate5d: boolean;
  schemaDrift: boolean;
  sellerMove: boolean;
  poisonSpike: boolean;
}

const DEFAULT_FLAGS: SimFlags = {
  duplicateItem: false,
  outOfOrderCdc: false,
  negativePrice: false,
  tooLate5d: false,
  schemaDrift: false,
  sellerMove: false,
  poisonSpike: false,
};

const PRESETS: { id: string; label: Trilingual; flags: SimFlags }[] = [
  {
    id: 'clean',
    label: { zh: '干净批次 (正常天)', ja: 'クリーンバッチ (正常日)', en: 'Clean Batch' },
    flags: { ...DEFAULT_FLAGS },
  },
  {
    id: 'dedup',
    label: { zh: '重复投递 (批内+跨天)', ja: '重複再送 (バッチ内+翌日)', en: 'Duplicate & Re-delivery' },
    flags: { ...DEFAULT_FLAGS, duplicateItem: true },
  },
  {
    id: 'cdc',
    label: { zh: 'CDC 乱序到达', ja: 'CDC 順序逆転', en: 'Out-of-Order CDC' },
    flags: { ...DEFAULT_FLAGS, outOfOrderCdc: true },
  },
  {
    id: 'schema',
    label: { zh: 'Schema 漂移 (新字段)', ja: 'スキーマ変更 (新列)', en: 'Schema Drift' },
    flags: { ...DEFAULT_FLAGS, schemaDrift: true },
  },
  {
    id: 'scd2',
    label: { zh: '卖家迁址 (SCD2)', ja: 'セラー移転 (SCD2)', en: 'Seller Move (SCD2)' },
    flags: { ...DEFAULT_FLAGS, sellerMove: true },
  },
  {
    id: 'poison',
    label: { zh: '投毒批次 (>5% 触发闸门)', ja: '毒入りバッチ (>5% ゲート停止)', en: 'Poisoned Batch (>5% Gate)' },
    flags: { ...DEFAULT_FLAGS, negativePrice: true, tooLate5d: true, poisonSpike: true },
  },
];

const ANOMALY_LABELS: { key: keyof SimFlags; label: Trilingual; layer: string }[] = [
  {
    key: 'duplicateItem',
    label: { zh: '注入重复订单明细 (o1/1 × 2)', ja: '重複明細の注入 (o1/1 × 2)', en: 'Duplicate order_item (o1/1 × 2)' },
    layer: 'Silver Dedup',
  },
  {
    key: 'outOfOrderCdc',
    label: { zh: '注入乱序 CDC (shipped seq=3 晚于 delivered seq=4)', ja: '順序逆転 CDC (seq=3 が seq=4 より後)', en: 'Out-of-order CDC (seq=3 after seq=4)' },
    layer: 'Silver CDC',
  },
  {
    key: 'negativePrice',
    label: { zh: '注入负价格坏行 (price = -45.0)', ja: '負の価格の注入 (price = -45.0)', en: 'Negative price (price = -45.0)' },
    layer: 'Quarantine',
  },
  {
    key: 'tooLate5d',
    label: { zh: '注入超迟到 5 天明细 (> 3天容忍)', ja: '5日遅延データの注入 (3日許容超)', en: '5-day late item (>3d tolerance)' },
    layer: 'Quarantine',
  },
  {
    key: 'schemaDrift',
    label: { zh: '注入新字段 discount_amount', ja: '未知フィールド discount_amount', en: 'Extra field discount_amount' },
    layer: 'Bronze _rescued_data',
  },
  {
    key: 'sellerMove',
    label: { zh: '卖家 s1 从 SP 迁址至 PR', ja: 'セラー s1 が SP から PR へ移転', en: 'Seller s1 moves SP → PR' },
    layer: 'SCD2',
  },
  {
    key: 'poisonSpike',
    label: { zh: '批量异常涌入 (+12 条坏行，触发 >5% 熔断)', ja: '大量不正行 (+12行、5%ゲート発動)', en: 'Poison spike (+12 bad rows -> >5%)' },
    layer: 'DQ Gate',
  },
];

export const PipelineSimulator: React.FC<Props> = ({ lang }) => {
  const [flags, setFlags] = useState<SimFlags>({ ...DEFAULT_FLAGS, schemaDrift: true, outOfOrderCdc: true });
  const [runCount, setRunCount] = useState(1);
  const t = UI_TEXT[lang];

  const baseCleanRows = 100;
  const badRows =
    (flags.negativePrice ? 1 : 0) +
    (flags.tooLate5d ? 1 : 0) +
    (flags.poisonSpike ? 12 : 0);
  const totalEvaluated = baseCleanRows + badRows;
  const badRate = (badRows / totalEvaluated) * 100;
  const gatePassed = badRate <= 5.0;

  const toggle = (k: keyof SimFlags) => setFlags((p) => ({ ...p, [k]: !p[k] }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900/80 p-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">{t.sim.title}</h2>
        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{t.sim.subtitle}</p>

        {/* Presets */}
        <div className="mt-4">
          <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
            {t.sim.presets}
          </div>
          <div className="flex flex-wrap gap-2">
            {PRESETS.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => {
                  setFlags(p.flags);
                  setRunCount((c) => c + 1);
                }}
                className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-navy-950 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:border-lava-500 hover:text-lava-500 transition-colors"
              >
                {p.label[lang]}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Control Panel */}
        <div className="lg:col-span-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900/70 p-5 space-y-4 h-fit">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
              {t.sim.customAnomalies}
            </h3>
            <span className="font-mono text-xs text-slate-400">Run #{runCount}</span>
          </div>

          <div className="space-y-2">
            {ANOMALY_LABELS.map((item) => {
              const checked = flags[item.key];
              return (
                <label
                  key={item.key}
                  className={`flex items-start gap-3 rounded-lg border p-3 cursor-pointer transition-all ${
                    checked
                      ? 'border-lava-500/60 bg-lava-500/10'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => toggle(item.key)}
                    className="mt-0.5 accent-lava-500"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-medium text-slate-800 dark:text-slate-200">
                      {item.label[lang]}
                    </div>
                    <span className="inline-block mt-1 font-mono text-[10px] text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-navy-950 px-1.5 py-0.5 rounded">
                      → {item.layer}
                    </span>
                  </div>
                </label>
              );
            })}
          </div>

          <div className="flex gap-2 pt-2">
            <button
              type="button"
              onClick={() => setRunCount((c) => c + 1)}
              className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-lava-500 hover:bg-lava-600 text-white py-2 text-xs font-semibold shadow-sm"
            >
              <Play className="w-3.5 h-3.5" />
              {t.sim.runBatch}
            </button>
            <button
              type="button"
              onClick={() => {
                setFlags(DEFAULT_FLAGS);
                setRunCount((c) => c + 1);
              }}
              className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-navy-800"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              {t.sim.reset}
            </button>
          </div>
        </div>

        {/* Right Live Medallion Output */}
        <div className="lg:col-span-8 space-y-4">
          {/* DQ Gate Banner */}
          <div
            className={`rounded-xl border p-4 flex flex-wrap items-center justify-between gap-4 ${
              gatePassed
                ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-700 dark:text-emerald-300'
                : 'border-rose-500/50 bg-rose-500/10 text-rose-700 dark:text-rose-300'
            }`}
          >
            <div className="flex items-center gap-3">
              {gatePassed ? <ShieldCheck className="w-6 h-6" /> : <ShieldAlert className="w-6 h-6" />}
              <div>
                <div className="text-sm font-bold">
                  {gatePassed ? t.sim.gatePass : t.sim.gateBlocked}
                </div>
                <div className="text-xs opacity-90 font-mono">
                  {t.sim.badRate}: {badRows}/{totalEvaluated} = {badRate.toFixed(2)}% ({t.sim.threshold})
                </div>
              </div>
            </div>
            <div className="h-2.5 w-36 rounded-full bg-black/10 dark:bg-white/10 overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${gatePassed ? 'bg-emerald-500' : 'bg-rose-500'}`}
                style={{ width: `${Math.min(100, (badRate / 15) * 100)}%` }}
              />
            </div>
          </div>

          {/* Bronze Layer */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900/70 p-4 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                1. Bronze Layer (`olist_bronze.order_items`)
              </span>
              <span className="font-mono text-xs text-slate-400">schema: fixed contract</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead className="text-slate-400 border-b border-slate-200 dark:border-slate-800">
                  <tr>
                    <th className="py-1.5 pr-3">order_id</th>
                    <th className="py-1.5 pr-3">price</th>
                    <th className="py-1.5 pr-3">_rescued_data</th>
                    <th className="py-1.5">_raw</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
                  <tr>
                    <td className="py-1.5 pr-3">o101</td>
                    <td className="py-1.5 pr-3">129.90</td>
                    <td className="py-1.5 pr-3">
                      {flags.schemaDrift ? (
                        <span className="rounded bg-amber-500/15 text-amber-600 dark:text-amber-300 px-1.5 py-0.5">
                          {`{"discount_amount":"15.0"}`}
                        </span>
                      ) : (
                        'NULL'
                      )}
                    </td>
                    <td className="py-1.5 text-slate-400 truncate max-w-[180px]">{`{"order_id":"o101",...}`}</td>
                  </tr>
                  {flags.negativePrice && (
                    <tr className="bg-rose-500/5">
                      <td className="py-1.5 pr-3">o102</td>
                      <td className="py-1.5 pr-3 text-rose-500 font-semibold">-45.00</td>
                      <td className="py-1.5 pr-3">NULL</td>
                      <td className="py-1.5 text-slate-400">{`{"order_id":"o102","price":-45.0}`}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Silver Layer */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900/70 p-4 space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-sky-600 dark:text-sky-400">
              2. Silver Layer (`orders`, `order_items`, `seller_history`)
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="rounded-lg bg-slate-50 dark:bg-navy-950 p-3 space-y-1">
                <div className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  Forward-Only CDC (`olist_silver.orders`)
                </div>
                <p className="font-mono text-[11px] text-slate-600 dark:text-slate-400">
                  {flags.outOfOrderCdc
                    ? 'o1: target.change_seq=4 (delivered) vs incoming seq=3 (shipped) → IGNORED! Status stays "delivered".'
                    : 'o1: seq=4 (delivered) applied cleanly.'}
                </p>
              </div>
              <div className="rounded-lg bg-slate-50 dark:bg-navy-950 p-3 space-y-1">
                <div className="font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                  Dedup & SCD2 (`order_items`, `seller_history`)
                </div>
                <p className="font-mono text-[11px] text-slate-600 dark:text-slate-400">
                  {flags.duplicateItem
                    ? 'o1/1 sent twice → row_number()=1 kept 1 row; insert-only MERGE ignored re-delivery.'
                    : 'No duplicate items in this batch.'}
                  {flags.sellerMove && ' | s1: SP closed (valid_to=today), PR opened (is_current=true).'}
                </p>
              </div>
            </div>
          </div>

          {/* Ops Quarantine & Metrics */}
          <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900/70 p-4 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-rose-600 dark:text-rose-400">
              3. Ops Observability (`ops.quarantine` & `ops.dq_metrics`)
            </span>
            {badRows === 0 ? (
              <p className="text-xs text-slate-500 dark:text-slate-400">
                0 rows quarantined in this batch.
              </p>
            ) : (
              <div className="space-y-1.5 font-mono text-xs">
                {flags.negativePrice && (
                  <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>o102 → ops.quarantine | _failed_rules: ["price_not_positive"]</span>
                  </div>
                )}
                {flags.tooLate5d && (
                  <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>o103 → ops.quarantine | _failed_rules: ["too_late"] (lag=5d &gt; 3d)</span>
                  </div>
                )}
                {flags.poisonSpike && (
                  <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>+12 poisoned rows → ops.dq_metrics triggers DQ Gate failure!</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Gold Layer */}
          <div
            className={`rounded-xl border p-4 space-y-2 transition-opacity ${
              gatePassed
                ? 'border-amber-500/30 bg-amber-500/5 dark:bg-amber-500/10'
                : 'border-slate-200 dark:border-slate-800 bg-slate-100/50 dark:bg-navy-950/50 opacity-60'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                <Sparkles className="w-3.5 h-3.5" />
                4. Gold Layer (`fact_order_item`, `mart_seller_delivery_performance`)
              </span>
              <span className="font-mono text-xs font-semibold">
                {gatePassed ? 'PUBLISHED' : 'HALTED BY GATE'}
              </span>
            </div>
            <p className="font-mono text-xs text-slate-700 dark:text-slate-300">
              {gatePassed
                ? flags.sellerMove
                  ? 'GMV updated cleanly. Past orders by s1 still attribute to SP (point-in-time join); new orders from today attribute to PR.'
                  : 'GMV = $12,990.00 (no double counting from duplicates; bad rows excluded).'
                : 'Gold tables untouched! Yesterday’s clean Gold data remains intact for analysts while engineering investigates.'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
