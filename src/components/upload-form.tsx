'use client';

import { useState, useRef } from 'react';
import { Upload, X } from 'lucide-react';
import { fileToBase64, compressImage } from '@/lib/utils';

interface UploadFormProps {
  onSubmit: (productImage: string, shopName: string) => void;
  isLoading: boolean;
}

export function UploadForm({ onSubmit, isLoading }: UploadFormProps) {
  const [shopName, setShopName] = useState('');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 压缩图片：最大宽度800px，质量70%
    const compressedBase64 = await compressImage(file, 800, 0.7);
    setImageBase64(compressedBase64);
    setImagePreview(`data:image/jpeg;base64,${compressedBase64}`);

    console.log('原始大小:', Math.round(file.size / 1024), 'KB');
    console.log('压缩后大小:', Math.round(compressedBase64.length * 0.75 / 1024), 'KB');
  };

  const clearImage = () => {
    setImagePreview(null);
    setImageBase64(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (imageBase64 && shopName.trim()) {
      onSubmit(imageBase64, shopName.trim());
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* 店铺名称输入 */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          店铺名称
        </label>
        <div className="relative">
          <input
            type="text"
            value={shopName}
            onChange={(e) => setShopName(e.target.value)}
            placeholder="请输入您的店铺名称"
            className="w-full px-5 py-4 bg-gray-50 border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-orange-100 focus:border-orange-400 transition-all outline-none text-gray-800 placeholder-gray-400"
            disabled={isLoading}
          />
        </div>
      </div>

      {/* 图片上传区域 */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-3">
          产品图片
        </label>
        {imagePreview ? (
          <div className="relative inline-block group">
            <img
              src={imagePreview}
              alt="产品预览"
              className="max-w-sm max-h-72 rounded-2xl border-2 border-gray-200 shadow-lg"
            />
            <button
              type="button"
              onClick={clearImage}
              className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-2 hover:bg-red-600 shadow-lg transition-all hover:scale-110"
            >
              <X size={18} />
            </button>
          </div>
        ) : (
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-gray-300 rounded-2xl p-12 text-center cursor-pointer hover:border-orange-400 hover:bg-orange-50 transition-all group"
          >
            <div className="w-16 h-16 mx-auto bg-orange-100 rounded-2xl flex items-center justify-center group-hover:bg-orange-200 transition-colors">
              <Upload className="h-8 w-8 text-orange-500" />
            </div>
            <p className="mt-4 text-base font-medium text-gray-700">点击上传产品图片</p>
            <p className="mt-1 text-sm text-gray-400">支持 JPG、PNG 格式</p>
          </div>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png"
          onChange={handleFileChange}
          className="hidden"
        />
      </div>

      {/* 提交按钮 */}
      <button
        type="submit"
        disabled={!imageBase64 || !shopName.trim() || isLoading}
        className="w-full py-4 px-6 btn-primary text-white font-semibold rounded-2xl disabled:bg-gray-300 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none"
      >
        {isLoading ? '生成中...' : '开始生成详情页'}
      </button>
    </form>
  );
}
