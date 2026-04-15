import test from 'node:test'
import assert from 'node:assert/strict'

import { buildGenerateCopySystemPrompt } from '../src/lib/generate-copy-system-prompt.ts'
import { PROMPT_TEMPLATE } from '../src/lib/prompt-template.ts'

test('线路2文案系统提示词应使用单海报 JSON 强约束版本', () => {
  const prompt = buildGenerateCopySystemPrompt({
    posterIndex: 0,
    apiStyle: 'openai-compatible',
  })

  assert.match(prompt, /只生成第1张海报「主KV视觉」/)
  assert.match(prompt, /必须返回一个合法 JSON 对象/)
  assert.doesNotMatch(prompt, /10张海报/)
  assert.doesNotMatch(prompt, /输出格式示例/)
})

test('线路1文案系统提示词应继续保留完整模板', () => {
  const prompt = buildGenerateCopySystemPrompt({
    posterIndex: 2,
    apiStyle: 'gemini-native',
    promptTemplate: PROMPT_TEMPLATE,
  })

  assert.match(prompt, /10张海报/)
  assert.match(prompt, /只需要生成第3张海报「工艺展示」/)
})
