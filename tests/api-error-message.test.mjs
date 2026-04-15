import test from 'node:test'
import assert from 'node:assert/strict'

import {
  buildApiErrorMessage,
  readApiErrorMessage,
} from '../src/lib/api-error-message.ts'

test('应拼接 error 和 detail 字段', () => {
  const message = buildApiErrorMessage('文案生成失败', {
    error: '未获取到生成内容',
    detail: '上游接口返回异常',
  })

  assert.equal(message, '未获取到生成内容\n\n详情：上游接口返回异常')
})

test('应拼接 error 和 raw 字段', () => {
  const message = buildApiErrorMessage('文案生成失败', {
    error: '未获取到生成内容',
    raw: '{"choices":[{"message":{"content":"普通文本"}}]}',
  })

  assert.equal(
    message,
    '未获取到生成内容\n\n原始响应：{"choices":[{"message":{"content":"普通文本"}}]}'
  )
})

test('应从响应对象里读取 JSON 错误并格式化', async () => {
  const response = new Response(
    JSON.stringify({
      error: '未获取到生成内容',
      raw: '{"choices":[{"message":{"content":"普通文本"}}]}',
    }),
    {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    }
  )

  const message = await readApiErrorMessage(response, '文案生成失败')

  assert.equal(
    message,
    '未获取到生成内容\n\n原始响应：{"choices":[{"message":{"content":"普通文本"}}]}'
  )
})
