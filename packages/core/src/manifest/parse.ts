import { readFile } from 'node:fs/promises'
import { parse as parseYaml } from 'yaml'
import { type ValidationResult, validateManifest } from './validate.js'

export function parseManifest(source: string): ValidationResult {
  let data: unknown
  try {
    data = parseYaml(source)
  } catch (error) {
    return {
      ok: false,
      issues: [
        {
          path: '',
          message: `Invalid YAML: ${(error as Error).message}`,
        },
      ],
    }
  }
  return validateManifest(data)
}

export async function parseManifestFile(path: string): Promise<ValidationResult> {
  const source = await readFile(path, 'utf8')
  return parseManifest(source)
}
