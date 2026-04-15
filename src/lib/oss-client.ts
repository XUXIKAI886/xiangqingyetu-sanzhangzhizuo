import OSS from 'ali-oss'
import { randomUUID } from 'node:crypto'

export interface OSSUploadResult {
  url: string
  filename: string
  path: string
}

export class OSSClient {
  private client: OSS
  private bucket: string
  private region: string
  private customDomain?: string

  constructor() {
    const requiredEnvVars = [
      'ALI_OSS_REGION',
      'ALI_OSS_ACCESS_KEY_ID',
      'ALI_OSS_ACCESS_KEY_SECRET',
      'ALI_OSS_BUCKET',
    ]

    for (const envVar of requiredEnvVars) {
      if (!process.env[envVar]) {
        throw new Error(`缺少 OSS 环境变量: ${envVar}`)
      }
    }

    this.region = process.env.ALI_OSS_REGION!
    this.bucket = process.env.ALI_OSS_BUCKET!
    this.customDomain = process.env.ALI_OSS_CUSTOM_DOMAIN

    this.client = new OSS({
      region: this.region,
      bucket: this.bucket,
      accessKeyId: process.env.ALI_OSS_ACCESS_KEY_ID!,
      accessKeySecret: process.env.ALI_OSS_ACCESS_KEY_SECRET!,
      secure: true,
      timeout: 60000,
    })
  }

  async uploadBuffer(
    buffer: Buffer,
    originalName: string,
    mimeType: string,
    folder: string = 'generated'
  ): Promise<OSSUploadResult> {
    const date = new Date().toISOString().split('T')[0]
    const ext = originalName.includes('.')
      ? originalName.slice(originalName.lastIndexOf('.'))
      : '.png'
    const filename = `${randomUUID()}${ext}`
    const ossPath = `${folder}/${date}/${filename}`

    const result = await this.client.put(ossPath, buffer, {
      headers: {
        'Content-Type': mimeType,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Content-Disposition': 'inline',
      },
    })

    const url = this.customDomain
      ? `${this.customDomain.replace(/\/+$/, '')}/${ossPath}`
      : result.url

    return {
      url,
      filename,
      path: ossPath,
    }
  }
}

let ossClientInstance: OSSClient | null = null

export function getOSSClient(): OSSClient {
  if (!ossClientInstance) {
    ossClientInstance = new OSSClient()
  }

  return ossClientInstance
}

export function isOSSEnabled(): boolean {
  return Boolean(
    process.env.ALI_OSS_REGION &&
      process.env.ALI_OSS_ACCESS_KEY_ID &&
      process.env.ALI_OSS_ACCESS_KEY_SECRET &&
      process.env.ALI_OSS_BUCKET
  )
}
