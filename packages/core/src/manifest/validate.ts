import { type Manifest, ManifestSchema } from './schema.js'

export interface ValidationIssue {
  path: string
  message: string
}

export type ValidationResult =
  | { ok: true; manifest: Manifest }
  | { ok: false; issues: ValidationIssue[] }

export function validateManifest(data: unknown): ValidationResult {
  const result = ManifestSchema.safeParse(data)

  if (result.success) {
    return { ok: true, manifest: result.data }
  }

  return {
    ok: false,
    issues: result.error.issues.map((issue) => ({
      path: issue.path.join('.'),
      message: issue.message,
    })),
  }
}
