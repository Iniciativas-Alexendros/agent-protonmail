import { accessSync } from 'node:fs'
import { resolve } from 'node:path'

export function whichSync(name: string): string {
  const pathDirs = (process.env.PATH ?? '').split(':')
  for (const dir of pathDirs) {
    const candidate = resolve(dir, name)
    try {
      accessSync(candidate)
      return candidate
    } catch {
      continue
    }
  }
  throw new Error(`${name} not found in PATH`)
}

export function detectPlatform(): string | undefined {
  if (process.platform === 'darwin') return 'macos'
  if (process.platform !== 'linux') return undefined
  try {
    accessSync('/etc/arch-release')
    return 'arch'
  } catch {
    try {
      accessSync('/etc/debian_version')
      return 'debian'
    } catch {
      return undefined
    }
  }
}

export const Platform = detectPlatform()
