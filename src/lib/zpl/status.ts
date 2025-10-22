import type { PrinterStatus } from './types';
import { PRINTER_STATUS_MAP } from './types';

function parseStatusOutput(output: string, printerName: string): PrinterStatus | null {
  const lines = output.trim().split('\n');
  
  // Find the line with our printer name
  const printerLine = lines.find(line => 
    line.toLowerCase().includes(printerName.toLowerCase())
  );
  
  if (!printerLine) {
    return null;
  }
  
  // Parse the status code (last number on the line)
  const parts = printerLine.trim().split(/\s+/);
  const statusCodeStr = parts[parts.length - 1];
  if (!statusCodeStr) return null;
  const statusCode = parseInt(statusCodeStr, 10);
  
  if (isNaN(statusCode)) {
    return null;
  }
  
  const statusInfo = PRINTER_STATUS_MAP[statusCode] || {
    status: 'unknown' as const,
    description: 'Unknown status code'
  };
  
  return {
    name: printerName,
    statusCode,
    status: statusInfo.status,
    description: statusInfo.description
  };
}

export function getPrinterStatus(printerName: string): PrinterStatus | null {
  const { stdout } = Bun.spawnSync({
    cmd: [
      'cmd', '/c', 'wmic', 'printer',
      `where "Name='${printerName}'"`,
      'get', 'Name,PrinterStatus'
    ]
  });
  
  const text = stdout.toString();
  return parseStatusOutput(text, printerName);
}

export function isPrinterReady(status: PrinterStatus): boolean {
  return status.status === 'idle';
}

export function isPrinterError(status: PrinterStatus): boolean {
  return status.status === 'error' || status.status === 'offline';
}

export function isPrinterPrinting(status: PrinterStatus): boolean {
  return status.status === 'printing';
}