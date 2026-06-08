import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard, PlusCircle, FolderOpen, LayoutGrid, BarChart3,
  Archive, Menu, X,
} from 'lucide-react'
import Logo from './Logo'

function isInFlow(pathname: string) {
  return ['/materials', '/tasks', '/workspace', '/report'].some((p) => pathname.startsWith(p))
}

function extractSlug(pathname: string): string {
  const parts = pathname.split('/').filter(Boolean)
  if (parts.length >= 2 && isInFlow(pathname)) return parts[1]
  return '618-hair-dryer'
}

export default function Sidebar() {
  const location = useLocation()
  const pathname = location.pathname
  const inFlow = isInFlow(pathname)
  const slug = extractSlug(pathname)
  const [expanded, setExpanded] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)

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
      </nav>

      {/* Bottom status */}
      <div className="px-[10px] pb-4">
        <div className={`border-t border-white/[0.06] pt-3 transition-opacity ${expanded ? 'opacity-100' : 'opacity-0'}`}>
          <div className="flex items-center gap-2">
            <div className="w-[6px] h-[6px] rounded-full bg-accent-500" />
            <span className="text-[11px] text-white/40 whitespace-nowrap">PromoKit AI</span>
          </div>
          <div className="text-[10px] text-white/25 mt-1 whitespace-nowrap">电商大促 AI 工作包系统</div>
        </div>
      </div>
    </aside>
    </>
  )
}
