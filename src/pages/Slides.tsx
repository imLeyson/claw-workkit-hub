import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, FileText, MessageSquareText, Palette, Repeat, ChevronLeft, ChevronRight, Clock, Users, TrendingUp, Target, Search, LayoutDashboard, Network } from 'lucide-react'
import Logo from '../components/Logo'

/* ── Background decor ── */
function Decors({ theme }: { theme: 'light' | 'dark' }) {
  if (typeof window === 'undefined') return null
  const w = window.innerWidth
  const h = window.innerHeight
  const a = theme === 'dark' ? '0.04' : '0.03'
  return (
    <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none">
      <circle cx={w * 0.95} cy={-h * 0.05} r={h * 0.28} fill={`rgba(224,123,76,${a})`} />
      <circle cx={w * 0.04} cy={h * 1.02} r={h * 0.22} fill={`rgba(0,0,0,${a})`} />
    </svg>
  )
}

function Label({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 mb-8">
      <div className="w-5 h-px bg-accent-400" />
      <span className="text-[11px] font-medium uppercase tracking-[0.15em] text-accent-600">{text}</span>
    </div>
  )
}

/* ══════════════════════════════════════════
   Slides
   ══════════════════════════════════════════ */
const slides = [
  // ── 01 TITLE ──
  {
    theme: 'dark' as const,
    content: (
      <div className="flex flex-col items-center text-center max-w-2xl">
        <div className="animate-scale-in mb-10 relative">
          <div className="absolute inset-0 rounded-full bg-accent-500/12 scale-[1.7] animate-pulse" style={{ animationDuration: '3.5s' }} />
          <Logo variant="icon" theme="light" size={80} />
        </div>
        <h1 className="text-[68px] font-light tracking-[-0.03em] text-white leading-none mb-4 animate-fade-in-up">PromoKit AI</h1>
        <p className="text-[20px] text-white/40 mb-12 animate-fade-in-up" style={{ animationDelay: '120ms' }}>电商大促 AI 工作包系统</p>
        <div className="w-20 h-px bg-accent-500 mb-12 animate-fade-in-up" style={{ animationDelay: '200ms' }} />
        <p className="text-[17px] text-white/28 max-w-lg leading-relaxed animate-fade-in-up" style={{ animationDelay: '300ms' }}>
          把一次有效的大促分析流程<br />沉淀为团队可复用的 AI 工作包
        </p>
        <div className="flex items-center gap-5 mt-20 text-[13px] text-white/12 tracking-wider animate-fade-in" style={{ animationDelay: '500ms' }}>
          618 · 双11 · 新品上架 · 爆品复盘 · 竞品分析
        </div>
      </div>
    ),
  },
  // ── 02 PAIN ──
  {
    theme: 'light' as const,
    content: (
      <div className="max-w-2xl w-full">
        <Label text="团队困境" />
        <h2 className="text-[42px] font-light tracking-[-0.02em] text-text-main mb-4 leading-tight animate-fade-in-up">每次大促前<br />团队都在重复劳动</h2>
        <p className="text-[15px] text-text-muted mb-10 leading-relaxed animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          运营、商品、文案、客服、设计——每个人都用 AI<br /><span className="text-accent-600 font-medium">但分析口径和输出格式各不相同。</span>
        </p>
        <div className="grid grid-cols-2 gap-3 mb-8 stagger">
          {[
            { role: '运营岗', stat: '3h+', desc: '手动整理竞品评论表格', icon: Clock },
            { role: '文案岗', stat: '0 复用', desc: '凭个人经验重写卖点话术', icon: FileText },
            { role: '客服岗', stat: '从零开始', desc: '每次梳理高频 FAQ', icon: MessageSquareText },
            { role: '设计岗', stat: '凭感觉', desc: '无数据支撑调整详情页', icon: Palette },
          ].map((item) => (
            <div key={item.role} className="animate-fade-in-up bg-white rounded-2xl p-5 border border-border-default hover-lift flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl bg-accent-50 flex items-center justify-center shrink-0"><item.icon className="w-5 h-5 text-accent-500" /></div>
              <div>
                <div className="text-[22px] font-light text-text-main leading-none mb-1">{item.stat}</div>
                <div className="text-[11px] text-text-muted uppercase tracking-wider mb-0.5">{item.role}</div>
                <div className="text-[12px] text-text-muted">{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="bg-sidebar rounded-2xl p-5 text-center animate-fade-in-up" style={{ animationDelay: '400ms' }}>
          <p className="text-[16px] text-white/70">结果：<span className="text-accent-400 font-medium">下次大促，所有人重新来一遍。</span></p>
        </div>
      </div>
    ),
  },
  // ── 03 COST ──
  {
    theme: 'dark' as const,
    content: (
      <div className="max-w-2xl w-full">
        <Label text="隐性成本" />
        <h2 className="text-[42px] font-light tracking-[-0.02em] text-white mb-12 leading-tight animate-fade-in-up">团队经验<br />随人员流失而消失</h2>
        <div className="grid grid-cols-3 gap-4 mb-10 stagger">
          {[
            { icon: Clock, value: '12h+', unit: '每次大促', label: '重复耗时', desc: '整理 + 分析 + 汇总' },
            { icon: Users, value: '5', unit: '个岗位', label: '各自独立', desc: '口径不一 · 结果无法对齐' },
            { icon: TrendingUp, value: '0', unit: '次积累', label: '经验流失', desc: '上次分析下次用不上' },
          ].map((item) => (
            <div key={item.label} className="animate-fade-in-up bg-white/[0.06] rounded-2xl p-6 text-center border border-white/[0.06]">
              <item.icon className="w-6 h-6 text-accent-400 mx-auto mb-4" />
              <div className="text-[36px] font-light text-white leading-none mb-1">{item.value}</div>
              <div className="text-[11px] text-white/30 uppercase tracking-wider mb-3">{item.unit}</div>
              <div className="text-[13px] font-medium text-white/70 mb-1">{item.label}</div>
              <div className="text-[11px] text-white/30">{item.desc}</div>
            </div>
          ))}
        </div>
        <p className="text-[15px] text-white/35 text-center animate-fade-in-up" style={{ animationDelay: '400ms' }}>
          不是缺少 AI ——<span className="text-accent-400 font-medium"> 缺少把 AI 分析流程化的工具。</span>
        </p>
      </div>
    ),
  },
  // ── 04 SOLUTION ──
  {
    theme: 'light' as const,
    content: (
      <div className="max-w-2xl w-full">
        <Label text="解决方案" />
        <h2 className="text-[42px] font-light tracking-[-0.02em] text-text-main mb-4 leading-tight animate-fade-in-up">PromoKit AI</h2>
        <p className="text-[15px] text-text-muted mb-10 leading-relaxed animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          同一份竞品数据源 → 各岗位协同 AI 分析 → <span className="text-accent-600 font-medium">可复用工作包</span>
        </p>
        <div className="grid grid-cols-3 gap-3 stagger">
          {[
            { num: '01', label: '竞品评论挖掘', desc: '聚类高频痛点 · 构建矩阵' },
            { num: '02', label: '卖点文案生成', desc: '用户原话 → 可传播卖点' },
            { num: '03', label: '客服 FAQ', desc: '售前疑虑 · 售后风险话术' },
            { num: '04', label: '详情页优化', desc: '数据驱动的信息层级重排' },
            { num: '05', label: '大促策略汇总', desc: '跨岗位整合执行清单' },
            { num: '06', label: '沉淀为 Work Kit', desc: '版本管理 · 持续迭代 · 反复复用' },
          ].map((item) => (
            <div key={item.num} className="animate-fade-in-up bg-white rounded-2xl p-5 border border-border-default hover-lift">
              <div className="text-[11px] font-semibold text-accent-400 mb-2">{item.num}</div>
              <div className="text-[14px] font-medium text-text-main mb-1.5">{item.label}</div>
              <div className="text-[12px] text-text-muted leading-snug">{item.desc}</div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  // ── 05 WORKFLOW ──
  {
    theme: 'dark' as const,
    content: (
      <div className="max-w-3xl w-full">
        <Label text="工作流程" />
        <h2 className="text-[42px] font-light tracking-[-0.02em] text-white mb-10 leading-tight animate-fade-in-up">6 步完成大促分析</h2>
        <div className="flex items-start gap-0 stagger mb-12">
          {[
            { step: '01', label: '创建项目', sub: '设定目标与竞品' },
            { step: '02', label: '导入资料', sub: '上传电商数据' },
            { step: '03', label: '生成任务', sub: 'AI 按岗拆解' },
            { step: '04', label: 'AI 分析', sub: '结构化输出结果' },
            { step: '05', label: '汇总报告', sub: '跨岗位整合' },
            { step: '06', label: '沉淀复用', sub: '保存为 Work Kit' },
          ].map((item, i, arr) => (
            <div key={item.step} className="flex-1 flex items-start animate-fade-in-up">
              <div className="text-center flex-1">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 ${i === 5 ? 'bg-accent-500 text-white' : 'bg-white/8 text-white/50'}`}>
                  <span className="text-[16px] font-semibold">{item.step}</span>
                </div>
                <div className="text-[13px] text-white/75 font-medium">{item.label}</div>
                <div className="text-[11px] text-white/25 mt-1">{item.sub}</div>
              </div>
              {i < arr.length - 1 && <div className="pt-7 -ml-1 mr-1"><ArrowRight className="w-3 h-3 text-white/10" /></div>}
            </div>
          ))}
        </div>
        <div className="bg-white/[0.04] rounded-2xl p-5 text-center animate-fade-in-up" style={{ animationDelay: '500ms' }}>
          <p className="text-[15px] text-white/50">
            <span className="text-accent-400 font-medium">飞轮效应</span>：第 6 步沉淀的 Work Kit，让下一次大促从<span className="text-white/80">「几小时」变成「几分钟」</span>。
          </p>
        </div>
      </div>
    ),
  },
  // ── 06 WORK KIT ──
  {
    theme: 'light' as const,
    content: (
      <div className="max-w-2xl w-full">
        <Label text="核心差异" />
        <h2 className="text-[42px] font-light tracking-[-0.02em] text-text-main mb-4 leading-tight animate-fade-in-up">不保存结果<br />只保存流程</h2>
        <p className="text-[15px] text-text-muted mb-8 leading-relaxed animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          Work Kit 保存<span className="text-accent-600 font-medium">资料结构、任务模板、Prompt 和报告格式</span>，而非单次分析结果。
        </p>
        <div className="bg-white rounded-[24px] p-8 border border-border-default shadow-sm mb-6 animate-scale-in" style={{ animationDelay: '200ms' }}>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-accent-50 flex items-center justify-center"><Repeat className="w-5 h-5 text-accent-500" /></div>
              <div><div className="text-[16px] font-medium text-text-main">618 竞品评论分析 Work Kit</div><div className="text-[12px] text-text-muted">v1.2 · 已复用 3 次</div></div>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded-md bg-accent-50 text-accent-600 font-medium">可复用</span>
          </div>
          <div className="flex items-center gap-2 mb-5 text-[11px] text-text-muted">
            {['v1.0 · 初始模板', 'v1.1 · 客服增强', 'v1.2 · 首屏优化'].map((v, i, a) => (
              <div key={v} className="flex items-center gap-2 shrink-0"><span>{v}</span>{i < a.length - 1 && <ArrowRight className="w-3 h-3 text-accent-300" />}</div>
            ))}
          </div>
          <div className="grid grid-cols-2 gap-2 text-[12px]">
            {['资料结构 · 4 类数据源', '岗位配置 · 5 个角色', '任务模板 · 5 个 Prompt', '报告格式 · 标准化输出'].map((t) => (
              <div key={t} className="bg-gray-50 rounded-lg px-3 py-2.5 text-text-secondary">{t}</div>
            ))}
          </div>
        </div>
        <p className="text-[14px] text-text-secondary text-center leading-relaxed animate-fade-in-up" style={{ animationDelay: '400ms' }}>
          每次大促后迭代——<span className="text-accent-600 font-medium">团队经验不随人员变动而丢失。</span>
        </p>
      </div>
    ),
  },
  // ── 07 IMPACT ──
  {
    theme: 'light' as const,
    content: (
      <div className="max-w-2xl w-full">
        <Label text="效果对比" />
        <h2 className="text-[42px] font-light tracking-[-0.02em] text-text-main mb-10 leading-tight animate-fade-in-up">Before & After</h2>
        <div className="grid grid-cols-2 gap-5 stagger mb-10">
          <div className="animate-fade-in-up bg-red-50/40 rounded-2xl p-7 border border-red-100">
            <div className="text-[11px] font-medium uppercase tracking-[0.1em] text-red-400 mb-5">Before</div>
            <div className="space-y-3">
              {['各岗位各自整理资料', '分析口径不统一', '结果无法复用', '每次大促从零启动'].map((t) => (
                <div key={t} className="flex items-center gap-3 text-[14px] text-text-secondary"><span className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center shrink-0 text-[11px] text-red-400">✕</span>{t}</div>
              ))}
            </div>
          </div>
          <div className="animate-fade-in-up bg-accent-50/60 rounded-2xl p-7 border border-accent-200">
            <div className="text-[11px] font-medium uppercase tracking-[0.1em] text-accent-600 mb-5">After</div>
            <div className="space-y-3">
              {['统一资料库 · 同源分析', '各岗位结构化 AI 输出', '一键沉淀为 Work Kit', '下次大促几分钟启动'].map((t) => (
                <div key={t} className="flex items-center gap-3 text-[14px] text-text-secondary"><span className="w-5 h-5 rounded-full bg-accent-200 flex items-center justify-center shrink-0 text-[11px] text-accent-700">✓</span>{t}</div>
              ))}
            </div>
          </div>
        </div>
        <div className="animate-fade-in-up text-center" style={{ animationDelay: '400ms' }}>
          <div className="inline-flex items-center gap-5 bg-sidebar rounded-2xl px-8 py-5">
            <Clock className="w-5 h-5 text-accent-400" />
            <span className="text-[14px] text-white/50">启动耗时</span>
            <span className="text-[26px] font-light text-white">3h → 5min</span>
            <span className="w-px h-6 bg-white/8" />
            <span className="text-[14px] text-white/50">复用率</span>
            <span className="text-[26px] font-light text-accent-400">0 → 100%</span>
          </div>
        </div>
      </div>
    ),
  },
  // ── 08 DESIGN PROCESS ──
  {
    theme: 'dark' as const,
    content: (
      <div className="max-w-4xl w-full">
        <Label text="设计过程" />
        <h2 className="text-[36px] font-light tracking-[-0.02em] text-white mb-8 leading-tight animate-fade-in-up">从需求到界面<br />设计推导链</h2>
        <div className="grid grid-cols-4 gap-4 stagger">
          {[
            { no: '01', label: '需求池归类', icon: Search, items: ['资料分散在不同文件', '岗位分析口径不统一', 'AI 经验无法交接', '每次大促从零启动'] },
            { no: '02', label: '产品定义', icon: Target, items: ['统一资料类型与字段', '明确岗位任务目标', '结构化输出 + 质检', '沉淀为可复用资产'] },
            { no: '03', label: '系统架构', icon: Network, items: ['电商资料库模块', '岗位任务卡生成', 'AI 分析工作台', '策略报告与资产库'] },
            { no: '04', label: '界面设计', icon: LayoutDashboard, items: ['Dashboard 看板', '资料库管理页', '任务卡画廊', 'AI 工作台', '策略报告页'] },
          ].map((col, i) => (
            <div key={col.no} className="animate-fade-in-up" style={{ animationDelay: `${i * 80}ms` }}>
              <div className="h-full rounded-2xl bg-white/[0.04] border border-white/[0.06] p-5">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-[28px] font-light text-accent-400 tracking-[-0.03em]">{col.no}</span>
                  <span className="text-[15px] font-medium text-white/80">{col.label}</span>
                </div>
                <div className="w-8 h-px bg-accent-500/40 mb-4" />
                <div className="space-y-2">
                  {col.items.map((t) => (
                    <div key={t} className="flex items-start gap-2 text-[12px] text-white/45 leading-relaxed">
                      <span className="w-1 h-1 rounded-full bg-accent-400/60 mt-1.5 shrink-0" />{t}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
  // ── 09 CTA ──
  {
    theme: 'dark' as const,
    content: (
      <div className="flex flex-col items-center text-center max-w-2xl">
        <div className="animate-scale-in mb-8"><Logo variant="icon" theme="light" size={56} /></div>
        <h2 className="text-[52px] font-light tracking-[-0.02em] text-white mb-5 leading-tight animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          准备好沉淀<br />团队的 AI 经验了吗？
        </h2>
        <p className="text-[17px] text-white/40 mb-12 max-w-md leading-relaxed animate-fade-in-up" style={{ animationDelay: '200ms' }}>
          从第一个大促分析项目开始<br />把一次有效的分析流程变成团队可复用的资产
        </p>
        <div className="flex items-center gap-4 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
          <Link to="/" className="btn-primary-filled bg-white text-accent-600 border-white hover:bg-white/90 hover:border-white hover-lift text-[15px] px-9 py-3.5">
            进入产品演示 <ArrowRight className="w-4 h-4" />
          </Link>
          <Link to="/create" className="btn-primary text-white border-white/30 hover:bg-white/8 hover:border-white/50 text-[15px] px-9 py-3.5">
            创建分析项目 <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <p className="mt-20 text-[13px] text-white/15 tracking-wider animate-fade-in" style={{ animationDelay: '600ms' }}>
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
      <div key={current} className="relative z-10 px-10 py-20 animate-fade-in-up">{slide.content}</div>

      <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-white/5">
        <div className="h-full bg-accent-500 transition-all duration-500 ease-out" style={{ width: `${((current + 1) / total) * 100}%` }} />
      </div>
      <div className={`absolute bottom-6 left-10 text-[11px] tracking-wider ${slide.theme === 'dark' ? 'text-white/18' : 'text-text-muted'}`}>
        {String(current + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
      </div>

      <button onClick={goPrev} disabled={current === 0}
        className={`absolute left-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center transition-all disabled:opacity-0 ${slide.theme === 'dark' ? 'bg-white/5 hover:bg-white/10' : 'bg-black/2 hover:bg-black/5'}`}>
        <ChevronLeft className={`w-4.5 h-4.5 ${slide.theme === 'dark' ? 'text-white/40' : 'text-text-muted'}`} />
      </button>
      <button onClick={goNext} disabled={current === total - 1}
        className={`absolute right-3 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center transition-all disabled:opacity-0 ${slide.theme === 'dark' ? 'bg-white/5 hover:bg-white/10' : 'bg-black/2 hover:bg-black/5'}`}>
        <ChevronRight className={`w-4.5 h-4.5 ${slide.theme === 'dark' ? 'text-white/40' : 'text-text-muted'}`} />
      </button>

      <div className="absolute bottom-6 right-10 flex items-center gap-2">
        {slides.map((_, i) => (
          <button key={i} onClick={() => setCurrent(i)}
            className={`rounded-full transition-all duration-300 ${
              i === current
                ? `w-6 h-[8px] ${slide.theme === 'dark' ? 'bg-white' : 'bg-accent-500'}`
                : `w-[8px] h-[8px] ${slide.theme === 'dark' ? 'bg-white/12 hover:bg-white/25' : 'bg-gray-300 hover:bg-gray-400'}`
            }`} />
        ))}
      </div>
    </div>
  )
}
