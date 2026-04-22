/* ============================================================
   KARTAVYA YOGA — MOCK DATA LAYER
   Replace with Firestore calls in Phase 2
   ============================================================ */

'use strict';

const KartavyaData = (() => {

  // ──────────────────────────────────────────────────────────
  // CLASSES
  // ──────────────────────────────────────────────────────────
  const CLASSES = [
    {
      id: 'cls-001',
      name: 'Vinyasa Flow',
      description: 'Dynamic, breath-synchronised movement. Builds heat, strength and fluid motion. Each pose flows seamlessly into the next like a moving meditation.',
      type: 'Flow',
      difficulty: 'Intermediate',
      durationMinutes: 60,
      instructorName: 'Priya Chaudhary',
      imageUrl: '',
      color: '#C8760A'
    },
    {
      id: 'cls-002',
      name: 'Hatha Yoga',
      description: 'Classical postures held with attention and breath. Ideal for building a solid foundation — alignment, breath, and stillness.',
      type: 'Classical',
      difficulty: 'Beginner',
      durationMinutes: 75,
      instructorName: 'Priya Chaudhary',
      imageUrl: '',
      color: '#3B5C3A'
    },
    {
      id: 'cls-003',
      name: 'Yin Yoga',
      description: 'Long passive holds targeting connective tissue. Deeply meditative, this practice restores the body and quiets the mind.',
      type: 'Restorative',
      difficulty: 'All Levels',
      durationMinutes: 90,
      instructorName: 'Priya Chaudhary',
      imageUrl: '',
      color: '#8B2020'
    },
    {
      id: 'cls-004',
      name: 'Restorative',
      description: 'Supported postures with props. Zero muscular effort—just release. Perfect after stress, illness, or emotional intensity.',
      type: 'Restorative',
      difficulty: 'All Levels',
      durationMinutes: 60,
      instructorName: 'Priya Chaudhary',
      imageUrl: '',
      color: '#C5A945'
    },
    {
      id: 'cls-005',
      name: 'Pranayama',
      description: 'Ancient breathwork practices — Nadi Shodhana, Kapalabhati, Bhramari. Regulate the nervous system and expand life force.',
      type: 'Breathwork',
      difficulty: 'All Levels',
      durationMinutes: 45,
      instructorName: 'Priya Chaudhary',
      imageUrl: '',
      color: '#3B5C3A'
    },
    {
      id: 'cls-006',
      name: 'Morning Meditation',
      description: 'Start the day grounded. Guided sitting practice including body scan, mantra, and open awareness techniques.',
      type: 'Meditation',
      difficulty: 'Beginner',
      durationMinutes: 45,
      instructorName: 'Priya Chaudhary',
      imageUrl: '',
      color: '#C8760A'
    }
  ];

  // ──────────────────────────────────────────────────────────
  // SLOTS — Generate 14 days of slots
  // ──────────────────────────────────────────────────────────
  function generateSlots() {
    const slots = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const schedule = [
      // [classId, day-offset, startHour, startMin, maxCap, bookedCount]
      ['cls-006', 0,  6,  0, 12, 8],
      ['cls-001', 0,  7,  30, 15, 15], // full
      ['cls-002', 0, 18,  0, 15, 10],
      ['cls-006', 1,  7,  0, 12, 4],
      ['cls-005', 1,  8,  0, 10, 7],
      ['cls-001', 1, 19,  0, 15, 5],
      ['cls-003', 2,  6, 30, 12, 12], // full
      ['cls-004', 2, 10,  0, 10, 3],
      ['cls-002', 2, 17, 30, 15, 9],
      ['cls-006', 3,  7,  0, 12, 6],
      ['cls-001', 3,  8,  0, 15, 11],
      ['cls-005', 3, 18, 30, 10, 2],
      ['cls-002', 4,  6,  0, 15, 8],
      ['cls-003', 4, 17,  0, 12, 7],
      ['cls-001', 5,  7, 30, 15, 4],
      ['cls-004', 5, 10,  0, 10, 0],
      ['cls-006', 5, 18,  0, 12, 9],
      ['cls-002', 6,  9,  0, 15, 12],
      ['cls-003', 6, 11,  0, 12, 11],
      ['cls-005', 7,  7,  0, 10, 3],
      ['cls-001', 7, 18,  0, 15, 6],
      ['cls-006', 8,  6, 30, 12, 5],
      ['cls-002', 8, 17, 30, 15, 14],
      ['cls-004', 9,  9,  0, 10, 0],
      ['cls-001', 9, 19,  0, 15, 8],
      ['cls-003', 10, 10, 0, 12, 12], // full
      ['cls-005', 10, 18, 30, 10, 6],
      ['cls-006', 11,  7,  0, 12, 7],
      ['cls-001', 11, 17,  0, 15, 2],
      ['cls-002', 12,  6,  0, 15, 10],
      ['cls-004', 12, 11,  0, 10, 1],
      ['cls-006', 13,  7,  0, 12, 4],
      ['cls-003', 13, 18,  0, 12, 9],
    ];

    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

    schedule.forEach(([classId, dayOffset, h, m, maxCap, booked], idx) => {
      const d = new Date(today);
      d.setDate(d.getDate() + dayOffset);

      const dateStr = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
      const startH = String(h).padStart(2,'0');
      const startM = String(m).padStart(2,'0');
      const cls = CLASSES.find(c => c.id === classId);
      const endDt = new Date(d);
      endDt.setMinutes(endDt.getMinutes() + h*60 + m + cls.durationMinutes);
      const endH = String(endDt.getHours()).padStart(2,'0');
      const endMin = String(endDt.getMinutes()).padStart(2,'0');

      slots.push({
        id: `slot-${String(idx+1).padStart(3,'0')}`,
        classId,
        date: dateStr,
        dateDisplay: `${days[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]}`,
        dateObj: new Date(d),
        startTime: `${startH}:${startM}`,
        endTime: `${endH}:${endMin}`,
        maxCapacity: maxCap,
        bookedCount: booked,
        isActive: true,
        isFull: booked >= maxCap
      });
    });

    return slots.sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return a.startTime.localeCompare(b.startTime);
    });
  }

  const SLOTS = generateSlots();

  // ──────────────────────────────────────────────────────────
  // MOCK BOOKINGS (for logged-in user demo)
  // ──────────────────────────────────────────────────────────
  const MY_BOOKINGS = [
    {
      id: 'bk-001',
      userId: 'demo-user',
      slotId: 'slot-001',
      classId: 'cls-006',
      status: 'confirmed',
      createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
      notes: ''
    },
    {
      id: 'bk-002',
      userId: 'demo-user',
      slotId: 'slot-003',
      classId: 'cls-002',
      status: 'confirmed',
      createdAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
      notes: 'First class!'
    }
  ];

  // ──────────────────────────────────────────────────────────
  // ADMIN STATS (mock analytics)
  // ──────────────────────────────────────────────────────────
  function generateVisitorData() {
    const data = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const label = `${d.getDate()}/${d.getMonth()+1}`;
      const visitors = Math.floor(Math.random() * 80) + 20;
      const pageViews = visitors + Math.floor(Math.random() * 60);
      data.push({ label, date: d, visitors, pageViews });
    }
    return data;
  }

  const VISITOR_DATA = generateVisitorData();

  const TOP_PAGES = [
    { page: '/home',      views: 842 },
    { page: '/classes',   views: 614 },
    { page: '/book',      views: 388 },
    { page: '/about',     views: 201 },
    { page: '/dashboard', views: 156 },
  ];

  const RECENT_VISITORS = [
    { id: 'v001', page: '/classes',   timestamp: new Date(Date.now()-120000).toISOString(), device: 'Mobile', browser: 'Safari', sessionId: 'abc123' },
    { id: 'v002', page: '/home',      timestamp: new Date(Date.now()-240000).toISOString(), device: 'Desktop', browser: 'Chrome', sessionId: 'def456' },
    { id: 'v003', page: '/book',      timestamp: new Date(Date.now()-380000).toISOString(), device: 'Mobile', browser: 'Chrome', sessionId: 'ghi789' },
    { id: 'v004', page: '/classes',   timestamp: new Date(Date.now()-520000).toISOString(), device: 'Desktop', browser: 'Firefox', sessionId: 'jkl012' },
    { id: 'v005', page: '/home',      timestamp: new Date(Date.now()-700000).toISOString(), device: 'Mobile', browser: 'Safari', sessionId: 'mno345' },
    { id: 'v006', page: '/dashboard', timestamp: new Date(Date.now()-900000).toISOString(), device: 'Desktop', browser: 'Chrome', sessionId: 'pqr678' },
    { id: 'v007', page: '/classes',   timestamp: new Date(Date.now()-1100000).toISOString(), device: 'Tablet', browser: 'Safari', sessionId: 'stu901' },
    { id: 'v008', page: '/book',      timestamp: new Date(Date.now()-1400000).toISOString(), device: 'Mobile', browser: 'Chrome', sessionId: 'vwx234' },
  ];

  const ALL_BOOKINGS_ADMIN = [
    { id:'bk-001', userName:'Rahul Sharma',  class:'Morning Meditation', date:'Today', time:'06:00', status:'confirmed' },
    { id:'bk-002', userName:'Anjali Mehta',  class:'Hatha Yoga', date:'Today', time:'18:00', status:'confirmed' },
    { id:'bk-003', userName:'Dev Patel',     class:'Vinyasa Flow', date:'Tomorrow', time:'07:30', status:'pending' },
    { id:'bk-004', userName:'Priti Gupta',   class:'Yin Yoga', date:'Tomorrow', time:'17:00', status:'confirmed' },
    { id:'bk-005', userName:'Arjun Nair',    class:'Pranayama', date:'In 2 days', time:'08:00', status:'cancelled' },
    { id:'bk-006', userName:'Sunita Rao',    class:'Restorative', date:'In 3 days', time:'10:00', status:'confirmed' },
    { id:'bk-007', userName:'Vikram Singh',  class:'Vinyasa Flow', date:'In 4 days', time:'19:00', status:'pending' },
    { id:'bk-008', userName:'Meera Pillai',  class:'Morning Meditation', date:'In 5 days', time:'07:00', status:'confirmed' },
  ];

  const MEETINGS = [
    { id:'m001', name:'Riya Desai', requestedDate:'Tomorrow', requestedTime:'11:00', message:'I want to discuss a private 1-on-1 session for injury recovery.', status:'pending', meetLink:'' },
    { id:'m002', name:'Akash Verma', requestedDate:'In 3 days', requestedTime:'14:00', message:'Interested in corporate group sessions for my team of 20.', status:'confirmed', meetLink:'https://meet.google.com/abc-xyz-123' },
    { id:'m003', name:'Sanya Kapoor', requestedDate:'Last week', requestedTime:'10:00', message:'Wanted to know about prenatal yoga classes.', status:'declined', meetLink:'' },
  ];

  const ADMIN_KPIS = {
    today: 12,
    week: 74,
    month: 298,
    revenue: 44700,
    todayChange: '+3',
    weekChange: '+12%',
    monthChange: '+8%',
    revenueChange: '+15%',
  };

  // ──────────────────────────────────────────────────────────
  // DEMO USER
  // ──────────────────────────────────────────────────────────
  let currentUser = null; // null = logged out
  let isAdmin = false;

  // ──────────────────────────────────────────────────────────
  // PUBLIC API
  // ──────────────────────────────────────────────────────────
  return {
    getClasses: () => [...CLASSES],
    getClass: (id) => CLASSES.find(c => c.id === id) || null,
    getSlots: () => [...SLOTS],
    getSlotsForClass: (classId) => SLOTS.filter(s => s.classId === classId && !s.isFull && s.isActive),
    getAllSlotsForClass: (classId) => SLOTS.filter(s => s.classId === classId && s.isActive),
    getSlot: (id) => SLOTS.find(s => s.id === id) || null,
    getUpcomingSlots: (limit = 3) => SLOTS.filter(s => s.isActive).slice(0, limit),

    getMyBookings: () => MY_BOOKINGS.map(b => ({
      ...b,
      slot: SLOTS.find(s => s.id === b.slotId),
      cls: CLASSES.find(c => c.id === b.classId)
    })),

    cancelBooking: (bookingId) => {
      const bk = MY_BOOKINGS.find(b => b.id === bookingId);
      if (bk) { bk.status = 'cancelled'; }
    },

    addBooking: (slotId, classId, notes = '') => {
      const slot = SLOTS.find(s => s.id === slotId);
      if (slot && !slot.isFull) {
        slot.bookedCount++;
        if (slot.bookedCount >= slot.maxCapacity) slot.isFull = true;
        const newBk = {
          id: `bk-${Date.now()}`,
          userId: 'demo-user',
          slotId,
          classId,
          status: 'confirmed',
          createdAt: new Date().toISOString(),
          notes
        };
        MY_BOOKINGS.unshift(newBk);
        return newBk;
      }
      return null;
    },

    getVisitorData: () => [...VISITOR_DATA],
    getTopPages: () => [...TOP_PAGES],
    getRecentVisitors: () => [...RECENT_VISITORS],
    getAllBookings: () => [...ALL_BOOKINGS_ADMIN],
    getMeetings: () => [...MEETINGS],
    updateMeeting: (id, updates) => {
      const m = MEETINGS.find(m => m.id === id);
      if (m) Object.assign(m, updates);
    },
    getAdminKPIs: () => ({ ...ADMIN_KPIS }),

    // Auth helpers
    getCurrentUser: () => currentUser,
    isAdmin: () => isAdmin,
    login: (name, email, role = 'user') => {
      currentUser = { name, email, role };
      isAdmin = role === 'admin';
    },
    logout: () => { currentUser = null; isAdmin = false; },

    // Slot management (admin)
    toggleSlotActive: (slotId) => {
      const s = SLOTS.find(s => s.id === slotId);
      if (s) s.isActive = !s.isActive;
    }
  };
})();

window.KartavyaData = KartavyaData;
