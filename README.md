# Proton Mail MCP

[![npm version](https://img.shields.io/npm/v/@alexendros/protonmail-mcp.svg)](https://www.npmjs.com/package/@alexendros/protonmail-mcp)
[![CI](https://github.com/Iniciativas-Alexendros/protonmailbrige-mcptool/actions/workflows/ci.yml/badge.svg)](https://github.com/Iniciativas-Alexendros/protonmailbrige-mcptool/actions/workflows/ci.yml)
[![CodeQL](https://github.com/Iniciativas-Alexendros/protonmailbrige-mcptool/actions/workflows/codeql.yml/badge.svg)](https://github.com/Iniciativas-Alexendros/protonmailbrige-mcptool/actions/workflows/codeql.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![Node](https://img.shields.io/badge/node-%E2%89%A522-brightgreen.svg)](./package.json)
[![MCP SDK](https://img.shields.io/badge/%40modelcontextprotocol%2Fsdk-%5E1.29-blue.svg)](https://github.com/modelcontextprotocol/typescript-sdk)

Servidor **[MCP](https://modelcontextprotocol.io)** para **Proton Mail** vía Proton Mail Bridge. Expone la bandeja — lectura, búsqueda, envío, mover, etiquetar, borrar — a cualquier cliente MCP compatible: agentes IA de código, dashboards propios o rutinas automatizadas.

- **Modo primario:** `stdio` local, sin exponer nada a la red.
- **Modo avanzado:** `streamable HTTP` con bearer auth + origin allowlist.
- **Privacidad:** Bridge descifra el correo en tu máquina; el MCP nunca ve tu contraseña Proton.

---

## Quickstart — 5 minutos

Prerrequisitos: **Node ≥ 22** y **Proton Mail Bridge** corriendo en local (`protonmail-bridge-core --cli` → `login` → `info` para copiar el bridge password).

### 1. Instalar y probar

```bash
npx -y @alexendros/protonmail-mcp
# o clonar el repo
```

### 2. Configurar tu cliente MCP

Añade este bloque a tu cliente MCP (formato genérico `mcpServers`):

```jsonc
{
  "mcpServers": {
    "protonmail": {
      "command": "npx",
      "args": ["-y", "@alexendros/protonmail-mcp"],
      "env": {
        "MCP_TRANSPORT": "stdio",
        "PROTON_BRIDGE_USER": "you@proton.me",
        "PROTON_BRIDGE_PASS": "your-bridge-password",
        "PROTON_MAIL_FROM": "you@proton.me",
        "PROTON_BRIDGE_TLS_INSECURE": "true"
      }
    }
  }
}
```

> **Seguridad:** no dejes el bridge password en claro en el disco. Usa un wrapper que lo resuelva just-in-time desde tu gestor de secretos. Plantilla en [`connectors/stdio-wrapper.sh.example`](./connectors/stdio-wrapper.sh.example).

### 3. Usar

En tu agente, en lenguaje natural:

- "¿Qué correos tengo en el inbox?"
- "Resume los no leídos de la última semana."
- "Responde al correo de Alice confirmando la reunión."

La primera tool que un agente debe llamar siempre es `proton_list_folders`.

---

## Documentación

| Documento | Para quién | Qué cubre |
|---|---|---|
| [`docs/human-quickstart.md`](./docs/human-quickstart.md) | Usuarios no técnicos | Instalación paso a paso, Bridge, primer uso. |
| [`docs/agent-quickstart.md`](./docs/agent-quickstart.md) | Agentes IA / desarrolladores | Cómo consumir las 13 tools, formatos de respuesta, ejemplos. |
| [`docs/bridge-core.md`](./docs/bridge-core.md) | Todos | `protonmail-bridge-core` headless, puertos, vault, troubleshooting. |
| [`docs/local-stdio-secrets.md`](./docs/local-stdio-secrets.md) | Operadores | Wrapper stdio que no deja secretos en disco. |
| [`docs/deployment-http-docker.md`](./docs/deployment-http-docker.md) | DevOps | Despliegue HTTP con Docker, auth, allowlist, healthcheck. |
| [`ARCHITECTURE.md`](./ARCHITECTURE.md) | Desarrolladores | Capas internas, modelo de amenazas, decisiones. |
| [`SECURITY.md`](./SECURITY.md) | Desarrolladores / auditores | Controles activos y threat model. |
| [`CONTRIBUTING.md`](./CONTRIBUTING.md) | Contribuidores | Convenciones, PRs, tests. |

## Conectores y playbooks

- [`connectors/stdio-npx.json`](./connectors/stdio-npx.json): config stdio genérica para cualquier cliente MCP.
- [`connectors/stdio-wrapper.sh.example`](./connectors/stdio-wrapper.sh.example): wrapper seguro con resolución JIT de secretos.
- [`connectors/http-curl.sh.example`](./connectors/http-curl.sh.example): handshake HTTP con curl.
- [`playbooks/triage-email.md`](./playbooks/triage-email.md): workflow de triaje de correo (dry-run obligatorio, nunca borra).
- [`playbooks/reply-organize.md`](./playbooks/reply-organize.md): responder y organizar correos.
- [`playbooks/setup-checklist.md`](./playbooks/setup-checklist.md): checklist de puesta en marcha.

---

## Las 13 tools

Todas las tools de lectura aceptan `response_format: "markdown" | "json"`.

| Tool | Tipo | Descripción |
|---|---|---|
| `proton_list_folders` | read | Lista mailboxes (INBOX, Sent, Trash, labels, custom). |
| `proton_create_folder` | write | Crea un mailbox nuevo. |
| `proton_mailbox_status` | read | Contadores: total / unseen / recent. |
| `proton_list_emails` | read | Lista paginada de mensajes recientes. |
| `proton_search_emails` | read | Búsqueda con filtros combinables. |
| `proton_get_email` | read | Mensaje completo: headers, cuerpo, adjuntos. |
| `proton_get_attachment` | read | Adjunto en base64; `max_bytes` 10 MB default (cap 50 MB). |
| `proton_send_email` | write | Envía texto/HTML + adjuntos. |
| `proton_reply_email` | write | Responde preservando threading. |
| `proton_forward_email` | write | Reenvía con adjuntos opcionales. |
| `proton_flag_email` | write idempotent | read/unread/starred/unstarred/custom. |
| `proton_move_email` | write | Mueve entre mailboxes por UID. |
| `proton_delete_email` | destructive | `trash` (default) o `permanent`. |

---

## Calidad y seguridad

```bash
npm run typecheck
npm test
npm run smoke
npm run build
```

- TypeScript strict, tests con Vitest, smoke `stdio` en CI.
- Bearer timing-safe, origin allowlist, rate-limit 120/min/token.
- Per-session HTTP transport, sesiones idle evicted a los 30 min.
- Sin credenciales ni cuerpos de request en logs; stdout reservado a JSON-RPC en modo `stdio`.

---

## Licencia

[MIT](./LICENSE) — sin afiliación a Proton AG.
