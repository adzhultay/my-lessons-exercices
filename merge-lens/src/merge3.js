import { deepEqual, isPlainObject, pathStr, detectIdKey } from './util.js';

/**
 * 3-way structural merge. Compares by value, not by key/line order, so a
 * side that only reordered keys (e.g. a regenerated lockfile) never
 * produces a conflict against a side that made an unrelated change.
 */
export function merge3(base, ours, theirs, path = []) {
  if (deepEqual(ours, theirs)) return { value: ours, conflicts: [] };
  if (deepEqual(base, ours)) return { value: theirs, conflicts: [] };
  if (deepEqual(base, theirs)) return { value: ours, conflicts: [] };

  if (isPlainObject(base) && isPlainObject(ours) && isPlainObject(theirs)) {
    return mergeObjects(base, ours, theirs, path);
  }
  if (Array.isArray(base) && Array.isArray(ours) && Array.isArray(theirs)) {
    return mergeArrays(base, ours, theirs, path);
  }

  // Type mismatch (e.g. object replaced by scalar) or two different scalars.
  return { value: ours, conflicts: [{ path: pathStr(path), base, ours, theirs, kind: 'both-modified' }] };
}

function mergeObjects(base, ours, theirs, path) {
  const orderedKeys = [...Object.keys(ours), ...Object.keys(theirs), ...Object.keys(base)].filter(
    (k, i, arr) => arr.indexOf(k) === i,
  );
  const result = {};
  const conflicts = [];

  for (const k of orderedKeys) {
    const inBase = Object.prototype.hasOwnProperty.call(base, k);
    const inOurs = Object.prototype.hasOwnProperty.call(ours, k);
    const inTheirs = Object.prototype.hasOwnProperty.call(theirs, k);
    const bv = base[k];
    const ov = ours[k];
    const tv = theirs[k];
    const childPath = [...path, k];

    if (!inBase && !inOurs && inTheirs) {
      result[k] = tv;
      continue;
    }
    if (!inBase && inOurs && !inTheirs) {
      result[k] = ov;
      continue;
    }
    if (!inBase && inOurs && inTheirs) {
      if (deepEqual(ov, tv)) {
        result[k] = ov;
      } else {
        conflicts.push({ path: pathStr(childPath), base: undefined, ours: ov, theirs: tv, kind: 'both-added-different' });
        result[k] = ov;
      }
      continue;
    }
    if (inBase && !inOurs && !inTheirs) {
      continue; // deleted on both sides
    }
    if (inBase && !inOurs && inTheirs) {
      if (deepEqual(bv, tv)) {
        continue; // deleted by ours, unchanged by theirs -> deletion wins
      }
      conflicts.push({ path: pathStr(childPath), base: bv, ours: undefined, theirs: tv, kind: 'deleted-vs-modified' });
      result[k] = tv;
      continue;
    }
    if (inBase && inOurs && !inTheirs) {
      if (deepEqual(bv, ov)) {
        continue; // deleted by theirs, unchanged by ours -> deletion wins
      }
      conflicts.push({ path: pathStr(childPath), base: bv, ours: ov, theirs: undefined, kind: 'modified-vs-deleted' });
      result[k] = ov;
      continue;
    }

    // present in all three
    const sub = merge3(bv, ov, tv, childPath);
    result[k] = sub.value;
    conflicts.push(...sub.conflicts);
  }

  return { value: result, conflicts };
}

function mergeArrays(base, ours, theirs, path) {
  const allObjects = [base, ours, theirs].every((arr) => arr.every(isPlainObject));
  const idKey = allObjects ? detectIdKey(base, ours, theirs) : null;

  if (!idKey) {
    // No reliable identity to match elements by: both sides changed this
    // array and we can't tell which edits are compatible, so flag it.
    return { value: ours, conflicts: [{ path: pathStr(path), base, ours, theirs, kind: 'array-atomic-conflict' }] };
  }

  const toMap = (arr) => new Map(arr.map((e) => [e[idKey], e]));
  const baseMap = toMap(base);
  const oursMap = toMap(ours);
  const theirsMap = toMap(theirs);

  const order = [];
  for (const e of ours) if (!order.includes(e[idKey])) order.push(e[idKey]);
  for (const e of theirs) if (!order.includes(e[idKey])) order.push(e[idKey]);

  const result = [];
  const conflicts = [];

  for (const id of order) {
    const inBase = baseMap.has(id);
    const inOurs = oursMap.has(id);
    const inTheirs = theirsMap.has(id);
    const bv = baseMap.get(id);
    const ov = oursMap.get(id);
    const tv = theirsMap.get(id);
    const childPath = [...path, `${idKey}=${id}`];

    if (!inBase && inOurs && !inTheirs) {
      result.push(ov);
      continue;
    }
    if (!inBase && !inOurs && inTheirs) {
      result.push(tv);
      continue;
    }
    if (!inBase && inOurs && inTheirs) {
      if (deepEqual(ov, tv)) {
        result.push(ov);
      } else {
        conflicts.push({ path: pathStr(childPath), base: undefined, ours: ov, theirs: tv, kind: 'both-added-different' });
        result.push(ov);
      }
      continue;
    }
    if (inBase && !inOurs && !inTheirs) {
      continue;
    }
    if (inBase && !inOurs && inTheirs) {
      if (deepEqual(bv, tv)) continue;
      conflicts.push({ path: pathStr(childPath), base: bv, ours: undefined, theirs: tv, kind: 'deleted-vs-modified' });
      result.push(tv);
      continue;
    }
    if (inBase && inOurs && !inTheirs) {
      if (deepEqual(bv, ov)) continue;
      conflicts.push({ path: pathStr(childPath), base: bv, ours: ov, theirs: undefined, kind: 'modified-vs-deleted' });
      result.push(ov);
      continue;
    }

    const sub = merge3(bv, ov, tv, childPath);
    result.push(sub.value);
    conflicts.push(...sub.conflicts);
  }

  return { value: result, conflicts };
}
