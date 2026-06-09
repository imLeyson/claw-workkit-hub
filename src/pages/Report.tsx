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
} from 'lucide-react'
import { roleLabels, reportSummaries, reportNextSteps } from '../data/mock'
import { getProjectBySlug, getTasks, getAIResult, getWorkKits, getMaterials, upsertWorkKitFromProject } from '../services/db'
import type { Material, WorkKit } from '../types'
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
  const [markAsSuccess, setMarkAsSuccess] = useState(true)
  const [executionRefresh, setExecutionRefresh] = useState(0)
  const [editMode, setEditMode] = useState(false)
  const [draft, setDraft] = useState(() => {
    const fallback = getDefaultReportDraft(baseSummaries, baseNextSteps, defaultKeep, defaultTrack)
    return readReportDraft(project?.id || 'unknown', fallback)
  })

  if (!project) return <div className="text-text-muted text-sm p-8">项目不存在</div>

  const roleOrder = ['operations', 'merchandise', 'copywriting', 'customer_service', 'design']
  const roleTabs = [...new Set(tasks.map((t) => t.role))].sort((a, b) => roleOrder.indexOf(a) - roleOrder.indexOf(b))
  const submittedCount = tasks.filter((t) => getAIResult(t.id)?.submitted).length
  const existingKit = getWorkKits().find((k) => k.basedOnProjectId === project.id)
  const nextVersionLabel = existingKit ? '自动升级版本' : 'v1.0'
  const submittedTasks = tasks.filter((t) => getAIResult(t.id)?.submitted)
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
  const sensitiveCount = materials.filter((item) => item.sensitivity !== 'normal').length
  const generatedCount = tasks.filter((task) => getAIResult(task.id)).length
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
          <div className="rounded-[28px] border border-border-default bg-bg-surface p-7 overflow-hidden relative">
            <div className="absolute right-[-80px] top-[-120px] w-[280px] h-[280px] rounded-full bg-accent-500/10" />
            <div className="relative">
              <div className="inline-flex items-center gap-2 rounded-full border border-ai-400/20 bg-ai-400/10 px-3 py-1 text-[11px] text-ai-400 mb-5">
                <GitBranch className="w-3.5 h-3.5" />
                从资料到策略再到知识沉淀的闭环报告
              </div>
              <h1 className="text-[40px] font-light tracking-[-0.03em] text-text-main mb-4">大促策略报告</h1>
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

      {/* Closure map */}
      <div className="mb-12 rounded-[24px] border border-border-default bg-bg-surface p-5">
        <div className="flex items-center justify-between gap-4 mb-5">
          <div>
            <span className="section-title">Closed Loop</span>
            <h2 className="text-[18px] font-medium text-text-main mt-2">本次大促分析的实际使用链路</h2>
          </div>
          <span className="tag bg-success-soft text-success">{completionReady && completedNextSteps === nextSteps.length ? '已完成闭环' : '进行中'}</span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-5 gap-3">
          {closureSteps.map((step, index) => (
            <div key={step.label} className="relative rounded-2xl border border-border-light bg-bg-primary/45 p-4 min-h-[148px]">
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
        <section className="rounded-[24px] border border-border-default bg-bg-surface p-5">
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

        <section className="rounded-[24px] border border-border-default bg-bg-surface p-5">
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
      <div className="mb-12 rounded-[24px] border border-border-default bg-bg-surface p-6">
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
      <div className="rounded-[24px] border border-border-default bg-bg-surface p-6">
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
                          <h4 className="text-[13px] font-medium text-text-main mb-3">{section.title}</h4>
                          {section.type === 'matrix' && section.headers && section.rows && (
                            <div className="overflow-x-auto">
                              <table className="w-full text-[12px]">
                                <thead><tr className="border-b border-border-light">{section.headers.map((h: string) => <th key={h} className="text-left py-2 px-2 text-[10px] font-medium uppercase tracking-[0.06em] text-text-muted">{h}</th>)}</tr></thead>
                                <tbody>{section.rows.map((row: string[], ri: number) => <tr key={ri}>{row.map((cell: string, ci: number) => <td key={ci} className={`py-2 px-2 ${ci === 0 ? 'text-text-main font-medium' : 'text-text-secondary'}`}>{cell}</td>)}</tr>)}</tbody>
                              </table>
                            </div>
                          )}
                          {section.type === 'list' && section.items && (
                            <ul className="space-y-1.5">{section.items.map((item: string, j: number) => <li key={j} className="text-[12px] text-text-secondary">— {item}</li>)}</ul>
                          )}
                          {section.type === 'bullet' && section.items && (
                            <ul className="space-y-1.5">{section.items.map((item: string, j: number) => <li key={j} className="text-[12px] text-text-secondary flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-accent-400 mt-1.5 shrink-0" />{item}</li>)}</ul>
                          )}
                          {section.type === 'qa' && section.qa && (
                            <div className="space-y-2">{section.qa.map((item: { q: string; a: string }, j: number) => <div key={j} className="bg-white/5 rounded-xl p-3"><p className="text-[12px] font-medium text-text-main mb-1">Q: {item.q}</p><p className="text-[12px] text-text-secondary">A: {item.a}</p></div>)}</div>
                          )}
                          {section.type === 'quotes' && section.quotes && (
                            <div className="space-y-2">{section.quotes.map((q: { text: string; source: string }, j: number) => <div key={j} className="bg-white/5 rounded-lg p-3 italic text-[12px] text-text-secondary">"{q.text}"<p className="text-[10px] text-text-muted mt-1 not-italic">—— {q.source}</p></div>)}</div>
                          )}
                          {section.type === 'text' && section.body && (
                            <p className="text-[12px] text-text-secondary leading-relaxed">{section.body}</p>
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
      <div className="mt-12 bg-accent-500/[0.04] rounded-[24px] p-6 border border-accent-500/15">
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
        <section className="rounded-[24px] border border-border-default bg-bg-surface p-6">
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

        <section className="rounded-[24px] border border-border-default bg-bg-surface p-6">
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
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
          <div className="bg-bg-surface rounded-[28px] p-6 w-[520px] shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-accent-50 flex items-center justify-center"><Package className="w-5 h-5 text-accent-500" /></div>
              <div>
                <h3 className="font-medium text-text-main">沉淀为复用工作包</h3>
                <p className="text-[12px] text-text-muted">保存流程、验证结论和成功标记，下次大促直接复用。</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 mb-4">
              {[
                { icon: CheckCircle2, label: '结果完整性', value: `${submittedCount}/${tasks.length}`, pass: completionReady },
                { icon: ShieldCheck, label: '跨岗位覆盖', value: `${roleTabs.length}岗`, pass: coverageReady },
                { icon: Star, label: '沉淀评分', value: successRating ? String(successRating) : '待定', pass: successRating >= 4.8 },
              ].map((item) => (
                <div key={item.label} className={`rounded-2xl border p-3 ${item.pass ? 'border-success/20 bg-success-soft' : 'border-border-light bg-bg-primary/70'}`}>
                  <item.icon className={`w-4 h-4 mb-2 ${item.pass ? 'text-success' : 'text-text-muted'}`} />
                  <div className="text-[18px] font-light text-text-main leading-none mb-1">{item.value}</div>
                  <div className="text-[10px] text-text-muted">{item.label}</div>
                </div>
              ))}
            </div>

            <div className="bg-white/5 rounded-2xl p-4 mb-4 text-[12px] space-y-1.5">
              <div className="flex justify-between gap-4"><span className="text-text-muted">项目</span><span className="font-medium text-right">{project.name}</span></div>
              <div className="flex justify-between"><span className="text-text-muted">版本</span><span className="font-medium">{nextVersionLabel}</span></div>
              <div className="flex justify-between"><span className="text-text-muted">包含</span><span className="font-medium">{submittedTasks.length}/{tasks.length} 个结果 · {roleTabs.length} 个岗位</span></div>
              {existingKit && <div className="flex justify-between"><span className="text-text-muted">已有版本</span><span className="font-medium">{existingKit.version} · {existingKit.versionHistory.length} 条历史</span></div>}
            </div>

            <button
              onClick={() => setMarkAsSuccess((v) => !v)}
              className={`w-full rounded-2xl border p-4 mb-5 text-left transition-colors ${
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

            <div className="flex items-center gap-2 justify-end">
              <button onClick={() => setShowSaveDialog(false)} className="btn-ghost">取消</button>
              <button onClick={() => {
                const verificationFeedback = markAsSuccess
                  ? `验证通过：${submittedCount}/${tasks.length} 个岗位结果已提交，覆盖 ${roleTabs.length} 个岗位，标记为成功案例；人工保留项：${draft.verification.keep}；执行动作 ${completedNextSteps}/${draft.nextSteps.length} 已完成。`
                  : `已沉淀为观察模板：${submittedCount}/${tasks.length} 个岗位结果已提交；人工备注：${draft.verification.notes}；需继续收集复用反馈后再标星。`
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
                  materialStructure: '竞品评论 · 商品参数 · 客服记录',
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
                setSavedMode(savedResult.mode)
                setSaved(true); setShowSaveDialog(false)
                showToast(savedResult.mode === 'created' ? 'Work Kit 已保存到资产库' : `Work Kit 已更新为 ${savedResult.kit.version}`, 'success')
              }} className="btn-primary-filled">确认保存</button>
            </div>
          </div>
        </div>
      )}
      {saved && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
          <div className="bg-bg-surface rounded-[24px] p-8 w-[400px] shadow-xl text-center">
            <div className="w-14 h-14 rounded-2xl bg-success-soft flex items-center justify-center mx-auto mb-4"><TrendingUp className="w-7 h-7 text-success" /></div>
            <h3 className="text-[18px] font-medium text-text-main mb-2">{savedMode === 'created' ? 'Work Kit 已沉淀' : 'Work Kit 已更新'}</h3>
            <p className="text-[13px] text-text-muted mb-6">
              {markAsSuccess
                ? `已将「${project.name}」标记为可优先学习的成功案例。`
                : savedMode === 'created' ? `已将「${project.name}」的分析流程保存为观察模板。` : `已将「${project.name}」的最新报告结果同步到原工作包版本历史。`}
            </p>
            <div className="flex items-center justify-center gap-3">
              <button onClick={() => setSaved(false)} className="btn-ghost">关闭</button>
              <button onClick={() => navigate('/archive')} className="btn-primary-filled">查看资产库 <ArrowRight className="w-4 h-4" /></button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
