import type { PrintOptions, ZPLPrintResult } from './types';
import { writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import { validateZPLContent, validatePrintOptions } from './utils';

async function createTempZPLFile(content: string): Promise<string> {
  console.log('[PRINT] Creating temporary ZPL file...');
  const timestamp = Date.now();
  const filename = `zpl-${timestamp}.zpl`;
  const filepath = join(tmpdir(), filename);
  
  console.log('[PRINT] Temp file path:', filepath);
  console.log('[PRINT] ZPL Content:\n' + '='.repeat(80));
  console.log(content);
  console.log('='.repeat(80));
  
  await writeFile(filepath, content, 'utf8');
  console.log('[PRINT] Temp file written successfully');
  return filepath;
}

export async function printZPLContent(
  content: unknown, 
  options: unknown
): Promise<ZPLPrintResult> {
  console.log('\n' + '='.repeat(80));
  console.log('[PRINT] Starting print process');
  console.log('[PRINT] Timestamp:', new Date().toISOString());
  console.log('='.repeat(80));
  
  console.log('[PRINT] Validating ZPL content...');
  const contentValidation = validateZPLContent(content);
  if (!contentValidation.success) {
    console.error('[PRINT] Content validation failed:', contentValidation.error.message);
    return {
      success: false,
      error: contentValidation.error.message
    };
  }
  console.log('[PRINT] Content validation passed');

  console.log('[PRINT] Validating print options...');
  console.log('[PRINT] Options:', JSON.stringify(options, null, 2));
  const optionsValidation = validatePrintOptions(options);
  if (!optionsValidation.success) {
    console.error('[PRINT] Options validation failed:', optionsValidation.error.message);
    return {
      success: false,
      error: optionsValidation.error.message
    };
  }
  console.log('[PRINT] Options validation passed');
  console.log('[PRINT] Validated options:', JSON.stringify(optionsValidation.data, null, 2));

  try {
    const tempFile = await createTempZPLFile(contentValidation.data);
    return await printZPLFile(tempFile, optionsValidation.data);
  } catch (error) {
    console.error('[PRINT] Error during print process:', error);
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
    console.log('[PRINT] Preparing print command...');
    const printerPath = `\\\\${options.hostname}\\${options.shareName}`;
    const cmd = [
      'cmd', '/c', 'print',
      `/d:${printerPath}`,
      `"${filePath}"`
    ];
    
    console.log('[PRINT] Command:', cmd.join(' '));
    console.log('[PRINT] Printer path:', printerPath);
    console.log('[PRINT] File path:', filePath);
    console.log('[PRINT] Executing print command...');
    
    const proc = Bun.spawn({
      cmd,
      stdout: 'pipe',
      stderr: 'pipe',
    });
    
    console.log('[PRINT] Process spawned with PID:', proc.pid);
    
    // Read stdout
    const stdoutReader = proc.stdout.getReader();
    let stdoutText = '';
    while (true) {
      const { done, value } = await stdoutReader.read();
      if (done) break;
      const chunk = new TextDecoder().decode(value);
      stdoutText += chunk;
      console.log('[PRINT] [STDOUT]', chunk);
    }
    
    // Read stderr
    const stderrReader = proc.stderr.getReader();
    let stderrText = '';
    while (true) {
      const { done, value } = await stderrReader.read();
      if (done) break;
      const chunk = new TextDecoder().decode(value);
      stderrText += chunk;
      console.error('[PRINT] [STDERR]', chunk);
    }
    
    const exitCode = await proc.exited;
    
    console.log('[PRINT] Process exited with code:', exitCode);
    console.log('[PRINT] Full stdout:', stdoutText || '(empty)');
    console.log('[PRINT] Full stderr:', stderrText || '(empty)');
    
    if (exitCode === 0) {
      console.log('[PRINT] Print job sent successfully');
      console.log('='.repeat(80) + '\n');
      return {
        success: true,
        message: 'Print job sent successfully'
      };
    } else {
      console.error('[PRINT] Print command failed');
      console.log('='.repeat(80) + '\n');
      return {
        success: false,
        error: `Print command failed with exit code ${exitCode}: ${stderrText}`
      };
    }
  } catch (error) {
    console.error('[PRINT] Exception during print:', error);
    console.log('='.repeat(80) + '\n');
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error printing file'
    };
  }
}