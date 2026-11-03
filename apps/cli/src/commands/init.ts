import { writeFile } from 'node:fs/promises'
import { join, resolve } from 'node:path'
import * as p from '@clack/prompts'
import type { ProviderManifest } from '@plughub_/core'
import type { Command } from 'commander'
import { installDependencies } from '../lib/install.js'
import { detectPackageManager } from '../lib/pm.js'
import { findRegistryRoot, loadCapabilities } from '../lib/registry.js'
import { scaffoldProvider } from '../lib/scaffold.js'

export function registerInitCommand(program: Command): void {
  program
    .command('init')
    .description('Interactively set up Plughub in your project')
    .action(async () => {
      await runInit()
    })
}

async function runInit(): Promise<void> {
  p.intro("Welcome to Plughub! Let's set up your backend.")

  const registryRoot = await findRegistryRoot()
  if (!registryRoot) {
    p.cancel('Could not find a registry. Are you inside the Plughub monorepo?')
    process.exit(1)
  }

  const capabilities = await loadCapabilities(registryRoot)

  // 1. Ask which capabilities they want
  const selectedCapabilities = await p.multiselect({
    message: 'Which capabilities do you want to add?',
    options: capabilities.map((c) => ({
      value: c.manifest.id,
      label: c.manifest.name,
      hint: c.manifest.description,
    })),
    required: true,
  })

  if (p.isCancel(selectedCapabilities)) {
    p.cancel('Operation cancelled.')
    process.exit(0)
  }

  const installed: Record<string, string> = {}
  const allDependencies: string[] = []

  // 2. For each capability, ask for the provider
  for (const capId of selectedCapabilities as string[]) {
    const capability = capabilities.find((c) => c.manifest.id === capId)
    if (!capability) continue

    let provider: ProviderManifest

    if (capability.providers.length === 1) {
      provider = capability.providers[0] as ProviderManifest
      p.log.info(`Auto-selecting ${provider.name} for ${capability.manifest.name}.`)
    } else {
      const selectedProviderId = await p.select({
        message: `Select a provider for ${capability.manifest.name}`,
        options: capability.providers.map((pr) => ({
          value: pr.id,
          label: pr.name,
          hint: pr.description,
        })),
      })

      if (p.isCancel(selectedProviderId)) {
        p.cancel('Operation cancelled.')
        process.exit(0)
      }

      const foundProvider = capability.providers.find((pr) => pr.id === selectedProviderId)
      if (!foundProvider) continue
      provider = foundProvider
    }

    const targetDir = resolve(process.cwd(), 'backend', capability.manifest.id)
    const providerDir = join(registryRoot, capability.manifest.id, 'providers', provider.id)

    // Scaffold it
    const result = await scaffoldProvider({
      providerDir,
      targetDir,
      capability: capability.manifest,
      provider,
    })

    installed[capability.manifest.id] = provider.id
    allDependencies.push(...result.dependencies)
  }

  // 3. Write backkit.json to track what was installed
  const backkitConfig = {
    version: '1.0.0',
    installed,
    createdAt: new Date().toISOString(),
  }

  await writeFile(
    resolve(process.cwd(), 'backkit.json'),
    `${JSON.stringify(backkitConfig, null, 2)}\n`,
  )

  // 4. Ask to install dependencies
  if (allDependencies.length > 0) {
    const pm = await detectPackageManager(process.cwd())

    const shouldInstall = await p.confirm({
      message: `Install required dependencies using ${pm}?`,
      initialValue: true,
    })

    if (p.isCancel(shouldInstall)) {
      p.cancel('Operation cancelled.')
      process.exit(0)
    }

    // Deduplicate dependencies (e.g., if both email and storage need zod)
    const uniqueDependencies = [...new Set(allDependencies)]

    if (shouldInstall) {
      p.log.step(`Installing dependencies via ${pm}...`)
      try {
        await installDependencies(pm, process.cwd(), uniqueDependencies)
        p.log.success('Dependencies installed.')
      } catch (error) {
        p.log.error(`Failed to install dependencies: ${String(error)}`)
      }
    } else {
      p.log.info(
        `Skipped installation. Run this manually when ready:\n\n  ${pm} add ${uniqueDependencies.join(' ')}\n`,
      )
    }
  }

  p.outro('Success! Your backend is ready. Check ./backend/ for your new services.')
}
