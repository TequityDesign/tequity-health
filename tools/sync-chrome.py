#!/usr/bin/env python3
"""
Keeps the shared header and footer identical across every page.

Each page contains:
    <!-- header:start --> ... <!-- header:end -->
    <!-- footer:start --> ... <!-- footer:end -->

Edit HEADER / FOOTER below, then run from the tequity-health folder:
    python3 tools/sync-chrome.py
"""
import pathlib
import re

ROOT = pathlib.Path(__file__).resolve().parent.parent

ARROW = '<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3.5 8h9m0 0L8 3.5M12.5 8L8 12.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>'
EXT = '<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M5 11L11 5M11 5H6.2M11 5v4.8" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>'

NAV = [
    ("what-we-build", "What We Build"),
    ("how-we-work", "How We Work"),
    ("our-work", "Our Work"),
    ("about", "About"),
]

HEADER = """<a class="skip-link" href="#main">Skip to content</a>
<header class="site-header">
  <div class="wrap header-inner">
    <a class="brand" href="{p}index.html" aria-label="Tequity Health home"><span class="brand-word">TEQUITY</span><span class="brand-sub">Health</span></a>
    <button class="menu-toggle" type="button" aria-expanded="false" aria-controls="site-nav" aria-label="Open menu"><span class="menu-toggle-bars"><i></i><i></i></span></button>
    <nav class="nav" id="site-nav" aria-label="Primary">
{links}
      <a class="btn btn--primary btn--sm" href="{p}contact.html"{cta_current}>Book a Call {arrow}</a>
    </nav>
  </div>
</header>"""

FOOTER = """<footer class="site-footer">
  <div class="wrap"><div class="f-big" aria-hidden="true" data-fbig>TEQUITY HEALTH</div></div>
  <div class="f-panel">
  <div class="wrap">
    <div class="footer-grid">
      <div class="footer-brand">
        <a class="brand" href="{p}index.html" aria-label="Tequity Health home"><span class="brand-word">TEQUITY</span><span class="brand-sub">Health</span></a>
        <p>The healthcare practice of Tequity, an applied AI and product studio. We help digital-health founders build the application, connect the healthcare data and add AI where it helps.</p>
        <a class="link" href="https://tequity.tech" rel="noopener">Visit tequity.tech {ext}</a>
      </div>
      <div class="footer-col">
        <h4>Explore</h4>
        <ul>
          <li><a href="{p}what-we-build.html">What We Build</a></li>
          <li><a href="{p}how-we-work.html">How We Work</a></li>
          <li><a href="{p}our-work.html">Our Work</a></li>
          <li><a href="{p}about.html">About</a></li>
          <li><a href="{p}contact.html">Book a discovery call</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h4>Healthcare work</h4>
        <ul>
          <li><a href="{p}work/stitch.html">Stitch</a></li>
          <li><a href="{p}work/lexi.html">Lexi</a></li>
          <li><a href="{p}work/elevare.html">Elevare</a></li>
          <li><a href="{p}work/clinical-notes.html">Clinical notes (name withheld)</a></li>
          <li><a href="{p}work/behavioural-health-intake.html">Behavioural-health intake (name withheld)</a></li>
        </ul>
      </div>
      <div class="footer-col">
        <h4>Contact</h4>
        <ul>
          <li><a href="mailto:hello@tequity.tech" data-verify="Contact inbox: keep hello@tequity.tech or set up a tequity.health address.">hello@tequity.tech</a></li>
          <li><a href="https://in.linkedin.com/company/tequitytech" rel="noopener">LinkedIn</a></li>
          <li>Bengaluru &middot; Mumbai &middot; Jodhpur</li>
          <li>HIPAA-aware delivery</li>
        </ul>
      </div>
    </div>
    <div class="footer-bottom">
      <span><i class="live-dot" aria-hidden="true"></i>Bengaluru <span data-clock>&nbsp;</span> &middot; &copy; <span data-year>2026</span> Tequity. All rights reserved.</span>
      <nav aria-label="Legal"><a href="https://tequity.tech/privacy-policy" rel="noopener">Privacy Policy</a><a href="https://tequity.tech/terms-of-service" rel="noopener">Terms of Service</a></nav>
    </div>
  </div>
  </div>
</footer>"""


def page_key(path: pathlib.Path) -> str:
    if path.parent.name == "work":
        return "our-work"
    return path.stem


def render_header(prefix: str, key: str) -> str:
    links = []
    for slug, label in NAV:
        current = ' aria-current="page"' if slug == key else ""
        links.append(f'      <a href="{prefix}{slug}.html"{current}>{label}</a>')
    return HEADER.format(
        p=prefix,
        links="\n".join(links),
        arrow=ARROW,
        cta_current=' aria-current="page"' if key == "contact" else "",
    )


def render_footer(prefix: str) -> str:
    return FOOTER.format(p=prefix, ext=EXT)


def sync(path: pathlib.Path) -> bool:
    html = path.read_text(encoding="utf-8")
    prefix = "../" if path.parent.name == "work" else ""
    key = page_key(path)
    new = re.sub(
        r"<!-- header:start -->.*?<!-- header:end -->",
        lambda _: "<!-- header:start -->\n" + render_header(prefix, key) + "\n<!-- header:end -->",
        html, flags=re.S,
    )
    new = re.sub(
        r"<!-- footer:start -->.*?<!-- footer:end -->",
        lambda _: "<!-- footer:start -->\n" + render_footer(prefix) + "\n<!-- footer:end -->",
        new, flags=re.S,
    )
    if new != html:
        path.write_text(new, encoding="utf-8")
        return True
    return False


if __name__ == "__main__":
    pages = sorted(list(ROOT.glob("*.html")) + list((ROOT / "work").glob("*.html")))
    for page in pages:
        changed = sync(page)
        print(("updated " if changed else "ok      ") + str(page.relative_to(ROOT)))
