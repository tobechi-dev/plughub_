import { spawn } from 'node:child_process'
import { spinner } from '@clack/prompts'
import type { PackageManager } from './pm.js'

export function installDependencies(
  pm: PackageManager,
  cwd: string,
  dependencies: string[],
): Promise<void> {
  return new Promise((resolve, reject) => {
    if (dependencies.length === 0) return resolve()

    const args = pm === 'npm' ? ['install', ...dependencies] : ['add', ...dependencies]

    // Fix for Windows .cmd resolution without using shell: true
    const command = process.platform === 'win32' ? `${pm}.cmd` : pm

    const s = spinner()
    s.start(`Installing dependencies via ${pm}...`)

    // We pipe stdio to capture output and parse progress
    const child = spawn(command, args, { cwd, stdio: 'pipe' })

    let lastStatus = ''

    // Parse pnpm/npm output to update the spinner text
    child.stdout.on('data', (data) => {
      const text = data.toString()
      // Look for the "Progress: resolved X, reused Y..." line from pnpm
      const match = text.match(
        /Progress: resolved (\d+), reused (\d+), downloaded (\d+), added (\d+)/,
      )
      if (match) {
        const [, resolved, downloaded] = match
        lastStatus = `${resolved} resolved, ${downloaded} downloaded`
        s.message(`Installing dependencies... (${lastStatus})`)
      }
    })

    child.on('close', (code) => {
      if (code === 0) {
        s.stop('Dependencies installed successfully.')
        resolve()
      } else {
        s.stop('Failed to install dependencies.')
        reject(new Error(`\`${pm} ${args.join(' ')}\` failed with exit code ${code}`))
      }
    })

    child.on('error', (err) => {
      s.stop('Failed to install dependencies.')
      reject(err)
    })
  })
}
