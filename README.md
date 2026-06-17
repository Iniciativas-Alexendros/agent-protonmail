# Proton Mail MCP

[![npm version](https://img.shields.io/npm/v/@alexendros/protonmail-mcp.svg)](https://www.npmjs.com/package/@alexendros/protonmail-mcp)
[![CI](https://github.com/Iniciativas-Alexendros/plugin-protonmail-claudecode/actions/workflows/ci.yml/badge.svg)](https://github.com/Iniciativas-Alexendros/plugin-protonmail-claudecode/actions/workflows/ci.yml)
[![CodeQL](https://github.com/Iniciativas-Alexendros/plugin-protonmail-claudecode/actions/workflows/codeql.yml/badge.svg)](https://github.com/Iniciativas-Alexendros/plugin-protonmail-claudecode/actions/workflows/codeql.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![Node](https://img.shields.io/badge/node-%E2%89%A520-brightgreen.svg)](./package.json)
[![MCP SDK](https://img.shields.io/badge/%40modelcontextprotocol%2Fsdk-%5E1.19-blue.svg)](https://github.com/modelcontextprotocol/typescript-sdk)

Servidor **[MCP (Model Context Protocol)](https://modelcontextprotocol.io)** para **Proton Mail** vía Proton Mail Bridge. Expone la bandeja — lectura, búsqueda, envío, mover, etiquetar, borrar — a cualquier cliente MCP con tipado estricto, anotaciones de seguridad y doble transporte (`stdio` y `streamable HTTP`).

Se instala de dos formas: como **plugin de Claude Code** (un comando, sin tocar `dist/`; ver [Instalación como plugin](#instalación-como-plugin-de-claude-code)) o como **servidor MCP autohospedado** (clon + build, o despliegue HTTP avanzado). El repo incluye además una **skill de triaje de correo** (ver [Skill de triaje](#skill-de-triaje-de-correo)) que clasifica el INBOX y aparta la basura comercial sin borrar nada.

> La garantía E2E de Proton se preserva: el cifrado y descifrado ocurren en Bridge, una máquina que controlas tú. Ni los servidores de Anthropic ni terceros ven tu correo descifrado — sólo el agente al que tú autorizas.

> **Modo de uso de referencia: local, `stdio`, on-demand.** El camino primario es el cliente local (Claude Code lanza el MCP por `stdio` cuando lo necesita, contra un Bridge en `127.0.0.1`). El despliegue HTTP/Docker existe y está documentado como **modo avanzado** en [`docs/deployment-http-docker.md`](./docs/deployment-http-docker.md), pero no es necesario para el uso normal.

---

## Por qué existe este proyecto

Hay dos formas comunes de darle "ojos sobre el correo" a un asistente como Claude:

1. **Copiar y pegar** bloques de correo dentro del chat. Trabajoso, frágil y sin trazabilidad.
2. **OAuth contra un proveedor SaaS** (Gmail API, Microsoft Graph). Funciona pero expone los datos al proveedor y deja el agente fuera de una cuenta Proton Mail, que es E2E y no tiene API pública.

Este MCP resuelve ambos problemas sobre Proton Mail:

- **Interfaz MCP estándar.** Cualquier cliente compatible (Claude Code CLI, Claude Routines, SDK cliente en tu backend) puede llamar a las 13 tools sin implementar IMAP/SMTP.
- **Autohospedado.** El binario corre donde tú decidas — laptop, VPS, contenedor. Bridge hace la criptografía en el mismo host y nunca expone el vault a la red pública.
- **Dual transport.** `stdio` para cliente local (Claude Code en la CLI), `streamable HTTP` con bearer auth + allowlist de origen para clientes remotos (Routines, dashboards propios).

Este repositorio también sirve como **muestra pública de craft**: tests automatizados, hardening por capas, CI/CD completo y modelo de amenazas explícito — no es un boilerplate, es una pieza de producción.

---

## Estado actual

| Pieza                                                                                             | Estado                                                                          |
| ------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| Smoke `stdio`: `initialize` + `tools/list` responden con las 13 tools                             | verificado                                                                      |
| Cliente local on-demand (Claude Code lanza el MCP por `stdio` contra Bridge `127.0.0.1`)          | **modo primario, en uso**                                                       |
| Plugin de Claude Code (marketplace + skill de triaje instalables con un comando)                  | disponible                                                                      |
| Skill de triaje de correo (clasifica INBOX, aparta basura comercial, nunca borra)                 | en uso                                                                          |
| Typecheck strict (`tsc --noEmit`) sobre todo `src/` y `tests/`                                    | verde                                                                           |
| Suite Vitest (auth · config · smtp-helpers · http-transport)                                      | verde                                                                           |
| Build `tsc` a `dist/` + smoke integrado en `npm run smoke`                                        | verde                                                                           |
| Imagen Docker multi-stage + `Dockerfile.bridge` (despliegue HTTP avanzado)                        | construye                                                                       |
| CI GitHub Actions (matrix Node 20/22, typecheck, test, build, smoke, `npm audit`, CodeQL)         | configurado                                                                     |
| Release workflow a `ghcr.io/iniciativas-alexendros/plugin-protonmail-claudecode` en push a `main` | configurado                                                                     |
| Despliegue HTTP/Bearer público (Dokploy)                                                          | **retirado** — uso actual local-`stdio`; HTTP queda como modo avanzado opcional |

---

## Arquitectura

```
┌─────────────────────────────────────────────────────────────────────────┐
│                            CONSUMIDORES MCP                             │
│                                                                         │
│   Claude Code CLI          Claude Routines         Backend propio       │
│   (stdio, local)           (HTTP, claude.ai)       (HTTP, tu código)    │
│         │                         │                       │             │
└─────────┼─────────────────────────┼───────────────────────┼─────────────┘
          │ JSON-RPC                │ HTTPS + Bearer        │ HTTPS + Bearer
          │                         │ + Origin allowlist    │
          ▼                         ▼                       ▼
    ┌──────────────────────────────────────────────────────────────┐
    │                      protonmail-mcp                          │
    │     TypeScript · @modelcontextprotocol/sdk@^1.19             │
    │     Dual transport · Per-session StreamableHTTP              │
    │     Bearer timing-safe · Rate-limit 120/min/token            │
    │                                                              │
    │   ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌─────────┐   │
    │   │config.ts │   │ auth.ts  │   │  http.ts │   │server.ts│   │
    │   │Zod env   │   │bearer    │   │Express + │   │ 13 MCP  │   │
    │   │validation│   │timing-   │   │per-sess. │   │ tools + │   │
    │   │stderr log│   │safe cmp  │   │transport │   │ Zod in  │   │
    │   └──────────┘   └──────────┘   └──────────┘   └────┬────┘   │
    │                                                     │        │
    │              ┌───────────────────┐   ┌──────────────┴──────┐ │
    │              │      imap.ts      │   │       smtp.ts       │ │
    │              │   imapflow pool   │   │   nodemailer pool   │ │
    │              │   retry+backoff   │   │   threading headers │ │
    │              │   mailbox locks   │   │   quote/forward     │ │
    │              └─────────┬─────────┘   └──────────┬──────────┘ │
    └────────────────────────┼────────────────────────┼────────────┘
                             │ IMAP 1143              │ SMTP 1025
                             │ STARTTLS               │ STARTTLS
                             ▼                        ▼
                    ┌────────────────────────────────────────┐
                    │         Proton Mail Bridge             │
                    │     (localhost o VPS interno)          │
                    │       FRONTERA CRIPTOGRÁFICA E2E       │
                    └────────────────┬───────────────────────┘
                                     │ OpenPGP + HTTPS
                                     ▼
                            ┌──────────────────┐
                            │ Proton Servers   │
                            │ (cifrado E2E)    │
                            └──────────────────┘
```

**Claves de diseño:**

- **Fontera cripto**: todo lo que está a la izquierda de Bridge opera sobre correo en claro. Bridge vive en una máquina que tú controlas, en una red que tú controlas. Nada se filtra a terceros.
- **Per-session HTTP transport**: un `StreamableHTTPServerTransport` por `Mcp-Session-Id` (recomendación del SDK). Evita bleed de estado entre clientes concurrentes (Routines + Command Center + CLI pueden convivir).
- **Pool persistente IMAP/SMTP**: se reutiliza una conexión a Bridge entre llamadas. Reconexión con retry + backoff exponencial si Bridge se reinicia.
- **Stderr-only logs**: en modo `stdio`, `stdout` está reservado a JSON-RPC. Contaminarlo rompería el protocolo.

---

## Las 13 tools

Todas las tools de lectura aceptan `response_format: "markdown" | "json"`.

| Tool                    | Tipo               | Descripción                                                                                                         |
| ----------------------- | ------------------ | ------------------------------------------------------------------------------------------------------------------- |
| `proton_list_folders`   | read               | Lista mailboxes (INBOX, Sent, Trash, labels, carpetas custom)                                                       |
| `proton_create_folder`  | write              | Crea un mailbox nuevo                                                                                               |
| `proton_mailbox_status` | read               | Contadores rápidos: total / unseen / recent                                                                         |
| `proton_list_emails`    | read               | Lista paginada de mensajes recientes (UID, from, subject, date, flags)                                              |
| `proton_search_emails`  | read               | Búsqueda con filtros combinables (`query`, `since`/`before`, `unseen_only`, `from_address`, `to_address`, `fields`) |
| `proton_get_email`      | read               | Mensaje completo: headers, cuerpo texto/HTML, metadata de adjuntos                                                  |
| `proton_get_attachment` | read               | Descarga un adjunto en base64. `max_bytes` default 10 MB (hard cap 50 MB) con `truncated=true` explícito            |
| `proton_send_email`     | write              | Envía texto/HTML + adjuntos. `from` fijo al configurado (no spoofing)                                               |
| `proton_reply_email`    | write              | Responde preservando threading (`In-Reply-To` + `References`), con `reply_all` opcional y quote                     |
| `proton_forward_email`  | write              | Reenvía opcionalmente con adjuntos originales                                                                       |
| `proton_flag_email`     | write (idempotent) | `read` / `unread` / `starred` / `unstarred` / flags custom                                                          |
| `proton_move_email`     | write              | Mueve entre mailboxes por UID                                                                                       |
| `proton_delete_email`   | **destructive**    | Modo `trash` (default, reversible) o `permanent` (expunge inmediato)                                                |

Cada tool se registra con `annotations` del SDK — `readOnlyHint`, `idempotentHint`, `destructiveHint`, `openWorldHint` — para que el modelo pueda razonar sobre el efecto antes de invocarla.

---

## Caminos de integración

El orden refleja la prioridad real de uso: **el cliente local por `stdio` es el camino primario**; el HTTP queda como modo avanzado.

### 1 · Plugin de Claude Code (recomendado)

La vía más corta: instala el MCP **y** la skill de triaje de una vez, sin clonar ni compilar. Ver [Instalación como plugin](#instalación-como-plugin-de-claude-code).

```text
/plugin marketplace add Iniciativas-Alexendros/plugin-protonmail-claudecode
/plugin install protonmail-mcp@protonmail-mcp
```

### 2 · Claude Code CLI (local, `stdio`) — manual

Para registrar el MCP a mano sin el plugin. Bridge corre en la máquina; el MCP se lanza por `stdio` cuando Claude Code lo necesita.

```bash
claude mcp add --transport stdio proton-mail --scope user \
  --env PROTON_BRIDGE_USER=you@proton.me \
  --env PROTON_BRIDGE_PASS=your-bridge-password \
  --env PROTON_MAIL_FROM=you@proton.me \
  --env PROTON_BRIDGE_TLS_INSECURE=true \
  --env MCP_TRANSPORT=stdio \
  -- node /ruta/absoluta/a/protonmail-mcp/dist/index.js
```

> **Bridge password en claro en el registro.** El ejemplo de arriba deja `PROTON_BRIDGE_PASS` literal en el `mcp.json` del cliente. Para evitarlo, registra un **wrapper `stdio`** que resuelva el bridge password JIT desde tu gestor de secretos (cero secreto en disco). Patrón completo en [`docs/local-stdio-secrets.md`](./docs/local-stdio-secrets.md).

Dentro de cualquier sesión de Claude Code, `/mcp` muestra `proton-mail: connected` y las 13 tools. A partir de ahí, lenguaje natural: _"resume mis correos no leídos de la última semana por tema"_.

### 3 · HTTP remoto (Routines, backend propio) — modo avanzado

El servidor también habla `streamable HTTP` con bearer + allowlist de origen, para Claude Routines o un backend propio. Es un despliegue autohospedado completo (Docker/Dokploy, cert TLS, token), documentado aparte: ver [`docs/deployment-http-docker.md`](./docs/deployment-http-docker.md) y la [Integración en Next.js](#integración-en-nextjs). No es necesario para el uso local.

---

## Quickstart local

Prerrequisitos: **Node ≥ 20**, **Proton Mail Bridge** corriendo en el workstation, y el _bridge password_ a mano (no es tu password Proton — lo muestra Bridge bajo `info`).

### El Bridge: `protonmail-bridge-core` (CLI headless)

El MCP no habla con Proton directamente: habla IMAP/SMTP en `127.0.0.1` contra **Proton Mail Bridge**, que hace la criptografía E2E en tu máquina. Para un workstation sin entorno gráfico (o para no arrastrar la GUI), el paquete headless es **`protonmail-bridge-core`** — el binario CLI `protonmail-bridge-core`, distinto del paquete GUI (`proton-mail-bin` en el AUR).

```bash
# Arranca el Bridge en modo CLI (interactivo)
protonmail-bridge-core --cli

# Dentro de la shell del Bridge:
>>> login      # introduce cuenta Proton + contraseña + 2FA (lo haces tú)
>>> info       # muestra el bridge password generado (≠ tu contraseña Proton)
>>> exit
```

Tras `login`, Bridge expone:

- **IMAP** en `127.0.0.1:1143`
- **SMTP** en `127.0.0.1:1025`

El _bridge password_ que muestra `info` es una credencial **generada por Bridge**, propia de IMAP/SMTP, que **cambia en cada re-login** — no es tu contraseña de cuenta Proton. Es la que va en `PROTON_BRIDGE_PASS`. El vault de Bridge persiste en el keychain del sistema (p. ej. gnome-keyring vía secret-service en Linux), así que los siguientes arranques no piden 2FA.

Verifica que el puerto está vivo antes de usar el MCP:

```bash
ss -ltn | grep -E '127.0.0.1:1143'   # debe listar el puerto IMAP
```

> Los WARN de arranque del Bridge (cache de unleash, vault key) son ruido de bootstrap, no fallos. Detalle y troubleshooting en [`docs/bridge-core.md`](./docs/bridge-core.md).

### Build y smoke del MCP

```bash
git clone https://github.com/Iniciativas-Alexendros/plugin-protonmail-claudecode.git
cd plugin-protonmail-claudecode
npm install
npm run build
npm test         # suite Vitest verde
npm run smoke    # verifica stdio: initialize + tools/list
```

Crea `.env` desde el template:

```bash
cp .env.example .env
# edita PROTON_BRIDGE_USER, PROTON_BRIDGE_PASS y PROTON_MAIL_FROM
```

Arranca en modo stdio contra Bridge local:

```bash
PROTON_BRIDGE_USER=you@proton.me \
PROTON_BRIDGE_PASS=your-bridge-password \
PROTON_MAIL_FROM=you@proton.me \
PROTON_BRIDGE_TLS_INSECURE=true \
MCP_TRANSPORT=stdio \
node dist/index.js
```

O con el inspector oficial (UI gráfica para probar tools):

```bash
npm run inspect
# → abre http://localhost:6274
```

---

## Skill de triaje de correo

El repo incluye una **skill de Claude Code** (`triaje-correo`) que opera sobre las tools `proton_*` para revisar el INBOX, **resumir lo relevante** y **apartar la basura comercial** moviéndola a `Folders/Marketing-Promo`. Se instala con el plugin (abajo); la fuente vive en [`plugins/protonmail-mcp/skills/triaje-correo/SKILL.md`](./plugins/protonmail-mcp/skills/triaje-correo/SKILL.md).

**Qué hace:** clasifica cada correo del INBOX en `RELEVANTE` / `COMERCIAL` / `DUDOSO` con señales explícitas (`List-Unsubscribe`, remitente `no-reply@`/`newsletter@`, patrones promo en el asunto, plataformas de email marketing), resume los relevantes y propone mover los comerciales.

**Garantías de seguridad (por diseño):**

- **Dry-run obligatorio primero.** No mueve nada hasta que tú das OK explícito; en dry-run solo reporta qué movería.
- **Nunca borra.** Usa exclusivamente `proton_move_email`; `proton_delete_email` está **prohibida** en este flujo. Mover es reversible (arrastras de vuelta).
- **Cuadre pre/post.** Tras aplicar, verifica `movidos + restantes_INBOX == total_inicial`; si no cuadra, para y reporta.
- **Cero falsos positivos sobre transaccional/personal.** Ante la duda, el correo se queda en INBOX. Facturas, OTP, alertas de seguridad y banca nunca se mueven, aunque traigan `List-Unsubscribe`.

**Taxonomía de carpetas** (configurable): destino de basura `Folders/Marketing-Promo`; carpetas tratadas como relevantes por naturaleza `Folders/Admin-Estado`, `Banca-Pagos`, `Abogados`, `Salud`, etc.

**Uso:** en una sesión con el MCP conectado, lenguaje natural — _"revisa el correo"_, _"limpia la basura comercial"_, _"qué hay en el inbox"_.

---

## Instalación como plugin de Claude Code

La forma recomendada de poner en marcha el MCP **y** la skill de triaje a la vez, de forma global, sin clonar ni compilar.

```text
/plugin marketplace add Iniciativas-Alexendros/plugin-protonmail-claudecode
/plugin install protonmail-mcp@protonmail-mcp
```

El instalador pide los valores de `userConfig` (tu dirección Proton, `from`, host/puertos del Bridge). El MCP se registra en modo `stdio` lanzando `npx -y @alexendros/protonmail-mcp`, así que no necesitas tener el repo clonado.

**Puesta en marcha tras instalar:**

1. **Arranca el Bridge** (`protonmail-bridge-core --cli` → `login`), como en el [Quickstart](#el-bridge-protonmail-bridge-core-cli-headless). Verifica el puerto: `ss -ltn | grep 1143`.
2. **Aporta el bridge password de forma segura.** El plugin no almacena el `PROTON_BRIDGE_PASS`: lo aportas tú por entorno, o mejor con un **wrapper que lo resuelva JIT** desde tu gestor de secretos. Plantilla en [`plugins/protonmail-mcp/scripts/protonmail-mcp-stdio.sh.example`](./plugins/protonmail-mcp/scripts/protonmail-mcp-stdio.sh.example); patrón completo en [`docs/local-stdio-secrets.md`](./docs/local-stdio-secrets.md).
3. **Reinicia la sesión** de Claude Code para que registre el MCP, y comprueba con `/mcp` que `protonmail-mcp` está `connected` con las 13 tools.

---

## HTTP remoto (modo avanzado)

El despliegue autohospedado por HTTP (Docker/Dokploy, bearer timing-safe, allowlist de origen, cert TLS) **no es necesario para el uso local** y se documenta aparte: ver [`docs/deployment-http-docker.md`](./docs/deployment-http-docker.md). Cubre las variables (`MCP_AUTH_TOKEN`, `MCP_ALLOWED_ORIGINS`), el login one-off al Bridge en contenedor, la verificación con `curl /healthz` + `curl /mcp`, y el registro como Remote MCP Server en Claude Routines.

---

## Seguridad

La hoja completa está en [`SECURITY.md`](./SECURITY.md). Resumen de los controles activos:

- **Bearer timing-safe** (`src/auth.ts`): comparación byte-a-byte en tiempo constante, con early-return por longitud para no filtrar el tamaño del token esperado.
- **Origin allowlist** (`MCP_ALLOWED_ORIGINS`): cada request `/mcp` se valida contra la lista exacta. Mitigación de DNS rebinding.
- **Rate limit** 120 req/min por token (`express-rate-limit`, draft-7 headers).
- **Per-session transport**: un `StreamableHTTPServerTransport` por `Mcp-Session-Id`, eviction tras 30 min idle.
- **Attachment cap**: `max_bytes` default 10 MB (hard cap 50 MB), con `truncated=true` explícito cuando aplica. Evita que un adjunto hostil sature el contexto del LLM.
- **Stderr-only logging**: ningún cuerpo de request, ninguna credencial en logs.
- **Secrets fuera de git**: `.env.example` muestra la forma; los valores viven en Dokploy secrets / `.env` local con permisos `0600`.

Amenazas modeladas (T1–T7 en `SECURITY.md`): robo de bearer, DNS rebinding, SMTP relay abuse, prompt injection vía cuerpo de email, robo de credenciales IMAP, exfiltración vía adjuntos, downgrade TLS del canal Bridge local.

---

## Integración en Next.js

Si tu dashboard es un Next.js (por ejemplo, el [Developer Command Center](https://github.com/alexendros/developer-command-center) que hospeda las acciones reales), el patrón que uso es un cliente fetch minimalista — evita arrastrar el SDK MCP entero cuando sólo necesitas un par de llamadas:

```ts
// src/lib/mcp/proton.ts (extracto)
export async function fetchUnreadSummary(opts: { limit?: number } = {}) {
  const mcp = await connectProtonMcp(); // initialize + session id
  try {
    const call = await mcp.callTool("proton_search_emails", {
      mailbox: "INBOX",
      unseen_only: true,
      limit: opts.limit ?? 10,
      response_format: "json",
    });
    return JSON.parse(call.content[0].text);
  } finally {
    await mcp.close();
  }
}
```

Y una acción sobre el patrón _actions dispatcher_ (Zod + auth + audit log append-only):

```ts
// src/lib/actions/handlers.ts
export async function mailUnreadSummary(p: {
  mailbox?: string;
  limit?: number;
}) {
  const summary = await fetchUnreadSummary({ limit: p.limit });
  return { providerRef: `mailbox:${summary.mailbox}`, result: summary };
}
```

Desde la UI, un `<ActionButton action="mail/unread-summary" />` dispara la llamada, pinta un toast, y deja rastro en el timeline append-only de `/acciones`.

---

## Calidad de código

```bash
npm run typecheck    # tsc --noEmit, strict mode
npm test             # vitest run, 4 suites (auth · config · smtp-helpers · http-transport)
npm run smoke        # initialize + tools/list stdio
```

**Lo que hay tests para:**

- `auth.test.ts` — `compareTokens` timing-safe en casos extremos (longitudes distintas, tokens vacíos, tokens hex de 64 chars).
- `config.test.ts` — Zod rechaza env missing, acepta defaults correctos, parsea CSV en `allowedOrigins`.
- `smtp-helpers.test.ts` — `prefixSubject` no duplica "Re:", `addrMatches` es case-insensitive, `collectReferences` preserva orden de threading.
- `http-transport.test.ts` — `GET /healthz` 200 sin auth, `POST /mcp` sin bearer 401, Origin inválido 403, `initialize` devuelve `Mcp-Session-Id`, rate limit middleware wired.

**CI pipeline:**

1. `verify` (matrix Node 20/22): install + typecheck + test + build + smoke
2. `audit`: `npm audit --audit-level=high`
3. `docker-build`: construye la imagen sin push (smoke)
4. `codeql`: análisis SAST JavaScript/TypeScript en push a main y semanal
5. `release` (en push a main): docker build + push a `ghcr.io/iniciativas-alexendros/plugin-protonmail-claudecode:{sha,latest}`

---

## Casos de uso reales

| Contexto              | Flujo                                                                                   | Ganancia                                |
| --------------------- | --------------------------------------------------------------------------------------- | --------------------------------------- |
| **Triaje semanal**    | Routine cada lunes 09:00 → clasifica no-leídos por tema → envía digest                  | 30 min → 0 min humanos                  |
| **Leads comerciales** | Routine cada 30 min → busca asuntos con "consulta" → extrae datos → crea lead en CRM    | Menos fricción, más conversión          |
| **Administraciones**  | Routine diaria → detecta comunicaciones BOE/AEAT/AEPD → extrae plazos → tarea en Notion | Cero plazos perdidos                    |
| **Post-venta Stripe** | Webhook Stripe → route handler llama `proton_send_email` con plantilla + PDF            | Email automatizado con un solo servicio |

Coste marginal de cada flujo nuevo una vez desplegado: **cero**.

---

## Stack técnico

| Pieza                       | Versión | Por qué                                                        |
| --------------------------- | ------- | -------------------------------------------------------------- |
| TypeScript                  | ^6.0    | `strict` + `NodeNext` para catch-at-compile                    |
| Node                        | ≥20     | Fetch nativo, `node:crypto` estable, rendimiento en `imapflow` |
| `@modelcontextprotocol/sdk` | ^1.19   | SDK oficial; per-session `StreamableHTTPServerTransport`       |
| `imapflow`                  | ^1.0    | IMAP moderno, async/await, lock de mailbox granular            |
| `nodemailer`                | ^8.0    | Estándar de facto para SMTP en Node, con pool                  |
| `mailparser`                | ^3.7    | Decodifica MIME + adjuntos a estructura tipada                 |
| `zod`                       | ^4.3    | Validación de schemas a nivel tool + env vars                  |
| `express`                   | ^5.2    | Middleware para auth/rate-limit/origin allowlist               |
| `express-rate-limit`        | ^8.4    | 120 req/min por token                                          |
| `vitest`                    | ^4.1    | Runner rápido con TypeScript nativo                            |
| `supertest`                 | ^7.0    | Tests del transport HTTP sin puerto real                       |

---

## Desarrollo

```
src/
├── index.ts      Arranque: stdio o HTTP, signal handlers, guardrails de producción
├── config.ts     Zod env validation + logger stderr
├── auth.ts       compareTokens timing-safe + extractBearer
├── http.ts       buildHttpApp: per-session StreamableHTTP + rate-limit + origin allowlist
├── imap.ts       ImapClient: pool + retry/backoff + mailbox locks
├── smtp.ts       SmtpClient: nodemailer pool + helpers de threading (reply/forward)
└── server.ts     McpServer con registro de las 13 tools (Zod in, markdown/json out)

tests/
├── auth.test.ts
├── config.test.ts
├── smtp-helpers.test.ts
└── http-transport.test.ts

scripts/
└── smoke.sh      initialize + tools/list sobre stdio, integrable en CI

.github/workflows/
├── ci.yml        lint/typecheck/test/build/smoke + npm audit + docker build
├── release.yml   push a ghcr.io en main y tags semver
└── codeql.yml    SAST JavaScript/TypeScript

.claude-plugin/
└── marketplace.json   colección de marketplace (un plugin: protonmail-mcp)

plugins/protonmail-mcp/
├── .claude-plugin/plugin.json          descriptor: userConfig + ref al MCP stdio
├── .protonmail-mcp_claude_mcp.json     MCP stdio (npx -y @alexendros/protonmail-mcp)
├── skills/triaje-correo/SKILL.md       skill de triaje de correo
└── scripts/
    └── protonmail-mcp-stdio.sh.example wrapper con resolución JIT del bridge pass

docs/
├── bridge-core.md              Bridge headless protonmail-bridge-core (CLI, keychain)
├── local-stdio-secrets.md      patrón wrapper stdio + secreto JIT (cero secreto en disco)
└── deployment-http-docker.md   modo avanzado HTTP/Docker/Dokploy

Dockerfile          imagen mcp: multi-stage node:20-alpine
Dockerfile.bridge   imagen bridge: extiende shenxn/protonmail-bridge:build con libfido2,
                    dbus-x11, credential-helpers, libGL/libOpenGL y libs Qt XCB
docker-compose.yml  stack bridge + mcp con red proton-net interna +
                    dokploy-network externa para Traefik
```

---

## Roadmap abierto

- Tests E2E con Bridge de prueba (Greenmail + SMTP mock).
- `outputSchema` con `structuredContent` en las tools de lectura cuando el SDK lo materialice mejor.
- `proton_watch_inbox` con IDLE + webhook (flujos event-driven sin polling).
- Soporte multi-alias (Proton permite varias direcciones por cuenta).
- Bridge CA pinning opcional (`PROTON_BRIDGE_CA_PATH`) para cerrar `tlsInsecure` en producción estricta.

---

## Sobre este proyecto

Soy [**Alexendros**](https://alexendros.me) (Alejandro Domingo Agustí). Construyo productos SaaS con integración IA — este repositorio es una muestra del nivel de cuidado que aplico a cualquier pieza de infra que toco: tests antes de shippear, hardening antes de abrir puertos, docs antes de olvidar decisiones.

Si necesitas algo parecido para tu caso, cuéntamelo: `contacto [at] alexendros [dot] me`.

---

## Licencia

[MIT](./LICENSE) — úsalo, fórkalo, véndelo. Sin garantía.

---

## Marcas comerciales

**Este proyecto no está afiliado a Proton AG ni respaldado por ella.** "Proton Mail" y "Proton Mail Bridge" son marcas registradas de Proton AG. Este repositorio es un cliente de terceros que habla con Bridge a través de protocolos abiertos estándar (IMAP/SMTP). El uso de "Proton Mail" en este README es estrictamente descriptivo del producto al que este software se conecta.
