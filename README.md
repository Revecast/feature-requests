# Revecast Feature Requests

Public feature request and feedback tracker for the Revecast platform.

> **Browse and submit feedback at: https://revecast.github.io/feedback/**

This repository is the storage layer behind that site. Each issue is a feature request submitted by a Revecast customer. The polished browse + filter UI lives at [revecast.github.io/feedback/](https://revecast.github.io/feedback/) and reads from a snapshot (`data.json`) regenerated automatically on every issue change.

## How it works

```
Submitter → revecast.github.io/feedback/ → "Submit" button → GitHub Issue Form →
  Issue lands here → Action regenerates data.json → site reads it (no API calls)
```

## Submitting a feature request

The recommended path is via the [feedback site](https://revecast.github.io/feedback/), which routes you to the right Issue Form for your product.

You can also open issues directly here using the "New Issue" button — pick the form for the product the feedback applies to.

## Voting

React with 👍 on any open issue to vote. Vote counts power the "most-requested" view on the feedback site.

## Triage labels

| Label | Meaning |
| --- | --- |
| `product:psacore` | Revecast PSA |
| `product:recruiter` | Revecast Recruiter |
| `product:forms` | Revecast Forms |
| `product:kanban` | Revecast Kanban |
| `product:reporting` | Revecast Reporting Engine |
| `product:connect` | Revecast Connect |
| `product:desktop` | PSACore Desktop |
| `status:under-review` | Newly submitted, awaiting Revecast review |
| `status:planned` | Accepted; on the roadmap |
| `status:in-progress` | Actively being built |
| `status:shipped` | Released — see issue comment for version |
| `status:declined` | Won't build — see issue comment for reason |

## For Revecast maintainers

- The snapshot Action runs on every issue/label/reaction/comment event and commits an updated `data.json` to `main`.
- The site at `revecast.github.io/feedback/` fetches `https://raw.githubusercontent.com/Revecast/feature-requests/main/data.json` on load.
- To trigger a manual snapshot regeneration: re-run the latest "Snapshot" workflow run.
