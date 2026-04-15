export interface CopyPosterType {
  name: string
  desc: string
}

export const COPY_POSTER_TYPES: CopyPosterType[] = [
  { name: '主KV视觉', desc: 'Hero Shot - 产品主图展示，突出品牌和核心卖点' },
  { name: '生活场景', desc: 'Lifestyle - 产品使用场景，展示实际使用效果' },
  { name: '工艺展示', desc: 'Process/Concept - 制作工艺、食材来源、品质保证' },
]

interface BuildGenerateCopySystemPromptParams {
  posterIndex: number
  apiStyle: 'gemini-native' | 'openai-compatible'
  promptTemplate?: string
}

export function resolveCopyPosterType(posterIndex: number): CopyPosterType {
  return COPY_POSTER_TYPES[posterIndex] || COPY_POSTER_TYPES[0]
}

function buildOpenAICompatiblePrompt(posterIndex: number): string {
  const posterType = resolveCopyPosterType(posterIndex)

  return `你是电商详情页文案生成器。

任务要求：
1. 基于上传的产品图片和店铺名称，只生成第${posterIndex + 1}张海报「${posterType.name}」。
2. 海报类型说明：${posterType.desc}
3. 你的目标是直接产出可用于前端展示和下一步生图的结构化结果。

输出要求：
1. 必须返回一个合法 JSON 对象。
2. 不要输出 Markdown，不要输出解释，不要输出代码块，不要输出识别报告。
3. JSON 结构必须严格等于：
{
  "title": "海报标题，8-20字",
  "content": "详情页文案，120-300字，适合直接展示在前端",
  "prompt": "图片生成提示词，适合用于生成第${posterIndex + 1}张海报，需包含画面主体、构图、风格、光线、卖点、排版、中文与英文提示，长度不少于300字"
}
4. 如果无法完全识别图片细节，也必须根据可见内容推断并返回完整 JSON。
5. title、content、prompt 三个字段都必须有值，禁止返回 null、空字符串或额外字段。`
}

export function buildGenerateCopySystemPrompt({
  posterIndex,
  apiStyle,
  promptTemplate = '',
}: BuildGenerateCopySystemPromptParams): string {
  if (apiStyle === 'openai-compatible') {
    return buildOpenAICompatiblePrompt(posterIndex)
  }

  const posterType = resolveCopyPosterType(posterIndex)
  return `${promptTemplate}

---
【重要】本次任务只需要生成第${posterIndex + 1}张海报「${posterType.name}」的内容。
海报类型说明：${posterType.desc}

输出格式必须为JSON：
{
  "title": "海报标题",
  "content": "详细的文案内容（至少200字）",
  "prompt": "完整的图片生成提示词（中英文，至少500字）"
}

只输出JSON，不要输出其他内容。`
}
