# Tequity Health website: handoff

Everything needed to carry on this project from another Claude account, or for another person. Read this first, then `README.md` for the technical detail.

## Where things live

| What | Where |
| --- | --- |
| Code (source of truth) | https://github.com/TequityDesign/tequity-health, branch `main` |
| Live review link | https://tequitydesign.github.io/tequity-health/ (GitHub Pages; updates a minute or two after each push to `main`) |
| Previous home page (Option 1) | git tag `option-1-archive` |
| Claude artifact (old account only) | https://claude.ai/artifact/PdbcQ8pKeX295s5Tw6X4ys, Version 12. It belongs to the old Claude account and cannot be moved; use the GitHub link instead, or publish a new artifact from the new account. |

Pushing needs the **TequityDesign** GitHub account, or an account added as a collaborator in the repo settings.

## Starting in a new Claude account

1. Clone the repo, or unzip `tequity-health-repo.zip` (it includes the full git history).
2. Open the folder in Claude Code and ask it to read `HANDOFF.md` and `README.md`.
3. To preview locally: `npx serve . -l 4400`, then open http://localhost:4400.
4. After editing the home page data in `tools/home.py`, run `python3 tools/home.py`. After editing the header or footer in `tools/sync-chrome.py`, run `python3 tools/sync-chrome.py`.
5. Commit and push to `main` to update the live link.

## What the site is

The six-page site for Tequity Health, the healthcare practice of Tequity (an applied AI and product studio). It follows the brief "TEQUITY.HEALTH WEBSITE STRUCTURE": build healthcare products that work in the real world; three layers (data and integration, application, AI); the founder's journey Idea → Seed → PMF → Scale.

Pages: Home, What We Build, How We Work, Our Work, About, Contact, plus case pages for Stitch, Lexi, Elevare, clinical notes (name withheld) and behavioural-health intake (name withheld).

Plain HTML, CSS and JavaScript with no build step. Styles in `assets/css/site.css`, behaviour in `assets/js/site.js`.

## The home page story (agreed with the design lead)

1. **Hero:** "Build healthcare products that work for patients / care teams / clinicians / in the real world." Then the path *From first MVP to scale, with the same team* (Idea, Seed, PMF, Scale), then **"Where are you on this path?"**. The visitor taps a step or types their situation; the page guesses the stage from what they type.
2. **Proof beside the question:** three case cards for that stage and a "Book a discovery call" button. The button passes the stage and what they typed to the contact form.
3. **Logos:** lighthouse clients Lexi, Stitch, BridgeHealth, Elevare; then Alto Neuroscience, Dr. Reddy's, Veera Health, Stacked Health, Svaim, Muse.
4. **Journey:** a rising line from Idea to Scale with a card per stage, and how many clients moved from each stage to the next (numbers pending).
5. **Which stage are you at?:** stage-filtered use-case cards, then the call.
6. **Services** mapped to clients, the product stack, AI, and the closing call.

"Book a Call" stays in the header.

## Decisions to keep

- **Service company, not a product company.** Never show a client's interface. Show the use case and the services delivered. Pictures are the healthcare photos from tequity.tech (`assets/img/uc-*.jpg`) or line drawings in the site's style (`assets/img/uc-*.svg`).
- **Who may be named:** Lexi, Stitch, BridgeHealth, Elevare, Alto Neuroscience, Dr. Reddy's, Veera Health, Stacked Health, Svaim, Muse. Every other client is "Name withheld" (this includes the clinical-notes and behavioural-health intake stories).
- **Palette:** Design Labs @ Tequity neutrals (white, beige `#F4F2F0`, ink `#15140F`) with green as a solid accent. No pale green washes next to beige. The deep green `#0B2B27` is for the call tile, the "talk to us" band and the footer.
- **Case pages** take on the client's colour (Stitch from its logo; Elevare sampled; Lexi a placeholder). Withheld clients stay neutral.
- **Accessibility:** WCAG 2.2 AA was checked with axe-core on every page at desktop and phone width. Anything that moves on its own can be paused, and Reduce Motion turns motion off.
- **Option 1** (photo hero with a US data map and live figures) was dropped because there is no data for it. It is kept under the tag `option-1-archive`.

## Content rules from the brief

- Say "HIPAA-aware delivery". Never "HIPAA certified", "automatically compliant" or "fully compliant".
- Do not imply a finished EHR integration (Elevare's is "under way") or any certification.
- Stitch: no claims of hospital adoption, outcomes or readmissions. Clinical notes: one practice-system integration, not every EHR. Behavioural-health intake: no admissions, ABA or enterprise EHR claims.
- The four-week MVP is always qualified: "when the scope, data access and external dependencies allow it".
- Every number needs an owner and evidence before launch. Avoid "end-to-end digital transformation" style claims.

## Still needed from Tequity

- Numbers: clients taken from Idea to Seed, Seed to PMF, and PMF to Scale (edit `assets/js/impact.js`).
- SVG logos: BridgeHealth, Elevare, Dr. Reddy's, Veera Health, Svaim, Muse.
- Confirm which stage each story belongs to (listed in `tools/home.py`).
- What was built for BridgeHealth and Dr. Reddy's, if they should become stories.
- Lexi's 50,000+ monthly voice minutes: owner and approval. Alto's "60% faster EEG analysis": owner.
- Client brand colours for Lexi and Elevare.
- The official Tequity logo file, and a real team photo if `team.jpg` is stock.
- Build-Operate-Transfer terms, or hide that section on How We Work until they exist.
- The live booking calendar (Cal.com or Calendly) and where the contact form should send answers.
- One open comment on the old artifact: "this section needs to start with a simple CTA clubbed above". It was pinned to the whole page, so the section is unknown; it may be covered by the new hero.

Review mode lists every open item on the page itself: add `#review` to the end of any page address.

## Before launch

Remove the `noindex` meta tag from every page and delete `robots.txt`. The GitHub repo is public and its history contains the earlier client names, so consider moving to a private repo or a fresh one for launch.
