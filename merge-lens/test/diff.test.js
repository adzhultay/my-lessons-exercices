import test from 'node:test';
import assert from 'node:assert/strict';
import { diff } from '../src/diff.js';

test('no diff for reordered-but-equal objects', () => {
  const a = { x: 1, y: 2, z: 3 };
  const b = { z: 3, x: 1, y: 2 };
  assert.deepEqual(diff(a, b), []);
});

test('detects added, removed and changed keys', () => {
  const a = { keep: 1, drop: 2, change: 3 };
  const b = { keep: 1, change: 4, add: 5 };
  const changes = diff(a, b);
  const byPath = Object.fromEntries(changes.map((c) => [c.path, c]));
  assert.equal(byPath['$.drop'].type, 'removed');
  assert.equal(byPath['$.add'].type, 'added');
  assert.equal(byPath['$.change'].type, 'changed');
  assert.equal(changes.length, 3);
});

test('diffs nested objects by path', () => {
  const a = { spec: { replicas: 1 } };
  const b = { spec: { replicas: 2 } };
  const changes = diff(a, b);
  assert.equal(changes.length, 1);
  assert.equal(changes[0].path, '$.spec.replicas');
  assert.equal(changes[0].a, 1);
  assert.equal(changes[0].b, 2);
});

test('diffs arrays of objects by identity key, not position', () => {
  const a = [{ name: 'web', image: 'v1' }, { name: 'db', image: 'v1' }];
  const b = [{ name: 'db', image: 'v1' }, { name: 'web', image: 'v2' }];
  const changes = diff(a, b);
  assert.equal(changes.length, 1);
  assert.equal(changes[0].path, '$[name=web].image');
});

test('falls back to atomic change for arrays without an identity key', () => {
  const a = [1, 2, 3];
  const b = [3, 2, 1];
  const changes = diff(a, b);
  assert.equal(changes.length, 1);
  assert.equal(changes[0].type, 'changed');
});
