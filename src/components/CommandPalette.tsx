import { useState, useEffect, useCallback } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { Search, ArrowRight, Plus, FolderOpen, LayoutGrid, BarChart3, Archive, Sparkles, FileText, Package, ClipboardCheck } from 'lucide-react'
import { getAIResult, getMaterials, getProjectBySlug, getProjects, getTasks, getWorkKits } from '../services/db'

interface Command {
  id: string; label: string; desc: string; icon: any
  action: () => void; category: string
}

export function useCommandPalette() {
  const [open, setOpen] = useState(false)
  const toggle = useCallback(() => setOpen((v) => !v), [])
  const close = useCallback(() => setOpen(false), [])
  return { open, setOpen, toggle, close }
}

export default function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useNavigate()
  const location = useLocation()
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState(0)
  const parts = location.pathname.split('/').filter(Boolean)
  const routeSlug = ['materials', 'tasks', 'workspace', 'report'].includes(parts[0]) ? parts[1] : undefined
  const fallbackProject = getProjects()[0]
  const currentProject = routeSlug ? getProjectBySlug(routeSlug) : fallbackProject
  const slug = currentProject?.slug || '618-hair-dryer'
  const tasks = currentProject ? getTasks(currentProject.id) : []
  const materials = currentProject ? getMaterials(currentProject.id) : []
  const submittedCount = tasks.filter((task) => task.status === 'submitted' || getAIResult(task.id)?.submitted).length
  const existingKit = currentProject ? getWorkKits().find((kit) => kit.basedOnProjectId === currentProject.id) : undefined
  const nextTask = tasks.find((task) => !getAIResult(task.id)?.submitted) || tasks[0]
  const nextWorkspacePath = nextTask ? `/workspace/${slug}/${nextTask.id}` : `/tasks/${slug}`
  const nextAssetCommand = !currentProject
    ? { label: '打开看板', desc: '先选择一个项目继续推进资产化', icon: BarChart3, action: () => navigate('/') }
    : materials.length === 0
      ? { label: '补齐当前项目资料', desc: `为「${currentProject.name}」导入竞品评论、参数和知识素材`, icon: FolderOpen, action: () => navigate(`/materials/${slug}`) }
      : submittedCount === 0
        ? { label: '进入当前项目工作台', desc: `生成并提交「${currentProject.name}」的岗位分析结果`, icon: Sparkles, action: () => navigate(nextWorkspacePath) }
        : !existingKit
          ? { label: '发布当前项目 Work Kit', desc: `完成「${currentProject.name}」发布前资产化检查`, icon: Package, action: () => navigate(`/report/${slug}`) }
          : { label: '查看当前项目资产', desc: `${existingKit.name} 已沉淀为 ${existingKit.version}`, icon: Archive, action: () => navigate('/archive') }

  const commands: Command[] = [
    { id: 'dashboard', label: '看板', desc: '项目总览与数据统计', icon: BarChart3, action: () => navigate('/'), category: '导航' },
    { id: 'create', label: '新建项目', desc: '创建大促分析项目', icon: Plus, action: () => navigate('/create'), category: '导航' },
    { id: 'materials', label: '当前资料库', desc: '管理当前项目的竞品评论与资料输入', icon: FolderOpen, action: () => navigate(`/materials/${slug}`), category: '导航' },
    { id: 'tasks', label: '当前任务卡', desc: '查看当前项目的岗位分析任务', icon: LayoutGrid, action: () => navigate(`/tasks/${slug}`), category: '导航' },
    { id: 'workspace', label: '当前 AI 工作台', desc: '继续生成或提交当前项目分析结果', icon: Sparkles, action: () => navigate(nextWorkspacePath), category: '导航' },
    { id: 'report', label: '当前策略报告', desc: '查看当前项目报告与发布检查', icon: FileText, action: () => navigate(`/report/${slug}`), category: '导航' },
    { id: 'archive', label: '资产库', desc: '浏览 Work Kit 知识库', icon: Archive, action: () => navigate('/archive'), category: '导航' },
    { id: 'slides', label: '幻灯片', desc: '打开演示模式', icon: Sparkles, action: () => navigate('/slides'), category: '导航' },
    { id: 'new-project', label: '创建新项目', desc: '从模板或空白开始', icon: Plus, action: () => navigate('/create'), category: '操作' },
    { id: 'new-kit', label: '浏览 Work Kit', desc: '复用已有的分析模板', icon: Package, action: () => navigate('/archive'), category: '操作' },
    { id: 'asset-next', label: nextAssetCommand.label, desc: nextAssetCommand.desc, icon: nextAssetCommand.icon, action: nextAssetCommand.action, category: '资产化' },
    { id: 'asset-flow', label: '资产化闭环总览', desc: '查看分析如何沉淀为 Work Kit', icon: Sparkles, action: () => navigate('/'), category: '资产化' },
    { id: 'asset-materials', label: '资料资产化入口', desc: '把当前项目原始资料整理成任务输入', icon: FolderOpen, action: () => navigate(`/materials/${slug}`), category: '资产化' },
    { id: 'asset-handoff', label: '查看资产交接', desc: '进入报告查看工作台交接证据', icon: ClipboardCheck, action: () => navigate(`/report/${slug}`), category: '资产化' },
    { id: 'asset-publish', label: '发布 Work Kit', desc: '进入当前报告完成资产发布检查', icon: Package, action: () => navigate(`/report/${slug}`), category: '资产化' },
  ]

  const filtered = query
    ? commands.filter((c) => c.label.includes(query) || c.desc.includes(query) || c.category.includes(query))
    : commands

  useEffect(() => { setSelected(0); setQuery('') }, [open])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { onClose(); return }
      if (!open) return
      if (e.key === 'ArrowDown') { e.preventDefault(); setSelected((s) => Math.min(s + 1, filtered.length - 1)) }
      if (e.key === 'ArrowUp') { e.preventDefault(); setSelected((s) => Math.max(s - 1, 0)) }
      if (e.key === 'Enter') { filtered[selected]?.action(); onClose() }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [open, selected, filtered, onClose])

  if (!open) return null

  const categories = [...new Set(filtered.map((c) => c.category))]

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative w-full max-w-[520px] bg-bg-surface border border-border-default rounded-2xl shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border-default">
          <Search className="w-4 h-4 text-text-muted" />
          <input
            type="text" value={query} onChange={(e) => setQuery(e.target.value)}
            placeholder="搜索页面、操作..." autoFocus
            className="flex-1 bg-transparent text-sm text-text-main placeholder:text-text-placeholder outline-none"
          />
          <kbd className="text-[10px] px-1.5 py-0.5 rounded-md bg-white/5 text-text-muted font-mono border border-border-default">esc</kbd>
        </div>
        <div className="max-h-[320px] overflow-auto p-2">
          {categories.map((cat) => (
            <div key={cat} className="mb-1">
              <div className="text-[10px] font-semibold text-text-muted uppercase tracking-wider px-3 py-1.5">{cat}</div>
              {filtered.filter((c) => c.category === cat).map((cmd) => {
                const idx = filtered.indexOf(cmd)
                return (
                  <button
                    key={cmd.id}
                    onClick={() => { cmd.action(); onClose() }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors ${
                      idx === selected ? 'bg-white/5 text-text-main' : 'text-text-secondary hover:bg-white/[0.03]'
                    }`}
                  >
                    <cmd.icon className="w-4 h-4 text-accent-500 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-[13px] font-medium">{cmd.label}</div>
                      <div className="text-[11px] text-text-muted truncate">{cmd.desc}</div>
                    </div>
                    {idx === selected && <ArrowRight className="w-3.5 h-3.5 text-accent-500" />}
                  </button>
                )
              })}
            </div>
          ))}
        </div>
        <div className="px-4 py-2 border-t border-border-default flex items-center gap-4 text-[10px] text-text-muted">
          <span><kbd className="px-1 py-0.5 rounded bg-white/5 font-mono">↑↓</kbd> 导航</span>
          <span><kbd className="px-1 py-0.5 rounded bg-white/5 font-mono">↵</kbd> 选择</span>
          <span><kbd className="px-1 py-0.5 rounded bg-white/5 font-mono">esc</kbd> 关闭</span>
        </div>
      </div>
    </div>
  )
}
