import { copyFile, mkdir, readdir, readFile, stat, writeFile } from 'node:fs/promises'
import { join, relative } from 'node:path'
import type { CapabilityManifest, ProviderManifest } from '@plughub/core'

const EXCLUDED_NAMES = new Set([
  'node_modules',
  'dist',
  '.turbo',
  'tests',
  '.git',
  'core',
  '.env',
  'pnpm-lock.yaml',
  'package-lock.json',
  'yarn.lock',
  'bun.lockb',
  '.DS_Store',
])

const EXCLUDED_SUFFIXES = ['.tsbuildinfo']

export interface ScaffoldOptions {
  providerDir: string
  targetDir: string
  capability: CapabilityManifest
  provider: ProviderManifest
  force?: boolean
}

export interface ScaffoldResult {
  targetDir: string
  filesCopied: string[]
  dependencies: string[]
}

export class ScaffoldError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ScaffoldError'
  }
}

export async function scaffoldProvider(options: ScaffoldOptions): Promise<ScaffoldResult> {
  const { providerDir, targetDir, capability, provider, force = false } = options

  if (!force && (await pathExists(targetDir))) {
    throw new ScaffoldError(
      `${targetDir} already exists.\nRemove it first, or re-run with --force to overwrite.`,
    )
  }

  await mkdir(targetDir, { recursive: true })

  const filesCopied: string[] = []
  await copyDirectory(providerDir, targetDir, filesCopied)

  const dependencies = await readProviderDependencies(providerDir)

  const backkitJson = {
    capability: capability.id,
    capabilityVersion: capability.version,
    provider: provider.id,
    providerVersion: provider.version,
    installedAt: new Date().toISOString(),
  }
  await writeFile(join(targetDir, 'backkit.json'), `${JSON.stringify(backkitJson, null, 2)}\n`)
  filesCopied.push('backkit.json')

  return { targetDir, filesCopied, dependencies }
}

async function pathExists(path: string): Promise<boolean> {
  try {
    await stat(path)
    return true
  } catch {
    return false
  }
}

async function copyDirectory(source: string, target: string, collected: string[]): Promise<void> {
  const entries = await readdir(source, { withFileTypes: true })

  for (const entry of entries) {
    if (shouldSkip(entry.name)) continue

    const sourcePath = join(source, entry.name)
    const targetPath = join(target, entry.name)

    if (entry.isDirectory()) {
      await mkdir(targetPath, { recursive: true })
      await copyDirectory(sourcePath, targetPath, collected)
    } else if (entry.isFile()) {
      await copyFile(sourcePath, targetPath)
      collected.push(relative(process.cwd(), targetPath))
    }
  }
}

function shouldSkip(name: string): boolean {
  if (EXCLUDED_NAMES.has(name)) return true
  for (const suffix of EXCLUDED_SUFFIXES) {
    if (name.endsWith(suffix)) return true
  }
  return false
}

async function readProviderDependencies(providerDir: string): Promise<string[]> {
  try {
    const raw = await readFile(join(providerDir, 'package.json'), 'utf8')
    const pkg = JSON.parse(raw) as { dependencies?: Record<string, string> }
    return Object.entries(pkg.dependencies ?? {}).map(([name, version]) => `${name}@${version}`)
  } catch {
    return []
  }
}
