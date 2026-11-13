import React from 'react';

interface Props {
  code: string;
  language?: 'sql' | 'python' | 'bash';
}

const SQL_KEYWORDS = new Set([
  'CREATE', 'OR', 'REFRESH', 'STREAMING', 'TABLE', 'MATERIALIZED', 'VIEW',
  'SELECT', 'FROM', 'STREAM', 'WHERE', 'JOIN', 'LEFT', 'RIGHT', 'INNER',
  'ON', 'USING', 'GROUP', 'BY', 'ALL', 'ORDER', 'ASC', 'DESC', 'LIMIT',
  'AS', 'CASE', 'WHEN', 'THEN', 'ELSE', 'END', 'AND', 'NOT', 'IS', 'NULL',
  'IN', 'UNION', 'WITH', 'CONSTRAINT', 'EXPECT', 'VIOLATION', 'FAIL',
  'UPDATE', 'FLOW', 'AUTO', 'CDC', 'INTO', 'KEYS', 'SEQUENCE', 'INSERT',
  'NAME', 'OVER', 'PARTITION', 'DATE', 'INT', 'STRING', 'DECIMAL',
  'TIMESTAMP', 'MAP', 'TRUE', 'FALSE', 'LATERAL', 'EXPLODE',
]);

const SQL_FUNCTIONS = new Set([
  'from_json', 'to_json', 'map_filter', 'array_contains', 'filter', 'array',
  'coalesce', 'count_if', 'try_divide', 'datediff', 'to_date', 'date_format',
  'xxhash64', 'current_timestamp', 'regexp_extract', 'read_files', 'struct',
  'sum', 'avg', 'count', 'round', 'nullif', 'min', 'max', 'cast', 'size',
  'explode', 'array_join',
]);

const PY_KEYWORDS = new Set([
  'def', 'import', 'from', 'if', 'else', 'elif', 'return', 'for', 'in',
  'not', 'and', 'or', 'True', 'False', 'None', 'raise', 'as', 'with',
  'class', 'try', 'except', 'lambda', 'pass',
]);

function highlightLine(line: string, language: 'sql' | 'python' | 'bash'): React.ReactNode[] {
  const commentPrefix = language === 'sql' ? '--' : '#';
  const tokenRegex =
    language === 'sql'
      ? /(--.*$|'(?:\\.|[^'])*'|"(?:\\.|[^"])*"|\$\{[^}]+\}|\b\d+(?:\.\d+)?\b|\b[A-Za-z_][A-Za-z0-9_]*\b)/g
      : /(#.*$|'(?:\\.|[^'])*'|"(?:\\.|[^"])*"|\b\d+(?:\.\d+)?\b|\b[A-Za-z_][A-Za-z0-9_]*\b)/g;

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = tokenRegex.exec(line)) !== null) {
    if (match.index > lastIndex) {
      parts.push(line.slice(lastIndex, match.index));
    }
    const token = match[0];
    let cls = '';

    if (token.startsWith(commentPrefix)) {
      cls = 'text-slate-500 italic';
    } else if (token.startsWith("'") || token.startsWith('"')) {
      cls = 'text-emerald-400';
    } else if (token.startsWith('${')) {
      cls = 'text-amber-300';
    } else if (/^\d/.test(token)) {
      cls = 'text-amber-400';
    } else if (language === 'sql') {
      if (SQL_KEYWORDS.has(token.toUpperCase())) {
        cls = 'text-sky-400 font-semibold';
      } else if (SQL_FUNCTIONS.has(token.toLowerCase())) {
        cls = 'text-violet-400';
      }
    } else if (language === 'python' && PY_KEYWORDS.has(token)) {
      cls = 'text-sky-400 font-semibold';
    }

    parts.push(
      cls ? (
        <span key={match.index} className={cls}>
          {token}
        </span>
      ) : (
        token
      )
    );
    lastIndex = match.index + token.length;
  }

  if (lastIndex < line.length) {
    parts.push(line.slice(lastIndex));
  }

  return parts;
}

export const CodeHighlight: React.FC<Props> = ({ code, language = 'sql' }) => {
  const lines = code.split('\n');
  return (
    <pre className="p-4 overflow-x-auto bg-slate-950 text-slate-100 font-mono text-xs leading-relaxed">
      <code>
        {lines.map((line, i) => (
          <div key={i} className="table-row">
            <span className="table-cell select-none pr-4 text-right text-slate-600 w-8">
              {i + 1}
            </span>
            <span className="table-cell whitespace-pre">
              {highlightLine(line, language)}
            </span>
          </div>
        ))}
      </code>
    </pre>
  );
};
