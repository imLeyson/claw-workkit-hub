import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  PlusCircle,
  FolderOpen,
  LayoutGrid,
  BarChart3,
  Archive,
  Play,
  ChevronRight,
} from 'lucide-react'

const overviewLinks = [
  { to: '/', label: '大促分析看板', icon: LayoutDashboard, end: true },
  { to: '/create', label: '新建分析项目', icon: PlusCircle },
]

function extractProjectId(pathname: string): string {
  const flowRoutes = ['/materials', '/tasks', '/workspace', '/report']
  for (const route of flowRoutes) {
    if (pathname.startsWith(route)) {
      const parts = pathname.split('/').filter(Boolean)
      return parts[1] || 'p1'
    }
  }
  return 'p1'
}

const outputLinks = [
  { to: '/archive', label: 'AI 工作包资产库', icon: Archive },
  { to: '/demo', label: '演示模式', icon: Play },
]

function NavGroup({ title, links, pathname }: { title: string; links: typeof overviewLinks; pathname: string }) {
  return (
    <div>
      <div className="px-3 mb-1 text-[10px] font-semibold text-text-muted uppercase tracking-widest">
        {title}
      </div>
      <nav className="space-y-0.5">
        {links.map((link) => {
          const active = pathname === link.to || (!link.end && pathname.startsWith(link.to.split('/').slice(0, 3).join('/')))
          return (
            <NavLink
              key={link.to}
              to={link.to}
              end={link.end}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150 group ${
                active ? 'bg-ai-50 text-ai-700 font-medium' : 'text-text-secondary hover:bg-gray-50 hover:text-text-main'
              }`}
            >
              <link.icon className={`w-4 h-4 transition-colors ${active ? 'text-ai-600' : 'text-gray-400 group-hover:text-gray-500'}`} />
              <span className="flex-1">{link.label}</span>
              {active && <ChevronRight className="w-3.5 h-3.5 text-ai-400" />}
            </NavLink>
          )
        })}
      </nav>
    </div>
  )
}

function isInFlow(pathname: string) {
  return ['/materials', '/tasks', '/workspace', '/report'].some((p) => pathname.startsWith(p))
}

export default function Sidebar() {
  const location = useLocation()
  const pathname = location.pathname
  const inFlow = isInFlow(pathname)
  const pid = extractProjectId(pathname)

  const flowLinks = [
    { to: `/materials/${pid}`, label: '电商资料库', icon: FolderOpen },
    { to: `/tasks/${pid}`, label: '岗位分析任务', icon: LayoutGrid },
    { to: `/report/${pid}`, label: '大促策略报告', icon: BarChart3 },
  ]

  return (
    <aside className="w-[260px] shrink-0 bg-white/85 backdrop-blur-md border-r border-border-default min-h-screen flex flex-col">
      <div className="h-16 flex items-center px-5 border-b border-border-light">
        <div>
          <div className="text-sm font-semibold tracking-tight text-text-main">Claw Work Kit Hub</div>
          <div className="text-[11px] text-text-muted tracking-wide">电商 AI 工作流系统</div>
        </div>
      </div>

      <div className="flex-1 px-3 py-5 space-y-6 overflow-auto">
        <NavGroup title="概览" links={overviewLinks} pathname={pathname} />
        {inFlow && <NavGroup title="618 分析流程" links={flowLinks} pathname={pathname} />}
        <NavGroup title="沉淀与输出" links={outputLinks} pathname={pathname} />
      </div>

      <div className="mx-3 mb-4 card-surface rounded-xl p-3.5">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 rounded-full bg-biz-500 animate-pulse" />
          <span className="text-[11px] font-medium text-text-main">618 年中大促</span>
        </div>
        <div className="text-[10px] text-text-muted leading-relaxed">
          高速吹风机竞品分析 · 进行中
        </div>
      </div>
    </aside>
  )
}
