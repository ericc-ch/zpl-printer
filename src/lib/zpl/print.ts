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
    const { exitCode, stderr } = Bun.spawnSync({
      cmd: [
        'cmd', '/c', 'print',
        `/d:\\\\${options.hostname}\\${options.shareName}`,
        `"${filePath}"`
      ]
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