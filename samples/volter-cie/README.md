# VOLTIER & CIE. — Twelve-Page Flagship (Static Sample)

An elite-tier sample for the Resplend Studio portfolio. A static HTML/CSS
deliverable targeting **Netlify file upload** — no build step, no dev server,
no npm.

## Files

```
samples/volter-cie/
├── index.html                  The maison — chapter index / hub
├── calibre.html                The Calibre V-12
├── collection.html             The Collection (four references)
├── reference-12-04.html        Reference 12.04 «Platine»
├── atelier.html                The Atelier (twelve benches, north light)
├── artisans.html               The Hands (twelve named watchmakers)
├── heritage.html               Heritage, 1912 → 2024
├── materials.html              Materials & métiers d'art
├── journal.html                The Journal — entry index
├── journal-twelve-weeks.html   Twelve Weeks of Line (long-form article)
├── acquisition.html            Acquisition — register & audition
├── salons.html                 Salons — Geneva · New York · Tokyo · Dubai
│
├── styles.css                  Core design system (tokens, layout, motion)
├── pages.css                   Shared extension layer for the 12-page shell
├── volter-cie.js               Core behaviour (preloader, tilt, 360, cart, …)
└── pages.js                    Shared page behaviour (menu, accordions, …)
```

Every subpage copies a single canonical shell (orbs, header, 12-link menu
overlay, page-nav, footer, cart drawer, scripts). The two shared CSS files
and the two shared JS files are loaded identically on all 12 pages — change
a token once, the whole house moves.

## Deploy

Drag the entire `volter-cie/` folder onto Netlify (drag-and-drop works),
or zip the folder and upload. No `package.json`, no build command.

All 12 HTML files link to the same four shared assets and load Tailwind,
Lucide, and Google Fonts from CDN:

- `https://cdn.tailwindcss.com`
- `https://unpkg.com/lucide@latest/dist/umd/lucide.min.js`
- `https://fonts.googleapis.com/css2?family=Cormorant+Garamond…&family=Plus+Jakarta+Sans…`

These are loaded over HTTPS at runtime — nothing to install.

## Pages at a glance

| # | File | Subject | Prev | Next |
|---|---|---|---|---|
| 01 | `index.html` | The maison (hub) | — | `calibre.html` |
| 02 | `calibre.html` | Calibre V-12, 312 components | `index.html` | `collection.html` |
| 03 | `collection.html` | Four references, 48 pieces | `calibre.html` | `reference-12-04.html` |
| 04 | `reference-12-04.html` | Ref. 12.04 «Platine» | `collection.html` | `atelier.html` |
| 05 | `atelier.html` | The atelier, Geneva | `reference-12-04.html` | `artisans.html` |
| 06 | `artisans.html` | The twelve watchmakers | `atelier.html` | `heritage.html` |
| 07 | `heritage.html` | 1912 → 2024 timeline | `artisans.html` | `materials.html` |
| 08 | `materials.html` | Metals & métiers d'art | `heritage.html` | `journal.html` |
| 09 | `journal.html` | The Journal — index | `materials.html` | `journal-twelve-weeks.html` |
| 10 | `journal-twelve-weeks.html` | Long-form article | `journal.html` | `acquisition.html` |
| 11 | `acquisition.html` | Acquisition & register | `journal-twelve-weeks.html` | `salons.html` |
| 12 | `salons.html` | The four salons | `acquisition.html` | `index.html` |

## Shared component library

All twelve pages draw from the same vocabulary defined in `pages.css`:

- **Page hero** `.vc-phero` (with optional `.vc-phero--plate` media plate)
- **Section** `.vc-section` + `.vc-section--alt` (alternating backgrounds)
- **Tiles (bento)** `.vc-tiles` with `.vc-tiles__c4/c5/c6/c7/c8/c12` spans
- **Figure** `.vc-figure --tall|--wide|--square` inside `.vc-gallery`
- **Editorial split** `.vc-split` + `.vc-prose` (sticky label column)
- **Spec table** `.vc-specs`
- **Stat rail** `.vc-stats` with `data-count` count-up
- **Timeline** `.vc-time` (z-axis cascade)
- **People** `.vc-people` + `.vc-person`
- **Journal grid** `.vc-jgrid` + `.vc-jcard` (and `.vc-jfeature`)
- **Accordion** `.vc-acc` (one-open-per-group, keyboard)
- **Tabs** `.vc-tabs` + `.vc-tabpanel`
- **Quote** `.vc-quote` + `.vc-sig`
- **Marquee** `.vc-marquee` (place between sections)
- **Form** `.vc-form` (non-functional, `onsubmit="return false"`)
- **Closing band** `.vc-band` (with `.vc-band__glow`)
- **Page-nav** `.vc-pagenav` (prev / next chapter)
- **Header** `.vc-header` (floating pill, condenses on scroll)
- **Menu overlay** `.vc-menu` (12 links, stagger reveal, hamburger morph)
- **Cart drawer** `.vc-cart` (free-shipping progress, upsell, shimmer CTA)

## Notes

- No real cart persistence — cart resets on page reload.
- Locale switcher is visual only — no currency conversion happens.
- All imagery is loaded from Unsplash CDN with size-variant query params.
- No real product photography; Unsplash stand-ins throughout.
- Respects `prefers-reduced-motion`.
- The home page (`index.html`) acts as the chapter index and surfaces the
  other eleven pages through the chapters bento, the journal teaser, and
  the closing acquisition band.