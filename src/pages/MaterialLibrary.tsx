import { useRef, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { UploadCloud, ArrowRight, FileSpreadsheet, MessageSquareText, ClipboardList, Paperclip, Plus, X, Trash2 } from 'lucide-react'
import { materialTypeLabels, aiStatusLabels, platformColors } from '../data/mock'
import { getProjectBySlug, getMaterials, addMaterial, getProjects } from '../services/db'
import { useToast } from '../components/Toast'
import type { Material, Competitor } from '../types'

const aiStatusConfig: Record<string, string> = {
  readable: 'bg-success-soft text-success',
  processing: 'bg-accent-50 text-accent-600',
  need_review: 'bg-warning-soft text-warning',
}
const typeColorMap: Record<string, string> = {
  review: 'bg-accent-50 text-accent-700', spec: 'bg-gray-100 text-text-muted',
  faq: 'bg-success-soft text-success', copy_asset: 'bg-accent-50/50 text-accent-700',
}
const typeIcons: Record<string, typeof FileSpreadsheet> = {
  review: MessageSquareText, spec: ClipboardList, faq: MessageSquareText, copy_asset: Paperclip,
}

const PLATFORMS = ['天猫', '京东', '抖音商城', '拼多多']

export default function MaterialLibrary() {
  const { projectSlug } = useParams<{ projectSlug: string }>()
  const project = getProjectBySlug(projectSlug!)
  const [materials, setMaterials] = useState(project ? getMaterials(project.id) : [])
  const [competitors, setCompetitors] = useState<Competitor[]>(project?.competitors ?? [])
  const { showToast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [activeQuickType, setActiveQuickType] = useState<string | null>(null)

  // Add competitor state
  const [showAddComp, setShowAddComp] = useState(false)
  const [newComp, setNewComp] = useState({ name: '', brand: '', platform: '天猫', price: '', reviewCount: 0, rating: 0 })

  // Save project changes
  const saveProject = (comps: Competitor[]) => {
    if (!project) return
    const projects = getProjects()
    const idx = projects.findIndex((p) => p.id === project.id)
    if (idx >= 0) {
      projects[idx].competitors = comps
      localStorage.setItem('promokit_projects', JSON.stringify(projects))
    }
  }

  const handleAddCompetitor = () => {
    if (!newComp.name.trim()) { showToast('请填写竞品名称', 'error'); return }
    const comp: Competitor = {
      name: newComp.name.trim(), brand: newComp.brand.trim() || newComp.name.trim(),
      platform: newComp.platform as any, price: newComp.price || '¥0',
      reviewCount: newComp.reviewCount || 0, rating: newComp.rating || 0,
      topIssues: [],
    }
    const updated = [...competitors, comp]
    setCompetitors(updated)
    saveProject(updated)
    setNewComp({ name: '', brand: '', platform: '天猫', price: '', reviewCount: 0, rating: 0 })
    setShowAddComp(false)
    showToast('竞品已添加', 'success')
  }

  const handleDeleteCompetitor = (index: number) => {
    const updated = competitors.filter((_, i) => i !== index)
    setCompetitors(updated)
    saveProject(updated)
    showToast('竞品已删除', 'success')
  }

  const handleDeleteMaterial = (matId: string) => {
    const updated = materials.filter((m) => m.id !== matId)
    setMaterials(updated)
    if (project) {
      const all = JSON.parse(localStorage.getItem('promokit_materials') || '{}')
      if (all[project.id]) all[project.id] = updated
      localStorage.setItem('promokit_materials', JSON.stringify(all))
    }
    showToast('资料已删除', 'success')
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !project) return
    let type: Material['type'] = 'review'
    if (file.name.includes('参数') || file.name.includes('spec')) type = 'spec'
    else if (file.name.includes('客服') || file.name.includes('faq') || file.name.includes('问题')) type = 'faq'
    else if (file.name.includes('文案') || file.name.includes('copy') || file.name.includes('素材')) type = 'copy_asset'
    const newMat: Material = {
      id: 'm' + Date.now(), projectId: project.id, type,
      label: file.name.replace(/\.[^.]+$/, ''),
      fileName: file.name,
      content: `用户上传文件：${file.name}（${(file.size / 1024).toFixed(1)} KB）`,
      uploadedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      aiStatus: 'readable', sensitivity: 'normal', responsibleRole: 'merchandise', referencedBy: [],
    }
    addMaterial(project.id, newMat)
    setMaterials(getMaterials(project.id))
    showToast(`已上传：${file.name}`, 'success')
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  if (!project) return <div className="text-text-muted text-sm p-8">项目不存在</div>

  return (
    <div className="max-w-4xl">
      <div className="flex items-start justify-between mb-14">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <h1 className="text-[32px] font-light tracking-[-0.02em] text-text-main">资料库</h1>
          </div>
          <p className="text-[14px] text-text-secondary max-w-sm leading-relaxed">{project.name} — 竞品评论、商品参数、客服记录的统一管理。</p>
        </div>
        <div className="flex items-center gap-3">
          <Link to={`/tasks/${projectSlug}`} className="btn-primary">
            下一步：任务卡 <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Upload */}
      <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-border-default rounded-[24px] p-10 text-center mb-14 hover:border-accent-300 hover:bg-accent-50/20 transition-all cursor-pointer group">
        <div className="w-14 h-14 rounded-[20px] bg-accent-50 flex items-center justify-center mx-auto mb-4 group-hover:scale-105 transition-transform">
          <UploadCloud className="w-7 h-7 text-accent-500" />
        </div>
        <p className="text-[15px] font-medium text-text-main mb-1">导入电商数据</p>
        <p className="text-[13px] text-text-muted mb-5">支持 Excel · CSV · PDF — 单文件最大 20MB</p>
        <input ref={fileInputRef} type="file" accept=".xlsx,.csv,.pdf,.txt" onChange={handleFileUpload} className="hidden" />
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {['导入评论表', '导入商品信息', '导入客服记录', '导入历史文案'].map((label) => (
            <span key={label} onClick={(e) => { e.stopPropagation(); setActiveQuickType(activeQuickType === label ? null : label); fileInputRef.current?.click() }}
              className={`text-[11px] px-3 py-1.5 rounded-[10px] cursor-pointer transition-colors ${activeQuickType === label ? 'bg-accent-100 text-accent-700' : 'bg-gray-50 text-text-muted hover:bg-accent-50 hover:text-accent-600'}`}
            >{label}</span>
          ))}
        </div>
      </div>

      {/* Competitors */}
      <div className="flex items-center justify-between mb-4">
        <span className="section-title">竞品商品 · {competitors.length}</span>
        <button onClick={() => setShowAddComp(!showAddComp)} className="text-[11px] font-medium text-accent-600 hover:text-accent-700 flex items-center gap-1">
          <Plus className="w-3.5 h-3.5" />添加竞品
        </button>
      </div>

      {showAddComp && (
        <div className="card-surface rounded-2xl p-5 mb-4 grid grid-cols-3 gap-3">
          <input type="text" value={newComp.name} onChange={(e) => setNewComp({ ...newComp, name: e.target.value })} placeholder="竞品名称 *" className="text-[13px] px-3 py-2 border border-border-default rounded-xl focus:outline-none focus:border-accent-400" />
          <input type="text" value={newComp.brand} onChange={(e) => setNewComp({ ...newComp, brand: e.target.value })} placeholder="品牌" className="text-[13px] px-3 py-2 border border-border-default rounded-xl focus:outline-none focus:border-accent-400" />
          <select value={newComp.platform} onChange={(e) => setNewComp({ ...newComp, platform: e.target.value })} className="text-[13px] px-3 py-2 border border-border-default rounded-xl focus:outline-none focus:border-accent-400">
            {PLATFORMS.map((p) => <option key={p} value={p}>{p}</option>)}
          </select>
          <div className="flex items-center gap-2 col-span-3">
            <input type="text" value={newComp.price} onChange={(e) => setNewComp({ ...newComp, price: e.target.value })} placeholder="价格" className="text-[13px] px-3 py-2 border border-border-default rounded-xl w-24 focus:outline-none focus:border-accent-400" />
            <input type="number" value={newComp.reviewCount || ''} onChange={(e) => setNewComp({ ...newComp, reviewCount: Number(e.target.value) })} placeholder="评论数" className="text-[13px] px-3 py-2 border border-border-default rounded-xl w-24 focus:outline-none focus:border-accent-400" />
            <button onClick={handleAddCompetitor} className="btn-primary-filled ml-auto">添加</button>
            <button onClick={() => setShowAddComp(false)} className="btn-ghost">取消</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-4 mb-14">
        {competitors.map((comp, i) => (
          <div key={i} className="card-surface rounded-[20px] p-5 bg-gradient-to-b from-white to-accent-50/20 relative group">
            <button onClick={() => handleDeleteCompetitor(i)} className="absolute top-3 right-3 w-6 h-6 rounded-lg bg-white border border-border-light flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 hover:border-red-200">
              <X className="w-3 h-3 text-text-muted hover:text-error" />
            </button>
            <div className="flex items-center justify-between mb-3 pr-6">
              <span className="text-[15px] font-medium text-text-main">{comp.brand}</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-md font-medium ${platformColors[comp.platform] || 'bg-gray-100 text-gray-600'}`}>{comp.platform}</span>
            </div>
            <div className="text-[12px] text-text-muted mb-3">{comp.name}</div>
            <div className="flex items-center gap-4 text-[12px] text-text-secondary">
              <span>{comp.price}</span>
              {comp.reviewCount > 0 && <span>{comp.reviewCount} 条评论</span>}
              {comp.rating > 0 && <span className="text-success font-medium">{comp.rating}%</span>}
            </div>
          </div>
        ))}
      </div>

      {/* Materials */}
      <div className="mb-4"><span className="section-title">全部资料 · {materials.length}</span></div>
      <div className="space-y-3">
        {materials.map((m) => {
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
              <span className={`text-[11px] px-2.5 py-1 rounded-full font-medium ${aiStatusConfig[m.aiStatus]}`}>{aiStatusLabels[m.aiStatus]}</span>
              <button onClick={() => handleDeleteMaterial(m.id)} className="w-6 h-6 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50">
                <Trash2 className="w-3.5 h-3.5 text-text-muted hover:text-error" />
              </button>
            </div>
          )
        })}
        {materials.length === 0 && (
          <div className="text-center py-12 text-[13px] text-text-muted">暂无资料，上传文件或通过快速入口导入</div>
        )}
      </div>
    </div>
  )
}
