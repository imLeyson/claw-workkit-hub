import { useState, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowRight, UserCircle, Loader2, Sparkles } from 'lucide-react'
import { mockProjects, mockTaskCards, mockMaterials, roleLabels } from '../data/mock'
import { useToast } from '../components/Toast'

export default function TaskCards() {
  const { projectId } = useParams<{ projectId: string }>()
  const project = mockProjects.find((p) => p.id === projectId)
  const [tasks, setTasks] = useState(mockTaskCards[projectId ?? ''] ?? [])
  const materials = mockMaterials[projectId ?? ''] ?? []
  const { showToast } = useToast()
  const [isGenerating, setIsGenerating] = useState(false)

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
      <div className="flex items-start justify-between mb-12">
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
            <Link to={`/report/${projectId}`} className="btn-ghost">查看策略报告</Link>
          )}
        </div>
      </div>

      {/* Context bar */}
      <div className="flex items-center gap-6 text-[12px] text-text-muted mb-10">
        <span>{project.competitors.length} 个竞品</span>
        <span>·</span>
        <span>{materials.length} 份资料</span>
        <span>·</span>
        <span>{project.team.length} 个岗位</span>
      </div>

      {/* Task card grid */}
      <div className="grid grid-cols-2 gap-4">
        {tasks.map((task, idx) => {
          const inputMats = materials.filter((m) => task.inputMaterials.includes(m.id))
          const large = idx === 0
          return (
            <div key={task.id} className={`card-surface rounded-[24px] card-hover overflow-hidden ${large ? 'col-span-2' : ''}`}>
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <span className="text-[10px] font-medium uppercase tracking-[0.1em] text-text-muted">{roleLabels[task.role]}岗</span>
                    <h3 className="text-[17px] font-medium text-text-main mt-1">{task.title}</h3>
                  </div>
                  <span className={`text-[11px] px-2.5 py-1 rounded-full font-medium ${
                    task.status === 'submitted' ? 'bg-success-soft text-success' :
                    task.status === 'generated' ? 'bg-accent-50 text-accent-600' :
                    task.status === 'ready' ? 'bg-accent-50 text-accent-600' : 'bg-gray-100 text-gray-500'
                  }`}>
                    {task.status === 'submitted' ? '已提交' : task.status === 'generated' ? '已生成' : task.status === 'ready' ? '可分析' : '待生成'}
                  </span>
                </div>
                <p className="text-[13px] text-text-muted leading-relaxed mb-4">{task.description}</p>

                <div className="flex items-center gap-4 text-[11px] text-text-muted mb-4">
                  <span>输入：{inputMats.map((m) => m.label.split(' ')[0]).join(' · ')}</span>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {task.sourceTags.map((tag) => (
                    <span key={tag} className="text-[10px] px-2 py-1 rounded-md bg-gray-50 text-text-muted">{tag}</span>
                  ))}
                </div>
              </div>

              <div className="px-6 py-3 bg-gray-50/50 border-t border-border-light flex items-center justify-between">
                <div className="flex items-center gap-2 text-[12px] text-text-muted">
                  <UserCircle className="w-3.5 h-3.5" />{task.assignedTo}
                </div>
                <Link
                  to={`/workspace/${projectId}/${task.id}`}
                  className={`text-[12px] font-medium flex items-center gap-1.5 transition-all ${
                    task.status === 'submitted' ? 'text-gray-400' : 'text-accent-600 hover:gap-2'
                  }`}
                >
                  {task.status === 'submitted' ? '已提交' : task.status === 'generated' ? '继续编辑' : task.status === 'ready' ? '进入分析' : '待生成'}
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
