import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  CheckCircle2,
  ArrowRight,
  Package,
  Circle,
  Star,
  ShieldCheck,
  TrendingUp,
  Database,
  FileSearch,
  Sparkles,
  GitBranch,
  ClipboardCheck,
  Archive,
  AlertTriangle,
  Layers3,
  Users,
  Gauge,
  Edit3,
  Save,
  Plus,
  Trash2,
  RotateCcw,
  BookOpen,
} from 'lucide-react'
import { roleLabels, reportSummaries, reportNextSteps } from '../data/mock'
import { getProjectBySlug, getTasks, getAIResult, getWorkKits, getMaterials, upsertWorkKitFromProject, saveAIResult, updateProject } from '../services/db'
import type { Material, WorkKit, AISection } from '../types'
import { useToast } from '../components/Toast'

const materialTypeLabels: Record<string, string> = {
  review: '竞品评论',
  spec: '商品参数',
  faq: '客服记录',
  copy_asset: '历史文案',
}

interface ReportDraft {
  summaries: string[]
  nextSteps: string[]
  verification: {
    keep: string
    track: string
    roles: string
    notes: string
  }
}

function getDefaultReportDraft(baseSummaries: string[], baseNextSteps: string[], fallbackKeep: string, fallbackTrack: string): ReportDraft {
  return {
    summaries: baseSummaries,
    nextSteps: baseNextSteps,
    verification: {
      keep: fallbackKeep,
      track: fallbackTrack,
      roles: '运营负责人 + 商品负责人 + 客服质检共同确认保留/修订',
      notes: '验证通过后，将保留项写入团队知识库；修订项进入下一轮任务卡。',
    },
  }
}

function readReportDraft(projectId: string, fallback: ReportDraft): ReportDraft {
  try {
    const raw = localStorage.getItem(`promokit_report_draft_${projectId}`)
    return raw ? { ...fallback, ...JSON.parse(raw) } : fallback
  } catch {
    return fallback
  }
}

function readAssetHandoffs(): any[] {
  try {
    return JSON.parse(localStorage.getItem('promokit_asset_handoffs') || '[]')
  } catch {
    return []
  }
}

function CheckItem({ text, id, onToggle }: { text: string; id: string; onToggle?: () => void }) {
  const key = `checklist_${id}`
  const [done, setDone] = useState(() => localStorage.getItem(key) === '1')
  const toggle = () => {
    const v = !done
    setDone(v)
    localStorage.setItem(key, v ? '1' : '0')
    onToggle?.()
  }
  return (
    <button onClick={toggle} className="group flex items-start gap-3 text-left w-full rounded-2xl border border-border-light bg-bg-surface/70 p-4 hover:border-accent-500/25 transition-colors">
      {done ? <CheckCircle2 className="w-4 h-4 text-success shrink-0 mt-0.5" /> : <Circle className="w-4 h-4 text-text-muted shrink-0 mt-0.5 group-hover:text-accent-500" />}
      <span className={`text-[13px] leading-relaxed ${done ? 'line-through text-text-muted' : 'text-text-secondary group-hover:text-text-main'}`}>{text}</span>
    </button>
  )
}

function WorkflowNode({ icon: Icon, label, value, tone = 'accent' }: { icon: typeof Database; label: string; value: string; tone?: 'accent' | 'ai' | 'success' | 'kit' }) {
  const toneClass = {
    accent: 'bg-accent-500/12 text-accent-600 border-accent-500/20',
    ai: 'bg-ai-400/10 text-ai-400 border-ai-400/20',
    success: 'bg-success-soft text-success border-success/20',
    kit: 'bg-kit-50 text-kit-600 border-kit-600/20',
  }[tone]
  return (
    <div className={`rounded-2xl border p-4 ${toneClass}`}>
      <Icon className="w-4 h-4 mb-4" />
      <div className="text-[20px] font-light leading-none mb-1 text-text-main">{value}</div>
      <div className="text-[11px] text-text-muted">{label}</div>
    </div>
  )
}

function MaterialCard({ material }: { material: Material }) {
  const issueText = material.topIssues?.slice(0, 2).join(' / ') || material.content
  return (
    <div className="rounded-2xl border border-border-light bg-bg-surface p-4">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <div className="text-[13px] font-medium text-text-main mb-1">{material.label}</div>
          <div className="text-[10px] text-text-muted">{material.fileName || material.uploadedAt}</div>
        </div>
        <span className="tag bg-accent-500/10 text-accent-600 shrink-0">{materialTypeLabels[material.type]}</span>
      </div>
      <p className="text-[12px] text-text-secondary leading-relaxed line-clamp-2">{issueText}</p>
      <div className="mt-4 flex items-center justify-between text-[11px] text-text-muted">
        <span>{material.reviewCount ? `${material.reviewCount} 条样本` : '结构化资料'}</span>
        <span className={material.sensitivity === 'normal' ? 'text-success' : 'text-warning'}>
          {material.sensitivity === 'normal' ? '可直接引用' : material.sensitivity === 'sensitive' ? '需脱敏' : '需复核'}
        </span>
      </div>
    </div>
  )
}

export default function Report() {
  const { projectSlug } = useParams<{ projectSlug: string }>()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const project = getProjectBySlug(projectSlug!)
  const tasks = project ? getTasks(project.id) : []
  const materials = project ? getMaterials(project.id) : []
  const baseSummaries = project ? (reportSummaries[project.id] || reportSummaries['p1']) : []
  const baseNextSteps = project ? (reportNextSteps[project.id] || reportNextSteps['p1']) : []
  const defaultKeep = project ? getWorkKits().find((k) => k.basedOnProjectId === project.id)?.name || '等待首次 Work Kit 沉淀' : ''
  const defaultTrack = project ? project.competitors.map((item) => `${item.brand}${item.topIssues[0] ? ` · ${item.topIssues[0]}` : ''}`).slice(0, 3).join(' / ') || '暂无竞品' : ''
  const [activeTab, setActiveTab] = useState(tasks[0]?.role ?? 'merchandise')
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [saved, setSaved] = useState(false)
  const [savedMode, setSavedMode] = useState<'created' | 'updated'>('created')
  const [savedKit, setSavedKit] = useState<WorkKit | null>(null)
  const [markAsSuccess, setMarkAsSuccess] = useState(true)
  const [executionRefresh, setExecutionRefresh] = useState(0)
  const [editMode, setEditMode] = useState(false)
  const [draft, setDraft] = useState(() => {
    const fallback = getDefaultReportDraft(baseSummaries, baseNextSteps, defaultKeep, defaultTrack)
    return readReportDraft(project?.id || 'unknown', fallback)
  })

  const handleUpdateReportResultSection = (taskId: string, sectionIndex: number, updatedFields: Partial<AISection>) => {
    const result = getAIResult(taskId)
    if (!result) return
    const nextSections = (result.sections || []).map((sec, idx) => {
      if (idx === sectionIndex) {
        return { ...sec, ...updatedFields }
      }
      return sec
    })
    const nextResult = { ...result, sections: nextSections }
    saveAIResult(nextResult)
    setExecutionRefresh((v) => v + 1)
  }

  const handleReportMatrixCellChange = (taskId: string, secIdx: number, rowIdx: number, colIdx: number, value: string) => {
    const result = getAIResult(taskId)
    if (!result) return
    const sec = result.sections[secIdx]
    const nextRows = (sec.rows || []).map((row, rIdx) => {
      if (rIdx === rowIdx) {
        return row.map((cell, cIdx) => (cIdx === colIdx ? value : cell))
      }
      return row
    })
    handleUpdateReportResultSection(taskId, secIdx, { rows: nextRows })
  }

  const handleReportMatrixHeaderChange = (taskId: string, secIdx: number, colIdx: number, value: string) => {
    const result = getAIResult(taskId)
    if (!result) return
    const sec = result.sections[secIdx]
    const nextHeaders = (sec.headers || []).map((h, cIdx) => (cIdx === colIdx ? value : h))
    handleUpdateReportResultSection(taskId, secIdx, { headers: nextHeaders })
  }

  const handleReportMatrixAddRow = (taskId: string, secIdx: number) => {
    const result = getAIResult(taskId)
    if (!result) return
    const sec = result.sections[secIdx]
    const colCount = sec.headers?.length || 3
    const newRow = Array(colCount).fill('新增内容')
    const nextRows = [...(sec.rows || []), newRow]
    handleUpdateReportResultSection(taskId, secIdx, { rows: nextRows })
  }

  const handleReportMatrixDeleteRow = (taskId: string, secIdx: number, rowIdx: number) => {
    const result = getAIResult(taskId)
    if (!result) return
    const sec = result.sections[secIdx]
    const nextRows = (sec.rows || []).filter((_, rIdx) => rIdx !== rowIdx)
    handleUpdateReportResultSection(taskId, secIdx, { rows: nextRows })
  }

  const handleReportListItemChange = (taskId: string, secIdx: number, itemIdx: number, value: string) => {
    const result = getAIResult(taskId)
    if (!result) return
    const sec = result.sections[secIdx]
    const nextItems = (sec.items || []).map((item, idx) => (idx === itemIdx ? value : item))
    handleUpdateReportResultSection(taskId, secIdx, { items: nextItems })
  }

  const handleReportListAddItem = (taskId: string, secIdx: number) => {
    const result = getAIResult(taskId)
    if (!result) return
    const sec = result.sections[secIdx]
    const nextItems = [...(sec.items || []), '新增项目要点...']
    handleUpdateReportResultSection(taskId, secIdx, { items: nextItems })
  }

  const handleReportListDeleteItem = (taskId: string, secIdx: number, itemIdx: number) => {
    const result = getAIResult(taskId)
    if (!result) return
    const sec = result.sections[secIdx]
    const nextItems = (sec.items || []).filter((_, idx) => idx !== itemIdx)
    handleUpdateReportResultSection(taskId, secIdx, { items: nextItems })
  }

  const handleReportQAChange = (taskId: string, secIdx: number, itemIdx: number, field: 'q' | 'a', value: string) => {
    const result = getAIResult(taskId)
    if (!result) return
    const sec = result.sections[secIdx]
    const nextQA = (sec.qa || []).map((item, idx) => {
      if (idx === itemIdx) {
        return { ...item, [field]: value }
      }
      return item
    })
    handleUpdateReportResultSection(taskId, secIdx, { qa: nextQA })
  }

  const handleReportQAAdd = (taskId: string, secIdx: number) => {
    const result = getAIResult(taskId)
    if (!result) return
    const sec = result.sections[secIdx]
    const nextQA = [...(sec.qa || []), { q: '新增问题？', a: '新增答复内容...' }]
    handleUpdateReportResultSection(taskId, secIdx, { qa: nextQA })
  }

  const handleReportQADelete = (taskId: string, secIdx: number, itemIdx: number) => {
    const result = getAIResult(taskId)
    if (!result) return
    const sec = result.sections[secIdx]
    const nextQA = (sec.qa || []).filter((_, idx) => idx !== itemIdx)
    handleUpdateReportResultSection(taskId, secIdx, { qa: nextQA })
  }

  const handleReportQuoteChange = (taskId: string, secIdx: number, itemIdx: number, field: 'text' | 'source', value: string) => {
    const result = getAIResult(taskId)
    if (!result) return
    const sec = result.sections[secIdx]
    const nextQuotes = (sec.quotes || []).map((item, idx) => {
      if (idx === itemIdx) {
        return { ...item, [field]: value }
      }
      return item
    })
    handleUpdateReportResultSection(taskId, secIdx, { quotes: nextQuotes })
  }

  const handleReportQuoteAdd = (taskId: string, secIdx: number) => {
    const result = getAIResult(taskId)
    if (!result) return
    const sec = result.sections[secIdx]
    const nextQuotes = [...(sec.quotes || []), { text: '新原话摘录内容', source: '渠道来源' }]
    handleUpdateReportResultSection(taskId, secIdx, { quotes: nextQuotes })
  }

  const handleReportQuoteDelete = (taskId: string, secIdx: number, itemIdx: number) => {
    const result = getAIResult(taskId)
    if (!result) return
    const sec = result.sections[secIdx]
    const nextQuotes = (sec.quotes || []).filter((_, idx) => idx !== itemIdx)
    handleUpdateReportResultSection(taskId, secIdx, { quotes: nextQuotes })
  }

  const handleReportTextChange = (taskId: string, secIdx: number, value: string) => {
    handleUpdateReportResultSection(taskId, secIdx, { body: value })
  }

  if (!project) return <div className="text-text-muted text-sm p-8">项目不存在</div>

  const roleOrder = ['operations', 'merchandise', 'copywriting', 'customer_service', 'design']
  const roleTabs = [...new Set(tasks.map((t) => t.role))].sort((a, b) => roleOrder.indexOf(a) - roleOrder.indexOf(b))
  const submittedCount = tasks.filter((t) => getAIResult(t.id)?.submitted).length
  const existingKit = getWorkKits().find((k) => k.basedOnProjectId === project.id)
  const nextVersionLabel = existingKit ? '自动升级版本' : 'v1.0'
  const submittedTasks = tasks.filter((t) => getAIResult(t.id)?.submitted)
  const projectHandoffs = readAssetHandoffs().filter((handoff) => handoff.projectId === project.id)
  const handoffTaskIds = new Set(projectHandoffs.map((handoff) => handoff.taskId))
  const handoffSectionCount = projectHandoffs.reduce((sum, handoff) => sum + (handoff.sectionCount ?? 0), 0)
  const handoffKnowledgeCount = projectHandoffs.reduce((sum, handoff) => sum + ((handoff.adoptedKnowledge || []).length), 0)
  const handoffFeedbackCount = projectHandoffs.reduce((sum, handoff) => sum + ((handoff.feedbackItems || []).length), 0)
  const completionReady = tasks.length > 0 && submittedCount === tasks.length
  const coverageReady = roleTabs.length >= 3
  const successRating = markAsSuccess && submittedCount > 0 ? 4.8 : submittedCount > 0 ? 4.3 : 0
  const nextSteps = draft.nextSteps
  const completedNextSteps = nextSteps.filter((_, i) => {
    executionRefresh
    return localStorage.getItem(`checklist_${project.id}-${i}`) === '1'
  }).length
  const totalReviewSamples = materials.reduce((sum, item) => sum + (item.reviewCount || 0), 0)
  const referencedMaterialIds = new Set(tasks.flatMap((task) => task.inputMaterials))
  const referencedMaterials = materials.filter((item) => referencedMaterialIds.has(item.id))
  const referencedMaterialTypeLabels = [...new Set(referencedMaterials.map((item) => materialTypeLabels[item.type] || item.label))]
  const sensitiveCount = materials.filter((item) => item.sensitivity !== 'normal').length
  const generatedCount = tasks.filter((task) => Boolean(getAIResult(task.id)?.generatedAt)).length
  const sourceTagCount = new Set(tasks.flatMap((task) => task.sourceTags)).size
  const latestGeneratedAt = submittedTasks
    .map((task) => getAIResult(task.id)?.generatedAt)
    .filter(Boolean)
    .sort()
    .at(-1) || '待生成'
  const relatedKits = getWorkKits()
    .filter((kit) => kit.basedOnProjectId !== project.id)
    .filter((kit) => kit.tags.some((tag) => [project.category, project.campaign, '成功案例'].filter(Boolean).includes(tag)))
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 3)
  const readinessItems = [
    {
      label: '岗位结果',
      value: `${submittedCount}/${tasks.length}`,
      ready: completionReady,
      desc: completionReady ? '全部岗位结果已提交，可完整沉淀' : '仍有岗位结果未提交，建议补齐后再发布',
    },
    {
      label: '资料证据',
      value: `${referencedMaterials.length}/${materials.length}`,
      ready: referencedMaterials.length > 0 && referencedMaterials.length >= Math.min(materials.length, 3),
      desc: '沉淀资料结构、引用来源和后续复用入口',
    },
    {
      label: '验证准入',
      value: sensitiveCount <= 1 ? '可发布' : '需复核',
      ready: sensitiveCount <= 1,
      desc: sensitiveCount <= 1 ? '资料风险可控，可进入知识库' : '存在需脱敏或需复核资料',
    },
    {
      label: '执行动作',
      value: `${completedNextSteps}/${nextSteps.length}`,
      ready: completedNextSteps > 0,
      desc: completedNextSteps > 0 ? '已有执行反馈，可辅助判断复用价值' : '尚未勾选执行动作，可先作为观察模板',
    },
    {
      label: '资产交接',
      value: `${projectHandoffs.length}/${submittedTasks.length || tasks.length}`,
      ready: projectHandoffs.length > 0 && submittedTasks.every((task) => handoffTaskIds.has(task.id)),
      desc: projectHandoffs.length ? '工作台交接证据已进入报告链路' : '建议从工作台提交结果，保留来源证据',
    },
  ]
  const readinessScore = Math.round((readinessItems.filter((item) => item.ready).length / readinessItems.length) * 100)
  const reusableAssets = [
    { title: '岗位 Prompt 模板', desc: `${roleTabs.length} 个角色的输入、输出格式与判断标准` },
    { title: '资料结构规则', desc: `${referencedMaterials.length} 份资料与 ${sourceTagCount} 类来源标签` },
    { title: '验证结论', desc: '保留项、追踪项与人工验证角色' },
    { title: '资产交接证据', desc: `${projectHandoffs.length} 条交接、${handoffKnowledgeCount} 个知识依据、${handoffFeedbackCount} 条复核标记` },
    { title: '执行清单', desc: `${nextSteps.length} 条可复用的大促推进动作` },
  ]
  const launchLearningPreview = [
    {
      label: '先学资料结构',
      value: `${referencedMaterials.length || materials.length} 份资料`,
      desc: referencedMaterials.length
        ? `下次项目会优先提示复用 ${referencedMaterialTypeLabels.slice(0, 3).join('、')} 的字段结构。`
        : '保存后会沉淀当前项目的资料类型，作为新项目上传清单。',
    },
    {
      label: '再学岗位方法',
      value: `${submittedTasks.length} 个结果`,
      desc: submittedTasks[0]
        ? `以「${submittedTasks[0].title}」等已提交结果作为任务卡学习样本。`
        : '补齐岗位结果后，任务卡会带出可继承的 Prompt、输出格式和验收标准。',
    },
    {
      label: '最后学验证决策',
      value: projectHandoffs.length ? `${projectHandoffs.length} 条交接` : '待交接',
      desc: projectHandoffs.length
        ? `交接证据会告诉下次项目哪些知识依据可沿用，哪些需要重新复核。`
        : '建议先从工作台提交资产化交接，避免 Work Kit 只有结论没有来源。',
    },
  ]
  const publishReceiptItems = [
    { label: '启动学习包', value: `${launchLearningPreview.length} 项`, desc: '新项目复用前先学习资料、岗位方法和验证决策' },
    { label: '资产内容', value: `${reusableAssets.length} 类`, desc: 'Prompt、资料规则、验证结论、交接证据和执行清单' },
    { label: '版本记录', value: savedKit?.version || nextVersionLabel, desc: savedMode === 'updated' ? '已写入原 Work Kit 版本历史' : '已创建首个可复用版本' },
  ]
  const saveDraft = () => {
    localStorage.setItem(`promokit_report_draft_${project.id}`, JSON.stringify(draft))
    setEditMode(false)
    showToast('报告编辑内容已保存', 'success')
  }
  const resetDraft = () => {
    const fallback = getDefaultReportDraft(baseSummaries, baseNextSteps, existingKit?.name || '等待首次 Work Kit 沉淀', defaultTrack)
    setDraft(fallback)
    localStorage.removeItem(`promokit_report_draft_${project.id}`)
    setExecutionRefresh((v) => v + 1)
    showToast('已恢复为系统生成版本', 'success')
  }
  const closureSteps = [
    { icon: Database, label: '资料接入', status: `${referencedMaterials.length}/${materials.length}`, desc: '评论、参数、客服和历史文案统一结构化' },
    { icon: Sparkles, label: 'AI 分析', status: `${generatedCount}/${tasks.length}`, desc: '按岗位 Prompt 生成可审核结果' },
    { icon: ShieldCheck, label: '验证准入', status: coverageReady ? '通过' : '待补充', desc: '检查岗位覆盖、输出完整性与竞品对标' },
    { icon: ClipboardCheck, label: '执行落地', status: `${completedNextSteps}/${nextSteps.length}`, desc: '把报告动作转成团队待办进度' },
    { icon: Archive, label: '资产回流', status: existingKit ? existingKit.version : '待沉淀', desc: '成功案例进入知识库供下次学习' },
  ]

  return (
    <div className="max-w-6xl">
      {/* Header */}
      <div className="mb-10">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-[6px] h-[6px] rounded-full bg-accent-500 pulse-dot" />
            <span className="section-title">{project.campaign} · {project.category}</span>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-text-muted">
            <Gauge className="w-3.5 h-3.5 text-ai-400" />
            <span>最后生成：{latestGeneratedAt}</span>
          </div>
        </div>
        <div className="grid lg:grid-cols-[1.2fr_0.8fr] gap-6 items-stretch">
          <div className="data-panel p-6">
            <div>
              <div className="inline-flex items-center gap-2 rounded-lg border border-border-default bg-bg-primary px-3 py-1 text-[11px] text-text-muted mb-4">
                <GitBranch className="w-3.5 h-3.5" />
                策略报告
              </div>
              <h1 className="text-[30px] font-medium tracking-[-0.02em] text-text-main mb-3">大促策略报告</h1>
              <p className="text-[15px] text-text-secondary max-w-2xl leading-relaxed mb-6">
                {project.name} 已完成 {submittedCount}/{tasks.length} 个岗位分析，系统将资料引用、AI 输出、验证准入、执行进度和 Work Kit 沉淀串成一条可追踪链路。
              </p>
              <div className="flex flex-wrap items-center gap-3">
                <button onClick={() => setShowSaveDialog(true)} className="btn-primary-filled">
                  <Package className="w-4 h-4" /> 沉淀为复用工作包
                </button>
                {editMode ? (
                  <>
                    <button onClick={saveDraft} className="btn-primary">
                      <Save className="w-4 h-4" /> 保存编辑
                    </button>
                    <button onClick={() => setEditMode(false)} className="btn-ghost">退出编辑</button>
                  </>
                ) : (
                  <button onClick={() => setEditMode(true)} className="btn-primary">
                    <Edit3 className="w-4 h-4" /> 编辑报告
                  </button>
                )}
                <Link to={`/tasks/${projectSlug}`} className="btn-ghost">返回任务卡</Link>
                <Link to={`/workspace/${projectSlug}/${tasks[0]?.id || ''}`} className="btn-ghost">进入 AI 工作台 <ArrowRight className="w-3.5 h-3.5" /></Link>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <WorkflowNode icon={Database} label="资料源" value={`${materials.length} 份`} tone="accent" />
            <WorkflowNode icon={Users} label="协作岗位" value={`${roleTabs.length} 岗`} tone="kit" />
            <WorkflowNode icon={Sparkles} label="AI 输出" value={`${submittedCount}/${tasks.length}`} tone="ai" />
            <WorkflowNode icon={ClipboardCheck} label="待办完成" value={`${completedNextSteps}/${nextSteps.length}`} tone="success" />
          </div>
        </div>
      </div>

      {/* Assetization publisher */}
      <div className="mb-10 brand-goal-panel p-5">
        <div className="relative grid lg:grid-cols-[0.9fr_1.1fr] gap-6">
          <div className="flex flex-col justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="brand-goal-mark" />
                <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-accent-600">Asset Publisher</span>
              </div>
              <h2 className="text-[24px] font-light tracking-[-0.02em] text-text-main mt-3 mb-3">发布前资产化检查</h2>
              <p className="text-[13px] text-text-secondary leading-relaxed">
                保存 Work Kit 之前，先确认本次分析是否已经具备可学习、可复用、可验证的条件。达标越高，下一个项目启动时越能直接继承本次经验。
              </p>
            </div>
            <div className="rounded-xl border border-border-light bg-bg-surface/75 p-5">
              <div className="flex items-end justify-between gap-4 mb-4">
                <div>
                  <div className="text-[42px] font-light leading-none text-text-main">{readinessScore}%</div>
                  <div className="text-[11px] text-text-muted mt-1">资产发布就绪度</div>
                </div>
                <span className={`tag ${readinessScore >= 75 ? 'bg-success-soft text-success' : 'bg-warning-soft text-warning'}`}>
                  {readinessScore >= 75 ? '建议发布' : '建议补齐'}
                </span>
              </div>
              <div className="h-2 rounded-full bg-bg-primary overflow-hidden">
                <div className="h-full rounded-full bg-accent-500 transition-all" style={{ width: `${readinessScore}%` }} />
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-3">
            {readinessItems.map((item) => (
              <div key={item.label} className={`rounded-xl border p-4 ${item.ready ? 'border-success/20 bg-success-soft' : 'border-border-light bg-bg-surface/75'}`}>
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="text-[13px] font-medium text-text-main">{item.label}</div>
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${item.ready ? 'bg-success text-white' : 'bg-bg-surface text-text-muted'}`}>
                    {item.ready ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                  </div>
                </div>
                <div className="text-[22px] font-light text-text-main leading-none mb-2">{item.value}</div>
                <p className="text-[11px] text-text-muted leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative mt-5 pt-5 border-t border-border-light">
          <div className="flex items-center justify-between gap-4 mb-3">
            <div className="text-[13px] font-medium text-text-main">保存后将沉淀的资产</div>
            <button onClick={() => setShowSaveDialog(true)} className="btn-primary">
              <Package className="w-4 h-4" /> 发布 Work Kit
            </button>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {reusableAssets.map((asset) => (
              <div key={asset.title} className="data-metric p-4">
                <div className="text-[12px] font-medium text-text-main mb-1">{asset.title}</div>
                <p className="text-[11px] text-text-muted leading-relaxed">{asset.desc}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 rounded-xl border border-border-light bg-bg-primary/45 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-2">
                <ClipboardCheck className="w-4 h-4 text-accent-500" />
                <div>
                  <div className="text-[12px] font-medium text-text-main">资产交接证据</div>
                  <div className="text-[10px] text-text-muted mt-0.5">来自 AI 工作台的提交记录，用于证明结果区块、知识依据和复核标记可追溯。</div>
                </div>
              </div>
              <span className="tag bg-accent-500/10 text-accent-600">{projectHandoffs.length} 条交接 · {handoffSectionCount} 个区块</span>
            </div>
            {projectHandoffs.length > 0 ? (
              <div className="grid md:grid-cols-2 gap-3">
                {projectHandoffs.slice(0, 4).map((handoff) => (
                  <div key={handoff.id} className="rounded-lg border border-border-light bg-bg-surface p-4">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="min-w-0">
                        <div className="text-[13px] font-medium text-text-main truncate">{handoff.taskTitle}</div>
                        <div className="text-[10px] text-text-muted mt-1">{handoff.roleLabel} · {new Date(handoff.createdAt).toLocaleDateString()}</div>
                      </div>
                      <span className="tag bg-success-soft text-success shrink-0">已接收</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mb-3">
                      {[
                        ['区块', `${handoff.sectionCount ?? 0}`],
                        ['知识', `${(handoff.adoptedKnowledge || []).length}`],
                        ['复核', `${(handoff.feedbackItems || []).length}`],
                      ].map(([label, value]) => (
                        <div key={label} className="rounded-lg border border-border-light bg-bg-primary/70 p-2">
                          <div className="text-[13px] font-medium text-text-main leading-none">{value}</div>
                          <div className="text-[9px] text-text-muted mt-1">{label}</div>
                        </div>
                      ))}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {(handoff.adoptedKnowledge || []).slice(0, 3).map((item: any) => (
                        <span key={item.id} className="text-[10px] px-2 py-1 rounded-md bg-bg-primary border border-border-light text-text-muted">
                          {item.title}
                        </span>
                      ))}
                      {(handoff.adoptedKnowledge || []).length === 0 && (
                        <span className="text-[10px] text-text-muted">暂无知识依据记录</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[11px] text-text-muted leading-relaxed">
                还没有接收到工作台交接记录。建议回到 AI 工作台提交分析结果，系统会自动记录区块、知识依据、来源资料和复核标记。
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="mb-10 grid grid-cols-[310px_1fr] gap-5 items-start">
        <aside className="action-panel p-4 sticky top-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="brand-goal-mark" />
            <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-accent-600">Strategy Console</span>
          </div>
          <h2 className="text-[18px] font-medium text-text-main mb-2">策略发布控制台</h2>
          <p className="text-[12px] text-text-muted leading-relaxed mb-4">
            从岗位结果、资料证据、执行清单到 Work Kit 发布，统一检查本次报告是否具备沉淀条件。
          </p>
          <div className="data-metric p-4 mb-4">
            <div className="flex items-end justify-between gap-3 mb-3">
              <div>
                <div className="text-[34px] font-light leading-none text-text-main">{readinessScore}%</div>
                <div className="text-[10px] text-text-muted mt-1">发布就绪度</div>
              </div>
              <span className={`tag ${readinessScore >= 75 ? 'bg-success-soft text-success' : 'bg-warning-soft text-warning'}`}>
                {readinessScore >= 75 ? '可发布' : '待补齐'}
              </span>
            </div>
            <div className="h-1.5 rounded-full bg-bg-surface overflow-hidden">
              <div className="h-full rounded-full bg-accent-500" style={{ width: `${readinessScore}%` }} />
            </div>
          </div>
          <div className="space-y-2">
            {closureSteps.map((step) => (
              <div key={step.label} className="rounded-lg border border-border-light bg-bg-primary/55 p-3">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-[11px] font-medium text-text-main">{step.label}</span>
                  <span className="font-mono text-[10px] text-accent-600">{step.status}</span>
                </div>
                <div className="text-[10px] text-text-muted truncate">{step.desc}</div>
              </div>
            ))}
          </div>
        </aside>

        <div className="space-y-4">
          <div className="data-panel overflow-hidden">
            <div className="px-5 py-4 border-b border-border-light flex items-center justify-between">
              <div>
                <span className="section-title">Report Workbench</span>
                <h2 className="text-[20px] font-medium text-text-main mt-1">报告作业区</h2>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => setEditMode(true)} className="btn-ghost text-[12px]">
                  <Edit3 className="w-3.5 h-3.5" /> 编辑报告
                </button>
                <button onClick={() => setShowSaveDialog(true)} className="btn-primary-filled text-[12px]">
                  <Package className="w-3.5 h-3.5" /> 发布 Work Kit
                </button>
              </div>
            </div>
            <div className="grid grid-cols-[1fr_130px_130px_150px] px-5 py-3 border-b border-border-light bg-bg-primary/55 text-[10px] font-semibold uppercase tracking-[0.08em] text-text-muted">
              <div>作业项</div>
              <div>状态</div>
              <div>证据</div>
              <div className="text-right">下一步</div>
            </div>
            {[
              ['岗位结果', `${submittedCount}/${tasks.length}`, `${generatedCount} 个 AI 输出`, submittedCount === tasks.length ? '复核报告' : '补齐岗位'],
              ['资料证据', `${referencedMaterials.length}/${materials.length}`, `${sensitiveCount} 个风险`, sensitiveCount ? '处理复核' : '可引用'],
              ['执行清单', `${completedNextSteps}/${nextSteps.length}`, '团队待办进度', completedNextSteps === nextSteps.length ? '进入发布' : '更新动作'],
              ['资产沉淀', existingKit ? existingKit.version : '待发布', `${reusableAssets.length} 类资产`, '发布 Work Kit'],
            ].map(([label, status, evidence, next]) => (
              <div key={label} className="grid grid-cols-[1fr_130px_130px_150px] px-5 py-4 border-b border-border-light last:border-b-0 items-center hover:bg-bg-primary/45 transition-colors">
                <div className="text-[13px] font-medium text-text-main">{label}</div>
                <div className="text-[12px] text-text-secondary">{status}</div>
                <div className="text-[11px] text-text-muted">{evidence}</div>
                <div className="text-right">
                  <span className="text-[11px] font-medium text-accent-600">{next}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-4 gap-3">
            {reusableAssets.map((asset) => (
              <div key={asset.title} className="data-metric p-4">
                <div className="text-[12px] font-medium text-text-main mb-1">{asset.title}</div>
                <p className="text-[10px] text-text-muted leading-relaxed">{asset.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Closure map */}
      <div className="mb-10 data-panel p-5">
        <div className="flex items-center justify-between gap-4 mb-5">
          <div>
            <span className="section-title">Closed Loop</span>
            <h2 className="text-[18px] font-medium text-text-main mt-2">本次大促分析的实际使用链路</h2>
          </div>
          <span className="tag bg-success-soft text-success">{completionReady && completedNextSteps === nextSteps.length ? '已完成闭环' : '进行中'}</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3">
          {closureSteps.map((step, index) => (
            <div key={step.label} className="relative data-metric p-4 min-h-[148px]">
              {index < closureSteps.length - 1 && <div className="hidden xl:block absolute top-8 right-[-18px] w-8 h-px bg-border-default" />}
              <div className="w-9 h-9 rounded-xl bg-accent-500/10 text-accent-600 flex items-center justify-center mb-4">
                <step.icon className="w-4 h-4" />
              </div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="text-[13px] font-medium text-text-main">{step.label}</div>
                <div className="font-mono text-[11px] text-accent-600">{step.status}</div>
              </div>
              <p className="text-[11px] text-text-muted leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Evidence and usage */}
      <div className="grid lg:grid-cols-[0.95fr_1.05fr] gap-6 mb-12">
        <section className="data-panel p-5">
          <div className="flex items-start justify-between gap-4 mb-5">
            <div>
              <span className="section-title">Input Evidence</span>
              <h2 className="text-[18px] font-medium text-text-main mt-2">系统已读取并引用的业务资料</h2>
            </div>
            <div className="text-right">
              <div className="text-[24px] font-light text-text-main leading-none">{totalReviewSamples || materials.length}</div>
              <div className="text-[10px] text-text-muted mt-1">{totalReviewSamples ? '评论样本' : '资料条目'}</div>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-3 mb-4">
            <div className="rounded-2xl bg-bg-primary/60 border border-border-light p-4">
              <FileSearch className="w-4 h-4 text-accent-600 mb-3" />
              <div className="text-[18px] font-light text-text-main">{referencedMaterials.length}/{materials.length}</div>
              <div className="text-[11px] text-text-muted mt-1">被任务引用资料</div>
            </div>
            <div className="rounded-2xl bg-bg-primary/60 border border-border-light p-4">
              <AlertTriangle className={`w-4 h-4 mb-3 ${sensitiveCount > 0 ? 'text-warning' : 'text-success'}`} />
              <div className="text-[18px] font-light text-text-main">{sensitiveCount}</div>
              <div className="text-[11px] text-text-muted mt-1">需复核/脱敏资料</div>
            </div>
          </div>
          <div className="space-y-3">
            {referencedMaterials.slice(0, 4).map((material) => <MaterialCard key={material.id} material={material} />)}
          </div>
        </section>

        <section className="data-panel p-5">
          <div className="flex items-start justify-between gap-4 mb-5">
            <div>
              <span className="section-title">AI Workflow</span>
              <h2 className="text-[18px] font-medium text-text-main mt-2">岗位任务如何被 AI 处理</h2>
            </div>
            <span className="tag bg-ai-400/10 text-ai-400">{sourceTagCount} 类来源标签</span>
          </div>
          <div className="space-y-3">
            {tasks.map((task) => {
              const result = getAIResult(task.id)
              const linkedMaterials = materials.filter((m) => task.inputMaterials.includes(m.id))
              const statusTone = result?.submitted
                ? 'bg-success-soft text-success'
                : result ? 'bg-ai-400/10 text-ai-400' : 'bg-warning-soft text-warning'
              return (
                <div key={task.id} className="rounded-2xl border border-border-light bg-bg-primary/45 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-accent-500/10 text-accent-600 flex items-center justify-center">
                        <Layers3 className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-[13px] font-medium text-text-main">{task.title}</div>
                        <div className="text-[11px] text-text-muted">{roleLabels[task.role]} · {task.assignedTo || '未分配'}</div>
                      </div>
                    </div>
                    <span className={`tag ${statusTone}`}>{result?.submitted ? '已提交' : result ? '已生成待提交' : '待生成'}</span>
                  </div>
                  <p className="text-[12px] text-text-secondary leading-relaxed mb-3">{task.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {linkedMaterials.slice(0, 3).map((material) => (
                      <span key={material.id} className="tag bg-white/5 text-text-muted">{materialTypeLabels[material.type]} · {material.label}</span>
                    ))}
                    {task.sourceTags.map((tag) => (
                      <span key={tag} className="tag bg-accent-500/10 text-accent-600">{tag}</span>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </section>
      </div>

      {/* Executive summary */}
      <div className="mb-10 data-panel p-5">
        <div className="flex items-center justify-between gap-4 mb-5">
          <div>
            <span className="section-title">Executive Summary</span>
            <h2 className="text-[18px] font-medium text-text-main mt-2">可直接进入大促执行的核心判断</h2>
          </div>
          <div className="flex items-center gap-2">
            {editMode && (
              <button
                onClick={() => setDraft((prev) => ({ ...prev, summaries: [...prev.summaries, '补充一条新的人工判断...'] }))}
                className="btn-ghost"
              >
                <Plus className="w-3.5 h-3.5" /> 添加判断
              </button>
            )}
            <span className="tag bg-accent-500/10 text-accent-600">已汇总 {submittedCount} 个岗位输出</span>
          </div>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {draft.summaries.map((item, i) => (
            <div key={i} className="rounded-2xl border border-border-light bg-bg-primary/45 p-5">
              <div className="flex items-center justify-between mb-4">
                <span className="text-[30px] font-light text-accent-400 leading-none">{String(i + 1).padStart(2, '0')}</span>
                {editMode && draft.summaries.length > 1 && (
                  <button
                    onClick={() => setDraft((prev) => ({ ...prev, summaries: prev.summaries.filter((_, idx) => idx !== i) }))}
                    className="w-8 h-8 rounded-xl text-text-muted hover:text-error hover:bg-error-soft transition-colors flex items-center justify-center"
                    aria-label="删除判断"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
              {editMode ? (
                <textarea
                  value={item}
                  onChange={(e) => setDraft((prev) => ({ ...prev, summaries: prev.summaries.map((summary, idx) => idx === i ? e.target.value : summary) }))}
                  rows={5}
                  className="w-full bg-bg-surface border border-border-default rounded-2xl p-3 text-[13px] text-text-main leading-relaxed resize-none focus:outline-none focus:border-accent-400"
                />
              ) : (
                <p className="text-[13px] text-text-secondary leading-relaxed">{item}</p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Role tabs - vertical nav */}
      <div className="data-panel p-5">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <span className="section-title">Role Outputs</span>
            <h2 className="text-[18px] font-medium text-text-main mt-2">岗位分析结果与可复核证据</h2>
          </div>
          <Link to={`/tasks/${projectSlug}`} className="btn-ghost">查看任务卡 <ArrowRight className="w-3.5 h-3.5" /></Link>
        </div>
        <div className="flex flex-col lg:flex-row gap-8">
          <nav className="space-y-2 shrink-0 lg:w-[150px]">
            {roleTabs.map((role) => {
              const roleTasks = tasks.filter((task) => task.role === role)
              const roleSubmitted = roleTasks.filter((task) => getAIResult(task.id)?.submitted).length
              return (
                <button
                  key={role}
                  onClick={() => setActiveTab(role)}
                  className={`block w-full text-left rounded-2xl border p-3 transition-colors ${
                    activeTab === role ? 'text-text-main bg-accent-500/10 border-accent-500/25' : 'text-text-muted border-border-light hover:text-text-secondary hover:border-border-default'
                  }`}
                >
                  <span className="text-[13px] font-medium">{roleLabels[role]}</span>
                  <span className="block text-[10px] mt-1">{roleSubmitted}/{roleTasks.length} 已提交</span>
                </button>
              )
            })}
          </nav>

          <div className="flex-1 space-y-8">
          {roleTabs.map((role) => {
            if (role !== activeTab) return null
            return tasks.filter((t) => t.role === role).map((task) => {
              const result = getAIResult(task.id)
              const linkedMaterials = materials.filter((m) => task.inputMaterials.includes(m.id))
              return (
                <div key={task.id}>
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                    <div>
                      <h3 className="text-[17px] font-medium text-text-main">{task.title}</h3>
                      <p className="text-[12px] text-text-muted mt-1">引用 {linkedMaterials.length} 份资料 · 输出格式：{task.outputFormat}</p>
                    </div>
                    {result?.submitted && (
                      <span className="flex items-center gap-1 text-[12px] text-success font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" />已提交
                      </span>
                    )}
                  </div>
                  {result?.submitted ? (
                    <div className="space-y-3">
                      {result.sections.map((section, i) => (
                        <div key={i} className="rounded-[20px] border border-border-light bg-bg-primary/45 p-5">
                          {editMode ? (
                            <div className="mb-4 flex flex-col gap-1">
                              <label className="text-[10px] text-text-muted font-medium uppercase tracking-[0.08em]">区块标题</label>
                              <input
                                type="text"
                                value={section.title}
                                onChange={(e) => handleUpdateReportResultSection(task.id, i, { title: e.target.value })}
                                className="text-[13px] font-medium text-text-main bg-bg-surface border border-border-default rounded-xl px-3 py-1.5 w-full focus:outline-none focus:border-accent-400"
                              />
                            </div>
                          ) : (
                            <h4 className="text-[13px] font-medium text-text-main mb-3">{section.title}</h4>
                          )}

                          {section.type === 'matrix' && section.headers && section.rows && (
                            <div className="overflow-x-auto">
                              {editMode ? (
                                <div>
                                  <table className="w-full text-[12px]">
                                    <thead>
                                      <tr className="border-b border-border-light">
                                        {section.headers.map((h, ci) => (
                                          <th key={ci} className="py-2 px-1 text-left">
                                            <input
                                              type="text"
                                              value={h}
                                              onChange={(e) => handleReportMatrixHeaderChange(task.id, i, ci, e.target.value)}
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
                                                onChange={(e) => handleReportMatrixCellChange(task.id, i, ri, ci, e.target.value)}
                                                rows={Math.max(1, Math.ceil(cell.length / 18))}
                                                className="w-full bg-bg-surface border border-border-light rounded-lg px-2 py-1 text-[12px] text-text-secondary focus:outline-none focus:border-accent-400 resize-y"
                                              />
                                            </td>
                                          ))}
                                          <td className="py-2 px-1 text-center">
                                            <button
                                              onClick={() => handleReportMatrixDeleteRow(task.id, i, ri)}
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
                                    onClick={() => handleReportMatrixAddRow(task.id, i)}
                                    className="mt-2 text-[11px] text-accent-600 hover:text-accent-500 font-medium flex items-center gap-1 bg-white/[0.03] hover:bg-white/5 px-3 py-1.5 rounded-xl border border-border-light transition-all"
                                  >
                                    <Plus className="w-3.5 h-3.5" /> 添加行
                                  </button>
                                </div>
                              ) : (
                                <table className="w-full text-[12px]">
                                  <thead>
                                    <tr className="border-b border-border-light">
                                      {section.headers.map((h: string) => (
                                        <th key={h} className="text-left py-2 px-2 text-[10px] font-medium uppercase tracking-[0.06em] text-text-muted">{h}</th>
                                      ))}
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {section.rows.map((row: string[], ri: number) => (
                                      <tr key={ri}>
                                        {row.map((cell: string, ci: number) => (
                                          <td key={ci} className={`py-2 px-2 ${ci === 0 ? 'text-text-main font-medium' : 'text-text-secondary'}`}>{cell}</td>
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
                              {editMode ? (
                                <div className="space-y-3">
                                  {section.items.map((item, j) => (
                                    <div key={j} className="flex items-start gap-2">
                                      <span className="w-5 h-5 rounded-lg bg-accent-50 text-accent-600 font-medium text-[10px] flex items-center justify-center shrink-0 mt-2">{j + 1}</span>
                                      <textarea
                                        value={item}
                                        onChange={(e) => handleReportListItemChange(task.id, i, j, e.target.value)}
                                        rows={2}
                                        className="flex-1 bg-bg-primary border border-border-light rounded-xl p-2 text-[12px] text-text-secondary focus:outline-none"
                                      />
                                      <button
                                        onClick={() => handleReportListDeleteItem(task.id, i, j)}
                                        className="mt-2 p-1.5 rounded-lg text-text-muted hover:text-error hover:bg-error-soft transition-colors"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  ))}
                                  <button
                                    onClick={() => handleReportListAddItem(task.id, i)}
                                    className="mt-1 text-[11px] text-accent-600 hover:text-accent-500 font-medium flex items-center gap-1 bg-white/[0.03] hover:bg-white/5 px-2.5 py-1 rounded-xl border border-border-light transition-all"
                                  >
                                    <Plus className="w-3 h-3" /> 添加项
                                  </button>
                                </div>
                              ) : (
                                <ul className="space-y-1.5">
                                  {section.items.map((item: string, j: number) => (
                                    <li key={j} className="text-[12px] text-text-secondary">— {item}</li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          )}

                          {section.type === 'bullet' && section.items && (
                            <div>
                              {editMode ? (
                                <div className="space-y-3">
                                  {section.items.map((item, j) => (
                                    <div key={j} className="flex items-start gap-2">
                                      <div className="w-1.5 h-1.5 rounded-full bg-accent-400 mt-4 shrink-0" />
                                      <textarea
                                        value={item}
                                        onChange={(e) => handleReportListItemChange(task.id, i, j, e.target.value)}
                                        rows={2}
                                        className="flex-1 bg-bg-primary border border-border-light rounded-xl p-2 text-[12px] text-text-secondary focus:outline-none"
                                      />
                                      <button
                                        onClick={() => handleReportListDeleteItem(task.id, i, j)}
                                        className="mt-2 p-1.5 rounded-lg text-text-muted hover:text-error hover:bg-error-soft transition-colors"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                    </div>
                                  ))}
                                  <button
                                    onClick={() => handleReportListAddItem(task.id, i)}
                                    className="mt-1 text-[11px] text-accent-600 hover:text-accent-500 font-medium flex items-center gap-1 bg-white/[0.03] hover:bg-white/5 px-2.5 py-1 rounded-xl border border-border-light transition-all"
                                  >
                                    <Plus className="w-3 h-3" /> 添加项
                                  </button>
                                </div>
                              ) : (
                                <ul className="space-y-1.5">
                                  {section.items.map((item: string, j: number) => (
                                    <li key={j} className="text-[12px] text-text-secondary flex items-start gap-2">
                                      <span className="w-1.5 h-1.5 rounded-full bg-accent-400 mt-1.5 shrink-0" />{item}
                                    </li>
                                  ))}
                                </ul>
                              )}
                            </div>
                          )}

                          {section.type === 'qa' && section.qa && (
                            <div>
                              {editMode ? (
                                <div className="space-y-4">
                                  {section.qa.map((item, j) => (
                                    <div key={j} className="bg-white/[0.03] rounded-2xl p-4 border border-border-light relative group">
                                      <button
                                        onClick={() => handleReportQADelete(task.id, i, j)}
                                        className="absolute top-3 right-3 p-1.5 rounded-lg text-text-muted hover:text-error hover:bg-error-soft opacity-0 group-hover:opacity-100 transition-opacity"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                      <div className="space-y-2 pr-8">
                                        <div className="flex flex-col gap-1">
                                          <label className="text-[10px] text-text-muted font-medium">问题 Q</label>
                                          <input
                                            type="text"
                                            value={item.q}
                                            onChange={(e) => handleReportQAChange(task.id, i, j, 'q', e.target.value)}
                                            className="w-full bg-bg-primary border border-border-light rounded-xl px-3 py-1.5 text-[12px] font-medium text-text-main focus:outline-none"
                                          />
                                        </div>
                                        <div className="flex flex-col gap-1">
                                          <label className="text-[10px] text-text-muted font-medium">答复 A</label>
                                          <textarea
                                            value={item.a}
                                            onChange={(e) => handleReportQAChange(task.id, i, j, 'a', e.target.value)}
                                            rows={3}
                                            className="w-full bg-bg-primary border border-border-light rounded-xl px-3 py-1.5 text-[12px] text-text-secondary focus:outline-none"
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                  <button
                                    onClick={() => handleReportQAAdd(task.id, i)}
                                    className="mt-2 text-[11px] text-accent-600 hover:text-accent-500 font-medium flex items-center gap-1 bg-white/[0.03] hover:bg-white/5 px-2.5 py-1.5 rounded-xl border border-border-light transition-all"
                                  >
                                    <Plus className="w-3.5 h-3.5" /> 添加问答对
                                  </button>
                                </div>
                              ) : (
                                <div className="space-y-2">
                                  {section.qa.map((item: { q: string; a: string }, j: number) => (
                                    <div key={j} className="bg-white/5 rounded-xl p-3">
                                      <p className="text-[12px] font-medium text-text-main mb-1">Q: {item.q}</p>
                                      <p className="text-[12px] text-text-secondary">A: {item.a}</p>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}

                          {section.type === 'quotes' && section.quotes && (
                            <div>
                              {editMode ? (
                                <div className="space-y-4">
                                  {section.quotes.map((q, j) => (
                                    <div key={j} className="bg-white/[0.03] rounded-xl p-4 border border-border-light relative group">
                                      <button
                                        onClick={() => handleReportQuoteDelete(task.id, i, j)}
                                        className="absolute top-3 right-3 p-1.5 rounded-lg text-text-muted hover:text-error hover:bg-error-soft opacity-0 group-hover:opacity-100 transition-opacity"
                                      >
                                        <Trash2 className="w-3.5 h-3.5" />
                                      </button>
                                      <div className="space-y-2 pr-8">
                                        <div className="flex flex-col gap-1">
                                          <label className="text-[10px] text-text-muted font-medium">用户原话</label>
                                          <textarea
                                            value={q.text}
                                            onChange={(e) => handleReportQuoteChange(task.id, i, j, 'text', e.target.value)}
                                            rows={2}
                                            className="w-full bg-bg-primary border border-border-light rounded-xl px-3 py-1.5 text-[12px] text-text-secondary italic focus:outline-none"
                                          />
                                        </div>
                                        <div className="flex flex-col gap-1">
                                          <label className="text-[10px] text-text-muted font-medium">来源渠道/用户</label>
                                          <input
                                            type="text"
                                            value={q.source}
                                            onChange={(e) => handleReportQuoteChange(task.id, i, j, 'source', e.target.value)}
                                            className="w-full bg-bg-primary border border-border-light rounded-xl px-3 py-1.5 text-[11px] text-text-main focus:outline-none"
                                          />
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                  <button
                                    onClick={() => handleReportQuoteAdd(task.id, i)}
                                    className="mt-2 text-[11px] text-accent-600 hover:text-accent-500 font-medium flex items-center gap-1 bg-white/[0.03] hover:bg-white/5 px-2.5 py-1.5 rounded-xl border border-border-light transition-all"
                                  >
                                    <Plus className="w-3.5 h-3.5" /> 添加原话引用
                                  </button>
                                </div>
                              ) : (
                                <div className="space-y-2">
                                  {section.quotes.map((q: { text: string; source: string }, j: number) => (
                                    <div key={j} className="bg-white/5 rounded-lg p-3 italic text-[12px] text-text-secondary">
                                      "{q.text}"
                                      <p className="text-[10px] text-text-muted mt-1 not-italic">—— {q.source}</p>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          )}

                          {section.type === 'text' && section.body && (
                            <div>
                              {editMode ? (
                                <textarea
                                  value={section.body}
                                  onChange={(e) => handleReportTextChange(task.id, i, e.target.value)}
                                  rows={6}
                                  className="w-full bg-bg-primary border border-border-light rounded-2xl p-4 text-[12px] text-text-secondary leading-relaxed focus:outline-none"
                                />
                              ) : (
                                <p className="text-[12px] text-text-secondary leading-relaxed">{section.body}</p>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="card-surface rounded-[20px] p-6 text-center">
                      <p className="text-[13px] text-text-muted mb-2">尚未生成分析结果</p>
                      <Link to={`/workspace/${projectSlug}/${task.id}`} className="text-[12px] font-medium text-accent-600 hover:text-accent-500">前往 AI 工作台 <ArrowRight className="w-3.5 h-3.5 inline" /></Link>
                    </div>
                  )}
                </div>
              )
            })
          })}
          </div>
        </div>
      </div>

      {/* Verification review */}
      <div className="mt-10 action-panel p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-xl bg-accent-500/15 flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4 text-accent-600" />
          </div>
          <div>
            <span className="text-[12px] font-semibold text-accent-600 uppercase tracking-[0.06em]">验证审核 · 知识库对标准入</span>
            <p className="text-[11px] text-text-muted mt-0.5">设置验证角色，判断分析结果与市场竞品的优劣，确定保留和修改内容</p>
          </div>
        </div>
        <div className="grid md:grid-cols-3 gap-3 text-[11px] mb-4">
          {[
            { label: 'AI 结果完整性', status: submittedCount > 0 ? '已通过' : '无数据', pass: submittedCount > 0, desc: submittedCount > 0 ? `${submittedCount} 个岗位已提交` : '暂无岗位提交分析结果' },
            { label: '跨岗位覆盖', status: roleTabs.length >= 3 ? '已通过' : '待完善', pass: roleTabs.length >= 3, desc: roleTabs.length >= 3 ? `覆盖 ${roleTabs.length} 个岗位角色` : `仅覆盖 ${roleTabs.length} 个岗位` },
            { label: '竞品对标验证', status: sensitiveCount <= 1 ? '可进入验证' : '需复核', pass: sensitiveCount <= 1, desc: sensitiveCount <= 1 ? '资料风险可控，可启动知识验证' : `${sensitiveCount} 份资料需先复核` },
          ].map((item) => (
            <div key={item.label} className={`rounded-xl p-3 ${item.pass ? 'bg-success-soft border border-success/20' : 'bg-bg-surface border border-border-light'}`}>
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-text-main">{item.label}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${item.pass ? 'bg-success/10 text-success' : 'bg-white/[0.06] text-text-muted'}`}>{item.status}</span>
              </div>
              <div className="text-text-muted text-[10px]">{item.desc}</div>
            </div>
          ))}
        </div>
        <div className="grid md:grid-cols-3 gap-3">
          {[
            { key: 'keep', title: '公司知识库保留项', tone: 'text-kit-600' },
            { key: 'track', title: '市场竞品需追踪', tone: 'text-accent-600' },
            { key: 'roles', title: '验证角色建议', tone: 'text-ai-400' },
          ].map((item) => (
            <div key={item.title} className="rounded-2xl border border-border-light bg-bg-surface p-4">
              <div className={`text-[12px] font-medium mb-2 ${item.tone}`}>{item.title}</div>
              {editMode ? (
                <textarea
                  value={draft.verification[item.key as keyof ReportDraft['verification']]}
                  onChange={(e) => setDraft((prev) => ({
                    ...prev,
                    verification: { ...prev.verification, [item.key]: e.target.value },
                  }))}
                  rows={3}
                  className="w-full bg-bg-primary border border-border-default rounded-xl p-3 text-[12px] text-text-main leading-relaxed resize-none focus:outline-none focus:border-accent-400"
                />
              ) : (
                <p className="text-[12px] text-text-secondary leading-relaxed">{draft.verification[item.key as keyof ReportDraft['verification']]}</p>
              )}
            </div>
          ))}
        </div>
        <div className="mt-3 rounded-2xl border border-border-light bg-bg-surface p-4">
          <div className="text-[12px] font-medium text-text-main mb-2">人工验证备注</div>
          {editMode ? (
            <textarea
              value={draft.verification.notes}
              onChange={(e) => setDraft((prev) => ({ ...prev, verification: { ...prev.verification, notes: e.target.value } }))}
              rows={3}
              className="w-full bg-bg-primary border border-border-default rounded-xl p-3 text-[12px] text-text-main leading-relaxed resize-none focus:outline-none focus:border-accent-400"
            />
          ) : (
            <p className="text-[12px] text-text-secondary leading-relaxed">{draft.verification.notes}</p>
          )}
        </div>
      </div>

      {/* Next steps */}
      <div className="mt-12 grid lg:grid-cols-[1fr_0.72fr] gap-6">
        <section className="data-panel p-5">
          <div className="flex items-start justify-between gap-4 mb-5">
            <div>
              <span className="section-title">Execution Board</span>
              <h2 className="text-[18px] font-medium text-text-main mt-2">下一步执行清单</h2>
            </div>
            <div className="flex items-start gap-3">
              {editMode && (
                <button
                  onClick={() => setDraft((prev) => ({ ...prev, nextSteps: [...prev.nextSteps, '新增一条可执行动作...'] }))}
                  className="btn-ghost"
                >
                  <Plus className="w-3.5 h-3.5" /> 添加动作
                </button>
              )}
              <div className="text-right">
                <div className="text-[24px] font-light text-text-main leading-none">{Math.round((completedNextSteps / Math.max(nextSteps.length, 1)) * 100)}%</div>
                <div className="text-[10px] text-text-muted mt-1">执行进度</div>
              </div>
            </div>
          </div>
          <div className="h-2 rounded-full bg-bg-primary overflow-hidden mb-5">
            <div className="h-full rounded-full bg-success transition-all" style={{ width: `${(completedNextSteps / Math.max(nextSteps.length, 1)) * 100}%` }} />
          </div>
          <div className="space-y-3">
            {nextSteps.map((item, i) => {
              if (editMode) {
                return (
                  <div key={i} className="flex items-start gap-3 rounded-2xl border border-border-light bg-bg-surface/70 p-4">
                    <div className="w-7 h-7 rounded-xl bg-accent-500/10 text-accent-600 flex items-center justify-center shrink-0 text-[11px] font-mono">{i + 1}</div>
                    <textarea
                      value={item}
                      onChange={(e) => setDraft((prev) => ({ ...prev, nextSteps: prev.nextSteps.map((step, idx) => idx === i ? e.target.value : step) }))}
                      rows={2}
                      className="flex-1 bg-bg-primary border border-border-default rounded-xl p-3 text-[13px] text-text-main leading-relaxed resize-none focus:outline-none focus:border-accent-400"
                    />
                    {nextSteps.length > 1 && (
                      <button
                        onClick={() => setDraft((prev) => ({ ...prev, nextSteps: prev.nextSteps.filter((_, idx) => idx !== i) }))}
                        className="w-9 h-9 rounded-xl text-text-muted hover:text-error hover:bg-error-soft transition-colors flex items-center justify-center"
                        aria-label="删除动作"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                )
              }
              return <CheckItem key={i} text={item} id={`${project.id}-${i}`} onToggle={() => setExecutionRefresh((v) => v + 1)} />
            })}
          </div>
        </section>

        <section className="action-panel p-5">
          <span className="section-title">Knowledge Return</span>
          <h2 className="text-[18px] font-medium text-text-main mt-2 mb-5">报告如何回流为下次可用资产</h2>
          <div className="space-y-3">
            <div className="rounded-2xl border border-border-light bg-bg-primary/45 p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[13px] font-medium text-text-main">当前项目 Work Kit</span>
                <span className="tag bg-accent-500/10 text-accent-600">{existingKit ? existingKit.version : '待保存'}</span>
              </div>
              <p className="text-[12px] text-text-secondary leading-relaxed">
                {existingKit?.feedback || '保存后会把本页岗位结果、验证结论和执行清单写入资产库，供新项目启动前学习。'}
              </p>
            </div>
            <div className="rounded-2xl border border-border-light bg-bg-primary/45 p-4">
              <div className="text-[13px] font-medium text-text-main mb-3">相似成功案例</div>
              <div className="space-y-2">
                {relatedKits.length > 0 ? relatedKits.map((kit) => (
                  <div key={kit.id} className="flex items-center justify-between gap-3 text-[12px]">
                    <span className="text-text-secondary truncate">{kit.name}</span>
                    <span className="font-mono text-accent-600">{kit.rating.toFixed(1)}</span>
                  </div>
                )) : (
                  <p className="text-[12px] text-text-muted">暂无同类成功案例，建议先沉淀当前项目。</p>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-2 pt-2">
              <button onClick={() => setShowSaveDialog(true)} className="btn-primary-filled justify-center">
                <Package className="w-4 h-4" /> 保存/更新 Work Kit
              </button>
              {editMode && (
                <>
                  <button onClick={saveDraft} className="btn-primary justify-center">
                    <Save className="w-4 h-4" /> 保存报告编辑
                  </button>
                  <button onClick={resetDraft} className="btn-ghost justify-center">
                    <RotateCcw className="w-4 h-4" /> 恢复系统版本
                  </button>
                </>
              )}
              <button onClick={() => navigate('/archive')} className="btn-ghost justify-center">
                打开资产库 <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* Save dialog */}
      {showSaveDialog && (
        <div className="modal-backdrop">
          <div className="modal-panel p-6 w-[760px]">
            <div className="flex items-start justify-between gap-5 mb-5">
              <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-accent-50 flex items-center justify-center"><Package className="w-5 h-5 text-accent-500" /></div>
              <div>
                <h3 className="font-medium text-text-main">沉淀为复用工作包</h3>
                  <p className="text-[12px] text-text-muted">保存流程、验证结论和启动学习包，下次大促直接复用。</p>
                </div>
              </div>
              <div className="rounded-xl border border-accent-500/15 bg-accent-500/[0.05] px-4 py-3 text-center shrink-0">
                <div className="text-[26px] font-light text-text-main leading-none">{readinessScore}%</div>
                <div className="text-[10px] text-text-muted mt-1">发布就绪度</div>
              </div>
            </div>

            <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-4 mb-4">
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { icon: CheckCircle2, label: '结果', value: `${submittedCount}/${tasks.length}`, pass: completionReady },
                    { icon: ShieldCheck, label: '交接', value: `${projectHandoffs.length}条`, pass: projectHandoffs.length > 0 },
                    { icon: Star, label: '评分', value: successRating ? String(successRating) : '待定', pass: successRating >= 4.8 },
                  ].map((item) => (
                    <div key={item.label} className={`rounded-xl border p-3 ${item.pass ? 'border-success/20 bg-success-soft' : 'border-border-light bg-bg-primary/70'}`}>
                      <item.icon className={`w-4 h-4 mb-2 ${item.pass ? 'text-success' : 'text-text-muted'}`} />
                      <div className="text-[18px] font-light text-text-main leading-none mb-1">{item.value}</div>
                      <div className="text-[10px] text-text-muted">{item.label}</div>
                    </div>
                  ))}
                </div>

                <div className="workbench-section p-4 text-[12px] space-y-1.5">
                  <div className="flex justify-between gap-4"><span className="text-text-muted">项目</span><span className="font-medium text-right">{project.name}</span></div>
                  <div className="flex justify-between"><span className="text-text-muted">版本</span><span className="font-medium">{nextVersionLabel}</span></div>
                  <div className="flex justify-between"><span className="text-text-muted">包含</span><span className="font-medium">{submittedTasks.length}/{tasks.length} 个结果 · {roleTabs.length} 个岗位</span></div>
                  <div className="flex justify-between"><span className="text-text-muted">交接证据</span><span className="font-medium">{projectHandoffs.length} 条 · {handoffKnowledgeCount} 个知识依据</span></div>
                  {existingKit && <div className="flex justify-between"><span className="text-text-muted">已有版本</span><span className="font-medium">{existingKit.version} · {existingKit.versionHistory.length} 条历史</span></div>}
                </div>

                <button
                  onClick={() => setMarkAsSuccess((v) => !v)}
                  className={`w-full rounded-xl border p-4 text-left transition-colors ${
                    markAsSuccess ? 'border-amber-500/25 bg-amber-500/10' : 'border-border-light bg-bg-primary/60'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${markAsSuccess ? 'bg-amber-500 text-white' : 'bg-bg-surface text-text-muted'}`}>
                      <Star className={`w-4.5 h-4.5 ${markAsSuccess ? 'fill-white' : ''}`} />
                    </div>
                    <div>
                      <div className="text-[13px] font-medium text-text-main mb-1">标记为已验证成功案例</div>
                      <p className="text-[12px] text-text-muted leading-relaxed">
                        项目沉淀后评分写入 {markAsSuccess ? '4.8' : '4.3'}，成功案例会在资产库优先展示，供新项目启动前学习。
                      </p>
                    </div>
                  </div>
                </button>
              </div>

              <div className="rounded-xl border border-accent-500/20 bg-accent-500/[0.04] p-4">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <div>
                    <div className="text-[11px] font-semibold text-accent-600 uppercase tracking-[0.08em]">Launch Learning Pack</div>
                    <div className="text-[14px] font-medium text-text-main mt-1">下次启动前会学习什么</div>
                  </div>
                  <BookOpen className="w-5 h-5 text-accent-500" />
                </div>
                <div className="space-y-2.5">
                  {launchLearningPreview.map((item, index) => (
                    <div key={item.label} className="rounded-xl border border-border-light bg-bg-surface/85 p-3">
                      <div className="flex items-center justify-between gap-3 mb-1">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-lg bg-accent-500/10 text-accent-600 flex items-center justify-center text-[10px] font-mono">{index + 1}</span>
                          <span className="text-[12px] font-medium text-text-main">{item.label}</span>
                        </div>
                        <span className="text-[11px] text-text-secondary shrink-0">{item.value}</span>
                      </div>
                      <p className="text-[10px] text-text-muted leading-relaxed pl-7">{item.desc}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-3 rounded-xl bg-bg-primary/70 border border-border-light p-3 text-[11px] text-text-secondary leading-relaxed">
                  保存后，新项目从资产库复用此 Work Kit 时，会先进入启动前学习包，而不是直接复制旧结论。
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 justify-end">
              <button onClick={() => setShowSaveDialog(false)} className="btn-ghost">取消</button>
              <button onClick={() => {
                const verificationFeedback = markAsSuccess
                  ? `验证通过：${submittedCount}/${tasks.length} 个岗位结果已提交，覆盖 ${roleTabs.length} 个岗位，资产交接 ${projectHandoffs.length} 条，标记为成功案例；人工保留项：${draft.verification.keep}；执行动作 ${completedNextSteps}/${draft.nextSteps.length} 已完成。`
                  : `已沉淀为观察模板：${submittedCount}/${tasks.length} 个岗位结果已提交，资产交接 ${projectHandoffs.length} 条；人工备注：${draft.verification.notes}；需继续收集复用反馈后再标星。`
                const manualSections: WorkKit['sections'] = [
                  {
                    title: '人工修订后的报告摘要',
                    role: 'operations',
                    content: [{ title: '核心判断', type: 'list', items: draft.summaries }],
                  },
                  {
                    title: '执行清单与验证结论',
                    role: 'operations',
                    content: [
                      { title: '下一步执行清单', type: 'list', items: draft.nextSteps },
                      { title: '知识库准入结论', type: 'text', body: `${draft.verification.keep}\n${draft.verification.track}\n${draft.verification.roles}\n${draft.verification.notes}` },
                    ],
                  },
                ]
                const newKit: WorkKit = {
                  id: 'wk' + Date.now(),
                  name: project.name + ' Work Kit',
                  version: 'v1.0',
                  basedOnProjectId: project.id,
                  basedOnProjectName: project.name,
                  description: `基于「${project.name}」项目沉淀的分析流程。`,
                  scenario: project.campaign || '大促分析',
                  includedRoles: roleTabs,
                  materialStructure: referencedMaterialTypeLabels.length ? referencedMaterialTypeLabels.join(' · ') : '竞品评论 · 商品参数 · 客服记录',
                  sections: [
                    ...manualSections,
                    ...submittedTasks.map((t) => ({ title: t.title, role: t.role, content: getAIResult(t.id)?.sections || [] })),
                  ],
                  createdAt: new Date().toISOString().split('T')[0],
                  tags: [project.category, project.campaign, markAsSuccess ? '成功案例' : '观察模板'].filter(Boolean),
                  feedback: verificationFeedback,
                  versionHistory: [{ version: 'v1.0', date: new Date().toISOString().split('T')[0], changes: `初始版本：基于${project.name}项目沉淀；${verificationFeedback}` }],
                  reuseCount: 0, rating: successRating,
                }
                const savedResult = upsertWorkKitFromProject(newKit)
                try {
                  const publishHistory = JSON.parse(localStorage.getItem('promokit_asset_publish_history' ) || '[]')
                  localStorage.setItem('promokit_asset_publish_history', JSON.stringify([
                    {
                      id: `publish_${Date.now()}`,
                      projectId: project.id,
                      projectName: project.name,
                      workKitId: savedResult.kit.id,
                      workKitName: savedResult.kit.name,
                      version: savedResult.kit.version,
                      mode: savedResult.mode,
                      readinessScore,
                      learningItems: launchLearningPreview.map((item) => item.label),
                      reusableAssetCount: reusableAssets.length,
                      handoffCount: projectHandoffs.length,
                      createdAt: new Date().toISOString(),
                    },
                    ...publishHistory,
                  ].slice(0, 40)))
                } catch { /* local publish history is optional */ }
                updateProject({ ...project, status: 'completed' })
                setSavedMode(savedResult.mode)
                setSavedKit(savedResult.kit)
                setSaved(true); setShowSaveDialog(false)
                window.dispatchEvent(new Event('promokit_db_update'))
                showToast(savedResult.mode === 'created' ? 'Work Kit 已保存到资产库' : `Work Kit 已更新为 ${savedResult.kit.version}`, 'success')
              }} className="btn-primary-filled">确认保存</button>
            </div>
          </div>
        </div>
      )}
      {saved && (
        <div className="modal-backdrop">
          <div className="modal-panel p-7 w-[560px]">
            <div className="flex items-start gap-4 mb-5">
              <div className="w-14 h-14 rounded-2xl bg-success-soft flex items-center justify-center shrink-0"><TrendingUp className="w-7 h-7 text-success" /></div>
              <div className="min-w-0">
                <div className="text-[11px] font-semibold text-success uppercase tracking-[0.08em] mb-1">Asset Receipt</div>
                <h3 className="text-[20px] font-medium text-text-main mb-2">{savedMode === 'created' ? 'Work Kit 已沉淀' : 'Work Kit 已更新'}</h3>
                <p className="text-[13px] text-text-muted leading-relaxed">
              {markAsSuccess
                ? `已将「${project.name}」标记为可优先学习的成功案例。`
                : savedMode === 'created' ? `已将「${project.name}」的分析流程保存为观察模板。` : `已将「${project.name}」的最新报告结果同步到原工作包版本历史。`}
                </p>
              </div>
            </div>
            <div className="grid sm:grid-cols-3 gap-2 mb-5">
              {publishReceiptItems.map((item) => (
                <div key={item.label} className="rounded-xl border border-border-light bg-bg-primary/60 p-3">
                  <div className="text-[17px] font-light text-text-main leading-none mb-1">{item.value}</div>
                  <div className="text-[11px] font-medium text-text-main">{item.label}</div>
                  <div className="text-[9px] text-text-muted leading-relaxed mt-1">{item.desc}</div>
                </div>
              ))}
            </div>
            <div className="rounded-xl border border-accent-500/15 bg-accent-500/[0.04] p-4 mb-5">
              <div className="flex items-center gap-2 mb-2">
                <BookOpen className="w-4 h-4 text-accent-500" />
                <span className="text-[12px] font-semibold text-text-main">下次启动将继承</span>
              </div>
              <div className="grid gap-1.5">
                {launchLearningPreview.map((item) => (
                  <div key={item.label} className="flex items-center justify-between gap-3 text-[11px]">
                    <span className="text-text-secondary">{item.label}</span>
                    <span className="text-text-muted text-right">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center justify-end gap-3">
              <button onClick={() => setSaved(false)} className="btn-ghost">关闭</button>
              <button onClick={() => navigate('/archive')} className="btn-primary-filled">去资产库验证 <ArrowRight className="w-4 h-4" /></button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
