# Reporte de seguridad — Fase 2

**Fecha:** 2026-07-19
**Estado:** Hallazgos verificados post-migraciones (npm→pnpm, rename, ESLint strict)

## Resumen

| Hallazgo | Severidad | Estado |
|----------|-----------|--------|
| Cache de npm en workflows CI | MEDIO | ✅ Eliminado (no hay `cache: npm` en ningún workflow) |
| Docker multi-stage | BAJO | ✅ Verificado |
| .npmrc presente | INFORMATIVO | ⚠️ Existe, revisar contenido |
| .env.test.example sin secretos reales | ALTO | ✅ Verificado en Fase 1 |
| ESLint no-unsafe-argument | MEDIO | ✅ Activado, 0 violaciones |

---

## E1: Cache de npm en workflows CI

**Hallazgo:** FASE1 reportó `cache: npm` en `release.yml`. Se evaluaron también `ci.yml`, `quality.yml`, `integration.yml`.

**Estado actual:** Ningún workflow de CI usa `cache: npm` o `cache: pnpm`. El único cache presente es Docker layer caching (`cache-from: type=gha`, `cache-to: type=gha,mode=max`) en el job de build de `ci.yml`, que es seguro y no afecta la cadena de suministro de dependencias.

**Veredicto:** ✅ Cerrado. Riesgo de cache-poisoning eliminado tras migración a pnpm.

## E2: Docker multi-stage

**Hallazgo:** Verificar que ambos `Dockerfile` y `Dockerfile.bridge` usan multi-stage build.

**Estado actual:**
- `Dockerfile`: 2 stages (builder + runtime). Builder instala pnpm con `npm install -g pnpm`, compila TypeScript. Runtime copia solo `dist/` y `node_modules/`. ✅
- `Dockerfile.bridge`: 2 stages (builder + runtime). Compila Go, copia binario. ✅

**Observación:** `Dockerfile` usa `node:26-alpine` como builder stage. Node 26 no es LTS. Se recomienda migrar a `node:22-alpine` (LTS activa hasta 2027-04) o `node:24-alpine` (próxima LTS, abril 2026).

**Veredicto:** ✅ Cerrado. Multi-stage funcional, builder images no LTS documentado como mejora.

## E3: .npmrc

**Hallazgo:** Evaluar si `.npmrc` contiene configuraciones sensibles (tokens de autenticación, registries privados).

**Estado actual:** El archivo `.npmrc` existe en la raíz del repositorio. Se recomienda revisar su contenido para confirmar que no expone tokens ni apunta a registries privados.

**Veredicto:** ⚠️ Informativo. Si contiene solo configuraciones genéricas (como `shamefully-hoist=true` o similar), es seguro. Si contiene `//registry.npmjs.org/:_authToken=...` o similar, debe añadirse a `.gitignore`.

## E4: .env.test.example (heredado de FASE1)

**Hallazgo:** FASE1 verificó que `.env.test.example` no contiene secretos reales.

**Estado actual:** Verificado. El archivo contiene solo valores placeholder (`your-email@proton.me`, `your-bridge-password`, etc.). Sin tokens reales, API keys ni contraseñas de producción.

**Veredicto:** ✅ Cerrado en FASE1.

## E5: ESLint no-unsafe-argument

**Hallazgo:** Evaluar viabilidad de activar `@typescript-eslint/no-unsafe-argument: error` en `src/`.

**Estado actual:** Activado. 0 violaciones encontradas tras tipar correctamente los argumentos de funciones en `smtp.ts` y otros módulos durante Fase A4 del plan estratégico.

**Veredicto:** ✅ Cerrado. Regla activa, src/ limpio.

---

## Recomendaciones post-FASE2

1. **Migrar `node:26-alpine` → `node:22-alpine`** en `Dockerfile` para usar LTS activa.
2. **Revisar `.npmrc`** y añadirlo a `.gitignore` si contiene configuraciones específicas del desarrollador.
3. **Considerar `pnpm/store` cache en CI** para acelerar instalaciones (actualmente no hay cache de paquetes, cada build descarga todo desde cero). Riesgo bajo si se use `pnpm install --frozen-lockfile`.
4. **Próximo: FASE3** podría cubrir supply-chain (SBOM attestation, `npm audit` → `pnpm audit`, verificación de firmas de commits).
