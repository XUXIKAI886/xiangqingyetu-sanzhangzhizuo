import test from 'node:test'
import assert from 'node:assert/strict'

import { buildGenerateCopyRequestPayload } from '../src/lib/generate-copy-request-payload.ts'
import { resolveGenerateCopyThreadConfig } from '../src/lib/generate-copy-thread-config.ts'

const systemPrompt = '系统提示词'
const userPrompt = '店铺名称：测试店铺'

test('文案线路1应构造 Gemini 原生请求体', () => {
  const config = resolveGenerateCopyThreadConfig(undefined, {
    YUNWU_API_KEY_COPY: 'copy-key',
  })

  const payload = buildGenerateCopyRequestPayload({
    config,
    productImage: 'ZmFrZS1iYXNlNjQ=',
    systemPrompt,
    userPrompt,
  })

  assert.deepEqual(payload, {
    systemInstruction: {
      parts: [{ text: systemPrompt }],
    },
    contents: [
      {
        role: 'user',
        parts: [
          {
            inline_data: {
              mime_type: 'image/jpeg',
              data: 'ZmFrZS1iYXNlNjQ=',
            },
          },
          {
            text: userPrompt,
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.7,
      topP: 0.9,
    },
  })
})

test('文案线路2应构造 OpenAI 兼容的图文对话请求体', () => {
  const config = resolveGenerateCopyThreadConfig('thread2', {
    GENERATE_IMAGE_THREAD2_BASE_URL: 'https://128api.cn/v1',
    GENERATE_IMAGE_THREAD2_API_KEY: 'thread2-key',
  })

  const payload = buildGenerateCopyRequestPayload({
    config,
    productImage: 'ZmFrZS1iYXNlNjQ=',
    systemPrompt,
    userPrompt,
  })

  assert.deepEqual(payload, {
    model: 'gemini-3-flash-preview',
    messages: [
      {
        role: 'system',
        content: systemPrompt,
      },
      {
        role: 'user',
        content: [
          {
            type: 'text',
            text: userPrompt,
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
