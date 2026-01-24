/**
 * Tauri 剪贴板功能集成
 * 支持浏览器和 Tauri 双环境的剪贴板操作
 */

declare global {
  interface Window {
    __TAURI__?: {
      core?: {
        invoke: <T>(cmd: string, args?: Record<string, unknown>) => Promise<T>;
      };
      invoke?: <T>(cmd: string, args?: Record<string, unknown>) => Promise<T>;
      tauri?: {
        invoke: <T>(cmd: string, args?: Record<string, unknown>) => Promise<T>;
      };
    };
    __TAURI_INTERNALS__?: unknown;
  }
}

/**
 * 检测是否在 Tauri 环境中运行
 */
export function isTauriEnvironment(): boolean {
  if (typeof window === 'undefined') return false;

  const hasTauri2 = typeof window.__TAURI__?.core?.invoke === 'function';
  const hasTauri1Direct = typeof window.__TAURI__?.invoke === 'function';
  const hasTauri1Module = typeof window.__TAURI__?.tauri?.invoke === 'function';
  const hasTauriInternals = typeof window.__TAURI_INTERNALS__ !== 'undefined';
  const userAgent = navigator.userAgent || '';
  const isTauriUserAgent = userAgent.includes('Tauri') || userAgent.includes('wry');

  return hasTauri2 || hasTauri1Direct || hasTauri1Module || hasTauriInternals || isTauriUserAgent;
}

/**
 * 获取可用的 Tauri invoke 函数
 */
function getTauriInvoke(): ((cmd: string, args?: Record<string, unknown>) => Promise<unknown>) | null {
  if (typeof window === 'undefined' || !window.__TAURI__) return null;

  if (typeof window.__TAURI__.core?.invoke === 'function') {
    return window.__TAURI__.core.invoke;
  }
  if (typeof window.__TAURI__.invoke === 'function') {
    return window.__TAURI__.invoke;
  }
  if (typeof window.__TAURI__.tauri?.invoke === 'function') {
    return window.__TAURI__.tauri.invoke;
  }
  return null;
}

/**
 * 检测当前 URL 是否为本地 URL
 */
function isLocalUrl(): boolean {
  if (typeof window === 'undefined') return false;
  const url = window.location.href;
  return url.startsWith('tauri://') ||
         url.startsWith('http://tauri.localhost') ||
         url.startsWith('https://tauri.localhost') ||
         url.startsWith('http://localhost') ||
         url.startsWith('http://127.0.0.1') ||
         url.startsWith('file://');
}

/**
 * 降级方案：使用 execCommand
 */
function fallbackCopyToClipboard(text: string): boolean {
  try {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.left = '0';
    textarea.style.top = '0';
    textarea.style.width = '2em';
    textarea.style.height = '2em';
    textarea.style.padding = '0';
    textarea.style.border = 'none';
    textarea.style.outline = 'none';
    textarea.style.boxShadow = 'none';
    textarea.style.background = 'transparent';
    textarea.style.opacity = '0';
    textarea.style.zIndex = '-1';

    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    textarea.setSelectionRange(0, textarea.value.length);

    let successful = false;
    try {
      successful = document.execCommand('copy');
    } catch (e) {
      console.warn('execCommand 异常:', e);
    }

    document.body.removeChild(textarea);
    return successful;
  } catch (error) {
    console.error('降级方案异常:', error);
    return false;
  }
}

/**
 * 通用文本复制函数 - 支持浏览器和 Tauri 双环境
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  const isTauri = isTauriEnvironment();
  const invoke = getTauriInvoke();
  const isLocal = isLocalUrl();

  // 尝试 Tauri 原生 API
  if (invoke && isLocal) {
    try {
      await invoke('plugin:clipboard-manager|write_text', { text });
      return true;
    } catch (error) {
      console.warn('Tauri API 失败，尝试降级:', error);
      return fallbackCopyToClipboard(text);
    }
  }

  // Tauri WebView 但无法使用 API → 直接降级
  if (isTauri) {
    return fallbackCopyToClipboard(text);
  }

  // 浏览器环境 - 尝试 Clipboard API
  try {
    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      await navigator.clipboard.writeText(text);
      return true;
    } else {
      return fallbackCopyToClipboard(text);
    }
  } catch (error) {
    console.warn('Clipboard API 失败，使用降级方案:', error);
    return fallbackCopyToClipboard(text);
  }
}
