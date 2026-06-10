import { useState, useCallback, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowRight, UserCircle, Loader2, Sparkles, Copy, ChevronDown, ChevronUp, Pencil, Plus, X, Package, BookOpen, GitBranch, ShieldCheck } from 'lucide-react'
import { roleLabels } from '../data/mock'
import { getProjectBySlug, getMaterials, getTasks, getWorkKits, updateTask, refreshTaskMaterialLinks, addTask } from '../services/db'
import { useToast } from '../components/Toast'
import type { MaterialType, Role, TaskCard } from '../types'

const sourceColorMap: Record<string, string> = {
  '竞品评论': 'bg-accent-500/10 text-accent-400',
  '商品参数': 'bg-white/[0.06] text-text-muted',
  '客服记录': 'bg-success-soft text-success',
  '历史文案': 'bg-accent-500/[0.05] text-accent-500',
}

const sourceMaterialMap: Record<string, MaterialType> = {
  '竞品评论': 'review',
  '商品参数': 'spec',
  '客服记录': 'faq',
  '历史文案': 'copy_asset',
}

export default function TaskCards() {
  const { projectSlug } = useParams<{ projectSlug: string }>()
  const project = getProjectBySlug(projectSlug!)
  const [tasks, setTasks] = useState(project ? getTasks(project.id) : [])
  const materials = project ? getMaterials(project.id) : []

  // Sync from localStorage on mount and when projectSlug changes
  useEffect(() => {
    if (project) {
      refreshTaskMaterialLinks(project.id)
      setTasks(getTasks(project.id))
    }
  }, [projectSlug])

  useEffect(() => {
    const handleSync = () => {
      if (project) {
        setTasks(getTasks(project.id))
      }
    }
    window.addEventListener('promokit_db_update', handleSync)
    return () => window.removeEventListener('promokit_db_update', handleSync)
  }, [project, projectSlug])

  const { showToast } = useToast()
  const [isGenerating, setIsGenerating] = useState(false)
  const [showAssociation, setShowAssociation] = useState(true)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  // Task form state
  const [showTaskForm, setShowTaskForm] = useState(false)
  const [editingTask, setEditingTask] = useState<TaskCard | null>(null)
  const [taskForm, setTaskForm] = useState({
    role: 'merchandise' as Role,
    title: '',
    description: '',
    assignedTo: '',
    promptPreview: '',
    outputFormat: '',
    judgmentCriteriaStr: '',
    sourceTags: [] as string[],
  })

  const openAddTask = () => {
    setEditingTask(null)
    setTaskForm({
      role: 'merchandise',
      title: '',
      description: '',
      assignedTo: '',
      promptPreview: '',
      outputFormat: '',
      judgmentCriteriaStr: '',
      sourceTags: [],
    })
    setShowTaskForm(true)
  }

  const openEditTask = (task: TaskCard) => {
    setEditingTask(task)
    setTaskForm({
      role: task.role,
      title: task.title,
      description: task.description,
      assignedTo: task.assignedTo || '',
      promptPreview: task.promptPreview,
      outputFormat: task.outputFormat,
      judgmentCriteriaStr: (task.judgmentCriteria || []).join('\n'),
      sourceTags: task.sourceTags,
    })
    setShowTaskForm(true)
  }

  const toggleTag = (tag: string) => {
    setTaskForm((prev) => {
      const idx = prev.sourceTags.indexOf(tag)
      if (idx >= 0) {
        return { ...prev, sourceTags: prev.sourceTags.filter((t) => t !== tag) }
      } else {
        return { ...prev, sourceTags: [...prev.sourceTags, tag] }
      }
    })
  }

  const handleSaveTask = async () => {
    if (!project) return
    if (!taskForm.title.trim()) {
      showToast('请输入任务标题', 'error')
      return
    }
    if (!taskForm.description.trim()) {
      showToast('请输入任务描述', 'error')
      return
    }

    const judgmentCriteria = taskForm.judgmentCriteriaStr
      .split('\n')
      .map((s) => s.trim())
      .filter((s) => s.length > 0)

    if (editingTask) {
      const updated: TaskCard = {
        ...editingTask,
        role: taskForm.role,
        title: taskForm.title.trim(),
        description: taskForm.description.trim(),
        assignedTo: taskForm.assignedTo.trim(),
        promptPreview: taskForm.promptPreview.trim(),
        outputFormat: taskForm.outputFormat.trim(),
        judgmentCriteria,
        sourceTags: taskForm.sourceTags,
      }
      updateTask(updated)
      showToast('任务更新成功', 'success')
    } else {
      const newTask: TaskCard = {
        id: 't_' + Date.now(),
        projectId: project.id,
        role: taskForm.role,
        title: taskForm.title.trim(),
        description: taskForm.description.trim(),
        status: 'pending',
        assignedTo: taskForm.assignedTo.trim() || '未分配',
        inputMaterials: [],
        promptPreview: taskForm.promptPreview.trim() || `围绕「${taskForm.title.trim()}」进行深度分析，分析资料中包含的竞品反馈。`,
        outputFormat: taskForm.outputFormat.trim() || '列表',
        judgmentCriteria: judgmentCriteria.length > 0 ? judgmentCriteria : ['确认数据完整性', '形成结论清单'],
        sourceTags: taskForm.sourceTags,
      }
      await addTask(newTask)
      showToast('自定义任务添加成功', 'success')
    }
    refreshTaskMaterialLinks(project.id)
    setTasks(getTasks(project.id))
    setShowTaskForm(false)
  }

  if (!project) return <div className="text-text-muted text-sm p-8">项目不存在</div>

  const anyGenerated = tasks.some((t) => t.status === 'generated' || t.status === 'submitted')
  const allReady = tasks.every((t) => t.status === 'ready' || t.status === 'generated' || t.status === 'submitted')
  const readyPendingTasks = tasks.filter((t) => t.status === 'pending' && t.inputMaterials.length > 0)
  const blockedPendingTasks = tasks.filter((t) => t.status === 'pending' && t.inputMaterials.length === 0)
  const submittedTasks = tasks.filter((t) => t.status === 'submitted')
  const generatedTasks = tasks.filter((t) => t.status === 'generated' || t.status === 'submitted')
  const workKits = getWorkKits()
  const relevantKits = workKits
    .filter((kit) => kit.tags.some((tag) => [project.category, project.campaign, '成功案例'].filter(Boolean).includes(tag)) || kit.includedRoles.some((role) => tasks.some((task) => task.role === role)))
    .sort((a, b) => (b.rating * 10 + b.reuseCount) - (a.rating * 10 + a.reuseCount))
    .slice(0, 5)
  const assetSteps = [
    { icon: BookOpen, label: '学习可复用资产', value: `${relevantKits.length} 个`, desc: '从历史 Work Kit 继承口径' },
    { icon: Sparkles, label: '生成岗位分析', value: `${generatedTasks.length}/${tasks.length}`, desc: '把资料转成结构化结果' },
    { icon: ShieldCheck, label: '提交复核报告', value: `${submittedTasks.length}/${tasks.length}`, desc: '进入报告验证与编辑' },
    { icon: Package, label: '沉淀工作包', value: anyGenerated ? '可推进' : '待分析', desc: '保存为下次启动资产' },
  ]

  const generateAll = useCallback(() => {
    if (isGenerating) return
    if (readyPendingTasks.length === 0) {
      showToast(blockedPendingTasks.length > 0 ? '还有任务缺少输入资料，请先回到资料库补充' : '暂无需要生成的任务卡', 'info')
      return
    }
    setIsGenerating(true)
    const pending = readyPendingTasks
    let delay = 0
    pending.forEach((t) => {
      setTimeout(() => {
        setTasks((prev) => {
          const updated = prev.map((x) => x.id === t.id ? { ...x, status: 'ready' as const } : x)
          const changed = updated.find((x) => x.id === t.id)
          if (changed) updateTask(changed)
          return updated
        })
      }, delay)
      delay += 300
    })
    setTimeout(() => {
      setIsGenerating(false)
      showToast(`已生成 ${pending.length} 张任务卡${blockedPendingTasks.length > 0 ? `，${blockedPendingTasks.length} 张仍待补资料` : ''}`, 'success')
    }, delay + 200)
  }, [tasks, isGenerating, showToast, readyPendingTasks, blockedPendingTasks])

  return (
    <div className="max-w-5xl">
      <div className="mb-10 rounded-[28px] border border-border-default bg-bg-surface p-6 overflow-hidden relative">
        <div className="absolute right-[-90px] top-[-150px] w-[320px] h-[320px] rounded-full bg-accent-500/8" />
        <div className="relative grid lg:grid-cols-[0.9fr_1.1fr] gap-7">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-ai-400/20 bg-ai-400/10 px-3 py-1 text-[11px] text-ai-400 mb-5">
              <GitBranch className="w-3.5 h-3.5" />
              Work Kit Assembly
            </div>
            <h1 className="text-[34px] font-light tracking-[-0.03em] text-text-main mb-3">把岗位任务装配成可复用工作包</h1>
            <p className="text-[14px] text-text-secondary leading-relaxed max-w-xl">
              每张任务卡都会记录输入资料、岗位 Prompt、输出格式和判断标准。完成并提交后，这些内容会汇入报告，最终沉淀为下一次大促可学习、可复用的 Work Kit。
            </p>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {assetSteps.map((step) => (
              <div key={step.label} className="rounded-2xl border border-border-light bg-bg-primary/55 p-4">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <step.icon className="w-4 h-4 text-accent-500" />
                  <span className="font-mono text-[11px] text-accent-600">{step.value}</span>
                </div>
                <div className="text-[12px] font-medium text-text-main">{step.label}</div>
                <div className="text-[10px] text-text-muted mt-1">{step.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-start justify-between mb-10">
        <div>
          <h2 className="text-[24px] font-light tracking-[-0.02em] text-text-main mb-3">岗位分析任务</h2>
          <p className="text-[14px] text-text-secondary max-w-md leading-relaxed">{project.name} — 系统根据资料自动生成可执行的 AI 分析任务卡，并保留后续资产化所需的上下文。</p>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={openAddTask} className="btn-ghost text-accent-500 hover:text-accent-600 flex items-center gap-1.5 cursor-pointer">
            <Plus className="w-4 h-4" />
            <span>添加自定义分析任务</span>
          </button>
          {!allReady && (
            <button onClick={generateAll} disabled={isGenerating} className="btn-primary-filled">
              {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {isGenerating ? `生成中 (${tasks.filter((t) => t.status === 'ready').length}/${tasks.length})` : '生成全部任务卡'}
            </button>
          )}
          {anyGenerated && (
            <Link to={`/report/${projectSlug}`} className="btn-ghost">查看策略报告</Link>
          )}
        </div>
      </div>

      {/* Context bar */}
      <div className="flex items-center gap-6 text-[12px] text-text-muted mb-6 pb-6 border-b border-border-default">
        <span>{project.competitors.length} 个竞品</span>
        <span className="text-border-default">·</span>
        <span>{materials.length} 份资料</span>
        <span className="text-border-default">·</span>
        <span>{project.team.length} 个岗位</span>
        <span className="text-border-default">·</span>
        <span>{submittedTasks.length}/{tasks.length} 已提交到报告</span>
      </div>

      {/* Smart association — collapsible */}
      <div className="mb-10 bg-accent-500/[0.04] rounded-2xl border border-accent-500/15 overflow-hidden">
        <button onClick={() => setShowAssociation(!showAssociation)} className="w-full p-4 flex items-center justify-between text-left">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-accent-500" />
            <span className="text-[11px] font-semibold text-accent-600 uppercase tracking-[0.06em]">智能知识库 · 推荐 {relevantKits.length} 个高复用 Work Kit</span>
          </div>
          {showAssociation ? <ChevronUp className="w-4 h-4 text-accent-400" /> : <ChevronDown className="w-4 h-4 text-accent-400" />}
        </button>
        {showAssociation && (
        <div className="px-4 pb-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
          {relevantKits.map((k) => (
            <Link key={k.id} to="/archive" className="bg-bg-surface rounded-xl p-3 border border-accent-500/15 text-[11px] hover:shadow-sm transition-shadow">
              <div className="font-medium text-text-main mb-0.5 truncate">{k.name.slice(0, 12)}{k.name.length > 12 ? '...' : ''}</div>
              <div className="text-text-muted">{k.version} · 复用 {k.reuseCount} 次</div>
            </Link>
          ))}
        </div>
        )}
      </div>

      {/* Task card grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 stagger">
        {tasks.map((task) => {
          const inputMats = materials.filter((m) => task.inputMaterials.includes(m.id))
          const availableTypes = new Set(inputMats.map((m) => m.type))
          const missingTags = task.sourceTags.filter((tag) => {
            const materialType = sourceMaterialMap[tag]
            return materialType ? !availableTypes.has(materialType) : false
          })
          const blocked = task.status === 'pending' && inputMats.length === 0
          return (
            <div key={task.id} className="card-surface rounded-[24px] card-hover overflow-hidden group animate-fade-in-up border-l-[3px] border-l-transparent hover:border-l-accent-400">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-medium uppercase tracking-[0.1em] text-text-muted">{roleLabels[task.role]}岗</span>
                      <button
                        onClick={(e) => {
                          e.preventDefault()
                          openEditTask(task)
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity p-0.5 rounded hover:bg-white/10 text-text-muted hover:text-accent-500 cursor-pointer flex items-center justify-center"
                        title="编辑任务"
                      >
                        <Pencil className="w-3 h-3" />
                      </button>
                    </div>
                    <h3 className="text-[17px] font-medium text-text-main mt-1">{task.title}</h3>
                  </div>
                  <span className={`text-[11px] px-2.5 py-1 rounded-full font-medium ${
                    task.status === 'submitted' ? 'bg-success-soft text-success' :
                    task.status === 'generated' ? 'bg-kit-50 text-kit-600' :
                    task.status === 'ready' ? 'bg-accent-500/10 text-accent-400' : blocked ? 'bg-warning-soft text-warning' : 'bg-white/5 text-text-muted'
                  }`}>
                    {task.status === 'submitted' ? '已提交' : task.status === 'generated' ? '已生成' : task.status === 'ready' ? '待分析' : blocked ? '待补资料' : '待生成'}
                  </span>
                </div>
                <p className="text-[13px] text-text-muted leading-relaxed mb-4">{task.description}</p>

                <div className="flex flex-wrap items-center gap-2 text-[11px] mb-4 min-h-[24px]">
                  <span className={inputMats.length > 0 ? 'text-text-muted' : 'text-warning'}>
                    输入：{inputMats.length > 0 ? `${inputMats.length} 份已关联` : '暂无可用资料'}
                  </span>
                  {missingTags.length > 0 && (
                    <span className="text-warning">
                      缺少：{missingTags.join('、')}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {task.sourceTags.map((tag) => (
                    <span key={tag} className={`text-[10px] px-2 py-1 rounded-md ${sourceColorMap[tag] || 'bg-gray-50 text-text-muted'}`}>{tag}</span>
                  ))}
                </div>
              </div>

              <div className="px-6 py-3 bg-white/[0.03] border-t border-border-light flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 text-[12px] text-text-muted">
                    <UserCircle className="w-3.5 h-3.5" />{task.assignedTo}
                  </div>
                  <button
                    onClick={(e) => {
                      e.preventDefault()
                      const text = task.promptPreview
                      if (navigator.clipboard) {
                        navigator.clipboard.writeText(text).then(() => { setCopiedId(task.id); setTimeout(() => setCopiedId(null), 2000); showToast('Prompt 已复制', 'success') }).catch(() => showToast('复制失败', 'error'))
                      } else {
                        // Fallback for older browsers
                        const ta = document.createElement('textarea'); ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0'; document.body.appendChild(ta); ta.select(); document.execCommand('copy'); document.body.removeChild(ta)
                        setCopiedId(task.id); setTimeout(() => setCopiedId(null), 2000); showToast('Prompt 已复制', 'success')
                      }
                    }}
                    className="text-[11px] text-text-muted hover:text-accent-600 transition-colors flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" />
                    {copiedId === task.id ? '已复制' : '复制 Prompt'}
                  </button>
                </div>
                {blocked ? (
                  <Link to={`/materials/${projectSlug}`} className="text-[12px] font-medium text-warning flex items-center gap-1.5">
                    补充资料 <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                ) : (
                  <Link
                    to={`/workspace/${projectSlug}/${task.id}`}
                    className={`text-[12px] font-medium flex items-center gap-1.5 transition-all ${
                      task.status === 'submitted' ? 'text-gray-400' : 'text-accent-600 group-hover:gap-2'
                    }`}
                  >
                    {task.status === 'submitted' ? '查看结果' : task.status === 'generated' ? '继续编辑' : task.status === 'ready' ? '进入分析' : '待生成'}
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {tasks.length === 0 && (
        <div className="text-center py-20 text-text-muted text-[14px]">暂无任务卡，请先在资料库上传数据。</div>
      )}

      {/* Task form modal */}
      {showTaskForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 animate-fade-in" onClick={() => setShowTaskForm(false)}>
          <div className="bg-bg-surface rounded-2xl p-6 w-[560px] max-w-[95vw] shadow-2xl border border-border-default max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-[18px] font-medium text-text-main">{editingTask ? '编辑分析任务' : '添加自定义分析任务'}</h3>
              <button onClick={() => setShowTaskForm(false)} className="p-1 rounded-lg hover:bg-white/[0.06] cursor-pointer"><X className="w-4 h-4 text-text-muted" /></button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-medium text-text-muted mb-1.5">岗位角色 *</label>
                  <select
                    value={taskForm.role}
                    onChange={(e) => setTaskForm({ ...taskForm, role: e.target.value as Role })}
                    className="w-full text-[13px] px-3 py-2.5 border border-border-default rounded-xl focus:outline-none focus:border-accent-400 bg-bg-surface text-text-main cursor-pointer"
                  >
                    {Object.entries(roleLabels).map(([key, label]) => (
                      <option key={key} value={key}>{label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-text-muted mb-1.5">负责人</label>
                  <input
                    type="text"
                    value={taskForm.assignedTo}
                    onChange={(e) => setTaskForm({ ...taskForm, assignedTo: e.target.value })}
                    placeholder="例：张经理"
                    className="w-full text-[13px] px-3 py-2.5 border border-border-default rounded-xl focus:outline-none focus:border-accent-400 bg-transparent text-text-main"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-text-muted mb-1.5">任务标题 *</label>
                <input
                  type="text"
                  value={taskForm.title}
                  onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })}
                  placeholder="例：竞品高频痛点挖掘"
                  className="w-full text-[13px] px-3 py-2.5 border border-border-default rounded-xl focus:outline-none focus:border-accent-400 bg-transparent text-text-main"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-text-muted mb-1.5">任务描述 *</label>
                <textarea
                  value={taskForm.description}
                  onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })}
                  placeholder="请输入对该分析任务的简要描述..."
                  rows={2}
                  className="w-full text-[13px] px-3 py-2.5 border border-border-default rounded-xl focus:outline-none focus:border-accent-400 bg-transparent text-text-main resize-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-text-muted mb-1.5">输出格式 *</label>
                <input
                  type="text"
                  value={taskForm.outputFormat}
                  onChange={(e) => setTaskForm({ ...taskForm, outputFormat: e.target.value })}
                  placeholder="例：表格：痛点、表现与改进行动"
                  className="w-full text-[13px] px-3 py-2.5 border border-border-default rounded-xl focus:outline-none focus:border-accent-400 bg-transparent text-text-main"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-text-muted mb-1.5">资料来源需求</label>
                <div className="flex flex-wrap gap-2">
                  {['竞品评论', '商品参数', '客服记录', '历史文案'].map((tag) => {
                    const active = taskForm.sourceTags.includes(tag)
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => toggleTag(tag)}
                        className={`text-[11px] px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                          active
                            ? 'bg-accent-500/10 border-accent-500 text-accent-400 font-medium'
                            : 'border-border-default text-text-muted hover:border-text-muted'
                        }`}
                      >
                        {tag}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-text-muted mb-1.5">Prompt 提示词模板 (AI 分析预设指令)</label>
                <textarea
                  value={taskForm.promptPreview}
                  onChange={(e) => setTaskForm({ ...taskForm, promptPreview: e.target.value })}
                  placeholder="例：请分析提供的竞品数据，挖掘出三个最核心的痛点，并给出具体的营销卖点转化建议。"
                  rows={3}
                  className="w-full text-[12px] font-mono px-3 py-2.5 border border-border-default rounded-xl focus:outline-none focus:border-accent-400 bg-transparent text-text-main resize-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-text-muted mb-1.5">验收标准 (每行一个)</label>
                <textarea
                  value={taskForm.judgmentCriteriaStr}
                  onChange={(e) => setTaskForm({ ...taskForm, judgmentCriteriaStr: e.target.value })}
                  placeholder="例：&#10;痛点分析必须基于真实的差评评论&#10;建议方案有可执行的代码或文案细节"
                  rows={2}
                  className="w-full text-[13px] px-3 py-2.5 border border-border-default rounded-xl focus:outline-none focus:border-accent-400 bg-transparent text-text-main resize-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button onClick={() => setShowTaskForm(false)} className="btn-ghost text-[13px] cursor-pointer">取消</button>
              <button onClick={handleSaveTask} className="btn-primary-filled text-[13px] cursor-pointer">{editingTask ? '保存修改' : '创建任务'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
