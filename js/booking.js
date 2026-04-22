/* ============================================================
   KARTAVYA YOGA — BOOKING FLOW (3-Step)
   ============================================================ */

'use strict';

const KartavyaBooking = (() => {

  let step = 1;
  let selectedSlotId  = null;
  let selectedClassId = null;
  let userDetails     = {};

  function init() {
    // Check if pre-selected from "Book Now"
    const preSlot  = sessionStorage.getItem('kv_book_slot');
    const preCls   = sessionStorage.getItem('kv_book_class');
    if (preSlot && preCls) {
      selectedSlotId  = preSlot;
      selectedClassId = preCls;
      sessionStorage.removeItem('kv_book_slot');
      sessionStorage.removeItem('kv_book_class');
      goToStep(2); // skip straight to details
    } else {
      goToStep(1);
    }
  }

  // ──────────────────────────────────────────────────────────
  // STEP ROUTING
  // ──────────────────────────────────────────────────────────
  function goToStep(n) {
    step = n;
    document.querySelectorAll('.booking-step-panel').forEach((el, i) => {
      el.classList.toggle('hidden', i + 1 !== n);
    });
    updateStepIndicators();

    switch (n) {
      case 1: renderStep1(); break;
      case 2: renderStep2(); break;
      case 3: renderStep3(); break;
    }
  }

  function updateStepIndicators() {
    document.querySelectorAll('.booking-step-indicator').forEach((el, i) => {
      const s = i + 1;
      el.classList.remove('active', 'done');
      if (s < step)      el.classList.add('done');
      else if (s === step) el.classList.add('active');
    });
    document.querySelectorAll('.booking-step-connector').forEach((el, i) => {
      el.classList.toggle('done', i + 1 < step);
    });
  }

  // ──────────────────────────────────────────────────────────
  // STEP 1 — Pick Class & Time Slot
  // ──────────────────────────────────────────────────────────
  function renderStep1() {
    const container = document.getElementById('booking-step1-content');
    if (!container) return;

    const classes = KartavyaData.getClasses();
    const classSelector = `
      <div class="form-group">
        <label class="form-label" for="book-class-select">Choose a Class</label>
        <select class="form-select" id="book-class-select" onchange="KartavyaBooking.onClassChange(this.value)">
          <option value="">— Select a class —</option>
          ${classes.map(c => `<option value="${c.id}" ${c.id === selectedClassId ? 'selected' : ''}>${c.name} (${c.durationMinutes} min)</option>`).join('')}
        </select>
      </div>
    `;

    container.innerHTML = classSelector + `<div id="slot-calendar-wrapper"></div>`;

    if (selectedClassId) renderSlotCalendar(selectedClassId);
  }

  function renderSlotCalendar(classId) {
    const wrapper = document.getElementById('slot-calendar-wrapper');
    if (!wrapper) return;

    const slots = KartavyaData.getAllSlotsForClass(classId);
    if (!slots.length) {
      wrapper.innerHTML = `<div class="empty-state"><div class="empty-state-icon">📅</div><p class="empty-state-desc">No available slots for this class in the next 14 days.</p></div>`;
      return;
    }

    // Group by date
    const grouped = {};
    slots.forEach(s => {
      if (!grouped[s.date]) grouped[s.date] = [];
      grouped[s.date].push(s);
    });

    wrapper.innerHTML = `
      <div class="slot-calendar">
        <p class="tech-text" style="margin-bottom:0.75rem">— Select a time slot —</p>
        ${Object.entries(grouped).map(([date, daySlots]) => `
          <div class="slot-date-group">
            <div class="slot-date-label">${daySlots[0].dateDisplay}</div>
            <div class="slot-chips">
              ${daySlots.map(slot => {
                const avail = slot.maxCapacity - slot.bookedCount;
                const isSelected = slot.id === selectedSlotId;
                return `
                  <div class="slot-chip ${slot.isFull ? 'slot-full' : ''} ${isSelected ? 'selected' : ''}"
                       data-slot="${slot.id}"
                       onclick="KartavyaBooking.selectSlot('${slot.id}', this)">
                    <span class="slot-chip-time">${slot.startTime}</span>
                    <span class="slot-chip-avail">${slot.isFull ? 'FULL' : avail + ' left'}</span>
                  </div>`;
              }).join('')}
            </div>
          </div>
        `).join('')}
      </div>
      <div style="margin-top:var(--space-lg);display:flex;justify-content:flex-end">
        <button class="btn btn-primary glitch-btn" onclick="KartavyaBooking.continueToStep2()" id="step1-continue" ${selectedSlotId ? '' : 'disabled'} style="${selectedSlotId ? '' : 'opacity:0.5;cursor:not-allowed'}">
          NEXT: YOUR DETAILS →
        </button>
      </div>
    `;
  }

  // ──────────────────────────────────────────────────────────
  // STEP 2 — User Details
  // ──────────────────────────────────────────────────────────
  function renderStep2() {
    const container = document.getElementById('booking-step2-content');
    if (!container) return;

    const user = KartavyaData.getCurrentUser();
    const slot = selectedSlotId ? KartavyaData.getSlot(selectedSlotId) : null;
    const cls  = selectedClassId ? KartavyaData.getClass(selectedClassId) : null;

    // Summary bar
    const summaryBar = slot && cls ? `
      <div style="background:var(--color-surface);border-left:3px solid var(--color-primary);padding:0.75rem var(--space-md);margin-bottom:var(--space-lg);display:flex;flex-wrap:wrap;gap:var(--space-md);align-items:center">
        <div><span class="tech-text">Class</span><br><strong class="font-display" style="font-size:1rem;text-transform:uppercase">${cls.name}</strong></div>
        <div><span class="tech-text">When</span><br><strong>${slot.dateDisplay} · ${slot.startTime}</strong></div>
        <div><span class="tech-text">Duration</span><br><strong>${cls.durationMinutes} min</strong></div>
        <button class="btn btn-ghost btn-sm" onclick="KartavyaBooking.goToStep(1)" style="margin-left:auto">← CHANGE</button>
      </div>
    ` : '';

    container.innerHTML = `
      ${summaryBar}
      <form id="booking-details-form" onsubmit="KartavyaBooking.submitStep2(event)">
        <div class="form-row">
          <div class="form-group">
            <label class="form-label" for="bd-name">Full Name *</label>
            <input class="form-input" type="text" id="bd-name" required placeholder="Your name"
                   value="${user ? user.name : userDetails.name || ''}" autocomplete="name">
            <span class="form-error" id="err-name"></span>
          </div>
          <div class="form-group">
            <label class="form-label" for="bd-email">Email *</label>
            <input class="form-input" type="email" id="bd-email" required placeholder="you@email.com"
                   value="${user ? user.email : userDetails.email || ''}" autocomplete="email">
            <span class="form-error" id="err-email"></span>
          </div>
        </div>
        <div class="form-group">
          <label class="form-label" for="bd-phone">Phone Number</label>
          <input class="form-input" type="tel" id="bd-phone" placeholder="+91 98765 43210"
                 value="${userDetails.phone || ''}" autocomplete="tel">
        </div>
        <div class="form-group">
          <label class="form-label" for="bd-notes">Message / Special Notes</label>
          <textarea class="form-textarea" id="bd-notes" placeholder="Any injuries, questions, or how you heard about us...">${userDetails.notes || ''}</textarea>
        </div>
        ${!user ? `
          <div style="margin-bottom:var(--space-md);padding:0.75rem;background:var(--color-primary-highlight);border-left:3px solid var(--color-primary);font-size:0.82rem">
            <strong>Tip:</strong> <a href="#login" onclick="event.preventDefault();sessionStorage.setItem('kv_redirect','book');KartavyaApp.navigateTo('login')" style="color:var(--color-primary);text-decoration:underline">Log in</a> to save your details and track bookings.
          </div>
        ` : ''}
        <div style="display:flex;gap:var(--space-md);justify-content:space-between;margin-top:var(--space-md)">
          <button type="button" class="btn btn-outline" onclick="KartavyaBooking.goToStep(1)">← BACK</button>
          <button type="submit" class="btn btn-primary glitch-btn">REVIEW BOOKING →</button>
        </div>
      </form>
    `;
  }

  // ──────────────────────────────────────────────────────────
  // STEP 3 — Confirmation Summary
  // ──────────────────────────────────────────────────────────
  function renderStep3() {
    const container = document.getElementById('booking-step3-content');
    if (!container) return;

    const slot = KartavyaData.getSlot(selectedSlotId);
    const cls  = KartavyaData.getClass(selectedClassId);
    if (!slot || !cls) { goToStep(1); return; }

    container.innerHTML = `
      <p class="tech-text" style="margin-bottom:var(--space-md)">— Review your booking —</p>
      <div class="booking-confirm-card">
        <div class="booking-confirm-row">
          <span class="booking-confirm-label">Class</span>
          <span class="booking-confirm-value font-display" style="font-size:1.1rem;text-transform:uppercase">${cls.name}</span>
        </div>
        <div class="booking-confirm-row">
          <span class="booking-confirm-label">Date & Time</span>
          <span class="booking-confirm-value">${slot.dateDisplay} · ${slot.startTime} – ${slot.endTime}</span>
        </div>
        <div class="booking-confirm-row">
          <span class="booking-confirm-label">Duration</span>
          <span class="booking-confirm-value">${cls.durationMinutes} minutes</span>
        </div>
        <div class="booking-confirm-row">
          <span class="booking-confirm-label">Instructor</span>
          <span class="booking-confirm-value">${cls.instructorName}</span>
        </div>
        <div class="booking-confirm-row">
          <span class="booking-confirm-label">Your Name</span>
          <span class="booking-confirm-value">${userDetails.name}</span>
        </div>
        <div class="booking-confirm-row">
          <span class="booking-confirm-label">Email</span>
          <span class="booking-confirm-value">${userDetails.email}</span>
        </div>
        ${userDetails.phone ? `<div class="booking-confirm-row"><span class="booking-confirm-label">Phone</span><span class="booking-confirm-value">${userDetails.phone}</span></div>` : ''}
        ${userDetails.notes ? `<div class="booking-confirm-row"><span class="booking-confirm-label">Notes</span><span class="booking-confirm-value" style="text-align:right;font-style:italic;font-size:0.82rem">${userDetails.notes}</span></div>` : ''}
      </div>
      <div style="display:flex;gap:var(--space-md);justify-content:space-between;margin-top:var(--space-lg)">
        <button class="btn btn-outline" onclick="KartavyaBooking.goToStep(2)">← EDIT</button>
        <button class="btn btn-primary glitch-btn btn-lg" onclick="KartavyaBooking.confirmBooking()">✓ CONFIRM BOOKING</button>
      </div>
    `;
  }

  // ──────────────────────────────────────────────────────────
  // SUCCESS STATE
  // ──────────────────────────────────────────────────────────
  function showSuccess(booking) {
    const container = document.getElementById('booking-panels-wrapper');
    if (!container) return;
    const slot = KartavyaData.getSlot(booking.slotId);
    const cls  = KartavyaData.getClass(booking.classId);

    container.innerHTML = `
      <div class="booking-success">
        <div class="booking-success-icon">🌸</div>
        <div class="booking-success-title ink-bleed">Booking Confirmed!</div>
        <p style="font-size:0.88rem;color:var(--color-text-muted);max-width:400px;text-align:center">
          You're booked into <strong>${cls ? cls.name : 'your class'}</strong>
          ${slot ? `on <strong>${slot.dateDisplay}</strong> at <strong>${slot.startTime}</strong>` : ''}.
          A confirmation has been sent to <strong>${userDetails.email}</strong>.
        </p>
        <div style="display:flex;gap:var(--space-md);flex-wrap:wrap;justify-content:center;margin-top:var(--space-md)">
          <button class="btn btn-primary glitch-btn" onclick="KartavyaApp.navigateTo('dashboard')">MY BOOKINGS</button>
          <button class="btn btn-outline" onclick="KartavyaApp.navigateTo('classes')">BROWSE CLASSES</button>
        </div>
      </div>
    `;

    // Reset step indicators
    document.querySelectorAll('.booking-step-indicator').forEach(el => el.classList.add('done'));
    document.querySelector('.booking-steps') && (document.querySelector('.booking-steps').style.opacity = '0.5');
  }

  // ──────────────────────────────────────────────────────────
  // ACTIONS
  // ──────────────────────────────────────────────────────────
  return {
    init,
    goToStep,
    onClassChange(classId) {
      selectedClassId = classId;
      selectedSlotId  = null;
      renderSlotCalendar(classId);
    },
    selectSlot(slotId, el) {
      const slot = KartavyaData.getSlot(slotId);
      if (slot && slot.isFull) return;
      selectedSlotId = slotId;
      document.querySelectorAll('.slot-chip').forEach(c => c.classList.remove('selected'));
      el.classList.add('selected');
      const btn = document.getElementById('step1-continue');
      if (btn) { btn.disabled = false; btn.style.opacity = '1'; btn.style.cursor = 'pointer'; }
    },
    continueToStep2() {
      if (!selectedSlotId || !selectedClassId) {
        KartavyaApp.showToast('Please select a class and time slot.', 'error');
        return;
      }
      goToStep(2);
    },
    submitStep2(e) {
      e.preventDefault();
      const name  = document.getElementById('bd-name')?.value.trim();
      const email = document.getElementById('bd-email')?.value.trim();
      const phone = document.getElementById('bd-phone')?.value.trim();
      const notes = document.getElementById('bd-notes')?.value.trim();

      let valid = true;
      if (!name) { const el = document.getElementById('err-name'); if(el) el.textContent='Name is required.'; valid = false; }
      else { const el = document.getElementById('err-name'); if(el) el.textContent=''; }

      if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        const el = document.getElementById('err-email');
        if(el) el.textContent = 'Valid email is required.';
        valid = false;
      } else { const el = document.getElementById('err-email'); if(el) el.textContent=''; }

      if (!valid) return;
      userDetails = { name, email, phone, notes };
      goToStep(3);
    },
    confirmBooking() {
      if (!selectedSlotId || !selectedClassId) { KartavyaApp.showToast('Something went wrong.', 'error'); return; }
      const booking = KartavyaData.addBooking(selectedSlotId, selectedClassId, userDetails.notes || '');
      if (!booking) { KartavyaApp.showToast('This slot just became full. Please choose another.', 'error'); goToStep(1); return; }
      KartavyaApp.showToast('Booking confirmed!', 'success');
      showSuccess(booking);
      // Reset state
      selectedSlotId = null; selectedClassId = null; userDetails = {};
    }
  };
})();

window.KartavyaBooking = KartavyaBooking;
