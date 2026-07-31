# Deploying

**Hosting: GitHub Pages, via GitHub Actions. Hostinger supplies the domain name
and nothing else.**

Push to `main` → [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)
assembles the site → Pages serves it from GitHub's CDN with free, auto-renewing
HTTPS. There is no server to log into and nothing to upload.

## Status: live

**<https://adhishtam.com>** — went live 2026-08-01. Nothing below needs doing;
it is kept as the record of how it was set up and what to change if anything moves.

| Check | |
|---|---|
| `https://adhishtam.com` | 200, Let's Encrypt cert, auto-renewing |
| `http://` → `https://` | 301 |
| `www.adhishtam.com` → apex | 301 |
| `roshanvijay37.github.io/adhishtam/` → apex | 301 |
| Branded 404 on a bad URL | yes |
| `/BRAND.md`, `/brand/`, `/portfolio/`, `/company-profile/`, `/.htaccess` | 404 — never uploaded |

---

## What actually gets published

The repo holds more than the website. The workflow copies only these into the
published artifact:

```
index.html   blog.html   404.html   robots.txt   sitemap.xml   assets/   .nojekyll
```

Everything else — `brand/`, `company-profile/`, `portfolio/`, every `.md`, the
`.git` directory — is **never uploaded**, so it cannot be requested over HTTP at
any URL. A guard step in the workflow fails the build if any of those ever end
up in the artifact, so a careless edit can't quietly leak them.

This is stronger than the Apache `.htaccess` rules it replaces: those *blocked*
files that were sitting on the server. Here they were never there.

Verified on the live site — all return 404:
`/BRAND.md`, `/README.md`, `/.htaccess`, `/brand/…`, `/portfolio/…`, `/company-profile/…`

---

## How the domain was pointed

*Done — recorded here for reference, and for whoever has to move it next.*

### 1. DNS records

hPanel → **Domains** → your domain → **DNS / Nameservers** → DNS zone editor.

**Delete first:** the default `A` record for `@` that Hostinger created pointing
at their own server, and any `CNAME` for `www` they added. Leaving them causes
the domain to resolve to a parking page at random.

**Then add** — four `A` records on `@`, all four, they are a load-balanced set:

| Type | Name | Value |
|---|---|---|
| A | `@` | `185.199.108.153` |
| A | `@` | `185.199.109.153` |
| A | `@` | `185.199.110.153` |
| A | `@` | `185.199.111.153` |
| CNAME | `www` | `roshanvijay37.github.io.` |

IPv6 is optional but free and improves reach — `AAAA` on `@`:
`2606:50c0:8000::153`, `2606:50c0:8001::153`, `2606:50c0:8002::153`, `2606:50c0:8003::153`

> ### Leave the MX records alone
> If email at this domain is on Hostinger, its `MX` records live in this same
> zone. Changing `A` records does **not** affect email — but deleting the `MX`
> rows does. Only touch `A`, `AAAA` and the `www` `CNAME`.
>
> As of go-live **`adhishtam.com` has no `MX` and no `TXT` records at all** —
> there is no mailbox at this domain, and the business runs on
> `adhishtamofficial@gmail.com`. So nothing was at risk here. It also means
> that if a `name@adhishtam.com` address is ever wanted, `MX` records have to
> be added; the website will not be affected either way.

Propagation is usually minutes; allow up to 24 hours. Check with
`nslookup adhishtam.com` — you want the 185.199.x.x addresses back.

### 2. Tell GitHub the domain

Only once DNS resolves. A file called `CNAME` at the repo root holds the bare
domain, no protocol and no trailing slash:

```
adhishtam.com
```

> **Do not add `CNAME` before the DNS is live.** GitHub redirects the working
> `roshanvijay37.github.io/adhishtam/` URL to the custom domain the moment it
> is set. If that domain isn't answering yet, the site goes dark until it is.

**The file alone is not enough with Actions-based publishing.** It keeps the
setting stable across deploys, but the domain must also be registered against
the Pages site itself — GitHub → repo → **Settings** → **Pages** → *Custom
domain*. (This was done over the API; either way works.)

### 3. HTTPS

Same page, tick **Enforce HTTPS**. The box stays greyed out until GitHub has
issued the certificate — that took about five minutes here, and the redirect
itself took another minute or two to propagate after being switched on. Nothing
to buy and nothing to renew, ever.

### 4. Still worth doing

- [ ] Submit `https://adhishtam.com/sitemap.xml` to
      [Google Search Console](https://search.google.com/search-console)
- [ ] GitHub → **account** settings → **Pages** → verify the domain. Stops
      anyone else claiming it on their own repo if the DNS is ever left dangling.
- [ ] Put the domain in the Instagram bio and the Google Business Profile

---

## Day-to-day

Edit, commit, push to `main`. That's the whole process — the workflow runs in
about a minute. Watch it under the repo's **Actions** tab; a red run means
nothing was published and the previous version is still live.

To republish without a code change: **Actions** → *Deploy site to GitHub Pages*
→ **Run workflow**.

---

## Changing the domain

`adhishtam.com` is hardcoded in four files plus `CNAME`. If the domain ever
changes, change all of them together:

| File | What to change |
|---|---|
| `index.html` | `<link rel="canonical">`, `og:url`, `og:image`, `"url"` in the JSON-LD |
| `blog.html` | `<link rel="canonical">`, `og:url`, `og:image` |
| `robots.txt` | the `Sitemap:` line |
| `sitemap.xml` | both `<loc>` entries |

From Git Bash in the repo folder:

```bash
grep -rl 'adhishtam\.com' --include='*.html' --include='*.txt' --include='*.xml' . \
  | xargs sed -i 's|adhishtam\.com|yourdomain.com|g'
```

Then confirm nothing was missed:
`grep -rn 'adhishtam\.com' --include='*.html' --include='*.txt' --include='*.xml' .`

---

## Notes on what this setup can't do

**No server-side code.** No PHP, no database, no form endpoint. That is why the
contact form composes a `mailto:` or a pre-filled WhatsApp message instead of
posting anywhere. If real form submissions are wanted later,
[Web3Forms](https://web3forms.com) or [Formspree](https://formspree.io) both
have free tiers, work fine on a static host, and are roughly a five-line change
to `assets/js/main.js`.

**The repo must stay public** for Pages to work on the free plan.

**Limits** are 1 GB published size and 100 GB bandwidth a month. The site is
about 1.5 MB, so this is not a concern.

## The Hostinger hosting plan

With the site on Pages, the hosting half of the plan is doing nothing — you only
need the domain registration. Before cancelling anything, check whether the
plan is also providing **email** for the domain. If it is, keep whatever
Hostinger product covers mailboxes, or move email elsewhere first, otherwise
mail at this domain stops.

`.htaccess` is still in the repo but is **not in use** — Pages ignores it. It is
kept only so that moving back to Apache hosting is a five-minute job rather than
a rewrite. It is excluded from the published artifact.
