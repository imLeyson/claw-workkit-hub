import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ArrowUpRight, ArrowDownRight, FileText, MessageSquareText, Palette, Target, Repeat, ChevronLeft, ChevronRight, Search, Layout, Monitor } from 'lucide-react'
import Logo from '../components/Logo'

/* ── Decorative background shapes ── */
function Decors({ theme }: { theme: 'light' | 'dark' }) {
  const c = theme === 'dark'
    ? { large: 'rgba(255,255,255,0.02)', mid: 'rgba(255,255,255,0.03)', small: 'rgba(224,123,76,0.08)', accent: 'rgba(224,123,76,0.12)' }
    : { large: 'rgba(0,0,0,0.015)', mid: 'rgba(0,0,0,0.02)', small: 'rgba(224,123,76,0.06)', accent: 'rgba(224,123,76,0.10)' }

  const w = typeof window !== 'undefined' ? window.innerWidth : 1200
  const h = typeof window !== 'undefined' ? window.innerHeight : 800

  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
      {/* Large geometric circles */}
      <circle cx={w * 0.92} cy={h * 0.12} r={h * 0.25} fill={c.large} />
      <circle cx={w * 0.08} cy={h * 0.88} r={h * 0.3} fill={c.mid} />
      <circle cx={w * 0.85} cy={h * 0.85} r={h * 0.15} fill={c.accent} />
      {/* Decorative lines */}
      <line x1={w * 0.05} y1={h * 0.35} x2={w * 0.15} y2={h * 0.35} stroke={c.small} strokeWidth="2" strokeLinecap="round" />
      <line x1={w * 0.88} y1={h * 0.55} x2={w * 0.95} y2={h * 0.55} stroke={c.small} strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

/* ── Animated divider ── */
function Divider() {
  return (
    <div className="flex items-center gap-3 my-6">
      <div className="h-px flex-1 bg-border-default" />
      <div className="w-[6px] h-[6px] rounded-full bg-accent-500 pulse-dot" />
      <div className="h-px flex-1 bg-border-default" />
    </div>
  )
}

/* ── Slide data ── */
const slides = [
  {
    theme: 'dark' as const,
    content: (
      <div className="flex flex-col items-center text-center max-w-2xl">
        <div className="animate-scale-in mb-8" style={{ animationDelay: '0ms' }}>
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-accent-500/10 scale-150 animate-pulse" style={{ animationDuration: '3s' }} />
            <Logo variant="icon" theme="light" size={64} />
          </div>
        </div>
        <div className="animate-fade-in-up" style={{ animationDelay: '150ms' }}>
          <h1 className="text-[60px] font-light tracking-[-0.02em] text-white mb-4">PromoKit AI</h1>
        </div>
        <div className="animate-fade-in-up" style={{ animationDelay: '250ms' }}>
          <p className="text-[18px] text-white/50 mb-3">电商大促 AI 工作包系统</p>
        </div>
        <div className="animate-fade-in-up" style={{ animationDelay: '350ms' }}>
          <div className="w-20 h-px bg-accent-500 my-8 mx-auto" />
        </div>
        <div className="animate-fade-in-up" style={{ animationDelay: '450ms' }}>
          <p className="text-[15px] text-white/35 max-w-md leading-relaxed">
            把一次有效的大促分析流程<br />沉淀为团队可复用的 AI 工作包
          </p>
        </div>
        <div className="animate-fade-in-up mt-16 flex items-center gap-6 text-[11px] text-white/20" style={{ animationDelay: '600ms' }}>
          <span>618</span><span>·</span><span>双 11</span><span>·</span><span>新品上架</span><span>·</span><span>爆品复盘</span>
        </div>
      </div>
    ),
  },
  {
    theme: 'light' as const,
    content: (
      <div className="max-w-2xl w-full">
        <div className="animate-fade-in-up" style={{ animationDelay: '0ms' }}>
          <span className="section-title mb-6 block">The Problem</span>
        </div>
        <div className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <h2 className="text-[38px] font-light tracking-[-0.02em] text-text-main mb-8 leading-tight">
            每次大促前<br />团队都在重复做同一件事
          </h2>
        </div>
        <div className="space-y-3 mb-8 stagger">
          {[
            { role: '运营', pain: '花 3 小时手动整理竞品评论表格', icon: Target, color: 'bg-accent-50 text-accent-600' },
            { role: '文案', pain: '凭个人经验重写卖点话术', icon: FileText, color: 'bg-accent-50 text-accent-600' },
            { role: '客服', pain: '从零开始梳理高频问题', icon: MessageSquareText, color: 'bg-accent-50 text-accent-600' },
            { role: '设计', pain: '根据感觉调整详情页顺序', icon: Palette, color: 'bg-accent-50 text-accent-600' },
          ].map((item) => (
            <div key={item.role} className="animate-fade-in-up flex items-center gap-4 bg-white rounded-2xl p-4 border border-border-default hover-lift">
              <div className={`w-10 h-10 rounded-xl ${item.color} flex items-center justify-center shrink-0`}>
                <item.icon className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <span className="text-[12px] font-medium text-text-muted uppercase tracking-wider">{item.role}岗</span>
                <p className="text-[14px] text-text-secondary">{item.pain}</p>
              </div>
              <span className="text-[18px] text-red-300 font-light">✕</span>
            </div>
          ))}
        </div>
        <div className="animate-fade-in-up" style={{ animationDelay: '500ms' }}>
          <div className="bg-sidebar rounded-2xl p-5 text-center">
            <p className="text-[17px] text-white/80 leading-relaxed">
              分析结果无法复用。<span className="text-accent-400 font-medium">下一次大促，重新来一遍。</span>
            </p>
          </div>
        </div>
      </div>
    ),
  },
  {
    theme: 'light' as const,
    content: (
      <div className="max-w-2xl w-full">
        <div className="animate-fade-in-up" style={{ animationDelay: '0ms' }}>
          <span className="section-title mb-6 block">The Solution</span>
        </div>
        <div className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <h2 className="text-[38px] font-light tracking-[-0.02em] text-text-main mb-3 leading-tight">PromoKit AI</h2>
          <p className="text-[16px] text-text-secondary mb-8 leading-relaxed">
            围绕竞品评论、商品卖点、客服反馈和历史文案，将一次有效的大促 AI 分析流程
            <span className="text-accent-600 font-medium"> 沉淀为团队可复用的工作包</span>。
          </p>
        </div>
        <div className="grid grid-cols-2 gap-3 stagger mb-8">
          {[
            { label: '竞品评论挖掘', desc: '自动聚类用户痛点', num: '01' },
            { label: '卖点文案生成', desc: '用户原话转可传播卖点', num: '02' },
            { label: '客服 FAQ 生成', desc: '售前售后风险话术', num: '03' },
            { label: '详情页优化', desc: '数据驱动的信息层级', num: '04' },
            { label: '大促策略汇总', desc: '跨岗位整合执行清单', num: '05' },
            { label: 'Work Kit 沉淀', desc: '版本迭代持续积累', num: '06' },
          ].map((item) => (
            <div key={item.label} className="animate-fade-in-up bg-white rounded-2xl p-4 border border-border-default hover-lift flex items-start gap-3">
              <span className="text-[11px] font-semibold text-accent-400 mt-0.5 shrink-0 w-5">{item.num}</span>
              <div>
                <div className="text-[14px] font-medium text-text-main">{item.label}</div>
                <div className="text-[12px] text-text-muted mt-0.5">{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  {
    theme: 'light' as const,
    content: (
      <div className="max-w-3xl w-full">
        <div className="animate-fade-in-up" style={{ animationDelay: '0ms' }}>
          <span className="section-title mb-6 block">The Workflow</span>
        </div>
        <div className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <h2 className="text-[38px] font-light tracking-[-0.02em] text-text-main mb-10 leading-tight">
            6 步完成大促分析
          </h2>
        </div>
        <div className="flex items-start gap-0 stagger mb-10">
          {[
            { step: '01', label: '创建项目', desc: '设定类目与竞品' },
            { step: '02', label: '导入资料', desc: '评论/参数/客服' },
            { step: '03', label: '任务生成', desc: '按岗位拆解 AI 任务' },
            { step: '04', label: 'AI 分析', desc: '结构化结果输出' },
            { step: '05', label: '策略报告', desc: '跨岗位汇总' },
            { step: '06', label: '沉淀复用', desc: '保存为 Work Kit' },
          ].map((item, i, arr) => (
            <div key={item.step} className="flex-1 flex items-start animate-fade-in-up">
              <div className="text-center flex-1">
                <div className="w-14 h-14 rounded-2xl bg-accent-50 flex items-center justify-center mx-auto mb-3 hover:bg-accent-100 transition-colors">
                  <span className="text-[16px] font-semibold text-accent-600">{item.step}</span>
                </div>
                <div className="text-[13px] font-medium text-text-main">{item.label}</div>
                <div className="text-[11px] text-text-muted mt-1">{item.desc}</div>
              </div>
              {i < arr.length - 1 && (
                <div className="pt-7 -ml-1 mr-1">
                  <ArrowRight className="w-3.5 h-3.5 text-accent-300" />
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="animate-fade-in-up" style={{ animationDelay: '600ms' }}>
          <div className="bg-sidebar rounded-2xl p-6 text-center">
            <p className="text-[15px] text-white/70 leading-relaxed">
              <span className="text-accent-400 font-medium">核心价值</span>：下一次大促，几分钟内启动，而非几小时。
            </p>
          </div>
        </div>
      </div>
    ),
  },
  {
    theme: 'light' as const,
    content: (
      <div className="w-full max-w-5xl">
        <div className="animate-fade-in-up" style={{ animationDelay: '0ms' }}>
          <span className="section-title mb-4 block">Design Process Mapping</span>
        </div>
        <div className="animate-fade-in-up mb-8" style={{ animationDelay: '100ms' }}>
          <h2 className="text-[34px] font-light tracking-[-0.02em] text-text-main mb-2 leading-tight">PromoKit AI 的设计过程映射</h2>
          <p className="text-[13px] text-text-muted max-w-xl leading-relaxed">将抽象需求逐步转化为可落地的系统架构与用户界面，形成可复用的 AI 工作包流程。</p>
        </div>

        {/* Four columns */}
        <div className="grid grid-cols-4 gap-3 mb-6 stagger">
          {[
            {
              num: '01', label: '需求池归类', desc: '从实际工作中归纳出关键问题',
              icon: Search, iconBg: 'bg-accent-50', iconColor: 'text-accent-500',
              items: [
                { t: '资料分散', d: '评论、商品信息、客服反馈等资料分散在不同文件和岗位。' },
                { t: '岗位断裂', d: '不同岗位关注点不同，分析口径和输出不统一。' },
                { t: '经验不可交接', d: '老手的 AI 使用方式停留在个人经验中，难以交接给新人。' },
                { t: '大促重复整理', d: '每次大促都从零开始，缺少沉淀与复用机制。' },
              ],
            },
            {
              num: '02', label: '定义与策略', desc: '将问题转化为产品定义与核心策略',
              icon: Target, iconBg: 'bg-accent-50', iconColor: 'text-accent-600',
              header: (
                <div className="bg-accent-50 rounded-xl p-3 mb-3 text-center">
                  <div className="text-[13px] font-semibold text-accent-700">PromoKit AI</div>
                  <div className="text-[10px] text-accent-600/70 mt-0.5 leading-snug">面向电商团队的大促 AI 工作包系统</div>
                </div>
              ),
              items: [
                { t: '资料结构化', d: '统一资料类型与结构，便于调用。' },
                { t: '岗位任务化', d: '按岗位拆解任务，明确目标与输出。' },
                { t: 'AI 分析可控化', d: '结构化分析 + 质量检查 + 人工判断。' },
                { t: '报告输出标准化', d: '统一报告结构，便于决策与执行。' },
                { t: '流程资产化', d: '沉淀为可复用的 Work Kit 资产。' },
              ],
            },
            {
              num: '03', label: '系统架构设计', desc: '将策略转化为系统结构与功能模块',
              icon: Layout, iconBg: 'bg-blue-50', iconColor: 'text-blue-600',
              items: [
                { t: '电商资料库', d: '集中管理评论、商品、客服、文案等资料，支持结构化与标签化。' },
                { t: '岗位分析任务', d: '基于资料生成任务卡，明确输入、目标、Prompt 与输出格式。' },
                { t: 'AI 分析工作台', d: '三栏式分析界面：上下文 / AI 结果 / 质量检查。', accent: true },
                { t: '大促策略报告', d: '汇总各岗位结果，生成可执行的大促策略报告。' },
                { t: 'AI 工作包资产库', d: '沉淀资料结构、任务、Prompt、格式、规则与反馈记录。', accent: true },
              ],
            },
            {
              num: '04', label: '界面设计', desc: '将系统结构转化为用户可操作的界面',
              icon: Monitor, iconBg: 'bg-green-50', iconColor: 'text-green-600',
              items: [
                { t: 'Dashboard', d: '项目总览与进度看板，快速了解分析状态。' },
                { t: '资料库', d: '导入与管理电商资料，为任务生成提供依据。' },
                { t: '任务卡', d: '展示岗位任务，明确目标、输入与输出要求。' },
                { t: 'AI 分析工作台', d: '执行分析任务，生成结构化结果并完成质量检查。', accent: true },
                { t: '报告页', d: '汇总分析结果，输出可执行策略报告。' },
                { t: '资产库', d: '保存复用 Work Kit，沉淀团队方法与经验。', accent: true },
              ],
            },
          ].map((col) => {
            const ColIcon = col.icon
            return (
              <div key={col.num} className="animate-fade-in-up flex flex-col">
                {/* Column header */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-[22px] font-light text-accent-400 tracking-[-0.02em]">{col.num}</span>
                  <div className={`w-7 h-7 rounded-lg ${col.iconBg} flex items-center justify-center`}>
                    <ColIcon className={`w-3.5 h-3.5 ${col.iconColor}`} />
                  </div>
                  <span className="text-[13px] font-medium text-text-main">{col.label}</span>
                </div>
                <p className="text-[11px] text-text-muted mb-3 leading-relaxed">{col.desc}</p>

                {/* Product definition card for column 2 */}
                {col.header}

                {/* Item list */}
                <div className="space-y-2 flex-1">
                  {col.items.map((item, i) => (
                    <div key={i} className={`rounded-xl p-2.5 text-[11px] leading-relaxed border border-border-light ${(item as {accent?: boolean}).accent ? 'bg-accent-50/30 border-accent-100' : 'bg-gray-50/50'}`}>
                      <span className={`font-medium ${(item as {accent?: boolean}).accent ? 'text-accent-700' : 'text-text-main'}`}>{item.t}</span>
                      <span className="text-text-muted ml-1">{item.d}</span>
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {/* Connection labels */}
        <div className="relative mb-6">
          {/* Top: 转换 arrows */}
          <div className="flex items-center px-[12%] mb-1">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex-1 flex items-center justify-center animate-fade-in-up" style={{ animationDelay: `${400 + i * 80}ms` }}>
                <div className="flex items-center gap-1 text-[10px] text-accent-500 font-medium">
                  <ArrowUpRight className="w-3 h-3" />
                  <span className="uppercase tracking-wider">转换</span>
                </div>
              </div>
            ))}
          </div>
          {/* Bottom: 决策 arrows */}
          <div className="flex items-center px-[12%]">
            {[0, 1, 2].map((i) => (
              <div key={i} className="flex-1 flex items-center justify-center animate-fade-in-up" style={{ animationDelay: `${500 + i * 80}ms` }}>
                <div className="flex items-center gap-1 text-[10px] text-gray-400 font-medium">
                  <ArrowDownRight className="w-3 h-3" />
                  <span className="uppercase tracking-wider">决策</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom summary */}
        <div className="animate-fade-in-up bg-sidebar rounded-2xl p-5 flex items-start gap-6" style={{ animationDelay: '600ms' }}>
          <div className="shrink-0">
            <span className="text-[12px] font-medium text-accent-400 uppercase tracking-wider">最终目标</span>
          </div>
          <p className="text-[13px] text-white/65 leading-relaxed">
            把一次有效的大促分析流程，转化为团队<span className="text-accent-400 font-medium">可复用</span>、<span className="text-accent-400 font-medium">可交接</span>、<span className="text-accent-400 font-medium">可迭代</span>的 AI 工作包资产，持续提升团队效率与决策质量。
          </p>
        </div>
      </div>
    ),
  },
  {
    theme: 'light' as const,
    content: (
      <div className="max-w-2xl w-full">
        <div className="animate-fade-in-up" style={{ animationDelay: '0ms' }}>
          <span className="section-title mb-6 block">Key Feature</span>
        </div>
        <div className="animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          <h2 className="text-[38px] font-light tracking-[-0.02em] text-text-main mb-8 leading-tight">
            AI 工作包资产库
          </h2>
        </div>
        <div className="animate-scale-in bg-white rounded-[24px] p-8 border border-border-default mb-6" style={{ animationDelay: '200ms' }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl bg-accent-50 flex items-center justify-center">
              <Repeat className="w-6 h-6 text-accent-500" />
            </div>
            <div>
              <div className="text-[17px] font-medium text-text-main">618 竞品评论分析 Work Kit</div>
              <div className="text-[12px] text-text-muted">v1.2 · 复用 3 次 · 5 个岗位</div>
            </div>
          </div>
          <Divider />
          <div className="grid grid-cols-2 gap-3 text-[12px] mb-0">
            {['竞品商品分析 (商品岗)', '卖点文案转译 (文案岗)', '客服 FAQ (客服岗)', '详情页优化 (设计岗)', '大促策略汇总 (运营岗)'].map((t, i) => (
              <div key={t} className="bg-gray-50 rounded-xl p-3 text-text-secondary flex items-center gap-2 animate-fade-in-up" style={{ animationDelay: `${300 + i * 60}ms` }}>
                <span className="w-1.5 h-1.5 rounded-full bg-accent-400 shrink-0" />{t}
              </div>
            ))}
          </div>
        </div>
        <div className="animate-fade-in-up" style={{ animationDelay: '500ms' }}>
          <p className="text-[15px] text-text-secondary text-center leading-relaxed">
            不保存结果，只保存<span className="text-accent-600 font-medium">流程和模板</span>——确保下一次大促可直接复用。
          </p>
        </div>
      </div>
    ),
  },
  {
    theme: 'dark' as const,
    content: (
      <div className="flex flex-col items-center text-center max-w-2xl">
        <div className="animate-scale-in mb-6" style={{ animationDelay: '0ms' }}>
          <Logo variant="icon" theme="light" size={52} />
        </div>
        <div className="animate-fade-in-up" style={{ animationDelay: '150ms' }}>
          <h2 className="text-[44px] font-light tracking-[-0.02em] text-white mb-4">准备好开始了吗？</h2>
        </div>
        <div className="animate-fade-in-up" style={{ animationDelay: '250ms' }}>
          <p className="text-[16px] text-white/50 mb-10 max-w-md leading-relaxed">
            从第一个大促分析项目开始<br />将有效的 AI 工作流程保存为团队资产
          </p>
        </div>
        <div className="animate-fade-in-up flex items-center gap-4" style={{ animationDelay: '400ms' }}>
          <Link to="/" className="btn-primary-filled bg-white text-accent-600 border-white hover:bg-white/90 hover:border-white hover-lift text-[15px] px-8 py-3">
            进入产品演示 <ArrowRight className="w-4 h-4" />
          </Link>
          <Link to="/create" className="btn-primary text-white border-white/40 hover:bg-white/10 hover:border-white text-[15px] px-8 py-3">
            创建项目 <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="animate-fade-in mt-16 text-[12px] text-white/20" style={{ animationDelay: '700ms' }}>
          PromoKit AI · 电商大促 AI 工作包系统
        </div>
      </div>
    ),
  },
]

export default function Slides() {
  const [current, setCurrent] = useState(0)
  const total = slides.length

  const goNext = useCallback(() => setCurrent((p) => Math.min(p + 1, total - 1)), [total])
  const goPrev = useCallback(() => setCurrent((p) => Math.max(p - 1, 0)), [])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown' || e.key === ' ') { e.preventDefault(); goNext() }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') { e.preventDefault(); goPrev() }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [goNext, goPrev])

  const slide = slides[current]

  return (
    <div
      className={`min-h-screen flex items-center justify-center relative overflow-hidden transition-colors duration-700 ${slide.theme === 'dark' ? 'bg-sidebar' : 'bg-bg-primary'}`}
    >
      {/* Decorative background */}
      <Decors theme={slide.theme} />

      {/* Content */}
      <div key={current} className="relative z-10 px-8 py-16 animate-fade-in-up">
        {slide.content}
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-white/5">
        <div
          className="h-full bg-accent-500 transition-all duration-500 ease-out"
          style={{ width: `${((current + 1) / total) * 100}%` }}
        />
      </div>

      {/* Page number */}
      <div className={`absolute bottom-6 left-8 text-[11px] ${slide.theme === 'dark' ? 'text-white/25' : 'text-text-muted'}`}>
        {String(current + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
      </div>

      {/* Nav arrows */}
      <button
        onClick={goPrev}
        disabled={current === 0}
        className={`absolute left-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center transition-all disabled:opacity-0 ${
          slide.theme === 'dark' ? 'bg-white/5 hover:bg-white/15' : 'bg-black/3 hover:bg-black/8'
        }`}
      >
        <ChevronLeft className={`w-5 h-5 ${slide.theme === 'dark' ? 'text-white/60' : 'text-text-muted'}`} />
      </button>
      <button
        onClick={goNext}
        disabled={current === total - 1}
        className={`absolute right-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center transition-all disabled:opacity-0 ${
          slide.theme === 'dark' ? 'bg-white/5 hover:bg-white/15' : 'bg-black/3 hover:bg-black/8'
        }`}
      >
        <ChevronRight className={`w-5 h-5 ${slide.theme === 'dark' ? 'text-white/60' : 'text-text-muted'}`} />
      </button>

      {/* Dots */}
      <div className="absolute bottom-6 right-8 flex items-center gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`rounded-full transition-all duration-300 ${
              i === current
                ? `w-5 h-[8px] ${slide.theme === 'dark' ? 'bg-white' : 'bg-accent-500'}`
                : `w-[8px] h-[8px] ${slide.theme === 'dark' ? 'bg-white/15 hover:bg-white/30' : 'bg-gray-300 hover:bg-gray-400'}`
            }`}
          />
        ))}
      </div>
    </div>
  )
}
