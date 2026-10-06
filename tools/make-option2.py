#!/usr/bin/env python3
"""Builds index-2.html (hero option 2) from index.html: the same page below the hero,
with the green bento hero, the numbers slab and the case stack in place of the photo hero.
Run from the tequity-health folder after editing index.html:  python3 tools/make-option2.py"""
import pathlib, re

ROOT = pathlib.Path(__file__).resolve().parent.parent
src = (ROOT / 'index.html').read_text(encoding='utf-8')
ARROW = '<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3.5 8h9m0 0L8 3.5M12.5 8L8 12.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>'
BIG_ARROW = '<svg viewBox="0 0 34 34" fill="none" aria-hidden="true"><path d="M5 17h24m0 0L19 7m10 10L19 27" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>'
IMGV = ' data-verify="Case image from the Design Labs assets. Confirm usage rights; the brief asks to avoid AI-generated faces."'

def mock_from(page_html, start_marker, end_marker):
    a = page_html.index(start_marker)
    b = page_html.index(end_marker, a)
    return page_html[a:b]

# the drawn interfaces come from the home carousel, so both options show the same product
lexi_mock = mock_from(src, '<div class="mock" role="img" aria-label="Illustration: a live interpreted call', '            </div></div>\n            <div class="hxc-cap"><span class="hxc-client">Lexi')
reso_mock = mock_from(src, '<div class="mock" role="img" aria-label="Illustration: a draft visit note', '            </div></div>\n            <div class="hxc-cap"><span class="hxc-client">Resonately')
lexi_mock = lexi_mock.rstrip() + '\n            </div>'
reso_mock = reso_mock.rstrip() + '\n            </div>'

# the stage tile keeps to one short line per stage; the full stage copy is in the stage path further down
STAGES = [
    ('idea', 'Idea', 'Prove the workflow and ship a focused MVP.'),
    ('seed', 'Seed', 'A flexible pod that adds integrations.'),
    ('pmf', 'PMF', 'Specialists who own whole workstreams.'),
    ('scale', 'Scale', 'A dedicated team, yours when it makes sense.'),
]

def stage_tab(i, key, name):
    first = i == 0
    return (f'            <button type="button" role="tab" id="hb-tab-{key}" data-stage="{key}" aria-controls="hb-offers" '
            f'aria-selected="{str(first).lower()}"' + ('' if first else ' tabindex="-1"') + f'>{name}</button>')

def stage_offer(i, key, name, line):
    state = ' is-on"' if i == 0 else '" aria-hidden="true" tabindex="-1"'
    return (f'          <a class="hb-offer{state} data-stage="{key}" href="how-we-work.html#{key}">'
            f'<span class="sr-only">How we work at the {name} stage: </span><b>{line}</b><span class="hb-go" aria-hidden="true">{ARROW}</span></a>')

stage_tabs = '\n'.join(stage_tab(i, k, n) for i, (k, n, _) in enumerate(STAGES))
stage_offers = '\n'.join(stage_offer(i, k, n, l) for i, (k, n, l) in enumerate(STAGES))

hero = f'''  <!-- ============ HERO OPTION 2: the stage, not the numbers ============ -->
  <section class="hb" id="intro" data-hb data-dock="Intro" aria-labelledby="hb-title">
    <div class="wrap hb-grid">
      <div class="hb-tile hb-head">
        <span class="eyebrow">Tequity Health &middot; End-to-end product support</span>
        <h1 class="hb-title" id="hb-title">Build healthcare products that work <span class="rot-line"><span class="rot" data-rot><span>for patients.</span><span>for care teams.</span><span>for clinicians.</span><span>in the real world.</span></span></span></h1>
        <p class="lede">From patient and provider applications to healthcare integrations and production AI, Tequity helps digital-health founders move from an idea to a scalable product.</p>
      </div>
      <a class="hb-tile hb-cta" href="contact.html">
        <span class="mono">30 minutes on video</span>
        <b>Book a discovery call {BIG_ARROW}</b>
      </a>
      <div class="hb-tile hb-stage">
        <div class="hb-ask">
          <span class="mono" id="hb-stage-label">Where are you today?</span>
          <div class="hb-seg" role="tablist" aria-labelledby="hb-stage-label">
{stage_tabs}
          </div>
        </div>
        <div class="hb-offers" id="hb-offers" role="tabpanel" aria-labelledby="hb-tab-idea">
{stage_offers}
        </div>
      </div>
      <div class="hb-tile hb-visual">
        <img src="assets/img/team.jpg" alt="The Tequity team at work in the studio" width="1700" height="674" fetchpriority="high" decoding="async" data-verify="Hero photo is team.jpg from tequity.tech / Design Labs. Replace with a photo of the Tequity team if this one is stock.">
        <span class="hb-label">What you get first &middot; illustrative</span>
        <button class="hb-pause" type="button" data-hb-pause aria-label="Pause the rotating stages and headline"><svg class="i-pause" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M5.5 3.5v9M10.5 3.5v9" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg><svg class="i-play" viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M5 3.5l7 4.5-7 4.5v-9z" fill="currentColor"/></svg></button>
        <div class="hb-cards">
          <div class="hb-card is-on" data-stage="idea">
            <div class="hb-card-h"><b>Your first version</b></div>
            <ol class="hb-journey"><li class="in">Referral</li><li class="in">Intake</li><li class="in">Care plan</li><li>Follow-up</li></ol>
          </div>
          <div class="hb-card" data-stage="seed" aria-hidden="true">
            <div class="hb-card-h"><b>Integrations, in order</b></div>
            <div class="hb-rows">
              <div class="hb-row"><span>Scheduling and SMS</span><span class="pill teal">Live</span></div>
              <div class="hb-row"><span>Eligibility checks</span><span class="pill amber">In progress</span></div>
              <div class="hb-row"><span>EHR &middot; FHIR</span><span class="pill gray">Next</span></div>
            </div>
          </div>
          <div class="hb-card" data-stage="pmf" aria-hidden="true">
            <div class="hb-card-h"><b>Workstream: AI follow-up calls</b></div>
            <div class="hb-rows">
              <div class="hb-row"><span>Symptoms go to a nurse, not a reply</span><span class="mono">Done</span></div>
              <div class="hb-row"><span>Every call logged and traceable</span><span class="mono">Done</span></div>
              <div class="hb-row"><span>Passes the evaluation set</span><span class="mono">In review</span></div>
            </div>
          </div>
          <div class="hb-card" data-stage="scale" aria-hidden="true">
            <div class="hb-card-h"><b>Your dedicated team</b></div>
            <div class="hb-roles"><span class="role"><i>EM</i>Engineering manager</span><span class="role"><i>EN</i>Engineers</span><span class="role"><i>QA</i>QA</span><span class="role"><i>PD</i>Designer</span></div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <!-- ============ NUMBERS (below the hero, not in it) ============ -->
  <section class="section--tight" id="numbers" data-dock="Numbers" aria-labelledby="nums-title">
    <div class="wrap">
      <div class="slab reveal">
        <div class="slab-head"><span class="eyebrow eyebrow--plain" id="nums-title"><span class="dot live" aria-hidden="true"></span>Tequity Health, updated monthly</span><span class="mono" data-impact-asof>Figures pending</span></div>
        <div class="nums">
          <div class="num" data-impact="clients"><div class="v">&mdash;</div><div class="lab">Clients we have worked with so far</div></div>
          <div class="num" data-impact="patients"><div class="v">&mdash;</div><div class="lab">Patients helped last month</div></div>
          <div class="num" data-impact="clinics"><div class="v">&mdash;</div><div class="lab">Clinics onboarded last month</div></div>
        </div>
      </div>
    </div>
  </section>
'''

def card(k, href, vis, tag, title, sub, stats, nxt, verify=''):
    st = ''.join(f'<div{sv}><div class="v">{v}</div><div class="lab">{l}</div></div>' for v, l, sv in stats)
    return f'''        <article class="ccard" style="--k:{k}"{verify}>
          {vis}
          <div class="ccard-txt">
            <span class="tag">{tag}</span>
            <h3>{title}</h3>
            <p class="ccard-sub">{sub}</p>
            <div class="ccard-stats">{st}</div>
            <p class="ccard-next"><span>What happened next</span>{nxt}</p>
            <a class="btn btn--light" href="{href}">Read the case study {ARROW}</a>
          </div>
        </article>'''

cards = '\n'.join([
  card(0, 'work/stitch.html', f'<div class="ccard-vis"{IMGV}><img src="assets/img/case-stitch.webp" alt="Stitch product: a patient profile, an AI care assistant asking about pain levels, and a recovery plan" width="2000" height="1334" loading="lazy" decoding="async"></div>',
       'Health tech &middot; Post-transplant care', 'Care coordination from MVP through a strategic pivot',
       'Modular care plans, voice and SMS follow-up, and care-coordinator oversight of every AI-flagged patient response.',
       [('App &middot; AI', 'Layers we built', ''), ('MVP to pivot', 'Where we came in', '')],
       "Tequity has stayed on as Stitch&rsquo;s product partner through the pivot."),
  card(1, 'work/lexi.html', f'<div class="ccard-vis work-visual tone-sand">{lexi_mock}</div>',
       'Health tech &middot; Medical interpretation', 'Real-time voice interpretation across clinics and phone lines',
       'Low-latency speech, multilingual call handling, telephony integrations and a path to a human interpreter.',
       [('AI &middot; App &middot; Data', 'Layers we built', ''), ('50,000+', 'Voice minutes a month', ' data-verify="50,000+ monthly voice minutes: confirm the client, the period and approval to publish."')],
       'In production across in-app, telephony and dashboard channels.',
       ' data-verify="Lexi: confirm Lexi is the medical-interpretation client and that we may name them."'),
  card(2, 'work/elevare.html', f'<div class="ccard-vis"{IMGV}><img src="assets/img/case-elevare.webp" alt="Elevare product: a patient on her phone beside a symptom check-in, a pregnancy week card and an upcoming anatomy scan" width="1400" height="1050" loading="lazy" decoding="async"></div>',
       'Health tech &middot; Maternal health', 'A maternal-health patient app, rebuilt for the care team behind it',
       'A React Native rebuild designed around care-team context, with security-readiness work alongside it.',
       [('App', 'Layer we built', ''), ('React Native', 'The rebuild', '')],
       'EHR integration work is under way.',
       ' data-verify="Elevare: drafted from the brief. Confirm details and permission to name."'),
  card(3, 'work/resonately.html', f'<div class="ccard-vis work-visual">{reso_mock}</div>',
       'Health tech &middot; Clinical documentation', 'A clinical-note workflow with clinician review and Sycle delivery',
       'Recording in the browser, drafting, clinician review and delivery of the approved note into Sycle.',
       [('AI &middot; App &middot; Data', 'Layers we built', ''), ('Sycle', 'Where notes are delivered', '')],
       'Approved notes reach the practice-management system the clinic already uses.',
       ' data-verify="Resonately: drafted from the brief. Confirm details and permission to name."'),
  card(4, 'work/laptis.html', f'<div class="ccard-vis"{IMGV}><img src="assets/img/case-laptis.webp" alt="Laptis product: a provider search filtered by state, age, insurance and level of care, with four programs selected for referral" width="1400" height="1050" loading="lazy" decoding="async"></div>',
       'Health tech &middot; Behavioural-health intake', 'Referral and placement workflows for behavioural health',
       'Referrals, submitted-by tracking, provider search, forms, reminders and CRM views for the intake team.',
       [('App', 'Layer we built', ''), ('Intake to referral', 'The workflow', '')],
       'Provider search lets the team refer a patient to several programs in one step.',
       ' data-verify="Laptis: drafted from the brief and the product image. Confirm details and permission to name."'),
])

work = f'''
  <!-- ============ SELECTED WORK: the case card, as a stack ============ -->
  <section class="section" id="work" data-dock="Work" aria-labelledby="work-title">
    <div class="wrap">
      <div class="section-head">
        <span class="eyebrow reveal">Selected work</span>
        <h2 class="h2 reveal" style="--i:1" id="work-title">Real products, described plainly.</h2>
        <p class="body reveal" style="--i:2">We describe what we built. Clinical and commercial results belong to our clients, and we only cite them when there is evidence.</p>
      </div>
      <div class="cstack">
{cards}
      </div>
      <div style="display:flex;justify-content:center;margin-top:clamp(32px,4vw,48px)"><a class="btn btn--secondary" href="our-work.html">See all healthcare work {ARROW}</a></div>
    </div>
  </section>
'''

out = src
a = out.index('  <!-- ============ HERO: the photo loads first')
b = out.index('  <!-- ============ PROOF ============ -->')
out = out[:a] + hero + '\n' + out[b:]
# proof logos, then the case stack
p_end = out.index('  <!-- ============ A TO Z ============ -->')
out = out[:p_end] + work.lstrip('\n') + '\n' + out[p_end:]
out = out.replace('<body class="has-hx">', '<body>', 1)
out = out.replace('  <script src="assets/js/us-grid.js" defer></script>\n', '', 1)
out = out.replace('<a href="index.html" aria-current="page">Option 1</a><a href="index-2.html">Option 2</a>',
                  '<a href="index.html">Option 1</a><a href="index-2.html" aria-current="page">Option 2</a>', 1)
out = out.replace('<section class="proof" aria-labelledby="proof-title">', '<section class="proof" aria-labelledby="proof-title" style="padding-top:clamp(24px,3vw,40px)">', 1)
(ROOT / 'index-2.html').write_text(out, encoding='utf-8')
print('wrote index-2.html')
