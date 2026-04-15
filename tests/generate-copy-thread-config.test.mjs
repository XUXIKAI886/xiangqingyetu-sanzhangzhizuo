import test from 'node:test'
import assert from 'node:assert/strict'

import {
  DEFAULT_GENERATE_COPY_THREAD2_MODEL,
  GENERATE_COPY_THREAD1_API_URL,
  normalizeGenerateCopyApiThread,
  resolveGenerateCopyThreadConfig,
} from '../src/lib/generate-copy-thread-config.ts'

test('文案线路未传值时应默认使用线路1', () => {
  assert.equal(normalizeGenerateCopyApiThread(undefined), 'thread1')
  assert.equal(normalizeGenerateCopyApiThread('thread2'), 'thread2')
  assert.equal(normalizeGenerateCopyApiThread('unknown'), 'thread1')
})

test('文案线路1应保持当前云雾接口与模型', () => {
  const config = resolveGenerateCopyThreadConfig(undefined, {
    YUNWU_API_KEY_COPY: 'copy-key',
  })

  assert.deepEqual(config, {
    selectedThread: 'thread1',
    providerName: '云雾文案生成（线路1）',
    apiStyle: 'gemini-native',
    apiKey: 'copy-key',
    endpointUrl: GENERATE_COPY_THREAD1_API_URL,
    modelName: 'gemini-3-flash-preview',
  })
})

test('文案线路2应复用 128API 的地址与 key，但模型切换为 gemini-3-flash-preview', () => {
  const config = resolveGenerateCopyThreadConfig('thread2', {
    GENERATE_IMAGE_THREAD2_BASE_URL: 'https://128api.cn/v1',
    GENERATE_IMAGE_THREAD2_API_KEY: 'thread2-key',
  })

  assert.deepEqual(config, {
    selectedThread: 'thread2',
    providerName: '128API 文案生成（线路2）',
    apiStyle: 'openai-compatible',
    apiKey: 'thread2-key',
    endpointUrl: 'https://128api.cn/v1/chat/completions',
    modelName: DEFAULT_GENERATE_COPY_THREAD2_MODEL,
  })
})
