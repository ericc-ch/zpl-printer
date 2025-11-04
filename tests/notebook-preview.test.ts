import { describe, it, expect } from "bun:test";
import { generateZpl, type LabelData } from "../src/lib/zpl/generator";

// Dictionary of realistic words with their lengths
const WORDS = [
  { word: "ASSET", length: 5 },
  { word: "NOTEBOOK", length: 8 },
  { word: "LAPTOP", length: 6 },
  { word: "DEVICE", length: 6 },
  { word: "PRODUCT", length: 7 },
  { word: "SERIAL", length: 6 },
  { word: "TAG", length: 3 },
  { word: "ID", length: 2 },
  { word: "CODE", length: 4 },
  { word: "NUM", length: 3 },
  { word: "HP", length: 2 },
  { word: "DELL", length: 4 },
  { word: "LENOVO", length: 6 },
  { word: "PROC", length: 4 },
  { word: "CPU", length: 3 },
  { word: "AMD", length: 3 },
  { word: "INTEL", length: 5 },
  { word: "RYZEN", length: 5 },
  { word: "CORE", length: 4 },
  { word: "RAM", length: 3 },
  { word: "MEM", length: 3 },
  { word: "STORAGE", length: 7 },
  { word: "SSD", length: 3 },
  { word: "HDD", length: 3 },
  { word: "NVME", length: 4 },
  { word: "OS", length: 2 },
  { word: "WIN", length: 3 },
  { word: "LINUX", length: 5 },
  { word: "DEPT", length: 4 },
  { word: "IT", length: 2 },
  { word: "USER", length: 4 },
  { word: "ADMIN", length: 5 },
  { word: "LOC", length: 3 },
  { word: "OFFICE", length: 6 },
  { word: "ROOM", length: 4 },
  { word: "BUILD", length: 5 },
  { word: "FLOOR", length: 5 },
  { word: "ZONE", length: 4 },
  { word: "AREA", length: 4 },
  { word: "WARRANTY", length: 8 },
  { word: "DATE", length: 4 },
  { word: "YEAR", length: 4 },
  { word: "MONTH", length: 5 },
];

// Separators with their lengths
const SEPARATORS = [
  { sep: "-", length: 1 },
  { sep: "_", length: 1 },
  { sep: "|", length: 1 },
  { sep: ":", length: 1 },
];

function generateRealisticString(targetLength: number): string {
  let result = "";
  let currentLength = 0;
  
  while (currentLength < targetLength) {
    const remainingLength = targetLength - currentLength;
    
    // Find words that can fit in the remaining space
    const fittingWords = WORDS.filter(w => w.length <= remainingLength);
    if (fittingWords.length === 0) break;
    
    const randomWord = fittingWords[Math.floor(Math.random() * fittingWords.length)];
    if (!randomWord) break;
    
    result += randomWord.word;
    currentLength += randomWord.length;
    
    // Add separator if we have space for at least 1 more character
    if (currentLength < targetLength) {
      const randomSep = SEPARATORS[Math.floor(Math.random() * SEPARATORS.length)];
      if (!randomSep) break;
      result += randomSep.sep;
      currentLength += randomSep.length;
    }
  }
  
  // If we're short, pad with random characters to reach exact length
  while (currentLength < targetLength) {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    result += chars[Math.floor(Math.random() * chars.length)];
    currentLength++;
  }
  
  return result;
}

describe("Notebook ZPL Preview", () => {
  it("should preview ZPL for specific notebook string", () => {
    const notebookLabel: LabelData = {
      qrCode:
        "NOTEBOOK HP PROBOOK 445 G10 ( Processor AMD Ryzen 5 7530U, RAM 16 GB, SSD SSD 512 GB, Operating System Windows 11 Pro ) | 40-1A-58-EA-CD-A2",
      line1: "NOTEBOOK HP PROBOOK 445 G10",
      line2: "Processor AMD Ryzen 5 7530U",
      line3: "40-1A-58-EA-CD-A2",
    };

    const zpl = generateZpl({ labels: [notebookLabel], columns: 1 });

    console.log("\n=== PREVIEW: ZPL CODE FOR SPECIFIC NOTEBOOK STRING ===");
    console.log(zpl);
    console.log("=== END PREVIEW ===");
    console.log("QR Code string length:", notebookLabel.qrCode.length);

    expect(zpl).toContain("^XA");
    expect(zpl).toContain("^XZ");
    expect(zpl).toContain("^BQN,2,3"); // Long string (140 chars) should use magnification 3
  });

  it("should preview ZPL for smaller notebook string", () => {
    const notebookLabel: LabelData = {
      qrCode:
        "NOTEBOOK HP ( Processor AMD Ryzen 5 7530U Operating System Windows 11 ) | 40-1A-58-EA-CD",
      line1: "NOTEBOOK HP",
      line2: "Processor AMD Ryzen 5 7530U",
      line3: "40-1A-58-EA-CD-A2",
    };

    const zpl = generateZpl({ labels: [notebookLabel], columns: 1 });

    console.log("\n=== PREVIEW: ZPL CODE FOR SMALLER NOTEBOOK STRING ===");
    console.log(zpl);
    console.log("=== END PREVIEW ===");
    console.log("QR Code string length:", notebookLabel.qrCode.length);

    expect(zpl).toContain("^XA");
    expect(zpl).toContain("^XZ");
    expect(zpl).toContain("^BQN,2,4"); // Short string (89 chars) should use magnification 4
  });

  it("should use magnification 3 for exactly 140 characters", () => {
    const exactLongLabel: LabelData = {
      qrCode: generateRealisticString(140),
      line1: "Exact 140 chars",
      line2: "Should use mag 3",
      line3: "Boundary test",
    };

    const zpl = generateZpl({ labels: [exactLongLabel], columns: 1 });

    console.log("\n=== PREVIEW: EXACTLY 140 CHARACTERS ===");
    console.log(zpl);
    console.log("QR Code string length:", exactLongLabel.qrCode.length);
    console.log("QR Code content:", exactLongLabel.qrCode);

    expect(exactLongLabel.qrCode.length).toBe(140); // Verify exact length
    expect(zpl).toContain("^BQN,2,3"); // Exactly 140 chars should use magnification 3
  });

  it("should use magnification 4 for exactly 90 characters", () => {
    const exactShortLabel: LabelData = {
      qrCode: generateRealisticString(90),
      line1: "Exact 90 chars",
      line2: "Should use mag 4",
      line3: "Boundary test",
    };

    const zpl = generateZpl({ labels: [exactShortLabel], columns: 1 });

    console.log("\n=== PREVIEW: EXACTLY 90 CHARACTERS ===");
    console.log(zpl);
    console.log("QR Code string length:", exactShortLabel.qrCode.length);
    console.log("QR Code content:", exactShortLabel.qrCode);

    expect(exactShortLabel.qrCode.length).toBe(90); // Verify exact length
    expect(zpl).toContain("^BQN,2,4"); // Exactly 90 chars should use magnification 4
  });

  it("should use magnification 3 for medium length strings (115 characters)", () => {
    const mediumLabel: LabelData = {
      qrCode: generateRealisticString(115),
      line1: "Medium 115 chars",
      line2: "Should use mag 3",
      line3: "Default case",
    };

    const zpl = generateZpl({ labels: [mediumLabel], columns: 1 });

    console.log("\n=== PREVIEW: MEDIUM 115 CHARACTERS ===");
    console.log(zpl);
    console.log("QR Code string length:", mediumLabel.qrCode.length);
    console.log("QR Code content:", mediumLabel.qrCode);

    expect(mediumLabel.qrCode.length).toBe(115); // Verify exact length
    expect(zpl).toContain("^BQN,2,3"); // Medium length should use default magnification 3
  });
});
