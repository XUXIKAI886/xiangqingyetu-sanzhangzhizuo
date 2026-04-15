import { randomUUID } from 'node:crypto'

export interface OSSUploadResult {
  url: string
  filename: string
  path: string
}

interface SaveGeneratedImageParams {
  base64: string
  mimeType: string
  shopName: string
  posterIndex: number
}

interface SaveGeneratedImageDeps {
  isOSSEnabled: () => boolean
  uploadBuffer: (
    buffer: Buffer,
    filename: string,
    mimeType: string,
    folder: string
  ) => Promise<OSSUploadResult>
  randomId: () => string
}

export interface StoredGeneratedImage {
  url: string
  mimeType: string
  storage: 'oss' | 'inline'
  path?: string
}

function sanitizeFilenameSegment(value: string): string {
  return value
    .trim()
    .replace(/[\\/:*?"<>|]+/g, '-')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

function mimeTypeToExtension(mimeType: string): string {
  if (mimeType === 'image/jpeg') return 'jpg'
  if (mimeType === 'image/webp') return 'webp'
  return 'png'
}

function createDataUrl(base64: string, mimeType: string): string {
  return `data:${mimeType};base64,${base64}`
}

function decodeBase64ToBuffer(base64: string): Buffer {
  const pureBase64 = base64.includes(',') ? base64.split(',')[1] : base64
  return Buffer.from(pureBase64, 'base64')
}

export function buildGeneratedPosterFilename(params: {
  shopName: string
  posterIndex: number
  mimeType: string
  randomId?: string
}): string {
  const safeShopName = sanitizeFilenameSegment(params.shopName || '海报')
  const ext = mimeTypeToExtension(params.mimeType)
  const randomId = params.randomId || randomUUID()

  return `${safeShopName}_详情页${params.posterIndex + 1}_${randomId}.${ext}`
}

export async function saveGeneratedImage(
  params: SaveGeneratedImageParams,
  deps: SaveGeneratedImageDeps
): Promise<StoredGeneratedImage> {
  const filename = buildGeneratedPosterFilename({
    shopName: params.shopName,
    posterIndex: params.posterIndex,
    mimeType: params.mimeType,
    randomId: deps.randomId(),
  })

  if (deps.isOSSEnabled()) {
    try {
      const result = await deps.uploadBuffer(
        decodeBase64ToBuffer(params.base64),
        filename,
        params.mimeType,
        'meituan-detail-generator'
      )

      return {
        url: result.url,
        mimeType: params.mimeType,
        storage: 'oss',
        path: result.path,
      }
    } catch (error) {
      console.error('OSS 上传失败，回退到 data URL:', error)
    }
  }

  return {
    url: createDataUrl(params.base64, params.mimeType),
    mimeType: params.mimeType,
    storage: 'inline',
  }
}
