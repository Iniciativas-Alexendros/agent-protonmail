import { defineConfig } from "vitest/config";

/**
 * Config separada para los tests E2E contra un servidor IMAP/SMTP real
 * (GreenMail). No se incluyen en `npm test` (que mockea todo): estos ficheros
 * usan la extensión `.e2e.ts` y requieren un GreenMail accesible. En CI corre
 * como service container; en local, `scripts/e2e-greenmail.sh` lo levanta.
 */
export default defineConfig({
  test: {
    include: ["tests/e2e/**/*.e2e.ts"],
    environment: "node",
    globals: false,
    reporters: ["default"],
    // El ciclo send→poll→read necesita margen: GreenMail entrega async.
    testTimeout: 30_000,
    hookTimeout: 30_000,
  },
});
