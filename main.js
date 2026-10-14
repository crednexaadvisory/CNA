/* ---------- Nav: scroll state + mobile toggle + floating CTA ---------- */
(function () {
  var nav = document.querySelector('.nav');
  var fab = document.querySelector('.float-book');
  var onScroll = function () {
    var y = window.scrollY;
    if (nav) nav.classList.toggle('scrolled', y > 10);
    if (fab) fab.classList.toggle('show', y > 600);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  var burger = document.querySelector('.burger');
  var links = document.querySelector('.nav-links');
  if (burger && links) {
    burger.addEventListener('click', function () {
      var open = links.classList.toggle('open');
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
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
        o.querySelector('.faq-q').setAttribute('aria-expanded', 'false');
      });
      if (!open) {
        item.classList.add('open');
        a.style.maxHeight = a.scrollHeight + 'px';
        q.setAttribute('aria-expanded', 'true');
      }
    });
  });
})();

/* ---------- Appointment form (Formspree AJAX submission) ---------- */
(function () {
  var form = document.getElementById('appointment-form');
  if (!form) return;
  var msg = document.getElementById('form-msg');
  var btn = form.querySelector('button[type="submit"]');

  var showMsg = function (text, ok) {
    if (!msg) return;
    msg.classList.remove('ok', 'err');
    msg.classList.add(ok ? 'ok' : 'err');
    msg.textContent = text;
    msg.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    // Basic required-field validation
    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }

    var action = form.getAttribute('action') || '';
    // Guard: remind to set the Formspree endpoint before going live
    if (action.indexOf('YOUR_FORM_ID') !== -1 || action === '') {
      showMsg('Form not yet connected. Add your Formspree form ID to the form action before deploying.', false);
      return;
    }

    var original = btn ? btn.textContent : '';
    if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }

    var data = new FormData(form);
    fetch(action, {
      method: 'POST',
      body: data,
      headers: { 'Accept': 'application/json' }
    }).then(function (response) {
      if (response.ok) {
        showMsg('Thank you. Your consultation request has been received — we will be in touch shortly to confirm a convenient time.', true);
        form.reset();
        var fd = document.getElementById('file-name');
        if (fd) fd.textContent = 'Click to upload documents (optional)';
      } else {
        return response.json().then(function (d) {
          var m = (d && d.errors) ? d.errors.map(function (er) { return er.message; }).join(', ')
                                  : 'Something went wrong. Please try again or email us directly at arpit@crednexaadvisory.com.';
          showMsg(m, false);
        });
      }
    }).catch(function () {
      showMsg('Network error. Please try again or email us directly at arpit@crednexaadvisory.com.', false);
    }).finally(function () {
      if (btn) { btn.disabled = false; btn.textContent = original; }
    });
  });

  var file = document.getElementById('file-input');
  var fname = document.getElementById('file-name');
  if (file && fname) {
    file.addEventListener('change', function () {
      fname.textContent = file.files.length
        ? (file.files.length === 1 ? file.files[0].name : file.files.length + ' files selected')
        : 'Click to upload documents (optional)';
    });
  }
})();

/* ---------- Footer year ---------- */
(function () {
  var y = document.getElementById('yr');
  if (y) y.textContent = new Date().getFullYear();
})();
