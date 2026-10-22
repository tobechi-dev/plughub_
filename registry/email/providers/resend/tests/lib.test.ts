import { describe, expect, it, vi } from 'vitest'
import { createEmailService } from '../src/lib.js'

// Mock global fetch
vi.stubGlobal('fetch', vi.fn(async () => {
  return new Response(JSON.stringify({ id: 'fake-resend-id' }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}))

const config = {
  apiKey: 're_test_key',
}

const validInput = {
  from: { address: 'from@example.com' },
  to: [{ address: 'to@example.com' }],
  subject: 'Hello',
  text: 'Hello world',
}

describe('createEmailService (Resend)', () => {
  it('sends an email and returns a result', async () => {
    const email = createEmailService(config)
    const result = await email.sendEmail(validInput)

    expect(result.id).toBe('fake-resend-id')
    expect(result.status).toBe('sent')
    expect(result.createdAt).toEqual(expect.any(String))
  })

  it('retrieves the record for a sent email', async () => {
    const email = createEmailService(config)
    const sent = await email.sendEmail(validInput)
    const record = await email.getEmailStatus(sent.id)

    expect(record?.id).toBe(sent.id)
    expect(record?.status).toBe('sent')
  })

  it('returns undefined for unknown ids', async () => {
    const email = createEmailService(config)
    const record = await email.getEmailStatus('does-not-exist')
    expect(record).toBeUndefined()
  })
})
