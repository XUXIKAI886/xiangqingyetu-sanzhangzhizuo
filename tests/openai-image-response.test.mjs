import test from 'node:test'
import assert from 'node:assert/strict'

import { extractImageDataFromOpenAIResponse } from '../src/lib/openai-image-response.ts'

test('应优先从 OpenAI data 数组中提取 b64_json 图片', () => {
  const result = extractImageDataFromOpenAIResponse({
    data: [
      {
        b64_json: 'ZmFrZS1pbWFnZS1iYXNlNjQ=',
      },
    ],
  })

  assert.deepEqual(result, {
    base64: 'ZmFrZS1pbWFnZS1iYXNlNjQ=',
    mimeType: 'image/png',
  })
})

test('应支持从 message content 的 data url 中提取图片', () => {
  const result = extractImageDataFromOpenAIResponse({
    choices: [
      {
        message: {
          content: [
            {
              type: 'image_url',
              image_url: {
                url: 'data:image/jpeg;base64,ZmFrZS1qcGVnLWJhc2U2NA==',
              },
            },
          ],
        },
      },
    ],
  })

  assert.deepEqual(result, {
    base64: 'ZmFrZS1qcGVnLWJhc2U2NA==',
    mimeType: 'image/jpeg',
  })
})

test('应支持从 message content 的纯 base64 文本中提取图片', () => {
  const result = extractImageDataFromOpenAIResponse({
    choices: [
      {
        message: {
          content: 'ZmFrZS1wbmctYmFzZTY0',
        },
      },
    ],
  })

  assert.deepEqual(result, {
    base64: 'ZmFrZS1wbmctYmFzZTY0',
    mimeType: 'image/png',
  })
})
