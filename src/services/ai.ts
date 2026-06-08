import type { AISection } from '../types'

const STORAGE_KEY = 'promokit_ai_key'
const DEFAULT_KEY = import.meta.env.VITE_DEEPSEEK_KEY || ''
const API_BASE = 'https://api.deepseek.com/v1/chat/completions'
const MODEL = 'deepseek-chat'
export const isRealAIEnabled = import.meta.env.VITE_ENABLE_REAL_AI === 'true'

export function getApiKey(): string {
  return localStorage.getItem(STORAGE_KEY) || DEFAULT_KEY
}

export function saveApiKey(key: string) {
  localStorage.setItem(STORAGE_KEY, key)
}

export function clearApiKey() {
  localStorage.removeItem(STORAGE_KEY)
}

export function hasApiKey(): boolean {
  return isRealAIEnabled && getApiKey().trim().length > 0
}

const systemPrompt = `你是一个电商大促 AI 分析助手。你必须用 JSON 数组格式输出结构化分析结果。

每个元素是一个分析区块，包含:
- title: 区块标题
- type: "matrix" | "list" | "qa" | "bullet" | "quotes" | "text"
- 对应数据字段

类型说明:
1. matrix: {"type":"matrix","headers":["列1","列2"],"rows":[["数据","数据"]]}
2. list: {"type":"list","items":["项1","项2"]}
3. qa: {"type":"qa","qa":[{"q":"问","a":"答"}]}
4. bullet: {"type":"bullet","items":["要点1","要点2"]}
5. quotes: {"type":"quotes","quotes":[{"text":"原话","source":"来源"}]}
6. text: {"type":"text","body":"内容"}

只输出 JSON 数组，不要任何其他文字。`

export async function generateAnalysis(
  prompt: string,
  materials: string[],
  role: string,
): Promise<AISection[]> {
  const apiKey = getApiKey()

  const materialContext = materials.length > 0
    ? `\n参考资料：\n${materials.map((m, i) => `${i + 1}. ${m}`).join('\n')}`
    : ''

  const response = await fetch(API_BASE, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: MODEL,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `岗位：${role}\n任务：${prompt}${materialContext}` },
      ],
      max_tokens: 4096,
      temperature: 0.7,
    }),
  })

  if (!response.ok) {
    const err = await response.text()
    throw new Error(`API 调用失败：${err.slice(0, 80)}`)
  }

  const data = await response.json()
  const text = data.choices[0].message.content

  // Extract JSON array
  const jsonMatch = text.match(/\[[\s\S]*\]/)
  if (!jsonMatch) throw new Error('AI 返回格式异常，请重试')

  return JSON.parse(jsonMatch[0]) as AISection[]
}
