/**
 * Main Application Controller for Faculty Schedule & Room Occupancy Portal
 */

// Curated distinct, accessible, color-vision-deficiency-aware color tokens for instructors
// Used primarily as subtle left-border indicators and 7px identification dots on neutral surfaces
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
  activeTab: 'rooms', // 'rooms', 'master', 'instructor', 'roster'
  selectedRoom: '',
  selectedInstructor: '',
  roomSearchQuery: '',
  legendCollapsed: false,
  masterFilter: {
    day: 'ALL',
    room: 'ALL',
    instructor: 'ALL',
    search: '',
    viewMode: 'grid' // 'grid' or 'table'
  }
};

// Initialize app on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  initIcons();
  loadInitialData();
  setupEventListeners();
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
    setupDefaults();
    renderAll();
  }
}

function setupDefaults() {
  if (state.data.rooms && state.data.rooms.length > 0) {
    // Default to the room with highest occupancy or first room
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

  const activeClasses = ['bg-white', 'text-slate-900', 'shadow-2xs', 'ring-1', 'ring-slate-200/80', 'font-semibold'];
  const inactiveClasses = ['text-slate-600', 'hover:text-slate-900', 'font-medium'];

  const gridIcon = toggleGrid.querySelector('[data-lucide], svg');
  const tableIcon = toggleTable.querySelector('[data-lucide], svg');

  if (mode === 'grid') {
    toggleGrid.classList.add(...activeClasses);
    toggleGrid.classList.remove(...inactiveClasses);
    toggleGrid.setAttribute('aria-pressed', 'true');
    if (gridIcon) {
      gridIcon.classList.add('text-blue-600');
      gridIcon.classList.remove('text-slate-500');
    }

    toggleTable.classList.remove(...activeClasses);
    toggleTable.classList.add(...inactiveClasses);
    toggleTable.setAttribute('aria-pressed', 'false');
    if (tableIcon) {
      tableIcon.classList.remove('text-blue-600');
      tableIcon.classList.add('text-slate-500');
    }
  } else {
    toggleTable.classList.add(...activeClasses);
    toggleTable.classList.remove(...inactiveClasses);
    toggleTable.setAttribute('aria-pressed', 'true');
    if (tableIcon) {
      tableIcon.classList.add('text-blue-600');
      tableIcon.classList.remove('text-slate-500');
    }

    toggleGrid.classList.remove(...activeClasses);
    toggleGrid.classList.add(...inactiveClasses);
    toggleGrid.setAttribute('aria-pressed', 'false');
    if (gridIcon) {
      gridIcon.classList.remove('text-blue-600');
      gridIcon.classList.add('text-slate-500');
    }
  }
}

function updateMasterFilterToolbarState() {
  const { day, room, instructor, search } = state.masterFilter;
  const clearSearchBtn = document.getElementById('master-search-clear');
  const resetFiltersBtn = document.getElementById('master-reset-filters');
  const masterDay = document.getElementById('filter-master-day');
  const masterRoom = document.getElementById('filter-master-room');
  const masterInst = document.getElementById('filter-master-instructor');

  if (clearSearchBtn) {
    if (search && search.length > 0) {
      clearSearchBtn.classList.remove('hidden');
    } else {
      clearSearchBtn.classList.add('hidden');
    }
  }

  const hasActiveFilter = day !== 'ALL' || room !== 'ALL' || instructor !== 'ALL' || (search && search.length > 0);
  if (resetFiltersBtn) {
    if (hasActiveFilter) {
      resetFiltersBtn.classList.remove('hidden');
      resetFiltersBtn.classList.add('inline-flex');
    } else {
      resetFiltersBtn.classList.add('hidden');
      resetFiltersBtn.classList.remove('inline-flex');
    }
  }

  // Highlight active filter dropdowns subtly so user knows which filter is constraining the view
  [
    { el: masterDay, active: day !== 'ALL' },
    { el: masterRoom, active: room !== 'ALL' },
    { el: masterInst, active: instructor !== 'ALL' }
  ].forEach(({ el, active }) => {
    if (!el) return;
    if (active) {
      el.classList.add('border-blue-500/70', 'bg-blue-50/50', 'text-blue-900', 'font-semibold');
      el.classList.remove('border-slate-200', 'bg-slate-50/70', 'text-slate-700', 'font-medium');
    } else {
      el.classList.remove('border-blue-500/70', 'bg-blue-50/50', 'text-blue-900', 'font-semibold');
      el.classList.add('border-slate-200', 'bg-slate-50/70', 'text-slate-700', 'font-medium');
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
  const masterRoom = document.getElementById('filter-master-room');
  const masterInst = document.getElementById('filter-master-instructor');
  const masterSearch = document.getElementById('filter-master-search');
  const masterSearchClear = document.getElementById('master-search-clear');
  const masterResetFilters = document.getElementById('master-reset-filters');
  const toggleGrid = document.getElementById('toggle-view-grid');
  const toggleTable = document.getElementById('toggle-view-table');

  if (masterDay) masterDay.addEventListener('change', (e) => { state.masterFilter.day = e.target.value; renderMasterSchedule(); });
  if (masterRoom) masterRoom.addEventListener('change', (e) => { state.masterFilter.room = e.target.value; renderMasterSchedule(); });
  if (masterInst) masterInst.addEventListener('change', (e) => { state.masterFilter.instructor = e.target.value; renderMasterSchedule(); });
  if (masterSearch) masterSearch.addEventListener('input', (e) => { state.masterFilter.search = e.target.value.toLowerCase(); renderMasterSchedule(); });

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
      state.masterFilter.room = 'ALL';
      state.masterFilter.instructor = 'ALL';
      state.masterFilter.search = '';
      if (masterDay) masterDay.value = 'ALL';
      if (masterRoom) masterRoom.value = 'ALL';
      if (masterInst) masterInst.value = 'ALL';
      if (masterSearch) masterSearch.value = '';
      renderMasterSchedule();
    });
  }

  if (toggleGrid) toggleGrid.addEventListener('click', () => {
    state.masterFilter.viewMode = 'grid';
    setMasterViewModeUI('grid');
    renderMasterSchedule();
  });

  if (toggleTable) toggleTable.addEventListener('click', () => {
    state.masterFilter.viewMode = 'table';
    setMasterViewModeUI('table');
    renderMasterSchedule();
  });

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

// Switch Active Tab
function switchTab(tabName) {
  state.activeTab = tabName;
  document.querySelectorAll('[data-tab-target]').forEach(btn => {
    const isCurrent = btn.getAttribute('data-tab-target') === tabName;
    const icon = btn.querySelector('[data-lucide], svg');
    btn.setAttribute('aria-selected', isCurrent ? 'true' : 'false');

    if (isCurrent) {
      btn.classList.add('text-blue-700', 'bg-blue-50/80', 'ring-1', 'ring-inset', 'ring-blue-600/20', 'font-semibold');
      btn.classList.remove('text-slate-600', 'hover:text-slate-900', 'hover:bg-slate-100/70', 'font-medium');
      if (icon) {
        icon.classList.add('text-blue-600');
        icon.classList.remove('text-slate-400');
      }
    } else {
      btn.classList.remove('text-blue-700', 'bg-blue-50/80', 'ring-1', 'ring-inset', 'ring-blue-600/20', 'font-semibold');
      btn.classList.add('text-slate-600', 'hover:text-slate-900', 'hover:bg-slate-100/70', 'font-medium');
      if (icon) {
        icon.classList.remove('text-blue-600');
        icon.classList.add('text-slate-400');
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
  initIcons();
}

// Render Header Metrics
function renderStatCards() {
  if (!state.data) return;

  const totalInstructors = state.data.instructors ? state.data.instructors.length : 0;
  const totalSessions = state.data.sessions ? state.data.sessions.filter(s => !s.isDuty).length : 0;
  const totalRooms = state.data.rooms ? state.data.rooms.length : 0;
  const totalConflicts = state.data.conflicts ? state.data.conflicts.length : 0;

  document.getElementById('stat-instructors').textContent = totalInstructors;
  document.getElementById('stat-sessions').textContent = totalSessions;
  document.getElementById('stat-rooms').textContent = totalRooms;
  
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

  // Master Filter Instructors Dropdown
  const masterInstSelect = document.getElementById('filter-master-instructor');
  if (masterInstSelect) {
    masterInstSelect.innerHTML = `<option value="ALL">All Instructors (${state.data.instructors.length})</option>` +
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

  // Auto-select text on focus and show full faculty list so typing immediately replaces
  searchInput.addEventListener('focus', () => {
    searchInput.select();
    openDropdown('');
    updateClearButtonVisibility();
  });

  // Re-open list when clicking on the input
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

  // Close on outside click and synchronize input value
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

  // Keyboard navigation
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
    
    // Check tokens across name, qualification, status, subjects, rooms
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
    // Find matching subjects if query matched subject
    const matchedSubject = (tokens.length > 0 && !tokens.every(t => inst.name.toLowerCase().includes(t)))
      ? (inst.sessions || []).find(s => tokens.some(t => (s.subject || '').toLowerCase().includes(t)))
      : null;

    return `
      <div data-suggestion-item data-index="${index}" data-instructor-name="${escapeHtmlAttr(inst.name)}" class="px-3.5 py-2.5 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition-colors ${
        isSelected ? 'bg-blue-50/70 font-semibold text-blue-900' : 'text-slate-800'
      }">
        <div class="flex items-center gap-2.5 min-w-0 pr-2">
          <span class="w-3 h-3 rounded-full flex-shrink-0" style="background-color: ${color.ring}"></span>
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
          <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold ${
            inst.status && inst.status.includes('FT') ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
          }">
            ${inst.status || 'FACULTY'}
          </span>
          ${isSelected ? '<span class="text-blue-600 font-bold text-xs">✓</span>' : ''}
        </div>
      </div>
    `;
  }).join('');

  // Attach mousedown handlers to each suggestion item to reliably trigger selection
  dropdown.querySelectorAll('[data-suggestion-item]').forEach(item => {
    item.addEventListener('mousedown', (e) => {
      e.preventDefault();
      const name = item.getAttribute('data-instructor-name');
      if (name) {
        selectInstructorAutocomplete(name);
      }
    });
    item.addEventListener('click', (e) => {
      const name = item.getAttribute('data-instructor-name');
      if (name) {
        selectInstructorAutocomplete(name);
      }
    });
  });

  // If currently selected instructor is in the list and no query, scroll it into view
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
  return text.replace(regex, '<mark class="bg-yellow-200 text-slate-900 rounded-xs px-0.5">$1</mark>');
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

  // Also sync the master filter instructor dropdown if present
  const masterInst = document.getElementById('filter-master-instructor');
  if (masterInst) {
    masterInst.value = name;
  }

  updateInstructorQuickBadge();
  renderInstructorSchedule();
  initIcons();
};

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
    <span class="text-xs text-slate-400">Selected:</span>
    <span class="px-2.5 py-1 rounded-md text-xs font-semibold flex items-center gap-1.5 border"
          style="background-color: ${color.badgeBg}; color: ${color.badgeText}; border-color: ${color.border}">
      <span class="w-2 h-2 rounded-full" style="background-color: ${color.ring}"></span>
      <span class="truncate max-w-[150px]">${faculty.name.split(',')[0]}</span>
    </span>
  `;
}

// Format standardized time slot (e.g. "07:30 - 09:00") for compact time axis
function formatTimeAxisLabel(slot) {
  if (!slot) return '';
  const parts = slot.split('-').map(p => p.trim());
  if (parts.length === 2) {
    return `
      <div class="flex flex-col leading-tight font-mono" title="${escapeHtmlAttr(slot)}">
        <span class="text-[11.5px] font-semibold text-slate-700 tabular-nums">${parts[0]}</span>
        <span class="text-[10.5px] font-normal text-slate-400 tabular-nums mt-0.5">${parts[1]}</span>
      </div>
    `;
  }
  return `<span class="font-mono text-[11px] font-medium text-slate-600">${slot}</span>`;
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
      ? 'bg-blue-600 text-white border-blue-600 shadow-2xs font-semibold ring-2 ring-blue-600/20'
      : 'bg-slate-50/80 text-slate-700 border-slate-200/90 hover:bg-slate-100 hover:border-slate-300 font-medium';

    if (hasConflict && !isSelected) {
      btnClasses = 'bg-red-50/80 text-red-800 border-red-200 hover:bg-red-100/80 font-medium';
    }

    return `
      <button type="button" aria-pressed="${isSelected ? 'true' : 'false'}" class="h-7 px-2.5 text-xs rounded-md border transition-colors flex items-center gap-1.5 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${btnClasses}" onclick="selectRoom('${escapeHtmlAttr(r)}')">
        <span class="font-mono text-[11px]">${r}</span>
        ${hasConflict ? `<i data-lucide="alert-triangle" class="w-3 h-3 shrink-0 ${isSelected ? 'text-white' : 'text-red-600'}" aria-label="Room has schedule conflict"></i>` : ''}
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

/* =========================================================================
   TAB 1: ROOM OCCUPANCY & CONFLICT CHECKER
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

  // Filter sessions for this room
  const roomSessions = state.data.sessions.filter(s => s.room === currentRoom);

  // Check conflicts in this room
  const roomConflicts = (state.data.conflicts || []).filter(c => c.room === currentRoom);

  // Update room stats bar
  const totalSlots = window.TIME_SLOTS_STANDARDIZED.length * 6; // Mon-Sat slots = 54
  const occupiedSlots = roomSessions.length;
  const utilPercent = Math.min(100, Math.round((occupiedSlots / totalSlots) * 100));

  if (statsContainer) {
    statsContainer.innerHTML = `
      <div class="flex flex-wrap items-center justify-between gap-4 bg-white px-4 py-3 rounded-xl border border-slate-200/90">
        <div class="flex items-center gap-3">
          <div>
            <div class="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Selected Room</div>
            <div class="text-base font-semibold text-slate-900 flex items-center gap-2 mt-0.5">
              <span class="font-mono">${currentRoom}</span>
              ${roomConflicts.length > 0 
                ? `<span class="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] bg-red-50 text-red-700 font-medium rounded-md border border-red-200"><i data-lucide="alert-triangle" class="w-3 h-3 text-red-600" aria-hidden="true"></i>${roomConflicts.length} Conflict${roomConflicts.length > 1 ? 's' : ''}</span>`
                : `<span class="inline-flex items-center gap-1 px-2 py-0.5 text-[11px] bg-emerald-50 text-emerald-700 font-medium rounded-md border border-emerald-200"><i data-lucide="check-circle-2" class="w-3 h-3 text-emerald-600" aria-hidden="true"></i>Clear</span>`
              }
            </div>
          </div>
        </div>
        <div class="flex items-center gap-6">
          <div>
            <div class="text-[11px] text-slate-400 font-medium">Scheduled Sessions</div>
            <div class="text-sm font-semibold text-slate-800 font-mono tabular-nums mt-0.5">${occupiedSlots} classes</div>
          </div>
          <div>
            <div class="text-[11px] text-slate-400 font-medium">Weekly Utilization</div>
            <div class="flex items-center gap-2 mt-0.5">
              <div class="w-24 bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200/80">
                <div class="bg-blue-600 h-full rounded-full transition-all" style="width: ${utilPercent}%"></div>
              </div>
              <span class="text-xs font-semibold text-slate-700 font-mono tabular-nums">${utilPercent}%</span>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  // Conflict banner if any
  if (conflictContainer) {
    if (roomConflicts.length > 0) {
      conflictContainer.classList.remove('hidden');
      conflictContainer.innerHTML = `
        <div class="p-3.5 bg-red-50/90 border border-red-200 border-l-4 border-l-red-600 rounded-lg text-red-900">
          <div class="text-xs font-semibold flex items-center gap-2 text-red-800">
            <i data-lucide="alert-triangle" class="w-4 h-4 text-red-600 shrink-0" aria-hidden="true"></i>
            <span>Schedule Conflict Detected in ${currentRoom}</span>
          </div>
          <div class="mt-2 text-xs space-y-1.5">
            ${roomConflicts.map(c => `
              <div class="bg-white px-2.5 py-1.5 rounded border border-red-200/80 flex flex-wrap items-center gap-1.5">
                <span class="font-semibold font-mono text-[11px] text-slate-700">${c.day} • ${c.timeSlot}:</span>
                ${c.sessions.map(s => `<span class="inline-flex items-center px-2 py-0.5 bg-red-50 text-red-800 border border-red-200 rounded font-medium">${s.subject} (${s.section}) — ${s.instructor}</span>`).join(' <span class="text-red-600 font-semibold text-[11px]">overlaps with</span> ')}
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

  // Build Weekly Matrix Table
  const timeSlots = window.TIME_SLOTS_STANDARDIZED;
  const days = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];

  let html = `
    <div class="overflow-x-auto rounded-xl border border-slate-200/90 bg-white">
      <table class="w-full border-collapse text-left min-w-[1120px] table-fixed">
        <thead>
          <tr class="bg-slate-50/90 border-b border-slate-200/90 text-[11px] font-semibold uppercase text-slate-600 tracking-wider">
            <th class="py-2.5 px-3 w-[92px] min-w-[92px] border-r border-slate-200/90 sticky left-0 bg-slate-50 z-10 sticky-time-col">Time</th>
            ${days.map(d => `<th class="py-2.5 px-3 min-w-[170px] text-center border-r border-slate-200/80 last:border-r-0">${d}</th>`).join('')}
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-200/70 text-sm">
  `;

  timeSlots.forEach(slot => {
    html += `
      <tr class="hover:bg-slate-50/30 transition-colors">
        <td class="py-2.5 px-3 border-r border-slate-200/90 sticky left-0 bg-white z-10 align-top sticky-time-col">
          ${formatTimeAxisLabel(slot)}
        </td>
    `;

    days.forEach(day => {
      // Find session(s) in this slot for this room
      const matched = roomSessions.filter(s => s.day === day && s.timeSlot === slot);

      if (matched.length === 0) {
        // Free Slot
        html += `
          <td class="p-1.5 border-r border-slate-200/70 last:border-r-0 align-top">
            <div class="h-14 rounded-md border border-dashed border-slate-200/70 bg-slate-50/30 hover:bg-emerald-50/40 hover:border-emerald-200 flex items-center justify-center text-[11px] text-slate-400 hover:text-emerald-700 font-normal transition-colors group">
              <span class="opacity-60 group-hover:opacity-100">Available</span>
            </div>
          </td>
        `;
      } else if (matched.length === 1) {
        // Single occupied class
        const s = matched[0];
        const color = getInstructorColor(s.instructor);
        html += `
          <td class="p-1.5 border-r border-slate-200/70 last:border-r-0 align-top">
            <div role="button" tabindex="0"
                 class="schedule-card h-14 px-2.5 py-1.5 rounded-md border border-slate-200/90 bg-white text-xs flex flex-col justify-between cursor-pointer"
                 style="border-left: 3.5px solid ${color.ring}"
                 onclick="viewInstructor('${escapeHtmlAttr(s.instructor)}')"
                 onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();viewInstructor('${escapeHtmlAttr(s.instructor)}');}"
                 title="${escapeHtmlAttr(`${s.subject} (Sec ${s.section}) • ${s.instructor}`)}">
              <div class="flex items-center justify-between gap-1.5 min-w-0">
                <span class="font-semibold text-[12px] text-slate-900 truncate">${s.subject}</span>
                <span class="text-[10px] font-mono text-slate-500 shrink-0">Sec ${s.section}</span>
              </div>
              <div class="text-[11px] font-medium text-slate-700 truncate flex items-center gap-1.5">
                <span class="w-[7px] h-[7px] rounded-full shrink-0" style="background-color: ${color.ring}"></span>
                <span class="truncate">${s.instructor.split(',')[0]}</span>
              </div>
            </div>
          </td>
        `;
      } else {
        // Conflict! Multiple classes in the same slot
        html += `
          <td class="p-1.5 border-r border-slate-200/70 last:border-r-0 align-top">
            <div class="h-14 px-2 py-1.5 rounded-md bg-red-50 border border-red-300 border-l-4 border-l-red-600 text-red-950 flex flex-col justify-between">
              <div class="font-semibold text-[10.5px] text-red-700 flex items-center gap-1">
                <i data-lucide="alert-triangle" class="w-3 h-3 text-red-600 shrink-0" aria-hidden="true"></i>
                <span>Conflict (${matched.length})</span>
              </div>
              <div class="text-[10.5px] font-medium text-red-900 truncate" title="${escapeHtmlAttr(matched.map(m => `${m.subject} (${m.section})`).join(' vs '))}">
                ${matched.map(m => `${m.subject} (${m.section})`).join(' / ')}
              </div>
              <div class="text-[10px] text-red-700 truncate">
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
   ========================================================================= */
function renderMasterSchedule() {
  if (!state.data) return;

  const container = document.getElementById('master-schedule-container');
  const { day, room, instructor, search, viewMode } = state.masterFilter;

  updateMasterFilterToolbarState();

  const totalSessionsCount = state.data.sessions ? state.data.sessions.length : 0;

  // Filter sessions
  let filtered = state.data.sessions.filter(s => {
    if (day !== 'ALL' && s.day !== day) return false;
    if (room !== 'ALL' && s.room !== room) return false;
    if (instructor !== 'ALL' && s.instructor !== instructor) return false;
    if (search) {
      const target = `${s.subject} ${s.section} ${s.room} ${s.instructor} ${s.day} ${s.timeSlot}`.toLowerCase();
      if (!target.includes(search)) return false;
    }
    return true;
  });

  const countEl = document.getElementById('master-results-count');
  if (countEl) {
    if (filtered.length === totalSessionsCount) {
      countEl.innerHTML = `<span class="font-semibold text-slate-700 font-mono">${filtered.length}</span> sessions`;
    } else {
      countEl.innerHTML = `<span class="font-semibold text-blue-700 font-mono">${filtered.length}</span> <span class="text-slate-400">of ${totalSessionsCount}</span> sessions`;
    }
  }

  // Render Instructor Color Legend
  renderInstructorLegend();

  if (viewMode === 'table') {
    // Render Table View
    container.innerHTML = `
      <div class="overflow-x-auto rounded-xl border border-slate-200/90 bg-white">
        <table class="w-full text-left text-xs sm:text-sm divide-y divide-slate-200/90">
          <thead class="bg-slate-50/90 text-[11px] uppercase font-semibold text-slate-500 tracking-wider">
            <tr>
              <th class="py-3 px-4">Day</th>
              <th class="py-3 px-4">Time Slot</th>
              <th class="py-3 px-4">Subject Code</th>
              <th class="py-3 px-4">Section</th>
              <th class="py-3 px-4">Room</th>
              <th class="py-3 px-4">Instructor</th>
              <th class="py-3 px-4 text-right">Category</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 text-xs">
            ${filtered.length === 0 ? `
              <tr>
                <td colspan="7" class="p-10 text-center text-slate-500">
                  <div class="flex flex-col items-center justify-center gap-2">
                    <i data-lucide="calendar-x-2" class="w-6 h-6 text-slate-400" aria-hidden="true"></i>
                    <div class="font-medium text-slate-700">No scheduled sessions match the current filters</div>
                    <div class="text-xs text-slate-400">Try clearing your search query or resetting the day, room, and instructor filters.</div>
                  </div>
                </td>
              </tr>
            ` : ''}
            ${filtered.map(s => {
              const color = getInstructorColor(s.instructor);
              const accentRing = s.isDuty ? '#8B5CF6' : color.ring;
              const isOfficeRoom = s.room === 'OFFICE / DEPT';
              return `
                <tr class="hover:bg-slate-50/80 transition-colors">
                  <td class="py-2.5 px-4 font-medium text-slate-700 whitespace-nowrap">${s.day}</td>
                  <td class="py-2.5 px-4 text-slate-600 font-mono text-[11.5px] whitespace-nowrap tabular-nums">${s.timeSlot}</td>
                  <td class="py-2.5 px-4 font-semibold text-slate-900 whitespace-nowrap">${s.subject}</td>
                  <td class="py-2.5 px-4 text-slate-500 font-mono text-[11.5px] whitespace-nowrap">${s.section}</td>
                  <td class="py-2.5 px-4 whitespace-nowrap">
                    <span class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-mono font-medium border ${
                      isOfficeRoom
                        ? 'bg-slate-50 text-slate-600 border-slate-200/80'
                        : 'bg-slate-100/80 text-slate-700 border-slate-200/80'
                    }">
                      ${s.room}
                    </span>
                  </td>
                  <td class="py-2.5 px-4 whitespace-nowrap">
                    <button type="button"
                            class="inline-flex items-center gap-2 px-2.5 py-1 rounded-md text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200/90 hover:border-slate-300 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600" 
                            onclick="viewInstructor('${escapeHtmlAttr(s.instructor)}')"
                            title="View ${escapeHtmlAttr(s.instructor)}'s individual timetable">
                      <span class="w-2 h-2 rounded-full shrink-0" style="background-color: ${accentRing}"></span>
                      <span>${s.instructor}</span>
                    </button>
                  </td>
                  <td class="py-2.5 px-4 text-right whitespace-nowrap">
                    ${s.isDuty 
                      ? '<span class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-600 border border-slate-200/80">Office Duty</span>' 
                      : '<span class="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium bg-blue-50/70 text-blue-700 border border-blue-200/60">Academic Class</span>'
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

  // Render Master Grid View
  const timeSlots = window.TIME_SLOTS_STANDARDIZED;
  const days = day === 'ALL' ? ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"] : [day];

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="rounded-xl border border-slate-200/90 bg-white p-12 text-center">
        <div class="max-w-sm mx-auto flex flex-col items-center gap-2">
          <div class="w-10 h-10 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center">
            <i data-lucide="search-x" class="w-5 h-5" aria-hidden="true"></i>
          </div>
          <h3 class="text-sm font-semibold text-slate-800 mt-1">No matching schedule entries</h3>
          <p class="text-xs text-slate-500 leading-relaxed">No classes or duty sessions match your active filter criteria. Reset filters to view the full weekly timetable.</p>
          <button type="button" onclick="document.getElementById('master-reset-filters').click()" class="mt-2 h-8 px-3 text-xs font-medium rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors cursor-pointer">
            Reset All Filters
          </button>
        </div>
      </div>
    `;
    initIcons();
    return;
  }

  let html = `
    <div class="overflow-x-auto rounded-xl border border-slate-200/90 bg-white">
      <table class="w-full border-collapse text-left ${days.length > 1 ? 'min-w-[1180px] table-fixed' : 'min-w-[480px]'}">
        <thead>
          <tr class="bg-slate-50 border-b border-slate-200/90">
            <th scope="col" class="py-2.5 px-3 w-[92px] min-w-[92px] border-r border-slate-200/90 sticky left-0 top-0 bg-slate-50 z-20 text-[11px] font-semibold uppercase tracking-wider text-slate-500 sticky-time-col">
              Time
            </th>
            ${days.map(d => {
              const dayCount = filtered.filter(s => s.day === d).length;
              return `
                <th scope="col" class="py-2.5 px-3 min-w-[180px] border-r border-slate-200/80 last:border-r-0 sticky top-0 bg-slate-50 z-10">
                  <div class="flex items-center justify-between gap-1.5">
                    <span class="text-xs font-semibold uppercase tracking-wider text-slate-700">${d}</span>
                    <span class="px-1.5 py-0.5 text-[10.5px] font-mono font-medium rounded bg-slate-200/70 text-slate-600 tabular-nums" title="${dayCount} scheduled sessions on ${d}">${dayCount}</span>
                  </div>
                </th>
              `;
            }).join('')}
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-200/70 text-xs">
  `;

  timeSlots.forEach((slot, slotIdx) => {
    const rowBg = slotIdx % 2 === 1 ? 'bg-slate-50/25' : 'bg-white';
    html += `
      <tr class="${rowBg} group/row">
        <td class="py-2.5 px-3 border-r border-slate-200/90 sticky left-0 ${slotIdx % 2 === 1 ? 'bg-[#FAFBFD]' : 'bg-white'} z-10 align-top sticky-time-col">
          ${formatTimeAxisLabel(slot)}
        </td>
    `;

    days.forEach(d => {
      const slotSessions = filtered.filter(s => s.day === d && s.timeSlot === slot);
      html += `
        <td class="p-1.5 border-r border-slate-200/70 last:border-r-0 align-top">
          ${slotSessions.length === 0 ? `
            <div class="min-h-[56px] flex items-center justify-center text-[11px] text-slate-200 select-none" aria-hidden="true">—</div>
          ` : `
            <div class="space-y-1.5">
              ${slotSessions.map(s => {
                const color = getInstructorColor(s.instructor);
                const isDuty = Boolean(s.isDuty);
                const leftBarColor = isDuty ? '#8B5CF6' : color.ring;
                const dotColor = isDuty ? '#8B5CF6' : color.ring;
                const displaySubject = isDuty ? (s.dutyName || s.subject.replace(/\s*\(Office Duty\)/i, '')) : s.subject;
                const displayRoom = s.room === 'OFFICE / DEPT' ? 'DEPT' : s.room;
                const displaySection = isDuty ? 'Office Duty' : (s.section && s.section !== '-' ? `Sec ${s.section}` : 'Lec / Lab');
                const instructorSurname = s.instructor.split(',')[0];
                const fullTooltip = `${s.subject}${s.section && s.section !== '-' ? ` (Section ${s.section})` : ''}\nRoom: ${s.room}\nInstructor: ${s.instructor}\nSchedule: ${s.day} • ${s.timeSlot}`;

                return `
                  <div role="button" tabindex="0"
                       aria-label="${escapeHtmlAttr(`${s.subject}, ${displaySection}, Room ${s.room}, Instructor ${s.instructor}, ${s.day} ${s.timeSlot}`)}"
                       title="${escapeHtmlAttr(fullTooltip)}"
                       onclick="viewInstructor('${escapeHtmlAttr(s.instructor)}')"
                       onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();viewInstructor('${escapeHtmlAttr(s.instructor)}');}"
                       class="schedule-card rounded-md border ${isDuty ? 'bg-slate-50/90 border-slate-200/80' : 'bg-white border-slate-200/90'} px-2 py-1.5 cursor-pointer select-none"
                       style="border-left: 3.5px solid ${leftBarColor};">
                    <!-- Hierarchy Row 1: 1. Subject Code (Primary) + 2. Room (Secondary Monospace Badge) -->
                    <div class="flex items-center justify-between gap-1 min-w-0">
                      <span class="text-[12px] font-semibold ${isDuty ? 'text-slate-700' : 'text-slate-900'} leading-snug tracking-tight truncate">${displaySubject}</span>
                      <span class="text-[10px] font-mono font-medium px-1 py-0.5 rounded ${isDuty ? 'bg-slate-200/60 text-slate-600' : 'bg-slate-100 text-slate-600 border border-slate-200/70'} shrink-0 whitespace-nowrap leading-none">${displayRoom}</span>
                    </div>
                    <!-- Hierarchy Row 2: 3. Section (Muted Support) + 4. Instructor (Readable Name + Subtle Dot) -->
                    <div class="flex items-center justify-between gap-1.5 mt-1 min-w-0">
                      <span class="text-[10.5px] font-normal text-slate-500 truncate shrink-0">${displaySection}</span>
                      <span class="text-[11px] font-medium text-slate-700 truncate flex items-center gap-1 min-w-0">
                        <span class="w-[7px] h-[7px] rounded-full shrink-0" style="background-color: ${dotColor}"></span>
                        <span class="truncate">${instructorSurname}</span>
                      </span>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
          `}
        </td>
      `;
    });

    html += `</tr>`;
  });

  html += `
        </tbody>
      </table>
    </div>
  `;

  container.innerHTML = html;
  initIcons();
}

/* =========================================================================
   TAB 3: INDIVIDUAL INSTRUCTOR VIEW
   ========================================================================= */
function renderInstructorSchedule() {
  if (!state.data || !state.data.instructors) return;

  const currentName = state.selectedInstructor;
  const faculty = state.data.instructors.find(i => i.name === currentName);
  const container = document.getElementById('instructor-timetable-container');
  const profileContainer = document.getElementById('instructor-profile-card');

  if (!faculty) {
    if (container) container.innerHTML = '<div class="p-8 text-center text-slate-400">Please select an instructor.</div>';
    return;
  }

  // Profile Header Card
  const instColor = getInstructorColor(faculty.name);
  if (profileContainer) {
    profileContainer.innerHTML = `
      <div class="bg-white p-4 rounded-xl border border-slate-200/90 flex flex-wrap items-center justify-between gap-4" style="border-left: 5px solid ${instColor.ring}">
        <div>
          <div class="flex items-center gap-3">
            <div class="w-10 h-10 rounded-lg font-semibold flex items-center justify-center text-base text-white shrink-0" style="background-color: ${instColor.ring}">
              ${faculty.name.split(',')[0].charAt(0)}
            </div>
            <div>
              <div class="text-base font-semibold text-slate-900">${faculty.name}</div>
              <div class="text-xs text-slate-500 flex flex-wrap items-center gap-2 mt-0.5">
                <span class="px-2 py-0.5 rounded-md text-[11px] font-medium ${
                  faculty.status.includes('FT') ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-amber-50 text-amber-800 border border-amber-200'
                }">
                  ${faculty.status}
                </span>
                <span class="text-slate-300">•</span>
                <span>${faculty.qualification || 'Faculty Member'}</span>
              </div>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-5">
          <div class="text-right">
            <div class="text-[11px] text-slate-400 font-medium">Teaching Load</div>
            <div class="text-base font-semibold text-slate-900 font-mono tabular-nums">${faculty.sessions.filter(s => !s.isDuty).length} classes / wk</div>
          </div>
          <button type="button" onclick="window.print()" class="h-8 px-3 text-xs font-medium rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 flex items-center gap-1.5 transition-colors cursor-pointer">
            <i data-lucide="printer" class="w-3.5 h-3.5 text-slate-500" aria-hidden="true"></i>
            <span>Print Schedule</span>
          </button>
        </div>
      </div>
    `;
  }

  // Individual Weekly Timetable Grid
  const timeSlots = window.TIME_SLOTS_STANDARDIZED;
  const days = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];

  let html = `
    <div class="overflow-x-auto rounded-xl border border-slate-200/90 bg-white">
      <table class="w-full border-collapse text-left min-w-[1120px] table-fixed">
        <thead>
          <tr class="bg-slate-50 border-b border-slate-200/90 text-[11px] font-semibold uppercase text-slate-500 tracking-wider">
            <th class="py-2.5 px-3 w-[92px] min-w-[92px] border-r border-slate-200/90 sticky left-0 bg-slate-50 z-10 sticky-time-col">Time</th>
            ${days.map(d => `<th class="py-2.5 px-3 min-w-[170px] text-center border-r border-slate-200/80 last:border-r-0">${d}</th>`).join('')}
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-200/70 text-sm">
  `;

  timeSlots.forEach(slot => {
    html += `
      <tr class="hover:bg-slate-50/30 transition-colors">
        <td class="py-2.5 px-3 border-r border-slate-200/90 sticky left-0 bg-white z-10 align-top sticky-time-col">
          ${formatTimeAxisLabel(slot)}
        </td>
    `;

    days.forEach(day => {
      const matched = faculty.sessions.filter(s => s.day === day && s.timeSlot === slot);
      if (matched.length === 0) {
        html += `
          <td class="p-1.5 border-r border-slate-200/70 last:border-r-0 align-top">
            <div class="h-14 flex items-center justify-center text-xs text-slate-200 select-none">
              —
            </div>
          </td>
        `;
      } else {
        const s = matched[0];
        const leftBar = s.isDuty ? '#8B5CF6' : instColor.ring;
        html += `
          <td class="p-1.5 border-r border-slate-200/70 last:border-r-0 align-top">
            <div class="h-14 px-2.5 py-1.5 rounded-md flex flex-col justify-between border ${s.isDuty ? 'bg-slate-50/90 border-slate-200/80' : 'bg-white border-slate-200/90'}"
                 style="border-left: 3.5px solid ${leftBar}">
              <div class="font-semibold text-[12px] text-slate-900 truncate" title="${escapeHtmlAttr(s.subject)}">
                ${s.subject}
              </div>
              <div class="text-[11px] flex justify-between items-center text-slate-500">
                <span>${s.isDuty ? 'Office Duty' : `Sec ${s.section}`}</span>
                <span class="px-1.5 py-0.5 rounded font-mono text-[10px] bg-slate-100 text-slate-700 border border-slate-200/70">${s.room}</span>
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
   TAB 4: DEPARTMENT FACULTY ROSTER (FLR-001)
   ========================================================================= */
function renderRosterView() {
  if (!state.data) return;

  const container = document.getElementById('roster-container');
  if (!container) return;

  const instructors = state.data.instructors || [];

  container.innerHTML = `
    <div class="overflow-x-auto rounded-xl border border-slate-200/90 bg-white">
      <table class="w-full text-left text-xs sm:text-sm divide-y divide-slate-200/90">
        <thead class="bg-slate-50/90 text-[11px] uppercase font-semibold text-slate-500 tracking-wider">
          <tr>
            <th class="py-3 px-4">#</th>
            <th class="py-3 px-4">Faculty Member Name</th>
            <th class="py-3 px-4">Status</th>
            <th class="py-3 px-4">Educational Qualification</th>
            <th class="py-3 px-4 text-center">Weekly Sessions</th>
            <th class="py-3 px-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 text-xs">
          ${instructors.map((inst, idx) => {
            const color = getInstructorColor(inst.name);
            return `
              <tr class="hover:bg-slate-50/80 transition-colors">
                <td class="py-2.5 px-4 text-slate-400 font-mono text-xs tabular-nums">${idx + 1}</td>
                <td class="py-2.5 px-4 font-semibold text-slate-900">
                  <div class="flex items-center gap-2.5">
                    <span class="w-2.5 h-2.5 rounded-full shrink-0" style="background-color: ${color.ring}"></span>
                    <span>${inst.name}</span>
                  </div>
                </td>
                <td class="py-2.5 px-4">
                  <span class="px-2 py-0.5 rounded-md text-[11px] font-medium ${
                    inst.status.includes('FT') ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-amber-50 text-amber-800 border border-amber-200'
                  }">
                    ${inst.status}
                  </span>
                </td>
                <td class="py-2.5 px-4 text-slate-600 text-xs">${inst.qualification || '-'}</td>
                <td class="py-2.5 px-4 text-center font-semibold font-mono text-slate-800 tabular-nums">${inst.sessions.filter(s => !s.isDuty).length}</td>
                <td class="py-2.5 px-4 text-right">
                  <button type="button" class="px-2.5 py-1 text-xs font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 border border-slate-200/90 hover:border-slate-300 transition-colors cursor-pointer" 
                          onclick="viewInstructor('${escapeHtmlAttr(inst.name)}')">
                    View Timetable
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

// Instructor Color Guide Bar in Master Timetable
function renderInstructorLegend() {
  const legendContainer = document.getElementById('instructor-legend-bar');
  if (!legendContainer || !state.data || !state.data.instructors) return;

  const instructors = state.data.instructors;
  const activeInstructor = state.masterFilter.instructor;
  const hasSelectedInstructor = activeInstructor !== 'ALL';
  const isCollapsed = Boolean(state.legendCollapsed);

  legendContainer.innerHTML = `
    <div class="bg-white px-3.5 py-2.5 rounded-xl border border-slate-200/90">
      <div class="flex flex-wrap items-center justify-between gap-2">
        <div class="flex items-center gap-2 min-w-0">
          <span class="text-xs font-semibold text-slate-700">Instructor Color Guide</span>
          <span class="text-[11px] text-slate-400 hidden sm:inline">• Click faculty to filter timetable</span>
          ${hasSelectedInstructor ? `
            <span class="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold bg-blue-50 text-blue-800 border border-blue-200">
              <span>Filtered: ${activeInstructor.split(',')[0]}</span>
              <button type="button" onclick="filterByInstructor('ALL')" class="hover:text-blue-950 cursor-pointer" title="Clear instructor filter" aria-label="Clear instructor filter">
                <i data-lucide="x" class="w-3 h-3" aria-hidden="true"></i>
              </button>
            </span>
          ` : ''}
        </div>

        <div class="flex items-center gap-2 ml-auto">
          <button type="button"
                  aria-pressed="${!hasSelectedInstructor ? 'true' : 'false'}"
                  class="h-6 px-2 text-[11px] font-medium rounded transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                    hasSelectedInstructor
                      ? 'text-blue-700 bg-blue-50 hover:bg-blue-100/80 font-semibold'
                      : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
                  }"
                  onclick="filterByInstructor('ALL')">
            Show All (${instructors.length})
          </button>

          <button type="button"
                  aria-expanded="${!isCollapsed ? 'true' : 'false'}"
                  class="h-6 px-2 text-[11px] font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded flex items-center gap-1 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                  onclick="toggleInstructorLegend()">
            <span>${isCollapsed ? 'Expand' : 'Collapse'}</span>
            <i data-lucide="${isCollapsed ? 'chevron-down' : 'chevron-up'}" class="w-3 h-3" aria-hidden="true"></i>
          </button>
        </div>
      </div>

      ${isCollapsed ? '' : `
        <div class="flex items-center gap-1.5 flex-wrap mt-2 pt-2 border-t border-slate-100">
          ${instructors.map(i => {
            const color = getInstructorColor(i.name);
            const isSelected = activeInstructor === i.name;
            const surname = i.name.split(',')[0];
            const classCount = (i.sessions || []).filter(s => !s.isDuty).length;

            const chipStateClasses = isSelected
              ? 'bg-blue-50/90 text-blue-950 border-blue-600 ring-1 ring-blue-600 font-semibold shadow-2xs'
              : hasSelectedInstructor
                ? 'bg-slate-50/60 text-slate-600 border-slate-200/80 opacity-75 hover:opacity-100 hover:bg-slate-100 hover:border-slate-300 font-medium'
                : 'bg-slate-50/80 text-slate-700 border-slate-200/90 hover:bg-slate-100 hover:text-slate-900 hover:border-slate-300 font-medium';

            return `
              <button type="button"
                      aria-pressed="${isSelected ? 'true' : 'false'}"
                      aria-label="Filter by instructor ${escapeHtmlAttr(i.name)}"
                      title="${escapeHtmlAttr(`${i.name} (${classCount} academic classes)`)}"
                      class="h-6 px-2 rounded-md text-[11px] transition-all inline-flex items-center gap-1.5 border cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${chipStateClasses}"
                      onclick="filterByInstructor('${escapeHtmlAttr(i.name)}')">
                <span class="w-[7px] h-[7px] rounded-full shrink-0" style="background-color: ${color.ring}"></span>
                <span class="truncate max-w-[120px]">${surname}</span>
                ${isSelected ? `<i data-lucide="check" class="w-3 h-3 text-blue-700 shrink-0" aria-hidden="true"></i>` : ''}
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
  // Toggle off if clicking the already-selected instructor chip
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

        // Call the workbook parser
        const parsed = window.parseScheduleWorkbook(workbook);

        if (!parsed.instructors || parsed.instructors.length === 0) {
          showUploadStatus('No individual schedule sheets found in this file. Please make sure the sheets have "INDIVIDUAL FACULTY TEACHING LOAD ASSIGNMENT" or "CLASS SCHEDULE".', 'error');
          return;
        }

        // Save state and persist to local storage
        state.data = parsed;
        try {
          localStorage.setItem('cea_schedule_data', JSON.stringify(parsed));
        } catch (storageErr) {
          console.warn('LocalStorage quota exceeded, data will remain in memory for this session.', storageErr);
        }

        setupDefaults();
        renderAll();

        showUploadStatus(`Successfully parsed ${parsed.instructors.length} instructors, ${parsed.sessions.length} sessions across ${parsed.rooms.length} rooms!`, 'success');

        // Close modal after 1.5 seconds
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
  toast.className = `fixed bottom-5 right-5 z-50 px-4 py-3 rounded-lg shadow-lg text-sm font-medium flex items-center gap-2 transition-all transform translate-y-2 opacity-0 ${
    type === 'success' ? 'bg-emerald-800 text-white' : 'bg-slate-900 text-white'
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

  const headers = ['Day', 'TimeSlot', 'Subject', 'Section', 'Room', 'Instructor', 'IsOfficeDuty'];
  const rows = state.data.sessions.map(s => [
    `"${s.day}"`,
    `"${s.timeSlot}"`,
    `"${s.subject}"`,
    `"${s.section}"`,
    `"${s.room}"`,
    `"${s.instructor}"`,
    s.isDuty ? 'Yes' : 'No'
  ]);

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
