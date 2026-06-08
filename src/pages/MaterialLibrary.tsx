import { useRef, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { UploadCloud, ArrowRight, FileSpreadsheet, MessageSquareText, ClipboardList, Paperclip } from 'lucide-react'
import { materialTypeLabels, roleLabels, aiStatusLabels, platformColors } from '../data/mock'
import { getProjectBySlug, getMaterials, getTasks } from '../services/db'
import { useToast } from '../components/Toast'

const aiStatusConfig: Record<string, string> = {
  readable: 'bg-success-soft text-success',
  processing: 'bg-accent-50 text-accent-600',
  need_review: 'bg-warning-soft text-warning',
}

const typeColorMap: Record<string, string> = {
  review: 'bg-accent-50 text-accent-700',
  spec: 'bg-gray-100 text-text-muted',
  faq: 'bg-success-soft text-success',
  copy_asset: 'bg-accent-50/50 text-accent-700',
}

const typeIcons: Record<string, typeof FileSpreadsheet> = {
  review: MessageSquareText,
  spec: ClipboardList,
  faq: MessageSquareText,
  copy_asset: Paperclip,
}

export default function MaterialLibrary() {
  const { projectSlug } = useParams<{ projectSlug: string }>()
  const project = getProjectBySlug(projectSlug!)
  const materials = project ? getMaterials(project.id) : []
  const tasks = project ? getTasks(project.id) : []
  const { showToast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [activeQuickType, setActiveQuickType] = useState<string | null>(null)

  if (!project) return <div className="text-text-muted text-sm p-8">项目不存在</div>

  return (
    <div className="max-w-4xl">
      <div className="flex items-start justify-between mb-14">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <h1 className="text-[32px] font-light tracking-[-0.02em] text-text-main">资料库</h1>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-text-muted font-medium">Demo</span>
          </div>
          <p className="text-[14px] text-text-secondary max-w-sm leading-relaxed">{project.name} — 竞品评论、商品参数、客服记录的统一管理。</p>
        </div>
        <Link to={`/tasks/${projectSlug}`} className="btn-primary">
          下一步：任务卡 <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Upload */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-border-default rounded-[24px] p-12 text-center mb-14 hover:border-accent-300 hover:bg-accent-50/20 transition-all cursor-pointer group"
      >
        <div className="w-16 h-16 rounded-[20px] bg-accent-50 flex items-center justify-center mx-auto mb-5 group-hover:scale-105 transition-transform">
          <UploadCloud className="w-8 h-8 text-accent-500" />
        </div>
        <p className="text-[15px] font-medium text-text-main mb-2">导入电商数据</p>
        <p className="text-[13px] text-text-muted mb-6">支持 Excel · CSV · PDF — 单文件最大 20MB</p>
        <input ref={fileInputRef} type="file" accept=".xlsx,.csv,.pdf,.txt" onChange={() => showToast('Demo 模式：模拟资料已加入列表', 'success')} className="hidden" />
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {['导入评论表', '导入商品信息', '导入客服记录', '导入历史文案'].map((label) => (
            <span
              key={label}
              onClick={(e) => { e.stopPropagation(); setActiveQuickType(activeQuickType === label ? null : label); fileInputRef.current?.click() }}
              className={`text-[11px] px-3 py-1.5 rounded-[10px] cursor-pointer transition-colors ${
                activeQuickType === label ? 'bg-accent-100 text-accent-700' : 'bg-gray-50 text-text-muted hover:bg-accent-50 hover:text-accent-600'
              }`}
            >
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* Competitor overview */}
      <div className="mb-4">
        <span className="section-title">竞品商品</span>
      </div>
      <div className="grid grid-cols-3 gap-4 mb-14">
        {project.competitors.map((comp) => (
          <div key={comp.name} className="card-surface rounded-[20px] p-5 bg-gradient-to-b from-white to-accent-50/20">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[15px] font-medium text-text-main">{comp.brand}</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-md font-medium ${platformColors[comp.platform] || 'bg-gray-100 text-gray-600'}`}>
                {comp.platform}
              </span>
            </div>
            <div className="text-[12px] text-text-muted mb-3">{comp.name}</div>
            <div className="flex items-center gap-4 text-[12px] text-text-secondary mb-3">
              <span>{comp.price}</span>
              <span>{comp.reviewCount} 条评论</span>
              <span className="text-success font-medium">{comp.rating}%</span>
            </div>
            <div className="flex flex-wrap gap-1">
              {comp.topIssues.map((issue) => (
                <span key={issue} className="text-[10px] px-2 py-0.5 rounded-md bg-accent-50 text-accent-700">{issue}</span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Material list */}
      <div className="mb-4">
        <span className="section-title">全部资料</span>
      </div>
      <div className="space-y-3">
        {materials.map((m) => {
          const refTasks = tasks.filter((t) => m.referencedBy.includes(t.id))
          const Icon = typeIcons[m.type] || FileSpreadsheet
          return (
            <div key={m.id} className="card-surface rounded-[20px] p-5 flex items-center gap-6 group cursor-default hover:border-accent-200 transition-colors border-l-[3px] border-l-transparent hover:border-l-accent-400">
              <div className="w-10 h-10 rounded-[14px] bg-gray-50 flex items-center justify-center shrink-0 group-hover:bg-accent-50 transition-colors">
                <Icon className="w-5 h-5 text-text-muted group-hover:text-accent-500 transition-colors" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[14px] font-medium text-text-main mb-0.5">{m.label}</div>
                <div className="text-[11px] text-text-muted">{m.fileName}</div>
              </div>
              <span className={`tag ${typeColorMap[m.type] || 'bg-gray-50 text-text-muted'}`}>{materialTypeLabels[m.type]}</span>
              <span className="text-[12px] text-text-muted">{roleLabels[m.responsibleRole]}</span>
              <span className={`text-[11px] px-2.5 py-1 rounded-full font-medium ${aiStatusConfig[m.aiStatus]}`}>{aiStatusLabels[m.aiStatus]}</span>
              <div className="flex items-center gap-1">
                {refTasks.map((t) => (
                  <span key={t.id} className="text-[10px] px-2 py-0.5 rounded-md bg-accent-50 text-accent-700">{t.title.slice(0, 8)}...</span>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
