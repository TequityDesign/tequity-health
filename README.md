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
| Home | `index.html` |
| What We Build | `what-we-build.html` |
| How We Work | `how-we-work.html` |
| Our Work | `our-work.html` |
| Case studies | `work/stitch.html`, `work/lexi.html`, `work/elevare.html`, `work/clinical-notes.html` (name withheld), `work/behavioural-health-intake.html` (name withheld) |
| About | `about.html` |
| Contact / Book a Call | `contact.html` |

- `assets/css/site.css` holds all styles. The design tokens are at the top. The greens and the Design Labs components are in the "v3" block further down.
- `assets/js/site.js` holds all behaviour: the loader, both heroes, the carousel, the A to Z finder, the dock, scroll reveals, the work index, the follower, the booking flow and review mode.
- `assets/js/impact.js` holds the three live figures (see below).
- `tools/sync-chrome.py` keeps the header and footer identical on every page. Edit them in the script, then run `python3 tools/sync-chrome.py`.
- `tools/home.py` builds the data-driven parts of the home page. See "Home page".
- `tools/art.py` draws the line icons used on the capability tiles and the stage path.

## Home page

The home page tells one story: what we build, that we work with founders at every stage, which stage you are at, proof from founders like you, then the call.

1. **Hero.** "Build healthcare products that work for patients / for care teams / for clinicians / in the real world." A stage tile and a booking tile sit beside the photo.
2. **Logos.** The lighthouse clients (Lexi, Stitch, BridgeHealth, Elevare) on the first row; Alto Neuroscience, Dr. Reddy's, Veera Health, Stacked Health, Svaim and Muse on the second. Real logo files come from tequity.tech. The others are typed placeholders until we have SVGs.
3. **Journey.** Idea → Seed → PMF → Scale on one line, with how many clients moved from each stage to the next with us. Those numbers live in `assets/js/impact.js` and show as dashes until filled in.
4. **Which stage are you at?** Four answers. Choosing one filters the twelve use-case cards to work from founders at that stage, says what we do at it, and points the "Book a discovery call" button at the contact form with that stage already selected.
5. **Services.** The six capabilities, each with the clients it was delivered for.
6. **The product stack**, **AI**, and the closing call.

The logos, journey, stage cards and "Delivered for" lines are generated. Edit the lists at the top of `tools/home.py`, then run:

```bash
python3 tools/home.py
```

**What we show, and what we do not.** We are a service company, so the site shows the use case and the services behind it, never a client's interface. Pictures are healthcare photos from tequity.tech (`assets/img/uc-*.jpg`) or line drawings in the site's style (`assets/img/uc-*.svg`). Only these clients may be named: Lexi, Stitch, BridgeHealth, Elevare, Alto Neuroscience, Dr. Reddy's, Veera Health, Stacked Health, Svaim and Muse. Every other client is "Name withheld".

**Option 1 is archived.** The earlier photo-and-numbers hero is kept in git under the tag `option-1-archive`:

```bash
git checkout option-1-archive -- index.html
```

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

## Client colours

Each case study takes on its client's colour, so the work reads as a collaboration rather than a portfolio. The case page hero is a deep shade of that colour, with a "Tequity × Client" mark, and the outcome figures, ticks, phase dots and scope box use it too. On Our Work, the index row, the picture behind it and each story card turn to the client's colour on hover. Tequity green stays on the call band and the footer.

The colours are set in one block, `client colours`, at the end of `site.css`. Each client has `--cc` for fills, `--cc-ink` for text (4.7:1 or better on white and beige) and `--cc-deep` for the hero band.

| Client | Colour | Source |
| --- | --- | --- |
| Stitch | `#5A1F77` | From the Stitch logo |
| Elevare | `#C0829A` | Sampled from a product image |
| Lexi | `#D08A1E` | Placeholder |
| Name withheld | Tequity green on ink | Neutral on purpose |

Replace these with each client's official brand colour before launch. Review mode flags each one.

## Accessibility (WCAG 2.2 AA)

Checked in October 2026 with axe-core 4.10 on all 12 pages at 1440px and 375px, plus manual checks.

- **Automated:** no violations on any page. The one remaining flag is the header over the Option 1 photo, because axe cannot see behind it. Measured by hand from a screenshot with the text hidden, every line of hero text is at least 7.4:1 against its brightest background pixel. The headline and the lede are above 10:1.
- **Contrast fixes:** small grey labels (`--ink-3`), faint text on dark (`--on-dark-3`), the amber notes, the AI tag on dark, the footer text and the Our Work list rows all now reach 4.5:1.
- **Controls:** the focus outline turns light green on dark surfaces. Form fields and checkboxes have edges of 3:1 or more. Tap targets are at least 24px. Focused items scroll clear of the fixed header and dock.
- **Motion (2.2.2):** everything that moves on its own can be paused. That covers the hero stages and headline word, the workflow card on the home page and the Our Work previews. Decorative loops, such as the layer links, the pipelines and the live dots, play twice when they come into view and then stop. Reduce Motion turns all of it off.
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

- `team.jpg`: the hero photo, from tequity.tech. Replace it if it is stock.
- `uc-*.jpg`: healthcare photos used on tequity.tech's case studies (Unsplash).
- `uc-*.svg`: line drawings for use cases without a photo.
- `logos/`: client logos from tequity.tech. Send SVGs for BridgeHealth, Elevare, Dr. Reddy's, Veera Health, Svaim and Muse.

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
- Lexi: 50,000+ monthly voice minutes (Lexi page).
- About: 50+ AI products, 25+ active clients, 1M+ users. These come from tequity.tech.
- Outreach case: 100,000+ SMS, 10,000+ voice minutes, 90+ languages. These come from tequity.tech.

**Client permissions and naming**
- Elevare: confirm the story details with the account lead.
- Stage mapping on the home page: confirm the stage each client was at when we started.
- Alto Neuroscience: show only once the exact work and permission are confirmed.
- Logos: the strip uses typographic placeholders. Swap in approved SVGs.
- Anonymous case studies: two are live (patient outreach, voice triage). The third is waiting on content from Ratnadeep. For the triage story, get approved wording and do not use the ER wait-time figure.

**Offers**
- Build-Operate-Transfer (How We Work): publish only once team size and duration, legal structure, IP, transition, pricing, retention and security terms are defined.
- Align Idea / Seed / PMF / Scale with the three engagement paths on tequity.tech.
- Confirm the team shapes shown for each stage.

**Draft link**
- The review copy is on GitHub Pages. Every page carries `<meta name="robots" content="noindex, nofollow">` and `robots.txt` blocks crawlers. Remove both before launch.

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
