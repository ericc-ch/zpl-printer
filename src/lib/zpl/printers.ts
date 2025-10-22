import type { Printer } from './types';

function parsePrinterOutput(output: string): Printer[] {
  const lines = output.trim().split('\n');
  const printers: Printer[] = [];
  
  // Skip header line and empty lines
  const dataLines = lines.slice(1).filter(line => line.trim());
  
  for (const line of dataLines) {
    // WMIC output has variable spacing, so we need to parse carefully
    const parts = line.trim().split(/\s{2,}/);
    
    if (parts.length >= 3) {
      const isDefault = parts[0]?.toUpperCase() === 'TRUE';
      const name = parts[1];
      const portName = parts[2];
      
      if (name && portName) {
        printers.push({
          name: name.trim(),
          portName: portName.trim(),
          isDefault
        });
      }
    }
  }
  
  return printers;
}

export function listPrinters(): Printer[] {
  const { stdout } = Bun.spawnSync({
    cmd: ['cmd', '/c', 'wmic', 'printer', 'get', 'Name,PortName,Default']
  });
  
  const text = stdout.toString();
  return parsePrinterOutput(text);
}

export function findPrinterByName(name: string): Printer | null {
  const printers = listPrinters();
  return printers.find(printer => 
    printer.name.toLowerCase().includes(name.toLowerCase())
  ) || null;
}

export function getDefaultPrinter(): Printer | null {
  const printers = listPrinters();
  return printers.find(printer => printer.isDefault) || null;
}