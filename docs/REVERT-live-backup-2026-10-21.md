# How to put uktaxcal.com back exactly as it was on 21 October 2026

The site as it was live on 21 Oct 2026, before Phase 1, is commit `d844f8a65bf5e27d658d703bc956d2deeabee9ad`
("Update sitemap lastmod dates to trigger Google re-crawl").

It was checked byte for byte against the live site: all 26 served files were identical.

## The backup exists in four places

| Where | Name |
|:-|:-|
| GitHub tag | `live-backup-2026-10-21` |
| GitHub branch | `backup/live-2026-10-21` |
| Zip on this Mac | `/Users/ven/Dev/Dwija/backups/uktaxcal/uktaxcal-live-2026-10-21-d844f8a.zip` |
| Files downloaded from the live site | `/Users/ven/Dev/Dwija/backups/uktaxcal/mirror-2026-10-21/` |

Older backup tags in the repo (`v0-live-backup`, `v1.0-pre-spouse`) are from earlier work. Ignore them for this revert.

## Revert the live site (GitHub Pages serves the `main` branch)

This keeps the history and adds one new commit that restores every file to the backup. Nothing is deleted.

```bash
cd /Users/ven/Dev/Dwija/uktaxcal
git checkout main
git pull
git restore --source=live-backup-2026-10-21 --staged --worktree -- .
git commit -m "Revert site to live-backup-2026-10-21"
git push origin main
```

GitHub Pages republishes within a few minutes. Check with:

```bash
curl -s https://uktaxcal.com/js/tax-engine.js | shasum
git show live-backup-2026-10-21:js/tax-engine.js | shasum
```

The two values must match.

Note: `git restore --source` restores files that existed in the backup. Files ADDED after the backup (for example new pages) stay in place unless removed. To list them:

```bash
git diff --name-only --diff-filter=A live-backup-2026-10-21 main
```

Remove any of them with `git rm <file>` before the commit above if the revert should drop them too.
