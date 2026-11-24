# Academic Timetable & Room Registry

A responsive, high-performance web application designed for universities and colleges to manage, explore, and inspect faculty timetables, classroom occupancy, and master academic schedules. Powered by client-side Excel parsing, live schedule highlighting, and a dark mode interface.

---

## Highlights & Features

### 1. Executive Overview Dashboard & Conflict Impact Analysis
- **At-a-Glance KPI Cards:** Summarizes Total Faculty, Scheduled Classes, Active Classrooms, Available Rooms for the current period, Schedule Conflicts, and Incomplete Schedule Alerts.
- **Conflict Impact Analysis:** Identifies room double-bookings and faculty schedule overlaps, displaying affected instructors, student blocks, overlapping rooms, and recommended vacant rooms for one-click conflict resolution.
- **Incomplete Schedule Detection:** Automatically flags classes with unassigned rooms (`TBA`) with inline room assignment controls, missing student section codes, and zero-load faculty members.
- **Building Utilization & Daily Distribution:** Visualizes weekly room utilization across academic buildings (`ALLIED`, `BGANNEX`, `SAL`, `GLEC`) and daily instructional load (Monday–Saturday).

### 2. Main Screen: Instant Faculty Timetable Lookup & Availability Finder
- **Student & Faculty Search-First Design:** Quickly find any faculty member's schedule by typing their surname, first name, course code, or room.
- **Faculty Availability Finder:** Switch to **"Find Available Faculty"** to query instructors by Day, Period (`P1`–`P9`), and Employment Status (`Full-Time` / `Part-Time`), showing who is **Available / Free** (with consecutive free periods), on **Office / Consultation Duty**, or **Occupied in Class**, along with their next scheduled class.
- **Intelligent Autocomplete:** Real-time suggestion dropdown with query token highlighting, employment status badges (`Full-Time` / `Part-Time`), course summaries, and keyboard navigation (`Up` / `Down` arrows, `Enter`, `Escape`).
- **Quick Faculty Stepping:** Easily browse through instructors using `Prev` / `Next` buttons or direct selection.
- **Faculty Profile Card:** Displays qualification/department, active courses, assigned classrooms, weekly class count, and office duty periods.
- **Adaptive Timetable View:**
  - **Desktop (>=768px):** 6-column weekly matrix (Monday–Saturday) across 9 standardized academic periods with a sticky left time column.
  - **Mobile (<768px):** Day switcher bar with session counts and clean chronological schedule cards.

### 2. Live Clock & Current Class Availability Dashboard
- **Live Local Time Display:** Real-time digital clock synchronized to `Asia/Manila` (PHT) with live seconds and full localized date display.
- **Real-Time Status Indicator:** Displays ongoing class count, active academic period, or outside-hours status at a glance.
- **Interactive Availability Drawer:** Click or press enter on the clock to expand a live drawer showing:
  - **Ongoing Classes:** Classes currently in session with remaining time.
  - **Upcoming Classes:** Classes scheduled later in the day with countdowns.
  - **Completed Classes:** Classes that have already concluded today.
  - **Office Duty Filter:** Toggle inclusion of consultation and departmental duty sessions.

### 3. Live Current Schedule Highlighting
- **Automatic Current-Activity Detection:** Identifies which class or office duty a faculty member is supposed to be attending *right now* based on live date and time.
- **Distinct Visual Treatment:**
  - **Active Academic Class:** Accent-tinted card with an emerald indicator, `HAPPENING NOW` badge, and period countdown (e.g., `45m left`).
  - **Active Office Duty:** Amber-tinted card identifying consultation or departmental duties (`DEMPC`, `KTTO`, etc.).
  - **Multiple Overlapping Entries:** Flags conflicts with an `OVERLAP` badge and alert styling.
- **Current-Time Progress Indicator:** Displays a live progress bar within today's active period cell indicating elapsed time and percentage through the 90-minute block.
- **Empty Slot Awareness:** Shows a subtle `"No scheduled activity right now"` card during active class hours along with the next upcoming session.
- **Live Transitions:** Schedule highlights automatically update as minutes and periods elapse without requiring a page refresh.

### 4. Master Weekly Schedule (Institution-Wide Grid)
- **Period-Separated Architecture:** Displays all university sections across the 6 instructional days and 9 standard periods (P1–P9).
- **Interactive Period Strip:** Quick filter pills showing session counts per period (`P1` through `P9` or `All Periods`).
- **Comprehensive Multi-Filters:** Filter simultaneously by Day, Room, Instructor, or search query.
- **Dual View Modes:**
  - **Visual Calendar Grid:** Grouped period blocks with color-coded instructor badges.
  - **Searchable Data Table:** Dense tabular view with one-click CSV export.

### 5. Room Occupancy, Vacant Room Finder & Interactive Conflict Resolver
- **Room Registry:** Inspect room utilization for classrooms, computer laboratories, and lecture halls (e.g., `ALLIED 246`, `BGANNEX 13`, `SAL 171`, `GLEC 1`).
- **Interactive Conflict Resolver & In-Memory Room Reassignment:** Automatically detects and highlights conflicting classes scheduled in the same room and time slot. Click **"Resolve Conflict"** on any double-booked alert or cell to view all 100% vacant rooms for that exact period and reassign a session in-memory (persisted to `localStorage`).
- **Instant Vacant Room Finder:** Switch between **Room Matrix** and **Find Vacant Room** to filter available classrooms by day, period (`P1`–`P9`), and building (`ALLIED`, `BGANNEX`, `SAL`, `GLEC`), complete with consecutive free-period durations (e.g., *"Free for 3 periods (4.5h)"*).
- **One-Click Cross Navigation:** Click any room badge across any timetable to inspect that room's weekly occupancy immediately.

### 6. Student Section / Block Timetables
- **Dedicated Section View:** Browse the complete weekly 6-Day × 9-Period timetable for any student section or block (e.g., `PO1`, `N5`, `BR1`).
- **Section Summary Metrics:** Displays total courses, weekly contact hours, assigned rooms, and instructors for the selected student block, with `Prev` / `Next` stepping and `.ics` calendar export.

### 7. Faculty Teaching Load, Contact Hours & Overload Analytics (FLR-001 & FLR-002)
- **Contact-Hour & Overload Classification:** Calculates weekly academic contact hours (`classes × 1.5 hrs`) and office duty hours, automatically classifying faculty loads into **Regular Load**, **Overload (`>18 hrs` / `>12 classes`)**, or **Part-Time / Underload** with visual load bars.
- **Consecutive Teaching Streak Detection:** Flags back-to-back teaching streaks (`3+ consecutive periods` on a single day) on both the Instructor Profile Card and the Faculty Summary table.
- **Batch Print All Faculty Slips (`Form FLR-002`):** One-click **"Batch Print All (FLR-002)"** generates print-formatted individual teaching load assignment sheets for all faculty members separated by page breaks.

### 8. Time-Travel Simulation Mode, Calendar Export (`.ics`) & Deep-Link URLs
- **Time-Travel Simulator ("Simulate Time"):** Preview how the live clock, `HAPPENING NOW` cards, progress bars, and availability drawer behave at any day of the week (`Monday`–`Sunday`) and period (`P1`–`P9` or `After Hours`).
- **Calendar Export (`.ics`):** Export any instructor's or student section's weekly schedule to a recurring RFC 5545 `.ics` calendar file for Google Calendar, Apple Calendar, or Outlook.
- **Shareable Deep-Link URLs:** Synchronizes the active tab, faculty member, room, and student section with URL query parameters (`?tab=...&faculty=...&room=...&section=...`) for one-click link sharing.

### 9. Staged Excel/CSV Import Preview, Validation & Schedule Change History
- **Staged Import Preview Workflow:** Uploading a workbook (`.xlsx`, `.xls`, or `.csv`) parses and validates the file in a non-destructive preview stage first—displaying extracted counts, room/faculty conflict warnings, and incomplete entry alerts before you confirm replacing the active schedule.
- **Multi-Format Parser Resilience:** Supports multi-sheet workbooks (Form `FLR-001` + individual `FLR-002` sheets), stacked single-sheet workbooks/CSVs (such as `sample_input.csv` with 24 stacked faculty blocks), and re-imported tabular CSV schedule exports.
- **Schedule Change History & Rollback:** Automatically records restorable snapshots in browser storage whenever schedules are imported, rooms are reassigned, or data is reset. Click **History** in the top toolbar to review past modifications and restore any previous version with one click.
- **Exportable Workload Reports & Security:** Export full schedules or Form `FLR-001` faculty workload analytics to CSV (hardened against spreadsheet formula injection).

### 10. Dark Mode & Accessibility
- **Theme Toggle:** Easily switch between Light and Dark themes via the header button.
- **Persistent Preference:** Automatically respects the user's system color scheme (`prefers-color-scheme`) and persists user selection in `localStorage`.
- **Keyboard Navigation & ARIA:** Comprehensive ARIA labels, keyboard-navigable dropdowns, `prefers-reduced-motion` support, and high-contrast color tokens adhering to accessibility standards.

---

## Academic Schedule Grid

The application organizes all university schedules around a standard **9-Period Academic Grid** (Monday through Saturday, 7:30 AM to 9:00 PM):

| Period Code | Time Slot | Academic Block |
|:---:|:---:|:---:|
| **P1** | 07:30 AM – 09:00 AM | Morning Block |
| **P2** | 09:00 AM – 10:30 AM | Morning Block |
| **P3** | 10:30 AM – 12:00 PM | Morning Block |
| **P4** | 12:00 PM – 01:30 PM | Midday Block |
| **P5** | 01:30 PM – 03:00 PM | Afternoon Block |
| **P6** | 03:00 PM – 04:30 PM | Afternoon Block |
| **P7** | 04:30 PM – 06:00 PM | Late Afternoon |
| **P8** | 06:00 PM – 07:30 PM | Evening Block |
| **P9** | 07:30 PM – 09:00 PM | Evening Block |

---

## How to Run

### Method 1: Direct Browser Launch
Simply double-click `index.html` to open it directly in any modern web browser (Google Chrome, Microsoft Edge, Mozilla Firefox, Safari). No build step, package manager, or backend server is required.

### Method 2: Local HTTP Server (Recommended)
Running through a local web server ensures optimal performance and support for local web workers:

**Using Python:**
```bash
python -m http.server 8080
```
Then navigate to: [http://localhost:8080](http://localhost:8080)

**Using Node.js (npx):**
```bash
npx serve .
```

### Method 3: Cloud Deployment
The repository includes configuration for static hosting platforms. Deploy directly to:
- **Vercel:** Ready out of the box with [`vercel.json`](file:///c:/Users/LOQ/Documents/faculty-schedule-app/vercel.json).
- **GitHub Pages:** Host directly from the repository's `master` branch.
- **Netlify:** Drag and drop the project folder or connect via Git.

---

## Project Structure

```
faculty-schedule-app/
├── index.html          # Application markup, Tailwind CSS styling & dark mode styles
├── app.js              # UI controller, state management, search autocomplete & live clock
├── parser.js           # SheetJS workbook parser & room double-booking clash detector
├── sample-data.js      # Default preloaded semester dataset (24 instructors, 33 rooms)
├── sample_input.csv    # Reference CSV export of the faculty schedule dataset
├── vercel.json         # Static hosting configuration for Vercel
├── .gitignore          # Git exclusion rules
└── README.md           # Project documentation and usage guide
```

---

## Contributing & Conventions

When modifying this repository, adhere to the **Conventional Commits** format for all commit messages:
```
<type>(<scope>): <concise imperative summary>
```
*Examples:*
- `feat(schedule): add live current schedule highlighting`
- `fix(parser): resolve period index calculation for evening classes`
- `docs(readme): update features and setup guide`
