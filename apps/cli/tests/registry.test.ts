import { mkdir, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { findRegistryRoot, loadCapabilities } from '../src/lib/registry.js'

const CAPABILITY_YAML = `schemaVersion: "1"
kind: capability
id: email
version: 0.1.0
name: Email
description: Send transactional emails.
status: experimental
contracts:
  - type: openapi
    path: ./openapi.yaml
exports:
  - name: sendEmail
    description: Send a single email.
`

const PROVIDER_YAML = `schemaVersion: "1"
kind: provider
id: smtp
capability: email
version: 0.1.0
name: SMTP
description: Send via SMTP.
status: experimental
selfHosted: true
managed: false
language: typescript
`

let tmp: string

beforeEach(async () => {
  tmp = await mkdtemp(join(tmpdir(), 'plughub-cli-'))
})

afterEach(async () => {
  await rm(tmp, { recursive: true, force: true })
})

async function setupRegistry(): Promise<string> {
  const registry = join(tmp, 'registry')
  const emailDir = join(registry, 'email')
  const smtpDir = join(emailDir, 'providers', 'smtp')
  await mkdir(smtpDir, { recursive: true })
  await writeFile(join(emailDir, 'capability.yaml'), CAPABILITY_YAML)
  await writeFile(join(smtpDir, 'provider.yaml'), PROVIDER_YAML)
  return registry
}

describe('findRegistryRoot', () => {
  it('finds a registry by walking up from a nested directory', async () => {
    const registry = await setupRegistry()
    const nested = join(registry, 'email', 'providers', 'smtp')
    const found = await findRegistryRoot(nested)
    expect(found).toBe(registry)
  })
})

describe('loadCapabilities', () => {
  it('loads each capability with its providers', async () => {
    const registry = await setupRegistry()
    const caps = await loadCapabilities(registry)

    expect(caps).toHaveLength(1)
    expect(caps[0]?.manifest.id).toBe('email')
    expect(caps[0]?.providers.map((p) => p.id)).toEqual(['smtp'])
  })

  it('returns an empty array when the directory has no capabilities', async () => {
    const empty = join(tmp, 'empty')
    await mkdir(empty, { recursive: true })
    expect(await loadCapabilities(empty)).toEqual([])
  })

  it('skips invalid manifests and keeps valid ones', async () => {
    const registry = await setupRegistry()
    const bogusDir = join(registry, 'bogus')
    await mkdir(bogusDir, { recursive: true })
    await writeFile(
      join(bogusDir, 'capability.yaml'),
      'schemaVersion: "1"\nkind: capability\nid: Bad-ID\n',
    )

    const caps = await loadCapabilities(registry)
    expect(caps.map((c) => c.manifest.id)).toEqual(['email'])
  })
})
