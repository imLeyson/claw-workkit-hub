import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Target, Trash2 } from 'lucide-react'
import { roleLabels } from '../data/mock'
import { getProjects, getTasks, getAIResult, getWorkKits, deleteProjectData } from '../services/db'

export default function Dashboard() {
  const [projects, setProjects] = useState(getProjects())
  const [deleteId, setDeleteId] = useState<string | null>(null)

  const handleDelete = (id: string) => {
    const updated = projects.filter((p) => p.id !== id)
    setProjects(updated)
    localStorage.setItem('promokit_projects', JSON.stringify(updated))
    deleteProjectData(id)
    setDeleteId(null)
  }

  const totalCompetitors = projects.reduce((s, p) => s + p.competitors.length, 0)
  const totalReviews = projects.reduce((s, p) => s + p.competitors.reduce((a, c) => a + c.reviewCount, 0), 0)
  const allTasks = projects.flatMap((p) => getTasks(p.id))
  const submittedTasks = allTasks.filter((t) => getAIResult(t.id)?.submitted).length

  return (
    <div className="max-w-5xl">
      <div className="grid grid-cols-4 gap-6 mb-14">
        {[
          { value: String(totalCompetitors), label: '竞品覆盖', sub: `${projects.length} 品类 · ${totalCompetitors} 产品`, to: '/materials/618-hair-dryer' },
          { value: totalReviews.toLocaleString(), label: '评论样本', sub: '三个项目聚合数据', to: '/materials/618-hair-dryer' },
          { value: `${submittedTasks}/${allTasks.length}`, label: '分析任务', sub: '已提交 / 总量', to: '/tasks/618-hair-dryer' },
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
        <Link to="/create" className="text-[11px] font-medium text-accent-600 hover:text-accent-700 flex items-center gap-1">
          + 新建项目
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-5">
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
                    <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-text-muted bg-gray-50 px-2 py-1 rounded-md">{p.category}</span>
                    {p.status === 'in_progress' && <span className="w-[6px] h-[6px] rounded-full bg-accent-500 pulse-dot" />}
                    {p.status === 'completed' && <span className="w-[6px] h-[6px] rounded-full bg-success" />}
                  </div>
                  <h3 className="text-[15px] font-semibold text-text-main mb-2 leading-snug">{p.name}</h3>
                  <p className="text-[12px] text-text-muted leading-relaxed line-clamp-2 mb-4">{p.description}</p>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full bg-accent-500 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-[10px] font-medium text-text-muted">{done}/{tasks.length}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-text-muted">
                    <span className="flex items-center gap-1"><Target className="w-3 h-3" />{p.competitors.length} 竞品</span>
                    <span>{p.createdAt}</span>
                  </div>
                </div>
                <div className="px-6 py-3 bg-gray-50/50 border-t border-border-light flex items-center justify-between">
                  <span className="text-[11px] text-text-muted">{p.team.map((t) => roleLabels[t.role]).join(' · ')}</span>
                  <span className="text-[11px] font-medium text-accent-600 flex items-center gap-1 group-hover:gap-2 transition-all">
                    {p.status === 'in_progress' ? '进入' : p.status === 'completed' ? '查看' : '开始'}
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </Link>
              <button
                onClick={(e) => { e.preventDefault(); setDeleteId(p.id) }}
                className="absolute top-3 right-3 w-7 h-7 rounded-lg bg-white border border-border-light flex items-center justify-center opacity-0 group-hover/card:opacity-100 transition-opacity hover:bg-red-50 hover:border-red-200"
              >
                <Trash2 className="w-3.5 h-3.5 text-text-muted" />
              </button>
            </div>
          )
        })}
      </div>

      {deleteId && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-[360px] shadow-xl text-center">
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
    </div>
  )
}
