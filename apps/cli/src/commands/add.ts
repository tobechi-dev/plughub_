import { join, resolve } from 'node:path'
import { confirm, isCancel } from '@clack/prompts'
import type { ProviderManifest } from '@plughub/core'
import type { Command } from 'commander'
import { installDependencies } from '../lib/install.js'
import { detectPackageManager } from '../lib/pm.js'
import { type CapabilitySummary, findRegistryRoot, loadCapabilities } from '../lib/registry.js'
import { ScaffoldError, type ScaffoldResult, scaffoldProvider } from '../lib/scaffold.js'

interface AddOptions {
  provider?: string
  force?: boolean
  json?: boolean
  install?: boolean // Commander maps --no-install to this being false
}

export function registerAddCommand(program: Command): void {
  program
    .command('add <capability>')
    .description('Add a capability to the current project')
    .option('--provider <id>', 'Provider to use when multiple are available')
    .option('--force', 'Overwrite the target directory if it already exists')
    .option('--no-install', 'Skip installing dependencies automatically')
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

  let result: ScaffoldResult
  try {
    result = await scaffoldProvider({
      providerDir,
      targetDir,
      capability: capability.manifest,
      provider,
      force: options.force,
    })
  } catch (error) {
    if (error instanceof ScaffoldError) fail(error.message)
    throw error
  }

  if (options.json) {
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`)
    return
  }

  let didInstall = false

  // Auto-install logic with interactive prompt
  if (options.install !== false && result.dependencies.length > 0) {
    const pm = await detectPackageManager(process.cwd())

    // Add a newline for breathing room before the prompt
    process.stdout.write('\n')

    const shouldInstall = await confirm({
      message: `Install required dependencies using ${pm}?`,
      initialValue: true,
    })

    if (isCancel(shouldInstall)) {
      process.stderr.write('\nOperation cancelled.\n')
      process.exit(0)
    }

    if (shouldInstall) {
      // Add a newline so the spinner starts cleanly
      process.stdout.write('\n')
      try {
        await installDependencies(pm, result.targetDir, result.dependencies)
        didInstall = true
      } catch (error) {
        process.stderr.write(`\n⚠️ Failed to auto-install dependencies: ${String(error)}\n`)
        process.stderr.write('You can install them manually later.\n')
      }
    }
  }

  printSuccess(capability, provider, result, didInstall)
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
  if (providers.length === 0) fail(`capability "${capability.manifest.id}" has no providers yet.`)
  if (providers.length === 1) return providers[0] as ProviderManifest

  const available = providers.map((p) => p.id).join(', ')
  fail(
    `capability "${capability.manifest.id}" has multiple providers.`,
    `specify one with --provider <id>\navailable: ${available}`,
  )
}

function fail(message: string, hint?: string): never {
  process.stderr.write(`\nerror: ${message}\n`)
  if (hint) process.stderr.write(`${hint}\n\n`)
  process.exit(1)
}

function printSuccess(
  capability: CapabilitySummary,
  provider: ProviderManifest,
  result: ScaffoldResult,
  didInstall: boolean,
): void {
  const relativeTarget = result.targetDir.replace(`${process.cwd()}/`, './')
  const configEntries = Object.entries(provider.config)

  // Spacious header
  process.stdout.write(
    `\n\n✨ Added ${capability.manifest.id} (${provider.id}) to ${relativeTarget}\n`,
  )
  process.stdout.write(`────────────────────────────────────────────────────────\n\n`)

  let step = 1

  if (!didInstall && result.dependencies.length > 0) {
    process.stdout.write(`  ${step}. Install dependencies in your project:\n\n`)
    process.stdout.write(`       pnpm add ${result.dependencies.join(' ')}\n\n`)
    step++
  }

  if (configEntries.length > 0) {
    process.stdout.write(
      `  ${step}. Set required environment variables in ${relativeTarget}/.env:\n\n`,
    )
    for (const [key, field] of configEntries) {
      const tags: string[] = [field.type]
      if (field.type === 'string' && field.secret) tags.push('secret')
      if (field.required === false) tags.push('optional')
      process.stdout.write(`       ${key.padEnd(20)} ${tags.join(', ')}\n`)
    }
    process.stdout.write('\n')
    step++
  }

  process.stdout.write(`  ${step}. Start the provider:\n\n`)
  process.stdout.write(`       cd ${relativeTarget} && pnpm dev\n\n`)
}
