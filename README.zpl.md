How to Print in 3 Columns with ZPL

The core concept is to define a single print format (^XA...^XZ) that describes one entire row of three labels. You use the ^FO (Field Origin) command to set the top-left (X,Y) coordinate for each piece of data (each QR code, each line of text).

Here is the breakdown of the logic used in the .zpl file:

1. Calculations (300 dpi)

First, we must convert your millimeter measurements into "dots," which is what ZPL uses for coordinates.

Printer Resolution: 300 dpi (dots per inch)

Dots per mm: 300 dpi / 25.4 mm/inch = ~11.81 dots/mm (We'll round slightly for cleaner numbers, e.g., 11.8)

Label Width: 33mm * 11.8 = ~390 dots

Label Height: 15mm * 11.8 = ~177 dots

Horizontal Gap (between columns, X-axis): 2mm * 11.8 = ~24 dots

Vertical Gap (between rows, Y-axis): 3mm * 11.8 = ~35 dots

2. Format & Label Size Commands

^PW1218: Print Width. This is the total width of the entire row.
(390 dots * 3 labels) + (24 dots * 2 gaps) = 1170 + 48 = 1218 dots

^LL212: Label Length. This is the height of one label PLUS the gap below it. This tells the printer how far to feed the paper to be ready for the next row.
(177 dots label height + 35 dots row gap) = 212 dots

^LH0,0: Label Home. We set the starting (0,0) coordinate to the top-left corner of the entire 3-label row.

3. The Coordinate Strategy (The "Columns")

We manually calculate the starting X-coordinate for each column:

Column 1: Starts at X = 0

Column 2: Starts at X = 414 (Label 1 width 390 + Gap 24)

Column 3: Starts at X = 828 (Column 2 start 414 + Label 2 width 390 + Gap 24)

When we place an element (like a QR code at ^FO20,25) in Column 1, we place the same element in Column 2 at ^FO434,25 (which is 414 + 20) and in Column 3 at ^FO848,25 (which is 828 + 20).

4. How Your App Should Use This

Your application needs to generate this entire ZPL block for each row it wants to print.

If you are printing a batch of 9 labels (3 rows), your app would:

Generate this ZPL block with the data for Row 1 (Labels 1, 2, 3).

Send the ZPL to the printer.

Generate this ZPL block again with the data for Row 2 (Labels 4, 5, 6).

Send the ZPL to the printer.

Generate this ZPL block again with the data for Row 3 (Labels 7, 8, 9).

Send the ZPL to the printer.

In the example file, I have used placeholder data (...J6T, ...J6U, ...J6V) to show how you would print different data on each label within the same row.

---

^XA
^FX --- This ZPL command block prints ONE ROW of 3 labels. ---
^FX --- QR code magnification increased from 6 to 7. ---
^FX --- All elements shifted "higher" (Y-coord decreased). ---
^FX --- Text X/Y-coordinates adjusted to fit larger QR. ---
^FX --- Moved up 2 more dots (Y-coord - 2) ---

^FX --- 1. SETTINGS ---
^FX --- Set Print Width to 3 labels + 2 gaps ---
^FX --- (3 * 33mm) + (2 * 2mm) = 103mm = ~1218 dots @ 300dpi ---
^PW1218

^FX --- Set Label Length to 1 label + 1 gap ---
^FX --- 15mm + 3mm = 18mm = ~212 dots @ 300dpi ---
^LL212

^FX --- Set Label Home (0,0) ---
^LH0,0

^FX --- Set UTF-8 encoding (good practice) ---
^CI28

^FX --- 2. LABEL 1 (COLUMN 1) DATA ---
^FX --- Origin X=0 ---
^FO20,19^BQN,2,7^FDQA,5CD4392J6T^FS
^FO190,34^A0N,28,28^FDIT-BNS^FS
^FO190,74^A0N,28,28^FDAST-002-00291^FS
^FO190,114^A0N,28,28^FD5CD4392J6T^FS

^FX --- 3. LABEL 2 (COLUMN 2) DATA ---
^FX --- Origin X=414 (390 label + 24 gap) ---
^FX --- X-coordinates are all +414 from Label 1 ---
^FO434,19^BQN,2,7^FDQA,5CD4392J6U^FS
^FO604,34^A0N,28,28^FDIT-BNS^FS
^FO604,74^A0N,28,28^FDAST-002-00292^FS
^FO604,114^A0N,28,28^FD5CD4392J6U^FS

^FX --- 4. LABEL 3 (COLUMN 3) DATA ---
^FX --- Origin X=828 (414 + 390 + 24) ---
^FX --- X-coordinates are all +828 from Label 1 ---
^FO848,19^BQN,2,7^FDQA,5CD4392J6V^FS
^FO1018,34^A0N,28,28^FDIT-BNS^FS
^FO1018,74^A0N,28,28^FDAST-002-00293^FS
^FO1018,114^A0N,28,28^FD5CD4392J6V^FS

^FX --- 5. PRINT ---
^FX --- Print 1 copy of this 3-label format ---
^PQ1,0,1,Y

^XZ
