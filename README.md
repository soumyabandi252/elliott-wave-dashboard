# Elliott Wave Signal Dashboard

A production-ready, static web dashboard that displays live BUY / SELL / WAIT
signals from the Elliott Wave scan produced by the companion `ElliottWaveApp3`
scanner repo.

## What This Is

This repo is intentionally **separate** from the scanning engine. It pulls the
generated `Elliott_Wave_NASDAQ_Composite_Master_Workbook*.xlsx` from the
scanner repo, converts the DASHBOARD sheet to JSON, and serves it through a
clean, filterable, sortable static site -- no backend server required.

## Live Site Setup (one-time)

1. Go to this repo's **Settings -> Pages**.
2. Under "Build and deployment", set **Source: Deploy from a branch**.
3. Branch: `main`, Folder: `/docs`. Save.
4. Your dashboard will be live at `https://soumyabandi252.github.io/elliott-wave-dashboard/`
   within a minute or two.

## Required Secret

The `Update Dashboard Data` workflow needs read access to your scanner repo
(`ElliottWaveApp3`) to download the latest workbook. Since that repo is
private, create a **Personal Access Token** (classic, with `repo` scope, or a
fine-grained token scoped to just `ElliottWaveApp3` with Contents: Read) and
add it here as a repository secret:

  Settings -> Secrets and variables -> Actions -> New repository secret
  Name:  SOURCE_REPO_TOKEN
  Value: <your PAT>

## Files

- `docs/index.html`, `docs/styles.css`, `docs/app.js` -- the dashboard UI
- `docs/data.json` -- seeded with a real sample from the latest scan; gets
  overwritten automatically by the scheduled workflow
- `export_to_json.py` -- converts the master workbook's DASHBOARD sheet to
  `docs/data.json`
- `.github/workflows/deploy.yml` -- pulls the latest workbook from the
  scanner repo and refreshes the dashboard data on a schedule

## Manual Refresh

You can also trigger the data refresh anytime from the Actions tab by running
the "Update Dashboard Data" workflow manually (workflow_dispatch), or run
locally:

```
python export_to_json.py path/to/workbook.xlsx
```
