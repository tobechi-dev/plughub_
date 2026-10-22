import { serve } from '@hono/node-server'
import { createAdapter } from './adapter.js'
import { loadConfig } from './config.js'
import { createServer } from './server.js'
import { createInMemoryStore } from './store.js'
import { createResendTransport } from './transports/resend.js'

const PORT = Number(process.env.PORT ?? 8787)

async function main(): Promise<void> {
  const config = loadConfig()
  const transport = createResendTransport(config)
  const store = createInMemoryStore()
  const adapter = createAdapter(transport, store)
  const app = createServer(adapter)

  serve({ fetch: app.fetch, port: PORT }, (info) => {
    console.log(`resend provider listening on http://localhost:${info.port}`)
  })
}

main().catch((error) => {
  console.error('Failed to start resend provider:', error)
  process.exit(1)
})
