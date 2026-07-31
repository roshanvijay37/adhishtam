# Deploying to Hostinger

Target: the site served at the **root of the domain**, updated by **hPanel's Git
integration** pulling from `https://github.com/roshanvijay37/adhishtam.git`.

> **Assumption to check first.** Nobody confirmed the domain, so every canonical
> URL, the sitemap and the social-share tags are written for **`adhishtam.com`**
> — the address printed on the 2026 profile deck cover. If the real domain is
> anything else, fix it before going live: see [Changing the domain](#changing-the-domain).

---

## Before you start

**Empty `public_html`.** Hostinger's Git integration refuses to clone into a
folder that already has files, and a fresh account ships with a placeholder
`index.html` or `default.php`. In hPanel → **File Manager**, open `public_html`
and delete everything inside it.

**Point the domain at Hostinger.** If the domain was bought from Hostinger this
is already done. If it is registered elsewhere, change its nameservers to
`ns1.dns-parking.com` and `ns2.dns-parking.com` at the registrar, then wait for
propagation — usually under an hour, occasionally up to 24.

---

## 1. Connect the repository

hPanel → **Websites** → your site → **Advanced** → **GIT**.

| Field | Value |
|---|---|
| Repository address | `https://github.com/roshanvijay37/adhishtam.git` |
| Branch | `main` |
| Directory | *leave blank* — blank means `public_html` |

Hit **Create**. The repo is public, so no SSH key or token is needed. It clones
in a few seconds.

Visit the domain. The site should be there.

## 2. Turn on HTTPS

hPanel → **Security** → **SSL** → install the free Let's Encrypt certificate for
the domain, and wait for it to say *Active*.

Do this **before** trusting the HTTPS redirect in `.htaccess`. If you force
HTTPS with no certificate installed, visitors get a browser security warning
instead of the site.

## 3. Make pushes deploy themselves

By default Hostinger only pulls when you click **Deploy**. To make it automatic:

1. In hPanel's GIT page, copy the **webhook URL** shown next to the repository.
2. GitHub → the repo → **Settings** → **Webhooks** → **Add webhook**.
3. Payload URL: paste it. Content type: `application/json`. Trigger: *Just the
   push event*. Leave the secret blank.
4. **Add webhook.**

From then on, `git push` → live in a few seconds.

## 4. Pick a canonical hostname

Right now the site answers on both `adhishtam.com` and `www.adhishtam.com`,
which splits your SEO between two addresses. Open `.htaccess`, find the
**canonical host** block, and uncomment **one** of the two rules — whichever
matches the version you want people to see. Then push.

Leave both commented until the domain actually resolves, or you can lock
yourself out with a redirect to a hostname that isn't pointed yet.

---

## What is and isn't public

Git deploy clones the **whole repository** into `public_html` — including the
brand masters, the profile deck renders, `BRAND.md` and the `.git` directory
itself. `.htaccess` blocks all of it:

- `/.git/` — otherwise anyone could reconstruct the repo from the server
- `/brand/`, `/company-profile/`, `/portfolio/`, `/_archive/`
- every `.md`, `.ps1`, `.zip`, `.sql`, `.log`, `.bak` at the root
- directory listings, everywhere

The website only ever reads from `assets/`, so nothing on the site breaks.
**Do not delete those rules.** If you later switch to uploading files by hand,
they stop mattering — but with Git deploy they are the only thing standing
between the public and the source material.

Verify after go-live — all four should return 404, not a file listing:

```
https://adhishtam.com/.git/config
https://adhishtam.com/brand/
https://adhishtam.com/BRAND.md
https://adhishtam.com/company-profile/
```

---

## Changing the domain

The domain is hardcoded in four files. Change all of them together:

| File | What to change |
|---|---|
| `index.html` | `<link rel="canonical">`, `og:url`, `og:image`, and `"url"` in the JSON-LD block |
| `blog.html` | `<link rel="canonical">`, `og:url`, `og:image` |
| `robots.txt` | the `Sitemap:` line |
| `sitemap.xml` | both `<loc>` entries |

From Git Bash in the repo folder, this does all of it at once — replace the
second address with the real one:

```bash
grep -rl 'adhishtam\.com' --include='*.html' --include='*.txt' --include='*.xml' . \
  | xargs sed -i 's|adhishtam\.com|yourdomain.com|g'
```

Then check nothing was missed: `grep -rn 'adhishtam\.com' --include='*.html' --include='*.txt' --include='*.xml' .`

---

## The GitHub Pages copy

`https://roshanvijay37.github.io/adhishtam/` stays live as a staging URL. Two
copies of the same content would normally compete in search, but every page
carries a canonical tag pointing at the real domain, so Google will index the
domain and ignore the staging copy.

The 404 page detects which host it is on and fixes its own links accordingly.

If you would rather the staging copy did not exist at all: GitHub → repo →
**Settings** → **Pages** → Source → **None**.

---

## After go-live

- [ ] Site loads over `https://` with a valid padlock
- [ ] The four blocked URLs above return 404
- [ ] Contact form opens an email; WhatsApp button opens a chat
- [ ] Canonical host rule uncommented in `.htaccess`
- [ ] Submit `https://adhishtam.com/sitemap.xml` in
      [Google Search Console](https://search.google.com/search-console)
- [ ] Add the domain to the Google Business Profile and the Instagram bio

---

## If Git deploy isn't on your plan

Some entry-level shared plans don't include the Git integration. In that case
upload by hand — and the picture is *better*, because you only upload the site:

```
index.html   blog.html   404.html   robots.txt   sitemap.xml
.htaccess    .nojekyll   assets/
```

Zip exactly those, upload the zip into `public_html` via **File Manager**, then
right-click → **Extract**, and delete the zip. About 1.5 MB. Skip `brand/`,
`company-profile/`, `portfolio/` and the `.md` files entirely — they are source
material, not part of the site.

Note that File Manager hides dotfiles by default. `.htaccess` is essential —
if it doesn't appear after extracting, enable hidden files in the File Manager
settings and confirm it's there.
