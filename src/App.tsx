import { Suspense, lazy } from 'react'
import { Routes, Route, useLocation, Link } from 'react-router-dom'
import { Sparkles, LogOut } from 'lucide-react'
import { ToastProvider } from './components/Toast'
import { AuthProvider, useAuth } from './components/AuthProvider'
import { ErrorBoundary } from './components/ErrorBoundary'
import Sidebar from './components/Sidebar'
import { isSupabaseConfigured } from './services/supabase'

const Dashboard = lazy(() => import('./pages/Dashboard'))
const CreateProject = lazy(() => import('./pages/CreateProject'))
const MaterialLibrary = lazy(() => import('./pages/MaterialLibrary'))
const TaskCards = lazy(() => import('./pages/TaskCards'))
const Workspace = lazy(() => import('./pages/Workspace'))
const Report = lazy(() => import('./pages/Report'))
const Archive = lazy(() => import('./pages/Archive'))
const Slides = lazy(() => import('./pages/Slides'))
const Login = lazy(() => import('./pages/Login'))
const NotFound = lazy(() => import('./pages/NotFound'))

function Loading() {
  return <div className="min-h-[60vh] flex items-center justify-center text-[13px] text-text-muted">加载中...</div>
}

function Breadcrumb() {
  const location = useLocation()
  if (location.pathname === '/') return null
  const segments = location.pathname.split('/').filter(Boolean)
  const labels: Record<string, string> = {
    create: '新建项目', materials: '资料库', tasks: '任务卡',
    workspace: 'AI 工作台', report: '策略报告', archive: '资产库',
    login: '登录', slides: '幻灯片',
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
        <header className="h-12 shrink-0 bg-bg-primary flex items-center justify-between px-4 lg:px-10">
          <div className="max-lg:hidden"><Breadcrumb /></div>
          <div className="flex items-center gap-4">
            <Link to="/slides" className="text-[11px] text-text-muted hover:text-accent-600 transition-colors flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />幻灯片
            </Link>
            {isSupabaseConfigured && user ? (
              <button onClick={logout} className="text-[11px] text-text-muted hover:text-error transition-colors flex items-center gap-1.5">
                <LogOut className="w-3 h-3" />退出
              </button>
            ) : isSupabaseConfigured ? (
              <Link to="/login" className="text-[11px] text-accent-600 hover:text-accent-700 transition-colors">登录</Link>
            ) : (
              <span className="text-[11px] text-text-muted">本地 Demo</span>
            )}
            <div className="w-[6px] h-[6px] rounded-full bg-accent-500" />
          </div>
        </header>

        <main className="flex-1 overflow-auto">
          {!isSupabaseConfigured && (
            <div className="text-center py-1 bg-accent-50/30 border-b border-accent-500/10 text-[10px] text-accent-400 font-medium">
              本地 Demo · 数据保存在浏览器
            </div>
          )}
          {isSupabaseConfigured && !user && (
            <div className="text-center py-1 bg-accent-50/30 border-b border-accent-500/10 text-[10px] text-accent-400 font-medium">
              Demo 模式 · <Link to="/login" className="underline hover:text-accent-300">登录开启云端同步</Link>
            </div>
          )}
          {isSupabaseConfigured && user && (
            <div className="text-center py-1 bg-ai-400/5 border-b border-ai-400/10 text-[10px] text-ai-400 font-medium">
              {user.email} · 已连接
            </div>
          )}
          <div className="px-4 lg:px-10 py-6 lg:py-10">
            <Suspense fallback={<Loading />}>
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
            </Suspense>
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
        <ErrorBoundary>
          <AppContent />
        </ErrorBoundary>
      </AuthProvider>
    </ToastProvider>
  )
}
