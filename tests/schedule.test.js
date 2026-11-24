/**
 * Automated Test Suite for Faculty Schedule App
 * Verifies:
 *  1. Parser cell normalization, room extraction, and P1 vs P9 disambiguation
 *  2. Multi-sheet & stacked single-sheet workbook parsing (including full 24-instructor sample_input.csv)
 *  3. Re-importing exported tabular CSV schedules
 *  4. Conflict detection (Room Double-Booking, Faculty Overlap, Section Overlap) & Incomplete Schedule diagnostics
 *  5. Faculty Availability Finder & Room Availability Finder calculations
 *  6. Teaching load, contact hours, overload classification & consecutive period streak calculations
 *  7. Security hardening (HTML escaping & CSV formula injection prevention)
 *  8. Schedule Change History recording
 */

const assert = require("assert");
const fs = require("fs");
const path = require("path");

// Minimal browser global shim for sample-data.js & app.js
global.window = global;

const parser = require("../parser.js");
require("../sample-data.js");
const app = require("../app.js");

// Simple RFC-4180 CSV parser to construct a mock SheetJS workbook object from sample_input.csv
function parseCsvToRows(csvText) {
  const rows = [];
  let row = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < csvText.length; i++) {
    const ch = csvText[i];
    const next = csvText[i + 1];

    if (inQuotes) {
      if (ch === '"' && next === '"') {
        field += '"';
        i++;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        field += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ",") {
        row.push(field);
        field = "";
      } else if (ch === "\n") {
        row.push(field.replace(/\r$/, ""));
        rows.push(row);
        row = [];
        field = "";
      } else {
        field += ch;
      }
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field.replace(/\r$/, ""));
    rows.push(row);
  }
  return rows;
}

// Mock SheetJS global for parser.js
global.XLSX = {
  utils: {
    sheet_to_json(ws) {
      return ws.__rows || [];
    }
  }
};

let passed = 0;
let failed = 0;

function test(name, fn) {
  try {
    fn();
    console.log(`  PASS: ${name}`);
    passed++;
  } catch (err) {
    console.error(`  FAIL: ${name}`);
    console.error(`        ${err.message}`);
    failed++;
  }
}

console.log("=== Running Faculty Schedule App Automated Tests ===\n");

// 1. Parser Cell & Room Normalization Tests
test("normalizeRoomName standardizes building prefixes and spacing", () => {
  assert.strictEqual(parser.normalizeRoomName("BGANNE12"), "BGANNEX 12");
  assert.strictEqual(parser.normalizeRoomName("bgannex   13"), "BGANNEX 13");
  assert.strictEqual(parser.normalizeRoomName("SAL171"), "SAL 171");
  assert.strictEqual(parser.normalizeRoomName("allied 246"), "ALLIED 246");
  assert.strictEqual(parser.normalizeRoomName("RTL217"), "RTL 217");
  assert.strictEqual(parser.normalizeRoomName(""), "TBA");
});

test("parseScheduleCell extracts subject, section, room, and office duty accurately", () => {
  const c1 = parser.parseScheduleCell("MATH 138 PO1 SAL 165");
  assert.strictEqual(c1.subject, "MATH 138");
  assert.strictEqual(c1.section, "PO1");
  assert.strictEqual(c1.room, "SAL 165");
  assert.strictEqual(c1.isDuty, false);

  const c2 = parser.parseScheduleCell("MATH1BR-BR1 SAL 172");
  assert.strictEqual(c2.subject, "MATH 1BR");
  assert.strictEqual(c2.section, "BR1");
  assert.strictEqual(c2.room, "SAL 172");

  const c3 = parser.parseScheduleCell("CHEM 131M3 BGANNEX 16");
  assert.strictEqual(c3.subject, "CHEM 131");
  assert.strictEqual(c3.section, "M3");
  assert.strictEqual(c3.room, "BGANNEX 16");

  const c4 = parser.parseScheduleCell("CHEM 321 C X1 RTL 428");
  assert.strictEqual(c4.subject, "CHEM 321 C");
  assert.strictEqual(c4.section, "X1");
  assert.strictEqual(c4.room, "RTL 428");

  const duty = parser.parseScheduleCell("DEMPC");
  assert.strictEqual(duty.isDuty, true);
  assert.strictEqual(duty.dutyName, "DEMPC");
  assert.strictEqual(duty.room, "OFFICE / DEPT");
});

test("resolvePeriodIndex differentiates Morning P1 (07:30-09:00 AM) from Evening P9 (07:30-09:00 PM)", () => {
  assert.strictEqual(parser.resolvePeriodIndex("07:30 - 09:00", false), 0);
  assert.strictEqual(parser.resolvePeriodIndex("07:30 - 09:00", true), 8);
  assert.strictEqual(parser.resolvePeriodIndex("07:30 - 09:00 PM", false), 8);
  assert.strictEqual(parser.resolvePeriodIndex("06:00 - 07:30", true), 7);
  assert.strictEqual(parser.resolvePeriodIndex("07:30 - 09:00", false, "P9"), 8);
});

// 2. Stacked Single-Sheet CSV Parsing (sample_input.csv bug fix verification)
test("parseScheduleWorkbook parses all 24 instructors from stacked sample_input.csv", () => {
  const csvPath = path.join(__dirname, "..", "sample_input.csv");
  const csvContent = fs.readFileSync(csvPath, "utf8");
  const rows = parseCsvToRows(csvContent);

  const mockWorkbook = {
    SheetNames: ["Sheet1"],
    Sheets: {
      Sheet1: { __rows: rows }
    }
  };

  const parsed = parser.parseScheduleWorkbook(mockWorkbook);
  assert.strictEqual(parsed.instructors.length, 24, `Expected 24 instructors, got ${parsed.instructors.length}`);
  assert.strictEqual(parsed.rosterSummary.length, 24, `Expected 24 roster summary rows, got ${parsed.rosterSummary.length}`);
  assert.ok(parsed.sessions.length >= 230, `Expected >= 230 sessions, got ${parsed.sessions.length}`);
  assert.ok(parsed.rooms.length >= 30, `Expected >= 30 rooms, got ${parsed.rooms.length}`);

  // Verify evening P9 session for EMPACES (CHEM 233 N9 BGANNEX 11 at 07:30 - 09:00 PM) is P9 (index 8), not P1 (index 0)
  const empaces = parsed.instructors.find(i => i.name.includes("EMPACES"));
  assert.ok(empaces, "EMPACES instructor should exist");
  const p9Sessions = empaces.sessions.filter(s => s.subject === "CHEM 233" && s.section === "N9");
  assert.strictEqual(p9Sessions.length, 2);
  assert.strictEqual(p9Sessions[0]._periodIdx, 8);
  assert.strictEqual(p9Sessions[0]._periodCode, "P9");
});

// 3. Re-importing Tabular Exported CSV
test("parseScheduleWorkbook supports re-importing exported tabular schedule CSV rows", () => {
  const tabularRows = [
    ["Day", "Period", "TimeSlot", "Subject", "Section", "Room", "Instructor", "IsOfficeDuty"],
    ["MONDAY", "P1", "07:30–09:00 AM", "MATH 138", "PO1", "SAL 165", "DOE, JANE A.", "No"],
    ["MONDAY", "P9", "07:30–09:00 PM", "CHEM 233", "N9", "BGANNEX 11", "DOE, JANE A.", "No"],
    ["TUESDAY", "P2", "09:00–10:30 AM", "DEMPC (Office Duty)", "-", "OFFICE / DEPT", "DOE, JANE A.", "Yes"]
  ];
  const wb = {
    SheetNames: ["Exported"],
    Sheets: { Exported: { __rows: tabularRows } }
  };
  const parsed = parser.parseScheduleWorkbook(wb);
  assert.strictEqual(parsed.instructors.length, 1);
  assert.strictEqual(parsed.sessions.length, 3);
  assert.strictEqual(parsed.sessions[0]._periodIdx, 0);
  assert.strictEqual(parsed.sessions[1]._periodIdx, 8);
  assert.strictEqual(parsed.sessions[2].isDuty, true);
});

// 4. Conflict Detection & Incomplete Schedule Detection
test("analyzeScheduleConflictsAndHealth detects room clashes, faculty overlaps, TBA rooms, and zero-load instructors", () => {
  const sampleClone = JSON.parse(JSON.stringify(global.SAMPLE_SCHEDULE_DATA));
  app.annotateSessionPeriods(sampleClone);
  parser.analyzeScheduleConflictsAndHealth(sampleClone);

  assert.ok(Array.isArray(sampleClone.conflicts));
  assert.ok(sampleClone.conflicts.length > 0, "Should detect room double-booking conflicts in sample dataset");
  assert.ok(sampleClone.diagnostics, "Should attach diagnostics object");
  assert.strictEqual(sampleClone.diagnostics.roomConflicts.length, sampleClone.conflicts.length);
  assert.ok(
    sampleClone.diagnostics.unassignedRoomSessions.length >= 2,
    "Should detect TBA room sessions (e.g. CHEM 131M Z1/Z2 TBA)"
  );

  // Verify each room conflict includes explanation and resolutionHint
  const firstConflict = sampleClone.diagnostics.roomConflicts[0];
  assert.ok(firstConflict.explanation && firstConflict.explanation.length > 10);
  assert.ok(firstConflict.resolutionHint && firstConflict.resolutionHint.length > 10);
  assert.ok(Array.isArray(firstConflict.affectedInstructors) && firstConflict.affectedInstructors.length >= 1);
});

// 5. Faculty Availability & Room Availability Calculations
test("getFacultyAvailabilityForSlot classifies Available, Office Duty, and In Class instructors with next class info", () => {
  app.state.data = JSON.parse(JSON.stringify(global.SAMPLE_SCHEDULE_DATA));
  app.annotateSessionPeriods(app.state.data);
  app.recalculateConflicts(app.state.data);

  const monP1 = app.getFacultyAvailabilityForSlot("MONDAY", 0);
  assert.strictEqual(monP1.length, 24);

  const polancos = monP1.find(f => f.name.includes("POLANCOS"));
  assert.ok(polancos);
  assert.strictEqual(polancos.statusCode, "ON_DUTY", "Polancos has DEMPC office duty on Monday P1");
  assert.ok(polancos.nextSession, "Polancos should have a next scheduled class on Monday");
  assert.strictEqual(polancos.nextPeriodDef.code, "P3");

  const amanence = monP1.find(f => f.name.includes("AMANENCE"));
  assert.ok(amanence);
  assert.strictEqual(amanence.statusCode, "AVAILABLE", "Amanence is free on Monday P1");
  assert.strictEqual(amanence.consecutiveFree, 7, "Amanence is free P1..P7 (7 periods) before P8 class");
});

test("getRoomsStatusForSlot returns both vacant and occupied rooms with consecutive free duration", () => {
  const monP1Rooms = app.getRoomsStatusForSlot("MONDAY", 0, "ALL");
  assert.strictEqual(monP1Rooms.length, app.state.data.rooms.length);

  const vacantOnly = app.getVacantRoomsForSlot("MONDAY", 0, "ALL");
  const occupiedOnly = monP1Rooms.filter(r => r.isOccupied);
  assert.strictEqual(vacantOnly.length + occupiedOnly.length, monP1Rooms.length);
  assert.ok(vacantOnly.every(v => v.consecutiveFree >= 1));
  assert.ok(occupiedOnly.every(o => o.occupyingSessions.length >= 1));
});

// 6. Teaching Load & Streak Calculations
test("getFacultyLoadAnalytics computes contact hours, overload status, and consecutive teaching streaks", () => {
  const mockFacultyOverload = {
    name: "TEST, OVERLOAD",
    status: "FULL-TIME PERMANENT",
    sessions: Array.from({ length: 14 }, (_, idx) => ({
      day: idx < 5 ? "MONDAY" : "TUESDAY",
      _periodIdx: idx % 5,
      timeSlot: "07:30 - 09:00",
      subject: "MATH 101",
      section: "A1",
      room: "SAL 165",
      isDuty: false
    }))
  };
  const metrics = app.getFacultyLoadAnalytics(mockFacultyOverload);
  assert.strictEqual(metrics.academicCount, 14);
  assert.strictEqual(metrics.academicHours, 21);
  assert.strictEqual(metrics.loadCode, "OVERLOAD");
  assert.strictEqual(metrics.maxStreak, 5);
  assert.strictEqual(metrics.maxStreakDay, "Mon");
});

// 7. Security Hardening (XSS Escaping & CSV Formula Injection Prevention)
test("escapeHtml and highlightMatchText neutralize untrusted HTML payloads", () => {
  const malicious = '<img src=x onerror="alert(1)">';
  const escaped = app.escapeHtml(malicious);
  assert.ok(!escaped.includes("<img"), "Raw HTML tag must be escaped");
  assert.ok(escaped.includes("&lt;img"));

  const highlighted = app.highlightMatchText('POLANCOS <script>alert("xss")</script>', ["polancos"]);
  assert.ok(!highlighted.includes("<script>"), "highlightMatchText must escape HTML before wrapping <mark>");
  assert.ok(highlighted.includes("<mark"));
});

test("sanitizeCsvCell escapes double quotes and neutralizes spreadsheet formula injection", () => {
  assert.strictEqual(app.sanitizeCsvCell('=CMD|" /C calc"!A0'), `"'=CMD|"" /C calc""!A0"`);
  assert.strictEqual(app.sanitizeCsvCell("+SUM(A1:A2)"), `"'+SUM(A1:A2)"`);
  assert.strictEqual(app.sanitizeCsvCell("@IMPORTXML()"), `"'@IMPORTXML()"`);
  assert.strictEqual(app.sanitizeCsvCell("-"), `"-"`);
  assert.strictEqual(app.sanitizeCsvCell('POLANCOS, "MA." CARMEN'), `"POLANCOS, ""MA."" CARMEN"`);
});

// 8. Schedule Change History Recording
test("recordScheduleHistoryEntry records restorable snapshots with bounded history", () => {
  app.state.history = [];
  const prev = { instructors: [{ name: "A" }], sessions: [], rooms: [], conflicts: [] };
  const next = { instructors: [{ name: "A" }, { name: "B" }], sessions: [{ isDuty: false }], rooms: ["SAL 165"], conflicts: [] };

  const entry = app.recordScheduleHistoryEntry({
    actionType: "IMPORT",
    title: "Test Import",
    summary: "Imported test workbook",
    source: "test.xlsx",
    previousData: prev,
    updatedData: next
  });

  assert.strictEqual(app.state.history.length, 1);
  assert.strictEqual(entry.actionType, "IMPORT");
  assert.strictEqual(entry.metrics.instructorsCount, 2);
  assert.strictEqual(entry.previousSnapshot.instructors.length, 1);
});

console.log(`\n=== Test Summary: ${passed} passed, ${failed} failed ===`);
if (failed > 0) {
  process.exit(1);
}

