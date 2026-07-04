# Roadmap de protonmail-mcp

Plan a alto nivel. No son compromisos firmes; las prioridades pueden cambiar según el contexto operativo. El detalle por versión publicada vive en `CHANGELOG.md`; las decisiones de fondo en `docs/adr/`.

## Estado actual

`v0.4.0` en desarrollo. El servidor expone 13 tools sobre Proton Mail Bridge con doble transporte (`stdio` + `streamable HTTP`), tests Vitest en verde, typecheck `strict`, build `tsc` y smoke `stdio` integrados en CI (matrix Node 20/22, `npm audit`, CodeQL).

## En curso · release gates

- [ ] Refactor de agnosticismo: eliminar acoplamiento a clientes específicos de IA y simplificar la documentación.
- [ ] Publicación estable en el MCP Registry (`io.github.Alexendros/protonmail-mcp`), consolidando el flujo de publicación.
- [ ] Verificación del workflow `release.yml` empujando a `ghcr.io/iniciativas-alexendros/protonmail-mcp:{sha,latest}`.

## Próximos · funcionalidad

- [ ] Tests E2E con Bridge de prueba (Greenmail + SMTP mock) para cubrir el camino IMAP/SMTP real sin cuenta productiva.
- [ ] `outputSchema` con `structuredContent` en las tools de lectura cuando el SDK lo materialice mejor.
- [ ] `proton_watch_inbox` con IDLE + webhook (flujos event-driven sin polling).
- [ ] Soporte multi-alias (Proton permite varias direcciones por cuenta).
- [ ] Configurabilidad del playbook de triaje por env vars.

## Próximos · hardening

- [ ] Bridge CA pinning opcional (`PROTON_BRIDGE_CA_PATH`) para cerrar `PROTON_BRIDGE_TLS_INSECURE` en producción estricta (mitiga T7).
- [ ] Human-in-the-loop forzado en tools destructivas (`proton_delete_email mode=permanent`) para acotar T4.
- [ ] Digest pinning de la imagen GHCR en despliegues Docker.

## Backlog

- [ ] Métricas/observabilidad del endpoint HTTP.
- [ ] Cliente fetch minimalista de ejemplo para Next.js / FastAPI / etc.

## Completado

- [x] 2026-05-18 · `v0.2.0`: identidad fijada en `protonmail-mcp`, sección "Marcas comerciales" en README.
- [x] 2026-05-02 · `v0.1.2`: casing canónico `Alexendros` para el MCP Registry.
- [x] 2026-05-01 · `v0.1.0`: primera release pública, 13 tools, doble transporte, bundle de gobernanza (CONTRIBUTING, SECURITY, CoC, templates).
- [x] 2026-05-29 · canon de documentación del repositorio aplicado.
- [x] 2026-07-04 · refactor de agnosticismo: README simplificado, conectores y playbooks genéricos, stack estabilizado a Node 22 LTS.
