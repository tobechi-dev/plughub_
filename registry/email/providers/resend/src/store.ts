import type { EmailRecord } from './schemas.js'

export interface EmailStore {
  save(record: EmailRecord): void
  get(id: string): EmailRecord | undefined
}

export function createInMemoryStore(): EmailStore {
  const records = new Map<string, EmailRecord>()

  return {
    save(record) {
      records.set(record.id, record)
    },
    get(id) {
      return records.get(id)
    },
  }
}
