/**
 * 带重试机制的 fetch 函数
 * @param url 请求地址
 * @param options fetch 选项
 * @param maxRetries 最大重试次数
 * @param delay 重试间隔（毫秒）
 */
export async function fetchWithRetry(
  url: string,
  options: RequestInit,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<Response> {
  let lastError: Error | null = null;

  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, options);
      // 成功或客户端错误（4xx）不重试
      if (response.ok || response.status < 500) {
        return response;
      }
      lastError = new Error(`HTTP ${response.status}: ${response.statusText}`);
      console.log(`请求失败 (${response.status})，第 ${i + 1}/${maxRetries} 次重试...`);
    } catch (error) {
      lastError = error as Error;
      console.log(`请求异常: ${lastError.message}，第 ${i + 1}/${maxRetries} 次重试...`);
    }

    // 最后一次不等待
    if (i < maxRetries - 1) {
      const waitTime = delay * (i + 1); // 递增等待时间
      console.log(`等待 ${waitTime}ms 后重试...`);
      await new Promise(r => setTimeout(r, waitTime));
    }
  }

  throw lastError || new Error('请求失败');
}
