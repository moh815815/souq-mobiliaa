/* ===== Utilities ===== */
function debounce(fn, ms) {
  let timer;
  return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), ms); };
}

const qs = (sel, ctx) => (ctx || document).querySelector(sel);
const qsa = (sel, ctx) => (ctx || document).querySelectorAll(sel);

/* ===== Mobile Menu ===== */
(function menu() {
  const hamburger = document.getElementById('hamburger');
  const nav = document.getElementById('nav');
  if (!hamburger || !nav) return;

  hamburger.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    hamburger.classList.toggle('active');
    hamburger.setAttribute('aria-expanded', open);
  });

  qsa('[data-nav]').forEach(link => {
    link.addEventListener('click', () => {
      nav.classList.remove('open');
      hamburger.classList.remove('active');
      hamburger.setAttribute('aria-expanded', 'false');
    });
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && nav.classList.contains('open')) {
      nav.classList.remove('open');
      hamburger.classList.remove('active');
      hamburger.setAttribute('aria-expanded', 'false');
      hamburger.focus();
    }
  });
})();

/* ===== Scroll Spy + Header + Back to Top ===== */
(function scrollManager() {
  const header = document.querySelector('.header');
  const backToTop = document.getElementById('backToTop');
  const sections = qsa('.section');
  const navLinks = qsa('.nav__link');
  const OFFSET = 200;

  let ticking = false;

  function onScroll() {
    const y = window.scrollY;

    header.classList.toggle('scrolled', y > 40);

    if (backToTop) {
      backToTop.classList.toggle('visible', y > 500);
      backToTop.setAttribute('tabindex', y > 500 ? '0' : '-1');
    }

    /* scroll spy */
    let current = '';
    sections.forEach(section => {
      const top = section.offsetTop - 150;
      const bottom = top + section.offsetHeight;
      if (y >= top && y < bottom) current = section.id;
    });

    navLinks.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
    });

    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(onScroll);
      ticking = true;
    }
  }, { passive: true });

  onScroll();

  if (backToTop) {
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
})();

/* ===== Theme Toggle ===== */
(function theme() {
  const btn = document.getElementById('themeToggle');
  const KEY = 'theme';

  function getStored() {
    try { return localStorage.getItem(KEY); } catch { return null; }
  }

  function setStored(val) {
    try { localStorage.setItem(KEY, val); } catch { /* noop */ }
  }

  function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    setStored(theme);
    if (!btn) return;
    const isDark = theme === 'dark';
    btn.innerHTML = isDark
      ? '<i class="fas fa-sun" aria-hidden="true"></i>'
      : '<i class="fas fa-moon" aria-hidden="true"></i>';
    btn.setAttribute('aria-label', isDark ? 'الوضع النهاري' : 'الوضع الليلي');
    btn.title = isDark ? 'الوضع النهاري' : 'الوضع الليلي';
  }

  const stored = getStored();
  if (stored) {
    setTheme(stored);
  } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    setTheme('dark');
  }

  if (btn) {
    btn.addEventListener('click', () => {
      const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      setTheme(next);
    });
  }
})();

/* ===== Search & Filter ===== */
(function search() {
  const form = document.getElementById('searchForm');
  const input = document.getElementById('searchInput');
  const cards = qsa('.service-card');
  const noResults = document.getElementById('noResults');
  const noResultsTerm = document.getElementById('noResultsTerm');

  function filter(query) {
    const term = query.trim().toLowerCase();
    let visibleCount = 0;

    cards.forEach(card => {
      const category = (card.dataset.category || '').toLowerCase();
      const title = (qs('.service-card__title', card) || {}).textContent || '';
      const match = !term || category.includes(term) || title.toLowerCase().includes(term);
      card.style.display = match ? '' : 'none';
      if (match) visibleCount++;
    });

    if (noResults && noResultsTerm) {
      const show = term.length > 0 && visibleCount === 0;
      noResults.classList.toggle('show', show);
      if (show) noResultsTerm.textContent = term;
    }
  }

  const debouncedFilter = debounce(filter, 200);

  if (form) {
    form.addEventListener('submit', e => {
      e.preventDefault();
      filter(input.value);
    });
  }

  if (input) {
    input.addEventListener('input', () => debouncedFilter(input.value));
  }

  /* Hero tags */
  qsa('.hero__tag').forEach(tag => {
    function trigger() {
      const val = tag.dataset.search;
      if (val && input) {
        input.value = val;
        input.focus();
        filter(val);
      }
    }

    tag.addEventListener('click', trigger);
    tag.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        trigger();
      }
    });
  });
})();

/* ===== Stats Counter ===== */
(function counter() {
  function animate(el) {
    const target = +el.dataset.target;
    if (!target) return;
    const duration = 1500;
    const start = performance.now();

    function update(now) {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(eased * target).toLocaleString('ar-SA');
      if (progress < 1) requestAnimationFrame(update);
      else el.textContent = target.toLocaleString('ar-SA');
    }

    requestAnimationFrame(update);
  }

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animate(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  qsa('.stat-card__num').forEach(el => observer.observe(el));
})();

/* ===== Scroll Reveal ===== */
(function reveal() {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  qsa('.reveal').forEach(el => observer.observe(el));
})();

/* ===== Toast System ===== */
(function toast() {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  window.showToast = function (message, type) {
    type = type || 'info';
    const icons = { success: 'fa-check-circle', error: 'fa-exclamation-circle', info: 'fa-info-circle' };
    const el = document.createElement('div');
    el.className = `toast toast--${type}`;
    el.innerHTML = `<i class="fas ${icons[type] || icons.info}" aria-hidden="true"></i><span>${message}</span>`;
    container.appendChild(el);
    setTimeout(() => { if (el.parentNode) el.remove(); }, 3200);
  };
})();

/* ===== Contact Form ===== */
(function contactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  const name = document.getElementById('contactName');
  const email = document.getElementById('contactEmail');
  const msg = document.getElementById('contactMsg');
  const btn = qs('.contact__btn', form);

  form.addEventListener('submit', e => {
    e.preventDefault();

    [name, email, msg].forEach(el => { if (el) el.classList.remove('error'); });

    let valid = true;

    if (name && !name.value.trim()) { name.classList.add('error'); valid = false; }
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) { email.classList.add('error'); valid = false; }
    if (msg && !msg.value.trim()) { msg.classList.add('error'); valid = false; }

    if (!valid) {
      if (typeof showToast === 'function') showToast('يرجى تعبئة جميع الحقول بشكل صحيح', 'error');
      return;
    }

    btn.disabled = true;
    btn.innerHTML = 'جارٍ الإرسال <i class="fas fa-spinner fa-spin" aria-hidden="true"></i>';

    setTimeout(() => {
      btn.innerHTML = 'تم الإرسال <i class="fas fa-check" aria-hidden="true"></i>';
      btn.style.background = 'var(--success)';

      if (typeof showToast === 'function') showToast('تم إرسال رسالتك بنجاح! سنتواصل معك قريباً', 'success');

      setTimeout(() => {
        btn.innerHTML = 'إرسال <i class="fas fa-paper-plane" aria-hidden="true"></i>';
        btn.style.background = '';
        btn.disabled = false;
        form.reset();
      }, 3000);
    }, 800);
  });
})();
