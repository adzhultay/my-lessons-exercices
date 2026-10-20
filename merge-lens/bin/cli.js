#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { loadDoc, stringifyDoc, detectFormat } from '../src/parse.js';
import { diff } from '../src/diff.js';
import { merge3 } from '../src/merge3.js';
import { formatDiff, formatConflicts } from '../src/format.js';

const __filename = fileURLToPath(import.meta.url);

function usage() {
  console.error(`merge-lens — structural diff & 3-way merge for JSON/YAML

Usage:
  merge-lens diff <fileA> <fileB>
  merge-lens merge <base> <ours> <theirs> [-o <output>]
  merge-lens merge-driver <base-path> <ours-path> <theirs-path> [<original-path>]
  merge-lens install [--patterns ".json,.yaml,.yml"]

"install" registers merge-lens as a Git merge driver (run inside a git repo)
so conflicts on matching files are resolved structurally during "git merge"
and "git rebase", instead of line-by-line.`);
}

const [, , cmd, ...rest] = process.argv;

switch (cmd) {
  case 'diff':
    cmdDiff(rest);
    break;
  case 'merge':
    cmdMerge(rest);
    break;
  case 'merge-driver':
    cmdMergeDriver(rest);
    break;
  case 'install':
    cmdInstall(rest);
    break;
  default:
    usage();
    process.exit(cmd ? 1 : 0);
}

function cmdDiff([fileA, fileB]) {
  if (!fileA || !fileB) {
    usage();
    process.exit(1);
  }
  const a = loadDoc(fileA);
  const b = loadDoc(fileB);
  const changes = diff(a.value, b.value);
  if (changes.length === 0) {
    console.log('No structural differences.');
    process.exit(0);
  }
  console.log(formatDiff(changes));
  process.exit(1);
}

function cmdMerge(args) {
  const outIdx = args.indexOf('-o');
  let output = null;
  if (outIdx !== -1) {
    output = args[outIdx + 1];
    args = [...args.slice(0, outIdx), ...args.slice(outIdx + 2)];
  }
  const [basePath, oursPath, theirsPath] = args;
  if (!basePath || !oursPath || !theirsPath) {
    usage();
    process.exit(1);
  }
  const base = loadDoc(basePath);
  const ours = loadDoc(oursPath);
  const theirs = loadDoc(theirsPath);
  const { value, conflicts } = merge3(base.value, ours.value, theirs.value);
  const text = stringifyDoc(value, ours.format);

  if (output) fs.writeFileSync(output, text);
  else process.stdout.write(text);

  if (conflicts.length > 0) {
    console.error(`\n${formatConflicts(conflicts)}`);
    process.exit(1);
  }
  process.exit(0);
}

function cmdMergeDriver([basePath, oursPath, theirsPath, originalPath]) {
  if (!basePath || !oursPath || !theirsPath) {
    usage();
    process.exit(1);
  }

  // Git hands the driver temp file paths for %O/%A/%B with no extension, so
  // format can't be inferred from them. %P (the real working-tree path) is
  // passed for exactly this reason — use it when available.
  let format;
  try {
    format = originalPath ? detectFormat(originalPath) : undefined;
  } catch {
    format = undefined;
  }

  let base;
  let ours;
  let theirs;
  try {
    base = loadDoc(basePath, format);
    ours = loadDoc(oursPath, format);
    theirs = loadDoc(theirsPath, format);
  } catch (err) {
    console.error(`merge-lens: ${err.message} — falling back to textual merge.`);
    process.exit(runTextualFallback(basePath, oursPath, theirsPath));
    return;
  }

  const { value, conflicts } = merge3(base.value, ours.value, theirs.value);

  if (conflicts.length === 0) {
    fs.writeFileSync(oursPath, stringifyDoc(value, ours.format));
    console.error(`merge-lens: resolved ${oursPath} structurally, no conflicts.`);
    process.exit(0);
    return;
  }

  console.error(`merge-lens: structural conflicts in ${oursPath}, falling back to textual merge markers:\n`);
  console.error(formatConflicts(conflicts));
  console.error('');
  process.exit(runTextualFallback(basePath, oursPath, theirsPath));
}

function runTextualFallback(basePath, oursPath, theirsPath) {
  const result = spawnSync(
    'git',
    ['merge-file', '-L', 'ours', '-L', 'base', '-L', 'theirs', oursPath, basePath, theirsPath],
    { stdio: 'inherit' },
  );
  return result.status ?? 1;
}

function cmdInstall(args) {
  const patternsIdx = args.indexOf('--patterns');
  const patterns = patternsIdx !== -1 ? args[patternsIdx + 1].split(',') : ['.json', '.yaml', '.yml'];

  const root = spawnSync('git', ['rev-parse', '--show-toplevel'], { encoding: 'utf8' });
  if (root.status !== 0) {
    console.error('merge-lens install must be run inside a git repository.');
    process.exit(1);
  }
  const repoRoot = root.stdout.trim();
  const attrPath = path.join(repoRoot, '.gitattributes');
  let attrContent = fs.existsSync(attrPath) ? fs.readFileSync(attrPath, 'utf8') : '';

  for (const ext of patterns) {
    const line = `*${ext} merge=mergelens`;
    if (!attrContent.includes(line)) {
      attrContent += (attrContent === '' || attrContent.endsWith('\n') ? '' : '\n') + line + '\n';
    }
  }
  fs.writeFileSync(attrPath, attrContent);

  const driverCmd = `node ${JSON.stringify(__filename)} merge-driver %O %A %B %P`;
  spawnSync('git', ['config', 'merge.mergelens.name', 'merge-lens structural merge driver']);
  spawnSync('git', ['config', 'merge.mergelens.driver', driverCmd]);

  console.log(`Registered merge-lens as a git merge driver for: ${patterns.join(', ')}`);
  console.log(`Updated ${attrPath}`);
  console.log('Commit .gitattributes so your team gets structural merges too (the driver config itself is local, per clone).');
}
