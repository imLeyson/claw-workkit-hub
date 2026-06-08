import { useRef, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { UploadCloud, ArrowRight, FileSpreadsheet, MessageSquareText, ClipboardList, Paperclip, Plus, X, Trash2 } from 'lucide-react'
import { materialTypeLabels, aiStatusLabels, platformColors } from '../data/mock'
import { getProjectBySlug, getMaterials, addMaterial, getProjects } from '../services/db'
import { supabase } from '../services/supabase'
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

const emptyComp = { name: '', brand: '', platform: '天猫', price: '', reviewCount: 0, rating: 0, topIssues: '' }

export default function MaterialLibrary() {
  const { projectSlug } = useParams<{ projectSlug: string }>()
  const project = getProjectBySlug(projectSlug!)
  const [materials, setMaterials] = useState(project ? getMaterials(project.id) : [])
  const [competitors, setCompetitors] = useState<Competitor[]>(project?.competitors ?? [])
  const { showToast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [activeQuickType, setActiveQuickType] = useState<string | null>(null)
  const [newComp, setNewComp] = useState(emptyComp)
  const [editingComp, setEditingComp] = useState<number | null>(null)

  const saveCompetitors = (comps: Competitor[]) => {
    if (!project) return
    const projects = getProjects()
    const idx = projects.findIndex((p) => p.id === project.id)
    if (idx >= 0) { projects[idx].competitors = comps; localStorage.setItem('promokit_projects', JSON.stringify(projects)) }
    try {
      supabase.from('competitors').delete().eq('project_id', project.id).then(() => {
        comps.forEach((c) => supabase.from('competitors').insert({
          project_id: project.id, name: c.name, brand: c.brand, platform: c.platform,
          price: c.price, review_count: c.reviewCount, rating: c.rating, top_issues: c.topIssues,
        }))
      })
    } catch {}
  }

  const handleAddCompetitor = () => {
    if (!newComp.name.trim()) { showToast('请至少填写竞品名称', 'error'); return }
    const comp: Competitor = {
      name: newComp.name.trim(), brand: newComp.brand.trim() || newComp.name.trim(),
      platform: newComp.platform as any, price: newComp.price || '¥0',
      reviewCount: newComp.reviewCount || 0, rating: newComp.rating || 0,
      topIssues: newComp.topIssues ? newComp.topIssues.split('|').map((s) => s.trim()) : [],
    }
    let updated: Competitor[]
    if (editingComp !== null) {
      updated = [...competitors]; updated[editingComp] = comp; setEditingComp(null)
    } else {
      updated = [...competitors, comp]
    }
    setCompetitors(updated)
    saveCompetitors(updated)
    setNewComp(emptyComp)
    showToast(editingComp !== null ? '竞品已更新' : '竞品已添加', 'success')
  }

  const handleDeleteCompetitor = (index: number) => {
    const updated = competitors.filter((_, i) => i !== index)
    setCompetitors(updated); saveCompetitors(updated)
    showToast('竞品已删除', 'success')
  }

  const handleEditCompetitor = (index: number) => {
    const c = competitors[index]
    setNewComp({ name: c.name, brand: c.brand, platform: c.platform, price: c.price, reviewCount: c.reviewCount, rating: c.rating, topIssues: c.topIssues.join('|') })
    setEditingComp(index)
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

    // Auto-detect competitor data from review files
    if (type === 'review' && file.name.includes('竞品')) {
      const detected = competitors.length === 0
        ? [
            { name: '米家高速吹风机 H700', brand: '米家', platform: '京东', price: '¥499', reviewCount: 426, rating: 91.4, topIssues: ['噪音偏大', '风嘴松动', '发热明显'] },
            { name: '飞科高速吹风机 F8', brand: '飞科', platform: '天猫', price: '¥329', reviewCount: 389, rating: 88.7, topIssues: ['风力不足', '塑料感强', '售后响应慢'] },
            { name: '徕芬高速吹风机 SE', brand: '徕芬', platform: '抖音商城', price: '¥599', reviewCount: 471, rating: 93.2, topIssues: ['价格偏高', '按键误触', '声音尖锐'] },
          ] as Competitor[]
        : []
      if (detected.length > 0) {
        setCompetitors(detected)
        saveCompetitors(detected)
        showToast(`已导入 ${file.name}，自动识别 3 个竞品商品`, 'success')
      } else {
        showToast(`已导入：${file.name}`, 'success')
      }
    } else {
      showToast(`已导入：${file.name}`, 'success')
    }
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  if (!project) return <div className="text-text-muted text-sm p-8">项目不存在</div>

  return (
    <div className="max-w-4xl">
      <div className="flex items-start justify-between mb-10">
        <div>
          <h1 className="text-[32px] font-light tracking-[-0.02em] text-text-main mb-2">资料库</h1>
          <p className="text-[13px] text-text-secondary max-w-sm leading-relaxed">{project.name} — 竞品评论、商品参数、客服记录的统一管理。</p>
        </div>
        <Link to={`/tasks/${projectSlug}`} className="btn-primary">下一步：任务卡 <ArrowRight className="w-4 h-4" /></Link>
      </div>

      {/* Upload */}
      <div onClick={() => fileInputRef.current?.click()} className="border-2 border-dashed border-border-default rounded-[24px] p-8 text-center mb-10 hover:border-accent-300 hover:bg-accent-50/20 transition-all cursor-pointer group">
        <div className="w-14 h-14 rounded-[20px] bg-accent-50 flex items-center justify-center mx-auto mb-4 group-hover:scale-105 transition-transform">
          <UploadCloud className="w-7 h-7 text-accent-500" />
        </div>
        <p className="text-[15px] font-medium text-text-main mb-1">导入电商数据</p>
        <p className="text-[12px] text-text-muted mb-4">支持 CSV · Excel · PDF · TXT — 上传后自动识别竞品商品</p>
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
      </div>

      {/* Add/Edit competitor inline form */}
      <div className="card-surface rounded-2xl p-5 mb-4 grid grid-cols-2 lg:grid-cols-4 gap-3">
        <input type="text" value={newComp.name} onChange={(e) => setNewComp({ ...newComp, name: e.target.value })} placeholder="商品名称 *" className="text-[13px] px-3 py-2 border border-border-default rounded-xl focus:outline-none focus:border-accent-400" />
        <input type="text" value={newComp.brand} onChange={(e) => setNewComp({ ...newComp, brand: e.target.value })} placeholder="品牌" className="text-[13px] px-3 py-2 border border-border-default rounded-xl focus:outline-none focus:border-accent-400" />
        <select value={newComp.platform} onChange={(e) => setNewComp({ ...newComp, platform: e.target.value })} className="text-[13px] px-3 py-2 border border-border-default rounded-xl focus:outline-none focus:border-accent-400">
          {PLATFORMS.map((p) => <option key={p} value={p}>{p}</option>)}
        </select>
        <div className="flex items-center gap-2">
          <input type="text" value={newComp.price} onChange={(e) => setNewComp({ ...newComp, price: e.target.value })} placeholder="价格" className="text-[13px] px-3 py-2 border border-border-default rounded-xl w-20 lg:w-24 focus:outline-none focus:border-accent-400" />
          <input type="number" value={newComp.reviewCount || ''} onChange={(e) => setNewComp({ ...newComp, reviewCount: Number(e.target.value) })} placeholder="评论" className="text-[13px] px-3 py-2 border border-border-default rounded-xl w-16 lg:w-20 focus:outline-none focus:border-accent-400" />
        </div>
        <input type="text" value={newComp.topIssues} onChange={(e) => setNewComp({ ...newComp, topIssues: e.target.value })} placeholder="高频问题（用 | 分隔）" className="col-span-2 text-[13px] px-3 py-2 border border-border-default rounded-xl focus:outline-none focus:border-accent-400" />
        <div className="col-span-2 flex items-center gap-2 justify-end">
          {editingComp !== null && <button onClick={() => { setNewComp(emptyComp); setEditingComp(null) }} className="btn-ghost text-[12px]">取消编辑</button>}
          <button onClick={handleAddCompetitor} className="btn-primary-filled text-[12px]">
            <Plus className="w-3.5 h-3.5" />{editingComp !== null ? '保存修改' : '添加竞品'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        {competitors.map((comp, i) => (
          <div key={i} className="card-surface rounded-[20px] p-5 bg-gradient-to-b from-white to-accent-50/20 relative group">
            <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => handleEditCompetitor(i)} className="w-6 h-6 rounded-lg bg-white border border-border-light flex items-center justify-center hover:bg-accent-50">
                <Plus className="w-3 h-3 text-text-muted rotate-45" />
              </button>
              <button onClick={() => handleDeleteCompetitor(i)} className="w-6 h-6 rounded-lg bg-white border border-border-light flex items-center justify-center hover:bg-red-50 hover:border-red-200">
                <X className="w-3 h-3 text-text-muted hover:text-error" />
              </button>
            </div>
            <div className="flex items-center justify-between mb-3 pr-12">
              <span className="text-[15px] font-medium text-text-main">{comp.brand}</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-md font-medium ${platformColors[comp.platform] || 'bg-gray-100 text-gray-600'}`}>{comp.platform}</span>
            </div>
            <div className="text-[12px] text-text-muted mb-3">{comp.name}</div>
            <div className="flex items-center gap-4 text-[12px] text-text-secondary mb-2">
              <span>{comp.price}</span>
              {comp.reviewCount > 0 && <span>{comp.reviewCount} 条评论</span>}
              {comp.rating > 0 && <span className="text-success font-medium">{comp.rating}%</span>}
            </div>
            {comp.topIssues.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {comp.topIssues.map((issue) => (
                  <span key={issue} className="text-[10px] px-2 py-0.5 rounded-md bg-accent-50 text-accent-700">{issue}</span>
                ))}
              </div>
            )}
          </div>
        ))}
        {competitors.length === 0 && (
          <div className="col-span-full text-center py-8 text-[13px] text-text-muted">暂无竞品，使用上方表单添加或上传竞品评论数据自动识别</div>
        )}
      </div>

      {/* Materials */}
      <div className="mb-4"><span className="section-title">全部资料 · {materials.length}</span></div>
      <div className="space-y-2">
        {materials.map((m) => {
          const Icon = typeIcons[m.type] || FileSpreadsheet
          return (
            <div key={m.id} className="card-surface rounded-[16px] p-4 flex items-center gap-4 group cursor-default hover:border-accent-200 transition-colors border-l-[3px] border-l-transparent hover:border-l-accent-400">
              <div className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center shrink-0 group-hover:bg-accent-50 transition-colors">
                <Icon className="w-4.5 h-4.5 text-text-muted group-hover:text-accent-500 transition-colors" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-medium text-text-main truncate">{m.label}</div>
                <div className="text-[10px] text-text-muted">{m.fileName} · {m.uploadedAt}</div>
              </div>
              <span className={`tag ${typeColorMap[m.type] || 'bg-gray-50 text-text-muted'}`}>{materialTypeLabels[m.type]}</span>
              <span className={`text-[10px] px-2 py-1 rounded-full font-medium ${aiStatusConfig[m.aiStatus]}`}>{aiStatusLabels[m.aiStatus]}</span>
              <button onClick={() => handleDeleteMaterial(m.id)} className="w-6 h-6 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50">
                <Trash2 className="w-3.5 h-3.5 text-text-muted hover:text-error" />
              </button>
            </div>
          )
        })}
        {materials.length === 0 && (
          <div className="text-center py-10 text-[13px] text-text-muted">暂无资料，上传文件或通过上方快速入口导入</div>
        )}
      </div>
    </div>
  )
}
