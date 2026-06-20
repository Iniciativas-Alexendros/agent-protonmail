/**
 * Fuente única de verdad de la versión del servidor.
 *
 * Se lee de `package.json` en runtime (no `import ... with { type: "json" }`)
 * porque `tsconfig.json` fija `rootDir: "./src"`: un import del manifiesto, que
 * vive fuera de `src/`, rompería la compilación. La lectura por URL relativa al
 * módulo funciona en los tres contextos:
 *  - `src/` durante los tests (vitest ejecuta TS directo) → `../package.json`.
 *  - `dist/` tras `tsc` → `../package.json` (dist está un nivel bajo la raíz).
 *  - paquete instalado desde npm → npm SIEMPRE incluye `package.json` en el
 *    tarball, junto a `dist/`, así que la ruta relativa sigue resolviendo.
 *
 * Antes la versión estaba triplicada y divergía (package.json 0.3.1,
 * server.ts "0.3.0", http.ts "0.2.0"). Centralizar aquí elimina esa deriva.
 */
import { readFileSync } from "node:fs";

const pkg = JSON.parse(
  readFileSync(new URL("../package.json", import.meta.url), "utf8"),
) as { version: string };

export const VERSION: string = pkg.version;
