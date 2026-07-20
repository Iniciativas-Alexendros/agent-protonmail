---
name: security-incident-response
description: Responde a incidentes de seguridad que afectan múltiples productos de Proton Suite (filtración de credenciales, brecha detectada en Pass, acceso no autorizado a Drive).
---

# Security Incident Response — Respuesta a incidentes multi-producto

**Objetivo:** coordinar la respuesta ante incidentes de seguridad que afectan a Mail, Pass o Drive de forma simultánea. Contener, evaluar daño, rotar credenciales y documentar.

## Precondiciones

- Suite configurada (Mail + Pass + Drive opcional).
- Bridge reachable.
- Alerta emitida por el agente o reporte externo.
- `AGENT_DRY_RUN=true` por defecto.

## Reglas de ejecución

1. **Nunca rotar credenciales automáticamente** — el agente identifica; el operador rota.
2. **Aislar antes de investigar:** mover correos sospechosos a `Fraud/Review` antes de analizar.
3. **No compartir evidencias por email** — usar canal fuera de banda (Signal, Telegram, llamada).
4. **Documentar todo** — cada acción queda registrada en `logs/incidents-*.jsonl`.

## Flujo

### 1. Evaluación inicial

Ejecutar diagnóstico completo del estado de la suite:

```bash
npx -y @alexendros/protonsuite-agent suite-status
```

Esto reporta: conectividad Mail, estado Pass (entradas, duplicados), y disponibilidad Calendar/Drive.

### 2. Auditoría de Pass (credenciales comprometidas)

```bash
npx -y @alexendros/protonsuite-agent pass-audit
```

Si se detectan credenciales débiles o duplicadas:

| Hallazgo | Acción | Prioridad |
|----------|--------|-----------|
| Contraseña débil (< 60 bits) | Rotar manualmente desde Pass CLI | Alta |
| Entrada duplicada | Fusionar/eliminar duplicado | Media |
| Entrada sin rotar > 1 año | Programar rotación | Media |

### 3. Auditoría de Drive (acceso no autorizado)

```bash
npx -y @alexendros/protonsuite-agent drive-audit
```

| Hallazgo | Acción | Prioridad |
|----------|--------|-----------|
| Archivos modificados sin actividad conocida | Revisar access log | Alta |
| Archivos subidos por IP desconocida | Rotar sesiones de Bridge | Alta |
| Staging inconsistente | Reconciliar con Drive remoto | Media |

### 4. Escenario: Credencial de Bridge filtrada

Si `PROTON_BRIDGE_PASS` o `PROTON_BRIDGE_USER` están comprometidos:

| Paso | Acción | Comando |
|------|--------|---------|
| 1 | Revocar sesión Bridge | `protonmail-bridge-core --cli session revoke --all` |
| 2 | Regenerar Bridge password | `protonmail-bridge-core --cli password --set` |
| 3 | Actualizar entorno | Exportar nuevo `PROTON_BRIDGE_PASS` |
| 4 | Verificar conectividad | `npx -y @alexendros/protonsuite-agent check-imap` |
| 5 | Rotar contraseñas de cuenta | Desde web de Proton (no desde el agente) |

### 5. Escenario: Brecha en Pass vault

Si el vault de Proton Pass local tiene entradas modificadas o accesos no autorizados:

| Paso | Acción |
|------|--------|
| 1 | Ejecutar `pass-audit` para inventario completo |
| 2 | Identificar entradas tocadas recientemente |
| 3 | Rotar TODAS las contraseñas de entradas afectadas |
| 4 | Verificar que Pass CLI usa conexión cifrada (`pass ls` sobre local socket) |
| 5 | Activar 2FA en cuenta Proton si no está activo |

### 6. Escenario: Alerta de phishing masiva (>5 correos en <1h)

| Paso | Acción | Responsable |
|------|--------|-------------|
| 1 | Alertar al operador con listado de UIDs | Agente |
| 2 | Mover a `Fraud/Review` (solo tras OK) | Agente + Operador |
| 3 | Extraer dominios comunes de los remitentes | Agente |
| 4 | Buscar otros correos de esos dominios en INBOX | Agente |
| 5 | Notificar a otros usuarios si es multi-target | Operador |

```bash
# Ejecutar barrido de amenazas
npx -y @alexendros/protonsuite-agent alert

# Extraer dominios comunes (post-move a Fraud/Review)
proton_list_emails Fraud/Review maxResults=50 | grep -oP '@\K[^\s>]+' | sort | uniq -c | sort -rn
```

### 7. Post-mortem y cierre

Registrar en `logs/incidents-YYYY-MM-DD.jsonl`:

```json
{
  "incident_id": "INC-2026-001",
  "type": "bridge_credential_leak",
  "severity": "critical",
  "detected_at": "2026-07-20T10:30:00Z",
  "contained_at": "2026-07-20T10:45:00Z",
  "resolved_at": "2026-07-20T11:00:00Z",
  "affected_products": ["mail", "pass"],
  "actions": [
    "bridge_session_revoked",
    "bridge_password_rotated",
    "pass_audit_completed",
    "credentials_rotated"
  ],
  "root_cause": "Filtración de PROTON_BRIDGE_PASS en log de CI",
  "prevention": "Añadir PROTON_BRIDGE_PASS a .gitignore y rotar secreto de CI"
}
```

## Contactos de escalado

| Rol | Contacto | Canal |
|-----|----------|-------|
| Operador del agente | `ALERT_WEBHOOK_URL` configurado | Webhook / ntfy |
| Soporte Proton (brecha de cuenta) | support@proton.me | Email cifrado |
| Autor del playbook | Ver CODEOWNERS | GitHub |

## Referencias

- [Phishing response playbook](./phishing-response.md) — respuesta a phishing individual
- [Fraud detection playbook](./fraud-detection.md) — detección de amenazas
- [Pass audit playbook](./pass-audit.md) — auditoría de vault Pass
- [Drive audit docs](../docs/drive-audit.md) — auditoría de Drive staging
