import test from 'node:test'
import assert from 'node:assert/strict'

import {
  DEFAULT_GENERATE_IMAGE_THREAD2_BASE_URL,
  DEFAULT_GENERATE_IMAGE_THREAD2_MODEL,
  GENERATE_IMAGE_THREAD1_API_URL,
  getGenerateImageThreadAvailability,
  normalizeGenerateImageApiThread,
  resolveGenerateImageThread2ChatCompletionsUrl,
  resolveGenerateImageThreadConfig,
} from '../src/lib/generate-image-thread-config.ts'

test('未传线路时应默认使用线路1', () => {
  assert.equal(normalizeGenerateImageApiThread(undefined), 'thread1')
  assert.equal(normalizeGenerateImageApiThread('invalid-thread'), 'thread1')
  assert.equal(normalizeGenerateImageApiThread('thread2'), 'thread2')
})

test('线路2地址应规范化为 chat completions 端点', () => {
  assert.equal(
    resolveGenerateImageThread2ChatCompletionsUrl('https://128api.cn'),
    'https://128api.cn/v1/chat/completions'
  )

  assert.equal(
    resolveGenerateImageThread2ChatCompletionsUrl('https://128api.cn/v1'),
    'https://128api.cn/v1/chat/completions'
  )

  assert.equal(
    resolveGenerateImageThread2ChatCompletionsUrl('https://128api.cn/v1/chat/completions'),
    'https://128api.cn/v1/chat/completions'
  )
})

test('线路1配置应保持当前云雾接口为默认', () => {
  const config = resolveGenerateImageThreadConfig(undefined, {
    YUNWU_API_KEY_COPY: 'thread1-copy-key',
    YUNWU_API_KEY_IMAGE: 'thread1-key',
  })

  assert.deepEqual(config, {
    selectedThread: 'thread1',
    providerName: '云雾图片生成（线路1）',
    apiStyle: 'gemini-native',
    apiKey: 'thread1-key',
    endpointUrl: GENERATE_IMAGE_THREAD1_API_URL,
    modelName: 'gemini-3.1-flash-image-preview',
  })
})

test('线路2配置应使用图片墙线路4对应的 128API OpenAI 兼容接口', () => {
  const config = resolveGenerateImageThreadConfig('thread2', {
    GENERATE_IMAGE_THREAD2_BASE_URL: 'https://128api.cn/v1',
    GENERATE_IMAGE_THREAD2_API_KEY: 'thread2-key',
    GENERATE_IMAGE_THREAD2_MODEL_NAME: 'gemini-3.1-flash-image',
  })

  assert.deepEqual(config, {
    selectedThread: 'thread2',
    providerName: '128API 图片生成（线路2）',
    apiStyle: 'openai-compatible',
    apiKey: 'thread2-key',
    endpointUrl: 'https://128api.cn/v1/chat/completions',
    modelName: 'gemini-3.1-flash-image',
  })
})

test('线路可用性应基于当前环境变量判断', () => {
  const availability = getGenerateImageThreadAvailability({
    YUNWU_API_KEY_COPY: 'thread1-copy-key',
    YUNWU_API_KEY_IMAGE: 'thread1-key',
    GENERATE_IMAGE_THREAD2_BASE_URL: DEFAULT_GENERATE_IMAGE_THREAD2_BASE_URL,
    GENERATE_IMAGE_THREAD2_API_KEY: 'thread2-key',
  })

  assert.deepEqual(availability, {
    thread1: {
      available: true,
      name: '云雾图片生成',
      description: '默认线路，文案+图片同步生成',
    },
    thread2: {
      available: true,
      name: '128API 图片生成',
      description: '备用线路，OpenAI 兼容格式',
    },
  })
})
