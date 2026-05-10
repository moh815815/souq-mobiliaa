/* ===== Utilities ===== */
function debounce(fn, ms) {
  let timer;
  return (...args) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}

function qs(sel, ctx) { return (ctx || document).querySelector(sel); }
function qsa(sel, ctx) { return (ctx || document).querySelectorAll(sel); }

/* ===== Mobile Menu ===== */
const hamburger = document.getElementById('hamburger');
const nav = document.getElementById('nav');

if (hamburger && nav) {
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
}

/* ===== Header scroll effect ===== */
const header = document.querySelector('.header');
let lastScroll = 0;

window.addEventListener('scroll', () => {
  const y = window.scrollY;
  header.classList.toggle('scrolled', y > 40);
  lastScroll = y;
}, { passive: true });

/* ===== Theme Toggle ===== */
const themeToggle = document.getElementById('themeToggle');
const stored = localStorage.getItem('theme');

function setTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('theme', theme);
  if (themeToggle) {
    themeToggle.innerHTML = theme === 'dark'
      ? '<i class="fas fa-sun" aria-hidden="true"></i>'
      : '<i class="fas fa-moon" aria-hidden="true"></i>';
    themeToggle.setAttribute('aria-label', theme === 'dark' ? 'الوضع النهاري' : 'الوضع الليلي');
    themeToggle.title = theme === 'dark' ? 'الوضع النهاري' : 'الوضع الليلي';
  }
}

if (stored) {
  setTheme(stored);
} else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
  setTheme('dark');
}

if (themeToggle) {
  themeToggle.addEventListener('click', () => {
    const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    setTheme(next);
  });
}

/* ===== Search & Filter ===== */
const searchForm = document.getElementById('searchForm');
const searchInput = document.getElementById('searchInput');
const cards = qsa('.service-card');
const noResults = document.getElementById('noResults');
const noResultsTerm = document.getElementById('noResultsTerm');

function filterServices(query) {
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

const debouncedFilter = debounce(filterServices, 200);

if (searchForm) {
  searchForm.addEventListener('submit', e => {
    e.preventDefault();
    filterServices(searchInput.value);
  });
}

if (searchInput) {
  searchInput.addEventListener('input', () => debouncedFilter(searchInput.value));
}

/* ===== Hero tag clicks ===== */
qsa('.hero__tag').forEach(tag => {
  function triggerTag() {
    const val = tag.dataset.search;
    if (val && searchInput) {
      searchInput.value = val;
      searchInput.focus();
      filterServices(val);
    }
  }

  tag.addEventListener('click', triggerTag);
  tag.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      triggerTag();
    }
  });
});

/* ===== Stats counter animation ===== */
function animateCounter(el) {
  const target = +el.dataset.target;
  if (!target) return;

  const duration = 1500;
  const start = performance.now();

  function update(now) {
    const progress = Math.min((now - start) / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(eased * target).toLocaleString();
    if (progress < 1) requestAnimationFrame(update);
    else el.textContent = target.toLocaleString();
  }

  requestAnimationFrame(update);
}

const counterObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      animateCounter(entry.target);
      counterObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.5 });

qsa('.stat-card__num').forEach(el => counterObserver.observe(el));

/* ===== Scroll Reveal ===== */
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

qsa('.reveal').forEach(el => revealObserver.observe(el));

/* ===== Back to Top ===== */
const backToTop = document.getElementById('backToTop');

window.addEventListener('scroll', () => {
  if (backToTop) {
    backToTop.classList.toggle('visible', window.scrollY > 500);
    backToTop.setAttribute('tabindex', window.scrollY > 500 ? '0' : '-1');
  }
}, { passive: true });

if (backToTop) {
  backToTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

/* ===== Contact Form ===== */
const contactForm = document.getElementById('contactForm');

if (contactForm) {
  contactForm.addEventListener('submit', e => {
    e.preventDefault();

    const name = document.getElementById('contactName');
    const email = document.getElementById('contactEmail');
    const msg = document.getElementById('contactMsg');
    let valid = true;

    [name, email, msg].forEach(el => {
      if (el) el.classList.remove('error');
    });

    if (name && !name.value.trim()) {
      name.classList.add('error');
      valid = false;
    }

    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value.trim())) {
      email.classList.add('error');
      valid = false;
    }

    if (msg && !msg.value.trim()) {
      msg.classList.add('error');
      valid = false;
    }

    if (!valid) return;

    const btn = qs('.contact__btn', contactForm);
    const orig = btn.innerHTML;

    btn.disabled = true;
    btn.innerHTML = 'جارٍ الإرسال <i class="fas fa-spinner fa-spin" aria-hidden="true"></i>';

    setTimeout(() => {
      btn.innerHTML = 'تم الإرسال <i class="fas fa-check" aria-hidden="true"></i>';
      btn.style.background = '#25d366';

      setTimeout(() => {
        btn.innerHTML = orig;
        btn.style.background = '';
        btn.disabled = false;
        contactForm.reset();
      }, 2500);
    }, 600);
  });
}
