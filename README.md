# tequity.health

The six-page launch site for Tequity Health, plus five case-study pages and a second home-page hero for review. It's plain HTML, CSS and JavaScript with no build step and no dependencies.

## Run it

```bash
npx serve tequity-health -l 4400
```

You can also open `index.html` straight from the file system. All links are relative.

## Structure

| Page | File |
| --- | --- |
| Home, hero option 1 (photo, then US data field) | `index.html` |
| Home, hero option 2 (stage bento, draft) | `index-2.html` |
| What We Build | `what-we-build.html` |
| How We Work | `how-we-work.html` |
| Our Work | `our-work.html` |
| Case studies | `work/stitch.html`, `work/lexi.html`, `work/elevare.html`, `work/resonately.html`, `work/laptis.html` |
| About | `about.html` |
| Contact / Book a Call | `contact.html` |

- `assets/css/site.css` holds all styles. The design tokens are at the top. The greens and the Design Labs components are in the "v3" block further down.
- `assets/js/site.js` holds all behaviour: the loader, both heroes, the carousel, the A to Z finder, the dock, scroll reveals, the work index, the follower, the booking flow and review mode.
- `assets/js/impact.js` holds the three live figures (see below).
- `tools/sync-chrome.py` keeps the header and footer identical on every page. Edit them in the script, then run `python3 tools/sync-chrome.py`.
- `tools/make-option2.py` builds `index-2.html` from `index.html`. See "Hero option 2".
- `tools/art.py` draws the line icons used on the capability tiles and the stage path.

## Live figures

Both hero options show the same three figures, read from `assets/js/impact.js`:

1. Clients we have worked with so far
2. Patients helped last month
3. Clinics onboarded last month

Set each `value` as a plain number, add a `suffix` such as `+` if needed, and set `asOf` to the month the figures describe, for example `"September 2026"`. The page counts each number up when it comes into view and shows "As of September 2026".

A figure left as `null` shows as a dash with "Figure pending" and is flagged in review mode. Nothing is invented. To make the figures truly live later, replace the file with one generated from the client dashboard, or fetch the same shape from an API.

## Home page, hero option 1

1. **Photo first.** `assets/img/team.jpg` fades in with the headline on it.
2. **Then the data.** The photo dims and a field of digits resolves over it: the lower 48 states drawn in numbers, each state at its own density, some in green, with a faint trace of the photo. Digits brighten around the pointer. The map shape is in `assets/js/us-grid.js`, generated from US Census boundaries (us-atlas). The three live figures sit across the top.
3. **Case carousel** at the foot of the first screen. It auto-advances every 6 seconds, pauses on hover or focus, and supports arrows and swipe. Its pause button stops the carousel and the digit field together.

The digit field stays faint behind the headline, the figures and the buttons. Each block of text also has a soft dark shade behind it, so the text keeps its contrast whatever the photo shows.

## Hero option 2

The numbers are not the hero here. The visitor's stage is.

- **Bento grid** (after Ease on Mobbin): a tinted headline tile, a green "Book a discovery call" tile, a stage tile and the team photo.
- **Rotating last word** (from Design Labs): "Build healthcare products that work for patients / for care teams / for clinicians / in the real world."
- **Stage tabs** (after Amplemarket's audience tabs): Idea, Seed, PMF, Scale. Each tab shows one short line that links to How We Work, and a card over the photo. The tabs cycle on their own until the visitor touches them, and pause while the pointer is over the tile or the photo. The pause button on the photo stops the tabs and the rotating headline word.
- **Cards over the photo** (after Bianco and Metalab): each stage shows what you get first, such as the MVP journey, integrations in order, or the team shape. They are labelled "illustrative".
- **Below the hero:** the three live figures on a numbers slab, then the five case studies as a stack of cards that slide over each other as you scroll. Option 1 shows the same cases as a carousel instead.

`index-2.html` is generated. After editing anything in `index.html`, run:

```bash
python3 tools/make-option2.py && python3 tools/sync-chrome.py
```

**Before launch, pick one.** Remove the "Draft hero" switch (`<nav class="opt-switch">`) from both files. If option 2 wins, rename `index-2.html` to `index.html`.

## Shared with Design Labs @ Tequity

The site borrows the Design Labs layouts, so the two read as one studio. It keeps its own content and its green.

- **Buttons:** 10px radius, an arrow chip, and a green edge glow that follows the pointer.
- **Blocks:** 12px radius throughout, and centred section heads with a short rule after the eyebrow.
- **Capability tiles:** six tiles with line drawings. On hover, a green line traces the drawing.
- **Stage path:** Idea, Seed, PMF, Scale as four steps. The last one, the team you own, is drawn in green.
- **Numbers slab** for the live figures.
- **Footer:** a giant "TEQUITY HEALTH" wordmark that lights up under the pointer, and the time in Bengaluru.
- **Dock:** the island style, with a "Book a call" card.
- **Case cards:** the same parts as Design Labs (tag, serif title, short line, stats, "What happened next", button), presented differently.

## Site-wide motion

- **Loader** (after Jackson Alexander) plays on the first page view of each visit. A stack of case images shuffles and sharpens. On the home page, the last card, the team photo, grows into the hero photo; on other pages the loader lifts away. Click or press any key to skip it.
- **Bottom dock** (after Jackson Alexander): any section with `data-dock="Label"` becomes a numbered tile, and the section you are in shows its name. On phones it collapses to a single button that opens the list. The "Book a call" card appears on every page except Contact.
- **Work index** (after Bianco) on Our Work: a monospace list of the work over a full-screen image. Point at a row and the image follows it; left alone, it cycles through the rows. On phones it becomes a plain index over the colour backdrop.
- **Follower** (after Gil Huybrecht) on case-study pages: the case visual follows down the left column, tilting and lagging with the speed of the scroll, and shows which section you are reading.

Everything above respects Reduce Motion: the loader is skipped, and nothing auto-advances or tilts.

## Accessibility (WCAG 2.2 AA)

Checked in October 2026 with axe-core 4.10 on all 12 pages at 1440px and 375px, plus manual checks.

- **Automated:** no violations on any page. The one remaining flag is the header over the Option 1 photo, because axe cannot see behind it. Measured by hand from a screenshot with the text hidden, every line of hero text is at least 7.4:1 against its brightest background pixel. The headline and the lede are above 10:1.
- **Contrast fixes:** small grey labels (`--ink-3`), faint text on dark (`--on-dark-3`), the amber notes, the AI tag on dark, the footer text and the Our Work list rows all now reach 4.5:1.
- **Controls:** the focus outline turns light green on dark surfaces. Form fields and checkboxes have edges of 3:1 or more. Tap targets are at least 24px. Focused items scroll clear of the fixed header and dock.
- **Motion (2.2.2):** everything that moves on its own can be paused. That covers the Option 1 carousel and digit field, the Option 2 stages and headline word, the workflow card on the home page and the Our Work previews. Decorative loops, such as the layer links, the pipelines and the live dots, play twice when they come into view and then stop. Reduce Motion turns all of it off.
- **Reflow:** no page scrolls sideways at 320px.

Re-check contrast whenever the hero photo changes, because text sits on it.

## Review switches

Add one of these to the end of any URL. The hash versions also work on the shared artifact link, which drops query strings.

| Switch | Effect |
| --- | --- |
| `#review` or `?review` | Turn on review mode. It stays on in that browser until you turn it off. |
| `#review-off` or `?review=off` | Turn off review mode. |
| `#motion` or `?motion=1` | Show the full motion even if your system asks for reduced motion. It stays on in that browser. |
| `#calm` or `?motion=0` | Go back to following the system setting. |
| `#loader` or `?loader=1` | Replay the loader. |

## Review mode (internal)

Every claim that needs an owner and evidence before launch gets an amber outline and a number, and a panel lists them all. Drafts that are hidden from visitors, such as the third anonymous case study, also appear. Use `#review-off` or the panel's Exit button to leave review mode.

Flags are `data-verify="..."` attributes in the HTML. Remove an attribute once its item is signed off. The live figures flag themselves while they are pending.

## A to Z finder

The "Find what you are building, by first letter" block appears on the home page and on What We Build. Both read from `assets/js/az-data.js`. Each entry is `{ t: term, d: description, l: layers [app, ai, data, x], p: proof label or "Capability", h: link }`. Letters with no entries are shown dashed and can't be selected.

## Images

`case-stitch.webp`, `case-elevare.webp`, `case-laptis.webp` and `team.jpg` come from the Design Labs @ Tequity assets. Confirm usage rights before launch. The brief asks to avoid AI-generated faces, and two of the case images show people.

## Palette

The neutrals and the ink are the same as Design Labs @ Tequity, so the two sites read as one family. Green takes the place of the Design Labs orange.

**The rule:** green is used solid, never as a pale wash next to beige. It appears on accent buttons, the AI layer tag, live dots, figures on dark, italic accent words, line drawings, and the deep-green talk band and footer. Surfaces are white, beige or ink. The pale mint tints remain only for small interface states, such as selection or a checked option, and inside product illustrations.

| Role | Design Labs | Tequity Health |
| --- | --- | --- |
| Page | `#FFFFFF` | `#FFFFFF` |
| Cards, trays (beige) | `#F4F2F0` | `#F4F2F0` |
| Hairline | `#D2CECB` | `#D2CECB` |
| Ink / titles | `#15140F` / `#2C2A25` | `#15140F` / `#2C2A25` |
| Secondary text | `#5F5C55` | `#5F5C55` |
| Small labels | lighter, decorative only | `#6B675F` (5.0:1 on beige) |
| Dark band | `#15140F`, cards `#24221E` | `#15140F`, cards `#24221E` |
| Health band (talk sections, footer, the call tile) | n/a | `#0B2B27`, cards `#113A34` |
| Bright accent (figures on dark, dots, glows, accent buttons) | `#FF5A1F` | `#13B49B` |
| Accent words in display type | `#F54A0F` | `#0E8A79` (4.3:1 on white) |
| Accent text, any size | `#B8390A` | `#0B6B5F` (6.4:1 on white) |
| Soft accent (selection, tags) | `#FFE3D6` | `#D3F0E8` |

The bright green is never used for body text on white. Green buttons carry ink text.

## Before launch

**Numbers (each needs an owner and evidence)**
- Live figures: the three values and the "as of" month in `assets/js/impact.js`.
- Lexi: 50,000+ monthly voice minutes (Lexi page and the option 2 case stack).
- About: 50+ AI products, 25+ active clients, 1M+ users. These come from tequity.tech.
- Outreach case: 100,000+ SMS, 10,000+ voice minutes, 90+ languages. These come from tequity.tech.

**Client permissions and naming**
- Lexi: confirm Lexi is the medical-interpretation client on tequity.tech and that we may name them. If not, publish the story as "Client name withheld".
- Elevare, Resonately and Laptis: these stories are drafted from the brief only. Confirm the details and get permission to name each client.
- Alto Neuroscience: show only once the exact work and permission are confirmed.
- Logos: the strip uses typographic placeholders. Swap in approved SVGs.
- Anonymous case studies: two are live (patient outreach, voice triage). The third is waiting on content from Ratnadeep. For the triage story, get approved wording and do not use the ER wait-time figure.

**Offers**
- Build-Operate-Transfer (How We Work): publish only once team size and duration, legal structure, IP, transition, pricing, retention and security terms are defined.
- Align Idea / Seed / PMF / Scale with the three engagement paths on tequity.tech.
- Confirm the team shapes shown for each stage.

**Draft link**
- The review copy is on GitHub Pages. Every page carries `<meta name="robots" content="noindex, nofollow">` and `robots.txt` blocks crawlers. Remove both before launch.

**Pick a hero**
- Choose option 1 or 2, then remove the "Draft hero" switch (see "Hero option 2").

**Integrations to wire up**
- Contact form: `site.js` has an "Integration point" comment where the answers and the chosen slot should be sent to your CRM.
- Scheduler: the time picker uses placeholder availability. Replace it with the live Cal.com or Calendly embed, or feed it real slots.
- The confirmation step says an invite was sent. That will only be true once the scheduler is connected.
- Contact inbox: the site uses `hello@tequity.tech`. Decide whether tequity.health needs its own address.
- Brand: the wordmark is set in IBM Plex Mono. Swap in the official Tequity logo file if you prefer.

## Content guardrails (from the brief)

- Say "HIPAA-aware delivery". Never "HIPAA certified" or "compliant by default".
- Describe what Tequity built. Do not claim clinical outcomes, hospital adoption, admissions changes or certifications without evidence.
- Keep the four-week MVP claim qualified: "when the scope, data access and external dependencies allow it".
