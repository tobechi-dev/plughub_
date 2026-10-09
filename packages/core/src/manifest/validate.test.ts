import { describe, expect, it } from 'vitest'
import { validateManifest } from './validate.js'

describe('validateManifest', () => {
  it('returns ok:true for a valid manifest', () => {
    const result = validateManifest({
      schemaVersion: '1',
      kind: 'capability',
      id: 'email',
      version: '0.1.0',
      name: 'Email',
      description: 'Send emails',
      status: 'experimental',
      contracts: [{ type: 'openapi', path: './openapi.yaml' }],
      exports: [{ name: 'sendEmail', description: 'Send an email' }],
    })
    expect(result.ok).toBe(true)
  })

  it('returns issues with paths for an invalid manifest', () => {
    const result = validateManifest({
      schemaVersion: '1',
      kind: 'capability',
      id: 'BAD ID',
      version: 'not-semver',
      name: 'X',
      description: 'Y',
      status: 'experimental',
      contracts: [],
      exports: [],
    })
    expect(result.ok).toBe(false)
    if (!result.ok) {
      const paths = result.issues.map((i) => i.path)
      expect(paths).toContain('id')
      expect(paths).toContain('version')
      expect(paths).toContain('contracts')
      expect(paths).toContain('exports')
    }
  })
})
