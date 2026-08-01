# What's built

A complete record of the Adhishtam Digital Solutions website as it stands.
Companion docs: [README.md](README.md) for how to work on it,
[DEPLOY.md](DEPLOY.md) for hosting, [BRAND.md](BRAND.md) for the brand itself,
[assets/anim/README.md](assets/anim/README.md) for the motion assets.

---

## At a glance

| | |
|---|---|
| **Live** | <https://adhishtam.com> — since 2026-08-01 |
| **Hosting** | GitHub Pages, published by GitHub Actions. Hostinger supplies the domain only |
| **Repo** | `roshanvijay37/adhishtam` (public — required for Pages on the free plan) |
| **Stack** | Hand-written static HTML, CSS and vanilla JS. **Zero dependencies, no build step, no framework** |
| **External requests** | **None.** Fonts are self-hosted; nothing is fetched from a third party at runtime |
| **Pages** | 6, plus a custom 404 |
| **Critical path** | ~99 KB (HTML + CSS + JS + both fonts) |
| **Source files** | `assets/css/style.css` (52 KB), `assets/js/main.js` (32 KB) — one of each |

---

## The six pages

| Page | Contains |
|---|---|
| **index.html** | Hero, service ticker, about teaser, nine service cards, four featured projects, client strip, why-us, ridge, CTA |
| **about.html** | Page header, full story with word-by-word reveal, vision & mission, four-step process, client strip, CTA |
| **services.html** | Page header, all nine departments as an accordion (deep-linkable `#d1`–`#d9`), why-us, CTA |
| **portfolio.html** | Page header, eight-category filter, work grid, client strip, CTA |
| **blog.html** | Page header, three queued post cards, "suggest a topic" panel |
| **contact.html** | Page header, enquiry form, studio address, phone, WhatsApp, socials |
| **404.html** | Self-contained, inline-styled, detects GitHub Pages vs the live domain and fixes its own links |

Every page carries its own `<title>`, meta description, canonical URL and
Open Graph tags. All six are in `sitemap.xml`.

---

## Design system

### Colour — the client's own swatch

| Token | Value | Use |
|---|---|---|
| `--green` | `#236147` | Brand green, CTA band |
| `--green-dk` / `--green-dker` | `#17402f` / `#0e2a1e` | Section backgrounds |
| `--ink` | `#061710` | Page background, text on gold |
| `--cream` | `#fffef4` | Body text on dark, light sections |
| `--gold` / `--gold-dp` / `--gold-lt` | `#c9a961` / `#b8943e` / `#e8ce8e` | Accents, rules, numerals, gradients |

Cream on ink ≈ 15:1, gold on ink ≈ 8.3:1, cream on brand green ≈ 7.3:1. Gold on
green is ~3.3:1 and is therefore used **only** at display sizes, never for body
copy.

> The logo artwork is built in `#385940`, a slightly greyer green than the
> `#236147` on the swatch. It only ever appears on cream, or reversed to cream
> on dark, so the two never sit side by side. See BRAND.md.

### Type

Self-hosted variable fonts, 71 KB for both, `font-display: swap`.

- **Sora** — display. Squared, angular geometry that echoes the ADHISHTAM wordmark.
- **Inter** — body. Nothing reads better at 15px on a phone.

All sizes are fluid `clamp()` — no breakpoint jumps. Display type is tracked to
`-0.04em` because Sora is a wide face.

### Layout

Fluid `--pad` gutter with `env(safe-area-inset-*)` for notched phones, `1320px`
max width, CSS grid throughout with `auto-fit`/`auto-fill` so most sections
collapse without a media query.

---

## Motion and interaction

Everything below is in `assets/js/main.js` (20 self-contained IIFEs) and the
**MOTION LAYER** block of `assets/css/style.css`.

### Committed motion assets — `assets/anim/`

Six SVGs, **18 KB gzipped in total**, all lazy-loaded except the grain tile.
Each animates *inside the file* via CSS and SMIL, so they work through `<img>`
where scripts don't run, and each carries its own `prefers-reduced-motion`
guard because an `<img>`-loaded SVG never sees the page's media queries.

| Asset | What it is | Where |
|---|---|---|
| `topo-summit.svg` | 13 contour rings, each perturbed by four summed sine harmonics, breathing on staggered offsets, rotating once per 4 min | Behind the process steps |
| `hex-drift.svg` | The deck cover's honeycomb; a third of 132 cells glow on seeded-random offsets | Why-us section, page headers |
| `ridge.svg` | Three parallax mountain profiles by midpoint displacement, seamless by construction | Band above the CTA |
| `gold-flow.svg` | Three gold masses warped by static turbulence, drifting past each other | Behind the CTA |
| `mark-orbit.svg` | The mark with a spark running the gold arc (SMIL `animateMotion`) | Footer watermark |
| `grain.svg` | Seamless `feTurbulence` tile at ~5%, jittered by a `steps()` transform | Full-page overlay |

### Interactions

**Hero** — pointer-reactive hexagonal lattice on canvas; gold motes drifting
upward with constellation threads between close pairs; a ripple wavefront on
tap or click (works on touch); parallax drift and dim on scroll-out.

**Type** — three-line kinetic headline reveal; metallic sweep across gold text;
headings wipe upward into place; word-by-word scroll reveal on the About copy,
where only words crossing the threshold are touched per frame.

**Navigation** — scroll progress bar; sticky nav state; scroll-spy; nav labels
swap upward on hover; full-screen mobile menu with staggered links;
cross-document page transitions via `@view-transition` (CSS only, no JS).

**Portfolio** — FLIP filtering, so cards glide to new grid slots rather than
teleporting; a warm light tracking the pointer across each card; cursor morphs
to read **VIEW**; lightbox with keyboard navigation, focus trap and filter-aware
stepping; blur-up loading from a ~1 KB base64 thumbnail baked into each card.

**Services** — accordion with height transitions; nine line-art icons that draw
themselves on open (`pathLength="1"` normalises all 19 paths to one dash rule);
a gold thread drawing along each row on hover.

**Other** — 5.2-second choreographed intro on the home page only, time-driven
with a 9-second hard ceiling; counters; magnetic buttons; custom cursor;
scroll-velocity marquee that surges, drags and reverses with the wheel; rules
drawing in under the hero stats.

### Enhancement layer

Added on top of the above; nothing was replaced. Purely additive — no copy,
layout, spacing, type or palette change, and no page markup touched. Each is
pointer-driven (zero idle cost) or folded into a scroll frame that was already
scheduled, so no new always-on animation was introduced.

| | |
|---|---|
| **Specular sweep on buttons** | A narrow highlight travels the gold on hover, so buttons read as the same foil as the gold text. Painted as a second background layer — `::after` is taken by the cream fill — parked off-canvas at rest so buttons are pixel-identical when idle. The transition sits on `:hover` only, so it sweeps in and snaps back invisibly instead of sweeping backwards. |
| **Ambient spotlight** | A soft gold glow lags the cursor across the dark sections, extending the portfolio-card pointer light into one lighting model. A fixed-size child moved by `translate3d`, so nothing repaints. Its rAF starts on pointer entry and stops once the easing settles, so an idle page runs no frames. Hero, page headers and the CTA are excluded — they already carry their own light. |
| **Card border highlight** | A gold segment of the border lights where the cursor is, on `.card` and `.post`. Guarded by `@supports` for `mask-composite`: without it the radial would flood the card instead of masking to its edge, so unsupported browsers get nothing rather than something wrong. |
| **Form field focus** | A rule draws under the focused field, plus inset warmth. An inset shadow rather than a ring, so it can't be confused with the focus outline. |
| **Backdrop parallax** | The decorative SVGs drift against the scroll so they sit behind the content plane. Only in-view layers are touched. Uses `transform`, not `translate`, because `.deco--topo` is centred with the `translate` property and the two compose. |

Cost: **+3 KB CSS, +2 KB JS** gzipped. All five are gated on
`hover:hover`/`pointer:fine` where pointer-driven, degrade to nothing without
JS, and are switched off under `prefers-reduced-motion` — the specular band is
removed outright there, since with transitions disabled it would land as a flash.

---

## Content

### Services — 113 listed across 9 departments

Brand Strategy & Identity (12) · Graphic Design (12) · Web Design &
Development (12) · Digital Marketing & Ads (16) · Social Media (12) · Video &
Motion (14) · Photography (11) · Print & Production (14) · Strategy, Consulting
& PR (10)

### Portfolio — 7 pieces

| Client | Sector | Categories |
|---|---|---|
| Mövenpick Hotels & Resorts | Hospitality, Bahrain | Print, Graphic |
| Explore Beds | Travel, Bahrain | Print, Graphic, Branding |
| Alva's AIMSARC | Medical education | Graphic, Digital Marketing |
| Bright Horizon International School | Education, Venur | Print, Graphic |
| MN Interior | Interior design | Branding, Graphic |
| Sanath's Sphere | Content creator | Branding |
| Divine Fragrances | Perfume | Branding |

### ⚠️ The gap

**Four of the eight portfolio filters have no work behind them** — Social
Media, Web Design, Video Editing, Photography. They fall back to a "request
samples" card. Social and video are most of what the agency sells, so this is
the most damaging omission on the site.

Also missing, in rough order of impact:

1. **Testimonials** — none. Highest-converting element on an agency site.
2. **Case-study detail** — no dates, brief, or outcome for any project.
3. **Own photography** — no team, studio or behind-the-scenes images, for a
   company that sells photography and video.
4. **Blog copy** — three topics outlined in `blog.html`, none written.
5. **An SVG logo** — the committed PNGs are knocked out of a 135 MB raster master.
6. **The real display font** — Sora is a well-matched stand-in, not their face.

No amount of further design work substitutes for these.

---

## Accessibility and resilience

- **Works with JavaScript disabled.** `html:not(.js)` rules settle every
  animated element, remove the preloader and open the accordions.
- **`prefers-reduced-motion` honoured** in the stylesheet, in the JS, and
  separately inside each motion SVG.
- Skip link, visible focus rings, `aria-expanded` on the accordion and burger,
  `aria-current` on the active nav item, labelled icon-only links, `alt=""` +
  `aria-hidden` on everything decorative.
- Lightbox is a proper modal: `role="dialog"`, `aria-modal`, focus trapped
  while open and returned to the originating card on close.
- Every tap target clears 44px; form inputs are locked to 16px so iOS Safari
  does not zoom the page on focus.
- Touch devices get always-visible portfolio captions, because hover-only
  reveals leave them looking at unlabelled images.

---

## Performance

| | |
|---|---|
| Critical path | ~102 KB (HTML + CSS + JS + 2 fonts) |
| Page HTML, gzipped | 2–5 KB each |
| Motion assets | 18 KB gzipped, all but one lazy-loaded |
| Images | 1.3 MB total, re-encoded down from 25 MB of source |
| External requests | none |

Deliberate choices: fonts self-hosted to remove a third-party DNS lookup, TLS
handshake and render-blocking stylesheet; images cached for a year, CSS and JS
for a day (they are edited in place with no content hash); `gold-flow.svg`
filters static content and animates the wrapper, because animating
`baseFrequency` would re-run a noise filter every frame.

---

## Infrastructure

`.github/workflows/deploy.yml` runs on every push to `main`:

1. **Assembles** only the site — `index/about/services/portfolio/blog/contact.html`,
   `404.html`, `robots.txt`, `sitemap.xml`, `assets/`, `.nojekyll`, `CNAME`.
2. **Guards the shared shell** — extracts the nav and footer from all six pages,
   normalises the current-page markers, and fails the build if any copy has
   drifted. This is what makes six duplicated headers safe.
3. **Guards against leaks** — fails if `brand/`, `company-profile/`,
   `portfolio/`, `_archive/`, `.git` or any `.md` reaches the artifact.
4. **Publishes** to Pages.

The brand masters, profile deck and internal notes are in the repo but **never
uploaded**, so they cannot be requested over HTTP. Verified: `/BRAND.md`,
`/brand/`, `/portfolio/`, `/company-profile/`, `/assets/anim/README.md` all
return 404.

Two source PDFs (the 140 MB profile deck and 135 MB logo master) exceed
GitHub's 100 MB file limit and are gitignored — they live locally only, with
committed PNG renders standing in.

---

## Decisions worth not undoing

- **Don't reintroduce Google Fonts.** Self-hosting is why there are no external
  requests.
- **Don't animate `baseFrequency` in `gold-flow.svg`.** It looks identical and
  re-runs the filter every frame.
- **Don't flip Pages back to branch-deploy.** That would serve the whole repo,
  brand masters included, under the client's domain.
- **Edit the nav and footer in all six pages together.** CI will stop the
  deploy otherwise, but it is still six edits.
- **Don't shorten the 5.2s intro without asking.** It is deliberate and was
  requested; the trade-off against mobile bounce has been flagged and not yet
  resolved.
- **Form inputs must stay at 16px.** Anything smaller makes iOS zoom.

---

## Verified, and not

**Verified by request against the live site:** all six pages plus the 404
return correctly; every asset resolves; source material is unreachable; HTTPS,
`www` and the old `github.io` URL all redirect to the apex; the certificate is
valid and auto-renewing; `og:` tags and the share card are served; HTML, CSS
and JS parse with balanced structure; the shared shell is byte-identical
across pages; every internal link resolves to a file that exists.

**Not verified:** how any of it actually looks or feels. There is no browser on
the machine this was built on, so nothing here has been seen rendered. The
items most likely to feel wrong rather than look wrong are the scroll-reactive
marquee, the hex ripple, the FLIP filter transition and the length of the
intro. A pass on a real phone is the outstanding task.
