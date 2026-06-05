import { Link } from 'react-router-dom'
import { ArrowRight, Lightbulb, FileText, Upload, LayoutGrid, Sparkles, BarChart3, Package, Play, ShoppingBag } from 'lucide-react'

const steps = [
  {
    icon: Lightbulb, title: '大促前团队困境', subtitle: '各自整理，口径不统一',
    color: 'bg-orange-50 border-orange-200', iconColor: 'text-orange-600',
    body: (
      <div className="space-y-3">
        <p className="text-sm text-text-secondary leading-relaxed">
          每次大促前，运营、商品、文案、客服和设计各自收集竞品信息、整理评论、编写话术——每个人都在用 AI，但分析口径和输出格式各不相同。
        </p>
        <div className="grid grid-cols-2 gap-2 text-xs">
          {['运营花 3 小时手动整理竞品评论表格', '文案凭个人经验重写卖点话术', '客服从零开始梳理高频问题', '设计根据感觉调整详情页顺序'].map((item) => (
            <div key={item} className="flex items-start gap-2 bg-white/60 rounded-lg p-2.5 border border-gray-100">
              <span className="text-red-400 mt-px shrink-0">✕</span>
              <span className="text-text-secondary leading-relaxed">{item}</span>
            </div>
          ))}
        </div>
        <div className="bg-orange-50/80 border border-orange-200 rounded-xl p-3.5">
          <p className="text-sm text-orange-800 font-medium">问题：分析结果无法复用。下一次大促，所有人重新来一遍。</p>
        </div>
      </div>
    ),
  },
  {
    icon: FileText, title: '创建 618 分析项目', subtitle: '设定类目、竞品和输出目标',
    color: 'bg-ai-50 border-ai-200', iconColor: 'text-ai-600',
    body: (
      <div className="grid grid-cols-3 gap-3">
        {[
          { step: '01', title: '商品类目', desc: '个护小家电 · 高速吹风机' },
          { step: '02', title: '竞品范围', desc: '米家 H700 · 飞科 F8 · 徕芬 SE' },
          { step: '03', title: '输出目标', desc: '痛点矩阵、卖点、FAQ、话术、详情页、策略报告' },
        ].map((s) => (
          <div key={s.step} className="bg-white rounded-xl border border-gray-100 p-4 text-center">
            <div className="text-xs font-bold text-ai-400 mb-2">{s.step}</div>
            <div className="text-sm font-medium text-text-main mb-1">{s.title}</div>
            <div className="text-[11px] text-text-muted leading-relaxed">{s.desc}</div>
          </div>
        ))}
      </div>
    ),
  },
  {
    icon: Upload, title: '导入电商资料', subtitle: '竞品评论、商品信息、客服记录、历史文案',
    color: 'bg-emerald-50 border-emerald-200', iconColor: 'text-emerald-600',
    body: (
      <div className="grid grid-cols-2 gap-3">
        {[
          { label: '竞品评论', count: '3 个商品 · 1,286 条', detail: '覆盖京东、天猫、抖音商城三个平台' },
          { label: '商品参数', count: '1 份对比表', detail: '马达转速、功率、重量、风嘴类型' },
          { label: '客服记录', count: '52 条问题', detail: '售前比价 + 售后故障 + 退货退款' },
          { label: '历史文案', count: '4 份内容', detail: '详情页 · 直播回放 · 小红书 · 活动方案' },
        ].map((item) => (
          <div key={item.label} className="bg-white rounded-xl border border-gray-100 p-3.5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-text-main">{item.label}</span>
              <span className="text-[10px] text-text-muted">{item.count}</span>
            </div>
            <div className="text-[10px] text-text-muted">{item.detail}</div>
          </div>
        ))}
      </div>
    ),
  },
  {
    icon: LayoutGrid, title: '生成岗位分析任务', subtitle: '系统根据资料和岗位自动拆解',
    color: 'bg-purple-50 border-purple-200', iconColor: 'text-purple-600',
    body: (
      <div className="grid grid-cols-2 gap-3">
        {[
          { role: '商品岗', title: '竞品商品分析', desc: '识别产品问题、功能机会和选品建议' },
          { role: '文案岗', title: '卖点文案生成', desc: '用户原话 → 可传播商品卖点' },
          { role: '客服岗', title: '客服 FAQ', desc: '售前疑虑 + 售后风险话术' },
          { role: '设计岗', title: '详情页优化', desc: '重排信息层级和首屏重点' },
        ].map((card) => (
          <div key={card.role} className="bg-white rounded-xl border border-gray-100 p-4">
            <div className="text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-1.5">{card.role}</div>
            <div className="text-sm font-medium text-text-main mb-1.5">{card.title}</div>
            <div className="text-[11px] text-text-muted leading-relaxed">{card.desc}</div>
          </div>
        ))}
      </div>
    ),
  },
  {
    icon: Sparkles, title: 'AI 辅助岗位分析', subtitle: '基于同一资料源生成结构化分析',
    color: 'bg-ai-50 border-purple-200', iconColor: 'text-ai-600',
    body: (
      <div className="space-y-3">
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="text-xs font-semibold text-text-main mb-3">高频痛点聚类 Top 5</div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead><tr className="border-b border-gray-100">{['痛点', '频次', '严重度', '竞品覆盖', '可转化策略'].map((h) => <th key={h} className="text-left py-1.5 px-2 text-text-muted font-medium">{h}</th>)}</tr></thead>
              <tbody>
                {[['噪音偏大', '62次', '严重', '3/3', '低噪音风道'], ['发热烫手', '48次', '严重', '2/3', '恒温护发'], ['风力不足', '35次', '中等', '1/3', '高速马达']].map((row, i) => (
                  <tr key={i} className="border-b border-gray-50">{row.map((cell, j) => <td key={j} className={`py-1.5 px-2 ${j === 0 ? 'text-text-main font-medium' : 'text-text-secondary'}`}>{cell}</td>)}</tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <p className="text-[11px] text-text-muted text-center">每个岗位看到的是结构化输出，不是一段对话。</p>
      </div>
    ),
  },
  {
    icon: BarChart3, title: '汇总大促策略报告', subtitle: '跨岗位整合为可执行策略',
    color: 'bg-sky-50 border-sky-200', iconColor: 'text-sky-600',
    body: (
      <div className="grid grid-cols-5 gap-2">
        {['商品', '文案', '客服', '设计', '策略汇总'].map((label, i) => (
          <div key={label} className={`bg-white rounded-xl border p-3 text-center ${i === 4 ? 'border-biz-200 bg-biz-50/50' : 'border-gray-100'}`}>
            <div className="text-xs font-medium text-text-main mb-0.5">{label}</div>
            <div className="text-[10px] text-text-muted">{i < 4 ? '1 个分析结果' : '含执行清单'}</div>
          </div>
        ))}
      </div>
    ),
  },
  {
    icon: Package, title: '沉淀为 Work Kit', subtitle: '将有效流程保存为可复用模板',
    color: 'bg-emerald-50 border-emerald-200', iconColor: 'text-emerald-600',
    body: (
      <div className="space-y-2">
        {[
          { v: 'v1.0', desc: '初始模板：完成竞品评论分析、岗位任务卡和报告结构。' },
          { v: 'v1.1', desc: '客服风险增强：增加售前疑虑和售后风险分类。' },
          { v: 'v1.2', desc: '详情页首屏优化：增加信息优先级和图示化建议。' },
        ].map((v) => (
          <div key={v.v} className="flex items-center gap-3 bg-white rounded-xl border border-gray-100 p-3">
            <span className="text-[11px] font-bold text-kit-600 bg-kit-50 px-2.5 py-1 rounded-lg shrink-0">{v.v}</span>
            <span className="text-xs text-text-secondary leading-relaxed">{v.desc}</span>
          </div>
        ))}
        <div className="text-center pt-2">
          <span className="text-[11px] text-text-muted italic">不保存结果，只保存流程和模板——下次大促直接复用。</span>
        </div>
      </div>
    ),
  },
]

export default function Demo() {
  return (
    <div className="min-h-screen bg-bg-primary">
      <header className="max-w-4xl mx-auto pt-24 pb-14 px-6 text-center relative">
        <div className="absolute inset-0 -top-32 -bottom-8 bg-gradient-to-b from-biz-50/80 via-transparent to-transparent pointer-events-none" />
        <div className="relative">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-biz-100 to-rose-100 border border-biz-200/50 text-xs font-semibold text-biz-700 mb-8 tracking-wide shadow-sm">
          <ShoppingBag className="w-3.5 h-3.5" />
          Claw Work Kit Hub · 电商 AI 工作流演示
        </div>
        <h1 className="text-4xl font-bold text-text-main mb-4 tracking-tight leading-tight">
          从一次 618 分析<br />到可复用的电商 AI 工作包
        </h1>
        <p className="text-lg text-text-muted max-w-xl mx-auto mb-8 leading-relaxed">
          将竞品评论、客服反馈和岗位经验，转化为团队可复用的大促分析流程。
        </p>
        <div className="flex items-center justify-center gap-3">
          <Link to="/" className="inline-flex items-center gap-2 px-6 py-3 bg-ai-600 text-white text-sm font-semibold rounded-xl hover:bg-ai-700 transition-colors shadow-sm">
            进入产品演示 <ArrowRight className="w-4 h-4" />
          </Link>
          <Link to="/materials/p1" className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-border-default text-text-secondary text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors">
            <Play className="w-4 h-4" /> 开始 618 演示项目
          </Link>
        </div>
        </div>
      </header>

      <div className="max-w-3xl mx-auto px-6 pb-24">
        {steps.map((step, i) => (
          <div key={i} className="relative pl-14 pb-12 last:pb-0">
            {i < steps.length - 1 && <div className="absolute left-[27px] top-14 bottom-0 w-px bg-gray-200" />}
            <div className={`absolute left-3 top-1 w-12 h-12 rounded-2xl border-2 ${step.color} flex items-center justify-center bg-white shadow-sm`}>
              <step.icon className={`w-5 h-5 ${step.iconColor}`} />
            </div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <h2 className="text-lg font-semibold text-text-main">{step.title}</h2>
                <span className="text-xs text-text-muted font-medium">{step.subtitle}</span>
              </div>
              <div className={`card-surface rounded-2xl p-6 mt-3 ${i % 2 === 0 ? 'bg-gradient-to-br from-white via-white to-orange-50/30' : 'bg-gradient-to-br from-white via-white to-blue-50/30'}`}>{step.body}</div>
            </div>
          </div>
        ))}
      </div>

      <footer className="max-w-3xl mx-auto text-center pb-24 px-6">
        <div className="hero-gradient rounded-2xl p-10 shadow-[0_8px_32px_rgba(249,115,22,0.15)]">
          <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-5 shadow-sm">
            <Sparkles className="w-7 h-7 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-white mb-2">准备好沉淀团队的电商 AI 经验了吗？</h3>
          <p className="text-sm text-white/80 mb-6 max-w-md mx-auto leading-relaxed">
            从第一个大促分析项目开始，将有效的 AI 工作流程保存为团队可复用的资产。
          </p>
          <Link to="/create" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-biz-600 text-sm font-semibold rounded-xl hover:bg-white/90 transition-all shadow-sm btn-biz-glow">
            创建第一个大促分析项目 <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </footer>
    </div>
  )
}
