export interface Printer {
  name: string;
  portName: string;
  isDefault: boolean;
}

export interface PrinterStatus {
  name: string;
  statusCode: number;
  status: PrinterStatusType;
  description: string;
}

export type PrinterStatusType = 'idle' | 'printing' | 'offline' | 'error' | 'unknown';

export interface PrintOptions {
  hostname: string;
  shareName: string;
}

export interface ZPLPrintResult {
  success: boolean;
  message?: string;
  error?: string;
}

export const PRINTER_STATUS_MAP: Record<number, { status: PrinterStatusType; description: string }> = {
  1: { status: 'unknown', description: 'Other' },
  2: { status: 'unknown', description: 'Unknown' },
  3: { status: 'idle', description: 'Idle' },
  4: { status: 'printing', description: 'Printing' },
  5: { status: 'printing', description: 'Warming up' },
  6: { status: 'printing', description: 'Printing' },
  7: { status: 'offline', description: 'Offline' },
  8: { status: 'error', description: 'Out of paper' },
  9: { status: 'error', description: 'Out of ink' },
  10: { status: 'error', description: 'Out of toner' },
  11: { status: 'error', description: 'Door open' },
  12: { status: 'error', description: 'Jammed' },
  13: { status: 'error', description: 'Out of memory' },
  14: { status: 'error', description: 'Output bin full' },
  15: { status: 'error', description: 'Paper problem' },
  16: { status: 'error', description: 'Cannot connect' },
  17: { status: 'error', description: 'Error' },
  18: { status: 'error', description: 'Server unknown' },
  19: { status: 'error', description: 'Power save' }
};