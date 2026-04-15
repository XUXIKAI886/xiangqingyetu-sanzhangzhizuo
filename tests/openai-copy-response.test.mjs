import test from 'node:test'
import assert from 'node:assert/strict'

import { extractCopyTextFromOpenAIResponse } from '../src/lib/openai-copy-response.ts'

test('应从 OpenAI 字符串响应中提取文案文本', () => {
  const text = extractCopyTextFromOpenAIResponse({
    choices: [
      {
        message: {
          content: '{"title":"主KV视觉","content":"示例内容","prompt":"示例提示词"}',
        },
      },
    ],
  })

  assert.equal(text, '{"title":"主KV视觉","content":"示例内容","prompt":"示例提示词"}')
})

test('应从 OpenAI 数组响应中拼接文本片段', () => {
  const text = extractCopyTextFromOpenAIResponse({
    choices: [
      {
        message: {
          content: [
            { type: 'text', text: '{"title":"主KV视觉"' },
            { type: 'text', text: ',"content":"示例内容"' },
            { type: 'text', text: ',"prompt":"示例提示词"}' },
          ],
        },
      },
    ],
  })

  assert.equal(text, '{"title":"主KV视觉","content":"示例内容","prompt":"示例提示词"}')
})
