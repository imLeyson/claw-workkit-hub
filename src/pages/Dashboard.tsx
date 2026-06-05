import { Link } from 'react-router-dom'
import { ArrowRight, Target } from 'lucide-react'
import { mockProjects } from '../data/mock'
import { roleLabels } from '../data/mock'

const project = mockProjects[0]

export default function Dashboard() {
  return (
    <div className="max-w-5xl">
      {/* Hero */}
      <div className="mb-20">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-[6px] h-[6px] rounded-full bg-accent-500" />
          <span className="text-[11px] font-medium uppercase tracking-[0.12em] text-text-muted">618 年中大促 · 个护小家电</span>
        </div>
        <h1 className="text-[48px] font-light leading-[1.1] tracking-[-0.02em] text-text-main mb-6 max-w-[620px]">
          竞品评论分析<br />AI 工作流系统
        </h1>
        <p className="text-[15px] text-text-secondary leading-relaxed max-w-[440px] mb-8">
          覆盖 {project.competitors.length} 个竞品品牌、{project.competitors.reduce((s, c) => s + c.reviewCount, 0)} 条用户评论，从资料库到 Work Kit 沉淀，完整体验一次大促 AI 分析流程。
        </p>
        <div className="flex items-center gap-3">
          <Link to={`/materials/${project.id}`} className="btn-primary-filled">
            进入 618 分析项目
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link to="/demo" className="btn-ghost">查看演示模式</Link>
        </div>
      </div>

      {/* Stats row */}
      <div className="border-t border-border-default pt-16 mb-20">
        <div className="grid grid-cols-4 gap-8">
          {[
            { number: String(project.competitors.length), label: '竞品商品', sub: '3 款高速吹风机' },
            { number: '1,286', label: '评论样本', sub: `好评率 ${Math.round(project.competitors.reduce((s, c) => s + c.rating, 0) / 3)}%` },
            { number: '5', label: '分析任务', sub: '1 张已生成结果' },
            { number: '2', label: '可复用模板', sub: 'Work Kit 资产库' },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="stat-number mb-2">{stat.number}</div>
              <div className="h-px w-8 bg-accent-400 mb-3" />
              <div className="stat-label mb-1">{stat.label}</div>
              <div className="text-[12px] text-text-muted">{stat.sub}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Section: Projects */}
      <div className="mb-6">
        <span className="section-title">分析项目</span>
      </div>

      <div className="grid grid-cols-3 gap-5 mb-20">
        {mockProjects.map((p) => (
          <Link key={p.id} to={p.status === 'in_progress' ? `/materials/${p.id}` : p.status === 'completed' ? `/report/${p.id}` : `/tasks/${p.id}`} className="card-surface rounded-[24px] card-hover overflow-hidden group flex flex-col relative">
            {p.status === 'in_progress' && <div className="absolute top-0 left-4 right-4 h-[3px] rounded-b-full bg-accent-500" />}
            <div className={`p-6 flex-1 ${p.status === 'in_progress' ? 'pt-7' : ''}`}>
              <div className="flex items-center gap-2 mb-3">
                <span className="text-[10px] font-medium uppercase tracking-[0.08em] text-text-muted bg-gray-50 px-2 py-1 rounded-md">{p.category}</span>
                {p.status === 'in_progress' && <span className="w-[6px] h-[6px] rounded-full bg-accent-500" />}
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
      <div className="mb-20">
        <div className="insight-block py-2 max-w-[560px]">
          <p className="text-[14px] leading-relaxed">
            大促团队缺少的不是 AI，而是可复用的分析流程。
            Work Kit 的价值，是把一次有效的 AI 分析流程沉淀为下一次活动可直接复用的团队资产。
          </p>
        </div>
      </div>

      {/* CTA */}
      <div className="bg-gray-50 rounded-[24px] p-10 flex items-center justify-between">
        <div>
          <h3 className="text-[18px] font-medium text-text-main mb-1">准备好开始了吗？</h3>
          <p className="text-[13px] text-text-muted">创建新的大促分析项目，或浏览已有的工作包模板。</p>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/create" className="btn-primary-filled">
            新建分析项目
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link to="/archive" className="btn-ghost">
            浏览资产库
            <ArrowRight className="w-[14px] h-[14px]" />
          </Link>
        </div>
      </div>
    </div>
  )
}
