'use client'

import { useState } from 'react'
import { Download, ExternalLink, ImageIcon, Sparkles, FolderDown, Copy, Check } from 'lucide-react'
import type { PosterState } from '@/types/poster'
import { exportImageFromUrl, exportImageUrlsBatch } from '@/lib/tauri-image-export'
import { copyToClipboard } from '@/lib/tauri-clipboard'
import { POSTER_TYPES } from '@/types/poster'

const SALES_SCRIPT = `老板，我们分析了您店铺的销售数据，把您家销量最高、人气最好的1款产品挑出来，专门做了一套精美的详情页图，已经上线了。您可以打开店铺看看效果。详情页图这个东西很多老板不知道，但从数据上看它对转化率的影响其实很大。顾客点进人气商品之后，如果只看到一张主图就没了，很容易犹豫一下就退出去了。但如果有详情页图展示食材用料、制作工艺、分量实拍这些内容，顾客的信任感会强很多，下单的概率能提升20%-30%。我们给您做的这三张图就是按照高转化的逻辑来设计的，把您产品的卖点和优势都展示出来了。
还有一点很关键，美团现在有个"优质商品"的标签认证，平台会根据人气商品的图片质量、详情完整度、销量评分这些维度来评判。有了详情页图之后，您这1款爆品更容易拿到优质商品的标签，平台会给贴标商品更多的曝光倾斜，在搜索结果和推荐位里排名会更靠前。说白了就是平台觉得您这个商品展示得专业、信息完整，更愿意把流量给您。`

interface ImageGalleryProps {
  posters: PosterState[]
  shopName: string
}

export function ImageGallery({ posters, shopName }: ImageGalleryProps) {
  const [copied, setCopied] = useState(false)

  const postersWithImages = posters
    .map((poster, index) => ({ poster, index }))
    .filter(({ poster }) => poster.image)

  const handleCopyScript = async () => {
    try {
      const success = await copyToClipboard(SALES_SCRIPT)
      if (success) {
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }
    } catch (error) {
      console.error('复制失败:', error)
    }
  }

  if (postersWithImages.length === 0) {
    return (
      <section className="mt-20">
        <div className="flex items-center justify-between mb-10">
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">生成结果</h3>
            <p className="text-gray-500">生成的海报将在此处展示</p>
          </div>
        </div>
        <div className="bg-white border border-gray-100 rounded-2xl p-16 flex flex-col items-center justify-center shadow-sm">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-gray-100 to-gray-50 flex items-center justify-center mb-6">
            <ImageIcon className="w-9 h-9 text-gray-300" />
          </div>
          <p className="text-gray-500 text-center font-medium mb-2">暂无生成结果</p>
          <p className="text-sm text-gray-400 text-center">请先上传产品图片并点击生成按钮</p>
        </div>
      </section>
    )
  }

  const handleDownload = async (poster: PosterState, index: number) => {
    if (!poster.image) return
    const filename = `${shopName || '海报'}_详情页${index + 1}.png`
    await exportImageFromUrl(poster.image.url, {
      filename,
      mimeType: poster.image.mimeType
    })
  }

  const handleBatchDownload = async () => {
    const images = postersWithImages.map(({ poster, index }) => ({
      url: poster.image!.url,
      filename: `${shopName || '海报'}_详情页${index + 1}.png`,
      mimeType: poster.image!.mimeType
    }))
    await exportImageUrlsBatch(images)
  }

  return (
    <section className="mt-20">
      <div className="flex items-center justify-between mb-10">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-1">生成结果</h3>
          <p className="text-gray-500">点击图片可下载或查看大图</p>
        </div>
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={handleBatchDownload}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-medium hover:from-orange-600 hover:to-amber-600 hover:shadow-lg hover:shadow-orange-200/50 transition-all"
          >
            <FolderDown className="w-4 h-4" />
            批量下载
          </button>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100">
            <Sparkles className="w-4 h-4 text-green-500" />
            <span className="text-sm font-medium text-green-600">{postersWithImages.length} 张海报已生成</span>
          </div>
        </div>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {postersWithImages.map(({ poster, index }) => (
            <div
              key={index}
              className="group relative bg-gray-50 rounded-2xl overflow-hidden border border-gray-100 hover:border-orange-200 hover:shadow-xl hover:shadow-orange-50 transition-all duration-300"
            >
              <div className="relative bg-gradient-to-br from-gray-100 to-gray-50 overflow-hidden">
                <img
                  src={poster.image!.url}
                  alt={`详情页 ${index + 1}`}
                  className="w-full h-auto object-contain transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center p-5">
                  <div className="flex gap-3 w-full">
                    <button
                      type="button"
                      onClick={() => handleDownload(poster, index)}
                      className="flex-1 py-3 bg-white text-gray-900 font-medium rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 text-sm shadow-lg"
                    >
                      <Download size={16} />
                      下载图片
                    </button>
                    <button
                      type="button"
                      onClick={() => poster.image?.url && window.open(poster.image.url, '_blank')}
                      className="py-3 px-4 bg-white/20 backdrop-blur-sm text-white font-medium rounded-xl hover:bg-white/30 transition-colors flex items-center justify-center border border-white/20"
                    >
                      <ExternalLink size={16} />
                    </button>
                  </div>
                </div>
              </div>
              <div className="p-5 bg-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-900">{POSTER_TYPES[index]?.name || `详情页 ${index + 1}`}</h4>
                    <p className="text-xs text-gray-400 mt-1">详情页 {index + 1}</p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-50 to-amber-50 flex items-center justify-center text-sm font-bold">
                    <span className="bg-gradient-to-br from-orange-500 to-amber-500 bg-clip-text text-transparent">{index + 1}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 发送话术卡片 */}
      <div className="mt-8 bg-gradient-to-br from-amber-50 to-orange-50 border border-orange-100 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-400 to-amber-400 flex items-center justify-center">
              <Copy className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">发送话术</h4>
              <p className="text-xs text-gray-500">配合图片发送给商家</p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleCopyScript}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-medium transition-all ${
              copied
                ? 'bg-green-500 text-white'
                : 'bg-white text-gray-700 border border-gray-200 hover:border-orange-300 hover:bg-orange-50'
            }`}
          >
            {copied ? (
              <>
                <Check className="w-4 h-4" />
                已复制
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                复制话术
              </>
            )}
          </button>
        </div>
        <div className="bg-white rounded-xl p-4 border border-orange-100 text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
          {SALES_SCRIPT}
        </div>
      </div>
    </section>
  )
}
