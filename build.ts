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

console.log("\n🚀 Starting multi-platform executable build...\n");

const outdir = path.join(process.cwd(), "dist");

if (existsSync(outdir)) {
  console.log(`🗑️ Cleaning previous build at ${outdir}`);
  await rm(outdir, { recursive: true, force: true });
}

const targets = [
  { target: "bun-windows-x64", outfile: "zpl-printer.exe", platform: "Windows x64" },
  { target: "bun-linux-x64", outfile: "zpl-printer-linux", platform: "Linux x64" },
] as const;

const buildResults = [];
const startTotal = performance.now();

for (const { target, outfile, platform } of targets) {
  console.log(`🔨 Building for ${platform}...\n`);
  const start = performance.now();

  const result = await Bun.build({
    entrypoints: ["./src/index.tsx"],
    outdir,
    compile: {
      target,
      outfile,
    },
    minify: true,
    sourcemap: "linked",
    define: {
      "process.env.NODE_ENV": JSON.stringify("production"),
    },
  });

  const end = performance.now();
  const buildTime = (end - start).toFixed(2);

  if (result.success) {
    const exePath = path.join(outdir, outfile);
    const stats = existsSync(exePath) ? await Bun.file(exePath).size : 0;

    buildResults.push({
      File: outfile,
      Platform: platform,
      Size: formatFileSize(stats),
      Time: `${buildTime}ms`,
    });

    console.log(`✅ ${platform} built in ${buildTime}ms\n`);
  } else {
    console.error(`❌ ${platform} build failed:`);
    for (const log of result.logs) {
      console.error(log);
    }
    process.exit(1);
  }
}

const endTotal = performance.now();
const totalTime = (endTotal - startTotal).toFixed(2);

console.log("📦 Build Summary:");
console.table(buildResults);
console.log(`\n✅ All executables built in ${totalTime}ms`);
console.log(`📍 Location: ${outdir}\n`);
