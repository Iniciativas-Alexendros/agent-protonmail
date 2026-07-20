---
name: phishing-response
description: Responde a un incidente de phishing confirmado. Contiene, analiza, recolecta evidencia y notifica al operador. Nunca responde automáticamente al remitente.
---

# Phishing Response — Respuesta a incidentes de phishing

**Objetivo:** contener un ataque de phishing confirmado, preservar evidencia forense y notificar al operador sin exponer datos sensibles a terceros.

## Precondiciones

- Incidente detectado por alertas del agente (`proton_agent_plan alert`) o notificación del operador.
- UID(s) del correo(s) sospechoso(s) identificados.
- Modo dry-run por defecto; solo se aplican acciones tras aprobación explícita.

## Reglas de oro

1. **Nunca responder al remitente** — verificarlo por otro canal si es necesario.
2. **No hacer clic en enlaces** — extraer dominios sin resolverlos.
3. **Preservar cabeceras completas** (`proton_get_email` con `includeRawHeaders: true`) antes de mover nada.
4. **No borrar** — mover a `Fraud/Review`; el borrado destruye evidencia.
5. **Operador decide** — el agente informa y propone; el humano autoriza.

## Flujo

### Fase 1 — Contención (inmediata)

```bash
# 1. Identificar el correo sospechoso
npx -y @alexendros/protonsuite-agent alert

# 2. Extraer cabeceras completas para forensia
proton_get_email INBOX <UID> includeRawHeaders=true

# 3. Mover a Fraude/Review (solo tras OK del operador)
proton_move_email INBOX <UID> Fraud/Review
```

### Fase 2 — Análisis forense

Con el correo en `Fraud/Review`, extraer:

| Elemento | Qué buscar | Herramienta |
|----------|-----------|-------------|
| **Remitente real** | `Return-Path`, `Received` headers (spooffing de `From`) | Cabeceras raw |
| **Enlaces** | Dominio(s), subdominios, uso de acortadores | `proton_get_email` body |
| **Adjuntos** | Tipo MIME real (`.exe` camuflado como `.pdf`), hash SHA-256 | Cabeceras + hash local |
| **Firma DKIM/SPF** | `Authentication-Results: ...` pass/fail/spoof | Cabeceras raw |
| **Huella** | Asunto exacto, remitente, fecha, Message-ID | Para correlación con otros usuarios |

```bash
# Generar hash del adjunto para IOC (Indicators of Compromise)
sha256sum /tmp/attachment_sample.bin

# Verificar autenticación del remitente
proton_get_email Fraud/Review <UID> | grep -E 'Authentication-Results|DKIM|SPF'
```

### Fase 3 — Documentación del IOC

Registrar en `logs/iocs-YYYY-MM-DD.jsonl`:

```json
{
  "timestamp": "2026-07-20T10:30:00Z",
  "type": "phishing",
  "source": "email",
  "indicators": {
    "from": "soporte@proton-charge-falso.com",
    "subject": "Factura pendiente — acción requerida",
    "messageId": "<abc123@mx.proton-charge-falso.com>",
    "urls": ["hxxps://proton-charge-falso.com/login"],
    "attachments": ["factura.pdf.exe"],
    "dkim": "fail",
    "spf": "fail"
  },
  "severity": "critical",
  "action": "moved_to_Fraud_Review",
  "notified": true
}
```

### Fase 4 — Notificación

| Canal | Mensaje | Contenido |
|-------|---------|-----------|
| **stderr/log** | Alerta local | `[CRITICAL] Phishing detectado: asunto, remitente, severidad` |
| **Webhook** | `ALERT_WEBHOOK_URL` | JSON con UID, tipo, indicadores (sin body) |
| **ntfy** | `ALERT_NTFY_TOPIC` | Resumen legible: tipo, remitente, severidad |

### Fase 5 — Post-mortem (tras resolución)

1. **Verificar si hay más correos del mismo remitente:**
   ```bash
   proton_search_emails INBOX from:"dominio-falso.com"
   ```

2. **Actualizar reglas de detección** (añadir dominio a blacklist local si existe).

3. **Cerrar incidente** en log:
   ```bash
   echo '{"resolution":"phishing_confirmed","uid":<UID>,"closed_at":"..."}' >> logs/resolved-iocs.jsonl
   ```

## Matriz de decisión

| Escenario | Acción inmediata | Acción diferida |
|-----------|-----------------|-----------------|
| Phishing confirmado | Mover a `Fraud/Review` + cabeceras raw | Notificar operador + registrar IOC |
| Sospecha no confirmada | Dejar en INBOX + marcar como alerta | Revisar en 24h |
| Spam comercial | Mover a `Spam` | No requiere forensia |
| Falsa alarma | Mover de vuelta a INBOX | Documentar falso positivo |

## Referencias

- [Fraud detection playbook](./fraud-detection.md) — detección preliminar y clasificación de amenazas
- `logs/alerts-*.jsonl` — alertas generadas
- `logs/iocs-*.jsonl` — indicadores documentados
