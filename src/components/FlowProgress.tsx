import { useLocation } from 'react-router-dom'
import { FileText, Upload, LayoutGrid, Sparkles, BarChart3, Archive } from 'lucide-react'

const stages = [
  { key: 'create', label: '创建项目', icon: FileText, step: 1 },
  { key: 'materials', label: '导入资料', icon: Upload, step: 2 },
  { key: 'tasks', label: '任务生成', icon: LayoutGrid, step: 3 },
  { key: 'workspace', label: 'AI 分析', icon: Sparkles, step: 4 },
  { key: 'report', label: '策略报告', icon: BarChart3, step: 5 },
  { key: 'archive', label: '沉淀复用', icon: Archive, step: 6 },
]

function detectStage(pathname: string): number {
  if (pathname === '/') return 0
  if (pathname.startsWith('/create')) return 1
  if (pathname.startsWith('/materials')) return 2
  if (pathname.startsWith('/tasks')) return 3
  if (pathname.startsWith('/workspace')) return 4
  if (pathname.startsWith('/report')) return 5
  if (pathname.startsWith('/archive') || pathname.startsWith('/demo')) return 6
  return 0
}

export default function FlowProgress() {
  const location = useLocation()
  const current = detectStage(location.pathname)
  if (current === 0 && location.pathname === '/') return null

  return (
    <div className="card-surface rounded-2xl p-4 mb-8">
      <div className="flex items-center">
        {stages.map((stage, i) => {
          const done = current > stage.step
          const active = current === stage.step
          const Icon = stage.icon
          const isLast = i === stages.length - 1

          return (
            <div key={stage.key} className="flex items-center flex-1 last:flex-none">
              <div className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all duration-300 ${
                    done ? 'bg-ai-500 text-white' : active ? 'bg-white border-2 border-ai-500 text-ai-600 ring-4 ring-ai-50' : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                </div>
                <span className={`text-xs font-medium whitespace-nowrap transition-colors ${active ? 'text-ai-700' : done ? 'text-gray-600' : 'text-gray-400'}`}>
                  {stage.label}
                </span>
              </div>
              {!isLast && (
                <div className="flex-1 mx-2 h-px relative">
                  <div className="absolute inset-0 bg-gray-200 rounded-full" />
                  <div className="absolute inset-0 bg-ai-400 rounded-full transition-all duration-500" style={{ width: done ? '100%' : '0%' }} />
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
