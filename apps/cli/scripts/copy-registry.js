import { cpSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

// Resolve paths relative to the CLI package root
const cliRoot = join(__dirname, '..')
const repoRoot = join(cliRoot, '..', '..')
const sourceRegistry = join(repoRoot, 'registry')
const targetRegistry = join(cliRoot, 'dist', 'registry')

console.log('📦 Bundling registry into CLI...')

mkdirSync(targetRegistry, { recursive: true })
cpSync(sourceRegistry, targetRegistry, { recursive: true })

console.log('✅ Registry bundled successfully.')
