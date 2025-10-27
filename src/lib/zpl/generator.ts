import {
  LABEL_SPECS,
  calculateColumnXOffset,
  calculatePrintWidth,
  calculateLabelLength,
} from "./constants";

export interface LabelData {
  qrCode: string;
  line1: string;
  line2: string;
}

export interface GenerateZplOptions {
  labels: LabelData[];
  columns: number;
}

function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

export function generateZpl(options: GenerateZplOptions): string {
  console.log('\n' + '='.repeat(80));
  console.log('[ZPL] Starting ZPL generation');
  console.log('[ZPL] Timestamp:', new Date().toISOString());
  console.log('='.repeat(80));
  
  const { labels, columns } = options;
  console.log('[ZPL] Number of labels:', labels.length);
  console.log('[ZPL] Columns:', columns);
  console.log('[ZPL] Labels data:', JSON.stringify(labels, null, 2));
  
  const rows = chunkArray(labels, columns);
  console.log('[ZPL] Number of rows:', rows.length);
  console.log('[ZPL] Labels per row:', rows.map(r => r.length));
  
  const zplBlocks = rows.map((rowLabels, index) => {
    console.log(`[ZPL] Generating row ${index + 1}/${rows.length}`);
    return generateRowZpl(rowLabels, columns);
  });
  
  const result = zplBlocks.join('');
  console.log('[ZPL] Total ZPL length:', result.length, 'characters');
  console.log('[ZPL] ZPL generation complete');
  console.log('='.repeat(80) + '\n');
  
  return result;
}

function generateRowZpl(rowLabels: LabelData[], columns: number): string {
  const printWidth = calculatePrintWidth(columns);
  const labelLength = calculateLabelLength();
  
  console.log('[ZPL] Row settings:');
  console.log(`[ZPL]   Print width: ${printWidth}`);
  console.log(`[ZPL]   Label length: ${labelLength}`);
  console.log(`[ZPL]   Encoding: ${LABEL_SPECS.ENCODING}`);
  
  let zpl = '^XA\n';
  zpl += `^PW${printWidth}\n`;
  zpl += `^LL${labelLength}\n`;
  zpl += '^LH0,0\n';
  zpl += `^CI${LABEL_SPECS.ENCODING}\n`;
  
  rowLabels.forEach((label, columnIndex) => {
    const xOffset = calculateColumnXOffset(columnIndex);
    console.log(`[ZPL]   Label ${columnIndex + 1}: xOffset=${xOffset}, qrCode="${label.qrCode}", line1="${label.line1}", line2="${label.line2}"`);
    zpl += generateLabelZpl(label, xOffset);
  });
  
  zpl += '^PQ1,0,1,Y\n';
  zpl += '^XZ\n';
  
  return zpl;
}

function generateLabelZpl(label: LabelData, xOffset: number): string {
  let zpl = '';
  
  // QR code positioned at left side
  zpl += `^FO${xOffset + 20},19^BQN,2,${LABEL_SPECS.QR_MAGNIFICATION}^FDQA,${label.qrCode}^FS\n`;
  
  // Text fields with wrapping support (^FB: width, max lines, line spacing, justification, hanging indent)
  zpl += `^FO${xOffset + 190},34^FB${LABEL_SPECS.TEXT_BLOCK_WIDTH},${LABEL_SPECS.TEXT_MAX_LINES},0,L,0^A${LABEL_SPECS.TEXT_FONT}^FD${label.line1}^FS\n`;
  zpl += `^FO${xOffset + 190},74^FB${LABEL_SPECS.TEXT_BLOCK_WIDTH},${LABEL_SPECS.TEXT_MAX_LINES},0,L,0^A${LABEL_SPECS.TEXT_FONT}^FD${label.line2}^FS\n`;
  
  return zpl;
}
