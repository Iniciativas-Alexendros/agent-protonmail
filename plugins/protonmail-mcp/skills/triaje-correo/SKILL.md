---
name: triaje-correo
description: Revisión y triaje del correo ProtonMail vía el MCP protonmail-mcp (Bridge local IMAP). Usar cuando el operador pida "revisa el correo", "triaje de mails", "resume los correos", "limpia la basura comercial", "qué hay en el inbox", "vacía promociones", o cualquier revisión/limpieza de la bandeja de Proton. Clasifica INBOX, resume los relevantes y mueve la basura comercial a Folders/Marketing-Promo. SIEMPRE dry-run antes de mover.
---

# Triaje de correo ProtonMail

Revisa el INBOX de Proton Mail, **resume los correos relevantes** y **aparta la basura comercial** moviéndola a `Folders/Marketing-Promo`. Opera contra el MCP `protonmail-mcp` (Proton Bridge local, IMAP `127.0.0.1:1143`).

## Precondiciones (verificar antes de empezar)

1. **Bridge vivo:** `ss -ltn | grep -E '127.0.0.1:1143'` debe listar el puerto. Si no, el bridge no corre → avisar al operador para que lance `protonmail-bridge-core --cli` (necesita su login/2FA).
2. **MCP conectado:** las tools `proton_*` deben estar disponibles en la sesión. Si no aparecen, la sesión de Claude se lanzó antes de registrar el MCP → reiniciar sesión. El transporte stdio lo aporta el wrapper stdio registrado en tu cliente (ver `docs/local-stdio-secrets.md`), que inyecta las credenciales del Bridge de forma segura fuera del repo.
3. **Llamar SIEMPRE `proton_list_folders` primero** (lo exige el propio MCP) para confirmar la taxonomía antes de mover nada.

## Regla de oro — UIDs, no sequence numbers

El MCP avisa: **usar UIDs (no números de secuencia)** al mover/marcar. `proton_search_emails` y `proton_list_emails` devuelven UIDs; `proton_move_email` los consume. No reordenar ni cachear UIDs entre pasadas (cambian si llega correo).

## Flujo en dos modos

### MODO DRY-RUN (predeterminado, SIEMPRE primero)

No mueve nada. Clasifica y **reporta qué movería**.

1. `proton_list_folders` → confirmar que `Folders/Marketing-Promo` existe.
2. `proton_list_emails` sobre `INBOX` (paginar; el INBOX puede tener cientos). Recoger: UID, remitente, asunto, fecha, flags, y si hay header `List-Unsubscribe`.
3. Clasificar cada correo con los **criterios de abajo**.
4. Emitir tabla markdown:
   - **RELEVANTES** (se quedan): remitente · asunto · 1 línea de qué es · acción sugerida.
   - **COMERCIAL → mover** (candidatos): remitente · asunto · motivo de clasificación.
   - **DUDOSOS** (no tocar): los que no superan el umbral de confianza → quedan en INBOX.
5. Resumen de conteos: `relevantes N · comercial M · dudosos K · total = INBOX`.
6. **Parar.** Pedir OK explícito del operador antes del modo APPLY.

### MODO APPLY (solo tras OK explícito del operador)

1. Re-listar INBOX (los UIDs pueden haber cambiado desde el dry-run) y re-clasificar.
2. Para cada candidato COMERCIAL confirmado: `proton_move_email` con su UID → `Folders/Marketing-Promo`.
3. **Nunca** `proton_delete_email`. Mover ≠ borrar. Reversible arrastrando de vuelta.
4. Verificación post:
   - `proton_mailbox_status INBOX` y `proton_mailbox_status Folders/Marketing-Promo`.
   - Cuadrar: `movidos + restantes_INBOX == total_inicial`. Si no cuadra, **parar y reportar**.
5. Emitir el **resumen de relevantes** (el producto que el operador quiere leer).

## Criterios de clasificación

**COMERCIAL (mover) — requiere ≥1 señal fuerte O ≥2 débiles:**

- Señal fuerte: header `List-Unsubscribe` presente + remitente `no-reply@`/`newsletter@`/`marketing@`/`info@` de dominio de marca.
- Señal fuerte: asunto con patrón promo claro (`% dto`, `oferta`, `rebajas`, `Black Friday`, `última oportunidad`, `cupón`, `descuento exclusivo`).
- Débiles: remitente de plataforma de email marketing (mailchimp, sendgrid, sendinblue, hubspot, mailgun en `Return-Path`); frecuencia alta del mismo remitente; sin destinatario personal (va a lista).

**RELEVANTE (NO mover — ante la duda, se queda):**

- **Transaccional:** facturas, recibos, confirmaciones de pedido/pago, OTP, alertas de seguridad, restablecer contraseña, avisos de banca. NUNCA mover aunque traiga `List-Unsubscribe`.
- **Personal/humano:** remitente persona (no `no-reply`), hilo con respuestas, te menciona por nombre.
- **Cuenta/servicio activo:** renovaciones, vencimientos, cambios de servicio que usas (no su newsletter).
- **Administración/legal/salud:** cualquier cosa de `Folders/Admin-Estado`, `Abogados`, `Salud`, `Banca-Pagos` por naturaleza → relevante.

**DUDOSO (no tocar):** si no hay confianza alta de que es comercial → se queda en INBOX. **Cero falsos positivos sobre transaccional/personal** es el criterio de seguridad que manda sobre la exhaustividad.

## Validadores (gate del ensamblado)

- **estabilidad:** flujo completo sin excepción de tool; carpeta destino existe.
- **calidad:** en dry-run, el operador valida una muestra de ~20 → ≥90% acierto, **0 falsos positivos** sobre transaccional/personal.
- **seguridad:** ningún `proton_delete_email`; solo `proton_move_email`; conteo pre/post cuadra; operación reversible.

## Herramientas MCP usadas

`proton_list_folders` · `proton_mailbox_status` · `proton_list_emails` · `proton_search_emails` · `proton_get_email` (para inspeccionar dudosos) · `proton_move_email` (solo APPLY). **Prohibida** `proton_delete_email` en este flujo.
