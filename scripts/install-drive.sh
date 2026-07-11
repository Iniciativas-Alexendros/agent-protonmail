#!/usr/bin/env bash
# Instalador del CLI oficial de Proton Drive para Ubuntu/Debian.
# Uso: bash scripts/install-drive.sh
set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'
BOLD='\033[1m'

info() { echo -e "${CYAN}→${NC} $1"; }
ok() { echo -e "${GREEN}✓${NC} $1"; }
warn() { echo -e "${YELLOW}⚠${NC} $1"; }
err() { echo -e "${RED}✗${NC} $1"; }

info "Instalando Proton Drive CLI..."

# Detectar arquitectura
ARCH=$(uname -m)
case "$ARCH" in
  x86_64) URL="https://proton.me/download/drive/cli/linux/proton-drive" ;;
  aarch64) URL="https://proton.me/download/drive/cli/linux/aarch64/proton-drive" ;;
  *)
    err "Arquitectura no soportada: $ARCH"
    err "Descarga manual: https://proton.me/support/drive-cli"
    exit 1
    ;;
esac

TARGET="/usr/local/bin/proton-drive"

if command -v proton-drive &>/dev/null; then
  info "proton-drive ya está instalado en $(command -v proton-drive)"
  info "Versión: $(proton-drive --version 2>/dev/null || echo 'desconocida')"
  read -rp "$(echo -e "${YELLOW}?${NC} ¿Reemplazar? (s/N): ")" REPLACE
  if [[ ! "$REPLACE" =~ ^[Ss]$ ]]; then
    ok "Sin cambios"
    exit 0
  fi
fi

info "Descargando desde ${URL}..."
if wget -q "$URL" -O /tmp/proton-drive; then
  sudo mv /tmp/proton-drive "$TARGET"
  sudo chmod +x "$TARGET"
  ok "Instalado en ${BOLD}${TARGET}${NC}"
  VERSION=$(proton-drive --version 2>/dev/null || echo '?')
  ok "Versión: ${VERSION}"

  echo ""
  info "Autenticación (una sola vez):"
  echo "  ${BOLD}proton-drive auth login${NC}"
  echo "  → Se abre el navegador; autoriza el acceso."
  echo "  → Token persistido en ~/.config/proton-drive/"
  echo ""
  info "Verificación:"
  echo "  ${BOLD}proton-drive filesystem list /my-files --json${NC}"
else
  err "Error de descarga desde ${URL}"
  err "Descarga manual: https://proton.me/support/drive-cli"
  exit 1
fi
