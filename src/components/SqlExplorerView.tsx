import React, { useState } from 'react';
import { Database, Copy, Check, Search, FileCode2 } from 'lucide-react';
import { Lang, SqlCategory } from '../types';
import { SQL_SNIPPETS } from '../data/sqlPlaybook';
import { CodeHighlight } from './CodeHighlight';

interface Props {
  lang: Lang;
  onOpenSource?: (filePath: string) => void;
}

const CATEGORIES: { id: 'all' | SqlCategory; label: Record<Lang, string> }[] = [
  { id: 'all', label: { zh: '全部 SQL', ja: 'すべて', en: 'All SQL' } },
  { id: 'bronze', label: { zh: 'Bronze 摄取', ja: 'Bronze 取り込み', en: 'Bronze' } },
  { id: 'quality', label: { zh: '质量与闸门', ja: '品質・ゲート', en: 'Quality & Gate' } },
  { id: 'silver', label: { zh: 'Silver CDC', ja: 'Silver CDC', en: 'Silver CDC' } },
  { id: 'gold', label: { zh: 'Gold 物化视图', ja: 'Gold MV', en: 'Gold MVs' } },
  { id: 'dashboard', label: { zh: 'AI/BI 看板', ja: 'AI/BI ダッシュボード', en: 'AI/BI Dashboard' } },
];

export const SqlExplorerView: React.FC<Props> = ({ lang, onOpenSource }) => {
  const [cat, setCat] = useState<'all' | SqlCategory>('all');
  const [query, setQuery] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const heading =
    lang === 'zh'
      ? 'Databricks SQL & Lakeflow 实战手册'
      : lang === 'ja'
        ? 'Databricks SQL & Lakeflow プレイブック'
        : 'Databricks SQL & Lakeflow Playbook';
  const sub =
    lang === 'zh'
      ? '整合了 lakeflow/olist_sdp.sql 与 docs/dashboard_queries.sql 中的核心生产 SQL 片段与语法解析'
      : lang === 'ja'
        ? 'lakeflow/olist_sdp.sql と docs/dashboard_queries.sql の本番 SQL と重要構文を網羅'
        : 'Curated production SQL from lakeflow/olist_sdp.sql and docs/dashboard_queries.sql with Databricks SQL idioms';

  const filtered = SQL_SNIPPETS.filter((item) => {
    const matchCat = cat === 'all' || item.category === cat;
    const q = query.trim().toLowerCase();
    const matchText =
      !q ||
      item.title[lang].toLowerCase().includes(q) ||
      item.sql.toLowerCase().includes(q) ||
      item.sourceFile.toLowerCase().includes(q);
    return matchCat && matchText;
  });

  const handleCopy = (id: string, sql: string) => {
    navigator.clipboard.writeText(sql);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1600);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900/80 p-6 space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Database className="w-5 h-5 text-lava-500" />
              {heading}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{sub}</p>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={lang === 'zh' ? '搜索表名、函数或关键字...' : lang === 'ja' ? 'SQL キーワード検索...' : 'Search SQL or table...'}
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-navy-950 pl-9 pr-3 py-1.5 text-xs text-slate-800 dark:text-slate-200 focus:outline-none focus:border-lava-500"
            />
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setCat(c.id)}
              className={`rounded-lg px-3 py-1.5 text-xs font-medium border transition-all ${
                cat === c.id
                  ? 'border-lava-500 bg-lava-500 text-white'
                  : 'border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-navy-950 text-slate-700 dark:text-slate-300'
              }`}
            >
              {c.label[lang]}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-5">
        {filtered.map((item) => (
          <div
            key={item.id}
            className="rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-navy-900/70 overflow-hidden"
          >
            <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  {item.title[lang]}
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  {item.description[lang]}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onOpenSource?.(item.sourceFile)}
                  className="inline-flex items-center gap-1 rounded bg-slate-100 dark:bg-navy-950 px-2.5 py-1 font-mono text-[11px] text-slate-600 dark:text-slate-400 hover:text-lava-500 transition-colors"
                >
                  <FileCode2 className="w-3.5 h-3.5 text-lava-500" />
                  {item.sourceFile} ({item.lineRange})
                </button>
                <button
                  type="button"
                  onClick={() => handleCopy(item.id, item.sql)}
                  className="inline-flex items-center gap-1 rounded-lg border border-slate-200 dark:border-slate-700 px-2.5 py-1 text-xs text-slate-600 dark:text-slate-300 hover:border-lava-500 hover:text-lava-500"
                >
                  {copiedId === item.id ? (
                    <Check className="w-3.5 h-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  Copy
                </button>
              </div>
            </div>

            <CodeHighlight code={item.sql} language="sql" />

            <div className="px-5 py-3 bg-slate-50/70 dark:bg-navy-950/50 border-t border-slate-200 dark:border-slate-800 flex flex-wrap gap-2">
              {item.idioms.map((idiom, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center rounded-md bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 text-[11px] text-amber-800 dark:text-amber-300"
                >
                  💡 {idiom[lang]}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
