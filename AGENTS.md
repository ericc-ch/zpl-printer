# Agent Guidelines for ZPL Printer

## Build & Test Commands
- `bun run dev` - Start development server with hot reload
- `bun run build` - Build multi-platform executables (Windows/Linux)
- `bun run typecheck` - Run TypeScript type checking
- `bun test` - Run all tests
- `bun test <file>` - Run a single test file (e.g., `bun test tests/zpl-generator.test.ts`)
- `bun test -t <pattern>` - Run tests matching a pattern

## Code Style
- **Runtime**: Bun (not Node.js)
- **TypeScript**: Strict mode enabled with `noUncheckedIndexedAccess`, `noUnusedLocals`, `noUnusedParameters`
- **Imports**: Use `@/` path alias for `src/` directory imports
- **Types**: Always use explicit types, prefer interfaces for objects, use Zod schemas for validation
- **Naming**: camelCase for variables/functions, PascalCase for components/types, UPPER_CASE for constants
- **Error Handling**: Use try-catch blocks, return result objects with `{ success, message?, error? }` pattern
- **React**: Function components with TypeScript, use hooks (no class components)
- **Formatting**: No semicolons in console.log statements, use template literals over concatenation
- **Null Safety**: Use `?.` and `??` operators, check for null/undefined before array access
