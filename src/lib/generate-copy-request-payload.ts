import type { GenerateCopyThreadConfig } from './generate-copy-thread-config'

interface BuildGenerateCopyRequestPayloadParams {
  config: GenerateCopyThreadConfig
  productImage: string
  systemPrompt: string
  userPrompt: string
}

function toDataUrl(base64: string): string {
  if (base64.startsWith('data:')) {
    return base64
  }

  return `data:image/jpeg;base64,${base64}`
}

export function buildGenerateCopyRequestPayload({
  config,
  productImage,
  systemPrompt,
  userPrompt,
}: BuildGenerateCopyRequestPayloadParams) {
  if (config.apiStyle === 'openai-compatible') {
    return {
      model: config.modelName,
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: userPrompt,
            },
            {
              type: 'image_url',
              image_url: {
                url: toDataUrl(productImage),
              },
            },
          ],
        },
      ],
      max_tokens: 4096,
      temperature: 0.7,
      response_format: {
        type: 'json_object',
      },
    }
  }

  return {
    systemInstruction: {
      parts: [{ text: systemPrompt }],
    },
    contents: [
      {
        role: 'user',
        parts: [
          {
            inline_data: {
              mime_type: 'image/jpeg',
              data: productImage,
            },
          },
          {
            text: userPrompt,
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.7,
      topP: 0.9,
    },
  }
}
