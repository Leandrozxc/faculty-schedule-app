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
  MONDAY: 'MON',
  TUESDAY: 'TUE',
  WEDNESDAY: 'WED',
  THURSDAY: 'THU',
  FRIDAY: 'FRI',
  SATURDAY: 'SAT'
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
  legendCollapsed: false,
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

  const activeClasses = ['bg-slate-900', 'text-white'];
  const inactiveClasses = ['bg-white', 'text-slate-600', 'hover:text-slate-900', 'hover:bg-slate-50'];

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

  // Upload modal toggles
  const uploadBtn = document.getElementById('open-upload-btn');
  const uploadModal = document.getElementById('upload-modal');
  const closeUploadBtn = document.getElementById('close-upload-btn');
  const resetSampleBtn = document.getElementById('reset-sample-btn');

  if (uploadBtn && uploadModal) {
    uploadBtn.addEventListener('click', () => uploadModal.classList.remove('hidden'));
  }
  if (closeUploadBtn && uploadModal) {
    closeUploadBtn.addEventListener('click', () => uploadModal.classList.add('hidden'));
  }
  if (resetSampleBtn) {
    resetSampleBtn.addEventListener('click', () => {
      localStorage.removeItem('cea_schedule_data');
      state.data = window.SAMPLE_SCHEDULE_DATA;
      annotateSessionPeriods(state.data);
      setupDefaults();
      renderAll();
      showNotification('Reset to original sample schedule', 'success');
    });
  }

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

// Switch Active Tab (Flush Swiss Structural Tab Indicators)
function switchTab(tabName) {
  state.activeTab = tabName;
  document.querySelectorAll('[data-tab-target]').forEach(btn => {
    const isCurrent = btn.getAttribute('data-tab-target') === tabName;
    const numSpan = btn.querySelector('span.font-mono');
    btn.setAttribute('aria-selected', isCurrent ? 'true' : 'false');

    if (isCurrent) {
      btn.classList.add('border-blue-600', 'text-slate-900', 'font-semibold', 'bg-slate-50/70');
      btn.classList.remove('border-transparent', 'text-slate-500', 'hover:text-slate-900', 'hover:bg-slate-50/60', 'font-medium');
      if (numSpan) {
        numSpan.classList.add('text-blue-600', 'font-semibold');
        numSpan.classList.remove('text-slate-400');
      }
    } else {
      btn.classList.remove('border-blue-600', 'text-slate-900', 'font-semibold', 'bg-slate-50/70');
      btn.classList.add('border-transparent', 'text-slate-500', 'hover:text-slate-900', 'hover:bg-slate-50/60', 'font-medium');
      if (numSpan) {
        numSpan.classList.remove('text-blue-600', 'font-semibold');
        numSpan.classList.add('text-slate-400');
      }
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
      <div class="px-4 py-3 text-xs text-slate-400 text-center italic">
        No faculty found matching "${query}". Try searching by last name or subject (e.g. Polancos, Esplanada, Math).
      </div>
    `;
    activeSuggestionIndex = -1;
    return;
  }

  activeSuggestionIndex = -1;
  dropdown.innerHTML = matches.map((inst, index) => {
    const isSelected = inst.name === state.selectedInstructor;
    const color = getInstructorColor(inst.name);
    const matchedSubject = (tokens.length > 0 && !tokens.every(t => inst.name.toLowerCase().includes(t)))
      ? (inst.sessions || []).find(s => tokens.some(t => (s.subject || '').toLowerCase().includes(t)))
      : null;

    return `
      <div data-suggestion-item data-index="${index}" data-instructor-name="${escapeHtmlAttr(inst.name)}" class="px-3.5 py-2 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition-colors ${
        isSelected ? 'bg-blue-50/70 font-semibold text-blue-900' : 'text-slate-800'
      }">
        <div class="flex items-center gap-2.5 min-w-0 pr-2">
          <span class="w-2.5 h-2.5 rounded-xs flex-shrink-0" style="background-color: ${color.ring}"></span>
          <div class="truncate">
            <div class="text-xs truncate ${isSelected ? 'font-bold text-blue-900' : 'font-semibold'}">
              ${highlightMatchText(inst.name, tokens)}
            </div>
            <div class="text-[11px] text-slate-400 truncate">
              ${inst.qualification || inst.status || ''}
              ${matchedSubject ? ` • <span class="text-blue-600 font-medium">Teaches: ${matchedSubject.subject}</span>` : ''}
            </div>
          </div>
        </div>
        <div class="flex items-center gap-2 flex-shrink-0">
          <span class="px-1.5 py-0.5 text-[10px] font-mono font-semibold border ${
            inst.status && inst.status.includes('FT') ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-amber-50 text-amber-800 border-amber-200'
          }">
            ${inst.status || 'FACULTY'}
          </span>
          ${isSelected ? '<span class="text-blue-600 font-bold text-xs">✓</span>' : ''}
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
    const selectedEl = dropdown.querySelector('.bg-blue-50\\/70');
    if (selectedEl) {
      selectedEl.scrollIntoView({ block: 'nearest' });
    }
  }
}

function highlightMatchText(text, tokens) {
  if (!tokens || tokens.length === 0 || !text) return text;
  const escapedTokens = tokens.map(t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
  const regex = new RegExp(`(${escapedTokens.join('|')})`, 'gi');
  return text.replace(regex, '<mark class="bg-yellow-200 text-slate-900 px-0.5">$1</mark>');
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

  const masterInst = document.getElementById('filter-master-instructor');
  if (masterInst) {
    masterInst.value = name;
  }

  updateInstructorQuickBadge();
  renderInstructorDirectoryPills();
  renderInstructorSchedule();
  initIcons();
};

function renderInstructorDirectoryPills() {
  const container = document.getElementById('instructor-directory-pills');
  if (!container || !state.data || !state.data.instructors) return;

  const instructors = state.data.instructors;
  container.innerHTML = `
    <span class="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 mr-1 shrink-0">FACULTY (${instructors.length}):</span>
    ${instructors.map(inst => {
      const isSelected = inst.name === state.selectedInstructor;
      const color = getInstructorColor(inst.name);
      const surname = inst.name.split(',')[0];
      const classCount = (inst.sessions || []).filter(s => !s.isDuty).length;
      return `
        <button type="button"
                aria-pressed="${isSelected ? 'true' : 'false'}"
                onclick="selectInstructorAutocomplete('${escapeHtmlAttr(inst.name)}')"
                title="${escapeHtmlAttr(`${inst.name} (${classCount} academic classes)`)}"
                class="h-7 sm:h-6 px-2.5 sm:px-2 text-[11px] border inline-flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                  isSelected
                    ? 'bg-slate-900 text-white border-slate-900 font-bold'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100 hover:border-slate-400 font-medium'
                }">
          <span class="w-[7px] h-[7px] rounded-xs shrink-0" style="background-color: ${color.ring}"></span>
          <span class="whitespace-nowrap">${surname}</span>
        </button>
      `;
    }).join('')}
  `;
}

function updateInstructorQuickBadge() {
  const badgeEl = document.getElementById('instructor-quick-badge');
  if (!badgeEl || !state.selectedInstructor || !state.data) return;

  const faculty = state.data.instructors.find(i => i.name === state.selectedInstructor);
  if (!faculty) {
    badgeEl.innerHTML = '';
    return;
  }

  const color = getInstructorColor(faculty.name);
  badgeEl.innerHTML = `
    <span class="text-[11px] font-mono uppercase tracking-wider text-slate-400">Active:</span>
    <span class="px-2.5 py-1 text-xs font-semibold flex items-center gap-1.5 border bg-slate-50 text-slate-900 border-slate-300">
      <span class="w-2 h-2 rounded-xs" style="background-color: ${color.ring}"></span>
      <span class="truncate max-w-[180px]">${faculty.name.split(',')[0]}</span>
    </span>
  `;
}

// Format standardized time period for left column axis
function formatPeriodAxisCell(periodDef) {
  if (!periodDef) return '';
  return `
    <div class="flex flex-col leading-tight font-mono">
      <div class="flex items-center gap-1.5">
        <span class="px-1.5 py-0.5 text-[10px] font-bold bg-slate-900 text-white tracking-wider">${periodDef.code}</span>
        <span class="text-[10px] font-semibold text-slate-400 uppercase">${periodDef.shift.split(' ')[0]}</span>
      </div>
      <span class="text-[11.5px] font-bold text-slate-900 tabular-nums mt-1.5">${periodDef.start}</span>
      <span class="text-[10.5px] font-medium text-slate-500 tabular-nums">to ${periodDef.end}</span>
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
      ? `${filteredRooms.length} OF ${state.data.rooms.length} ROOMS`
      : `${state.data.rooms.length} ROOMS INDEXED`;
  }

  if (filteredRooms.length === 0) {
    container.innerHTML = `
      <div class="py-2 text-xs text-slate-400 italic">
        No rooms match "${escapeHtmlAttr(query)}". Try searching for ALLIED, BGANNEX, SAL, or GLEC.
      </div>
    `;
    return;
  }

  container.innerHTML = filteredRooms.map(r => {
    const isSelected = r === state.selectedRoom;
    const hasConflict = conflictRooms.has(r);

    let btnClasses = isSelected
      ? 'bg-slate-900 text-white border-slate-900 font-semibold'
      : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100 hover:border-slate-400 font-medium';

    if (hasConflict && !isSelected) {
      btnClasses = 'bg-red-50 text-red-900 border-red-300 hover:bg-red-100 font-semibold';
    }

    return `
      <button type="button" aria-pressed="${isSelected ? 'true' : 'false'}" class="h-7 px-2.5 text-xs border transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${btnClasses}" onclick="selectRoom('${escapeHtmlAttr(r)}')">
        <span class="font-mono text-[11px] whitespace-nowrap">${r}</span>
        ${hasConflict ? `<i data-lucide="alert-triangle" class="w-3 h-3 shrink-0 ${isSelected ? 'text-amber-300' : 'text-red-600'}" aria-label="Room has schedule conflict"></i>` : ''}
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
      <div class="flex flex-wrap items-center justify-between gap-3 sm:gap-4 bg-white px-3.5 sm:px-4 py-3 border border-slate-300">
        <div class="flex items-center gap-3">
          <div>
            <div class="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold">ACTIVE FACILITY LEDGER</div>
            <div class="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2 mt-0.5">
              <span class="font-mono tracking-tight">${currentRoom}</span>
              ${roomConflicts.length > 0
                ? `<span class="inline-flex items-center gap-1 px-2 py-0.5 text-[10.5px] font-mono bg-red-50 text-red-800 font-semibold border border-red-300"><i data-lucide="alert-triangle" class="w-3 h-3 text-red-600" aria-hidden="true"></i>${roomConflicts.length} CONFLICT${roomConflicts.length > 1 ? 'S' : ''}</span>`
                : `<span class="inline-flex items-center gap-1 px-2 py-0.5 text-[10.5px] font-mono bg-emerald-50 text-emerald-800 font-semibold border border-emerald-300"><i data-lucide="check" class="w-3 h-3 text-emerald-600" aria-hidden="true"></i>CONFLICT-FREE</span>`
              }
            </div>
          </div>
        </div>
        <div class="flex items-center gap-4 sm:gap-6">
          <div>
            <div class="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">ASSIGNED SESSIONS</div>
            <div class="text-xs sm:text-sm font-bold text-slate-900 font-mono tabular-nums mt-0.5">${occupiedSlots} / ${totalSlots} periods</div>
          </div>
          <div>
            <div class="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">UTILIZATION RATE</div>
            <div class="flex items-center gap-2 mt-0.5">
              <div class="w-20 sm:w-28 bg-slate-100 h-2 overflow-hidden border border-slate-300">
                <div class="bg-blue-600 h-full transition-all" style="width: ${utilPercent}%"></div>
              </div>
              <span class="text-xs font-bold text-slate-900 font-mono tabular-nums">${utilPercent}%</span>
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
        <div class="p-3 sm:p-3.5 bg-red-50 border border-red-300 border-l-4 border-l-red-600 text-red-950">
          <div class="text-xs font-bold uppercase tracking-wider flex items-center gap-2 text-red-900 font-mono">
            <i data-lucide="alert-triangle" class="w-4 h-4 text-red-600 shrink-0" aria-hidden="true"></i>
            <span>Room Double-Booking Detected in ${currentRoom}</span>
          </div>
          <div class="mt-2 text-xs space-y-1.5">
            ${roomConflicts.map(c => `
              <div class="bg-white px-2.5 py-1.5 border border-red-200 flex flex-wrap items-center gap-1.5">
                <span class="font-bold font-mono text-[11px] text-slate-800">${c.day} • ${c.timeSlot}:</span>
                ${c.sessions.map(s => `<span class="inline-flex items-center px-2 py-0.5 bg-red-50 text-red-900 border border-red-300 font-mono text-[11px] font-semibold">${s.subject} (Sec ${s.section}) — ${s.instructor}</span>`).join(' <span class="text-red-700 font-bold text-[11px] font-mono">OVERLAPS</span> ')}
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
      <div class="bg-white border border-slate-300 p-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        <button type="button" onclick="selectRoomMobileDay('ALL')" class="h-7 px-2.5 text-[11px] font-mono border shrink-0 transition-colors cursor-pointer ${
          activeMobileDay === 'ALL' ? 'bg-slate-900 text-white border-slate-900 font-bold' : 'bg-slate-50 text-slate-700 border-slate-300 font-medium'
        }">
          ALL (${roomSessions.length})
        </button>
        ${days.map(d => {
          const dCount = roomSessions.filter(s => s.day === d).length;
          const isSel = activeMobileDay === d;
          return `
            <button type="button" onclick="selectRoomMobileDay('${d}')" class="h-7 px-2.5 text-[11px] font-mono border shrink-0 transition-colors cursor-pointer ${
              isSel ? 'bg-blue-600 text-white border-blue-600 font-bold' : 'bg-white text-slate-700 border-slate-300 font-medium'
            }">
              ${DAY_SHORT_LABELS[d]} (${dCount})
            </button>
          `;
        }).join('')}
      </div>

      ${mobileDays.map(d => {
        const daySessions = roomSessions.filter(s => s.day === d);
        return `
          <div class="border border-slate-300 bg-white">
            <div class="bg-slate-900 text-white px-3 py-2 flex items-center justify-between font-mono text-xs">
              <span class="font-bold tracking-wider">${d} — ${currentRoom}</span>
              <span class="px-2 py-0.5 text-[10.5px] bg-slate-800 text-amber-300 border border-slate-700 font-bold">${daySessions.length} OCCUPIED</span>
            </div>
            <div class="divide-y divide-slate-200">
              ${PERIOD_DEFINITIONS.map((periodDef, pIdx) => {
                const matched = daySessions.filter(s => getSessionPeriodIndex(s) === pIdx);
                if (matched.length === 0) {
                  return `
                    <div class="px-3 py-2 flex items-center justify-between text-xs bg-slate-50/40">
                      <div class="flex items-center gap-2 font-mono">
                        <span class="px-1.5 py-0.5 text-[10px] font-bold bg-slate-200 text-slate-700">${periodDef.code}</span>
                        <span class="text-[11px] text-slate-500 tabular-nums">${periodDef.shortLabel}</span>
                      </div>
                      <span class="text-[10.5px] font-mono text-emerald-700 font-semibold">AVAILABLE</span>
                    </div>
                  `;
                }
                return matched.map(s => {
                  const color = getInstructorColor(s.instructor);
                  return `
                    <div role="button" tabindex="0" onclick="viewInstructor('${escapeHtmlAttr(s.instructor)}')" class="px-3 py-2.5 bg-white hover:bg-blue-50/40 flex flex-col gap-1 cursor-pointer" style="border-left: 4px solid ${color.ring}">
                      <div class="flex items-center justify-between gap-2">
                        <div class="flex items-center gap-2">
                          <span class="px-1.5 py-0.5 text-[10px] font-mono font-bold bg-slate-900 text-white">${periodDef.code}</span>
                          <span class="text-xs font-mono font-bold text-slate-700 tabular-nums">${periodDef.shortLabel}</span>
                        </div>
                        <span class="text-[11px] font-mono font-semibold px-1.5 py-0.5 bg-blue-50 text-blue-800 border border-blue-200">Sec ${s.section}</span>
                      </div>
                      <div class="flex items-center justify-between gap-2 mt-0.5">
                        <span class="text-sm font-bold text-slate-900">${s.subject}</span>
                        <span class="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                          <span class="w-2 h-2 rounded-xs shrink-0" style="background-color: ${color.ring}"></span>
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
    <div class="hidden md:block overflow-x-auto border border-slate-300 bg-white">
      <table class="w-full border-collapse text-left min-w-[1140px] table-fixed">
        <thead>
          <tr class="bg-slate-900 text-white text-[11px] font-mono font-bold uppercase tracking-wider">
            <th class="py-2.5 px-3 w-[124px] min-w-[124px] border-r border-slate-700 sticky left-0 bg-slate-900 z-10 sticky-time-col">PERIOD / TIME</th>
            ${days.map(d => `<th class="py-2.5 px-3 min-w-[170px] border-r border-slate-700 last:border-r-0">${d}</th>`).join('')}
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-300 text-sm">
  `;

  PERIOD_DEFINITIONS.forEach((periodDef, pIdx) => {
    const rowBg = pIdx % 2 === 1 ? 'bg-slate-50/60' : 'bg-white';
    html += `
      <tr class="${rowBg}">
        <td class="py-2.5 px-3 border-r border-slate-300 sticky left-0 ${pIdx % 2 === 1 ? 'bg-[#F8FAFC]' : 'bg-white'} z-10 align-top sticky-time-col">
          ${formatPeriodAxisCell(periodDef)}
        </td>
    `;

    days.forEach(day => {
      const matched = roomSessions.filter(s => s.day === day && getSessionPeriodIndex(s) === pIdx);

      if (matched.length === 0) {
        html += `
          <td class="p-1.5 border-r border-slate-200 last:border-r-0 align-top">
            <div class="h-14 border border-dashed border-slate-200 bg-slate-50/40 flex items-center justify-center text-[10.5px] font-mono text-slate-400">
              AVAILABLE
            </div>
          </td>
        `;
      } else if (matched.length === 1) {
        const s = matched[0];
        const color = getInstructorColor(s.instructor);
        html += `
          <td class="p-1.5 border-r border-slate-200 last:border-r-0 align-top">
            <div role="button" tabindex="0"
                 class="h-14 px-2.5 py-1.5 border border-slate-300 bg-white hover:bg-blue-50/40 text-xs flex flex-col justify-between cursor-pointer transition-colors"
                 style="border-left: 4px solid ${color.ring}"
                 onclick="viewInstructor('${escapeHtmlAttr(s.instructor)}')"
                 onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();viewInstructor('${escapeHtmlAttr(s.instructor)}');}"
                 title="${escapeHtmlAttr(`${s.subject} (Sec ${s.section}) • ${periodDef.shortLabel} • ${s.instructor}`)}">
              <div class="flex items-center justify-between gap-1.5 min-w-0">
                <span class="font-bold text-[12px] text-slate-900 truncate">${s.subject}</span>
                <span class="text-[10px] font-mono font-semibold px-1.5 py-0.5 bg-slate-100 text-slate-700 border border-slate-200 shrink-0">Sec ${s.section}</span>
              </div>
              <div class="flex items-center justify-between gap-1.5 min-w-0">
                <span class="text-[10px] font-mono text-slate-500 tabular-nums shrink-0">${periodDef.shortLabel}</span>
                <span class="text-[11px] font-semibold text-slate-800 truncate flex items-center gap-1">
                  <span class="w-[7px] h-[7px] rounded-xs shrink-0" style="background-color: ${color.ring}"></span>
                  <span class="truncate">${s.instructor.split(',')[0]}</span>
                </span>
              </div>
            </div>
          </td>
        `;
      } else {
        html += `
          <td class="p-1.5 border-r border-slate-200 last:border-r-0 align-top">
            <div class="h-14 px-2 py-1 bg-red-50 border border-red-400 border-l-4 border-l-red-600 text-red-950 flex flex-col justify-between">
              <div class="font-bold font-mono text-[10px] text-red-700 flex items-center justify-between gap-1">
                <span>CONFLICT (${matched.length})</span>
                <span>${periodDef.shortLabel}</span>
              </div>
              <div class="text-[10.5px] font-bold text-red-900 truncate" title="${escapeHtmlAttr(matched.map(m => `${m.subject} (${m.section})`).join(' vs '))}">
                ${matched.map(m => `${m.subject} (${m.section})`).join(' / ')}
              </div>
              <div class="text-[10px] font-mono text-red-800 truncate">
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
   High-Precision Swiss Period-Separated Ledger Architecture
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
      ? 'bg-blue-600 text-white border-blue-600 font-semibold'
      : count === 0
        ? 'bg-slate-50 text-slate-400 border-slate-200 opacity-60 hover:opacity-100'
        : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100 hover:border-slate-400 font-medium';

    return `
      <button type="button"
              onclick="selectMasterTimePeriod('${p.index}')"
              aria-pressed="${isSelected ? 'true' : 'false'}"
              class="h-7 px-2 text-[11px] font-mono border inline-flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${stateClasses}"
              title="Filter Master Schedule to ${p.code}: ${p.label} (${count} sessions)">
        <span class="font-bold ${isSelected ? 'text-blue-100' : 'text-slate-900'}">${p.code}</span>
        <span class="tabular-nums">${p.shortLabel}</span>
        <span class="px-1 py-0.2 text-[10px] tabular-nums ${isSelected ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-600'}">${count}</span>
      </button>
    `;
  }).join('');

  const allSelected = activePeriod === 'ALL';
  stripEl.innerHTML = `
    <div class="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5 w-full">
      <span class="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-400 mr-1 shrink-0">TIME BLOCKS:</span>
      <button type="button"
              onclick="selectMasterTimePeriod('ALL')"
              aria-pressed="${allSelected ? 'true' : 'false'}"
              class="h-7 px-2.5 text-[11px] font-mono border inline-flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 ${
                allSelected
                  ? 'bg-slate-900 text-white border-slate-900 font-bold'
                  : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100 font-medium'
              }">
        <span>ALL 9 PERIODS</span>
        <span class="px-1 text-[10px] ${allSelected ? 'bg-slate-700 text-slate-200' : 'bg-slate-100 text-slate-600'}">${totalCount}</span>
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
      countEl.innerHTML = `<span class="font-bold text-slate-900 font-mono">${filtered.length}</span> SESSIONS`;
    } else {
      countEl.innerHTML = `<span class="font-bold text-blue-700 font-mono">${filtered.length}</span> <span class="text-slate-400">OF ${totalSessionsCount}</span>`;
    }
  }

  // Render Instructor Color Guide
  renderInstructorLegend();

  if (viewMode === 'table') {
    container.innerHTML = `
      <div class="overflow-x-auto border border-slate-300 bg-white">
        <table class="w-full text-left text-xs divide-y divide-slate-300">
          <thead class="bg-slate-900 text-[11px] font-mono uppercase font-bold text-white tracking-wider">
            <tr>
              <th class="py-3 px-4">Day</th>
              <th class="py-3 px-4">Period & Assigned Time</th>
              <th class="py-3 px-4">Subject Code</th>
              <th class="py-3 px-4">Section</th>
              <th class="py-3 px-4">Room</th>
              <th class="py-3 px-4">Instructor</th>
              <th class="py-3 px-4 text-right">Type</th>
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
                <tr class="hover:bg-slate-50 transition-colors">
                  <td class="py-2.5 px-4 font-bold font-mono text-slate-800 whitespace-nowrap">${s.day}</td>
                  <td class="py-2.5 px-4 whitespace-nowrap">
                    <div class="inline-flex items-center gap-2 font-mono">
                      <span class="px-1.5 py-0.5 text-[10px] font-bold bg-slate-900 text-white">${pDef.code}</span>
                      <span class="text-xs font-bold text-slate-900 tabular-nums">${pDef.shortLabel}</span>
                    </div>
                  </td>
                  <td class="py-2.5 px-4 font-bold text-slate-900 whitespace-nowrap">${s.subject}</td>
                  <td class="py-2.5 px-4 text-slate-600 font-mono text-[11.5px] whitespace-nowrap">Sec ${s.section}</td>
                  <td class="py-2.5 px-4 whitespace-nowrap">
                    <span class="inline-flex items-center px-2 py-0.5 text-[11px] font-mono font-semibold bg-slate-100 text-slate-800 border border-slate-300">
                      ${s.room}
                    </span>
                  </td>
                  <td class="py-2.5 px-4 whitespace-nowrap">
                    <button type="button"
                            class="inline-flex items-center gap-2 px-2.5 py-1 text-xs font-semibold text-slate-800 bg-white hover:bg-slate-100 border border-slate-300 transition-colors cursor-pointer"
                            onclick="viewInstructor('${escapeHtmlAttr(s.instructor)}')"
                            title="View ${escapeHtmlAttr(s.instructor)}'s individual timetable">
                      <span class="w-2.5 h-2.5 rounded-xs shrink-0" style="background-color: ${accentRing}"></span>
                      <span>${s.instructor}</span>
                    </button>
                  </td>
                  <td class="py-2.5 px-4 text-right whitespace-nowrap font-mono">
                    ${s.isDuty
                      ? '<span class="inline-flex items-center px-2 py-0.5 text-[10.5px] font-semibold bg-slate-100 text-slate-600 border border-slate-300">DUTY</span>'
                      : '<span class="inline-flex items-center px-2 py-0.5 text-[10.5px] font-semibold bg-blue-50 text-blue-800 border border-blue-200">ACADEMIC</span>'
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

  // Render Master Architectural Time-Block Grid View
  const days = day === 'ALL' ? ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"] : [day];
  const visiblePeriods = timePeriod === 'ALL'
    ? PERIOD_DEFINITIONS
    : PERIOD_DEFINITIONS.filter(p => String(p.index) === String(timePeriod));

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="border border-slate-300 bg-white p-12 text-center">
        <div class="max-w-sm mx-auto flex flex-col items-center gap-2">
          <div class="w-10 h-10 bg-slate-100 text-slate-600 flex items-center justify-center border border-slate-300">
            <i data-lucide="search-x" class="w-5 h-5" aria-hidden="true"></i>
          </div>
          <h3 class="text-sm font-bold text-slate-900 mt-1">No matching schedule entries</h3>
          <p class="text-xs text-slate-500 leading-relaxed">No classes or duty sessions match your active filter criteria. Reset filters to view the full weekly timetable.</p>
          <button type="button" onclick="document.getElementById('master-reset-filters').click()" class="mt-2 h-8 px-4 text-xs font-mono font-bold uppercase tracking-wider bg-slate-900 hover:bg-blue-700 text-white transition-colors cursor-pointer">
            Reset All Filters
          </button>
        </div>
      </div>
    `;
    initIcons();
    return;
  }

  // Build Period-Separated Swiss Architectural Schedule
  let html = `
    <div class="overflow-x-auto pb-2">
      <div class="${days.length > 1 ? 'md:min-w-[1200px]' : 'md:min-w-[520px]'} space-y-4">
  `;

  visiblePeriods.forEach((periodDef) => {
    const periodSessions = filtered.filter(s => getSessionPeriodIndex(s) === periodDef.index);

    // If user is filtering by search, room, or instructor, skip empty time periods to avoid empty visual noise
    const hasSpecificConstraint = room !== 'ALL' || instructor !== 'ALL' || (search && search.length > 0);
    if (hasSpecificConstraint && periodSessions.length === 0 && timePeriod === 'ALL') {
      return;
    }

    // Per-day counts for this period banner
    const dayBreakdownHtml = days.map(d => {
      const c = periodSessions.filter(s => s.day === d).length;
      return `<span class="inline-flex items-center gap-1 ${c > 0 ? 'text-slate-200' : 'text-slate-500'}"><span>${DAY_SHORT_LABELS[d]}</span><span class="font-bold ${c > 0 ? 'text-white' : 'text-slate-500'}">${c}</span></span>`;
    }).join('<span class="text-slate-600">·</span>');

    html += `
      <section aria-label="Time Period ${periodDef.code} ${periodDef.label}" class="border border-slate-300 bg-white shadow-2xs">
        <!-- High-Contrast Full-Width Time Period Separator Bar -->
        <div class="bg-[#0F172A] text-white px-3 sm:px-3.5 py-2 border-b border-slate-800 flex flex-wrap items-center justify-between gap-2">
          <div class="flex items-center gap-2 sm:gap-2.5">
            <span class="px-2 py-0.5 text-[11px] font-mono font-bold bg-blue-600 text-white tracking-wider">${periodDef.code}</span>
            <span class="text-xs sm:text-sm font-mono font-bold tracking-tight text-white tabular-nums">${periodDef.start} – ${periodDef.end}</span>
            <span class="hidden sm:inline-block text-[10px] font-mono uppercase tracking-widest px-2 py-0.5 bg-slate-800 text-slate-300 border border-slate-700">${periodDef.shift}</span>
          </div>
          <div class="flex items-center gap-3 text-[11px] font-mono">
            <div class="hidden lg:flex items-center gap-2 text-[10.5px]">
              ${dayBreakdownHtml}
            </div>
            <span class="px-2 py-0.5 bg-slate-800 text-amber-300 border border-slate-700 font-bold tabular-nums">${periodSessions.length} ${periodSessions.length === 1 ? 'CLASS' : 'CLASSES'}</span>
          </div>
        </div>

        <!-- Mobile Day-Grouped Ledger (<768px) -->
        <div class="md:hidden divide-y divide-slate-300">
          ${days.map(d => {
            const slotSessions = periodSessions.filter(s => s.day === d);
            if (slotSessions.length === 0) return '';
            return `
              <div class="bg-white">
                <div class="bg-slate-100 px-3 py-1.5 border-b border-slate-200 flex items-center justify-between font-mono">
                  <div class="flex items-center gap-2">
                    <span class="text-[11px] font-bold uppercase tracking-wider text-slate-900">${d}</span>
                    <span class="text-[10px] font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.2 border border-blue-200">${periodDef.shortLabel}</span>
                  </div>
                  <span class="text-[10px] font-bold px-1.5 py-0.2 bg-slate-800 text-white">${slotSessions.length}</span>
                </div>
                <div class="divide-y divide-slate-200">
                  ${slotSessions.map(s => {
                    const color = getInstructorColor(s.instructor);
                    const isDuty = Boolean(s.isDuty);
                    const leftBarColor = isDuty ? '#64748B' : color.ring;
                    const dotColor = isDuty ? '#64748B' : color.ring;
                    const displaySubject = isDuty ? (s.dutyName || s.subject.replace(/\s*\(Office Duty\)/i, '')) : s.subject;
                    const displayRoom = s.room === 'OFFICE / DEPT' ? 'DEPT' : s.room;
                    const displaySection = isDuty ? 'Office Duty' : (s.section && s.section !== '-' ? `Sec ${s.section}` : 'Lec / Lab');
                    const instructorSurname = s.instructor.split(',')[0];
                    return `
                      <div role="button" tabindex="0"
                           onclick="viewInstructor('${escapeHtmlAttr(s.instructor)}')"
                           class="px-3 py-2 ${isDuty ? 'bg-slate-50/90' : 'bg-white'} active:bg-blue-50 cursor-pointer"
                           style="border-left: 4px solid ${leftBarColor};">
                        <div class="flex items-center justify-between gap-2">
                          <div class="flex items-center gap-2 min-w-0">
                            <span class="text-xs font-bold text-slate-900 truncate">${displaySubject}</span>
                            <span class="text-[10.5px] font-mono font-semibold text-blue-700 shrink-0">${displaySection}</span>
                          </div>
                          <span class="text-[10.5px] font-mono font-bold px-1.5 py-0.5 bg-slate-100 text-slate-800 border border-slate-300 shrink-0">${displayRoom}</span>
                        </div>
                        <div class="flex items-center justify-between gap-2 mt-1">
                          <span class="text-[10px] font-mono text-slate-500 tabular-nums">${DAY_SHORT_LABELS[d]} • ${periodDef.shortLabel}</span>
                          <span class="text-[11px] font-semibold text-slate-700 flex items-center gap-1.5">
                            <span class="w-[7px] h-[7px] rounded-xs shrink-0" style="background-color: ${dotColor}"></span>
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
            <div class="p-4 text-center text-xs font-mono text-slate-400">NO SCHEDULED CLASSES IN THIS PERIOD</div>
          `}
        </div>

        <!-- Desktop Period Timetable Columns (>=768px) -->
        <table class="hidden md:table w-full border-collapse text-left table-fixed">
          <thead>
            <tr class="bg-slate-100 border-b border-slate-300">
              <th scope="col" class="py-1.5 px-3 w-[118px] min-w-[118px] border-r border-slate-300 sticky left-0 bg-slate-100 z-10 text-[10px] font-mono font-bold uppercase tracking-widest text-slate-500 sticky-time-col">
                ASSIGNED SLOT
              </th>
              ${days.map(d => {
                const dCount = periodSessions.filter(s => s.day === d).length;
                return `
                  <th scope="col" class="py-1.5 px-2.5 border-r border-slate-300 last:border-r-0">
                    <div class="flex items-center justify-between gap-1 font-mono">
                      <span class="text-[11px] font-bold uppercase tracking-wider text-slate-900">${d}</span>
                      <div class="flex items-center gap-1 shrink-0">
                        <span class="text-[10px] font-semibold text-blue-700 bg-blue-50 px-1 py-0.2 border border-blue-200/80 tabular-nums">${periodDef.code}</span>
                        <span class="text-[10px] font-bold px-1.5 py-0.2 ${dCount > 0 ? 'bg-slate-800 text-white' : 'bg-slate-200 text-slate-500'} tabular-nums">${dCount}</span>
                      </div>
                    </div>
                  </th>
                `;
              }).join('')}
            </tr>
          </thead>
          <tbody>
            <tr>
              <!-- Sticky Left Time Stamp Anchor -->
              <td class="p-3 border-r border-slate-300 sticky left-0 bg-slate-50 z-10 align-top sticky-time-col">
                <div class="sticky top-28 font-mono">
                  <div class="inline-block px-1.5 py-0.5 text-[10px] font-bold bg-slate-900 text-white mb-1">${periodDef.code}</div>
                  <div class="text-xs font-bold text-slate-900 tabular-nums leading-tight">${periodDef.start}</div>
                  <div class="text-[11px] font-semibold text-slate-500 tabular-nums leading-tight mt-0.5">to ${periodDef.end}</div>
                  <div class="mt-2 pt-2 border-t border-slate-200 text-[10px] text-slate-500 font-semibold uppercase tracking-wider">
                    ${periodDef.shift}
                  </div>
                </div>
              </td>

              <!-- Day Columns for this Time Period -->
              ${days.map(d => {
                const slotSessions = periodSessions.filter(s => s.day === d);
                if (slotSessions.length === 0) {
                  return `
                    <td class="p-2 border-r border-slate-300 last:border-r-0 align-top bg-slate-50/40">
                      <div class="min-h-[54px] flex flex-col items-center justify-center text-[10.5px] font-mono text-slate-400 select-none">
                        <span>NO SCHEDULED CLASS</span>
                        <span class="text-[9.5px] text-slate-300 mt-0.5">${DAY_SHORT_LABELS[d]} • ${periodDef.shortLabel}</span>
                      </div>
                    </td>
                  `;
                }

                return `
                  <td class="p-0 border-r border-slate-300 last:border-r-0 align-top bg-white">
                    <div class="divide-y divide-slate-200">
                      ${slotSessions.map(s => {
                        const color = getInstructorColor(s.instructor);
                        const isDuty = Boolean(s.isDuty);
                        const leftBarColor = isDuty ? '#64748B' : color.ring;
                        const dotColor = isDuty ? '#64748B' : color.ring;
                        const displaySubject = isDuty ? (s.dutyName || s.subject.replace(/\s*\(Office Duty\)/i, '')) : s.subject;
                        const displayRoom = s.room === 'OFFICE / DEPT' ? 'DEPT' : s.room;
                        const displaySection = isDuty ? 'Office Duty' : (s.section && s.section !== '-' ? `Sec ${s.section}` : 'Lec / Lab');
                        const instructorSurname = s.instructor.split(',')[0];
                        const fullTooltip = `${s.subject} (${displaySection})\nAssigned Time: ${s.day} • ${periodDef.label} (${periodDef.code})\nRoom: ${s.room}\nInstructor: ${s.instructor}`;

                        return `
                          <div role="button" tabindex="0"
                               aria-label="${escapeHtmlAttr(`${s.subject}, ${displaySection}, Assigned Time ${periodDef.label}, Room ${s.room}, Instructor ${s.instructor}`)}"
                               title="${escapeHtmlAttr(fullTooltip)}"
                               onclick="viewInstructor('${escapeHtmlAttr(s.instructor)}')"
                               onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();viewInstructor('${escapeHtmlAttr(s.instructor)}');}"
                               class="schedule-entry px-2.5 py-1.5 ${isDuty ? 'bg-slate-50/90 hover:bg-slate-100' : 'bg-white hover:bg-blue-50/40'} cursor-pointer select-none transition-colors"
                               style="border-left: 4px solid ${leftBarColor};">
                            <!-- Tier 1: 1. Subject Code (Primary) | 2. Room Code (Secondary Monospace Badge) -->
                            <div class="flex items-center justify-between gap-1.5 min-w-0">
                              <span class="text-[12.5px] font-bold ${isDuty ? 'text-slate-700' : 'text-slate-900'} tracking-tight truncate">${displaySubject}</span>
                              <span class="text-[10px] font-mono font-bold px-1.5 py-0.5 ${isDuty ? 'bg-slate-200 text-slate-700' : 'bg-slate-100 text-slate-800 border border-slate-300'} shrink-0 whitespace-nowrap leading-none">${displayRoom}</span>
                            </div>

                            <!-- Tier 2: 3. Section | Assigned Time Stamp -->
                            <div class="flex items-center justify-between gap-1.5 mt-1 min-w-0">
                              <span class="text-[10.5px] font-mono font-semibold ${isDuty ? 'text-slate-500' : 'text-blue-700'} truncate">${displaySection}</span>
                              <span class="text-[10px] font-mono font-medium text-slate-500 tabular-nums shrink-0">${periodDef.shortLabel}</span>
                            </div>

                            <!-- Tier 3: 4. Instructor Color Marker + Readable Surname -->
                            <div class="flex items-center justify-between gap-1.5 mt-0.5 min-w-0">
                              <span class="text-[11px] font-semibold text-slate-700 truncate flex items-center gap-1.5 min-w-0">
                                <span class="w-[7px] h-[7px] rounded-xs shrink-0" style="background-color: ${dotColor}"></span>
                                <span class="truncate">${instructorSurname}</span>
                              </span>
                              <span class="text-[9.5px] font-mono font-semibold text-slate-400 shrink-0">${DAY_SHORT_LABELS[d]}·${periodDef.code}</span>
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

  if (profileContainer) {
    profileContainer.innerHTML = `
      <div class="bg-white p-3 sm:p-4 border border-slate-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 min-w-0 max-w-full overflow-hidden" style="border-left: 5px solid ${instColor.ring}">
        <div class="min-w-0">
          <div class="flex items-start sm:items-center gap-2.5 sm:gap-3 min-w-0">
            <div class="w-9 h-9 sm:w-11 sm:h-11 font-mono font-bold flex items-center justify-center text-sm sm:text-lg text-white shrink-0" style="background-color: ${instColor.ring}">
              ${faculty.name.split(',')[0].charAt(0)}
            </div>
            <div class="min-w-0 flex-1">
              <div class="text-sm sm:text-lg font-bold text-slate-900 tracking-tight leading-snug break-words">${faculty.name}</div>
              <div class="text-xs text-slate-500 flex flex-wrap items-center gap-1.5 sm:gap-2 mt-1">
                <span class="px-1.5 py-0.5 font-mono text-[10px] sm:text-[10.5px] font-semibold ${
                  (faculty.status && (faculty.status.includes('FT') || faculty.status.toUpperCase().includes('FULL-TIME')))
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                    : 'bg-amber-50 text-amber-800 border border-amber-300'
                }">
                  ${faculty.status}
                </span>
                <span class="text-slate-300">•</span>
                <span class="font-medium text-slate-600 text-[11px] sm:text-xs break-words">${faculty.qualification || 'Faculty Member'}</span>
                ${uniqueSubjects.length > 0 ? `
                  <span class="hidden sm:inline text-slate-300">•</span>
                  <span class="font-mono text-[11px] text-slate-700 font-semibold w-full sm:w-auto mt-0.5 sm:mt-0">Courses: ${uniqueSubjects.join(', ')}</span>
                ` : ''}
              </div>
              ${assignedRooms.length > 0 ? `
                <div class="flex items-center gap-1.5 flex-wrap mt-2">
                  <span class="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-400">Assigned Rooms:</span>
                  ${assignedRooms.map(room => `
                    <button type="button" onclick="viewRoomFromSchedule('${escapeHtmlAttr(room)}')" title="Inspect room ${escapeHtmlAttr(room)} occupancy" class="px-1.5 py-0.5 text-[10.5px] font-mono font-semibold bg-slate-100 hover:bg-slate-900 text-slate-800 hover:text-white border border-slate-300 transition-colors cursor-pointer">
                      ${room}
                    </button>
                  `).join('')}
                </div>
              ` : ''}
            </div>
          </div>
        </div>

        <div class="flex flex-wrap items-center justify-between sm:justify-end gap-2 sm:gap-5 pt-2.5 sm:pt-0 border-t sm:border-t-0 border-slate-200 sm:ml-auto min-w-0">
          <div class="flex items-center gap-3 sm:gap-5 sm:border-r sm:border-slate-200 sm:pr-5">
            <div>
              <div class="text-[9.5px] sm:text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">ACADEMIC CLASSES</div>
              <div class="text-xs sm:text-base font-bold text-slate-900 font-mono tabular-nums">${academicSessions.length} classes / wk</div>
            </div>
            <div>
              <div class="text-[9.5px] sm:text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">OFFICE / CONSULT</div>
              <div class="text-xs sm:text-base font-bold text-slate-700 font-mono tabular-nums">${dutySessions.length} periods / wk</div>
            </div>
          </div>

          <div class="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button type="button" onclick="viewInstructorInMaster('${escapeHtmlAttr(faculty.name)}')" class="h-7 sm:h-8 px-2 sm:px-3 text-[10.5px] sm:text-xs font-mono font-semibold border border-slate-300 bg-slate-50 hover:bg-slate-900 text-slate-700 hover:text-white flex items-center gap-1 sm:gap-1.5 transition-colors cursor-pointer">
              <i data-lucide="calendar" class="w-3 h-3 sm:w-3.5 sm:h-3.5" aria-hidden="true"></i>
              <span>MASTER</span>
            </button>
            <button type="button" onclick="window.print()" class="h-7 sm:h-8 px-2 sm:px-3 text-[10.5px] sm:text-xs font-mono font-semibold border border-slate-300 bg-white hover:bg-slate-100 text-slate-800 flex items-center gap-1 sm:gap-1.5 transition-colors cursor-pointer">
              <i data-lucide="printer" class="w-3 h-3 sm:w-3.5 sm:h-3.5 text-slate-600" aria-hidden="true"></i>
              <span>PRINT</span>
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
      <div class="bg-white border border-slate-300 p-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        <button type="button" onclick="selectInstructorMobileDay('ALL')" class="h-7 px-2.5 text-[11px] font-mono border shrink-0 transition-colors cursor-pointer ${
          activeMobileDay === 'ALL' ? 'bg-slate-900 text-white border-slate-900 font-bold' : 'bg-slate-50 text-slate-700 border-slate-300 font-medium'
        }">
          ALL DAYS (${totalInstSessions})
        </button>
        ${days.map(d => {
          const dCount = (faculty.sessions || []).filter(s => s.day === d).length;
          const isSel = activeMobileDay === d;
          return `
            <button type="button" onclick="selectInstructorMobileDay('${d}')" class="h-7 px-2.5 text-[11px] font-mono border shrink-0 transition-colors cursor-pointer ${
              isSel ? 'bg-blue-600 text-white border-blue-600 font-bold' : 'bg-white text-slate-700 border-slate-300 font-medium'
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
          <div class="border border-slate-300 bg-white">
            <div class="bg-slate-900 text-white px-3 py-2 flex items-center justify-between font-mono text-xs">
              <span class="font-bold tracking-wider">${d}</span>
              <span class="px-2 py-0.5 text-[10.5px] bg-slate-800 ${dayEntries.length > 0 ? 'text-amber-300' : 'text-slate-400'} border border-slate-700 font-bold">${dayEntries.length} ${dayEntries.length === 1 ? 'SESSION' : 'SESSIONS'}</span>
            </div>
            ${dayEntries.length === 0 ? `
              <div class="p-4 text-center text-xs font-mono text-slate-400 bg-slate-50/40">
                NO SCHEDULED CLASSES OR DUTY ON ${d}
              </div>
            ` : `
              <div class="divide-y divide-slate-200">
                ${dayEntries.map(({ session: s, periodDef }) => {
                  const leftBar = s.isDuty ? '#64748B' : instColor.ring;
                  const displaySubject = s.isDuty ? (s.dutyName || s.subject.replace(/\s*\(Office Duty\)/i, '')) : s.subject;
                  const displayRoom = s.room === 'OFFICE / DEPT' ? 'DEPT' : s.room;
                  const displaySection = s.isDuty ? 'OFFICE DUTY' : (s.section && s.section !== '-' ? `Sec ${s.section}` : 'LEC / LAB');
                  return `
                    <div class="px-3 py-2.5 ${s.isDuty ? 'bg-slate-50/90' : 'bg-white'} flex flex-col gap-1" style="border-left: 4px solid ${leftBar}">
                      <div class="flex items-center justify-between gap-2">
                        <div class="flex items-center gap-2 font-mono">
                          <span class="px-1.5 py-0.5 text-[10px] font-bold bg-slate-900 text-white">${periodDef.code}</span>
                          <span class="text-xs font-bold text-slate-800 tabular-nums">${periodDef.shortLabel}</span>
                        </div>
                        <button type="button" onclick="viewRoomFromSchedule('${escapeHtmlAttr(s.room)}')" class="px-2 py-0.5 font-mono text-[10.5px] font-bold bg-slate-100 text-slate-800 border border-slate-300">
                          ${displayRoom}
                        </button>
                      </div>
                      <div class="flex items-center justify-between gap-2 mt-0.5">
                        <span class="text-sm font-bold ${s.isDuty ? 'text-slate-700' : 'text-slate-900'}">${displaySubject}</span>
                        <span class="text-xs font-mono font-semibold ${s.isDuty ? 'text-slate-600' : 'text-blue-700'}">${displaySection}</span>
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
    <div class="hidden md:block overflow-x-auto border border-slate-300 bg-white">
      <table class="w-full border-collapse text-left min-w-[1140px] table-fixed">
        <thead>
          <tr class="bg-slate-900 text-white text-[11px] font-mono font-bold uppercase tracking-wider">
            <th class="py-2.5 px-3 w-[124px] min-w-[124px] border-r border-slate-700 sticky left-0 bg-slate-900 z-10 sticky-time-col">PERIOD / TIME</th>
            ${days.map(d => `<th class="py-2.5 px-3 min-w-[170px] border-r border-slate-700 last:border-r-0">${d}</th>`).join('')}
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-300 text-sm">
  `;

  PERIOD_DEFINITIONS.forEach((periodDef, pIdx) => {
    const rowBg = pIdx % 2 === 1 ? 'bg-slate-50/60' : 'bg-white';
    html += `
      <tr class="${rowBg}">
        <td class="py-2.5 px-3 border-r border-slate-300 sticky left-0 ${pIdx % 2 === 1 ? 'bg-[#F8FAFC]' : 'bg-white'} z-10 align-top sticky-time-col">
          ${formatPeriodAxisCell(periodDef)}
        </td>
    `;

    days.forEach(day => {
      const matched = faculty.sessions.filter(s => s.day === day && getSessionPeriodIndex(s) === pIdx);
      if (matched.length === 0) {
        html += `
          <td class="p-1.5 border-r border-slate-200 last:border-r-0 align-top">
            <div class="h-14 flex items-center justify-center text-xs font-mono text-slate-200 select-none">
              —
            </div>
          </td>
        `;
      } else {
        html += `
          <td class="p-1.5 border-r border-slate-200 last:border-r-0 align-top">
            <div class="space-y-1.5">
              ${matched.map(s => {
                const leftBar = s.isDuty ? '#64748B' : instColor.ring;
                const displaySubject = s.isDuty ? (s.dutyName || s.subject.replace(/\s*\(Office Duty\)/i, '')) : s.subject;
                const displayRoom = s.room === 'OFFICE / DEPT' ? 'DEPT' : s.room;
                const displaySection = s.isDuty ? 'OFFICE DUTY' : (s.section && s.section !== '-' ? `Sec ${s.section}` : 'LEC / LAB');
                return `
                  <div class="min-h-[60px] px-2.5 py-1.5 flex flex-col justify-between border ${s.isDuty ? 'bg-slate-50 border-slate-300' : 'bg-white border-slate-300'}"
                       style="border-left: 4px solid ${leftBar}">
                    <div class="flex items-center justify-between gap-1.5 min-w-0">
                      <span class="font-bold text-[12.5px] ${s.isDuty ? 'text-slate-700' : 'text-slate-900'} truncate" title="${escapeHtmlAttr(s.subject)}">${displaySubject}</span>
                      <span class="px-1.5 py-0.5 font-mono text-[10px] font-bold bg-slate-100 text-slate-800 border border-slate-300 shrink-0 leading-none">${displayRoom}</span>
                    </div>
                    <div class="text-[10.5px] font-mono flex justify-between items-center text-slate-600 pt-1 mt-1 border-t border-slate-100">
                      <span class="font-semibold ${s.isDuty ? 'text-slate-600' : 'text-blue-700'} truncate">${displaySection}</span>
                      <span class="text-[10px] text-slate-500 tabular-nums shrink-0">${periodDef.shortLabel}</span>
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
          <div class="bg-white border border-slate-300 p-3 flex flex-col gap-2" style="border-left: 4px solid ${color.ring}">
            <div class="flex items-start justify-between gap-2">
              <div class="flex items-center gap-2 min-w-0">
                <span class="text-[11px] font-mono text-slate-400">${String(idx + 1).padStart(2, '0')}</span>
                <span class="font-bold text-xs text-slate-900 truncate">${inst.name}</span>
              </div>
              <span class="px-1.5 py-0.5 font-mono text-[10px] font-semibold shrink-0 ${
                isFT ? 'bg-emerald-50 text-emerald-800 border border-emerald-300' : 'bg-amber-50 text-amber-800 border border-amber-300'
              }">
                ${inst.status}
              </span>
            </div>
            <div class="text-[11px] text-slate-600 leading-snug">${inst.qualification || '-'}</div>
            <div class="flex items-center justify-between pt-2 border-t border-slate-100">
              <span class="text-xs font-mono font-bold text-slate-800">${classCount} classes / wk</span>
              <button type="button" class="px-2.5 py-1 text-[11px] font-mono font-semibold text-white bg-slate-900 active:bg-blue-700 border border-slate-900 cursor-pointer"
                      onclick="viewInstructor('${escapeHtmlAttr(inst.name)}')">
                OPEN TIMETABLE →
              </button>
            </div>
          </div>
        `;
      }).join('')}
    </div>

    <!-- 2. Desktop Faculty Roster Table (>=640px) -->
    <div class="hidden sm:block overflow-x-auto border border-slate-300 bg-white">
      <table class="w-full text-left text-xs divide-y divide-slate-300">
        <thead class="bg-slate-900 text-[11px] font-mono uppercase font-bold text-white tracking-wider">
          <tr>
            <th class="py-3 px-4 w-12">#</th>
            <th class="py-3 px-4">Faculty Member Name</th>
            <th class="py-3 px-4">Employment Status</th>
            <th class="py-3 px-4">Academic Qualification</th>
            <th class="py-3 px-4 text-center">Assigned Classes</th>
            <th class="py-3 px-4 text-right">Action</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-200 text-xs">
          ${instructors.map((inst, idx) => {
            const color = getInstructorColor(inst.name);
            const isFT = inst.status && (inst.status.includes('FT') || inst.status.toUpperCase().includes('FULL-TIME'));
            return `
              <tr class="hover:bg-slate-50 transition-colors">
                <td class="py-2.5 px-4 text-slate-400 font-mono text-xs tabular-nums">${String(idx + 1).padStart(2, '0')}</td>
                <td class="py-2.5 px-4 font-bold text-slate-900">
                  <div class="flex items-center gap-2.5">
                    <span class="w-2.5 h-2.5 rounded-xs shrink-0" style="background-color: ${color.ring}"></span>
                    <span>${inst.name}</span>
                  </div>
                </td>
                <td class="py-2.5 px-4">
                  <span class="px-2 py-0.5 font-mono text-[10.5px] font-semibold ${
                    isFT ? 'bg-emerald-50 text-emerald-800 border border-emerald-300' : 'bg-amber-50 text-amber-800 border border-amber-300'
                  }">
                    ${inst.status}
                  </span>
                </td>
                <td class="py-2.5 px-4 text-slate-600 text-xs">${inst.qualification || '-'}</td>
                <td class="py-2.5 px-4 text-center font-bold font-mono text-slate-900 tabular-nums">${inst.sessions.filter(s => !s.isDuty).length}</td>
                <td class="py-2.5 px-4 text-right">
                  <button type="button" class="px-2.5 py-1 text-[11px] font-mono font-semibold text-slate-800 bg-white hover:bg-slate-900 hover:text-white border border-slate-300 transition-colors cursor-pointer"
                          onclick="viewInstructor('${escapeHtmlAttr(inst.name)}')">
                    OPEN TIMETABLE →
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

// Compact Swiss Faculty Index Bar in Master Timetable
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
          <span class="text-[10px] font-mono font-bold uppercase tracking-widest text-slate-500">FACULTY INDEX & COLOR KEY</span>
          <span class="text-[11px] text-slate-400 hidden sm:inline">— Click any instructor to isolate their classes</span>
          ${hasSelectedInstructor ? `
            <span class="inline-flex items-center gap-1.5 px-2 py-0.5 text-[11px] font-mono font-bold bg-blue-600 text-white">
              <span>ACTIVE: ${activeInstructor.split(',')[0]}</span>
              <button type="button" onclick="filterByInstructor('ALL')" class="hover:text-blue-200 cursor-pointer" title="Clear instructor filter" aria-label="Clear instructor filter">
                <i data-lucide="x" class="w-3 h-3" aria-hidden="true"></i>
              </button>
            </span>
          ` : ''}
        </div>

        <div class="flex items-center gap-1.5 ml-auto">
          <button type="button"
                  aria-pressed="${!hasSelectedInstructor ? 'true' : 'false'}"
                  class="h-6 px-2 text-[11px] font-mono font-semibold border transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                    hasSelectedInstructor
                      ? 'text-blue-700 bg-blue-50 border-blue-300 hover:bg-blue-100'
                      : 'text-slate-700 bg-slate-100 border-slate-300 hover:bg-slate-200'
                  }"
                  onclick="filterByInstructor('ALL')">
            Show All (${instructors.length})
          </button>

          <button type="button"
                  aria-expanded="${!isCollapsed ? 'true' : 'false'}"
                  class="h-6 px-2 text-[11px] font-mono font-medium text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-100 border border-slate-300 flex items-center gap-1 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                  onclick="toggleInstructorLegend()">
            <span>${isCollapsed ? 'Expand Key' : 'Hide Key'}</span>
            <i data-lucide="${isCollapsed ? 'chevron-down' : 'chevron-up'}" class="w-3 h-3" aria-hidden="true"></i>
          </button>
        </div>
      </div>

      ${isCollapsed ? '' : `
        <div class="flex items-center gap-1 flex-nowrap sm:flex-wrap overflow-x-auto no-scrollbar mt-2 pt-2 border-t border-slate-200">
          ${instructors.map(i => {
            const color = getInstructorColor(i.name);
            const isSelected = activeInstructor === i.name;
            const surname = i.name.split(',')[0];
            const classCount = (i.sessions || []).filter(s => !s.isDuty).length;

            const chipStateClasses = isSelected
              ? 'bg-slate-900 text-white border-slate-900 font-bold'
              : hasSelectedInstructor
                ? 'bg-white text-slate-500 border-slate-200 opacity-65 hover:opacity-100 hover:border-slate-400 font-medium'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100 hover:text-slate-900 hover:border-slate-400 font-medium';

            return `
              <button type="button"
                      aria-pressed="${isSelected ? 'true' : 'false'}"
                      aria-label="Filter by instructor ${escapeHtmlAttr(i.name)}"
                      title="${escapeHtmlAttr(`${i.name} (${classCount} academic classes)`)}"
                      class="h-6 px-2 text-[11px] transition-colors inline-flex items-center gap-1.5 border shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${chipStateClasses}"
                      onclick="filterByInstructor('${escapeHtmlAttr(i.name)}')">
                <span class="w-[7px] h-[7px] rounded-xs shrink-0" style="background-color: ${color.ring}"></span>
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
    dateDisplay: dateFormatter.format(now).toUpperCase(),
    dayOfWeek,
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
    let statusLabel = 'ALREADY ENDED';
    let statusDetail = `Ended at ${periodDef.end}`;

    if (snapshot.minutesFromMidnight >= periodDef.startMin && snapshot.minutesFromMidnight < periodDef.endMin) {
      const rem = periodDef.endMin - snapshot.minutesFromMidnight;
      statusCode = 'ONGOING';
      statusLabel = 'ONGOING NOW';
      statusDetail = `${rem} min remaining in ${periodDef.code}`;
    } else if (snapshot.minutesFromMidnight < periodDef.startMin) {
      const diff = periodDef.startMin - snapshot.minutesFromMidnight;
      const hrs = Math.floor(diff / 60);
      const mins = diff % 60;
      statusCode = 'UPCOMING';
      statusLabel = 'NOT STARTED YET';
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
    if (nextOpen) {
      triggerEl.classList.add('border-blue-600');
    } else {
      triggerEl.classList.remove('border-blue-600');
    }
  }

  if (chevronEl) {
    if (nextOpen) chevronEl.classList.add('rotate-180');
    else chevronEl.classList.remove('rotate-180');
  }

  if (ctaLabelEl) {
    ctaLabelEl.textContent = nextOpen ? 'Hide Live Schedule' : 'Check Current Classes';
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

  if (!breakdown.hasScheduleData) {
    if (periodBadgeEl) {
      periodBadgeEl.className = 'px-2 py-0.5 text-[10.5px] font-mono font-bold bg-slate-100 text-slate-600 border border-slate-300';
      periodBadgeEl.textContent = 'NO SCHEDULE LOADED';
    }
    if (summaryTitleEl) summaryTitleEl.textContent = 'No schedule dataset currently loaded';
    if (summarySubEl) summarySubEl.textContent = 'Import a faculty timetable workbook or reset to sample data';
  } else if (snapshot.activePeriod) {
    const p = snapshot.activePeriod;
    const ongoingCount = breakdown.ongoing.length;
    if (pulseEl) {
      pulseEl.className = 'w-2 h-2 rounded-full bg-emerald-400 animate-pulse shrink-0';
    }
    if (periodBadgeEl) {
      periodBadgeEl.className = 'px-2 py-0.5 text-[10.5px] font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-300';
      periodBadgeEl.textContent = `${p.code} ACTIVE • ${p.shortLabel}`;
    }
    if (summaryTitleEl) {
      summaryTitleEl.textContent = ongoingCount > 0
        ? `${ongoingCount} ${ongoingCount === 1 ? 'class' : 'classes'} scheduled right now (${snapshot.dayOfWeek} • ${p.code})`
        : `No classes scheduled in ${p.code} (${p.shortLabel}) on ${snapshot.dayOfWeek}`;
    }
    if (summarySubEl) {
      summarySubEl.textContent = `${breakdown.upcoming.length} not started yet today • ${breakdown.ended.length} already ended today — Click clock to inspect`;
    }
  } else {
    if (pulseEl) {
      pulseEl.className = 'w-2 h-2 rounded-full bg-amber-400 shrink-0';
    }
    if (periodBadgeEl) {
      periodBadgeEl.className = 'px-2 py-0.5 text-[10.5px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-300';
      periodBadgeEl.textContent = snapshot.isAcademicDay ? 'OUTSIDE CLASS HOURS (07:30 AM – 09:00 PM)' : 'SUNDAY • NON-INSTRUCTIONAL DAY';
    }
    if (summaryTitleEl) {
      summaryTitleEl.textContent = 'No classes scheduled right now — Click clock to check today\'s schedule status';
    }
    if (summarySubEl) {
      if (!snapshot.isAcademicDay) {
        summarySubEl.textContent = 'Regular academic classes are scheduled Monday through Saturday (P1 07:30 AM – P9 09:00 PM)';
      } else if (snapshot.nextPeriod) {
        summarySubEl.textContent = `Next period today: ${snapshot.nextPeriod.code} (${snapshot.nextPeriod.label}) • ${breakdown.upcoming.length} upcoming today`;
      } else {
        summarySubEl.textContent = `All ${breakdown.ended.length} scheduled classes for ${snapshot.dayOfWeek} have ended for today`;
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
        <div class="text-sm font-bold text-slate-900">No classes scheduled right now.</div>
        <p class="text-xs text-slate-500 mt-1">Schedule data is currently unavailable. Please load or reset the department schedule dataset.</p>
      </div>
    `;
    return;
  }

  const activeFilter = state.liveAvailability.statusFilter || 'ONGOING';
  const includeDuty = Boolean(state.liveAvailability.includeDuty);

  let displayedItems = breakdown.ongoing;
  let sectionTitle = `Classes Matching Current Day & Time (${snapshot.dayOfWeek} • ${snapshot.timeDisplay})`;
  if (activeFilter === 'UPCOMING') {
    displayedItems = breakdown.upcoming;
    sectionTitle = `Classes Not Started Yet Today (${snapshot.dayOfWeek})`;
  } else if (activeFilter === 'ENDED') {
    displayedItems = breakdown.ended;
    sectionTitle = `Classes Already Ended Today (${snapshot.dayOfWeek})`;
  } else if (activeFilter === 'ALL_TODAY') {
    displayedItems = breakdown.allToday;
    sectionTitle = `All Scheduled Classes for ${snapshot.dayOfWeek} (By Schedule Status)`;
  }

  const renderStatusBadge = (item) => {
    if (item.statusCode === 'ONGOING') {
      return `
        <span class="inline-flex items-center gap-1.5 px-2 py-0.5 text-[10.5px] font-mono font-bold bg-emerald-50 text-emerald-800 border border-emerald-300">
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
          <span>ONGOING NOW</span>
        </span>
      `;
    }
    if (item.statusCode === 'UPCOMING') {
      return `
        <span class="inline-flex items-center gap-1.5 px-2 py-0.5 text-[10.5px] font-mono font-bold bg-amber-50 text-amber-800 border border-amber-300">
          <span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
          <span>NOT STARTED YET</span>
        </span>
      `;
    }
    return `
      <span class="inline-flex items-center gap-1.5 px-2 py-0.5 text-[10.5px] font-mono font-bold bg-slate-100 text-slate-600 border border-slate-300">
        <span class="w-1.5 h-1.5 rounded-full bg-slate-400"></span>
        <span>ALREADY ENDED</span>
      </span>
    `;
  };

  panelEl.innerHTML = `
    <!-- Panel Top Control & Status Bar -->
    <div class="px-3.5 sm:px-5 py-3 bg-slate-100 border-b border-slate-300 flex flex-wrap items-center justify-between gap-2.5">
      <div class="flex flex-wrap items-center gap-2 min-w-0">
        <span class="px-2 py-0.5 text-[10.5px] font-mono font-bold bg-slate-900 text-white uppercase tracking-wider">
          LIVE SCHEDULE CHECK
        </span>
        <span class="text-xs font-mono font-bold text-slate-800 tabular-nums">
          ${snapshot.dayOfWeek} • ${snapshot.timeDisplay}
        </span>
        <span class="text-[11px] font-mono text-slate-500 hidden sm:inline">
          (${snapshot.activePeriod ? `Active Period: ${snapshot.activePeriod.code} ${snapshot.activePeriod.label}` : 'Outside Active Period Window'})
        </span>
      </div>

      <div class="flex items-center gap-2 ml-auto">
        <button type="button"
                onclick="toggleLiveIncludeDuty()"
                aria-pressed="${includeDuty ? 'true' : 'false'}"
                class="h-7 px-2.5 text-[11px] font-mono font-semibold border transition-colors cursor-pointer ${
                  includeDuty
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                }">
          ${includeDuty ? 'Showing: Classes + Office Duty' : 'Showing: Academic Classes Only'}
        </button>

        <button type="button"
                onclick="toggleLiveAvailabilityPanel(false)"
                class="h-7 px-2.5 text-[11px] font-mono font-semibold bg-white hover:bg-slate-900 text-slate-700 hover:text-white border border-slate-300 transition-colors inline-flex items-center gap-1 cursor-pointer"
                aria-label="Close live class availability panel">
          <span>Close</span>
          <i data-lucide="x" class="w-3.5 h-3.5" aria-hidden="true"></i>
        </button>
      </div>
    </div>

    <!-- Status Distinction Filter Bar (Ongoing Now vs Not Started Yet vs Already Ended) -->
    <div class="px-3.5 sm:px-5 py-2.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
      <div class="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
        <button type="button"
                onclick="setLiveAvailabilityFilter('ONGOING')"
                aria-pressed="${activeFilter === 'ONGOING' ? 'true' : 'false'}"
                class="h-7 px-2.5 text-[11px] font-mono border inline-flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer ${
                  activeFilter === 'ONGOING'
                    ? 'bg-emerald-700 text-white border-emerald-700 font-bold'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100 font-medium'
                }">
          <span class="w-2 h-2 rounded-full ${activeFilter === 'ONGOING' ? 'bg-emerald-300' : 'bg-emerald-600'}"></span>
          <span>Ongoing Right Now</span>
          <span class="px-1.5 py-0.2 text-[10px] tabular-nums ${activeFilter === 'ONGOING' ? 'bg-emerald-900 text-white' : 'bg-slate-100 text-slate-700'}">${breakdown.ongoing.length}</span>
        </button>

        <button type="button"
                onclick="setLiveAvailabilityFilter('UPCOMING')"
                aria-pressed="${activeFilter === 'UPCOMING' ? 'true' : 'false'}"
                class="h-7 px-2.5 text-[11px] font-mono border inline-flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer ${
                  activeFilter === 'UPCOMING'
                    ? 'bg-amber-700 text-white border-amber-700 font-bold'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100 font-medium'
                }">
          <span class="w-2 h-2 rounded-full ${activeFilter === 'UPCOMING' ? 'bg-amber-200' : 'bg-amber-500'}"></span>
          <span>Not Started Yet Today</span>
          <span class="px-1.5 py-0.2 text-[10px] tabular-nums ${activeFilter === 'UPCOMING' ? 'bg-amber-900 text-white' : 'bg-slate-100 text-slate-700'}">${breakdown.upcoming.length}</span>
        </button>

        <button type="button"
                onclick="setLiveAvailabilityFilter('ENDED')"
                aria-pressed="${activeFilter === 'ENDED' ? 'true' : 'false'}"
                class="h-7 px-2.5 text-[11px] font-mono border inline-flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer ${
                  activeFilter === 'ENDED'
                    ? 'bg-slate-800 text-white border-slate-800 font-bold'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100 font-medium'
                }">
          <span class="w-2 h-2 rounded-full bg-slate-400"></span>
          <span>Already Ended Today</span>
          <span class="px-1.5 py-0.2 text-[10px] tabular-nums ${activeFilter === 'ENDED' ? 'bg-slate-950 text-white' : 'bg-slate-100 text-slate-700'}">${breakdown.ended.length}</span>
        </button>

        <button type="button"
                onclick="setLiveAvailabilityFilter('ALL_TODAY')"
                aria-pressed="${activeFilter === 'ALL_TODAY' ? 'true' : 'false'}"
                class="h-7 px-2.5 text-[11px] font-mono border inline-flex items-center gap-1.5 shrink-0 transition-colors cursor-pointer ${
                  activeFilter === 'ALL_TODAY'
                    ? 'bg-blue-600 text-white border-blue-600 font-bold'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100 font-medium'
                }">
          <span>All ${snapshot.dayOfWeek} Classes</span>
          <span class="px-1.5 py-0.2 text-[10px] tabular-nums ${activeFilter === 'ALL_TODAY' ? 'bg-blue-800 text-white' : 'bg-slate-100 text-slate-700'}">${breakdown.allToday.length}</span>
        </button>
      </div>

      <div class="text-[11px] font-mono text-slate-500">
        ${sectionTitle}
      </div>
    </div>

    <!-- Main Body: Matching Classes or Friendly Empty State -->
    <div class="p-3.5 sm:p-5">
      ${displayedItems.length === 0 ? `
        <div id="live-availability-empty" class="border border-dashed border-slate-300 bg-slate-50/70 p-6 sm:p-8 text-center">
          <div class="max-w-md mx-auto flex flex-col items-center gap-2">
            <div class="w-10 h-10 bg-white border border-slate-300 text-slate-600 flex items-center justify-center">
              <i data-lucide="clock" class="w-5 h-5" aria-hidden="true"></i>
            </div>
            <h3 class="text-sm sm:text-base font-bold text-slate-900 mt-1">
              ${activeFilter === 'ONGOING' ? 'No classes scheduled right now.' : `No classes in "${activeFilter}" status for ${snapshot.dayOfWeek}.`}
            </h3>
            <p class="text-xs text-slate-600 leading-relaxed">
              ${!snapshot.isAcademicDay
                ? `Today is ${snapshot.dayOfWeek}. Departmental classes are scheduled Monday through Saturday between 07:30 AM and 09:00 PM.`
                : !snapshot.activePeriod
                  ? `Current local time is ${snapshot.timeDisplay} (${snapshot.dayOfWeek}), which is outside the scheduled academic periods (07:30 AM – 09:00 PM).`
                  : `No ${includeDuty ? 'sessions' : 'academic classes'} are scheduled during ${snapshot.activePeriod.code} (${snapshot.activePeriod.label}) on ${snapshot.dayOfWeek}.`
              }
            </p>
            ${snapshot.isAcademicDay && activeFilter === 'ONGOING' && (breakdown.upcoming.length > 0 || breakdown.ended.length > 0) ? `
              <div class="mt-3 flex flex-wrap items-center justify-center gap-2">
                ${breakdown.upcoming.length > 0 ? `
                  <button type="button" onclick="setLiveAvailabilityFilter('UPCOMING')" class="h-8 px-3 text-xs font-mono font-semibold bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 transition-colors cursor-pointer">
                    View ${breakdown.upcoming.length} Not Started Yet Today →
                  </button>
                ` : ''}
                ${breakdown.ended.length > 0 ? `
                  <button type="button" onclick="setLiveAvailabilityFilter('ENDED')" class="h-8 px-3 text-xs font-mono font-semibold bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 transition-colors cursor-pointer">
                    View ${breakdown.ended.length} Already Ended Today (${snapshot.dayOfWeek}) →
                  </button>
                ` : ''}
              </div>
            ` : ''}
          </div>
        </div>
      ` : `
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-2.5 sm:gap-3 max-h-[420px] overflow-y-auto pr-1">
          ${displayedItems.map(item => {
            const s = item.session;
            const pDef = item.periodDef;
            const color = getInstructorColor(s.instructor);
            const leftBarColor = s.isDuty ? '#64748B' : color.ring;
            const displaySubject = s.isDuty ? (s.dutyName || s.subject.replace(/\s*\(Office Duty\)/i, '')) : s.subject;
            const displaySection = s.isDuty ? 'Office Duty' : (s.section && s.section !== '-' ? `Sec ${s.section}` : 'Lec / Lab');

            return `
              <div class="border border-slate-300 bg-white p-3 flex flex-col justify-between gap-2 hover:border-slate-400 transition-colors"
                   style="border-left: 4px solid ${leftBarColor}">
                <div>
                  <!-- Top Row: Class Name + Section & Live Schedule Status Badge -->
                  <div class="flex items-start justify-between gap-2">
                    <div class="min-w-0">
                      <div class="flex items-center gap-1.5 flex-wrap">
                        <span class="text-sm font-bold text-slate-900">${displaySubject}</span>
                        <span class="text-[11px] font-mono font-semibold px-1.5 py-0.2 bg-blue-50 text-blue-800 border border-blue-200">${displaySection}</span>
                      </div>
                    </div>
                    <div class="shrink-0">
                      ${renderStatusBadge(item)}
                    </div>
                  </div>

                  <!-- Middle Row: Start Time, End Time & Assigned Room -->
                  <div class="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between gap-2 text-xs font-mono">
                    <div class="min-w-0">
                      <div class="text-[9.5px] uppercase tracking-wider text-slate-400 font-semibold">START – END TIME</div>
                      <div class="text-[11.5px] font-bold text-slate-900 tabular-nums mt-0.5 whitespace-nowrap">
                        <span class="px-1 py-0.2 bg-slate-900 text-white text-[10px] mr-1">${pDef.code}</span>${pDef.start} – ${pDef.end}
                      </div>
                    </div>
                    <div class="text-right shrink-0">
                      <div class="text-[9.5px] uppercase tracking-wider text-slate-400 font-semibold">ASSIGNED ROOM</div>
                      <div class="mt-0.5">
                        <button type="button"
                                onclick="viewRoomFromSchedule('${escapeHtmlAttr(s.room)}')"
                                class="px-1.5 py-0.5 text-[11px] font-mono font-bold bg-slate-100 hover:bg-slate-900 text-slate-800 hover:text-white border border-slate-300 transition-colors cursor-pointer whitespace-nowrap">
                          ${s.room}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Bottom Row: Instructor & Timing Detail -->
                <div class="pt-2 border-t border-slate-100 flex items-center justify-between gap-2 text-[11px]">
                  <button type="button"
                          onclick="viewInstructor('${escapeHtmlAttr(s.instructor)}')"
                          class="font-semibold text-slate-800 hover:text-blue-700 flex items-center gap-1.5 truncate cursor-pointer"
                          title="Open ${escapeHtmlAttr(s.instructor)}'s timetable">
                    <span class="w-2 h-2 rounded-xs shrink-0" style="background-color: ${leftBarColor}"></span>
                    <span class="truncate">${s.instructor}</span>
                  </button>
                  <span class="font-mono text-[10.5px] text-slate-500 shrink-0 tabular-nums">${item.statusDetail}</span>
                </div>
              </div>
            `;
          }).join('')}
        </div>
      `}

      <!-- Schedule Status Integrity Note -->
      <div class="mt-3 pt-2.5 border-t border-slate-200 flex flex-wrap items-center justify-between gap-2 text-[11px] font-mono text-slate-500">
        <span>NOTE: Statuses reflect official department timetable hours (${MANILA_TIMEZONE}) and do not confirm physical room vacancy or attendance.</span>
        <span>TODAY'S SUMMARY: ${breakdown.ongoing.length} ONGOING • ${breakdown.upcoming.length} NOT STARTED YET • ${breakdown.ended.length} ENDED</span>
      </div>
    </div>
  `;

  initIcons();
}
