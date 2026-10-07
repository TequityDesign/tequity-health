/* Tequity Health — site behaviour. No dependencies. */
(function () {
  'use strict';

  var doc = document.documentElement;
  /* ?motion=1 shows the full animation for review even when the OS asks for reduced motion; ?motion=0 clears it */
  var HASH = location.hash.replace('#', '');
  var motionParam = new URLSearchParams(location.search).get('motion');
  if (HASH === 'motion') motionParam = '1';
  if (HASH === 'calm') motionParam = '0';
  try {
    if (motionParam === '1') localStorage.setItem('th-motion', '1');
    if (motionParam === '0') localStorage.removeItem('th-motion');
  } catch (e) {}
  var forceMotion = motionParam === '1';
  try { forceMotion = forceMotion || localStorage.getItem('th-motion') === '1'; } catch (e) {}
  if (forceMotion) doc.classList.add('force-motion');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches && !forceMotion;
  var ROOT = (function () { var sc = document.currentScript; try { return sc ? new URL('../../', sc.src).href : ''; } catch (e) { return ''; } })();
  var pad2 = function (n) { return String(n).padStart(2, '0'); };
  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  /* ---------- Header: scrolled state + mobile menu ---------- */
  var header = $('.site-header');
  if (header) {
    var onScroll = function () { header.classList.toggle('is-scrolled', window.scrollY > 8); };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
  }

  var toggle = $('.menu-toggle');
  if (toggle) {
    var setMenu = function (open) {
      doc.classList.toggle('menu-open', open);
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    };
    toggle.addEventListener('click', function () { setMenu(!doc.classList.contains('menu-open')); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });
    $$('.nav a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
    window.addEventListener('resize', function () { if (window.innerWidth > 900) setMenu(false); });
  }

  /* ---------- Reveal on scroll ---------- */
  var revealEls = $$('.reveal, .stages');
  if ('IntersectionObserver' in window && !reduceMotion) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { entry.target.classList.add('is-in'); io.unobserve(entry.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('is-in'); });
  }

  /* ---------- Hero workflow: one workflow crossing three layers ---------- */
  var flow = $('[data-flow]');
  if (flow) {
    var steps = $$('.flow-step', flow);
    var progress = $('.flow-progress', flow);
    var render = function (active) {
      steps.forEach(function (s, i) {
        s.classList.toggle('is-done', i < active);
        s.classList.toggle('is-active', i === active);
        s.classList.toggle('is-pending', i > active);
      });
      var p = steps.length > 1 ? Math.min(active, steps.length - 1) / (steps.length - 1) : 1;
      if (progress) progress.style.setProperty('--p', p);
    };
    if (reduceMotion) {
      render(steps.length - 1);
      var fb = $('[data-flow-pause]'); if (fb) fb.hidden = true;
    } else {
      var i = 0, timer = null, running = false, paused = false, flowBtn = $('[data-flow-pause]');
      var tick = function () {
        render(i);
        var hold = i === steps.length - 1 ? 3600 : 1500;
        i = i === steps.length - 1 ? 0 : i + 1;
        timer = setTimeout(tick, hold);
      };
      var start = function () { if (!running && !paused) { running = true; tick(); } };
      var stop = function () { running = false; clearTimeout(timer); };
      if (flowBtn) flowBtn.addEventListener('click', function () {
        paused = !paused;
        flowBtn.setAttribute('aria-label', paused ? 'Play the workflow animation' : 'Pause the workflow animation');
        flowBtn.classList.toggle('is-paused', paused);
        paused ? stop() : start();
      });
      render(0);
      if ('IntersectionObserver' in window) {
        new IntersectionObserver(function (entries) {
          entries.forEach(function (e) { e.isIntersecting ? start() : stop(); });
        }, { threshold: 0.2 }).observe(flow);
      } else { start(); }
      document.addEventListener('visibilitychange', function () { document.hidden ? stop() : start(); });
    }
  }

  /* ---------- Scroll-spy (capability nav + case-study TOC) ---------- */
  function spy(linkSel) {
    var links = $$(linkSel);
    if (!links.length || !('IntersectionObserver' in window)) return;
    var map = {};
    links.forEach(function (a) {
      var id = a.getAttribute('href').split('#')[1];
      var target = id && document.getElementById(id);
      if (target) map[id] = a;
    });
    var setActive = function (id) {
      links.forEach(function (a) { a.classList.toggle('is-active', a === map[id]); });
      var active = map[id];
      var bar = active && active.parentElement;
      if (active && bar && bar.scrollWidth > bar.clientWidth) {
        bar.scrollTo({ left: active.offsetLeft - 16, behavior: reduceMotion ? 'auto' : 'smooth' });
      }
    };
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) { if (e.isIntersecting) setActive(e.target.id); });
    }, { rootMargin: '-35% 0px -60% 0px' });
    Object.keys(map).forEach(function (id) { obs.observe(document.getElementById(id)); });
  }
  spy('.cap-nav a');
  spy('.toc a');

  /* ---------- Stage tabs (How We Work) ---------- */
  var tablist = $('[role="tablist"].stage-tabs');
  if (tablist) {
    var tabs = $$('[role="tab"]', tablist);
    var select = function (tab, focus) {
      tabs.forEach(function (t) {
        var on = t === tab;
        t.setAttribute('aria-selected', String(on));
        t.tabIndex = on ? 0 : -1;
        var panel = document.getElementById(t.getAttribute('aria-controls'));
        if (!panel) return;
        panel.hidden = !on;
        if (on && !reduceMotion) {
          panel.classList.remove('is-entering'); void panel.offsetWidth; panel.classList.add('is-entering');
        }
      });
      if (focus) tab.focus();
      if (history.replaceState) history.replaceState(null, '', '#' + tab.dataset.stage);
    };
    tabs.forEach(function (t, idx) {
      t.addEventListener('click', function () { select(t); });
      t.addEventListener('keydown', function (e) {
        var n = null;
        if (e.key === 'ArrowRight') n = tabs[(idx + 1) % tabs.length];
        if (e.key === 'ArrowLeft') n = tabs[(idx - 1 + tabs.length) % tabs.length];
        if (e.key === 'Home') n = tabs[0];
        if (e.key === 'End') n = tabs[tabs.length - 1];
        if (n) { e.preventDefault(); select(n, true); }
      });
    });
    var fromHash = tabs.filter(function (t) { return '#' + t.dataset.stage === location.hash; })[0];
    if (fromHash) select(fromHash);
    $$('[data-goto-stage]').forEach(function (a) {
      a.addEventListener('click', function () {
        var t = tabs.filter(function (x) { return x.dataset.stage === a.dataset.gotoStage; })[0];
        if (t) select(t);
      });
    });
  }

  /* ---------- How We Work: the stage story follows the scroll; the menu jumps to a stage ---------- */
  var stx = $('[data-stx]');
  if (stx) (function () {
    var steps = $$('.stx-step', stx), links = $$('.stx-menu a', stx), scenes = $$('.stx-scn', stx);
    var nEl = $('[data-stx-n]', stx), tEl = $('[data-stx-t]', stx), art = $('.stx-art svg', stx), cur = null;
    function set(key) {
      if (!key || key === cur) return;
      cur = key;
      steps.forEach(function (s, i) {
        var on = s.dataset.stage === key;
        s.classList.toggle('is-on', on);
        if (on) { if (nEl) nEl.textContent = pad2(i + 1); }
      });
      links.forEach(function (a) {
        if (a.dataset.stage === key) { a.setAttribute('aria-current', 'true'); if (tEl) tEl.textContent = $('b', a).textContent; }
        else a.removeAttribute('aria-current');
      });
      scenes.forEach(function (g) { g.classList.toggle('is-on', g.dataset.stage === key); });
    }
    links.forEach(function (a) { a.addEventListener('click', function () { set(a.dataset.stage); }); });
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) set(e.target.dataset.stage); });
      }, { rootMargin: '-45% 0px -50% 0px' });
      steps.forEach(function (s) { io.observe(s); });
    }
    var fromHash = location.hash.replace('#', '');
    set(steps.some(function (s) { return s.dataset.stage === fromHash; }) ? fromHash : steps[0].dataset.stage);
    /* the drawing leans a little towards the pointer */
    if (art && !reduceMotion) {
      art.addEventListener('pointermove', function (e) {
        var r = art.getBoundingClientRect();
        art.style.setProperty('--ry', (((e.clientX - r.left) / r.width) - .5) * 8 + 'deg');
        art.style.setProperty('--rx', (.5 - ((e.clientY - r.top) / r.height)) * 8 + 'deg');
      });
      art.addEventListener('pointerleave', function () { art.style.removeProperty('--rx'); art.style.removeProperty('--ry'); });
    }
  })();

  /* ---------- Work filters (Our Work) ---------- */
  var filterBar = $('[data-filters]');
  if (filterBar) {
    var buttons = $$('.filter', filterBar);
    var items = $$('[data-layers]');
    var empty = $('[data-empty]');
    var status = $('.filter-status');
    buttons.forEach(function (b) {
      var key = b.dataset.filter;
      var count = key === 'all' ? items.length : items.filter(function (it) { return it.dataset.layers.split(' ').indexOf(key) > -1; }).length;
      var c = $('.count', b); if (c) c.textContent = count;
      b.addEventListener('click', function () {
        buttons.forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
        var shown = 0;
        items.forEach(function (it) {
          var match = key === 'all' || it.dataset.layers.split(' ').indexOf(key) > -1;
          it.hidden = !match;
          if (match) { shown++; it.classList.add('is-in'); }
        });
        if (empty) empty.hidden = shown > 0;
        if (status) status.textContent = shown === 1 ? '1 story' : shown + ' stories';
      });
    });
    var reset = $('[data-filter-reset]');
    if (reset) reset.addEventListener('click', function () { buttons[0].click(); });
  }

  /* ---------- Contact: qualify → schedule → confirm ---------- */
  var form = $('#discovery-form');
  if (form) {
    var panes = $$('.form-pane', form);
    var inds = $$('.form-step-ind');
    var summary = $('.form-summary', form);
    var state = { day: null, slot: null, weekOffset: 0 };

    var go = function (n) {
      panes.forEach(function (p, i) {
        p.hidden = i !== n;
        if (i === n && !reduceMotion) { p.classList.remove('is-entering'); void p.offsetWidth; p.classList.add('is-entering'); }
      });
      inds.forEach(function (ind, i) {
        ind.classList.toggle('is-current', i === n);
        ind.classList.toggle('is-done', i < n);
        if (i === n) ind.setAttribute('aria-current', 'step'); else ind.removeAttribute('aria-current');
      });
      var card = $('.form-card');
      if (card && card.getBoundingClientRect().top < 0) card.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
      var h = $('.h3', panes[n]); if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); }
    };

    var validators = {
      name: function (v) { return v.trim().length > 1 || 'Tell us who we will be speaking with.'; },
      email: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) || 'Enter a work email so we can send the invite.'; },
      company: function (v) { return v.trim().length > 1 || 'Add your company name.'; },
      website: function (v) { return !v.trim() || /^(https?:\/\/)?[^\s.]+\.[^\s]{2,}/i.test(v.trim()) || 'That does not look like a web address.'; },
      stage: function () { return !!form.querySelector('input[name="stage"]:checked') || 'Choose the stage that fits best.'; },
      building: function (v) { return v.trim().length > 9 || 'A sentence or two is enough.'; },
      timeline: function (v) { return !!v || 'Pick a rough timeline.'; }
    };

    var validateField = function (name) {
      var el = form.elements[name];
      var field = form.querySelector('[data-field="' + name + '"]');
      if (!field || !validators[name]) return true;
      var val = el && el.value !== undefined ? el.value : '';
      var res = validators[name](val);
      var ok = res === true;
      field.classList.toggle('has-error', !ok);
      var msg = $('.error span', field);
      if (msg && !ok) msg.textContent = res;
      var input = $('.input, .select, .textarea', field);
      if (input) input.setAttribute('aria-invalid', String(!ok));
      return ok;
    };

    Object.keys(validators).forEach(function (name) {
      var field = form.querySelector('[data-field="' + name + '"]');
      if (!field) return;
      field.addEventListener('change', function () { if (field.classList.contains('has-error')) validateField(name); });
      field.addEventListener('input', function () { if (field.classList.contains('has-error')) validateField(name); });
      var input = $('.input, .select, .textarea', field);
      if (input) input.addEventListener('blur', function () { if (input.value) validateField(name); });
    });

    $('[data-next="1"]', form).addEventListener('click', function () {
      var bad = Object.keys(validators).filter(function (n) { return !validateField(n); });
      if (bad.length) {
        summary.textContent = bad.length === 1 ? 'One field needs attention before we continue.' : bad.length + ' fields need attention before we continue.';
        summary.classList.add('show');
        var first = form.querySelector('[data-field="' + bad[0] + '"] .input, [data-field="' + bad[0] + '"] .select, [data-field="' + bad[0] + '"] .textarea, [data-field="' + bad[0] + '"] input');
        if (first) first.focus();
        return;
      }
      summary.classList.remove('show');
      buildDays();
      go(1);
    });

    $$('[data-back]', form).forEach(function (b) { b.addEventListener('click', function () { go(Number(b.dataset.back)); }); });

    /* Scheduler (stand-in for Cal.com / Calendly embed; see README) */
    var daysEl = $('.days', form), slotsEl = $('.slots', form), skel = $('.slots-skeleton', form);
    var confirmBtn = $('[data-next="2"]', form), label = $('[data-week-label]', form);
    var prevW = $('[data-week="-1"]', form), nextW = $('[data-week="1"]', form);
    var tzEl = $('[data-tz]', form);
    try { if (tzEl) tzEl.textContent = Intl.DateTimeFormat().resolvedOptions().timeZone.replace(/_/g, ' '); } catch (e) {}

    var weekdays = function (offset) {
      var out = [], d = new Date(); d.setHours(0, 0, 0, 0); d.setDate(d.getDate() + 1);
      while (out.length < 5 * (offset + 1)) {
        if (d.getDay() !== 0 && d.getDay() !== 6) out.push(new Date(d));
        d.setDate(d.getDate() + 1);
      }
      return out.slice(offset * 5);
    };
    var fmt = function (d, o) { return d.toLocaleDateString(undefined, o); };
    var slotTimes = ['09:00', '09:30', '10:30', '11:00', '13:30', '15:00', '16:30', '17:00'];
    var isoDate = function (d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
    /* Placeholder availability, varied per day. Replace with the scheduler's real slots. */
    var slotsFor = function (d) {
      var seed = d.getDate() + d.getMonth() * 31;
      return slotTimes.filter(function (_, k) { return (k * 7 + seed) % 5 !== 0; });
    };

    function buildDays() {
      var list = weekdays(state.weekOffset);
      daysEl.innerHTML = '';
      label.textContent = fmt(list[0], { month: 'long', day: 'numeric' }) + ' – ' + fmt(list[list.length - 1], { month: 'long', day: 'numeric' });
      prevW.disabled = state.weekOffset === 0; nextW.disabled = state.weekOffset >= 2;
      list.forEach(function (d) {
        var b = document.createElement('button');
        b.type = 'button'; b.className = 'day';
        var iso = isoDate(d);
        b.setAttribute('aria-pressed', String(state.day === iso));
        b.setAttribute('aria-label', fmt(d, { weekday: 'long', month: 'long', day: 'numeric' }));
        var open = slotsFor(d);
        b.innerHTML = '<span class="mono">' + fmt(d, { weekday: 'short' }) + '</span><b>' + d.getDate() + '</b><small>' + open.length + ' slots</small>';
        b.addEventListener('click', function () {
          state.day = iso; state.slot = null; confirmBtn.disabled = true;
          $$('.day', daysEl).forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
          loadSlots(d, open);
        });
        daysEl.appendChild(b);
      });
      if (!state.day) { slotsEl.innerHTML = '<p class="muted small" style="grid-column:1/-1">Choose a day to see available times.</p>'; }
    }

    function loadSlots(d, open) {
      slotsEl.hidden = true; skel.hidden = false;
      setTimeout(function () {
        skel.hidden = true; slotsEl.hidden = false; slotsEl.innerHTML = '';
        open.forEach(function (t) {
          var b = document.createElement('button');
          b.type = 'button'; b.className = 'slot'; b.textContent = t; b.setAttribute('aria-pressed', 'false');
          b.addEventListener('click', function () {
            state.slot = t;
            $$('.slot', slotsEl).forEach(function (x) { x.setAttribute('aria-pressed', String(x === b)); });
            confirmBtn.disabled = false;
          });
          slotsEl.appendChild(b);
        });
      }, reduceMotion ? 0 : 450);
    }

    prevW.addEventListener('click', function () { if (state.weekOffset > 0) { state.weekOffset--; buildDays(); } });
    nextW.addEventListener('click', function () { if (state.weekOffset < 2) { state.weekOffset++; buildDays(); } });

    confirmBtn.addEventListener('click', function () {
      if (!state.day || !state.slot) return;
      var d = new Date(state.day + 'T00:00:00');
      var stage = form.querySelector('input[name="stage"]:checked');
      var systems = $$('input[name="systems"]:checked', form).map(function (c) { return c.value; });
      $('[data-out="when"]', form).textContent = fmt(d, { weekday: 'long', month: 'long', day: 'numeric' }) + ', ' + state.slot + ' (30 min)';
      $('[data-out="company"]', form).textContent = form.elements.company.value.trim();
      $('[data-out="stage"]', form).textContent = stage ? stage.value : '';
      $('[data-out="systems"]', form).textContent = systems.length ? systems.join(', ') : 'None listed yet';
      $('[data-out="email"]', form).textContent = form.elements.email.value.trim();
      /* Integration point: POST the form + chosen slot to your CRM / scheduler here. */
      go(2);
    });

    form.addEventListener('submit', function (e) { e.preventDefault(); });
  }

  /* ---------- Header over a photo hero (home, Our Work) until the photo scrolls away ---------- */
  var photoHero = $('.hx-bg') || $('[data-bx]');
  if (photoHero && document.body.classList.contains('has-hx')) {
    var past = function () {
      document.body.classList.toggle('hx-past', photoHero.getBoundingClientRect().bottom <= (header ? header.offsetHeight : 72));
      document.body.classList.toggle('hx-scrolled', window.scrollY > 12);
    };
    past();
    window.addEventListener('scroll', past, { passive: true });
    window.addEventListener('resize', past);
  }

  /* ---------- Loader: a stack of the work shuffles and sharpens, then hands over (first view per visit) ---------- */
  if (doc.classList.contains('is-loading')) (function () {
    try { sessionStorage.setItem('th-loaded', '1'); } catch (e) {}
    var home = !!$('[data-hx]');
    var srcs = ['assets/img/uc-diagnostics.jpg', 'assets/img/uc-voice.jpg', 'assets/img/uc-care-coordination.jpg', 'assets/img/team.jpg'];
    var el = document.createElement('div');
    el.className = 'ld'; el.setAttribute('aria-hidden', 'true');
    el.innerHTML = '<span class="ld-side ld-l">Tequity Health</span><div class="ld-stack">' +
      srcs.map(function (src) { return '<div class="ld-card"><img src="' + ROOT + src + '" alt="" decoding="async"></div>'; }).join('') +
      '</div><span class="ld-side ld-r">Healthcare AI and product studio</span><span class="ld-count">000</span>';
    document.body.appendChild(el);
    doc.classList.add('ld-ready');
    var cards = $$('.ld-card', el), count = $('.ld-count', el), order = cards.slice(), finished = false, timers = [];
    var later = function (fn, ms) { timers.push(setTimeout(fn, ms)); };
    /* the front card in full; the ones behind peek out above and below, smaller each time */
    function arrange() {
      order.forEach(function (c, d) {
        var dy = d === 0 ? 0 : (d % 2 ? -1 : 1) * Math.ceil(d / 2) * 30;
        c.style.setProperty('--ty', dy + 'px');
        c.style.setProperty('--sc', (1 - d * .06).toFixed(3));
        c.style.setProperty('--z', 10 - d);
        c.classList.toggle('is-front', d === 0);
      });
    }
    function shuffle() { order.push(order.shift()); arrange(); }
    function finish() {
      if (finished) return; finished = true;
      timers.forEach(clearTimeout);
      count.textContent = '100';
      while (order[0] !== cards[cards.length - 1]) order.push(order.shift());
      arrange();
      var out = function () {
        document.dispatchEvent(new Event('th:handoff'));
        el.classList.add(home ? 'is-out' : 'is-lift');
        setTimeout(function () { el.remove(); doc.classList.remove('is-loading', 'ld-ready'); document.dispatchEvent(new Event('th:loaded')); }, home ? 650 : 1000);
      };
      if (home) {
        /* the last card is the hero photo: it grows to fill the screen */
        /* grows to the screen, which is exactly the hero photo's box, so the two crops match */
        el.classList.add('is-expand');
        setTimeout(out, 1100);
      } else setTimeout(out, 200);
    }
    arrange();
    requestAnimationFrame(function () { requestAnimationFrame(function () { el.classList.add('is-in'); }); });
    var t0 = performance.now();
    (function counter() {
      if (finished) return;
      var p = Math.min(1, (performance.now() - t0) / 1700);
      count.textContent = String(Math.round(p * 100)).padStart(3, '0');
      if (p < 1) requestAnimationFrame(counter);
    })();
    for (var k = 0; k < 7; k++) later(shuffle, 520 + k * 170);
    later(finish, 1850);
    /* a click or a key skips it */
    var skip = function () { finish(); };
    el.addEventListener('click', skip);
    document.addEventListener('keydown', skip, { once: true });
  })();

  /* ---------- Home hero: the photo first, then the data field, then the work ---------- */
  var hx = $('[data-hx]');
  if (hx) (function () {
    var bg = $('.hx-bg', hx), photo = $('.hx-photo', hx), canvas = $('.hx-field', hx);


    /* the data field: a map of the lower 48 drawn in digits, one density per state,
       over a faint trace of the photo. The pointer brings the digits into focus. */
    var field = (function () {
      var ctx = canvas.getContext('2d'), grid = window.TH_US_GRID;
      var dpr = Math.min(window.devicePixelRatio || 1, 2);
      var W = 0, H = 0, cw = 6.6, chH = 13, font = '', cells = [];
      var running = false, inView = true, raf = 0, last = 0, t0 = 0, built = false, paused = false;
      var px = -1e4, py = -1e4, R = 150;
      var DIG = '0123456789', MARKS = '..::+', CREAM = '244,242,240', TEAL = '127,220,202', ACC = '19,180,155';
      var rnd = function (n) { return Math.floor(Math.random() * n); };

      function build() {
        if (!grid) return false;
        var r = canvas.getBoundingClientRect();
        W = Math.round(r.width); H = Math.round(r.height);
        if (!W || !H) return false;
        canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        var size = W < 600 ? 10 : 11;
        font = size + 'px "IBM Plex Mono", ui-monospace, monospace';
        ctx.font = font; ctx.textBaseline = 'top';
        cw = ctx.measureText('0').width || size * .6; chH = Math.round(size * 1.24);
        var cols = Math.ceil(W / cw), rows = Math.ceil(H / chH), lum = null;
        try { /* one luminance sample per cell; fails quietly on file:// */
          var iw = photo.naturalWidth, ih = photo.naturalHeight;
          if (iw && ih) {
            var off = document.createElement('canvas'); off.width = cols; off.height = rows;
            var o = off.getContext('2d', { willReadFrequently: true });
            var sc = Math.max(W / iw, H / ih), sw = W / sc, sh = H / sc;
            o.drawImage(photo, (iw - sw) / 2, (ih - sh) / 2, sw, sh, 0, 0, cols, rows);
            lum = o.getImageData(0, 0, cols, rows).data;
          }
        } catch (e) { lum = null; }
        var aspect = (grid.cols * 6.6) / (grid.rows * 13.2);
        var mw = Math.min(W * (W < 700 ? 1.04 : .84), H * .72 * aspect), mh = mw / aspect;
        var mx = (W - mw) / 2, my = Math.max(H * .1, (H - mh) * .36);
        cells = [];
        /* the field stays quiet behind the words, so the text keeps its contrast */
        var quiet = $$('.hx-top, .hx-copy .eyebrow, .hx-title, .hx-sub', hx).map(function (el) {
          var q = el.getBoundingClientRect();
          return [q.left - r.left - 28, q.top - r.top - 20, q.right - r.left + 28, q.bottom - r.top + 20];
        });
        var isQuiet = function (x, y) {
          for (var k = 0; k < quiet.length; k++) { var q = quiet[k]; if (x > q[0] && x < q[2] && y > q[1] && y < q[3]) return true; }
          return false;
        };
        for (var y = 0; y < rows; y++) {
          for (var x = 0; x < cols; x++) {
            var cx = x * cw + cw / 2, cy = y * chH + chH / 2;
            var gx = Math.floor((cx - mx) / mw * grid.cols), gy = Math.floor((cy - my) / mh * grid.rows);
            var st = (gx >= 0 && gy >= 0 && gx < grid.cols && gy < grid.rows) ? grid.data.charAt(gy * grid.cols + gx) : '.';
            var cell;
            if (st !== '.') {
              var v = ((st.charCodeAt(0) * 37) % 101) / 100; /* each state its own density, like a choropleth */
              cell = { x: x * cw, y: y * chH, m: 1, a: .2 + v * .5, t: v > .42, c: DIG.charAt(rnd(10)) };
            } else {
              var i4 = (y * cols + x) * 4;
              var l = lum ? (lum[i4] * .299 + lum[i4 + 1] * .587 + lum[i4 + 2] * .114) / 255 : Math.random() * .55;
              if (l < .5 || Math.random() > l * .5) continue; /* a sparse trace of the photo */
              cell = { x: x * cw, y: y * chH, m: 0, a: .03 + (l - .5) * .2, t: false, c: l > .78 ? DIG.charAt(rnd(10)) : MARKS.charAt(rnd(MARKS.length)) };
            }
            if (isQuiet(cx, cy)) { cell.a *= .28; cell.q = 1; }
            cell.r = (x / cols) * 900 + Math.random() * 700; /* the digits resolve in a sweep from the left */
            cells.push(cell);
          }
        }
        built = true;
        return true;
      }

      function draw(now) {
        var el = now - t0, buckets = {};
        ctx.clearRect(0, 0, W, H);
        ctx.font = font;
        for (var i = 0; i < cells.length; i++) {
          var c = cells[i], a = c.a, col = c.t ? TEAL : CREAM, chr = c.c;
          if (el < c.r) {
            if (el < c.r - 450) continue;
            chr = DIG.charAt(rnd(10)); a *= .55;
          } else if (!reduceMotion && c.m && Math.random() < .003) {
            c.c = DIG.charAt(rnd(10)); chr = c.c;
          }
          var dx = c.x - px, dy = c.y - py, d2 = dx * dx + dy * dy;
          if (d2 < R * R) {
            var k = 1 - Math.sqrt(d2) / R;
            a = Math.min(1, a + k * (c.q ? .1 : c.m ? .7 : .3));
            if (c.m && !c.q && k > .3) col = ACC;
          }
          var key = col + '|' + Math.round(a * 20);
          (buckets[key] || (buckets[key] = [])).push(c.x, c.y, chr);
        }
        for (var key2 in buckets) {
          var parts = key2.split('|'), list = buckets[key2];
          ctx.fillStyle = 'rgba(' + parts[0] + ',' + (parts[1] / 20) + ')';
          for (var j = 0; j < list.length; j += 3) ctx.fillText(list[j + 2], list[j], list[j + 1]);
        }
      }

      function loop(now) {
        raf = requestAnimationFrame(loop);
        if (now - last < 33) return;
        last = now; draw(now);
      }
      function play() { if (!running && built && inView && !reduceMotion && !paused) { running = true; raf = requestAnimationFrame(loop); } }
      function stop() { running = false; cancelAnimationFrame(raf); }

      return {
        pause: function (on) { paused = on; if (on) stop(); else play(); },
        start: function () {
          var ready = document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve();
          ready.then(function () {
            if (!build()) return;
            t0 = performance.now();
            if (reduceMotion) { t0 -= 1e4; draw(performance.now()); } else play();
          });
          var rt = 0;
          window.addEventListener('resize', function () {
            clearTimeout(rt);
            rt = setTimeout(function () { if (build() && reduceMotion) draw(performance.now()); }, 160);
          });
          if ('IntersectionObserver' in window) {
            new IntersectionObserver(function (es) { es.forEach(function (e) { inView = e.isIntersecting; inView ? play() : stop(); }); }).observe(bg);
          }
          document.addEventListener('visibilitychange', function () { document.hidden ? stop() : play(); });
          var pending = false;
          var redraw = function () { if (reduceMotion && built && !pending) { pending = true; requestAnimationFrame(function () { pending = false; draw(performance.now()); }); } };
          hx.addEventListener('pointermove', function (e) { var r = canvas.getBoundingClientRect(); px = e.clientX - r.left; py = e.clientY - r.top; redraw(); });
          hx.addEventListener('pointerleave', function () { px = py = -1e4; redraw(); });
        }
      };
    })();

    /* the figures count up once, as the data arrives */
    function countUp() {
      $$('[data-count]', hx).forEach(function (el) {
        var to = +el.dataset.count, fmt = function (n) { return Math.round(n).toLocaleString('en-US'); };
        if (reduceMotion) { el.textContent = fmt(to); return; }
        var t1 = performance.now(), dur = 1800;
        (function step(now) {
          var p = Math.min(1, (now - t1) / dur);
          el.textContent = fmt(to * (1 - Math.pow(1 - p, 3)));
          if (p < 1) requestAnimationFrame(step);
        })(t1);
      });
    }

    /* a live estimate: how much clinical conversation was interpreted while this page was open */
    var live = $('[data-live-interp]', hx);
    if (live) {
      var perSec = +live.dataset.liveInterp / (30.4375 * 86400) * 60; /* seconds interpreted per real second */
      var tStart = performance.now();
      var tick = function () {
        var secs = Math.floor((performance.now() - tStart) / 1000 * perSec);
        live.textContent = Math.floor(secs / 60) + ':' + String(secs % 60).padStart(2, '0');
      };
      tick(); setInterval(tick, 1000);
    }

    if (!reduceMotion) $$('[data-count]', hx).forEach(function (el) { el.textContent = '0'; });

    /* sequence: the photo, then the text on it, then the data */
    var begun = false;
    var begin = function () {
      if (begun) return; begun = true;
      hx.classList.add('is-photo');
      setTimeout(function () { hx.classList.add('is-data'); field.start(); countUp(); }, reduceMotion ? 0 : 1100);
    };
    if (doc.classList.contains('is-loading')) {
      /* the loader's last card is this photo: take it over without a second fade */
      document.addEventListener('th:handoff', function () { hx.classList.add('no-intro'); begin(); }, { once: true });
    } else if (photo.complete) requestAnimationFrame(begin);
    else { photo.addEventListener('load', begin); photo.addEventListener('error', begin); setTimeout(begin, 2500); }

    /* the case studies: a carousel at the foot of the first screen, synced to the figures */
    var car = $('[data-carousel]', hx);
    if (!car) return;
    var cards = $$('.hxc-card', car), n = cards.length, idx = 0, DUR = 6000;
    var playing = !reduceMotion, held = false, carInView = true, timer = 0, remaining = DUR, startedAt = 0, dragged = false;
    var idxEl = $('[data-idx]', car), bar = $('.hxc-bar i', car), status = $('[data-hxc-status]', car), playBtn = $('[data-play]', car);
    var metrics = $$('.hx-m', hx);
    car.style.setProperty('--dur', DUR + 'ms');
    if (!playing) playBtn.setAttribute('aria-label', 'Play animation');

    var restartBar = function () { if (bar) { bar.classList.remove('run'); void bar.offsetWidth; bar.classList.add('run'); } };
    function place() {
      cards.forEach(function (card, i) {
        var o = ((i - idx) % n + n) % n; if (o > n / 2) o -= n;
        var abs = Math.abs(o), jump = card._o !== undefined && Math.abs(o - card._o) > 2;
        if (jump) card.classList.add('no-anim');
        card.style.setProperty('--o', o);
        card.style.setProperty('--s', abs === 0 ? 1 : abs === 1 ? .82 : .68);
        card.style.setProperty('--a', abs === 0 ? 1 : abs === 1 ? .72 : abs === 2 ? .3 : 0);
        card.style.setProperty('--z', 10 - abs);
        card.style.visibility = abs > 2 ? 'hidden' : '';
        card.classList.toggle('is-active', o === 0);
        card.setAttribute('aria-hidden', o === 0 ? 'false' : 'true');
        $('a', card).tabIndex = o === 0 ? 0 : -1;
        if (jump) { void card.offsetWidth; card.classList.remove('no-anim'); }
        card._o = o;
      });
      var c = cards[idx].dataset.case;
      metrics.forEach(function (m) { m.classList.toggle('is-hot', m.dataset.case === c); });
      idxEl.textContent = String(idx + 1).padStart(2, '0');
      restartBar();
    }
    function run() { clearTimeout(timer); startedAt = performance.now(); timer = setTimeout(function () { go(idx + 1); }, remaining); }
    function hold() { if (timer) { clearTimeout(timer); timer = 0; remaining = Math.max(0, remaining - (performance.now() - startedAt)); } }
    function sync() {
      var active = playing && !held && carInView;
      car.classList.toggle('is-playing', playing);
      car.classList.toggle('is-held', playing && !active);
      if (active) { if (!timer) run(); } else hold();
    }
    function go(i, user) {
      idx = (i + n) % n; remaining = DUR; clearTimeout(timer); timer = 0;
      place();
      if (user && status) status.textContent = 'Case study ' + (idx + 1) + ' of ' + n + ': ' + cards[idx].getAttribute('aria-label').split(': ')[1];
      sync();
    }

    $$('[data-dir]', car).forEach(function (b) { b.addEventListener('click', function () { go(idx + +b.dataset.dir, true); }); });
    playBtn.addEventListener('click', function () {
      playing = !playing;
      playBtn.setAttribute('aria-label', playing ? 'Pause animation' : 'Play animation');
      field.pause(!playing);
      if (playing) { remaining = DUR; restartBar(); }
      sync();
    });
    cards.forEach(function (card, i) {
      $('a', card).addEventListener('click', function (e) {
        if (dragged) { e.preventDefault(); return; }
        if (!card.classList.contains('is-active')) { e.preventDefault(); go(i, true); }
      });
    });
    car.addEventListener('pointerenter', function (e) { if (e.pointerType === 'mouse') { held = true; sync(); } });
    car.addEventListener('pointerleave', function (e) { if (e.pointerType === 'mouse') { held = false; sync(); } });
    car.addEventListener('focusin', function () { held = true; sync(); });
    car.addEventListener('focusout', function (e) { if (!car.contains(e.relatedTarget)) { held = false; sync(); } });
    car.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); go(idx + 1, true); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(idx - 1, true); }
    });
    var track = $('.hxc-track', car), x0 = null;
    track.addEventListener('pointerdown', function (e) { x0 = e.clientX; dragged = false; });
    track.addEventListener('pointermove', function (e) { if (x0 !== null && Math.abs(e.clientX - x0) > 8) dragged = true; });
    track.addEventListener('pointerup', function (e) {
      if (x0 === null) return;
      var dx = e.clientX - x0; x0 = null;
      if (Math.abs(dx) > 40) go(idx + (dx < 0 ? 1 : -1), true);
      setTimeout(function () { dragged = false; }, 0);
    });
    track.addEventListener('pointercancel', function () { x0 = null; });
    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (es) { es.forEach(function (e) { carInView = e.isIntersecting; sync(); }); }, { threshold: .25 }).observe(car);
    }
    place(); sync();
  })();

  /* ---------- A to Z: find a workflow by its first letter ---------- */
  var az = $('[data-az]');
  if (az) (function () {
    var items = [];
    items = window.TH_AZ || [];
    if (!items.length) { try { items = JSON.parse($('#az-data').textContent); } catch (e) { return; } }
    var lettersEl = $('[data-az-letters]', az), out = $('[data-az-results]', az), q = $('[data-az-q]', az), current = null;
    var first = function (t) { var c = t.charAt(0).toUpperCase(); return /[A-Z]/.test(c) ? c : '#'; };
    var TAGS = { app: ['layer-app', 'App'], ai: ['layer-ai', 'AI'], data: ['layer-data', 'Data'], x: ['layer-x', 'Across layers'] };
    var ARR = '<svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3.5 8h9m0 0L8 3.5M12.5 8L8 12.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    var esc = function (v) { return String(v).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };

    function render(list, title, sub) {
      if (!list.length) {
        out.innerHTML = '<div class="az-empty"><b>Nothing under that yet</b><p>We may still have built something like it. Tell us what you are working on and we will say plainly whether we have done it before.</p><a class="link" href="' + ROOT + 'contact.html">Book a discovery call ' + ARR + '</a></div>';
        return;
      }
      out.innerHTML = '<div class="az-head"><b>' + esc(title) + '</b><span>' + esc(sub) + '</span></div><ul class="az-list">' + list.map(function (it, i) {
        var tags = it.l.map(function (l) { return '<span class="layer-tag ' + TAGS[l][0] + '">' + TAGS[l][1] + '</span>'; }).join('');
        var cap = it.p === 'Capability';
        return '<li style="--i:' + i + '"><a href="' + esc(ROOT + it.h) + '"><span class="az-t"><b>' + esc(it.t) + '</b><span>' + esc(it.d) + '</span></span><span class="tag-row">' + tags + '</span><span class="az-proof' + (cap ? ' is-cap' : '') + '">' + (cap ? 'How we build it' : esc(it.p)) + ' ' + ARR + '</span></a></li>';
      }).join('') + '</ul>';
    }
    function pick(L) {
      current = L;
      $$('.az-letter', lettersEl).forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.l === L)); });
      var list = items.filter(function (it) { return first(it.t) === L; }).sort(function (a, b) { return a.t.localeCompare(b.t); });
      render(list, L === '#' ? '0–9' : L, list.length + (list.length === 1 ? ' entry' : ' entries'));
    }
    'ABCDEFGHIJKLMNOPQRSTUVWXYZ#'.split('').forEach(function (L) {
      var has = items.some(function (it) { return first(it.t) === L; });
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'az-letter'; b.textContent = L; b.dataset.l = L;
      b.setAttribute('aria-pressed', 'false');
      b.setAttribute('aria-label', (L === '#' ? 'Numbers' : L) + (has ? '' : ', nothing listed yet'));
      if (!has) b.setAttribute('aria-disabled', 'true');
      b.addEventListener('click', function () { if (!has) return; q.value = ''; pick(L); });
      lettersEl.appendChild(b);
    });
    q.addEventListener('input', function () {
      var v = q.value.trim().toLowerCase();
      if (v.length < 2) { pick(current || 'C'); return; }
      $$('.az-letter', lettersEl).forEach(function (b) { b.setAttribute('aria-pressed', 'false'); });
      var list = items.filter(function (it) { return (it.t + ' ' + it.d + ' ' + it.p).toLowerCase().indexOf(v) > -1; })
        .sort(function (a, b) { return a.t.localeCompare(b.t); });
      render(list, '“' + q.value.trim() + '”', list.length + (list.length === 1 ? ' match' : ' matches'));
    });
    pick('C');
  })();

  /* ---------- Bottom dock: the page's sections as numbered tiles, and a card to talk to us ---------- */
  (function () {
    var secs = $$('[data-dock]'), isContact = !!$('#discovery-form');
    if (secs.length < 3 && isContact) return;
    var esc = function (v) { return String(v).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); };
    var CHEV = '<svg viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M3 7.5L6 4.5l3 3" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" stroke-linejoin="round"/></svg>';
    var X = '<svg viewBox="0 0 12 12" fill="none" aria-hidden="true"><path d="M3 3l6 6M9 3L3 9" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/></svg>';
    var dock = document.createElement('div');
    dock.className = 'dock';
    var html = '';
    if (secs.length >= 3) {
      html += '<nav class="dock-index" aria-label="Sections on this page"><button class="dock-current dock-glass" type="button" aria-expanded="false"><span class="n"></span><span class="t"></span>' + CHEV + '</button><div class="dock-list dock-glass">' +
        secs.map(function (sec, i) {
          if (!sec.id) sec.id = 'part-' + (i + 1);
          return '<a class="dock-i" href="#' + sec.id + '"><span class="n">' + pad2(i + 1) + '</span><span class="t"><span>' + esc(sec.dataset.dock) + '</span></span></a>';
        }).join('') + '</div></nav>';
    } else html += '<span></span>';
    if (!isContact) {
      html += '<div class="dock-cta"><div class="dock-card dock-glass" id="dock-card" role="dialog" aria-label="Talk to the team" hidden>' +
        '<button class="dock-x" type="button" aria-label="Close">' + X + '</button>' +
        '<span class="mono">Discovery call &middot; 30 minutes</span><b>Tell us what you are building.</b>' +
        '<p>We will understand the product, the current constraint and the external dependencies, and whether there is a sensible first engagement.</p>' +
        '<a class="btn btn--light btn--sm" href="' + ROOT + 'contact.html">Book a discovery call <svg viewBox="0 0 16 16" fill="none" aria-hidden="true"><path d="M3.5 8h9m0 0L8 3.5M12.5 8L8 12.5" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg></a>' +
        '<a class="dock-mail" href="mailto:hello@tequity.tech">hello@tequity.tech</a></div>' +
        '<div class="dock-cta-row dock-glass"><a class="dock-tile" href="#main" aria-label="Back to top">T<i aria-hidden="true"></i></a>' +
        '<button class="dock-book" type="button" aria-expanded="false" aria-controls="dock-card">Book a call<span class="ic" aria-hidden="true"><svg viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 9.5 9.5 2.5M4 2.5h5.5V8"/></svg></span></button></div></div>';
    }
    dock.innerHTML = html;
    document.body.appendChild(dock);
    document.body.classList.add('has-dock');

    /* shown once the first screen has gone by */
    var shown = function () { dock.classList.toggle('is-shown', window.scrollY > Math.min(window.innerHeight * .55, 480)); };
    shown(); window.addEventListener('scroll', shown, { passive: true });

    /* which section we are in */
    var links = $$('.dock-i', dock), cur = $('.dock-current', dock), index = $('.dock-index', dock);
    var setActive = function (id) {
      links.forEach(function (a, i) {
        var on = a.getAttribute('href') === '#' + id;
        a.classList.toggle('is-active', on);
        if (on) a.setAttribute('aria-current', 'location'); else a.removeAttribute('aria-current');
        if (on && cur) { $('.n', cur).textContent = pad2(i + 1); $('.t', cur).textContent = secs[i].dataset.dock; }
      });
    };
    if (links.length && 'IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) setActive(e.target.id); }); }, { rootMargin: '-45% 0px -50% 0px' });
      secs.forEach(function (sec) { io.observe(sec); });
      setActive(secs[0].id);
    }
    if (cur) {
      cur.addEventListener('click', function () { var open = !index.classList.contains('is-open'); index.classList.toggle('is-open', open); cur.setAttribute('aria-expanded', String(open)); });
      links.forEach(function (a) { a.addEventListener('click', function () { index.classList.remove('is-open'); cur.setAttribute('aria-expanded', 'false'); }); });
    }

    /* the talk card */
    var book = $('.dock-book', dock), card = $('#dock-card', dock);
    if (book) {
      var setCard = function (open) { card.hidden = !open; book.setAttribute('aria-expanded', String(open)); if (open) $('.btn', card).focus(); };
      book.addEventListener('click', function () { setCard(card.hidden); });
      $('.dock-x', card).addEventListener('click', function () { setCard(false); book.focus(); });
      document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !card.hidden) { setCard(false); book.focus(); } });
      document.addEventListener('click', function (e) { if (!card.hidden && !dock.contains(e.target)) setCard(false); });
    }
  })();

  /* ---------- Work index hero (Our Work): hover a row and the image follows it ---------- */
  var bx = $('[data-bx]');
  if (bx) (function () {
    var rows = $$('.bx-rows a', bx), slides = $$('.bx-slide', bx), list = $('.bx-rows', bx);
    var i = 0, timer = 0, held = false, inView = true, paused = false, DUR = 3400, pauseBtn = $('[data-bx-pause]', bx);
    function show(k) {
      i = (k + rows.length) % rows.length;
      var key = rows[i].dataset.key;
      rows.forEach(function (r, j) { r.classList.toggle('is-on', j === i); });
      slides.forEach(function (sl) { sl.classList.toggle('is-on', sl.dataset.key === key); });
    }
    function next() {
      clearTimeout(timer);
      if (!held && inView && !reduceMotion && !paused) timer = setTimeout(function () { show(i + 1); next(); }, DUR);
    }
    if (pauseBtn) {
      if (reduceMotion) pauseBtn.hidden = true;
      pauseBtn.addEventListener('click', function () {
        paused = !paused;
        pauseBtn.textContent = paused ? 'Play' : 'Pause';
        pauseBtn.setAttribute('aria-label', paused ? 'Play the preview rotation' : 'Pause the preview rotation');
        paused ? clearTimeout(timer) : next();
      });
    }
    rows.forEach(function (r, j) {
      r.addEventListener('mouseenter', function () { held = true; clearTimeout(timer); show(j); });
      r.addEventListener('focus', function () { held = true; clearTimeout(timer); show(j); });
    });
    list.addEventListener('mouseleave', function () { held = false; next(); });
    list.addEventListener('focusout', function (e) { if (!list.contains(e.relatedTarget)) { held = false; next(); } });
    if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { es.forEach(function (e) { inView = e.isIntersecting; inView ? next() : clearTimeout(timer); }); }).observe(bx);
    show(0);
    /* photo first, then the text on it */
    var first = $('.bx-slide img', bx), started = false;
    var start = function () {
      if (started) return; started = true;
      bx.classList.add('is-photo');
      setTimeout(function () { bx.classList.add('is-text'); next(); }, reduceMotion ? 0 : 650);
    };
    if (doc.classList.contains('is-loading')) document.addEventListener('th:handoff', start, { once: true });
    else if (!first || first.complete) requestAnimationFrame(start);
    else { first.addEventListener('load', start); first.addEventListener('error', start); setTimeout(start, 2000); }
  })();

  /* ---------- Follower (case studies): the visual follows the reader, tilting with the scroll ---------- */
  var follow = $('[data-follow]');
  if (follow) (function () {
    var card = $('[data-follow-card]', follow), n = $('[data-follow-n]', follow), t = $('[data-follow-t]', follow);
    var secs = $$('.cs-section'), heads = secs.map(function (sc) { var h = $('h2', sc); return h ? h.textContent : ''; });
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (!e.isIntersecting) return;
          var k = secs.indexOf(e.target);
          n.textContent = pad2(k + 1); t.textContent = heads[k];
        });
      }, { rootMargin: '-35% 0px -60% 0px' });
      secs.forEach(function (sc) { io.observe(sc); });
    }
    if (reduceMotion || !card) return;
    var lastY = window.scrollY, vel = 0, cur = 0, raf = 0;
    var clamp = function (v, m) { return Math.max(-m, Math.min(m, v)); };
    function tick() {
      var y = window.scrollY, dv = y - lastY; lastY = y;
      vel += (dv - vel) * .25;   /* how fast the page is moving */
      cur += (vel - cur) * .1;   /* the card catches up a little late */
      card.style.transform = 'translate3d(0,' + clamp(-cur * 1.2, 26).toFixed(2) + 'px,0) rotate(' + clamp(cur * .32, 9).toFixed(2) + 'deg) skewY(' + clamp(cur * .12, 4).toFixed(2) + 'deg)';
      if (Math.abs(cur) > .02 || Math.abs(vel) > .02) raf = requestAnimationFrame(tick);
      else { raf = 0; card.style.transform = ''; }
    }
    window.addEventListener('scroll', function () { if (!raf) raf = requestAnimationFrame(tick); }, { passive: true });
  })();

  /* ---------- Buttons: the edge light follows the pointer (as on Design Labs) ---------- */
  document.addEventListener('pointermove', function (e) {
    var b = e.target && e.target.closest ? e.target.closest('.btn') : null;
    if (!b) return;
    var r = b.getBoundingClientRect();
    b.style.setProperty('--mx', (e.clientX - r.left) + 'px');
    b.style.setProperty('--my', (e.clientY - r.top) + 'px');
  }, { passive: true });

  /* ---------- Live figures: one source for both hero options (assets/js/impact.js) ---------- */
  (function () {
    var cfg = window.TH_IMPACT || { figures: [] }, byId = {};
    (cfg.figures || []).forEach(function (f) { byId[f.id] = f; });
    $$('[data-impact]').forEach(function (el) {
      var f = byId[el.dataset.impact], out = $('.v, dd', el);
      if (!f || !out) return;
      if (f.value === null || f.value === undefined || f.value === '') {
        el.classList.add('is-pending');
        out.textContent = '—';
        if (!el.hasAttribute('data-verify')) el.setAttribute('data-verify', 'Add the figure for “' + (f.label || f.id) + '” in assets/js/impact.js.');
        return;
      }
      var to = +f.value, suf = f.suffix || '', fmt = function (n) { return Math.round(n).toLocaleString('en-US') + suf; };
      if (reduceMotion || !('IntersectionObserver' in window)) { out.textContent = fmt(to); return; }
      out.textContent = fmt(0);
      var io = new IntersectionObserver(function (es) {
        es.forEach(function (e) {
          if (!e.isIntersecting) return;
          io.disconnect();
          var t1 = performance.now();
          (function step(now) {
            var p = Math.min(1, (now - t1) / 1600);
            out.textContent = fmt(to * (1 - Math.pow(1 - p, 3)));
            if (p < 1) requestAnimationFrame(step);
          })(t1);
        });
      }, { threshold: .4 });
      io.observe(el);
    });
    $$('[data-impact-asof]').forEach(function (el) { el.textContent = cfg.asOf ? 'As of ' + cfg.asOf : 'Figures pending'; });
  })();

  /* ---------- The rotating word in a headline (as on Design Labs) ---------- */
  $$('[data-rot]').forEach(function (rot) {
    var words = $$('span', rot), k = 0;
    if (words.length < 2) return;
    words.forEach(function (w, i) { w.classList.toggle('is-on', i === 0); if (i) w.setAttribute('aria-hidden', 'true'); });
    if (reduceMotion) return;
    setInterval(function () {
      if (rot.closest('.is-paused')) return;
      var cur = words[k];
      k = (k + 1) % words.length;
      cur.classList.remove('is-on'); cur.classList.add('is-out');
      var nxt = words[k];
      nxt.classList.remove('is-out'); void nxt.offsetWidth; nxt.classList.add('is-on');
      setTimeout(function () { cur.classList.add('no-tr'); cur.classList.remove('is-out'); void cur.offsetWidth; cur.classList.remove('no-tr'); }, 900);
    }, 2600);
  });

  /* ---------- Home hero: "What stage are you at?" in the visitor's own words, then proof beside it ---------- */
  var hb = $('[data-hb]');
  if (hb) (function () {
    var form = $('[data-ask]', hb), input = $('#hb-ask-in', hb), msg = $('[data-ask-msg]', hb);
    var chips = $$('.hb-chips [data-stage]', hb), sets = $$('.hbp', hb), visual = $('[data-hb-visual]', hb);
    var NAMES = { idea: 'Idea', seed: 'Seed', pmf: 'PMF', scale: 'Scale' };
    /* plain-language clues for each stage; the strongest match wins */
    var CLUES = {
      idea: ['idea', 'concept', 'validat', 'prototype', 'pre-seed', 'preseed', 'no product', 'not built', 'starting', 'exploring', 'research', 'thinking', 'plan', 'wireframe', 'just an'],
      seed: ['mvp', 'seed', 'launched', 'pilot', 'beta', 'early users', 'first users', 'first customer', 'feedback', 'live with', 'v1', 'first version', 'a few clinic', 'two clinic', 'handful'],
      pmf: ['pmf', 'product market fit', 'product-market', 'traction', 'growing', 'growth', 'series a', 'revenue', 'demand', 'backlog', 'more priorities', 'not enough', 'capacity', 'roadmap', 'paying'],
      scale: ['scale', 'scaling', 'series b', 'series c', 'enterprise', 'hundreds', 'thousands', 'million', 'nationwide', 'health system', 'hospitals', 'dedicated team', 'in-house', 'in house', 'own team', 'build-operate']
    };
    function guess(text) {
      var s = ' ' + text.toLowerCase() + ' ', best = null, top = 0;
      Object.keys(CLUES).forEach(function (k) {
        var n = 0;
        CLUES[k].forEach(function (c) { if (s.indexOf(c) > -1) n += c.length > 4 ? 2 : 1; });
        if (n > top) { top = n; best = k; }
      });
      return best;
    }
    function show(k, typed) {
      chips.forEach(function (c) { c.setAttribute('aria-pressed', String(c.dataset.stage === k)); });
      sets.forEach(function (s) {
        var on = s.dataset.stage === (k || 'all');
        s.hidden = !on;
        if (on && !reduceMotion) { s.classList.remove('is-entering'); void s.offsetWidth; s.classList.add('is-entering'); }
      });
      if (visual) visual.classList.toggle('is-answered', !!k);
      if (!k) return;
      msg.textContent = (typed ? 'Sounds like the ' + NAMES[k] + ' stage. ' : '') + 'Here is what we built for founders at ' + NAMES[k] + '.';
      $$('[data-ask-book]', hb).forEach(function (a) {
        a.setAttribute('href', 'contact.html?stage=' + k + (typed ? '&note=' + encodeURIComponent(typed.slice(0, 300)) : ''));
      });
    }
    if (form) form.addEventListener('submit', function (e) {
      e.preventDefault();
      var text = input.value.trim();
      if (!text) { msg.textContent = 'Tell us in a few words, or pick the closest stage.'; input.focus(); return; }
      var k = guess(text);
      if (k) show(k, text);
      else msg.textContent = 'Thanks. Which of these is closest? Pick one and we will show you the work.';
    });
    chips.forEach(function (c) { c.addEventListener('click', function () { show(c.dataset.stage, input.value.trim()); }); });
    /* "See all" opens the stage picker further down with the same stage chosen */
    $$('[data-goto-pick]', hb).forEach(function (a) {
      a.addEventListener('click', function () {
        var o = $('.pk-opt[data-pick="' + a.dataset.gotoPick + '"]');
        if (o && o.getAttribute('aria-pressed') !== 'true') o.click();
      });
    });
    /* the pause button rests the rotating headline word */
    var pauseBtn = $('[data-hb-pause]', hb), paused = false;
    if (pauseBtn) {
      if (reduceMotion) pauseBtn.hidden = true;
      pauseBtn.addEventListener('click', function () {
        paused = !paused;
        pauseBtn.setAttribute('aria-label', paused ? 'Play the rotating headline' : 'Pause the rotating headline');
        hb.classList.toggle('is-paused', paused);
      });
    }
    var photo = $('.hb-visual > img', hb), start = function () { hb.classList.add('is-photo'); };
    if (doc.classList.contains('is-loading')) document.addEventListener('th:handoff', start, { once: true });
    else if (!photo || photo.complete) requestAnimationFrame(start);
    else { photo.addEventListener('load', start); photo.addEventListener('error', start); setTimeout(start, 2000); }
  })();

  /* ---------- Home: "Which stage are you at?" picks the proof, then leads to the call ---------- */
  var pk = $('[data-picker]');
  if (pk) (function () {
    var opts = $$('.pk-opt', pk), cards = $$('.uc', pk), sums = $$('.pk-sum', pk);
    var cta = $('[data-pk-cta]', pk), ctaTitle = $('[data-pk-title]', pk), cur = null;
    var NAMES = { idea: 'Idea', seed: 'Seed', pmf: 'PMF', scale: 'Scale' };
    function pick(key) {
      cur = cur === key ? null : key;   /* pressing the chosen stage again shows everything */
      opts.forEach(function (o) { o.setAttribute('aria-pressed', String(o.dataset.pick === cur)); });
      sums.forEach(function (s) { s.hidden = s.dataset.sum !== (cur || 'all'); });
      var shown = 0;
      cards.forEach(function (c) {
        var on = !cur || c.dataset.stages.split(' ').indexOf(cur) > -1;
        c.hidden = !on;
        if (on) { shown++; if (!reduceMotion) { c.classList.remove('is-entering'); void c.offsetWidth; c.classList.add('is-entering'); } }
      });
      if (cta) cta.setAttribute('href', 'contact.html' + (cur ? '?stage=' + cur : ''));
      if (ctaTitle) ctaTitle.textContent = cur ? 'Building at the ' + NAMES[cur] + ' stage?' : 'Seen enough to talk?';
    }
    opts.forEach(function (o) { o.addEventListener('click', function () { pick(o.dataset.pick); }); });
  })();

  /* ---------- Contact: a stage chosen on the home page arrives pre-selected ---------- */
  (function () {
    var q = new URLSearchParams(location.search), st = q.get('stage'), note = q.get('note');
    var b = $('#f-building');
    if (note && b && !b.value) b.value = note;
    if (!st) return;
    var r = $('#s-' + st.toLowerCase());
    if (r && r.name === 'stage') r.checked = true;
  })();

  /* ---------- Decorative loops (layer links, pipelines) play twice in view, then rest ---------- */
  var loops = $$('.stack-link, .pipe-arrow, .esc-v');
  if (loops.length) {
    if ('IntersectionObserver' in window) {
      var lio = new IntersectionObserver(function (es) {
        es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('is-live'); lio.unobserve(e.target); } });
      }, { threshold: .6 });
      loops.forEach(function (el) { lio.observe(el); });
    } else loops.forEach(function (el) { el.classList.add('is-live'); });
  }

  /* ---------- Footer: the wordmark lights under the pointer; the studio clock ---------- */
  var fbig = $('[data-fbig]');
  if (fbig) {
    fbig.addEventListener('pointermove', function (e) {
      var r = fbig.getBoundingClientRect();
      fbig.style.setProperty('--mx', (e.clientX - r.left) + 'px');
      fbig.style.setProperty('--my', (e.clientY - r.top) + 'px');
    });
    fbig.addEventListener('pointerleave', function () { fbig.style.removeProperty('--mx'); fbig.style.removeProperty('--my'); });
  }
  var clock = $('[data-clock]');
  if (clock) {
    var tickClock = function () {
      try { clock.textContent = new Date().toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Kolkata' }) + ' IST'; } catch (e) {}
    };
    tickClock(); setInterval(tickClock, 30000);
  }

  /* ---------- Review mode (internal) ---------- */
  var params = new URLSearchParams(location.search);
  var stored = null;
  try { stored = localStorage.getItem('th-review'); } catch (e) {}
  if (params.has('review') || HASH === 'review') { try { localStorage.setItem('th-review', '1'); } catch (e) {} stored = '1'; }
  if (params.get('review') === 'off' || HASH === 'review-off') { try { localStorage.removeItem('th-review'); } catch (e) {} stored = null; }

  if (stored === '1') {
    doc.classList.add('review-mode');
    var flagged = $$('[data-verify], [data-draft]');
    var panel = document.createElement('aside');
    panel.className = 'review-panel';
    panel.setAttribute('aria-label', 'Content review notes');
    panel.innerHTML = '<header><div><b>Review mode</b><br><span>' + flagged.length + ' items to verify on this page</span></div><div><button type="button" data-min>Hide list</button> &nbsp; <button type="button" data-exit>Exit</button></div></header><ol></ol>';
    var ol = $('ol', panel);
    flagged.forEach(function (el, n) {
      var note = el.getAttribute('data-verify') || el.getAttribute('data-draft') || 'Draft content';
      var badge = document.createElement('span');
      badge.className = 'review-badge'; badge.textContent = n + 1;
      if (getComputedStyle(el).position === 'static') el.style.position = 'relative';
      el.appendChild(badge);
      var li = document.createElement('li');
      var b = document.createElement('button'); b.type = 'button';
      b.innerHTML = '<i>' + (n + 1) + '</i><span></span>';
      $('span', b).textContent = note;
      b.addEventListener('click', function () {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.classList.remove('flash'); void el.offsetWidth; el.classList.add('flash');
      });
      li.appendChild(b); ol.appendChild(li);
    });
    $('[data-min]', panel).addEventListener('click', function (e) {
      panel.classList.toggle('is-min');
      e.target.textContent = panel.classList.contains('is-min') ? 'Show list' : 'Hide list';
    });
    $('[data-exit]', panel).addEventListener('click', function () {
      try { localStorage.removeItem('th-review'); } catch (e) {}
      location.href = location.pathname + (HASH === 'review' ? '' : location.hash);
    });
    document.body.appendChild(panel);
  }

  /* ---------- Footer year ---------- */
  $$('[data-year]').forEach(function (el) { el.textContent = new Date().getFullYear(); });
})();
