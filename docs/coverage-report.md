# Coverage Report

**Generado:** 2026-07-19 — vitest + @vitest/coverage-v8 (post-http.ts gap closed)

## Resumen global

| Métrica | Valor | Diferencia vs anterior |
|---------|-------|----------------------|
| **Statements** | **96.67%** | **+1.55pp** |
| Branches | 91.04% | +0.34pp |
| **Functions** | **96.09%** | +0.53pp |
| Lines | 96.67% | +1.55pp |
| Tests | 804 / 42 files | **+8 tests** |

## Todos los módulos ordenados por cobertura (ascendente)

| # | Módulo | Stmts | Branch | Funcs | Estado |
|---|--------|-------|--------|-------|--------|
| 1 | `src/agent/types.ts` | **0%** | 0% | 0% | 🟡 stub |
| 2 | `src/agent-cli.ts` | **0%** | 100% | 100% | 🟡 CLI entry |
| 3 | `src/bridge/bridge-client.ts` | **88.56%** | 92.38% | 94.73% | 🟢 |
| 4 | `src/config.ts` | **90.71%** | 95.23% | 95.23% | 🟢 |
| 5 | `src/ecosystem/discovery.ts` | **93.57%** | 86.84% | 100% | ✅ |
| 6 | `src/imap.ts` | **93.61%** | 91.34% | 84.61% | ✅ |
| 7 | `src/agent/executor.ts` | **93.77%** | 87.23% | 100% | ✅ |
| 8 | `src/diagnostics.ts` | **93.78%** | 82.05% | 87.50% | ✅ |
| 9 | `src/drive-audit.ts` | **94.16%** | 94.11% | 100% | ✅ |
| 10 | `src/drive.ts` | **94.37%** | 90.90% | 100% | ✅ |
| 11 | `src/ecosystem/updater.ts` | **96.42%** | 90.47% | 100% | ✅ |
| 12 | `src/agent/organizer.ts` | **97.67%** | 72.13% | 100% | ✅ |
| 13 | `src/server/suite.ts` | **98.38%** | 92.30% | 100% | ✅ |
| 14 | `src/alerts/index.ts` | **98.66%** | 100% | 100% | ✅ |
| 15 | `src/pass.ts` | **99.10%** | 87.03% | 100% | ✅ |
| 16 | `src/server/drive.ts` | **99.49%** | 85.22% | 100% | ✅ |
| 17 | `src/server/pass.ts` | **99.56%** | 95.23% | 100% | ✅ |
| 18 | `src/addresses.ts` | **100%** | 89.65% | 100% | ✅ |
| 19 | `src/auth.ts` | **100%** | 100% | 100% | ✅ |
| 20 | `src/http.ts` | **100%** | 97.22% | 100% | ✅ |
| 21 | `src/security.ts` | **100%** | 100% | 100% | ✅ |
| 22 | `src/server.ts` | **100%** | 95.34% | 80% | ✅ |
| 23 | `src/smtp.ts` | **100%** | 93.75% | 100% | ✅ |
| 24 | `src/version.ts` | **100%** | 100% | 100% | ✅ |
| 25 | `src/which.ts` | **100%** | 100% | 100% | ✅ |
| 26 | `src/agent/goals.ts` | **100%** | 100% | 100% | ✅ |
| 27 | `src/agent/index.ts` | **100%** | 100% | 100% | ✅ |
| 28 | `src/agent/setup.ts` | **100%** | 90.00% | 100% | ✅ |
| 29 | `src/alerts/file.ts` | **100%** | 100% | 100% | ✅ |
| 30 | `src/alerts/ntfy.ts` | **100%** | 100% | 100% | ✅ |
| 31 | `src/alerts/rules.ts` | **100%** | 97.29% | 100% | ✅ |
| 32 | `src/alerts/types.ts` | **100%** | 100% | 100% | ✅ |
| 33 | `src/alerts/webhook.ts` | **100%** | 100% | 100% | ✅ |
| 34 | `src/config/bridge.ts` | **100%** | 92.30% | 100% | ✅ |
| 35 | `src/config/calendar.ts` | **100%** | 100% | 100% | ✅ |
| 36 | `src/config/drive.ts` | **100%** | 100% | 100% | ✅ |
| 37 | `src/config/pass.ts` | **100%** | 100% | 100% | ✅ |
| 38 | `src/ecosystem/binaries.ts` | **100%** | 100% | 100% | ✅ |
| 39 | `src/ecosystem/installer.ts` | **100%** | 93.54% | 100% | ✅ |
| 40 | `src/server/agent.ts` | **100%** | 100% | 100% | ✅ |
| 41 | `src/server/calendar.ts` | **100%** | 100% | 100% | ✅ |
| 42 | `src/server/ecosystem.ts` | **100%** | 94.59% | 100% | ✅ |
| 43 | `src/server/mail.ts` | **100%** | 87.09% | 100% | ✅ |
| 44 | `src/server/types.ts` | **100%** | 100% | 100% | ✅ |
| 45 | `src/server/utils.ts` | **100%** | 100% | 100% | ✅ |

**Leyenda:** 🟡 stub (sin implementar) | 🟢 85-99% | ✅ 100%

## Por grupo

### `src/` — 94.28% statements

| File | Stmts | Branch | Funcs | Lines |
|------|-------|--------|-------|-------|
| agent-cli.ts | 0% | 100% | 100% | 0% |
| config.ts | 90.71% | 95.23% | 95.23% | 90.71% |
| **http.ts** | **100%** | **97.22%** | 100% | **100%** |
| **smtp.ts** | **100%** | **93.75%** | 100% | **100%** |
| **server.ts** | **100%** | **95.34%** | 80% | **100%** |
| imap.ts | 93.61% | 91.34% | 84.61% | 93.61% |
| diagnostics.ts | 93.78% | 82.05% | 87.50% | 93.78% |
| drive.ts | 94.37% | 90.90% | 100% | 94.37% |
| drive-audit.ts | 94.16% | 94.11% | 100% | 94.16% |
| pass.ts | 99.10% | 87.03% | 100% | 99.10% |
| addresses.ts | 100% | 89.65% | 100% | 100% |
| auth.ts | 100% | 100% | 100% | 100% |
| security.ts | 100% | 100% | 100% | 100% |
| version.ts | 100% | 100% | 100% | 100% |
| which.ts | 100% | 100% | 100% | 100% |

### `src/agent/` — 96.69% statements

| File | Stmts | Branch | Funcs | Lines |
|------|-------|--------|-------|-------|
| types.ts | 0% | 0% | 0% | 0% |
| executor.ts | 93.77% | 87.23% | 100% | 93.77% |
| organizer.ts | 97.67% | 72.13% | 100% | 97.67% |
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

### `src/bridge/` — 88.56% statements

| File | Stmts | Branch | Funcs | Lines |
|------|-------|--------|-------|-------|
| bridge-client.ts | 88.56% | 92.38% | 94.73% | 88.56% |

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

### `src/server/` — 99.71% statements

| File | Stmts | Branch | Funcs | Lines |
|------|-------|--------|-------|-------|
| drive.ts | 99.49% | 85.22% | 100% | 99.49% |
| pass.ts | 99.56% | 95.23% | 100% | 99.56% |
| suite.ts | 98.38% | 92.30% | 100% | 98.38% |
| **server.ts** | **100%** | **95.34%** | 80% | **100%** |
| mail.ts | 100% | 87.09% | 100% | 100% |
| agent.ts | 100% | 100% | 100% | 100% |
| calendar.ts | 100% | 100% | 100% | 100% |
| ecosystem.ts | 100% | 94.59% | 100% | 100% |
| types.ts | 100% | 100% | 100% | 100% |
| utils.ts | 100% | 100% | 100% | 100% |

## Progreso

| Fecha | Statements | Branches | Tests | Archivos | Hitos |
|-------|-----------|----------|-------|----------|-------|
| **Jul 2026 (post-http.ts gap)** | **96.67%** | **91.04%** | **804** | **42** | http.ts 99%→100%, smtp.ts 98%→100%, coverage badge bugfix |
| Jul 2026 (post-Ronda 8) | 95.12% | 91.70% | 796 | 42 | server.ts branches 82%→95%, http.ts 99%, config/drive.ts 100% |
| Jul 2026 (Ronda 3b) | 93.72% | 89.50% | 745 | 42 | server/drive.ts 89%→99% (+43 tests) |
| Jul 2026 (Ronda 2) | 92.68% | 89.50% | 692 | 41 | server.ts 73%→96%, smtp.ts 79%→98% |
| Jul 2026 (post-merge) | 90.65% | 86.46% | 619 | 38 | Repo renombrado, PRs #65 y #66 |
| Jul 2026 (previo) | 90.67% | — | 640 | 42 | server/agent 64%→100%, organizer 68%→98% |
| Jun 2026 (base) | 61.70% | — | 258 | 21 | Reporte inicial |

## Top 3 módulos con branches <90% (stmts >85%)

| # | Módulo | Stmts | Branches | Gap |
|---|--------|-------|----------|-----|
| 1 | `src/agent/organizer.ts` | 97.67% | **72.13%** | líneas 96, 106-107, 157 |
| 2 | `src/server/mail.ts` | 100% | **87.09%** | líneas 74, 488-493, 499, 553-554, 615, 689-690 |
| 3 | `src/server/drive.ts` | 99.49% | **85.22%** | líneas 97, 104, 282 |
