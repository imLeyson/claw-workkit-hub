import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Package,
  Target,
  Users,
  FileText,
  BarChart3,
  Clock,
  ShoppingBag,
  MessageSquareText,
  Palette,
} from 'lucide-react'
import { mockProjects } from '../data/mock'
import { roleLabels } from '../data/mock'
import PageHeader from '../components/PageHeader'
import MetricCard from '../components/MetricCard'
import StatusBadge from '../components/StatusBadge'
import InsightCard from '../components/InsightCard'

export default function Dashboard() {
  const project = mockProjects[0]

  return (
    <div className="max-w-5xl">
      <PageHeader
        title="618 竞品评论分析工作台"
        description="围绕商品评论、客服反馈和历史文案，生成可复用的大促 AI 分析工作包。"
        actions={
          <Link
            to="/create"
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-biz-500 to-biz-600 text-white text-sm font-medium rounded-xl hover:from-biz-600 hover:to-biz-700 transition-all shadow-sm btn-biz-glow"
          >
            新建分析项目
          </Link>
        }
      />

      {/* Hero CTA */}
      <div className="hero-gradient rounded-2xl p-6 mb-6 shadow-[0_8px_32px_rgba(249,115,22,0.2)]">
        <div className="flex items-start justify-between gap-6">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-semibold text-white/90 bg-white/20 px-2 py-0.5 rounded-full backdrop-blur-sm">618 年中大促</span>
              <span className="text-[10px] text-white/70">个护小家电</span>
            </div>
            <h2 className="text-lg font-semibold text-white mb-2">
              进入 618 分析项目：{project.name}
            </h2>
            <p className="text-sm text-white/80 mb-5 max-w-lg leading-relaxed">
              已覆盖 {project.competitors.length} 个竞品品牌、{project.competitors.reduce((s, c) => s + c.reviewCount, 0)} 条用户评论。
              从电商资料库开始，完整体验一次 AI 分析到 Work Kit 沉淀的流程。
            </p>
            <div className="flex items-center gap-3">
              <Link
                to={`/materials/${project.id}`}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-biz-600 text-sm font-semibold rounded-xl hover:bg-white/90 transition-all shadow-sm btn-biz-glow"
              >
                进入 618 分析项目
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/demo"
                className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white/90 border border-white/30 rounded-xl hover:bg-white/10 transition-colors backdrop-blur-sm"
              >
                查看演示模式
              </Link>
            </div>
          </div>
          {/* 活动状态卡 */}
          <div className="hidden lg:block bg-white/15 backdrop-blur-md rounded-xl p-4 shrink-0 w-[220px] border border-white/20">
            <div className="text-xs font-semibold text-white mb-3 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-300" />
              当前活动状态
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between"><span className="text-white/60">活动</span><span className="font-medium text-white">618 年中大促</span></div>
              <div className="flex justify-between"><span className="text-white/60">商品类目</span><span className="font-medium text-white">个护小家电</span></div>
              <div className="flex justify-between"><span className="text-white/60">竞品数量</span><span className="font-medium text-white">{project.competitors.length}</span></div>
              <div className="flex justify-between"><span className="text-white/60">评论样本</span><span className="font-medium text-white">1,286 条</span></div>
              <div className="flex justify-between"><span className="text-white/60">当前阶段</span><span className="font-medium text-amber-300">AI 分析中</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* 核心数据卡 */}
      <div className="mb-6">
        <h3 className="text-xs font-semibold text-text-muted uppercase tracking-widest mb-3">618 项目数据</h3>
        <div className="grid grid-cols-4 gap-3">
          <MetricCard icon={ShoppingBag} label="竞品商品" value={String(project.competitors.length)} sub="3 款高速吹风机" progress={100} color="blue" />
          <MetricCard icon={MessageSquareText} label="评论样本" value="1,286" sub={`好评率 ${Math.round(project.competitors.reduce((s, c) => s + c.rating, 0) / 3)}%`} progress={100} color="green" />
          <MetricCard icon={Target} label="已生成任务" value="5" sub="1 张已生成分析" progress={20} color="blue" />
          <MetricCard icon={Package} label="可复用模板" value="1" sub="竞品评论分析 Work Kit" progress={100} color="green" />
        </div>
      </div>

      {/* 电商分析链路 */}
      <div className="card-surface rounded-2xl p-5 mb-6">
        <h3 className="text-xs font-semibold text-text-muted uppercase tracking-widest mb-4">电商分析链路</h3>
        <div className="flex items-center gap-3">
          {[
            { icon: MessageSquareText, label: '竞品评论', color: 'bg-gradient-to-br from-biz-50 to-orange-100', iconColor: 'text-biz-600' },
            { icon: Target, label: '用户痛点', color: 'bg-gradient-to-br from-red-50 to-rose-100', iconColor: 'text-red-600' },
            { icon: BarChart3, label: '商品卖点', color: 'bg-gradient-to-br from-ai-50 to-blue-100', iconColor: 'text-ai-600' },
            { icon: MessageSquareText, label: '客服 FAQ', color: 'bg-gradient-to-br from-emerald-50 to-teal-100', iconColor: 'text-emerald-600' },
            { icon: Palette, label: '详情页优化', color: 'bg-gradient-to-br from-purple-50 to-violet-100', iconColor: 'text-purple-600' },
            { icon: FileText, label: '大促策略', color: 'bg-gradient-to-br from-biz-50 to-orange-100', iconColor: 'text-biz-600' },
          ].map((item, i, arr) => (
            <div key={item.label} className="flex items-center gap-3 flex-1">
              <div className="flex flex-col items-center gap-2">
                <div className={`w-10 h-10 rounded-xl ${item.color} flex items-center justify-center shadow-sm`}>
                  <item.icon className={`w-4 h-4 ${item.iconColor}`} />
                </div>
                <span className="text-[10px] text-text-muted font-medium whitespace-nowrap">{item.label}</span>
              </div>
              {i < arr.length - 1 && (
                <div className="flex-1 flex items-center justify-center">
                  <div className="h-px flex-1 bg-gradient-to-r from-gray-300 to-gray-300" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 今日待处理 */}
      <div className="card-surface rounded-2xl p-5 mb-6">
        <h3 className="text-xs font-semibold text-text-muted uppercase tracking-widest mb-4">今日待处理</h3>
        <div className="grid grid-cols-5 gap-3">
          {[
            { role: '运营岗', task: '确认主推策略和价格表达', icon: Target, accent: 'bg-gradient-to-r from-biz-500 to-rose-400' },
            { role: '商品岗', task: '待确认高频差评分类', icon: ShoppingBag, accent: 'bg-gradient-to-r from-ai-500 to-blue-400' },
            { role: '文案岗', task: '待优化卖点标题方向', icon: FileText, accent: 'bg-gradient-to-r from-purple-500 to-violet-400' },
            { role: '客服岗', task: '待补充售后风险话术', icon: MessageSquareText, accent: 'bg-gradient-to-r from-emerald-500 to-teal-400' },
            { role: '设计岗', task: '待整理详情页首屏信息', icon: Palette, accent: 'bg-gradient-to-r from-rose-500 to-pink-400' },
          ].map((item) => (
            <div key={item.role} className="bg-white rounded-xl p-3 border border-border-light hover:shadow-md transition-shadow relative overflow-hidden">
              <div className={`absolute top-0 left-0 right-0 h-[3px] ${item.accent}`} />
              <div className="text-[10px] font-medium text-text-muted mb-1 mt-0.5">{item.role}</div>
              <div className="flex items-start gap-1.5">
                <item.icon className="w-3.5 h-3.5 text-text-muted mt-0.5 shrink-0" />
                <span className="text-xs text-text-secondary leading-relaxed">{item.task}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 历史项目 */}
      <div className="mb-6">
        <h3 className="text-xs font-semibold text-text-muted uppercase tracking-widest mb-3">历史分析项目</h3>
        <div className="space-y-3">
          {mockProjects.map((p) => (
            <div key={p.id} className="card-surface rounded-2xl p-5 card-hover">
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-3">
                  <h4 className="text-sm font-medium text-text-main">{p.name}</h4>
                  <span className="text-[10px] text-text-muted bg-gray-50 px-2 py-0.5 rounded-full">{p.category}</span>
                  <StatusBadge status={p.status} />
                </div>
                {p.status === 'in_progress' && (
                  <Link to={`/tasks/${p.id}`} className="inline-flex items-center gap-1.5 text-xs font-medium text-ai-600 hover:text-ai-700 transition-colors">
                    进入工作区 <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                )}
                {p.status === 'completed' && (
                  <Link to={`/report/${p.id}`} className="inline-flex items-center gap-1.5 text-xs font-medium text-ai-600 hover:text-ai-700 transition-colors">
                    查看报告 <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>
              <p className="text-sm text-text-secondary mb-3 line-clamp-2 leading-relaxed">{p.description}</p>
              <div className="flex items-center gap-3 text-xs text-text-muted flex-wrap">
                <span className="flex items-center gap-1"><Target className="w-3 h-3" />竞品：{p.competitors.map((c) => c.name).join('、')}</span>
                <span className="flex items-center gap-1"><Users className="w-3 h-3" />团队：{p.team.map((t) => roleLabels[t.role]).join('、')}</span>
                <span className="flex items-center gap-1"><FileText className="w-3 h-3" />创建于 {p.createdAt}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 洞察 */}
      <InsightCard title="大促团队缺少的不是 AI，而是可复用的分析流程">
        每次大促前，运营、商品、文案、客服和设计都要重新整理评论、复盘卖点和编写话术。
        Work Kit 的价值，是把一次有效的 AI 分析流程沉淀为下一次活动可直接复用的团队资产。
      </InsightCard>
    </div>
  )
}
