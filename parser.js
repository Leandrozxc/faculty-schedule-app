/**
 * Faculty Timetable & Room Occupancy Parser
 * Reads Excel workbook (.xlsx/.xls/.csv) via SheetJS and normalizes schedule data
 */

const KNOWN_ROOMS_REGEX = /(BGANNEX\s*\d+|BGANNE\s*\d+|ALLIED\s*\d+|SAL\s*\d+|GLEC\s*\d+|GLE\s*\d+|GLAB\s*\d+|PHYSLAB\s*\d+|ACAD\s*\d+|LINK\s*\d+|RTL\s*\d+|TBA)/i;

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

const DAYS_STANDARDIZED = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];

function normalizeRoomName(roomStr) {
  if (!roomStr) return "TBA";
  let r = roomStr.trim().toUpperCase();
  r = r.replace(/BGANNE(\d+)/g, "BGANNEX $1");
  r = r.replace(/BGANNEX(\d+)/g, "BGANNEX $1");
  r = r.replace(/ALLIED(\d+)/g, "ALLIED $1");
  r = r.replace(/SAL(\d+)/g, "SAL $1");
  r = r.replace(/GLEC(\d+)/g, "GLEC $1");
  r = r.replace(/GLE(\d+)/g, "GLE $1");
  r = r.replace(/GLAB(\d+)/g, "GLAB $1");
  r = r.replace(/PHYSLAB(\d+)/g, "PHYSLAB $1");
  r = r.replace(/ACAD(\d+)/g, "ACAD $1");
  r = r.replace(/LINK(\d+)/g, "LINK $1");
  r = r.replace(/RTL(\d+)/g, "RTL $1");
  r = r.replace(/\s+/g, " ");
  return r;
}

function normalizeTimeSlot(timeStr) {
  if (!timeStr) return "";
  // normalize en-dash, em-dash, multiple spaces
  return timeStr.replace(/[–—]/g, "-").replace(/\s+/g, " ").trim();
}

function parseScheduleCell(cellText) {
  if (!cellText) return null;
  const val = String(cellText).trim();
  if (!val || val.toLowerCase() === 'nan' || val.toLowerCase() === 'null') return null;

  // Administrative / Office duty blocks
  if (["DEMPC", "KTTO", "ITSO"].includes(val.toUpperCase())) {
    return {
      isDuty: true,
      dutyName: val.toUpperCase(),
      subject: val.toUpperCase() + " (Office Duty)",
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
    remainder = val.substring(0, roomMatch.index) + val.substring(roomMatch.index + roomMatch[0].length);
    remainder = remainder.trim();
  } else {
    // If not matched by known list, check if last token resembles a room (e.g., "R204", "LAB1", "AUDITORIUM")
    const tokens = val.split(/\s+/);
    if (tokens.length >= 2) {
      const lastToken = tokens[tokens.length - 1];
      if (/^[A-Za-z]+\d+$/i.test(lastToken) || /^(TBA|OFFICE)$/i.test(lastToken)) {
        room = normalizeRoomName(lastToken);
        remainder = tokens.slice(0, -1).join(" ");
      }
    }
  }

  // Clean separators
  remainder = remainder.replace(/^[-/]+|[-/]+$/g, "").trim();

  // Extract Course code and Section
  // e.g. "MATH 138 PO1", "CHEM 203 N5", "MATH1BR-BR1", "CE 361 M"
  const courseMatch = remainder.match(/^([A-Za-z]{2,6}\s*\d+[A-Za-z\d]*)\s*[-/]?\s*(.*)$/);
  if (courseMatch) {
    let subject = courseMatch[1].trim();
    const section = courseMatch[2].trim();
    // Add space between letters and numbers if missing (e.g. MATH138 -> MATH 138)
    subject = subject.replace(/^([A-Za-z]+)(\d+.*)$/, "$1 $2");
    return {
      isDuty: false,
      subject: subject.toUpperCase(),
      section: section ? section.toUpperCase() : "-",
      room: room,
      raw: val
    };
  }

  return {
    isDuty: false,
    subject: remainder ? remainder.toUpperCase() : val.toUpperCase(),
    section: "-",
    room: room,
    raw: val
  };
}

/**
 * Main parser that accepts a SheetJS workbook object
 */
function parseScheduleWorkbook(workbook) {
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

  // 1. Check for FLR-001 (Faculty Load Summary) to get roster & meta
  workbook.SheetNames.forEach(sheetName => {
    const ws = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });

    // Look for Department / College headers
    rows.slice(0, 15).forEach(row => {
      const line = row.map(c => String(c)).join(" ");
      if (line.includes("DEPARTMENT OF") && !result.meta.department) {
        const match = line.match(/DEPARTMENT[:\s]+([^,\n]+)/i);
        if (match) result.meta.department = match[1].trim();
      }
      if (line.includes("COLLEGE OF") && !result.meta.college) {
        const match = line.match(/COLLEGE[:\s]+([^,\n]+)/i);
        if (match) result.meta.college = match[1].trim();
      }
      if (line.includes("PERIOD COVERED") || line.includes("ACADEMIC YEAR")) {
        const match = line.match(/(FIRST|SECOND|MIDYEAR|SUMMER)[^,\n]+/i);
        if (match) result.meta.period = match[0].trim();
      }
    });

    // Check if sheet has FLR-001 Summary table
    const isRosterSheet = rows.some(r => 
      r.some(c => String(c).includes("FLR-001") || String(c).includes("FACULTY TEACHING LOAD ASSIGNMENT SUMMARY"))
    );

    if (isRosterSheet) {
      let readingRoster = false;
      rows.forEach(row => {
        const col0 = String(row[1] || row[0] || "").trim();
        const colName = String(row[2] || row[1] || "").trim();
        if (colName.includes("FULL NAME OF THE FACULTY") || col0.includes("NO.")) {
          readingRoster = true;
          return;
        }
        if (readingRoster && colName && !colName.includes("List down") && !colName.includes("Number of Faculty")) {
          const num = parseInt(col0);
          if (!isNaN(num) || colName.includes(",")) {
            result.rosterSummary.push({
              no: num || result.rosterSummary.length + 1,
              name: colName.replace(/["\r\n]/g, "").trim(),
              status: row[4] ? "FT1" : row[5] ? "FT2" : row[6] ? "PT" : row[7] ? "GL" : "Other",
              regularUnits: row[10] || row[9] || "",
              regularPhrs: row[11] || row[10] || "",
              totalUnits: row[15] || row[14] || "",
              totalPhrs: row[16] || row[15] || "",
              remark: row[17] || ""
            });
          }
        }
        if (colName.includes("Number of Faculty") || String(row[1]).includes("Submitted by")) {
          readingRoster = false;
        }
      });
    }
  });

  // 2. Loop through sheets and find FLR-002 sheets (Individual Schedules)
  workbook.SheetNames.forEach(sheetName => {
    const ws = workbook.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });

    // Check if this sheet is an individual faculty teaching load assignment
    let isFacultySheet = false;
    let facultyName = "";
    let employmentStatus = "";
    let qualification = "";
    let scheduleHeaderRowIdx = -1;
    let daysColMap = {}; // colIdx -> DAY NAME

    // Check markers in rows
    for (let r = 0; r < Math.min(rows.length, 60); r++) {
      const row = rows[r];
      for (let c = 0; c < row.length; c++) {
        const val = String(row[c]).trim();
        if (val.includes("INDIVIDUAL FACULTY TEACHING LOAD") || val.includes("FLR-002")) {
          isFacultySheet = true;
        }
        if (val.includes("FULL NAME") && c + 1 < row.length) {
          // Find next non-empty cell in row
          for (let k = c + 1; k < row.length; k++) {
            if (row[k] && String(row[k]).trim() && !String(row[k]).includes("FULL NAME")) {
              facultyName = String(row[k]).replace(/["\r\n]/g, "").trim();
              break;
            }
          }
        }
        if (val.includes("EMPLOYMENT STATUS") && c + 1 < row.length) {
          for (let k = c + 1; k < row.length; k++) {
            if (row[k] && String(row[k]).trim()) {
              employmentStatus = String(row[k]).trim();
              break;
            }
          }
        }
        if (val.includes("HIGHEST EDUCATIONAL QUALIFICATION") && c + 1 < row.length) {
          for (let k = c + 1; k < row.length; k++) {
            if (row[k] && String(row[k]).trim()) {
              qualification = String(row[k]).trim();
              break;
            }
          }
        }
        if (val === "CLASS SCHEDULE") {
          isFacultySheet = true;
        }
        if (val === "TIME" && r + 1 < rows.length) {
          // Check if this row has days: MONDAY, TUESDAY...
          let hasMonday = false;
          row.forEach((col, idx) => {
            const dayUpper = String(col).trim().toUpperCase();
            if (DAYS_STANDARDIZED.includes(dayUpper)) {
              hasMonday = true;
              daysColMap[idx] = dayUpper;
            }
          });
          if (hasMonday) {
            scheduleHeaderRowIdx = r;
          }
        }
      }
    }

    // Fallback: If sheet name looks like teacher name and has a timetable
    if (!facultyName && isFacultySheet) {
      facultyName = sheetName;
    }

    if (isFacultySheet && scheduleHeaderRowIdx !== -1 && facultyName) {
      const facultyObj = {
        name: facultyName,
        status: employmentStatus || "Faculty",
        qualification: qualification || "",
        sheetName: sheetName,
        courses: [],
        totalUnits: 0,
        totalPhrs: 0,
        sessions: []
      };

      // Also parse Zone 2 (Teaching Load Summary) if present
      let loadStart = false;
      for (let r = 0; r < scheduleHeaderRowIdx; r++) {
        const row = rows[r];
        const col0 = String(row[1] || row[0] || "").trim();
        if (col0.includes("COURSE CODE")) {
          loadStart = true;
          continue;
        }
        if (loadStart && (col0.includes("TOTAL") || col0.includes("CLASS SCHEDULE"))) {
          loadStart = false;
          // Extract totals
          const unitsCol = row[5] || row[4];
          const phrsCol = row[6] || row[5];
          if (unitsCol) facultyObj.totalUnits = parseFloat(unitsCol) || facultyObj.totalUnits;
          if (phrsCol) facultyObj.totalPhrs = parseFloat(phrsCol) || facultyObj.totalPhrs;
        }
        if (loadStart && col0 && !col0.includes("UNITS") && !col0.includes("To add ROWS")) {
          facultyObj.courses.push({
            code: col0,
            title: row[2] || "",
            units: row[5] || "",
            phrs: row[6] || "",
            section: row[7] || "",
            students: row[8] || ""
          });
        }
      }

      // Now parse Zone 3: The Schedule Grid
      let currentTimeSlot = "";
      for (let r = scheduleHeaderRowIdx + 1; r < rows.length; r++) {
        const row = rows[r];
        const timeCell = String(row[1] || row[0] || "").trim();

        // Check if stopped at notes / signatures
        if (timeCell.includes("IMPORTANT") || timeCell.includes("Submitted by") || timeCell.includes("CONFORME")) {
          break;
        }

        // Does this row contain a time slot?
        if (timeCell.includes(":") || timeCell.includes("-") || timeCell.includes("–")) {
          currentTimeSlot = normalizeTimeSlot(timeCell);
        }

        if (!currentTimeSlot) continue;

        // Iterate over day columns
        Object.keys(daysColMap).forEach(colIdx => {
          const dayName = daysColMap[colIdx];
          const cellContent = row[colIdx];
          if (cellContent && String(cellContent).trim()) {
            const parsed = parseScheduleCell(cellContent);
            if (parsed) {
              const sessionRecord = {
                id: `${facultyName}-${dayName}-${currentTimeSlot}-${parsed.room}-${parsed.subject}`.replace(/\s+/g, "_"),
                instructor: facultyName,
                day: dayName,
                timeSlot: currentTimeSlot,
                subject: parsed.subject,
                section: parsed.section,
                room: parsed.room,
                isDuty: parsed.isDuty,
                raw: parsed.raw
              };

              facultyObj.sessions.push(sessionRecord);
              result.sessions.push(sessionRecord);
              if (parsed.room && parsed.room !== "OFFICE / DEPT" && parsed.room !== "TBA") {
                result.rooms.add(parsed.room);
              }
            }
          }
        });
      }

      result.instructors.push(facultyObj);
    }
  });

  // Convert rooms Set to sorted Array
  result.rooms = Array.from(result.rooms).sort();

  // 3. Detect Room Conflicts / Double Bookings
  // A clash occurs if 2 different classes share the same room at the same day & time slot
  const roomSlotMap = {};
  result.sessions.forEach(session => {
    if (session.room && session.room !== "TBA" && session.room !== "OFFICE / DEPT") {
      const key = `${session.room}|${session.day}|${session.timeSlot}`;
      if (!roomSlotMap[key]) {
        roomSlotMap[key] = [];
      }
      roomSlotMap[key].push(session);
    }
  });

  Object.keys(roomSlotMap).forEach(key => {
    const list = roomSlotMap[key];
    if (list.length > 1) {
      // Check if different instructors or different subjects
      const [room, day, timeSlot] = key.split("|");
      result.conflicts.push({
        room,
        day,
        timeSlot,
        sessions: list
      });
    }
  });

  return result;
}

// Export for browser window
if (typeof window !== "undefined") {
  window.parseScheduleWorkbook = parseScheduleWorkbook;
  window.parseScheduleCell = parseScheduleCell;
  window.normalizeRoomName = normalizeRoomName;
  window.TIME_SLOTS_STANDARDIZED = TIME_SLOTS_STANDARDIZED;
  window.DAYS_STANDARDIZED = DAYS_STANDARDIZED;
}
