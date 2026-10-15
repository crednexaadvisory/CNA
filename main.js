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

/* ---------- Appointment form (Formspree AJAX submission + Cloudflare Turnstile / arithmetic check) ---------- */
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

  /* --- Arithmetic check (fallback when no Turnstile site key is set, or Turnstile fails to load) --- */
  var capField = document.getElementById('captcha-field');
  var capQ = document.getElementById('captcha-q');
  var capIn = document.getElementById('captcha');
  var answer = null;
  var useMath = true;
  var newChallenge = function () {
    var a = 2 + Math.floor(Math.random() * 8);
    var b = 2 + Math.floor(Math.random() * 8);
    answer = a + b;
    if (capQ) capQ.textContent = 'What is ' + a + ' + ' + b + '?';
    if (capIn) capIn.value = '';
  };
  var setMath = function (on) {
    useMath = on;
    if (capField) capField.hidden = !on;
    if (capIn) capIn.required = on;
  };
  newChallenge();

  /* --- Cloudflare Turnstile --- */
  var siteKey = (form.getAttribute('data-turnstile-sitekey') || '').trim();
  var tsField = document.getElementById('turnstile-field');
  var tsWidget = null;
  var tsToken = '';
  var useTurnstile = false;
  var resetTurnstile = function () {
    tsToken = '';
    if (useTurnstile && window.turnstile && tsWidget !== null) window.turnstile.reset(tsWidget);
  };

  if (siteKey) {
    useTurnstile = true;
    setMath(false);
    if (tsField) tsField.hidden = false;
    window.cnaTurnstileReady = function () {
      tsWidget = window.turnstile.render('#turnstile-widget', {
        sitekey: siteKey,
        theme: 'light',
        size: 'flexible',
        action: 'contact',
        callback: function (t) { tsToken = t; },
        'expired-callback': function () { tsToken = ''; },
        'error-callback': function () { tsToken = ''; }
      });
    };
    var sc = document.createElement('script');
    sc.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit&onload=cnaTurnstileReady';
    sc.async = true;
    sc.defer = true;
    sc.onerror = function () {
      // Turnstile blocked or unreachable: fall back to the arithmetic check
      useTurnstile = false;
      if (tsField) tsField.hidden = true;
      setMath(true);
    };
    document.head.appendChild(sc);
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    if (!form.checkValidity()) {
      form.reportValidity();
      return;
    }
    if (useTurnstile && !tsToken) {
      showMsg('Please complete the security check before submitting.', false);
      return;
    }
    if (useMath && capIn && parseInt(capIn.value.trim(), 10) !== answer) {
      showMsg('The security check answer is incorrect. Please try the new question.', false);
      newChallenge();
      capIn.focus();
      return;
    }

    var original = btn ? btn.innerHTML : '';
    if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }

    var data = new FormData(form);
    data.delete('Security Check');
    if (useTurnstile) data.set('cf-turnstile-response', tsToken);
    fetch(form.getAttribute('action'), {
      method: 'POST',
      body: data,
      headers: { 'Accept': 'application/json' }
    }).then(function (response) {
      if (response.ok) {
        showMsg('Thank you. Your consultation request has been received — we will be in touch shortly to confirm a convenient time.', true);
        form.reset();
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
      newChallenge();
      resetTurnstile();
      if (btn) { btn.disabled = false; btn.innerHTML = original; }
    });
  });
})();

/* ---------- Cookie consent + Google Analytics (loaded only after "Accept") ---------- */
(function () {
  var KEY = 'cna-cookie-consent';
  var meta = document.querySelector('meta[name="ga-id"]');
  var GA_ID = meta ? meta.getAttribute('content') : '';
  var store = {
    get: function () { try { return localStorage.getItem(KEY); } catch (e) { return null; } },
    set: function (v) { try { localStorage.setItem(KEY, v); } catch (e) {} }
  };

  var loadGA = function () {
    if (!GA_ID || window.__cnaGA) return;
    window.__cnaGA = true;
    window['ga-disable-' + GA_ID] = false;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('consent', 'default', { analytics_storage: 'granted', ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' });
    window.gtag('js', new Date());
    window.gtag('config', GA_ID, { anonymize_ip: true });
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(s);
  };

  var disableGA = function () {
    if (GA_ID) window['ga-disable-' + GA_ID] = true;
    if (window.gtag) window.gtag('consent', 'update', { analytics_storage: 'denied' });
    // Remove any Google Analytics cookies already set
    var host = location.hostname.replace(/^www\./, '');
    document.cookie.split(';').forEach(function (c) {
      var name = c.split('=')[0].trim();
      if (/^_ga/.test(name) || name === '_gid' || name === '_gat') {
        ['', '; domain=' + host, '; domain=.' + host].forEach(function (d) {
          document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/' + d;
        });
      }
    });
  };

  var banner;
  var hide = function () {
    if (!banner) return;
    banner.classList.remove('show');
    var b = banner; banner = null;
    setTimeout(function () { if (b.parentNode) b.parentNode.removeChild(b); }, 400);
  };
  var decide = function (v) {
    store.set(v);
    if (v === 'accepted') loadGA(); else disableGA();
    hide();
  };
  var show = function () {
    if (banner) return;
    banner = document.createElement('div');
    banner.className = 'cookie-banner';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-live', 'polite');
    banner.setAttribute('aria-label', 'Cookie settings');
    banner.innerHTML =
      '<h4>Cookie settings</h4>' +
      '<p>We use optional analytics cookies (Google Analytics) to understand how visitors use this website and improve it. ' +
      'They are set only if you accept. See our <a href="privacy.html">Privacy Policy</a>.</p>' +
      '<div class="actions">' +
      '<button type="button" class="btn btn-outline" data-choice="declined">Decline</button>' +
      '<button type="button" class="btn btn-primary" data-choice="accepted">Accept</button>' +
      '</div>';
    banner.addEventListener('click', function (e) {
      var c = e.target.getAttribute('data-choice');
      if (c) decide(c);
    });
    document.body.appendChild(banner);
    requestAnimationFrame(function () { requestAnimationFrame(function () { if (banner) banner.classList.add('show'); }); });
  };

  var choice = store.get();
  if (choice === 'accepted') loadGA();
  else if (choice !== 'declined') show();

  document.querySelectorAll('[data-cookie-settings]').forEach(function (el) {
    el.addEventListener('click', function (e) { e.preventDefault(); show(); });
  });
})();

/* ---------- Footer year ---------- */
(function () {
  var y = document.getElementById('yr');
  if (y) y.textContent = new Date().getFullYear();
})();
