# 美团外卖详情页生成器 - 前端UI开发PRD文档

## 一、项目概述

### 1.1 产品名称
美团外卖详情页生成器

### 1.2 产品定位
一款基于AI的外卖商品详情页海报自动生成工具，用户上传产品图片后，系统自动生成3张不同风格的详情页海报。

### 1.3 目标用户
- 美团外卖商家
- 外卖代运营人员
- 电商设计师

### 1.4 核心功能
1. 产品图片上传（支持压缩）
2. 店铺名称输入
3. AI自动生成3种风格海报（主KV视觉、生活场景、工艺展示）
4. 支持单张生成和一键全部生成
5. 海报下载功能

---

## 二、技术栈

### 2.1 前端框架
| 技术 | 版本 | 用途 |
|------|------|------|
| Next.js | ^16.1.4 | React全栈框架 |
| React | ^19.2.3 | UI组件库 |
| TypeScript | ^5.9.3 | 类型安全 |

### 2.2 样式方案
| 技术 | 版本 | 用途 |
|------|------|------|
| Tailwind CSS | ^4.1.18 | 原子化CSS框架 |
| PostCSS | ^8.5.6 | CSS处理器 |

### 2.3 UI组件/图标
| 技术 | 版本 | 用途 |
|------|------|------|
| Lucide React | ^0.563.0 | 图标库 |
| clsx | ^2.1.1 | 条件类名工具 |

### 2.4 工具库
| 技术 | 版本 | 用途 |
|------|------|------|
| file-saver | ^2.0.5 | 文件下载 |
| jszip | ^3.10.1 | 压缩打包 |

---

## 三、设计规范

### 3.1 品牌色彩
```css
:root {
  /* 主色 - 美团橙 */
  --primary: #ff6b00;
  --primary-dark: #e55d00;
  --primary-light: #fff4eb;

  /* 辅助色 */
  --secondary: #ffc107;        /* 黄色强调 */
  --success: #10b981;          /* 绿色-成功 */
  --error: #ef4444;            /* 红色-错误 */

  /* 背景色 */
  --bg-gradient-start: #fff8f3;
  --bg-gradient-end: #ffffff;

  /* 文字色 */
  --text-primary: #1f2937;     /* gray-800 */
  --text-secondary: #6b7280;   /* gray-500 */
  --text-muted: #9ca3af;       /* gray-400 */
}
```

### 3.2 渐变色方案
| 用途 | 渐变值 |
|------|--------|
| 主按钮 | `from-orange-500 to-orange-400` |
| 全部生成按钮 | `from-green-500 to-emerald-400` |
| 页面顶部装饰条 | `from-orange-400 via-orange-500 to-yellow-400` |
| 标题文字 | `from-orange-600 to-orange-400` |
| 页面背景 | `135deg, #fff8f3 0%, #ffffff 100%` |

### 3.3 字体规范
```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
```

| 元素 | 字号 | 字重 | 颜色 |
|------|------|------|------|
| 页面标题 | 4xl (36px) | bold | 渐变橙色 |
| 副标题 | base (16px) | normal | gray-500 |
| 卡片标题 | base (16px) | bold | gray-800 |
| 表单标签 | sm (14px) | medium | gray-700 |
| 正文内容 | xs (12px) | normal | gray-600 |
| 按钮文字 | base (16px) | medium | white |

### 3.4 圆角规范
| 元素 | 圆角值 |
|------|--------|
| 卡片容器 | 2xl (16px) |
| 按钮 | xl (12px) |
| 输入框 | xl (12px) |
| 图片预览 | lg (8px) |
| 小按钮/标签 | 默认 (4px) |

### 3.5 阴影与特效
```css
/* 玻璃拟态卡片 */
.glass-card {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 107, 0, 0.1);
}

/* 按钮悬停效果 */
.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(255, 107, 0, 0.35);
}
```

---

## 四、页面布局结构

### 4.1 整体布局
```
┌─────────────────────────────────────────────────────────┐
│ [顶部装饰条 - 1px高度渐变条]                              │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │              页面标题 + 副标题                    │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │              输入区域卡片                         │   │
│  │  ┌──────────────┐  ┌──────────────┐             │   │
│  │  │  店铺名称     │  │  产品图片上传  │             │   │
│  │  └──────────────┘  └──────────────┘             │   │
│  │  ┌─────────────────────────────────────────┐   │   │
│  │  │         一键生成全部海报按钮              │   │   │
│  │  └─────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐          │
│  │ 海报卡片1  │  │ 海报卡片2  │  │ 海报卡片3  │          │
│  │ 主KV视觉  │  │ 生活场景   │  │ 工艺展示   │          │
│  └───────────┘  └───────────┘  └───────────┘          │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │              生成图片展示区域                     │   │
│  │  [图片1] [图片2] [图片3]                         │   │
│  │  [下载]  [下载]  [下载]                          │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

### 4.2 响应式断点
| 断点 | 宽度 | 布局变化 |
|------|------|----------|
| 默认 | < 768px | 单列布局，卡片垂直排列 |
| md | >= 768px | 输入区域双列，海报卡片三列 |

### 4.3 容器宽度
- 最大宽度：`max-w-6xl` (1152px)
- 内边距：`px-4` (16px)
- 垂直间距：`py-12` (48px)

---

## 五、组件详情

### 5.1 顶部装饰条
```
位置：fixed top-0 left-0
尺寸：w-full h-1
样式：bg-gradient-to-r from-orange-400 via-orange-500 to-yellow-400
```

### 5.2 页面标题区
```
容器：text-center mb-10
主标题：
  - 字号：text-4xl
  - 字重：font-bold
  - 颜色：bg-gradient-to-r from-orange-600 to-orange-400 bg-clip-text text-transparent
副标题：
  - 间距：mt-3
  - 颜色：text-gray-500
```

### 5.3 输入区域卡片
```
容器样式：
  - 背景：glass-card (玻璃拟态)
  - 圆角：rounded-2xl
  - 内边距：p-6
  - 下边距：mb-8

内部布局：
  - flex flex-col md:flex-row gap-6
```

#### 5.3.1 店铺名称输入框
```
标签：
  - 样式：block text-sm font-medium text-gray-700 mb-2
  - 文字："店铺名称"

输入框：
  - 样式：w-full px-4 py-3 border-2 border-gray-200 rounded-xl
  - 聚焦：focus:border-orange-400 outline-none
  - 占位符："请输入店铺名称"
```

#### 5.3.2 图片上传区域
**未上传状态：**
```
容器：
  - 样式：flex items-center gap-2 px-4 py-3
  - 边框：border-2 border-dashed border-gray-300 rounded-xl
  - 交互：cursor-pointer hover:border-orange-400

图标：Upload (lucide-react)
  - 尺寸：size={20}
  - 颜色：text-gray-400

文字："点击上传"
  - 颜色：text-gray-500
```

**已上传状态：**
```
容器：relative inline-block

图片预览：
  - 高度：h-20
  - 圆角：rounded-lg

删除按钮：
  - 位置：absolute -top-2 -right-2
  - 样式：bg-red-500 text-white rounded-full p-1
  - 图标：X (size={14})
```

#### 5.3.3 一键生成全部按钮
```
样式：
  - 宽度：w-full
  - 间距：mt-4 py-3
  - 背景：bg-gradient-to-r from-green-500 to-emerald-400
  - 文字：text-white font-medium
  - 圆角：rounded-xl
  - 过渡：hover:shadow-lg transition-all

禁用状态：
  - 条件：未上传图片 || 店铺名为空 || 正在生成中
  - 样式：disabled:bg-gray-300 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed

加载状态：
  - 图标：Loader2 (animate-spin)
  - 文字："正在生成中..."
```

### 5.4 海报卡片组件
```
容器布局：grid grid-cols-1 md:grid-cols-3 gap-6

单个卡片：
  - 背景：glass-card
  - 圆角：rounded-2xl
  - 内边距：p-5
```

#### 5.4.1 卡片标题
```
容器：flex items-center justify-between mb-4
标题：font-bold text-gray-800
格式："详情页 {index+1} - {海报类型名称}"

海报类型：
  - 索引0：主KV视觉
  - 索引1：生活场景
  - 索引2：工艺展示
```

#### 5.4.2 生成按钮
```
样式：
  - 宽度：w-full
  - 间距：py-3 mb-4
  - 背景：bg-gradient-to-r from-orange-500 to-orange-400
  - 文字：text-white font-medium
  - 圆角：rounded-xl
  - 过渡：hover:shadow-lg transition-all

状态文字：
  - 默认："生成详情页 {index+1}"
  - 已生成："重新生成"
  - 加载中：显示当前步骤（"正在生成文案..." / "正在生成图片..."）
```

#### 5.4.3 错误提示
```
条件：poster.error 存在时显示
样式：mb-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg
```

#### 5.4.4 文案展示区
```
条件：poster.copy 存在时显示
容器：p-3 bg-orange-50 rounded-lg max-h-64 overflow-y-auto

标题：
  - 样式：font-medium text-orange-600 text-sm mb-2

内容：
  - 样式：text-gray-600 text-xs whitespace-pre-wrap
```

### 5.5 图片展示区域
```
条件：任意海报有图片时显示
容器：mt-8

标题：
  - 样式：text-xl font-bold text-gray-800 mb-4 text-center
  - 文字："生成的图片"

图片容器：
  - 样式：flex justify-center gap-1 bg-white p-2 rounded-lg

单张图片：
  - 容器：flex flex-col items-center
  - 图片：h-96 object-contain
  - 下载按钮：
    - 样式：mt-2 px-3 py-1 text-sm text-orange-500 border border-orange-300 rounded
    - 悬停：hover:bg-orange-50
    - 图标：Download (size={14})
```

---

## 六、交互流程

### 6.1 主流程图
```
┌─────────────┐
│   进入页面   │
└──────┬──────┘
       ▼
┌─────────────┐
│ 输入店铺名称 │
└──────┬──────┘
       ▼
┌─────────────┐
│ 上传产品图片 │ ──→ 图片自动压缩(800px, 70%质量)
└──────┬──────┘
       ▼
┌─────────────────────────────────────┐
│         选择生成方式                 │
├─────────────┬───────────────────────┤
│ 一键生成全部 │    单独生成某一张      │
└──────┬──────┴───────────┬───────────┘
       ▼                  ▼
┌─────────────┐    ┌─────────────┐
│ 并行生成3张  │    │ 生成指定海报 │
└──────┬──────┘    └──────┬──────┘
       ▼                  ▼
┌─────────────────────────────────────┐
│           生成过程                   │
│  步骤1: 调用文案API → 显示文案       │
│  步骤2: 调用图片API → 显示图片       │
└──────────────────┬──────────────────┘
                   ▼
┌─────────────────────────────────────┐
│         结果展示                     │
│  - 文案区域显示生成的文案            │
│  - 底部展示生成的图片                │
│  - 提供单张下载按钮                  │
└─────────────────────────────────────┘
```

### 6.2 状态流转

#### 6.2.1 按钮状态
| 状态 | 条件 | 表现 |
|------|------|------|
| 禁用 | 未上传图片 或 店铺名为空 | 灰色背景，不可点击 |
| 可用 | 已上传图片 且 店铺名不为空 | 橙色渐变，可点击 |
| 加载中 | isLoading = true | 显示旋转图标+步骤文字 |
| 已完成 | image 存在 | 按钮文字变为"重新生成" |

#### 6.2.2 生成步骤状态
| 步骤 | step值 | 说明 |
|------|--------|------|
| 开始 | "正在生成文案..." | 调用文案API |
| 中间 | "正在生成图片..." | 文案完成，调用图片API |
| 完成 | "生成完成！" | 图片生成成功 |
| 失败 | - | 显示error错误信息 |

### 6.3 用户操作响应

#### 6.3.1 图片上传
```
触发：点击上传区域 或 拖拽图片
处理：
  1. 读取文件
  2. 压缩图片（最大800px，质量70%）
  3. 转换为Base64
  4. 显示预览图
```

#### 6.3.2 清除图片
```
触发：点击预览图右上角X按钮
处理：
  1. 清除imagePreview
  2. 清除imageBase64
```

#### 6.3.3 单张生成
```
触发：点击某张海报卡片的生成按钮
处理：
  1. 设置该卡片 isLoading=true, step="正在生成文案..."
  2. 调用 /api/generate-copy
  3. 成功后更新 copy, step="正在生成图片..."
  4. 调用 /api/generate-image
  5. 成功后更新 image, isLoading=false
  6. 失败则设置 error, isLoading=false
```

#### 6.3.4 一键生成全部
```
触发：点击"一键生成全部海报"按钮
处理：
  1. 使用 Promise.allSettled 并行启动3个生成任务
  2. 每个任务独立更新自己的状态
  3. 各任务互不影响，失败不阻断其他任务
```

#### 6.3.5 下载图片
```
触发：点击图片下方的下载按钮
处理：
  1. 将Base64转换为Blob
  2. 使用file-saver下载
  3. 文件名格式：{店铺名}_详情页{序号}.png
```

---

## 七、状态管理

### 7.1 状态结构
```typescript
// 基础状态
const [shopName, setShopName] = useState<string>('');
const [imagePreview, setImagePreview] = useState<string | null>(null);
const [imageBase64, setImageBase64] = useState<string | null>(null);

// 海报状态数组（3张）
const [posters, setPosters] = useState<PosterState[]>([...]);

// 单张海报状态接口
interface PosterState {
  isLoading: boolean;      // 是否正在生成
  step: string;            // 当前步骤描述
  copy: {                  // 生成的文案
    title: string;
    content: string;
    prompt: string;
  } | null;
  image: {                 // 生成的图片
    base64: string;
    mimeType: string;
  } | null;
  error: string | null;    // 错误信息
}
```

### 7.2 派生状态
```typescript
// 是否有任何海报正在生成
const isAnyLoading = posters.some(p => p.isLoading);

// 是否有任何海报已生成图片
const hasAnyImage = posters.some(p => p.image);
```

---

## 八、API接口

### 8.1 文案生成接口
```
POST /api/generate-copy

请求体：
{
  productImage: string,   // Base64图片数据
  shopName: string,       // 店铺名称
  posterIndex: number     // 海报索引 (0/1/2)
}

响应体：
{
  title: string,          // 海报标题
  content: string,        // 文案内容
  prompt: string          // 图片生成提示词
}
```

### 8.2 图片生成接口
```
POST /api/generate-image

请求体：
{
  productImage: string,   // Base64图片数据
  copyPrompt: string      // 图片生成提示词
}

响应体：
{
  imageBase64: string,    // 生成的图片Base64
  mimeType: string        // 图片MIME类型
}
```

---

## 九、设计建议

### 9.1 视觉风格
- **整体风格**：现代简约、玻璃拟态(Glassmorphism)
- **配色方案**：以美团橙(#ff6b00)为主色，搭配暖色渐变背景
- **卡片设计**：半透明白色背景 + 模糊效果 + 微妙边框

### 9.2 动效建议
| 元素 | 动效 |
|------|------|
| 按钮悬停 | 上移2px + 阴影扩散 |
| 加载图标 | 旋转动画 (animate-spin) |
| 状态切换 | 渐变过渡 (transition-all) |
| 图片出现 | 淡入效果 |

### 9.3 用户体验优化建议
1. **进度反馈**：生成过程中显示明确的步骤状态
2. **错误处理**：友好的错误提示，支持重试
3. **并行生成**：一键生成时3张海报同时开始，互不阻塞
4. **即时预览**：上传图片后立即显示预览
5. **便捷下载**：每张图片独立下载按钮

---

## 十、附录

### 10.1 图标使用 (Lucide React)
| 图标名 | 用途 |
|--------|------|
| Upload | 上传区域图标 |
| X | 删除/关闭按钮 |
| Download | 下载按钮 |
| Loader2 | 加载状态旋转图标 |

### 10.2 海报类型定义
| 索引 | 名称 | 英文 | 说明 |
|------|------|------|------|
| 0 | 主KV视觉 | Hero Shot | 产品主图展示，突出品牌和核心卖点 |
| 1 | 生活场景 | Lifestyle | 产品使用场景，展示实际使用效果 |
| 2 | 工艺展示 | Process/Concept | 制作工艺、食材来源、品质保证 |

### 10.3 图片规格
- 上传图片：自动压缩至最大800px，质量70%
- 生成图片：9:16竖版比例，1K分辨率
