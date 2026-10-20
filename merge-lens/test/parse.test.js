import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { loadDoc, stringifyDoc } from '../src/parse.js';

function tmpFile(name, content) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'merge-lens-test-'));
  const file = path.join(dir, name);
  fs.writeFileSync(file, content);
  return file;
}

test('loads JSON and round-trips through stringifyDoc', () => {
  const file = tmpFile('a.json', '{"b": 2, "a": 1}');
  const { value, format } = loadDoc(file);
  assert.equal(format, 'json');
  assert.deepEqual(value, { b: 2, a: 1 });
  assert.equal(stringifyDoc(value, 'json'), '{\n  "b": 2,\n  "a": 1\n}\n');
});

test('loads YAML', () => {
  const file = tmpFile('a.yaml', 'name: web\nreplicas: 2\n');
  const { value, format } = loadDoc(file);
  assert.equal(format, 'yaml');
  assert.deepEqual(value, { name: 'web', replicas: 2 });
});

test('rejects unsupported extensions', () => {
  const file = tmpFile('a.toml', 'x = 1');
  assert.throws(() => loadDoc(file), /unsupported file extension/);
});

test('treats an empty file as an empty document instead of throwing', () => {
  const file = tmpFile('a.json', '');
  const { value } = loadDoc(file);
  assert.deepEqual(value, {});
});
