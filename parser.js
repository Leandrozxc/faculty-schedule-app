/**
 * Faculty Timetable & Room Occupancy Parser
 * Reads Excel workbook (.xlsx/.xls/.csv) via SheetJS and normalizes schedule data
 * Supports:
 *  1. Multi-sheet workbooks (FLR-001 summary + individual FLR-002 faculty sheets)
 *  2. Stacked single-sheet workbooks/CSVs (multiple FLR-002 blocks in one sheet, e.g. sample_input.csv)
 *  3. Tabular CSV schedule exports (re-importing exported CEA_Schedule_Export_*.csv files)
 */

const KNOWN_ROOMS_REGEX = /\b(BGANNEX\s*\d+[A-Z]?|BGANNE\s*\d+[A-Z]?|ALLIED\s*\d+[A-Z]?|SAL\s*\d+[A-Z]?|GLEC\s*\d+[A-Z]?|GLE\s*\d+[A-Z]?|GLAB\s*\d+[A-Z]?|PHYSLAB\s*\d+[A-Z]?|ACAD\s*\d+[A-Z]?|LINK\s*\d+[A-Z]?|RTL\s*\d+[A-Z]?|ENGG\s*\d+[A-Z]?|AVR\s*\d+|GYM\s*\d+|TBA)\b/i;

const TIME_SLOTS_STANDARDIZED = [
  "07:30 - 09:00",
  "09:00 - 10:30",
  "10:30 - 12:00",
  "12:00 - 01:30",
  "01:30 - 03:00",
  "03:00 - 04:30",
  "04:30 - 06:00",
  "06:00 - 07:30",
  "07:30 - 09:00"
];

const PERIOD_META = [
  { index: 0, code: "P1", rawSlot: "07:30 - 09:00", shortLabel: "07:30–09:00 AM", label: "07:30 – 09:00 AM" },
  { index: 1, code: "P2", rawSlot: "09:00 - 10:30", shortLabel: "09:00–10:30 AM", label: "09:00 – 10:30 AM" },
  { index: 2, code: "P3", rawSlot: "10:30 - 12:00", shortLabel: "10:30–12:00 PM", label: "10:30 AM – 12:00 PM" },
  { index: 3, code: "P4", rawSlot: "12:00 - 01:30", shortLabel: "12:00–01:30 PM", label: "12:00 – 01:30 PM" },
  { index: 4, code: "P5", rawSlot: "01:30 - 03:00", shortLabel: "01:30–03:00 PM", label: "01:30 – 03:00 PM" },
  { index: 5, code: "P6", rawSlot: "03:00 - 04:30", shortLabel: "03:00–04:30 PM", label: "03:00 – 04:30 PM" },
  { index: 6, code: "P7", rawSlot: "04:30 - 06:00", shortLabel: "04:30–06:00 PM", label: "04:30 – 06:00 PM" },
  { index: 7, code: "P8", rawSlot: "06:00 - 07:30", shortLabel: "06:00–07:30 PM", label: "06:00 – 07:30 PM" },
  { index: 8, code: "P9", rawSlot: "07:30 - 09:00", shortLabel: "07:30–09:00 PM", label: "07:30 – 09:00 PM" }
];

const DAYS_STANDARDIZED = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];

const DUTY_KEYWORDS = ["DEMPC", "KTTO", "ITSO", "CONSULTATION", "ADMIN DUTY", "OFFICE DUTY", "RESEARCH DUTY"];

function normalizeRoomName(roomStr) {
  if (!roomStr) return "TBA";
  let r = String(roomStr).trim().toUpperCase();
  if (!r || r === "-" || r === "NONE" || r === "N/A") return "TBA";
  if (r === "OFFICE / DEPT" || r === "OFFICE" || r === "DEPT") return "OFFICE / DEPT";
  r = r.replace(/\bBGANNE\s*(\d+[A-Z]?)/g, "BGANNEX $1");
  r = r.replace(/\bBGANNEX\s*(\d+[A-Z]?)/g, "BGANNEX $1");
  r = r.replace(/\bALLIED\s*(\d+[A-Z]?)/g, "ALLIED $1");
  r = r.replace(/\bSAL\s*(\d+[A-Z]?)/g, "SAL $1");
  r = r.replace(/\bGLEC\s*(\d+[A-Z]?)/g, "GLEC $1");
  r = r.replace(/\bGLE\s*(\d+[A-Z]?)/g, "GLE $1");
  r = r.replace(/\bGLAB\s*(\d+[A-Z]?)/g, "GLAB $1");
  r = r.replace(/\bPHYSLAB\s*(\d+[A-Z]?)/g, "PHYSLAB $1");
  r = r.replace(/\bACAD\s*(\d+[A-Z]?)/g, "ACAD $1");
  r = r.replace(/\bLINK\s*(\d+[A-Z]?)/g, "LINK $1");
  r = r.replace(/\bRTL\s*(\d+[A-Z]?)/g, "RTL $1");
  r = r.replace(/\bENGG\s*(\d+[A-Z]?)/g, "ENGG $1");
  r = r.replace(/\bCEA\s*(\d+[A-Z]?)/g, "CEA $1");
  r = r.replace(/\s+/g, " ").trim();
  return r;
}

function normalizeInstructorName(nameStr) {
  if (!nameStr) return "";
  return String(nameStr)
    .replace(/["\r\n]/g, "")
    .replace(/\s*,\s*/g, ", ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeEmploymentStatus(statusStr) {
  if (!statusStr) return "Faculty";
  return String(statusStr)
    .replace(/--+/g, "-")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeTimeSlot(timeStr) {
  if (!timeStr) return "";
  let s = String(timeStr)
    .replace(/[–—]/g, "-")
    .replace(/\s*-\s*/g, " - ")
    .replace(/\s+/g, " ")
    .trim();

  // Normalize single-digit hours like "7:30 - 9:00" -> "07:30 - 09:00"
  s = s.replace(/\b(\d):(\d{2})\b/g, "0$1:$2");
  return s;
}

/**
 * Determine canonical period index (0..8) from a time slot string or period code
 * taking into account whether morning/afternoon slots have already been traversed.
 */
function resolvePeriodIndex(rawTimeStr, seenAfterMorning = false, explicitPeriodCode = "") {
  const code = String(explicitPeriodCode || "").trim().toUpperCase();
  if (/^P[1-9]$/.test(code)) {
    return parseInt(code.substring(1), 10) - 1;
  }

  const rawUpper = String(rawTimeStr || "").toUpperCase();
  const norm = normalizeTimeSlot(rawTimeStr).replace(/\s*(AM|PM)\b/gi, "").trim();

  if (norm === "07:30 - 09:00") {
    if (rawUpper.includes("PM")) return 8;
    if (rawUpper.includes("AM")) return 0;
    return seenAfterMorning ? 8 : 0;
  }

  const slotMap = {
    "09:00 - 10:30": 1,
    "10:30 - 12:00": 2,
    "12:00 - 01:30": 3,
    "01:30 - 03:00": 4,
    "13:30 - 15:00": 4,
    "03:00 - 04:30": 5,
    "15:00 - 16:30": 5,
    "04:30 - 06:00": 6,
    "16:30 - 18:00": 6,
    "06:00 - 07:30": 7,
    "18:00 - 19:30": 7,
    "19:30 - 21:00": 8
  };

  if (slotMap[norm] !== undefined) {
    return slotMap[norm];
  }

  // Fallback partial match
  for (let i = 0; i < TIME_SLOTS_STANDARDIZED.length; i++) {
    if (norm.startsWith(TIME_SLOTS_STANDARDIZED[i].split(" - ")[0])) {
      if (i === 0 && (seenAfterMorning || rawUpper.includes("PM"))) return 8;
      return i;
    }
  }
  return -1;
}

function parseScheduleCell(cellText) {
  if (cellText === null || cellText === undefined) return null;
  const val = String(cellText).replace(/[\r\n]+/g, " ").replace(/\s+/g, " ").trim();
  if (!val || val.toLowerCase() === "nan" || val.toLowerCase() === "null" || val === "-") return null;

  const upperVal = val.toUpperCase();
  // Administrative / Office duty blocks
  if (DUTY_KEYWORDS.includes(upperVal) || /\(OFFICE DUTY\)$/i.test(upperVal)) {
    const cleanDuty = upperVal.replace(/\s*\(OFFICE DUTY\)$/i, "").trim();
    return {
      isDuty: true,
      dutyName: cleanDuty,
      subject: `${cleanDuty} (Office Duty)`,
      section: "-",
      room: "OFFICE / DEPT",
      raw: val
    };
  }

  let room = "TBA";
  let remainder = val;

  const roomMatch = val.match(KNOWN_ROOMS_REGEX);
  if (roomMatch) {
    room = normalizeRoomName(roomMatch[0]);
    remainder = (val.substring(0, roomMatch.index) + " " + val.substring(roomMatch.index + roomMatch[0].length)).trim();
  } else {
    // Check if last token(s) resemble a room (e.g., "R204", "LAB 1", "AUDITORIUM")
    const tokens = val.split(/\s+/);
    if (tokens.length >= 2) {
      const lastToken = tokens[tokens.length - 1];
      if (/^[A-Za-z]{1,6}\d+[A-Za-z]?$/i.test(lastToken) || /^(TBA|OFFICE|AVR|GYM)$/i.test(lastToken)) {
        room = normalizeRoomName(lastToken);
        remainder = tokens.slice(0, -1).join(" ");
      }
    }
  }

  // Clean leading/trailing separators
  remainder = remainder.replace(/^[-/,\s]+|[-/,\s]+$/g, "").trim();

  // Extract Course code and Section
  // Handles:
  //  - "MATH 138 PO1" -> subject: "MATH 138", section: "PO1"
  //  - "CHEM 203 N5" -> subject: "CHEM 203", section: "N5"
  //  - "MATH1BR-BR1" -> subject: "MATH 1BR", section: "BR1"
  //  - "CHEM 131M3" -> subject: "CHEM 131", section: "M3"
  //  - "CHEM 181M Z2" -> subject: "CHEM 181M", section: "Z2"
  //  - "CHEM 321 C X1" -> subject: "CHEM 321 C", section: "X1"
  //  - "CE 361 M" -> subject: "CE 361", section: "M"
  //  - "MATH 237 M10/V2" -> subject: "MATH 237", section: "M10/V2"

  // Case 1: Explicit hyphen between course and section (e.g. "MATH1BR-BR1", "CHEM 11BR-BR1")
  const hyphenMatch = remainder.match(/^([A-Za-z]{2,6}\s*\d+[A-Za-z]*)\s*-\s*([A-Za-z0-9/]+)$/);
  if (hyphenMatch) {
    let subject = hyphenMatch[1].trim().replace(/^([A-Za-z]+)\s*(\d+.*)$/, "$1 $2");
    const section = hyphenMatch[2].trim();
    return {
      isDuty: false,
      subject: subject.toUpperCase(),
      section: section ? section.toUpperCase() : "-",
      room,
      raw: val
    };
  }

  // Case 2: Course with single letter suffix and section (e.g. "CHEM 321 C X1")
  const spacedSuffixMatch = remainder.match(/^([A-Za-z]{2,6}\s*\d+\s+[A-Za-z])\s+([A-Za-z0-9/]+)$/);
  if (spacedSuffixMatch) {
    let subject = spacedSuffixMatch[1].replace(/\s+/g, " ").trim();
    const section = spacedSuffixMatch[2].trim();
    return {
      isDuty: false,
      subject: subject.toUpperCase(),
      section: section.toUpperCase(),
      room,
      raw: val
    };
  }

  // Case 3: Standard course + section with space (e.g. "MATH 138 PO1", "CHEM181M Z2", "MATH237 K3/V1")
  const standardMatch = remainder.match(/^([A-Za-z]{2,6}\s*\d{2,4}[A-Za-z]{0,2})\s+([A-Za-z0-9/-]+)$/);
  if (standardMatch) {
    let subject = standardMatch[1].trim().replace(/^([A-Za-z]+)\s*(\d+.*)$/, "$1 $2");
    const section = standardMatch[2].trim();
    return {
      isDuty: false,
      subject: subject.toUpperCase(),
      section: section ? section.toUpperCase() : "-",
      room,
      raw: val
    };
  }

  // Case 4: Attached section without space (e.g. "CHEM 131M3", "CHEM 131M14")
  const attachedSectionMatch = remainder.match(/^([A-Za-z]{2,6}\s*\d{3})([A-Za-z]\d{1,2})$/);
  if (attachedSectionMatch) {
    let subject = attachedSectionMatch[1].trim().replace(/^([A-Za-z]+)\s*(\d+)$/, "$1 $2");
    const section = attachedSectionMatch[2].trim();
    return {
      isDuty: false,
      subject: subject.toUpperCase(),
      section: section.toUpperCase(),
      room,
      raw: val
    };
  }

  // Case 5: Course code only (no section token)
  const courseOnlyMatch = remainder.match(/^([A-Za-z]{2,6})\s*(\d+[A-Za-z\d]*)$/);
  if (courseOnlyMatch) {
    return {
      isDuty: false,
      subject: `${courseOnlyMatch[1].toUpperCase()} ${courseOnlyMatch[2].toUpperCase()}`,
      section: "-",
      room,
      raw: val
    };
  }

  return {
    isDuty: false,
    subject: remainder ? remainder.toUpperCase() : val.toUpperCase(),
    section: "-",
    room,
    raw: val
  };
}

/**
 * Compute comprehensive conflicts and data quality / incomplete schedule diagnostics
 */
function analyzeScheduleConflictsAndHealth(data) {
  if (!data) return;

  const sessions = Array.isArray(data.sessions) ? data.sessions : [];
  const instructors = Array.isArray(data.instructors) ? data.instructors : [];
  const roomSet = new Set(Array.isArray(data.rooms) ? data.rooms : []);

  // Remove any single-letter section artifacts (e.g. "M") that were previously misclassified as rooms
  Array.from(roomSet).forEach(r => {
    if (/^[A-Z]$/i.test(String(r).trim())) {
      roomSet.delete(r);
    }
  });

  const roomSlotMap = new Map();
  const instructorSlotMap = new Map();
  const sectionSlotMap = new Map();

  const unassignedRoomSessions = [];
  const missingSectionSessions = [];
  const duplicateSessions = [];
  const seenSessionSignatures = new Set();

  // Normalize sessions inside instructor objects as well if they are separate instances
  const normalizeSinglePlaceholders = (s) => {
    if (!s || s.isDuty) return;
    if ((!s.section || s.section === "-") && s.room && /^[A-Z]\d?$/i.test(String(s.room).trim())) {
      s.section = String(s.room).trim().toUpperCase();
      s.room = "TBA";
    }
  };
  instructors.forEach(inst => (inst.sessions || []).forEach(normalizeSinglePlaceholders));

  sessions.forEach(s => {
    if (!s) return;
    normalizeSinglePlaceholders(s);
    const pIdx = typeof s._periodIdx === "number" ? s._periodIdx : resolvePeriodIndex(s.timeSlot, false, s._periodCode);
    const safePIdx = pIdx >= 0 && pIdx < 9 ? pIdx : 0;
    const pMeta = PERIOD_META[safePIdx];
    s._periodIdx = safePIdx;
    s._periodCode = pMeta.code;
    s._periodLabel = pMeta.shortLabel;
    s.timeSlot = pMeta.rawSlot;

    const r = normalizeRoomName(s.room);
    s.room = s.isDuty && r === "TBA" ? "OFFICE / DEPT" : r;

    if (s.room && s.room !== "OFFICE / DEPT" && s.room !== "TBA" && !s.isDuty) {
      roomSet.add(s.room);
      const roomKey = `${s.room}|${s.day}|${safePIdx}`;
      if (!roomSlotMap.has(roomKey)) roomSlotMap.set(roomKey, []);
      roomSlotMap.get(roomKey).push(s);
    }

    if (!s.isDuty) {
      if (!s.room || s.room === "TBA") {
        unassignedRoomSessions.push(s);
      }
      if (!s.section || s.section === "-" || s.section === "TBA") {
        missingSectionSessions.push(s);
      }
    }

    // Instructor overlap check (same instructor, same day, same period)
    if (s.instructor) {
      const instKey = `${s.instructor}|${s.day}|${safePIdx}`;
      if (!instructorSlotMap.has(instKey)) instructorSlotMap.set(instKey, []);
      instructorSlotMap.get(instKey).push(s);
    }

    // Section overlap check (same student section, same day, same period, different courses/instructors)
    if (!s.isDuty && s.section && s.section !== "-" && s.section !== "TBA") {
      // Split composite sections like "J1/E2" or "K3/V1" only if needed, or track exact section
      const secKey = `${s.section}|${s.day}|${safePIdx}`;
      if (!sectionSlotMap.has(secKey)) sectionSlotMap.set(secKey, []);
      sectionSlotMap.get(secKey).push(s);
    }

    // Duplicate check
    const exactSig = `${s.instructor}|${s.day}|${safePIdx}|${s.subject}|${s.section}|${s.room}`;
    if (seenSessionSignatures.has(exactSig)) {
      duplicateSessions.push(s);
    } else {
      seenSessionSignatures.add(exactSig);
    }
  });

  data.rooms = Array.from(roomSet).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

  // 1. Room Double-Booking Conflicts
  const roomConflicts = [];
  roomSlotMap.forEach((slotSessions, key) => {
    if (slotSessions.length > 1) {
      const [room, day, pIdxStr] = key.split("|");
      const pIdx = parseInt(pIdxStr, 10);
      const pMeta = PERIOD_META[pIdx] || PERIOD_META[0];
      const uniqueInstructors = [...new Set(slotSessions.map(s => s.instructor))];
      const uniqueSections = [...new Set(slotSessions.map(s => s.section).filter(sec => sec && sec !== "-"))];
      roomConflicts.push({
        type: "ROOM_DOUBLE_BOOKING",
        severity: "critical",
        room,
        day,
        periodIndex: pIdx,
        periodCode: pMeta.code,
        timeSlot: pMeta.shortLabel,
        sessions: slotSessions,
        affectedInstructors: uniqueInstructors,
        affectedSections: uniqueSections,
        explanation: `${slotSessions.length} classes (${slotSessions.map(s => `${s.subject} Sec ${s.section}`).join(" & ")}) are assigned to room ${room} at the same time on ${day} (${pMeta.code}: ${pMeta.shortLabel}).`,
        resolutionHint: `Reassign one of the conflicting classes to a vacant room during ${day} ${pMeta.code}.`
      });
    }
  });

  // 2. Faculty Time-Slot Overlaps
  const instructorConflicts = [];
  instructorSlotMap.forEach((slotSessions, key) => {
    if (slotSessions.length > 1) {
      const [instructor, day, pIdxStr] = key.split("|");
      const pIdx = parseInt(pIdxStr, 10);
      const pMeta = PERIOD_META[pIdx] || PERIOD_META[0];
      const hasAcademic = slotSessions.some(s => !s.isDuty);
      const allDuty = slotSessions.every(s => s.isDuty);
      instructorConflicts.push({
        type: allDuty ? "FACULTY_DUTY_OVERLAP" : "FACULTY_SCHEDULE_OVERLAP",
        severity: hasAcademic && slotSessions.filter(s => !s.isDuty).length > 1 ? "critical" : "warning",
        instructor,
        day,
        periodIndex: pIdx,
        periodCode: pMeta.code,
        timeSlot: pMeta.shortLabel,
        sessions: slotSessions,
        affectedRooms: [...new Set(slotSessions.map(s => s.room))],
        explanation: `${instructor} has ${slotSessions.length} overlapping entries (${slotSessions.map(s => s.isDuty ? (s.dutyName || s.subject) : `${s.subject} Sec ${s.section} in ${s.room}`).join(" vs. ")}) on ${day} during ${pMeta.code} (${pMeta.shortLabel}).`,
        resolutionHint: hasAcademic
          ? "Verify whether one entry is an alternate week/cluster or move the office duty / class to an open period."
          : "Consolidate duplicate office duty assignments for this time slot."
      });
    }
  });

  // 3. Student Section Time-Slot Overlaps
  const sectionConflicts = [];
  sectionSlotMap.forEach((slotSessions, key) => {
    if (slotSessions.length > 1) {
      const [section, day, pIdxStr] = key.split("|");
      const pIdx = parseInt(pIdxStr, 10);
      const pMeta = PERIOD_META[pIdx] || PERIOD_META[0];
      // Ignore if it's the exact same room conflict already flagged with identical course
      sectionConflicts.push({
        type: "SECTION_SCHEDULE_OVERLAP",
        severity: "warning",
        section,
        day,
        periodIndex: pIdx,
        periodCode: pMeta.code,
        timeSlot: pMeta.shortLabel,
        sessions: slotSessions,
        affectedInstructors: [...new Set(slotSessions.map(s => s.instructor))],
        affectedRooms: [...new Set(slotSessions.map(s => s.room))],
        explanation: `Student section ${section} has ${slotSessions.length} simultaneous classes (${slotSessions.map(s => `${s.subject} with ${s.instructor.split(",")[0]} in ${s.room}`).join(" & ")}) on ${day} during ${pMeta.code}.`,
        resolutionHint: "Check if the section code is shared across different year levels/programs or reschedule one course."
      });
    }
  });

  // 4. Faculty without any assigned academic classes
  const zeroLoadInstructors = instructors.filter(inst => {
    const academicCount = (inst.sessions || []).filter(s => !s.isDuty).length;
    return academicCount === 0;
  });

  // 5. Roster vs Individual Sheet mismatch check
  const rosterNames = new Set((data.rosterSummary || []).map(r => normalizeInstructorName(r.name).split(",")[0].toUpperCase()));
  const sheetSurnames = new Set(instructors.map(i => normalizeInstructorName(i.name).split(",")[0].toUpperCase()));
  const missingIndividualSheets = (data.rosterSummary || []).filter(r => {
    const surname = normalizeInstructorName(r.name).split(",")[0].toUpperCase();
    return surname && !sheetSurnames.has(surname);
  });

  data.conflicts = roomConflicts;
  data.diagnostics = {
    roomConflicts,
    instructorConflicts,
    sectionConflicts,
    unassignedRoomSessions,
    missingSectionSessions,
    zeroLoadInstructors,
    duplicateSessions,
    missingIndividualSheets,
    totalIssuesCount:
      roomConflicts.length +
      instructorConflicts.length +
      unassignedRoomSessions.length +
      missingSectionSessions.length +
      zeroLoadInstructors.length +
      duplicateSessions.length
  };

  return data;
}

/**
 * Helper to extract one faculty timetable block starting from a block header row
 * until the end of its 9-period schedule grid.
 */
function parseFacultyBlockFromRows(rows, startRowIdx, endRowIdx, fallbackSheetName = "") {
  let facultyName = "";
  let employmentStatus = "";
  let qualification = "";
  let scheduleHeaderRowIdx = -1;
  let daysColMap = {};

  for (let r = startRowIdx; r <= endRowIdx; r++) {
    const row = rows[r] || [];
    for (let c = 0; c < row.length; c++) {
      const val = String(row[c] || "").trim();
      const valUpper = val.toUpperCase();

      if (valUpper.includes("FULL NAME") && !valUpper.includes("LIST DOWN")) {
        for (let k = c + 1; k < row.length; k++) {
          const cellStr = String(row[k] || "").trim();
          if (cellStr && !cellStr.toUpperCase().includes("FULL NAME")) {
            facultyName = normalizeInstructorName(cellStr);
            break;
          }
        }
      }
      if (valUpper.includes("EMPLOYMENT STATUS")) {
        for (let k = c + 1; k < row.length; k++) {
          const cellStr = String(row[k] || "").trim();
          if (cellStr && !cellStr.toUpperCase().includes("EMPLOYMENT STATUS")) {
            employmentStatus = normalizeEmploymentStatus(cellStr);
            break;
          }
        }
      }
      if (valUpper.includes("HIGHEST EDUCATIONAL QUALIFICATION")) {
        for (let k = c + 1; k < row.length; k++) {
          const cellStr = String(row[k] || "").trim();
          if (cellStr && !cellStr.toUpperCase().includes("HIGHEST EDUCATIONAL QUALIFICATION")) {
            qualification = cellStr.replace(/["\r\n]/g, "").replace(/\s+/g, " ").trim();
            break;
          }
        }
      }
      if (valUpper === "TIME" && scheduleHeaderRowIdx === -1) {
        let hasMonday = false;
        const tempMap = {};
        row.forEach((col, idx) => {
          const dayUpper = String(col || "").trim().toUpperCase();
          if (DAYS_STANDARDIZED.includes(dayUpper)) {
            hasMonday = true;
            tempMap[idx] = dayUpper;
          }
        });
        if (hasMonday) {
          scheduleHeaderRowIdx = r;
          daysColMap = tempMap;
        }
      }
    }
  }

  if (!facultyName && fallbackSheetName && scheduleHeaderRowIdx !== -1) {
    facultyName = normalizeInstructorName(fallbackSheetName);
  }

  if (!facultyName || scheduleHeaderRowIdx === -1) {
    return null;
  }

  const facultyObj = {
    name: facultyName,
    status: employmentStatus || "Faculty",
    qualification: qualification || "",
    sheetName: fallbackSheetName || facultyName,
    courses: [],
    totalUnits: 0,
    totalPhrs: 0,
    sessions: []
  };

  // Parse Zone 2 (Teaching Load Summary) if present between startRowIdx and scheduleHeaderRowIdx
  let loadStart = false;
  for (let r = startRowIdx; r < scheduleHeaderRowIdx; r++) {
    const row = rows[r] || [];
    const col0 = String(row[1] || row[0] || "").trim();
    const col0Upper = col0.toUpperCase();
    if (col0Upper.includes("COURSE CODE")) {
      loadStart = true;
      continue;
    }
    if (loadStart && (col0Upper.includes("TOTAL") || col0Upper.includes("CLASS SCHEDULE"))) {
      loadStart = false;
      const unitsCol = row[5] || row[4];
      const phrsCol = row[6] || row[5];
      if (unitsCol) facultyObj.totalUnits = parseFloat(unitsCol) || facultyObj.totalUnits;
      if (phrsCol) facultyObj.totalPhrs = parseFloat(phrsCol) || facultyObj.totalPhrs;
    }
    if (loadStart && col0 && !col0Upper.includes("UNITS") && !col0Upper.includes("TO ADD ROWS")) {
      facultyObj.courses.push({
        code: col0,
        title: String(row[2] || "").trim(),
        units: row[5] || "",
        phrs: row[6] || "",
        section: String(row[7] || "").trim(),
        students: row[8] || ""
      });
    }
  }

  // Parse Zone 3: Schedule Grid (from scheduleHeaderRowIdx + 1 to endRowIdx)
  let currentTimeSlot = "";
  let currentPeriodIdx = 0;
  let seenAfterMorning = false;

  for (let r = scheduleHeaderRowIdx + 1; r <= endRowIdx; r++) {
    const row = rows[r] || [];
    const rowJoined = row.map(c => String(c || "")).join(" ").toUpperCase();

    if (
      rowJoined.includes("IMPORTANT") ||
      rowJoined.includes("SUBMITTED BY") ||
      rowJoined.includes("CONFORME") ||
      rowJoined.includes("INDIVIDUAL FACULTY TEACHING LOAD") ||
      rowJoined.includes("DEPARTMENT") ||
      rowJoined.includes("COLLEGE")
    ) {
      break;
    }

    const timeCell = String(row[1] || row[0] || "").trim();
    if (timeCell && (timeCell.includes(":") || timeCell.includes("-") || timeCell.includes("–") || timeCell.includes("—"))) {
      const resolvedIdx = resolvePeriodIndex(timeCell, seenAfterMorning);
      if (resolvedIdx !== -1) {
        currentPeriodIdx = resolvedIdx;
        currentTimeSlot = PERIOD_META[currentPeriodIdx].rawSlot;
        if (currentPeriodIdx >= 1 && currentPeriodIdx <= 7) {
          seenAfterMorning = true;
        }
      } else {
        currentTimeSlot = normalizeTimeSlot(timeCell);
      }
    }

    if (!currentTimeSlot) continue;

    const pMeta = PERIOD_META[currentPeriodIdx] || PERIOD_META[0];

    Object.keys(daysColMap).forEach(colIdx => {
      const dayName = daysColMap[colIdx];
      const cellContent = row[colIdx];
      if (cellContent && String(cellContent).trim()) {
        const parsed = parseScheduleCell(cellContent);
        if (parsed) {
          const sessionRecord = {
            id: `${facultyName}_${dayName}_${pMeta.code}_${parsed.room}_${parsed.subject}`.replace(/\s+/g, "_"),
            instructor: facultyName,
            day: dayName,
            timeSlot: pMeta.rawSlot,
            _periodIdx: pMeta.index,
            _periodCode: pMeta.code,
            _periodLabel: pMeta.shortLabel,
            subject: parsed.subject,
            section: parsed.section,
            room: parsed.room,
            isDuty: parsed.isDuty,
            dutyName: parsed.dutyName || undefined,
            raw: parsed.raw
          };
          facultyObj.sessions.push(sessionRecord);
        }
      }
    });
  }

  facultyObj.totalSessions = facultyObj.sessions.length;
  return facultyObj;
}

/**
 * Fallback parser for flat tabular CSV/Excel exports
 * Columns: Day, Period, TimeSlot, Subject, Section, Room, Instructor, IsOfficeDuty
 */
function parseTabularExportRows(rows, result) {
  if (!Array.isArray(rows) || rows.length < 2) return false;
  const header = rows[0].map(c => String(c || "").trim().toUpperCase());
  const dayIdx = header.findIndex(h => h === "DAY" || h === "DAY OF WEEK");
  const subjIdx = header.findIndex(h => h === "SUBJECT" || h === "COURSE" || h === "COURSE CODE");
  const instIdx = header.findIndex(h => h === "INSTRUCTOR" || h === "FACULTY" || h === "FACULTY MEMBER");

  if (dayIdx === -1 || subjIdx === -1 || instIdx === -1) return false;

  const periodIdx = header.findIndex(h => h === "PERIOD" || h === "PERIOD CODE");
  const timeIdx = header.findIndex(h => h === "TIMESLOT" || h === "TIME SLOT" || h === "TIME");
  const secIdx = header.findIndex(h => h === "SECTION" || h === "BLOCK");
  const roomIdx = header.findIndex(h => h === "ROOM" || h === "CLASSROOM");
  const dutyIdx = header.findIndex(h => h === "ISOFFICEDUTY" || h === "IS DUTY" || h === "TYPE" || h === "SCHEDULE TYPE");

  const instructorMap = new Map();

  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    if (!row || row.length === 0) continue;
    const rawDay = String(row[dayIdx] || "").trim().toUpperCase();
    const rawInst = normalizeInstructorName(row[instIdx]);
    const rawSubj = String(row[subjIdx] || "").trim().toUpperCase();
    if (!rawDay || !rawInst || !rawSubj || !DAYS_STANDARDIZED.includes(rawDay)) continue;

    const rawPeriodCode = periodIdx !== -1 ? String(row[periodIdx] || "").trim() : "";
    const rawTimeSlot = timeIdx !== -1 ? String(row[timeIdx] || "").trim() : "07:30 - 09:00";
    const pIdx = Math.max(0, resolvePeriodIndex(rawTimeSlot, false, rawPeriodCode));
    const pMeta = PERIOD_META[pIdx] || PERIOD_META[0];

    const rawSec = secIdx !== -1 ? String(row[secIdx] || "-").trim().toUpperCase() : "-";
    const rawRoom = roomIdx !== -1 ? normalizeRoomName(row[roomIdx]) : "TBA";
    const rawDuty = dutyIdx !== -1 ? String(row[dutyIdx] || "").trim().toUpperCase() : "";
    const isDuty = rawDuty === "YES" || rawDuty === "TRUE" || rawDuty === "OFFICE DUTY" || DUTY_KEYWORDS.includes(rawSubj);

    const sessionRecord = {
      id: `${rawInst}_${rawDay}_${pMeta.code}_${rawRoom}_${rawSubj}`.replace(/\s+/g, "_"),
      instructor: rawInst,
      day: rawDay,
      timeSlot: pMeta.rawSlot,
      _periodIdx: pMeta.index,
      _periodCode: pMeta.code,
      _periodLabel: pMeta.shortLabel,
      subject: rawSubj,
      section: rawSec || "-",
      room: isDuty && rawRoom === "TBA" ? "OFFICE / DEPT" : rawRoom,
      isDuty,
      raw: `${rawSubj} ${rawSec} ${rawRoom}`.trim()
    };

    if (!instructorMap.has(rawInst)) {
      instructorMap.set(rawInst, {
        name: rawInst,
        status: "Faculty",
        qualification: "",
        sheetName: "Imported CSV",
        courses: [],
        totalUnits: 0,
        totalPhrs: 0,
        sessions: []
      });
    }
    instructorMap.get(rawInst).sessions.push(sessionRecord);
    result.sessions.push(sessionRecord);
  }

  instructorMap.forEach(inst => {
    inst.totalSessions = inst.sessions.length;
    result.instructors.push(inst);
  });

  return result.instructors.length > 0;
}

/**
 * Main parser that accepts a SheetJS workbook object
 */
function parseScheduleWorkbook(workbook) {
  if (!workbook || !Array.isArray(workbook.SheetNames)) {
    throw new Error("Invalid workbook structure.");
  }

  const result = {
    meta: {
      college: "",
      department: "",
      period: "",
      uploadedAt: new Date().toISOString()
    },
    instructors: [],
    sessions: [],
    rooms: new Set(),
    conflicts: [],
    rosterSummary: []
  };

  // 1. Scan all sheets for metadata, FLR-001 Roster Summary, and FLR-002 Individual Faculty blocks
  workbook.SheetNames.forEach(sheetName => {
    const ws = workbook.Sheets[sheetName];
    if (!ws) return;
    const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });
    if (!rows || rows.length === 0) return;

    // Extract Department / College / Period metadata from top 60 rows
    rows.slice(0, 60).forEach(row => {
      const line = row.map(c => String(c || "")).join(" ");
      if (line.toUpperCase().includes("DEPARTMENT OF") && !result.meta.department) {
        const match = line.match(/DEPARTMENT[:\s]+(?:DEPARTMENT OF\s+)?([^,\r\n]+(?:,\s*[^,\r\n]+)*)/i);
        if (match) {
          let dep = match[1].replace(/\s+REPORT TITLE.*$/i, "").replace(/\s+TERM.*$/i, "").trim();
          if (dep) result.meta.department = dep;
        }
      }
      if (line.toUpperCase().includes("COLLEGE OF") && !result.meta.college) {
        const match = line.match(/COLLEGE[:\s]+([^,\r\n]+)/i);
        if (match) {
          let col = match[1].replace(/\s+REPORT CODE.*$/i, "").replace(/\s+ACADEMIC YEAR.*$/i, "").trim();
          if (col) result.meta.college = col;
        }
      }
      if ((line.toUpperCase().includes("PERIOD COVERED") || line.toUpperCase().includes("ACADEMIC YEAR")) && !result.meta.period) {
        const match = line.match(/(FIRST|SECOND|MIDYEAR|SUMMER)\s+SEMESTER[\s\d-–]*/i);
        if (match) result.meta.period = match[0].trim();
      }
    });

    // Check if sheet contains FLR-001 Faculty Load Summary table
    const isRosterSheet = rows.some(r =>
      r.some(c => {
        const s = String(c || "").toUpperCase();
        return s.includes("FLR-001") || s.includes("FACULTY TEACHING LOAD ASSIGNMENT SUMMARY");
      })
    );

    if (isRosterSheet) {
      let readingRoster = false;
      rows.forEach(row => {
        const col0 = String(row[1] || row[0] || "").trim();
        const colName = String(row[2] || row[1] || "").trim();
        if (colName.toUpperCase().includes("FULL NAME OF THE FACULTY") || col0.toUpperCase() === "NO.") {
          readingRoster = true;
          return;
        }
        if (
          readingRoster &&
          (colName.toUpperCase().includes("NUMBER OF FACULTY") ||
            String(row[1] || "").toUpperCase().includes("SUBMITTED BY") ||
            row.some(c => String(c || "").toUpperCase().includes("INDIVIDUAL FACULTY TEACHING LOAD")))
        ) {
          readingRoster = false;
          return;
        }
        if (readingRoster && colName && !colName.includes("List down") && !colName.includes("Last Name")) {
          const num = parseInt(col0, 10);
          if (!isNaN(num) || colName.includes(",")) {
            result.rosterSummary.push({
              no: num || result.rosterSummary.length + 1,
              name: normalizeInstructorName(colName),
              status: row[4] ? "FT1" : row[5] ? "FT2" : row[6] ? "PT" : row[7] ? "GL" : "Other",
              regularUnits: row[10] || row[9] || "",
              regularPhrs: row[11] || row[10] || "",
              totalUnits: row[15] || row[14] || "",
              totalPhrs: row[16] || row[15] || "",
              remark: String(row[17] || "").trim()
            });
          }
        }
      });
    }

    // Find all FLR-002 Individual Faculty blocks within this sheet
    // A sheet can contain 1 block (standard multi-sheet Excel) OR 20+ stacked blocks (consolidated CSV/sheet)
    const blockStartIndices = [];
    for (let r = 0; r < rows.length; r++) {
      const row = rows[r] || [];
      const hasMarker = row.some(c => {
        const val = String(c || "").toUpperCase();
        return val.includes("INDIVIDUAL FACULTY TEACHING LOAD");
      });
      if (hasMarker) {
        blockStartIndices.push(r);
      }
    }

    if (blockStartIndices.length > 0) {
      for (let b = 0; b < blockStartIndices.length; b++) {
        const startRow = Math.max(0, blockStartIndices[b] - 2);
        const endRow = b + 1 < blockStartIndices.length ? blockStartIndices[b + 1] - 1 : rows.length - 1;
        const fallbackName = blockStartIndices.length === 1 ? sheetName : "";
        const facultyObj = parseFacultyBlockFromRows(rows, startRow, endRow, fallbackName);
        if (facultyObj) {
          result.instructors.push(facultyObj);
          facultyObj.sessions.forEach(s => {
            result.sessions.push(s);
            if (s.room && s.room !== "OFFICE / DEPT" && s.room !== "TBA") {
              result.rooms.add(s.room);
            }
          });
        }
      }
    } else {
      // Fallback: Check if sheet has a "CLASS SCHEDULE" or "TIME / MONDAY" grid without the top title banner
      const hasClassSchedule = rows.slice(0, 60).some(r =>
        r.some(c => {
          const val = String(c || "").trim().toUpperCase();
          return val === "CLASS SCHEDULE" || val.includes("FLR-002");
        })
      );
      if (hasClassSchedule) {
        const facultyObj = parseFacultyBlockFromRows(rows, 0, rows.length - 1, sheetName);
        if (facultyObj) {
          result.instructors.push(facultyObj);
          facultyObj.sessions.forEach(s => {
            result.sessions.push(s);
            if (s.room && s.room !== "OFFICE / DEPT" && s.room !== "TBA") {
              result.rooms.add(s.room);
            }
          });
        }
      } else if (workbook.SheetNames.length === 1) {
        // Check if this is a re-imported tabular CSV export
        parseTabularExportRows(rows, result);
      }
    }
  });

  result.rooms = Array.from(result.rooms).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));

  // Compute all conflicts and schedule diagnostics
  analyzeScheduleConflictsAndHealth(result);

  return result;
}

// Export for browser window and Node.js testing
if (typeof window !== "undefined") {
  window.parseScheduleWorkbook = parseScheduleWorkbook;
  window.parseScheduleCell = parseScheduleCell;
  window.normalizeRoomName = normalizeRoomName;
  window.normalizeTimeSlot = normalizeTimeSlot;
  window.resolvePeriodIndex = resolvePeriodIndex;
  window.analyzeScheduleConflictsAndHealth = analyzeScheduleConflictsAndHealth;
  window.TIME_SLOTS_STANDARDIZED = TIME_SLOTS_STANDARDIZED;
  window.DAYS_STANDARDIZED = DAYS_STANDARDIZED;
  window.PERIOD_META = PERIOD_META;
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    parseScheduleWorkbook,
    parseScheduleCell,
    normalizeRoomName,
    normalizeInstructorName,
    normalizeTimeSlot,
    resolvePeriodIndex,
    analyzeScheduleConflictsAndHealth,
    TIME_SLOTS_STANDARDIZED,
    DAYS_STANDARDIZED,
    PERIOD_META
  };
}
