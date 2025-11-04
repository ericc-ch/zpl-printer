import {
  LABEL_SPECS,
  calculateColumnXOffset,
  calculatePrintWidth,
  calculateLabelLength,
  calculateQRMagnification,
} from "./constants";

export interface LabelData {
  qrCode: string;
  line1: string;
  line2: string;
  line3: string;
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
  const { labels, columns } = options;
  const rows = chunkArray(labels, columns);
  
  const zplBlocks = rows.map((rowLabels) => generateRowZpl(rowLabels, columns));
  const zplCode = zplBlocks.join('');
  
  console.log('=== Generated ZPL Code ===');
  console.log(zplCode);
  console.log('=== End ZPL Code ===');
  
  return zplCode;
}

function generateRowZpl(rowLabels: LabelData[], columns: number): string {
  const printWidth = calculatePrintWidth(columns);
  const labelLength = calculateLabelLength();
  
  let zpl = '^XA\n';
  zpl += `^PW${printWidth}\n`;
  zpl += `^LL${labelLength}\n`;
  zpl += '^LH0,0\n';
  zpl += `^CI${LABEL_SPECS.ENCODING}\n`;
  
  rowLabels.forEach((label, columnIndex) => {
    const xOffset = calculateColumnXOffset(columnIndex);
    zpl += generateLabelZpl(label, xOffset);
  });
  
  zpl += '^PQ1,0,1,Y\n';
  zpl += '^XZ\n';
  
  return zpl;
}

function generateLabelZpl(label: LabelData, xOffset: number): string {
  let zpl = '';
  const qrMagnification = calculateQRMagnification(label.qrCode.length);
  
  zpl += `^FO${xOffset + 20},3^BQN,2,${qrMagnification}^FDQA,${label.qrCode}^FS\n`;
  zpl += `^FO${xOffset + 190},46^A${LABEL_SPECS.TEXT_FONT}^FB200,5,0,L,0^FD${label.line1}^FS\n`;
  zpl += `^FO${xOffset + 190},86^A${LABEL_SPECS.TEXT_FONT}^FB200,5,0,L,0^FD${label.line2}^FS\n`;
  zpl += `^FO${xOffset + 190},126^A${LABEL_SPECS.TEXT_FONT}^FB200,5,0,L,0^FD${label.line3}^FS\n`;
  
  return zpl;
}
