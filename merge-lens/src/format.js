export function formatDiff(changes) {
  return changes
    .map((c) => {
      if (c.type === 'added') return `+ ${c.path}: ${JSON.stringify(c.b)}`;
      if (c.type === 'removed') return `- ${c.path}: ${JSON.stringify(c.a)}`;
      return `~ ${c.path}: ${JSON.stringify(c.a)} -> ${JSON.stringify(c.b)}`;
    })
    .join('\n');
}

export function formatConflicts(conflicts) {
  return conflicts
    .map((c) =>
      [
        `CONFLICT at ${c.path} (${c.kind || 'both-modified'})`,
        `  base:   ${c.base === undefined ? '<absent>' : JSON.stringify(c.base)}`,
        `  ours:   ${c.ours === undefined ? '<absent>' : JSON.stringify(c.ours)}`,
        `  theirs: ${c.theirs === undefined ? '<absent>' : JSON.stringify(c.theirs)}`,
      ].join('\n'),
    )
    .join('\n\n');
}
