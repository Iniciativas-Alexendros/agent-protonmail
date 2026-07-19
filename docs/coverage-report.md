# Coverage Report

**Generado:** 2026-07-19 — vitest + @vitest/coverage-v8 (post-Ronda 8: server.ts branches 82%→95%, http.ts 99%, config/drive.ts 100%)

## Resumen global

| Métrica | Valor | Diferencia vs anterior |
|---------|-------|----------------------|
| **Statements** | **95.12%** | **+1.40pp** |
| Branches | 91.70% | **+2.20pp** |
| **Functions** | **96.56%** | **+2.19pp** |
| Lines | 95.12% | +1.40pp |
| Tests | 796 / 42 files | **+51 tests** |

## Todos los módulos ordenados por cobertura (ascendente)

| # | Módulo | Stmts | Branch | Funcs | Estado |
|---|--------|-------|--------|-------|--------|
| 1 | `src/agent/types.ts` | **0%** | 0% | 0% | 🟡 stub |
| 2 | `src/calendar-types.ts` | **0%** | 0% | 0% | 🟡 stub |
| 3 | `src/agent-cli.ts` | **0%** | 100% | 100% | 🟡 CLI entry |
| 4 | `src/calendar.ts` | **0%** | 100% | 100% | 🟡 stub |
| 5 | `src/config/index.ts` | **0%** | 100% | 100% | 🟡 barrel |
| 6 | `src/bridge/bridge-client.ts` | **88.52%** | 92.07% | 94.73% | 🟢 |
| 7 | `src/config.ts` | **90.71%** | 95.23% | 95.23% | 🟢 |
| 8 | `src/ecosystem/discovery.ts` | **93.57%** | 93.54% | 100% | ✅ |
| 9 | `src/imap.ts` | **93.60%** | 91.42% | 84.61% | ✅ |
| 10 | `src/agent/executor.ts` | **93.77%** | 87.23% | 100% | ✅ |
| 11 | `src/diagnostics.ts` | **93.78%** | 82.05% | 87.50% | ✅ |
| 12 | `src/drive-audit.ts` | **94.16%** | 94.11% | 100% | ✅ |
| 13 | `src/drive.ts` | **94.37%** | 90.19% | 100% | ✅ |
| 14 | `src/ecosystem/updater.ts` | **96.42%** | 94.44% | 100% | ✅ |
| 15 | `src/agent/organizer.ts` | **97.64%** | 82.50% | 100% | ✅ |
| 16 | `src/ecosystem/installer.ts` | **100%** | 93.54% | 100% | ✅ |
| 17 | `src/server/suite.ts` | **98.38%** | 92.30% | 100% | ✅ |
| 18 | `src/smtp.ts` | **98.55%** | 79.10% | 100% | 🟢 |
| 19 | `src/alerts/index.ts` | **98.66%** | 100% | 100% | ✅ |
| 20 | `src/pass.ts` | **99.10%** | 88.67% | 100% | ✅ |
| 21 | `src/http.ts` | **99.08%** | 94.44% | 100% | ✅ |
| 22 | `src/server/drive.ts` | **99.49%** | 85.22% | 100% | ✅ |
| 23 | `src/server/pass.ts` | **99.56%** | 95.23% | 100% | ✅ |
| 24 | `src/addresses.ts` | **100%** | 89.65% | 100% | ✅ |
| 25 | `src/agent/setup.ts` | **100%** | 90.00% | 100% | ✅ |
| 26 | `src/alerts/file.ts` | **100%** | 100% | 100% | ✅ |
| 27 | `src/alerts/ntfy.ts` | **100%** | 100% | 100% | ✅ |
| 28 | `src/alerts/rules.ts` | **100%** | 97.29% | 100% | ✅ |
| 29 | `src/alerts/types.ts` | **100%** | 100% | 100% | ✅ |
| 30 | `src/alerts/webhook.ts` | **100%** | 100% | 100% | ✅ |
| 31 | `src/auth.ts` | **100%** | 100% | 100% | ✅ |
| 32 | `src/config/bridge.ts` | **100%** | 92.30% | 100% | ✅ |
| 33 | `src/config/calendar.ts` | **100%** | 100% | 100% | ✅ |
| 34 | `src/config/drive.ts` | **100%** | 100% | 100% | ✅ |
| 35 | `src/config/pass.ts` | **100%** | 100% | 100% | ✅ |
| 36 | `src/ecosystem/binaries.ts` | **100%** | 100% | 100% | ✅ |
| 37 | `src/ecosystem/installer.ts` | **100%** | 93.54% | 100% | ✅ |
| 38 | `src/goals.ts` | **100%** | 100% | 100% | ✅ |
| 39 | `src/index.ts` | **100%** | 100% | 100% | ✅ |
| 40 | `src/security.ts` | **100%** | 100% | 100% | ✅ |
| 41 | `src/server/agent.ts` | **100%** | 100% | 100% | ✅ |
| 42 | `src/server/calendar.ts` | **100%** | 100% | 100% | ✅ |
| 43 | `src/server/ecosystem.ts` | **100%** | 94.59% | 100% | ✅ |
| 44 | `src/server/mail.ts` | **100%** | 95.94% | 100% | ✅ |
| 45 | `src/server.ts` | **100%** | 95.12% | 80% | ✅ |
| 46 | `src/server/types.ts` | **100%** | 100% | 100% | ✅ |
| 47 | `src/server/utils.ts` | **100%** | 100% | 100% | ✅ |
| 48 | `src/version.ts` | **100%** | 100% | 100% | ✅ |
| 49 | `src/which.ts` | **100%** | 100% | 100% | ✅ |

**Leyenda:** 🟡 stub (sin implementar) | 🟢 85-99% | ✅ 100% | — Ya no hay módulos 🔴

## Por grupo

### `src/` — 90.29% statements

| File | Stmts | Branch | Funcs | Lines |
|------|-------|--------|-------|-------|
| agent-cli.ts | 0% | 100% | 100% | 0% |
| calendar-types.ts | 0% | 0% | 0% | 0% |
| calendar.ts | 0% | 100% | 100% | 0% |
| config.ts | 90.71% | 95.23% | 95.23% | 90.71% |
| server.ts | **100%** | **95.12%** | 80% | **100%** |
| smtp.ts | 98.55% | 79.10% | 100% | 98.55% |
| http.ts | **99.08%** | 94.44% | 100% | 99.08% |
| imap.ts | 93.60% | 91.42% | 84.61% | 93.60% |
| diagnostics.ts | 93.78% | 82.05% | 87.50% | 93.78% |
| drive.ts | 94.37% | 90.19% | 100% | 94.37% |
| drive-audit.ts | 94.16% | 94.11% | 100% | 94.16% |
| pass.ts | 99.10% | 88.67% | 100% | 99.10% |
| addresses.ts | 100% | 89.65% | 100% | 100% |
| auth.ts | 100% | 100% | 100% | 100% |
| security.ts | 100% | 100% | 100% | 100% |
| version.ts | 100% | 100% | 100% | 100% |
| which.ts | 100% | 100% | 100% | 100% |

### `src/agent/` — 96.67% statements

| File | Stmts | Branch | Funcs | Lines |
|------|-------|--------|-------|-------|
| types.ts | 0% | 0% | 0% | 0% |
| executor.ts | 93.77% | 87.23% | 100% | 93.77% |
| organizer.ts | 97.64% | 82.50% | 100% | 97.64% |
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

### `src/bridge/` — 88.52% statements

| File | Stmts | Branch | Funcs | Lines |
|------|-------|--------|-------|-------|
| bridge-client.ts | 88.52% | 92.07% | 94.73% | 88.52% |

### `src/config/` — 98.79% statements

| File | Stmts | Branch | Funcs | Lines |
|------|-------|--------|-------|-------|
| index.ts | 0% | 100% | 100% | 0% |
| bridge.ts | 100% | 92.30% | 100% | 100% |
| calendar.ts | 100% | 100% | 100% | 100% |
| drive.ts | **100%** | **100%** | 100% | 100% |
| pass.ts | 100% | 100% | 100% | 100% |

### `src/ecosystem/` — 97.18% statements

| File | Stmts | Branch | Funcs | Lines |
|------|-------|--------|-------|-------|
| discovery.ts | 93.57% | 93.54% | 100% | 93.57% |
| updater.ts | 96.42% | 94.44% | 100% | 96.42% |
| binaries.ts | 100% | 100% | 100% | 100% |
| installer.ts | 100% | 93.54% | 100% | 100% |

### `src/server/` — 99.71% statements

| File | Stmts | Branch | Funcs | Lines |
|------|-------|--------|-------|-------|
| drive.ts | 99.49% | 85.22% | 100% | 99.49% |
| pass.ts | 99.56% | 95.23% | 100% | 99.56% |
| suite.ts | 98.38% | 92.30% | 100% | 98.38% |
| **server.ts** | **100%** | **95.12%** | 80% | **100%** |
| agent.ts | 100% | 100% | 100% | 100% |
| calendar.ts | 100% | 100% | 100% | 100% |
| ecosystem.ts | 100% | 94.59% | 100% | 100% |
| mail.ts | 100% | 95.94% | 100% | 100% |
| types.ts | 100% | 100% | 100% | 100% |
| utils.ts | 100% | 100% | 100% | 100% |

## Progreso

| Fecha | Statements | Branches | Tests | Archivos | Hitos |
|-------|-----------|----------|-------|----------|-------|
| **Jul 2026 (post-Ronda 8)** | **95.12%** | **91.70%** | **796** | **42** | server.ts 82%→95% branches, http.ts 99%, config/drive.ts 100% |
| Jul 2026 (Ronda 3b) | 93.72% | 89.50% | 745 | 42 | server/drive.ts 89%→99% (+43 tests) |
| Jul 2026 (Ronda 2) | 92.68% | 89.50% | 692 | 41 | server.ts 73%→96%, smtp.ts 79%→98% |
| Jul 2026 (post-merge) | 90.65% | 86.46% | 619 | 38 | Repo renombrado, PRs #65 y #66 |
| Jul 2026 (previo) | 90.67% | — | 640 | 42 | server/agent 64%→100%, organizer 68%→98% |
| Jun 2026 (base) | 61.70% | — | 258 | 21 | Reporte inicial |

## Top 3 gaps de branches (cobertura >85%, branches <95%)

| # | Módulo | Stmts | Branches | Gap |
|---|--------|-------|----------|-----|
| 1 | `src/smtp.ts` | 98.55% | **79.10%** | líneas 109-111 |
| 2 | `src/server/drive.ts` | 99.49% | **85.22%** | líneas 97, 104, 282 |
| 3 | `src/agent/organizer.ts` | 97.64% | **82.50%** | líneas 94, 104-105, 155 |
