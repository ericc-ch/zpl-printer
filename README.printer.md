Guide: Raw ZPL Printing from Node.js on Windows

This guide outlines the complete and reliable method for listing USB printers and sending raw ZPL (Zebra Programming Language) data directly to them from a Node.js application on Windows.

This method works without administrator privileges (for the app itself) and solves the common pitfalls of drivers and permissions.

The Core Concept: GDI (Graphical) vs. Raw (Passthrough) Mode

The central problem we solved is that Windows printer drivers default to GDI (Graphical) Mode. They expect a "picture" from an application (like Word or a PDF viewer) which they then translate into ZPL.

When we send a plain text .zpl file, the driver is in the wrong mode. It doesn't know how to "translate" raw text, so it either discards the job or prints a blank label (as you saw with the Test Page).

The solution is to force the driver into Raw (Passthrough) Mode. The most reliable way to do this is to share the printer and print to its network share path. This tricks Windows into thinking it's a pre-formatted network job and it sends the file's raw contents directly to the printer.

Part 1: One-Time Printer Setup (The "Share Mode" Fix)

You must do this once on any Windows machine that will run your TUI.

Find Your Computer's Hostname:

Open cmd.exe.

Run the command: hostname

Note this name (e.g., V-DS1G2-0014).

Share the Printer:

Go to Control Panel > Devices and Printers.

Right-click your Zebra printer (e.g., ZDesigner ZD421CN-300dpi ZPL).

Select Printer properties (the one in the middle of the menu, not "Properties" at the bottom).

Go to the "Sharing" tab.

Check the box "Share this printer".

Give it a simple "Share name:" (e.g., Zebra).

Click Apply, then OK.

Your printer is now ready. All commands from your Node.js app will be directed at this new "share," not the local printer name.

Part 2: How to Call CLIs from Node.js

To run these commands from your Node.js TUI, use the built-in child_process module. spawn is generally preferred over exec for better control over stdio (input/output/error) and to avoid issues with string escaping.

All of our "golden path" commands use cmd.exe, so you will spawn cmd.exe and pass the command as an argument.

import { spawn } from 'child_process';

/**
 * Spawns a cmd.exe command and captures its output.
 * @param {string[]} args - Arguments to pass to cmd.exe, e.g., ['/c', 'hostname']
 * @returns {Promise<string>} - The captured stdout data.
 */
function runCommand(args) {
  return new Promise((resolve, reject) => {
    const process = spawn('cmd.exe', args);
    let stdout = '';
    let stderr = '';

    process.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    process.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    process.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`Command failed with code ${code}: ${stderr}`));
      } else {
        resolve(stdout);
      }
    });

    process.on('error', (err) => {
      reject(err);
    });
  });
}

// Example usage:
async function getHostname() {
  try {
    const host = await runCommand(['/c', 'hostname']);
    console.log('Hostname:', host.trim());
  } catch (error) {
    console.error(error.message);
  }
}


Part 3: Command Reference (What to Spawn)

Here are the exact commands your Node.js app should spawn.

Task 1: List Printers

This command is reliable and easy to parse.

Command: wmic printer get Name,PortName,Default

Node.js Spawn:

runCommand(['/c', 'wmic', 'printer', 'get', 'Name,PortName,Default']);


Example Output (to parse):

Default  Name                          PortName
TRUE     ZDesigner ZD421CN-300dpi ZPL  USB001
FALSE    Microsoft Print to PDF        PORTPROMPT:


Task 2: Send Raw ZPL Print Job (The Golden Command)

This is the final, working command that uses the "Share Mode" path.

Command: print /d:\\<Your-Hostname>\<Your-Share-Name> "C:\path\to\your-job.zpl"

Node.js Spawn (Example):

Note: Backslashes in the path must be escaped for the cmd.exe /c argument.

const hostname = 'V-DS1G2-0014'; // Get this dynamically
const shareName = 'Zebra';       // From your setup
const filePath = 'C:\\Users\\521482\\Documents\\printjob.zpl';

const printArgs = [
  '/c',
  'print',
  `/d:\\\\${hostname}\\${shareName}`,
  `"${filePath}"`
];

// runCommand(printArgs);


Task 3: Check Printer Status (For Error Handling)

Use this command after sending a print job to see if an error occurred (e.g., offline, out of paper). The print command itself will not report these errors.

Command: wmic printer where "Name='<Printer-Name>'" get Name, PrinterStatus

Node.js Spawn (Example):

const printerName = 'ZDesigner ZD421CN-300dpi ZPL';

const statusArgs = [
  '/c',
  'wmic',
  'printer',
  `where "Name='${printerName}'"`,
  'get',
  'Name,PrinterStatus'
];

// const statusOutput = await runCommand(statusArgs);
// Parse output to find the status code


Example Output (to parse):

Name                          PrinterStatus
ZDesigner ZD421CN-300dpi ZPL  3


3: Idle (All good).

7: Offline (Printer is unplugged or off).

Other values (e.g., 4, 5): Error (Out of paper, lid open, etc.).

Part 4: Pitfalls & What to AVOID

AVOID print in PowerShell: In PowerShell, print is an alias for Out-Printer, which does not accept the /d: switch and will fail with Invalid switch. Always spawn cmd.exe to use the print command.

AVOID printing to the local name: Do NOT use print /d:"ZDesigner ZD421CN-300dpi ZPL" .... This will fail (print blank label or do nothing) because it uses the GDI driver, which is the root of the problem.

DON'T trust "is currently being printed": The print command always exits with a "success" message (e.g., ...printjob.zpl is currently being printed) even if the printer is unplugged. This message only means the job was sent to the Windows Print Spooler (the queue), not that it successfully reached the printer. Always use the "Check Printer Status" command to confirm success.
