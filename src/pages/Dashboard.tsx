import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Target, Trash2, RotateCcw, Pencil, X } from 'lucide-react'
import { roleLabels } from '../data/mock'
import { getProjects, getTasks, getAIResult, getWorkKits, deleteProject, resetAllData, updateProject } from '../services/db'
import type { Project } from '../types'

export default function Dashboard() {
  const [projects, setProjects] = useState(getProjects())
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [showReset, setShowReset] = useState(false)

  // Project form editing state
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [projectForm, setProjectForm] = useState({
    name: '',
    description: '',
    category: '',
    campaign: '',
  })

  const handleOpenEdit = (p: Project) => {
    setEditingProject(p)
    setProjectForm({
      name: p.name,
      description: p.description,
      category: p.category,
      campaign: p.campaign,
    })
  }

  const handleSaveProject = () => {
    if (!editingProject) return
    if (!projectForm.name.trim()) {
      alert('项目名称不能为空')
      return
    }
    const updated: Project = {
      ...editingProject,
      name: projectForm.name.trim(),
      description: projectForm.description.trim(),
      category: projectForm.category.trim(),
      campaign: projectForm.campaign.trim(),
    }
    updateProject(updated)
    setProjects(getProjects())
    setEditingProject(null)
  }

  const handleDelete = (id: string) => {
    deleteProject(id)
    setProjects(getProjects())
    setDeleteId(null)
  }

  const totalCompetitors = projects.reduce((s, p) => s + p.competitors.length, 0)
  const totalReviews = projects.reduce((s, p) => s + p.competitors.reduce((a, c) => a + c.reviewCount, 0), 0)
  const allTasks = projects.flatMap((p) => getTasks(p.id))
  const submittedTasks = allTasks.filter((t) => getAIResult(t.id)?.submitted).length
  const firstSlug = projects[0]?.slug || '618-hair-dryer'

  return (
    <div className="max-w-5xl">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-10 lg:mb-14">
        {[
          { value: String(totalCompetitors), label: '竞品覆盖', sub: `${projects.length} 品类 · ${totalCompetitors} 产品`, to: `/materials/${firstSlug}` },
          { value: totalReviews.toLocaleString(), label: '评论样本', sub: '全项目聚合数据', to: `/materials/${firstSlug}` },
          { value: `${submittedTasks}/${allTasks.length}`, label: '分析任务', sub: '已提交 / 总量', to: `/tasks/${firstSlug}` },
          { value: String(getWorkKits().length), label: 'Work Kit', sub: '可复用模板资产', to: '/archive' },
        ].map((s) => (
          <Link key={s.label} to={s.to} className="card-surface rounded-2xl p-6 card-hover">
            <div className="text-[36px] font-light tracking-[-0.03em] text-text-main leading-none mb-2">{s.value}</div>
            <div className="h-px w-8 bg-accent-400 mb-3" />
            <div className="text-[12px] font-semibold text-text-main mb-1">{s.label}</div>
            <div className="text-[11px] text-text-muted">{s.sub}</div>
          </Link>
        ))}
      </div>

      <div className="flex items-center justify-between mb-5">
        <span className="section-title">分析项目 · {projects.length}</span>
        <Link to="/create" className="text-[11px] font-medium text-accent-600 hover:text-accent-500 flex items-center gap-1">
          + 新建项目
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
        {projects.map((p) => {
          const tasks = getTasks(p.id)
          const done = tasks.filter((t) => getAIResult(t.id)?.submitted).length
          const pct = tasks.length > 0 ? Math.round((done / tasks.length) * 100) : 0
          return (
            <div key={p.id} className="relative group/card">
              <Link
                to={p.status === 'in_progress' ? `/materials/${p.slug}` : p.status === 'completed' ? `/report/${p.slug}` : `/tasks/${p.slug}`}
                className="card-surface rounded-[24px] card-hover overflow-hidden flex flex-col relative block"
              >
                {p.status === 'in_progress' && <div className="absolute top-0 left-4 right-4 h-[3px] rounded-b-full bg-accent-500" />}
                <div className={`p-6 flex-1 ${p.status === 'in_progress' ? 'pt-7' : ''}`}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-text-muted bg-white/3 px-2 py-1 rounded-md">{p.category}</span>
                    {p.status === 'in_progress' && <span className="w-[6px] h-[6px] rounded-full bg-accent-500 pulse-dot" />}
                    {p.status === 'completed' && <span className="w-[6px] h-[6px] rounded-full bg-success" />}
                  </div>
                  <h3 className="text-[15px] font-semibold text-text-main mb-2 leading-snug">{p.name}</h3>
                  <p className="text-[12px] text-text-muted leading-relaxed line-clamp-2 mb-4">{p.description}</p>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-accent-500 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-[10px] font-medium text-text-muted">{done}/{tasks.length}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-text-muted">
                    <span className="flex items-center gap-1"><Target className="w-3 h-3" />{p.competitors.length} 竞品</span>
                    <span>{p.createdAt}</span>
                  </div>
                </div>
                <div className="px-6 py-3 bg-white/3/50 border-t border-border-light flex items-center justify-between">
                  <span className="text-[11px] text-text-muted">{p.team.map((t) => roleLabels[t.role]).join(' · ')}</span>
                  <span className="text-[11px] font-medium text-accent-600 flex items-center gap-1 group-hover:gap-2 transition-all">
                    {p.status === 'in_progress' ? '进入' : p.status === 'completed' ? '查看' : '开始'}
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </Link>
              <div className="absolute top-3 right-3 flex items-center gap-1.5 opacity-0 group-hover/card:opacity-100 transition-opacity">
                <button
                  onClick={(e) => { e.preventDefault(); handleOpenEdit(p) }}
                  className="w-7 h-7 rounded-lg bg-bg-surface border border-border-light flex items-center justify-center hover:bg-white/5 cursor-pointer"
                  title="编辑项目"
                >
                  <Pencil className="w-3.5 h-3.5 text-text-muted hover:text-accent-500" />
                </button>
                <button
                  onClick={(e) => { e.preventDefault(); setDeleteId(p.id) }}
                  className="w-7 h-7 rounded-lg bg-bg-surface border border-border-light flex items-center justify-center hover:bg-red-500/10 hover:border-red-200 cursor-pointer"
                  title="删除项目"
                >
                  <Trash2 className="w-3.5 h-3.5 text-text-muted hover:text-error" />
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {deleteId && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
          <div className="bg-bg-surface rounded-2xl p-6 w-[360px] shadow-xl text-center">
            <div className="w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-5 h-5 text-error" />
            </div>
            <h3 className="text-[16px] font-medium text-text-main mb-2">确认删除项目？</h3>
            <p className="text-[13px] text-text-muted mb-6">删除后该项目的所有资料和任务卡将被永久移除。</p>
            <div className="flex items-center gap-3 justify-center">
              <button onClick={() => setDeleteId(null)} className="btn-ghost">取消</button>
              <button onClick={() => handleDelete(deleteId)} className="px-5 py-2.5 bg-error text-white text-sm font-medium rounded-xl hover:bg-red-600 transition-colors">确认删除</button>
            </div>
          </div>
        </div>
      )}

      {/* Reset data */}
      <div className="mt-12 text-center">
        <button onClick={() => setShowReset(true)} className="text-[11px] text-text-muted hover:text-accent-600 transition-colors flex items-center gap-1.5 mx-auto">
          <RotateCcw className="w-3 h-3" />恢复默认演示数据
        </button>
      </div>

      {showReset && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
          <div className="bg-bg-surface rounded-2xl p-6 w-[380px] shadow-xl text-center">
            <div className="w-11 h-11 rounded-xl bg-accent-50 flex items-center justify-center mx-auto mb-4">
              <RotateCcw className="w-5 h-5 text-accent-500" />
            </div>
            <h3 className="text-[16px] font-medium text-text-main mb-2">恢复默认演示数据？</h3>
            <p className="text-[13px] text-text-muted mb-6">将清除所有修改，恢复为初始的 3 个演示项目和完整示例数据。此操作不可撤销。</p>
            <div className="flex items-center gap-3 justify-center">
              <button onClick={() => setShowReset(false)} className="btn-ghost">取消</button>
              <button onClick={() => { resetAllData(); setProjects(getProjects()); setShowReset(false); window.location.reload() }} className="btn-primary-filled">
                确认恢复
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit project modal */}
      {editingProject && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 animate-fade-in" onClick={() => setEditingProject(null)}>
          <div className="bg-bg-surface rounded-2xl p-6 w-[480px] max-w-[90vw] shadow-2xl border border-border-default" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-[16px] font-medium text-text-main font-semibold">编辑项目信息</h3>
              <button onClick={() => setEditingProject(null)} className="p-1 rounded-lg hover:bg-white/[0.06] cursor-pointer"><X className="w-4 h-4 text-text-muted" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-medium text-text-muted mb-1.5 font-semibold">项目名称 *</label>
                <input
                  type="text"
                  value={projectForm.name}
                  onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })}
                  placeholder="例：618 美妆个护竞品分析"
                  className="w-full text-[13px] px-3 py-2.5 border border-border-default rounded-xl focus:outline-none focus:border-accent-400 bg-transparent text-text-main"
                  autoFocus
                />
              </div>
              
              <div>
                <label className="block text-[11px] font-medium text-text-muted mb-1.5 font-semibold">商品类目</label>
                <input
                  type="text"
                  value={projectForm.category}
                  onChange={(e) => setProjectForm({ ...projectForm, category: e.target.value })}
                  placeholder="例：个护美妆"
                  className="w-full text-[13px] px-3 py-2.5 border border-border-default rounded-xl focus:outline-none focus:border-accent-400 bg-transparent text-text-main"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-text-muted mb-1.5 font-semibold">活动场景</label>
                <input
                  type="text"
                  value={projectForm.campaign}
                  onChange={(e) => setProjectForm({ ...projectForm, campaign: e.target.value })}
                  placeholder="例：618 年中大促"
                  className="w-full text-[13px] px-3 py-2.5 border border-border-default rounded-xl focus:outline-none focus:border-accent-400 bg-transparent text-text-main"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-text-muted mb-1.5 font-semibold">项目描述</label>
                <textarea
                  value={projectForm.description}
                  onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                  placeholder="例：针对竞品评论、参数及文案进行多维度调研..."
                  rows={3}
                  className="w-full text-[13px] px-3 py-2.5 border border-border-default rounded-xl focus:outline-none focus:border-accent-400 bg-transparent text-text-main resize-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button onClick={() => setEditingProject(null)} className="btn-ghost text-[13px] cursor-pointer">取消</button>
              <button onClick={handleSaveProject} className="btn-primary-filled text-[13px] cursor-pointer">保存修改</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
