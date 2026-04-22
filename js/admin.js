/* ============================================================
   KARTAVYA YOGA — ADMIN PANEL
   ============================================================ */

'use strict';

const KartavyaAdmin = (() => {

  let activeSection = 'overview';
  let charts = {};

  function init() {
    if (!KartavyaData.isAdmin()) {
      KartavyaApp.navigateTo('login');
      return;
    }
    renderAdminHeader();
    switchSection('overview');
  }

  function renderAdminHeader() {
    const user = KartavyaData.getCurrentUser();
    const el   = document.getElementById('admin-user-name');
    if (el && user) el.textContent = user.name;
  }

  function switchSection(sectionId) {
    activeSection = sectionId;
    document.querySelectorAll('.admin-section').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.admin-nav-item').forEach(el => el.classList.toggle('active', el.dataset.section === sectionId));

    const target = document.getElementById(`admin-${sectionId}`);
    if (target) target.classList.add('active');

    switch (sectionId) {
      case 'overview':  renderOverview();  break;
      case 'visits':    renderVisits();    break;
      case 'bookings':  renderBookings();  break;
      case 'schedule':  renderSchedule();  break;
      case 'meetings':  renderMeetings();  break;
      case 'push':      renderPush();      break;
    }
  }

  // ──────────────────────────────────────────────────────────
  // OVERVIEW — KPIs + Quick Summary
  // ──────────────────────────────────────────────────────────
  function renderOverview() {
    const kpis = KartavyaData.getAdminKPIs();
    const el   = document.getElementById('admin-kpi-grid');
    if (!el) return;

    el.innerHTML = `
      <div class="kpi-card">
        <div class="kpi-label">Bookings Today</div>
        <div class="kpi-value">${kpis.today}</div>
        <div class="kpi-change">${kpis.todayChange} from yesterday</div>
      </div>
      <div class="kpi-card green">
        <div class="kpi-label">This Week</div>
        <div class="kpi-value">${kpis.week}</div>
        <div class="kpi-change">${kpis.weekChange} vs last week</div>
      </div>
      <div class="kpi-card gold">
        <div class="kpi-label">This Month</div>
        <div class="kpi-value">${kpis.month}</div>
        <div class="kpi-change">${kpis.monthChange} vs last month</div>
      </div>
      <div class="kpi-card">
        <div class="kpi-label">Revenue (₹)</div>
        <div class="kpi-value">₹${(kpis.revenue/1000).toFixed(1)}k</div>
        <div class="kpi-change">${kpis.revenueChange} vs last month</div>
      </div>
    `;

    // Recent bookings mini-table
    const bkEl = document.getElementById('admin-overview-bookings');
    if (bkEl) {
      const bookings = KartavyaData.getAllBookings().slice(0, 5);
      bkEl.innerHTML = `
        <div class="table-wrapper">
          <table class="data-table">
            <thead>
              <tr><th>Guest</th><th>Class</th><th>When</th><th>Status</th></tr>
            </thead>
            <tbody>
              ${bookings.map(b => `
                <tr>
                  <td>${b.userName}</td>
                  <td>${b.class}</td>
                  <td>${b.date} · ${b.time}</td>
                  <td><span class="badge badge-${b.status}">${b.status.toUpperCase()}</span></td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
        <div style="margin-top:var(--space-md)">
          <button class="btn btn-outline btn-sm" onclick="KartavyaAdmin.switchSection('bookings')">VIEW ALL BOOKINGS →</button>
        </div>
      `;
    }

    // Init visitor chart in overview  
    setTimeout(() => {
      const canvas = document.getElementById('overview-visitor-chart');
      if (canvas && window.Chart) initMiniVisitorChart(canvas);
    }, 200);
  }

  function initMiniVisitorChart(canvas) {
    if (charts.overview) { charts.overview.destroy(); }
    const data = KartavyaData.getVisitorData().slice(-14);
    const ctx  = canvas.getContext('2d');
    charts.overview = new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.map(d => d.label),
        datasets: [{
          label: 'Visitors',
          data: data.map(d => d.visitors),
          borderColor: '#C8760A',
          backgroundColor: 'rgba(200,118,10,0.08)',
          borderWidth: 2,
          tension: 0,
          pointRadius: 2,
          pointBackgroundColor: '#C8760A',
          stepped: true,
        }]
      },
      options: chartOptions('Visitors (last 14 days)')
    });
  }

  // ──────────────────────────────────────────────────────────
  // SITE VISITS
  // ──────────────────────────────────────────────────────────
  function renderVisits() {
    const visitors = KartavyaData.getRecentVisitors();
    const tableEl  = document.getElementById('admin-visitor-table');

    if (tableEl) {
      tableEl.innerHTML = `
        <div class="table-wrapper">
          <table class="data-table">
            <thead>
              <tr><th>Page</th><th>When</th><th>Device</th><th>Browser</th><th>Session</th></tr>
            </thead>
            <tbody>
              ${visitors.map(v => `
                <tr>
                  <td><code style="font-size:0.78rem;background:var(--color-surface);padding:0.1rem 0.3rem">${v.page}</code></td>
                  <td class="tech-text">${formatTimeAgo(v.timestamp)}</td>
                  <td>${v.device}</td>
                  <td>${v.browser}</td>
                  <td class="tech-text" style="opacity:0.6">${v.sessionId.slice(0,8)}…</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </div>
      `;
    }

    setTimeout(() => {
      const lineCanvas = document.getElementById('visitor-line-chart');
      const barCanvas  = document.getElementById('visitor-bar-chart');
      if (lineCanvas && window.Chart) initVisitorLineChart(lineCanvas);
      if (barCanvas  && window.Chart) initTopPagesChart(barCanvas);
    }, 200);
  }

  function initVisitorLineChart(canvas) {
    if (charts.visitorLine) charts.visitorLine.destroy();
    const data = KartavyaData.getVisitorData();
    const ctx  = canvas.getContext('2d');
    charts.visitorLine = new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.map(d => d.label),
        datasets: [
          {
            label: 'Unique Visitors',
            data: data.map(d => d.visitors),
            borderColor: '#C8760A', backgroundColor: 'rgba(200,118,10,0.06)', borderWidth: 2, tension: 0, pointRadius: 2, stepped: true,
          },
          {
            label: 'Page Views',
            data: data.map(d => d.pageViews),
            borderColor: '#3B5C3A', backgroundColor: 'rgba(59,92,58,0.05)', borderWidth: 2, tension: 0, pointRadius: 2, stepped: true,
          }
        ]
      },
      options: chartOptions('Daily Visitors — Last 30 Days')
    });
  }

  function initTopPagesChart(canvas) {
    if (charts.topPages) charts.topPages.destroy();
    const pages = KartavyaData.getTopPages();
    const ctx   = canvas.getContext('2d');
    charts.topPages = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: pages.map(p => p.page),
        datasets: [{
          label: 'Page Views',
          data: pages.map(p => p.views),
          backgroundColor: ['#C8760A','#3B5C3A','#C5A945','#8B2020','#6B5F47'],
          borderWidth: 0,
        }]
      },
      options: chartOptions('Top Pages')
    });
  }

  function chartOptions(title) {
    const isDark = document.documentElement.dataset.theme === 'dark';
    const textColor = isDark ? '#E8DFC8' : '#1C1A14';
    const gridColor = isDark ? 'rgba(232,223,200,0.07)' : 'rgba(28,26,20,0.07)';
    return {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { display: true, labels: { color: textColor, font: { family: "'Courier Prime', monospace", size: 11 }, boxWidth: 12 } },
        title:  { display: false }
      },
      scales: {
        x: { ticks: { color: textColor, font: { family: "'Courier Prime', monospace", size: 10 }, maxRotation: 45 }, grid: { color: gridColor } },
        y: { ticks: { color: textColor, font: { family: "'Courier Prime', monospace", size: 10 } }, grid: { color: gridColor } }
      }
    };
  }

  // ──────────────────────────────────────────────────────────
  // ALL BOOKINGS
  // ──────────────────────────────────────────────────────────
  function renderBookings() {
    const container = document.getElementById('admin-bookings-table');
    if (!container) return;
    const bookings  = KartavyaData.getAllBookings();
    container.innerHTML = `
      <div class="table-wrapper">
        <table class="data-table">
          <thead>
            <tr><th>#</th><th>Guest</th><th>Class</th><th>Date / Time</th><th>Status</th><th>Actions</th></tr>
          </thead>
          <tbody>
            ${bookings.map((b, i) => `
              <tr>
                <td class="tech-text">${String(i+1).padStart(2,'0')}</td>
                <td><strong>${b.userName}</strong></td>
                <td>${b.class}</td>
                <td class="tech-text">${b.date} · ${b.time}</td>
                <td><span class="badge badge-${b.status}">${b.status.toUpperCase()}</span></td>
                <td>
                  ${b.status === 'pending' ? `<button class="btn btn-secondary btn-sm" onclick="KartavyaAdmin.confirmAdminBooking('${b.id}', this)">CONFIRM</button>` : ''}
                  ${b.status !== 'cancelled' ? `<button class="btn btn-danger btn-sm" onclick="KartavyaAdmin.cancelAdminBooking('${b.id}', this)" style="margin-left:0.3rem">CANCEL</button>` : ''}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  // ──────────────────────────────────────────────────────────
  // SCHEDULE MANAGER
  // ──────────────────────────────────────────────────────────
  function renderSchedule() {
    const container = document.getElementById('admin-schedule-list');
    if (!container) return;

    const slots   = KartavyaData.getSlots().slice(0, 20);
    const classes = KartavyaData.getClasses();

    container.innerHTML = slots.map(slot => {
      const cls = classes.find(c => c.id === slot.classId);
      if (!cls) return '';
      return `
        <div class="schedule-slot-card ${slot.isActive ? '' : 'inactive'}">
          <div class="schedule-slot-info">
            <div class="schedule-slot-time">${slot.startTime} – ${slot.endTime}</div>
            <div class="schedule-slot-meta">${slot.dateDisplay} &nbsp;·&nbsp; ${cls.name} &nbsp;·&nbsp; ${cls.difficulty}</div>
          </div>
          <div class="schedule-slot-capacity">
            <span class="badge ${slot.isFull ? 'badge-full' : 'badge-available'}">${slot.bookedCount}/${slot.maxCapacity} booked</span>
          </div>
          <div class="schedule-slot-actions">
            <button class="btn btn-outline btn-sm" onclick="KartavyaAdmin.toggleSlot('${slot.id}', this)">
              ${slot.isActive ? 'DEACTIVATE' : 'ACTIVATE'}
            </button>
          </div>
        </div>`;
    }).join('');

    // Add new slot form
    const formEl = document.getElementById('admin-add-slot-form');
    if (formEl) return; // already rendered
  }

  // ──────────────────────────────────────────────────────────
  // MEETINGS
  // ──────────────────────────────────────────────────────────
  function renderMeetings() {
    const container = document.getElementById('admin-meetings-list');
    if (!container) return;
    const meetings = KartavyaData.getMeetings();

    if (!meetings.length) {
      container.innerHTML = `<div class="empty-state"><div class="empty-state-icon">📅</div><p class="empty-state-desc">No meeting requests yet.</p></div>`;
      return;
    }

    container.innerHTML = meetings.map(m => `
      <div class="meeting-card ${m.status}" id="meeting-${m.id}">
        <div class="meeting-card-info">
          <div class="meeting-card-name">${m.name}</div>
          <div class="meeting-card-meta">${m.requestedDate} at ${m.requestedTime}</div>
          <div class="meeting-card-msg">"${m.message}"</div>
          ${m.meetLink ? `<div style="margin-top:0.5rem;font-size:0.78rem"><a href="${m.meetLink}" target="_blank" rel="noopener" style="color:var(--color-primary)">🔗 ${m.meetLink}</a></div>` : ''}
        </div>
        <div class="meeting-card-actions">
          <span class="badge badge-${m.status}">${m.status.toUpperCase()}</span>
          ${m.status === 'pending' ? `
            <button class="btn btn-secondary btn-sm" onclick="KartavyaAdmin.confirmMeeting('${m.id}')">CONFIRM</button>
            <button class="btn btn-danger btn-sm" onclick="KartavyaAdmin.declineMeeting('${m.id}')">DECLINE</button>
          ` : ''}
        </div>
      </div>
    `).join('');
  }

  // ──────────────────────────────────────────────────────────
  // PUSH NOTIFICATIONS
  // ──────────────────────────────────────────────────────────
  function renderPush() {
    // Form is already in HTML; just wire submit
    const form = document.getElementById('push-notif-form');
    if (!form || form.dataset.wired) return;
    form.dataset.wired = '1';
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const title    = document.getElementById('pn-title').value.trim();
      const body     = document.getElementById('pn-body').value.trim();
      const audience = document.querySelector('input[name="pn-audience"]:checked')?.value || 'all';
      if (!title || !body) { KartavyaApp.showToast('Title and message are required.', 'error'); return; }

      // Demo send
      const btn = form.querySelector('[type=submit]');
      if (btn) { btn.textContent = 'SENDING…'; btn.disabled = true; }
      setTimeout(() => {
        KartavyaApp.showToast(`Notification sent to ${audience === 'all' ? 'all users' : 'selected audience'}.`, 'success');
        form.reset();
        if (btn) { btn.textContent = 'SEND NOTIFICATION'; btn.disabled = false; }
        const log = document.getElementById('push-log');
        if (log) {
          const item = document.createElement('div');
          item.style.cssText = 'padding:0.5rem 0;border-bottom:1px solid var(--border-color);font-size:0.78rem';
          item.innerHTML = `<strong>${title}</strong> → <span class="tech-text">${audience}</span> <span style="float:right;color:var(--color-text-muted)">${new Date().toLocaleTimeString()}</span>`;
          log.prepend(item);
        }
      }, 1500);
    });
  }

  // ──────────────────────────────────────────────────────────
  // HELPERS
  // ──────────────────────────────────────────────────────────
  function formatTimeAgo(isoStr) {
    const diff = Date.now() - new Date(isoStr).getTime();
    const min  = Math.floor(diff / 60000);
    if (min < 1)  return 'just now';
    if (min < 60) return `${min}m ago`;
    const hr = Math.floor(min / 60);
    if (hr < 24)  return `${hr}h ago`;
    return `${Math.floor(hr/24)}d ago`;
  }

  return {
    init,
    switchSection,
    confirmMeeting(id) {
      const link = prompt('Enter Google Meet / Zoom link:') || '';
      KartavyaData.updateMeeting(id, { status: 'confirmed', meetLink: link });
      renderMeetings();
      KartavyaApp.showToast('Meeting confirmed — notification sent.', 'success');
    },
    declineMeeting(id) {
      if (!confirm('Decline this meeting request?')) return;
      KartavyaData.updateMeeting(id, { status: 'declined' });
      renderMeetings();
      KartavyaApp.showToast('Meeting declined.', 'info');
    },
    toggleSlot(slotId, btn) {
      KartavyaData.toggleSlotActive(slotId);
      renderSchedule();
      KartavyaApp.showToast('Slot updated.', 'success');
    },
    confirmAdminBooking(id, btn) {
      btn.closest('tr').querySelector('.badge').className = 'badge badge-confirmed';
      btn.closest('tr').querySelector('.badge').textContent = 'CONFIRMED';
      btn.remove();
      KartavyaApp.showToast('Booking confirmed.', 'success');
    },
    cancelAdminBooking(id, btn) {
      if (!confirm('Cancel this booking?')) return;
      btn.closest('tr').querySelector('.badge').className = 'badge badge-cancelled';
      btn.closest('tr').querySelector('.badge').textContent = 'CANCELLED';
      btn.parentElement.innerHTML = '';
      KartavyaApp.showToast('Booking cancelled and user notified.', 'info');
    }
  };
})();

window.KartavyaAdmin = KartavyaAdmin;
