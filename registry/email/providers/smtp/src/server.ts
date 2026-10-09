import { Hono } from 'hono'
import type { EmailAdapter } from './adapter.js'
import { SendEmailInputSchema } from './schemas.js'

export function createServer(adapter: EmailAdapter): Hono {
  const app = new Hono()

  app.get('/health', (c) => c.json({ ok: true }))

  app.post('/emails', async (c) => {
    let body: unknown
    try {
      body = await c.req.json()
    } catch {
      return c.json(
        { error: { code: 'invalid_json', message: 'Request body is not valid JSON' } },
        400,
      )
    }

    const parsed = SendEmailInputSchema.safeParse(body)
    if (!parsed.success) {
      const message = parsed.error.issues
        .map((i) => `${i.path.join('.') || '(root)'}: ${i.message}`)
        .join('; ')
      return c.json({ error: { code: 'invalid_request', message } }, 400)
    }

    try {
      const result = await adapter.send(parsed.data)
      return c.json(result, 202)
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      return c.json({ error: { code: 'provider_error', message } }, 500)
    }
  })

  app.get('/emails/:id', async (c) => {
    const id = c.req.param('id')
    const record = await adapter.getStatus(id)
    if (!record) {
      return c.json({ error: { code: 'not_found', message: `No email with id "${id}"` } }, 404)
    }
    return c.json(record, 200)
  })

  return app
}
