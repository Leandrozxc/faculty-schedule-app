/**
 * Main Application Controller for Faculty Schedule & Room Occupancy Portal
 */

// Curated 24 distinct, soft, accessible color palettes for instructors
const INSTRUCTOR_COLOR_PALETTES = [
  { name: 'emerald', bg: '#ecfdf5', border: '#a7f3d0', text: '#065f46', ring: '#10b981', badgeBg: '#d1fae5', badgeText: '#065f46' },
  { name: 'sky', bg: '#f0f9ff', border: '#bae6fd', text: '#0369a1', ring: '#0284c7', badgeBg: '#e0f2fe', badgeText: '#0369a1' },
  { name: 'violet', bg: '#f5f3ff', border: '#ddd6fe', text: '#6d28d9', ring: '#7c3aed', badgeBg: '#ede9fe', badgeText: '#6d28d9' },
  { name: 'amber', bg: '#fffbeb', border: '#fde68a', text: '#b45309', ring: '#d97706', badgeBg: '#fef3c7', badgeText: '#92400e' },
  { name: 'rose', bg: '#fff1f2', border: '#fecdd3', text: '#be123c', ring: '#e11d48', badgeBg: '#ffe4e6', badgeText: '#9f1239' },
  { name: 'teal', bg: '#f0fdfa', border: '#99f6e4', text: '#0f766e', ring: '#0d9488', badgeBg: '#ccfbf1', badgeText: '#115e59' },
  { name: 'indigo', bg: '#eef2ff', border: '#c7d2fe', text: '#4338ca', ring: '#4f46e5', badgeBg: '#e0e7ff', badgeText: '#3730a3' },
  { name: 'orange', bg: '#fff7ed', border: '#fed7aa', text: '#c2410c', ring: '#ea580c', badgeBg: '#ffedd5', badgeText: '#9a3412' },
  { name: 'fuchsia', bg: '#fdf4ff', border: '#f5d0fe', text: '#a21caf', ring: '#c026d3', badgeBg: '#fae8ff', badgeText: '#86198f' },
  { name: 'cyan', bg: '#ecfeff', border: '#a5f3fc', text: '#0e7490', ring: '#0891b2', badgeBg: '#cffafe', badgeText: '#155e75' },
  { name: 'lime', bg: '#f7fee7', border: '#d9f99d', text: '#4d7c0f', ring: '#65a30d', badgeBg: '#ecfccb', badgeText: '#3f6212' },
  { name: 'purple', bg: '#faf5ff', border: '#e9d5ff', text: '#7e22ce', ring: '#9333ea', badgeBg: '#f3e8ff', badgeText: '#6b21a8' },
  { name: 'pink', bg: '#fdf2f8', border: '#fbcfe8', text: '#be185d', ring: '#db2777', badgeBg: '#fce7f3', badgeText: '#9d174d' },
  { name: 'slate', bg: '#f8fafc', border: '#cbd5e1', text: '#334155', ring: '#64748b', badgeBg: '#e2e8f0', badgeText: '#1e293b' },
  { name: 'blue', bg: '#eff6ff', border: '#bfdbfe', text: '#1d4ed8', ring: '#2563eb', badgeBg: '#dbeafe', badgeText: '#1e40af' },
  { name: 'green', bg: '#f0fdf4', border: '#bbf7d0', text: '#15803d', ring: '#16a34a', badgeBg: '#dcfce7', badgeText: '#166534' },
  { name: 'yellow', bg: '#fefce8', border: '#fef08a', text: '#a16207', ring: '#ca8a04', badgeBg: '#fef9c3', badgeText: '#854d0e' },
  { name: 'red', bg: '#fef2f2', border: '#fecaca', text: '#b91c1c', ring: '#dc2626', badgeBg: '#fee2e2', badgeText: '#991b1b' },
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
  const toggleGrid = document.getElementById('toggle-view-grid');
  const toggleTable = document.getElementById('toggle-view-table');

  if (masterDay) masterDay.addEventListener('change', (e) => { state.masterFilter.day = e.target.value; renderMasterSchedule(); });
  if (masterRoom) masterRoom.addEventListener('change', (e) => { state.masterFilter.room = e.target.value; renderMasterSchedule(); });
  if (masterInst) masterInst.addEventListener('change', (e) => { state.masterFilter.instructor = e.target.value; renderMasterSchedule(); });
  if (masterSearch) masterSearch.addEventListener('input', (e) => { state.masterFilter.search = e.target.value.toLowerCase(); renderMasterSchedule(); });

  if (toggleGrid) toggleGrid.addEventListener('click', () => {
    state.masterFilter.viewMode = 'grid';
    toggleGrid.classList.add('bg-blue-600', 'text-white');
    toggleGrid.classList.remove('bg-white', 'text-slate-700');
    toggleTable.classList.remove('bg-blue-600', 'text-white');
    toggleTable.classList.add('bg-white', 'text-slate-700');
    renderMasterSchedule();
  });

  if (toggleTable) toggleTable.addEventListener('click', () => {
    state.masterFilter.viewMode = 'table';
    toggleTable.classList.add('bg-blue-600', 'text-white');
    toggleTable.classList.remove('bg-white', 'text-slate-700');
    toggleGrid.classList.remove('bg-blue-600', 'text-white');
    toggleGrid.classList.add('bg-white', 'text-slate-700');
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
    if (isCurrent) {
      btn.classList.add('border-blue-600', 'text-blue-600', 'bg-blue-50');
      btn.classList.remove('border-transparent', 'text-slate-600', 'hover:bg-slate-50');
    } else {
      btn.classList.remove('border-blue-600', 'text-blue-600', 'bg-blue-50');
      btn.classList.add('border-transparent', 'text-slate-600', 'hover:bg-slate-50');
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
  if (tabName === 'instructor') renderInstructorSchedule();
  if (tabName === 'roster') renderRosterView();

  initIcons();
}

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
  updateInstructorQuickBadge();

  // Master Filter Instructors Dropdown
  const masterInstSelect = document.getElementById('filter-master-instructor');
  if (masterInstSelect) {
    masterInstSelect.innerHTML = `<option value="ALL">All Instructors (${state.data.instructors.length})</option>` +
      state.data.instructors.map(i => `<option value="${i.name}">${i.name}</option>`).join('');
  }
}

let activeSuggestionIndex = -1;

function setupInstructorAutocomplete() {
  const searchInput = document.getElementById('instructor-search-input');
  const dropdown = document.getElementById('instructor-suggestions-dropdown');
  const toggleBtn = document.getElementById('instructor-search-toggle');
  const chevron = document.getElementById('instructor-chevron');
  const wrapper = document.getElementById('instructor-combobox-wrapper');

  if (!searchInput || !dropdown) return;

  function openDropdown() {
    dropdown.classList.remove('hidden');
    if (chevron) chevron.classList.add('rotate-180');
    renderInstructorSuggestions(searchInput.value);
  }

  function closeDropdown() {
    dropdown.classList.add('hidden');
    if (chevron) chevron.classList.remove('rotate-180');
    activeSuggestionIndex = -1;
  }

  searchInput.addEventListener('input', (e) => {
    openDropdown();
    renderInstructorSuggestions(e.target.value);
  });

  searchInput.addEventListener('focus', () => {
    openDropdown();
    renderInstructorSuggestions(searchInput.value);
  });

  if (toggleBtn) {
    toggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (dropdown.classList.contains('hidden')) {
        searchInput.focus();
        openDropdown();
        renderInstructorSuggestions('');
      } else {
        closeDropdown();
      }
    });
  }

  // Close on outside click
  document.addEventListener('click', (e) => {
    if (wrapper && !wrapper.contains(e.target)) {
      closeDropdown();
    }
  });

  // Keyboard navigation
  searchInput.addEventListener('keydown', (e) => {
    const items = dropdown.querySelectorAll('[data-suggestion-item]');
    if (dropdown.classList.contains('hidden') || items.length === 0) {
      if (e.key === 'ArrowDown') {
        openDropdown();
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
      if (activeSuggestionIndex >= 0 && activeSuggestionIndex < items.length) {
        items[activeSuggestionIndex].click();
      } else if (items.length > 0) {
        items[0].click();
      }
    } else if (e.key === 'Escape') {
      closeDropdown();
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
  const matches = state.data.instructors.filter(i => {
    if (!q) return true;
    return i.name.toLowerCase().includes(q) || 
           (i.status && i.status.toLowerCase().includes(q)) ||
           (i.qualification && i.qualification.toLowerCase().includes(q));
  });

  if (matches.length === 0) {
    dropdown.innerHTML = `
      <div class="px-4 py-3 text-xs text-slate-400 text-center italic">
        No faculty found matching "${query}". Try searching by last name (e.g. Polancos, Esplanada).
      </div>
    `;
    return;
  }

  dropdown.innerHTML = matches.map((inst, index) => {
    const isSelected = inst.name === state.selectedInstructor;
    const color = getInstructorColor(inst.name);
    return `
      <div data-suggestion-item data-index="${index}" class="px-3.5 py-2.5 flex items-center justify-between hover:bg-slate-50 cursor-pointer transition-colors ${
        isSelected ? 'bg-blue-50/70 font-semibold text-blue-900' : 'text-slate-800'
      }" onclick="selectInstructorAutocomplete('${inst.name}')">
        <div class="flex items-center gap-2.5 min-w-0 pr-2">
          <span class="w-3 h-3 rounded-full flex-shrink-0" style="background-color: ${color.ring}"></span>
          <div class="truncate">
            <div class="text-xs truncate ${isSelected ? 'font-bold text-blue-900' : 'font-semibold'}">
              ${highlightMatchText(inst.name, q)}
            </div>
            <div class="text-[11px] text-slate-400 truncate">
              ${inst.qualification || inst.status}
            </div>
          </div>
        </div>
        <div class="flex items-center gap-2 flex-shrink-0">
          <span class="px-2 py-0.5 rounded-full text-[10px] font-semibold ${
            inst.status.includes('FT') ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
          }">
            ${inst.status}
          </span>
          ${isSelected ? '<span class="text-blue-600 font-bold text-xs">✓</span>' : ''}
        </div>
      </div>
    `;
  }).join('');
}

function highlightMatchText(text, query) {
  if (!query) return text;
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return text.replace(regex, '<mark class="bg-yellow-200 text-slate-900 rounded-xs px-0.5">$1</mark>');
}

window.selectInstructorAutocomplete = function(name) {
  state.selectedInstructor = name;
  const searchInput = document.getElementById('instructor-search-input');
  if (searchInput) searchInput.value = name;

  const dropdown = document.getElementById('instructor-suggestions-dropdown');
  if (dropdown) dropdown.classList.add('hidden');
  const chevron = document.getElementById('instructor-chevron');
  if (chevron) chevron.classList.remove('rotate-180');

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
        No rooms match "${query}". Try searching for ALLIED, BGANNEX, SAL, or GLEC.
      </div>
    `;
    return;
  }

  container.innerHTML = filteredRooms.map(r => {
    const isSelected = r === state.selectedRoom;
    const hasConflict = conflictRooms.has(r);

    let btnClasses = isSelected
      ? 'bg-blue-600 text-white border-blue-600 shadow-xs font-bold ring-2 ring-blue-300'
      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100 font-medium';

    if (hasConflict && !isSelected) {
      btnClasses = 'bg-red-50 text-red-700 border-red-300 hover:bg-red-100 font-semibold';
    }

    return `
      <button type="button" class="px-3 py-1.5 text-xs rounded-full border transition-all flex items-center gap-1.5 ${btnClasses}" onclick="selectRoom('${r}')">
        <span>${r}</span>
        ${hasConflict ? `<span class="text-[10px] ${isSelected ? 'text-white' : 'text-red-600'}" title="Room has schedule conflict">⚠️</span>` : ''}
      </button>
    `;
  }).join('');
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
      <div class="flex flex-wrap items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200">
        <div>
          <div class="text-xs uppercase tracking-wider text-slate-400 font-semibold">Active Room</div>
          <div class="text-xl font-bold text-slate-800 flex items-center gap-2">
            <span>${currentRoom}</span>
            ${roomConflicts.length > 0 
              ? `<span class="px-2 py-0.5 text-xs bg-red-100 text-red-700 font-semibold rounded-full border border-red-300">⚠️ ${roomConflicts.length} Conflict(s)</span>`
              : `<span class="px-2 py-0.5 text-xs bg-emerald-100 text-emerald-700 font-semibold rounded-full border border-emerald-300">✓ No Conflicts</span>`
            }
          </div>
        </div>
        <div class="flex items-center gap-6">
          <div>
            <div class="text-xs text-slate-400">Scheduled Sessions</div>
            <div class="text-lg font-bold text-slate-700">${occupiedSlots} classes</div>
          </div>
          <div>
            <div class="text-xs text-slate-400">Weekly Utilization</div>
            <div class="flex items-center gap-2">
              <div class="w-24 bg-slate-100 h-3 rounded-full overflow-hidden border border-slate-200">
                <div class="bg-blue-600 h-full rounded-full transition-all" style="width: ${utilPercent}%"></div>
              </div>
              <span class="text-sm font-semibold text-slate-700">${utilPercent}%</span>
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
        <div class="p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg text-red-800">
          <div class="font-bold flex items-center gap-2">
            <i data-lucide="alert-triangle" class="w-5 h-5 text-red-600"></i>
            Schedule Conflict Detected in ${currentRoom}!
          </div>
          <div class="mt-2 text-sm space-y-1">
            ${roomConflicts.map(c => `
              <div class="bg-white/80 p-2 rounded border border-red-200">
                <span class="font-semibold">${c.day} @ ${c.timeSlot}:</span>
                ${c.sessions.map(s => `<span class="inline-block ml-2 px-2 py-0.5 bg-red-100 text-red-800 rounded font-medium">${s.subject} (${s.section}) - ${s.instructor}</span>`).join(' <b class="text-red-700">overlaps with</b> ')}
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
    <div class="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <table class="w-full border-collapse text-left min-w-[850px]">
        <thead>
          <tr class="bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase text-slate-500 tracking-wider">
            <th class="py-3 px-3 w-32 border-r border-slate-200 sticky left-0 bg-slate-50 z-10">Time Slot</th>
            ${days.map(d => `<th class="py-3 px-3 text-center border-r border-slate-200 last:border-r-0">${d}</th>`).join('')}
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 text-sm">
  `;

  timeSlots.forEach(slot => {
    html += `
      <tr class="hover:bg-slate-50/50 transition-colors">
        <td class="py-3 px-3 font-medium text-slate-600 text-xs border-r border-slate-200 sticky left-0 bg-white whitespace-nowrap">
          ${slot}
        </td>
    `;

    days.forEach(day => {
      // Find session(s) in this slot for this room
      const matched = roomSessions.filter(s => s.day === day && s.timeSlot === slot);

      if (matched.length === 0) {
        // Free Slot
        html += `
          <td class="p-2 border-r border-slate-200 last:border-r-0 align-top">
            <div class="h-16 rounded-lg border border-dashed border-slate-200 bg-emerald-50/20 hover:bg-emerald-50 flex items-center justify-center text-xs text-emerald-600 font-medium transition-all group">
              <span class="opacity-40 group-hover:opacity-100">Vacant</span>
            </div>
          </td>
        `;
      } else if (matched.length === 1) {
        // Single occupied class
        const s = matched[0];
        const color = getInstructorColor(s.instructor);
        html += `
          <td class="p-2 border-r border-slate-200 last:border-r-0 align-top">
            <div class="h-16 p-2 rounded-lg border text-xs flex flex-col justify-between shadow-xs hover:shadow-md transition-all cursor-pointer"
                 style="background-color: ${color.bg}; border-color: ${color.border}; color: ${color.text}; border-left-width: 4px; border-left-color: ${color.ring}"
                 onclick="viewInstructor('${s.instructor}')" title="Click to view ${s.instructor}'s full schedule">
              <div class="font-bold text-xs truncate" title="${s.subject}">
                ${s.subject}
              </div>
              <div class="text-[11px] font-medium flex justify-between items-center opacity-90">
                <span>Sec: ${s.section}</span>
              </div>
              <div class="text-[10px] font-bold truncate flex items-center gap-1.5" title="${s.instructor}">
                <span class="w-2 h-2 rounded-full flex-shrink-0" style="background-color: ${color.ring}"></span>
                <span class="truncate">${s.instructor.split(',')[0]}</span>
              </div>
            </div>
          </td>
        `;
      } else {
        // Conflict! Multiple classes in the same slot
        html += `
          <td class="p-2 border-r border-slate-200 last:border-r-0 align-top">
            <div class="h-16 p-2 rounded-lg bg-red-100 border-2 border-red-500 text-red-950 flex flex-col justify-between animate-pulse">
              <div class="font-black text-[11px] text-red-700 flex items-center gap-1">
                ⚠️ DOUBLE BOOKED!
              </div>
              <div class="text-[10px] font-semibold text-red-800 truncate">
                ${matched.map(m => `${m.subject} (${m.section})`).join(' vs ')}
              </div>
              <div class="text-[9px] text-red-700 truncate">
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
}

/* =========================================================================
   TAB 2: MASTER WEEKLY SCHEDULE (MON - SUN)
   ========================================================================= */
function renderMasterSchedule() {
  if (!state.data) return;

  const container = document.getElementById('master-schedule-container');
  const { day, room, instructor, search, viewMode } = state.masterFilter;

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

  document.getElementById('master-results-count').textContent = `Showing ${filtered.length} scheduled sessions`;

  if (viewMode === 'table') {
    // Render Table View
    container.innerHTML = `
      <div class="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table class="w-full text-left text-sm divide-y divide-slate-200">
          <thead class="bg-slate-50 text-xs uppercase font-semibold text-slate-500 tracking-wider">
            <tr>
              <th class="py-3 px-4">Day</th>
              <th class="py-3 px-4">Time Slot</th>
              <th class="py-3 px-4">Subject</th>
              <th class="py-3 px-4">Section</th>
              <th class="py-3 px-4">Room</th>
              <th class="py-3 px-4">Instructor</th>
              <th class="py-3 px-4 text-center">Type</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            ${filtered.length === 0 ? `<tr><td colspan="7" class="p-8 text-center text-slate-400">No sessions match your filter.</td></tr>` : ''}
            ${filtered.map(s => {
              const color = s.isDuty 
                ? { bg: '#fdf4ff', border: '#f5d0fe', text: '#86198f', ring: '#d946ef', badgeBg: '#fae8ff', badgeText: '#701a75' }
                : getInstructorColor(s.instructor);
              return `
                <tr class="hover:bg-slate-50 transition-colors">
                  <td class="py-3 px-4 font-semibold text-slate-700">${s.day}</td>
                  <td class="py-3 px-4 text-slate-600 font-mono text-xs">${s.timeSlot}</td>
                  <td class="py-3 px-4 font-bold text-slate-900">${s.subject}</td>
                  <td class="py-3 px-4 text-slate-600 font-medium">${s.section}</td>
                  <td class="py-3 px-4 font-medium text-slate-800">
                    <span class="px-2 py-0.5 rounded text-xs ${s.room === 'OFFICE / DEPT' ? 'bg-amber-100 text-amber-800' : 'bg-slate-100 text-slate-700 font-mono'}">
                      ${s.room}
                    </span>
                  </td>
                  <td class="py-3 px-4">
                    <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold cursor-pointer hover:opacity-80 transition-opacity" 
                          style="background-color: ${color.badgeBg}; color: ${color.badgeText}; border: 1px solid ${color.border}"
                          onclick="viewInstructor('${s.instructor}')" title="Click to view schedule">
                      <span class="w-2 h-2 rounded-full" style="background-color: ${color.ring}"></span>
                      ${s.instructor}
                    </span>
                  </td>
                  <td class="py-3 px-4 text-center">
                    ${s.isDuty 
                      ? '<span class="px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">Office Duty</span>' 
                      : '<span class="px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700">Lecture / Lab</span>'
                    }
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    `;
  } else {
    // Render Master Grid View
    const timeSlots = window.TIME_SLOTS_STANDARDIZED;
    const days = day === 'ALL' ? ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"] : [day];

    let html = `
      <div class="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table class="w-full border-collapse text-left min-w-[900px]">
          <thead>
            <tr class="bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase text-slate-500 tracking-wider">
              <th class="py-3 px-3 w-32 border-r border-slate-200 sticky left-0 bg-slate-50 z-10">Time</th>
              ${days.map(d => `<th class="py-3 px-3 text-center border-r border-slate-200 last:border-r-0">${d}</th>`).join('')}
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100 text-sm">
    `;

    timeSlots.forEach(slot => {
      html += `
        <tr class="hover:bg-slate-50/30 transition-colors">
          <td class="py-3 px-3 font-medium text-slate-600 text-xs border-r border-slate-200 sticky left-0 bg-white whitespace-nowrap">
            ${slot}
          </td>
      `;

      days.forEach(d => {
        const slotSessions = filtered.filter(s => s.day === d && s.timeSlot === slot);
        html += `
          <td class="p-1.5 border-r border-slate-200 last:border-r-0 align-top">
            <div class="min-h-[72px] space-y-1.5">
              ${slotSessions.length === 0 ? `
                <div class="h-16 flex items-center justify-center text-[11px] text-slate-300">-</div>
              ` : slotSessions.map(s => {
                const color = s.isDuty 
                  ? { bg: '#fdf4ff', border: '#f5d0fe', text: '#86198f', ring: '#d946ef', badgeBg: '#fae8ff', badgeText: '#701a75' }
                  : getInstructorColor(s.instructor);
                return `
                  <div class="p-2 rounded-lg text-xs border transition-all hover:shadow-md cursor-pointer"
                       style="background-color: ${color.bg}; border-color: ${color.border}; color: ${color.text}; border-left-width: 4px; border-left-color: ${color.ring}"
                       onclick="viewInstructor('${s.instructor}')" title="Click to view ${s.instructor}'s full schedule">
                    <div class="font-bold flex justify-between items-start gap-1">
                      <span class="truncate font-black" title="${s.subject}">${s.subject}</span>
                      <span class="text-[10px] px-1.5 py-0.2 rounded font-mono font-semibold bg-white/80 border" style="border-color: ${color.border}; color: ${color.text}">${s.room}</span>
                    </div>
                    <div class="text-[11px] flex justify-between mt-1 opacity-90 font-medium">
                      <span>Sec: ${s.section}</span>
                      <span class="truncate ml-1 font-bold flex items-center gap-1" title="${s.instructor}">
                        <span class="w-1.5 h-1.5 rounded-full inline-block flex-shrink-0" style="background-color: ${color.ring}"></span>
                        <span class="truncate">${s.instructor.split(',')[0]}</span>
                      </span>
                    </div>
                  </div>
                `;
              }).join('')}
            </div>
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
  }

  // Render Instructor Color Legend
  renderInstructorLegend();
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
      <div class="bg-white p-5 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-4" style="border-left: 6px solid ${instColor.ring}">
        <div>
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-xl font-bold flex items-center justify-center text-lg shadow-sm text-white" style="background-color: ${instColor.ring}">
              ${faculty.name.split(',')[0].charAt(0)}
            </div>
            <div>
              <div class="text-lg font-bold text-slate-900">${faculty.name}</div>
              <div class="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                <span class="px-2 py-0.5 rounded-full text-xs font-semibold ${
                  faculty.status.includes('FT') ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }">
                  ${faculty.status}
                </span>
                <span>•</span>
                <span>${faculty.qualification || 'Faculty Member'}</span>
                <span>•</span>
                <span class="px-2 py-0.5 rounded text-xs font-semibold" style="background-color: ${instColor.badgeBg}; color: ${instColor.badgeText}">Signature Color</span>
              </div>
            </div>
          </div>
        </div>

        <div class="flex items-center gap-6">
          <div class="text-right">
            <div class="text-xs text-slate-400">Total Teaching Sessions</div>
            <div class="text-xl font-bold text-slate-800">${faculty.sessions.filter(s => !s.isDuty).length} classes / week</div>
          </div>
          <button type="button" onclick="window.print()" class="px-3.5 py-2 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center gap-1.5 transition-colors">
            <i data-lucide="printer" class="w-4 h-4"></i>
            Print Schedule
          </button>
        </div>
      </div>
    `;
  }

  // Individual Weekly Timetable Grid
  const timeSlots = window.TIME_SLOTS_STANDARDIZED;
  const days = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];

  let html = `
    <div class="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <table class="w-full border-collapse text-left min-w-[850px]">
        <thead>
          <tr class="bg-slate-50 border-b border-slate-200 text-xs font-semibold uppercase text-slate-500 tracking-wider">
            <th class="py-3 px-3 w-32 border-r border-slate-200 sticky left-0 bg-slate-50 z-10">Time Slot</th>
            ${days.map(d => `<th class="py-3 px-3 text-center border-r border-slate-200 last:border-r-0">${d}</th>`).join('')}
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100 text-sm">
  `;

  timeSlots.forEach(slot => {
    html += `
      <tr class="hover:bg-slate-50/40 transition-colors">
        <td class="py-3 px-3 font-medium text-slate-600 text-xs border-r border-slate-200 sticky left-0 bg-white whitespace-nowrap">
          ${slot}
        </td>
    `;

    days.forEach(day => {
      const matched = faculty.sessions.filter(s => s.day === day && s.timeSlot === slot);
      if (matched.length === 0) {
        html += `
          <td class="p-2 border-r border-slate-200 last:border-r-0 align-top">
            <div class="h-16 rounded-lg bg-slate-50/50 flex items-center justify-center text-xs text-slate-300">
              -
            </div>
          </td>
        `;
      } else {
        const s = matched[0];
        html += `
          <td class="p-2 border-r border-slate-200 last:border-r-0 align-top">
            <div class="h-16 p-2 rounded-lg flex flex-col justify-between shadow-xs transition-all border"
                 style="background-color: ${s.isDuty ? '#faf5ff' : instColor.bg}; border-color: ${s.isDuty ? '#d8b4fe' : instColor.border}; color: ${s.isDuty ? '#6b21a8' : instColor.text}; border-left-width: 4px; border-left-color: ${s.isDuty ? '#9333ea' : instColor.ring}">
              <div class="font-bold text-xs truncate" title="${s.subject}">
                ${s.subject}
              </div>
              <div class="text-[11px] flex justify-between items-center opacity-90 font-medium">
                <span>Sec: ${s.section}</span>
                <span class="px-1.5 py-0.2 rounded font-mono text-[10px] bg-white/80 border" style="border-color: ${instColor.border}; color: ${instColor.text}">${s.room}</span>
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
    <div class="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <table class="w-full text-left text-sm divide-y divide-slate-200">
        <thead class="bg-slate-50 text-xs uppercase font-semibold text-slate-500 tracking-wider">
          <tr>
            <th class="py-3 px-4">#</th>
            <th class="py-3 px-4">Faculty Member Name</th>
            <th class="py-3 px-4">Status</th>
            <th class="py-3 px-4">Educational Qualification</th>
            <th class="py-3 px-4 text-center">Weekly Sessions</th>
            <th class="py-3 px-4 text-center">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-slate-100">
          ${instructors.map((inst, idx) => {
            const color = getInstructorColor(inst.name);
            return `
              <tr class="hover:bg-slate-50 transition-colors">
                <td class="py-3 px-4 text-slate-400 font-mono text-xs">${idx + 1}</td>
                <td class="py-3 px-4 font-bold text-slate-900">
                  <div class="flex items-center gap-2.5">
                    <span class="w-3.5 h-3.5 rounded-full flex-shrink-0 border" style="background-color: ${color.ring}; border-color: ${color.border}"></span>
                    <span>${inst.name}</span>
                  </div>
                </td>
                <td class="py-3 px-4">
                  <span class="px-2.5 py-1 rounded-full text-xs font-semibold ${
                    inst.status.includes('FT') ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }">
                    ${inst.status}
                  </span>
                </td>
                <td class="py-3 px-4 text-slate-600 text-xs">${inst.qualification || '-'}</td>
                <td class="py-3 px-4 text-center font-bold text-blue-900">${inst.sessions.filter(s => !s.isDuty).length}</td>
                <td class="py-3 px-4 text-center">
                  <button type="button" class="px-3 py-1 text-xs font-semibold rounded-lg transition-all" 
                          style="background-color: ${color.badgeBg}; color: ${color.badgeText}; border: 1px solid ${color.border}"
                          onclick="viewInstructor('${inst.name}')">
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

// Instructor Color Legend Bar in Master Timetable
function renderInstructorLegend() {
  const legendContainer = document.getElementById('instructor-legend-bar');
  if (!legendContainer || !state.data || !state.data.instructors) return;

  const instructors = state.data.instructors;
  legendContainer.innerHTML = `
    <div class="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs space-y-2">
      <div class="flex items-center justify-between text-xs text-slate-500 font-semibold">
        <span class="uppercase tracking-wider">Instructor Color Guide (Click to filter):</span>
        <button type="button" class="text-blue-600 hover:underline" onclick="filterByInstructor('ALL')">Show All</button>
      </div>
      <div class="flex items-center gap-1.5 flex-wrap max-h-24 overflow-y-auto pr-1">
        ${instructors.map(i => {
          const color = getInstructorColor(i.name);
          const isSelected = state.masterFilter.instructor === i.name;
          return `
            <button type="button" class="px-2.5 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 border ${
              isSelected ? 'ring-2 ring-blue-500 shadow-xs font-bold' : 'hover:opacity-80'
            }" style="background-color: ${color.badgeBg}; color: ${color.badgeText}; border-color: ${color.border}" onclick="filterByInstructor('${i.name}')">
              <span class="w-2 h-2 rounded-full" style="background-color: ${color.ring}"></span>
              <span>${i.name.split(',')[0]}</span>
            </button>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

window.filterByInstructor = function(name) {
  state.masterFilter.instructor = name;
  const masterInst = document.getElementById('filter-master-instructor');
  if (masterInst) masterInst.value = name;
  renderMasterSchedule();
};

window.viewInstructor = function(name) {
  state.selectedInstructor = name;
  const searchInput = document.getElementById('instructor-search-input');
  if (searchInput) searchInput.value = name;
  updateInstructorQuickBadge();
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
