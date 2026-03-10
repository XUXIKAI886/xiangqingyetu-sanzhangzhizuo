import test from 'node:test'
import assert from 'node:assert/strict'

import { parseCopyResponseText } from '../src/lib/copy-response-parser.ts'

test('解析完整 JSON 响应时应提取出文案对象', () => {
  const responseText = JSON.stringify(
    {
      candidates: [
        {
          content: {
            parts: [
              {
                text: '```json\n{\n  "title": "主KV视觉",\n  "content": "示例内容",\n  "prompt": "示例提示词"\n}\n```',
              },
            ],
          },
        },
      ],
    },
    null,
    2
  )

  const parsed = parseCopyResponseText(responseText)

  assert.deepEqual(parsed, {
    title: '主KV视觉',
    content: '示例内容',
    prompt: '示例提示词',
  })
})

test('解析 NDJSON 流式响应时应拼接分块文本', () => {
  const responseText = [
    JSON.stringify({
      candidates: [
        {
          content: {
            parts: [{ text: '{"title":"主KV视觉"' }],
          },
        },
      ],
    }),
    JSON.stringify({
      candidates: [
        {
          content: {
            parts: [{ text: ',"content":"示例内容"' }],
          },
        },
      ],
    }),
    JSON.stringify({
      candidates: [
        {
          content: {
            parts: [{ text: ',"prompt":"示例提示词"}' }],
          },
        },
      ],
    }),
  ].join('\n')

  const parsed = parseCopyResponseText(responseText)

  assert.deepEqual(parsed, {
    title: '主KV视觉',
    content: '示例内容',
    prompt: '示例提示词',
  })
})
