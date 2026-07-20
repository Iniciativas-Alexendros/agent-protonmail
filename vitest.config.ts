import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["tests/**/*.test.ts"],
    environment: "node",
    globals: false,
    reporters: ["default"],
    coverage: {
      provider: "v8",
      reporter: ["text", "html", "json-summary"],
      include: ["src/**/*.ts"],
      exclude: ["src/index.ts", "src/**/*.d.ts"],
      // Gate global 95% — exit non-zero si lines|branches|statements < 95%.
      // Config es fuente de verdad; CLI flags (--coverage.thresholds.X=95) son overrides ad-hoc.
      // functions omitida por decisión explícita. Si el gate falla, coverage/coverage-summary.json.
      thresholds: {
        lines: 95,
        branches: 95,
        statements: 95,
      },
    },
  },
});
