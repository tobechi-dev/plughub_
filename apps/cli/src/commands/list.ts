import type { Command } from 'commander'
import { type CapabilitySummary, findRegistryRoot, loadCapabilities } from '../lib/registry.js'

export function registerListCommand(program: Command): void {
  program
    .command('list')
    .description('List all capabilities in the registry')
    .option('--json', 'Output as JSON')
    .action(async (options: { json?: boolean }) => {
      const registryRoot = await findRegistryRoot()

      if (!registryRoot) {
        process.stderr.write(
          'error: could not find a registry.\n' +
            'hint: run this from inside the Plughub repo, or set BACKKIT_REGISTRY.\n',
        )
        process.exit(1)
      }

      const capabilities = await loadCapabilities(registryRoot)

      if (options.json) {
        process.stdout.write(`${JSON.stringify(capabilities, null, 2)}\n`)
        return
      }

      if (capabilities.length === 0) {
        process.stdout.write('No capabilities found in the registry.\n')
        return
      }

      printTable(capabilities)
    })
}

function printTable(capabilities: CapabilitySummary[]): void {
  const headers = ['ID', 'NAME', 'VERSION', 'STATUS', 'PROVIDERS']
  const rows = capabilities.map((c) => [
    c.manifest.id,
    c.manifest.name,
    c.manifest.version,
    c.manifest.status,
    c.providers.map((p) => p.id).join(', ') || '—',
  ])

  const widths = headers.map((header, i) =>
    Math.max(header.length, ...rows.map((row) => row[i]?.length ?? 0)),
  )

  const formatRow = (cells: string[]): string =>
    cells.map((cell, i) => cell.padEnd(widths[i] ?? 0)).join('  ')

  const separator = widths.map((w) => '─'.repeat(w))

  process.stdout.write(`${formatRow(headers)}\n`)
  process.stdout.write(`${formatRow(separator)}\n`)
  for (const row of rows) {
    process.stdout.write(`${formatRow(row)}\n`)
  }
}
