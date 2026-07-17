#!/usr/bin/env bash
# E2E test: PassClient contra un store GPG real.
# Requiere gpg y pass instalados en el runner.
set -euo pipefail
cd "$(dirname "$0")/.."

# Verificar prerequisitos
for cmd in gpg pass; do
  if ! command -v "$cmd" &>/dev/null; then
    echo "ERROR: $cmd not found in PATH" >&2
    exit 1
  fi
done

GNUPGHOME=$(mktemp -d)
PASSWORD_STORE_DIR=$(mktemp -d)
export GNUPGHOME PASSWORD_STORE_DIR

cleanup() {
  rm -rf "$GNUPGHOME" "$PASSWORD_STORE_DIR"
  gpgconf --kill gpg-agent 2>/dev/null || true
}
trap cleanup EXIT

gpg --batch --passphrase '' --quick-gen-key pass-e2e@test.local default default 0
pass init pass-e2e@test.local

npx vitest run --config vitest.e2e.config.ts tests/e2e/pass.e2e.ts
