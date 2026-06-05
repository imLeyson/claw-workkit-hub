import { useState, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  Sparkles, ArrowRight, FileText, Target, UserCircle, Bot, Eye, ShoppingBag, Database, Tag, Loader2,
} from 'lucide-react'
import { mockProjects, mockTaskCards, mockMaterials, roleLabels } from '../data/mock'
import StatusBadge from '../components/StatusBadge'
import PageHeader from '../components/PageHeader'
import { useToast } from '../components/Toast'

const roleIconsMap: Record<string, typeof Target> = {
  operations: Target, merchandise: ShoppingBag, copywriting: FileText, customer_service: Bot, design: Eye,
}

const roleColors: Record<string, string> = {
  operations: 'bg-biz-50 text-biz-600', merchandise: 'bg-ai-50 text-ai-600', copywriting: 'bg-purple-50 text-purple-600', customer_service: 'bg-green-50 text-green-600', design: 'bg-orange-50 text-orange-600',
}

const sourceColorMap: Record<string, string> = {
  '竞品评论': 'bg-biz-50 text-biz-700', '商品参数': 'bg-ai-50 text-ai-700', '客服记录': 'bg-green-50 text-green-700', '历史文案': 'bg-purple-50 text-purple-700',
}

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
      <PageHeader
        title="岗位分析任务"
        description={`${project.name} — 系统根据资料库内容，为各岗位自动生成可执行的 AI 分析任务卡。`}
        actions={
          <div className="flex items-center gap-2">
            {!allReady && (
              <button
                onClick={generateAll}
                disabled={isGenerating}
                className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-ai-500 to-ai-700 text-white text-sm font-medium rounded-xl hover:from-ai-600 hover:to-ai-800 disabled:opacity-50 transition-all shadow-sm btn-primary-glow"
              >
                {isGenerating ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Sparkles className="w-4 h-4" />
                )}
                {isGenerating ? `生成中... (${tasks.filter((t) => t.status === 'ready').length}/${tasks.length})` : '生成全部任务卡'}
              </button>
            )}
            {anyGenerated && (
              <Link to={`/report/${projectId}`} className="inline-flex items-center gap-2 px-4 py-2.5 border border-border-default text-text-secondary text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors">
                查看策略报告
              </Link>
            )}
          </div>
        }
      />

      {/* 生成依据 */}
      <div className="card-surface rounded-2xl p-4 mb-6">
        <h3 className="text-xs font-semibold text-text-main mb-3 flex items-center gap-2">
          <Database className="w-3.5 h-3.5 text-ai-600" />
          任务卡生成依据
        </h3>
        <div className="grid grid-cols-4 gap-3 text-xs">
          {[
            { label: '当前活动', value: '618 年中大促 · 个护小家电', icon: Tag },
            { label: '资料来源', value: `${project.competitors.length} 个竞品 · ${materials.length} 份资料 · 1,286 条评论`, icon: Database },
            { label: '参与岗位', value: project.team.map((t) => roleLabels[t.role]).join('、'), icon: UserCircle },
            { label: '输出目标', value: '痛点矩阵 + 卖点 + FAQ + 话术 + 详情页', icon: Target },
          ].map((item) => (
            <div key={item.label} className="bg-gray-50 rounded-xl p-3">
              <div className="flex items-center gap-1.5 text-text-muted mb-1"><item.icon className="w-3 h-3" />{item.label}</div>
              <div className="font-medium text-text-main">{item.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 因果提示 */}
      <div className="bg-ai-50/50 border border-ai-100 rounded-xl p-3.5 text-center mb-6">
        <p className="text-xs text-ai-700">任务卡由当前电商资料和岗位目标自动生成，每张卡对应一个岗位角色的 AI 分析任务。</p>
      </div>

      {/* 任务卡网格 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tasks.map((task) => {
          const RoleIcon = roleIconsMap[task.role] || Target
          const roleColor = roleColors[task.role] || 'bg-gray-50 text-gray-600'
          const inputMats = materials.filter((m) => task.inputMaterials.includes(m.id))

          return (
            <div key={task.id} className="card-surface rounded-2xl overflow-hidden card-hover">
              <div className="px-5 pt-4 pb-3">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className={`w-8 h-8 rounded-xl ${roleColor} flex items-center justify-center`}>
                      <RoleIcon className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-[11px] font-medium text-text-muted uppercase tracking-wide">{roleLabels[task.role]}岗</div>
                      <div className="text-sm font-medium text-text-main">{task.title}</div>
                    </div>
                  </div>
                  <StatusBadge status={task.status} />
                </div>
                <p className="text-xs text-text-muted leading-relaxed">{task.description}</p>
              </div>

              <div className="px-5 py-3 bg-gray-50/50 border-y border-border-light space-y-2">
                <div className="flex items-start gap-2 text-xs">
                  <FileText className="w-3.5 h-3.5 text-gray-400 mt-px shrink-0" />
                  <span className="text-text-muted">输入资料：{inputMats.map((m) => m.label.split(' ')[0]).join(' · ')}</span>
                </div>
                <div className="flex items-start gap-2 text-xs">
                  <Bot className="w-3.5 h-3.5 text-gray-400 mt-px shrink-0" />
                  <span className="text-text-muted">Prompt：<span className="line-clamp-1">{task.promptPreview}</span></span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="text-text-muted shrink-0">数据来源：</span>
                  <div className="flex flex-wrap gap-1">
                    {task.sourceTags.map((tag) => (
                      <span key={tag} className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${sourceColorMap[tag] || 'bg-gray-100 text-gray-600'}`}>{tag}</span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="px-5 py-3 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-text-muted">
                  <UserCircle className="w-3.5 h-3.5" />{task.assignedTo}
                </div>
                <Link
                  to={`/workspace/${projectId}/${task.id}`}
                  className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-xl transition-all ${
                    task.status === 'submitted' ? 'bg-gray-100 text-gray-400' :
                    task.status === 'generated' ? 'bg-kit-50 text-kit-600 hover:bg-purple-100' :
                    task.status === 'ready' ? 'bg-ai-50 text-ai-700 hover:bg-ai-100' : 'bg-gray-100 text-gray-400'
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
        <div className="text-center py-16 text-text-muted text-sm">暂无任务卡，请先在电商资料库上传数据。</div>
      )}
    </div>
  )
}
