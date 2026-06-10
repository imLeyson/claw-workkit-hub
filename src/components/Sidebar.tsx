import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, PlusCircle, FolderOpen, LayoutGrid, BarChart3,
  Archive, Menu, X, Sparkles, Package, Bot, ArrowRight, ClipboardCheck,
} from 'lucide-react'
import Logo from './Logo'
import { getAIResult, getMaterials, getProjectBySlug, getTasks, getWorkKits } from '../services/db'

function isInFlow(pathname: string) {
  return ['/materials', '/tasks', '/workspace', '/report'].some((p) => pathname.startsWith(p))
}

function extractSlug(pathname: string): string {
  const parts = pathname.split('/').filter(Boolean)
  if (parts.length >= 2 && isInFlow(pathname)) return parts[1]
  return '618-hair-dryer'
}

function extractTaskId(pathname: string): string | undefined {
  const parts = pathname.split('/').filter(Boolean)
  if (parts[0] === 'workspace' && parts.length >= 3) return parts[2]
  return undefined
}

function readAssetHandoffs(): any[] {
  try {
    return JSON.parse(localStorage.getItem('promokit_asset_handoffs') || '[]')
  } catch {
    return []
  }
}

export default function Sidebar() {
  const location = useLocation()
  const pathname = location.pathname
  const inFlow = isInFlow(pathname)
  const slug = extractSlug(pathname)
  const [expanded, setExpanded] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const project = inFlow ? getProjectBySlug(slug) : undefined
  const tasks = project ? getTasks(project.id) : []
  const materials = project ? getMaterials(project.id) : []
  const handoffs = project ? readAssetHandoffs().filter((handoff) => handoff.projectId === project.id) : []
  const taskId = extractTaskId(pathname) || tasks[0]?.id
  const workspacePath = taskId ? `/workspace/${slug}/${taskId}` : `/tasks/${slug}`
  const submittedCount = tasks.filter((task) => task.status === 'submitted' || getAIResult(task.id)?.submitted).length
  const existingKit = project ? getWorkKits().find((kit) => kit.basedOnProjectId === project.id) : undefined
  const flowProgressItems = [
    materials.length > 0,
    tasks.length > 0,
    submittedCount > 0,
    handoffs.length > 0,
    Boolean(existingKit),
  ]
  const flowProgress = project ? Math.round((flowProgressItems.filter(Boolean).length / flowProgressItems.length) * 100) : 0
  const nextFlowStep = !project
    ? { label: '选择项目', path: '/' }
    : materials.length === 0
      ? { label: '补齐资料', path: `/materials/${slug}` }
      : tasks.length === 0
        ? { label: '生成任务', path: `/tasks/${slug}` }
        : submittedCount === 0
          ? { label: '进入分析', path: workspacePath }
          : !existingKit
            ? { label: '发布 Work Kit', path: `/report/${slug}` }
            : { label: '查看资产', path: '/archive' }
  const flowSteps = [
    { path: `/materials/${slug}`, label: '资料', value: project ? '原料' : '入口', done: project ? true : false },
    { path: `/tasks/${slug}`, label: '任务', value: tasks.length ? `${tasks.length}张` : '待生成', done: tasks.length > 0 },
    { path: workspacePath, match: `/workspace/${slug}`, label: '工作台', value: submittedCount ? `${submittedCount}项` : '分析', done: submittedCount > 0 },
    { path: `/report/${slug}`, label: '报告', value: handoffs.length ? `${handoffs.length}交接` : '复核', done: handoffs.length > 0 },
    { path: '/archive', label: '资产', value: existingKit?.version || '沉淀', done: Boolean(existingKit) },
  ]

  const links = [
    { to: '/', label: '看板', icon: LayoutDashboard, end: true },
    { to: '/create', label: '新建项目', icon: PlusCircle },
    { to: `/materials/${slug}`, label: '资料库', icon: FolderOpen, flow: true },
    { to: `/tasks/${slug}`, label: '任务卡', icon: LayoutGrid, flow: true },
    { to: `/report/${slug}`, label: '报告', icon: BarChart3, flow: true },
    { to: '/archive', label: '资产库', icon: Archive },
  ]

  const visibleLinks = links.filter((l) => {
    if (l.flow) return inFlow
    return true
  })

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="lg:hidden fixed top-3 left-3 z-50 w-9 h-9 rounded-xl bg-sidebar flex items-center justify-center"
      >
        {mobileOpen ? <X className="w-4 h-4 text-white" /> : <Menu className="w-4 h-4 text-white" />}
      </button>
      {/* Overlay */}
      {mobileOpen && <div className="lg:hidden fixed inset-0 bg-black/40 z-30" onClick={() => setMobileOpen(false)} />}
      <aside
        className={`shrink-0 bg-sidebar min-h-screen flex flex-col transition-all duration-300 ease-out overflow-hidden z-40
          ${mobileOpen ? 'fixed left-0 top-0 bottom-0 w-[220px]' : 'max-lg:hidden'}
          ${expanded ? 'w-[220px]' : 'w-[56px]'}
        `}
        onMouseEnter={() => setExpanded(true)}
        onMouseLeave={() => setExpanded(false)}
      >
      {/* Brand */}
      <div className="h-14 flex items-center px-[14px] border-b border-white/[0.06] shrink-0 overflow-hidden">
        <div className="flex items-center">
          <Logo variant="icon" theme="light" size={22} />
          <span className={`transition-all duration-200 whitespace-nowrap overflow-hidden ${expanded ? 'opacity-100 w-auto ml-2.5' : 'opacity-0 w-0 ml-0'}`}>
            <div className="flex flex-col leading-tight">
              <span className="text-[14px] font-semibold tracking-[-0.01em] text-white">PromoKit AI</span>
              <span className="text-[9px] text-white/35 tracking-[0.03em]">电商大促 AI 工作包系统</span>
            </div>
          </span>
        </div>
      </div>

      <nav className="flex-1 px-[8px] py-4 space-y-1">
        {visibleLinks.map((link) => {
          const active = link.end
            ? pathname === link.to
            : pathname.startsWith(link.to)
          return (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={`flex items-center gap-3 px-[10px] py-2.5 rounded-[12px] text-[13px] transition-all duration-200 whitespace-nowrap ${
                active
                  ? 'bg-white/[0.10] text-white font-medium'
                  : 'text-white/50 hover:bg-white/[0.05] hover:text-white/80'
              }`}
            >
              <link.icon className={`w-[18px] h-[18px] shrink-0 ${active ? 'text-accent-500' : ''}`} />
              <span className={`transition-opacity duration-200 ${expanded ? 'opacity-100' : 'opacity-0'}`}>
                {link.label}
              </span>
              {active && !expanded && (
                <div className="absolute left-0 w-[3px] h-[18px] rounded-r-full bg-accent-500" />
              )}
            </NavLink>
          )
        })}

        {inFlow && (
          <div className={`mt-5 pt-5 border-t border-white/[0.06] transition-all duration-200 overflow-hidden ${expanded ? 'opacity-100 max-h-[460px]' : 'opacity-0 max-h-0'}`}>
            <div className="px-[10px] mb-3">
              <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-white/35">
                <Sparkles className="w-3 h-3 text-accent-500" />
                Asset Flow
              </div>
              <div className="text-[11px] text-white/60 mt-1 truncate">{project?.name || '当前项目'}</div>
            </div>
            <NavLink to={nextFlowStep.path} className="mx-[10px] mb-3 block rounded-2xl border border-accent-500/20 bg-accent-500/10 p-3 text-white/80 hover:bg-accent-500/15 transition-colors">
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="text-[11px] font-medium">闭环进度</span>
                <span className="font-mono text-[12px] text-accent-400">{flowProgress}%</span>
              </div>
              <div className="h-1.5 rounded-full bg-white/10 overflow-hidden mb-2">
                <div className="h-full rounded-full bg-accent-500" style={{ width: `${flowProgress}%` }} />
              </div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] text-white/45 truncate">下一步：{nextFlowStep.label}</span>
                <ArrowRight className="w-3 h-3 text-accent-400 shrink-0" />
              </div>
            </NavLink>
            <div className="space-y-1.5">
              {flowSteps.map((step, index) => {
                const active = step.path === '/archive' ? pathname.startsWith('/archive') : pathname.startsWith(step.match || step.path)
                return (
                  <NavLink
                    key={step.label}
                    to={step.path}
                    className={`group flex items-center gap-2 rounded-xl px-[10px] py-2 transition-colors ${
                      active ? 'bg-accent-500/15 text-white' : 'text-white/45 hover:bg-white/[0.05] hover:text-white/75'
                    }`}
                  >
                    <div className={`relative w-5 h-5 rounded-full border flex items-center justify-center text-[10px] shrink-0 ${
                      step.done ? 'border-accent-500 bg-accent-500 text-sidebar' : active ? 'border-accent-500 text-accent-500' : 'border-white/15 text-white/35'
                    }`}>
                      {index + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-[11px] font-medium truncate">{step.label}</div>
                      <div className="text-[9px] text-white/30 truncate">{step.value}</div>
                    </div>
                  </NavLink>
                )
              })}
            </div>
            <div className="mx-[10px] mt-3 grid grid-cols-2 gap-2">
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-2">
                <ClipboardCheck className="w-3.5 h-3.5 text-accent-500 mb-1.5" />
                <div className="text-[11px] text-white/75 leading-none">{handoffs.length}</div>
                <div className="text-[9px] text-white/30 mt-1">交接记录</div>
              </div>
              <div className="rounded-xl border border-white/[0.06] bg-white/[0.03] p-2">
                <Package className="w-3.5 h-3.5 text-accent-500 mb-1.5" />
                <div className="text-[11px] text-white/75 leading-none">{existingKit ? existingKit.version : '待发布'}</div>
                <div className="text-[9px] text-white/30 mt-1">Work Kit</div>
              </div>
            </div>
          </div>
        )}
      </nav>

      {/* Bottom status */}
      <div className="px-[10px] pb-4">
        <div className={`border-t border-white/[0.06] pt-3 transition-opacity ${expanded ? 'opacity-100' : 'opacity-0'}`}>
          <div className="mb-3 rounded-2xl border border-white/[0.08] bg-white/[0.035] p-3">
            <div className="flex items-center gap-2 mb-2">
              <Package className="w-3.5 h-3.5 text-accent-500" />
              <span className="text-[11px] font-medium text-white/75 whitespace-nowrap">目标：分析资产化</span>
            </div>
            <p className="text-[10px] text-white/35 leading-relaxed">
              把资料、任务、报告和验证结果沉淀成下一次可复用的 Work Kit。
            </p>
            <div className="mt-3 flex items-center justify-between text-[9px] text-white/30">
              <span>Work Kit</span>
              <span>{getWorkKits().length} 个资产</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Bot className="w-3.5 h-3.5 text-accent-500" />
            <span className="text-[11px] text-white/40 whitespace-nowrap">PromoKit AI</span>
          </div>
          <div className="text-[10px] text-white/25 mt-1 whitespace-nowrap">电商大促 AI 工作包系统</div>
        </div>
      </div>
    </aside>
    </>
  )
}
