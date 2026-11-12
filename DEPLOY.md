# Deploy guide (beginner-friendly)

The site is a static website. Cloudflare Pages builds it from GitHub every time you push and hosts it for free. Allow about 30 minutes the first time.

## 1. Put the code on GitHub

The code already lives at **github.com/Soufiianee/plugin-solar-tracker** (branch `main`), so you can skip to step 2. For reference, to put a copy in a new repository from your computer:
   ```bash
   git init
   git add .
   git commit -m "Initial site"
   git branch -M main
   git remote add origin https://github.com/YOUR-NAME/plugin-solar-tracker.git
   git push -u origin main
   ```

## 2. Fill in the settings

Edit `config/site.json`:

| Setting | What to put |
|---|---|
| `SITE_NAME` | The site's name, "Balcony Solar Rules". This is the only place the name is set; the build refuses the old `TBD` placeholder. |
| `SITE_ALTERNATE_NAME` | Other name used in structured data ("Plug-in Solar Tracker"). |
| `BASE_URL` | `https://balconysolarrules.com` (https, no www, no trailing slash; the build checks the form). Used for canonical links, Open Graph, the sitemap, robots.txt, RSS and structured data. |
| `CONTACT_EMAIL` | `contact@balconysolarrules.com`, shown as text on /contact/ and /about/. Empty hides the contact page. |
| `MAILERLITE.account`, `MAILERLITE.form_id` | Your MailerLite account number and embedded form code (set to `2784312` / `o2Ywz2`). Empty values hide the signup everywhere. The "Certified kit alerts" box appears on every state page, in the tool result, on Certification watch and at the end of each guide; MailerLite's script loads only when a box comes near the screen (or when the tool reveals it). The visitor's state goes into the form's `state` field, so you can build a segment per state in MailerLite. |
| `MAILERLITE_PARTNERS_FORM_ID` | Form code of a **separate** MailerLite embedded form whose subscribers go to the group "Partners". Shown on /partners/. Empty = no form there, only the contact email. |
| (analytics) | Cloudflare Web Analytics is turned on in the Cloudflare dashboard with **automatic setup**: Cloudflare adds its beacon at the edge, so there is nothing in the code. It is cookieless, so no banner is needed. The site sends no Content-Security-Policy; if you add one, allow `static.cloudflareinsights.com` (script-src) and `cloudflareinsights.com` (connect-src). |

Affiliate links: every product link goes through `config/affiliates.json`. A link becomes sponsored only when **both** `affiliate_id` and `link_template` are set; it then gets a "Sponsored" label, a short disclosure next to it and `rel="sponsored noopener"`. Otherwise the plain official product URL is used. Example template: `{raw_url}?ref={id}`. The `rooftop_quotes` slot has no product URL: put the full approved partner link in `link_template` (it may contain `{id}`); until then the rooftop box on state pages shows no link. Commit and push after editing.

## Daily rebuild (effective dates)

Pages say "Starts January 1, 2027" or "In effect since January 1, 2027" depending on the date when the site is **built**. A GitHub Actions workflow, `.github/workflows/daily-rebuild.yml`, rebuilds the site every day at 10:15 UTC (00:15 in Hawaii, the last US state to reach a date), so effective dates flip on the day without anyone pushing. You can also run it by hand: GitHub → Actions → **Daily rebuild** → **Run workflow**.

One-time setup:
1. Cloudflare dashboard → Workers & Pages → your Pages project → **Settings → Builds → Deploy hooks** → **Add deploy hook**. Name it "Daily rebuild" and choose the production branch (`main`). Copy the URL.
2. GitHub → the repository → **Settings → Secrets and variables → Actions → New repository secret**. Name: `CF_DEPLOY_HOOK`, value: the URL. Treat it like a password: anyone with it can start builds.
3. Run the workflow once by hand and check that a new deployment appears in Cloudflare.

If the secret is missing, the workflow fails with a clear message instead of doing nothing silently.

## 3. Connect Cloudflare Pages

1. Create a free account at dash.cloudflare.com.
2. Go to **Workers & Pages → Create → Pages → Connect to Git**, authorise GitHub, and pick your repository.
3. Build settings:
   - Framework preset: **Astro**
   - Build command: `npm run build` (this validates the data first, and **the build fails if any data is invalid**, by design)
   - Build output directory: `dist`
   - Root directory: leave empty (the project is at the top of the repository).
   - Environment variable: `NODE_VERSION` = `22`
4. Click **Save and Deploy**. After a minute or two you get a `*.pages.dev` address. Open it and check a few pages.

Netlify works the same way: build command `npm run build`, publish directory `dist`.

## 4. Add your own domain

1. In the Pages project, open **Custom domains → Set up a custom domain** and type your domain.
2. If the domain is already on Cloudflare, it adds the DNS record for you. Otherwise, add the CNAME record it shows at your domain registrar.
3. Wait until the status says **Active** (minutes to a few hours). HTTPS is automatic.
4. Make sure `BASE_URL` in `config/site.json` matches the domain exactly, then push again.

## 5. Tell search engines

**Google Search Console**
1. Go to search.google.com/search-console and add a **Domain** property for your domain.
2. Verify it with the TXT record Google gives you (add it in Cloudflare DNS).
3. Open **Sitemaps**, enter `sitemap.xml`, and submit.

**Bing Webmaster Tools**
1. Go to bing.com/webmasters and choose **Import from Google Search Console**, the quickest route. Or add the site by hand and verify it.
2. Submit `https://your-domain/sitemap.xml` under **Sitemaps**.

## 6. Keep it current

- Once a week, run the prompt in `MAINTENANCE_PROMPT.md` in Claude Code. It re-checks the sources, updates the data and pushes. Cloudflare redeploys automatically.
- `npm run staleness` shows what is due for a re-check.
- The page countdowns ("takes effect in N days") are computed in the browser. Dates printed on pages are fixed at build time, so redeploy at least weekly.

## Indexing

- `public/_headers` sends `X-Robots-Tag: noindex` on `plugin-solar-tracker.pages.dev` and its preview subdomains, so only https://balconysolarrules.com is indexed.
- `robots.txt` allows every crawler (search and AI search included) and points to `https://balconysolarrules.com/sitemap.xml`.
- If Cloudflare's "managed robots.txt" or AI-crawler blocking is switched on for the zone, it can change what crawlers see. Check https://balconysolarrules.com/robots.txt after any Cloudflare setting change.
