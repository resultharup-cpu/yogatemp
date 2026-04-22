/* ============================================================
   KARTAVYA YOGA — CLASSES PAGE
   ============================================================ */

'use strict';

const KartavyaClasses = (() => {

  let allSlots   = [];
  let allClasses = [];
  let filters    = { day: 'all', type: 'all', difficulty: 'all' };

  function init() {
    allSlots   = KartavyaData.getSlots();
    allClasses = KartavyaData.getClasses();
    renderSkeletons();
    setTimeout(() => { renderFilters(); renderClasses(); }, 300);
  }

  function renderSkeletons() {
    const grid = document.getElementById('classes-grid');
    if (!grid) return;
    grid.innerHTML = Array(6).fill(0).map(() => `
      <div class="class-card-skeleton">
        <div class="skeleton sk-header"></div>
        <div class="sk-body">
          <div class="skeleton sk-title"></div>
          <div class="skeleton sk-line"></div>
          <div class="skeleton sk-line short"></div>
        </div>
        <div class="skeleton sk-footer"></div>
      </div>
    `).join('');
  }

  function getFilteredSlots() {
    const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    return allSlots.filter(slot => {
      if (!slot.isActive) return false;
      const cls = allClasses.find(c => c.id === slot.classId);
      if (!cls) return false;
      if (filters.day !== 'all') {
        const slotDay = days[slot.dateObj.getDay()];
        if (slotDay !== filters.day) return false;
      }
      if (filters.type !== 'all' && cls.type !== filters.type) return false;
      if (filters.difficulty !== 'all' && cls.difficulty !== filters.difficulty) return false;
      return true;
    });
  }

  function renderClasses() {
    const grid = document.getElementById('classes-grid');
    if (!grid) return;
    const filtered = getFilteredSlots();

    if (!filtered.length) {
      grid.innerHTML = `
        <div class="empty-state" style="grid-column:1/-1">
          <div class="empty-state-icon">🌿</div>
          <div class="empty-state-title">No Classes Found</div>
          <p class="empty-state-desc">Try adjusting your filters or check back for new slots.</p>
          <button class="btn btn-outline btn-sm" onclick="KartavyaClasses.clearFilters()">CLEAR FILTERS</button>
        </div>`;
      return;
    }

    grid.innerHTML = filtered.map(slot => renderClassCard(slot)).join('');
  }

  function renderClassCard(slot) {
    const cls = allClasses.find(c => c.id === slot.classId);
    if (!cls) return '';
    const avail = slot.maxCapacity - slot.bookedCount;
    const isFull = slot.isFull;
    const pct = Math.round((slot.bookedCount / slot.maxCapacity) * 100);

    return `
    <article class="class-card ${isFull ? 'is-full' : ''} section-reveal" data-slot="${slot.id}" data-class="${cls.id}">
      <div class="class-card-header">
        <span class="class-card-type">${cls.type}</span>
        <span class="class-card-duration">${cls.durationMinutes} MIN</span>
      </div>
      <div class="class-card-body">
        <h3 class="class-card-name ink-bleed">${cls.name}</h3>
        <div class="class-card-meta">
          <div class="class-card-meta-item">
            <span class="class-card-meta-label">Date</span>
            <span class="class-card-meta-value">${slot.dateDisplay}</span>
          </div>
          <div class="class-card-meta-item">
            <span class="class-card-meta-label">Time</span>
            <span class="class-card-meta-value">${slot.startTime} – ${slot.endTime}</span>
          </div>
          <div class="class-card-meta-item">
            <span class="class-card-meta-label">Level</span>
            <span class="class-card-meta-value"><span class="badge badge-level">${cls.difficulty}</span></span>
          </div>
          <div class="class-card-meta-item">
            <span class="class-card-meta-label">Instructor</span>
            <span class="class-card-meta-value">${cls.instructorName.split(' ')[0]}</span>
          </div>
        </div>
        <p class="class-card-desc">${cls.description}</p>
        <div style="margin-top:0.6rem">
          <div style="display:flex;justify-content:space-between;font-size:0.62rem;text-transform:uppercase;letter-spacing:0.08em;color:var(--color-text-muted);margin-bottom:4px">
            <span>Capacity</span><span>${slot.bookedCount}/${slot.maxCapacity}</span>
          </div>
          <div style="height:4px;background:var(--color-primary-highlight);position:relative">
            <div style="height:100%;width:${pct}%;background:${isFull ? 'var(--color-accent-red)' : 'var(--color-secondary)'};transition:width 0.3s"></div>
          </div>
        </div>
      </div>
      <div class="class-card-footer">
        <div class="class-card-slots ${isFull ? 'text-red' : ''}">
          <span class="slot-dot${isFull ? '' : ' pulse-dot'}"></span>
          ${isFull ? 'CLASS FULL' : avail + ' slot' + (avail !== 1 ? 's' : '') + ' remaining'}
        </div>
        ${isFull
          ? '<span class="badge badge-full">FULL</span>'
          : `<button class="btn btn-primary btn-sm glitch-btn" onclick="KartavyaApp.bookClass('${slot.id}','${cls.id}')">BOOK NOW</button>`
        }
      </div>
    </article>`;
  }

  function renderFilters() {
    renderFilterGroup('filter-day', 'day',
      ['all','Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
      ['All Days','Mon','Tue','Wed','Thu','Fri','Sat','Sun']
    );
    const types = ['all', ...new Set(allClasses.map(c => c.type))];
    const typeLabels = ['All Types', ...new Set(allClasses.map(c => c.type))];
    renderFilterGroup('filter-type', 'type', types, typeLabels);
    renderFilterGroup('filter-difficulty', 'difficulty',
      ['all','Beginner','Intermediate','All Levels'],
      ['All Levels','Beginner','Intermediate','All Levels']
    );
  }

  function renderFilterGroup(containerId, filterKey, values, labels) {
    const container = document.getElementById(containerId);
    if (!container) return;
    container.innerHTML = values.map((val, i) => `
      <button class="filter-chip ${filters[filterKey] === val ? 'active' : ''}"
              data-filter="${filterKey}" data-value="${val}"
              onclick="KartavyaClasses.setFilter('${filterKey}','${val}',this)">
        ${labels[i]}
      </button>
    `).join('');
  }

  return {
    init,
    setFilter(key, value, btn) {
      filters[key] = value;
      // Update chip active states
      const group = btn.closest('.filter-chips');
      if (group) group.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
      btn.classList.add('active');
      renderClasses();
    },
    clearFilters() {
      filters = { day: 'all', type: 'all', difficulty: 'all' };
      renderFilters();
      renderClasses();
    }
  };
})();

window.KartavyaClasses = KartavyaClasses;
