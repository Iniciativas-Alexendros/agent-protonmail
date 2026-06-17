# Configuración stdio segura: bridge password _just-in-time_

Este documento describe el patrón **recomendado** para conectar el MCP a Claude Code en
modo **stdio** sin dejar el bridge password en claro en ningún fichero del cliente.

Es el **modo primario** de uso local. El modo HTTP/Docker queda como modo avanzado,
documentado en [`deployment-http-docker.md`](./deployment-http-docker.md).

## 1. El problema: secretos en el `mcp.json`

La forma ingenua de registrar el MCP es poner las env vars directamente en el `mcp.json`
del cliente:

```jsonc
// NO HAGAS ESTO
{
  "mcpServers": {
    "protonmail-mcp": {
      "command": "node",
      "args": ["/ruta/dist/index.js"],
      "env": {
        "PROTON_BRIDGE_USER": "you@proton.me",
        "PROTON_BRIDGE_PASS": "el-bridge-password-en-claro", // ← secreto en disco
      },
    },
  },
}
```

Problemas:

- El **bridge password queda en claro** en un fichero de configuración del cliente, a
  menudo sincronizado o respaldado.
- Cada **re-login regenera el bridge password** (ver [`bridge-core.md`](./bridge-core.md)
  §7), así que ese valor en claro caduca y hay que editarlo a mano.
- El fichero del cliente no es el lugar para gestionar rotación de secretos.

## 2. La solución: un wrapper script como `command`

En lugar de `node` directo, se registra como `command` del MCP un **wrapper shell** que:

1. Exporta las env vars **no secretas** (host, puertos, usuario, transporte).
2. Resuelve `PROTON_BRIDGE_PASS` **just-in-time** desde un gestor de secretos, por
   **puntero** (nunca el valor literal).
3. Lanza el MCP heredando ese entorno.

El `mcp.json` queda **sin secretos**:

```jsonc
{
  "mcpServers": {
    "protonmail-mcp": {
      "command": "/ruta/a/protonmail-mcp-stdio.sh",
    },
  },
}
```

Todo el conocimiento de credenciales vive en el wrapper + el gestor de secretos, no en
la config del cliente.

## 3. Resolución _just-in-time_ por puntero

El bridge password se referencia con un **puntero** a un gestor de secretos genérico, de
la forma:

```text
pass://<share-id>/<item-id>/<campo>
```

El gestor (un CLI tipo `pass-cli`, o equivalente) recibe ese puntero y devuelve el valor
real **en el momento del arranque**, sin que el secreto toque nunca el disco del cliente
ni el `mcp.json`. Como solo se guarda el **puntero**, cuando el bridge password rota solo
hay que actualizar el valor en el gestor: el puntero no cambia.

## 4. stdout limpio: logs a stderr

**Regla dura del transporte stdio**: el `stdout` del proceso es el **canal JSON-RPC**.
Cualquier byte que no sea JSON-RPC en stdout **corrompe** la sesión MCP y el cliente la
rechaza.

Por tanto:

- Todo log, banner o mensaje de _bootstrap_ del gestor de secretos debe ir a **stderr**
  (`>&2`), nunca a stdout.
- El wrapper no debe imprimir nada en stdout antes de `exec` del MCP.
- Si el gestor de secretos es verboso por defecto, redirige su salida informativa a
  stderr explícitamente.

## 5. Env-file efímero con `mktemp` + `trap`

Cuando el gestor de secretos consume un **env-file** (en vez de inyectar variables
directamente), créalo de forma **efímera** y **bórralo siempre**:

- Crea el fichero con `mktemp` (permisos restrictivos del usuario).
- Registra un `trap '... EXIT'` que lo borra al salir, **pase lo que pase** (éxito,
  error o señal).
- El env-file solo contiene **punteros**, no valores: `PROTON_BRIDGE_PASS=pass://...`.

Así el secreto resuelto nunca persiste y el env-file de punteros se autodestruye.

## 6. Ejemplo de wrapper completo (con placeholders)

> Plantilla de referencia: **`plugins/protonmail-mcp/scripts/protonmail-mcp-stdio.sh.example`**.
> Cópiala, sustituye los placeholders por tus rutas/punteros reales y regístrala como
> `command` del MCP.

```bash
#!/usr/bin/env bash
# protonmail-mcp-stdio.sh — wrapper stdio seguro para el MCP de Proton Mail.
#
# Resuelve PROTON_BRIDGE_PASS just-in-time desde un gestor de secretos por puntero.
# El stdout queda limpio (solo JSON-RPC); todo log/bootstrap va a stderr.
set -euo pipefail

# --- Rutas (ajusta a tu instalación) ---
MCP_ENTRY="/ruta/a/protonmail-mcp/dist/index.js"

# --- Env vars NO secretas ---
export PROTON_BRIDGE_USER="you@proton.me"
export PROTON_MAIL_FROM="you@proton.me"
export PROTON_BRIDGE_HOST="127.0.0.1"
export PROTON_BRIDGE_IMAP_PORT="1143"
export PROTON_BRIDGE_SMTP_PORT="1025"
export PROTON_BRIDGE_TLS_INSECURE="true"
export MCP_TRANSPORT="stdio"

# --- Env-file efímero de PUNTEROS (no valores) ---
ENV_FILE="$(mktemp)"
trap 'rm -f "$ENV_FILE"' EXIT
cat > "$ENV_FILE" <<'EOF'
PROTON_BRIDGE_PASS=pass://<share-id>/<item-id>/<campo>
EOF

# --- Bootstrap del gestor: TODO a stderr (>&2) para no ensuciar stdout ---
echo "[protonmail-mcp] resolviendo secretos JIT…" >&2

# El gestor de secretos resuelve los punteros del env-file y ejecuta el MCP.
# `exec` reemplaza el shell: el MCP hereda stdin/stdout/stderr directamente,
# manteniendo el canal JSON-RPC en stdout intacto.
exec pass-cli run --env-file "$ENV_FILE" -- node "$MCP_ENTRY"
```

Puntos clave del ejemplo:

- **`exec`** entrega el control al MCP sin un proceso shell intermedio: stdout llega
  limpio al cliente.
- El env-file solo contiene el **puntero** `pass://<share-id>/<item-id>/<campo>`, nunca
  el bridge password real.
- `mktemp` + `trap ... EXIT` garantizan que el env-file se borra siempre.
- El email es el placeholder `you@proton.me`; sustitúyelo por tu cuenta real **en tu
  copia local**, no en el repo.
