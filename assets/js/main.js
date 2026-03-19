/**
 * Above & Beyond AI — Core JavaScript
 * Handles: Navigation, Scroll, Animations, Toasts, Modals
 */

/* ── Navbar scroll effect ────────────────────────────────── */
const navbar = document.querySelector('.navbar');
if (navbar) {
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });
}

/* ── Mobile hamburger menu ───────────────────────────────── */
const hamburger = document.querySelector('.hamburger');
const navLinks  = document.querySelector('.nav-links');
if (hamburger && navLinks) {
  hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('open');
    const open = navLinks.classList.contains('open');
    hamburger.setAttribute('aria-expanded', open);
    hamburger.querySelectorAll('span').forEach((s, i) => {
      s.style.transform =
        open && i === 0 ? 'rotate(45deg) translate(5px, 5px)' :
        open && i === 1 ? 'opacity: 0' :
        open && i === 2 ? 'rotate(-45deg) translate(5px, -5px)' : '';
      if (i === 1) s.style.opacity = open ? '0' : '1';
    });
  });

  // Close on outside click
  document.addEventListener('click', e => {
    if (!navbar.contains(e.target)) {
      navLinks.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
    }
  });
}

/* ── Language switcher ───────────────────────────────────── */
document.querySelectorAll('.lang-btn').forEach(btn => {
  btn.addEventListener('click', () => setLang(btn.dataset.lang));
});

/* ── Active nav link ─────────────────────────────────────── */
(function markActiveLink() {
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    const href = a.getAttribute('href');
    if (href && (href === path || href.endsWith('/' + path))) {
      a.classList.add('active');
    }
  });
})();

/* ── Scroll reveal (Intersection Observer) ───────────────── */
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -60px 0px' });

document.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));

/* ── Animated progress bars ─────────────────────────────── */
const progressObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.querySelectorAll('.progress-fill[data-width]').forEach(bar => {
        bar.style.width = bar.dataset.width + '%';
      });
      progressObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.3 });

document.querySelectorAll('.readiness-chart, .progress-section').forEach(el =>
  progressObserver.observe(el)
);

/* ── Counter animation ───────────────────────────────────── */
function animateCounter(el, target, duration = 1500) {
  let start = 0;
  const step = timestamp => {
    if (!start) start = timestamp;
    const progress = Math.min((timestamp - start) / duration, 1);
    const ease = progress < 0.5
      ? 2 * progress * progress
      : -1 + (4 - 2 * progress) * progress;
    el.textContent = Math.round(ease * target);
    if (progress < 1) requestAnimationFrame(step);
    else el.textContent = target;
  };
  requestAnimationFrame(step);
}

const counterObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const el = entry.target;
      const target = parseInt(el.dataset.count, 10);
      if (!isNaN(target)) animateCounter(el, target);
      counterObserver.unobserve(el);
    }
  });
}, { threshold: 0.5 });

document.querySelectorAll('[data-count]').forEach(el => counterObserver.observe(el));

/* ── Toast notifications ─────────────────────────────────── */
function showToast(message, type = 'info', duration = 4000) {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const icons = { info: 'ℹ️', success: '✅', error: '❌', warning: '⚠️' };
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.innerHTML = `
    <span>${icons[type] || icons.info}</span>
    <span style="flex:1">${message}</span>
    <button onclick="this.parentElement.remove()" style="background:none;border:none;color:var(--text-muted);cursor:pointer;font-size:1rem;padding:0">×</button>
  `;

  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(20px)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

window.showToast = showToast;

/* ── Modal helpers ───────────────────────────────────────── */
function openModal(id) {
  const overlay = document.getElementById(id);
  if (overlay) {
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
}

function closeModal(id) {
  const overlay = document.getElementById(id);
  if (overlay) {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }
}

// Close on overlay click
document.querySelectorAll('.modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', e => {
    if (e.target === overlay) closeModal(overlay.id);
  });
});

// Close on Escape
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.modal-overlay.open').forEach(m => {
      closeModal(m.id);
    });
  }
});

window.openModal  = openModal;
window.closeModal = closeModal;

/* ── Smooth scroll for anchor links ─────────────────────── */
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) {
      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top, behavior: 'smooth' });
    }
  });
});

/* ── Option item selection (radio/checkbox UI) ───────────── */
document.querySelectorAll('.option-item').forEach(item => {
  item.addEventListener('click', () => {
    const input = item.querySelector('input[type="radio"], input[type="checkbox"]');
    if (!input) return;
    if (input.type === 'radio') {
      const name = input.name;
      document.querySelectorAll(`input[name="${name}"]`).forEach(r => {
        r.closest('.option-item')?.classList.remove('selected');
      });
    }
    input.checked = input.type === 'checkbox' ? !input.checked : true;
    item.classList.toggle('selected', input.checked);
  });
});

/* ── Hero progress bars init ─────────────────────────────── */
window.addEventListener('load', () => {
  setTimeout(() => {
    document.querySelectorAll('.hero .progress-fill[data-width]').forEach(bar => {
      bar.style.width = bar.dataset.width + '%';
    });
  }, 500);
});

/* ── Utility: debounce ───────────────────────────────────── */
function debounce(fn, ms = 200) {
  let timer;
  return (...args) => { clearTimeout(timer); timer = setTimeout(() => fn(...args), ms); };
}

/* ── Copy to clipboard ───────────────────────────────────── */
function copyToClipboard(text, successMsg) {
  navigator.clipboard.writeText(text).then(() => {
    showToast(successMsg || 'Kopiert!', 'success');
  });
}
window.copyToClipboard = copyToClipboard;

/* ── Form submission helper ──────────────────────────────── */
async function submitForm(formEl, handler) {
  const btn = formEl.querySelector('[type="submit"]');
  const originalText = btn?.textContent;
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span>';
  }
  try {
    await handler(new FormData(formEl));
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.textContent = originalText;
    }
  }
}
window.submitForm = submitForm;

/* ── Page transitions ────────────────────────────────────── */
document.querySelectorAll('a:not([href^="#"]):not([target="_blank"])').forEach(a => {
  a.addEventListener('click', e => {
    const href = a.getAttribute('href');
    if (!href || href.startsWith('http') || href.startsWith('mailto')) return;
    e.preventDefault();
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.2s ease';
    setTimeout(() => { window.location.href = href; }, 200);
  });
});

window.addEventListener('pageshow', () => {
  document.body.style.opacity = '1';
});

console.log('%c Above & Beyond AI 🚀', 'color:#6C63FF;font-size:1.2rem;font-weight:bold;');
