import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  PlusCircle,
  FolderOpen,
  LayoutGrid,
  BarChart3,
  Archive,
  Play,
} from 'lucide-react'

const links = [
  { to: '/', label: '看板', icon: LayoutDashboard, end: true },
  { to: '/create', label: '新建项目', icon: PlusCircle },
  { to: '/materials/p1', label: '资料库', icon: FolderOpen, flow: true },
  { to: '/tasks/p1', label: '任务卡', icon: LayoutGrid, flow: true },
  { to: '/report/p1', label: '报告', icon: BarChart3, flow: true },
  { to: '/archive', label: '资产库', icon: Archive },
  { to: '/demo', label: '演示', icon: Play },
]

function isInFlow(pathname: string) {
  return ['/materials', '/tasks', '/workspace', '/report'].some((p) => pathname.startsWith(p))
}

export default function Sidebar() {
  const location = useLocation()
  const pathname = location.pathname
  const inFlow = isInFlow(pathname)
  const [expanded, setExpanded] = useState(false)

  const visibleLinks = links.filter((l) => {
    if (l.flow) return inFlow
    return true
  })

  return (
    <aside
      className={`shrink-0 bg-sidebar min-h-screen flex flex-col transition-all duration-300 ease-out overflow-hidden ${
        expanded ? 'w-[220px]' : 'w-[56px]'
      }`}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
    >
      {/* Logo */}
      <div className="h-12 flex items-center px-[14px] border-b border-white/[0.06] shrink-0">
        <span className="text-[15px] font-medium tracking-tight text-white/90 whitespace-nowrap">
          <img src="/logo.svg" alt="CK" className="w-[20px] h-[20px] shrink-0" />
          <span className={`transition-opacity duration-200 whitespace-nowrap text-white/90 font-medium tracking-tight ${expanded ? 'opacity-100 ml-2.5' : 'opacity-0 w-0'}`}>
            CampaignKit
          </span>
        </span>
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

      {/* Bottom */}
      <div className="px-[10px] pb-4">
        <div className={`border-t border-white/[0.06] pt-3 transition-opacity ${expanded ? 'opacity-100' : 'opacity-0'}`}>
          <div className="flex items-center gap-2">
            <div className="w-[6px] h-[6px] rounded-full bg-accent-500" />
            <span className="text-[11px] text-white/40 whitespace-nowrap">618 大促 · 进行中</span>
          </div>
        </div>
      </div>
    </aside>
  )
}
