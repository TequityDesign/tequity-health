#!/usr/bin/env python3
"""Builds the generated parts of the home page (index.html) from the data below:
the logo strip, the journey through the stages, the "Which stage are you at?" proof
and the services mapped to clients. Each part sits between <!-- name:start --> and
<!-- name:end --> markers. Edit the data here, then run from the tequity-health folder:
    python3 tools/home.py
"""
import pathlib, re, html

ROOT = pathlib.Path(__file__).resolve().parent.parent
E = html.escape
ARROW = '<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3.5 8h9m0 0L8 3.5M12.5 8L8 12.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>'
EXT = '<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M5 11L11 5M11 5H6.2M11 5v4.8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>'

STAGES = [
    ('idea', 'Idea', 'A problem and a concept, still being validated.',
     'Validate the product, define the workflow, design it and ship a focused MVP.'),
    ('seed', 'Seed', 'An early product, with real users giving feedback.',
     'A flexible product pod improves the workflows, adds the essential integrations and speeds up adoption.'),
    ('pmf', 'PMF', 'Traction, and more priorities than people.',
     'Specialists own clearly defined workstreams: an integration, an AI feature, a care-team tool.'),
    ('scale', 'Scale', 'You need sustained capacity and a team of your own.',
     'A dedicated team on your standards and, when it makes sense, one you own.'),
]

# Clients we may name. Anything else is shown as "Name withheld".
LOGOS = [  # (name, logo file or None for a typed wordmark, lighthouse?)
    ('Lexi', 'assets/img/logos/lexi.svg', True),
    ('Stitch', 'assets/img/logos/stitch.svg', True),
    ('BridgeHealth', None, True),
    ('Elevare', None, True),
    ('Alto Neuroscience', 'assets/img/logos/alto-neuroscience.svg', False),
    ("Dr. Reddy's", None, False),
    ('Veera Health', None, False),
    ('Stacked Health', 'assets/img/logos/stacked.svg', False),
    ('Svaim', None, False),
    ('Muse', None, False),
]

TQ = 'https://tequity.tech/case-studies/'
# The work, told as use cases and the services behind them. No client screens.
WORK = [
    dict(key='stitch', client='Stitch', area='Post-transplant care coordination', stages=['idea', 'seed'],
         title='Care coordination from MVP through a strategic pivot',
         line='Modular care plans, voice and SMS follow-up, and a care coordinator on every AI-flagged response.',
         services=['Product strategy', 'Design', 'Applications', 'Applied AI', 'QA'],
         outcome='MVP shipped, then the pivot to transplant care delivered without losing pace.',
         img='assets/img/uc-care-coordination.jpg', href='work/stitch.html'),
    dict(key='lexi', client='Lexi', area='Medical interpretation', stages=['pmf'],
         title='Real-time voice interpretation across clinics and phone lines',
         line='Low-latency speech, multilingual call handling, telephony integrations and a path to a human interpreter.',
         services=['Applied AI', 'Integrations', 'Applications'],
         outcome='In production across in-app, telephony and dashboard channels.',
         img='assets/img/uc-voice.jpg', href='work/lexi.html'),
    dict(key='elevare', client='Elevare', area='Maternal health', stages=['seed'],
         title='A maternal-health patient app, rebuilt for the care team behind it',
         line='A React Native rebuild designed around care-team context, with security-readiness work alongside it.',
         services=['Design', 'Applications', 'QA and security'],
         outcome='EHR integration work is under way.',
         img='assets/img/uc-maternal.svg', href='work/elevare.html'),
    dict(key='stacked', client='Stacked Health', area='Proactive blood testing', stages=['idea'],
         title='Designing a proactive blood-testing experience',
         line='Consumer MVP design for at-home blood testing, with AI-guided insights.',
         services=['Product strategy', 'Design'],
         outcome='Consumer MVP designed, ready to build.',
         img='assets/img/uc-diagnostics.jpg', href=TQ + 'stacked-health-blood-testing'),
    dict(key='veera', client='Veera Health', area='PCOS care', stages=['idea'],
         title='A personalised platform for PCOS care',
         line='Personalised care plans, expert consultations and community support in one digital platform.',
         services=['Design', 'Applications'],
         outcome='Platform designed and built for launch.',
         img='assets/img/uc-cycle.svg', href=TQ + 'veera-health'),
    dict(key='svaim', client='Svaim', area='Patient health records', stages=['seed'],
         title='A patient-first health records platform',
         line='Records that belong to the patient, on mobile, from the first release onwards.',
         services=['Applications', 'Data and integrations'],
         outcome='Live on the App Store and Google Play.',
         img='assets/img/uc-records.svg', href=TQ + 'svaim-health-records'),
    dict(key='clinical-notes', client=None, area='Clinical documentation', stages=['seed'],
         title='A clinical-note workflow with clinician review',
         line='Recording in the browser, drafting, clinician review and delivery of the approved note into the practice system.',
         services=['Applied AI', 'Integrations', 'Applications'],
         outcome='Approved notes reach the system the clinic already uses.',
         img='assets/img/uc-notes.svg', href='work/clinical-notes.html'),
    dict(key='intake', client=None, area='Behavioural-health intake', stages=['seed'],
         title='Referral and intake workflows for behavioural health',
         line='Referrals, submitted-by tracking, forms, reminders and the operational CRM behind them.',
         services=['Applications', 'Integrations'],
         outcome='One intake path for referrals from many sources.',
         img='assets/img/uc-intake.svg', href='work/behavioural-health-intake.html'),
    dict(key='muse', client='Muse', area='Med-spa operations', stages=['pmf'],
         title='Streamlining med-spa operations',
         line='Operations tooling for med spas, with the recording stack rebuilt for long-session reliability.',
         services=['Applications', 'Data engineering'],
         outcome='Long sessions recorded reliably.',
         img='assets/img/uc-medspa.jpg', href=TQ + 'muse-medspa'),
    dict(key='outreach', client=None, area='Patient outreach', stages=['pmf', 'scale'],
         title='Patient outreach at scale, with AI SMS and voice',
         line='A multi-tenant, multi-language outreach platform that routes medical replies to staff.',
         services=['Applied AI', 'Integrations', 'Data engineering'],
         outcome='100,000+ SMS and 10,000+ voice minutes across 90+ languages.',
         outcome_verify='Outreach figures are published on tequity.tech. Reconfirm they are current before launch.',
         img='assets/img/uc-outreach.svg', href='our-work.html#anonymous'),
    dict(key='alto', client='Alto Neuroscience', area='Clinical EEG', stages=['scale'],
         title='Transforming clinical EEG workflows',
         line='A clinical EEG platform redesigned so research teams spend less time on analysis.',
         services=['Design', 'Data engineering'],
         outcome='EEG analysis time reduced by 60%.',
         outcome_verify='Alto: 60% figure is published on tequity.tech. Confirm the owner and that it can appear here.',
         img='assets/img/uc-neuro.jpg', href=TQ + 'alto-neuroscience'),
    dict(key='triage', client=None, area='Voice triage', stages=['scale'],
         title='Voice AI that routes patient calls',
         line='Inbound calls identified, routed to the right department and handed to a person when needed.',
         services=['Applied AI', 'Integrations'],
         outcome='Calls reach the right team first time.',
         outcome_verify='Triage: get approved wording from Ratnadeep. Do not use the ER wait-time figure.',
         img='assets/img/uc-triage.svg', href='our-work.html#anonymous'),
]

# How many clients moved from one stage to the next with us. Values live in assets/js/impact.js.
JOURNEY = [('idea-seed', 'Idea', 'Seed', 'Stitch: MVP, then the pivot'),
           ('seed-pmf', 'Seed', 'PMF', None),
           ('pmf-scale', 'PMF', 'Scale', None)]

# The six capabilities, and the work each one has been delivered for.
SERVICES = {
    'strategy': ['Stitch', 'Stacked Health', 'Veera Health', 'Elevare'],
    'applications': ['Stitch', 'Elevare', 'Svaim', 'Veera Health'],
    'integrations': ['Lexi', 'Clinical notes*', 'Patient outreach*'],
    'data': ['Alto Neuroscience', 'Muse', 'Patient outreach*'],
    'ai': ['Lexi', 'Stitch', 'Patient outreach*', 'Voice triage*'],
    'quality': ['Stitch', 'Elevare'],
}


def logos():
    def item(name, src, big):
        cls = 'lg-item' + (' is-lead' if big else '')
        if src:
            inner = f'<img src="{src}" alt="{E(name)}" height="32" loading="lazy" decoding="async">'
            return f'        <li class="{cls}">{inner}</li>'
        return f'        <li class="{cls}" data-verify="{E(name)}: send the approved SVG logo. Showing a typed placeholder."><span class="lg-word">{E(name)}</span></li>'
    lead = '\n'.join(item(*l) for l in LOGOS if l[2])
    rest = '\n'.join(item(*l) for l in LOGOS if not l[2])
    return f'''  <section class="proof lg" aria-labelledby="proof-title">
    <div class="wrap">
      <h2 class="proof-label" id="proof-title">Healthcare teams we have built with</h2>
      <ul class="lg-row lg-lead reveal">
{lead}
      </ul>
      <ul class="lg-row reveal" style="--i:1">
{rest}
      </ul>
    </div>
  </section>'''


SHORT = {'idea': 'We validate the workflow and ship a focused MVP.',
         'seed': 'A product pod sharpens the workflows and adds the key integrations.',
         'pmf': 'Specialists own whole workstreams, so your team can focus.',
         'scale': 'A dedicated team and, when it makes sense, one you own.'}
FALLBACK = {'idea-seed': 'Stitch went from MVP to pivot with us',
            'seed-pmf': 'The same team, so no context is lost',
            'pmf-scale': 'Then a team built around yours'}
PTS = [(150, 214), (450, 168), (750, 112), (1050, 46)]   # the line rises from Idea to Scale


def journey():
    d = 'M{} {} '.format(*PTS[0]) + ' '.join('C{} {} {} {} {} {}'.format(x0 + 150, y0, x1 - 150, y1, x1, y1) for (x0, y0), (x1, y1) in zip(PTS, PTS[1:]))
    pts = ''.join('<g class="jr-pt" data-k="%s"><circle class="jr-halo" cx="%d" cy="%d" r="22"/><circle class="jr-node" cx="%d" cy="%d" r="9"/></g>' % (s[0], x, y, x, y) for s, (x, y) in zip(STAGES, PTS))
    hops = []
    for i, (k, a, b, ex) in enumerate(JOURNEY):
        (x0, y0), (x1, y1) = PTS[i], PTS[i + 1]
        left = (x0 + x1) / 2 / 1200 * 100
        top = ((y0 + y1) / 2 - 62) / 260 * 100
        hops.append('          <p class="jr-hop" data-impact="%s" style="left:%.2f%%;top:%.2f%%"><span class="jr-n"><b class="v">&mdash;</b> clients went from %s to %s with us</span><span class="jr-fb">%s</span></p>' % (k, left, top, a, b, E(FALLBACK[k])))
    cols = []
    for i, (k, name, sit, offer) in enumerate(STAGES):
        cols.append('''        <a class="jr-col" data-k="%s" href="how-we-work.html#%s">
          <span class="mono">0%d &middot; %s</span>
          <p class="jr-sit">%s</p>
          <p class="jr-we"><span class="mono">What we do</span>%s</p>
          <span class="jr-more">How we work at %s %s</span>
        </a>''' % (k, k, i + 1, name, E(sit), E(SHORT[k]), name, ARROW))
    return '''  <section class="section jr" id="journey" data-dock="Stages" aria-labelledby="jr-title">
    <div class="wrap">
      <div class="section-head section-head--split">
        <div>
          <span class="eyebrow reveal">Idea &rarr; Seed &rarr; PMF &rarr; Scale</span>
          <h2 class="h2 reveal" style="--i:1" id="jr-title">We work with founders at every stage, and stay through each one.</h2>
        </div>
        <p class="body reveal" style="--i:2">Most clients start with us at one stage and grow into the next with the same team, so nothing is lost between a first version and a team you own.</p>
      </div>
      <div class="jr-panel reveal" style="--i:2">
        <div class="jr-chart" aria-hidden="true">
          <svg class="jr-lines" viewBox="0 0 1200 260" preserveAspectRatio="none" fill="none"><path class="jr-base" d="M40 238H1160"/><path class="jr-line" pathLength="1" d="''' + d + '''"/></svg>
          <svg class="jr-pts" viewBox="0 0 1200 260" preserveAspectRatio="none" fill="none">''' + pts + '''</svg>
''' + '\n'.join(hops) + '''
        </div>
        <div class="jr-cols">
''' + '\n'.join(cols) + '''
        </div>
      </div>
    </div>
  </section>'''


def card(w):
    named = w['client'] is not None
    who = E(w['client']) if named else 'Name withheld'
    ext = w['href'].startswith('http')
    link_txt = 'On tequity.tech' if ext else 'Read the story'
    link_attr = ' rel="noopener"' if ext else ''
    is_img = w['img'].endswith('.jpg')
    alt = '' if not is_img else E(w['area'])
    stages = ' '.join(w['stages'])
    stage_names = ' &middot; '.join(n for k, n, *_ in STAGES if k in w['stages'])
    chips = ''.join(f'<li>{E(s)}</li>' for s in w['services'])
    ov = f' data-verify="{E(w["outcome_verify"])}"' if w.get('outcome_verify') else ''
    cc = f' client-{w["key"]}' if w['key'] in ('stitch', 'lexi', 'elevare') else ''
    return f'''        <article class="uc{cc}" data-stages="{stages}">
          <div class="uc-vis{' is-photo' if is_img else ''}"><img src="{w['img']}" alt="{alt}" width="800" height="600" loading="lazy" decoding="async"></div>
          <div class="uc-body">
            <p class="uc-who"><span>{who}</span><span>{E(w['area'])}</span></p>
            <h3>{E(w['title'])}</h3>
            <p class="uc-line">{E(w['line'])}</p>
            <ul class="uc-svc" aria-label="Services">{chips}</ul>
            <p class="uc-out"{ov}><span class="mono">{stage_names}</span>{E(w['outcome'])}</p>
            <a class="link" href="{w['href']}"{link_attr}>{link_txt} {EXT if ext else ARROW}</a>
          </div>
        </article>'''


def picker():
    opts = []
    for i, (k, name, sit, offer) in enumerate(STAGES):
        n = sum(1 for w in WORK if k in w['stages'])
        opts.append(f'''          <button class="pk-opt" type="button" data-pick="{k}" aria-pressed="false"><span class="mono">0{i + 1}</span><b>{name}</b><span class="pk-sit">{E(sit)}</span></button>''')
    offers = '\n'.join(f'''          <div class="pk-sum" data-sum="{k}" hidden>
            <span class="mono">At the {name} stage</span>
            <p class="pk-offer">{E(offer)}</p>
            <p class="pk-count"><b>{sum(1 for w in WORK if k in w['stages'])}</b> of the stories below are from founders at this stage.</p>
            <a class="link" href="how-we-work.html#{k}">How we work at {name} {ARROW}</a>
          </div>''' for k, name, sit, offer in STAGES)
    cards = '\n'.join(card(w) for w in WORK)
    return f'''  <section class="section section--alt pk" id="your-stage" data-dock="Your stage" aria-labelledby="pk-title" data-picker>
    <div class="wrap">
      <div class="section-head">
        <span class="eyebrow reveal">Proof of work</span>
        <h2 class="h2 reveal" style="--i:1" id="pk-title">Which stage are you at?</h2>
        <p class="body reveal" style="--i:2">Pick one, and see what we built for founders who were where you are now.</p>
      </div>
      <div class="pk-opts reveal" style="--i:2" role="group" aria-label="Your stage">
{chr(10).join(opts)}
      </div>
      <div class="pk-head" aria-live="polite">
          <div class="pk-sum" data-sum="all">
            <span class="mono">All stages</span>
            <p class="pk-offer">Twelve healthcare products, from a first MVP to platforms running at scale. Pick a stage to narrow them down.</p>
          </div>
{offers}
      </div>
      <div class="uc-grid" data-verify="Stage mapping: each story is placed at the stage the client was in when we started. Confirm with the account leads.">
{cards}
      </div>
      <div class="pk-cta">
        <p><b data-pk-title>Seen enough to talk?</b> <span>In 30 minutes we will understand your product, what is blocked and whether there is a sensible first engagement.</span></p>
        <a class="btn btn--primary" href="contact.html" data-pk-cta>Book a discovery call {ARROW}</a>
      </div>
    </div>
  </section>'''


HERO_DEFAULT = ['stitch', 'lexi', 'elevare']   # shown before the visitor answers


def hero_proof():
    """The proof beside the hero question: three stories for each stage, and a default set."""
    def mini(w):
        who = E(w['client']) if w['client'] else 'Name withheld'
        ext = w['href'].startswith('http')
        rel = ' rel="noopener"' if ext else ''
        return ('            <li><a class="hbp-card" href="%s"%s><span class="hbp-img"><img src="%s" alt="" width="96" height="72" decoding="async"></span>'
                '<span class="hbp-txt"><small>%s &middot; %s</small><b>%s</b><em>%s</em></span></a></li>') % (
            w['href'], rel, w['img'], who, E(w['area']), E(w['title']), E(', '.join(w['services'][:3])))
    sets = []
    by = {w['key']: w for w in WORK}
    sets.append('''        <div class="hbp" data-stage="all">
          <div class="hbp-h"><span class="mono">Proof of work</span><b>Twelve healthcare products, from first MVP to scale</b></div>
          <ul class="hbp-list">
%s
          </ul>
          <div class="hbp-cta"><a class="btn btn--primary btn--sm" href="contact.html" data-ask-book>Book a discovery call %s</a><a class="link" href="#your-stage">See all the work</a></div>
        </div>''' % ('\n'.join(mini(by[k]) for k in HERO_DEFAULT), ARROW))
    for k, name, sit, offer in STAGES:
        ws = [w for w in WORK if k in w['stages']]
        sets.append('''        <div class="hbp" data-stage="%s" hidden>
          <div class="hbp-h"><span class="mono">%s &middot; %d %s</span><b>What we built for founders at %s</b></div>
          <ul class="hbp-list">
%s
          </ul>
          <div class="hbp-cta"><a class="btn btn--primary btn--sm" href="contact.html?stage=%s" data-ask-book>Book a discovery call %s</a><a class="link" href="#your-stage" data-goto-pick="%s">See all %d</a></div>
        </div>''' % (k, name, len(ws), 'story' if len(ws) == 1 else 'stories', name,
                     '\n'.join(mini(w) for w in ws[:3]), k, ARROW, k, len(ws)))
    return '\n'.join(sets)


def services(t):
    """Adds 'Delivered for' to each capability tile."""
    for key, names in SERVICES.items():
        txt = ', '.join(n.replace('*', '') + (' (name withheld)' if n.endswith('*') else '') for n in names)
        pat = re.compile(r'(<a class="tile[^"]*"[^>]*href="what-we-build\.html#' + key + r'">.*?)(<span class="tile-for">.*?</span>)?(</a>)', re.S)
        t, n = pat.subn(lambda m: m.group(1) + f'<span class="tile-for"><b>Delivered for</b> {E(txt)}</span>' + m.group(3), t, count=1)
        assert n == 1, key
    return t


def put(t, name, body):
    return re.sub(r'<!-- ' + name + r':start -->.*?<!-- ' + name + r':end -->',
                  lambda m: f'<!-- {name}:start -->\n{body}\n  <!-- {name}:end -->', t, count=1, flags=re.S)


if __name__ == '__main__':
    p = ROOT / 'index.html'
    t = p.read_text(encoding='utf-8')
    t = put(t, 'hbproof', hero_proof())
    t = put(t, 'logos', logos())
    t = put(t, 'journey', journey())
    t = put(t, 'picker', picker())
    t = services(t)
    p.write_text(t, encoding='utf-8')
    print('index.html: logos, journey, picker and services rebuilt')
