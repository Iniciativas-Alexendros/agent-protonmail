import { createHash } from 'node:crypto'
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs'
import { resolve, extname, relative, dirname } from 'node:path'

export interface InventoryReport {
  totalFiles: number
  totalBytes: number
  byExt: Record<string, number>
  byDir: Record<string, number>
  files: {
    name: string
    path: string
    ext: string
    size: number
    modified: Date
  }[]
}

export interface DuplicateEntry {
  hash: string
  size: number
  files: { path: string; name: string }[]
}

export interface FormatReport {
  totalExtensions: number
  extensions: string[]
  obsoleteExtensions: string[]
  obsoleteFiles: { name: string; path: string; ext: string; size: number }[]
  noExtension: number
}

export interface OrganizeSuggestion {
  action: 'move' | 'rename'
  from: string
  to: string
  reason: string
}

export interface OrganizePlan {
  suggestions: OrganizeSuggestion[]
}

export class DriveAuditor {
  constructor(
    private obsoleteExtensions: string[],
    private log: {
      debug: (m: string, d?: unknown) => void
      info: (m: string, d?: unknown) => void
      error: (m: string, d?: unknown) => void
    },
  ) {}

  hashFile(filePath: string): string {
    const content = readFileSync(filePath)
    return createHash('sha256').update(content).digest('hex')
  }

  async scanInventory(stagingDir: string): Promise<InventoryReport> {
    const files: InventoryReport['files'] = []
    let totalBytes = 0

    const walk = (dir: string) => {
      for (const entry of readdirSync(dir)) {
        const full = resolve(dir, entry)
        try {
          const s = statSync(full)
          if (s.isDirectory()) walk(full)
          else {
            totalBytes += s.size
            files.push({
              name: entry,
              path: relative(stagingDir, full),
              ext: extname(entry).toLowerCase(),
              size: s.size,
              modified: s.mtime,
            })
          }
        } catch {
          /* skip */
        }
      }
    }
    if (existsSync(stagingDir)) walk(stagingDir)

    const byExt: Record<string, number> = {}
    const byDir: Record<string, number> = {}
    for (const f of files) {
      byExt[f.ext] = (byExt[f.ext] ?? 0) + 1
      const dir = dirname(f.path)
      byDir[dir === '.' ? '/' : dir] = (byDir[dir === '.' ? '/' : dir] ?? 0) + 1
    }

    return { totalFiles: files.length, totalBytes, byExt, byDir, files }
  }

  async findDuplicates(stagingDir: string): Promise<DuplicateEntry[]> {
    const hashMap = new Map<string, DuplicateEntry>()
    const walk = (dir: string) => {
      for (const entry of readdirSync(dir)) {
        const full = resolve(dir, entry)
        try {
          const s = statSync(full)
          if (s.isDirectory()) walk(full)
          else if (s.size > 0) {
            const hash = this.hashFile(full)
            if (!hashMap.has(hash)) {
              hashMap.set(hash, { hash, size: s.size, files: [] })
            }
            hashMap.get(hash)!.files.push({ path: full, name: entry })
          }
        } catch {
          /* skip */
        }
      }
    }
    if (existsSync(stagingDir)) walk(stagingDir)

    return Array.from(hashMap.values()).filter((e) => e.files.length > 1)
  }

  async formatReport(stagingDir: string): Promise<FormatReport> {
    const inv = await this.scanInventory(stagingDir)
    const obsoleteFiles = inv.files.filter((f) =>
      this.obsoleteExtensions.includes(f.ext),
    )
    const extensions = [...new Set(inv.files.map((f) => f.ext))]
      .filter(Boolean)
      .sort()
    const noExtension = inv.files.filter((f) => !f.ext).length

    return {
      totalExtensions: extensions.length,
      extensions,
      obsoleteExtensions: [...this.obsoleteExtensions],
      obsoleteFiles: obsoleteFiles.map((f) => ({
        name: f.name,
        path: f.path,
        ext: f.ext,
        size: f.size,
      })),
      noExtension,
    }
  }

  async buildOrganizePlan(stagingDir: string): Promise<OrganizePlan> {
    const inv = await this.scanInventory(stagingDir)
    const suggestions: OrganizeSuggestion[] = []

    const extDirs: Record<string, string> = {
      '.md': 'docs',
      '.txt': 'docs',
      '.doc': 'docs/old',
      '.pdf': 'docs',
      '.jpg': 'images',
      '.jpeg': 'images',
      '.png': 'images',
      '.gif': 'images',
      '.svg': 'images',
      '.mp4': 'media',
      '.mov': 'media',
      '.avi': 'media',
      '.mp3': 'audio',
      '.wav': 'audio',
      '.flac': 'audio',
      '.zip': 'archives',
      '.tar': 'archives',
      '.gz': 'archives',
      '.csv': 'data',
      '.json': 'data',
      '.xml': 'data',
    }

    for (const f of inv.files) {
      const targetDir = extDirs[f.ext]
      if (targetDir && dirname(f.path) !== targetDir) {
        suggestions.push({
          action: 'move',
          from: f.path,
          to: `${targetDir}/${f.name}`,
          reason: `Move ${f.ext} file to ${targetDir}/`,
        })
      }
    }

    return { suggestions }
  }
}
