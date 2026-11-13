import React, { useEffect, useState } from 'react';
import { X, Copy, Check, ExternalLink, FileCode2 } from 'lucide-react';
import { Lang } from '../types';
import { CodeHighlight } from './CodeHighlight';
import rawSources from '../data/generatedSources.json';

interface SourceEntry {
  language: 'sql' | 'python' | 'bash';
  lines: number;
  content: string;
}

const SOURCES = rawSources as Record<string, SourceEntry>;

interface Props {
  filePath: string | null;
  lang: Lang;
  onClose: () => void;
  onSelectFile?: (path: string) => void;
}

export const SourceDrawer: React.FC<Props> = ({ filePath, lang, onClose, onSelectFile }) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  if (!filePath) return null;

  const entry = SOURCES[filePath];
  const githubUrl = `https://github.com/kidwon/olist-lakehouse-pipeline/blob/main/${filePath}`;

  const handleCopy = () => {
    if (!entry) return;
    navigator.clipboard.writeText(entry.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div className="relative z-10 w-full max-w-4xl bg-white dark:bg-navy-950 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col h-full">
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-slate-50 dark:bg-navy-900">
          <div className="flex items-center gap-2.5 min-w-0">
            <FileCode2 className="w-5 h-5 text-lava-500 flex-shrink-0" />
            <div className="min-w-0">
              <div className="font-mono text-sm font-bold text-slate-900 dark:text-white truncate">
                {filePath}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                {entry ? `${entry.lines} lines · ${entry.language.toUpperCase()}` : 'Not found in bundle'}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {entry && (
              <button
                type="button"
                onClick={handleCopy}
                className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-navy-950 px-3 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-200 hover:border-lava-500"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                {lang === 'zh' ? '复制源码' : lang === 'ja' ? 'コピー' : 'Copy'}
              </button>
            )}
            <a
              href={githubUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 px-3 py-1.5 text-xs font-medium hover:opacity-90"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              GitHub
            </a>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200/60 dark:hover:bg-navy-800"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Quick File Switcher Bar */}
        <div className="px-5 py-2 border-b border-slate-200 dark:border-slate-800 bg-slate-100/60 dark:bg-navy-900/50 flex items-center gap-1.5 overflow-x-auto">
          {Object.keys(SOURCES).map((p) => {
            const shortName = p.split('/').pop() || p;
            const active = p === filePath;
            return (
              <button
                key={p}
                type="button"
                onClick={() => onSelectFile?.(p)}
                title={p}
                className={`flex-shrink-0 rounded px-2 py-1 font-mono text-[11px] transition-colors ${
                  active
                    ? 'bg-lava-500 text-white font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-navy-800'
                }`}
              >
                {shortName}
              </button>
            );
          })}
        </div>

        {/* Body */}
        <div className="flex-1 overflow-auto bg-slate-950">
          {entry ? (
            <CodeHighlight code={entry.content} language={entry.language} />
          ) : (
            <div className="p-8 text-center text-sm text-slate-400">
              {lang === 'zh'
                ? '未找到该文件，请点击上方 GitHub 按钮查看。'
                : lang === 'ja'
                  ? 'ファイルが見つかりません。GitHub ボタンから確認してください。'
                  : 'File not found in local bundle. Use the GitHub button above.'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
