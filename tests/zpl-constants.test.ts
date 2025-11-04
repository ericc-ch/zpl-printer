import { describe, it, expect } from "bun:test";
import { 
  LABEL_SPECS, 
  calculateColumnXOffset, 
  calculatePrintWidth, 
  calculateLabelLength 
} from "../src/lib/zpl/constants";

describe("ZPL Constants", () => {
  describe("LABEL_SPECS", () => {
    it("should have correct DPI and dots per mm", () => {
      expect(LABEL_SPECS.DPI).toBe(300);
      expect(LABEL_SPECS.DOTS_PER_MM).toBe(11.8);
    });

    it("should have correct label dimensions in mm", () => {
      expect(LABEL_SPECS.LABEL_WIDTH_MM).toBe(33);
      expect(LABEL_SPECS.LABEL_HEIGHT_MM).toBe(15);
      expect(LABEL_SPECS.HORIZONTAL_GAP_MM).toBe(2);
      expect(LABEL_SPECS.VERTICAL_GAP_MM).toBe(1.5);
    });

    it("should have correct label dimensions in dots", () => {
      expect(LABEL_SPECS.LABEL_WIDTH_DOTS).toBe(390);
      expect(LABEL_SPECS.LABEL_HEIGHT_DOTS).toBe(177);
      expect(LABEL_SPECS.HORIZONTAL_GAP_DOTS).toBe(24);
      expect(LABEL_SPECS.VERTICAL_GAP_DOTS).toBe(35);
    });

    it("should have correct QR and text specifications", () => {
      expect(LABEL_SPECS.QR_MAGNIFICATION).toBe(3);
      expect(LABEL_SPECS.TEXT_FONT).toBe("0N,24,24");
      expect(LABEL_SPECS.ENCODING).toBe(28);
    });


  });

  describe("calculateColumnXOffset", () => {
    it("should return 0 for first column", () => {
      expect(calculateColumnXOffset(0)).toBe(0);
    });

    it("should calculate correct offset for subsequent columns", () => {
      const labelWidth = LABEL_SPECS.LABEL_WIDTH_DOTS;
      const gapWidth = LABEL_SPECS.HORIZONTAL_GAP_DOTS;
      
      expect(calculateColumnXOffset(1)).toBe(labelWidth + gapWidth); // 390 + 24 = 414
      expect(calculateColumnXOffset(2)).toBe(2 * (labelWidth + gapWidth)); // 2 * 414 = 828
      expect(calculateColumnXOffset(3)).toBe(3 * (labelWidth + gapWidth)); // 3 * 414 = 1242
    });

    it("should handle large column indices", () => {
      const result = calculateColumnXOffset(10);
      const expected = 10 * (LABEL_SPECS.LABEL_WIDTH_DOTS + LABEL_SPECS.HORIZONTAL_GAP_DOTS);
      expect(result).toBe(expected);
    });
  });

  describe("calculatePrintWidth", () => {
    it("should calculate correct width for single column", () => {
      expect(calculatePrintWidth(1)).toBe(LABEL_SPECS.LABEL_WIDTH_DOTS); // 390
    });

    it("should calculate correct width for multiple columns", () => {
      const labelWidth = LABEL_SPECS.LABEL_WIDTH_DOTS;
      const gapWidth = LABEL_SPECS.HORIZONTAL_GAP_DOTS;
      
      expect(calculatePrintWidth(2)).toBe(2 * labelWidth + 1 * gapWidth); // 2*390 + 1*24 = 804
      expect(calculatePrintWidth(3)).toBe(3 * labelWidth + 2 * gapWidth); // 3*390 + 2*24 = 1218
      expect(calculatePrintWidth(4)).toBe(4 * labelWidth + 3 * gapWidth); // 4*390 + 3*24 = 1632
    });



    it("should handle large number of columns", () => {
      const columns = 10;
      const expected = columns * LABEL_SPECS.LABEL_WIDTH_DOTS + (columns - 1) * LABEL_SPECS.HORIZONTAL_GAP_DOTS;
      expect(calculatePrintWidth(columns)).toBe(expected);
    });
  });

  describe("calculateLabelLength", () => {
    it("should return label height plus vertical gap", () => {
      const expected = LABEL_SPECS.LABEL_HEIGHT_DOTS + LABEL_SPECS.VERTICAL_GAP_DOTS;
      expect(calculateLabelLength()).toBe(expected); // 177 + 35 = 212
    });

    it("should return consistent value", () => {
      const result1 = calculateLabelLength();
      const result2 = calculateLabelLength();
      expect(result1).toBe(result2);
    });
  });
});