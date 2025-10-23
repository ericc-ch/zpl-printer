#!/usr/bin/env bun
import { existsSync } from "fs";
import { rm } from "fs/promises";
import path from "path";

const formatFileSize = (bytes: number): string => {
  const units = ["B", "KB", "MB", "GB"];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(2)} ${units[unitIndex]}`;
};

console.log("\n🚀 Starting Windows executable build...\n");

const outdir = path.join(process.cwd(), "dist");

if (existsSync(outdir)) {
  console.log(`🗑️ Cleaning previous build at ${outdir}`);
  await rm(outdir, { recursive: true, force: true });
}

const start = performance.now();

console.log("🔨 Building for Windows x64\n");

const result = await Bun.build({
  entrypoints: ["./src/index.tsx"],
  outdir,
  compile: {
    target: "bun-windows-x64",
    outfile: "zpl-printer.exe",
  },
  minify: true,
  sourcemap: "linked",
  define: {
    "process.env.NODE_ENV": JSON.stringify("production"),
  },
});

const end = performance.now();

if (result.success) {
  const exePath = path.join(outdir, "zpl-printer.exe");
  const stats = existsSync(exePath) ? await Bun.file(exePath).size : 0;
  
  console.log("📦 Executable Details:");
  console.table([
    {
      File: "zpl-printer.exe",
      Platform: "Windows x64",
      Size: formatFileSize(stats),
    },
  ]);

  const buildTime = (end - start).toFixed(2);
  console.log(`\n✅ Executable built in ${buildTime}ms`);
  console.log(`📍 Location: ${exePath}\n`);
} else {
  console.error("❌ Build failed:");
  for (const log of result.logs) {
    console.error(log);
  }
  process.exit(1);
}
