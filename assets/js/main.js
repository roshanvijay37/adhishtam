/* Adhishtam Digital Solutions — site behaviour. No dependencies. */
(function () {
  'use strict';

  var $  = function (s, c) { return (c || document).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || document).querySelectorAll(s)); };
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------------------------------------------------------- year */
  var yr = $('#yr');
  if (yr) yr.textContent = new Date().getFullYear();

  /* ----------------------------------------------------------- preloader */
  (function () {
    var pre = $('#preload');

    // Pages without a preloader (blog) still need is-ready, since some
    // entrance animations key off it.
    if (!pre) { document.body.classList.add('is-ready'); return; }

    var HOLD = 5200;  // deliberate dwell — the animation is timed to fill it
    var CAP  = 9000;  // hard ceiling, so a stalled asset can never trap anyone

    var bar  = $('#preloadBar');
    var num  = $('#preloadNum');
    var done = false;

    function finish() {
      if (done) return;
      done = true;
      if (bar) bar.style.transform = 'scaleX(1)';
      if (num) num.textContent = '100';
      document.documentElement.classList.remove('is-loading');
      setTimeout(function () {
        pre.classList.add('is-done');
        document.body.classList.add('is-ready');
      }, reduced ? 0 : 260);
    }

    if (reduced) { finish(); return; }

    // Hold the scroll position at the top while the panel is up, otherwise a
    // stray scroll during the dwell lands the visitor mid-page on reveal.
    document.documentElement.classList.add('is-loading');

    var loaded = document.readyState === 'complete';
    window.addEventListener('load', function () { loaded = true; });

    var t0 = (window.performance && performance.now) ? performance.now() : Date.now();

    requestAnimationFrame(function frame(now) {
      var elapsed = now - t0;
      var p = Math.min(1, elapsed / HOLD);

      // Sit at 99 rather than 100 if the page itself is still loading, so the
      // number never claims to be finished while it isn't.
      var shown = loaded ? p : Math.min(p, 0.99);

      if (bar) bar.style.transform = 'scaleX(' + shown.toFixed(4) + ')';
      if (num) num.textContent = Math.round(shown * 100);

      if ((p >= 1 && loaded) || elapsed >= CAP) { finish(); return; }
      requestAnimationFrame(frame);
    });
  })();

  /* -------------------------------------------------------------- cursor */
  (function () {
    if (reduced || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    var ring = $('#cursor');
    var dot  = $('#cursorDot');
    if (!ring || !dot) return;

    var mx = -100, my = -100, rx = -100, ry = -100;

    window.addEventListener('mousemove', function (e) {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = 'translate(' + mx + 'px,' + my + 'px)';
      if (!ring.classList.contains('is-on')) {
        ring.classList.add('is-on'); dot.classList.add('is-on');
      }
    }, { passive: true });

    document.addEventListener('mouseleave', function () {
      ring.classList.remove('is-on'); dot.classList.remove('is-on');
    });

    (function loop() {
      rx += (mx - rx) * 0.16;
      ry += (my - ry) * 0.16;
      ring.style.transform = 'translate(' + rx + 'px,' + ry + 'px)';
      requestAnimationFrame(loop);
    })();

    var hot = 'a, button, .work__item, input, select, textarea, .filter';
    document.addEventListener('mouseover', function (e) {
      if (!e.target.closest) return;
      if (e.target.closest('.work__item')) ring.classList.add('is-view');
      else if (e.target.closest(hot)) ring.classList.add('is-big');
    });
    document.addEventListener('mouseout', function (e) {
      if (!e.target.closest) return;
      if (e.target.closest('.work__item')) ring.classList.remove('is-view');
      else if (e.target.closest(hot)) ring.classList.remove('is-big');
    });
  })();

  /* ------------------------------------------------- word-by-word reveal
     Words light as the paragraph travels through the viewport, instead of the
     whole block fading in one go. Only words that actually cross the
     threshold get touched on a given frame, so this stays cheap. */
  (function () {
    var hosts = $$('[data-words]');
    if (!hosts.length) return;

    var groups = [];

    hosts.forEach(function (host) {
      $$('p', host).forEach(function (p) {
        var words = p.textContent.split(/\s+/).filter(Boolean);
        p.textContent = '';
        var spans = words.map(function (w, i) {
          var s = document.createElement('span');
          s.textContent = w + (i < words.length - 1 ? ' ' : '');
          p.appendChild(s);
          return s;
        });
        groups.push({ el: p, spans: spans, lit: 0 });
      });
      host.classList.add('rvw');
    });

    if (reduced) {
      groups.forEach(function (g) { g.spans.forEach(function (s) { s.classList.add('on'); }); });
      return;
    }

    var visible = [];
    if ('IntersectionObserver' in window) {
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (en) {
          var g = groups.filter(function (x) { return x.el === en.target; })[0];
          if (!g) return;
          var at = visible.indexOf(g);
          if (en.isIntersecting && at === -1) visible.push(g);
          else if (!en.isIntersecting && at !== -1) visible.splice(at, 1);
        });
      }, { rootMargin: '10% 0px 10% 0px' });
      groups.forEach(function (g) { io.observe(g.el); });
    } else {
      visible = groups.slice();
    }

    var queued = false;
    function update() {
      queued = false;
      var vh = window.innerHeight;
      for (var i = 0; i < visible.length; i++) {
        var g = visible[i];
        var r = g.el.getBoundingClientRect();
        // 0 when the block's top hits 82% of the viewport, 1 when it clears 28%
        var p = (vh * 0.82 - r.top) / Math.max(1, (vh * 0.54 + r.height * 0.55));
        p = Math.max(0, Math.min(1, p));
        var want = Math.round(p * g.spans.length);
        while (g.lit < want) { g.spans[g.lit].classList.add('on'); g.lit++; }
        while (g.lit > want) { g.lit--; g.spans[g.lit].classList.remove('on'); }
      }
    }
    window.addEventListener('scroll', function () {
      if (!queued) { queued = true; requestAnimationFrame(update); }
    }, { passive: true });
    window.addEventListener('resize', update);
    update();
  })();

  /* ------------------------------------------------------------ magnetic */
  (function () {
    if (reduced || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    $$('[data-magnet]').forEach(function (el) {
      el.addEventListener('mousemove', function (e) {
        var r = el.getBoundingClientRect();
        var dx = e.clientX - (r.left + r.width / 2);
        var dy = e.clientY - (r.top + r.height / 2);
        el.style.transform = 'translate(' + dx * 0.22 + 'px,' + dy * 0.3 + 'px)';
      });
      el.addEventListener('mouseleave', function () { el.style.transform = ''; });
    });
  })();

  /* ------------------------------------------------------ scroll progress */
  (function () {
    var bar = $('#progress');
    if (!bar) return;
    var ticking = false;
    function update() {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      var p = h > 0 ? window.scrollY / h : 0;
      bar.style.transform = 'scaleX(' + Math.min(1, Math.max(0, p)) + ')';
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    update();
  })();

  /* ----------------------------------------------------------------- nav */
  (function () {
    var nav = $('#nav');
    if (!nav) return;
    var ticking = false;
    function update() {
      nav.classList.toggle('is-stuck', window.scrollY > 40);
      ticking = false;
    }
    window.addEventListener('scroll', function () {
      if (!ticking) { ticking = true; requestAnimationFrame(update); }
    }, { passive: true });
    update();
  })();

  /* --------------------------------------------------------- active link */
  (function () {
    var links = $$('.nav__link[href^="#"]');
    if (!links.length || !('IntersectionObserver' in window)) return;
    var map = {};
    links.forEach(function (l) {
      var s = document.getElementById(l.getAttribute('href').slice(1));
      if (s) map[s.id] = l;
    });
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          links.forEach(function (l) { l.classList.remove('is-active'); });
          if (map[en.target.id]) map[en.target.id].classList.add('is-active');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    Object.keys(map).forEach(function (id) { io.observe(document.getElementById(id)); });
  })();

  /* --------------------------------------------------------- mobile menu */
  (function () {
    var burger = $('#burger');
    var menu = $('#menu');
    if (!burger || !menu) return;
    var links = $$('.menu__links a', menu);

    function setOpen(open) {
      burger.classList.toggle('is-open', open);
      burger.setAttribute('aria-expanded', String(open));
      burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
      menu.classList.toggle('is-open', open);
      document.body.classList.toggle('is-locked', open);
      links.forEach(function (a, i) {
        a.style.transitionDelay = open ? (0.16 + i * 0.06) + 's' : '0s';
      });
    }

    burger.addEventListener('click', function () {
      setOpen(!menu.classList.contains('is-open'));
    });
    links.forEach(function (a) { a.addEventListener('click', function () { setOpen(false); }); });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menu.classList.contains('is-open')) setOpen(false);
    });
  })();

  /* ------------------------------------------------------- scroll reveal */
  (function () {
    var els = $$('.rv, .rv-mask, [data-inview]');
    if (!els.length) return;
    if (!('IntersectionObserver' in window) || reduced) {
      els.forEach(function (el) { el.classList.add('is-in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    els.forEach(function (el) { io.observe(el); });
  })();

  /* ------------------------------------------------------------ counters */
  (function () {
    var nums = $$('[data-count]');
    if (!nums.length) return;

    function run(el) {
      var target = parseFloat(el.getAttribute('data-count')) || 0;
      var suffix = el.getAttribute('data-suffix') || '';
      if (reduced) { el.textContent = target + suffix; return; }
      var dur = 1600, t0 = null;
      function step(ts) {
        if (t0 === null) t0 = ts;
        var p = Math.min(1, (ts - t0) / dur);
        var eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased) + (p === 1 ? suffix : '');
        if (p < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    }

    if (!('IntersectionObserver' in window)) { nums.forEach(run); return; }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { run(en.target); io.unobserve(en.target); }
      });
    }, { threshold: 0.5 });
    nums.forEach(function (n) { io.observe(n); });
  })();

  /* ----------------------------------------------------------- accordion */
  (function () {
    var heads = $$('.svc__head');
    if (!heads.length) return;

    function close(head) {
      var panel = head.nextElementSibling;
      head.setAttribute('aria-expanded', 'false');
      panel.style.height = panel.scrollHeight + 'px';
      requestAnimationFrame(function () {
        requestAnimationFrame(function () { panel.style.height = '0px'; });
      });
    }

    function open(head) {
      var panel = head.nextElementSibling;
      head.setAttribute('aria-expanded', 'true');
      panel.style.height = panel.firstElementChild.offsetHeight + 'px';
    }

    heads.forEach(function (head) {
      var panel = head.nextElementSibling;
      panel.style.height = '0px';

      panel.addEventListener('transitionend', function (e) {
        if (e.propertyName !== 'height') return;
        if (head.getAttribute('aria-expanded') === 'true') panel.style.height = 'auto';
      });

      head.addEventListener('click', function () {
        var isOpen = head.getAttribute('aria-expanded') === 'true';
        heads.forEach(function (h) {
          if (h !== head && h.getAttribute('aria-expanded') === 'true') close(h);
        });
        if (isOpen) close(head); else open(head);
      });
    });

    window.addEventListener('resize', function () {
      heads.forEach(function (h) {
        if (h.getAttribute('aria-expanded') === 'true') h.nextElementSibling.style.height = 'auto';
      });
    });
  })();

  /* -------------------------------------------------------------- filter */
  (function () {
    var btns = $$('.filter');
    var items = $$('.work__item');
    var empty = $('#workEmpty');
    if (!btns.length || !items.length) return;

    btns.forEach(function (btn) {
      btn.addEventListener('click', function () {
        var f = btn.getAttribute('data-filter');
        btns.forEach(function (b) { b.classList.remove('is-active'); });
        btn.classList.add('is-active');

        // FLIP: measure, mutate, then play the difference. Cards glide to
        // their new grid slots rather than teleporting.
        var wasVisible = [], first = [];
        if (!reduced) {
          items.forEach(function (it) {
            var vis = !it.classList.contains('is-hidden');
            wasVisible.push(vis);
            first.push(vis ? it.getBoundingClientRect() : null);
          });
        }

        var shown = 0;
        items.forEach(function (it) {
          var cats = (it.getAttribute('data-cat') || '').split(/\s+/);
          var show = f === 'all' || cats.indexOf(f) !== -1;
          it.classList.toggle('is-hidden', !show);
          if (show) shown++;
        });
        if (empty) empty.classList.toggle('is-on', shown === 0);
        if (reduced) return;

        items.forEach(function (it, i) {
          if (it.classList.contains('is-hidden')) return;
          var last = it.getBoundingClientRect();

          if (!wasVisible[i]) {
            // newly shown — no previous position to travel from, so fade up
            it.style.transition = 'none';
            it.style.opacity = '0';
            it.style.transform = 'scale(.94)';
          } else {
            var dx = first[i].left - last.left;
            var dy = first[i].top - last.top;
            if (!dx && !dy) return;
            it.style.transition = 'none';
            it.style.transform = 'translate(' + dx + 'px,' + dy + 'px)';
          }

          requestAnimationFrame(function () {
            requestAnimationFrame(function () {
              it.style.transition = '';
              it.style.transform = '';
              it.style.opacity = '';
            });
          });
        });
      });
    });
  })();

  /* ------------------------------------------------- portfolio pointer light
     A warm highlight tracks the cursor across each card, so the gold reads as
     a light source rather than a flat overlay. Pointer-only by definition —
     touch devices get the always-on caption treatment instead. */
  (function () {
    if (reduced || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    $$('.work__item').forEach(function (card) {
      card.addEventListener('pointermove', function (e) {
        var r = card.getBoundingClientRect();
        card.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100).toFixed(1) + '%');
        card.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100).toFixed(1) + '%');
      }, { passive: true });
    });
  })();

  /* ----------------------------------------------------- blur-up loading */
  (function () {
    $$('.work__item img').forEach(function (img) {
      if (img.complete && img.naturalWidth) { img.classList.add('is-loaded'); return; }
      img.addEventListener('load', function () { img.classList.add('is-loaded'); });
      // a broken image should not sit invisible on top of its placeholder
      img.addEventListener('error', function () { img.classList.add('is-loaded'); });
    });
  })();

  /* -------------------------------------------------------------- lightbox
     Cards advertise VIEW; this delivers it. Progressive by design — with no
     JS the grid is still a perfectly good grid, just not clickable. */
  (function () {
    var box = $('#lightbox');
    if (!box) return;
    var imgEl = $('#lbImg'), titleEl = $('#lbTitle'), catEl = $('#lbCat');
    var items = $$('.work__item');
    if (!items.length) return;

    var idx = -1, lastFocus = null;

    items.forEach(function (it, i) {
      it.setAttribute('role', 'button');
      it.setAttribute('tabindex', '0');
      var t = $('.work__title', it);
      it.setAttribute('aria-label', 'View ' + (t ? t.textContent.trim() : 'project'));
      it.addEventListener('click', function () { open(i); });
      it.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(i); }
      });
    });

    // only step through what the current filter is showing
    function visible() {
      return items.filter(function (it) { return !it.classList.contains('is-hidden'); });
    }

    function show(it) {
      var img = $('img', it);
      var t = $('.work__title', it);
      var c = $('.work__cat', it);
      if (!img) return;
      imgEl.src = img.currentSrc || img.src;
      imgEl.alt = img.alt || '';
      titleEl.textContent = t ? t.textContent.trim() : '';
      catEl.textContent = c ? c.textContent.trim() : '';
    }

    function open(i) {
      idx = i;
      show(items[i]);
      lastFocus = document.activeElement;
      box.classList.add('is-open');
      document.documentElement.classList.add('is-loading'); // reuse the scroll lock
      $('#lbClose').focus();
    }

    function close() {
      box.classList.remove('is-open');
      document.documentElement.classList.remove('is-loading');
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    }

    function step(dir) {
      var vis = visible();
      if (vis.length < 2) return;
      var at = vis.indexOf(items[idx]);
      if (at === -1) at = 0;
      var next = vis[(at + dir + vis.length) % vis.length];
      idx = items.indexOf(next);
      show(next);
    }

    $('#lbClose').addEventListener('click', close);
    $('#lbPrev').addEventListener('click', function () { step(-1); });
    $('#lbNext').addEventListener('click', function () { step(1); });
    box.addEventListener('click', function (e) { if (e.target === box) close(); });

    document.addEventListener('keydown', function (e) {
      if (!box.classList.contains('is-open')) return;
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowLeft') step(-1);
      else if (e.key === 'ArrowRight') step(1);
      else if (e.key === 'Tab') {
        // keep focus inside the dialog while it is modal
        var f = $$('button', box);
        var first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
  })();

  /* --------------------------------------------------------------- forms */
  (function () {
    var form = $('#contactForm');
    if (!form) return;
    var note = $('#formNote');
    var wa = $('#waSend');

    function vals() {
      return {
        name:    (form.querySelector('#cf-name') || {}).value || '',
        email:   (form.querySelector('#cf-email') || {}).value || '',
        phone:   (form.querySelector('#cf-phone') || {}).value || '',
        service: (form.querySelector('#cf-service') || {}).value || '',
        message: (form.querySelector('#cf-msg') || {}).value || ''
      };
    }

    function warn(msg) {
      if (!note) return;
      note.textContent = msg;
      note.style.color = 'var(--gold)';
    }

    function body(v) {
      return 'Name: ' + v.name +
        '\nEmail: ' + v.email +
        '\nPhone: ' + v.phone +
        '\nService: ' + v.service +
        '\n\n' + v.message;
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var v = vals();
      if (!v.name.trim() || !v.email.trim()) {
        warn('Please add at least your name and email so we can reply.');
        return;
      }
      warn('Opening your email app…');
      window.location.href = 'mailto:adhishtamofficial@gmail.com' +
        '?subject=' + encodeURIComponent('New enquiry — ' + v.service + ' — ' + v.name) +
        '&body=' + encodeURIComponent(body(v));
    });

    if (wa) {
      wa.addEventListener('click', function () {
        var v = vals();
        if (!v.name.trim()) { warn('Please add your name first.'); return; }
        var text = 'Hi Adhishtam, I\'d like to talk about ' + v.service + '.\n\n' + body(v);
        window.open('https://wa.me/917618791635?text=' + encodeURIComponent(text), '_blank', 'noopener');
      });
    }
  })();

  /* -------------------------------------------------- scroll-driven marquee
     The ticker takes its speed from the scroll wheel: it surges when you
     scroll down, drags and can run backwards when you scroll up, then settles
     to a drift. CSS keeps the plain animation as the fallback. */
  (function () {
    var mq = $('.marquee');
    if (!mq || reduced) return;
    var tracks = $$('.marquee__track', mq);
    if (tracks.length < 2) return;

    tracks.forEach(function (t) { t.style.animation = 'none'; });

    var x = 0, vel = 0, w = 0, lastY = window.scrollY, running = false;

    function measure() { w = tracks[0].getBoundingClientRect().width || 1; }
    measure();
    window.addEventListener('resize', measure);

    window.addEventListener('scroll', function () {
      var y = window.scrollY;
      vel += (y - lastY) * 0.28;
      vel = Math.max(-38, Math.min(38, vel));
      lastY = y;
    }, { passive: true });

    function frame() {
      if (!running) return;
      vel *= 0.91;                       // settle back to the base drift
      x -= (0.6 + vel);
      if (w > 0) { x = x % w; if (x > 0) x -= w; }
      var t = 'translate3d(' + x.toFixed(2) + 'px,0,0)';
      tracks[0].style.transform = t;
      tracks[1].style.transform = t;
      requestAnimationFrame(frame);
    }

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (en) {
        if (en[0].isIntersecting) {
          if (!running) { running = true; measure(); requestAnimationFrame(frame); }
        } else { running = false; }
      }, { threshold: 0 }).observe(mq);
    } else {
      running = true; requestAnimationFrame(frame);
    }
  })();

  /* -------------------------------------------------------- hero parallax
     Hero content drifts up and dims as it leaves, so the marquee below feels
     like it slides over the top rather than the page just scrolling. */
  (function () {
    var hero = $('.hero');
    if (!hero || reduced) return;
    var inner = $('.hero__inner', hero);
    var cue = $('.scroll-cue', hero);
    if (!inner) return;

    var queued = false;
    function update() {
      queued = false;
      var y = window.scrollY;
      var h = hero.offsetHeight || 1;
      if (y > h) return;
      var p = Math.min(1, y / h);
      inner.style.transform = 'translate3d(0,' + (p * 74).toFixed(1) + 'px,0)';
      inner.style.opacity = (1 - p * 1.25).toFixed(3);
      if (cue) cue.style.opacity = (1 - p * 4).toFixed(3);
    }
    window.addEventListener('scroll', function () {
      if (!queued) { queued = true; requestAnimationFrame(update); }
    }, { passive: true });
    update();
  })();

  /* ---------------------------------------------------------- hex canvas */
  (function () {
    var cv = $('#hex');
    if (!cv) return;
    var ctx = cv.getContext('2d');
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var W = 0, H = 0, R = 34, cells = [], base = null;
    var px = -9999, py = -9999, hasMouse = false, t = 0, running = false;
    var motes = [], ripples = [];

    function hexPath(c, x, y, r) {
      c.beginPath();
      for (var i = 0; i < 6; i++) {
        var a = Math.PI / 180 * (60 * i - 30);
        var vx = x + r * Math.cos(a);
        var vy = y + r * Math.sin(a);
        if (i === 0) c.moveTo(vx, vy); else c.lineTo(vx, vy);
      }
      c.closePath();
    }

    function build() {
      var rect = cv.getBoundingClientRect();
      W = Math.max(1, rect.width);
      H = Math.max(1, rect.height);
      cv.width = Math.round(W * dpr);
      cv.height = Math.round(H * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      R = W < 640 ? 26 : 36;
      var hStep = R * 1.5;
      var wStep = Math.sqrt(3) * R;
      cells = [];
      for (var row = -1; row * hStep < H + R * 2; row++) {
        for (var col = -1; col * wStep < W + R * 2; col++) {
          var x = col * wStep + (row % 2 ? wStep / 2 : 0);
          var y = row * hStep;
          cells.push({ x: x, y: y });
        }
      }

      base = document.createElement('canvas');
      base.width = cv.width;
      base.height = cv.height;
      var bc = base.getContext('2d');
      bc.setTransform(dpr, 0, 0, dpr, 0, 0);
      bc.strokeStyle = 'rgba(201,169,97,0.075)';
      bc.lineWidth = 1;
      cells.forEach(function (c) { hexPath(bc, c.x, c.y, R); bc.stroke(); });

      // Gold motes drifting up through the lattice. Deliberately few — this
      // rides the existing frame loop and must not cost anything noticeable.
      var count = W < 640 ? 14 : 26;
      motes = [];
      for (var m = 0; m < count; m++) {
        motes.push({
          x: Math.random() * W,
          y: Math.random() * H,
          r: 0.6 + Math.random() * 1.5,
          v: 0.12 + Math.random() * 0.34,      // upward drift
          sway: 0.4 + Math.random() * 1.1,     // horizontal wander
          phase: Math.random() * Math.PI * 2,
          a: 0.16 + Math.random() * 0.42
        });
      }
    }

    function frame() {
      if (!running) return;
      ctx.clearRect(0, 0, W, H);
      ctx.drawImage(base, 0, 0, W, H);

      var tx = px, ty = py;
      if (!hasMouse) {
        t += 0.005;
        tx = W * (0.5 + 0.32 * Math.cos(t));
        ty = H * (0.48 + 0.3 * Math.sin(t * 1.31));
      }

      var rad = W < 640 ? 170 : 260;
      ctx.lineWidth = 1;
      for (var i = 0; i < cells.length; i++) {
        var c = cells[i];
        var dx = c.x - tx, dy = c.y - ty;
        var d2 = dx * dx + dy * dy;
        if (d2 > rad * rad) continue;
        var f = 1 - Math.sqrt(d2) / rad;
        ctx.strokeStyle = 'rgba(201,169,97,' + (0.07 + f * f * 0.62).toFixed(3) + ')';
        hexPath(ctx, c.x, c.y, R);
        ctx.stroke();
      }

      // Ripples: a wave of light travelling outward from wherever you tapped.
      if (ripples.length) {
        var nowMs = (window.performance && performance.now) ? performance.now() : Date.now();
        for (var k = ripples.length - 1; k >= 0; k--) {
          var rp = ripples[k];
          var age = (nowMs - rp.t) / 1400;
          if (age >= 1) { ripples.splice(k, 1); continue; }
          var wave = age * 620;               // radius of the wavefront
          var fade = 1 - age;
          for (var q = 0; q < cells.length; q++) {
            var cc = cells[q];
            var ddx = cc.x - rp.x, ddy = cc.y - rp.y;
            var dist = Math.sqrt(ddx * ddx + ddy * ddy);
            var band = Math.abs(dist - wave);
            if (band > 58) continue;
            var g = (1 - band / 58) * fade;
            ctx.strokeStyle = 'rgba(232,206,142,' + (g * g * 0.8).toFixed(3) + ')';
            hexPath(ctx, cc.x, cc.y, R);
            ctx.stroke();
          }
        }
      }

      // Motes, plus threads between any two that drift close together.
      for (var j = 0; j < motes.length; j++) {
        var p = motes[j];
        p.y -= p.v;
        p.phase += 0.008;
        if (p.y < -6) { p.y = H + 6; p.x = Math.random() * W; }
        p.dx = p.x + Math.sin(p.phase) * p.sway * 9;
      }

      ctx.lineWidth = 0.8;
      for (var a = 0; a < motes.length; a++) {
        for (var b = a + 1; b < motes.length; b++) {
          var ax = motes[a].dx - motes[b].dx, ay = motes[a].y - motes[b].y;
          var d2 = ax * ax + ay * ay;
          if (d2 > 15000) continue;
          ctx.strokeStyle = 'rgba(201,169,97,' + ((1 - Math.sqrt(d2) / 122) * 0.16).toFixed(3) + ')';
          ctx.beginPath();
          ctx.moveTo(motes[a].dx, motes[a].y);
          ctx.lineTo(motes[b].dx, motes[b].y);
          ctx.stroke();
        }
      }
      ctx.lineWidth = 1;

      for (var m2 = 0; m2 < motes.length; m2++) {
        var pm = motes[m2];
        ctx.beginPath();
        ctx.arc(pm.dx, pm.y, pm.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(232,206,142,' + pm.a.toFixed(2) + ')';
        ctx.fill();
      }

      requestAnimationFrame(frame);
    }

    function start() { if (!running) { running = true; requestAnimationFrame(frame); } }
    function stop() { running = false; }

    build();

    if (reduced) {
      ctx.drawImage(base, 0, 0, W, H);
      return;
    }

    var hero = cv.closest('.hero');
    if (hero && 'IntersectionObserver' in window) {
      new IntersectionObserver(function (en) {
        if (en[0].isIntersecting) start(); else stop();
      }, { threshold: 0 }).observe(hero);
    } else {
      start();
    }

    window.addEventListener('mousemove', function (e) {
      var r = cv.getBoundingClientRect();
      px = e.clientX - r.left;
      py = e.clientY - r.top;
      hasMouse = true;
    }, { passive: true });

    window.addEventListener('mouseout', function () { hasMouse = false; });

    // Tap or click anywhere in the hero and a wave runs out through the
    // lattice. Works on touch, which is the point — mobile otherwise gets
    // none of the pointer interaction.
    (function () {
      var hero = cv.closest('.hero');
      if (!hero) return;
      hero.addEventListener('pointerdown', function (e) {
        // let real controls do their job
        if (e.target.closest && e.target.closest('a, button, input, select, textarea')) return;
        var r = cv.getBoundingClientRect();
        if (ripples.length > 3) ripples.shift();
        ripples.push({
          x: e.clientX - r.left,
          y: e.clientY - r.top,
          t: (window.performance && performance.now) ? performance.now() : Date.now()
        });
      }, { passive: true });
    })();

    var rt;
    window.addEventListener('resize', function () {
      clearTimeout(rt);
      rt = setTimeout(function () {
        build();
        if (reduced) ctx.drawImage(base, 0, 0, W, H);
      }, 180);
    });
  })();

})();
