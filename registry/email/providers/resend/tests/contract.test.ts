import { beforeEach, describe, expect, it } from 'vitest'
import { createAdapter } from '../src/adapter.js'
import { createServer } from '../src/server.js'
import { createInMemoryStore } from '../src/store.js'
import { createFakeTransport, type FakeTransport } from './helpers/fake-transport.js'

const validPayload = {
  from: { address: 'from@example.com', name: 'Sender' },
  to: [{ address: 'to@example.com' }],
  subject: 'Hello',
  text: 'Hello world',
}

describe('email capability contract', () => {
  let app: ReturnType<typeof createServer>
  let transport: FakeTransport

  beforeEach(() => {
    transport = createFakeTransport()
    const adapter = createAdapter(transport, createInMemoryStore())
    app = createServer(adapter)
  })

  describe('POST /emails', () => {
    it('returns 202 with a SendEmailResult for a valid payload', async () => {
      const res = await app.request('/emails', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(validPayload),
      })

      expect(res.status).toBe(202)
      const body = (await res.json()) as Record<string, unknown>
      expect(body.id).toEqual(expect.any(String))
      expect(body.status).toBe('sent')
      expect(body.createdAt).toEqual(expect.any(String))
    })

    it('forwards the mail to the transport with a formatted sender', async () => {
      await app.request('/emails', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(validPayload),
      })

      expect(transport.sent).toHaveLength(1)
      expect(transport.sent[0]?.from).toBe('"Sender" <from@example.com>')
      expect(transport.sent[0]?.to).toEqual(['to@example.com'])
      expect(transport.sent[0]?.subject).toBe('Hello')
    })

    it('returns 400 when required fields are missing', async () => {
      const res = await app.request('/emails', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ subject: 'No sender' }),
      })

      expect(res.status).toBe(400)
      const body = (await res.json()) as { error: { code: string } }
      expect(body.error.code).toBe('invalid_request')
    })

    it('returns 400 when the sender address is not a valid email', async () => {
      const res = await app.request('/emails', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          ...validPayload,
          from: { address: 'not-an-email' },
        }),
      })

      expect(res.status).toBe(400)
    })

    it('returns 400 on malformed JSON', async () => {
      const res = await app.request('/emails', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: 'not json',
      })

      expect(res.status).toBe(400)
      const body = (await res.json()) as { error: { code: string } }
      expect(body.error.code).toBe('invalid_json')
    })

    it('returns 500 with a provider_error when the transport fails', async () => {
      transport.failNext = new Error('SMTP connection refused')

      const res = await app.request('/emails', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(validPayload),
      })

      expect(res.status).toBe(500)
      const body = (await res.json()) as { error: { code: string; message: string } }
      expect(body.error.code).toBe('provider_error')
      expect(body.error.message).toBe('SMTP connection refused')
    })
  })

  describe('GET /emails/:id', () => {
    it('returns the record for a known id', async () => {
      const sendRes = await app.request('/emails', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(validPayload),
      })
      const { id } = (await sendRes.json()) as { id: string }

      const res = await app.request(`/emails/${id}`)
      expect(res.status).toBe(200)

      const body = (await res.json()) as Record<string, unknown>
      expect(body.id).toBe(id)
      expect(body.status).toBe('sent')
      expect(body.updatedAt).toEqual(expect.any(String))
    })

    it('returns 404 with an error body for an unknown id', async () => {
      const res = await app.request('/emails/does-not-exist')
      expect(res.status).toBe(404)

      const body = (await res.json()) as { error: { code: string } }
      expect(body.error.code).toBe('not_found')
    })
  })
})
