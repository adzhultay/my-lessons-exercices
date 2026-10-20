import { deepEqual, isPlainObject, pathStr, detectIdKey } from './util.js';

/**
 * Structural diff between two parsed documents. Unlike a line diff, this
 * walks the object/array tree so that reordered-but-equal structures never
 * show up as differences.
 */
export function diff(a, b, path = [], out = []) {
  if (deepEqual(a, b)) return out;

  if (isPlainObject(a) && isPlainObject(b)) {
    const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
    for (const k of keys) {
      const inA = Object.prototype.hasOwnProperty.call(a, k);
      const inB = Object.prototype.hasOwnProperty.call(b, k);
      const childPath = [...path, k];
      if (inA && !inB) out.push({ path: pathStr(childPath), type: 'removed', a: a[k] });
      else if (!inA && inB) out.push({ path: pathStr(childPath), type: 'added', b: b[k] });
      else diff(a[k], b[k], childPath, out);
    }
    return out;
  }

  if (Array.isArray(a) && Array.isArray(b)) {
    const allObjects = a.every(isPlainObject) && b.every(isPlainObject);
    const idKey = allObjects ? detectIdKey(a, b) : null;
    if (idKey) {
      const am = new Map(a.map((e) => [e[idKey], e]));
      const bm = new Map(b.map((e) => [e[idKey], e]));
      const order = [...new Set([...a.map((e) => e[idKey]), ...b.map((e) => e[idKey])])];
      for (const id of order) {
        const childPath = [...path, `${idKey}=${id}`];
        if (am.has(id) && !bm.has(id)) out.push({ path: pathStr(childPath), type: 'removed', a: am.get(id) });
        else if (!am.has(id) && bm.has(id)) out.push({ path: pathStr(childPath), type: 'added', b: bm.get(id) });
        else diff(am.get(id), bm.get(id), childPath, out);
      }
      return out;
    }
    out.push({ path: pathStr(path), type: 'changed', a, b });
    return out;
  }

  out.push({ path: pathStr(path), type: 'changed', a, b });
  return out;
}
