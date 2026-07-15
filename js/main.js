/* Camiceria di Porta Romana — main.js */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  var intro = document.getElementById('intro');
  if (intro) { if (reduce) intro.classList.add('is-done'); else { var kill = function () { intro.classList.add('is-done'); }; setTimeout(kill, 1800); intro.addEventListener('click', kill); window.addEventListener('scroll', kill, { once: true, passive: true }); } }

  var head = document.getElementById('head');
  var onScroll = function () { if (head) head.classList.toggle('is-scrolled', window.scrollY > 40); };
  onScroll(); window.addEventListener('scroll', onScroll, { passive: true });

  var burger = document.getElementById('burger'), nav = document.getElementById('nav'), lastFocus = null;
  function openMenu() { nav.classList.add('is-open'); burger.setAttribute('aria-expanded', 'true'); lastFocus = document.activeElement; var f = nav.querySelector('a'); if (f) f.focus(); document.addEventListener('keydown', esc); }
  function closeMenu() { nav.classList.remove('is-open'); burger.setAttribute('aria-expanded', 'false'); document.removeEventListener('keydown', esc); if (lastFocus) burger.focus(); }
  function esc(e) { if (e.key === 'Escape') closeMenu(); }
  if (burger && nav) { burger.addEventListener('click', function () { nav.classList.contains('is-open') ? closeMenu() : openMenu(); }); nav.addEventListener('click', function (e) { if (e.target.tagName === 'A') closeMenu(); }); window.addEventListener('resize', function () { if (window.innerWidth > 960 && nav.classList.contains('is-open')) closeMenu(); }); }

  var reveals = document.querySelectorAll('.reveal');
  function showAll() { reveals.forEach(function (el) { el.classList.add('is-visible'); }); }
  if (reduce || !('IntersectionObserver' in window)) showAll();
  else { var io = new IntersectionObserver(function (es) { es.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('is-visible'); io.unobserve(en.target); } }); }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 }); reveals.forEach(function (el) { io.observe(el); }); setTimeout(function () { if (!document.querySelector('.reveal.is-visible')) showAll(); }, 1500); }

  /* ORARI — Lun-Ven 9:30–19; Sab 9:30–13 e 15–19; Dom chiuso */
  (function () {
    var hoursEl = document.getElementById('hours'), statusEl = document.getElementById('status');
    if (!hoursEl) return;
    var WIN = { 0: [], 1: [[570, 1140]], 2: [[570, 1140]], 3: [[570, 1140]], 4: [[570, 1140]], 5: [[570, 1140]], 6: [[570, 780], [900, 1140]] };
    var day, hour, min;
    try {
      var f = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Rome', weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false });
      var p = f.formatToParts(new Date());
      var map = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
      day = map[p.find(function (x) { return x.type === 'weekday'; }).value];
      hour = parseInt(p.find(function (x) { return x.type === 'hour'; }).value, 10);
      min = parseInt(p.find(function (x) { return x.type === 'minute'; }).value, 10);
    } catch (e) { var d = new Date(); day = d.getDay(); hour = d.getHours(); min = d.getMinutes(); }
    var mins = hour * 60 + min;
    var todayLi = hoursEl.querySelector('li[data-day="' + day + '"]'); if (todayLi) todayLi.classList.add('is-today');
    function fmt(m) { var h = Math.floor(m / 60), mm = m % 60; return mm === 0 ? '' + h : h + ':' + (mm < 10 ? '0' + mm : mm); }
    function nextOpen(from) { var d = from; for (var i = 0; i < 7; i++) { d = (d + 1) % 7; if (WIN[d].length) return d; } return 1; }
    var itDays = ['domenica', 'lunedì', 'martedì', 'mercoledì', 'giovedì', 'venerdì', 'sabato'];
    var enDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    var today = WIN[day];
    var openWin = null, nextWin = null;
    for (var i = 0; i < today.length; i++) { if (mins >= today[i][0] && mins < today[i][1]) openWin = today[i]; if (mins < today[i][0] && !nextWin) nextWin = today[i]; }
    function render(lang) {
      var it = lang === 'it', Open = it ? 'Aperto ora' : 'Open now', Closed = it ? 'Chiuso' : 'Closed', html;
      if (openWin) {
        html = '<span class="open">● ' + Open + '</span> · ' + (it ? 'chiude alle ' : 'closes at ') + fmt(openWin[1]);
      } else if (nextWin) {
        var first = (nextWin === today[0]);
        var word = first ? (it ? 'apre oggi alle ' : 'opens today at ') : (it ? 'riapre oggi alle ' : 'reopens today at ');
        html = '<span class="closed">● ' + Closed + '</span> · ' + word + fmt(nextWin[0]);
      } else {
        var nd = nextOpen(day), name = it ? itDays[nd] : enDays[nd];
        html = '<span class="closed">● ' + Closed + '</span> · ' + (it ? 'apre ' + name + ' alle ' : 'opens ' + name + ' at ') + fmt(WIN[nd][0][0]);
      }
      if (statusEl) statusEl.innerHTML = html;
    }
    window.__renderHours = render;
    render(document.documentElement.lang === 'en' ? 'en' : 'it');
  })();

  /* LIGHTBOX (se presenti .shot) */
  (function () {
    var lb = document.getElementById('lightbox'); if (!lb) return;
    var lbImg = document.getElementById('lbImg'), lbClose = document.getElementById('lbClose'), opener = null;
    function open(src, alt) { lbImg.src = src; lbImg.alt = alt || ''; lb.classList.add('is-open'); lb.setAttribute('aria-hidden', 'false'); document.body.style.overflow = 'hidden'; lbClose.focus(); }
    function close() { lb.classList.remove('is-open'); lb.setAttribute('aria-hidden', 'true'); lbImg.src = ''; document.body.style.overflow = ''; if (opener) opener.focus(); }
    document.querySelectorAll('.shot').forEach(function (b) { b.addEventListener('click', function () { opener = b; var i = b.querySelector('img'); open(b.getAttribute('data-full'), i ? i.alt : ''); }); });
    if (lbClose) lbClose.addEventListener('click', close);
    lb.addEventListener('click', function (e) { if (e.target === lb) close(); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && lb.classList.contains('is-open')) close(); });
  })();

  /* i18n */
  var EN = {
    'intro.sub': 'the made-to-measure shirt',
    'nav.ways': 'Three ways', 'nav.made': 'Made to measure', 'nav.fabric': 'The fabrics', 'nav.shop': 'In store', 'nav.where': 'Find us',
    'cta.book': 'Book a fitting',
    'hero.eyebrow': "Men's & women's shirts · Porta Romana, Milan", 'hero.t1': 'The shirt,', 'hero.t2': 'made to measure.',
    'hero.lead': 'Fine fabrics, a good eye and courtesy. Ready-made, made-to-measure or no-iron: the right shirt, sewn as it should be.',
    'hero.cta1': 'The made-to-measure shirt', 'hero.cta2': 'Three ways to have it',
    'ways.eyebrow': 'Our way', 'ways.t1': 'Three ways to have', 'ways.t2': 'the right shirt',
    'way.1t': 'Ready-made', 'way.1d': 'Ingram shirts, men and women: sizes and fits ready to wear, quality throughout.',
    'way.2t': 'Made to measure', 'way.2d': 'The fabric you choose, sewn to your measurements. Collar, cuffs and fit just as you want.',
    'way.3t': 'No-iron', 'way.3d': "Fabrics that stay crisp all day: a shirt ready to wear even without ironing.",
    'made.eyebrow': 'Made to measure', 'made.t1': 'From the collar', 'made.t2': 'to the cuffs',
    'made.p1': 'A semi-made-to-measure shirt comes together in three moments. It’s not just the right size: it’s the collar you like, the cuff, the fit that sits well on you.',
    'made.s1': 'Choose the fabric from ours', 'made.s2': 'We take measurements and details', 'made.s3': 'We sew the shirt to your body',
    'made.price': 'Semi made-to-measure shirt · from €120',
    'fab.eyebrow': 'The fabrics', 'fab.t1': 'It always starts', 'fab.t2': 'from the fabric',
    'fab.lead': 'Plain, stripes, checks, twill. Cottons that wear well and last — “fine fabrics”, as customers say.',
    'fab.1': 'Plain', 'fab.2': 'Stripes', 'fab.3': 'Checks', 'fab.4': 'Twill', 'fab.5': 'Oxford', 'fab.6': 'No-iron',
    'shop.eyebrow': 'In store', 'shop.t1': 'On the corner of', 'shop.t2': 'Porta Romana',
    'shop.p1': 'Under the red sign on Via Lamarmora, a neighbourhood shirt shop for men and women. You come for a shirt and return for how they treat you: “a good eye, skill, courtesy and fine fabrics”.',
    'rev.eyebrow': 'What customers say', 'rev.t1': 'A good eye, skill,', 'rev.t2': 'courtesy', 'rev.lead': 'Real reviews from Google.',
    'rev.q1': 'A great reference: a good eye, skill, courtesy and fine fabrics.',
    'rev.q2': 'They recommended this shop to me as professional and with accessible prices.',
    'rev.q3': 'Friendly and helpful — highly recommended if you’re looking for shirts.',
    'rev.q4': 'Beautiful, quality products.',
    'where.eyebrow': 'Where we are', 'where.t1': 'On', 'where.t2': 'Via Lamarmora',
    'day.mon': 'Monday', 'day.tue': 'Tuesday', 'day.wed': 'Wednesday', 'day.thu': 'Thursday', 'day.fri': 'Friday', 'day.sat': 'Saturday', 'day.sun': 'Sunday', 'closed': 'Closed',
    'faq.eyebrow': 'Questions', 'faq.t1': 'Before you', 'faq.t2': 'drop by',
    'faq.q1': 'Do you make made-to-measure shirts?', 'faq.a1': 'Yes. Choose the fabric, we take your measurements and sew the shirt to your body. We also make ready-made Ingram and no-iron shirts.',
    'faq.q2': 'How much is a made-to-measure shirt?', 'faq.a2': 'A semi-made-to-measure shirt starts at around €120, depending on the fabric. Ready-made shirts start for less.',
    'faq.q3': 'Do you make women’s shirts?', 'faq.a3': 'Yes, men’s and women’s shirts, ready-made and made-to-measure.',
    'faq.q4': 'When are you open?', 'faq.a4': 'Mon–Fri 9:30–19; Saturday 9:30–13 and 15–19; Sunday closed.',
    'foot.tag': 'Made-to-measure, Ingram and no-iron shirts · Via Lamarmora 16, Milan', 'foot.demo': 'Demo website by Bespoke Studio',
    'ab.call': 'Call', 'ab.where': 'Find us', 'ab.made': 'Made to measure'
  };
  var nodes = document.querySelectorAll('[data-i18n]');
  nodes.forEach(function (el) { el.dataset.it = el.textContent; });
  function setLang(lang) {
    document.documentElement.lang = lang;
    nodes.forEach(function (el) { var k = el.getAttribute('data-i18n'); el.textContent = (lang === 'en' && EN[k] != null) ? EN[k] : el.dataset.it; });
    document.querySelectorAll('.lang__btn').forEach(function (b) { var on = b.getAttribute('data-lang') === lang; b.classList.toggle('is-active', on); b.setAttribute('aria-pressed', on ? 'true' : 'false'); });
    if (window.__renderHours) window.__renderHours(lang);
    try { localStorage.setItem('cam-lang', lang); } catch (e) {}
  }
  document.querySelectorAll('.lang__btn').forEach(function (b) { b.addEventListener('click', function () { setLang(b.getAttribute('data-lang')); }); });
  var saved; try { saved = localStorage.getItem('cam-lang'); } catch (e) {}
  if (saved === 'en') setLang('en');

  var y = document.getElementById('year'); if (y) y.textContent = new Date().getFullYear();
})();
