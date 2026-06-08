import { Link } from 'react-router-dom'
import { ArrowRight, Target } from 'lucide-react'
import { mockProjects, mockTaskCards, mockAIResults, mockWorkKits } from '../data/mock'
import { roleLabels } from '../data/mock'

export default function Dashboard() {
  const totalCompetitors = mockProjects.reduce((s, p) => s + p.competitors.length, 0)
  const totalReviews = mockProjects.reduce((s, p) => s + p.competitors.reduce((a, c) => a + c.reviewCount, 0), 0)
  const totalTasks = Object.values(mockTaskCards).flat().length
  const submittedTasks = Object.values(mockTaskCards).flat().filter((t) => mockAIResults[t.id]?.submitted).length

  return (
    <div className="max-w-5xl">
      {/* Stats row — clickable */}
      <div className="grid grid-cols-4 gap-6 mb-14">
        {[
          { value: String(totalCompetitors), label: '竞品覆盖', sub: `${mockProjects.length} 品类 · ${totalCompetitors} 产品`, to: '/materials/618-hair-dryer' },
          { value: totalReviews.toLocaleString(), label: '评论样本', sub: '三个项目聚合数据', to: '/materials/618-hair-dryer' },
          { value: `${submittedTasks}/${totalTasks}`, label: '分析任务', sub: '已提交 / 总量', to: '/tasks/618-hair-dryer' },
          { value: String(mockWorkKits.length), label: 'Work Kit', sub: '可复用模板资产', to: '/archive' },
        ].map((s) => (
          <Link key={s.label} to={s.to} className="card-surface rounded-2xl p-6 card-hover">
            <div className="text-[36px] font-light tracking-[-0.03em] text-text-main leading-none mb-2">{s.value}</div>
            <div className="h-px w-8 bg-accent-400 mb-3" />
            <div className="text-[12px] font-semibold text-text-main mb-1">{s.label}</div>
            <div className="text-[11px] text-text-muted">{s.sub}</div>
          </Link>
        ))}
      </div>

      {/* Section: Projects */}
      <div className="mb-5">
        <span className="section-title">分析项目</span>
      </div>

      <div className="grid grid-cols-3 gap-5">
        {mockProjects.map((p) => {
          const tasks = mockTaskCards[p.id] ?? []
          const done = tasks.filter((t) => mockAIResults[t.id]?.submitted).length
          const pct = tasks.length > 0 ? Math.round((done / tasks.length) * 100) : 0
          return (
            <Link key={p.id} to={p.status === 'in_progress' ? `/materials/${p.slug}` : p.status === 'completed' ? `/report/${p.slug}` : `/tasks/${p.slug}`} className="card-surface rounded-[24px] card-hover overflow-hidden group flex flex-col relative">
              {p.status === 'in_progress' && <div className="absolute top-0 left-4 right-4 h-[3px] rounded-b-full bg-accent-500" />}
              <div className={`p-6 flex-1 ${p.status === 'in_progress' ? 'pt-7' : ''}`}>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-text-muted bg-gray-50 px-2 py-1 rounded-md">{p.category}</span>
                  {p.status === 'in_progress' && <span className="w-[6px] h-[6px] rounded-full bg-accent-500 pulse-dot" />}
                  {p.status === 'completed' && <span className="w-[6px] h-[6px] rounded-full bg-success" />}
                </div>
                <h3 className="text-[15px] font-semibold text-text-main mb-2 leading-snug">{p.name}</h3>
                <p className="text-[12px] text-text-muted leading-relaxed line-clamp-2 mb-4">{p.description}</p>
                {/* Progress bar */}
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
          )
        })}
      </div>
    </div>
  )
}
