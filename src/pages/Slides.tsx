import React, { useState, useEffect, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, FileText, MessageSquareText, Palette, Repeat, ChevronLeft, ChevronRight, Clock, Users, TrendingUp, Search, Target, Database, LayoutDashboard, FolderOpen, Package, Briefcase, ClipboardList } from 'lucide-react'
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

const processColumns = [
  {
    no: '01',
    title: '需求池归类',
    icon: Search,
    visual: 'needs',
    caption: '从实际工作中归纳出关键问题',
    items: [
      ['资料分散', '评论、商品、客服反馈散落在不同文件'],
      ['岗位断裂', '各岗位分析口径与输出格式不统一'],
      ['经验不可交接', 'AI 用法停留在个人经验中'],
      ['重复整理', '每次大促都从零启动'],
    ],
  },
  {
    no: '02',
    title: '定义与策略',
    icon: Target,
    visual: 'strategy',
    caption: '将问题转化为产品定义与核心策略',
    items: [
      ['资料结构化', '统一资料类型与字段'],
      ['岗位任务化', '明确目标、输入与输出格式'],
      ['AI 可控化', '结构化分析 + 质量检查'],
      ['流程资产化', '沉淀为 Work Kit'],
    ],
  },
  {
    no: '03',
    title: '系统架构设计',
    icon: Database,
    visual: 'architecture',
    caption: '将策略转化为系统结构与功能模块',
    items: [
      ['电商资料库', '集中管理评论、商品、客服、文案'],
      ['岗位分析任务', '生成任务卡与 Prompt'],
      ['AI 分析工作台', '承载结果与质量检查'],
      ['报告与资产库', '汇总并保存流程资产'],
    ],
  },
  {
    no: '04',
    title: '界面设计',
    icon: LayoutDashboard,
    visual: 'interface',
    caption: '将系统结构转化为用户可操作的界面',
    items: [
      ['Dashboard', '项目总览与进度看板'],
      ['资料库', '导入与管理电商资料'],
      ['任务卡', '展示岗位任务和输出要求'],
      ['AI 工作台', '生成结构化分析结果'],
      ['报告页', '输出可执行策略报告'],
    ],
  },
]

function ConnectorLabel({ text, className = '' }: { text: string; className?: string }) {
  return (
    <div className={`absolute flex items-center gap-3 text-[12px] font-bold text-accent-600 ${className}`}>
      <span>{text}</span>
      <span className="h-px w-12 bg-accent-400/70" />
      <ArrowRight className="w-4 h-4" strokeWidth={2.2} />
    </div>
  )
}

function ProcessVisual({ type }: { type: string }) {
  if (type === 'needs') {
    return (
      <div className="h-[94px] rounded-[18px] border border-accent-100 bg-white/65 px-4 py-3 flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl border border-accent-100 bg-bg-surface flex items-center justify-center">
          <Search className="w-9 h-9 text-accent-500" strokeWidth={2.2} />
        </div>
        <div className="flex-1 space-y-2">
          {[
            ['竞品评论', 'bg-accent-500'],
            ['客服问答', 'bg-emerald-500'],
            ['历史文案', 'bg-amber-500'],
          ].map(([text, color]) => (
            <div key={text} className="h-7 rounded-lg border border-border-default bg-bg-surface px-3 flex items-center gap-2 text-[11px] font-medium text-text-secondary">
              <span className={`w-2 h-2 rounded-full ${color}`} />
              {text}
            </div>
          ))}
        </div>
      </div>
    )
  }

  if (type === 'strategy') {
    return (
      <div className="h-[94px] rounded-[18px] border border-accent-100 bg-white/65 px-4 py-3 flex items-center gap-4">
        <div className="w-16 h-16 rounded-full border border-accent-100 bg-bg-surface flex items-center justify-center">
          <Target className="w-10 h-10 text-accent-500" strokeWidth={2.3} />
        </div>
        <div className="grid grid-cols-2 gap-2 flex-1">
          {['结构', '任务', '质检', '资产'].map((text) => (
            <div key={text} className="h-8 rounded-lg border border-border-default bg-bg-surface flex items-center justify-center text-[11px] font-medium text-text-muted">{text}</div>
          ))}
        </div>
      </div>
    )
  }

  if (type === 'architecture') {
    const modules = [
      [Database, '资料库', 'text-blue-500'],
      [ClipboardList, '任务卡', 'text-emerald-600'],
      [Briefcase, '工作台', 'text-accent-500'],
      [Package, '资产库', 'text-red-500'],
    ]
    return (
      <div className="h-[94px] rounded-[18px] border border-accent-100 bg-white/65 px-4 py-3 grid grid-cols-2 gap-2">
        {modules.map(([Icon, text, color]) => (
          <div key={text as string} className="rounded-xl border border-border-default bg-bg-surface px-3 flex items-center gap-2">
            <Icon className={`w-4 h-4 ${color as string}`} strokeWidth={2.3} />
            <span className="text-[11px] font-medium text-text-secondary">{text as string}</span>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="h-[112px] rounded-[18px] border border-accent-100 bg-white/65 px-4 py-3 grid grid-cols-2 grid-rows-2 gap-2.5 overflow-hidden">
      {[
        [LayoutDashboard, 'Dashboard'],
        [FolderOpen, '资料库'],
        [Briefcase, '工作台'],
        [FileText, '报告页'],
      ].map(([Icon, text]) => (
        <div key={text as string} className="min-h-0 rounded-xl border border-border-default bg-bg-surface px-3 py-1.5 shadow-[0_8px_18px_rgba(28,28,30,0.03)]">
          <div className="flex items-center gap-2 mb-1.5">
            <Icon className="w-4 h-4 text-accent-500" strokeWidth={2.3} />
            <span className="text-[11px] font-bold text-text-secondary">{text as string}</span>
          </div>
          <div className="h-1.5 rounded-full bg-accent-100 mb-1.5" />
          <div className="h-1.5 w-[72%] rounded-full bg-gray-100" />
        </div>
      ))}
    </div>
  )
}

function ProcessCard({ column }: { column: typeof processColumns[number] }) {
  const Icon = column.icon
  const isInterface = column.visual === 'interface'
  return (
    <div className="h-[452px] rounded-[18px] border border-accent-200/80 bg-bg-surface/95 shadow-[0_20px_45px_rgba(28,28,30,0.07)] overflow-hidden">
      <div className="h-[58px] border-b border-accent-200/70 px-5 flex items-center justify-between bg-gradient-to-b from-white to-accent-50/25">
        <div className="flex items-baseline gap-3">
          <span className="text-[30px] leading-none font-bold text-accent-600 tracking-[-0.04em]">{column.no}</span>
          <span className="text-[19px] font-bold text-text-main tracking-[-0.02em]">{column.title}</span>
        </div>
        <div className="w-9 h-9 rounded-xl border border-accent-100 bg-bg-surface flex items-center justify-center">
          <Icon className="w-4.5 h-4.5 text-accent-500" strokeWidth={2.3} />
        </div>
      </div>
      <div className="p-4">
        <ProcessVisual type={column.visual} />
        <p className={`text-center text-[12px] text-text-muted ${isInterface ? 'mt-3 mb-3' : 'mt-4 mb-5'}`}>{column.caption}</p>
        <div className={isInterface ? 'space-y-2' : 'space-y-2.5'}>
          {column.items.map(([title, desc]) => (
            <div key={title} className={`${isInterface ? 'h-[35px]' : 'h-[46px]'} rounded-xl border border-border-default bg-bg-surface px-3.5 flex items-center gap-2.5`}>
              <span className="w-1.5 h-1.5 rounded-full bg-accent-400 shrink-0" />
              <div className="min-w-0">
                <div className="text-[12px] font-bold text-text-main leading-tight truncate">{title}</div>
                <div className="text-[10.5px] text-text-muted leading-tight truncate">{desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
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

  /* 8 ── Design Process Mapping */
  {
    theme: 'light' as const, bgVariant: 7,
    content: (
      <div className="relative w-[1180px] max-w-[calc(100vw-58px)] -my-12 pt-2 pb-2">
        <div className="absolute -right-40 -top-44 w-[350px] h-[350px] rounded-full bg-accent-50/45" />
        <div className="absolute -left-36 bottom-[-135px] w-[280px] h-[280px] rounded-full bg-gray-100/55" />
        <div className="absolute top-[292px] -left-16 w-36 h-px bg-accent-200/55" />
        <div className="absolute top-[430px] -right-14 w-36 h-px bg-accent-200/55" />

        <div className="relative flex items-start justify-between mb-11 animate-fade-in-up">
          <div className="flex items-center gap-4 pt-2">
            <Logo variant="icon" theme="light" size={34} />
            <div>
              <div className="text-[20px] font-bold tracking-[-0.03em] text-text-main leading-tight">PromoKit AI</div>
              <div className="text-[11px] text-text-muted mt-0.5">电商大促 AI 工作包系统</div>
            </div>
          </div>

          <div className="absolute left-1/2 -translate-x-1/2 top-0 text-center w-[620px]">
            <h2 className="text-[36px] font-bold tracking-[-0.04em] text-text-main leading-tight">PromoKit AI 的设计过程映射</h2>
            <p className="mt-2 text-[13px] text-text-muted">将抽象需求逐步转化为可落地的系统架构与用户界面，形成可复用的 AI 工作包流程</p>
          </div>
        </div>

        <div className="relative animate-scale-in" style={{ animationDelay: '80ms' }}>
          <ConnectorLabel text="转换" className="left-[353px] -top-[26px]" />
          <ConnectorLabel text="转换" className="left-[632px] -top-[26px]" />
          <ConnectorLabel text="转换" className="left-[907px] -top-[26px]" />

          <div className="grid grid-cols-4 gap-4">
            {processColumns.map((column) => (
              <ProcessCard key={column.no} column={column} />
            ))}
          </div>

          <ConnectorLabel text="决策" className="left-[76px] -bottom-[32px]" />
          <ConnectorLabel text="决策" className="left-[351px] -bottom-[32px]" />
          <ConnectorLabel text="决策" className="left-[628px] -bottom-[32px]" />
          <div className="absolute right-[87px] -bottom-[28px] text-[12px] font-medium text-text-muted">界面落地</div>
        </div>

        <div className="relative mt-11 mx-auto w-[850px] h-[74px] rounded-2xl border border-accent-200/80 bg-bg-surface/95 shadow-[0_18px_45px_rgba(28,28,30,0.06)] flex items-center px-7 animate-fade-in-up" style={{ animationDelay: '180ms' }}>
          <div className="w-12 h-12 rounded-2xl border border-accent-100 bg-accent-50/40 flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6 text-accent-500" strokeWidth={2.3} />
          </div>
          <div className="h-10 w-px bg-accent-200 mx-7" />
          <div className="text-[20px] font-bold text-accent-600 shrink-0 mr-7">最终目标</div>
          <p className="text-[14px] leading-relaxed text-text-main">
            把一次有效的大促分析流程，转化为团队可复用、可交接、可迭代的 AI 工作包资产，持续提升团队效率与决策质量。
          </p>
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
    <div data-theme={slide.theme} className={`min-h-screen flex items-center justify-center relative overflow-hidden transition-colors duration-700 ${slide.theme === 'dark' ? 'bg-sidebar' : 'bg-bg-primary'}`}>
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
