'use client'

import { Loader2, RefreshCw, Play, Check, AlertCircle } from 'lucide-react'
import type { PosterState } from '@/types/poster'
import { POSTER_TYPES } from '@/types/poster'

interface PosterCardProps {
  index: number
  poster: PosterState
  canGenerate: boolean
  onGenerate: () => void
}

export function PosterCard({ index, poster, canGenerate, onGenerate }: PosterCardProps) {
  const posterType = POSTER_TYPES[index]

  const getStatusIcon = () => {
    if (poster.isLoading) {
      return (
        <div className="w-8 h-8 rounded-full bg-orange-50 flex items-center justify-center">
          <Loader2 size={16} className="animate-spin text-orange-500" />
        </div>
      )
    }
    if (poster.error) {
      return (
        <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center">
          <AlertCircle size={16} className="text-red-500" />
        </div>
      )
    }
    if (poster.image) {
      return (
        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
          <Check size={16} className="text-green-600" />
        </div>
      )
    }
    return null
  }

  const getButtonContent = () => {
    if (poster.isLoading) {
      return (
        <>
          <Loader2 size={16} className="animate-spin" />
          <span>{poster.step || '生成中...'}</span>
        </>
      )
    }
    if (poster.image) {
      return (
        <>
          <RefreshCw size={16} />
          <span>重新生成</span>
        </>
      )
    }
    return (
      <>
        <Play size={16} />
        <span>开始生成</span>
      </>
    )
  }

  return (
    <div className="group relative bg-white border border-gray-100 rounded-2xl overflow-hidden hover:border-orange-200 hover:shadow-xl hover:shadow-orange-50 transition-all duration-300">
      {/* 卡片顶部状态条 */}
      <div className={`h-1.5 transition-all duration-500 ${
        poster.isLoading
          ? 'bg-gradient-to-r from-orange-400 to-amber-400 animate-pulse'
          : poster.image
            ? 'bg-gradient-to-r from-green-400 to-emerald-400'
            : poster.error
              ? 'bg-gradient-to-r from-red-400 to-rose-400'
              : 'bg-gray-100'
      }`} />

      <div className="p-6">
        {/* 卡片头部 */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center text-xl font-bold">
              <span className="bg-gradient-to-br from-orange-500 to-amber-500 bg-clip-text text-transparent">{index + 1}</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 text-lg">{posterType.name}</h3>
              <p className="text-sm text-gray-400">详情页 {index + 1}</p>
            </div>
          </div>
          {getStatusIcon()}
        </div>

        {/* 生成按钮 */}
        <button
          type="button"
          onClick={onGenerate}
          disabled={!canGenerate || poster.isLoading}
          className={`
            w-full py-3.5 rounded-xl font-medium text-sm
            flex items-center justify-center gap-2 transition-all duration-300
            ${poster.image
              ? 'bg-gray-50 border border-gray-200 text-gray-600 hover:border-orange-200 hover:bg-orange-50 hover:text-orange-600'
              : 'bg-gradient-to-r from-orange-500 to-amber-500 text-white hover:from-orange-600 hover:to-amber-600 hover:shadow-lg hover:shadow-orange-200/50 hover:-translate-y-0.5'
            }
            disabled:from-gray-100 disabled:to-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none
          `}
        >
          {getButtonContent()}
        </button>

        {/* 错误提示 */}
        {poster.error && (
          <div className="mt-5 p-4 bg-red-50 border border-red-100 text-red-600 text-sm rounded-xl flex items-start gap-3">
            <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
            <span>{poster.error}</span>
          </div>
        )}

        {/* 文案展示区 */}
        {poster.copy && (
          <div className="mt-5 p-5 bg-gradient-to-br from-orange-50/50 to-amber-50/50 border border-orange-100 rounded-xl">
            <div className="flex items-center gap-2 mb-3">
              <div className="w-2 h-2 rounded-full bg-gradient-to-r from-orange-400 to-amber-400" />
              <h4 className="font-semibold text-gray-900 text-sm">{poster.copy.title}</h4>
            </div>
            <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap max-h-32 overflow-y-auto">
              {poster.copy.content}
            </p>
          </div>
        )}

        {/* 海报类型描述 */}
        {!poster.copy && !poster.error && !poster.isLoading && (
          <div className="mt-5 p-5 bg-gray-50 border border-gray-100 rounded-xl">
            <p className="text-gray-500 text-sm leading-relaxed">{posterType.description}</p>
          </div>
        )}
      </div>
    </div>
  )
}
