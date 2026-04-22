/* ============================================================
   KARTAVYA YOGA — USER DASHBOARD
   ============================================================ */

'use strict';

const KartavyaDashboard = (() => {

  function init() {
    const user = KartavyaData.getCurrentUser();
    if (!user) {
      KartavyaApp.navigateTo('login');
      return;
    }
    renderProfile(user);
    renderBookings();
    renderNotifPrefs();
  }

  function renderProfile(user) {
    const nameEl    = document.getElementById('dash-user-name');
    const emailEl   = document.getElementById('dash-user-email');
    const avatarEl  = document.getElementById('dash-avatar');
    const initial   = user.name ? user.name.charAt(0).toUpperCase() : 'U';

    if (nameEl)   nameEl.textContent  = user.name;
    if (emailEl)  emailEl.textContent = user.email;
    if (avatarEl) avatarEl.textContent = initial;

    // Profile fields
    const fieldsEl = document.getElementById('dash-profile-fields');
    if (fieldsEl) {
      fieldsEl.innerHTML = `
        <div class="profile-field">
          <span class="profile-field-label">Full Name</span>
          <span class="profile-field-value">${user.name}</span>
        </div>
        <div class="profile-field">
          <span class="profile-field-label">Email</span>
          <span class="profile-field-value">${user.email}</span>
        </div>
        <div class="profile-field">
          <span class="profile-field-label">Role</span>
          <span class="profile-field-value"><span class="badge badge-level">${user.role.toUpperCase()}</span></span>
        </div>
        <div class="profile-field">
          <span class="profile-field-label">Member Since</span>
          <span class="profile-field-value">${new Date().toLocaleDateString('en-IN', {month:'long', year:'numeric'})}</span>
        </div>
      `;
    }
  }

  function renderBookings() {
    const container = document.getElementById('dash-bookings-list');
    if (!container) return;

    const bookings = KartavyaData.getMyBookings().filter(b => b.status !== 'cancelled');

    if (!bookings.length) {
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">🧘</div>
          <div class="empty-state-title">No Bookings Yet</div>
          <p class="empty-state-desc">Your upcoming classes will appear here once you book.</p>
          <button class="btn btn-primary btn-sm" onclick="KartavyaApp.navigateTo('classes')">BROWSE CLASSES</button>
        </div>`;
      return;
    }

    container.innerHTML = bookings.map(b => {
      const slot = b.slot;
      const cls  = b.cls;
      if (!slot || !cls) return '';
      const dateObj = slot.dateObj || new Date();
      const dayNum  = dateObj.getDate();
      const month   = dateObj.toLocaleDateString('en-IN', { month: 'short' }).toUpperCase();

      return `
        <div class="booking-item" data-booking="${b.id}">
          <div class="booking-item-date">
            <div class="booking-item-date-day">${dayNum}</div>
            <div class="booking-item-date-month">${month}</div>
          </div>
          <div class="booking-item-info">
            <div class="booking-item-name">${cls.name}</div>
            <div class="booking-item-meta">
              ${slot.startTime} – ${slot.endTime} &nbsp;·&nbsp; ${cls.durationMinutes} min &nbsp;·&nbsp; ${cls.difficulty}
            </div>
            <div style="margin-top:0.3rem">
              <span class="badge badge-${b.status}">${b.status.toUpperCase()}</span>
            </div>
          </div>
          <div class="booking-item-actions">
            <button class="btn btn-danger btn-sm" onclick="KartavyaDashboard.cancelBooking('${b.id}', this)">
              CANCEL
            </button>
          </div>
        </div>`;
    }).join('');

    // Also update stats
    const totalEl = document.getElementById('dash-total-bookings');
    if (totalEl) totalEl.textContent = bookings.length;
  }

  function renderNotifPrefs() {
    const container = document.getElementById('dash-notif-prefs');
    if (!container) return;
    const saved = JSON.parse(sessionStorage.getItem('kv_notif_prefs') || '{}');

    container.innerHTML = `
      <div class="profile-card">
        ${[
          { key: 'email_reminder', label: 'Email reminders (1hr before class)' },
          { key: 'email_confirm',  label: 'Email booking confirmations' },
          { key: 'push_updates',   label: 'Push notifications for schedule changes' },
          { key: 'push_new',       label: 'Notify me of new classes' },
        ].map(p => `
          <div class="profile-field" style="flex-direction:row;align-items:center;justify-content:space-between">
            <span class="profile-field-label" style="font-size:0.78rem">${p.label}</span>
            <label style="cursor:pointer;display:flex;align-items:center;gap:0.4rem">
              <input type="checkbox" ${saved[p.key] !== false ? 'checked' : ''}
                     onchange="KartavyaDashboard.saveNotifPref('${p.key}', this.checked)"
                     style="accent-color:var(--color-primary);width:18px;height:18px">
            </label>
          </div>
        `).join('')}
      </div>
    `;
  }

  return {
    init,
    cancelBooking(bookingId, btn) {
      if (!confirm('Cancel this booking?')) return;
      KartavyaData.cancelBooking(bookingId);
      const item = btn.closest('.booking-item');
      if (item) {
        item.style.opacity = '0.4';
        item.style.transition = 'opacity 0.3s';
        setTimeout(() => { item.remove(); renderBookings(); }, 400);
      }
      KartavyaApp.showToast('Booking cancelled.', 'info');
    },
    saveNotifPref(key, value) {
      const prefs = JSON.parse(sessionStorage.getItem('kv_notif_prefs') || '{}');
      prefs[key] = value;
      sessionStorage.setItem('kv_notif_prefs', JSON.stringify(prefs));
      KartavyaApp.showToast('Preferences saved.', 'success');
    }
  };
})();

window.KartavyaDashboard = KartavyaDashboard;
