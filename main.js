/* ---------- Nav: scroll state + mobile toggle ---------- */
(function () {
  var nav = document.querySelector('.nav');
  var onScroll = function () {
    if (!nav) return;
    if (window.scrollY > 40) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  var burger = document.querySelector('.burger');
  var links = document.querySelector('.nav-links');
  if (burger && links) {
    burger.addEventListener('click', function () {
      links.classList.toggle('mobile-open');
    });
  }
})();

/* ---------- Reveal on scroll ---------- */
(function () {
  var els = document.querySelectorAll('.reveal');
  if (!('IntersectionObserver' in window) || !els.length) {
    els.forEach(function (e) { e.classList.add('in'); });
    return;
  }
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
    });
  }, { threshold: 0.12 });
  els.forEach(function (e) { io.observe(e); });
})();

/* ---------- KPI counters ---------- */
(function () {
  var nums = document.querySelectorAll('.num[data-target]');
  if (!nums.length) return;
  var run = function (el) {
    var target = parseFloat(el.getAttribute('data-target'));
    var suffix = el.getAttribute('data-suffix') || '';
    var prefix = el.getAttribute('data-prefix') || '';
    var dur = 1400, start = null;
    var step = function (ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = prefix + Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (en) {
      if (en.isIntersecting) { run(en.target); io.unobserve(en.target); }
    });
  }, { threshold: 0.5 });
  nums.forEach(function (n) { io.observe(n); });
})();

/* ---------- FAQ accordion ---------- */
(function () {
  document.querySelectorAll('.faq-q').forEach(function (q) {
    q.addEventListener('click', function () {
      var item = q.closest('.faq-item');
      var a = item.querySelector('.faq-a');
      var open = item.classList.contains('open');
      document.querySelectorAll('.faq-item.open').forEach(function (o) {
        o.classList.remove('open');
        o.querySelector('.faq-a').style.maxHeight = null;
      });
      if (!open) {
        item.classList.add('open');
        a.style.maxHeight = a.scrollHeight + 'px';
      }
    });
  });
})();

/* ---------- Testimonials carousel ---------- */
(function () {
  var testis = document.querySelectorAll('.testi');
  var dots = document.querySelectorAll('.testi-dots button');
  if (!testis.length) return;
  var idx = 0, timer;
  var show = function (i) {
    testis.forEach(function (t, n) { t.classList.toggle('active', n === i); });
    dots.forEach(function (d, n) { d.classList.toggle('active', n === i); });
    idx = i;
  };
  var next = function () { show((idx + 1) % testis.length); };
  dots.forEach(function (d, n) {
    d.addEventListener('click', function () { show(n); reset(); });
  });
  var reset = function () { clearInterval(timer); timer = setInterval(next, 5500); };
  show(0); reset();
})();

/* ---------- Appointment form (front-end demo) ---------- */
(function () {
  var form = document.getElementById('appointment-form');
  if (!form) return;
  form.addEventListener('submit', function (e) {
    e.preventDefault();
    var msg = document.getElementById('form-msg');
    if (msg) {
      msg.classList.add('ok');
      msg.textContent = 'Thank you. Your consultation request has been received — our team will confirm your appointment at crednexaadvisory@gmail.com shortly.';
      msg.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    form.reset();
    var fd = document.getElementById('file-name');
    if (fd) fd.textContent = 'Click to upload documents (optional)';
  });
  var file = document.getElementById('file-input');
  var fname = document.getElementById('file-name');
  if (file && fname) {
    file.addEventListener('change', function () {
      fname.textContent = file.files.length ? file.files[0].name : 'Click to upload documents (optional)';
    });
  }
})();

/* ---------- Footer year ---------- */
(function () {
  var y = document.getElementById('yr');
  if (y) y.textContent = new Date().getFullYear();
})();
