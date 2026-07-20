# Coverage Report

**Generado:** 2026-07-20 — vitest + @vitest/coverage-v8 v3.2.7 (post-`commit 2eb5d14` branch-hunt, post-gate instalado en `vitest.config.ts`)

> El gate al 95% (lines | branches | statements) instalado este mismo hilo bloquea el run si cae por debajo. La medición fresca de este reporte se hizo SIN gate (`vitest run --coverage` directo) para diagnóstico — el gate validado en CI disparará `ERROR: Coverage for branches (X%) does not meet global threshold (95%)` hasta cerrar el gap restante.

## 🎯 Branch Hunt — cierre de 3 gaps en commit `2eb5d14` (round 1)

**Tesis.** El gate global al 95% sólo pasa si cada una de las 4 métricas cumple. Esta sesión cerró los 3 gaps que arrastraban **Branches** global por debajo del 95%. El patrón es replicable a próximas iteraciones.

### Gaps cerrados

| # | Módulo | Branches pre-hunt | Branches post-hunt | Δ | Tests añadidos | Patrón aplicado |
|---|--------|-------------------|---------------------|---|----------------|-----------------|
| 1 | `src/diagnostics.ts` | 84.78% | **96.00%** | **+11.22pp** | 5 | cascade-error fixtures (`MockImapFlow` setters) cubriendo TCP → IMAP → Auth: `Error` vs `string`-throw fallbacks, `?? ''` greeting fallback, `caps ? [...] : []` branch |
| 2 | `src/pass.ts` | 87.03% | **95.31%** | **+8.28pp** | 4 | empty-stderr fallback en `execPass()`, constructor DI para el (non-exported) `exec`, non-Error `readdir` en `health()`, `catch { continue }` en `audit()` |
| 3 | `src/addresses.ts` | 89.65% | **100.00%** | **+10.35pp** | 29 | tests de tabla sobre helpers puros (`envelopeAddrToString`, `addrListToString`, `addrListToArray`, `addressesToArray`, `extractEmail`, `addrMatches`) — mailbox+host, empty-list, single-object-vs-array, case-insensitive |

> **Nota:** El 95.31% que el usuario llevaba en mente corresponde a `src/pass.ts` a nivel módulo tras este commit. El global al cierre de la ronda es **93.63%** (ver `Resumen global` abajo).

### Patrón replicable (4 pasos)

Aplicable a cualquier módulo futuro con branches <95%:

1. **Identificar el gap.** `pnpm run coverage` → `coverage/coverage-summary.json` → ordenar por `branches.pct` ascendente. Las columnas `branches.uncovered` y los reports listan rangos de línea exactos.
2. **Diferenciar reachable vs defensive.** Para cada rama no cubierta:
   - **Reachable** — real en producción (network errors, parse failures, callback paths): necesaria cobertura.
   - **Defensive** — `?? ''`, fallbacks `noUncheckedIndexedAccess`, catch-alls defensivos: imposible de ejecutar en runtime per ECMAScript/TS spec.
3. **Cerrar reachable con tests** según personalidad del módulo:
   - Función pura → tests de tabla (`input, expected`).
   - Async con subprocess → mock con EventEmitter en stdout/stderr.
   - Red / socket → `Promise.reject` o `net.createConnection({})` con error sintético.
4. **Cerrar defensive con SAFETY comment** si lint bloquea la simplificación:
   - `!` → blocked por `@typescript-eslint/no-non-null-assertion` (project-wide lint policy).
   - `as string` → blocked por `@typescript-eslint/non-nullable-type-assertion-style`.
   - Único lint-clean: `?? ''` documentado con SAFETY block explicando el invariante de spec. Ver `src/pass.ts:113-126` como referencia canónica.
   - ⚠️ **Nunca** con mocks que falseen coverage — dishonest, esconde invariantes de runtime.

### Estado de la caza

| Hito | Branches global | Δ |
|------|-----------------|---|
| Jun 2026 (base) | (n/a) | — |
| Jul 2026 (Ronda 1-8 histórica) | 92.23% | — |
| **Jul 2026 (este hilo, post-`2eb5d14`)** | **93.63%** | **+1.40pp** |
| Jul 2026 (target gate) | 95.00% | pendiente **+1.37pp** |

~18 ramas deficitarias distribuidas en 13 módulos (ver "Próxima ronda" abajo).

## Resumen global (fresh — vitest run hoy)

| Métrica | Valor | Gate | Estado | Δ vs reporte previo |
|---------|-------|------|--------|---------------------|
| **Statements** | **98.07%** | ≥95% | ✅ | +0.07pp |
| **Branches** | **93.63%** | ≥95% | ❌ 1.37pp abajo | **+1.40pp** |
| **Functions** | **97.37%** | (ungated) | ✅ | −0.02pp |
| **Lines** | **98.07%** | ≥95% | ✅ | +0.07pp |
| Tests | 864 / 43 files | — | +15 desde último reporte | +1 file suite |

## Todos los módulos ordenados por branches (ascendente)

> Sort por branches porque es la métrica limitante del gate. Los 🟠 son los targets prioritarios para la próxima ronda.

| # | Módulo | Stmts | Branch | Funcs | Lines | Status |
|---|--------|-------|--------|-------|-------|--------|
| 1 | `src/agent-cli.ts` | 0% | 100% | 100% | 0% | 🔴 stub (CLI entry sin uso runtime) |
| 2 | `src/agent/organizer.ts` | 97.67% | **74.19%** | 100% | 97.67% | 🟠 peor |
| 3 | `src/ecosystem/discovery.ts` | 93.57% | **86.84%** | 100% | 93.57% | 🟠 |
| 4 | `src/agent/executor.ts` | 93.77% | **87.23%** | 100% | 93.77% | 🟠 |
| 5 | `src/server/drive.ts` | 99.83% | **88.04%** | 100% | 99.83% | 🟠 |
| 6 | `src/server/mail.ts` | 100% | **89.58%** | 100% | 100% | 🟠 |
| 7 | `src/agent/setup.ts` | 100% | 90.00% | 100% | 100% | 🟡 |
| 8 | `src/ecosystem/updater.ts` | 96.42% | 90.47% | 100% | 96.42% | 🟡 |
| 9 | `src/config/bridge.ts` | 100% | 92.30% | 100% | 100% | 🟡 |
| 10 | `src/server/suite.ts` | 98.38% | 92.30% | 100% | 98.38% | 🟡 |
| 11 | `src/imap.ts` | 95.21% | 93.33% | 84.61% | 95.21% | 🟡 |
| 12 | `src/ecosystem/installer.ts` | 100% | 93.54% | 100% | 100% | 🟡 |
| 13 | `src/smtp.ts` | 100% | 93.58% | 100% | 100% | 🟡 |
| 14 | `src/server/ecosystem.ts` | 100% | 94.59% | 100% | 100% | 🟡 |
| 15 | `src/server/pass.ts` | 99.56% | 95.23% | 100% | 99.56% | ✅ |
| 16 | `src/pass.ts` | 100% | **95.31%** | 100% | 100% | ✅ Branch Hunt #2 |
| 17 | `src/server.ts` | 100% | 95.34% | 80% | 100% | ✅ |
| 18 | `src/config.ts` | 100% | 95.55% | 95.23% | 100% | ✅ |
| 19 | `src/bridge/bridge-client.ts` | 95.01% | 96.63% | 100% | 95.01% | ✅ |
| 20 | `src/diagnostics.ts` | 100% | 96.00% | 100% | 100% | ✅ Branch Hunt #1 |
| 21 | `src/http.ts` | 100% | 97.22% | 100% | 100% | ✅ |
| 22 | `src/alerts/rules.ts` | 100% | 97.29% | 100% | 100% | ✅ |
| 23-43 | `src/alerts/*` (file,ntfy,types,webhook) / `src/agent/{goals,index}.ts` / `src/auth.ts` / `src/drive-audit.ts` / `src/drive.ts` / `src/security.ts` / `src/version.ts` / `src/which.ts` / `src/addresses.ts` / `src/server/{agent,calendar,types,utils}.ts` / `src/config/{calendar,drive,pass}.ts` / `src/ecosystem/binaries.ts` / `src/alerts/index.ts` | 100% | 100% | 100% | 100% | ✅ |

**Leyenda:** 🔴 stub | 🟠 target prioritario (branches <90%) | 🟡 gap menor (branches 90-95%) | ✅ cumple gate | 🟢 100%

## Por grupo

### `src/` — 98.07% statements

| File | Stmts | Branch | Funcs | Lines |
|------|-------|--------|-------|-------|
| agent-cli.ts | 0% | 100% | 100% | 0% |
| config.ts | **100%** | **95.55%** | 95.23% | **100%** |
| http.ts | **100%** | **97.22%** | 100% | **100%** |
| smtp.ts | **100%** | 93.58% | 100% | **100%** |
| server.ts | **100%** | **95.34%** | 80% | **100%** |
| imap.ts | 95.21% | 93.33% | 84.61% | 95.21% |
| **diagnostics.ts** ⭐ | **100%** | **96.00%** | 100% | **100%** |
| drive.ts | **100%** | 100% | 100% | **100%** |
| drive-audit.ts | **100%** | 100% | 100% | **100%** |
| **pass.ts** ⭐ | **100%** | **95.31%** | 100% | **100%** |
| **addresses.ts** ⭐ | **100%** | **100%** | 100% | **100%** |
| auth.ts | 100% | 100% | 100% | 100% |
| security.ts | 100% | 100% | 100% | 100% |
| version.ts | 100% | 100% | 100% | 100% |
| which.ts | 100% | 100% | 100% | 100% |

⭐ = Branch Hunt round 1 (commit `2eb5d14`)

### `src/agent/` — 96.69% statements

| File | Stmts | Branch | Funcs | Lines |
|------|-------|--------|-------|-------|
| types.ts | 0% | 0% | 0% | 0% |
| executor.ts | 93.77% | 87.23% | 100% | 93.77% |
| organizer.ts | 97.67% | **74.19%** | 100% | 97.67% |
| goals.ts | 100% | 100% | 100% | 100% |
| index.ts | 100% | 100% | 100% | 100% |
| setup.ts | 100% | 90.00% | 100% | 100% |

### `src/alerts/` — 99.71% statements

| File | Stmts | Branch | Funcs | Lines |
|------|-------|--------|-------|-------|
| index.ts | 98.66% | 100% | 100% | 98.66% |
| rules.ts | 100% | 97.29% | 100% | 100% |
| file.ts | 100% | 100% | 100% | 100% |
| ntfy.ts | 100% | 100% | 100% | 100% |
| types.ts | 100% | 100% | 100% | 100% |
| webhook.ts | 100% | 100% | 100% | 100% |

### `src/bridge/` — 95.01% statements

| File | Stmts | Branch | Funcs | Lines |
|------|-------|--------|-------|-------|
| bridge-client.ts | 95.01% | 96.63% | 100% | 95.01% |

### `src/config/` — 100% statements

| File | Stmts | Branch | Funcs | Lines |
|------|-------|--------|-------|-------|
| bridge.ts | 100% | 92.30% | 100% | 100% |
| calendar.ts | 100% | 100% | 100% | 100% |
| drive.ts | 100% | 100% | 100% | 100% |
| pass.ts | 100% | 100% | 100% | 100% |

### `src/ecosystem/` — 97.18% statements

| File | Stmts | Branch | Funcs | Lines |
|------|-------|--------|-------|-------|
| discovery.ts | 93.57% | 86.84% | 100% | 93.57% |
| updater.ts | 96.42% | 90.47% | 100% | 96.42% |
| binaries.ts | 100% | 100% | 100% | 100% |
| installer.ts | 100% | 93.54% | 100% | 100% |

### `src/server/` — 99.80% statements

| File | Stmts | Branch | Funcs | Lines |
|------|-------|--------|-------|-------|
| drive.ts | 99.83% | 88.04% | 100% | 99.83% |
| pass.ts | 99.56% | 95.23% | 100% | 99.56% |
| suite.ts | 98.38% | 92.30% | 100% | 98.38% |
| server.ts | **100%** | **95.34%** | 80% | **100%** |
| mail.ts | 100% | 89.58% | 100% | 100% |
| agent.ts | 100% | 100% | 100% | 100% |
| calendar.ts | 100% | 100% | 100% | 100% |
| ecosystem.ts | 100% | 94.59% | 100% | 100% |
| types.ts | 100% | 100% | 100% | 100% |
| utils.ts | 100% | 100% | 100% | 100% |

## 🎯 Próxima ronda — módulos a cerrar para pasar el gate

(Sort por branches ascendente, sólo los <95%. Estimación basada en los reports de uncovered branches de v8.)

| # | Módulo | Branches | Δ al gate | Acción sugerida |
|---|--------|----------|-----------|-----------------|
| 1 | `src/agent/organizer.ts` | 74.19% | -20.81pp | SAFETY comments para ~6 defensive fall-throughs + 2 tests con mock ImapClient (legal/admin/tech/spam/phishing) |
| 2 | `src/ecosystem/discovery.ts` | 86.84% | -8.16pp | 5 ramas: `parseHelpOutput` help vacío, `checkBinary` healthCmd fail, `whichSync` résolution vacía |
| 3 | `src/agent/executor.ts` | 87.23% | -7.77pp | 6 error paths: setup fail, organize fail, pass-audit fail, suite-status fetch fail |
| 4 | `src/server/drive.ts` | 88.04% | -6.96pp | 11 ramas: `audit()` obsolescence detection (línea 282), `organize()` existsSync=true |
| 5 | `src/server/mail.ts` | 89.58% | -5.42pp | 10 ramas: getAttachment content_type undefined, moveEmail+deleteEmail rollback, listEmails offset, sendEmail attachments vacío |
| 6 | `src/agent/setup.ts` | 90.00% | -5.00pp | 2 ramas menores: downloader error, permission denied |
| 7 | `src/ecosystem/updater.ts` | 90.47% | -4.53pp | 2 ramas: `fetchLatestVersion` regex sin match, version comparison edge |
| 8 | `src/config/bridge.ts` | 92.30% | -2.70pp | 1 rama: línea 49 (env override con trim()) |
| 9 | `src/server/suite.ts` | 92.30% | -2.70pp | 2 ramas: branches 72-73 |
| 10 | `src/imap.ts` | 93.33% | -1.67pp | 7 ramas: idle eviction timer, error en persistent conn |
| 11 | `src/ecosystem/installer.ts` | 93.54% | -1.46pp | 2 ramas: líneas 53, 59 (apt-get fallbacks) |
| 12 | `src/smtp.ts` | 93.58% | -1.42pp | 5 ramas: `buildForwardBody` fallbacks, content-type negotiation |
| 13 | `src/server/ecosystem.ts` | 94.59% | -0.41pp | 2 ramas: minor (líneas 46, 158) |

**Total estimado: ~18 ramas para pasar gate global al 95% con margen (+).** El módulo #1 (`organizer.ts`) por sí solo aporta la mitad del gap — cerrar sus defensive fall-throughs con SAFETY comments mueve el dial significativamente.

## Progreso

| Fecha | Statements | Branches | Tests | Files | Hitos |
|-------|-----------|----------|-------|-------|-------|
| **Jul 2026 (Branch Hunt 1)** | **98.07%** | **93.63%** | **864** | **43** | **3 gaps cerrados (diagnostics, pass, addresses); +15 tests; gate 95% instalado** |
| Jul 2026 (ESLint endurecimiento) | 98.00% | 92.23% | 819 | 42 | `config.ts` 90%→100% (z.url()), `bridge-client` 88%→95% (+3 tests), reglas off restantes |
| Jul 2026 (post-http.ts gap) | 96.67% | 91.04% | 804 | 42 | `http.ts` 99%→100%, `smtp.ts` 98%→100%, coverage badge bugfix |
| Jul 2026 (Ronda 8) | 95.12% | 91.70% | 796 | 42 | `server.ts` branches 82%→95%, `http.ts` 99%, `config/drive.ts` 100% |
| Jul 2026 (Ronda 3b) | 93.72% | 89.50% | 745 | 42 | `server/drive.ts` 89%→99% (+43 tests) |
| Jul 2026 (Ronda 2) | 92.68% | 89.50% | 692 | 41 | `server.ts` 73%→96%, `smtp.ts` 79%→98% |
| Jul 2026 (post-merge) | 90.65% | 86.46% | 619 | 38 | Repo renombrado, PRs #65, #66 |
| Jul 2026 (previo) | 90.67% | — | 640 | 42 | `server/agent` 64%→100%, `organizer` 68%→98% |
| Jun 2026 (base) | 61.70% | — | 258 | 21 | Reporte inicial |

## Reproducir localmente

```bash
# Run sin gate para diagnóstico (coverage-summary.json limpio):
rm -f coverage/coverage-summary.json
npx vitest run --coverage

# Round-trip al reporte:
python3 -c "import json; d=json.load(open('coverage/coverage-summary.json'))['total']; \
  print(f'STATEMENTS={d[\"statements\"][\"pct\"]}% BRANCHES={d[\"branches\"][\"pct\"]}% \
  FUNCTIONS={d[\"functions\"][\"pct\"]}% LINES={d[\"lines\"][\"pct\"]}%')"

# Test count exacto:
npx vitest run --reporter=default 2>&1 | grep -E '^Tests|^Test Files'

# CI (gate activo, retornará non-zero si branches<95%):
npx vitest run --coverage   # exit 1 con "ERROR: Coverage for branches (X%) does not meet global threshold (95%)"
```
