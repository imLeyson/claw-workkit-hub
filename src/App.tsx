import { Routes, Route, useLocation, Link } from 'react-router-dom'
import { Sparkles } from 'lucide-react'
import { ToastProvider } from './components/Toast'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import CreateProject from './pages/CreateProject'
import MaterialLibrary from './pages/MaterialLibrary'
import TaskCards from './pages/TaskCards'
import Workspace from './pages/Workspace'
import Report from './pages/Report'
import Archive from './pages/Archive'
import Slides from './pages/Slides'

function Breadcrumb() {
  const location = useLocation()
  if (location.pathname === '/') return null

  const segments = location.pathname.split('/').filter(Boolean)
  const labels: Record<string, string> = {
    create: '新建项目',
    materials: '资料库',
    tasks: '任务卡',
    workspace: 'AI 工作台',
    report: '策略报告',
    archive: '资产库',
  }

  return (
    <div className="flex items-center gap-2 text-[11px] text-text-muted">
      <Link to="/" className="hover:text-text-secondary transition-colors">看板</Link>
      {segments.map((seg, i) => (
        <span key={i} className="flex items-center gap-2">
          <span className="text-text-placeholder">/</span>
          <span className={i === segments.length - 1 ? 'text-text-main font-medium' : ''}>
            {labels[seg] || seg}
          </span>
        </span>
      ))}
    </div>
  )
}

export default function App() {
  const location = useLocation()
  if (location.pathname === '/slides') return <Slides />

  return (
    <ToastProvider>
      <div className="flex min-h-screen bg-bg-primary">
        <Sidebar />
        <div className="flex-1 flex flex-col min-h-screen">
          <header className="h-12 shrink-0 bg-bg-primary flex items-center justify-between px-10">
            <Breadcrumb />
            <div className="flex items-center gap-4">
              <Link
                to="/slides"
                className="text-[11px] text-text-muted hover:text-accent-600 transition-colors flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                幻灯片
              </Link>
              <div className="w-[6px] h-[6px] rounded-full bg-accent-500" />
            </div>
          </header>

          <main className="flex-1 overflow-auto">
            <div className="text-center py-1.5 bg-accent-50/60 border-b border-accent-100 text-[11px] text-accent-600 font-medium">
              Demo 模式 · 模拟数据演示 · 非生产环境
            </div>
            <div className="px-10 py-10">
              <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/create" element={<CreateProject />} />
              <Route path="/materials/:projectSlug" element={<MaterialLibrary />} />
              <Route path="/tasks/:projectSlug" element={<TaskCards />} />
              <Route path="/workspace/:projectSlug/:taskId" element={<Workspace />} />
              <Route path="/report/:projectSlug" element={<Report />} />
              <Route path="/archive" element={<Archive />} />
            </Routes>
            </div>
          </main>
        </div>
      </div>
    </ToastProvider>
  )
}
