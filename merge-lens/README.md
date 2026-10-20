# merge-lens

Structural diff and 3-way merge for JSON/YAML, usable as a drop-in Git merge
driver.

## The problem

Git merges text line by line. For hand-written code that's correct. For
*generated or reformatted* JSON/YAML — `package-lock.json`, Helm/Kubernetes
manifests, GitHub Actions workflows, Terraform JSON state-adjacent files — it
produces false conflicts constantly: one branch reorders keys or a tool
reformats the file, the other branch makes one unrelated real change
somewhere else, and Git reports a conflict even though nothing overlaps
semantically.

merge-lens compares by **value**, not by line position. Reordering keys that
didn't actually change produces no diff and no conflict. A real, overlapping
change still produces a real conflict — merge-lens does not hide genuine
conflicts, it only stops manufacturing fake ones.

## What it is not

This is not the first structural diff tool for JSON/YAML — `dyff`,
`json-diff`, and `jd` already do that part well, and are more mature. What
they don't do is **3-way merge resolution wired into `git merge` itself**.
merge-lens's actual contribution is narrow and specific: register it once
per repo and conflicts on matching files are resolved structurally during
every `git merge`/`git rebase`/`git cherry-pick`, with no manual step.

Known limitations, stated plainly:
- Comments and formatting in YAML are not preserved across a merge (the
  `yaml` library re-serializes the document). If your files carry meaningful
  comments, review the merged output before committing.
- Array merging without a reliable identity field (`name`/`id`/`key`/`uid`/
  `uuid`) falls back to treating the whole array as a single value — it will
  not try to guess which element moved where.
- JSON output re-indents at 2 spaces; it does not preserve the original
  file's exact formatting byte-for-byte.

## Live demo

`demo/index.html` is a standalone page (no build step — open it directly, or
serve it via GitHub Pages) that runs the real merge algorithm in the browser
against two preset scenarios: a reordered-config false conflict, and a
genuine conflict, each compared against real captured `git merge` output.

## Install

```sh
npm install -g merge-lens   # or: npm link, from this folder, for local use
cd your-repo
merge-lens install          # registers the git merge driver + .gitattributes
git add .gitattributes
git commit -m "Use merge-lens for structural merges"
```

`merge-lens install` writes `*.json merge=mergelens` (and `.yaml`/`.yml`)
into `.gitattributes` (commit this — it's what tells Git to use the driver,
and it travels with the repo) and registers the driver command itself via
`git config` (this part is local per clone, same as any merge driver,
so each collaborator who wants it must also run `merge-lens install` once).

## Usage

```sh
# Structural diff between two files
merge-lens diff a.yaml b.yaml

# Standalone 3-way merge (prints to stdout, or -o <file>)
merge-lens merge base.json ours.json theirs.json -o merged.json

# What git actually invokes once installed — you don't run this by hand
merge-lens merge-driver %O %A %B %P
```

Exit codes: `0` = no differences / merge resolved cleanly. `1` = differences
found / conflicts remain (so both commands are script/CI-friendly).

## How conflicts are decided

For each path in the tree:
- Unchanged on one side, changed on the other → the changed value wins.
- Changed identically on both sides → no conflict.
- Changed to *different* values on both sides → conflict, reported with
  base/ours/theirs values and the path.
- Deleted on one side, unchanged on the other → deletion wins.
- Deleted on one side, modified on the other → conflict.

Arrays of objects are matched by whichever of `id`, `name`, `key`, `uid`,
`uuid` is present and unique within each version of the array (e.g. Helm's
`containers: [{name: ..., image: ...}]`), so editing one container doesn't
conflict with an unrelated edit to another container in the same list.

When a real conflict can't be resolved structurally, merge-lens falls back
to `git merge-file`'s standard diff3 conflict markers — the same output
you'd get without merge-lens — so there is no silent data loss, ever.

## Development

```sh
npm install
npm test
```

17 tests cover the diff engine, the 3-way merge engine (including the exact
false-conflict scenario this tool exists for), and file parsing.
