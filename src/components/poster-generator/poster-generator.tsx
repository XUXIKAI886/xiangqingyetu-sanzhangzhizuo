'use client'

import { useState, useCallback } from 'react'
import { Loader2, Sparkles, Zap, ImageIcon, Type } from 'lucide-react'
import { ImageUpload } from './image-upload'
import { PosterCard } from './poster-card'
import { ImageGallery } from './image-gallery'
import type { PosterState } from '@/types/poster'
import { createInitialPosterState } from '@/types/poster'

export function PosterGenerator() {
  const [shopName, setShopName] = useState('')
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [imageBase64, setImageBase64] = useState<string | null>(null)
  const [posters, setPosters] = useState<PosterState[]>([
    createInitialPosterState(),
    createInitialPosterState(),
    createInitialPosterState(),
  ])

  const canGenerate = Boolean(shopName.trim() && imageBase64)
  const isAnyLoading = posters.some((p) => p.isLoading)

  const handleImageChange = (preview: string | null, base64: string | null) => {
    setImagePreview(preview)
    setImageBase64(base64)
  }

  const updatePoster = useCallback((index: number, updates: Partial<PosterState>) => {
    setPosters((prev) => {
      const newPosters = [...prev]
      newPosters[index] = { ...newPosters[index], ...updates }
      return newPosters
    })
  }, [])

  const generateSinglePoster = useCallback(
    async (index: number) => {
      if (!imageBase64 || !shopName.trim()) return

      updatePoster(index, {
        isLoading: true,
        step: '正在生成文案...',
        error: null,
      })

      try {
        const copyRes = await fetch('/api/generate-copy', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productImage: imageBase64,
            shopName: shopName.trim(),
            posterIndex: index,
          }),
        })

        if (!copyRes.ok) {
          throw new Error('文案生成失败')
        }

        const copyData = await copyRes.json()
        updatePoster(index, {
          copy: copyData,
          step: '正在生成图片...',
        })

        const imageRes = await fetch('/api/generate-image', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            productImage: imageBase64,
            copyPrompt: copyData.prompt,
          }),
        })

        if (!imageRes.ok) {
          throw new Error('图片生成失败')
        }

        const imageData = await imageRes.json()
        updatePoster(index, {
          image: { base64: imageData.imageBase64, mimeType: imageData.mimeType },
          step: '生成完成！',
          isLoading: false,
        })
      } catch (error) {
        updatePoster(index, {
          error: error instanceof Error ? error.message : '生成失败，请重试',
          isLoading: false,
          step: '',
        })
      }
    },
    [imageBase64, shopName, updatePoster]
  )

  // 顺序生成所有海报
  const generateAll = useCallback(async () => {
    if (!canGenerate || isAnyLoading) return

    // 按顺序执行，一个完成后再执行下一个
    for (const index of [0, 1, 2]) {
      await generateSinglePoster(index)
    }
  }, [canGenerate, isAnyLoading, generateSinglePoster])

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fefefe] via-[#faf8f6] to-[#f8f6f3] relative">
      {/* 柔和背景装饰 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-[600px] h-[600px] bg-gradient-to-br from-orange-100/40 via-amber-50/30 to-transparent rounded-full blur-3xl" />
        <div className="absolute top-1/3 -left-32 w-[400px] h-[400px] bg-gradient-to-tr from-rose-50/30 via-orange-50/20 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-gradient-to-t from-amber-50/30 via-yellow-50/20 to-transparent rounded-full blur-3xl" />
      </div>

      {/* 顶部导航栏 */}
      <header className="relative z-10 bg-white/70 backdrop-blur-xl border-b border-gray-100/80 sticky top-0">
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-200/50">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900 tracking-tight">美团外卖详情页生成器</h1>
                <p className="text-xs text-gray-500">AI-Powered Design Tool</p>
              </div>
            </div>
            <div className="hidden md:flex items-center gap-3">
              <span className="px-4 py-1.5 rounded-full bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-100 text-orange-600 text-sm font-medium">
                呈尚策划
              </span>
            </div>
          </div>
        </div>
      </header>

      <main className="relative z-10 max-w-6xl mx-auto px-6 py-10">
        {/* 输入区域卡片 */}
        <section className="mb-20">
          <div className="bg-white rounded-3xl p-8 md:p-10 shadow-[0_4px_40px_rgba(0,0,0,0.04)] border border-gray-100/80">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
              {/* 左侧：店铺名称输入 */}
              <div className="space-y-4">
                <label className="flex items-center gap-2.5 text-sm font-semibold text-gray-800">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center">
                    <Type className="w-4 h-4 text-orange-500" />
                  </div>
                  店铺名称
                </label>
                <input
                  type="text"
                  value={shopName}
                  onChange={(e) => setShopName(e.target.value)}
                  placeholder="请输入店铺名称"
                  className="w-full px-5 py-4 bg-gray-50/80 border border-gray-200/80 rounded-2xl text-gray-900 placeholder:text-gray-400 focus:border-orange-300 focus:bg-white focus:ring-4 focus:ring-orange-100 outline-none transition-all text-base"
                />
                <p className="text-sm text-gray-500 pl-1">店铺名称将显示在生成的海报中</p>
              </div>

              {/* 右侧：图片上传 */}
              <div className="space-y-4">
                <label className="flex items-center gap-2.5 text-sm font-semibold text-gray-800">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center">
                    <ImageIcon className="w-4 h-4 text-orange-500" />
                  </div>
                  产品图片
                </label>
                <ImageUpload imagePreview={imagePreview} onImageChange={handleImageChange} />
              </div>
            </div>

            {/* 一键生成按钮 */}
            <div className="mt-10 pt-8 border-t border-gray-100">
              <button
                type="button"
                onClick={generateAll}
                disabled={!canGenerate || isAnyLoading}
                className="w-full py-5 bg-gradient-to-r from-orange-500 to-amber-500 text-white font-semibold rounded-2xl hover:from-orange-600 hover:to-amber-600 hover:shadow-xl hover:shadow-orange-200/50 hover:-translate-y-0.5 active:translate-y-0 transition-all duration-300 disabled:from-gray-200 disabled:to-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none flex items-center justify-center gap-3 text-lg"
              >
                {isAnyLoading ? (
                  <>
                    <Loader2 size={22} className="animate-spin" />
                    正在生成中...
                  </>
                ) : (
                  <>
                    <Sparkles size={22} />
                    一键生成全部海报
                  </>
                )}
              </button>
              {!canGenerate && (
                <p className="text-center text-sm text-gray-400 mt-4">请先输入店铺名称并上传产品图片</p>
              )}
            </div>
          </div>
        </section>

        {/* 海报卡片组 */}
        <section className="mb-20">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">生成海报</h3>
              <p className="text-gray-500">点击下方卡片单独生成或使用一键生成</p>
            </div>
            <div className="px-4 py-2 rounded-full bg-orange-50 border border-orange-100">
              <span className="text-sm font-medium text-orange-600">
                {posters.filter(p => p.image).length} / 3 已生成
              </span>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {posters.map((poster, index) => (
              <PosterCard
                key={index}
                index={index}
                poster={poster}
                canGenerate={canGenerate}
                onGenerate={() => generateSinglePoster(index)}
              />
            ))}
          </div>
        </section>

        {/* 图片展示区域 */}
        <ImageGallery posters={posters} shopName={shopName} />

        {/* 页脚 */}
        <footer className="mt-24 pt-10 border-t border-gray-100">
          <div className="text-center">
            <p className="text-sm text-gray-500 mb-3">支持上传 JPG、PNG 等常见图片格式，图片将自动压缩优化</p>
            <p className="text-xs text-gray-400">Powered by AI Technology</p>
          </div>
        </footer>
      </main>
    </div>
  )
}
