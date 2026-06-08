import { Routes, Route, useLocation, Link } from 'react-router-dom'
import { Sparkles, LogOut } from 'lucide-react'
import { ToastProvider } from './components/Toast'
import { AuthProvider, useAuth } from './components/AuthProvider'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import CreateProject from './pages/CreateProject'
import MaterialLibrary from './pages/MaterialLibrary'
import TaskCards from './pages/TaskCards'
import Workspace from './pages/Workspace'
import Report from './pages/Report'
import Archive from './pages/Archive'
import Slides from './pages/Slides'
import Login from './pages/Login'
import NotFound from './pages/NotFound'

function Breadcrumb() {
  const location = useLocation()
  if (location.pathname === '/') return null
  const segments = location.pathname.split('/').filter(Boolean)
  const labels: Record<string, string> = {
    create: '新建项目', materials: '资料库', tasks: '任务卡',
    workspace: 'AI 工作台', report: '策略报告', archive: '资产库',
  }
  return (
    <div className="flex items-center gap-2 text-[11px] text-text-muted">
      <Link to="/" className="hover:text-text-secondary transition-colors">看板</Link>
      {segments.map((seg, i) => (
        <span key={i} className="flex items-center gap-2">
          <span className="text-text-placeholder">/</span>
          <span className={i === segments.length - 1 ? 'text-text-main font-medium' : ''}>{labels[seg] || seg}</span>
        </span>
      ))}
    </div>
  )
}

function AppContent() {
  const location = useLocation()
  const { user, loading, logout } = useAuth()

  if (location.pathname === '/slides') return <Slides />
  if (location.pathname === '/login') return <Login />

  if (loading) return <div className="min-h-screen bg-bg-primary flex items-center justify-center text-text-muted text-sm">加载中...</div>

  return (
    <div className="flex min-h-screen bg-bg-primary">
      <Sidebar />
      <div className="flex-1 flex flex-col min-h-screen">
        <header className="h-12 shrink-0 bg-bg-primary flex items-center justify-between px-10">
          <Breadcrumb />
          <div className="flex items-center gap-4">
            <Link to="/slides" className="text-[11px] text-text-muted hover:text-accent-600 transition-colors flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />幻灯片
            </Link>
            {user ? (
              <button onClick={logout} className="text-[11px] text-text-muted hover:text-error transition-colors flex items-center gap-1.5">
                <LogOut className="w-3 h-3" />退出
              </button>
            ) : (
              <Link to="/login" className="text-[11px] text-accent-600 hover:text-accent-700 transition-colors">登录</Link>
            )}
            <div className="w-[6px] h-[6px] rounded-full bg-accent-500" />
          </div>
        </header>

        <main className="flex-1 overflow-auto">
          <div className="text-center py-1.5 bg-accent-50/60 border-b border-accent-100 text-[11px] text-accent-600 font-medium">
            {user ? `${user.email} · ` : 'Demo 模式 · 游客访问 · '}数据持久化存储
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
              <Route path="*" element={<NotFound />} />
            </Routes>
          </div>
        </main>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </ToastProvider>
  )
}
