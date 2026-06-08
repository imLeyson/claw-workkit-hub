import React, { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, FileText, MessageSquareText, Palette, Repeat, ChevronLeft, ChevronRight, Clock, Users, TrendingUp } from 'lucide-react'
import Logo from '../components/Logo'

/* ── Background system ── */
function Decors({ theme, variant }: { theme: 'light' | 'dark'; variant: number }) {
  const patterns: Record<number, React.ReactNode> = {
    // Cover / CTA — centered radial glow
    0: (
      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <radialGradient id="glow" cx="50%" cy="45%"><stop offset="0%" stopColor={theme === 'dark' ? 'rgba(224,123,76,0.15)' : 'rgba(224,123,76,0.08)'} /><stop offset="100%" stopColor="transparent" /></radialGradient>
        </defs>
        <rect width="100" height="100" fill="url(#glow)" />
        {/* Subtle ring */}
        <circle cx="50" cy="45" r="28" fill="none" stroke={theme === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)'} strokeWidth="0.3" />
        <circle cx="50" cy="45" r="42" fill="none" stroke={theme === 'dark' ? 'rgba(255,255,255,0.025)' : 'rgba(0,0,0,0.02)'} strokeWidth="0.2" />
      </svg>
    ),
    // Problem — scattered dots lower-left
    1: (
      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <radialGradient id="accent1" cx="12%" cy="88%"><stop offset="0%" stopColor="rgba(224,123,76,0.06)" /><stop offset="100%" stopColor="transparent" /></radialGradient>
        </defs>
        <rect width="100" height="100" fill="url(#accent1)" />
        {[[8,92],[14,88],[20,94],[10,82],[18,90]].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={i === 0 ? 1.8 : 1} fill="rgba(224,123,76,0.12)" />
        ))}
        {/* Fine line top-right */}
        <line x1="82" y1="12" x2="92" y2="12" stroke="rgba(0,0,0,0.04)" strokeWidth="0.4" strokeLinecap="round" />
        <line x1="85" y1="16" x2="90" y2="16" stroke="rgba(0,0,0,0.03)" strokeWidth="0.3" strokeLinecap="round" />
      </svg>
    ),
    // Cost — large soft accent shape
    2: (
      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <radialGradient id="accent2" cx="90%" cy="10%"><stop offset="0%" stopColor="rgba(224,123,76,0.08)" /><stop offset="100%" stopColor="transparent" /></radialGradient>
        </defs>
        <rect width="100" height="100" fill="url(#accent2)" />
        <rect x="86" y="8" width="8" height="8" rx="2" fill="none" stroke="rgba(224,123,76,0.1)" strokeWidth="0.5" />
        <rect x="88" y="10" width="4" height="4" rx="1" fill="none" stroke="rgba(224,123,76,0.08)" strokeWidth="0.3" />
      </svg>
    ),
    // Solution — grid pattern
    3: (
      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs>
          <pattern id="grid" width="8" height="8" patternUnits="userSpaceOnUse">
            <circle cx="4" cy="4" r="0.4" fill="rgba(224,123,76,0.08)" />
          </pattern>
        </defs>
        <rect width="100" height="100" fill="url(#grid)" />
        <defs><radialGradient id="accent3" cx="5%" cy="5%"><stop offset="0%" stopColor="rgba(224,123,76,0.05)" /><stop offset="100%" stopColor="transparent" /></radialGradient></defs>
        <rect width="100" height="100" fill="url(#accent3)" />
      </svg>
    ),
    // Workflow (dark) — architectural lines
    4: (
      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs><radialGradient id="glow4" cx="48%" cy="40%"><stop offset="0%" stopColor="rgba(224,123,76,0.10)" /><stop offset="100%" stopColor="transparent" /></radialGradient></defs>
        <rect width="100" height="100" fill="url(#glow4)" />
        {/* Subtle horizontal lines */}
        <line x1="10" y1="28" x2="40" y2="28" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" strokeLinecap="round" />
        <line x1="60" y1="72" x2="90" y2="72" stroke="rgba(255,255,255,0.03)" strokeWidth="0.5" strokeLinecap="round" />
        {/* Dot grid */}
        {[15,25,35,55,65,75,85].map((x) => [35,45,55,65].map((y) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r="0.3" fill="rgba(255,255,255,0.04)" />
        )))}
      </svg>
    ),
    // Differentiator — elegant arcs
    5: (
      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
        <circle cx="92" cy="8" r="16" fill="none" stroke="rgba(224,123,76,0.06)" strokeWidth="0.6" />
        <circle cx="92" cy="8" r="20" fill="none" stroke="rgba(224,123,76,0.04)" strokeWidth="0.4" />
        <circle cx="8" cy="88" r="12" fill="none" stroke="rgba(0,0,0,0.025)" strokeWidth="0.5" />
        <line x1="15" y1="18" x2="28" y2="18" stroke="rgba(0,0,0,0.04)" strokeWidth="0.5" strokeLinecap="round" />
      </svg>
    ),
    // Before/After — dual tone
    6: (
      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
        <rect x="0" y="0" width="48" height="100" fill="rgba(0,0,0,0.008)" />
        <rect x="50" y="0" width="50" height="100" fill="rgba(224,123,76,0.02)" />
        <line x1="49" y1="0" x2="49" y2="100" stroke="rgba(224,123,76,0.08)" strokeWidth="0.3" strokeDasharray="1 2" />
      </svg>
    ),
    // Design process — clean + accent top-right
    7: (
      <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
        <defs><radialGradient id="accent7" cx="95%" cy="5%"><stop offset="0%" stopColor="rgba(224,123,76,0.04)" /><stop offset="100%" stopColor="transparent" /></radialGradient></defs>
        <rect width="100" height="100" fill="url(#accent7)" />
        <line x1="0" y1="12" x2="8" y2="12" stroke="rgba(224,123,76,0.12)" strokeWidth="0.6" strokeLinecap="round" />
        <line x1="92" y1="94" x2="98" y2="94" stroke="rgba(0,0,0,0.04)" strokeWidth="0.4" strokeLinecap="round" />
      </svg>
    ),
  }

  return patterns[variant] || null
}

/* ── Section label ── */
function Label({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-3 mb-10 animate-fade-in-up">
      <div className="h-px w-8 bg-accent-400" />
      <span className="text-[10px] font-semibold tracking-[0.18em] text-accent-600 uppercase">{text}</span>
    </div>
  )
}

function StatCard({ icon: Icon, value, label, sub, accent }: { icon: any; value: string; label: string; sub: string; accent?: boolean }) {
  return (
    <div className={`animate-fade-in-up rounded-2xl p-6 text-center transition-all duration-300 hover:-translate-y-1 ${accent ? 'bg-accent-500 text-white shadow-lg shadow-accent-500/20' : 'bg-bg-surface border border-border-default hover:shadow-md'}`}>
      <Icon className={`w-6 h-6 mx-auto mb-3 ${accent ? 'text-white/80' : 'text-accent-500'}`} />
      <div className={`text-[32px] font-light leading-none mb-2 tracking-[-0.02em] ${accent ? 'text-white' : 'text-text-main'}`}>{value}</div>
      <div className={`text-[12px] font-semibold mb-1 ${accent ? 'text-white/85' : 'text-text-main'}`}>{label}</div>
      <div className={`text-[11px] leading-snug ${accent ? 'text-white/50' : 'text-text-muted'}`}>{sub}</div>
    </div>
  )
}

/* ── Slide data ── */
const slides = [
  /* 1 ── Cover */
  {
    theme: 'dark' as const, bgVariant: 0,
    content: (
      <div className="flex flex-col items-center text-center max-w-2xl">
        <div className="animate-scale-in mb-10">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-accent-500/12 scale-[1.5] animate-pulse" style={{ animationDuration: '3s' }} />
            <Logo variant="icon" theme="light" size={68} />
          </div>
        </div>
        <h1 className="text-[68px] font-light tracking-[-0.03em] text-white mb-3 animate-fade-in-up">PromoKit AI</h1>
        <p className="text-[18px] text-white/45 mb-12 animate-fade-in-up" style={{ animationDelay: '100ms' }}>
          电商大促 AI 工作包系统
        </p>
        <p className="text-[15px] text-white/28 max-w-md leading-relaxed animate-fade-in-up" style={{ animationDelay: '250ms' }}>
          把一次有效的大促分析流程<br />沉淀为团队可复用的 AI 工作包
        </p>
        <div className="flex items-center gap-4 mt-16 text-[11px] text-white/14 animate-fade-in" style={{ animationDelay: '500ms' }}>
          <span>618</span><span className="text-white/08">·</span><span>双 11</span><span className="text-white/08">·</span><span>新品上架</span><span className="text-white/08">·</span><span>爆品复盘</span>
        </div>
      </div>
    ),
  },

  /* 2 ── Problem */
  {
    theme: 'light' as const, bgVariant: 1,
    content: (
      <div className="max-w-[680px] w-full">
        <Label text="Why PromoKit AI" />
        <h2 className="text-[44px] font-light tracking-[-0.02em] text-text-main mb-5 leading-[1.15] animate-fade-in-up">
          大促前的准备<br />团队总是从头来过
        </h2>
        <p className="text-[15px] text-text-muted mb-10 leading-relaxed animate-fade-in-up" style={{ animationDelay: '80ms' }}>
          五个岗位各自收集信息、各自分析、各自输出——<span className="text-accent-600 font-medium">口径不一，结果难以对齐</span>。
        </p>
        <div className="grid grid-cols-2 gap-3 mb-8 stagger">
          {[
            { role: '运营', stat: '3h+', desc: '每次手动整理竞品评论表格', icon: Clock },
            { role: '文案', stat: '无法复用', desc: '凭个人经验重新撰写话术', icon: FileText },
            { role: '客服', stat: '从零梳理', desc: '每次重新整理 FAQ 知识库', icon: MessageSquareText },
            { role: '设计', stat: '缺少依据', desc: '凭感觉调整详情页信息层级', icon: Palette },
          ].map((item) => (
            <div key={item.role} className="animate-fade-in-up bg-bg-surface rounded-2xl p-5 border border-border-default flex items-start gap-4 transition-shadow duration-300 hover:shadow-md">
              <div className="w-10 h-10 rounded-xl bg-accent-50 flex items-center justify-center shrink-0">
                <item.icon className="w-5 h-5 text-accent-500" />
              </div>
              <div>
                <div className="text-[20px] font-light text-text-main leading-none mb-1">{item.stat}</div>
                <div className="text-[10px] font-semibold text-text-muted uppercase tracking-[0.1em] mb-0.5">{item.role}岗</div>
                <div className="text-[12px] text-text-muted leading-snug">{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
        <div className="bg-sidebar rounded-2xl p-5 text-center animate-fade-in-up" style={{ animationDelay: '350ms' }}>
          <p className="text-[15px] text-white/70 leading-relaxed">
            结果：下次大促，<span className="text-accent-400 font-semibold">所有人从零开始再来一遍</span>。
          </p>
        </div>
      </div>
    ),
  },

  /* 3 ── Cost */
  {
    theme: 'light' as const, bgVariant: 2,
    content: (
      <div className="max-w-[680px] w-full">
        <Label text="The Hidden Cost" />
        <h2 className="text-[44px] font-light tracking-[-0.02em] text-text-main mb-5 leading-[1.15] animate-fade-in-up">
          团队经验<br />正在悄悄流失
        </h2>
        <p className="text-[15px] text-text-muted mb-10 leading-relaxed animate-fade-in-up" style={{ animationDelay: '80ms' }}>
          每次大促的分析流程、判断标准和输出模板，都只存在个人脑子里。<span className="text-accent-600 font-medium">人一走，经验就没了</span>。
        </p>
        <div className="grid grid-cols-3 gap-4 mb-10 stagger">
          <StatCard icon={Clock} value="12h+" label="每次大促重复耗时" sub="整理资料 + 分析 + 汇总报告" accent />
          <StatCard icon={Users} value="5 岗位" label="各自独立作战" sub="分析口径与输出格式不统一" />
          <StatCard icon={TrendingUp} value="0 积累" label="经验无法沉淀" sub="上次分析成果下次用不上" />
        </div>
        <p className="text-[14px] text-text-muted text-center animate-fade-in-up leading-relaxed" style={{ animationDelay: '350ms' }}>
          团队并不缺 AI 工具——<span className="text-accent-600 font-semibold">缺的是把 AI 分析流程化、资产化的系统</span>。
        </p>
      </div>
    ),
  },

  /* 4 ── Solution */
  {
    theme: 'light' as const, bgVariant: 3,
    content: (
      <div className="max-w-[720px] w-full">
        <Label text="The Solution" />
        <h2 className="text-[44px] font-light tracking-[-0.02em] text-text-main mb-4 leading-[1.15] animate-fade-in-up">
          用 PromoKit AI<br />把流程变成资产
        </h2>
        <p className="text-[15px] text-text-muted mb-10 leading-relaxed animate-fade-in-up" style={{ animationDelay: '80ms' }}>
          同一份数据源 → 五个岗位协同分析 → 结构化输出 → <span className="text-accent-600 font-semibold">一键沉淀为可复用工作包</span>
        </p>
        <div className="grid grid-cols-3 gap-3 stagger">
          {[
            { num: '01', title: '评论挖掘', desc: '自动聚类用户高频痛点，构建分析矩阵' },
            { num: '02', title: '卖点生成', desc: '用户原话转化为可量化、可传播的商品卖点' },
            { num: '03', title: '客服 FAQ', desc: '售前疑虑 + 售后风险话术，带等级标注' },
            { num: '04', title: '详情页优化', desc: '基于用户关注热度重排信息层级' },
            { num: '05', title: '策略汇总', desc: '跨岗位整合大促执行清单与风险点' },
            { num: '06', title: '资产沉淀', desc: '保存流程与模板，下次大促几分钟启动' },
          ].map((item) => (
            <div key={item.num} className="animate-fade-in-up bg-bg-surface rounded-2xl p-5 border border-border-default transition-shadow duration-300 hover:shadow-md group">
              <div className="text-[11px] font-bold text-accent-400 mb-2 group-hover:text-accent-500 transition-colors">{item.num}</div>
              <div className="text-[15px] font-semibold text-text-main mb-1.5">{item.title}</div>
              <div className="text-[12px] text-text-muted leading-relaxed">{item.desc}</div>
            </div>
          ))}
        </div>
      </div>
    ),
  },

  /* 5 ── Workflow (dark) */
  {
    theme: 'dark' as const, bgVariant: 4,
    content: (
      <div className="max-w-[760px] w-full">
        <div className="flex items-center gap-3 mb-10 animate-fade-in-up">
          <div className="h-px w-8 bg-accent-500/60" />
          <span className="text-[10px] font-semibold tracking-[0.18em] text-accent-400 uppercase">How It Works</span>
        </div>
        <h2 className="text-[44px] font-light tracking-[-0.02em] text-white mb-12 leading-[1.15] animate-fade-in-up">
          六步完成闭环<br />最后一步才是关键
        </h2>
        <div className="flex items-start gap-0 stagger mb-12">
          {[
            { step: '01', label: '创建项目', sub: '设定目标与范围' },
            { step: '02', label: '导入资料', sub: '上传竞品数据' },
            { step: '03', label: '生成任务', sub: 'AI 自动拆解' },
            { step: '04', label: 'AI 分析', sub: '结构化输出' },
            { step: '05', label: '汇总报告', sub: '跨岗位整合' },
            { step: '06', label: '沉淀复用', sub: '保存 Work Kit' },
          ].map((item, i, arr) => (
            <div key={item.step} className="flex-1 flex items-start animate-fade-in-up">
              <div className="text-center flex-1">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-3 transition-all duration-300 ${i === 5 ? 'bg-accent-500 text-white shadow-lg shadow-accent-500/30' : 'bg-white/6 text-white/50 hover:bg-white/10'}`}>
                  <span className="text-[15px] font-semibold">{item.step}</span>
                </div>
                <div className="text-[13px] text-white/80 font-semibold">{item.label}</div>
                <div className="text-[11px] text-white/30 mt-1">{item.sub}</div>
              </div>
              {i < arr.length - 1 && (
                <div className="pt-6 -ml-1 mr-1 opacity-40"><ArrowRight className="w-3 h-3 text-white" /></div>
              )}
            </div>
          ))}
        </div>
        <div className="bg-white/4 rounded-2xl p-5 text-center animate-fade-in-up" style={{ animationDelay: '450ms' }}>
          <p className="text-[14px] text-white/55 leading-relaxed">
            第 6 步沉淀的 Work Kit，让下一次的第 1 步<br />从<span className="text-white/35 line-through">"从零开始"</span> 变成 <span className="text-accent-400 font-semibold">"几分钟启动"</span>。
          </p>
        </div>
      </div>
    ),
  },

  /* 6 ── Differentiator */
  {
    theme: 'light' as const, bgVariant: 5,
    content: (
      <div className="max-w-[680px] w-full">
        <Label text="Key Differentiator" />
        <h2 className="text-[44px] font-light tracking-[-0.02em] text-text-main mb-4 leading-[1.15] animate-fade-in-up">
          我们保存的不是结果<br />而是流程本身
        </h2>
        <p className="text-[15px] text-text-muted mb-10 leading-relaxed animate-fade-in-up" style={{ animationDelay: '80ms' }}>
          每个 Work Kit 记录的是<span className="text-accent-600 font-semibold">资料结构、任务模板、Prompt 和报告格式</span>。换一个品类、换一次大促，照样能用。
        </p>
        <div className="bg-bg-surface rounded-[24px] p-7 border border-border-default shadow-sm mb-6 animate-scale-in" style={{ animationDelay: '150ms' }}>
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-accent-50 flex items-center justify-center"><Repeat className="w-5 h-5 text-accent-500" /></div>
              <div>
                <div className="text-[15px] font-semibold text-text-main">618 竞品评论分析 Work Kit</div>
                <div className="text-[11px] text-text-muted">v1.2 · 已复用 3 次</div>
              </div>
            </div>
            <span className="text-[10px] px-2.5 py-1 rounded-full bg-accent-50 text-accent-600 font-semibold">可复用模板</span>
          </div>
          <div className="flex items-center gap-2 mb-5 text-[11px] text-text-muted overflow-x-auto pb-1">
            {['v1.0 初始模板', 'v1.1 客服增强', 'v1.2 首屏优化'].map((v, i, arr) => (
              <span key={v} className="flex items-center gap-2 shrink-0">{v}{i < arr.length - 1 && <ArrowRight className="w-3 h-3 text-accent-300" />}</span>
            ))}
          </div>
          <div className="grid grid-cols-4 gap-2 text-[11px]">
            {['资料结构', '岗位配置', '任务 Prompt', '报告格式'].map((t) => (
              <div key={t} className="bg-white/5 rounded-lg px-3 py-2.5 text-text-secondary text-center font-medium">{t}</div>
            ))}
          </div>
        </div>
        <p className="text-[14px] text-text-muted text-center animate-fade-in-up leading-relaxed" style={{ animationDelay: '300ms' }}>
          每次大促后迭代一个版本——<span className="text-accent-600 font-semibold">团队经验永不丢失</span>。
        </p>
      </div>
    ),
  },

  /* 7 ── Before/After */
  {
    theme: 'light' as const, bgVariant: 6,
    content: (
      <div className="max-w-[680px] w-full">
        <Label text="The Impact" />
        <h2 className="text-[44px] font-light tracking-[-0.02em] text-text-main mb-8 leading-[1.15] animate-fade-in-up">用数据说话</h2>
        <div className="grid grid-cols-2 gap-5 stagger mb-8">
          <div className="animate-fade-in-up bg-white/5 rounded-2xl p-7 border border-border-default">
            <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-text-muted mb-5">Before</div>
            <div className="space-y-3">
              {['各岗位各自整理资料', '分析口径与格式不统一', 'AI 输出无结构化沉淀', '每次大促从零启动'].map((t) => (
                <div key={t} className="flex items-center gap-3 text-[13px] text-text-muted"><span className="w-5 h-5 rounded-full bg-red-50 flex items-center justify-center shrink-0 text-[10px] text-red-500">✕</span> {t}</div>
              ))}
            </div>
          </div>
          <div className="animate-fade-in-up bg-accent-500/[0.06] rounded-2xl p-7 border border-accent-500/20">
            <div className="text-[10px] font-bold uppercase tracking-[0.15em] text-accent-600 mb-5">With PromoKit AI</div>
            <div className="space-y-3">
              {['统一资料库 · 同源协同', '各岗位结构化 AI 输出', '一键保存为 Work Kit', '下次大促几分钟启动'].map((t) => (
                <div key={t} className="flex items-center gap-3 text-[13px] text-text-secondary"><span className="w-5 h-5 rounded-full bg-accent-500/15 flex items-center justify-center shrink-0 text-[10px] text-accent-600">✓</span> {t}</div>
              ))}
            </div>
          </div>
        </div>
        <div className="animate-fade-in-up" style={{ animationDelay: '350ms' }}>
          <div className="bg-sidebar rounded-2xl px-8 py-5 flex items-center justify-center gap-8">
            <div className="text-center">
              <div className="text-[11px] text-white/35 uppercase tracking-wider mb-1">启动耗时</div>
              <div className="flex items-baseline gap-2">
                <span className="text-[28px] font-light text-white/40 line-through">3h</span>
                <ArrowRight className="w-4 h-4 text-accent-400" />
                <span className="text-[28px] font-light text-accent-400">5min</span>
              </div>
            </div>
            <div className="w-px h-10 bg-white/8" />
            <div className="text-center">
              <div className="text-[11px] text-white/35 uppercase tracking-wider mb-1">经验复用</div>
              <div className="flex items-baseline gap-2">
                <span className="text-[28px] font-light text-white/40">0%</span>
                <ArrowRight className="w-4 h-4 text-accent-400" />
                <span className="text-[28px] font-light text-white">100%</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
  },

  /* 8 ── System Diagram Requirement */
  {
    theme: 'light' as const, bgVariant: 7,
    content: (
      <div className="w-[1120px] max-w-[calc(100vw-96px)] -my-8">
        <div className="flex items-start justify-between mb-5 animate-fade-in-up">
          <div>
            <Label text="System Diagram" />
            <h2 className="text-[34px] font-light tracking-[-0.02em] text-text-main leading-none mb-2">系统图表：转换与决策</h2>
            <p className="text-[13px] text-text-muted">按要求展示从需求归类到界面设计的完整迭代过程，让关键设计逻辑一眼可读。</p>
          </div>
          <div className="rounded-2xl border border-border-default bg-bg-surface px-4 py-3 shadow-sm text-right">
            <div className="text-[12px] text-text-muted mb-1">PromoKit AI</div>
            <div className="text-[15px] font-medium text-text-main">大促 AI 工作包设计逻辑</div>
          </div>
        </div>

        <div className="rounded-[26px] bg-bg-surface border border-border-default shadow-[0_18px_50px_rgba(28,28,30,0.06)] px-6 py-6 animate-scale-in" style={{ animationDelay: '80ms' }}>
          <svg className="w-full h-[330px]" viewBox="0 0 1040 330" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <marker id="system-arrow" markerWidth="10" markerHeight="10" refX="8" refY="5" orient="auto" markerUnits="strokeWidth">
                <path d="M1 1L9 5L1 9" stroke="#1A1A1A" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </marker>
            </defs>

            <g stroke="#1A1A1A" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none">
              <path d="M120 112 C120 48 165 35 230 35" markerEnd="url(#system-arrow)" />
              <path d="M330 35 C380 35 395 55 395 112" markerEnd="url(#system-arrow)" />
              <path d="M452 112 C452 48 497 35 562 35" markerEnd="url(#system-arrow)" />
              <path d="M662 35 C712 35 727 55 727 112" markerEnd="url(#system-arrow)" />
              <path d="M784 112 C784 48 829 35 894 35" markerEnd="url(#system-arrow)" />
              <path d="M994 35 C1020 45 1020 82 1020 112" markerEnd="url(#system-arrow)" />

              <path d="M255 165 H340" markerEnd="url(#system-arrow)" />
              <path d="M586 165 H672" markerEnd="url(#system-arrow)" />
              <path d="M892 165 H978" markerEnd="url(#system-arrow)" />

              <path d="M120 218 C120 282 165 295 230 295" markerEnd="url(#system-arrow)" />
              <path d="M330 295 C380 295 395 275 395 218" markerEnd="url(#system-arrow)" />
              <path d="M452 218 C452 282 497 295 562 295" markerEnd="url(#system-arrow)" />
              <path d="M662 295 C712 295 727 275 727 218" markerEnd="url(#system-arrow)" />
              <path d="M784 218 C784 282 829 295 894 295" markerEnd="url(#system-arrow)" />
              <path d="M994 295 C1020 285 1020 248 1020 218" markerEnd="url(#system-arrow)" />
            </g>

            <g fontFamily="-apple-system, BlinkMacSystemFont, 'PingFang SC', 'Microsoft YaHei', sans-serif" textAnchor="middle">
              <text x="260" y="67" fontSize="42" fontWeight="700" fill="#1A1A1A">转换</text>
              <text x="592" y="67" fontSize="42" fontWeight="700" fill="#1A1A1A">转换</text>
              <text x="924" y="67" fontSize="42" fontWeight="700" fill="#1A1A1A">转换</text>

              <text x="110" y="183" fontSize="44" fontWeight="700" fill="#1A1A1A">需求池归类</text>
              <text x="435" y="183" fontSize="44" fontWeight="700" fill="#1A1A1A">定义与策略</text>
              <text x="705" y="183" fontSize="40" fontWeight="700" fill="#1A1A1A">系统架构设计</text>
              <text x="962" y="183" fontSize="44" fontWeight="700" fill="#1A1A1A">界面设计</text>

              <text x="260" y="310" fontSize="42" fontWeight="700" fill="#1A1A1A">决策</text>
              <text x="592" y="310" fontSize="42" fontWeight="700" fill="#1A1A1A">决策</text>
              <text x="924" y="310" fontSize="42" fontWeight="700" fill="#1A1A1A">决策</text>
            </g>
          </svg>
        </div>

        <div className="grid grid-cols-[1fr_1fr] gap-4 mt-4 animate-fade-in-up" style={{ animationDelay: '180ms' }}>
          <div className="rounded-2xl border border-border-default bg-bg-surface p-4 shadow-sm">
            <div className="text-[13px] font-medium text-text-main mb-2">对标图片要求</div>
            <p className="text-[12px] leading-relaxed text-text-muted">用系统图完整呈现项目关键节点的迭代过程：从需求池归类开始，经由定义与策略、系统架构设计，最终落到界面设计。</p>
          </div>
          <div className="rounded-2xl bg-sidebar p-4 text-white shadow-sm">
            <div className="text-[13px] font-medium text-accent-400 mb-2">核心表达</div>
            <p className="text-[12px] leading-relaxed text-white/62">“转换”说明每一阶段如何生成下一阶段，“决策”说明每一阶段如何完成取舍与界定，避免从需求直接跳到界面。</p>
          </div>
        </div>
      </div>
    ),
  },

  /* 9 ── CTA */
  {
    theme: 'dark' as const, bgVariant: 0,
    content: (
      <div className="flex flex-col items-center text-center max-w-xl">
        <div className="animate-scale-in mb-8">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-accent-500/10 scale-[1.4] animate-pulse" style={{ animationDuration: '2.5s' }} />
            <Logo variant="icon" theme="light" size={52} />
          </div>
        </div>
        <h2 className="text-[48px] font-light tracking-[-0.02em] text-white mb-2 leading-[1.15] animate-fade-in-up" style={{ animationDelay: '120ms' }}>PromoKit AI</h2>
        <p className="text-[17px] text-white/40 mb-4 animate-fade-in-up" style={{ animationDelay: '180ms' }}>电商大促 AI 工作包系统</p>
        <div className="w-16 h-px bg-accent-500 mb-8 animate-fade-in-up" style={{ animationDelay: '250ms' }} />
        <p className="text-[15px] text-white/35 max-w-sm leading-relaxed mb-10 animate-fade-in-up" style={{ animationDelay: '300ms' }}>
          把一次有效的大促分析流程<br />变成团队下一次可直接复用的起点
        </p>
        <div className="flex items-center gap-4 animate-fade-in-up" style={{ animationDelay: '400ms' }}>
          <Link to="/" className="btn-primary-filled bg-bg-surface text-accent-600 border-white hover:bg-bg-surface/90 hover:border-white text-[15px] px-8 py-3.5 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-white/10">
            进入产品演示 <ArrowRight className="w-4 h-4" />
          </Link>
          <Link to="/create" className="btn-primary text-white border-white/25 hover:bg-white/8 hover:border-white/50 text-[15px] px-8 py-3.5 transition-all duration-300">
            创建第一个项目 <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <p className="mt-16 text-[11px] text-white/12 animate-fade-in" style={{ animationDelay: '600ms' }}>PromoKit AI · 电商大促 AI 工作包系统</p>
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
      <Decors theme={slide.theme} variant={slide.bgVariant} />
      <div key={current} className="relative z-10 px-8 py-16 animate-fade-in-up">{slide.content}</div>

      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-white/5">
        <div className="h-full bg-accent-500 transition-all duration-500 ease-out" style={{ width: `${((current + 1) / total) * 100}%` }} />
      </div>

      <div className={`absolute bottom-6 left-8 text-[11px] font-medium tracking-wider ${slide.theme === 'dark' ? 'text-white/18' : 'text-text-muted'}`}>
        {String(current + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
      </div>

      <button onClick={goPrev} disabled={current === 0}
        className={`absolute left-6 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center transition-all disabled:opacity-0 ${slide.theme === 'dark' ? 'bg-white/5 hover:bg-white/12' : 'bg-black/3 hover:bg-black/6'}`}>
        <ChevronLeft className={`w-4 h-4 ${slide.theme === 'dark' ? 'text-white/45' : 'text-text-muted'}`} />
      </button>
      <button onClick={goNext} disabled={current === total - 1}
        className={`absolute right-6 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full flex items-center justify-center transition-all disabled:opacity-0 ${slide.theme === 'dark' ? 'bg-white/5 hover:bg-white/12' : 'bg-black/3 hover:bg-black/6'}`}>
        <ChevronRight className={`w-4 h-4 ${slide.theme === 'dark' ? 'text-white/45' : 'text-text-muted'}`} />
      </button>

      <div className="absolute bottom-6 right-8 flex items-center gap-2">
        {slides.map((_, i) => (
          <button key={i} onClick={() => setCurrent(i)}
            className={`rounded-full transition-all duration-300 ${
              i === current
                ? `w-5 h-[7px] ${slide.theme === 'dark' ? 'bg-white' : 'bg-accent-500'}`
                : `w-[7px] h-[7px] ${slide.theme === 'dark' ? 'bg-white/12 hover:bg-white/25' : 'bg-gray-300 hover:bg-gray-400'}`
            }`} />
        ))}
      </div>
    </div>
  )
}
