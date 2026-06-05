import { Routes, Route, useLocation, Link } from 'react-router-dom'
import { Monitor } from 'lucide-react'
import { ToastProvider } from './components/Toast'
import Sidebar from './components/Sidebar'
import FlowProgress from './components/FlowProgress'
import Dashboard from './pages/Dashboard'
import CreateProject from './pages/CreateProject'
import MaterialLibrary from './pages/MaterialLibrary'
import TaskCards from './pages/TaskCards'
import Workspace from './pages/Workspace'
import Report from './pages/Report'
import Archive from './pages/Archive'
import Demo from './pages/Demo'

function Breadcrumb() {
  const location = useLocation()
  if (location.pathname === '/') return null

  const segments = location.pathname.split('/').filter(Boolean)
  const labels: Record<string, string> = {
    create: '新建分析项目',
    materials: '电商资料库',
    tasks: '岗位分析任务',
    workspace: 'AI 分析工作台',
    report: '大促策略报告',
    archive: 'AI 工作包资产库',
    demo: '演示模式',
  }

  return (
    <div className="flex items-center gap-2 text-xs text-text-muted mb-1">
      <Link to="/" className="hover:text-text-secondary transition-colors">大促分析看板</Link>
      {segments.map((seg, i) => (
        <span key={i} className="flex items-center gap-2">
          <span>/</span>
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
  const isDemo = location.pathname === '/demo'

  if (isDemo) return <Demo />

  return (
    <ToastProvider>
      <div className="flex min-h-screen">
        <Sidebar />
        <div className="flex-1 flex flex-col min-h-screen">
          <header className="h-16 shrink-0 glass-surface flex items-center justify-between px-8 relative">
            <Breadcrumb />
            <div className="flex items-center gap-3">
              <Link
                to="/demo"
                className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-text-secondary bg-gray-50 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <Monitor className="w-3.5 h-3.5" />
                演示模式
              </Link>
              <div className="flex items-center gap-2 text-xs text-text-muted">
                <span className="w-2 h-2 rounded-full bg-biz-500 animate-pulse shadow-[0_0_6px_rgba(249,115,22,0.4)]" />
                <span>618 大促 · 进行中</span>
              </div>
            </div>
            <div className="gradient-divider absolute bottom-0 left-0 right-0" />
          </header>

          <main className="flex-1 bg-bg-primary py-6 px-8 overflow-auto">
            <FlowProgress />
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/create" element={<CreateProject />} />
              <Route path="/materials/:projectId" element={<MaterialLibrary />} />
              <Route path="/tasks/:projectId" element={<TaskCards />} />
              <Route path="/workspace/:projectId/:taskId" element={<Workspace />} />
              <Route path="/report/:projectId" element={<Report />} />
              <Route path="/archive" element={<Archive />} />
            </Routes>
          </main>
        </div>
      </div>
    </ToastProvider>
  )
}
