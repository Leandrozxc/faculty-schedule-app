# CEA Faculty Schedule & Room Occupancy Portal

A dynamic web application designed to parse university and college faculty scheduling workbooks (`.xlsx`, `.xls`, `.csv`), automatically extract class timetable grids from individual faculty sheets, and provide instant interactive views.

## Key Features

1. **Dynamic Excel Upload (Not Hardcoded):**
   - Upload any new `.xlsx` file anytime using the drag-and-drop uploader or browse button.
   - Powered by [SheetJS](https://sheetjs.com/), parsing the workbook client-side in the browser in milliseconds without needing an external backend.
   - Automatically identifies and parses `FLR-002` Individual Faculty sheets while safely ignoring administrative and legal forms (`FLR-003`, `FLR-004`, `FLR-005`).
   - Caches your uploaded schedule to browser `localStorage` so it persists between page refreshes.

2. **Room Occupancy & Clash Checker (Tab 1):**
   - View any classroom (e.g. `ALLIED 246`, `BGANNEX 13`, `SAL 171`, `GLEC 1`, etc.).
   - Full Monday to Saturday 7:30 AM to 9:00 PM grid showing **Vacant** slots vs **Occupied** slots.
   - **Double-booking Detection:** Instantly flags conflicting classes scheduled in the same room at the same time slot in red.

3. **Master Weekly Schedule (Tab 2):**
   - Comprehensive timetable across all instructors, rooms, and courses.
   - Multi-filters: Filter by Day, Room, Instructor, and text search (subject code, section, room).
   - Switch between **Visual Calendar Grid** and **Searchable Data Table**.
   - Export full schedule to CSV.

4. **Individual Instructor View (Tab 3):**
   - Search and select any faculty member from the dropdown.
   - View their personalized weekly timetable, employment classification (`FT1`, `FT2`, `PT`), educational qualification, and total class sessions.
   - One-click print / export to PDF.

5. **Department Faculty Roster (Tab 4):**
   - Summary table of all instructors with quick "View Timetable" links.

---

## How to Run

### Method 1: Direct Browser Launch
Simply double-click `index.html` to open it directly in Google Chrome, Microsoft Edge, or Mozilla Firefox.

### Method 2: Local HTTP Server (Recommended)
You can serve the directory using Python or Node.js:

```powershell
cd C:\Users\LOQ\.gemini\antigravity\scratch\faculty-schedule-app
python -m http.server 3000
```
Then open: [http://localhost:3000](http://localhost:3000)

---

## File Structure

```
faculty-schedule-app/
├── index.html        # Main application layout and Tailwind CSS UI
├── parser.js         # SheetJS parsing engine and room conflict detector
├── sample-data.js    # Preloaded default CEA dataset (24 instructors, 33 rooms)
├── app.js            # UI controller, state management, and filters
├── sample_input.csv  # Raw reference CSV extracted from user's sheets
└── README.md         # Documentation
```
