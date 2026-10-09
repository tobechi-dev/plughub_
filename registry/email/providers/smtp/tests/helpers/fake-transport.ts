import type { OutgoingMail, Transport } from '../../src/transport.js'

export interface FakeTransport extends Transport {
  sent: OutgoingMail[]
  failNext: Error | null
}

export function createFakeTransport(): FakeTransport {
  const sent: OutgoingMail[] = []
  let counter = 0

  return {
    sent,
    failNext: null,
    async send(mail) {
      if (this.failNext) {
        const error = this.failNext
        this.failNext = null
        throw error
      }
      sent.push(mail)
      counter += 1
      return { id: `<fake-${counter}@plughub.local>` }
    },
  }
}
