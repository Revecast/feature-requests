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
2. (Optional, for Phase E) Add the content body at `themes/content/<key>.json`. Schema TBD; the wizard's Phase A only consumes the manifest.
3. Open a PR. CI will validate JSON syntax.
4. Merge → orgs see the new theme on their next manifest refresh.

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
