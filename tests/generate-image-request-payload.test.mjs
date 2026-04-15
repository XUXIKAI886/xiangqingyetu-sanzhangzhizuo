import test from 'node:test'
import assert from 'node:assert/strict'

import { buildGenerateImageRequestPayload } from '../src/lib/generate-image-request-payload.ts'
import { resolveGenerateImageThreadConfig } from '../src/lib/generate-image-thread-config.ts'

test('线路1应构造 Gemini 原生图片生成请求体', () => {
  const config = resolveGenerateImageThreadConfig(undefined, {
    YUNWU_API_KEY_IMAGE: 'thread1-key',
  })

  const payload = buildGenerateImageRequestPayload({
    config,
    productImage: 'ZmFrZS1iYXNlNjQ=',
    copyPrompt: '生成一张海报',
  })

  assert.deepEqual(payload, {
    contents: [
      {
        role: 'user',
        parts: [
          { text: '生成一张海报' },
          {
            inline_data: {
              mime_type: 'image/jpeg',
              data: 'ZmFrZS1iYXNlNjQ=',
            },
          },
        ],
      },
    ],
    generationConfig: {
      responseModalities: ['TEXT', 'IMAGE'],
      imageConfig: {
        aspectRatio: '9:16',
        imageSize: '2K',
      },
      thinkingConfig: {
        thinkingBudget: 0,
      },
    },
  })
})

test('线路2应构造 OpenAI 兼容的双图输入请求体', () => {
  const config = resolveGenerateImageThreadConfig('thread2', {
    GENERATE_IMAGE_THREAD2_BASE_URL: 'https://128api.cn/v1',
    GENERATE_IMAGE_THREAD2_API_KEY: 'thread2-key',
    GENERATE_IMAGE_THREAD2_MODEL_NAME: 'gemini-3.1-flash-image',
  })

  const payload = buildGenerateImageRequestPayload({
    config,
    productImage: 'ZmFrZS1iYXNlNjQ=',
    copyPrompt: '生成一张海报',
  })

  assert.deepEqual(payload, {
    model: 'gemini-3.1-flash-image',
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: '生成一张海报',
          },
          {
            type: 'image_url',
            image_url: {
              url: 'data:image/png;base64,ZmFrZS1iYXNlNjQ=',
            },
          },
          {
            type: 'image_url',
            image_url: {
              url: 'data:image/png;base64,ZmFrZS1iYXNlNjQ=',
            },
          },
        ],
      },
    ],
    max_tokens: 4096,
    temperature: 0.7,
  })
})
