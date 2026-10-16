import { mkdir, mkdtemp, readdir, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import type { CapabilityManifest, ProviderManifest } from '@plughub/core'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { scaffoldProvider } from '../src/lib/scaffold.js'

let tmp: string
let providerDir: string
let targetDir: string

const capability: CapabilityManifest = {
  schemaVersion: '1',
  kind: 'capability',
  id: 'email',
  version: '0.1.0',
  name: 'Email',
  description: 'Send transactional emails.',
  status: 'experimental',
  contracts: [{ type: 'openapi', path: './openapi.yaml' }],
  exports: [{ name: 'sendEmail', description: 'Send an email.' }],
  tags: [],
}

const provider: ProviderManifest = {
  schemaVersion: '1',
  kind: 'provider',
  id: 'smtp',
  capability: 'email',
  version: '0.1.0',
  name: 'SMTP',
  description: 'Send via SMTP.',
  status: 'experimental',
  selfHosted: true,
  managed: false,
  language: 'typescript',
  config: {},
}

beforeEach(async () => {
  tmp = await mkdtemp(join(tmpdir(), 'plughub-add-'))
  providerDir = join(tmp, 'provider')
  targetDir = join(tmp, 'target')

  await mkdir(join(providerDir, 'src'), { recursive: true })
  await mkdir(join(providerDir, 'tests'), { recursive: true })
  await mkdir(join(providerDir, 'dist'), { recursive: true })

  await writeFile(join(providerDir, 'src', 'index.ts'), 'export {}\n')
  await writeFile(join(providerDir, 'tests', 'unit.test.ts'), 'test\n')
  await writeFile(join(providerDir, 'dist', 'index.js'), 'built\n')
  await writeFile(join(providerDir, 'README.md'), '# SMTP\n')
  await writeFile(join(providerDir, '.env.example'), 'SMTP_HOST=localhost\n')
  await writeFile(
    join(providerDir, 'package.json'),
    JSON.stringify({
      name: '@plughub/provider-email-smtp',
      version: '0.0.0',
      dependencies: { hono: '^4.6.14', zod: '^3.23.8' },
    }),
  )
})

afterEach(async () => {
  await rm(tmp, { recursive: true, force: true })
})

describe('scaffoldProvider', () => {
  it('copies source files to the target directory', async () => {
    await scaffoldProvider({ providerDir, targetDir, capability, provider })
    const root = await readdir(targetDir)
    expect(root).toContain('src')
    expect(root).toContain('README.md')
  })

  it('skips tests, dist, and node_modules', async () => {
    await scaffoldProvider({ providerDir, targetDir, capability, provider })
    const root = await readdir(targetDir)
    expect(root).not.toContain('tests')
    expect(root).not.toContain('dist')
    expect(root).not.toContain('node_modules')
  })

  it('copies .env.example but not .env', async () => {
    await writeFile(join(providerDir, '.env'), 'SECRET=xxx\n')
    await scaffoldProvider({ providerDir, targetDir, capability, provider })
    const root = await readdir(targetDir)
    expect(root).toContain('.env.example')
    expect(root).not.toContain('.env')
  })

  it('writes backkit.json with install metadata', async () => {
    await scaffoldProvider({ providerDir, targetDir, capability, provider })
    const raw = await readFile(join(targetDir, 'backkit.json'), 'utf8')
    const meta = JSON.parse(raw) as Record<string, unknown>
    expect(meta.capability).toBe('email')
    expect(meta.provider).toBe('smtp')
    expect(meta.capabilityVersion).toBe('0.1.0')
    expect(meta.providerVersion).toBe('0.1.0')
    expect(meta.installedAt).toEqual(expect.any(String))
  })

  it('returns provider dependencies with their version ranges', async () => {
    const result = await scaffoldProvider({ providerDir, targetDir, capability, provider })
    expect(result.dependencies).toContain('hono@^4.6.14')
    expect(result.dependencies).toContain('zod@^3.23.8')
  })

  it('throws if the target directory already exists', async () => {
    await scaffoldProvider({ providerDir, targetDir, capability, provider })
    await expect(
      scaffoldProvider({ providerDir, targetDir, capability, provider }),
    ).rejects.toThrow(/already exists/)
  })

  it('overwrites the target directory when force is true', async () => {
    await scaffoldProvider({ providerDir, targetDir, capability, provider })
    await expect(
      scaffoldProvider({ providerDir, targetDir, capability, provider, force: true }),
    ).resolves.toBeDefined()
  })
})
