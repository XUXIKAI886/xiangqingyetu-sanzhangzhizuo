/**
 * Tauri 图片导出工具
 * 双环境兼容：支持浏览器和 Tauri 桌面应用
 */

/** 文件过滤器 */
interface FileFilter {
  name: string;
  extensions: string[];
}

/** 导出选项 */
interface ImageExportOptions {
  filename?: string;
  title?: string;
  mimeType?: string;
}

/**
 * 检测是否在 Tauri 环境中运行
 */
export function isTauriEnvironment(): boolean {
  return typeof window !== 'undefined' &&
         typeof (window as any).__TAURI__ !== 'undefined' &&
         typeof (window as any).__TAURI__.core !== 'undefined' &&
         typeof (window as any).__TAURI__.core.invoke === 'function';
}

/**
 * 显示保存文件对话框（仅 Tauri 环境）
 */
async function showSaveDialog(
  defaultPath: string,
  title: string,
  filters: FileFilter[]
): Promise<string | null> {
  if (!isTauriEnvironment()) {
    throw new Error('showSaveDialog 只能在 Tauri 环境中使用');
  }

  const filePath = await (window as any).__TAURI__.core.invoke('plugin:dialog|save', {
    options: {
      defaultPath,
      title,
      filters
    }
  });

  return filePath;
}

/**
 * 写入文件（仅 Tauri 环境）
 */
async function writeFile(filePath: string, bytes: Uint8Array): Promise<void> {
  if (!isTauriEnvironment()) {
    throw new Error('writeFile 只能在 Tauri 环境中使用');
  }

  await (window as any).__TAURI__.core.invoke(
    'plugin:fs|write_file',
    bytes,
    {
      headers: {
        path: encodeURIComponent(filePath),
        options: JSON.stringify({})
      }
    }
  );
}

/**
 * Base64 转 Uint8Array
 */
function base64ToUint8Array(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * 导出 Base64 图片 - 支持浏览器和 Tauri 双环境
 */
export async function exportBase64Image(
  base64: string,
  options: ImageExportOptions = {}
): Promise<boolean> {
  const {
    filename = '导出图片.png',
    title = '保存图片',
    mimeType = 'image/png'
  } = options;

  try {
    // 浏览器环境
    if (!isTauriEnvironment()) {
      const bytes = base64ToUint8Array(base64);
      const blob = new Blob([bytes.buffer as ArrayBuffer], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      console.log('✅ [浏览器] 图片导出成功:', filename);
      return true;
    }

    // Tauri 环境
    console.log('🖼️ [Tauri] 开始保存图片:', filename);

    const filePath = await showSaveDialog(filename, title, [
      { name: '图片文件', extensions: ['png', 'jpg', 'jpeg'] },
      { name: '所有文件', extensions: ['*'] }
    ]);

    if (!filePath) {
      console.log('⚠️ [Tauri] 用户取消了保存');
      return false;
    }

    console.log('📁 [Tauri] 保存路径:', filePath);

    const bytes = base64ToUint8Array(base64);
    console.log('💾 [Tauri] 文件大小:', bytes.length, 'bytes');

    await writeFile(filePath, bytes);

    console.log('✅ [Tauri] 图片保存成功!');
    return true;

  } catch (error) {
    console.error('图片导出失败:', error);
    throw error;
  }
}

/**
 * 批量导出 Base64 图片 - 支持浏览器和 Tauri 双环境
 */
export async function exportBase64ImagesBatch(
  images: Array<{ base64: string; filename: string; mimeType?: string }>,
  options: { title?: string } = {}
): Promise<boolean> {
  const { title = '保存图片' } = options;

  try {
    // 浏览器环境 - 逐个下载
    if (!isTauriEnvironment()) {
      for (const img of images) {
        await exportBase64Image(img.base64, {
          filename: img.filename,
          mimeType: img.mimeType || 'image/png'
        });
        // 添加小延迟避免浏览器阻止多次下载
        await new Promise(r => setTimeout(r, 300));
      }
      console.log('✅ [浏览器] 批量导出成功:', images.length, '张图片');
      return true;
    }

    // Tauri 环境 - 选择文件夹后批量保存
    console.log('🖼️ [Tauri] 开始批量保存图片:', images.length, '张');

    // 逐个保存，每次弹出对话框
    for (const img of images) {
      const filePath = await showSaveDialog(img.filename, title, [
        { name: '图片文件', extensions: ['png', 'jpg', 'jpeg'] },
        { name: '所有文件', extensions: ['*'] }
      ]);

      if (!filePath) {
        console.log('⚠️ [Tauri] 用户取消了保存:', img.filename);
        continue;
      }

      const bytes = base64ToUint8Array(img.base64);
      await writeFile(filePath, bytes);
      console.log('✅ [Tauri] 保存成功:', filePath);
    }

    console.log('✅ [Tauri] 批量保存完成!');
    return true;

  } catch (error) {
    console.error('批量导出失败:', error);
    throw error;
  }
}
