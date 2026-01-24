'use client'

import React, { useEffect } from "react"
import { useRef } from 'react'
import { X, Check, ImageIcon, Clipboard } from 'lucide-react'
import { compressImage } from '@/lib/image-utils'

interface ImageUploadProps {
  imagePreview: string | null
  onImageChange: (preview: string | null, base64: string | null) => void
}

export function ImageUpload({ imagePreview, onImageChange }: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null)

  const processFile = async (file: File) => {
    if (!file.type.startsWith('image/')) return
    try {
      const compressedBase64 = await compressImage(file, 800, 0.7)
      // 预览需要完整 data URL，API 需要纯 base64
      const previewUrl = `data:image/jpeg;base64,${compressedBase64}`
      onImageChange(previewUrl, compressedBase64)
    } catch (error) {
      console.error('图片压缩失败:', error)
    }
  }

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) await processFile(file)
  }

  // 监听粘贴事件
  useEffect(() => {
    const handlePaste = async (e: ClipboardEvent) => {
      const items = e.clipboardData?.items
      if (!items) return

      for (const item of items) {
        if (item.type.startsWith('image/')) {
          const file = item.getAsFile()
          if (file) await processFile(file)
          break
        }
      }
    }

    document.addEventListener('paste', handlePaste)
    return () => document.removeEventListener('paste', handlePaste)
  }, [onImageChange])

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onImageChange(null, null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <div className="w-full">
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {imagePreview ? (
        <div className="relative group">
          <div className="flex items-center gap-5 p-5 bg-gradient-to-br from-green-50 to-emerald-50 border border-green-100 rounded-2xl">
            <div className="relative w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-white shadow-sm border border-green-100">
              <img
                src={imagePreview}
                alt="产品预览"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 text-sm text-green-700 font-semibold mb-1">
                <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center">
                  <Check className="w-3 h-3 text-white" />
                </div>
                图片已上传
              </div>
              <p className="text-xs text-green-600/70">
                点击右侧按钮可更换图片
              </p>
            </div>
            <button
              type="button"
              onClick={handleClear}
              className="p-2.5 rounded-xl bg-white border border-gray-200 text-gray-500 hover:text-red-500 hover:border-red-200 hover:bg-red-50 transition-all shadow-sm"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      ) : (
        <div
          onClick={() => fileInputRef.current?.click()}
          className="relative flex flex-col items-center justify-center gap-4 p-10 bg-gray-50/80 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-300 border-gray-200 hover:border-orange-300 hover:bg-orange-50/50"
        >
          <div className="w-16 h-16 rounded-2xl flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-50">
            <ImageIcon className="w-7 h-7 text-gray-400" />
          </div>
          <div className="text-center">
            <p className="text-base font-medium mb-1 text-gray-700">
              点击上传或 Ctrl+V 粘贴图片
            </p>
            <p className="text-sm text-gray-400">
              支持 JPG、PNG 格式
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
