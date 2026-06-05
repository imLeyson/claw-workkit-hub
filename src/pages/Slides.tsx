import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, FileText, MessageSquareText, Palette, Repeat, ChevronLeft, ChevronRight, Clock, Users, TrendingUp } from 'lucide-react'
import Logo from '../components/Logo'

/* ── Decorative background ── */
function Decors({ theme }: { theme: 'light' | 'dark' }) {
  if (typeof window === 'undefined') return null
  const w = window.innerWidth
  const h = window.innerHeight
  const alpha = theme === 'dark' ? '0.03' : '0.02'
  const accentAlpha = theme === 'dark' ? '0.10' : '0.07'
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
      <circle cx={w * 0.93} cy={h * 0.08} r={h * 0.22} fill={`rgba(224,123,76,${accentAlpha})`} />
      <circle cx={w * 0.06} cy={h * 0.90} r={h * 0.25} fill={`rgba(0,0,0,${alpha})`} />
      <line x1={w * 0.04} y1={h * 0.40} x2={w * 0.14} y2={h * 0.40} stroke={`rgba(224,123,76,${accentAlpha})`} strokeWidth="2" strokeLinecap="round" />
      <line x1={w * 0.89} y1={h * 0.58} x2={w * 0.96} y2={h * 0.58} stroke={`rgba(224,123,76,${accentAlpha})`} strokeWidth="2" strokeLinecap="round" />
    </svg>
  )
}

/* ── Section label ── */
function SlideLabel({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 mb-8">
      <div className="w-6 h-px bg-accent-400" />
      <span className="text-[11px] font-medium uppercase tracking-[0.15em] text-accent-600">{text}</span>
    </div>
  )
}

/* ── Slides ── */
const slides = [
  // 1. Title
  {
    theme: 'dark' as const,
    content: (
      <div className="flex flex-col items-center text-center max-w-2xl">
        <div className="animate-scale-in mb-10">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-accent-500/15 scale-[1.6] animate-pulse" style={{ animationDuration: '3s' }} />
            <Logo variant="icon" theme="light" size={72} />
          </div>
        </div>
        <h1 className="text-[64px] font-light tracking-[-0.03em] text-white mb-3 animate-fade-in-up">PromoKit AI</h1>
        <p className="text-[20px] text-white/45 mb-10 animate-fade-in-up" style={{ animationDelay: '100ms' }}>电商大促 AI 工作包系统</p>
        <div className="w-24 h-px bg-accent-500 mb-10 animate-fade-in-up" style={{ animationDelay: '200ms' }} />
        <p className="text-[16px] text-white/30 max-w-lg leading-relaxed animate-fade-in-up" style={{ animationDelay: '300ms' }}>
          把一次有效的大促分析流程<br />沉淀为团队可复用的 AI 工作包
        </p>
        <div className="flex items-center gap-5 mt-16 text-[12px] text-white/15 animate-fade-in" style={{ animationDelay: '500ms' }}>
          <span>618</span><span>·</span><span>双 11</span><span>·</span><span>新品上架</span><span>·</span><span>爆品复盘</span><span>·</span><span>竞品分析</span>
        </div>
      </div>
    ),
  },
  // 2. Pain Point
  {
    theme: 'light' as const,
    content: (
      <div className="max-w-2xl w-full">
        <SlideLabel text="The Problem" />
        <h2 className="text-[40px] font-light tracking-[-0.02em] text-text-main mb-4 leading-tight animate-fade-in-up">
          每次大促前<br />团队都在重复劳动
        </h2>
        <p className="text-[15px] text-text-muted mb-10 leading-relaxed animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          运营、商品、文案、客服、设计——每个人都用 AI，但<span className="text-accent-600 font-medium">分析口径和输出格式各不相同</span>。
        </p>
        <div className="grid grid-cols-2 gap-3 mb-8 stagger">
          {[
            { role: '运营', stat: '3h+', desc: '手动整理竞品表格', icon: Clock },
            { role: '文案', stat: '0 复用', desc: '凭经验重写话术', icon: FileText },
            { role: '客服', stat: '从零开始', desc: '梳理 FAQ 知识库', icon: MessageSquareText },
            { role: '设计', stat: '凭感觉', desc: '调整详情页顺序', icon: Palette },
          ].map((item) => (
            <div key={item.role} className="animate-fade-in-up bg-white rounded-2xl p-5 border border-border-default flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-accent-50 flex items-center justify-center shrink-0">
                <item.icon className="w-5 h-5 text-accent-500" />
              </div>
              <div>
                <div className="text-[20px] font-light text-text-main leading-none mb-1">{item.stat}</div>
                <div className="text-[11px] text-text-muted uppercase tracking-wider mb-0.5">{item.role}岗</div>
                <div className="text-[12px] text-text-muted">{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="bg-sidebar rounded-2xl p-5 text-center animate-fade-in-up" style={{ animationDelay: '400ms' }}>
          <p className="text-[16px] text-white/75">
            结果：<span className="text-accent-400 font-medium">下次大促，所有人重新来一遍。</span>
          </p>
        </div>
      </div>
    ),
  },
  // 3. The Cost
  {
    theme: 'light' as const,
    content: (
      <div className="max-w-2xl w-full">
        <SlideLabel text="The Cost" />
        <h2 className="text-[40px] font-light tracking-[-0.02em] text-text-main mb-10 leading-tight animate-fade-in-up">
          团队经验<br />随着人员流失而消失
        </h2>
        <div className="grid grid-cols-3 gap-5 mb-10 stagger">
          {[
            { icon: Clock, value: '12h+', label: '每次大促重复耗时', sub: '整理资料 + 分析 + 汇总', accent: true },
            { icon: Users, value: '5 岗位', label: '各自独立工作', sub: '口径不一、结果无法对齐', accent: false },
            { icon: TrendingUp, value: '0 积累', label: '经验无法沉淀', sub: '上次分析下次用不上', accent: false },
          ].map((item) => (
            <div key={item.label} className={`animate-fade-in-up rounded-2xl p-6 text-center ${item.accent ? 'bg-accent-500 text-white' : 'bg-white border border-border-default'}`}>
              <item.icon className={`w-6 h-6 mx-auto mb-3 ${item.accent ? 'text-white/80' : 'text-accent-500'}`} />
              <div className={`text-[28px] font-light leading-none mb-2 ${item.accent ? 'text-white' : 'text-text-main'}`}>{item.value}</div>
              <div className={`text-[12px] font-medium mb-1 ${item.accent ? 'text-white/80' : 'text-text-main'}`}>{item.label}</div>
              <div className={`text-[11px] ${item.accent ? 'text-white/50' : 'text-text-muted'}`}>{item.sub}</div>
            </div>
          ))}
        </div>
        <p className="text-[15px] text-text-muted text-center animate-fade-in-up" style={{ animationDelay: '400ms' }}>
          这些问题不是缺少 AI 造成的——<span className="text-accent-600 font-medium">缺少的是把 AI 分析流程化的工具</span>。
        </p>
      </div>
    ),
  },
  // 4. Solution
  {
    theme: 'light' as const,
    content: (
      <div className="max-w-2xl w-full">
        <SlideLabel text="The Solution" />
        <h2 className="text-[40px] font-light tracking-[-0.02em] text-text-main mb-4 leading-tight animate-fade-in-up">
          PromoKit AI<br />6 大分析能力
        </h2>
        <p className="text-[15px] text-text-muted mb-10 leading-relaxed animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          同一份竞品数据源 → 各岗位 AI 协同分析 → 结构化输出 → <span className="text-accent-600 font-medium">可复用工作包</span>
        </p>
        <div className="grid grid-cols-3 gap-3 stagger mb-8">
          {[
            { num: '01', label: '竞品评论挖掘', desc: '聚类高频痛点，构建矩阵' },
            { num: '02', label: '卖点文案生成', desc: '用户原话 → 可传播卖点' },
            { num: '03', label: '客服 FAQ', desc: '售前疑虑 + 售后风险话术' },
            { num: '04', label: '详情页优化', desc: '数据驱动的信息层级重排' },
            { num: '05', label: '大促策略汇总', desc: '跨岗位整合执行清单' },
            { num: '06', label: '沉淀为 Work Kit', desc: '版本管理 · 持续迭代' },
          ].map((item) => (
            <div key={item.num} className="animate-fade-in-up bg-white rounded-2xl p-4 border border-border-default hover-lift">
              <div className="text-[11px] font-semibold text-accent-400 mb-2">{item.num}</div>
              <div className="text-[14px] font-medium text-text-main mb-1">{item.label}</div>
              <div className="text-[11px] text-text-muted leading-snug">{item.desc}</div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  // 5. Workflow
  {
    theme: 'dark' as const,
    content: (
      <div className="max-w-3xl w-full">
        <SlideLabel text="The Workflow" />
        <h2 className="text-[40px] font-light tracking-[-0.02em] text-white mb-10 leading-tight animate-fade-in-up">
          从创建到沉淀<br />完整闭环
        </h2>
        <div className="flex items-start gap-0 stagger mb-12">
          {[
            { step: '01', label: '创建项目', sub: '设定目标' },
            { step: '02', label: '导入资料', sub: '上传数据' },
            { step: '03', label: '生成任务', sub: 'AI 拆解' },
            { step: '04', label: 'AI 分析', sub: '结构化输出' },
            { step: '05', label: '汇总报告', sub: '跨岗整合' },
            { step: '06', label: '沉淀复用', sub: 'Work Kit' },
          ].map((item, i, arr) => (
            <div key={item.step} className="flex-1 flex items-start animate-fade-in-up">
              <div className="text-center flex-1">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 transition-colors ${i === 5 ? 'bg-accent-500 text-white' : 'bg-white/8 text-white/60'}`}>
                  <span className="text-[15px] font-semibold">{item.step}</span>
                </div>
                <div className="text-[13px] text-white/80 font-medium">{item.label}</div>
                <div className="text-[11px] text-white/30 mt-1">{item.sub}</div>
              </div>
              {i < arr.length - 1 && (
                <div className="pt-6 -ml-1 mr-1">
                  <ArrowRight className="w-3 h-3 text-white/15" />
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="bg-white/5 rounded-2xl p-5 text-center animate-fade-in-up" style={{ animationDelay: '500ms' }}>
          <p className="text-[15px] text-white/60">
            <span className="text-accent-400 font-medium">关键</span>：第 6 步沉淀的 Work Kit，让第 1 步从"从零开始"变成<span className="text-white/90">「几分钟启动」</span>。
          </p>
        </div>
      </div>
    ),
  },
  // 6. Work Kit deep dive
  {
    theme: 'light' as const,
    content: (
      <div className="max-w-2xl w-full">
        <SlideLabel text="The Differentiator" />
        <h2 className="text-[40px] font-light tracking-[-0.02em] text-text-main mb-4 leading-tight animate-fade-in-up">
          不保存结果<br />只保存流程
        </h2>
        <p className="text-[15px] text-text-muted mb-8 leading-relaxed animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          Work Kit 保存的是<span className="text-accent-600 font-medium">资料结构、任务模板、Prompt 和报告格式</span>，而非单次结果。
        </p>
        <div className="bg-white rounded-[24px] p-7 border border-border-default mb-6 animate-scale-in shadow-sm" style={{ animationDelay: '200ms' }}>
          {/* mini Work Kit card */}
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent-50 flex items-center justify-center"><Repeat className="w-5 h-5 text-accent-500" /></div>
              <div>
                <div className="text-[15px] font-medium text-text-main">618 竞品评论分析 Work Kit</div>
                <div className="text-[11px] text-text-muted">v1.2 · 复用 3 次</div>
              </div>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-accent-50 text-accent-600 font-medium">可复用</span>
          </div>
          <div className="flex items-center gap-2 mb-5 overflow-x-auto pb-1">
            {['v1.0 · 初始模板', 'v1.1 · 客服增强', 'v1.2 · 首屏优化'].map((v, i, arr) => (
              <div key={v} className="flex items-center gap-2 shrink-0">
                <span className="text-[11px] text-text-muted whitespace-nowrap">{v}</span>
                {i < arr.length - 1 && <ArrowRight className="w-3 h-3 text-accent-300 shrink-0" />}
              </div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2 text-[11px]">
            {['资料结构 · 4 类数据', '岗位配置 · 5 个角色', '任务模板 · 5 个 Prompt', '报告格式 · 固定输出'].map((t) => (
              <div key={t} className="bg-gray-50 rounded-lg px-3 py-2 text-text-secondary">{t}</div>
            ))}
          </div>
        </div>
        <p className="text-[14px] text-text-secondary text-center animate-fade-in-up leading-relaxed" style={{ animationDelay: '400ms' }}>
          每次大促后迭代，版本持续积累——<span className="text-accent-600 font-medium">团队经验不随人员变动而丢失</span>。
        </p>
      </div>
    ),
  },
  // 7. Before/After
  {
    theme: 'light' as const,
    content: (
      <div className="max-w-2xl w-full">
        <SlideLabel text="The Impact" />
        <h2 className="text-[40px] font-light tracking-[-0.02em] text-text-main mb-10 leading-tight animate-fade-in-up">
          Before & After
        </h2>
        <div className="grid grid-cols-2 gap-6 stagger">
          <div className="animate-fade-in-up bg-gray-50 rounded-2xl p-6 border border-border-default">
            <div className="text-[11px] font-medium uppercase tracking-[0.1em] text-text-muted mb-4">之前</div>
            <div className="space-y-3">
              {['各岗位各自整理资料', '分析口径不统一', '结果无法复用', '每次大促从零开始'].map((t) => (
                <div key={t} className="flex items-center gap-3 text-[13px] text-text-muted">
                  <span className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center shrink-0 text-[10px] text-red-400">✕</span>
                  {t}
                </div>
              ))}
            </div>
          </div>
          <div className="animate-fade-in-up bg-accent-50 rounded-2xl p-6 border border-accent-200">
            <div className="text-[11px] font-medium uppercase tracking-[0.1em] text-accent-600 mb-4">使用 PromoKit AI</div>
            <div className="space-y-3">
              {['统一资料库 · 同源分析', '各岗位结构化 AI 输出', '一键沉淀为 Work Kit', '下次大促几分钟启动'].map((t) => (
                <div key={t} className="flex items-center gap-3 text-[13px] text-text-secondary">
                  <span className="w-5 h-5 rounded-full bg-accent-100 flex items-center justify-center shrink-0 text-[10px] text-accent-600">✓</span>
                  {t}
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="mt-10 text-center animate-fade-in-up" style={{ animationDelay: '400ms' }}>
          <div className="inline-flex items-center gap-4 bg-sidebar rounded-2xl px-6 py-4">
            <Clock className="w-5 h-5 text-accent-400" />
            <span className="text-[15px] text-white/70">启动耗时</span>
            <span className="text-[24px] font-light text-white mx-2">3h → 5min</span>
            <span className="w-px h-5 bg-white/10" />
            <span className="text-[15px] text-white/70">复用率</span>
            <span className="text-[24px] font-light text-accent-400 mx-2">0 → 100%</span>
          </div>
        </div>
      </div>
    ),
  },
  // 8. CTA
  {
    theme: 'dark' as const,
    content: (
      <div className="flex flex-col items-center text-center max-w-2xl">
        <div className="animate-scale-in mb-6"><Logo variant="icon" theme="light" size={52} /></div>
        <h2 className="text-[48px] font-light tracking-[-0.02em] text-white mb-4 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          准备好沉淀<br />团队的 AI 经验了吗？
        </h2>
        <p className="text-[16px] text-white/45 mb-10 max-w-md leading-relaxed animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          从第一个大促分析项目开始<br />把一次有效的分析流程变成可复用的团队资产
        </p>
        <div className="flex items-center gap-4 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
          <Link to="/" className="btn-primary-filled bg-white text-accent-600 border-white hover:bg-white/90 hover:border-white hover-lift text-[15px] px-8 py-3.5">
            进入产品演示 <ArrowRight className="w-4 h-4" />
          </Link>
          <Link to="/create" className="btn-primary text-white border-white/35 hover:bg-white/8 hover:border-white/60 text-[15px] px-8 py-3.5">
            创建分析项目 <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <p className="mt-16 text-[12px] text-white/18 animate-fade-in" style={{ animationDelay: '600ms' }}>
          PromoKit AI · 电商大促 AI 工作包系统
        </p>
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
    <div className={`min-h-screen flex items-center justify-center relative overflow-hidden transition-colors duration-700 ${slide.theme === 'dark' ? 'bg-sidebar' : 'bg-bg-primary'}`}>
      <Decors theme={slide.theme} />
      <div key={current} className="relative z-10 px-8 py-16 animate-fade-in-up">{slide.content}</div>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-white/5">
        <div className="h-full bg-accent-500 transition-all duration-500 ease-out" style={{ width: `${((current + 1) / total) * 100}%` }} />
      </div>

      {/* Page number */}
      <div className={`absolute bottom-6 left-8 text-[11px] font-medium tracking-wider ${slide.theme === 'dark' ? 'text-white/20' : 'text-text-muted'}`}>
        {String(current + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
      </div>

      {/* Nav arrows */}
      <button onClick={goPrev} disabled={current === 0}
        className={`absolute left-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center transition-all disabled:opacity-0 ${slide.theme === 'dark' ? 'bg-white/5 hover:bg-white/12' : 'bg-black/3 hover:bg-black/6'}`}>
        <ChevronLeft className={`w-5 h-5 ${slide.theme === 'dark' ? 'text-white/50' : 'text-text-muted'}`} />
      </button>
      <button onClick={goNext} disabled={current === total - 1}
        className={`absolute right-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center transition-all disabled:opacity-0 ${slide.theme === 'dark' ? 'bg-white/5 hover:bg-white/12' : 'bg-black/3 hover:bg-black/6'}`}>
        <ChevronRight className={`w-5 h-5 ${slide.theme === 'dark' ? 'text-white/50' : 'text-text-muted'}`} />
      </button>

      {/* Dots */}
      <div className="absolute bottom-6 right-8 flex items-center gap-2">
        {slides.map((_, i) => (
          <button key={i} onClick={() => setCurrent(i)}
            className={`rounded-full transition-all duration-300 ${
              i === current
                ? `w-6 h-[8px] ${slide.theme === 'dark' ? 'bg-white' : 'bg-accent-500'}`
                : `w-[8px] h-[8px] ${slide.theme === 'dark' ? 'bg-white/15 hover:bg-white/30' : 'bg-gray-300 hover:bg-gray-400'}`
            }`} />
        ))}
      </div>
    </div>
  )
}
