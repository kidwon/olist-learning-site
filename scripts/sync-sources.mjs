import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const siteRoot = path.resolve(__dirname, '..');
const repoDir = path.resolve(siteRoot, process.env.OLIST_REPO_DIR || '../olist-lakehouse-pipeline');
const outFile = path.join(siteRoot, 'src', 'data', 'generatedSources.json');

const TARGET_DIRS = [
  'src/olist_pipeline',
  'lakeflow',
  'notebooks/walkthrough',
];

const TARGET_FILES = [
  'docs/dashboard_queries.sql',
  'resources/olist_jobs.yml',
];

function detectLang(filePath) {
  if (filePath.endsWith('.sql')) return 'sql';
  if (filePath.endsWith('.py')) return 'python';
  return 'bash';
}

if (!fs.existsSync(repoDir)) {
  if (fs.existsSync(outFile)) {
    console.log(`[sync-sources] Repo not found at ${repoDir}, keeping existing generatedSources.json.`);
    process.exit(0);
  } else {
    console.warn(`[sync-sources] Repo not found at ${repoDir}, writing empty catalog.`);
    fs.writeFileSync(outFile, '{}', 'utf8');
    process.exit(0);
  }
}

const filesToRead = new Set(TARGET_FILES);

for (const relDir of TARGET_DIRS) {
  const absDir = path.join(repoDir, relDir);
  if (!fs.existsSync(absDir)) continue;
  for (const entry of fs.readdirSync(absDir)) {
    if (entry.endsWith('.py') || entry.endsWith('.sql')) {
      filesToRead.add(`${relDir}/${entry}`);
    }
  }
}

const catalog = {};
for (const relPath of Array.from(filesToRead).sort()) {
  const absPath = path.join(repoDir, relPath);
  if (!fs.existsSync(absPath)) continue;
  const content = fs.readFileSync(absPath, 'utf8');
  catalog[relPath] = {
    language: detectLang(relPath),
    lines: content.split('\n').length,
    content,
  };
}

fs.mkdirSync(path.dirname(outFile), { recursive: true });
fs.writeFileSync(outFile, JSON.stringify(catalog), 'utf8');
console.log(`[sync-sources] Synced ${Object.keys(catalog).length} source files into src/data/generatedSources.json`);
