import { useState, useRef, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { Sparkles, X, Send, ArrowRight } from 'lucide-react'

interface Message { role: 'user' | 'ai'; text: string }

const pageTips: Record<string, string[]> = {
  '/': [
    '当前在看板页面。新建项目可以从「创建项目」或资产库的模板开始。',
    '统计数据自动聚合所有项目的竞品、评论和任务。点击统计卡可快速跳转。',
    '项目卡片显示进度条，可以直观看到每个项目的分析完成度。',
  ],
  '/materials': [
    '资料库支持上传 CSV 数据包，系统会自动识别竞品商品和资料分类。',
    '竞品商品支持编辑和删除。悬浮卡片右下角会出现编辑和删除按钮。',
    '上传竞品评论数据后，任务卡的输入资料会自动关联。',
  ],
  '/tasks': [
    '任务卡按岗位角色分配。每张卡包含该岗位的 Prompt 模板和输出格式要求。',
    '点击「复制 Prompt」可以一键复制到剪贴板，在 AI 工具中直接使用。',
    '展开的「智能知识库」推荐高复用的 Work Kit 模板供参考。',
  ],
  '/workspace': [
    '工作台支持真实 DeepSeek API 调用和模拟模式。配置 API Key 后可以获取真实 AI 分析结果。',
    '生成分析结果后，务必点击「提交到报告」将结果同步到策略报告页。',
    '点击「标记异常」可以标注 AI 结果中需要人工复核的内容。',
  ],
  '/report': [
    '策略报告按岗位 Tab 展示所有已提交的分析结果。',
    '点击「沉淀为复用工作包」可以将当前项目的分析流程保存为模板。',
    '下一步执行清单支持勾选，勾选状态会保存在浏览器中。',
  ],
  '/archive': [
    '资产库是团队知识库。新项目启动前，可以在这里浏览成功案例学习经验。',
    '点击「复用此模板创建项目」可以基于已有模板快速启动新项目。',
    '支持按标签筛选和文本搜索，快速找到需要的 Work Kit。',
  ],
}

export default function AIAssistant() {
  const location = useLocation()
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages])

  const getPagePath = () => {
    const p = location.pathname
    if (p === '/') return '/'
    for (const key of Object.keys(pageTips)) {
      if (key !== '/' && p.startsWith(key)) return key
    }
    return null
  }

  const pagePath = getPagePath()
  const tips = pagePath ? pageTips[pagePath] || [] : []

  const handleOpen = () => {
    setOpen(true)
    if (messages.length === 0 && tips.length > 0) {
      setMessages([{ role: 'ai', text: tips[0] }])
    }
  }

  const handleSend = () => {
    const q = input.trim()
    if (!q) return
    setMessages((prev) => [...prev, { role: 'user', text: q }])
    setInput('')
    setStreaming(true)

    // Simulate streaming AI response
    const tip = tips[Math.floor(Math.random() * tips.length)] || '你可以问我关于 PromoKit AI 的任何问题。'
    const responses: Record<string, string> = {
      '怎么': '建议从看板选择一个项目开始，先进入资料库上传数据，然后到任务卡生成分析任务。',
      '如何': '可以从资产库选择一个 Work Kit 模板，系统会自动预填岗位和资料结构。',
      '什么': 'PromoKit AI 是电商大促 AI 工作包系统，帮助团队把竞品分析流程沉淀为可复用的 Work Kit。',
      '创建': '点击侧栏「新建项目」或按 ⌘K 打开命令面板，选择「创建新项目」。',
      '上传': '进入资料库页面，点击上传区或拖拽文件即可导入。系统会自动识别竞品商品。',
    }
    let response = tip
    for (const [k, v] of Object.entries(responses)) {
      if (q.includes(k)) { response = v; break }
    }

    let i = 0
    const chars = response.split('')
    const interval = setInterval(() => {
      i++
      setMessages((prev) => {
        const last = prev[prev.length - 1]
        if (last?.role === 'ai' && last.text.length < response.length) {
          return [...prev.slice(0, -1), { role: 'ai', text: response.slice(0, i) }]
        }
        if (i === 1) return [...prev, { role: 'ai', text: chars[0] }]
        return prev
      })
      if (i >= chars.length) {
        clearInterval(interval)
        setStreaming(false)
      }
    }, 25)
  }

  return (
    <>
      {/* Floating button */}
      {!open && (
        <button
          onClick={handleOpen}
          className="fixed bottom-6 right-6 z-50 w-11 h-11 rounded-2xl bg-accent-500 text-black flex items-center justify-center shadow-lg hover:scale-105 transition-transform ai-pulse"
        >
          <Sparkles className="w-5 h-5" />
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-32px)] bg-bg-surface border border-border-default rounded-2xl shadow-2xl flex flex-col overflow-hidden" style={{ height: '480px', maxHeight: 'calc(100vh - 100px)' }}>
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border-default shrink-0">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-accent-500/20 flex items-center justify-center">
                <Sparkles className="w-3.5 h-3.5 text-accent-500" />
              </div>
              <span className="text-[13px] font-medium text-text-main">AI 助手</span>
              {streaming && <span className="w-1.5 h-1.5 rounded-full bg-ai-400 ai-pulse" />}
            </div>
            <button onClick={() => setOpen(false)} className="p-1 rounded-lg hover:bg-white/5 transition-colors">
              <X className="w-4 h-4 text-text-muted" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-auto px-4 py-3 space-y-3">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[12px] leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-accent-500 text-black'
                    : 'bg-white/5 text-text-secondary'
                }`}>
                  {msg.text}
                  {streaming && i === messages.length - 1 && msg.role === 'ai' && (
                    <span className="inline-block w-1.5 h-4 bg-text-muted ml-0.5 animate-pulse align-text-bottom" />
                  )}
                </div>
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Suggestions */}
          {messages.length <= 1 && tips.length > 1 && (
            <div className="px-4 pb-2 space-y-1.5 shrink-0">
              {tips.slice(1, 4).map((tip, i) => (
                <button
                  key={i}
                  onClick={() => { setInput(tip.slice(0, 15) + '...'); handleSend() }}
                  className="w-full text-left text-[11px] text-text-muted hover:text-text-secondary transition-colors flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/3"
                >
                  <ArrowRight className="w-3 h-3 text-accent-500 shrink-0" />
                  <span className="truncate">{tip.slice(0, 50)}...</span>
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="px-4 py-3 border-t border-border-default shrink-0 flex items-center gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSend() }}
              placeholder="问 AI 任何关于 PromoKit 的问题..."
              className="flex-1 bg-white/5 border border-border-default rounded-xl px-3 py-2 text-[12px] text-text-main placeholder:text-text-placeholder outline-none focus:border-accent-500/30"
            />
            <button onClick={handleSend} disabled={!input.trim() || streaming} className="w-8 h-8 rounded-xl bg-accent-500 text-black flex items-center justify-center disabled:opacity-30 transition-opacity shrink-0">
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </>
  )
}
