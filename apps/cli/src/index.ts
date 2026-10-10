#!/usr/bin/env node
import { Command } from 'commander'
import { registerListCommand } from './commands/list.js'

const program = new Command()

program
  .name('backkit')
  .description('Plughub CLI — add pluggable backend services to your app')
  .version('0.0.0')

registerListCommand(program)

program.parseAsync(process.argv).catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error)
  process.stderr.write(`${message}\n`)
  process.exit(1)
})
