import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Sparkles, CheckCircle2, RotateCcw, Flag, ThumbsUp, X, ShoppingBag, BookOpen, Link2, ShieldCheck, Check, MinusCircle, Edit3, Plus, Trash2, Package, ArrowRight } from 'lucide-react'
import { roleLabels } from '../data/mock'
import { getProjectBySlug, getTasks, getAIResult, getMaterials, getWorkKits, saveAIResult, updateTask } from '../services/db'
import { useToast } from '../components/Toast'
import { hasApiKey, generateAnalysis, saveApiKey, clearApiKey, isRealAIEnabled } from '../services/ai'
import type { AIResult, AISection, Material, Project, TaskCard, WorkKit } from '../types'

interface KnowledgeRecommendation {
  id: string
  title: string
  source: string
  type: string
  relevance: number
  reason: string
  promptHint: string
  verification: string
}

function readAssetHandoffs(): any[] {
  try {
    return JSON.parse(localStorage.getItem('promokit_asset_handoffs') || '[]')
  } catch {
    return []
  }
}

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

function buildKnowledgeRecommendations(project: Project, task: TaskCard, materials: Material[], kits: WorkKit[]): KnowledgeRecommendation[] {
  const roleLabel = roleLabels[task.role]
  const relatedKits = kits
    .filter((kit) => kit.includedRoles.includes(task.role) || kit.tags.some((tag) => project.category.includes(tag) || task.title.includes(tag)))
    .sort((a, b) => (b.rating * 10 + b.reuseCount) - (a.rating * 10 + a.reuseCount))
    .slice(0, 2)
    .map((kit, index) => ({
      id: `kit-${kit.id}`,
      title: kit.name,
      source: `${kit.version} · 复用 ${kit.reuseCount} 次 · 评分 ${kit.rating}`,
      type: index === 0 ? '成功案例' : '可复用流程',
      relevance: Math.min(98, 88 + kit.reuseCount),
      reason: `包含${roleLabel}岗任务模板，可提前学习相似项目的资料结构、判断口径和输出格式。`,
      promptHint: `沿用「${kit.name}」中的${roleLabel}分析框架，但根据 ${project.category} 与 ${project.campaign} 重新校准结论。`,
      verification: `成功案例已标星，适合作为公司知识库的优先参考项。`,
    }))

  const materialHints = materials.slice(0, 3).map((material, index) => ({
    id: `mat-${material.id}`,
    title: material.label,
    source: material.fileName || material.platform || '项目资料',
    type: material.type === 'review' ? '竞品样本' : material.type === 'faq' ? '客服知识' : material.type === 'copy_asset' ? '历史文案' : '商品资料',
    relevance: 86 - index * 3,
    reason: `已被当前任务引用，可作为执行中自动关联的高相关资料，减少无关检索。`,
    promptHint: `优先引用「${material.label}」中的事实、用户原话或参数，不直接套用未经验证的结论。`,
    verification: material.type === 'review'
      ? `可与市场竞品反馈做横向对比，识别公司知识库未覆盖的问题。`
      : `可与本次 AI 输出做一致性检查，保留有效内容并标记待修订项。`,
  }))

  const promptFallback: KnowledgeRecommendation[] = [
    {
      id: `prompt-${task.id}`,
      title: `${roleLabel}岗高关联 Prompt`,
      source: '系统根据任务目标自动生成',
      type: 'Prompt 片段',
      relevance: 84,
      reason: `围绕「${task.title}」自动筛选出最贴近的提示词，可直接并入本次分析。`,
      promptHint: task.promptPreview,
      verification: '由人工验证角色复核输出是否符合岗位目标、输入来源和输出格式。',
    },
  ]

  return [...relatedKits, ...materialHints, ...promptFallback].slice(0, 5)
}

export default function Workspace() {
  const { projectSlug, taskId } = useParams<{ projectSlug: string; taskId: string }>()
  const project = getProjectBySlug(projectSlug!)
  const task = project ? getTasks(project.id).find((t) => t.id === taskId) : undefined
  const result = getAIResult(taskId ?? '')
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  useEffect(() => {
    const handleSync = () => {
      setRefreshTrigger((prev) => prev + 1)
    }
    window.addEventListener('promokit_db_update', handleSync)
    return () => window.removeEventListener('promokit_db_update', handleSync)
  }, [])

  const materials = project ? getMaterials(project.id) : []
  const { showToast } = useToast()
  
  // Reference refreshTrigger to bypass strict unused check
  if (refreshTrigger < 0) {
    console.log(refreshTrigger)
  }

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
  const [adoptedKnowledgeIds, setAdoptedKnowledgeIds] = useState<string[]>([])

  if (!project || !task) return <div className="text-text-muted text-sm p-8">任务不存在</div>

  const inputMats = materials.filter((m) => task.inputMaterials.includes(m.id))
  const reviewMats = inputMats.filter((m) => m.type === 'review')
  const knowledgeRecommendations = buildKnowledgeRecommendations(project, task, inputMats, getWorkKits())
  const adoptedIds = adoptedKnowledgeIds.length > 0 ? adoptedKnowledgeIds : knowledgeRecommendations.slice(0, 2).map((item) => item.id)
  const adoptedRecommendations = knowledgeRecommendations.filter((item) => adoptedIds.includes(item.id))
  const resultSectionCount = (aiSections || currentResult?.sections || []).length
  const assetHandoffItems = [
    {
      label: '结果区块',
      value: showResult && currentResult ? `${resultSectionCount} 个` : '待生成',
      desc: '会进入策略报告，作为后续 Work Kit 的输出结构',
    },
    {
      label: '采纳知识',
      value: `${adoptedRecommendations.length} 项`,
      desc: '保存成功案例、资料与 Prompt 的引用依据',
    },
    {
      label: '复核标记',
      value: feedbackItems.length ? `${feedbackItems.length} 条` : '0 条',
      desc: feedbackItems.length ? '会作为版本修订线索' : '暂无异常，可继续人工复核',
    },
    {
      label: '来源资料',
      value: `${inputMats.length} 份`,
      desc: '保留本次分析依赖的资料范围',
    },
  ]
  const sourceCoverage = Math.min(100, Math.round(((inputMats.length + adoptedRecommendations.length) / 8) * 100))
  const qualityScore = Math.min(98, 64 + resultSectionCount * 8 + adoptedRecommendations.length * 4 - feedbackItems.length * 6)
  const phaseItems = [
    { label: '资料输入', value: `${inputMats.length} 份`, active: inputMats.length > 0 },
    { label: '知识校准', value: `${adoptedRecommendations.length} 项`, active: adoptedRecommendations.length > 0 },
    { label: 'AI 生成', value: showResult ? '完成' : generating ? '运行中' : '待启动', active: showResult || generating },
    { label: '报告交接', value: submitted ? '已提交' : '待确认', active: submitted },
  ]

  const toggleKnowledge = (id: string) => {
    setAdoptedKnowledgeIds((prev) => {
      const base = prev.length > 0 ? prev : adoptedIds
      return base.includes(id) ? base.filter((item) => item !== id) : [...base, id]
    })
  }

  const [workspaceEditMode, setWorkspaceEditMode] = useState(false)

  useEffect(() => {
    setSubmitted(result?.submitted ?? false)
    setCurrentResult(result)
    setAiSections(result?.sections ?? null)
    setWorkspaceEditMode(false)
  }, [taskId])

  const handleUpdateSection = (sectionIndex: number, updatedFields: Partial<AISection>) => {
    if (!currentResult) return
    const sectionsBase = aiSections || currentResult.sections || []
    const nextSections = sectionsBase.map((sec, idx) => {
      if (idx === sectionIndex) {
        return { ...sec, ...updatedFields }
      }
      return sec
    })
    setAiSections(nextSections)
    const nextResult = { ...currentResult, sections: nextSections }
    setCurrentResult(nextResult)
    saveAIResult(nextResult)
  }

  const handleMatrixCellChange = (secIdx: number, rowIdx: number, colIdx: number, value: string) => {
    const sec = (aiSections || currentResult!.sections)[secIdx]
    const nextRows = (sec.rows || []).map((row, rIdx) => {
      if (rIdx === rowIdx) {
        return row.map((cell, cIdx) => (cIdx === colIdx ? value : cell))
      }
      return row
    })
    handleUpdateSection(secIdx, { rows: nextRows })
  }

  const handleMatrixHeaderChange = (secIdx: number, colIdx: number, value: string) => {
    const sec = (aiSections || currentResult!.sections)[secIdx]
    const nextHeaders = (sec.headers || []).map((h, cIdx) => (cIdx === colIdx ? value : h))
    handleUpdateSection(secIdx, { headers: nextHeaders })
  }

  const handleMatrixAddRow = (secIdx: number) => {
    const sec = (aiSections || currentResult!.sections)[secIdx]
    const colCount = sec.headers?.length || 3
    const newRow = Array(colCount).fill('新增内容')
    const nextRows = [...(sec.rows || []), newRow]
    handleUpdateSection(secIdx, { rows: nextRows })
  }

  const handleMatrixDeleteRow = (secIdx: number, rowIdx: number) => {
    const sec = (aiSections || currentResult!.sections)[secIdx]
    const nextRows = (sec.rows || []).filter((_, rIdx) => rIdx !== rowIdx)
    handleUpdateSection(secIdx, { rows: nextRows })
  }

  const handleListItemChange = (secIdx: number, itemIdx: number, value: string) => {
    const sec = (aiSections || currentResult!.sections)[secIdx]
    const nextItems = (sec.items || []).map((item, idx) => (idx === itemIdx ? value : item))
    handleUpdateSection(secIdx, { items: nextItems })
  }

  const handleListAddItem = (secIdx: number) => {
    const sec = (aiSections || currentResult!.sections)[secIdx]
    const nextItems = [...(sec.items || []), '新增项目要点...']
    handleUpdateSection(secIdx, { items: nextItems })
  }

  const handleListDeleteItem = (secIdx: number, itemIdx: number) => {
    const sec = (aiSections || currentResult!.sections)[secIdx]
    const nextItems = (sec.items || []).filter((_, idx) => idx !== itemIdx)
    handleUpdateSection(secIdx, { items: nextItems })
  }

  const handleQAChange = (secIdx: number, itemIdx: number, field: 'q' | 'a', value: string) => {
    const sec = (aiSections || currentResult!.sections)[secIdx]
    const nextQA = (sec.qa || []).map((item, idx) => {
      if (idx === itemIdx) {
        return { ...item, [field]: value }
      }
      return item
    })
    handleUpdateSection(secIdx, { qa: nextQA })
  }

  const handleQAAdd = (secIdx: number) => {
    const sec = (aiSections || currentResult!.sections)[secIdx]
    const nextQA = [...(sec.qa || []), { q: '新增问题？', a: '新增答复内容...' }]
    handleUpdateSection(secIdx, { qa: nextQA })
  }

  const handleQADelete = (secIdx: number, itemIdx: number) => {
    const sec = (aiSections || currentResult!.sections)[secIdx]
    const nextQA = (sec.qa || []).filter((_, idx) => idx !== itemIdx)
    handleUpdateSection(secIdx, { qa: nextQA })
  }

  const handleQuoteChange = (secIdx: number, itemIdx: number, field: 'text' | 'source', value: string) => {
    const sec = (aiSections || currentResult!.sections)[secIdx]
    const nextQuotes = (sec.quotes || []).map((item, idx) => {
      if (idx === itemIdx) {
        return { ...item, [field]: value }
      }
      return item
    })
    handleUpdateSection(secIdx, { quotes: nextQuotes })
  }

  const handleQuoteAdd = (secIdx: number) => {
    const sec = (aiSections || currentResult!.sections)[secIdx]
    const nextQuotes = [...(sec.quotes || []), { text: '新原话摘录内容', source: '渠道来源' }]
    handleUpdateSection(secIdx, { quotes: nextQuotes })
  }

  const handleQuoteDelete = (secIdx: number, itemIdx: number) => {
    const sec = (aiSections || currentResult!.sections)[secIdx]
    const nextQuotes = (sec.quotes || []).filter((_, idx) => idx !== itemIdx)
    handleUpdateSection(secIdx, { quotes: nextQuotes })
  }

  const handleTextChange = (secIdx: number, value: string) => {
    handleUpdateSection(secIdx, { body: value })
  }

  const handleGenerate = async () => {
    setGenerating(true)
    if (hasApiKey()) {
      try {
        const matContents = [
          ...inputMats.map((m) => m.content),
          ...adoptedRecommendations.map((k) => `知识库关联：${k.title}。采纳理由：${k.reason}。提示词补充：${k.promptHint}`),
        ]
        const enrichedPrompt = `${task.promptPreview}\n\n请同时参考以下知识库关联项，并输出验证角色的保留/修订判断：\n${adoptedRecommendations.map((k, i) => `${i + 1}. ${k.title}：${k.promptHint}`).join('\n')}`
        const sections = await generateAnalysis(enrichedPrompt, matContents, roleLabels[task.role])
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
        const sections = buildMockSections(task, inputMats.length + adoptedRecommendations.length)
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
    const handoffs = readAssetHandoffs()
    const handoff = {
      id: `handoff-${Date.now()}`,
      projectId: project.id,
      projectName: project.name,
      taskId: task.id,
      taskTitle: task.title,
      role: task.role,
      roleLabel: roleLabels[task.role],
      resultId: submittedResult.id,
      sectionCount: submittedResult.sections.length,
      adoptedKnowledge: adoptedRecommendations.map((item) => ({
        id: item.id,
        title: item.title,
        type: item.type,
        relevance: item.relevance,
      })),
      materialIds: inputMats.map((material) => material.id),
      feedbackItems,
      createdAt: new Date().toISOString(),
    }
    localStorage.setItem('promokit_asset_handoffs', JSON.stringify([handoff, ...handoffs].slice(0, 80)))
    if (task) {
      updateTask({ ...task, status: 'submitted' })
    }
    showToast('已提交到策略报告', 'success')
  }

  const handleRetract = () => {
    if (!currentResult) return
    const retractedResult = { ...currentResult, submitted: false }
    setSubmitted(false)
    setCurrentResult(retractedResult)
    saveAIResult(retractedResult)
    if (task) {
      updateTask({ ...task, status: 'generated' })
    }
    showToast('已撤回提交，可重新编辑', 'info')
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
    <div className="max-w-[1480px] space-y-6">
      <div className="brand-goal-panel p-6">
        <div className="relative grid grid-cols-[1fr_420px] gap-8 items-end">
          <div>
            <Link to={`/tasks/${projectSlug}`} className="text-[11px] text-text-muted hover:text-text-secondary transition-colors inline-flex items-center gap-1.5 mb-5">
              <ArrowLeft className="w-3.5 h-3.5" /> 返回任务列表
            </Link>
            <div className="flex items-center gap-3 mb-4">
              <span className="brand-goal-mark" />
              <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-accent-600">AI Analysis Cockpit</span>
              <span className={`text-[10px] px-2 py-1 rounded-md border ${realAI ? 'border-success/20 bg-success-soft text-success' : 'border-border-light bg-bg-surface text-text-muted'}`}>
                {realAI ? 'DeepSeek 已连接' : '模拟推演模式'}
              </span>
            </div>
            <h1 className="text-[40px] font-medium tracking-[-0.045em] text-text-main leading-tight mb-4">{task.title}</h1>
            <p className="text-[14px] text-text-secondary leading-relaxed max-w-3xl">
              {project.name} · {roleLabels[task.role]}岗位 · {task.assignedTo}。把资料、知识库、Prompt 与人工验证收束到一个可提交、可追溯、可沉淀的 AI 工作台。
            </p>
            {isRealAIEnabled && (
              <div className="mt-4">
                <button onClick={() => setShowKeyInput(!showKeyInput)} className="text-[11px] text-accent-600 hover:text-accent-500">
                  {realAI ? '更换 API Key' : '配置 DeepSeek API Key'}
                </button>
                {showKeyInput && (
                  <div className="mt-3 flex items-center gap-2">
                    <input
                      type="password"
                      value={apiKeyInput}
                      onChange={(e) => setApiKeyInput(e.target.value)}
                      placeholder="输入 DeepSeek API Key"
                      className="form-control text-[12px] px-3 py-1.5 w-72"
                    />
                    <button onClick={() => {
                      const key = apiKeyInput.trim()
                      if (!key) { showToast('请输入 API Key', 'error'); return }
                      saveApiKey(key); setRealAI(true); setShowKeyInput(false); setApiKeyInput(''); showToast('API Key 已保存', 'success')
                    }} className="btn-primary-filled text-[11px] px-3 py-1.5">保存</button>
                    {realAI && <button onClick={() => { clearApiKey(); setRealAI(false); setShowKeyInput(false); showToast('API Key 已清除') }} className="text-[11px] text-text-muted hover:text-error">清除</button>}
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              ['资料覆盖', `${sourceCoverage}%`, `${inputMats.length} 份资料 + ${adoptedRecommendations.length} 项知识`],
              ['质量评分', `${qualityScore}%`, feedbackItems.length ? `${feedbackItems.length} 条异常待复核` : '暂无异常标记'],
              ['结果区块', showResult ? `${resultSectionCount} 个` : '待生成', '进入报告的结构化内容'],
              ['交接状态', submitted ? '已提交' : '待确认', submitted ? '报告链路已接收' : '提交后可沉淀资产'],
            ].map(([label, value, desc]) => (
              <div key={label} className="rounded-xl border border-border-light bg-bg-surface/70 p-4">
                <div className="text-[10px] font-semibold uppercase tracking-[0.08em] text-text-muted mb-4">{label}</div>
                <div className="text-[28px] font-light text-text-main leading-none mb-2">{value}</div>
                <div className="text-[10px] text-text-muted leading-relaxed">{desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="data-panel p-4">
        <div className="grid grid-cols-4 gap-3">
          {phaseItems.map((phase, index) => (
            <div key={phase.label} className={`rounded-xl border p-4 ${phase.active ? 'border-accent-500/25 bg-accent-500/[0.06]' : 'border-border-light bg-bg-primary/55'}`}>
              <div className="flex items-center justify-between mb-3">
                <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-[11px] font-mono ${phase.active ? 'bg-accent-500 text-white' : 'bg-bg-surface text-text-muted'}`}>{index + 1}</span>
                <span className={`w-2 h-2 rounded-full ${phase.active ? 'bg-accent-500' : 'bg-border-default'}`} />
              </div>
              <div className="text-[13px] font-semibold text-text-main">{phase.label}</div>
              <div className="text-[11px] text-text-muted mt-1">{phase.value}</div>
            </div>
          ))}
        </div>
      </div>

      {showResult && !submitted && (
        <div className="action-panel p-4 flex items-center justify-between">
          <div>
            <div className="text-[13px] font-medium text-text-main">结果已生成，等待人工复核与提交</div>
            <div className="text-[11px] text-text-muted mt-1">可编辑分析区块、标记异常，或将结果交接到策略报告。</div>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={() => setWorkspaceEditMode(!workspaceEditMode)} className="btn-primary text-[13px]">
              {workspaceEditMode ? <Check className="w-4 h-4" /> : <Edit3 className="w-4 h-4" />}
              {workspaceEditMode ? '完成编辑' : '编辑分析'}
            </button>
            <button onClick={() => setShowFeedbackModal(true)} className="btn-ghost text-[13px]">
              <Flag className="w-4 h-4" /> 标记异常
            </button>
            <button onClick={handleSubmit} className="btn-primary-filled">
              <ThumbsUp className="w-4 h-4" /> 提交到报告
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-[320px_minmax(0,1fr)_300px] gap-5">
        {/* Sidebar context */}
        <div className="space-y-5 data-panel p-5 self-start sticky top-6">
          <div>
            <div className="flex items-center justify-between">
              <span className="section-title">Source Deck</span>
              <span className="text-[10px] font-semibold text-accent-600">{inputMats.length} 份输入</span>
            </div>
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
            <span className="section-title">Prompt Kernel</span>
            <div className="mt-3 rounded-xl border border-border-light bg-bg-primary/60 p-4">
              <p className="text-[12px] text-text-secondary leading-relaxed">{task.promptPreview}</p>
            </div>
          </div>
          <div className="action-panel p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="section-title">Knowledge Radar</span>
              <span className="text-[10px] font-semibold text-accent-600">{adoptedRecommendations.length}/5 已采纳</span>
            </div>
            <div className="space-y-2.5">
              {knowledgeRecommendations.map((item) => {
                const adopted = adoptedIds.includes(item.id)
                return (
                  <button
                    key={item.id}
                    onClick={() => toggleKnowledge(item.id)}
                    className={`w-full text-left rounded-lg border p-3 transition-colors ${
                      adopted
                        ? 'border-accent-500/25 bg-bg-surface'
                        : 'border-border-light bg-bg-surface/55 hover:border-accent-500/15'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${adopted ? 'bg-accent-500 text-white' : 'bg-bg-primary text-text-muted'}`}>
                        {adopted ? <Check className="w-3.5 h-3.5" /> : <BookOpen className="w-3.5 h-3.5" />}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <span className="text-[12px] font-semibold text-text-main truncate">{item.title}</span>
                          <span className="text-[10px] font-bold text-accent-600 shrink-0">{item.relevance}%</span>
                        </div>
                        <div className="flex items-center gap-1.5 mb-1.5">
                          <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-accent-50 text-accent-600">{item.type}</span>
                          <span className="text-[10px] text-text-muted truncate">{item.source}</span>
                        </div>
                        <p className="text-[11px] leading-relaxed text-text-muted">{item.reason}</p>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
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
        </div>

        {/* Main content */}
        <div className="min-w-0">
          {!showResult && !generating && (
            <div className="action-panel overflow-hidden">
              <div className="grid grid-cols-[1fr_260px]">
                <div className="p-10">
                  <div className="w-14 h-14 rounded-2xl bg-accent-50 flex items-center justify-center mb-7">
                    <Sparkles className="w-7 h-7 text-accent-500" />
                  </div>
                  <div className="section-title mb-3">Ready To Run</div>
                  <h3 className="text-[30px] font-medium tracking-[-0.035em] text-text-main mb-4">启动一次可追溯的 AI 分析</h3>
                  <p className="text-[14px] text-text-muted mb-8 max-w-xl leading-relaxed">
                    系统将读取 {reviewMats.length} 个竞品评论样本、{inputMats.length} 份项目资料和 {adoptedRecommendations.length} 个知识项，生成可编辑、可复核、可提交到报告的结构化结果。
                  </p>
                  <div className="flex items-center gap-3">
                    <button onClick={handleGenerate} className="btn-primary-filled text-[15px] px-8 py-3">
                      <Sparkles className="w-5 h-5" /> 生成分析
                    </button>
                    <span className="text-[11px] text-text-muted">预计输出 {task.outputFormat || '结构化分析结果'}</span>
                  </div>
                </div>
                <div className="border-l border-border-light bg-bg-primary/45 p-6 flex flex-col justify-between">
                  <div>
                    <div className="section-title mb-4">Run Stack</div>
                    {[
                      ['资料读取', `${inputMats.length} sources`],
                      ['知识校准', `${adoptedRecommendations.length} references`],
                      ['岗位角色', roleLabels[task.role]],
                      ['输出格式', task.outputFormat || '结构化结果'],
                    ].map(([label, value]) => (
                      <div key={label} className="border-b border-border-light last:border-0 py-3">
                        <div className="text-[10px] text-text-muted mb-1">{label}</div>
                        <div className="text-[13px] font-medium text-text-main">{value}</div>
                      </div>
                    ))}
                  </div>
                  <div className="rounded-xl border border-accent-500/15 bg-accent-500/[0.06] p-4">
                    <div className="text-[11px] font-semibold text-accent-600 mb-1">目标</div>
                    <div className="text-[12px] text-text-secondary leading-relaxed">生成后直接进入人工复核和资产交接，不让 AI 结果停留在一次性文本。</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {generating && (
            <div className="data-panel p-10">
              <div className="grid grid-cols-[220px_1fr] gap-8 items-center">
                <div className="relative h-[220px] rounded-2xl border border-accent-500/20 bg-accent-500/[0.04] flex items-center justify-center overflow-hidden">
                  <div className="absolute w-40 h-40 rounded-full border border-accent-500/20" />
                  <div className="absolute w-28 h-28 rounded-full border border-accent-500/30" />
                  <div className="w-16 h-16 rounded-2xl bg-accent-500 text-white flex items-center justify-center animate-pulse">
                    <Sparkles className="w-8 h-8" />
                  </div>
                </div>
                <div>
                  <div className="section-title mb-3">AI Running</div>
                  <h3 className="text-[28px] font-medium tracking-[-0.03em] text-text-main mb-3">正在构建分析结果...</h3>
                  <p className="text-[13px] text-text-muted leading-relaxed mb-6">读取竞品评论、关联知识库、执行验证角色对比，并把结果整理为可提交报告的结构化区块。</p>
                  <div className="grid grid-cols-3 gap-3">
                    {['读取资料', '校准知识', '生成结果'].map((label, index) => (
                      <div key={label} className="rounded-xl border border-border-light bg-bg-primary/70 p-4">
                        <div className="flex items-center gap-1.5 mb-3">
                          {[0, 1, 2].map((dot) => (
                            <span key={dot} className="w-1.5 h-1.5 rounded-full bg-accent-500 animate-bounce" style={{ animationDelay: `${(index + dot) * 120}ms` }} />
                          ))}
                        </div>
                        <div className="text-[12px] font-medium text-text-main">{label}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {showResult && currentResult && (
            <div className="space-y-6">
              <div className="data-panel p-5">
                <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-5 xl:gap-8">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <ShieldCheck className="w-4 h-4 text-accent-500" />
                      <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-text-muted">验证角色 · 内外知识库对比</span>
                    </div>
                    <h3 className="text-[18px] font-medium text-text-main mb-2">已把采纳知识项纳入本次分析口径</h3>
                    <p className="text-[13px] text-text-muted leading-relaxed max-w-xl">
                      系统将公司知识库、成功案例与市场竞品资料并行对比，保留可复用判断，标记需要人工复核或更新的内容。
                    </p>
                  </div>
                  <div className="grid grid-cols-3 gap-2 shrink-0 w-full xl:w-[300px]">
                    {[
                      ['采纳知识', `${adoptedRecommendations.length} 项`],
                      ['验证来源', `${reviewMats.length} 个竞品`],
                      ['待复核', feedbackItems.length ? `${feedbackItems.length} 条` : '0 条'],
                    ].map(([label, value]) => (
                      <div key={label} className="data-metric p-3 text-center">
                        <div className="text-[18px] font-light text-text-main leading-none mb-1">{value}</div>
                        <div className="text-[10px] text-text-muted">{label}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-5">
                  {adoptedRecommendations.slice(0, 4).map((item) => (
                    <div key={item.id} className="rounded-lg border border-border-light bg-bg-primary/70 p-3">
                      <div className="flex items-center gap-2 mb-1.5">
                        <Link2 className="w-3.5 h-3.5 text-accent-500" />
                        <span className="text-[12px] font-medium text-text-main truncate">{item.title}</span>
                      </div>
                      <p className="text-[11px] text-text-muted leading-relaxed">{item.verification}</p>
                    </div>
                  ))}
                </div>
                {adoptedRecommendations.length === 0 && (
                  <div className="mt-5 rounded-lg border border-warning/20 bg-warning-soft p-4 flex items-center gap-3">
                    <MinusCircle className="w-4 h-4 text-warning" />
                    <p className="text-[12px] text-warning">当前未采纳知识项，建议至少选择一个成功案例或高相关资料再生成。</p>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between">
                <h3 className="text-[16px] font-medium text-text-main flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-accent-500" /> AI 分析结果
                </h3>
                <button onClick={handleGenerate} className="btn-ghost text-[12px]">
                  <RotateCcw className="w-3.5 h-3.5" /> 重新生成
                </button>
              </div>

              <div className="action-panel p-5">
                <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-5 mb-5">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Package className="w-4 h-4 text-accent-500" />
                      <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-text-muted">Asset Handoff · 资产化交接</span>
                    </div>
                    <h3 className="text-[18px] font-medium text-text-main mb-2">提交前确认这份结果会沉淀成什么</h3>
                    <p className="text-[13px] text-text-muted leading-relaxed max-w-2xl">
                      系统会把分析区块、采纳知识、异常标记和来源资料一起送入策略报告，作为后续发布 Work Kit 时的可追溯资产来源。
                    </p>
                  </div>
                  <div className={`rounded-xl px-4 py-3 text-center shrink-0 ${
                    submitted ? 'bg-success-soft text-success' : 'bg-accent-500/[0.08] text-accent-600'
                  }`}>
                    <div className="text-[22px] font-light leading-none">{submitted ? '已提交' : '待提交'}</div>
                    <div className="text-[10px] font-medium mt-1">{submitted ? '报告链路已接收' : '确认后进入报告'}</div>
                  </div>
                </div>
                <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-3">
                  {assetHandoffItems.map((item) => (
                    <div key={item.label} className="data-metric p-4">
                      <div className="text-[18px] font-light text-text-main leading-none mb-2">{item.value}</div>
                      <div className="text-[12px] font-medium text-text-main">{item.label}</div>
                      <p className="text-[10px] text-text-muted leading-relaxed mt-1">{item.desc}</p>
                    </div>
                  ))}
                </div>
                {adoptedRecommendations.length > 0 && (
                  <div className="mt-4 rounded-xl border border-border-light bg-bg-primary/50 p-4">
                    <div className="text-[11px] font-semibold text-text-main mb-3">将一并带入报告的知识依据</div>
                    <div className="flex flex-wrap gap-2">
                      {adoptedRecommendations.map((item) => (
                        <span key={item.id} className="inline-flex items-center gap-1.5 rounded-full bg-bg-surface border border-border-light px-2.5 py-1 text-[10px] text-text-secondary">
                          <BookOpen className="w-3 h-3 text-accent-500" />
                          {item.title}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {(aiSections || currentResult.sections || []).map((section, i) => (
                <div key={i} className="data-panel p-5">
                  {workspaceEditMode ? (
                    <div className="mb-5 flex flex-col gap-1">
                      <label className="text-[10px] text-text-muted font-medium uppercase tracking-[0.08em]">区块标题</label>
                      <input
                        type="text"
                        value={section.title}
                        onChange={(e) => handleUpdateSection(i, { title: e.target.value })}
                        className="text-[15px] font-medium text-text-main bg-bg-primary border border-border-default rounded-xl px-3 py-2 w-full focus:outline-none focus:border-accent-400"
                      />
                    </div>
                  ) : (
                    <h4 className="text-[15px] font-medium text-text-main mb-5">{section.title}</h4>
                  )}

                  {section.type === 'matrix' && section.headers && section.rows && (
                    <div className="overflow-x-auto">
                      {workspaceEditMode ? (
                        <div>
                          <table className="w-full text-[13px]">
                            <thead>
                              <tr className="border-b border-border-default">
                                {section.headers.map((h, ci) => (
                                  <th key={ci} className="py-2 px-1 text-left">
                                    <input
                                      type="text"
                                      value={h}
                                      onChange={(e) => handleMatrixHeaderChange(i, ci, e.target.value)}
                                      className="w-full bg-bg-primary border border-border-light rounded-lg px-2 py-1 text-[11px] font-semibold text-text-main focus:outline-none focus:border-accent-400"
                                    />
                                  </th>
                                ))}
                                <th className="w-10"></th>
                              </tr>
                            </thead>
                            <tbody>
                              {section.rows.map((row, ri) => (
                                <tr key={ri} className="border-b border-border-light last:border-0">
                                  {row.map((cell, ci) => (
                                    <td key={ci} className="py-2 px-1">
                                      <textarea
                                        value={cell}
                                        onChange={(e) => handleMatrixCellChange(i, ri, ci, e.target.value)}
                                        rows={Math.max(1, Math.ceil(cell.length / 18))}
                                        className="w-full bg-bg-surface border border-border-light rounded-lg px-2 py-1 text-[13px] text-text-secondary focus:outline-none focus:border-accent-400 resize-y"
                                      />
                                    </td>
                                  ))}
                                  <td className="py-2 px-1 text-center">
                                    <button
                                      onClick={() => handleMatrixDeleteRow(i, ri)}
                                      className="p-1.5 rounded-lg text-text-muted hover:text-error hover:bg-error-soft transition-colors"
                                      title="删除行"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          <button
                            onClick={() => handleMatrixAddRow(i)}
                            className="mt-3 text-[11px] text-accent-600 hover:text-accent-500 font-medium flex items-center gap-1 bg-white/[0.03] hover:bg-white/5 px-3 py-1.5 rounded-xl border border-border-light transition-all"
                          >
                            <Plus className="w-3.5 h-3.5" /> 添加行
                          </button>
                        </div>
                      ) : (
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
                      )}
                    </div>
                  )}

                  {section.type === 'list' && section.items && (
                    <div>
                      {workspaceEditMode ? (
                        <div className="space-y-3">
                          {section.items.map((item, j) => (
                            <div key={j} className="flex items-start gap-2">
                              <span className="w-6 h-6 rounded-lg bg-accent-50 text-accent-600 font-medium text-[11px] flex items-center justify-center shrink-0 mt-2">{j + 1}</span>
                              <textarea
                                value={item}
                                onChange={(e) => handleListItemChange(i, j, e.target.value)}
                                rows={2}
                                className="flex-1 bg-bg-primary border border-border-light rounded-xl p-2.5 text-[13px] text-text-secondary focus:outline-none focus:border-accent-400"
                              />
                              <button
                                onClick={() => handleListDeleteItem(i, j)}
                                className="mt-2 p-1.5 rounded-lg text-text-muted hover:text-error hover:bg-error-soft transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                          <button
                            onClick={() => handleListAddItem(i)}
                            className="mt-2 text-[11px] text-accent-600 hover:text-accent-500 font-medium flex items-center gap-1 bg-white/[0.03] hover:bg-white/5 px-3 py-1.5 rounded-xl border border-border-light transition-all"
                          >
                            <Plus className="w-3.5 h-3.5" /> 添加项
                          </button>
                        </div>
                      ) : (
                        <ol className="space-y-3">
                          {section.items.map((item, j) => (
                            <li key={j} className="flex items-start gap-3 text-[13px] text-text-secondary leading-relaxed">
                              <span className="w-6 h-6 rounded-lg bg-accent-50 text-accent-600 font-medium text-[11px] flex items-center justify-center shrink-0 mt-px">{j + 1}</span>
                              {item}
                            </li>
                          ))}
                        </ol>
                      )}
                    </div>
                  )}

                  {section.type === 'bullet' && section.items && (
                    <div>
                      {workspaceEditMode ? (
                        <div className="space-y-3">
                          {section.items.map((item, j) => (
                            <div key={j} className="flex items-start gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-accent-400 mt-4 shrink-0" />
                              <textarea
                                value={item}
                                onChange={(e) => handleListItemChange(i, j, e.target.value)}
                                rows={2}
                                className="flex-1 bg-bg-primary border border-border-light rounded-xl p-2.5 text-[13px] text-text-secondary focus:outline-none focus:border-accent-400"
                              />
                              <button
                                onClick={() => handleListDeleteItem(i, j)}
                                className="mt-2 p-1.5 rounded-lg text-text-muted hover:text-error hover:bg-error-soft transition-colors"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                          <button
                            onClick={() => handleListAddItem(i)}
                            className="mt-2 text-[11px] text-accent-600 hover:text-accent-500 font-medium flex items-center gap-1 bg-white/[0.03] hover:bg-white/5 px-3 py-1.5 rounded-xl border border-border-light transition-all"
                          >
                            <Plus className="w-3.5 h-3.5" /> 添加项
                          </button>
                        </div>
                      ) : (
                        <ul className="space-y-3">
                          {section.items.map((item, j) => (
                            <li key={j} className="flex items-start gap-3 text-[13px] text-text-secondary leading-relaxed">
                              <div className="w-1.5 h-1.5 rounded-full bg-accent-400 mt-2 shrink-0" />{item}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}

                  {section.type === 'qa' && section.qa && (
                    <div>
                      {workspaceEditMode ? (
                        <div className="space-y-4">
                          {section.qa.map((item, j) => (
                            <div key={j} className="bg-white/[0.03] rounded-2xl p-4 border border-border-light relative group">
                              <button
                                onClick={() => handleQADelete(i, j)}
                                className="absolute top-3 right-3 p-1.5 rounded-lg text-text-muted hover:text-error hover:bg-error-soft opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                              <div className="space-y-3 pr-8">
                                <div className="flex flex-col gap-1">
                                  <label className="text-[10px] text-text-muted font-medium">问题 Q</label>
                                  <input
                                    type="text"
                                    value={item.q}
                                    onChange={(e) => handleQAChange(i, j, 'q', e.target.value)}
                                    className="w-full bg-bg-primary border border-border-light rounded-xl px-3 py-2 text-[13px] font-medium text-text-main focus:outline-none focus:border-accent-400"
                                  />
                                </div>
                                <div className="flex flex-col gap-1">
                                  <label className="text-[10px] text-text-muted font-medium">答复 A</label>
                                  <textarea
                                    value={item.a}
                                    onChange={(e) => handleQAChange(i, j, 'a', e.target.value)}
                                    rows={3}
                                    className="w-full bg-bg-primary border border-border-light rounded-xl px-3 py-2 text-[13px] text-text-secondary focus:outline-none focus:border-accent-400"
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                          <button
                            onClick={() => handleQAAdd(i)}
                            className="mt-2 text-[11px] text-accent-600 hover:text-accent-500 font-medium flex items-center gap-1 bg-white/[0.03] hover:bg-white/5 px-3 py-1.5 rounded-xl border border-border-light transition-all"
                          >
                            <Plus className="w-3.5 h-3.5" /> 添加问答对
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {section.qa.map((item, j) => (
                            <div key={j} className="bg-white/5 rounded-2xl p-4">
                              <p className="text-[13px] font-medium text-text-main mb-2">Q: {item.q}</p>
                              <p className="text-[13px] text-text-secondary leading-relaxed">A: {item.a}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {section.type === 'quotes' && section.quotes && (
                    <div>
                      {workspaceEditMode ? (
                        <div className="space-y-4">
                          {section.quotes.map((q, j) => (
                            <div key={j} className="bg-white/[0.03] rounded-xl p-4 border border-border-light relative group">
                              <button
                                onClick={() => handleQuoteDelete(i, j)}
                                className="absolute top-3 right-3 p-1.5 rounded-lg text-text-muted hover:text-error hover:bg-error-soft opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                              <div className="space-y-3 pr-8">
                                <div className="flex flex-col gap-1">
                                  <label className="text-[10px] text-text-muted font-medium">用户原话</label>
                                  <textarea
                                    value={q.text}
                                    onChange={(e) => handleQuoteChange(i, j, 'text', e.target.value)}
                                    rows={2}
                                    className="w-full bg-bg-primary border border-border-light rounded-xl px-3 py-2 text-[13px] text-text-secondary italic focus:outline-none focus:border-accent-400"
                                  />
                                </div>
                                <div className="flex flex-col gap-1">
                                  <label className="text-[10px] text-text-muted font-medium">来源渠道/用户</label>
                                  <input
                                    type="text"
                                    value={q.source}
                                    onChange={(e) => handleQuoteChange(i, j, 'source', e.target.value)}
                                    className="w-full bg-bg-primary border border-border-light rounded-xl px-3 py-2 text-[12px] text-text-main focus:outline-none focus:border-accent-400"
                                  />
                                </div>
                              </div>
                            </div>
                          ))}
                          <button
                            onClick={() => handleQuoteAdd(i)}
                            className="mt-2 text-[11px] text-accent-600 hover:text-accent-500 font-medium flex items-center gap-1 bg-white/[0.03] hover:bg-white/5 px-3 py-1.5 rounded-xl border border-border-light transition-all"
                          >
                            <Plus className="w-3.5 h-3.5" /> 添加原话引用
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          {section.quotes.map((q, j) => (
                            <div key={j} className="bg-white/5 rounded-xl p-4">
                              <p className="text-[13px] text-text-secondary leading-relaxed italic">"{q.text}"</p>
                              <p className="text-[11px] text-text-muted mt-1.5">—— {q.source}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {section.type === 'text' && section.body && (
                    <div>
                      {workspaceEditMode ? (
                        <textarea
                          value={section.body}
                          onChange={(e) => handleTextChange(i, e.target.value)}
                          rows={6}
                          className="w-full bg-bg-primary border border-border-light rounded-2xl p-4 text-[13px] text-text-secondary leading-relaxed focus:outline-none focus:border-accent-400"
                        />
                      ) : (
                        <div className="bg-accent-500/[0.05] rounded-2xl p-5">
                          <p className="text-[13px] text-text-secondary leading-relaxed">{section.body}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}

              {submitted && (
                <div className="data-panel p-5">
                  <div className="flex flex-col lg:flex-row lg:items-start gap-4">
                    <div className="w-11 h-11 rounded-xl bg-success-soft flex items-center justify-center shrink-0">
                      <CheckCircle2 className="w-5 h-5 text-success" />
                    </div>
                    <div className="flex-1">
                      <p className="text-[15px] font-medium text-text-main mb-1">已进入报告与资产沉淀链路</p>
                      <p className="text-[12px] text-text-muted leading-relaxed">
                        该分析结果已汇入策略报告。补齐其他岗位后，可在报告页完成验证并发布为下一次项目可学习的 Work Kit。
                      </p>
                      <div className="grid sm:grid-cols-3 gap-2 mt-4">
                        {[
                          ['结果状态', '已提交'],
                          ['资产内容', `${(aiSections || currentResult.sections || []).length} 个区块`],
                          ['下一步', '报告复核'],
                        ].map(([label, value]) => (
                          <div key={label} className="data-metric p-3">
                            <div className="text-[13px] font-medium text-text-main">{value}</div>
                            <div className="text-[10px] text-text-muted mt-1">{label}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 shrink-0 w-full lg:w-auto">
                      <Link to={`/report/${projectSlug}`} className="btn-primary-filled text-[12px] justify-center">
                        <Package className="w-4 h-4" /> 去发布 Work Kit
                      </Link>
                      <Link to={`/tasks/${projectSlug}`} className="btn-primary text-[12px] justify-center">
                        继续其他任务 <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                      <button onClick={handleRetract} className="btn-ghost text-[12px] hover:text-error hover:bg-error-soft">
                        撤回提交
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <aside className="space-y-4 self-start sticky top-6">
          <div className="data-panel p-5">
            <div className="flex items-center justify-between mb-5">
              <span className="section-title">Handoff Tower</span>
              <Package className="w-4 h-4 text-accent-500" />
            </div>
            <div className="space-y-3">
              {assetHandoffItems.map((item) => (
                <div key={item.label} className="rounded-xl border border-border-light bg-bg-primary/60 p-4">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="text-[12px] font-semibold text-text-main">{item.label}</div>
                    <div className="text-[13px] font-medium text-accent-600 shrink-0">{item.value}</div>
                  </div>
                  <p className="text-[10px] text-text-muted leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="action-panel p-5">
            <div className="section-title mb-4">Quality Gate</div>
            <div className="relative h-2 rounded-full bg-bg-primary overflow-hidden mb-4">
              <div className="absolute inset-y-0 left-0 rounded-full bg-accent-500" style={{ width: `${qualityScore}%` }} />
            </div>
            <div className="flex items-end justify-between mb-4">
              <div>
                <div className="text-[30px] font-light text-text-main leading-none">{qualityScore}%</div>
                <div className="text-[10px] text-text-muted mt-1">综合可交付度</div>
              </div>
              <div className={`text-[10px] px-2 py-1 rounded-md ${qualityScore >= 84 ? 'bg-success-soft text-success' : 'bg-warning-soft text-warning'}`}>
                {qualityScore >= 84 ? '可提交' : '需复核'}
              </div>
            </div>
            <div className="grid gap-2">
              {[
                ['输入完整性', inputMats.length > 0],
                ['知识引用', adoptedRecommendations.length > 0],
                ['结果生成', showResult],
                ['异常闭环', feedbackItems.length === 0],
              ].map(([label, passed]) => (
                <div key={String(label)} className="flex items-center justify-between text-[11px]">
                  <span className="text-text-secondary">{label}</span>
                  <span className={passed ? 'text-success' : 'text-text-muted'}>{passed ? '通过' : '待处理'}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="data-panel p-5">
            <div className="section-title mb-4">Next Move</div>
            {submitted ? (
              <div className="space-y-3">
                <Link to={`/report/${projectSlug}`} className="btn-primary-filled w-full justify-center">
                  <Package className="w-4 h-4" /> 去报告页发布
                </Link>
                <Link to={`/tasks/${projectSlug}`} className="btn-primary w-full justify-center">
                  继续其他任务 <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            ) : showResult ? (
              <div className="space-y-3">
                <button onClick={handleSubmit} className="btn-primary-filled w-full justify-center">
                  <ThumbsUp className="w-4 h-4" /> 提交到报告
                </button>
                <button onClick={() => setShowFeedbackModal(true)} className="btn-primary w-full justify-center">
                  <Flag className="w-4 h-4" /> 标记异常
                </button>
              </div>
            ) : (
              <button onClick={handleGenerate} disabled={generating} className="btn-primary-filled w-full justify-center disabled:opacity-60">
                <Sparkles className="w-4 h-4" /> {generating ? '生成中' : '启动分析'}
              </button>
            )}
          </div>
        </aside>
      </div>

      {/* Feedback modal */}
      {showFeedbackModal && (
        <div className="modal-backdrop">
          <div className="modal-panel p-6 w-[420px]">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-[16px] font-medium text-text-main">标记异常</h3>
              <button onClick={() => { setShowFeedbackModal(false); setFeedbackText('') }} className="p-1"><X className="w-4 h-4 text-text-muted" /></button>
            </div>
            <textarea value={feedbackText} onChange={(e) => setFeedbackText(e.target.value)} rows={4} placeholder="描述 AI 结果中需人工复核的内容..." className="form-control px-4 py-3 text-[13px] resize-none mb-4" autoFocus />
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
