import { describe, it, expect } from 'vitest'
import { DriveClient } from '../src/drive.js'

describe('DriveClient', () => {
  it('should resolve staging dir', () => {
    const dc = new DriveClient(
      {
        rcloneRemote: 'proton-drive:',
        stagingDir: '/tmp/test-drive',
        syncMode: 'pull',
        rcloneBin: 'rclone',
        obsoleteExtensions: [],
      },
      { debug: () => {}, info: () => {}, error: () => {} },
    )
    expect(dc.stagingDir).toBe('/tmp/test-drive')
  })

  it('should expand ~ in staging dir', () => {
    const dc = new DriveClient(
      {
        rcloneRemote: 'proton-drive:',
        stagingDir: '~/test-drive',
        syncMode: 'pull',
        rcloneBin: 'rclone',
        obsoleteExtensions: [],
      },
      { debug: () => {}, info: () => {}, error: () => {} },
    )
    expect(dc.stagingDir).toBe(`${process.env.HOME}/test-drive`)
  })

  it('should build remote prefix', () => {
    const dc = new DriveClient(
      {
        rcloneRemote: 'proton-drive:',
        stagingDir: '/tmp/d',
        syncMode: 'pull',
        rcloneBin: 'rclone',
        obsoleteExtensions: [],
      },
      { debug: () => {}, info: () => {}, error: () => {} },
    )
    expect(dc.remotePrefix).toBe('proton-drive:')
  })

  it('should return error when rclone not found', () => {
    const dc = new DriveClient(
      {
        rcloneRemote: 'proton-drive:',
        stagingDir: '/tmp/d',
        syncMode: 'pull',
        rcloneBin: '/nonexistent/rclone',
        obsoleteExtensions: [],
      },
      { debug: () => {}, info: () => {}, error: () => {} },
    )
    const result = dc.checkDeps()
    expect(result.ok).toBe(false)
    expect(result.error).toContain('not found')
  })
})

describe('DriveClient sync', () => {
  it('should return error on syncPull when no remote configured', async () => {
    const dc = new DriveClient(
      {
        stagingDir: '/tmp/test-drive',
        syncMode: 'pull',
        rcloneBin: 'rclone',
        obsoleteExtensions: [],
      },
      { debug: () => {}, info: () => {}, error: () => {} },
    )
    const result = await dc.syncPull()
    expect(result.ok).toBe(false)
    expect(result.error).toContain('not set')
  })

  it('should return error on syncPush when no remote configured', async () => {
    const dc = new DriveClient(
      {
        stagingDir: '/tmp/test-drive',
        syncMode: 'pull',
        rcloneBin: 'rclone',
        obsoleteExtensions: [],
      },
      { debug: () => {}, info: () => {}, error: () => {} },
    )
    const result = await dc.syncPush()
    expect(result.ok).toBe(false)
    expect(result.error).toContain('not set')
  })

  it('should report status without remote', async () => {
    const dc = new DriveClient(
      {
        stagingDir: '/tmp/test-drive',
        syncMode: 'pull',
        rcloneBin: 'rclone',
        obsoleteExtensions: [],
      },
      { debug: () => {}, info: () => {}, error: () => {} },
    )
    const result = await dc.status()
    expect(result.configured).toBe(false)
    expect(result.ok).toBe(false)
  })
})
