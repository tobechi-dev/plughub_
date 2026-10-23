import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createStorageService } from '../src/lib.js'

// 1. Hoist the mock variables so they are available inside vi.mock
const { mockSend, mockGetSignedUrl } = vi.hoisted(() => {
  return {
    mockSend: vi.fn(),
    mockGetSignedUrl: vi.fn(),
  }
})

// 2. Mock the AWS SDK
vi.mock('@aws-sdk/client-s3', () => {
  return {
    S3Client: vi.fn(() => ({ send: mockSend })),
    PutObjectCommand: vi.fn(),
    DeleteObjectCommand: vi.fn(),
    GetObjectCommand: vi.fn(),
  }
})

// 3. Mock the Presigner
vi.mock('@aws-sdk/s3-request-presigner', () => {
  return {
    getSignedUrl: mockGetSignedUrl,
  }
})

const config = {
  endpoint: 'http://localhost:8080',
  accessKeyId: 'test',
  secretAccessKey: 'test',
  region: 'us-east-1',
}

// ... rest of the file stays exactly the same
describe('S3 Storage Service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('uploads a file', async () => {
    const storage = createStorageService(config)
    const body = Buffer.from('hello')

    await storage.uploadFile('my-bucket', 'hello.txt', body, 'text/plain')

    expect(mockSend).toHaveBeenCalledOnce()
  })

  it('generates a download url', async () => {
    mockGetSignedUrl.mockResolvedValueOnce('http://signed-url.com')

    const storage = createStorageService(config)
    const url = await storage.getDownloadUrl('my-bucket', 'hello.txt')

    expect(url).toBe('http://signed-url.com')
    expect(mockGetSignedUrl).toHaveBeenCalledOnce()
  })

  it('deletes a file', async () => {
    const storage = createStorageService(config)

    await storage.deleteFile('my-bucket', 'hello.txt')

    expect(mockSend).toHaveBeenCalledOnce()
  })
})
