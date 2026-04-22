/* ============================================================
   KARTAVYA YOGA — CORE APP (Router + Animations + Theme)
   ============================================================ */

'use strict';

const KartavyaApp = (() => {

  // ──────────────────────────────────────────────────────────
  // STATE
  // ──────────────────────────────────────────────────────────
  let currentPage = 'home';
  let theme = 'light';
  let mobileMenuOpen = false;
  let scrollObserver = null;

  // ──────────────────────────────────────────────────────────
  // ROUTING
  // ──────────────────────────────────────────────────────────
  function getHashPage() {
    const hash = window.location.hash.replace('#', '') || 'home';
    return hash.split('/')[0];
  }

  function navigateTo(page, pushState = true) {
    // Auth guards
    if (page === 'dashboard' && !KartavyaData.getCurrentUser()) {
      navigateTo('login', pushState);
      sessionStorage.setItem('kv_redirect', page);
      return;
    }
    if (page === 'admin' && !KartavyaData.isAdmin()) {
      navigateTo('login', pushState);
      sessionStorage.setItem('kv_redirect', page);
      return;
    }

    // Hide all pages
    document.querySelectorAll('.page').forEach(el => el.classList.remove('active'));

    // Show target page (fall back to home)
    const target = document.getElementById(`page-${page}`) || document.getElementById('page-home');
    if (target) {
      target.classList.add('active');
      target.classList.remove('page-cut-in');
      void target.offsetWidth; // reflow
      target.classList.add('page-cut-in');
    }

    currentPage = page;

    // Update URL
    if (pushState) {
      window.history.pushState(null, '', `#${page}`);
    }

    // Update nav links
    updateNavActive(page);

    // Ticker visibility
    const ticker = document.getElementById('ticker-banner');
    if (ticker) {
      ticker.style.display = page === 'home' ? 'flex' : 'none';
    }

    // Scroll to top
    window.scrollTo(0, 0);

    // Close mobile menu
    if (mobileMenuOpen) toggleMobileMenu();

    // Trigger page-specific init
    initPage(page);

    // Re-observe scroll reveals
    setTimeout(observeReveals, 100);

    // Track visit
    trackVisit(page);
  }

  function initPage(page) {
    switch (page) {
      case 'home':      KartavyaHome && KartavyaHome.init(); break;
      case 'classes':   KartavyaClasses && KartavyaClasses.init(); break;
      case 'book':      KartavyaBooking && KartavyaBooking.init(); break;
      case 'dashboard': KartavyaDashboard && KartavyaDashboard.init(); break;
      case 'admin':     KartavyaAdmin && KartavyaAdmin.init(); break;
      case 'login':     initLoginPage(); break;
    }
  }

  // ──────────────────────────────────────────────────────────
  // THEME
  // ──────────────────────────────────────────────────────────
  function initTheme() {
    const saved = sessionStorage.getItem('kv_theme') || 'light';
    setTheme(saved);
  }

  function setTheme(t) {
    theme = t;
    document.documentElement.setAttribute('data-theme', t);
    sessionStorage.setItem('kv_theme', t);
    const btn = document.getElementById('theme-toggle');
    if (btn) btn.textContent = t === 'dark' ? '☀' : '◐';
    const btnMobile = document.getElementById('theme-toggle-mobile');
    if (btnMobile) btnMobile.textContent = t === 'dark' ? '☀' : '◐';
  }

  function toggleTheme() {
    setTheme(theme === 'light' ? 'dark' : 'light');
  }

  // ──────────────────────────────────────────────────────────
  // NAVIGATION
  // ──────────────────────────────────────────────────────────
  function updateNavActive(page) {
    document.querySelectorAll('.nav-link').forEach(el => {
      el.classList.toggle('active', el.dataset.page === page);
    });
  }

  function updateNavAuth() {
    const user = KartavyaData.getCurrentUser();
    const adminEl = document.getElementById('nav-admin-link');
    const dashEl  = document.getElementById('nav-dash-link');
    const loginEl = document.getElementById('nav-login-btn');
    const logoutEl= document.getElementById('nav-logout-btn');
    const userNameEl = document.getElementById('nav-user-name');

    if (user) {
      if (loginEl)  loginEl.classList.add('hidden');
      if (logoutEl) logoutEl.classList.remove('hidden');
      if (dashEl)   dashEl.classList.remove('hidden');
      if (userNameEl) { userNameEl.textContent = user.name.split(' ')[0]; userNameEl.classList.remove('hidden'); }
      if (adminEl)  adminEl.classList.toggle('hidden', !KartavyaData.isAdmin());
    } else {
      if (loginEl)  loginEl.classList.remove('hidden');
      if (logoutEl) logoutEl.classList.add('hidden');
      if (dashEl)   dashEl.classList.add('hidden');
      if (adminEl)  adminEl.classList.add('hidden');
      if (userNameEl) userNameEl.classList.add('hidden');
    }
  }

  function toggleMobileMenu() {
    mobileMenuOpen = !mobileMenuOpen;
    const menu = document.getElementById('mobile-menu');
    const btn   = document.getElementById('nav-hamburger');
    if (menu) menu.classList.toggle('open', mobileMenuOpen);
    if (btn)  btn.classList.toggle('open', mobileMenuOpen);
  }

  // Sticky nav shadow on scroll
  function initNavScroll() {
    const nav = document.getElementById('main-nav');
    if (!nav) return;
    window.addEventListener('scroll', () => {
      nav.classList.toggle('scrolled', window.scrollY > 10);
    }, { passive: true });
  }

  // ──────────────────────────────────────────────────────────
  // INTERSECTION OBSERVER — Section reveals
  // ──────────────────────────────────────────────────────────
  function observeReveals() {
    if (scrollObserver) scrollObserver.disconnect();
    const revealEls = document.querySelectorAll('.page.active .section-reveal');
    scrollObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          scrollObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(el => scrollObserver.observe(el));
  }

  // ──────────────────────────────────────────────────────────
  // BOTANICAL PARALLAX
  // ──────────────────────────────────────────────────────────
  function initParallax() {
    window.addEventListener('scroll', () => {
      const scrollY = window.scrollY;
      document.querySelectorAll('.botanical-watermark').forEach(el => {
        el.style.transform = `translateY(${scrollY * 0.3}px)`;
      });
    }, { passive: true });
  }

  // ──────────────────────────────────────────────────────────
  // TICKER ANIMATION (re-init if needed)
  // ──────────────────────────────────────────────────────────
  function initTicker() {
    const ticker = document.querySelector('.ticker-track');
    if (!ticker) return;
    // The CSS animation handles the scrolling; just ensure content is doubled for seamless loop
    const items = ticker.innerHTML;
    if (!ticker.dataset.doubled) {
      ticker.innerHTML = items + items;
      ticker.dataset.doubled = '1';
    }
  }

  // ──────────────────────────────────────────────────────────
  // SVG DRAW-ON for script words
  // ──────────────────────────────────────────────────────────
  function initScriptDrawOn() {
    document.querySelectorAll('.script-draw-path').forEach(path => {
      const len = path.getTotalLength ? path.getTotalLength() : 600;
      path.style.strokeDasharray = len;
      path.style.strokeDashoffset = len;
      path.style.animation = `draw-on 2s steps(20) forwards`;
    });
  }

  // ──────────────────────────────────────────────────────────
  // VISIT TRACKING (minimal — writes to sessionStorage)
  // ──────────────────────────────────────────────────────────
  function getOrCreateSessionId() {
    let sid = sessionStorage.getItem('kv_session_id');
    if (!sid) {
      sid = 'sess_' + Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
      sessionStorage.setItem('kv_session_id', sid);
    }
    return sid;
  }

  function trackVisit(page) {
    // In Phase 2: call Firebase Cloud Function trackVisit
    const visit = {
      page: `/${page}`,
      timestamp: new Date().toISOString(),
      sessionId: getOrCreateSessionId(),
      device: /Mobile|Android|iPhone|iPad/i.test(navigator.userAgent) ? 'Mobile' : 'Desktop',
      browser: (() => {
        const ua = navigator.userAgent;
        if (ua.includes('Chrome'))  return 'Chrome';
        if (ua.includes('Firefox')) return 'Firefox';
        if (ua.includes('Safari'))  return 'Safari';
        return 'Other';
      })()
    };
    // Store locally for demo
    const visits = JSON.parse(sessionStorage.getItem('kv_visits') || '[]');
    visits.push(visit);
    sessionStorage.setItem('kv_visits', JSON.stringify(visits.slice(-50)));
  }

  // ──────────────────────────────────────────────────────────
  // LOGIN PAGE (simple inline init)
  // ──────────────────────────────────────────────────────────
  function initLoginPage() {
    const loginForm   = document.getElementById('login-form');
    const signupForm  = document.getElementById('signup-form');
    const loginTab    = document.getElementById('tab-login');
    const signupTab   = document.getElementById('tab-signup');
    const loginErr    = document.getElementById('login-error');
    const signupErr   = document.getElementById('signup-error');

    if (!loginForm) return;

    // Clear errors
    if (loginErr)  loginErr.textContent = '';
    if (signupErr) signupErr.textContent = '';

    loginTab && loginTab.addEventListener('click', () => {
      loginTab.classList.add('active');
      signupTab && signupTab.classList.remove('active');
      loginForm.classList.remove('hidden');
      signupForm && signupForm.classList.add('hidden');
    });
    signupTab && signupTab.addEventListener('click', () => {
      signupTab.classList.add('active');
      loginTab && loginTab.classList.remove('active');
      signupForm && signupForm.classList.remove('hidden');
      loginForm.classList.add('hidden');
    });

    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const email = document.getElementById('login-email').value.trim();
      const pass  = document.getElementById('login-password').value;
      if (!email || !pass) { if (loginErr) loginErr.textContent = 'Please fill all fields.'; return; }
      // Demo: admin if email contains 'admin'
      const role = email.includes('admin') ? 'admin' : 'user';
      const name = email.split('@')[0].replace(/[._]/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      KartavyaData.login(name, email, role);
      updateNavAuth();
      showToast('Welcome back, ' + name.split(' ')[0] + '!', 'success');
      const redirect = sessionStorage.getItem('kv_redirect') || (role === 'admin' ? 'admin' : 'dashboard');
      sessionStorage.removeItem('kv_redirect');
      navigateTo(redirect);
    });

    signupForm && signupForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name  = document.getElementById('signup-name').value.trim();
      const email = document.getElementById('signup-email').value.trim();
      const pass  = document.getElementById('signup-password').value;
      if (!name || !email || !pass) { if (signupErr) signupErr.textContent = 'Please fill all fields.'; return; }
      if (pass.length < 6) { if (signupErr) signupErr.textContent = 'Password must be 6+ characters.'; return; }
      KartavyaData.login(name, email, 'user');
      updateNavAuth();
      showToast('Account created! Welcome, ' + name.split(' ')[0] + '!', 'success');
      navigateTo('dashboard');
    });

    // Google Sign-In (demo)
    document.querySelectorAll('.btn-google-demo').forEach(btn => {
      btn.addEventListener('click', () => {
        KartavyaData.login('Demo User', 'demo@google.com', 'user');
        updateNavAuth();
        showToast('Signed in with Google!', 'success');
        const redirect = sessionStorage.getItem('kv_redirect') || 'dashboard';
        sessionStorage.removeItem('kv_redirect');
        navigateTo(redirect);
      });
    });
  }

  // ──────────────────────────────────────────────────────────
  // TOAST NOTIFICATIONS
  // ──────────────────────────────────────────────────────────
  function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `<span>${type === 'success' ? '✓' : type === 'error' ? '✕' : 'ℹ'}</span><span>${message}</span>`;
    container.appendChild(toast);
    setTimeout(() => { toast.style.animation = 'toast-out 0.3s steps(1) forwards'; setTimeout(() => toast.remove(), 300); }, 4000);
  }

  // ──────────────────────────────────────────────────────────
  // HOME PAGE
  // ──────────────────────────────────────────────────────────
  const KartavyaHome = {
    init() {
      this.renderUpcomingClasses();
    },
    renderUpcomingClasses() {
      const container = document.getElementById('home-upcoming-classes');
      if (!container) return;
      const slots = KartavyaData.getUpcomingSlots(3);
      if (!slots.length) { container.innerHTML = '<div class="empty-state"><div class="empty-state-icon">🌿</div><p class="empty-state-desc">No classes today. Check back tomorrow.</p></div>'; return; }
      container.innerHTML = slots.map(slot => {
        const cls = KartavyaData.getClass(slot.classId);
        if (!cls) return '';
        const avail = slot.maxCapacity - slot.bookedCount;
        const isFull = slot.isFull;
        return `
        <article class="class-card ${isFull ? 'is-full' : ''} section-reveal" data-slot="${slot.id}">
          <div class="class-card-header">
            <span class="class-card-type">${cls.type}</span>
            <span class="class-card-duration">${cls.durationMinutes}min</span>
          </div>
          <div class="class-card-body">
            <h3 class="class-card-name">${cls.name}</h3>
            <div class="class-card-meta">
              <div class="class-card-meta-item"><span class="class-card-meta-label">Day</span><span class="class-card-meta-value">${slot.dateDisplay}</span></div>
              <div class="class-card-meta-item"><span class="class-card-meta-label">Time</span><span class="class-card-meta-value">${slot.startTime}</span></div>
              <div class="class-card-meta-item"><span class="class-card-meta-label">Level</span><span class="class-card-meta-value">${cls.difficulty}</span></div>
              <div class="class-card-meta-item"><span class="class-card-meta-label">With</span><span class="class-card-meta-value">${cls.instructorName.split(' ')[0]}</span></div>
            </div>
          </div>
          <div class="class-card-footer">
            <div class="class-card-slots">
              <span class="slot-dot pulse-dot"></span>
              ${isFull ? 'CLASS FULL' : avail + ' slot' + (avail !== 1 ? 's' : '') + ' left'}
            </div>
            ${isFull
              ? '<span class="badge badge-full">FULL</span>'
              : `<button class="btn btn-primary btn-sm glitch-btn" onclick="KartavyaApp.bookClass('${slot.id}','${cls.id}')">BOOK NOW</button>`
            }
          </div>
        </article>`;
      }).join('');
    }
  };

  // ──────────────────────────────────────────────────────────
  // PUBLIC API
  // ──────────────────────────────────────────────────────────
  return {
    init() {
      initTheme();
      initNavScroll();
      initParallax();
      initTicker();

      // Initial route
      const page = getHashPage();
      navigateTo(page, false);

      // Hash change
      window.addEventListener('hashchange', () => navigateTo(getHashPage(), false));

      // Nav link clicks (delegated)
      document.addEventListener('click', (e) => {
        const navLink = e.target.closest('[data-page]');
        if (navLink && navLink.dataset.page) {
          e.preventDefault();
          navigateTo(navLink.dataset.page);
        }
      });

      // Theme toggle
      document.getElementById('theme-toggle') && document.getElementById('theme-toggle').addEventListener('click', toggleTheme);
      document.getElementById('theme-toggle-mobile') && document.getElementById('theme-toggle-mobile').addEventListener('click', toggleTheme);

      // Hamburger
      document.getElementById('nav-hamburger') && document.getElementById('nav-hamburger').addEventListener('click', toggleMobileMenu);

      // Logout
      document.getElementById('nav-logout-btn') && document.getElementById('nav-logout-btn').addEventListener('click', () => {
        KartavyaData.logout();
        updateNavAuth();
        showToast('Signed out. See you on the mat!', 'info');
        navigateTo('home');
      });

      updateNavAuth();
      setTimeout(observeReveals, 200);
      setTimeout(initScriptDrawOn, 500);

      // Hide page loader
      const loader = document.getElementById('page-loader');
      if (loader) setTimeout(() => loader.classList.add('hidden'), 400);
    },

    navigateTo,
    showToast,
    bookClass(slotId, classId) {
      sessionStorage.setItem('kv_book_slot', slotId);
      sessionStorage.setItem('kv_book_class', classId);
      navigateTo('book');
    },
    getCurrentPage: () => currentPage,
  };
})();

window.KartavyaApp = KartavyaApp;
document.addEventListener('DOMContentLoaded', () => KartavyaApp.init());
