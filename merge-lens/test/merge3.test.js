import test from 'node:test';
import assert from 'node:assert/strict';
import { merge3 } from '../src/merge3.js';

test('the core case: reordered keys never cause a false conflict', () => {
  // "theirs" is base with keys reordered (e.g. a regenerated lockfile) and
  // one unrelated value bumped. "ours" independently added a new key.
  // A line-based merge would conflict here; structurally there is no overlap.
  const base = { alpha: 1, beta: 2, gamma: 3 };
  const ours = { alpha: 1, beta: 2, gamma: 3, delta: 4 };
  const theirs = { gamma: 3, alpha: 1, beta: 99 };

  const { value, conflicts } = merge3(base, ours, theirs);
  assert.deepEqual(conflicts, []);
  assert.deepEqual(value, { alpha: 1, beta: 99, gamma: 3, delta: 4 });
});

test('real conflict when both sides change the same scalar differently', () => {
  const base = { replicas: 1 };
  const ours = { replicas: 2 };
  const theirs = { replicas: 3 };
  const { value, conflicts } = merge3(base, ours, theirs);
  assert.equal(conflicts.length, 1);
  assert.equal(conflicts[0].path, '$.replicas');
  assert.equal(conflicts[0].kind, 'both-modified');
  assert.equal(value.replicas, 2); // ours is the documented default pick
});

test('deletion that conflicts with a modification is flagged', () => {
  const base = { flag: true };
  const ours = {}; // ours deleted it
  const theirs = { flag: false }; // theirs modified it
  const { conflicts } = merge3(base, ours, theirs);
  assert.equal(conflicts.length, 1);
  assert.equal(conflicts[0].kind, 'deleted-vs-modified');
});

test('deletion that agrees with the other side (unchanged) wins cleanly', () => {
  const base = { flag: true };
  const ours = {}; // ours deleted it
  const theirs = { flag: true }; // theirs left it untouched
  const { value, conflicts } = merge3(base, ours, theirs);
  assert.deepEqual(conflicts, []);
  assert.equal('flag' in value, false);
});

test('keyed array merge: unrelated element changes merge cleanly', () => {
  const base = [
    { name: 'web', image: 'v1', replicas: 1 },
    { name: 'db', image: 'postgres:14' },
  ];
  const ours = [
    { name: 'web', image: 'v2', replicas: 1 }, // ours bumped web's image
    { name: 'db', image: 'postgres:14' },
  ];
  const theirs = [
    { name: 'web', image: 'v1', replicas: 1 },
    { name: 'db', image: 'postgres:14', env: 'prod' }, // theirs changed db
  ];

  const { value, conflicts } = merge3(base, ours, theirs);
  assert.deepEqual(conflicts, []);
  const web = value.find((e) => e.name === 'web');
  const db = value.find((e) => e.name === 'db');
  assert.equal(web.image, 'v2');
  assert.equal(db.env, 'prod');
});

test('keyed array merge: conflicting edits to the same element are flagged', () => {
  const base = [{ name: 'web', image: 'v1' }];
  const ours = [{ name: 'web', image: 'v2' }];
  const theirs = [{ name: 'web', image: 'v3' }];
  const { conflicts } = merge3(base, ours, theirs);
  assert.equal(conflicts.length, 1);
  assert.equal(conflicts[0].path, '$[name=web].image');
});

test('array without an identity key falls back to an atomic conflict when both sides diverge', () => {
  const base = [1, 2, 3];
  const ours = [1, 2, 3, 4];
  const theirs = [0, 1, 2, 3];
  const { conflicts } = merge3(base, ours, theirs);
  assert.equal(conflicts.length, 1);
  assert.equal(conflicts[0].kind, 'array-atomic-conflict');
});

test('array without an identity key merges cleanly when only one side changed', () => {
  const base = [1, 2, 3];
  const ours = [1, 2, 3, 4];
  const theirs = [1, 2, 3];
  const { value, conflicts } = merge3(base, ours, theirs);
  assert.deepEqual(conflicts, []);
  assert.deepEqual(value, [1, 2, 3, 4]);
});
