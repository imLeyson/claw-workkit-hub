import { useState, useCallback, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowRight, UserCircle, Loader2, Sparkles, Copy, ChevronDown, ChevronUp } from 'lucide-react'
import { roleLabels } from '../data/mock'
import { getProjectBySlug, getMaterials, getTasks, getWorkKits, updateTask, refreshTaskMaterialLinks } from '../services/db'
import { useToast } from '../components/Toast'
import type { MaterialType } from '../types'

const sourceColorMap: Record<string, string> = {
  '竞品评论': 'bg-accent-50 text-accent-500',
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
  const { showToast } = useToast()
  const [isGenerating, setIsGenerating] = useState(false)
  const [showAssociation, setShowAssociation] = useState(true)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  if (!project) return <div className="text-text-muted text-sm p-8">项目不存在</div>

  const anyGenerated = tasks.some((t) => t.status === 'generated' || t.status === 'submitted')
  const allReady = tasks.every((t) => t.status === 'ready' || t.status === 'generated' || t.status === 'submitted')
  const readyPendingTasks = tasks.filter((t) => t.status === 'pending' && t.inputMaterials.length > 0)
  const blockedPendingTasks = tasks.filter((t) => t.status === 'pending' && t.inputMaterials.length === 0)

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
      <div className="flex items-start justify-between mb-14">
        <div>
          <h1 className="text-[32px] font-light tracking-[-0.02em] text-text-main mb-3">岗位分析任务</h1>
          <p className="text-[14px] text-text-secondary max-w-sm leading-relaxed">{project.name} — 系统根据资料自动生成可执行的 AI 分析任务卡。</p>
        </div>
        <div className="flex items-center gap-3">
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
      </div>

      {/* Smart association — collapsible */}
      <div className="mb-10 bg-accent-500/[0.04] rounded-2xl border border-accent-500/15 overflow-hidden">
        <button onClick={() => setShowAssociation(!showAssociation)} className="w-full p-4 flex items-center justify-between text-left">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-accent-500" />
            <span className="text-[11px] font-semibold text-accent-600 uppercase tracking-[0.06em]">智能知识库 · 推荐 {Math.min(5, getWorkKits().length)} 个高复用 Work Kit</span>
          </div>
          {showAssociation ? <ChevronUp className="w-4 h-4 text-accent-400" /> : <ChevronDown className="w-4 h-4 text-accent-400" />}
        </button>
        {showAssociation && (
        <div className="px-4 pb-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
          {getWorkKits().sort((a, b) => b.reuseCount - a.reuseCount).slice(0, 5).map((k) => (
            <Link key={k.id} to="/archive" className="bg-bg-surface rounded-xl p-3 border border-accent-500/15 text-[11px] hover:shadow-sm transition-shadow">
              <div className="font-medium text-text-main mb-0.5 truncate">{k.name.slice(0, 12)}{k.name.length > 12 ? '...' : ''}</div>
              <div className="text-text-muted">{k.version} · 复用 {k.reuseCount} 次</div>
            </Link>
          ))}
        </div>
        )}
      </div>

      {/* Task card grid */}
      <div className="grid grid-cols-2 gap-5 stagger">
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
                    <span className="text-[10px] font-medium uppercase tracking-[0.1em] text-text-muted">{roleLabels[task.role]}岗</span>
                    <h3 className="text-[17px] font-medium text-text-main mt-1">{task.title}</h3>
                  </div>
                  <span className={`text-[11px] px-2.5 py-1 rounded-full font-medium ${
                    task.status === 'submitted' ? 'bg-success-soft text-success' :
                    task.status === 'generated' ? 'bg-kit-50 text-kit-600' :
                    task.status === 'ready' ? 'bg-accent-50 text-accent-600' : blocked ? 'bg-warning-soft text-warning' : 'bg-white/[0.06] text-gray-500'
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
    </div>
  )
}
