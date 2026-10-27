import csv
import json
import re

TIME_SLOTS = [
    "07:30 - 09:00",
    "09:00 - 10:30",
    "10:30 - 12:00",
    "12:00 - 01:30",
    "01:30 - 03:00",
    "03:00 - 04:30",
    "04:30 - 06:00",
    "06:00 - 07:30",
    "07:30 - 09:00"
]

DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"]

KNOWN_ROOMS_RE = re.compile(r'(BGANNEX\s*\d+|BGANNE\s*\d+|ALLIED\s*\d+|SAL\s*\d+|GLEC\s*\d+|GLE\s*\d+|GLAB\s*\d+|PHYSLAB\s*\d+|ACAD\s*\d+|LINK\s*\d+|RTL\s*\d+|TBA)', re.IGNORECASE)

def clean_room(room):
    if not room:
        return 'TBA'
    room = room.strip().upper()
    room = re.sub(r'BGANNE(\d+)', r'BGANNEX \1', room)
    room = re.sub(r'BGANNEX(\d+)', r'BGANNEX \1', room)
    room = re.sub(r'ALLIED(\d+)', r'ALLIED \1', room)
    room = re.sub(r'SAL(\d+)', r'SAL \1', room)
    room = re.sub(r'GLEC(\d+)', r'GLEC \1', room)
    room = re.sub(r'GLE(\d+)', r'GLE \1', room)
    room = re.sub(r'GLAB(\d+)', r'GLAB \1', room)
    room = re.sub(r'PHYSLAB(\d+)', r'PHYSLAB \1', room)
    room = re.sub(r'ACAD(\d+)', r'ACAD \1', room)
    room = re.sub(r'LINK(\d+)', r'LINK \1', room)
    room = re.sub(r'RTL(\d+)', r'RTL \1', room)
    room = re.sub(r'\s+', ' ', room)
    return room

def parse_cell(cell_val):
    if not cell_val:
        return None
    val = str(cell_val).strip()
    if not val or val.lower() == 'nan':
        return None
    
    if val in ['DEMPC', 'KTTO', 'ITSO']:
        return {
            'isDuty': True,
            'dutyName': val,
            'subject': val + ' (Office Duty)',
            'section': '-',
            'room': 'OFFICE / DEPT',
            'raw': val
        }
    
    match = KNOWN_ROOMS_RE.search(val)
    room = 'TBA'
    remainder = val
    if match:
        room = clean_room(match.group(0))
        remainder = val[:match.start()] + val[match.end():]
        remainder = remainder.strip()
    else:
        parts = val.split()
        if len(parts) >= 2 and re.match(r'^[A-Z]+\d*$', parts[-1]):
            room = clean_room(parts[-1])
            remainder = ' '.join(parts[:-1])
    
    remainder = remainder.strip('-/ ')
    course_match = re.match(r'^([A-Za-z]{2,5}\s*\d+[A-Za-z\d]*)\s*[-/]?\s*(.*)$', remainder)
    if course_match:
        subj = course_match.group(1).strip()
        sec = course_match.group(2).strip()
        subj = re.sub(r'^([A-Za-z]+)(\d+.*)$', r'\1 \2', subj)
        return {
            'isDuty': False,
            'subject': subj.upper(),
            'section': sec.upper() if sec else '-',
            'room': room,
            'raw': val
        }
    
    return {
        'isDuty': False,
        'subject': remainder.upper() or val.upper(),
        'section': '-',
        'room': room,
        'raw': val
    }

def process_file(csv_path):
    with open(csv_path, 'r', encoding='utf-8', errors='ignore') as f:
        reader = list(csv.reader(f))
    
    instructors = []
    sessions = []
    rooms = set()
    roster_summary = []
    
    # Process line by line
    i = 0
    while i < len(reader):
        row = reader[i]
        line_str = " ".join(row)
        
        # Check for individual faculty section
        if "INDIVIDUAL FACULTY TEACHING LOAD ASSIGNMENT" in line_str:
            # Look ahead for name, qualification, status
            faculty_name = ""
            status = "Faculty"
            qualification = ""
            
            j = i + 1
            while j < len(reader) and "CLASS SCHEDULE" not in " ".join(reader[j]):
                sub_row = reader[j]
                row_str = " ".join(sub_row)
                if "FULL NAME" in row_str:
                    for c in sub_row[1:]:
                        if c.strip() and "FULL NAME" not in c:
                            faculty_name = c.strip().strip('"')
                            break
                if "EMPLOYMENT STATUS" in row_str:
                    for c in sub_row[1:]:
                        if c.strip() and "EMPLOYMENT STATUS" not in c:
                            status = c.strip().strip('"')
                            break
                if "HIGHEST EDUCATIONAL QUALIFICATION" in row_str:
                    for c in sub_row[1:]:
                        if c.strip() and "HIGHEST EDUCATIONAL QUALIFICATION" not in c:
                            qualification = c.strip().strip('"')
                            break
                j += 1
            
            if "CLASS SCHEDULE" in " ".join(reader[j]):
                # Next row should be days header
                j += 1
                header_row = reader[j]
                day_cols = {}
                for c_idx, val in enumerate(header_row):
                    val_clean = val.strip().upper()
                    if val_clean in DAYS:
                        day_cols[c_idx] = val_clean
                
                faculty_sessions = []
                j += 1
                current_time = ""
                while j < len(reader):
                    sched_row = reader[j]
                    row_joined = " ".join(sched_row)
                    if "INDIVIDUAL FACULTY TEACHING LOAD" in row_joined or "DEPARTMENT OF" in row_joined:
                        break
                    
                    time_col = sched_row[1] if len(sched_row) > 1 and sched_row[1].strip() else (sched_row[0] if sched_row else "")
                    time_col = time_col.strip().replace("–", "-").replace("—", "-")
                    
                    if ":" in time_col:
                        current_time = re.sub(r'\s+', ' ', time_col).strip()
                    
                    if current_time:
                        for col_idx, day_name in day_cols.items():
                            if col_idx < len(sched_row):
                                cell_val = sched_row[col_idx].strip()
                                parsed = parse_cell(cell_val)
                                if parsed:
                                    sess = {
                                        "id": f"{faculty_name}_{day_name}_{current_time}_{parsed['room']}_{parsed['subject']}".replace(" ", "_"),
                                        "instructor": faculty_name,
                                        "day": day_name,
                                        "timeSlot": current_time,
                                        "subject": parsed['subject'],
                                        "section": parsed['section'],
                                        "room": parsed['room'],
                                        "isDuty": parsed['isDuty'],
                                        "raw": parsed['raw']
                                    }
                                    faculty_sessions.append(sess)
                                    sessions.append(sess)
                                    if parsed['room'] not in ['OFFICE / DEPT', 'TBA']:
                                        rooms.add(parsed['room'])
                    j += 1
                
                if faculty_name:
                    instructors.append({
                        "name": faculty_name,
                        "status": status,
                        "qualification": qualification,
                        "sessions": faculty_sessions,
                        "totalSessions": len(faculty_sessions)
                    })
                i = j
                continue
        i += 1
    
    # Conflicts
    room_slot_map = {}
    for s in sessions:
        if s['room'] not in ['OFFICE / DEPT', 'TBA']:
            key = f"{s['room']}|{s['day']}|{s['timeSlot']}"
            if key not in room_slot_map:
                room_slot_map[key] = []
            room_slot_map[key].append(s)
            
    conflicts = []
    for key, sess_list in room_slot_map.items():
        if len(sess_list) > 1:
            room, day, slot = key.split("|")
            conflicts.append({
                "room": room,
                "day": day,
                "timeSlot": slot,
                "sessions": sess_list
            })
            
    sorted_rooms = sorted(list(rooms))
    
    payload = {
        "meta": {
            "department": "ENGINEERING MATHEMATICS, PHYSICS , AND CHEMISTRY",
            "college": "COLLEGE OF ENGINEERING AND ARCHITECTURE",
            "period": "FIRST SEMESTER 2026-2027",
            "uploadedAt": "2026-10-27T15:00:00Z"
        },
        "instructors": instructors,
        "sessions": sessions,
        "rooms": sorted_rooms,
        "conflicts": conflicts
    }
    
    js_content = f"// Preloaded default sample data parsed from CEA schedules\nwindow.SAMPLE_SCHEDULE_DATA = {json.dumps(payload, indent=2)};\n"
    
    with open(r'C:\Users\LOQ\.gemini\antigravity\scratch\faculty-schedule-app\sample-data.js', 'w', encoding='utf-8') as out_f:
        out_f.write(js_content)
        
    print(f"Generated sample-data.js with {len(instructors)} instructors, {len(sessions)} class sessions, {len(sorted_rooms)} rooms, and {len(conflicts)} detected room conflicts.")

process_file(r'C:\Users\LOQ\.gemini\antigravity\scratch\faculty-schedule-app\sample_input.csv')
