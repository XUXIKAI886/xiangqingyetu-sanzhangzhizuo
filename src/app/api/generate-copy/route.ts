import { NextRequest, NextResponse } from 'next/server';
import { fetchWithRetry } from '@/lib/retry';
import { PROMPT_TEMPLATE } from '@/lib/prompt-template';
import { parseCopyResponseText, parseCopyText } from '@/lib/copy-response-parser';
import { resolveGenerateCopyThreadConfig } from '@/lib/generate-copy-thread-config';
import { buildGenerateCopyRequestPayload } from '@/lib/generate-copy-request-payload';
import { extractCopyTextFromOpenAIResponse } from '@/lib/openai-copy-response';
import {
  buildGenerateCopySystemPrompt,
  resolveCopyPosterType,
} from '@/lib/generate-copy-system-prompt';

export async function POST(request: NextRequest) {
  try {
    const { productImage, shopName, posterIndex = 0, apiThread } = await request.json();
    console.log('收到请求, 线路:', apiThread || 'thread1', '店铺名:', shopName, '海报索引:', posterIndex, '图片长度:', productImage?.length);

    if (!productImage || !shopName) {
      return NextResponse.json(
        { error: '缺少产品图片或店铺名称' },
        { status: 400 }
      );
    }

    const threadConfig = resolveGenerateCopyThreadConfig(apiThread);
    if (!threadConfig.apiKey) {
      console.error(`${threadConfig.providerName} 环境变量未配置`);
      return NextResponse.json({ error: `${threadConfig.providerName} 未配置` }, { status: 500 });
    }

    const systemPrompt = buildGenerateCopySystemPrompt({
      posterIndex,
      apiStyle: threadConfig.apiStyle,
      promptTemplate: PROMPT_TEMPLATE,
    });
    const posterType = resolveCopyPosterType(posterIndex);
    const userPrompt = `店铺名称：${shopName}\n请分析这个产品图片，生成第${posterIndex + 1}张「${posterType.name}」详情页的文案和提示词。`;
    const requestPayload = buildGenerateCopyRequestPayload({
      config: threadConfig,
      productImage,
      systemPrompt,
      userPrompt,
    });

    console.log('开始调用 API, 生成海报:', posterType.name);
    console.log('当前文案模型:', threadConfig.modelName);
    const endpointUrl = threadConfig.apiStyle === 'gemini-native'
      ? `${threadConfig.endpointUrl}?key=${threadConfig.apiKey}`
      : threadConfig.endpointUrl;

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (threadConfig.apiStyle === 'openai-compatible') {
      headers.Authorization = `Bearer ${threadConfig.apiKey}`;
    }

    const response = await fetchWithRetry(endpointUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(requestPayload)
    });

    console.log('API 响应状态:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('API Error Response:', errorText);
      return NextResponse.json(
        { error: '文案生成失败', detail: errorText },
        { status: 500 }
      );
    }

    let parsed: ReturnType<typeof parseCopyResponseText>;

    if (threadConfig.apiStyle === 'openai-compatible') {
      const responseJson = await response.json();

      try {
        const responseText = extractCopyTextFromOpenAIResponse(responseJson);
        parsed = parseCopyText(responseText);
      } catch (error) {
        console.error('解析 OpenAI 文案响应失败:', error);
        console.error('OpenAI 文案原始响应预览:', JSON.stringify(responseJson).substring(0, 500));
        return NextResponse.json(
          { error: '未获取到生成内容', raw: JSON.stringify(responseJson).substring(0, 500) },
          { status: 500 }
        );
      }
    } else {
      // 读取供应商原始响应，并兼容完整 JSON 与 NDJSON 两种格式
      const responseText = await response.text();
      console.log('API 返回原始数据长度:', responseText.length);

      try {
        parsed = parseCopyResponseText(responseText);
      } catch (error) {
        console.error('解析文案响应失败:', error);
        console.error('文案原始响应预览:', responseText.substring(0, 500));
        return NextResponse.json(
          { error: '未获取到生成内容', raw: responseText.substring(0, 500) },
          { status: 500 }
        );
      }
    }

    console.log('解析成功, 标题:', parsed.title);
    return NextResponse.json(parsed);

  } catch (error) {
    console.error('Generate copy error:', error);
    return NextResponse.json(
      { error: '服务器错误', message: String(error) },
      { status: 500 }
    );
  }
}
