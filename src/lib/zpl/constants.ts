export const LABEL_SPECS = {
  DPI: 300,
  DOTS_PER_MM: 11.8,

  LABEL_WIDTH_MM: 33,
  LABEL_HEIGHT_MM: 15,
  HORIZONTAL_GAP_MM: 2,
  VERTICAL_GAP_MM: 1.5,

  LABEL_WIDTH_DOTS: 390,
  LABEL_HEIGHT_DOTS: 177,
  HORIZONTAL_GAP_DOTS: 24,
  VERTICAL_GAP_DOTS: 35,

  QR_MAGNIFICATION: 3,
  TEXT_FONT: "0N,24,24",
  ENCODING: 28,
} as const;

export function calculateColumnXOffset(columnIndex: number): number {
  return (
    columnIndex *
    (LABEL_SPECS.LABEL_WIDTH_DOTS + LABEL_SPECS.HORIZONTAL_GAP_DOTS)
  );
}

export function calculatePrintWidth(columns: number): number {
  return (
    LABEL_SPECS.LABEL_WIDTH_DOTS * columns +
    LABEL_SPECS.HORIZONTAL_GAP_DOTS * (columns - 1)
  );
}

export function calculateLabelLength(): number {
  return LABEL_SPECS.LABEL_HEIGHT_DOTS + LABEL_SPECS.VERTICAL_GAP_DOTS;
}

export function calculateQRMagnification(qrCodeLength: number): number {
  if (qrCodeLength >= 140) return 3;  // Long strings
  if (qrCodeLength <= 90) return 4;   // Short strings  
  return 3; // Default for medium strings
}
