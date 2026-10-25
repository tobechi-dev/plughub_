import { stat } from 'node:fs/promises'
import { join } from 'node:path'

export type PackageManager = 'pnpm' | 'npm' | 'yarn' | 'bun'

export async function detectPackageManager(dir: string): Promise<PackageManager> {
  const checks: { pm: PackageManager; file: string }[] = [
    { pm: 'pnpm', file: 'pnpm-lock.yaml' },
    { pm: 'yarn', file: 'yarn.lock' },
    { pm: 'bun', file: 'bun.lockb' },
    { pm: 'npm', file: 'package-lock.json' },
  ]

  for (const check of checks) {
    try {
      await stat(join(dir, check.file))
      return check.pm
    } catch {
      // Continue searching
    }
  }

  return 'npm' // Fallback
}
