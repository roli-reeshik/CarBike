import os
import openpyxl
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side

# ==============================================================================
# TARGET DIRECTORY SETUP
# ==============================================================================
TARGET_DIR = r"D:\Apps\CarBikeKhardo_29_09_2026\public\vehicles\cars\skoda\skoda-slavia"
os.makedirs(TARGET_DIR, exist_ok=True)

# ==============================================================================
# STYLING PALETTE
# ==============================================================================
header_font = Font(name="Segoe UI", size=11, bold=True, color="FFFFFF")
header_fill = PatternFill(start_color="0F172A", end_color="0F172A", fill_type="solid")  # Slate 900
cell_font = Font(name="Segoe UI", size=10, color="0F172A")
bold_font = Font(name="Segoe UI", size=10, bold=True, color="0F172A")
price_font = Font(name="Segoe UI", size=10, bold=True, color="047857")  # Emerald 700
note_font = Font(name="Segoe UI", size=9, italic=True, color="475569")

align_left = Alignment(horizontal="left", vertical="center", wrap_text=True)
align_center = Alignment(horizontal="center", vertical="center", wrap_text=True)
align_right = Alignment(horizontal="right", vertical="center")

thin_side = Side(border_style="thin", color="CBD5E1")
cell_border = Border(left=thin_side, right=thin_side, top=thin_side, bottom=thin_side)

zebra_fill = PatternFill(start_color="F8FAFC", end_color="F8FAFC", fill_type="solid")
white_fill = PatternFill(start_color="FFFFFF", end_color="FFFFFF", fill_type="solid")

def apply_table_styles(ws, start_row, end_row, num_cols):
    for r in range(start_row, end_row + 1):
        ws.row_dimensions[r].height = 22
        current_fill = zebra_fill if r % 2 == 0 else white_fill
        for c in range(1, num_cols + 1):
            cell = ws.cell(row=r, column=c)
            cell.font = bold_font if c == 1 else cell_font
            cell.fill = current_fill
            cell.border = cell_border
            cell.alignment = align_left if c == 1 else align_center

# ==============================================================================
# 1. CREATE "Engine.xlsx"
# ==============================================================================
def create_engine_workbook():
    wb = openpyxl.Workbook()
    headers = ["Parameter", "1.0L TSI Petrol (3-Cylinder)", "1.5L TSI Petrol (4-Cylinder EVO)"]

    engine_data = {
        "Engine Specifications": [
            ("Displacement (cc)", "999 cc", "1498 cc"),
            ("Engine Type", "1.0L TSI Turbo Petrol (Inline 3-Cyl)", "1.5L TSI Turbo Petrol (Inline 4-Cyl) with ACT"),
            ("No. of Cylinders / Valves per Cyl", "3 Cylinders / 4 Valves", "4 Cylinders / 4 Valves"),
            ("Max Power", "114 bhp (115 PS) @ 5000-5500 rpm", "147.51 bhp (150 PS) @ 5000-6000 rpm"),
            ("Max Torque", "178 Nm @ 1750-4500 rpm", "250 Nm @ 1600-3500 rpm"),
            ("Emission Norm Compliance", "BS VI 2.0 (E20 Compliant)", "BS VI 2.0 (E20 Compliant)"),
            ("Idle Start/Stop System", "Yes", "Yes"),
            ("Drive Type", "Front Wheel Drive (FWD)", "Front Wheel Drive (FWD)"),
            ("Transmission Options", "6-Speed Manual / 6-Speed Torque Converter AT", "7-Speed Dual Clutch (DSG) Automatic"),
            ("Paddle Shifters", "Yes (on 6-Speed AT)", "Yes (on 7-Speed DSG)"),
        ],
        "Performance & Fuel Economy": [
            ("ARAI Certified Mileage (Manual)", "20.32 kmpl", "—"),
            ("ARAI Certified Mileage (Automatic)", "18.73 kmpl (6-AT)", "19.36 kmpl (7-DSG)"),
            ("Fuel Tank Capacity", "45 Liters", "45 Liters"),
            ("Fuel Type", "Petrol", "Petrol"),
        ],
        "Dimensions & Weight": [
            ("Overall Length (mm)", "4 541 mm", "4 541 mm"),
            ("Overall Width (mm)", "1 752 mm", "1 752 mm"),
            ("Overall Height (mm)", "1 507 mm", "1 507 mm"),
            ("Wheelbase (mm)", "2 651 mm", "2 651 mm"),
            ("Ground Clearance (Unladen)", "179 mm", "179 mm"),
            ("Ground Clearance (Laden)", "145 mm", "145 mm"),
            ("Boot Space Capacity", "521 Litres (Expandable to 1050 L)", "521 Litres (Expandable to 1050 L)"),
            ("Kerb Weight (kg)", "1 160 - 1 252 kg", "1 245 - 1 281 kg"),
            ("Gross Vehicle Weight (kg)", "1 630 - 1 660 kg", "1 685 kg"),
            ("Seating Capacity", "5 Persons", "5 Persons"),
            ("No. of Doors", "4 Doors", "4 Doors"),
        ],
        "Brakes, Steering & Suspension": [
            ("Front Brakes", "Disc (Hydraulic Diagonal Split Vacuum Assisted)", "Disc (Hydraulic Diagonal Split Vacuum Assisted)"),
            ("Rear Brakes", "Drum", "Drum"),
            ("Front Suspension", "MacPherson Strut with Lower Triangular Links & Stabiliser Bar", "MacPherson Strut with Lower Triangular Links & Stabiliser Bar"),
            ("Rear Suspension", "Twist Beam Axle with Compound Link", "Twist Beam Axle with Compound Link"),
            ("Steering Type", "Electro-Mechanical Power Steering", "Electro-Mechanical Power Steering"),
            ("Steering Adjustment", "Tilt & Telescopic Adjustable", "Tilt & Telescopic Adjustable"),
            ("Tyre Size & Type", "205/55 R16 Radial Tubeless", "205/55 R16 Radial Tubeless"),
        ]
    }

    for sheet_title, rows in engine_data.items():
        ws = wb.create_sheet(title=sheet_title)
        ws.append(headers)

        ws.row_dimensions[1].height = 26
        for c in range(1, len(headers) + 1):
            cell = ws.cell(row=1, column=c)
            cell.font = header_font
            cell.fill = header_fill
            cell.alignment = align_left if c == 1 else align_center
            cell.border = cell_border

        for row_data in rows:
            ws.append(list(row_data))

        apply_table_styles(ws, 2, 1 + len(rows), len(headers))
        ws.column_dimensions['A'].width = 38
        ws.column_dimensions['B'].width = 44
        ws.column_dimensions['C'].width = 46
        ws.freeze_panes = "A2"

    if "Sheet" in wb.sheetnames:
        del wb["Sheet"]

    dest_file = os.path.join(TARGET_DIR, "Engine.xlsx")
    wb.save(dest_file)
    print(f"Created: {dest_file}")

# ==============================================================================
# 2. CREATE "Features.xlsx"
# ==============================================================================
def create_features_workbook():
    wb = openpyxl.Workbook()
    headers = ["Feature", "Classic", "Signature", "Sportline", "Prestige", "Monte Carlo"]

    features_data = {
        "Safety & Security": [
            ("Global NCAP Safety Rating (Adult & Child)", "5 Star", "5 Star", "5 Star", "5 Star", "5 Star"),
            ("6 Airbags (Driver, Passenger, Side & Curtain)", "Yes", "Yes", "Yes", "Yes", "Yes"),
            ("Anti-lock Braking System (ABS) with EBD", "Yes", "Yes", "Yes", "Yes", "Yes"),
            ("Electronic Stability Control (ESC)", "Yes", "Yes", "Yes", "Yes", "Yes"),
            ("Multi Collision Braking (MKB)", "Yes", "Yes", "Yes", "Yes", "Yes"),
            ("Electronic Differential Lock System (EDS, XDS & XDS+)", "Yes", "Yes", "Yes", "Yes", "Yes"),
            ("Motor Slip Regulation (MSR) & BDW (Brake Disc Wiping)", "Yes", "Yes", "Yes", "Yes", "Yes"),
            ("Hill Hold Control / Hill Assist", "—", "Yes", "Yes", "Yes", "Yes"),
            ("Tyre Pressure Monitoring System (TPMS)", "Yes", "Yes", "Yes", "Yes", "Yes"),
            ("Rear Parking Sensors", "Yes", "Yes", "Yes", "Yes", "Yes"),
            ("Rear View Camera with Static/Dynamic Guidelines", "—", "Yes", "Yes", "Yes", "Yes"),
            ("Front Fog Lamps", "—", "Yes", "Yes", "Yes", "Yes"),
            ("ISOFIX Child Seat Mounts (Rear Outer)", "Yes", "Yes", "Yes", "Yes", "Yes"),
            ("Impact Sensing Auto Door Unlock & Speed Sensing Auto Door Lock", "Yes", "Yes", "Yes", "Yes", "Yes"),
            ("Seatbelt Pretensioners & Reminder (All Seats)", "Yes", "Yes", "Yes", "Yes", "Yes"),
            ("Anti-Theft Device & Alarm with Engine Immobilizer", "Yes", "Yes", "Yes", "Yes", "Yes"),
            ("Day / Night Inside Rear View Mirror (IRVM)", "Manual", "Auto-Dimming", "Auto-Dimming", "Auto-Dimming", "Auto-Dimming"),
            ("Rear Defogger with Timer", "Yes", "Yes", "Yes", "Yes", "Yes"),
        ],
        "Exterior": [
            ("Headlamps", "Halogen Projector", "LED Headlamps", "LED Headlamps", "LED Headlamps", "LED Headlamps"),
            ("LED Daytime Running Lights (DRLs)", "Yes", "Yes", "Yes", "Yes", "Yes"),
            ("LED Tail Lamps with Crystalline Elements", "Bulb/LED", "Yes", "Yes", "Yes", "Yes"),
            ("Front Radiator Grille", "Chrome Accents", "Chrome Surround", "Glossy Black", "Chrome Surround", "Glossy Black Sport"),
            ("Electric Single-Pane Sunroof with Anti-Pinch", "—", "Yes", "Yes", "Yes", "Yes"),
            ("Wheels & Tyres", "15\" Steel Wheels", "16\" Silver Alloys", "16\" Glossy Black Alloys", "16\" Diamond Cut Alloys", "16\" Dual-Tone Monte Carlo Alloys"),
            ("Shark Fin Antenna", "Yes", "Yes", "Yes", "Yes", "Yes"),
            ("Rear Boot Spoiler", "—", "—", "Yes (Gloss Black)", "—", "Yes (Gloss Black)"),
            ("Window Beltline Moulding", "Black", "Chrome", "Gloss Black", "Chrome", "Gloss Black"),
            ("Auto Rain Sensing Wipers", "—", "Yes", "Yes", "Yes", "Yes"),
            ("Automatic Driving Headlamps with Follow-Me-Home", "—", "Yes", "Yes", "Yes", "Yes"),
            ("Turn Indicators Integrated into ORVMs", "Yes", "Yes", "Yes", "Yes", "Yes"),
        ],
        "Interior & Comfort": [
            ("Interior Upholstery", "Fabric", "Dual-Tone Fabric", "Sport Fabric/Leatherette", "Perforated Leatherette", "Sporty Monte Carlo Leatherette"),
            ("Interior Color Theme", "Black & Grey", "Dual-Tone Beige & Black", "All-Black with Contrast Stitching", "Dual-Tone Beige & Black", "All-Black with Red Accents"),
            ("Front Ventilated Seats", "—", "—", "—", "Yes", "Yes"),
            ("Front Seats Powered Adjustment", "—", "—", "—", "Yes (Driver & Co-Driver)", "Yes (Driver & Co-Driver)"),
            ("Digital Cockpit / Instrument Cluster", "3.5\" TFT MID", "3.5\" TFT MID", "8\" Virtual Cockpit", "8\" Virtual Cockpit", "8\" Virtual Cockpit (Red Theme)"),
            ("Ambient Interior Lighting", "—", "Yes", "Yes", "Yes", "Yes (Red Ambient Light)"),
            ("Air Conditioning", "Manual AC", "Climatronic Auto AC", "Climatronic Auto AC", "Climatronic Auto AC", "Climatronic Auto AC"),
            ("Rear AC Vents & Ducts", "Yes", "Yes", "Yes", "Yes", "Yes"),
            ("Cruise Control", "—", "Yes", "Yes", "Yes", "Yes"),
            ("Paddle Shifters", "—", "AT Only", "AT / DSG Only", "AT / DSG Only", "AT / DSG Only"),
            ("Keyless Entry & Engine Start-Stop Button", "—", "Yes", "Yes", "Yes", "Yes"),
            ("Front Center Armrest with Storage", "Yes", "Yes", "Yes", "Yes", "Yes"),
            ("Rear Center Armrest with Cup Holders", "Yes", "Yes", "Yes", "Yes", "Yes"),
            ("60:40 Split Folding Rear Seats", "Yes", "Yes", "Yes", "Yes", "Yes"),
            ("Cooled Glovebox", "Yes", "Yes", "Yes", "Yes", "Yes"),
            ("Luggage Boot Light & Utility Hooks", "Yes", "Yes", "Yes", "Yes", "Yes"),
        ],
        "Infotainment & Connectivity": [
            ("Touchscreen Infotainment System", "7-inch Touchscreen", "10-inch HD Screen", "10-inch HD Screen", "10-inch HD Screen", "10-inch HD Screen"),
            ("Wireless Apple CarPlay & Android Auto", "Wired", "Wireless", "Wireless", "Wireless", "Wireless"),
            ("Audio System & Speaker Setup", "4 Speakers", "4 Speakers + 4 Tweeters", "4 Speakers + 4 Tweeters", "Škoda Sound System (8 Speakers + Subwoofer)", "Škoda Sound System (8 Speakers + Subwoofer)"),
            ("Wireless Smartphone Charging Pad", "—", "Yes", "Yes", "Yes", "Yes"),
            ("Type-C USB Charging Ports (Front & Rear)", "Front & Rear", "Front & Rear", "Front & Rear", "Front & Rear", "Front & Rear"),
            ("Steering Mounted Controls (Audio & Calling)", "Yes", "Yes", "Yes", "Yes", "Yes"),
            ("MySKODA ConnectED Telematics", "—", "Yes", "Yes", "Yes", "Yes"),
        ]
    }

    for sheet_title, rows in features_data.items():
        ws = wb.create_sheet(title=sheet_title)
        ws.append(headers)

        ws.row_dimensions[1].height = 26
        for c in range(1, len(headers) + 1):
            cell = ws.cell(row=1, column=c)
            cell.font = header_font
            cell.fill = header_fill
            cell.alignment = align_left if c == 1 else align_center
            cell.border = cell_border

        for row_data in rows:
            ws.append(list(row_data))

        apply_table_styles(ws, 2, 1 + len(rows), len(headers))
        ws.column_dimensions['A'].width = 46
        for col_ch in ['B', 'C', 'D', 'E', 'F']:
            ws.column_dimensions[col_ch].width = 18
        ws.freeze_panes = "A2"

    if "Sheet" in wb.sheetnames:
        del wb["Sheet"]

    dest_file = os.path.join(TARGET_DIR, "Features.xlsx")
    wb.save(dest_file)
    print(f"Created: {dest_file}")

# ==============================================================================
# 3. CREATE "Price-Ex-ShowRoom.xlsx"
# ==============================================================================
def create_price_workbook():
    wb = openpyxl.Workbook()
    cols = ["Variant Name", "Engine", "Transmission", "Ex-Showroom Price (INR)", "Ex-Showroom (Lakh)", "Est. On-Road Delhi (INR)"]

    price_rows = [
        ("Slavia 1.0L Classic MT", "1.0L TSI Petrol", "Manual", 999900, 10.00, 1152638),
        ("Slavia 1.0L Signature MT", "1.0L TSI Petrol", "Manual", 1344000, 13.44, 1586000),
        ("Slavia 1.0L Sportline MT", "1.0L TSI Petrol", "Manual", 1374000, 13.74, 1595000),
        ("Slavia 1.0L Signature AT", "1.0L TSI Petrol", "Automatic (6-AT)", 1444000, 14.44, 1700000),
        ("Slavia 1.0L Sportline AT", "1.0L TSI Petrol", "Automatic (6-AT)", 1474000, 14.74, 1709000),
        ("Slavia 1.0L Monte Carlo MT", "1.0L TSI Petrol", "Manual", 1499900, 15.00, 1741260),
        ("Slavia 1.0L Prestige MT", "1.0L TSI Petrol", "Manual", 1544000, 15.44, 1818000),
        ("Slavia 1.5L Sportline DSG", "1.5L TSI Petrol", "Automatic (7-DSG)", 1619000, 16.19, 1883000),
        ("Slavia 1.0L Prestige AT", "1.0L TSI Petrol", "Automatic (6-AT)", 1654000, 16.54, 1943000),
        ("Slavia 1.0L Monte Carlo AT", "1.0L TSI Petrol", "Automatic (6-AT)", 1679000, 16.79, 1947000),
        ("Slavia 1.5L Prestige DSG", "1.5L TSI Petrol", "Automatic (7-DSG)", 1804000, 18.04, 2123000),
        ("Slavia 1.5L Monte Carlo DSG", "1.5L TSI Petrol", "Automatic (7-DSG)", 1829000, 18.29, 2126000)
    ]

    ws = wb.create_sheet(title="Slavia Price List")
    ws.append(cols)

    ws.row_dimensions[1].height = 26
    for c in range(1, len(cols) + 1):
        cell = ws.cell(row=1, column=c)
        cell.font = header_font
        cell.fill = header_fill
        cell.alignment = align_center
        cell.border = cell_border

    for r_idx, rdata in enumerate(price_rows, start=2):
        ws.append(list(rdata))
        ws.row_dimensions[r_idx].height = 22
        current_fill = zebra_fill if r_idx % 2 == 0 else white_fill
        for c_idx in range(1, len(rdata) + 1):
            cell = ws.cell(row=r_idx, column=c_idx)
            cell.fill = current_fill
            cell.border = cell_border
            if c_idx == 1:
                cell.font = bold_font
                cell.alignment = align_left
            elif c_idx in (2, 3):
                cell.font = cell_font
                cell.alignment = align_center
            elif c_idx in (4, 6):
                cell.font = price_font
                cell.alignment = align_right
                cell.number_format = '₹ #,##,##0'
            elif c_idx == 5:
                cell.font = bold_font
                cell.alignment = align_right
                cell.number_format = '0.00 "Lakh"'

    ws.column_dimensions['A'].width = 32
    ws.column_dimensions['B'].width = 20
    ws.column_dimensions['C'].width = 22
    ws.column_dimensions['D'].width = 24
    ws.column_dimensions['E'].width = 20
    ws.column_dimensions['F'].width = 26
    ws.freeze_panes = "A2"

    if "Sheet" in wb.sheetnames:
        del wb["Sheet"]

    dest_file = os.path.join(TARGET_DIR, "Price-Ex-ShowRoom.xlsx")
    wb.save(dest_file)
    print(f"Created: {dest_file}")

# ==============================================================================
# MAIN EXECUTION
# ==============================================================================
if __name__ == "__main__":
    print(f"Generating Skoda Slavia technical workbooks in:\n  {TARGET_DIR}\n")
    create_engine_workbook()
    create_features_workbook()
    create_price_workbook()
    print("\nAll workbooks successfully created.")