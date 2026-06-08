import { useState, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowRight, UserCircle, Loader2, Sparkles, Copy, ChevronDown, ChevronUp } from 'lucide-react'
import { mockProjects, mockTaskCards, mockMaterials, roleLabels, mockWorkKits } from '../data/mock'
import { useToast } from '../components/Toast'

const sourceColorMap: Record<string, string> = {
  '竞品评论': 'bg-accent-50 text-accent-700',
  '商品参数': 'bg-gray-100 text-text-muted',
  '客服记录': 'bg-success-soft text-success',
  '历史文案': 'bg-accent-50/50 text-accent-700',
}

export default function TaskCards() {
  const { projectSlug } = useParams<{ projectSlug: string }>()
  const project = mockProjects.find((p) => p.slug === projectSlug)
  const [tasks, setTasks] = useState(mockTaskCards[project?.id ?? ''] ?? [])
  const materials = mockMaterials[project?.id ?? ''] ?? []
  const { showToast } = useToast()
  const [isGenerating, setIsGenerating] = useState(false)
  const [showAssociation, setShowAssociation] = useState(true)
  const [copiedId, setCopiedId] = useState<string | null>(null)

  if (!project) return <div className="text-text-muted text-sm p-8">项目不存在</div>

  const anyGenerated = tasks.some((t) => t.status === 'generated' || t.status === 'submitted')
  const allReady = tasks.every((t) => t.status === 'ready' || t.status === 'generated' || t.status === 'submitted')

  const generateAll = useCallback(() => {
    if (isGenerating) return
    setIsGenerating(true)
    const pending = tasks.filter((t) => t.status === 'pending')
    let delay = 0
    pending.forEach((t) => {
      setTimeout(() => {
        setTasks((prev) => prev.map((x) => x.id === t.id ? { ...x, status: 'ready' as const } : x))
      }, delay)
      delay += 300
    })
    setTimeout(() => {
      setIsGenerating(false)
      showToast(`已生成 ${pending.length} 张任务卡`, 'success')
    }, delay + 200)
  }, [tasks, isGenerating, showToast])

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
      <div className="mb-10 bg-accent-50/40 rounded-2xl border border-accent-100 overflow-hidden">
        <button onClick={() => setShowAssociation(!showAssociation)} className="w-full p-4 flex items-center justify-between text-left">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-accent-500" />
            <span className="text-[11px] font-semibold text-accent-600 uppercase tracking-[0.06em]">智能知识库 · 为你关联 5 个相关经验</span>
          </div>
          {showAssociation ? <ChevronUp className="w-4 h-4 text-accent-400" /> : <ChevronDown className="w-4 h-4 text-accent-400" />}
        </button>
        {showAssociation && (
        <div className="px-4 pb-4 grid grid-cols-5 gap-2">
          {mockWorkKits.slice(0, 2).map((k) => (
            <div key={k.id} className="bg-white rounded-xl p-3 border border-accent-100 text-[11px]">
              <div className="font-medium text-text-main mb-0.5 truncate">{k.name.slice(0, 10)}...</div>
              <div className="text-text-muted">v{k.version} · {k.reuseCount} 次复用</div>
            </div>
          ))}
          {[{ label: '吹风机竞品分析', tag: '评论挖掘' }, { label: '直播话术框架', tag: '文案生成' }, { label: '详情页优化模板', tag: '设计参考' }].map((item) => (
            <div key={item.label} className="bg-white rounded-xl p-3 border border-border-light text-[11px]">
              <div className="font-medium text-text-main mb-0.5 truncate">{item.label}</div>
              <div className="text-text-muted">{item.tag}</div>
            </div>
          ))}
        </div>
        )}
      </div>

      {/* Task card grid */}
      <div className="grid grid-cols-2 gap-5 stagger">
        {tasks.map((task, idx) => {
          const inputMats = materials.filter((m) => task.inputMaterials.includes(m.id))
          const isFirst = idx === 0
          return (
            <div key={task.id} className={`card-surface rounded-[24px] card-hover overflow-hidden group animate-fade-in-up ${isFirst ? 'col-span-2' : 'border-l-[3px] border-l-transparent hover:border-l-accent-400'}`}>
              {isFirst && <div className="h-[3px] bg-accent-500" />}
              <div className={`${isFirst ? 'p-8' : 'p-6'}`}>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <span className="text-[10px] font-medium uppercase tracking-[0.1em] text-text-muted">{roleLabels[task.role]}岗</span>
                    <h3 className={`font-medium text-text-main mt-1 ${isFirst ? 'text-[20px]' : 'text-[17px]'}`}>{task.title}</h3>
                  </div>
                  <span className={`text-[11px] px-2.5 py-1 rounded-full font-medium ${
                    task.status === 'submitted' ? 'bg-success-soft text-success' :
                    task.status === 'generated' ? 'bg-accent-50 text-accent-600' :
                    task.status === 'ready' ? 'bg-accent-50 text-accent-600' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {task.status === 'submitted' ? '已提交' : task.status === 'generated' ? '已生成' : task.status === 'ready' ? '可分析' : '待生成'}
                  </span>
                </div>
                <p className={`text-text-muted leading-relaxed mb-4 ${isFirst ? 'text-[14px]' : 'text-[13px]'}`}>{task.description}</p>

                {isFirst && (
                  <div className="flex items-center gap-4 text-[11px] text-text-muted mb-4">
                    <span>输入：{inputMats.map((m) => m.label.split(' ')[0]).join(' · ')}</span>
                  </div>
                )}

                <div className="flex items-center gap-2 flex-wrap">
                  {task.sourceTags.map((tag) => (
                    <span key={tag} className={`text-[10px] px-2 py-1 rounded-md ${sourceColorMap[tag] || 'bg-gray-50 text-text-muted'}`}>{tag}</span>
                  ))}
                </div>
              </div>

              <div className={`${isFirst ? 'px-8' : 'px-6'} py-3 bg-gray-50/50 border-t border-border-light flex items-center justify-between`}>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 text-[12px] text-text-muted">
                    <UserCircle className="w-3.5 h-3.5" />{task.assignedTo}
                  </div>
                  <button
                    onClick={(e) => { e.preventDefault(); navigator.clipboard.writeText(task.promptPreview); setCopiedId(task.id); setTimeout(() => setCopiedId(null), 2000); showToast('Prompt 已复制', 'success') }}
                    className="text-[11px] text-text-muted hover:text-accent-600 transition-colors flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" />
                    {copiedId === task.id ? '已复制' : '复制 Prompt'}
                  </button>
                </div>
                <Link
                  to={`/workspace/${projectSlug}/${task.id}`}
                  className={`text-[12px] font-medium flex items-center gap-1.5 transition-all ${
                    task.status === 'submitted' ? 'text-gray-400' : 'text-accent-600 group-hover:gap-2'
                  }`}
                >
                  {task.status === 'submitted' ? '查看结果' : task.status === 'generated' ? '继续编辑' : task.status === 'ready' ? '进入分析' : '待生成'}
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
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
