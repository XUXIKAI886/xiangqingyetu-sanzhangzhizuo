export interface PosterCopy {
  title: string
  content: string
  prompt: string
}

export interface PosterImage {
  base64: string
  mimeType: string
}

export interface PosterState {
  isLoading: boolean
  step: string
  copy: PosterCopy | null
  image: PosterImage | null
  error: string | null
}

export const POSTER_TYPES = [
  { name: '主KV视觉', english: 'Hero Shot', description: '产品主图展示，突出品牌和核心卖点' },
  { name: '生活场景', english: 'Lifestyle', description: '产品使用场景，展示实际使用效果' },
  { name: '工艺展示', english: 'Process/Concept', description: '制作工艺、食材来源、品质保证' },
] as const

export const createInitialPosterState = (): PosterState => ({
  isLoading: false,
  step: '',
  copy: null,
  image: null,
  error: null,
})
