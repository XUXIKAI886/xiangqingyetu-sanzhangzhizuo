import type { GenerateImageThreadConfig } from './generate-image-thread-config'

interface BuildGenerateImageRequestPayloadParams {
  config: GenerateImageThreadConfig
  productImage: string
  copyPrompt: string
}

function toDataUrl(base64: string): string {
  if (base64.startsWith('data:')) {
    return base64
  }

  return `data:image/jpeg;base64,${base64}`
}

export function buildGenerateImageRequestPayload({
  config,
  productImage,
  copyPrompt,
}: BuildGenerateImageRequestPayloadParams) {
  if (config.apiStyle === 'openai-compatible') {
    const imageUrl = toDataUrl(productImage)

    return {
      model: config.modelName,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: copyPrompt,
            },
            {
              type: 'image_url',
              image_url: {
                url: imageUrl,
              },
            },
            {
              type: 'image_url',
              image_url: {
                url: imageUrl,
              },
            },
          ],
        },
      ],
      max_tokens: 4096,
      temperature: 0.7,
    }
  }

  return {
    contents: [
      {
        role: 'user',
        parts: [
          { text: copyPrompt },
          {
            inline_data: {
              mime_type: 'image/jpeg',
              data: productImage,
            },
          },
        ],
      },
    ],
    generationConfig: {
      responseModalities: ['TEXT', 'IMAGE'],
      imageConfig: {
        aspectRatio: '9:16',
        imageSize: '2K',
      },
      thinkingConfig: {
        thinkingBudget: 0,
      },
    },
  }
}
