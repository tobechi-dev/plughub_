import { cpSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const cliRoot = join(__dirname, '..')
const repoRoot = join(cliRoot, '..', '..')
const sourceRegistry = join(repoRoot, 'registry')
const targetRegistry = join(cliRoot, 'dist', 'registry')

console.log('📦 Bundling registry into CLI...')

mkdirSync(targetRegistry, { recursive: true })

cpSync(sourceRegistry, targetRegistry, {
  recursive: true,
  filter: (src) => {
    const normalized = src.replace(/\\/g, '/')
    // Exclude node_modules, dist, tests, .turbo, .env, and core dumps
    if (
      normalized.includes('/node_modules') ||
      normalized.includes('/dist') ||
      normalized.includes('/.turbo') ||
      normalized.includes('/tests') ||
      normalized.endsWith('/.env') ||
      normalized.endsWith('/core') ||
      normalized.includes('/.git')
    ) {
      return false
    }
    return true
  },
})

console.log('✅ Registry bundled successfully (secrets excluded).')
