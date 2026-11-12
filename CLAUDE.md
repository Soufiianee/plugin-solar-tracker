# CLAUDE.md — Balcony Solar Rules (balconysolarrules.com)

Portfolio HQ: github.com/Soufiianee/portfolio-hq (HQ.md, PLAYBOOK.md).

## Rules (non-negotiable)
- Primary sources only; never invent; "unknown" when unverifiable; sources[] + last_checked on every fact.
- Every number computed from data; no hand-typed figures.
- Information, not advice; legal-safe wording; disclaimers kept.
- Affiliate links only from config/affiliates.json; status label next to each; "Sponsored"; rel="sponsored noopener"; disclosure; no coupons; sponsors never change ratings.
- Privacy: no cookies except where documented (reCAPTCHA on the brands form); cookieless analytics; no personal data stored.
- Secrets never in the repo, logs or reports (NREL key lives in the environment secret).
- Our scripts must never block the MailerLite submit (keep the loader test: tests/signup-loader.test.ts).
- Alert subscribers get ONE email when a certified kit is confirmed for their state; date emails go only to the "Key dates (opted in)" segment.
- Quality: Lighthouse 100 on key pages, tests pass, 0 broken links, before every push.

## Where things are
REPORT.md (status) · DEPLOY.md (hosting, daily rebuild: .github/workflows/daily-rebuild.yml) · MAINTENANCE_PROMPT.md (weekly, includes the New York check) · research/RESEARCH_NOTES.md · data/ · config/site.json · config/affiliates.json · data/drafts/new-york-signed.json · research/emails/2027-01-01-california.md

## End every session
With a report in PLAYBOOK §4 format:
=== REPORT ===
Site / Agent / Date · DONE · FAILED-BLOCKED · WAITING ON OTHERS · NEEDS OWNER DECISION · NEW FACTS FOR HQ · NEXT
