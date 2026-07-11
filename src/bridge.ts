import { execFile } from 'node:child_process'
import { existsSync } from 'node:fs'
import type { SecretLogger } from './security.js'

export interface BridgeInfo {
  user?: string
  version?: string
  smtpPort?: number
  imapPort?: number
}

export interface BridgeHealth {
  ok: boolean
  bridgeRunning?: boolean
  smtpPort?: number
  imapPort?: number
  error?: string
}

export class BridgeClient {
  constructor(
    private readonly bin: string,
    private readonly imapPort: number,
    private readonly smtpPort: number,
    private readonly log: SecretLogger,
  ) {}

  async info(): Promise<BridgeInfo> {
    if (!existsSync(this.bin)) {
      this.log.debug('bridge info: bin not found', { bin: this.bin })
      return {}
    }
    try {
      const raw = await new Promise<string>((resolve, reject) => {
        const child = execFile(this.bin, ['--cli'], {
          timeout: 15_000,
        })
        let out = ''
        child.stdout?.on('data', (d) => {
          out += d
          if (out.includes('>>>')) {
            child.stdin?.write('info\n')
          }
        })
        child.stderr?.on('data', () => {
          /* noop */
        })
        child.on('close', (code) => {
          if (code === 0) resolve(out)
          else reject(new Error(`bridge exited with ${code}`))
        })
        child.on('error', reject)
        setTimeout(() => child.kill(), 14_000)
      })
      const user = /User:\s*(\S+@\S+)/.exec(raw)
      const version = /Bridge version:\s*(\S+)/.exec(raw)
      return {
        user: user?.[1],
        version: version?.[1],
        smtpPort: this.smtpPort,
        imapPort: this.imapPort,
      }
    } catch (err) {
      this.log.warn('bridge info failed', {
        error: (err as Error).message,
      })
      return {}
    }
  }

  health(): BridgeHealth {
    const running = existsSync(this.bin)
    return {
      ok: running,
      bridgeRunning: running,
      smtpPort: this.smtpPort,
      imapPort: this.imapPort,
      ...(running ? {} : { error: `${this.bin} not found` }),
    }
  }
}
