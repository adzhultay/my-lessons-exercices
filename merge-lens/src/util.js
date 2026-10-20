const ID_KEY_CANDIDATES = ['id', 'name', 'key', 'uid', 'uuid'];

export function isPlainObject(x) {
  return typeof x === 'object' && x !== null && !Array.isArray(x);
}

export function deepEqual(a, b) {
  if (a === b) return true;
  if (typeof a !== typeof b) return false;
  if (Array.isArray(a) || Array.isArray(b)) {
    if (!Array.isArray(a) || !Array.isArray(b)) return false;
    if (a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (!deepEqual(a[i], b[i])) return false;
    }
    return true;
  }
  if (isPlainObject(a) || isPlainObject(b)) {
    if (!isPlainObject(a) || !isPlainObject(b)) return false;
    const aKeys = Object.keys(a);
    const bKeys = Object.keys(b);
    if (aKeys.length !== bKeys.length) return false;
    for (const k of aKeys) {
      if (!Object.prototype.hasOwnProperty.call(b, k)) return false;
      if (!deepEqual(a[k], b[k])) return false;
    }
    return true;
  }
  return false;
}

export function pathStr(path) {
  let s = '$';
  for (const seg of path) {
    if (typeof seg === 'number') s += `[${seg}]`;
    else if (typeof seg === 'string' && seg.includes('=')) s += `[${seg}]`;
    else s += `.${seg}`;
  }
  return s;
}

function isValidIdKey(arr, candidate) {
  if (arr.length === 0) return true;
  const values = [];
  for (const e of arr) {
    const v = e[candidate];
    if (typeof v !== 'string' && typeof v !== 'number') return false;
    values.push(v);
  }
  return new Set(values).size === values.length;
}

/**
 * Finds a key (e.g. "name", "id") that uniquely identifies elements within
 * each given array of plain objects, so array merges/diffs can match
 * elements by identity instead of by position.
 */
export function detectIdKey(...arrays) {
  const nonEmpty = arrays.some((arr) => arr.length > 0);
  if (!nonEmpty) return null;
  for (const candidate of ID_KEY_CANDIDATES) {
    if (arrays.every((arr) => isValidIdKey(arr, candidate))) {
      return candidate;
    }
  }
  return null;
}
