import { NextRequest, NextResponse } from 'next/server';
import { fetchWithRetry } from '@/lib/retry';
import { PROMPT_TEMPLATE } from '@/lib/prompt-template';

const API_URL = 'https://yunwu.ai/v1beta/models/gemini-3-flash-preview:streamGenerateContent';

// 三种海报类型的描述
const POSTER_TYPES = [
  { name: '主KV视觉', desc: 'Hero Shot - 产品主图展示，突出品牌和核心卖点' },
  { name: '生活场景', desc: 'Lifestyle - 产品使用场景，展示实际使用效果' },
  { name: '工艺展示', desc: 'Process/Concept - 制作工艺、食材来源、品质保证' }
];

function getSystemPrompt(posterIndex: number): string {
  const posterType = POSTER_TYPES[posterIndex] || POSTER_TYPES[0];
  return `${PROMPT_TEMPLATE}

---
【重要】本次任务只需要生成第${posterIndex + 1}张海报「${posterType.name}」的内容。
海报类型说明：${posterType.desc}

输出格式必须为JSON：
{
  "title": "海报标题",
  "content": "详细的文案内容（至少200字）",
  "prompt": "完整的图片生成提示词（中英文，至少500字）"
}

只输出JSON，不要输出其他内容。`;
}

export async function POST(request: NextRequest) {
  try {
    const API_KEY = process.env.YUNWU_API_KEY_COPY;
    if (!API_KEY) {
      console.error('YUNWU_API_KEY_COPY 环境变量未配置');
      return NextResponse.json({ error: 'API Key 未配置' }, { status: 500 });
    }

    const { productImage, shopName, posterIndex = 0 } = await request.json();
    console.log('收到请求, 店铺名:', shopName, '海报索引:', posterIndex, '图片长度:', productImage?.length);

    if (!productImage || !shopName) {
      return NextResponse.json(
        { error: '缺少产品图片或店铺名称' },
        { status: 400 }
      );
    }

    const systemPrompt = getSystemPrompt(posterIndex);
    const posterType = POSTER_TYPES[posterIndex] || POSTER_TYPES[0];

    console.log('开始调用 API, 生成海报:', posterType.name);
    const response = await fetchWithRetry(`${API_URL}?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        systemInstruction: {
          parts: [{ text: systemPrompt }]
        },
        contents: [{
          role: 'user',
          parts: [
            {
              inline_data: {
                mime_type: 'image/jpeg',
                data: productImage
              }
            },
            {
              text: `店铺名称：${shopName}\n请分析这个产品图片，生成第${posterIndex + 1}张「${posterType.name}」详情页的文案和提示词。`
            }
          ]
        }],
        generationConfig: {
          temperature: 0.7,
          topP: 0.9
        }
      })
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

    // 处理流式响应 - 读取完整响应文本
    const responseText = await response.text();
    console.log('API 返回原始数据长度:', responseText.length);

    // 流式响应是多个JSON对象，用换行分隔，解析每个块
    let fullText = '';
    const lines = responseText.split('\n').filter(line => line.trim());

    for (const line of lines) {
      try {
        const chunk = JSON.parse(line);
        const parts = chunk.candidates?.[0]?.content?.parts || [];
        for (const part of parts) {
          if (part.text && !part.thought) {
            fullText += part.text;
          }
        }
      } catch {
        // 忽略无法解析的行
      }
    }

    console.log('提取文本长度:', fullText.length);
    console.log('提取文本预览:', fullText.substring(0, 200));

    if (!fullText) {
      console.error('未获取到文本内容, 原始响应:', responseText.substring(0, 500));
      return NextResponse.json(
        { error: '未获取到生成内容', raw: responseText.substring(0, 500) },
        { status: 500 }
      );
    }

    // 解析 JSON 响应
    const jsonMatch = fullText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('无法解析 JSON, 原始文本:', fullText.substring(0, 500));
      return NextResponse.json(
        { error: '响应格式错误', raw: fullText.substring(0, 500) },
        { status: 500 }
      );
    }

    const parsed = JSON.parse(jsonMatch[0]);
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
