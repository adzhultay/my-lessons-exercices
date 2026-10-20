import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';

export function detectFormat(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.json') return 'json';
  if (ext === '.yaml' || ext === '.yml') return 'yaml';
  throw new Error(`unsupported file extension "${ext}" (expected .json, .yaml or .yml): ${filePath}`);
}

export function loadDoc(filePath, formatOverride) {
  const format = formatOverride || detectFormat(filePath);
  const text = fs.readFileSync(filePath, 'utf8');
  const parsed = format === 'json' ? JSON.parse(text || 'null') : YAML.parse(text);
  const value = parsed === null || parsed === undefined ? {} : parsed;
  return { value, format };
}

export function stringifyDoc(value, format) {
  if (format === 'json') return `${JSON.stringify(value, null, 2)}\n`;
  return YAML.stringify(value);
}
