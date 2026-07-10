/**
 * Proton Drive client base — wraps rclone.
 *
 * Las operaciones de Drive se delegan a rclone (remote configurado por el
 * usuario), que es quien habla con la API de Proton Drive. Esta clase base
 * resuelve rutas, expone el binario y valida dependencias. Las tools MCP y
 * los agent goals (Tasks 2-5) construyen encima de ella.
 */
import { execFileSync, execFile } from 'node:child_process'
import { existsSync, mkdirSync, readdirSync, statSync } from 'node:fs'
import { resolve } from 'node:path'

export interface DriveFile {
  id: string
  name: string
  mimeType: string
  size: number
  modifiedTime: string
  parentId?: string
  path: string
}

export interface DriveConfig {
  rcloneRemote?: string
  stagingDir: string
  syncMode: 'pull' | 'watch'
  rcloneBin: string
  obsoleteExtensions: string[]
}

export class DriveClient {
  constructor(
    public opts: DriveConfig,
    private log: {
      debug: (m: string, d?: unknown) => void
      info: (m: string, d?: unknown) => void
      error: (m: string, d?: unknown) => void
    },
  ) {}

  get stagingDir(): string {
    return resolve(this.opts.stagingDir.replace(/^~/, process.env.HOME ?? ''))
  }

  get rcloneBin(): string {
    return this.opts.rcloneBin
  }

  get remotePrefix(): string {
    return this.opts.rcloneRemote ?? ''
  }

  async execRclone(
    args: string[],
  ): Promise<{ stdout: string; stderr: string }> {
    return new Promise((resolvePromise, reject) => {
      execFile(
        this.rcloneBin,
        args,
        { maxBuffer: 50 * 1024 * 1024 },
        (err, stdout, stderr) => {
          if (err) {
            reject(new Error(`rclone error: ${err.message}\nstderr: ${stderr}`))
            return
          }
          resolvePromise({ stdout, stderr })
        },
      )
    })
  }

  checkDeps(): { ok: boolean; error?: string } {
    try {
      execFileSync(this.rcloneBin, ['--version'], {
        encoding: 'utf-8',
        timeout: 5000,
      })
      if (!this.opts.rcloneRemote)
        return { ok: false, error: 'DRIVE_RCLONE_REMOTE not set' }
      return { ok: true }
    } catch (err) {
      return { ok: false, error: `rclone not found: ${(err as Error).message}` }
    }
  }

  async syncPull(): Promise<{
    ok: boolean
    files: number
    bytes: number
    error?: string
  }> {
    if (!this.opts.rcloneRemote)
      return {
        ok: false,
        files: 0,
        bytes: 0,
        error: 'DRIVE_RCLONE_REMOTE not set',
      }
    const staging = this.stagingDir
    if (!existsSync(staging)) mkdirSync(staging, { recursive: true })
    try {
      this.log.info('drive syncPull', { remote: this.remotePrefix, staging })
      const { stdout, stderr } = await this.execRclone([
        'sync',
        `${this.remotePrefix}/`,
        staging,
        '--progress',
        '--stats-one-line',
      ])
      const out = stdout + stderr
      const files = /Transferred:\s+(\d+)/.exec(out)?.[1] ?? '0'
      return { ok: true, files: parseInt(files, 10), bytes: 0 }
    } catch (err) {
      const msg = (err as Error).message
      this.log.error('drive syncPull failed', { error: msg })
      return { ok: false, files: 0, bytes: 0, error: msg }
    }
  }

  async syncPush(): Promise<{
    ok: boolean
    files: number
    bytes: number
    error?: string
  }> {
    if (!this.opts.rcloneRemote)
      return {
        ok: false,
        files: 0,
        bytes: 0,
        error: 'DRIVE_RCLONE_REMOTE not set',
      }
    const staging = this.stagingDir
    try {
      this.log.info('drive syncPush', { remote: this.remotePrefix, staging })
      const { stdout, stderr } = await this.execRclone([
        'sync',
        staging,
        `${this.remotePrefix}/`,
        '--ignore-existing',
        '--progress',
        '--stats-one-line',
      ])
      const out = stdout + stderr
      const files = /Transferred:\s+(\d+)/.exec(out)?.[1] ?? '0'
      return { ok: true, files: parseInt(files, 10), bytes: 0 }
    } catch (err) {
      const msg = (err as Error).message
      this.log.error('drive syncPush failed', { error: msg })
      return { ok: false, files: 0, bytes: 0, error: msg }
    }
  }

  async status(): Promise<{
    ok: boolean
    configured: boolean
    remoteReachable?: boolean
    lastSync?: string
    stagingExists: boolean
    stagingFiles?: number
    stagingBytes?: number
    syncMode: string
    error?: string
  }> {
    const staging = this.stagingDir
    const stagingExists = existsSync(staging)
    let stagingFiles: number | undefined
    let stagingBytes: number | undefined
    if (stagingExists) {
      const totals = { files: 0, bytes: 0 }
      const walk = (dir: string) => {
        for (const entry of readdirSync(dir)) {
          const full = resolve(dir, entry)
          try {
            const s = statSync(full)
            if (s.isDirectory()) walk(full)
            else {
              totals.files++
              totals.bytes += s.size
            }
          } catch {
            /* skip */
          }
        }
      }
      walk(staging)
      stagingFiles = totals.files
      stagingBytes = totals.bytes
    }
    let remoteReachable: boolean | undefined
    if (this.opts.rcloneRemote) {
      try {
        await this.execRclone([
          'lsf',
          `${this.remotePrefix}/`,
          '--max-depth',
          '0',
        ])
        remoteReachable = true
      } catch {
        remoteReachable = false
      }
    }
    return {
      ok: !!this.opts.rcloneRemote && stagingExists,
      configured: !!this.opts.rcloneRemote,
      remoteReachable,
      stagingExists,
      stagingFiles,
      stagingBytes,
      syncMode: this.opts.syncMode,
    }
  }

  async mount(mountPoint?: string): Promise<{ ok: boolean; error?: string }> {
    const target = mountPoint ?? resolve('/tmp/proton-drive-mount')
    try {
      this.log.info('drive mount', { remote: this.remotePrefix, target })
      await this.execRclone([
        'mount',
        `${this.remotePrefix}/`,
        target,
        '--daemon',
        '--vfs-cache-mode',
        'full',
      ])
      return { ok: true }
    } catch (err) {
      return { ok: false, error: (err as Error).message }
    }
  }

  async unmount(mountPoint?: string): Promise<{ ok: boolean; error?: string }> {
    const target = mountPoint ?? resolve('/tmp/proton-drive-mount')
    try {
      await this.execRclone(['unmount', target])
      return { ok: true }
    } catch (err) {
      return { ok: false, error: (err as Error).message }
    }
  }
}
