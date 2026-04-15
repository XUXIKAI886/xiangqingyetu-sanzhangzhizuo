'use client'

import { useEffect, useState } from 'react'
import type { GenerateImageApiThread } from '@/lib/generate-image-thread-config'

interface ThreadAvailabilityItem {
  available: boolean
  name: string
  description: string
}

interface ThreadAvailability {
  thread1: ThreadAvailabilityItem
  thread2: ThreadAvailabilityItem
}

interface GenerateImageThreadSelectorProps {
  value: GenerateImageApiThread
  onChange: (thread: GenerateImageApiThread) => void
}

export function GenerateImageThreadSelector({
  value,
  onChange,
}: GenerateImageThreadSelectorProps) {
  const [availability, setAvailability] = useState<ThreadAvailability | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    fetch('/api/generate-image/availability', {
      cache: 'no-store',
    })
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return
        setAvailability(data)
        setLoading(false)
      })
      .catch((error) => {
        console.error('获取图片生成线路可用性失败:', error)
        if (cancelled) return
        setLoading(false)
      })

    return () => {
      cancelled = true
    }
  }, [])

  const thread1 = availability?.thread1
  const thread2 = availability?.thread2

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-gray-800">生成线路</p>
          <p className="text-xs text-gray-500">同一个线路选择会同时作用于文案生成和图片生成</p>
        </div>
        {loading && <span className="text-xs text-gray-400">正在检查可用性...</span>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          type="button"
          onClick={() => onChange('thread1')}
          className={`rounded-2xl border p-4 text-left transition-all ${
            value === 'thread1'
              ? 'border-orange-300 bg-orange-50 shadow-sm'
              : 'border-gray-200 bg-white hover:border-orange-200'
          }`}
        >
          <div className="flex items-center justify-between gap-3 mb-2">
            <span className="text-sm font-semibold text-gray-900">线路1</span>
            <span className="text-xs rounded-full px-2 py-1 bg-orange-100 text-orange-600">
              默认
            </span>
          </div>
          <p className="text-sm text-gray-700">{thread1?.name || '云雾生成'}</p>
          <p className="text-xs text-gray-500 mt-1">
            {thread1?.description || '默认线路，文案+图片同步生成'}
          </p>
        </button>

        <button
          type="button"
          onClick={() => thread2?.available && onChange('thread2')}
          disabled={!thread2?.available}
          className={`rounded-2xl border p-4 text-left transition-all ${
            value === 'thread2'
              ? 'border-emerald-300 bg-emerald-50 shadow-sm'
              : 'border-gray-200 bg-white hover:border-emerald-200'
          } ${
            thread2 && !thread2.available ? 'opacity-60 cursor-not-allowed hover:border-gray-200' : ''
          }`}
        >
          <div className="flex items-center justify-between gap-3 mb-2">
            <span className="text-sm font-semibold text-gray-900">线路2</span>
            <span
              className={`text-xs rounded-full px-2 py-1 ${
                thread2?.available
                  ? 'bg-emerald-100 text-emerald-600'
                  : 'bg-gray-100 text-gray-500'
              }`}
            >
              {thread2?.available ? '可切换' : '未配置'}
            </span>
          </div>
          <p className="text-sm text-gray-700">{thread2?.name || '128API 生成'}</p>
          <p className="text-xs text-gray-500 mt-1">
            {thread2?.description || '备用线路，OpenAI 兼容格式'}
          </p>
        </button>
      </div>
    </div>
  )
}
