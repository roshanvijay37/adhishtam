# Adhishtam

Website project for **Adhishtam Digital Solutions** — a digital marketing and
creative agency (adhishtam.com, [@adhishtam.in](https://instagram.com/adhishtam.in)).

👉 **[BRAND.md](BRAND.md)** is the working reference — name, colours, services,
positioning, and the open questions that still need the client's answer.

---

## The site

A hand-written static site. **No build step, no dependencies, no framework** —
open `index.html` in a browser and it runs. That is deliberate: it deploys to
GitHub Pages as-is, moves to Hostinger by uploading the same folder, and needs
no Node toolchain to maintain.

| | |
|---|---|
| `index.html` | Home, About, Services, Portfolio, Clients, Why, Process, Contact |
| `blog.html` | Journal index — three posts queued, none written yet |
| `404.html` | Self-contained; its two links are root-absolute (see the note inside) |
| `assets/css/style.css` | Everything. Custom properties, fluid type, no preprocessor |
| `assets/js/main.js` | ~380 lines, vanilla. Preloader, cursor, hex canvas, reveals, accordion, portfolio filter, contact form |
| `assets/img/` | Web-optimised: 1.3 MB total, down from 25 MB of source |
| `.nojekyll` | Stops GitHub Pages running the files through Jekyll |

**Fonts** are Syne (display) + Poppins (body), from Google Fonts — the only
external request the site makes. Poppins matches the profile deck; Syne is a
stand-in until the client names their real display face.

**The contact form has no backend**, because a static host cannot have one. It
composes a `mailto:` or a pre-filled WhatsApp message from the fields. Nothing
is stored or sent server-side. If they want real form submissions later, a
Formspree/Web3Forms endpoint is a five-line change.

Accessibility and resilience were built in, not bolted on: the whole site is
usable with JavaScript disabled (`html:not(.js)` fallbacks settle every
animated element), honours `prefers-reduced-motion`, keeps visible focus rings,
and labels the icon-only links.

### Running it

There is no dev server and none is needed — double-click `index.html`. The only
caveat is that `file://` blocks nothing here, so what you see locally is what
Pages will serve.

## Layout

```
index.html          the site
blog.html
404.html
assets/             css, js, and web-optimised images
brand/              logo + palette (source)
company-profile/    the 2026 profile deck, plus page-by-page PNG renders
portfolio/          client work, full resolution — logos/ and print/
_archive/           original delivery zip (not in git)
```

Everything was renamed on the way in: descriptive, lowercase, hyphenated,
no spaces. The original names were things like `BH.png`, `move.png`,
`post 1-01.jpg` and `ALVAS 2.png`, which say nothing about what they are.

| Now | Was |
|---|---|
| `brand/adhishtam-logo-primary.pdf` | `logo.pdf` |
| `brand/brand-palette-reference.jpeg` | `WhatsApp Image 2026-07-29 at 8.49.38 PM.jpeg` |
| `company-profile/adhishtam-company-profile-2026.pdf` | `ADHISHTAM PROFILE 2026.pdf` |
| `portfolio/logos/sanaths-sphere-logo.png` | `web/web/LOgos/LOGO.png` |
| `portfolio/logos/mn-interior-logo.jpg` | `web/web/LOgos/post 1-01.jpg` |
| `portfolio/logos/divine-fragrances-logo.pdf` | `web/web/LOgos/Divine Fragrances Logo bg .pdf` |
| `portfolio/print/alvas-aimsarc-admissions-poster.png` | `web/web/posters/ALVAS 2.png` |
| `portfolio/print/bright-horizon-school-brochure.png` | `web/web/posters/BH.png` |
| `portfolio/print/explorebeds-brochure-mockup.jpeg` | `web/web/posters/Mockup.jpeg` |
| `portfolio/print/movenpick-prive-143-menu.pdf` | `web/web/posters/Menu.pdf` |
| `portfolio/print/movenpick-prive-143-menu-mockup.png` | `web/web/posters/move.png` |

The doubled `web/web/` nesting and the macOS `__MACOSX/` + `._*` resource-fork
artifacts that came out of the zip were deleted — they carried no content.

## Files not in git

Two source PDFs are over GitHub's 100 MB per-file hard limit, so they are
gitignored and live only on the local machine, in their normal place in the
tree above:

| File | Size |
|---|---|
| `company-profile/adhishtam-company-profile-2026.pdf` | 140 MB |
| `brand/adhishtam-logo-primary.pdf` | 135 MB |

Neither is lost, and neither is a blocker — usable renders **are** committed:
`company-profile/pages/profile-page-01..08.png` covers the whole deck, and
`brand/adhishtam-logo-primary.png` is a 2400 px render of the logo.

Both PDFs are bloated by embedded full-resolution raster art; a re-export at
sane settings would very likely land each under 10 MB and could then be
committed normally. Git LFS is the other option if the originals must be
versioned byte-for-byte. Ask before doing either — it means re-exporting a
client master file.

`_archive/web-original-delivery.zip` is also ignored: it unpacks to exactly
the files already committed under `portfolio/`.

## How the deck was read

The profile PDF is image-flattened, so it has no extractable text layer, and
this machine has no Python, Node, or poppler. The pages were rendered to PNG
through the `Windows.Data.Pdf` API that ships with Windows, driven from
PowerShell, then read as images. Those renders are the `company-profile/pages/`
files.

## Deployment

**GitHub Pages, published by GitHub Actions.** Hostinger supplies the domain
name and nothing else — there is no server to log into.

Push to `main` → [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)
copies the site into `_site` → Pages serves it over a CDN with free,
auto-renewing HTTPS. Currently live at
`https://roshanvijay37.github.io/adhishtam/` until the domain is pointed.

The workflow publishes **only** `index.html`, `blog.html`, `404.html`,
`robots.txt`, `sitemap.xml`, `assets/` and `.nojekyll`. `brand/`,
`company-profile/`, `portfolio/`, the `.md` files and `.git` are never uploaded,
so they are unreachable over HTTP — and a guard step fails the build if any of
them ever appear in the artifact.

`.htaccess` is dormant: Pages ignores it, and it's excluded from the artifact.
It stays only so a future move back to Apache hosting is quick.

**[DEPLOY.md](DEPLOY.md)** has the DNS records, the ordering that matters, and
the go-live checklist.

The domain is written as `adhishtam.com` in four files (`index.html`,
`blog.html`, `robots.txt`, `sitemap.xml`). **Assumed from the profile deck
cover, never confirmed** — DEPLOY.md has the one-liner that changes it
everywhere.

## Still needed from the client

The site is live-ready but four of the eight portfolio filters — Social Media,
Web Design, Video Editing, Photography — have **no work to show**, and fall
back to a "request samples" card. That is the biggest gap, and it is odd given
social and video are most of what they sell.

Also outstanding:

- **The real display font.** Syne is a placeholder.
- **A vector logo (SVG).** The committed PNGs are traced off a 135 MB raster
  master; an SVG would sharpen the header and favicon.
- **Case-study detail** — dates, brief, outcome for each portfolio piece.
- **Testimonials** and **team names/photos**.
- **Blog posts.** Three topics are outlined in `blog.html`; none are written.
- **Confirmation of the two phone numbers** — the deck shows +91 8762700493,
  the client sent 7618791635 for WhatsApp. Both are on the site as-is.
