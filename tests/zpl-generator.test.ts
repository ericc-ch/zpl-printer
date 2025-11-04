import { describe, it, expect } from "bun:test";
import { generateZpl, type LabelData } from "../src/lib/zpl/generator";

describe("ZPL Generator", () => {
  const sampleLabels: LabelData[] = [
    {
      qrCode: "TEST123",
      line1: "Product A",
      line2: "SKU: ABC-001",
      line3: "Location: A1-B2"
    },
    {
      qrCode: "TEST456",
      line1: "Product B",
      line2: "SKU: DEF-002",
      line3: "Location: C3-D4"
    }
  ];

  describe("generateZpl", () => {
    it("should generate valid ZPL code for single column", () => {
      const zpl = generateZpl({ labels: sampleLabels.slice(0, 1), columns: 1 });
      
      expect(zpl).toContain("^XA");
      expect(zpl).toContain("^XZ");
      expect(zpl).toContain("^PW390"); // Single column width
      expect(zpl).toContain("^LL212"); // Label length + vertical gap
      expect(zpl).toContain("^CI28"); // Encoding
      expect(zpl).toContain("^PQ1,0,1,Y"); // Print quantity
    });

    it("should generate valid ZPL code for multiple columns", () => {
      const zpl = generateZpl({ labels: sampleLabels, columns: 2 });
      
      expect(zpl).toContain("^PW804"); // 2 columns: 390*2 + 24*1 = 804
      expect(zpl).toContain("^LL212");
      expect(zpl).toContain("^CI28");
    });

    it("should handle multiple rows when labels exceed column count", () => {
      const threeLabels = [...sampleLabels, {
        qrCode: "TEST789",
        line1: "Product C",
        line2: "SKU: GHI-003",
        line3: "Location: E5-F6"
      }];
      
      const zpl = generateZpl({ labels: threeLabels, columns: 2 });
      
      // Should have two complete ZPL blocks for two rows
      const zplBlocks = zpl.split("^XZ").filter(block => block.trim());
      expect(zplBlocks).toHaveLength(2);
      
      // Each block should start with ^XA and end with proper formatting
      zplBlocks.forEach(block => {
        expect(block).toContain("^XA");
        expect(block).toContain("^PW");
        expect(block).toContain("^LL");
      });
    });



    it("should position elements correctly for single column", () => {
      const zpl = generateZpl({ labels: sampleLabels.slice(0, 1), columns: 1 });
      
      // QR code position (xOffset + 20, 3)
      expect(zpl).toContain("^FO20,3");
      
      // Text lines positions (xOffset + 190, various y positions)
      expect(zpl).toContain("^FO190,46"); // Line 1
      expect(zpl).toContain("^FO190,86"); // Line 2
      expect(zpl).toContain("^FO190,126"); // Line 3
    });

    it("should position elements correctly for multiple columns", () => {
      const zpl = generateZpl({ labels: sampleLabels, columns: 2 });
      
      // First label (column 0): xOffset = 0
      expect(zpl).toContain("^FO20,3"); // QR code column 0
      expect(zpl).toContain("^FO190,46"); // Text column 0
      
      // Second label (column 1): xOffset = 414 (390 + 24)
      expect(zpl).toContain("^FO434,3"); // QR code column 1 (414 + 20)
      expect(zpl).toContain("^FO604,46"); // Text column 1 (414 + 190)
    });

    it("should include all text lines with proper formatting", () => {
      const zpl = generateZpl({ labels: sampleLabels.slice(0, 1), columns: 1 });
      
      expect(zpl).toContain("^FDProduct A^FS");
      expect(zpl).toContain("^FDSKU: ABC-001^FS");
      expect(zpl).toContain("^FDLocation: A1-B2^FS");
      
      // Should use the correct font and field block formatting
      expect(zpl).toContain("^A0N,24,24^FB200,5,0,L,0");
    });



    it("should handle labels with empty strings", () => {
      const emptyStringLabel: LabelData = {
        qrCode: "",
        line1: "",
        line2: "",
        line3: ""
      };
      
      const zpl = generateZpl({ labels: [emptyStringLabel], columns: 1 });
      
      expect(zpl).toContain("^FDQA,^FS"); // Empty QR code
      expect(zpl).toContain("^FD^FS"); // Empty text lines
    });

    it("should handle special characters in label data", () => {
      const specialLabel: LabelData = {
        qrCode: "TEST-123_456",
        line1: "Product & Co.",
        line2: "SKU: ABC/DEF",
        line3: "Location: A1-B2 (Zone 1)"
      };
      
      const zpl = generateZpl({ labels: [specialLabel], columns: 1 });
      
      expect(zpl).toContain("^FDQA,TEST-123_456^FS");
      expect(zpl).toContain("^FDProduct & Co.^FS");
      expect(zpl).toContain("^FDLocation: A1-B2 (Zone 1)^FS");
    });

    it("should generate consistent output for same input", () => {
      const zpl1 = generateZpl({ labels: sampleLabels, columns: 2 });
      const zpl2 = generateZpl({ labels: sampleLabels, columns: 2 });
      
      expect(zpl1).toBe(zpl2);
    });

    it("should handle long notebook string with special characters", () => {
      const notebookLabel: LabelData = {
        qrCode: "NOTEBOOK HP PROBOOK 445 G10 ( Processor AMD Ryzen 5 7530U, RAM 16 GB, SSD SSD 512 GB, Operating System Windows 11 Pro) | 40-1A-58-EA-CD-A2",
        line1: "NOTEBOOK HP PROBOOK 445 G10",
        line2: "Processor AMD Ryzen 5 7530U",
        line3: "40-1A-58-EA-CD-A2"
      };
      
      const zpl = generateZpl({ labels: [notebookLabel], columns: 1 });
      
      // Log the generated ZPL for inspection
      console.log("\n=== ZPL CODE FOR NOTEBOOK STRING ===");
      console.log(zpl);
      console.log("QR Code string length:", notebookLabel.qrCode.length);
      
      // Verify the ZPL contains all expected elements
      expect(zpl).toContain("^XA");
      expect(zpl).toContain("^XZ");
      expect(zpl).toContain("^PW390");
      expect(zpl).toContain("^LL212");
      expect(zpl).toContain("^CI28");
      expect(zpl).toContain("^PQ1,0,1,Y");
      
      // Verify QR code with default error correction and the long string
      expect(zpl).toContain("^FDQA,NOTEBOOK HP PROBOOK 445 G10 ( Processor AMD Ryzen 5 7530U, RAM 16 GB, SSD SSD 512 GB, Operating System Windows 11 Pro) | 40-1A-58-EA-CD-A2^FS");
      expect(zpl).toContain("^BQN,2,3");
      
      // Verify text lines
      expect(zpl).toContain("^FDNOTEBOOK HP PROBOOK 445 G10^FS");
      expect(zpl).toContain("^FDProcessor AMD Ryzen 5 7530U^FS");
      expect(zpl).toContain("^FD40-1A-58-EA-CD-A2^FS");
      
      // Verify positioning
      expect(zpl).toContain("^FO20,3"); // QR code position
      expect(zpl).toContain("^FO190,46"); // Line 1 position
      expect(zpl).toContain("^FO190,86"); // Line 2 position
      expect(zpl).toContain("^FO190,126"); // Line 3 position
    });


  });
});