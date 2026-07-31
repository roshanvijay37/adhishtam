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
    if (!pre) return;

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
      if (e.target.closest && e.target.closest(hot)) ring.classList.add('is-big');
    });
    document.addEventListener('mouseout', function (e) {
      if (e.target.closest && e.target.closest(hot)) ring.classList.remove('is-big');
    });
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
    var els = $$('.rv, [data-inview]');
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

        var shown = 0;
        items.forEach(function (it) {
          var cats = (it.getAttribute('data-cat') || '').split(/\s+/);
          var show = f === 'all' || cats.indexOf(f) !== -1;
          it.classList.toggle('is-hidden', !show);
          if (show) shown++;
        });
        if (empty) empty.classList.toggle('is-on', shown === 0);
      });
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

  /* ---------------------------------------------------------- hex canvas */
  (function () {
    var cv = $('#hex');
    if (!cv) return;
    var ctx = cv.getContext('2d');
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var W = 0, H = 0, R = 34, cells = [], base = null;
    var px = -9999, py = -9999, hasMouse = false, t = 0, running = false;

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
