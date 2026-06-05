import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  ArrowLeft, UserCircle, Sparkles, CheckCircle2,
  AlertTriangle, RotateCcw, Flag, ThumbsUp, ShieldAlert,
  ShoppingBag, X,
} from 'lucide-react'
import {
  mockProjects, mockTaskCards, mockAIResults, mockMaterials,
  roleLabels,
} from '../data/mock'
import { useToast } from '../components/Toast'
import StatusBadge from '../components/StatusBadge'
import PageHeader from '../components/PageHeader'
import SectionCard from '../components/SectionCard'

export default function Workspace() {
  const { projectId, taskId } = useParams<{ projectId: string; taskId: string }>()
  const project = mockProjects.find((p) => p.id === projectId)
  const task = mockTaskCards[projectId ?? '']?.find((t) => t.id === taskId)
  const result = mockAIResults[taskId ?? '']
  const materials = mockMaterials[projectId ?? ''] ?? []

  const { showToast } = useToast()
  const [submitted, setSubmitted] = useState(result?.submitted ?? false)
  const [generating, setGenerating] = useState(false)
  const [showResult, setShowResult] = useState(!!result?.generatedAt)
  const [feedbackItems, setFeedbackItems] = useState<string[]>([])
  const [showFeedbackModal, setShowFeedbackModal] = useState(false)
  const [feedbackText, setFeedbackText] = useState('')

  if (!project || !task) return <div className="text-text-muted text-sm p-8">任务不存在</div>

  const inputMats = materials.filter((m) => task.inputMaterials.includes(m.id))
  const reviewMats = inputMats.filter((m) => m.type === 'review')
  const totalReviews = reviewMats.reduce((s, m) => s + (m.reviewCount ?? 0), 0)

  const handleGenerate = () => {
    setGenerating(true)
    setTimeout(() => {
      setGenerating(false)
      setShowResult(true)
      showToast('AI 分析完成，结果已生成', 'success')
    }, 3000)
  }

  const handleSubmit = () => { setSubmitted(true); showToast('分析结果已提交到策略报告', 'success') }

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
    <div className="max-w-full">
      <PageHeader
        title={task.title}
        description={`${project.name} · ${roleLabels[task.role]}岗位`}
        actions={
          <Link to={`/tasks/${projectId}`} className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-text-secondary transition-colors">
            <ArrowLeft className="w-3.5 h-3.5" /> 返回任务列表
          </Link>
        }
      />

      <div className="grid grid-cols-12 gap-5">
        {/* 左栏：任务上下文 */}
        <div className="col-span-3 space-y-4">
          <div className="sticky top-6 space-y-4">
            <SectionCard title="任务上下文" compact>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 rounded-xl bg-ai-50 flex items-center justify-center">
                  <UserCircle className="w-4 h-4 text-ai-600" />
                </div>
                <div>
                  <div className="text-xs font-medium text-text-main">{roleLabels[task.role]} · {task.assignedTo}</div>
                </div>
              </div>
              <StatusBadge status={submitted ? 'submitted' : showResult ? 'generated' : task.status} />
              <p className="text-xs text-text-secondary mt-3 leading-relaxed">{task.description}</p>
            </SectionCard>

            <SectionCard title="竞品范围" compact>
              <div className="space-y-2">
                {reviewMats.map((m) => (
                  <div key={m.id} className="flex items-center gap-2 text-xs bg-gray-50 rounded-lg p-2.5">
                    <ShoppingBag className="w-3.5 h-3.5 text-ai-500 shrink-0" />
                    <div>
                      <div className="font-medium text-text-main">{m.label}</div>
                      <div className="text-[10px] text-text-muted">{m.reviewCount} 条评论 · 好评率 {m.rating}% · {m.platform}</div>
                    </div>
                  </div>
                ))}
              </div>
            </SectionCard>

            <SectionCard title="Prompt 摘要" compact>
              <p className="text-xs text-text-secondary leading-relaxed bg-gray-50 rounded-lg p-2.5">{task.promptPreview}</p>
            </SectionCard>
          </div>
        </div>

        {/* 中栏：AI 分析结果 */}
        <div className="col-span-6 space-y-4">
          {!showResult && !generating && (
            <div className="card-surface rounded-2xl p-10 text-center">
              <div className="w-16 h-16 rounded-2xl bg-ai-50 flex items-center justify-center mx-auto mb-5">
                <Sparkles className="w-8 h-8 text-ai-500" />
              </div>
              <h3 className="text-lg font-semibold text-text-main mb-2">准备就绪</h3>
              <p className="text-sm text-text-muted mb-6 max-w-md mx-auto leading-relaxed">
                已加载 {reviewMats.length} 个竞品共 {totalReviews} 条评论数据。点击生成运营分析，AI 将输出结构化分析结果。
              </p>
              <button
                onClick={handleGenerate}
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-ai-500 to-ai-700 text-white text-sm font-semibold rounded-xl hover:from-ai-600 hover:to-ai-800 transition-all shadow-sm btn-primary-glow"
              >
                <Sparkles className="w-4 h-4" /> 生成运营分析
              </button>
            </div>
          )}

          {generating && (
            <div className="card-surface rounded-2xl p-8">
              <div className="text-center mb-6">
                <div className="inline-flex items-center gap-2 mb-4">
                  <div className="w-2.5 h-2.5 bg-ai-500 rounded-full animate-bounce [animation-delay:0ms]" />
                  <div className="w-2.5 h-2.5 bg-ai-500 rounded-full animate-bounce [animation-delay:150ms]" />
                  <div className="w-2.5 h-2.5 bg-ai-500 rounded-full animate-bounce [animation-delay:300ms]" />
                </div>
                <p className="text-sm font-medium text-text-main">AI 正在生成运营分析...</p>
                <p className="text-xs text-text-muted mt-1">正在读取竞品评论数据、聚类用户高频痛点、匹配岗位输出格式</p>
              </div>
              <div className="space-y-2 max-w-sm mx-auto">
                {['正在读取竞品评论数据...', '正在聚类用户高频痛点...', '正在匹配岗位输出格式...', '正在生成结构化运营建议...'].map((step, i) => (
                  <div key={step} className="flex items-center gap-3 text-xs">
                    {i < 1 ? <CheckCircle2 className="w-4 h-4 text-success shrink-0" /> :
                     i === 1 ? <div className="w-4 h-4 rounded-full border-2 border-ai-400 border-t-transparent animate-spin shrink-0" /> :
                     <div className="w-4 h-4 rounded-full border-2 border-gray-200 shrink-0" />}
                    <span className={i < 1 ? 'text-success' : i === 1 ? 'text-ai-600 font-medium' : 'text-text-muted'}>{step}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {showResult && result && (
            <>
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-text-main flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-ai-500" /> AI 分析结果
                </h3>
                <button onClick={handleGenerate} className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-ai-600 transition-colors">
                  <RotateCcw className="w-3.5 h-3.5" /> 重新生成
                </button>
              </div>

              {result.sections.map((section, i) => (
                <div key={i} className="card-surface rounded-2xl p-5">
                  <h4 className="text-sm font-semibold text-text-main mb-4">{section.title}</h4>

                  {section.type === 'matrix' && section.headers && section.rows && (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b-2 border-border-default">
                            {section.headers.map((h) => (
                              <th key={h} className="text-left py-2.5 px-3 text-[11px] font-semibold text-text-muted uppercase tracking-wider">{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {section.rows.map((row, ri) => (
                            <tr key={ri} className="border-b border-border-light last:border-0 hover:bg-gray-50/50 transition-colors">
                              {row.map((cell, ci) => (
                                <td key={ci} className={`py-2.5 px-3 ${ci === 0 ? 'text-text-main font-medium' : 'text-text-secondary'}`}>{cell}</td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {section.type === 'list' && section.items && (
                    <ol className="space-y-2.5">
                      {section.items.map((item, j) => (
                        <li key={j} className="flex items-start gap-3 text-sm text-text-secondary leading-relaxed">
                          <span className="w-6 h-6 rounded-lg bg-ai-50 text-ai-600 font-medium text-xs flex items-center justify-center shrink-0 mt-px">{j + 1}</span>
                          {item}
                        </li>
                      ))}
                    </ol>
                  )}

                  {section.type === 'bullet' && section.items && (
                    <ul className="space-y-2.5">
                      {section.items.map((item, j) => (
                        <li key={j} className="flex items-start gap-3 text-sm text-text-secondary leading-relaxed">
                          <div className="w-1.5 h-1.5 rounded-full bg-ai-400 mt-2 shrink-0" />{item}
                        </li>
                      ))}
                    </ul>
                  )}

                  {section.type === 'qa' && section.qa && (
                    <div className="space-y-2.5">
                      {section.qa.map((item, j) => (
                        <div key={j} className="bg-gray-50 rounded-xl p-4 border border-border-light">
                          <p className="text-sm font-medium text-text-main mb-1.5">Q: {item.q}</p>
                          <p className="text-sm text-text-secondary leading-relaxed">A: {item.a}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {section.type === 'quotes' && section.quotes && (
                    <div className="space-y-2">
                      {section.quotes.map((q, j) => (
                        <div key={j} className="bg-gray-50 rounded-lg p-3 border border-border-light">
                          <p className="text-xs text-text-secondary leading-relaxed italic">"{q.text}"</p>
                          <p className="text-[10px] text-text-muted mt-1">—— {q.source}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {section.type === 'text' && section.body && (
                    <div className="bg-ai-50/50 border border-ai-100 rounded-xl p-4">
                      <p className="text-sm text-text-secondary leading-relaxed">{section.body}</p>
                    </div>
                  )}
                </div>
              ))}

              {!submitted && (
                <div className="flex items-center justify-between pt-2">
                  <button onClick={() => setShowFeedbackModal(true)} className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-orange-700 bg-orange-50 border border-orange-200 rounded-xl hover:bg-orange-100 transition-colors">
                    <Flag className="w-3.5 h-3.5" /> 标记异常
                  </button>
                  <button onClick={handleSubmit} className="inline-flex items-center gap-2 px-6 py-3 bg-success text-white text-sm font-semibold rounded-xl hover:bg-emerald-600 transition-colors shadow-sm">
                    <ThumbsUp className="w-4 h-4" /> 提交到策略报告
                  </button>
                </div>
              )}

              {submitted && (
                <div className="card-surface rounded-2xl p-5 border-success/30 bg-success-soft/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-success/10 flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-success" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-success">已提交到策略报告</p>
                      <p className="text-xs text-emerald-700">该分析结果已汇入大促策略报告，可在报告页查看。</p>
                    </div>
                    <Link to={`/tasks/${projectId}`} className="ml-auto text-xs font-medium text-ai-600 hover:text-ai-700 transition-colors">
                      继续其他任务 →
                    </Link>
                  </div>
                </div>
              )}

              {/* 标记异常弹窗 */}
              {showFeedbackModal && (
                <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
                  <div className="bg-white rounded-2xl p-6 w-[420px] shadow-xl border border-border-default">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center">
                          <Flag className="w-4.5 h-4.5 text-orange-500" />
                        </div>
                        <h3 className="font-semibold text-text-main">标记异常</h3>
                      </div>
                      <button onClick={() => { setShowFeedbackModal(false); setFeedbackText('') }} className="p-1 rounded-lg hover:bg-gray-100 transition-colors">
                        <X className="w-4 h-4 text-text-muted" />
                      </button>
                    </div>
                    <p className="text-xs text-text-muted mb-4">请描述 AI 分析结果中需要人工复核的异常内容：</p>
                    <textarea
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value)}
                      rows={3}
                      placeholder="例：噪音分贝数据缺少实测对比来源..."
                      className="w-full px-4 py-2.5 border border-border-default rounded-xl text-sm text-text-main placeholder:text-text-placeholder focus:outline-none focus:ring-2 focus:ring-ai-500/20 focus:border-ai-400 transition-all resize-none mb-5"
                      autoFocus
                    />
                    <div className="flex items-center gap-2 justify-end">
                      <button onClick={() => { setShowFeedbackModal(false); setFeedbackText('') }} className="px-4 py-2.5 text-sm text-text-muted hover:text-text-secondary transition-colors">取消</button>
                      <button onClick={confirmFeedback} className="px-5 py-2.5 bg-orange-500 text-white text-sm font-medium rounded-xl hover:bg-orange-600 transition-colors shadow-sm">确认标记</button>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* 右栏：质量检查面板 */}
        <div className="col-span-3 space-y-4">
          <div className="sticky top-6 space-y-4">
            <SectionCard title="质量检查" compact>
              <ul className="space-y-2 text-xs">
                {[
                  { label: '是否引用资料', status: 'pass' },
                  { label: '是否包含用户隐私', status: 'warn' },
                  { label: '是否存在商业判断', status: 'warn' },
                  { label: '是否符合输出格式', status: 'pass' },
                  { label: '是否可进入报告', status: 'pass' },
                ].map((item) => (
                  <li key={item.label} className="flex items-center justify-between">
                    <span className="text-text-secondary">{item.label}</span>
                    {item.status === 'pass' ? (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-success-soft text-success font-medium">已通过</span>
                    ) : (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-warning-soft text-warning font-medium">待确认</span>
                    )}
                  </li>
                ))}
              </ul>
            </SectionCard>

            <SectionCard title="资料引用" compact>
              <div className="space-y-1.5">
                {reviewMats.map((m) => (
                  <div key={m.id} className="flex items-center justify-between text-[11px]">
                    <span className="text-text-secondary">{m.label.split(' ')[0]}</span>
                    <span className="text-text-muted">{m.reviewCount} 条</span>
                  </div>
                ))}
              </div>
            </SectionCard>

            {feedbackItems.length > 0 && (
              <SectionCard title="异常标记" compact>
                <ul className="space-y-1.5">
                  {feedbackItems.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-xs text-orange-700">
                      <AlertTriangle className="w-3.5 h-3.5 text-orange-400 mt-px shrink-0" />{f}
                    </li>
                  ))}
                </ul>
              </SectionCard>
            )}

            <div className="bg-warning-soft border border-warning/20 rounded-2xl p-4">
              <div className="flex items-start gap-3">
                <ShieldAlert className="w-5 h-5 text-warning shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-semibold text-orange-800 mb-1.5">人工判断提醒</h4>
                  <p className="text-[11px] text-orange-700 leading-relaxed">
                    AI 分析结果仅作为运营参考，不构成最终商业决策。商品策略、用户隐私合规和价格判断需由岗位负责人确认。
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-ai-50/50 border border-ai-100 rounded-xl p-3 text-center">
              <p className="text-[11px] text-ai-700">AI 结果基于左侧竞品数据与右侧资料引用生成。</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
