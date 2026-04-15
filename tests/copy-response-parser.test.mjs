import test from 'node:test'
import assert from 'node:assert/strict'

import {
  parseCopyJsonText,
  parseCopyResponseText,
  parseCopyText,
} from '../src/lib/copy-response-parser.ts'

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

test('解析纯文本 JSON 代码块时应提取出文案对象', () => {
  const parsed = parseCopyJsonText(`\`\`\`json
{
  "title": "主KV视觉",
  "content": "示例内容",
  "prompt": "示例提示词"
}
\`\`\``)

  assert.deepEqual(parsed, {
    title: '主KV视觉',
    content: '示例内容',
    prompt: '示例提示词',
  })
})

test('解析自然语言 Markdown 响应时应兜底提取标题文案和提示词', () => {
  const parsed = parseCopyText(`
这碗麻辣烫的视觉核心在于市井烟火气与食材爆发感。

## 详情页文案策划

### 1. 核心标题
**火辣滚烫，鲜香入骨**
*(副标题：一口入魂的市井老味道)*

### 2. 视觉卖点
* 牛油红亮，浓郁挂汁，一眼治愈食欲。
* 鲜嫩原切牛肉，搭配脆爽时蔬。

## AI生图提示词
9:16竖版电商详情页海报，突出牛油红亮汤底与丰富配菜，暖色烟火氛围，品牌标题置顶。
`)

  assert.equal(parsed.title, '火辣滚烫，鲜香入骨')
  assert.match(parsed.content, /市井烟火气/)
  assert.match(parsed.prompt, /9:16竖版电商详情页海报/)
})
