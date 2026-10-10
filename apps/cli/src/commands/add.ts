import { join, resolve } from 'node:path'
import type { Command } from 'commander'
import type { ProviderManifest } from '@plughub/core'
import { findRegistryRoot, loadCapabilities, type CapabilitySummary } from '../lib/registry.js'
import { scaffoldProvider, type ScaffoldResult } from '../lib/scaffold.js'

interface AddOptions {
  provider?: string
  json?: boolean
}

export function registerAddCommand(program: Command): void {
  program
    .command('add <capability>')
    .description('Add a capability to the current project')
    .option('--provider <id>', 'Provider to use when multiple are available')
    .option('--json', 'Output as JSON')
    .action(async (capabilityId: string, options: AddOptions) => {
      await runAdd(capabilityId, options)
    })
}

async function runAdd(capabilityId: string, options: AddOptions): Promise<void> {
  const registryRoot = await findRegistryRoot()
  if (!registryRoot) {
    fail(
      'could not find a registry.',
      'hint: run from inside the Plughub repo, or set BACKKIT_REGISTRY.',
    )
  }

  const capabilities = await loadCapabilities(registryRoot)
  const capability = capabilities.find((c) => c.manifest.id === capabilityId)
  if (!capability) {
    const available = capabilities.map((c) => c.manifest.id).join(', ') || '(none)'
    fail(`unknown capability "${capabilityId}".`, `available: ${available}`)
  }

  const provider = pickProvider(capability, options.provider)

  const targetDir = resolve(process.cwd(), 'backend', capability.manifest.id)
  const providerDir = join(registryRoot, capability.manifest.id, 'providers', provider.id)

  const result = await scaffoldProvider({
    providerDir,
    targetDir,
    capability: capability.manifest,
    provider,
  })

  if (options.json) {
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`)
    return
  }

  printSuccess(capability, provider, result)
}

function pickProvider(capability: CapabilitySummary, requestedId?: string): ProviderManifest {
  if (requestedId) {
    const match = capability.providers.find((p) => p.id === requestedId)
    if (!match) {
      const available = capability.providers.map((p) => p.id).join(', ') || '(none)'
      fail(
        `unknown provider "${requestedId}" for capability "${capability.manifest.id}".`,
        `available: ${available}`,
      )
    }
    return match
  }

  const providers = capability.providers
  if (providers.length === 0) {
    fail(`capability "${capability.manifest.id}" has no providers yet.`)
  }
  if (providers.length === 1) {
    return providers[0] as ProviderManifest
  }

  const available = providers.map((p) => p.id).join(', ')
  fail(
    `capability "${capability.manifest.id}" has multiple providers.`,
    `specify one with --provider <id>\navailable: ${available}`,
  )
}

function fail(message: string, hint?: string): never {
  process.stderr.write(`error: ${message}\n`)
  if (hint) process.stderr.write(`${hint}\n`)
  process.exit(1)
}

function printSuccess(
  capability: CapabilitySummary,
  provider: ProviderManifest,
  result: ScaffoldResult,
): void {
  const relativeTarget = result.targetDir.replace(`${process.cwd()}/`, './')
  const configEntries = Object.entries(provider.config)

  process.stdout.write(`Added ${capability.manifest.id} (${provider.id}) to ${relativeTarget}\n\n`)
  process.stdout.write(`  Files copied:   ${result.filesCopied.length}\n`)
  process.stdout.write(`  Config vars:    ${configEntries.length}\n\n`)

  process.stdout.write('Next steps:\n\n')

  if (result.dependencies.length > 0) {
    process.stdout.write('  1. Install dependencies in your project:\n\n')
    process.stdout.write(`       pnpm add ${result.dependencies.join(' ')}\n\n`)
  }

  if (configEntries.length > 0) {
    process.stdout.write('  2. Set required environment variables:\n\n')
    for (const [key, field] of configEntries) {
      const tags: string[] = [field.type]
      if (field.type === 'string' && field.secret) tags.push('secret')
      if (field.required === false) tags.push('optional')
      process.stdout.write(`       ${key.padEnd(20)} ${tags.join(', ')}\n`)
    }
    process.stdout.write(`\n     See ${relativeTarget}/.env.example\n\n`)
  }

  process.stdout.write('  3. Start the provider:\n\n')
  process.stdout.write(`       cd ${relativeTarget} && pnpm dev\n`)
}
