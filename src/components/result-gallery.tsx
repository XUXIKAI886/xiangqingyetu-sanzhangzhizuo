'use client';

import { Download, Package } from 'lucide-react';
import { downloadImage } from '@/lib/utils';
import type { GenerationResult } from '@/types';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

interface ResultGalleryProps {
  results: GenerationResult[];
  shopName: string;
}

export function ResultGallery({ results, shopName }: ResultGalleryProps) {
  const handleDownloadSingle = (result: GenerationResult, index: number) => {
    const ext = result.mimeType.split('/')[1] || 'png';
    downloadImage(result.imageBase64, result.mimeType, `${shopName}_详情页${index + 1}.${ext}`);
  };

  const handleDownloadAll = async () => {
    const zip = new JSZip();
    results.forEach((result, index) => {
      const ext = result.mimeType.split('/')[1] || 'png';
      zip.file(`${shopName}_详情页${index + 1}.${ext}`, result.imageBase64, { base64: true });
    });
    const blob = await zip.generateAsync({ type: 'blob' });
    saveAs(blob, `${shopName}_详情页图片.zip`);
  };

  if (results.length === 0) return null;

  return (
    <div className="space-y-8">
      {/* 标题栏 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">生成结果</h2>
          <p className="text-gray-500 mt-1">共 {results.length} 张详情页图片</p>
        </div>
        <button
          onClick={handleDownloadAll}
          className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-xl hover:shadow-lg transition-all hover:-translate-y-0.5"
        >
          <Package size={20} />
          批量下载 ZIP
        </button>
      </div>

      {/* 图片网格 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {results.map((result, index) => (
          <div key={index} className="glass-card rounded-3xl overflow-hidden group hover:shadow-2xl transition-all">
            <div className="aspect-[9/16] bg-gray-100 overflow-hidden">
              <img
                src={`data:${result.mimeType};base64,${result.imageBase64}`}
                alt={result.sectionTitle}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            <div className="p-5">
              <h3 className="font-semibold text-gray-800 mb-2">{result.sectionTitle}</h3>
              <p className="text-sm text-gray-500 mb-4 line-clamp-2">{result.copyContent}</p>
              <button
                onClick={() => handleDownloadSingle(result, index)}
                className="flex items-center gap-2 text-orange-500 hover:text-orange-600 font-medium"
              >
                <Download size={18} />
                下载图片
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
