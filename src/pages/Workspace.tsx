import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Sparkles, CheckCircle2, RotateCcw, Flag, ThumbsUp, X, ShoppingBag } from 'lucide-react'
import { roleLabels } from '../data/mock'
import { getProjectBySlug, getTasks, getAIResult, getMaterials, saveAIResult, updateTask } from '../services/db'
import { useToast } from '../components/Toast'
import { hasApiKey, generateAnalysis, saveApiKey, clearApiKey, isRealAIEnabled } from '../services/ai'
import type { AIResult, AISection, TaskCard } from '../types'

function buildMockSections(task: TaskCard, materialCount: number): AISection[] {
  const roleLabel = roleLabels[task.role]
  return [
    {
      title: `${roleLabel}分析摘要`,
      type: 'bullet',
      items: [
        `已读取 ${materialCount} 份关联资料，围绕「${task.title}」完成结构化归纳。`,
        `核心判断：优先处理高频用户痛点，再转化为可执行的岗位动作。`,
        `建议下一步由${roleLabel}负责人复核关键结论，并提交到策略报告沉淀。`,
      ],
    },
    {
      title: '关键发现矩阵',
      type: 'matrix',
      headers: ['维度', '结论', '动作建议'],
      rows: [
        ['用户问题', '评论与资料中存在可聚类的高频诉求', '按频次和转化影响排序'],
        ['岗位产出', `${roleLabel}岗需要形成可复用输出`, `整理为${task.outputFormat || '结构化清单'}`],
        ['复用价值', '本次分析可沉淀为后续大促模板', '保存到 Work Kit 资产库'],
      ],
    },
    {
      title: '执行清单',
      type: 'list',
      items: task.judgmentCriteria.length > 0
        ? task.judgmentCriteria.map((item) => `复核：${item}`)
        : ['补充资料样本', '确认分析口径', '提交到策略报告'],
    },
  ]
}

function buildAIResult(task: TaskCard, sections: AISection[]): AIResult {
  return {
    id: 'r' + Date.now(),
    taskId: task.id,
    title: task.title,
    sections,
    generatedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
    submitted: false,
  }
}

export default function Workspace() {
  const { projectSlug, taskId } = useParams<{ projectSlug: string; taskId: string }>()
  const project = getProjectBySlug(projectSlug!)
  const task = project ? getTasks(project.id).find((t) => t.id === taskId) : undefined
  const result = getAIResult(taskId ?? '')
  const materials = project ? getMaterials(project.id) : []
  const { showToast } = useToast()

  const [submitted, setSubmitted] = useState(result?.submitted ?? false)
  const [currentResult, setCurrentResult] = useState<AIResult | undefined>(result)
  const [generating, setGenerating] = useState(false)
  const [showResult, setShowResult] = useState(!!result?.generatedAt)
  const [feedbackItems, setFeedbackItems] = useState<string[]>([])
  const [showFeedbackModal, setShowFeedbackModal] = useState(false)
  const [feedbackText, setFeedbackText] = useState('')
  const [aiSections, setAiSections] = useState<AISection[] | null>(null)
  const [realAI, setRealAI] = useState(hasApiKey())
  const [showKeyInput, setShowKeyInput] = useState(false)
  const [apiKeyInput, setApiKeyInput] = useState('')

  if (!project || !task) return <div className="text-text-muted text-sm p-8">任务不存在</div>

  const inputMats = materials.filter((m) => task.inputMaterials.includes(m.id))
  const reviewMats = inputMats.filter((m) => m.type === 'review')

  const handleGenerate = async () => {
    setGenerating(true)
    if (hasApiKey()) {
      try {
        const matContents = inputMats.map((m) => m.content)
        const sections = await generateAnalysis(task.promptPreview, matContents, roleLabels[task.role])
        setAiSections(sections)
        const generated = buildAIResult(task, sections)
        setCurrentResult(generated)
        saveAIResult(generated)
        updateTask({ ...task, status: 'generated' })
        setGenerating(false)
        setShowResult(true)
        showToast('AI 分析完成（真实调用）', 'success')
      } catch (e: any) {
        setGenerating(false)
        if (e.message === 'NO_API_KEY') {
          setRealAI(false)
          showToast('未配置 API Key，使用模拟数据', 'info')
        } else {
          showToast(`分析失败：${e.message.slice(0, 50)}`, 'error')
        }
      }
    } else {
      // Fallback: mock delay
      setTimeout(() => {
        const sections = buildMockSections(task, inputMats.length)
        const generated = buildAIResult(task, sections)
        setAiSections(sections)
        setCurrentResult(generated)
        saveAIResult(generated)
        updateTask({ ...task, status: 'generated' })
        setGenerating(false)
        setShowResult(true)
        showToast('模拟 AI 分析完成', 'info')
      }, 3000)
    }
  }

  const handleSubmit = () => {
    if (!currentResult) {
      showToast('请先生成分析结果', 'error')
      return
    }
    const submittedResult = { ...currentResult, submitted: true }
    setSubmitted(true)
    setCurrentResult(submittedResult)
    saveAIResult(submittedResult)
    if (task) {
      updateTask({ ...task, status: 'submitted' })
    }
    showToast('已提交到策略报告', 'success')
  }

  const confirmFeedback = () => {
    const text = feedbackText.trim()
    if (text) {
      setFeedbackItems([...feedbackItems, text])
      showToast('异常已标记', 'success')
    }
    setFeedbackText('')
    setShowFeedbackModal(false)
  }

  return (
    <div className="max-w-4xl">
      <div className="flex items-start justify-between mb-12">
        <div>
          <Link to={`/tasks/${projectSlug}`} className="text-[11px] text-text-muted hover:text-text-secondary transition-colors flex items-center gap-1.5 mb-4">
            <ArrowLeft className="w-3.5 h-3.5" /> 返回任务列表
          </Link>
          <h1 className="text-[32px] font-light tracking-[-0.02em] text-text-main mb-3">{task.title}</h1>
          <p className="text-[14px] text-text-secondary">{project.name} · {roleLabels[task.role]}岗位 · {task.assignedTo}</p>
          <div className="flex items-center gap-2 mt-2">
            <span className={`w-[6px] h-[6px] rounded-full ${realAI ? 'bg-success' : 'bg-gray-300'}`} />
            <span className="text-[11px] text-text-muted">
              {realAI ? 'DeepSeek API 已连接' : '模拟模式'}
              {isRealAIEnabled && (
                <button onClick={() => setShowKeyInput(!showKeyInput)} className="text-accent-600 hover:underline ml-1">
                  {realAI ? '更换' : '配置 API Key'}
                </button>
              )}
            </span>
          </div>
          {isRealAIEnabled && showKeyInput && (
            <div className="mt-3 flex items-center gap-2">
              <input
                type="password"
                value={apiKeyInput}
                onChange={(e) => setApiKeyInput(e.target.value)}
                placeholder="输入 DeepSeek API Key"
                className="text-[12px] px-3 py-1.5 border border-border-default rounded-lg w-60"
              />
              <button onClick={() => {
                const key = apiKeyInput.trim()
                if (!key) { showToast('请输入 API Key', 'error'); return }
                saveApiKey(key); setRealAI(true); setShowKeyInput(false); setApiKeyInput(''); showToast('API Key 已保存', 'success')
              }} className="text-[11px] px-3 py-1.5 bg-accent-500 text-white rounded-lg font-medium">保存</button>
              {realAI && <button onClick={() => { clearApiKey(); setRealAI(false); setShowKeyInput(false); showToast('API Key 已清除') }} className="text-[11px] text-text-muted hover:text-error">清除</button>}
            </div>
          )}
        </div>
        {showResult && !submitted && (
          <div className="flex items-center gap-3">
            <button onClick={() => setShowFeedbackModal(true)} className="btn-ghost text-[13px]">
              <Flag className="w-4 h-4" /> 标记异常
            </button>
            <button onClick={handleSubmit} className="btn-primary-filled">
              <ThumbsUp className="w-4 h-4" /> 提交到报告
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-12 gap-10">
        {/* Sidebar context */}
        <div className="col-span-3 space-y-6 bg-gray-50/50 rounded-[24px] p-5 -m-2">
          <div>
            <span className="section-title">竞品数据</span>
            <div className="mt-3 space-y-2">
              {reviewMats.map((m) => (
                <div key={m.id} className="flex items-center gap-3 text-[13px] py-2 border-b border-border-light last:border-0">
                  <ShoppingBag className="w-4 h-4 text-accent-500 shrink-0" />
                  <div>
                    <div className="text-text-main font-medium">{m.label.split(' ')[0]}</div>
                    <div className="text-[11px] text-text-muted">{m.fileName || m.platform || ''}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <span className="section-title">Prompt</span>
            <p className="mt-3 text-[13px] text-text-muted leading-relaxed">{task.promptPreview}</p>
          </div>
          {feedbackItems.length > 0 && (
            <div>
              <span className="section-title">异常标记</span>
              <ul className="mt-3 space-y-1.5">
                {feedbackItems.map((f, i) => (
                  <li key={i} className="text-[12px] text-error flex items-start gap-2">
                    <span className="mt-1 shrink-0">•</span> {f}
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="bg-accent-50/40 rounded-2xl p-4 border border-accent-100">
            <span className="section-title">竞品对比智能体</span>
            <p className="mt-2 text-[11px] text-text-muted leading-relaxed">
              系统可引入小型智能体（如话术对比、卖点验证），自动将分析结果与市场竞品进行横向对比，标记差异点与优化建议。
            </p>
            <div className="mt-3 flex items-center gap-2 text-[10px]">
              <span className="px-2 py-1 rounded-md bg-white border border-accent-100 text-accent-600">话术对比</span>
              <span className="px-2 py-1 rounded-md bg-white border border-border-light text-text-muted">卖点验证</span>
              <span className="px-2 py-1 rounded-md bg-white border border-border-light text-text-muted">竞品对标</span>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="col-span-9">
          {!showResult && !generating && (
            <div className="card-surface rounded-[24px] p-16 text-center">
              <div className="w-16 h-16 rounded-[20px] bg-accent-50 flex items-center justify-center mx-auto mb-6">
                <Sparkles className="w-8 h-8 text-accent-500" />
              </div>
              <h3 className="text-[20px] font-light text-text-main mb-3">准备就绪</h3>
              <p className="text-[14px] text-text-muted mb-8 max-w-sm mx-auto leading-relaxed">
                已加载 {reviewMats.length} 个竞品的评论数据，点击生成 AI 分析。
              </p>
              <button onClick={handleGenerate} className="btn-primary-filled text-[15px] px-8 py-3">
                <Sparkles className="w-5 h-5" /> 生成分析
              </button>
            </div>
          )}

          {generating && (
            <div className="card-surface rounded-[24px] p-16 text-center">
              <div className="flex items-center justify-center gap-1.5 mb-6">
                {[0, 150, 300].map((d) => (
                  <div key={d} className="w-2.5 h-2.5 rounded-full bg-accent-500 animate-bounce" style={{ animationDelay: `${d}ms` }} />
                ))}
              </div>
              <p className="text-[15px] font-medium text-text-main mb-2">AI 正在分析...</p>
              <p className="text-[13px] text-text-muted">读取竞品评论数据、聚类用户高频痛点</p>
            </div>
          )}

          {showResult && currentResult && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-[16px] font-medium text-text-main flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-accent-500" /> AI 分析结果
                </h3>
                <button onClick={handleGenerate} className="btn-ghost text-[12px]">
                  <RotateCcw className="w-3.5 h-3.5" /> 重新生成
                </button>
              </div>

              {(aiSections || currentResult.sections || []).map((section, i) => (
                <div key={i} className="card-surface rounded-[24px] p-6">
                  <h4 className="text-[15px] font-medium text-text-main mb-5">{section.title}</h4>

                  {section.type === 'matrix' && section.headers && section.rows && (
                    <div className="overflow-x-auto">
                      <table className="w-full text-[13px]">
                        <thead>
                          <tr className="border-b border-border-default">
                            {section.headers.map((h) => (
                              <th key={h} className="text-left py-3 px-3 text-[10px] font-medium uppercase tracking-[0.08em] text-text-muted">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {section.rows.map((row, ri) => (
                            <tr key={ri} className="border-b border-border-light last:border-0">
                              {row.map((cell, ci) => (
                                <td key={ci} className={`py-3 px-3 ${ci === 0 ? 'text-text-main font-medium' : 'text-text-secondary'}`}>{cell}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {section.type === 'list' && section.items && (
                    <ol className="space-y-3">
                      {section.items.map((item, j) => (
                        <li key={j} className="flex items-start gap-3 text-[13px] text-text-secondary leading-relaxed">
                          <span className="w-6 h-6 rounded-lg bg-accent-50 text-accent-600 font-medium text-[11px] flex items-center justify-center shrink-0 mt-px">{j + 1}</span>
                          {item}
                        </li>
                      ))}
                    </ol>
                  )}

                  {section.type === 'bullet' && section.items && (
                    <ul className="space-y-3">
                      {section.items.map((item, j) => (
                        <li key={j} className="flex items-start gap-3 text-[13px] text-text-secondary leading-relaxed">
                          <div className="w-1.5 h-1.5 rounded-full bg-accent-400 mt-2 shrink-0" />{item}
                        </li>
                      ))}
                    </ul>
                  )}

                  {section.type === 'qa' && section.qa && (
                    <div className="space-y-3">
                      {section.qa.map((item, j) => (
                        <div key={j} className="bg-gray-50 rounded-2xl p-4">
                          <p className="text-[13px] font-medium text-text-main mb-2">Q: {item.q}</p>
                          <p className="text-[13px] text-text-secondary leading-relaxed">A: {item.a}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {section.type === 'quotes' && section.quotes && (
                    <div className="space-y-2">
                      {section.quotes.map((q, j) => (
                        <div key={j} className="bg-gray-50 rounded-xl p-4">
                          <p className="text-[13px] text-text-secondary leading-relaxed italic">"{q.text}"</p>
                          <p className="text-[11px] text-text-muted mt-1.5">—— {q.source}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {section.type === 'text' && section.body && (
                    <div className="bg-accent-50/50 rounded-2xl p-5">
                      <p className="text-[13px] text-text-secondary leading-relaxed">{section.body}</p>
                    </div>
                  )}
                </div>
              ))}

              {submitted && (
                <div className="card-surface rounded-[24px] p-6 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-success-soft flex items-center justify-center">
                    <CheckCircle2 className="w-5 h-5 text-success" />
                  </div>
                  <div className="flex-1">
                    <p className="text-[14px] font-medium text-success">已提交到策略报告</p>
                    <p className="text-[12px] text-text-muted">该分析结果已汇入报告，可在报告页查看。</p>
                  </div>
                  <Link to={`/tasks/${projectSlug}`} className="btn-ghost text-[12px]">继续其他任务 →</Link>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Feedback modal */}
      {showFeedbackModal && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
          <div className="bg-white rounded-[24px] p-6 w-[400px] shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[16px] font-medium text-text-main">标记异常</h3>
              <button onClick={() => { setShowFeedbackModal(false); setFeedbackText('') }} className="p-1"><X className="w-4 h-4 text-text-muted" /></button>
            </div>
            <textarea value={feedbackText} onChange={(e) => setFeedbackText(e.target.value)} rows={3} placeholder="描述 AI 结果中需人工复核的内容..." className="w-full px-4 py-3 border border-border-default rounded-2xl text-[13px] resize-none focus:outline-none focus:border-accent-400 mb-4" autoFocus />
            <div className="flex items-center gap-2 justify-end">
              <button onClick={() => { setShowFeedbackModal(false); setFeedbackText('') }} className="btn-ghost">取消</button>
              <button onClick={confirmFeedback} className="btn-primary-filled">确认标记</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
