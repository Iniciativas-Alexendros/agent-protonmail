import { Platform } from '../which.js'
import type { BinaryInfo, InstallationGuide } from './binaries.js'
import { installationGuide } from './binaries.js'

export interface InstallResult {
  product: string
  ok: boolean
  message: string
  steps?: string[]
}

export function buildInstallPlan(bin: BinaryInfo): InstallResult {
  const guide: InstallationGuide = installationGuide(bin.product)
  return {
    product: bin.product,
    ok: false,
    message: `Installation of ${bin.name} requires manual steps`,
    steps: guide.steps,
  }
}

export function platformPackage(bin: BinaryInfo): string | null {
  if (Platform === 'arch') {
    if (bin.product === 'bridge') return 'protonmail-bridge-core'
    if (bin.product === 'pass') return 'pass'
    if (bin.product === 'gpg') return 'gnupg'
  }
  if (Platform === 'debian') {
    if (bin.product === 'pass') return 'pass'
    if (bin.product === 'gpg') return 'gnupg2'
  }
  if (Platform === 'macos') {
    if (bin.product === 'pass') return 'pass'
    if (bin.product === 'gpg') return 'gnupg'
  }
  return null
}
