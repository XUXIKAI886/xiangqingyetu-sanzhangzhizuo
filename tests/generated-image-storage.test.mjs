import test from 'node:test'
import assert from 'node:assert/strict'

import {
  buildGeneratedPosterFilename,
  saveGeneratedImage,
} from '../src/lib/generated-image-storage.ts'

test('生成海报文件名时应包含净化后的店铺名和序号', () => {
  const filename = buildGeneratedPosterFilename({
    shopName: '测试店铺 / 招牌',
    posterIndex: 1,
    mimeType: 'image/png',
    randomId: 'abc123',
  })

  assert.equal(filename, '测试店铺-招牌_详情页2_abc123.png')
})

test('OSS 可用时应上传并返回 OSS URL', async () => {
  const result = await saveGeneratedImage(
    {
      base64: 'ZmFrZS1pbWFnZQ==',
      mimeType: 'image/png',
      shopName: '测试店铺',
      posterIndex: 0,
    },
    {
      isOSSEnabled: () => true,
      uploadBuffer: async (_buffer, filename, mimeType, folder) => {
        assert.equal(filename, '测试店铺_详情页1_oss-id.png')
        assert.equal(mimeType, 'image/png')
        assert.equal(folder, 'meituan-detail-generator')

        return {
          url: 'https://cdn.example.com/meituan-detail-generator/2026-04-15/test.png',
          filename,
          path: 'meituan-detail-generator/2026-04-15/test.png',
        }
      },
      randomId: () => 'oss-id',
    }
  )

  assert.deepEqual(result, {
    url: 'https://cdn.example.com/meituan-detail-generator/2026-04-15/test.png',
    mimeType: 'image/png',
    storage: 'oss',
    path: 'meituan-detail-generator/2026-04-15/test.png',
  })
})

test('OSS 不可用时应退回 data URL', async () => {
  const result = await saveGeneratedImage(
    {
      base64: 'ZmFrZS1pbWFnZQ==',
      mimeType: 'image/jpeg',
      shopName: '测试店铺',
      posterIndex: 2,
    },
    {
      isOSSEnabled: () => false,
      uploadBuffer: async () => {
        throw new Error('不应调用上传')
      },
      randomId: () => 'inline-id',
    }
  )

  assert.deepEqual(result, {
    url: 'data:image/jpeg;base64,ZmFrZS1pbWFnZQ==',
    mimeType: 'image/jpeg',
    storage: 'inline',
  })
})
