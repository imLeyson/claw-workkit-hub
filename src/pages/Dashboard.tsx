import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Target } from 'lucide-react'
import { mockProjects } from '../data/mock'
import { roleLabels } from '../data/mock'
import { useCountUp } from '../components/useCountUp'

const project = mockProjects[0]

export default function Dashboard() {
  const [show, setShow] = useState(false)
  useEffect(() => { setShow(true) }, [])

  const stat1 = useCountUp(String(project.competitors.length), 1000, show)
  const stat2 = useCountUp('1286', 1400, show)
  const stat3 = useCountUp('5', 800, show)
  const stat4 = useCountUp('2', 600, show)

  return (
    <div className="max-w-5xl">
      {/* Hero */}
      <div className="mb-20 animate-fade-in-up" style={{ animationDelay: '0ms' }}>
        <div className="flex items-center gap-3 mb-4">
          <span className="text-[10px] font-medium uppercase tracking-[0.1em] text-accent-600 bg-accent-50 px-2 py-0.5 rounded-md animate-scale-in" style={{ animationDelay: '200ms' }}>PROMOTION WORK KIT SYSTEM</span>
        </div>
        <h1 className="text-[48px] font-light leading-[1.1] tracking-[-0.02em] text-text-main mb-4 max-w-[620px] animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          PromoKit AI
        </h1>
        <p className="text-[17px] text-text-secondary leading-relaxed mb-2 animate-fade-in-up" style={{ animationDelay: '150ms' }}>电商大促 AI 工作包系统</p>
        <p className="text-[14px] text-text-muted leading-relaxed max-w-[460px] mb-8 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          围绕竞品评论、商品卖点、客服反馈和历史文案，生成可复用的大促分析流程。覆盖 {project.competitors.length} 个竞品品牌、{project.competitors.reduce((s, c) => s + c.reviewCount, 0)} 条用户评论。
        </p>
      </div>

      {/* Stats row */}
      <div className="border-t border-border-default pt-16 mb-20">
        <div className="grid grid-cols-4 gap-8 stagger">
          {[
            { number: stat1, label: '竞品商品', sub: '3 款高速吹风机' },
            { number: stat2, label: '评论样本', sub: `好评率 ${Math.round(project.competitors.reduce((s, c) => s + c.rating, 0) / 3)}%` },
            { number: stat3, label: '分析任务', sub: '1 张已提交结果' },
            { number: stat4, label: '可复用模板', sub: 'Work Kit 资产库' },
          ].map((stat) => (
            <div key={stat.label} className="animate-fade-in-up">
              <div className="stat-number mb-2">{stat.number}</div>
              <div className="h-px w-8 bg-accent-400 mb-3" />
              <div className="stat-label mb-1">{stat.label}</div>
              <div className="text-[12px] text-text-muted">{stat.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Section: Projects */}
      <div className="mb-6 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
        <span className="section-title">分析项目</span>
      </div>

      <div className="grid grid-cols-3 gap-5 mb-20 stagger">
        {mockProjects.map((p) => (
          <Link key={p.id} to={p.status === 'in_progress' ? `/materials/${p.slug}` : p.status === 'completed' ? `/report/${p.slug}` : `/tasks/${p.slug}`} className="card-surface rounded-[24px] card-hover overflow-hidden group flex flex-col relative animate-fade-in-up">
            {p.status === 'in_progress' && <div className="absolute top-0 left-4 right-4 h-[3px] rounded-b-full bg-accent-500" />}
            <div className={`p-6 flex-1 ${p.status === 'in_progress' ? 'pt-7' : ''}`}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[10px] font-medium uppercase tracking-[0.08em] text-text-muted bg-gray-50 px-2 py-1 rounded-md">{p.category}</span>
                {p.status === 'in_progress' && <span className="w-[6px] h-[6px] rounded-full bg-accent-500 pulse-dot" />}
                {p.status === 'completed' && <span className="w-[6px] h-[6px] rounded-full bg-success" />}
                {p.status === 'draft' && <span className="w-[6px] h-[6px] rounded-full bg-gray-300" />}
              </div>
              <h3 className="text-[16px] font-medium text-text-main mb-2 leading-snug">{p.name}</h3>
              <p className="text-[13px] text-text-muted leading-relaxed line-clamp-2 mb-4">{p.description}</p>
              <div className="flex flex-wrap items-center gap-3 text-[11px] text-text-muted">
                <span className="flex items-center gap-1"><Target className="w-3 h-3" />{p.competitors.map((c) => c.name).join(' / ')}</span>
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
        ))}
      </div>

      {/* Insight */}
      <div className="animate-fade-in-up" style={{ animationDelay: '200ms' }}>
        <div className="insight-block py-2 max-w-[560px]">
          <p className="text-[14px] leading-relaxed">
            把一次有效的大促分析流程，沉淀为团队可复用的 AI 工作包。
          </p>
        </div>
      </div>
    </div>
  )
}
