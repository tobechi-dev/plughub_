import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { parse } from 'yaml'
import { validateManifest } from '../manifest/validate.js'

const REGISTRY_ROOT = join(__dirname, '../../../../registry')

function readYaml(path: string): unknown {
  return parse(readFileSync(path, 'utf8'))
}

describe('registry/email', () => {
  const dir = join(REGISTRY_ROOT, 'email')

  it('capability.yaml validates against the schema', () => {
    const result = validateManifest(readYaml(join(dir, 'capability.yaml')))
    expect(result.ok).toBe(true)
  })

  it('openapi.yaml declares the expected operations', () => {
    const spec = readYaml(join(dir, 'openapi.yaml')) as Record<string, unknown>
    expect(spec.openapi).toMatch(/^3\.1/)
    const paths = spec.paths as Record<string, unknown>
    expect(paths['/emails']).toBeDefined()
    expect(paths['/emails/{id}']).toBeDefined()
  })

  it('asyncapi.yaml declares the required events', () => {
    const spec = readYaml(join(dir, 'asyncapi.yaml')) as Record<string, unknown>
    expect(spec.asyncapi).toMatch(/^2\./)
    const channels = spec.channels as Record<string, unknown>
    expect(channels['email.sent']).toBeDefined()
    expect(channels['email.delivered']).toBeDefined()
    expect(channels['email.bounced']).toBeDefined()
    expect(channels['email.complained']).toBeDefined()
  })

  it('schemas.yaml exposes every schema referenced by the specs', () => {
    const schemas = readYaml(join(dir, 'schemas.yaml')) as { $defs: Record<string, unknown> }
    const defs = schemas.$defs
    for (const name of [
      'EmailAddress',
      'Attachment',
      'SendEmailInput',
      'SendEmailResult',
      'EmailRecord',
      'EmailEvent',
      'Error',
    ]) {
      expect(defs[name]).toBeDefined()
    }
  })
})
