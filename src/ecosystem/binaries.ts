export type Product = 'bridge' | 'pass' | 'drive' | 'gpg'

export interface BinaryInfo {
  name: string
  product: Product
  defaultBin: string
  installUrl: string
  versionCmd: string[]
  healthCmd?: string[]
  envVar?: string
  envPrefix?: string
}

export interface InstallationGuide {
  product: Product
  steps: string[]
}

export interface BinaryVersion {
  name: string
  product: Product
  installed: boolean
  version?: string
  authenticated?: boolean
  inPath: boolean
  path?: string
  error?: string
}

export const REGISTRY: BinaryInfo[] = [
  {
    name: 'Proton Mail Bridge',
    product: 'bridge',
    defaultBin: 'protonmail-bridge-core',
    installUrl: 'https://proton.me/mail/bridge',
    versionCmd: ['--version'],
    envVar: 'PROTON_BRIDGE_USER',
    envPrefix: 'PROTON_BRIDGE',
  },
  {
    name: 'pass (password-store)',
    product: 'pass',
    defaultBin: 'pass',
    installUrl: 'https://www.passwordstore.org/',
    versionCmd: ['--version'],
    envVar: 'PASSWORD_STORE_DIR',
    envPrefix: 'PROTON_PASS',
  },
  {
    name: 'Proton Drive CLI',
    product: 'drive',
    defaultBin: 'proton-drive',
    installUrl: 'https://proton.me/support/drive-cli',
    versionCmd: ['--version'],
    healthCmd: ['auth', 'status'],
    envVar: 'DRIVE_CLI_BIN',
    envPrefix: 'DRIVE',
  },
  {
    name: 'GnuPG',
    product: 'gpg',
    defaultBin: 'gpg',
    installUrl: 'https://gnupg.org/download/',
    versionCmd: ['--version'],
  },
]

export function getBinaryInfo(product: Product): BinaryInfo | undefined {
  return REGISTRY.find((r) => r.product === product)
}

export function installationGuide(product: Product): InstallationGuide {
  if (product === 'bridge') {
    return {
      product,
      steps: [
        'Descarga Proton Mail Bridge desde https://proton.me/mail/bridge',
        'En Arch/EndeavourOS: sudo pacman -S protonmail-bridge-core',
        'En Debian/Ubuntu: instala el .deb oficial de Proton.',
        'Ejecuta: protonmail-bridge-core --cli → login → credenciales → exit',
      ],
    }
  }
  if (product === 'pass') {
    return {
      product,
      steps: [
        'En Arch/EndeavourOS: sudo pacman -S pass',
        'En Debian/Ubuntu: sudo apt install pass',
        'En macOS: brew install pass',
        'Inicializa: gpg --gen-key && pass init <gpg-id>',
      ],
    }
  }
  if (product === 'drive') {
    return {
      product,
      steps: [
        'Descarga el binario oficial proton-drive desde https://proton.me/support/drive-cli',
        'O usa el Dockerfile del proyecto que lo descarga automáticamente.',
      ],
    }
  }
  return {
    product,
    steps: ['Instala GnuPG desde https://gnupg.org/download/'],
  }
}
