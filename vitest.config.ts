import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    include: ["tests/**/*.test.ts"],
    coverage: {
      provider: "v8",
      // main.ts is pure DOM wiring with no logic to unit test in isolation
      // (see docs/ARCHITECTURE.md) — everything it calls into is covered.
      include: ["src/lib/**"],
      thresholds: {
        lines: 85,
        statements: 85,
        functions: 85,
        branches: 85,
      },
    },
  },
});
