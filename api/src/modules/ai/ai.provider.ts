import { env } from '@/core/config/env'

export interface AiMessage {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export interface AiProviderResult {
  provider: 'local' | 'openai-compatible'
  content: string | null
  warning?: string
}

const extractContent = (payload: unknown): string | null => {
  if (!payload || typeof payload !== 'object') return null
  const data = payload as Record<string, unknown>

  const choices = data.choices
  if (Array.isArray(choices) && choices.length > 0) {
    const first = choices[0] as Record<string, unknown>
    const message = first.message as Record<string, unknown> | undefined
    if (typeof message?.content === 'string') return message.content
    if (typeof first.text === 'string') return first.text
  }

  if (typeof data.output_text === 'string') return data.output_text
  return null
}

export const aiProvider = {
  async complete(messages: AiMessage[]): Promise<AiProviderResult> {
    if (env.AI_PROVIDER === 'local' || !env.AI_API_KEY || !env.AI_MODEL) {
      return { provider: 'local', content: null }
    }

    const controller = new AbortController()
    const timeout = setTimeout(() => controller.abort(), env.AI_TIMEOUT_MS)

    try {
      const response = await fetch(env.AI_BASE_URL, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${env.AI_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: env.AI_MODEL,
          messages,
          temperature: 0.2,
        }),
        signal: controller.signal,
      })

      if (!response.ok) {
        return {
          provider: 'openai-compatible',
          content: null,
          warning: `Provider AI mengembalikan status ${response.status}`,
        }
      }

      const payload = (await response.json()) as unknown
      return {
        provider: 'openai-compatible',
        content: extractContent(payload),
      }
    } catch (error) {
      const warning = error instanceof Error ? error.message : 'Provider AI tidak dapat dihubungi'
      return { provider: 'openai-compatible', content: null, warning }
    } finally {
      clearTimeout(timeout)
    }
  },
}
