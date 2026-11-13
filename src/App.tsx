import React, { useEffect, useState } from 'react';
import {
  Map,
  Activity,
  GitCompare,
  Database,
  Scale,
  Sun,
  Moon,
  Layers,
} from 'lucide-react';
import { Lang } from './types';
import { UI_TEXT } from './data/i18n';
import { RoadmapView } from './components/RoadmapView';
import { PipelineSimulator } from './components/PipelineSimulator';
import { ComparisonView } from './components/ComparisonView';
import { SqlExplorerView } from './components/SqlExplorerView';
import { ADRView } from './components/ADRView';
import { SourceDrawer } from './components/SourceDrawer';

type Tab = 'roadmap' | 'simulator' | 'compare' | 'sql' | 'adrs';

export function App() {
  const [lang, setLang] = useState<Lang>(() => {
    return (localStorage.getItem('olist-lang') as Lang) || 'zh';
  });
  const [dark, setDark] = useState<boolean>(() => {
    const saved = localStorage.getItem('olist-theme');
    return saved ? saved === 'dark' : true;
  });
  const [tab, setTab] = useState<Tab>('roadmap');
  const [openFile, setOpenFile] = useState<string | null>(null);
  const [completedIds, setCompletedIds] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('olist-completed') || '[]');
    } catch {
      return [];
    }
  });
  const [checkedSkills, setCheckedSkills] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem('olist-skills') || '[]');
    } catch {
      return [];
    }
  });

  useEffect(() => {
    localStorage.setItem('olist-lang', lang);
  }, [lang]);

  useEffect(() => {
    localStorage.setItem('olist-theme', dark ? 'dark' : 'light');
    document.documentElement.classList.toggle('dark', dark);
  }, [dark]);

  useEffect(() => {
    localStorage.setItem('olist-completed', JSON.stringify(completedIds));
  }, [completedIds]);

  useEffect(() => {
    localStorage.setItem('olist-skills', JSON.stringify(checkedSkills));
  }, [checkedSkills]);

  const toggleComplete = (id: string) => {
    setCompletedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const toggleSkill = (id: string) => {
    setCheckedSkills((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const t = UI_TEXT[lang];

  const navItems: { id: Tab; label: string; icon: React.FC<{ className?: string }> }[] = [
    { id: 'roadmap', label: t.tabs.roadmap, icon: Map },
    { id: 'simulator', label: t.tabs.simulator, icon: Activity },
    { id: 'compare', label: t.tabs.compare, icon: GitCompare },
    { id: 'sql', label: t.tabs.sql, icon: Database },
    { id: 'adrs', label: t.tabs.adrs, icon: Scale },
  ];

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-navy-950/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-lava-500 flex items-center justify-center text-white shadow-sm flex-shrink-0">
              <Layers className="w-5 h-5" />
            </div>
            <div className="truncate">
              <h1 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white truncate">
                {t.brandTitle}
              </h1>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block truncate">
                {t.brandSub}
              </p>
            </div>
          </div>

          {/* Center Nav */}
          <nav className="hidden md:flex items-center gap-1 rounded-xl bg-slate-100 dark:bg-navy-900 p-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = tab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setTab(item.id)}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all ${
                    active
                      ? 'bg-white dark:bg-navy-800 text-lava-600 dark:text-lava-400 shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Right Controls: Language + Theme */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <div className="inline-flex rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-navy-900 p-0.5 text-[11px] font-medium">
              {(['zh', 'ja', 'en'] as Lang[]).map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLang(l)}
                  className={`rounded-md px-2 py-1 transition-colors ${
                    lang === l
                      ? 'bg-lava-500 text-white'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {l === 'zh' ? '中文' : l === 'ja' ? '日本語' : 'EN'}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setDark((d) => !d)}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-navy-900 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700"
              aria-label="Toggle theme"
            >
              {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Nav */}
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 px-3 py-2 flex gap-1 overflow-x-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = tab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={`flex-shrink-0 inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium ${
                  active
                    ? 'bg-lava-500 text-white'
                    : 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-navy-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                {item.label}
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6">
        {tab === 'roadmap' && (
          <RoadmapView
            lang={lang}
            completedIds={completedIds}
            onToggleComplete={toggleComplete}
            onOpenSource={setOpenFile}
          />
        )}
        {tab === 'simulator' && <PipelineSimulator lang={lang} />}
        {tab === 'compare' && <ComparisonView lang={lang} onOpenSource={setOpenFile} />}
        {tab === 'sql' && <SqlExplorerView lang={lang} onOpenSource={setOpenFile} />}
        {tab === 'adrs' && (
          <ADRView
            lang={lang}
            checkedSkills={checkedSkills}
            onToggleSkill={toggleSkill}
          />
        )}
      </div>

      <SourceDrawer
        filePath={openFile}
        lang={lang}
        onClose={() => setOpenFile(null)}
        onSelectFile={setOpenFile}
      />
    </div>
  );
}

export default App;
