# PSA Themed Data Wizard — Theme Catalogue

Live content source for the **PSA Admin Setup Wizard's Themed Data Wizard** (in `Revecast/PSACore`'s `psa-setup` package).

## Why this lives here

Same architectural pattern as the Reporting Engine: **ship the bridge, host the content.** The Salesforce package fetches this manifest at runtime so:

- New themes can be added by PR — no Salesforce package release required
- Customers see new themes within ~1 hour of merge (Platform Cache TTL)
- Theme content lives where it can be edited freely, not entombed in Apex

See `Revecast/PSACore/docs-internal/design-themed-data-wizard.html` for the full design.

## Structure

```
themes/
├── manifest.json          # the catalogue — what the wizard's Step 1 picker reads
├── README.md              # this file
└── content/               # per-theme JSON bodies (Phase E content authoring)
    ├── lotr.json
    ├── marvel.json
    └── ...
```

## URL the package fetches

```
https://raw.githubusercontent.com/Revecast/feature-requests/main/themes/manifest.json
```

Public; no auth required. Apex caches the result in Platform Cache for 1 hour.

## Adding a new theme

1. Add an entry to `manifest.json`. Required fields: `key`, `displayName`, `category`, `implemented` (false until step 2 also wires up), `featured`, `body`.
2. (Optional, for Phase E) Add the content body at `themes/content/<key>.json`. The body holds the per-section content the wizard's later steps consume — `roles`, `realms`, `casting`, `milestones`, `daysOff`, and `tasks` (see below).
3. Open a PR. CI will validate JSON syntax.
4. Merge → orgs see the new theme on their next manifest refresh.

## Project Tasks (`tasks[]`)

The wizard's **Project Tasks** step seeds a starter library of `Template Project Task` records (the templates the *Create Project Tasks* action on a Project pulls from). Like every other body section, it's content-driven: add a `tasks` array to a theme body and that theme seeds those tasks. A theme with no `tasks` section simply seeds nothing on that step — so you can add task sets to more themes over time, by PR, with no Salesforce release.

Each entry:

```json
"tasks": [
  {
    "name": "Convene the Council of Elrond",
    "type": "External Project",
    "phase": "Kick-Off",
    "dueOffset": 2,
    "description": "Run the kickoff workshop and align on scope, roles, and timeline."
  }
]
```

| Field | Required | Notes |
| --- | --- | --- |
| `name` | yes | The template task's name — flavor it in-universe (this is what makes it themed). |
| `type` | yes | Project Type the template applies to. Must be a value of the **Project_Type** global value set: `External Project`, `Managed Services`, `Internal Project`, `Individual Project`. |
| `phase` | recommended | A value of the **Project_Phase** global value set: `Setup`, `Kick-Off`, `Discovery`, `Design`, `Build`, `UAT`, `Go-Live`, `Hypercare`. |
| `dueOffset` | recommended | Whole days after the project's Kick-Off Date that the created task is due (`0` = on kick-off). |
| `description` | optional | Copied to the created task; keep it generic/instructional — the `name` carries the theme. |

Seeded tasks are created as `Sub_Type = Project Task`, `Status = Active`. Dedupe is by `(type, name)`, so re-running the step (or re-merging) never creates duplicates. Convention: one task per `(type, phase)` milestone, ~20 per theme across the four types — but any count works.

The 7 flagship themes (`lotr`, `marvel`, `dc`, `starwars`, `startrek`, `harrypotter`, `gameofthrones`) ship a full `tasks[]` set as the reference example.

## Categories

The wizard groups themes by category in the picker. Current set:

- **Comics** — Marvel, DC
- **Sci-Fi / Fantasy** — Star Wars, LOTR, Stranger Things, etc.
- **Mythology** — Greek, Norse, Hindu, Aboriginal Dreamtime, etc. (17+ traditions)
- **Sitcom** — Seinfeld, Friends, The Office (US), etc.
- **Drama** — Breaking Bad, Mad Men, Succession, etc.
- **Workplace** — Silicon Valley (HBO), Suits
- **Animation** — Pixar, Studio Ghibli, etc.
- **Video Games** — Mario, Zelda, Pokémon, etc.
- **Anime** — Naruto, Dragon Ball Z, One Piece
- **Pop Culture** — Indiana Jones, James Bond, Sherlock Holmes, etc.
- **Music** — The Beatles, Rock & Roll Hall of Fame
- **Education** — Famous Scientists, Famous Authors, NASA Astronauts

Add a new category by simply using a new `category` value in a manifest entry.

## Implementation status

- `implemented: true` — Step 2 (`createTestContacts` Apex) has full character/account content for this theme. User can run end-to-end.
- `implemented: false` — Theme appears in the picker but Step 2 will show "content authoring forthcoming". User can pick it but won't see contacts created.

Today (Phase A): 7 themes implemented (the original Apex set). All others are placeholders awaiting Phase E content.

## Body schema — v2 picker fields (added 2026-05-31)

Bodies bumped to `schema_version: 2` add three top-level fields the new card-based picker (`psaWizardStepThemeCard`) reads. v1 bodies still work — the picker degrades gracefully when a field is absent.

| Field | Type | Purpose |
| --- | --- | --- |
| `tagline` | string (≤80 chars) | One-line subhead under `displayName` on the picker card |
| `bestFor` | string[] (3–5 items) | Bulleted "what this dataset is great for" list on the card and in the comparison matrix |
| `capabilities` | object<string, boolean> | Fixed taxonomy — drives the comparison matrix checkmarks |

### Capability taxonomy (fixed set)

| Key | Meaning |
| --- | --- |
| `forecasting` | Has enough scheduled Project Schedule + Forecast Schedule volume to demo the Org Forecast surface |
| `pipeline` | Ships a meaningful set of `pipelineAccounts` + `pipelineOpportunities` (open pipeline, not just closed-won) |
| `billingVariety` | Realms cover every billing model (T&M, Fixed Fee, Drawdown, Subscription, etc.) |
| `timerDemos` | Casting + projects sized for the time-tracker + idle-detection demos |
| `setupWalkthroughs` | Suitable as the canonical "first wizard run" walkthrough |
| `brandRecognition` | Theme is broadly recognizable to a non-niche audience (Stranger Things, LOTR, Star Wars, etc.) |

Add new capability keys by amending this README and the matrix-rendering LWC at the same time. The wizard's comparison-matrix LWC reads this same taxonomy — drift will hide capabilities from the matrix.

### Author guidance for `bestFor`

3–5 short items, each a *demo scenario* (not a feature). Good: "Forecasting walk-throughs", "First-time wizard run". Bad: "Has 6 roles", "Includes pipeline data".
