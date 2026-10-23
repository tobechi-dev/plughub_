import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'
import type { S3Config } from './config.js'

export interface StorageService {
  uploadFile(bucket: string, key: string, body: Buffer | Uint8Array, contentType?: string): Promise<void>
  getDownloadUrl(bucket: string, key: string): Promise<string>
  deleteFile(bucket: string, key: string): Promise<void>
}

export function createStorageService(config: S3Config): StorageService {
  const client = new S3Client({
    endpoint: config.endpoint,
    region: config.region,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
    forcePathStyle: true, // Crucial for local MinIO/rclone
  })

  return {
    async uploadFile(bucket, key, body, contentType) {
      await client.send(
        new PutObjectCommand({
          Bucket: bucket,
          Key: key,
          Body: body,
          ContentType: contentType,
        })
      )
    },

    async getDownloadUrl(bucket, key) {
      const command = new GetObjectCommand({ Bucket: bucket, Key: key })
      // URL expires in 1 hour (3600 seconds)
      return getSignedUrl(client, command, { expiresIn: 3600 })
    },

    async deleteFile(bucket, key) {
      await client.send(
        new DeleteObjectCommand({
          Bucket: bucket,
          Key: key,
        })
      )
    },
  }
}
