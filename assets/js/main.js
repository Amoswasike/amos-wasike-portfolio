   // Back to top
    const backToTopBtn = document.getElementById("backToTop");
    window.onscroll = function() {
      if (document.body.scrollTop > 500 || document.documentElement.scrollTop > 500) {
        backToTopBtn.classList.add("show");
      } else {
        backToTopBtn.classList.remove("show");
      }
    };
    backToTopBtn.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // Dark mode system preference
      // detect dark mode and set a class
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) document.documentElement.classList.add('dark');

      // detect reduced motion preference and expose to runtime
      const prefersReducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      if (prefersReducedMotion) document.documentElement.classList.add('reduced-motion');
    

    // Respect user reduced-motion preference (handled above)

    
// Mobile navigation toggle
const toggle = document.querySelector('.nav-toggle');
const menu = document.querySelector('.nav-menu');
const backdrop = document.querySelector('.nav-backdrop');
const links = document.querySelectorAll('.nav-menu a');

let removeNavTrap = null;

/* NOTE: focus trap helper defined later (covers more element types). */

// Open / close menu
function toggleMenu() {
  const isOpen = menu.classList.toggle('active');
  toggle.classList.toggle('active');
  backdrop.classList.toggle('active');

  toggle.setAttribute('aria-expanded', String(isOpen));

  if (isOpen) {
    const firstLink = menu.querySelector('a, button');
    if (firstLink) firstLink.focus();
    removeNavTrap = trapFocus(menu);
  } else {
    closeMenu();
  }
}

function closeMenu() {
  toggle.classList.remove('active');
  menu.classList.remove('active');
  backdrop.classList.remove('active');

  toggle.setAttribute('aria-expanded', 'false');

  if (removeNavTrap) {
    removeNavTrap();
    removeNavTrap = null;
  }

  toggle.focus();
}

// Events
toggle.addEventListener('click', toggleMenu);
backdrop.addEventListener('click', closeMenu);
links.forEach(link => link.addEventListener('click', closeMenu));




    // Utility: focus trap (used by modal and mobile nav)
    function trapFocus(container) {
      const focusable = Array.from(container.querySelectorAll('a, button, textarea, input, select, [tabindex]:not([tabindex="-1"])')).filter(el => !el.hasAttribute('disabled'));
      if (!focusable.length) return () => {};
      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      function handle(e) {
        if (e.key === 'Tab') {
          if (e.shiftKey && document.activeElement === first) {
            e.preventDefault();
            last.focus();
          } else if (!e.shiftKey && document.activeElement === last) {
            e.preventDefault();
            first.focus();
          }
        }
        if (e.key === 'Escape') {
          if (container.contains(document.activeElement)) {
            // try to close dialog if it exists
            const modalEl = document.getElementById('certModal');
            if (modalEl && modalEl.classList.contains('active')) closeModal();
          }
        }
      }

      container.addEventListener('keydown', handle);
      return () => container.removeEventListener('keydown', handle);
    }

    // Certificate modal (improved accessibility)
    const modal = document.getElementById('certModal');
    const modalTitle = document.getElementById('certTitle');
    const modalImage = document.getElementById('certImage');
    const modalDownload = document.getElementById('certDownload');
    const closeBtn = document.querySelector('.cert-close');
    const main = document.querySelector('main');
    let lastActiveElement = null;
    let removeModalTrap = null;

    function openModal(btn) {
      lastActiveElement = document.activeElement;
      modalTitle.textContent = btn.dataset.title || 'Certificate';
      modalImage.src = btn.dataset.image || '';
      modalImage.alt = (btn.dataset.title || 'Certificate') + ' preview';
      modalDownload.href = btn.dataset.file || '#';

      modal.classList.add('active');
      modal.setAttribute('aria-hidden', 'false');
      if (main) main.setAttribute('aria-hidden', 'true');
      modal.focus();
      removeModalTrap = trapFocus(modal);
    }

    function closeModal() {
      modal.classList.remove('active');
      modal.setAttribute('aria-hidden', 'true');
      if (main) main.setAttribute('aria-hidden', 'false');
      if (removeModalTrap) { removeModalTrap(); removeModalTrap = null; }
      if (lastActiveElement) lastActiveElement.focus();
    }

    document.querySelectorAll('.cert-view').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        openModal(btn);
      });
    });

    closeBtn.addEventListener('click', closeModal);
    modal.addEventListener('click', e => { if (e.target === modal) closeModal(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && modal.classList.contains('active')) closeModal(); });

    // Certification accordion accessibility (ensure panels have ids + aria-hidden)
    document.querySelectorAll('.cert-item').forEach((item, idx) => {
      const toggle = item.querySelector('.cert-toggle');
      const panel = item.querySelector('.cert-panel');
      if (!toggle || !panel) return;
      // ensure unique ids
      if (!panel.id) panel.id = 'cert-panel-' + (idx + 1);
      if (!toggle.id) toggle.id = 'cert-toggle-' + (idx + 1);
      toggle.setAttribute('aria-controls', panel.id);
      panel.setAttribute('role', 'region');
      panel.setAttribute('aria-labelledby', toggle.id);
      // initialize aria-hidden based on expanded
      const expanded = toggle.getAttribute('aria-expanded') === 'true';
      panel.setAttribute('aria-hidden', String(!expanded));

      toggle.addEventListener('click', () => {
        const isExpanded = toggle.getAttribute('aria-expanded') === 'true';
        toggle.setAttribute('aria-expanded', String(!isExpanded));
        panel.setAttribute('aria-hidden', String(isExpanded));
        item.classList.toggle('open', !isExpanded);
      });
    });

// Scroll reveal using Intersection Observer (respect reduced motion)
const revealElements = document.querySelectorAll('.reveal');

if (revealElements.length) {
  if (prefersReducedMotion) {
    // Immediately reveal without transitions/delays
    revealElements.forEach(el => el.classList.add('is-visible'));
  } else if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const delay = el.dataset.delay || 0;
        el.style.transitionDelay = delay + 'ms';
        el.classList.add('is-visible');
        obs.unobserve(el);
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -20% 0px' });

    revealElements.forEach(el => observer.observe(el));
  } else {
    revealElements.forEach(el => el.classList.add('is-visible'));
  }
}

// Tabs functionality for Skills section (accessible)
const tabs = Array.from(document.querySelectorAll('.tab'));
const groups = Array.from(document.querySelectorAll('.skills-group'));

function activateTab(tab) {
  tabs.forEach(t => {
    const selected = t === tab;
    t.classList.toggle('active', selected);
    t.setAttribute('aria-selected', selected ? 'true' : 'false');
    t.tabIndex = selected ? 0 : -1;
  });

  const filter = tab.dataset.filter;
  groups.forEach(group => {
    group.style.display = (filter === 'all' || group.dataset.category === filter) ? 'block' : 'none';
  });
  tab.focus();
}

tabs.forEach((tab, idx) => {
  tab.addEventListener('click', () => activateTab(tab));
  tab.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') activateTab(tabs[(idx + 1) % tabs.length]);
    if (e.key === 'ArrowLeft') activateTab(tabs[(idx - 1 + tabs.length) % tabs.length]);
    if (e.key === 'Home') activateTab(tabs[0]);
    if (e.key === 'End') activateTab(tabs[tabs.length - 1]);
  });
});

// Highlight active page link
const navLinks = document.querySelectorAll('.nav-menu a');
const currentURL = window.location.href;

navLinks.forEach(link => {
  if (link.href === currentURL || link.href === currentURL.split('#')[0]) {
    link.classList.add('active');
  }
});
