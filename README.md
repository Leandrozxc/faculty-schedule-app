# Academic Timetable & Room Registry

A responsive, high-performance web application designed for universities and colleges to manage, explore, and inspect faculty timetables, classroom occupancy, and master academic schedules. Powered by client-side Excel parsing, live schedule highlighting, and a dark mode interface.

---

## Highlights & Features

### 1. Main Screen: Instant Faculty Timetable Lookup
- **Student & Faculty Search-First Design:** Quickly find any faculty member's schedule by typing their surname, first name, course code, or room.
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

### 5. Room Occupancy & Double-Booking Clash Detector
- **Room Registry:** Inspect room utilization for classrooms, computer laboratories, and lecture halls (e.g., `ALLIED 246`, `BGANNEX 13`, `SAL 171`, `GLEC 1`).
- **Double-Booking Detection:** Automatically detects and highlights conflicting classes scheduled in the same room at the same time slot in red, detailing conflicting subjects and instructors.
- **One-Click Cross Navigation:** Click any room badge across any timetable to inspect that room's weekly occupancy immediately.

### 6. Department Faculty Roster (FLR-001)
- Comprehensive directory table summarizing all faculty members.
- Displays academic status, qualifications, total weekly teaching loads, and office duty allocations.
- One-click navigation to jump directly to any instructor's individual timetable.

### 7. Client-Side Excel Workbook Parser (Zero Backend Required)
- **Dynamic File Import:** Upload any standard scheduling workbook (`.xlsx`, `.xls`, or `.csv`) using drag-and-drop or file picker.
- **Fast Client-Side Parsing:** Powered by [SheetJS](https://sheetjs.com/), processing complex multi-sheet workbooks in browser memory in milliseconds.
- **Smart Sheet Identification:** Automatically extracts data from `FLR-002` Individual Faculty timetable grids while safely ignoring administrative forms (`FLR-003`, `FLR-004`, `FLR-005`).
- **Local Persistence:** Imported schedules are cached in browser `localStorage` so your data persists across page refreshes.
- **Reset to Default:** Restore the built-in preloaded semester dataset anytime with one click.

### 8. Dark Mode & Accessibility
- **Theme Toggle:** Easily switch between Light and Dark themes via the header button.
- **Persistent Preference:** Automatically respects the user's system color scheme (`prefers-color-scheme`) and persists user selection in `localStorage`.
- **Keyboard Navigation & ARIA:** Comprehensive ARIA labels, keyboard-navigable dropdowns, and high-contrast color tokens adhering to accessibility standards.

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
