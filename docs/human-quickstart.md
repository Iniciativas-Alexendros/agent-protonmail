# Quickstart para humanos — Proton Mail MCP

Este documento te lleva de cero a "leer el inbox con un agente IA" en 10 minutos.

## Qué necesitas

- **Node ≥ 22** instalado en tu máquina.
- Una cuenta **Proton Mail**.
- **Proton Mail Bridge** headless instalado (`protonmail-bridge-core` en Arch/EndeavourOS; en otros sistemas usa el paquete oficial de Proton).

## 1. Arrancar Proton Mail Bridge

```bash
protonmail-bridge-core --cli
```

Dentro de la consola de Bridge:

```text
>>> login      # introduce tu cuenta Proton, contraseña y 2FA
>>> info       # copia el campo "Password" (bridge password, no tu password Proton)
>>> exit
```

Verifica que escucha en local:

```bash
ss -ltn | grep -E '127.0.0.1:1143'
```

## 2. Instalar el MCP

Opción A: usar el paquete npm (recomendado):

```bash
npx -y @alexendros/protonmail-mcp
```

Opción B: clonar y construir:

```bash
git clone https://github.com/Iniciativas-Alexendros/protonmailbrige-mcptool.git
cd protonmailbrige-mcptool
npm install
npm run build
```

## 3. Configurar tu agente

Añade esto a la configuración MCP de tu agente (formato genérico):

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

## 4. No guardes el bridge password en claro

Copia [`connectors/stdio-wrapper.sh.example`](../connectors/stdio-wrapper.sh.example) a tu máquina, rellena tus datos y el puntero a tu gestor de secretos, y usa el wrapper como `command` del MCP en lugar de `npx`. Así el password nunca toca el disco del cliente.

## 5. Primer uso

Reinicia tu agente para que registre el MCP. Luego prueba:

- "¿Qué correos tengo en el inbox?"
- "Resume los correos no leídos de la última semana."
- "¿Hay algo importante de banca o administraciones?"

El agente llamará a `proton_list_folders` y `proton_list_emails` automáticamente.

## 6. Siguientes pasos

- Para workflows automáticos: [`playbooks/triage-email.md`](../playbooks/triage-email.md).
- Para desplegar en servidor: [`deployment-http-docker.md`](./deployment-http-docker.md).
- Para problemas con Bridge: [`bridge-core.md`](./bridge-core.md).
