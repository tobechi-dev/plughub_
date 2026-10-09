import { describe, expect, it } from 'vitest'
import { CapabilityManifestSchema, ProviderManifestSchema } from './schema.js'

describe('CapabilityManifestSchema', () => {
  const valid = {
    schemaVersion: '1',
    kind: 'capability',
    id: 'email',
    version: '0.1.0',
    name: 'Email',
    description: 'Send transactional emails',
    status: 'experimental',
    contracts: [{ type: 'openapi', path: './openapi.yaml' }],
    exports: [{ name: 'sendEmail', description: 'Send a single email' }],
  }

  it('accepts a valid capability manifest', () => {
    const result = CapabilityManifestSchema.safeParse(valid)
    expect(result.success).toBe(true)
  })

  it('rejects a non-kebab id', () => {
    const result = CapabilityManifestSchema.safeParse({ ...valid, id: 'Email' })
    expect(result.success).toBe(false)
  })

  it('rejects an empty contracts list', () => {
    const result = CapabilityManifestSchema.safeParse({ ...valid, contracts: [] })
    expect(result.success).toBe(false)
  })

  it('defaults tags to an empty array', () => {
    const result = CapabilityManifestSchema.parse(valid)
    expect(result.tags).toEqual([])
  })
})

describe('ProviderManifestSchema', () => {
  const valid = {
    schemaVersion: '1',
    kind: 'provider',
    id: 'smtp',
    capability: 'email',
    version: '0.1.0',
    name: 'SMTP',
    description: 'Send emails through any SMTP server',
    status: 'experimental',
    selfHosted: true,
    managed: false,
    language: 'typescript',
  }

  it('accepts a valid provider manifest', () => {
    const result = ProviderManifestSchema.safeParse(valid)
    expect(result.success).toBe(true)
  })

  it('rejects an unknown language', () => {
    const result = ProviderManifestSchema.safeParse({ ...valid, language: 'ruby' })
    expect(result.success).toBe(false)
  })

  it('defaults config to an empty object', () => {
    const result = ProviderManifestSchema.parse(valid)
    expect(result.config).toEqual({})
  })
})
