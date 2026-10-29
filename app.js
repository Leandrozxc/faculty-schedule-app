/**
 * Main Application Controller for Faculty Schedule & Room Occupancy Portal
 * Swiss Grid & High-Precision Academic Timetable Architecture
 */

// Curated distinct, accessible, color-vision-deficiency-aware color tokens for instructors
// Used strictly as left-border structural indicators and 7px identification markers on neutral surfaces
const INSTRUCTOR_COLOR_PALETTES = [
  { name: 'blue',    bg: '#f8fafc', border: '#cbd5e1', text: '#1e3a8a', ring: '#2563eb', badgeBg: '#eff6ff', badgeText: '#1d4ed8' },
  { name: 'teal',    bg: '#f8fafc', border: '#cbd5e1', text: '#134e4a', ring: '#0d9488', badgeBg: '#f0fdfa', badgeText: '#0f766e' },
  { name: 'amber',   bg: '#f8fafc', border: '#cbd5e1', text: '#78350f', ring: '#d97706', badgeBg: '#fffbeb', badgeText: '#b45309' },
  { name: 'violet',  bg: '#f8fafc', border: '#cbd5e1', text: '#4c1d95', ring: '#7c3aed', badgeBg: '#f5f3ff', badgeText: '#6d28d9' },
  { name: 'rose',    bg: '#f8fafc', border: '#cbd5e1', text: '#881337', ring: '#e11d48', badgeBg: '#fff1f2', badgeText: '#be123c' },
  { name: 'cyan',    bg: '#f8fafc', border: '#cbd5e1', text: '#164e63', ring: '#0891b2', badgeBg: '#ecfeff', badgeText: '#0e7490' },
  { name: 'emerald', bg: '#f8fafc', border: '#cbd5e1', text: '#064e3b', ring: '#059669', badgeBg: '#ecfdf5', badgeText: '#047857' },
  { name: 'orange',  bg: '#f8fafc', border: '#cbd5e1', text: '#7c2d12', ring: '#ea580c', badgeBg: '#fff7ed', badgeText: '#c2410c' },
  { name: 'indigo',  bg: '#f8fafc', border: '#cbd5e1', text: '#312e81', ring: '#4f46e5', badgeBg: '#eef2ff', badgeText: '#4338ca' },
  { name: 'pink',    bg: '#f8fafc', border: '#cbd5e1', text: '#831843', ring: '#db2777', badgeBg: '#fdf2f8', badgeText: '#be185d' },
  { name: 'sky',     bg: '#f8fafc', border: '#cbd5e1', text: '#0c4a6e', ring: '#0284c7', badgeBg: '#f0f9ff', badgeText: '#0369a1' },
  { name: 'lime',    bg: '#f8fafc', border: '#cbd5e1', text: '#365314', ring: '#65a30d', badgeBg: '#f7fee7', badgeText: '#4d7c0f' },
  { name: 'purple',  bg: '#f8fafc', border: '#cbd5e1', text: '#581c87', ring: '#9333ea', badgeBg: '#faf5ff', badgeText: '#7e22ce' },
  { name: 'red',     bg: '#f8fafc', border: '#cbd5e1', text: '#7f1d1d', ring: '#dc2626', badgeBg: '#fef2f2', badgeText: '#b91c1c' },
  { name: 'slate',   bg: '#f8fafc', border: '#cbd5e1', text: '#1e293b', ring: '#475569', badgeBg: '#f1f5f9', badgeText: '#334155' },
  { name: 'green',   bg: '#f8fafc', border: '#cbd5e1', text: '#14532d', ring: '#16a34a', badgeBg: '#f0fdf4', badgeText: '#15803d' },
  { name: 'fuchsia', bg: '#f8fafc', border: '#cbd5e1', text: '#701a75', ring: '#c026d3', badgeBg: '#fdf4ff', badgeText: '#a21caf' },
  { name: 'yellow',  bg: '#f8fafc', border: '#cbd5e1', text: '#713f12', ring: '#ca8a04', badgeBg: '#fefce8', badgeText: '#a16207' },
];

// Explicit 9-Period Academic Time Definitions (differentiating Morning P1 07:30-09:00 AM from Evening P9 07:30-09:00 PM)
const PERIOD_DEFINITIONS = [
  { index: 0, code: 'P1', rawSlot: '07:30 - 09:00', start: '07:30 AM', end: '09:00 AM', startMin: 450,  endMin: 540,  label: '07:30 – 09:00 AM', shortLabel: '07:30–09:00 AM', shift: 'MORNING BLOCK' },
  { index: 1, code: 'P2', rawSlot: '09:00 - 10:30', start: '09:00 AM', end: '10:30 AM', startMin: 540,  endMin: 630,  label: '09:00 – 10:30 AM', shortLabel: '09:00–10:30 AM', shift: 'MORNING BLOCK' },
  { index: 2, code: 'P3', rawSlot: '10:30 - 12:00', start: '10:30 AM', end: '12:00 PM', startMin: 630,  endMin: 720,  label: '10:30 AM – 12:00 PM', shortLabel: '10:30–12:00 PM', shift: 'MORNING BLOCK' },
  { index: 3, code: 'P4', rawSlot: '12:00 - 01:30', start: '12:00 PM', end: '01:30 PM', startMin: 720,  endMin: 810,  label: '12:00 – 01:30 PM', shortLabel: '12:00–01:30 PM', shift: 'MIDDAY BLOCK' },
  { index: 4, code: 'P5', rawSlot: '01:30 - 03:00', start: '01:30 PM', end: '03:00 PM', startMin: 810,  endMin: 900,  label: '01:30 – 03:00 PM', shortLabel: '01:30–03:00 PM', shift: 'AFTERNOON BLOCK' },
  { index: 5, code: 'P6', rawSlot: '03:00 - 04:30', start: '03:00 PM', end: '04:30 PM', startMin: 900,  endMin: 990,  label: '03:00 – 04:30 PM', shortLabel: '03:00–04:30 PM', shift: 'AFTERNOON BLOCK' },
  { index: 6, code: 'P7', rawSlot: '04:30 - 06:00', start: '04:30 PM', end: '06:00 PM', startMin: 990,  endMin: 1080, label: '04:30 – 06:00 PM', shortLabel: '04:30–06:00 PM', shift: 'LATE AFTERNOON' },
  { index: 7, code: 'P8', rawSlot: '06:00 - 07:30', start: '06:00 PM', end: '07:30 PM', startMin: 1080, endMin: 1170, label: '06:00 – 07:30 PM', shortLabel: '06:00–07:30 PM', shift: 'EVENING BLOCK' },
  { index: 8, code: 'P9', rawSlot: '07:30 - 09:00', start: '07:30 PM', end: '09:00 PM', startMin: 1170, endMin: 1260, label: '07:30 – 09:00 PM', shortLabel: '07:30–09:00 PM', shift: 'EVENING BLOCK' }
];

const DAY_SHORT_LABELS = {
  MONDAY: 'Mon',
  TUESDAY: 'Tue',
  WEDNESDAY: 'Wed',
  THURSDAY: 'Thu',
  FRIDAY: 'Fri',
  SATURDAY: 'Sat',
  SUNDAY: 'Sun'
};

const DAY_TITLE_LABELS = {
  MONDAY: 'Monday',
  TUESDAY: 'Tuesday',
  WEDNESDAY: 'Wednesday',
  THURSDAY: 'Thursday',
  FRIDAY: 'Friday',
  SATURDAY: 'Saturday',
  SUNDAY: 'Sunday'
};

/**
 * Annotate sessions with their exact period index (0..8) so that
 * Morning "07:30 - 09:00" (P1: 07:30-09:00 AM) and Evening "07:30 - 09:00" (P9: 07:30-09:00 PM)
 * are accurately differentiated based on each instructor's chronological sheet order.
 */
function annotateSessionPeriods(data) {
  if (!data) return;

  const slotToIndexMap = {
    '09:00 - 10:30': 1,
    '10:30 - 12:00': 2,
    '12:00 - 01:30': 3,
    '01:30 - 03:00': 4,
    '03:00 - 04:30': 5,
    '04:30 - 06:00': 6,
    '06:00 - 07:30': 7
  };

  // Track assigned period indices per instructor session signature
  const signatureQueues = new Map();

  if (Array.isArray(data.instructors)) {
    data.instructors.forEach(inst => {
      let seenAfterMorning = false;
      (inst.sessions || []).forEach(s => {
        let pIdx = 0;
        if (s.timeSlot === '07:30 - 09:00') {
          pIdx = seenAfterMorning ? 8 : 0;
        } else if (slotToIndexMap[s.timeSlot] !== undefined) {
          pIdx = slotToIndexMap[s.timeSlot];
          seenAfterMorning = true;
        }
        s._periodIdx = pIdx;
        s._periodLabel = PERIOD_DEFINITIONS[pIdx].shortLabel;
        s._periodCode = PERIOD_DEFINITIONS[pIdx].code;

        const sig = `${inst.name}|${s.day}|${s.timeSlot}|${s.subject}|${s.section}|${s.room}`;
        if (!signatureQueues.has(sig)) {
          signatureQueues.set(sig, []);
        }
        signatureQueues.get(sig).push(pIdx);
      });
    });
  }

  if (Array.isArray(data.sessions)) {
    data.sessions.forEach(s => {
      const sig = `${s.instructor}|${s.day}|${s.timeSlot}|${s.subject}|${s.section}|${s.room}`;
      const queue = signatureQueues.get(sig);
      let pIdx = 0;
      if (queue && queue.length > 0) {
        pIdx = queue.shift();
      } else if (slotToIndexMap[s.timeSlot] !== undefined) {
        pIdx = slotToIndexMap[s.timeSlot];
      }
      s._periodIdx = pIdx;
      s._periodLabel = PERIOD_DEFINITIONS[pIdx].shortLabel;
      s._periodCode = PERIOD_DEFINITIONS[pIdx].code;
    });
  }
}

function getSessionPeriodIndex(session) {
  if (typeof session._periodIdx === 'number') return session._periodIdx;
  const idx = PERIOD_DEFINITIONS.findIndex(p => p.rawSlot === session.timeSlot);
  return idx !== -1 ? idx : 0;
}

function getInstructorColor(name) {
  if (!name) return INSTRUCTOR_COLOR_PALETTES[0];
  if (state.data && state.data.instructors) {
    const idx = state.data.instructors.findIndex(i => i.name === name);
    if (idx !== -1) {
      return INSTRUCTOR_COLOR_PALETTES[idx % INSTRUCTOR_COLOR_PALETTES.length];
    }
  }
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return INSTRUCTOR_COLOR_PALETTES[Math.abs(hash) % INSTRUCTOR_COLOR_PALETTES.length];
}

// Application State
const state = {
  data: null,
  activeTab: 'instructor', // 'instructor' (default student-first view), 'master', 'rooms', 'roster'
  selectedRoom: '',
  selectedInstructor: '',
  roomSearchQuery: '',
  instructorDayFilter: 'ALL',
  roomDayFilter: 'ALL',
  legendCollapsed: true,
  masterFilter: {
    day: 'ALL',
    timePeriod: 'ALL', // 'ALL' or '0'..'8'
    room: 'ALL',
    instructor: 'ALL',
    search: '',
    viewMode: 'grid' // 'grid' or 'table'
  },
  liveAvailability: {
    isOpen: false,
    statusFilter: 'ONGOING', // 'ONGOING' (default: only classes matching current day & time), 'UPCOMING', 'ENDED', 'ALL_TODAY'
    includeDuty: false,      // false = academic classes only, true = include office/consultation duty
    lastDateKey: '',
    lastPeriodKey: ''
  }
};

// Initialize app on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  initIcons();
  loadInitialData();
  setupEventListeners();
  initLiveClock();
});

function initIcons() {
  if (window.lucide) {
    window.lucide.createIcons();
  }
}

// Load cached data or fall back to preloaded sample
function loadInitialData() {
  const cached = localStorage.getItem('cea_schedule_data');
  if (cached) {
    try {
      state.data = JSON.parse(cached);
      showNotification('Loaded saved schedule from local storage', 'info');
    } catch (e) {
      console.warn('Failed to parse cached schedule, falling back to sample data', e);
      state.data = window.SAMPLE_SCHEDULE_DATA;
    }
  } else if (window.SAMPLE_SCHEDULE_DATA) {
    state.data = window.SAMPLE_SCHEDULE_DATA;
  }

  if (state.data) {
    annotateSessionPeriods(state.data);
    setupDefaults();
    renderAll();
  }
}

function setupDefaults() {
  if (state.data.rooms && state.data.rooms.length > 0) {
    state.selectedRoom = state.data.rooms[0];
  }
  if (state.data.instructors && state.data.instructors.length > 0) {
    state.selectedInstructor = state.data.instructors[0].name;
  }
}

function setMasterViewModeUI(mode) {
  const toggleGrid = document.getElementById('toggle-view-grid');
  const toggleTable = document.getElementById('toggle-view-table');
  if (!toggleGrid || !toggleTable) return;

  const activeClasses = ['bg-white', 'text-slate-900', 'shadow-2xs'];
  const inactiveClasses = ['text-slate-600', 'hover:text-slate-900'];

  if (mode === 'grid') {
    toggleGrid.classList.add(...activeClasses);
    toggleGrid.classList.remove(...inactiveClasses);
    toggleGrid.setAttribute('aria-pressed', 'true');

    toggleTable.classList.remove(...activeClasses);
    toggleTable.classList.add(...inactiveClasses);
    toggleTable.setAttribute('aria-pressed', 'false');
  } else {
    toggleTable.classList.add(...activeClasses);
    toggleTable.classList.remove(...inactiveClasses);
    toggleTable.setAttribute('aria-pressed', 'true');

    toggleGrid.classList.remove(...activeClasses);
    toggleGrid.classList.add(...inactiveClasses);
    toggleGrid.setAttribute('aria-pressed', 'false');
  }
}

function updateMasterFilterToolbarState() {
  const { day, timePeriod, room, instructor, search } = state.masterFilter;
  const clearSearchBtn = document.getElementById('master-search-clear');
  const resetFiltersBtn = document.getElementById('master-reset-filters');
  const masterDay = document.getElementById('filter-master-day');
  const masterTime = document.getElementById('filter-master-time');
  const masterRoom = document.getElementById('filter-master-room');
  const masterInst = document.getElementById('filter-master-instructor');

  if (clearSearchBtn) {
    if (search && search.length > 0) {
      clearSearchBtn.classList.remove('hidden');
    } else {
      clearSearchBtn.classList.add('hidden');
    }
  }

  const hasActiveFilter =
    day !== 'ALL' ||
    timePeriod !== 'ALL' ||
    room !== 'ALL' ||
    instructor !== 'ALL' ||
    (search && search.length > 0);

  if (resetFiltersBtn) {
    if (hasActiveFilter) {
      resetFiltersBtn.classList.remove('hidden');
      resetFiltersBtn.classList.add('inline-flex');
    } else {
      resetFiltersBtn.classList.add('hidden');
      resetFiltersBtn.classList.remove('inline-flex');
    }
  }

  // Highlight active filter dropdowns
  [
    { el: masterDay, active: day !== 'ALL' },
    { el: masterTime, active: timePeriod !== 'ALL' },
    { el: masterRoom, active: room !== 'ALL' },
    { el: masterInst, active: instructor !== 'ALL' }
  ].forEach(({ el, active }) => {
    if (!el) return;
    if (active) {
      el.classList.add('text-blue-700', 'font-bold');
      el.classList.remove('text-slate-800', 'font-semibold');
    } else {
      el.classList.remove('text-blue-700', 'font-bold');
      el.classList.add('text-slate-800', 'font-semibold');
    }
  });
}

// Event Listeners
function setupEventListeners() {
  // Navigation Tabs
  document.querySelectorAll('[data-tab-target]').forEach(button => {
    button.addEventListener('click', (e) => {
      const target = e.currentTarget.getAttribute('data-tab-target');
      switchTab(target);
    });
  });

  // Upload & Reset confirmation modal toggles
  const uploadBtn = document.getElementById('open-upload-btn');
  const uploadModal = document.getElementById('upload-modal');
  const closeUploadBtn = document.getElementById('close-upload-btn');
  const resetSampleBtn = document.getElementById('reset-sample-btn');
  const resetConfirmModal = document.getElementById('reset-confirm-modal');
  const cancelResetBtn = document.getElementById('cancel-reset-btn');
  const confirmResetBtn = document.getElementById('confirm-reset-btn');

  if (uploadBtn && uploadModal) {
    uploadBtn.addEventListener('click', () => uploadModal.classList.remove('hidden'));
  }
  if (closeUploadBtn && uploadModal) {
    closeUploadBtn.addEventListener('click', () => uploadModal.classList.add('hidden'));
  }
  if (resetSampleBtn) {
    resetSampleBtn.addEventListener('click', () => {
      if (resetConfirmModal) {
        resetConfirmModal.classList.remove('hidden');
      } else {
        performResetToSampleData();
      }
    });
  }
  if (cancelResetBtn && resetConfirmModal) {
    cancelResetBtn.addEventListener('click', () => resetConfirmModal.classList.add('hidden'));
  }
  if (confirmResetBtn && resetConfirmModal) {
    confirmResetBtn.addEventListener('click', () => {
      resetConfirmModal.classList.add('hidden');
      performResetToSampleData();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (resetConfirmModal && !resetConfirmModal.classList.contains('hidden')) {
        resetConfirmModal.classList.add('hidden');
      }
      if (uploadModal && !uploadModal.classList.contains('hidden')) {
        uploadModal.classList.add('hidden');
      }
    }
  });

  // File Upload Drag & Drop and File Input
  setupFileUpload();

  // Print Button
  const printBtn = document.getElementById('print-schedule-btn');
  if (printBtn) {
    printBtn.addEventListener('click', () => window.print());
  }

  // Export CSV Button
  const exportCsvBtn = document.getElementById('export-csv-btn');
  if (exportCsvBtn) {
    exportCsvBtn.addEventListener('click', exportScheduleToCsv);
  }

  // Master Filters
  const masterDay = document.getElementById('filter-master-day');
  const masterTime = document.getElementById('filter-master-time');
  const masterRoom = document.getElementById('filter-master-room');
  const masterInst = document.getElementById('filter-master-instructor');
  const masterSearch = document.getElementById('filter-master-search');
  const masterSearchClear = document.getElementById('master-search-clear');
  const masterResetFilters = document.getElementById('master-reset-filters');
  const toggleGrid = document.getElementById('toggle-view-grid');
  const toggleTable = document.getElementById('toggle-view-table');

  if (masterDay) {
    masterDay.addEventListener('change', (e) => {
      state.masterFilter.day = e.target.value;
      renderMasterSchedule();
    });
  }
  if (masterTime) {
    masterTime.addEventListener('change', (e) => {
      state.masterFilter.timePeriod = e.target.value;
      renderMasterSchedule();
    });
  }
  if (masterRoom) {
    masterRoom.addEventListener('change', (e) => {
      state.masterFilter.room = e.target.value;
      renderMasterSchedule();
    });
  }
  if (masterInst) {
    masterInst.addEventListener('change', (e) => {
      state.masterFilter.instructor = e.target.value;
      renderMasterSchedule();
    });
  }
  if (masterSearch) {
    masterSearch.addEventListener('input', (e) => {
      state.masterFilter.search = e.target.value.toLowerCase();
      renderMasterSchedule();
    });
  }

  if (masterSearchClear && masterSearch) {
    masterSearchClear.addEventListener('click', () => {
      masterSearch.value = '';
      state.masterFilter.search = '';
      renderMasterSchedule();
      masterSearch.focus();
    });
  }

  if (masterResetFilters) {
    masterResetFilters.addEventListener('click', () => {
      state.masterFilter.day = 'ALL';
      state.masterFilter.timePeriod = 'ALL';
      state.masterFilter.room = 'ALL';
      state.masterFilter.instructor = 'ALL';
      state.masterFilter.search = '';
      if (masterDay) masterDay.value = 'ALL';
      if (masterTime) masterTime.value = 'ALL';
      if (masterRoom) masterRoom.value = 'ALL';
      if (masterInst) masterInst.value = 'ALL';
      if (masterSearch) masterSearch.value = '';
      renderMasterSchedule();
    });
  }

  if (toggleGrid) {
    toggleGrid.addEventListener('click', () => {
      state.masterFilter.viewMode = 'grid';
      setMasterViewModeUI('grid');
      renderMasterSchedule();
    });
  }

  if (toggleTable) {
    toggleTable.addEventListener('click', () => {
      state.masterFilter.viewMode = 'table';
      setMasterViewModeUI('table');
      renderMasterSchedule();
    });
  }

  // Room Quick Search Input
  const roomSearchInput = document.getElementById('room-search-input');
  if (roomSearchInput) {
    roomSearchInput.addEventListener('input', (e) => {
      state.roomSearchQuery = e.target.value.toLowerCase().trim();
      renderRoomPills();
    });
  }

  // Searchable Instructor Autocomplete Combobox
  setupInstructorAutocomplete();
}

function performResetToSampleData() {
  localStorage.removeItem('cea_schedule_data');
  state.data = window.SAMPLE_SCHEDULE_DATA;
  annotateSessionPeriods(state.data);
  setupDefaults();
  renderAll();
  showNotification('Restored default CEA sample schedule dataset', 'success');
}

// Switch Active Tab
function switchTab(tabName) {
  state.activeTab = tabName;
  document.querySelectorAll('[data-tab-target]').forEach(btn => {
    const isCurrent = btn.getAttribute('data-tab-target') === tabName;
    btn.setAttribute('aria-selected', isCurrent ? 'true' : 'false');

    if (isCurrent) {
      btn.classList.add('border-blue-700', 'text-blue-700', 'font-semibold');
      btn.classList.remove('border-transparent', 'text-slate-600', 'hover:text-slate-900', 'hover:border-slate-300', 'font-medium');
    } else {
      btn.classList.remove('border-blue-700', 'text-blue-700', 'font-semibold');
      btn.classList.add('border-transparent', 'text-slate-600', 'hover:text-slate-900', 'hover:border-slate-300', 'font-medium');
    }
  });

  document.querySelectorAll('[data-tab-content]').forEach(panel => {
    if (panel.getAttribute('data-tab-content') === tabName) {
      panel.classList.remove('hidden');
    } else {
      panel.classList.add('hidden');
    }
  });

  // Re-render corresponding tab
  if (tabName === 'rooms') renderRoomOccupancy();
  if (tabName === 'master') renderMasterSchedule();
  if (tabName === 'instructor') {
    const searchInput = document.getElementById('instructor-search-input');
    if (searchInput && state.selectedInstructor) {
      searchInput.value = state.selectedInstructor;
      updateClearButtonVisibility();
    }
    renderInstructorSchedule();
  }
  if (tabName === 'roster') renderRosterView();

  initIcons();
}
window.switchTab = switchTab;

// Master Render Function
function renderAll() {
  renderStatCards();
  populateDropdowns();
  renderRoomOccupancy();
  renderMasterSchedule();
  renderInstructorSchedule();
  renderRosterView();
  updateLiveClockUI(true);
  initIcons();
}

// Render Header Metrics
function renderStatCards() {
  if (!state.data) return;

  const totalInstructors = state.data.instructors ? state.data.instructors.length : 0;
  const totalSessions = state.data.sessions ? state.data.sessions.filter(s => !s.isDuty).length : 0;
  const totalRooms = state.data.rooms ? state.data.rooms.length : 0;
  const totalConflicts = state.data.conflicts ? state.data.conflicts.length : 0;

  const statInst = document.getElementById('stat-instructors');
  const statSess = document.getElementById('stat-sessions');
  const statRooms = document.getElementById('stat-rooms');
  if (statInst) statInst.textContent = totalInstructors;
  if (statSess) statSess.textContent = totalSessions;
  if (statRooms) statRooms.textContent = totalRooms;

  const conflictEl = document.getElementById('stat-conflicts');
  const conflictBadge = document.getElementById('conflict-alert-badge');
  if (conflictEl) conflictEl.textContent = totalConflicts;
  if (conflictBadge) {
    if (totalConflicts > 0) {
      conflictBadge.classList.remove('hidden');
      conflictBadge.textContent = `${totalConflicts} Room Conflicts Detected!`;
    } else {
      conflictBadge.classList.add('hidden');
    }
  }

  // Metadata tags
  const metaDep = document.getElementById('header-dept-title');
  const metaPeriod = document.getElementById('header-period-tag');
  if (metaDep && state.data.meta && state.data.meta.department) {
    metaDep.textContent = state.data.meta.department;
  }
  if (metaPeriod && state.data.meta && state.data.meta.period) {
    metaPeriod.textContent = state.data.meta.period;
  }
}

// Populate selectors with dynamic rooms and instructors
function populateDropdowns() {
  if (!state.data) return;

  // Master Room Filter Dropdown
  const masterRoomSelect = document.getElementById('filter-master-room');
  if (masterRoomSelect) {
    masterRoomSelect.innerHTML = `<option value="ALL">All Rooms (${state.data.rooms.length})</option>` +
      state.data.rooms.map(r => `<option value="${r}">${r}</option>`).join('');
  }

  // Render the interactive room pills
  renderRoomPills();

  // Update Searchable Instructor Combobox initial value
  const searchInput = document.getElementById('instructor-search-input');
  if (searchInput && state.selectedInstructor) {
    searchInput.value = state.selectedInstructor;
  }
  updateClearButtonVisibility();
  updateInstructorQuickBadge();
  renderInstructorDirectoryPills();

  // Master Filter Instructors Dropdown
  const masterInstSelect = document.getElementById('filter-master-instructor');
  if (masterInstSelect) {
    masterInstSelect.innerHTML = `<option value="ALL">All Faculty (${state.data.instructors.length})</option>` +
      state.data.instructors.map(i => `<option value="${i.name}">${i.name}</option>`).join('');
  }
}

let activeSuggestionIndex = -1;

function updateClearButtonVisibility() {
  const searchInput = document.getElementById('instructor-search-input');
  const clearBtn = document.getElementById('instructor-search-clear');
  if (!clearBtn || !searchInput) return;
  if (searchInput.value.trim().length > 0) {
    clearBtn.classList.remove('hidden');
  } else {
    clearBtn.classList.add('hidden');
  }
}

function escapeHtmlAttr(str) {
  if (!str) return '';
  return str.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function setupInstructorAutocomplete() {
  const searchInput = document.getElementById('instructor-search-input');
  const dropdown = document.getElementById('instructor-suggestions-dropdown');
  const toggleBtn = document.getElementById('instructor-search-toggle');
  const clearBtn = document.getElementById('instructor-search-clear');
  const chevron = document.getElementById('instructor-chevron');
  const wrapper = document.getElementById('instructor-combobox-wrapper');

  if (!searchInput || !dropdown) return;

  function openDropdown(query = '') {
    dropdown.classList.remove('hidden');
    if (chevron) chevron.classList.add('rotate-180');
    renderInstructorSuggestions(query);
  }

  function closeDropdown() {
    dropdown.classList.add('hidden');
    if (chevron) chevron.classList.remove('rotate-180');
    activeSuggestionIndex = -1;
  }

  searchInput.addEventListener('focus', () => {
    searchInput.select();
    openDropdown('');
    updateClearButtonVisibility();
  });

  searchInput.addEventListener('click', () => {
    if (dropdown.classList.contains('hidden')) {
      searchInput.select();
      openDropdown('');
    }
  });

  searchInput.addEventListener('input', (e) => {
    updateClearButtonVisibility();
    openDropdown(e.target.value);
  });

  if (clearBtn) {
    clearBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      searchInput.value = '';
      updateClearButtonVisibility();
      searchInput.focus();
      openDropdown('');
    });
  }

  if (toggleBtn) {
    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (dropdown.classList.contains('hidden')) {
        searchInput.focus();
        searchInput.select();
        openDropdown('');
      } else {
        closeDropdown();
      }
    });
  }

  document.addEventListener('click', (e) => {
    if (wrapper && !wrapper.contains(e.target)) {
      if (!dropdown.classList.contains('hidden')) {
        closeDropdown();
        if (state.data && state.data.instructors) {
          const val = searchInput.value.trim().toLowerCase();
          const match = state.data.instructors.find(i => i.name.toLowerCase() === val);
          if (match) {
            selectInstructorAutocomplete(match.name);
          } else if (state.selectedInstructor) {
            searchInput.value = state.selectedInstructor;
          }
        }
        updateClearButtonVisibility();
      }
    }
  });

  searchInput.addEventListener('keydown', (e) => {
    const items = dropdown.querySelectorAll('[data-suggestion-item]');
    if (dropdown.classList.contains('hidden') || items.length === 0) {
      if (e.key === 'ArrowDown') {
        openDropdown(searchInput.value);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      activeSuggestionIndex = (activeSuggestionIndex + 1) % items.length;
      highlightSuggestion(items, activeSuggestionIndex);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      activeSuggestionIndex = (activeSuggestionIndex - 1 + items.length) % items.length;
      highlightSuggestion(items, activeSuggestionIndex);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      let targetItem = null;
      if (activeSuggestionIndex >= 0 && activeSuggestionIndex < items.length) {
        targetItem = items[activeSuggestionIndex];
      } else if (items.length > 0) {
        targetItem = items[0];
      }
      if (targetItem) {
        const name = targetItem.getAttribute('data-instructor-name');
        if (name) selectInstructorAutocomplete(name);
      }
    } else if (e.key === 'Escape') {
      closeDropdown();
      if (state.selectedInstructor) {
        searchInput.value = state.selectedInstructor;
      }
      updateClearButtonVisibility();
    }
  });
}

function highlightSuggestion(items, index) {
  items.forEach((item, i) => {
    if (i === index) {
      item.classList.add('bg-blue-100/70', 'ring-1', 'ring-blue-400');
      item.scrollIntoView({ block: 'nearest' });
    } else {
      item.classList.remove('bg-blue-100/70', 'ring-1', 'ring-blue-400');
    }
  });
}

function renderInstructorSuggestions(query = '') {
  if (!state.data || !state.data.instructors) return;

  const dropdown = document.getElementById('instructor-suggestions-dropdown');
  if (!dropdown) return;

  const q = String(query).toLowerCase().trim();
  const tokens = q.split(/\s+/).filter(Boolean);

  const matches = state.data.instructors.filter(i => {
    if (tokens.length === 0) return true;
    const subjectList = (i.sessions || []).map(s => (s.subject || '') + ' ' + (s.room || '')).join(' ').toLowerCase();
    const searchableText = `${i.name} ${i.status || ''} ${i.qualification || ''} ${subjectList}`.toLowerCase();
    return tokens.every(token => searchableText.includes(token));
  });

  if (matches.length === 0) {
    dropdown.innerHTML = `
      <div class="px-4 py-4 text-xs text-slate-500 text-center">
        No faculty member found matching "${escapeHtmlAttr(query)}". Try searching by surname, course code, or room.
      </div>
    `;
    activeSuggestionIndex = -1;
    return;
  }

  activeSuggestionIndex = -1;
  dropdown.innerHTML = matches.map((inst, index) => {
    const isSelected = inst.name === state.selectedInstructor;
    const color = getInstructorColor(inst.name);
    const academicCount = (inst.sessions || []).filter(s => !s.isDuty).length;
    const uniqueSubjects = [...new Set((inst.sessions || []).filter(s => !s.isDuty).map(s => s.subject).filter(Boolean))];
    const isFullTime = inst.status && (inst.status.includes('FT') || inst.status.toUpperCase().includes('FULL-TIME'));

    return `
      <div role="option"
           aria-selected="${isSelected ? 'true' : 'false'}"
           data-suggestion-item
           data-index="${index}"
           data-instructor-name="${escapeHtmlAttr(inst.name)}"
           class="px-3.5 py-2.5 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition-colors ${
             isSelected ? 'bg-blue-50/70 text-blue-950' : 'text-slate-800'
           }">
        <div class="flex items-center gap-3 min-w-0 pr-3">
          <span class="w-2.5 h-2.5 rounded-full flex-shrink-0" style="background-color: ${color.ring}"></span>
          <div class="min-w-0">
            <div class="text-xs sm:text-sm truncate ${isSelected ? 'font-semibold text-blue-950' : 'font-medium text-slate-900'}">
              ${highlightMatchText(inst.name, tokens)}
            </div>
            <div class="text-xs text-slate-500 truncate mt-0.5">
              ${uniqueSubjects.length > 0 ? `Courses: <span class="font-medium text-slate-700">${uniqueSubjects.slice(0, 4).join(', ')}</span> • ` : ''}
              <span>${academicCount} classes/wk</span>
            </div>
          </div>
        </div>
        <div class="flex items-center gap-2 flex-shrink-0">
          <span class="px-2 py-0.5 rounded text-[11px] font-medium border ${
            isFullTime ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-amber-50 text-amber-800 border-amber-200'
          }">
            ${isFullTime ? 'Full-Time' : (inst.status || 'Faculty')}
          </span>
          ${isSelected ? '<i data-lucide="check" class="w-4 h-4 text-blue-700"></i>' : ''}
        </div>
      </div>
    `;
  }).join('');

  dropdown.querySelectorAll('[data-suggestion-item]').forEach(item => {
    item.addEventListener('mousedown', (e) => {
      e.preventDefault();
      const name = item.getAttribute('data-instructor-name');
      if (name) selectInstructorAutocomplete(name);
    });
    item.addEventListener('click', () => {
      const name = item.getAttribute('data-instructor-name');
      if (name) selectInstructorAutocomplete(name);
    });
  });

  if (!query && state.selectedInstructor) {
    const selectedEl = dropdown.querySelector('[aria-selected="true"]');
    if (selectedEl) {
      selectedEl.scrollIntoView({ block: 'nearest' });
    }
  }
  initIcons();
}

function highlightMatchText(text, tokens) {
  if (!tokens || tokens.length === 0 || !text) return text;
  const escapedTokens = tokens.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const regex = new RegExp(`(${escapedTokens.join('|')})`, 'gi');
  return text.replace(regex, '<mark class="bg-amber-100 text-slate-900 rounded-xs px-0.5">$1</mark>');
}

window.selectInstructorAutocomplete = function(name) {
  if (!name) return;
  state.selectedInstructor = name;
  const searchInput = document.getElementById('instructor-search-input');
  if (searchInput) {
    searchInput.value = name;
  }
  updateClearButtonVisibility();

  const dropdown = document.getElementById('instructor-suggestions-dropdown');
  if (dropdown) dropdown.classList.add('hidden');
  const chevron = document.getElementById('instructor-chevron');
  if (chevron) chevron.classList.remove('rotate-180');

  const instSelector = document.getElementById('instructor-selector');
  if (instSelector) {
    instSelector.value = name;
  }

  updateInstructorQuickBadge();
  renderInstructorDirectoryPills();
  renderInstructorSchedule();
  initIcons();
};

window.stepInstructor = function(delta) {
  if (!state.data || !Array.isArray(state.data.instructors) || state.data.instructors.length === 0) return;
  const list = state.data.instructors;
  const currentIdx = list.findIndex(i => i.name === state.selectedInstructor);
  const nextIdx = currentIdx === -1 ? 0 : (currentIdx + delta + list.length) % list.length;
  selectInstructorAutocomplete(list[nextIdx].name);
};

function renderInstructorDirectoryPills() {
  const container = document.getElementById('instructor-directory-pills');
  if (!container || !state.data || !state.data.instructors) return;
  container.innerHTML = '';
}

function updateInstructorQuickBadge() {
  const badgeEl = document.getElementById('instructor-quick-badge');
  if (!badgeEl || !state.selectedInstructor || !state.data || !state.data.instructors) return;

  const idx = state.data.instructors.findIndex(i => i.name === state.selectedInstructor);
  const total = state.data.instructors.length;
  if (idx === -1) {
    badgeEl.innerHTML = '';
    return;
  }

  badgeEl.innerHTML = `
    <span class="text-xs text-slate-500 font-medium tabular-nums">
      Faculty <span class="font-semibold text-slate-800">${idx + 1}</span> of <span class="font-semibold text-slate-800">${total}</span>
    </span>
  `;
}

// Format standardized time period for left column axis
function formatPeriodAxisCell(periodDef) {
  if (!periodDef) return '';
  const shiftLabel = periodDef.shift === 'MORNING BLOCK'
    ? 'Morning'
    : periodDef.shift === 'MIDDAY BLOCK'
      ? 'Midday'
      : periodDef.shift === 'AFTERNOON BLOCK'
        ? 'Afternoon'
        : periodDef.shift === 'LATE AFTERNOON'
          ? 'Late Afternoon'
          : 'Evening';

  return `
    <div class="flex flex-col leading-snug">
      <div class="flex items-center gap-1.5">
        <span class="px-1.5 py-0.5 rounded text-[11px] font-mono font-semibold bg-slate-200/80 text-slate-800">${periodDef.code}</span>
        <span class="text-[11px] font-medium text-slate-500">${shiftLabel}</span>
      </div>
      <span class="text-xs font-mono font-semibold text-slate-900 tabular-nums mt-1">${periodDef.start}</span>
      <span class="text-[11px] font-mono text-slate-500 tabular-nums">to ${periodDef.end}</span>
    </div>
  `;
}

// Render Room Pills with real-time search & conflict alerts
function renderRoomPills() {
  if (!state.data || !state.data.rooms) return;

  const container = document.getElementById('room-pills-container');
  const countBadge = document.getElementById('room-count-badge');
  if (!container) return;

  const conflictRooms = new Set((state.data.conflicts || []).map(c => c.room));
  const query = state.roomSearchQuery || '';

  const filteredRooms = state.data.rooms.filter(r =>
    !query || r.toLowerCase().includes(query)
  );

  if (countBadge) {
    countBadge.textContent = query
      ? `${filteredRooms.length} of ${state.data.rooms.length} rooms`
      : `${state.data.rooms.length} rooms`;
  }

  if (filteredRooms.length === 0) {
    container.innerHTML = `
      <div class="py-2 text-xs text-slate-500">
        No rooms match "${escapeHtmlAttr(query)}". Try searching for ALLIED, BGANNEX, SAL, or GLEC.
      </div>
    `;
    return;
  }

  container.innerHTML = filteredRooms.map(r => {
    const isSelected = r === state.selectedRoom;
    const hasConflict = conflictRooms.has(r);

    let btnClasses = isSelected
      ? 'bg-blue-700 text-white border-blue-700 font-semibold shadow-2xs'
      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300 font-medium';

    if (hasConflict && !isSelected) {
      btnClasses = 'bg-red-50/80 text-red-900 border-red-200 hover:bg-red-100/80 font-medium';
    }

    return `
      <button type="button" aria-pressed="${isSelected ? 'true' : 'false'}" class="h-7 px-2.5 rounded-md text-xs border transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${btnClasses}" onclick="selectRoom('${escapeHtmlAttr(r)}')">
        <span class="font-mono text-xs whitespace-nowrap">${r}</span>
        ${hasConflict ? `<i data-lucide="alert-triangle" class="w-3 h-3 shrink-0 ${isSelected ? 'text-red-200' : 'text-red-600'}" aria-label="Room has schedule conflict"></i>` : ''}
      </button>
    `;
  }).join('');

  initIcons();
}

window.selectRoom = function(room) {
  state.selectedRoom = room;
  renderRoomPills();
  renderRoomOccupancy();
  initIcons();
};

window.selectRoomMobileDay = function(dayVal) {
  state.roomDayFilter = dayVal;
  renderRoomOccupancy();
};

/* =========================================================================
   TAB 3: ROOM OCCUPANCY & CONFLICT CHECKER
   ========================================================================= */
function renderRoomOccupancy() {
  if (!state.data) return;

  const currentRoom = state.selectedRoom;
  const container = document.getElementById('room-timetable-container');
  const statsContainer = document.getElementById('room-specific-stats');
  const conflictContainer = document.getElementById('room-conflict-alert-box');

  if (!currentRoom) {
    if (container) container.innerHTML = '<div class="p-8 text-center text-slate-400">No rooms available.</div>';
    return;
  }

  const roomSessions = state.data.sessions.filter(s => s.room === currentRoom);
  const roomConflicts = (state.data.conflicts || []).filter(c => c.room === currentRoom);

  const totalSlots = PERIOD_DEFINITIONS.length * 6; // 54 weekly slots
  const occupiedSlots = roomSessions.length;
  const utilPercent = Math.min(100, Math.round((occupiedSlots / totalSlots) * 100));

  if (statsContainer) {
    statsContainer.innerHTML = `
      <div class="flex flex-wrap items-center justify-between gap-4 bg-white px-4 py-3.5 rounded-lg border border-slate-200 shadow-2xs">
        <div class="flex items-center gap-3">
          <div>
            <div class="text-xs font-medium text-slate-500">Selected Room Schedule</div>
            <div class="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2.5 mt-0.5">
              <span class="font-mono tracking-tight">${currentRoom}</span>
              ${roomConflicts.length > 0
                ? `<span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200"><i data-lucide="alert-triangle" class="w-3.5 h-3.5 text-red-600" aria-hidden="true"></i>${roomConflicts.length} ${roomConflicts.length > 1 ? 'Conflicts' : 'Conflict'}</span>`
                : `<span class="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200"><i data-lucide="check" class="w-3.5 h-3.5 text-emerald-600" aria-hidden="true"></i>Conflict-free</span>`
              }
            </div>
          </div>
        </div>
        <div class="flex items-center gap-5 sm:gap-7">
          <div>
            <div class="text-xs font-medium text-slate-500">Assigned Periods</div>
            <div class="text-sm font-semibold text-slate-900 font-mono tabular-nums mt-0.5">${occupiedSlots} <span class="text-slate-400 font-normal">/ ${totalSlots} weekly</span></div>
          </div>
          <div>
            <div class="text-xs font-medium text-slate-500">Weekly Utilization</div>
            <div class="flex items-center gap-2.5 mt-1">
              <div class="w-24 sm:w-32 bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200">
                <div class="bg-blue-600 h-full rounded-full transition-all" style="width: ${utilPercent}%"></div>
              </div>
              <span class="text-xs font-semibold text-slate-800 font-mono tabular-nums">${utilPercent}%</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  if (conflictContainer) {
    if (roomConflicts.length > 0) {
      conflictContainer.classList.remove('hidden');
      conflictContainer.innerHTML = `
        <div class="p-3.5 sm:p-4 rounded-lg bg-red-50/90 border border-red-200 border-l-4 border-l-red-600 text-red-950">
          <div class="text-xs sm:text-sm font-semibold flex items-center gap-2 text-red-900">
            <i data-lucide="alert-triangle" class="w-4 h-4 text-red-600 shrink-0" aria-hidden="true"></i>
            <span>Room Double-Booking Detected in ${currentRoom}</span>
          </div>
          <div class="mt-2.5 text-xs space-y-1.5">
            ${roomConflicts.map(c => `
              <div class="bg-white px-3 py-2 rounded-md border border-red-200/80 flex flex-wrap items-center gap-2">
                <span class="font-semibold text-slate-800">${DAY_TITLE_LABELS[c.day] || c.day} • <span class="font-mono">${c.timeSlot}</span>:</span>
                ${c.sessions.map(s => `<span class="inline-flex items-center px-2 py-0.5 rounded bg-red-50 text-red-800 border border-red-200 font-medium">${s.subject} (Sec ${s.section}) — ${s.instructor}</span>`).join(' <span class="text-red-600 font-semibold text-[11px]">overlaps with</span> ')}
              </div>
            `).join('')}
          </div>
        </div>
      `;
    } else {
      conflictContainer.classList.add('hidden');
      conflictContainer.innerHTML = '';
    }
  }

  const days = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
  const activeMobileDay = state.roomDayFilter || 'ALL';
  const mobileDays = activeMobileDay === 'ALL' ? days : [activeMobileDay];

  // 1. Mobile Day Selector + Mobile Vertical Room Ledger (<768px)
  let html = `
    <div class="md:hidden space-y-3">
      <!-- Mobile Day Picker Bar -->
      <div class="bg-white rounded-lg border border-slate-200 p-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        <button type="button" onclick="selectRoomMobileDay('ALL')" class="h-7 px-2.5 rounded-md text-xs border shrink-0 transition-colors cursor-pointer ${
          activeMobileDay === 'ALL' ? 'bg-blue-700 text-white border-blue-700 font-semibold' : 'bg-slate-50 text-slate-700 border-slate-200 font-medium'
        }">
          All (${roomSessions.length})
        </button>
        ${days.map(d => {
          const dCount = roomSessions.filter(s => s.day === d).length;
          const isSel = activeMobileDay === d;
          return `
            <button type="button" onclick="selectRoomMobileDay('${d}')" class="h-7 px-2.5 rounded-md text-xs border shrink-0 transition-colors cursor-pointer ${
              isSel ? 'bg-blue-700 text-white border-blue-700 font-semibold' : 'bg-white text-slate-700 border-slate-200 font-medium'
            }">
              ${DAY_SHORT_LABELS[d]} (${dCount})
            </button>
          `;
        }).join('')}
      </div>

      ${mobileDays.map(d => {
        const daySessions = roomSessions.filter(s => s.day === d);
        return `
          <div class="rounded-lg border border-slate-200 bg-white overflow-hidden">
            <div class="bg-slate-100/90 border-b border-slate-200 text-slate-900 px-3.5 py-2.5 flex items-center justify-between text-xs">
              <span class="font-semibold">${DAY_TITLE_LABELS[d]} — <span class="font-mono">${currentRoom}</span></span>
              <span class="px-2 py-0.5 rounded text-[11px] bg-white text-slate-700 border border-slate-200 font-medium">${daySessions.length} scheduled</span>
            </div>
            <div class="divide-y divide-slate-100">
              ${PERIOD_DEFINITIONS.map((periodDef, pIdx) => {
                const matched = daySessions.filter(s => getSessionPeriodIndex(s) === pIdx);
                if (matched.length === 0) {
                  return `
                    <div class="px-3.5 py-2 flex items-center justify-between text-xs bg-slate-50/40">
                      <div class="flex items-center gap-2 font-mono">
                        <span class="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-600">${periodDef.code}</span>
                        <span class="text-[11px] text-slate-500 tabular-nums">${periodDef.shortLabel}</span>
                      </div>
                      <span class="text-[11px] text-slate-400">No class scheduled</span>
                    </div>
                  `;
                }
                return matched.map(s => {
                  const color = getInstructorColor(s.instructor);
                  return `
                    <div role="button" tabindex="0" onclick="viewInstructor('${escapeHtmlAttr(s.instructor)}')" class="px-3.5 py-2.5 bg-white hover:bg-blue-50/40 flex flex-col gap-1 cursor-pointer" style="border-left: 3px solid ${color.ring}">
                      <div class="flex items-center justify-between gap-2">
                        <div class="flex items-center gap-2">
                          <span class="px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-slate-100 text-slate-700">${periodDef.code}</span>
                          <span class="text-xs font-mono font-medium text-slate-600 tabular-nums">${periodDef.shortLabel}</span>
                        </div>
                        <span class="text-[11px] font-mono font-medium px-1.5 py-0.5 rounded bg-slate-100 text-slate-700">Sec ${s.section}</span>
                      </div>
                      <div class="flex items-center justify-between gap-2 mt-0.5">
                        <span class="text-sm font-semibold text-slate-900">${s.subject}</span>
                        <span class="text-xs font-medium text-slate-700 flex items-center gap-1.5">
                          <span class="w-2 h-2 rounded-full shrink-0" style="background-color: ${color.ring}"></span>
                          <span>${s.instructor.split(',')[0]}</span>
                        </span>
                      </div>
                    </div>
                  `;
                }).join('');
              }).join('')}
            </div>
          </div>
        `;
      }).join('')}
    </div>

    <!-- 2. Desktop 6-Column Room Matrix (>=768px) -->
    <div class="hidden md:block overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-2xs">
      <table class="w-full border-collapse text-left min-w-[1100px] table-fixed">
        <thead>
          <tr class="bg-slate-50 border-b border-slate-200 text-slate-700 text-xs font-semibold">
            <th class="py-3 px-3.5 w-[132px] min-w-[132px] border-r border-slate-200 sticky left-0 bg-slate-50 z-10 sticky-time-col">Period / Time</th>
            ${days.map(d => `<th class="py-3 px-3 min-w-[162px] border-r border-slate-200 last:border-r-0">${DAY_TITLE_LABELS[d]}</th>`).join('')}
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-200 text-sm">
  `;

  PERIOD_DEFINITIONS.forEach((periodDef, pIdx) => {
    const rowBg = pIdx % 2 === 1 ? 'bg-slate-50/35' : 'bg-white';
    html += `
      <tr class="${rowBg}">
        <td class="py-2.5 px-3.5 border-r border-slate-200 sticky left-0 ${pIdx % 2 === 1 ? 'bg-[#F8FAFC]' : 'bg-white'} z-10 align-top sticky-time-col">
          ${formatPeriodAxisCell(periodDef)}
        </td>
    `;

    days.forEach(day => {
      const matched = roomSessions.filter(s => s.day === day && getSessionPeriodIndex(s) === pIdx);

      if (matched.length === 0) {
        html += `
          <td class="p-1.5 border-r border-slate-200/80 last:border-r-0 align-top">
            <div class="h-14"></div>
          </td>
        `;
      } else if (matched.length === 1) {
        const s = matched[0];
        const color = getInstructorColor(s.instructor);
        html += `
          <td class="p-1.5 border-r border-slate-200/80 last:border-r-0 align-top">
            <div role="button" tabindex="0"
                 class="min-h-[56px] px-2.5 py-2 rounded-md border border-slate-200 bg-white hover:border-blue-300 hover:bg-blue-50/30 text-xs flex flex-col justify-between cursor-pointer transition-colors shadow-2xs"
                 style="border-left: 3px solid ${color.ring}"
                 onclick="viewInstructor('${escapeHtmlAttr(s.instructor)}')"
                 onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();viewInstructor('${escapeHtmlAttr(s.instructor)}');}"
                 title="${escapeHtmlAttr(`${s.subject} (Sec ${s.section}) • ${periodDef.shortLabel} • ${s.instructor}`)}">
              <div class="flex items-center justify-between gap-1.5 min-w-0">
                <span class="font-semibold text-[12.5px] text-slate-900 truncate">${s.subject}</span>
                <span class="text-[10.5px] font-mono font-medium px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 shrink-0">Sec ${s.section}</span>
              </div>
              <div class="flex items-center justify-between gap-1.5 min-w-0 mt-1.5">
                <span class="text-[11px] font-medium text-slate-700 truncate flex items-center gap-1.5">
                  <span class="w-2 h-2 rounded-full shrink-0" style="background-color: ${color.ring}"></span>
                  <span class="truncate">${s.instructor.split(',')[0]}</span>
                </span>
                <span class="text-[10px] font-mono text-slate-400 tabular-nums shrink-0">${periodDef.code}</span>
              </div>
            </div>
          </td>
        `;
      } else {
        html += `
          <td class="p-1.5 border-r border-slate-200/80 last:border-r-0 align-top">
            <div class="min-h-[56px] px-2.5 py-1.5 rounded-md bg-red-50 border border-red-300 border-l-[3px] border-l-red-600 text-red-950 flex flex-col justify-between">
              <div class="font-semibold text-[10.5px] text-red-700 flex items-center justify-between gap-1">
                <span class="inline-flex items-center gap-1"><i data-lucide="alert-triangle" class="w-3 h-3 text-red-600 shrink-0" aria-hidden="true"></i>Conflict (${matched.length})</span>
                <span class="font-mono text-[10px]">${periodDef.code}</span>
              </div>
              <div class="text-[11px] font-semibold text-red-900 truncate mt-0.5" title="${escapeHtmlAttr(matched.map(m => `${m.subject} (${m.section})`).join(' vs '))}">
                ${matched.map(m => `${m.subject} (${m.section})`).join(' / ')}
              </div>
              <div class="text-[10.5px] text-red-800 truncate">
                ${matched.map(m => m.instructor.split(',')[0]).join(' & ')}
              </div>
            </div>
          </td>
        `;
      }
    });

    html += `</tr>`;
  });

  html += `
        </tbody>
      </table>
    </div>
  `;

  if (container) container.innerHTML = html;
  initIcons();
}

/* =========================================================================
   TAB 2: MASTER WEEKLY SCHEDULE (MON - SAT)
   Period-Separated Academic Timetable Architecture
   ========================================================================= */
function renderMasterTimeStrip(baseSessions) {
  const stripEl = document.getElementById('master-time-strip');
  if (!stripEl) return;

  const activePeriod = state.masterFilter.timePeriod;
  const totalCount = baseSessions.length;

  const pillsHtml = PERIOD_DEFINITIONS.map(p => {
    const count = baseSessions.filter(s => getSessionPeriodIndex(s) === p.index).length;
    const isSelected = String(activePeriod) === String(p.index);

    const stateClasses = isSelected
      ? 'bg-blue-700 text-white border-blue-700 font-semibold'
      : count === 0
        ? 'bg-slate-50 text-slate-400 border-slate-200 opacity-60 hover:opacity-100'
        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:border-slate-300 font-medium';

    return `
      <button type="button"
              onclick="selectMasterTimePeriod('${p.index}')"
              aria-pressed="${isSelected ? 'true' : 'false'}"
              class="h-7 px-2.5 rounded-md text-xs border inline-flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${stateClasses}"
              title="Filter Master Schedule to ${p.code}: ${p.label} (${count} sessions)">
        <span class="font-mono font-semibold ${isSelected ? 'text-blue-100' : 'text-slate-800'}">${p.code}</span>
        <span class="font-mono text-[11px] tabular-nums">${p.shortLabel}</span>
        <span class="px-1.5 py-0.2 rounded text-[10px] font-mono tabular-nums ${isSelected ? 'bg-blue-800 text-white' : 'bg-slate-100 text-slate-600'}">${count}</span>
      </button>
    `;
  }).join('');

  const allSelected = activePeriod === 'ALL';
  stripEl.innerHTML = `
    <div class="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 w-full">
      <span class="text-xs font-medium text-slate-500 mr-1 shrink-0">Period:</span>
      <button type="button"
              onclick="selectMasterTimePeriod('ALL')"
              aria-pressed="${allSelected ? 'true' : 'false'}"
              class="h-7 px-2.5 rounded-md text-xs border inline-flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
                allSelected
                  ? 'bg-blue-700 text-white border-blue-700 font-semibold'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 font-medium'
              }">
        <span>All 9 Periods</span>
        <span class="px-1.5 rounded text-[10px] font-mono ${allSelected ? 'bg-blue-800 text-blue-100' : 'bg-slate-100 text-slate-600'}">${totalCount}</span>
      </button>
      ${pillsHtml}
    </div>
  `;
}

window.selectMasterTimePeriod = function(periodVal) {
  if (periodVal !== 'ALL' && String(state.masterFilter.timePeriod) === String(periodVal)) {
    state.masterFilter.timePeriod = 'ALL';
  } else {
    state.masterFilter.timePeriod = String(periodVal);
  }
  const masterTimeSelect = document.getElementById('filter-master-time');
  if (masterTimeSelect) {
    masterTimeSelect.value = state.masterFilter.timePeriod;
  }
  renderMasterSchedule();
};

function renderMasterSchedule() {
  if (!state.data) return;

  const container = document.getElementById('master-schedule-container');
  const { day, timePeriod, room, instructor, search, viewMode } = state.masterFilter;

  updateMasterFilterToolbarState();

  const totalSessionsCount = state.data.sessions ? state.data.sessions.length : 0;

  // Base filtered sessions (excluding timePeriod so the time strip shows counts per period for current filter context)
  const baseFiltered = state.data.sessions.filter(s => {
    if (day !== 'ALL' && s.day !== day) return false;
    if (room !== 'ALL' && s.room !== room) return false;
    if (instructor !== 'ALL' && s.instructor !== instructor) return false;
    if (search) {
      const pDef = PERIOD_DEFINITIONS[getSessionPeriodIndex(s)];
      const target = `${s.subject} ${s.section} ${s.room} ${s.instructor} ${s.day} ${s.timeSlot} ${pDef ? pDef.shortLabel : ''} ${pDef ? pDef.code : ''}`.toLowerCase();
      if (!target.includes(search)) return false;
    }
    return true;
  });

  // Render interactive time period strip
  renderMasterTimeStrip(baseFiltered);

  // Apply timePeriod filter
  const filtered = baseFiltered.filter(s => {
    if (timePeriod !== 'ALL' && String(getSessionPeriodIndex(s)) !== String(timePeriod)) {
      return false;
    }
    return true;
  });

  const countEl = document.getElementById('master-results-count');
  if (countEl) {
    if (filtered.length === totalSessionsCount) {
      countEl.innerHTML = `<span class="font-semibold text-slate-900 font-mono">${filtered.length}</span> sessions`;
    } else {
      countEl.innerHTML = `<span class="font-semibold text-blue-700 font-mono">${filtered.length}</span> <span class="text-slate-400">of ${totalSessionsCount}</span>`;
    }
  }

  // Render Instructor Color Guide
  renderInstructorLegend();

  if (viewMode === 'table') {
    container.innerHTML = `
      <div class="overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-2xs">
        <table class="w-full text-left text-xs divide-y divide-slate-200">
          <thead class="bg-slate-50 text-xs font-semibold text-slate-700">
            <tr>
              <th class="py-3 px-4">Day</th>
              <th class="py-3 px-4">Period & Time</th>
              <th class="py-3 px-4">Course Code</th>
              <th class="py-3 px-4">Section</th>
              <th class="py-3 px-4">Room</th>
              <th class="py-3 px-4">Instructor</th>
              <th class="py-3 px-4 text-right">Schedule Type</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-200 text-xs">
            ${filtered.length === 0 ? `
              <tr>
                <td colspan="7" class="p-10 text-center text-slate-500">
                  <div class="flex flex-col items-center justify-center gap-2">
                    <i data-lucide="calendar-x-2" class="w-6 h-6 text-slate-400" aria-hidden="true"></i>
                    <div class="font-semibold text-slate-800">No scheduled sessions match the current filters</div>
                    <div class="text-xs text-slate-500">Try clearing your search query or resetting the active filters.</div>
                  </div>
                </td>
              </tr>
            ` : ''}
            ${filtered.map(s => {
              const color = getInstructorColor(s.instructor);
              const accentRing = s.isDuty ? '#64748B' : color.ring;
              const pDef = PERIOD_DEFINITIONS[getSessionPeriodIndex(s)];
              return `
                <tr class="hover:bg-slate-50/80 transition-colors">
                  <td class="py-2.5 px-4 font-semibold text-slate-800 whitespace-nowrap">${DAY_TITLE_LABELS[s.day] || s.day}</td>
                  <td class="py-2.5 px-4 whitespace-nowrap">
                    <div class="inline-flex items-center gap-2 font-mono">
                      <span class="px-1.5 py-0.5 rounded text-[10.5px] font-semibold bg-slate-100 text-slate-800">${pDef.code}</span>
                      <span class="text-xs font-medium text-slate-700 tabular-nums">${pDef.shortLabel}</span>
                    </div>
                  </td>
                  <td class="py-2.5 px-4 font-semibold text-slate-900 whitespace-nowrap">${s.subject}</td>
                  <td class="py-2.5 px-4 text-slate-600 font-mono text-[11.5px] whitespace-nowrap">Sec ${s.section}</td>
                  <td class="py-2.5 px-4 whitespace-nowrap">
                    <span class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-slate-100 text-slate-800 border border-slate-200">
                      ${s.room}
                    </span>
                  </td>
                  <td class="py-2.5 px-4 whitespace-nowrap">
                    <button type="button"
                            class="inline-flex items-center gap-2 px-2.5 py-1 rounded-md text-xs font-medium text-slate-800 bg-white hover:bg-slate-50 border border-slate-200 transition-colors cursor-pointer"
                            onclick="viewInstructor('${escapeHtmlAttr(s.instructor)}')"
                            title="View ${escapeHtmlAttr(s.instructor)}'s individual timetable">
                      <span class="w-2 h-2 rounded-full shrink-0" style="background-color: ${accentRing}"></span>
                      <span>${s.instructor}</span>
                    </button>
                  </td>
                  <td class="py-2.5 px-4 text-right whitespace-nowrap">
                    ${s.isDuty
                      ? '<span class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-600">Office Duty</span>'
                      : '<span class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-blue-50 text-blue-700">Academic Class</span>'
                    }
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
    initIcons();
    return;
  }

  // Render Master Time-Block Grid View
  const days = day === 'ALL' ? ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"] : [day];
  const visiblePeriods = timePeriod === 'ALL'
    ? PERIOD_DEFINITIONS
    : PERIOD_DEFINITIONS.filter(p => String(p.index) === String(timePeriod));

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="rounded-lg border border-slate-200 bg-white p-12 text-center shadow-2xs">
        <div class="max-w-sm mx-auto flex flex-col items-center gap-2">
          <div class="w-10 h-10 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center">
            <i data-lucide="search-x" class="w-5 h-5" aria-hidden="true"></i>
          </div>
          <h3 class="text-sm font-semibold text-slate-900 mt-1">No matching schedule entries</h3>
          <p class="text-xs text-slate-500 leading-relaxed">No classes or duty sessions match your active filter criteria. Reset filters to view the full weekly timetable.</p>
          <button type="button" onclick="document.getElementById('master-reset-filters').click()" class="mt-2 h-8 px-4 rounded-md text-xs font-medium bg-blue-700 hover:bg-blue-800 text-white transition-colors cursor-pointer">
            Reset All Filters
          </button>
        </div>
      </div>
    `;
    initIcons();
    return;
  }

  // Build Period-Separated Master Schedule
  let html = `
    <div class="overflow-x-auto pb-2">
      <div class="${days.length > 1 ? 'md:min-w-[1140px]' : 'md:min-w-[520px]'} space-y-4">
  `;

  visiblePeriods.forEach((periodDef) => {
    const periodSessions = filtered.filter(s => getSessionPeriodIndex(s) === periodDef.index);

    // If user is filtering by search, room, or instructor, skip empty time periods to avoid empty visual noise
    const hasSpecificConstraint = room !== 'ALL' || instructor !== 'ALL' || (search && search.length > 0);
    if (hasSpecificConstraint && periodSessions.length === 0 && timePeriod === 'ALL') {
      return;
    }

    // Per-day counts for this period header
    const dayBreakdownHtml = days.map(d => {
      const c = periodSessions.filter(s => s.day === d).length;
      return `<span class="inline-flex items-center gap-1 ${c > 0 ? 'text-slate-700' : 'text-slate-400'}"><span>${DAY_SHORT_LABELS[d]}</span><span class="font-mono font-semibold ${c > 0 ? 'text-slate-900' : 'text-slate-400'}">${c}</span></span>`;
    }).join('<span class="text-slate-300">·</span>');

    html += `
      <section aria-label="Time Period ${periodDef.code} ${periodDef.label}" class="rounded-lg border border-slate-200 bg-white shadow-2xs overflow-hidden">
        <!-- Clean Period Separator Header -->
        <div class="bg-slate-100/90 px-3.5 sm:px-4 py-2.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
          <div class="flex items-center gap-2.5">
            <span class="px-2 py-0.5 rounded text-xs font-mono font-semibold bg-blue-700 text-white">${periodDef.code}</span>
            <span class="text-xs sm:text-sm font-mono font-semibold text-slate-900 tabular-nums">${periodDef.start} – ${periodDef.end}</span>
            <span class="hidden sm:inline-block text-xs font-medium text-slate-500">• ${periodDef.shift.charAt(0) + periodDef.shift.slice(1).toLowerCase()}</span>
          </div>
          <div class="flex items-center gap-3 text-xs">
            <div class="hidden lg:flex items-center gap-2 text-[11px]">
              ${dayBreakdownHtml}
            </div>
            <span class="px-2.5 py-0.5 rounded-full bg-white text-slate-700 border border-slate-200 font-mono text-[11px] font-semibold tabular-nums">${periodSessions.length} ${periodSessions.length === 1 ? 'session' : 'sessions'}</span>
          </div>
        </div>

        <!-- Mobile Day-Grouped Ledger (<768px) -->
        <div class="md:hidden divide-y divide-slate-200">
          ${days.map(d => {
            const slotSessions = periodSessions.filter(s => s.day === d);
            if (slotSessions.length === 0) return '';
            return `
              <div class="bg-white">
                <div class="bg-slate-50 px-3.5 py-1.5 border-b border-slate-200 flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <span class="text-xs font-semibold text-slate-800">${DAY_TITLE_LABELS[d]}</span>
                    <span class="text-[11px] font-mono text-slate-500">${periodDef.shortLabel}</span>
                  </div>
                  <span class="text-[11px] font-mono font-semibold px-1.5 py-0.2 rounded bg-slate-200/70 text-slate-700">${slotSessions.length}</span>
                </div>
                <div class="divide-y divide-slate-100">
                  ${slotSessions.map(s => {
                    const color = getInstructorColor(s.instructor);
                    const isDuty = Boolean(s.isDuty);
                    const leftBarColor = isDuty ? '#94A3B8' : color.ring;
                    const dotColor = isDuty ? '#64748B' : color.ring;
                    const displaySubject = isDuty ? (s.dutyName || s.subject.replace(/\s*\(Office Duty\)/i, '')) : s.subject;
                    const displayRoom = s.room === 'OFFICE / DEPT' ? 'Dept' : s.room;
                    const displaySection = isDuty ? 'Office Duty' : (s.section && s.section !== '-' ? `Sec ${s.section}` : 'Lec / Lab');
                    const instructorSurname = s.instructor.split(',')[0];
                    return `
                      <div role="button" tabindex="0"
                           onclick="viewInstructor('${escapeHtmlAttr(s.instructor)}')"
                           class="px-3.5 py-2.5 ${isDuty ? 'bg-slate-50/70' : 'bg-white'} active:bg-blue-50 cursor-pointer"
                           style="border-left: 3px solid ${leftBarColor};">
                        <div class="flex items-center justify-between gap-2">
                          <div class="flex items-center gap-2 min-w-0">
                            <span class="text-xs font-semibold text-slate-900 truncate">${displaySubject}</span>
                            <span class="text-[11px] font-mono text-slate-600 shrink-0">${displaySection}</span>
                          </div>
                          <span class="text-[11px] font-mono font-medium px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 shrink-0">${displayRoom}</span>
                        </div>
                        <div class="flex items-center justify-between gap-2 mt-1">
                          <span class="text-[10.5px] font-mono text-slate-400 tabular-nums">${DAY_SHORT_LABELS[d]} • ${periodDef.shortLabel}</span>
                          <span class="text-xs font-medium text-slate-700 flex items-center gap-1.5">
                            <span class="w-2 h-2 rounded-full shrink-0" style="background-color: ${dotColor}"></span>
                            <span>${instructorSurname}</span>
                          </span>
                        </div>
                      </div>
                    `;
                  }).join('')}
                </div>
              </div>
            `;
          }).join('') || `
            <div class="p-4 text-center text-xs text-slate-400">No scheduled classes in this period</div>
          `}
        </div>

        <!-- Desktop Period Timetable Columns (>=768px) -->
        <table class="hidden md:table w-full border-collapse text-left table-fixed">
          <thead>
            <tr class="bg-slate-50/80 border-b border-slate-200">
              <th scope="col" class="py-2 px-3.5 w-[124px] min-w-[124px] border-r border-slate-200 sticky left-0 bg-slate-50 z-10 text-xs font-semibold text-slate-600 sticky-time-col">
                Time Slot
              </th>
              ${days.map(d => {
                const dCount = periodSessions.filter(s => s.day === d).length;
                return `
                  <th scope="col" class="py-2 px-3 border-r border-slate-200 last:border-r-0">
                    <div class="flex items-center justify-between gap-1">
                      <span class="text-xs font-semibold text-slate-800">${DAY_TITLE_LABELS[d]}</span>
                      <span class="text-[11px] font-mono font-medium px-1.5 py-0.2 rounded ${dCount > 0 ? 'bg-slate-200/80 text-slate-800' : 'text-slate-400'} tabular-nums">${dCount}</span>
                    </div>
                  </th>
                `;
              }).join('')}
            </tr>
          </thead>
          <tbody>
            <tr>
              <!-- Sticky Left Time Stamp Anchor -->
              <td class="p-3.5 border-r border-slate-200 sticky left-0 bg-slate-50/50 z-10 align-top sticky-time-col">
                <div class="sticky top-28">
                  <div class="inline-block px-1.5 py-0.5 rounded text-[10.5px] font-mono font-semibold bg-slate-200/80 text-slate-800 mb-1">${periodDef.code}</div>
                  <div class="text-xs font-mono font-semibold text-slate-900 tabular-nums leading-tight">${periodDef.start}</div>
                  <div class="text-[11px] font-mono text-slate-500 tabular-nums leading-tight mt-0.5">to ${periodDef.end}</div>
                </div>
              </td>

              <!-- Day Columns for this Time Period -->
              ${days.map(d => {
                const slotSessions = periodSessions.filter(s => s.day === d);
                if (slotSessions.length === 0) {
                  return `
                    <td class="p-2 border-r border-slate-200/80 last:border-r-0 align-top bg-slate-50/20">
                      <div class="min-h-[48px]"></div>
                    </td>
                  `;
                }

                return `
                  <td class="p-1.5 border-r border-slate-200/80 last:border-r-0 align-top bg-white">
                    <div class="space-y-1.5">
                      ${slotSessions.map(s => {
                        const color = getInstructorColor(s.instructor);
                        const isDuty = Boolean(s.isDuty);
                        const leftBarColor = isDuty ? '#94A3B8' : color.ring;
                        const dotColor = isDuty ? '#64748B' : color.ring;
                        const displaySubject = isDuty ? (s.dutyName || s.subject.replace(/\s*\(Office Duty\)/i, '')) : s.subject;
                        const displayRoom = s.room === 'OFFICE / DEPT' ? 'Dept' : s.room;
                        const displaySection = isDuty ? 'Office Duty' : (s.section && s.section !== '-' ? `Sec ${s.section}` : 'Lec / Lab');
                        const instructorSurname = s.instructor.split(',')[0];
                        const fullTooltip = `${s.subject} (${displaySection})\nAssigned Time: ${DAY_TITLE_LABELS[s.day] || s.day} • ${periodDef.label} (${periodDef.code})\nRoom: ${s.room}\nInstructor: ${s.instructor}`;

                        return `
                          <div role="button" tabindex="0"
                               aria-label="${escapeHtmlAttr(`${s.subject}, ${displaySection}, Assigned Time ${periodDef.label}, Room ${s.room}, Instructor ${s.instructor}`)}"
                               title="${escapeHtmlAttr(fullTooltip)}"
                               onclick="viewInstructor('${escapeHtmlAttr(s.instructor)}')"
                               onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();viewInstructor('${escapeHtmlAttr(s.instructor)}');}"
                               class="schedule-entry rounded-md border ${isDuty ? 'border-slate-200 bg-slate-50/80 hover:bg-slate-100/80' : 'border-slate-200/90 bg-white hover:border-blue-300 hover:bg-blue-50/30'} px-2.5 py-2 cursor-pointer select-none transition-colors shadow-2xs"
                               style="border-left: 3px solid ${leftBarColor};">
                            <!-- Tier 1: Course Code (Primary) + Room Badge -->
                            <div class="flex items-center justify-between gap-1.5 min-w-0">
                              <span class="text-[12.5px] font-semibold ${isDuty ? 'text-slate-600' : 'text-slate-900'} tracking-tight truncate">${displaySubject}</span>
                              <span class="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded ${isDuty ? 'bg-slate-200/70 text-slate-600' : 'bg-slate-100 text-slate-700'} shrink-0 whitespace-nowrap leading-none">${displayRoom}</span>
                            </div>

                            <!-- Tier 2: Section + Instructor Surname -->
                            <div class="flex items-center justify-between gap-1.5 mt-1.5 min-w-0">
                              <span class="text-[11px] font-mono ${isDuty ? 'text-slate-500' : 'text-slate-600'} truncate">${displaySection}</span>
                              <span class="text-[11px] font-medium text-slate-700 truncate flex items-center gap-1 min-w-0">
                                <span class="w-1.5 h-1.5 rounded-full shrink-0" style="background-color: ${dotColor}"></span>
                                <span class="truncate">${instructorSurname}</span>
                              </span>
                            </div>
                          </div>
                        `;
                      }).join('')}
                    </div>
                  </td>
                `;
              }).join('')}
            </tr>
          </tbody>
        </table>
      </section>
    `;
  });

  html += `
      </div>
    </div>
  `;

  container.innerHTML = html;
  initIcons();
}

/* =========================================================================
   TAB 1 (MAIN SCREEN): INDIVIDUAL INSTRUCTOR VIEW
   ========================================================================= */
window.viewRoomFromSchedule = function(room) {
  if (!room || room === 'OFFICE / DEPT') return;
  state.selectedRoom = room;
  switchTab('rooms');
};

window.viewInstructorInMaster = function(name) {
  if (!name) return;
  state.masterFilter.instructor = name;
  const masterInst = document.getElementById('filter-master-instructor');
  if (masterInst) masterInst.value = name;
  switchTab('master');
};

window.selectInstructorMobileDay = function(dayVal) {
  state.instructorDayFilter = dayVal;
  renderInstructorSchedule();
};

function renderInstructorSchedule() {
  if (!state.data || !state.data.instructors) return;

  const currentName = state.selectedInstructor;
  const faculty = state.data.instructors.find(i => i.name === currentName);
  const container = document.getElementById('instructor-timetable-container');
  const profileContainer = document.getElementById('instructor-profile-card');

  renderInstructorDirectoryPills();

  if (!faculty) {
    if (container) container.innerHTML = '<div class="p-8 text-center text-slate-400">Please select an instructor.</div>';
    return;
  }

  const instColor = getInstructorColor(faculty.name);
  const academicSessions = (faculty.sessions || []).filter(s => !s.isDuty);
  const dutySessions = (faculty.sessions || []).filter(s => s.isDuty);
  const assignedRooms = [...new Set(academicSessions.map(s => s.room).filter(r => r && r !== 'OFFICE / DEPT'))];
  const uniqueSubjects = [...new Set(academicSessions.map(s => s.subject).filter(Boolean))];
  const isFT = faculty.status && (faculty.status.includes('FT') || faculty.status.toUpperCase().includes('FULL-TIME'));

  if (profileContainer) {
    profileContainer.innerHTML = `
      <div class="bg-white p-4 sm:px-5 sm:py-4 rounded-lg border border-slate-200 shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-4 min-w-0 max-w-full overflow-hidden" style="border-left: 4px solid ${instColor.ring}">
        <!-- Left: Primary Faculty Identity, Qualification, Courses & Assigned Rooms -->
        <div class="min-w-0 flex-1">
          <div class="flex items-start gap-3.5 min-w-0">
            <div class="w-10 h-10 sm:w-11 sm:h-11 rounded-lg font-semibold flex items-center justify-center text-base sm:text-lg text-white shrink-0 shadow-2xs" style="background-color: ${instColor.ring}">
              ${faculty.name.split(',')[0].charAt(0)}
            </div>
            <div class="min-w-0 flex-1">
              <div class="flex flex-wrap items-center gap-2">
                <h2 class="text-base sm:text-xl font-bold text-slate-900 tracking-tight leading-snug break-words">${faculty.name}</h2>
                <span class="px-2 py-0.5 rounded-full text-xs font-medium ${
                  isFT
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-amber-50 text-amber-800 border border-amber-200'
                }">
                  ${isFT ? 'Full-Time Faculty' : (faculty.status || 'Part-Time')}
                </span>
              </div>

              <div class="text-xs sm:text-[13px] text-slate-600 mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1">
                <span>${faculty.qualification || 'Department of Computer & Electronics Engineering'}</span>
                ${uniqueSubjects.length > 0 ? `
                  <span class="text-slate-300 hidden sm:inline">•</span>
                  <span class="text-slate-700">Courses: <strong class="font-mono font-semibold text-slate-900">${uniqueSubjects.join(', ')}</strong></span>
                ` : ''}
              </div>

              ${assignedRooms.length > 0 ? `
                <div class="flex items-center gap-1.5 flex-wrap mt-2.5">
                  <span class="text-xs font-medium text-slate-500 mr-0.5">Assigned Rooms:</span>
                  ${assignedRooms.map(room => `
                    <button type="button" onclick="viewRoomFromSchedule('${escapeHtmlAttr(room)}')" title="Inspect room ${escapeHtmlAttr(room)} occupancy" class="px-2 py-0.5 rounded text-xs font-mono font-medium bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200/90 hover:border-blue-200 transition-colors cursor-pointer">
                      ${room}
                    </button>
                  `).join('')}
                </div>
              ` : ''}
            </div>
          </div>
        </div>

        <!-- Right: Grouped Weekly Workload & Quick Actions -->
        <div class="flex flex-wrap items-center justify-between lg:justify-end gap-4 sm:gap-6 pt-3 lg:pt-0 border-t lg:border-t-0 border-slate-100 lg:ml-auto shrink-0">
          <div class="flex items-center gap-5 sm:gap-6 lg:border-r lg:border-slate-200 lg:pr-6">
            <div>
              <div class="text-xs font-medium text-slate-500">Weekly Classes</div>
              <div class="text-sm sm:text-base font-bold text-slate-900 font-mono tabular-nums mt-0.5">${academicSessions.length} <span class="text-xs font-sans font-normal text-slate-500">classes</span></div>
            </div>
            <div>
              <div class="text-xs font-medium text-slate-500">Office & Consultation</div>
              <div class="text-sm sm:text-base font-bold text-slate-700 font-mono tabular-nums mt-0.5">${dutySessions.length} <span class="text-xs font-sans font-normal text-slate-500">periods</span></div>
            </div>
          </div>

          <div class="flex items-center gap-2 shrink-0">
            <button type="button" onclick="viewInstructorInMaster('${escapeHtmlAttr(faculty.name)}')" class="h-8 px-3 rounded-md text-xs font-medium border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900 flex items-center gap-1.5 transition-colors cursor-pointer" title="View this instructor inside the Master Weekly Schedule">
              <i data-lucide="calendar" class="w-3.5 h-3.5 text-slate-500" aria-hidden="true"></i>
              <span>Master Schedule</span>
            </button>
            <button type="button" onclick="window.print()" class="h-8 px-3 rounded-md text-xs font-medium border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 hover:text-slate-900 flex items-center gap-1.5 transition-colors cursor-pointer" title="Print current instructor timetable">
              <i data-lucide="printer" class="w-3.5 h-3.5 text-slate-500" aria-hidden="true"></i>
              <span>Print</span>
            </button>
          </div>
        </div>
      </div>
    `;
  }

  const days = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
  const activeMobileDay = state.instructorDayFilter || 'ALL';
  const mobileDays = activeMobileDay === 'ALL' ? days : [activeMobileDay];
  const totalInstSessions = (faculty.sessions || []).length;

  // 1. Mobile Day Selector + Mobile Chronological Schedule Cards (<768px)
  let html = `
    <div class="md:hidden space-y-3">
      <!-- Mobile Day Switcher Bar -->
      <div class="bg-white rounded-lg border border-slate-200 p-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        <button type="button" onclick="selectInstructorMobileDay('ALL')" class="h-7 px-2.5 rounded-md text-xs border shrink-0 transition-colors cursor-pointer ${
          activeMobileDay === 'ALL' ? 'bg-blue-700 text-white border-blue-700 font-semibold' : 'bg-slate-50 text-slate-700 border-slate-200 font-medium'
        }">
          All Days (${totalInstSessions})
        </button>
        ${days.map(d => {
          const dCount = (faculty.sessions || []).filter(s => s.day === d).length;
          const isSel = activeMobileDay === d;
          return `
            <button type="button" onclick="selectInstructorMobileDay('${d}')" class="h-7 px-2.5 rounded-md text-xs border shrink-0 transition-colors cursor-pointer ${
              isSel ? 'bg-blue-700 text-white border-blue-700 font-semibold' : 'bg-white text-slate-700 border-slate-200 font-medium'
            }">
              ${DAY_SHORT_LABELS[d]} (${dCount})
            </button>
          `;
        }).join('')}
      </div>

      ${mobileDays.map(d => {
        const dayEntries = [];
        PERIOD_DEFINITIONS.forEach((periodDef, pIdx) => {
          const matched = (faculty.sessions || []).filter(s => s.day === d && getSessionPeriodIndex(s) === pIdx);
          matched.forEach(s => dayEntries.push({ session: s, periodDef }));
        });

        return `
          <div class="rounded-lg border border-slate-200 bg-white overflow-hidden">
            <div class="bg-slate-100/90 border-b border-slate-200 text-slate-900 px-3.5 py-2 flex items-center justify-between text-xs">
              <span class="font-semibold">${DAY_TITLE_LABELS[d]}</span>
              <span class="px-2 py-0.5 rounded text-[11px] bg-white ${dayEntries.length > 0 ? 'text-slate-800 font-medium' : 'text-slate-400'} border border-slate-200">${dayEntries.length} ${dayEntries.length === 1 ? 'session' : 'sessions'}</span>
            </div>
            ${dayEntries.length === 0 ? `
              <div class="p-4 text-center text-xs text-slate-400 bg-slate-50/40">
                No scheduled classes or office duty on ${DAY_TITLE_LABELS[d]}
              </div>
            ` : `
              <div class="divide-y divide-slate-100">
                ${dayEntries.map(({ session: s, periodDef }) => {
                  const leftBar = s.isDuty ? '#94A3B8' : instColor.ring;
                  const displaySubject = s.isDuty ? (s.dutyName || s.subject.replace(/\s*\(Office Duty\)/i, '')) : s.subject;
                  const displayRoom = s.room === 'OFFICE / DEPT' ? 'Dept' : s.room;
                  const displaySection = s.isDuty ? 'Office Duty' : (s.section && s.section !== '-' ? `Sec ${s.section}` : 'Lec / Lab');
                  return `
                    <div class="px-3.5 py-2.5 ${s.isDuty ? 'bg-slate-50/80' : 'bg-white'} flex flex-col gap-1" style="border-left: 3px solid ${leftBar}">
                      <div class="flex items-center justify-between gap-2">
                        <div class="flex items-center gap-2 font-mono">
                          <span class="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700">${periodDef.code}</span>
                          <span class="text-xs font-medium text-slate-700 tabular-nums">${periodDef.shortLabel}</span>
                        </div>
                        <button type="button" onclick="viewRoomFromSchedule('${escapeHtmlAttr(s.room)}')" class="px-2 py-0.5 rounded font-mono text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
                          ${displayRoom}
                        </button>
                      </div>
                      <div class="flex items-center justify-between gap-2 mt-0.5">
                        <span class="text-sm font-semibold ${s.isDuty ? 'text-slate-600' : 'text-slate-900'}">${displaySubject}</span>
                        <span class="text-xs font-mono ${s.isDuty ? 'text-slate-500' : 'text-blue-700 font-medium'}">${displaySection}</span>
                      </div>
                    </div>
                  `;
                }).join('')}
              </div>
            `}
          </div>
        `;
      }).join('')}
    </div>

    <!-- 2. Desktop 6-Column Weekly Matrix (>=768px) -->
    <div class="hidden md:block overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-2xs">
      <table class="w-full border-collapse text-left min-w-[1100px] table-fixed">
        <thead>
          <tr class="bg-slate-50 border-b border-slate-200 text-slate-700 text-xs font-semibold">
            <th class="py-3 px-3.5 w-[132px] min-w-[132px] border-r border-slate-200 sticky left-0 bg-slate-50 z-10 sticky-time-col">Period / Time</th>
            ${days.map(d => {
              const dCount = (faculty.sessions || []).filter(s => s.day === d).length;
              return `
                <th class="py-3 px-3 min-w-[162px] border-r border-slate-200 last:border-r-0">
                  <div class="flex items-center justify-between gap-1.5">
                    <span>${DAY_TITLE_LABELS[d]}</span>
                    ${dCount > 0 ? `<span class="text-[11px] font-mono font-medium px-1.5 py-0.2 rounded bg-slate-200/70 text-slate-700 tabular-nums">${dCount}</span>` : ''}
                  </div>
                </th>
              `;
            }).join('')}
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-200 text-sm">
  `;

  PERIOD_DEFINITIONS.forEach((periodDef, pIdx) => {
    const rowBg = pIdx % 2 === 1 ? 'bg-slate-50/35' : 'bg-white';
    html += `
      <tr class="${rowBg}">
        <td class="py-2.5 px-3.5 border-r border-slate-200 sticky left-0 ${pIdx % 2 === 1 ? 'bg-[#F8FAFC]' : 'bg-white'} z-10 align-top sticky-time-col">
          ${formatPeriodAxisCell(periodDef)}
        </td>
    `;

    days.forEach(day => {
      const matched = faculty.sessions.filter(s => s.day === day && getSessionPeriodIndex(s) === pIdx);
      if (matched.length === 0) {
        html += `
          <td class="p-1.5 border-r border-slate-200/80 last:border-r-0 align-top">
            <div class="h-14"></div>
          </td>
        `;
      } else {
        html += `
          <td class="p-1.5 border-r border-slate-200/80 last:border-r-0 align-top">
            <div class="space-y-1.5">
              ${matched.map(s => {
                const leftBar = s.isDuty ? '#94A3B8' : instColor.ring;
                const displaySubject = s.isDuty ? (s.dutyName || s.subject.replace(/\s*\(Office Duty\)/i, '')) : s.subject;
                const displayRoom = s.room === 'OFFICE / DEPT' ? 'Dept' : s.room;
                const displaySection = s.isDuty ? 'Office Duty' : (s.section && s.section !== '-' ? `Sec ${s.section}` : 'Lec / Lab');
                return `
                  <div class="min-h-[58px] px-2.5 py-2 rounded-md flex flex-col justify-between border shadow-2xs ${
                    s.isDuty
                      ? 'bg-slate-50/90 border-slate-200 text-slate-600'
                      : 'bg-white border-slate-200/95 hover:border-blue-300 transition-colors'
                  }" style="border-left: 3px solid ${leftBar}">
                    <div class="flex items-center justify-between gap-1.5 min-w-0">
                      <span class="font-semibold text-[13px] ${s.isDuty ? 'text-slate-600' : 'text-slate-900'} truncate" title="${escapeHtmlAttr(s.subject)}">${displaySubject}</span>
                      ${s.isDuty ? `
                        <span class="px-1.5 py-0.5 rounded font-mono text-[10px] font-medium bg-slate-200/70 text-slate-600 shrink-0 leading-none">${displayRoom}</span>
                      ` : `
                        <button type="button" onclick="viewRoomFromSchedule('${escapeHtmlAttr(s.room)}')" title="Inspect room ${escapeHtmlAttr(s.room)}" class="px-1.5 py-0.5 rounded font-mono text-[10.5px] font-medium bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200/80 shrink-0 leading-none cursor-pointer transition-colors">
                          ${displayRoom}
                        </button>
                      `}
                    </div>
                    <div class="text-[11px] flex justify-between items-center pt-1.5 mt-1 border-t border-slate-100">
                      <span class="font-medium ${s.isDuty ? 'text-slate-500' : 'text-blue-700'} truncate">${displaySection}</span>
                      <span class="font-mono text-[10px] text-slate-400 tabular-nums shrink-0">${periodDef.shortLabel}</span>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          </td>
        `;
      }
    });

    html += `</tr>`;
  });

  html += `
        </tbody>
      </table>
    </div>
  `;

  if (container) container.innerHTML = html;
  initIcons();
}

/* =========================================================================
   TAB 4: DEPARTMENT FACULTY ROSTER (FLR-001)
   ========================================================================= */
function renderRosterView() {
  if (!state.data) return;

  const container = document.getElementById('roster-container');
  if (!container) return;

  const instructors = state.data.instructors || [];

  container.innerHTML = `
    <!-- 1. Mobile Faculty Cards (<640px) -->
    <div class="sm:hidden space-y-2.5">
      ${instructors.map((inst, idx) => {
        const color = getInstructorColor(inst.name);
        const classCount = inst.sessions.filter(s => !s.isDuty).length;
        const isFT = inst.status && (inst.status.includes('FT') || inst.status.toUpperCase().includes('FULL-TIME'));
        return `
          <div class="bg-white rounded-lg border border-slate-200 p-3.5 flex flex-col gap-2 shadow-2xs" style="border-left: 3px solid ${color.ring}">
            <div class="flex items-start justify-between gap-2">
              <div class="flex items-center gap-2 min-w-0">
                <span class="text-xs font-mono text-slate-400">${String(idx + 1).padStart(2, '0')}</span>
                <span class="font-semibold text-sm text-slate-900 truncate">${inst.name}</span>
              </div>
              <span class="px-2 py-0.5 rounded-full text-[11px] font-medium shrink-0 ${
                isFT ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-800 border border-amber-200'
              }">
                ${inst.status}
              </span>
            </div>
            <div class="text-xs text-slate-600 leading-snug">${inst.qualification || '-'}</div>
            <div class="flex items-center justify-between pt-2 border-t border-slate-100">
              <span class="text-xs font-mono font-semibold text-slate-700">${classCount} classes / wk</span>
              <button type="button" class="px-3 py-1 rounded-md text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 cursor-pointer"
                      onclick="viewInstructor('${escapeHtmlAttr(inst.name)}')">
                View Timetable →
              </button>
            </div>
          </div>
        `;
      }).join('')}
    </div>

    <!-- 2. Desktop Faculty Roster Table (>=640px) -->
    <div class="hidden sm:block overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-2xs">
      <table class="w-full text-left text-xs divide-y divide-slate-200">
        <thead class="bg-slate-50 text-xs font-semibold text-slate-700">
          <tr>
            <th class="py-3 px-4 w-12">#</th>
            <th class="py-3 px-4">Faculty Member</th>
            <th class="py-3 px-4">Employment Status</th>
            <th class="py-3 px-4">Academic Qualification</th>
            <th class="py-3 px-4 text-center">Weekly Classes</th>
            <th class="py-3 px-4 text-right">Timetable</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-200 text-xs">
          ${instructors.map((inst, idx) => {
            const color = getInstructorColor(inst.name);
            const isFT = inst.status && (inst.status.includes('FT') || inst.status.toUpperCase().includes('FULL-TIME'));
            return `
              <tr class="hover:bg-slate-50/80 transition-colors">
                <td class="py-3 px-4 text-slate-400 font-mono text-xs tabular-nums">${String(idx + 1).padStart(2, '0')}</td>
                <td class="py-3 px-4 font-semibold text-slate-900">
                  <div class="flex items-center gap-2.5">
                    <span class="w-2.5 h-2.5 rounded-full shrink-0" style="background-color: ${color.ring}"></span>
                    <span>${inst.name}</span>
                  </div>
                </td>
                <td class="py-3 px-4">
                  <span class="px-2.5 py-0.5 rounded-full text-[11px] font-medium ${
                    isFT ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-amber-50 text-amber-800 border border-amber-200'
                  }">
                    ${inst.status}
                  </span>
                </td>
                <td class="py-3 px-4 text-slate-600 text-xs">${inst.qualification || '-'}</td>
                <td class="py-3 px-4 text-center font-semibold font-mono text-slate-900 tabular-nums">${inst.sessions.filter(s => !s.isDuty).length}</td>
                <td class="py-3 px-4 text-right">
                  <button type="button" class="px-3 py-1 rounded-md text-xs font-medium text-slate-700 bg-white hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 border border-slate-200 transition-colors cursor-pointer"
                          onclick="viewInstructor('${escapeHtmlAttr(inst.name)}')">
                    View Timetable →
                  </button>
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    </div>
  `;
}

// Collapsible Faculty Color Key Bar in Master Timetable
function renderInstructorLegend() {
  const legendContainer = document.getElementById('instructor-legend-bar');
  if (!legendContainer || !state.data || !state.data.instructors) return;

  const instructors = state.data.instructors;
  const activeInstructor = state.masterFilter.instructor;
  const hasSelectedInstructor = activeInstructor !== 'ALL';
  const isCollapsed = Boolean(state.legendCollapsed);

  legendContainer.innerHTML = `
    <div>
      <div class="flex flex-wrap items-center justify-between gap-2">
        <div class="flex items-center gap-2 min-w-0">
          <span class="text-xs font-semibold text-slate-700">Faculty Color Key</span>
          <span class="text-xs text-slate-500 hidden sm:inline">— Filter master schedule by instructor</span>
          ${hasSelectedInstructor ? `
            <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200">
              <span>Filtered: ${activeInstructor.split(',')[0]}</span>
              <button type="button" onclick="filterByInstructor('ALL')" class="hover:text-blue-900 cursor-pointer" title="Clear instructor filter" aria-label="Clear instructor filter">
                <i data-lucide="x" class="w-3 h-3" aria-hidden="true"></i>
              </button>
            </span>
          ` : ''}
        </div>

        <div class="flex items-center gap-1.5 ml-auto">
          ${hasSelectedInstructor ? `
            <button type="button"
                    class="h-7 px-2.5 rounded-md text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 transition-colors cursor-pointer"
                    onclick="filterByInstructor('ALL')">
              Show All (${instructors.length})
            </button>
          ` : ''}

          <button type="button"
                  aria-expanded="${!isCollapsed ? 'true' : 'false'}"
                  class="h-7 px-2.5 rounded-md text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 border border-slate-200 flex items-center gap-1 transition-colors cursor-pointer"
                  onclick="toggleInstructorLegend()">
            <span>${isCollapsed ? `Show Faculty Key (${instructors.length})` : 'Hide Faculty Key'}</span>
            <i data-lucide="${isCollapsed ? 'chevron-down' : 'chevron-up'}" class="w-3.5 h-3.5" aria-hidden="true"></i>
          </button>
        </div>
      </div>

      ${isCollapsed ? '' : `
        <div class="flex items-center gap-1.5 flex-nowrap sm:flex-wrap overflow-x-auto no-scrollbar mt-2.5 pt-2.5 border-t border-slate-100">
          ${instructors.map(i => {
            const color = getInstructorColor(i.name);
            const isSelected = activeInstructor === i.name;
            const surname = i.name.split(',')[0];
            const classCount = (i.sessions || []).filter(s => !s.isDuty).length;

            const chipStateClasses = isSelected
              ? 'bg-blue-700 text-white border-blue-700 font-semibold'
              : hasSelectedInstructor
                ? 'bg-white text-slate-500 border-slate-200 opacity-65 hover:opacity-100 hover:border-slate-300 font-medium'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 hover:text-slate-900 hover:border-slate-300 font-medium';

            return `
              <button type="button"
                      aria-pressed="${isSelected ? 'true' : 'false'}"
                      aria-label="Filter by instructor ${escapeHtmlAttr(i.name)}"
                      title="${escapeHtmlAttr(`${i.name} (${classCount} academic classes)`)}"
                      class="h-6 px-2 rounded text-xs transition-colors inline-flex items-center gap-1.5 border shrink-0 cursor-pointer ${chipStateClasses}"
                      onclick="filterByInstructor('${escapeHtmlAttr(i.name)}')">
                <span class="w-2 h-2 rounded-full shrink-0" style="background-color: ${isSelected ? '#ffffff' : color.ring}"></span>
                <span class="whitespace-nowrap">${surname}</span>
              </button>
            `;
          }).join('')}
        </div>
      `}
    </div>
  `;
}

window.toggleInstructorLegend = function() {
  state.legendCollapsed = !state.legendCollapsed;
  renderInstructorLegend();
  initIcons();
};

window.filterByInstructor = function(name) {
  if (name !== 'ALL' && state.masterFilter.instructor === name) {
    state.masterFilter.instructor = 'ALL';
  } else {
    state.masterFilter.instructor = name;
  }
  const masterInst = document.getElementById('filter-master-instructor');
  if (masterInst) masterInst.value = state.masterFilter.instructor;
  renderMasterSchedule();
};

window.viewInstructor = function(name) {
  selectInstructorAutocomplete(name);
  switchTab('instructor');
};

/* =========================================================================
   FILE UPLOAD (SheetJS Integration)
   ========================================================================= */
function setupFileUpload() {
  const dropZone = document.getElementById('drop-zone');
  const fileInput = document.getElementById('excel-file-input');
  const uploadStatus = document.getElementById('upload-status');

  if (!dropZone || !fileInput) return;

  dropZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropZone.classList.add('border-blue-500', 'bg-blue-50/50');
  });

  dropZone.addEventListener('dragleave', () => {
    dropZone.classList.remove('border-blue-500', 'bg-blue-50/50');
  });

  dropZone.addEventListener('drop', (e) => {
    e.preventDefault();
    dropZone.classList.remove('border-blue-500', 'bg-blue-50/50');
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  });

  fileInput.addEventListener('change', (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  });

  function handleFile(file) {
    if (!file.name.match(/\.(xlsx|xls|csv)$/i)) {
      showUploadStatus('Please upload a valid Excel (.xlsx, .xls) or CSV file.', 'error');
      return;
    }

    showUploadStatus(`Reading and parsing "${file.name}"...`, 'info');

    const reader = new FileReader();
    reader.onload = function(e) {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });

        const parsed = window.parseScheduleWorkbook(workbook);

        if (!parsed.instructors || parsed.instructors.length === 0) {
          showUploadStatus('No individual schedule sheets found in this file. Please make sure the sheets have "INDIVIDUAL FACULTY TEACHING LOAD ASSIGNMENT" or "CLASS SCHEDULE".', 'error');
          return;
        }

        state.data = parsed;
        annotateSessionPeriods(state.data);
        try {
          localStorage.setItem('cea_schedule_data', JSON.stringify(parsed));
        } catch (storageErr) {
          console.warn('LocalStorage quota exceeded, data will remain in memory for this session.', storageErr);
        }

        setupDefaults();
        renderAll();

        showUploadStatus(`Successfully parsed ${parsed.instructors.length} instructors, ${parsed.sessions.length} sessions across ${parsed.rooms.length} rooms!`, 'success');

        setTimeout(() => {
          const uploadModal = document.getElementById('upload-modal');
          if (uploadModal) uploadModal.classList.add('hidden');
          showNotification(`Loaded new schedule from ${file.name}`, 'success');
        }, 1200);

      } catch (err) {
        console.error('Error parsing workbook:', err);
        showUploadStatus(`Failed to parse file: ${err.message}`, 'error');
      }
    };
    reader.readAsArrayBuffer(file);
  }

  function showUploadStatus(msg, type) {
    if (!uploadStatus) return;
    uploadStatus.classList.remove('hidden', 'text-blue-600', 'text-red-600', 'text-emerald-600');
    if (type === 'error') uploadStatus.classList.add('text-red-600');
    else if (type === 'success') uploadStatus.classList.add('text-emerald-600');
    else uploadStatus.classList.add('text-blue-600');
    uploadStatus.textContent = msg;
  }
}

// Notification Toast
function showNotification(msg, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `fixed bottom-5 right-5 z-50 px-4 py-2.5 border text-xs font-mono font-semibold flex items-center gap-2 transition-all transform translate-y-2 opacity-0 ${
    type === 'success' ? 'bg-emerald-900 border-emerald-700 text-white' : 'bg-slate-900 border-slate-700 text-white'
  }`;
  toast.innerHTML = `<span>${msg}</span>`;
  document.body.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.remove('translate-y-2', 'opacity-0');
  });

  setTimeout(() => {
    toast.classList.add('translate-y-2', 'opacity-0');
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

// CSV Exporter
function exportScheduleToCsv() {
  if (!state.data || !state.data.sessions) return;

  const headers = ['Day', 'Period', 'TimeSlot', 'Subject', 'Section', 'Room', 'Instructor', 'IsOfficeDuty'];
  const rows = state.data.sessions.map(s => {
    const pDef = PERIOD_DEFINITIONS[getSessionPeriodIndex(s)];
    return [
      `"${s.day}"`,
      `"${pDef ? pDef.code : ''}"`,
      `"${pDef ? pDef.shortLabel : s.timeSlot}"`,
      `"${s.subject}"`,
      `"${s.section}"`,
      `"${s.room}"`,
      `"${s.instructor}"`,
      s.isDuty ? 'Yes' : 'No'
    ];
  });

  const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `CEA_Schedule_Export_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/* =========================================================================
   LIVE CLOCK & CURRENT CLASS AVAILABILITY ENGINE (Asia/Manila Timezone)
   ========================================================================= */
const MANILA_TIMEZONE = 'Asia/Manila';

function getManilaTimeSnapshot() {
  const now = window.__TEST_CLOCK_DATE ? new Date(window.__TEST_CLOCK_DATE) : new Date();

  const timeFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: MANILA_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  });

  const dateFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: MANILA_TIMEZONE,
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric'
  });

  const partsFormatter = new Intl.DateTimeFormat('en-US', {
    timeZone: MANILA_TIMEZONE,
    weekday: 'long',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hourCycle: 'h23'
  });

  const parts = {};
  partsFormatter.formatToParts(now).forEach(p => {
    if (p.type !== 'literal') parts[p.type] = p.value;
  });

  const dayOfWeek = (parts.weekday || 'MONDAY').toUpperCase();
  const dayTitle = DAY_TITLE_LABELS[dayOfWeek] || (parts.weekday || 'Monday');
  const hour24 = parseInt(parts.hour || '0', 10) % 24;
  const minute = parseInt(parts.minute || '0', 10);
  const minutesFromMidnight = hour24 * 60 + minute;
  const dateKey = `${parts.year}-${parts.month}-${parts.day}-${dayOfWeek}`;

  const isAcademicDay = dayOfWeek !== 'SUNDAY';
  const activePeriod = isAcademicDay
    ? (PERIOD_DEFINITIONS.find(p => minutesFromMidnight >= p.startMin && minutesFromMidnight < p.endMin) || null)
    : null;
  const nextPeriod = isAcademicDay
    ? (PERIOD_DEFINITIONS.find(p => p.startMin > minutesFromMidnight) || null)
    : null;

  return {
    now,
    timeDisplay: timeFormatter.format(now),
    dateDisplay: dateFormatter.format(now),
    dayOfWeek,
    dayTitle,
    isAcademicDay,
    minutesFromMidnight,
    dateKey,
    activePeriod,
    nextPeriod
  };
}

function getTodayScheduleBreakdown(snapshot) {
  if (!state.data || !Array.isArray(state.data.sessions)) {
    return {
      hasScheduleData: false,
      ongoing: [],
      upcoming: [],
      ended: [],
      allToday: [],
      ongoingDutyCount: 0
    };
  }

  const includeDuty = Boolean(state.liveAvailability && state.liveAvailability.includeDuty);
  const daySessionsAll = state.data.sessions.filter(s => s && s.day === snapshot.dayOfWeek);
  const ongoingDutyCount = snapshot.activePeriod
    ? daySessionsAll.filter(s => s.isDuty && getSessionPeriodIndex(s) === snapshot.activePeriod.index).length
    : 0;

  const daySessions = daySessionsAll.filter(s => includeDuty ? true : !s.isDuty);

  const ongoing = [];
  const upcoming = [];
  const ended = [];
  const allToday = [];

  daySessions.forEach(s => {
    const pIdx = getSessionPeriodIndex(s);
    const periodDef = PERIOD_DEFINITIONS[pIdx] || PERIOD_DEFINITIONS[0];

    let statusCode = 'ENDED';
    let statusLabel = 'Already Ended';
    let statusDetail = `Ended at ${periodDef.end}`;

    if (snapshot.minutesFromMidnight >= periodDef.startMin && snapshot.minutesFromMidnight < periodDef.endMin) {
      const rem = periodDef.endMin - snapshot.minutesFromMidnight;
      statusCode = 'ONGOING';
      statusLabel = 'In Progress';
      statusDetail = `${rem} min remaining in ${periodDef.code}`;
    } else if (snapshot.minutesFromMidnight < periodDef.startMin) {
      const diff = periodDef.startMin - snapshot.minutesFromMidnight;
      const hrs = Math.floor(diff / 60);
      const mins = diff % 60;
      statusCode = 'UPCOMING';
      statusLabel = 'Not Started Yet';
      statusDetail = hrs > 0 ? `Starts in ${hrs}h ${mins}m (${periodDef.start})` : `Starts in ${mins}m (${periodDef.start})`;
    }

    const enriched = {
      session: s,
      periodDef,
      statusCode,
      statusLabel,
      statusDetail
    };

    allToday.push(enriched);
    if (statusCode === 'ONGOING') ongoing.push(enriched);
    else if (statusCode === 'UPCOMING') upcoming.push(enriched);
    else ended.push(enriched);
  });

  const sortByPeriodAndSubject = (a, b) => {
    if (a.periodDef.index !== b.periodDef.index) return a.periodDef.index - b.periodDef.index;
    return String(a.session.subject || '').localeCompare(String(b.session.subject || ''));
  };

  ongoing.sort(sortByPeriodAndSubject);
  upcoming.sort(sortByPeriodAndSubject);
  ended.sort(sortByPeriodAndSubject);
  allToday.sort(sortByPeriodAndSubject);

  return {
    hasScheduleData: true,
    ongoing,
    upcoming,
    ended,
    allToday,
    ongoingDutyCount
  };
}

let liveClockTimerId = null;

function initLiveClock() {
  const triggerEl = document.getElementById('live-clock-trigger');
  if (triggerEl) {
    triggerEl.addEventListener('click', () => {
      toggleLiveAvailabilityPanel();
    });
    triggerEl.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleLiveAvailabilityPanel();
      }
    });
  }

  updateLiveClockUI(true);
  if (liveClockTimerId) clearInterval(liveClockTimerId);
  liveClockTimerId = setInterval(() => {
    updateLiveClockUI(false);
  }, 1000);
}

window.toggleLiveAvailabilityPanel = function(forceState) {
  const nextOpen = typeof forceState === 'boolean' ? forceState : !state.liveAvailability.isOpen;
  state.liveAvailability.isOpen = nextOpen;

  if (nextOpen) {
    // Default to showing strictly ongoing classes matching the current day and time when clicked
    state.liveAvailability.statusFilter = 'ONGOING';
  }

  const triggerEl = document.getElementById('live-clock-trigger');
  const panelEl = document.getElementById('live-availability-panel');
  const chevronEl = document.getElementById('live-clock-chevron');
  const ctaLabelEl = document.getElementById('live-clock-cta-label');

  if (triggerEl) {
    triggerEl.setAttribute('aria-expanded', nextOpen ? 'true' : 'false');
  }

  if (chevronEl) {
    if (nextOpen) chevronEl.classList.add('rotate-180');
    else chevronEl.classList.remove('rotate-180');
  }

  if (ctaLabelEl) {
    ctaLabelEl.textContent = nextOpen ? 'Hide Current Classes' : 'Check Current Classes';
  }

  if (panelEl) {
    if (nextOpen) {
      panelEl.classList.remove('hidden');
      renderLiveAvailabilityPanel();
    } else {
      panelEl.classList.add('hidden');
    }
  }

  initIcons();
};

window.setLiveAvailabilityFilter = function(filterMode) {
  state.liveAvailability.statusFilter = filterMode;
  renderLiveAvailabilityPanel();
  initIcons();
};

window.toggleLiveIncludeDuty = function() {
  state.liveAvailability.includeDuty = !state.liveAvailability.includeDuty;
  updateLiveClockUI(true);
  initIcons();
};

function updateLiveClockUI(forcePanelRefresh = false) {
  const snapshot = getManilaTimeSnapshot();
  const timeEl = document.getElementById('live-clock-time');
  const dateEl = document.getElementById('live-clock-date');
  const pulseEl = document.getElementById('live-clock-pulse');
  const periodBadgeEl = document.getElementById('live-clock-period-badge');
  const summaryTitleEl = document.getElementById('live-clock-summary-title');
  const summarySubEl = document.getElementById('live-clock-summary-sub');

  if (timeEl) timeEl.textContent = snapshot.timeDisplay;
  if (dateEl) dateEl.textContent = snapshot.dateDisplay;

  const breakdown = getTodayScheduleBreakdown(snapshot);
  const periodKey = `${snapshot.dateKey}|${snapshot.activePeriod ? snapshot.activePeriod.code : 'NONE'}|${Math.floor(snapshot.minutesFromMidnight)}`;

  // State 4: No schedule data available
  if (!breakdown.hasScheduleData) {
    if (pulseEl) pulseEl.className = 'w-2 h-2 rounded-full bg-slate-400 shrink-0';
    if (periodBadgeEl) {
      periodBadgeEl.className = 'self-start w-fit shrink-0 px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200';
      periodBadgeEl.textContent = 'No Schedule Data';
    }
    if (summaryTitleEl) summaryTitleEl.textContent = 'No schedule dataset is currently loaded';
    if (summarySubEl) summarySubEl.textContent = 'Import an Excel schedule workbook or reset to the default dataset.';
  } else if (snapshot.activePeriod) {
    const p = snapshot.activePeriod;
    const ongoingCount = breakdown.ongoing.length;
    const remMin = p.endMin - snapshot.minutesFromMidnight;

    // State 1: Classes currently in progress
    if (ongoingCount > 0) {
      if (pulseEl) pulseEl.className = 'w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0';
      if (periodBadgeEl) {
        periodBadgeEl.className = 'self-start w-fit shrink-0 px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200';
        periodBadgeEl.textContent = `${p.code} In Session`;
      }
      if (summaryTitleEl) {
        summaryTitleEl.textContent = `${ongoingCount} academic ${ongoingCount === 1 ? 'class is' : 'classes are'} currently in progress`;
      }
      if (summarySubEl) {
        summarySubEl.textContent = `Period ${p.code} (${p.label}) • ${remMin} min remaining • ${breakdown.upcoming.length} upcoming later today`;
      }
    } else {
      // State 2: Active period window, but no classes scheduled at the current time
      if (pulseEl) pulseEl.className = 'w-2 h-2 rounded-full bg-blue-500 shrink-0';
      if (periodBadgeEl) {
        periodBadgeEl.className = 'self-start w-fit shrink-0 px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-blue-50 text-blue-700 border border-blue-200';
        periodBadgeEl.textContent = `${p.code} (${p.shortLabel})`;
      }
      if (summaryTitleEl) {
        summaryTitleEl.textContent = `No classes scheduled during Period ${p.code} on ${snapshot.dayTitle}`;
      }
      if (summarySubEl) {
        summarySubEl.textContent = `${breakdown.upcoming.length} upcoming and ${breakdown.ended.length} completed on ${snapshot.dayTitle}`;
      }
    }
  } else {
    // State 3: Outside scheduled class hours (single non-redundant status message)
    if (pulseEl) pulseEl.className = 'w-2 h-2 rounded-full bg-slate-400 shrink-0';
    if (!snapshot.isAcademicDay) {
      if (periodBadgeEl) {
        periodBadgeEl.className = 'self-start w-fit shrink-0 px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200';
        periodBadgeEl.textContent = 'Non-Instructional Day';
      }
      if (summaryTitleEl) summaryTitleEl.textContent = 'No classes scheduled today (Sunday)';
      if (summarySubEl) summarySubEl.textContent = 'Regular academic classes run Monday through Saturday, 7:30 AM – 9:00 PM.';
    } else if (snapshot.nextPeriod) {
      if (periodBadgeEl) {
        periodBadgeEl.className = 'self-start w-fit shrink-0 px-2 py-0.5 rounded text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-200';
        periodBadgeEl.textContent = 'Before Class Hours';
      }
      if (summaryTitleEl) {
        summaryTitleEl.textContent = `Scheduled classes for ${snapshot.dayTitle} begin at 7:30 AM`;
      }
      if (summarySubEl) {
        summarySubEl.textContent = `${breakdown.upcoming.length} classes scheduled today across Periods P1–P9.`;
      }
    } else {
      if (periodBadgeEl) {
        periodBadgeEl.className = 'self-start w-fit shrink-0 px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700 border border-slate-200';
        periodBadgeEl.textContent = 'Outside Class Hours';
      }
      if (summaryTitleEl) {
        summaryTitleEl.textContent = `All ${breakdown.ended.length} scheduled classes for ${snapshot.dayTitle} have ended`;
      }
      if (summarySubEl) {
        summarySubEl.textContent = 'Daily academic schedule hours conclude at 9:00 PM (Period P9).';
      }
    }
  }

  if (state.liveAvailability.isOpen && (forcePanelRefresh || state.liveAvailability.lastPeriodKey !== periodKey)) {
    state.liveAvailability.lastPeriodKey = periodKey;
    renderLiveAvailabilityPanel();
  }
  state.liveAvailability.lastDateKey = snapshot.dateKey;
}

function renderLiveAvailabilityPanel() {
  const panelEl = document.getElementById('live-availability-panel');
  if (!panelEl) return;

  const snapshot = getManilaTimeSnapshot();
  const breakdown = getTodayScheduleBreakdown(snapshot);

  if (!breakdown.hasScheduleData) {
    panelEl.innerHTML = `
      <div class="p-6 text-center bg-slate-50">
        <div class="text-sm font-semibold text-slate-900">No schedule data available</div>
        <p class="text-xs text-slate-500 mt-1">Please import a schedule workbook or reset to the default dataset.</p>
      </div>
    `;
    return;
  }

  const activeFilter = state.liveAvailability.statusFilter || 'ONGOING';
  const includeDuty = Boolean(state.liveAvailability.includeDuty);

  let displayedItems = breakdown.ongoing;
  let sectionTitle = `Classes in progress (${snapshot.dayTitle} • ${snapshot.timeDisplay})`;
  if (activeFilter === 'UPCOMING') {
    displayedItems = breakdown.upcoming;
    sectionTitle = `Upcoming classes today (${snapshot.dayTitle})`;
  } else if (activeFilter === 'ENDED') {
    displayedItems = breakdown.ended;
    sectionTitle = `Completed classes today (${snapshot.dayTitle})`;
  } else if (activeFilter === 'ALL_TODAY') {
    displayedItems = breakdown.allToday;
    sectionTitle = `All scheduled classes for ${snapshot.dayTitle}`;
  }

  const renderStatusBadge = (item) => {
    if (item.statusCode === 'ONGOING') {
      return `
        <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
          <span>In Progress</span>
        </span>
      `;
    }
    if (item.statusCode === 'UPCOMING') {
      return `
        <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-amber-50 text-amber-800 border border-amber-200">
          <span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
          <span>Not Started</span>
        </span>
      `;
    }
    return `
      <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
        <span class="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
        <span>Ended</span>
      </span>
    `;
  };

  panelEl.innerHTML = `
    <!-- Panel Top Control & Filter Bar -->
    <div class="px-4 sm:px-5 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2.5">
      <div class="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
        <button type="button"
                onclick="setLiveAvailabilityFilter('ONGOING')"
                aria-pressed="${activeFilter === 'ONGOING' ? 'true' : 'false'}"
                class="h-7 px-2.5 rounded-md text-xs border inline-flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer ${
                  activeFilter === 'ONGOING'
                    ? 'bg-emerald-700 text-white border-emerald-700 font-semibold'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100 font-medium'
                }">
          <span class="w-2 h-2 rounded-full ${activeFilter === 'ONGOING' ? 'bg-emerald-200' : 'bg-emerald-600'}"></span>
          <span>In Progress</span>
          <span class="px-1.5 py-0.2 rounded text-[10.5px] font-mono tabular-nums ${activeFilter === 'ONGOING' ? 'bg-emerald-800 text-white' : 'bg-slate-100 text-slate-700'}">${breakdown.ongoing.length}</span>
        </button>

        <button type="button"
                onclick="setLiveAvailabilityFilter('UPCOMING')"
                aria-pressed="${activeFilter === 'UPCOMING' ? 'true' : 'false'}"
                class="h-7 px-2.5 rounded-md text-xs border inline-flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer ${
                  activeFilter === 'UPCOMING'
                    ? 'bg-amber-700 text-white border-amber-700 font-semibold'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100 font-medium'
                }">
          <span class="w-2 h-2 rounded-full ${activeFilter === 'UPCOMING' ? 'bg-amber-200' : 'bg-amber-500'}"></span>
          <span>Not Started</span>
          <span class="px-1.5 py-0.2 rounded text-[10.5px] font-mono tabular-nums ${activeFilter === 'UPCOMING' ? 'bg-amber-800 text-white' : 'bg-slate-100 text-slate-700'}">${breakdown.upcoming.length}</span>
        </button>

        <button type="button"
                onclick="setLiveAvailabilityFilter('ENDED')"
                aria-pressed="${activeFilter === 'ENDED' ? 'true' : 'false'}"
                class="h-7 px-2.5 rounded-md text-xs border inline-flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer ${
                  activeFilter === 'ENDED'
                    ? 'bg-slate-800 text-white border-slate-800 font-semibold'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100 font-medium'
                }">
          <span class="w-2 h-2 rounded-full bg-slate-400"></span>
          <span>Ended Today</span>
          <span class="px-1.5 py-0.2 rounded text-[10.5px] font-mono tabular-nums ${activeFilter === 'ENDED' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'}">${breakdown.ended.length}</span>
        </button>

        <button type="button"
                onclick="setLiveAvailabilityFilter('ALL_TODAY')"
                aria-pressed="${activeFilter === 'ALL_TODAY' ? 'true' : 'false'}"
                class="h-7 px-2.5 rounded-md text-xs border inline-flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer ${
                  activeFilter === 'ALL_TODAY'
                    ? 'bg-blue-700 text-white border-blue-700 font-semibold'
                    : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100 font-medium'
                }">
          <span>All ${snapshot.dayTitle}</span>
          <span class="px-1.5 py-0.2 rounded text-[10.5px] font-mono tabular-nums ${activeFilter === 'ALL_TODAY' ? 'bg-blue-800 text-white' : 'bg-slate-100 text-slate-700'}">${breakdown.allToday.length}</span>
        </button>
      </div>

      <div class="flex items-center gap-2 ml-auto">
        <button type="button"
                onclick="toggleLiveIncludeDuty()"
                aria-pressed="${includeDuty ? 'true' : 'false'}"
                class="h-7 px-2.5 rounded-md text-xs font-medium border transition-colors cursor-pointer ${
                  includeDuty
                    ? 'bg-blue-50 text-blue-700 border-blue-200'
                    : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-100'
                }">
          ${includeDuty ? 'Including Office Duty' : 'Academic Classes Only'}
        </button>

        <button type="button"
                onclick="toggleLiveAvailabilityPanel(false)"
                class="h-7 px-2.5 rounded-md text-xs font-medium bg-white hover:bg-slate-100 text-slate-600 hover:text-slate-900 border border-slate-200 transition-colors inline-flex items-center gap-1 cursor-pointer"
                aria-label="Close live class availability panel">
          <span>Close</span>
          <i data-lucide="x" class="w-3.5 h-3.5" aria-hidden="true"></i>
        </button>
      </div>
    </div>

    <!-- Main Body: Matching Classes or Concise Empty State -->
    <div class="p-4 sm:p-5 bg-white">
      <div class="text-xs font-medium text-slate-500 mb-3 flex items-center justify-between gap-2">
        <span>${sectionTitle}</span>
        <span class="font-mono text-[11px] text-slate-400">${snapshot.activePeriod ? `Active Period: ${snapshot.activePeriod.code} (${snapshot.activePeriod.label})` : 'Outside active class periods'}</span>
      </div>

      ${displayedItems.length === 0 ? `
        <div id="live-availability-empty" class="rounded-lg border border-slate-200 bg-slate-50/60 p-6 sm:p-8 text-center">
          <div class="max-w-md mx-auto flex flex-col items-center gap-1.5">
            <div class="w-9 h-9 rounded-full bg-white border border-slate-200 text-slate-500 flex items-center justify-center">
              <i data-lucide="clock" class="w-4 h-4" aria-hidden="true"></i>
            </div>
            <h3 class="text-sm font-semibold text-slate-900 mt-1">
              ${!snapshot.isAcademicDay
                ? 'No classes scheduled today (Sunday)'
                : !snapshot.activePeriod && !snapshot.nextPeriod && activeFilter === 'ONGOING'
                  ? `All ${breakdown.ended.length} scheduled classes for ${snapshot.dayTitle} have ended`
                  : activeFilter === 'ONGOING'
                    ? 'No classes scheduled right now'
                    : `No classes in this status for ${snapshot.dayTitle}`
              }
            </h3>
            <p class="text-xs text-slate-500 leading-relaxed">
              ${!snapshot.isAcademicDay
                ? 'Departmental classes run Monday through Saturday between 7:30 AM and 9:00 PM.'
                : !snapshot.activePeriod
                  ? `Current local time is ${snapshot.timeDisplay}, which is outside scheduled class hours (7:30 AM – 9:00 PM).`
                  : `No ${includeDuty ? 'sessions' : 'academic classes'} are scheduled during Period ${snapshot.activePeriod.code} (${snapshot.activePeriod.label}) on ${snapshot.dayTitle}.`
              }
            </p>
            ${snapshot.isAcademicDay && activeFilter === 'ONGOING' && (breakdown.upcoming.length > 0 || breakdown.ended.length > 0) ? `
              <div class="mt-3 flex flex-wrap items-center justify-center gap-2">
                ${breakdown.upcoming.length > 0 ? `
                  <button type="button" onclick="setLiveAvailabilityFilter('UPCOMING')" class="h-8 px-3 rounded-md text-xs font-medium bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 transition-colors cursor-pointer">
                    View ${breakdown.upcoming.length} Upcoming Today →
                  </button>
                ` : ''}
                ${breakdown.ended.length > 0 ? `
                  <button type="button" onclick="setLiveAvailabilityFilter('ENDED')" class="h-8 px-3 rounded-md text-xs font-medium bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 transition-colors cursor-pointer">
                    View ${breakdown.ended.length} Completed Today →
                  </button>
                ` : ''}
              </div>
            ` : ''}
          </div>
        </div>
      ` : `
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 max-h-[420px] overflow-y-auto pr-1">
          ${displayedItems.map(item => {
            const s = item.session;
            const pDef = item.periodDef;
            const color = getInstructorColor(s.instructor);
            const leftBarColor = s.isDuty ? '#94A3B8' : color.ring;
            const displaySubject = s.isDuty ? (s.dutyName || s.subject.replace(/\s*\(Office Duty\)/i, '')) : s.subject;
            const displaySection = s.isDuty ? 'Office Duty' : (s.section && s.section !== '-' ? `Sec ${s.section}` : 'Lec / Lab');

            return `
              <div class="rounded-lg border border-slate-200 bg-white p-3.5 flex flex-col justify-between gap-2.5 hover:border-slate-300 transition-colors shadow-2xs"
                   style="border-left: 3px solid ${leftBarColor}">
                <div>
                  <!-- Top Row: Class Name + Section & Live Schedule Status Badge -->
                  <div class="flex items-start justify-between gap-2">
                    <div class="min-w-0">
                      <div class="flex items-center gap-1.5 flex-wrap">
                        <span class="text-sm font-semibold text-slate-900">${displaySubject}</span>
                        <span class="text-[11px] font-mono font-medium px-1.5 py-0.2 rounded bg-slate-100 text-slate-700">${displaySection}</span>
                      </div>
                    </div>
                    <div class="shrink-0">
                      ${renderStatusBadge(item)}
                    </div>
                  </div>

                  <!-- Middle Row: Period Time & Assigned Room -->
                  <div class="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                    <div class="min-w-0 font-mono">
                      <span class="px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 text-[10.5px] font-semibold mr-1.5">${pDef.code}</span>
                      <span class="text-slate-700 font-medium tabular-nums">${pDef.start} – ${pDef.end}</span>
                    </div>
                    <button type="button"
                            onclick="viewRoomFromSchedule('${escapeHtmlAttr(s.room)}')"
                            class="px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-slate-100 hover:bg-blue-50 text-slate-700 hover:text-blue-700 border border-slate-200 transition-colors cursor-pointer whitespace-nowrap">
                      ${s.room}
                    </button>
                  </div>
                </div>

                <!-- Bottom Row: Instructor & Timing Detail -->
                <div class="pt-2 border-t border-slate-100 flex items-center justify-between gap-2 text-xs">
                  <button type="button"
                          onclick="viewInstructor('${escapeHtmlAttr(s.instructor)}')"
                          class="font-medium text-slate-700 hover:text-blue-700 flex items-center gap-1.5 truncate cursor-pointer"
                          title="Open ${escapeHtmlAttr(s.instructor)}'s timetable">
                    <span class="w-2 h-2 rounded-full shrink-0" style="background-color: ${leftBarColor}"></span>
                    <span class="truncate">${s.instructor}</span>
                  </button>
                  <span class="font-mono text-[11px] text-slate-400 shrink-0 tabular-nums">${item.statusDetail}</span>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `}

      <!-- Schedule Status Integrity Note -->
      <div class="mt-3 pt-2.5 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-400">
        <span>Status reflects official timetable hours (${MANILA_TIMEZONE}) and does not confirm physical room vacancy.</span>
        <span class="font-mono">${breakdown.ongoing.length} in progress • ${breakdown.upcoming.length} upcoming • ${breakdown.ended.length} ended</span>
      </div>
    </div>
  `;

  initIcons();
}
