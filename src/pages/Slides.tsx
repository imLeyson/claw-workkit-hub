import { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Sparkles, FileText, MessageSquareText, Palette, Target, Repeat, ChevronLeft, ChevronRight } from 'lucide-react'
import Logo from '../components/Logo'

const slides = [
  {
    bg: 'bg-sidebar',
    content: (
      <div className="flex flex-col items-center text-center">
        <div className="mb-8"><Logo variant="icon" theme="light" size={56} /></div>
        <h1 className="text-[56px] font-light tracking-[-0.02em] text-white mb-4">PromoKit AI</h1>
        <p className="text-[18px] text-white/50 mb-3">电商大促 AI 工作包系统</p>
        <div className="w-16 h-px bg-accent-500 my-8" />
        <p className="text-[15px] text-white/40 max-w-md leading-relaxed">
          把一次有效的大促分析流程<br />沉淀为团队可复用的 AI 工作包
        </p>
      </div>
    ),
  },
  {
    bg: 'bg-bg-primary',
    content: (
      <div className="max-w-2xl">
        <span className="section-title mb-6 block">The Problem</span>
        <h2 className="text-[36px] font-light tracking-[-0.02em] text-text-main mb-8 leading-tight">
          每次大促前<br />团队都在重复做同一件事
        </h2>
        <div className="space-y-4 mb-10">
          {[
            { role: '运营', pain: '花 3 小时手动整理竞品评论表格', icon: Target },
            { role: '文案', pain: '凭个人经验重写卖点话术', icon: FileText },
            { role: '客服', pain: '从零开始梳理高频问题', icon: MessageSquareText },
            { role: '设计', pain: '根据感觉调整详情页顺序', icon: Palette },
          ].map((item) => (
            <div key={item.role} className="flex items-center gap-4 bg-white rounded-2xl p-4 border border-border-default">
              <div className="w-10 h-10 rounded-xl bg-accent-50 flex items-center justify-center shrink-0">
                <item.icon className="w-5 h-5 text-accent-500" />
              </div>
              <div className="flex-1">
                <span className="text-[12px] font-medium text-text-muted uppercase tracking-wider">{item.role}岗</span>
                <p className="text-[14px] text-text-secondary">{item.pain}</p>
              </div>
              <span className="text-red-400 text-lg">✕</span>
            </div>
          ))}
        </div>
        <p className="text-[20px] font-medium text-accent-600 text-center">
          分析结果无法复用。下一次大促，重新来一遍。
        </p>
      </div>
    ),
  },
  {
    bg: 'bg-bg-primary',
    content: (
      <div className="max-w-2xl">
        <span className="section-title mb-6 block">The Solution</span>
        <h2 className="text-[36px] font-light tracking-[-0.02em] text-text-main mb-6 leading-tight">
          PromoKit AI
        </h2>
        <p className="text-[17px] text-text-secondary mb-10 leading-relaxed">
          围绕竞品评论、商品卖点、客服反馈和历史文案，<br />
          将一次有效的大促 AI 分析流程<br />
          <span className="text-accent-600 font-medium">沉淀为团队可复用的工作包</span>。
        </p>
        <div className="grid grid-cols-2 gap-4">
          {[
            { label: '竞品评论挖掘', desc: '自动聚类用户痛点' },
            { label: '卖点文案生成', desc: '用户原话转可传播卖点' },
            { label: '客服 FAQ 生成', desc: '售前售后风险话术' },
            { label: '详情页优化', desc: '数据驱动的信息层级' },
            { label: '大促策略汇总', desc: '跨岗位整合执行清单' },
            { label: 'Work Kit 沉淀', desc: '版本迭代持续积累' },
          ].map((item) => (
            <div key={item.label} className="bg-white rounded-2xl p-4 border border-border-default flex items-start gap-3">
              <Sparkles className="w-4 h-4 text-accent-500 mt-0.5 shrink-0" />
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
    bg: 'bg-bg-primary',
    content: (
      <div className="max-w-3xl">
        <span className="section-title mb-6 block">The Workflow</span>
        <h2 className="text-[36px] font-light tracking-[-0.02em] text-text-main mb-10 leading-tight">
          6 步完成一次大促分析
        </h2>
        <div className="flex items-start gap-0">
          {[
            { step: '01', label: '创建项目', desc: '设定类目与竞品' },
            { step: '02', label: '导入资料', desc: '评论/参数/客服记录' },
            { step: '03', label: '任务生成', desc: '按岗位拆解 AI 任务' },
            { step: '04', label: 'AI 分析', desc: '结构化结果输出' },
            { step: '05', label: '策略报告', desc: '跨岗位整合汇总' },
            { step: '06', label: '沉淀复用', desc: '保存为 Work Kit' },
          ].map((item, i, arr) => (
            <div key={item.step} className="flex-1 flex items-start">
              <div className="text-center flex-1">
                <div className="w-12 h-12 rounded-2xl bg-accent-50 flex items-center justify-center mx-auto mb-3">
                  <span className="text-[15px] font-semibold text-accent-600">{item.step}</span>
                </div>
                <div className="text-[13px] font-medium text-text-main">{item.label}</div>
                <div className="text-[11px] text-text-muted mt-1">{item.desc}</div>
              </div>
              {i < arr.length - 1 && (
                <div className="pt-6 -ml-1 mr-1">
                  <ArrowRight className="w-3.5 h-3.5 text-accent-300" />
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="mt-12 bg-sidebar rounded-2xl p-6 text-center">
          <p className="text-[15px] text-white/70 leading-relaxed">
            <span className="text-accent-400 font-medium">核心价值</span>：下一次大促，几分钟内启动，而非几小时。
          </p>
        </div>
      </div>
    ),
  },
  {
    bg: 'bg-bg-primary',
    content: (
      <div className="max-w-2xl">
        <span className="section-title mb-6 block">Key Feature</span>
        <h2 className="text-[36px] font-light tracking-[-0.02em] text-text-main mb-10 leading-tight">
          AI 工作包资产库
        </h2>
        <div className="bg-white rounded-[24px] p-8 border border-border-default mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-accent-50 flex items-center justify-center">
              <Repeat className="w-5 h-5 text-accent-500" />
            </div>
            <div>
              <div className="text-[16px] font-medium text-text-main">618 竞品评论分析 Work Kit</div>
              <div className="text-[12px] text-text-muted">v1.2 · 复用 3 次 · 5 个岗位</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 text-[12px] mb-6">
            {['竞品商品分析(商品)', '卖点文案转译(文案)', '客服 FAQ(客服)', '详情页优化(设计)', '大促策略汇总(运营)'].map((t) => (
              <div key={t} className="bg-gray-50 rounded-xl p-2.5 text-text-secondary flex items-center gap-2">
                <span className="w-1 h-1 rounded-full bg-accent-400 shrink-0" />{t}
              </div>
            ))}
          </div>
          <div className="flex items-center gap-6 text-[11px] text-text-muted border-t border-border-light pt-4">
            <span className="flex items-center gap-1"><Repeat className="w-3 h-3" /> 随时复用</span>
            <span>版本持续迭代</span>
            <span>团队经验不随人员流失</span>
          </div>
        </div>
        <p className="text-[15px] text-text-secondary text-center leading-relaxed">
          不保存结果，只保存<span className="text-accent-600 font-medium">流程和模板</span>——确保下一次大促可直接复用。
        </p>
      </div>
    ),
  },
  {
    bg: 'bg-sidebar',
    content: (
      <div className="flex flex-col items-center text-center">
        <div className="mb-6"><Logo variant="icon" theme="light" size={48} /></div>
        <h2 className="text-[40px] font-light tracking-[-0.02em] text-white mb-4">准备好开始了吗？</h2>
        <p className="text-[16px] text-white/50 mb-10 max-w-md leading-relaxed">
          从第一个大促分析项目开始<br />将有效的 AI 工作流程保存为团队资产
        </p>
        <div className="flex items-center gap-4">
          <Link to="/" className="btn-primary-filled bg-white text-accent-600 border-white hover:bg-white/90 hover:border-white">
            进入产品演示 <ArrowRight className="w-4 h-4" />
          </Link>
          <Link to="/create" className="btn-primary text-white border-white/40 hover:bg-white/10 hover:border-white">
            创建第一个项目 <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="mt-16 text-[12px] text-white/25">
          PromoKit AI · 电商大促 AI 工作包系统
        </div>
      </div>
    ),
  },
]

const backgrounds: Record<string, string> = {
  'bg-sidebar': '#1C1C1E',
  'bg-bg-primary': '#FAFAF9',
}

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
      className="min-h-screen flex items-center justify-center relative overflow-hidden transition-colors duration-500"
      style={{ background: backgrounds[slide.bg] || '#FAFAF9' }}
    >
      {/* Content */}
      <div key={current} className="animate-fade-in-up px-8 py-16">
        {slide.content}
      </div>

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-[3px] bg-white/10">
        <div
          className="h-full bg-accent-500 transition-all duration-500 ease-out"
          style={{ width: `${((current + 1) / total) * 100}%` }}
        />
      </div>

      {/* Page indicator */}
      <div className="absolute bottom-6 left-8 text-[11px] text-text-muted">
        {current + 1} / {total}
      </div>

      {/* Nav arrows */}
      <button
        onClick={goPrev}
        disabled={current === 0}
        className="absolute left-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors disabled:opacity-20"
      >
        <ChevronLeft className={`w-5 h-5 ${slide.bg === 'bg-sidebar' ? 'text-white' : 'text-text-main'}`} />
      </button>
      <button
        onClick={goNext}
        disabled={current === total - 1}
        className="absolute right-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors disabled:opacity-20"
      >
        <ChevronRight className={`w-5 h-5 ${slide.bg === 'bg-sidebar' ? 'text-white' : 'text-text-main'}`} />
      </button>

      {/* Dots */}
      <div className="absolute bottom-6 right-8 flex items-center gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className={`w-[8px] h-[8px] rounded-full transition-all ${
              i === current
                ? slide.bg === 'bg-sidebar' ? 'bg-white scale-125' : 'bg-accent-500 scale-125'
                : slide.bg === 'bg-sidebar' ? 'bg-white/20' : 'bg-gray-300'
            }`}
          />
        ))}
      </div>
    </div>
  )
}
