import { describe, expect, it, vi } from 'vitest'
import { createEmailService } from '../src/lib.js'
import { createFakeTransport } from './helpers/fake-transport.js'

// The service builds its own transport via nodemailer. To keep the test
// hermetic we mock the nodemailer module to return a fake transport.
vi.mock('../src/transports/nodemailer.js', () => ({
  createNodemailerTransport: () => {
    let counter = 0
    return {
      async send() {
        counter += 1
        return { id: `<fake-${counter}@plughub.local>` }
      },
    }
  },
}))

const config = {
  host: 'localhost',
  port: 1025,
  user: 'dev',
  password: 'dev',
  secure: false,
}

const validInput = {
  from: { address: 'from@example.com' },
  to: [{ address: 'to@example.com' }],
  subject: 'Hello',
  text: 'Hello world',
}

describe('createEmailService', () => {
  it('sends an email and returns a result', async () => {
    const email = createEmailService(config)
    const result = await email.sendEmail(validInput)

    expect(result.id).toEqual(expect.any(String))
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
