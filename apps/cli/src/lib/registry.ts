import type { Dirent } from 'node:fs'
import { readdir, stat } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { type CapabilityManifest, type ProviderManifest, parseManifestFile } from '@plughub/core'

export interface CapabilitySummary {
  manifest: CapabilityManifest
  providers: ProviderManifest[]
}

/**
 * Locate the registry root.
 *
 * Resolution order:
 *   1. BACKKIT_REGISTRY env var — used for tests and dev overrides.
 *   2. Walk up from `startDir`, looking for a `registry/` directory
 *      that contains at least one capability manifest.
 */
export async function findRegistryRoot(startDir: string = process.cwd()): Promise<string | null> {
  const fromEnv = process.env.BACKKIT_REGISTRY
  if (fromEnv) {
    const resolved = resolve(fromEnv)
    if (await isRegistryDir(resolved)) return resolved
  }

  let current = resolve(startDir)
  while (true) {
    const candidate = join(current, 'registry')
    if (await isRegistryDir(candidate)) return candidate

    const parent = dirname(current)
    if (parent === current) return null
    current = parent
  }
}

async function isRegistryDir(dir: string): Promise<boolean> {
  try {
    const s = await stat(dir)
    if (!s.isDirectory()) return false
  } catch {
    return false
  }

  let entries: Dirent[]
  try {
    entries = await readdir(dir, { withFileTypes: true })
  } catch {
    return false
  }

  for (const entry of entries) {
    if (!entry.isDirectory()) continue
    try {
      await stat(join(dir, entry.name, 'capability.yaml'))
      return true
    } catch {
      // keep looking
    }
  }

  return false
}

export async function loadCapabilities(registryRoot: string): Promise<CapabilitySummary[]> {
  let entries: Dirent[]
  try {
    entries = await readdir(registryRoot, { withFileTypes: true })
  } catch {
    return []
  }

  const summaries: CapabilitySummary[] = []

  for (const entry of entries) {
    if (!entry.isDirectory()) continue
    const capabilityDir = join(registryRoot, entry.name)
    const capabilityPath = join(capabilityDir, 'capability.yaml')

    const result = await parseManifestFile(capabilityPath)
    if (!result.ok) {
      process.stderr.write(
        `warning: skipping ${capabilityPath}: ${result.issues.map((i) => i.message).join('; ')}\n`,
      )
      continue
    }
    if (result.manifest.kind !== 'capability') continue

    const providers = await loadProviders(capabilityDir)
    summaries.push({ manifest: result.manifest, providers })
  }

  summaries.sort((a, b) => a.manifest.id.localeCompare(b.manifest.id))
  return summaries
}

async function loadProviders(capabilityDir: string): Promise<ProviderManifest[]> {
  const providersDir = join(capabilityDir, 'providers')

  let entries: Dirent[]
  try {
    entries = await readdir(providersDir, { withFileTypes: true })
  } catch {
    return []
  }

  const providers: ProviderManifest[] = []

  for (const entry of entries) {
    if (!entry.isDirectory()) continue
    const providerPath = join(providersDir, entry.name, 'provider.yaml')

    const result = await parseManifestFile(providerPath)
    if (!result.ok) {
      process.stderr.write(
        `warning: skipping ${providerPath}: ${result.issues.map((i) => i.message).join('; ')}\n`,
      )
      continue
    }
    if (result.manifest.kind !== 'provider') continue

    providers.push(result.manifest)
  }

  providers.sort((a, b) => a.id.localeCompare(b.id))
  return providers
}
