# Adhishtam

Website project for **Adhishtam Digital Solutions** — a digital marketing and
creative agency (adhishtam.com, [@adhishtam.in](https://instagram.com/adhishtam.in)).

Right now this repo holds the client's brand and portfolio material, cleaned up
and organised. The site itself is not built yet.

👉 **[BRAND.md](BRAND.md)** is the working reference — name, colours, services,
positioning, and the open questions that need the client's answer.

---

## Layout

```
brand/              logo + palette
company-profile/    the 2026 profile deck, plus page-by-page PNG renders
portfolio/          client work — logos/ and print/
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

## Next

The website. Nothing has been decided yet — stack, scope, page structure and
hosting are all open. `BRAND.md` lists what is still missing from the client
before a full site can be built (fonts, transparent logo/SVG, office address,
team, case-study detail, testimonials).
