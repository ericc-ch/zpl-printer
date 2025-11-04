#!/usr/bin/env bash
# Compress the project into a zip file, excluding .git and gitignored files

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"
ZIP_FILE="$PROJECT_DIR/zpl-printer.zip"

cd "$PROJECT_DIR"

echo "Creating zip archive..."
git ls-files | zip "$ZIP_FILE" -@

echo ""
echo "✅ Archive created successfully!"
ls -lh "$ZIP_FILE"
echo ""
unzip -l "$ZIP_FILE" | tail -1
