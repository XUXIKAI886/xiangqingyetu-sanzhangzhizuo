import { NextRequest, NextResponse } from 'next/server';
import { fetchWithRetry } from '@/lib/retry';

const API_URL = 'https://yunwu.ai/v1beta/models/gemini-3.1-flash-image-preview:generateContent';

export async function POST(request: NextRequest) {
  try {
    const API_KEY = process.env.YUNWU_API_KEY_IMAGE;
    if (!API_KEY) {
      console.error('YUNWU_API_KEY_IMAGE 环境变量未配置');
      return NextResponse.json({ error: 'API Key 未配置' }, { status: 500 });
    }

    const { productImage, copyPrompt } = await request.json();
    console.log('图片生成请求, prompt长度:', copyPrompt?.length, '图片长度:', productImage?.length);

    if (!productImage || !copyPrompt) {
      return NextResponse.json(
        { error: '缺少产品图片或文案提示词' },
        { status: 400 }
      );
    }

    console.log('开始调用图片生成 API...');

    // 构建完整的图片生成指令
    const imageGenerationPrompt = `你是一个专业的电商海报设计师。请根据以下提示词和参考产品图片，生成一张9:16竖版的美团外卖详情页海报。

【重要要求】
1. 必须严格按照提示词中的设计要求生成图片
2. 必须参考上传的产品图片，在海报中展示该产品
3. 保持产品的真实外观，不要改变产品的颜色、形状、包装设计
4. 按照提示词中的排版布局要求放置文字和元素
5. 生成高质量、专业的电商海报图片

【设计提示词】
${copyPrompt}

请直接生成图片，不需要文字回复。`;

    const response = await fetchWithRetry(`${API_URL}?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          role: 'user',
          parts: [
            { text: imageGenerationPrompt },
            {
              inline_data: {
                mime_type: 'image/jpeg',
                data: productImage
              }
            }
          ]
        }],
        generationConfig: {
          responseModalities: ['TEXT', 'IMAGE'],
          imageConfig: {
            aspectRatio: '9:16',
            imageSize: '2K'
          },
          thinkingConfig: {
            thinkingBudget: 0
          }
        }
      })
    });

    console.log('图片 API 响应状态:', response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Image API Error:', errorText);
      return NextResponse.json({ error: '图片生成失败', detail: errorText }, { status: 500 });
    }

    const data = await response.json();

    // 详细日志输出
    console.log('=== 图片API完整响应 ===');
    console.log('candidates数量:', data.candidates?.length);

    const candidate = data.candidates?.[0];
    if (candidate) {
      console.log('candidate.content.role:', candidate.content?.role);
      console.log('parts数量:', candidate.content?.parts?.length);

      // 遍历所有parts，查看每个part的结构
      candidate.content?.parts?.forEach((part: Record<string, unknown>, index: number) => {
        console.log(`--- Part ${index} ---`);
        console.log('Part keys:', Object.keys(part));
        if (part.text) {
          console.log('text长度:', (part.text as string).length);
          console.log('text预览:', (part.text as string).substring(0, 200));
        }
        if (part.inline_data) {
          const inlineData = part.inline_data as { mime_type: string; data: string };
          console.log('inline_data.mime_type:', inlineData.mime_type);
          console.log('inline_data.data长度:', inlineData.data?.length);
        }
        if (part.thoughtSignature) {
          console.log('thoughtSignature长度:', (part.thoughtSignature as string).length);
        }
      });
    }

    // 打印完整JSON（限制长度避免过长）
    const fullJson = JSON.stringify(data, null, 2);
    console.log('完整响应长度:', fullJson.length);
    if (fullJson.length > 5000) {
      console.log('响应前5000字符:', fullJson.substring(0, 5000));
    } else {
      console.log('完整响应:', fullJson);
    }
    console.log('=== 响应日志结束 ===');

    const imagePart = data.candidates?.[0]?.content?.parts?.find(
      (p: { inlineData?: { data: string; mimeType: string }; inline_data?: { data: string; mime_type: string } }) =>
        p.inlineData || p.inline_data
    );

    // 兼容两种命名格式
    const imageData = imagePart?.inlineData || imagePart?.inline_data;

    if (!imageData) {
      console.error('未找到图片数据');
      return NextResponse.json({ error: '未获取到图片', detail: data }, { status: 500 });
    }

    console.log('成功获取图片, mime_type:', imageData.mimeType || imageData.mime_type);

    return NextResponse.json({
      imageBase64: imageData.data,
      mimeType: imageData.mimeType || imageData.mime_type || 'image/png'
    });

  } catch (error) {
    console.error('Generate image error:', error);
    return NextResponse.json({ error: '服务器错误' }, { status: 500 });
  }
}
