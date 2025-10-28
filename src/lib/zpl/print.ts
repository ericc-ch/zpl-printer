import type { PrintOptions, ZPLPrintResult } from './types';
import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { validateZPLContent, validatePrintOptions } from './utils';

async function createTempZPLFile(content: string): Promise<string> {
  const timestamp = Date.now();
  const filename = `zpl-${timestamp}.zpl`;
  const filepath = join(tmpdir(), filename);
  
  await writeFile(filepath, content, 'utf8');
  return filepath;
}

export async function printZPLContent(
  content: unknown, 
  options: unknown
): Promise<ZPLPrintResult> {
  const contentValidation = validateZPLContent(content);
  if (!contentValidation.success) {
    return {
      success: false,
      error: contentValidation.error.message
    };
  }

  const optionsValidation = validatePrintOptions(options);
  if (!optionsValidation.success) {
    return {
      success: false,
      error: optionsValidation.error.message
    };
  }

  try {
    console.log('=== ZPL Code to Print ===');
    console.log(contentValidation.data);
    console.log('=== End ZPL Code ===');
    
    const tempFile = await createTempZPLFile(contentValidation.data);
    return await printZPLFile(tempFile, optionsValidation.data);
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error creating temp file'
    };
  }
}

export async function printZPLFile(
  filePath: string, 
  options: PrintOptions
): Promise<ZPLPrintResult> {
  try {
    // Check if this is a dummy printer (no actual printing)
    if (options.shareName === 'DUMMY' || options.hostname === 'DUMMY') {
      console.log('=== DUMMY PRINTER MODE ===');
      console.log('No actual print will be sent. ZPL code has been logged above.');
      console.log('Copy the ZPL code and test it at: http://labelary.com/viewer.html');
      console.log('=== END DUMMY PRINTER MODE ===');
      
      return {
        success: true,
        message: 'ZPL code generated successfully (DUMMY mode - check console for ZPL code)'
      };
    }
    
    const printerPath = `\\\\${options.hostname}\\${options.shareName}`;

    const fileExists = await Bun.file(filePath).exists();
    const fileSize = fileExists ? (await Bun.file(filePath).text()).length : 0;

    console.log('Before print:', { 
      filePath, 
      fileExists, 
      fileSize,
      printerPath 
    });

    const { exitCode, stderr, stdout } = Bun.spawnSync({
      cmd: [
        'cmd', '/c', 'copy',
        '/B',
        filePath,
        printerPath
      ]
    });

    console.log('Print result:', {
      exitCode,
      stderr: stderr.toString(),
      stdout: stdout.toString(),
    });
    
    if (exitCode === 0) {
      return {
        success: true,
        message: 'Print job sent successfully'
      };
    } else {
      return {
        success: false,
        error: `Print command failed with exit code ${exitCode}: ${stderr.toString()}`
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error printing file'
    };
  }
}