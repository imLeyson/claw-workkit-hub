import { useRef, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { UploadCloud, ArrowRight, FileSpreadsheet, MessageSquareText, ClipboardList, Paperclip, Plus, X, Trash2, Pencil, Download } from 'lucide-react'
import { materialTypeLabels, aiStatusLabels, platformColors } from '../data/mock'
import { getProjectBySlug, getMaterials, addMaterial, getProjects, refreshTaskMaterialLinks } from '../services/db'
import { supabase } from '../services/supabase'
import { useToast } from '../components/Toast'
import type { Material, Competitor } from '../types'

type ImportRow = Record<string, string>

const CSV_TEMPLATE_HEADERS = ['类型', '竞品品牌', '商品名称', '平台', '价格', '评论数', '好评率', '高频问题', '评论内容', '客服问题', '风险等级', '文案内容', '来源']
const REQUIRED_STRUCTURED_HEADERS = ['类型']
const RECOMMENDED_STRUCTURED_HEADERS = ['竞品品牌', '商品名称', '平台', '评论内容', '客服问题', '文案内容']

function parseCSVLine(line: string): string[] {
  const cols: string[] = []
  let current = ''
  let inQuotes = false
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i]
    const next = line[i + 1]
    if (char === '"' && next === '"') {
      current += '"'
      i += 1
    } else if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === ',' && !inQuotes) {
      cols.push(current.trim())
      current = ''
    } else {
      current += char
    }
  }
  cols.push(current.trim())
  return cols
}

function parseCSV(text: string): ImportRow[] {
  const lines = text.trim().split('\n')
  if (lines.length < 2) return []
  const headers = parseCSVLine(lines[0]).map((h) => h.trim())
  return lines.slice(1).map((line) => {
    const cols = parseCSVLine(line)
    const row: ImportRow = {}
    headers.forEach((h, i) => { row[h] = (cols[i] || '').trim() })
    return row
  })
}

function getCSVHeaders(text: string): string[] {
  const firstLine = text.trim().split('\n')[0] || ''
  return parseCSVLine(firstLine).map((h) => h.trim()).filter(Boolean)
}

function toCSVValue(value: string): string {
  return `"${value.replace(/"/g, '""')}"`
}

const aiStatusConfig: Record<string, string> = {
  readable: 'bg-success-soft text-success', processing: 'bg-accent-50 text-accent-600', need_review: 'bg-warning-soft text-warning',
}
const typeColorMap: Record<string, string> = {
  review: 'bg-accent-50 text-accent-500', spec: 'bg-white/[0.06] text-text-muted', faq: 'bg-success-soft text-success', copy_asset: 'bg-accent-500/[0.05] text-accent-500',
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
  const [uploading, setUploading] = useState(false)

  const [showCompForm, setShowCompForm] = useState(false)
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [compForm, setCompForm] = useState({ name: '', brand: '', platform: '天猫', price: '', reviewCount: '', rating: '', topIssues: '' })

  const openAddComp = () => {
    setCompForm({ name: '', brand: '', platform: '天猫', price: '', reviewCount: '', rating: '', topIssues: '' })
    setEditingIndex(null); setShowCompForm(true)
  }
  const openEditComp = (index: number) => {
    const c = competitors[index]
    setCompForm({ name: c.name, brand: c.brand, platform: c.platform, price: c.price, reviewCount: String(c.reviewCount || ''), rating: String(c.rating || ''), topIssues: c.topIssues.join(' | ') })
    setEditingIndex(index); setShowCompForm(true)
  }
  const saveCompetitors = (comps: Competitor[]) => {
    if (!project) return
    const projects = getProjects()
    const idx = projects.findIndex((p) => p.id === project.id)
    if (idx >= 0) { projects[idx].competitors = comps; localStorage.setItem('promokit_projects', JSON.stringify(projects)) }
    try { supabase.from('competitors').delete().eq('project_id', project.id).then(() => comps.forEach((c) => supabase.from('competitors').insert({ project_id: project.id, name: c.name, brand: c.brand, platform: c.platform, price: c.price, review_count: c.reviewCount, rating: c.rating, top_issues: c.topIssues }))) } catch {}
  }
  const handleSaveComp = () => {
    if (!compForm.name.trim()) { showToast('请输入商品名称', 'error'); return }
    const comp: Competitor = {
      name: compForm.name.trim(), brand: compForm.brand.trim() || compForm.name.trim(),
      platform: compForm.platform as any, price: compForm.price || '待定价',
      reviewCount: parseInt(compForm.reviewCount) || 0, rating: parseFloat(compForm.rating) || 0,
      topIssues: compForm.topIssues ? compForm.topIssues.split('|').map((s) => s.trim()).filter(Boolean) : [],
    }
    const updated = editingIndex !== null ? competitors.map((c, i) => (i === editingIndex ? comp : c)) : [...competitors, comp]
    setCompetitors(updated); saveCompetitors(updated); setShowCompForm(false)
    showToast(editingIndex !== null ? '竞品已更新' : '竞品已添加', 'success')
  }
  const handleDeleteComp = (index: number) => {
    const updated = competitors.filter((_, i) => i !== index)
    setCompetitors(updated); saveCompetitors(updated); showToast('竞品已删除', 'success')
  }
  const handleDeleteMaterial = (matId: string) => {
    const updated = materials.filter((m) => m.id !== matId)
    setMaterials(updated)
    if (project) { const all = JSON.parse(localStorage.getItem('promokit_materials') || '{}'); if (all[project.id]) all[project.id] = updated; localStorage.setItem('promokit_materials', JSON.stringify(all)) }
    if (project) refreshTaskMaterialLinks(project.id)
    showToast('资料已删除', 'success')
  }

  const downloadTemplate = () => {
    const rows = [
      CSV_TEMPLATE_HEADERS,
      ['竞品评论', '小米米家', '米家高速吹风机 H700', '京东', '¥499', '426', '91.4', '噪音偏大|风嘴松动|发热明显', '风速快，但最大档声音有点尖。', '', '', '', '京东评论'],
      ['商品参数', '飞科', '飞科高速吹风机 F8', '天猫', '¥329', '389', '88.7', '风力不足|塑料感强', '马达转速、功率、重量、温度档位对比。', '', '', '', '商品参数表'],
      ['客服记录', '', '', '', '', '', '', '', '', '噪音多大？会吵到家人吗？', '正常', '', '客服高频问题'],
      ['历史文案', '', '', '', '', '', '', '', '', '', '', '高速数码马达，3 分钟速干长发。', '详情页文案'],
    ]
    const csv = rows.map((row) => row.map(toCSVValue).join(',')).join('\n')
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'promokit-import-template.csv'
    a.click()
    URL.revokeObjectURL(url)
    showToast('CSV 导入模板已下载', 'success')
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !project) return
    setUploading(true)

    const reader = new FileReader()
    reader.onload = (ev) => {
      const text = ev.target?.result as string
      const headers = getCSVHeaders(text)
      const rows = parseCSV(text)
      let compAdded = 0; let matAdded = 0

      if (rows.length > 0 && rows[0]['类型']) {
        const missingRequired = REQUIRED_STRUCTURED_HEADERS.filter((h) => !headers.includes(h))
        if (missingRequired.length > 0) {
          setUploading(false)
          showToast(`CSV 模板字段缺失：${missingRequired.join('、')}`, 'error')
          return
        }
        const missingRecommended = RECOMMENDED_STRUCTURED_HEADERS.filter((h) => !headers.includes(h))
        if (missingRecommended.length > 0) {
          showToast(`已识别标准导入，但缺少建议字段：${missingRecommended.join('、')}`, 'info')
        }
        // Structured CSV with type column
        const compMap = new Map<string, Competitor>()
        const typeGroups: Record<string, string[]> = { review: [], spec: [], faq: [], copy_asset: [] }
        const typeLabels: Record<string, string> = { review: '竞品评论数据', spec: '商品参数对比', faq: '客服高频问题', copy_asset: '历史文案素材' }

        for (const row of rows) {
          const type = row['类型'] || ''
          const brand = row['竞品品牌'] || ''
          const name = row['商品名称'] || ''

          // Build competitor
          if (brand && name && (type === '竞品评论' || type === '商品参数')) {
            const key = brand
            if (!compMap.has(key)) {
              compMap.set(key, {
                name, brand,
                platform: (row['平台'] || '天猫') as any,
                price: row['价格'] || '待定价',
                reviewCount: parseInt(row['评论数']) || 0,
                rating: parseFloat(row['好评率']) || 0,
                topIssues: row['高频问题'] ? row['高频问题'].split('|').map((s) => s.trim()).filter(Boolean) : [],
              })
            }
          }

          // Group by type for materials
          if (type === '竞品评论') typeGroups.review.push(row['评论内容'] || '')
          else if (type === '商品参数') typeGroups.spec.push(`${row['商品名称'] || ''}: ${row['评论内容'] || row['高频问题'] || ''}`)
          else if (type === '客服记录') typeGroups.faq.push(`${row['客服问题'] || ''} [${row['风险等级'] || '正常'}]`)
          else if (type === '历史文案') typeGroups.copy_asset.push(`${row['文案内容'] || ''} — ${row['来源'] || ''}`)
        }

        // Add competitors
        if (compMap.size > 0) {
          const newComps = [...competitors]
          let added = 0
          compMap.forEach((comp) => {
            if (!newComps.find((c) => c.brand === comp.brand)) { newComps.push(comp); added++ }
          })
          if (added > 0) { setCompetitors(newComps); saveCompetitors(newComps); compAdded = added }
        }

        // Add materials by type
        for (const [type, items] of Object.entries(typeGroups)) {
          if (items.length === 0) continue
          const mat: Material = {
            id: 'm' + Date.now() + type,
            projectId: project.id,
            type: type as Material['type'],
            label: `${typeLabels[type]}（${file.name}）`,
            fileName: file.name,
            content: items.slice(0, 20).join('；'),
            uploadedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
            aiStatus: 'readable', sensitivity: 'normal',
            responsibleRole: type === 'review' || type === 'spec' ? 'merchandise' : type === 'faq' ? 'customer_service' : 'copywriting',
            referencedBy: [],
          }
          addMaterial(project.id, mat); matAdded++
        }
      } else {
        // Simple file — fallback
        if (file.name.toLowerCase().endsWith('.csv') && headers.length > 0 && !headers.includes('类型')) {
          showToast('未识别为标准导入模板，将作为普通资料导入；建议先下载 CSV 模板整理字段', 'info')
        }
        let type: Material['type'] = 'review'
        if (file.name.includes('参数') || file.name.includes('spec')) type = 'spec'
        else if (file.name.includes('客服') || file.name.includes('faq')) type = 'faq'
        else if (file.name.includes('文案') || file.name.includes('copy')) type = 'copy_asset'
        const mat: Material = {
          id: 'm' + Date.now(), projectId: project.id, type,
          label: file.name.replace(/\.[^.]+$/, ''), fileName: file.name,
          content: `文件内容：${text.slice(0, 500)}`,
          uploadedAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
          aiStatus: 'readable', sensitivity: 'normal', responsibleRole: 'merchandise', referencedBy: [],
        }
        addMaterial(project.id, mat); matAdded++
      }

      refreshTaskMaterialLinks(project.id)
      setMaterials(getMaterials(project.id))
      setUploading(false)
      const parts: string[] = []
      if (compAdded > 0) parts.push(`${compAdded} 个竞品`)
      if (matAdded > 0) parts.push(`${matAdded} 份资料`)
      showToast(`导入完成：${parts.join('、')}已同步更新`, 'success')
    }

    reader.readAsText(file)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  if (!project) return <div className="text-text-muted text-sm p-8">项目不存在</div>

  return (
    <div className="max-w-4xl">
      <div className="flex items-start justify-between mb-10">
        <div>
          <h1 className="text-[32px] font-light tracking-[-0.02em] text-text-main mb-2">资料库</h1>
          <p className="text-[13px] text-text-secondary max-w-sm leading-relaxed">{project.name} — 竞品评论、商品参数、客服记录。</p>
        </div>
        <Link to={`/tasks/${projectSlug}`} className="btn-primary">下一步：任务卡 <ArrowRight className="w-4 h-4" /></Link>
      </div>

      {/* Upload */}
      <div onClick={() => !uploading && fileInputRef.current?.click()} className={`border-2 border-dashed rounded-[24px] p-8 text-center mb-10 transition-all cursor-pointer group ${uploading ? 'border-accent-300 bg-accent-500/10/20' : 'border-border-default hover:border-accent-300 hover:bg-accent-500/10/20'}`}>
        <div className="w-14 h-14 rounded-[20px] bg-accent-50 flex items-center justify-center mx-auto mb-4 group-hover:scale-105 transition-transform">
          {uploading ? (
            <div className="w-6 h-6 border-2 border-accent-500 border-t-transparent rounded-full animate-spin" />
          ) : (
            <UploadCloud className="w-7 h-7 text-accent-500" />
          )}
        </div>
        <p className="text-[15px] font-medium text-text-main mb-1">{uploading ? '正在解析数据...' : '导入电商数据'}</p>
        <p className="text-[12px] text-text-muted mb-4">支持 CSV 格式 · 自动识别竞品商品和资料分类 · 一键同步更新</p>
        <input ref={fileInputRef} type="file" accept=".csv,.xlsx,.txt" onChange={handleFileUpload} className="hidden" />
        <div className="mb-4 flex items-center justify-center">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); downloadTemplate() }}
            className="inline-flex items-center gap-2 rounded-xl border border-accent-500/20 bg-bg-surface px-4 py-2 text-[12px] font-medium text-accent-500 shadow-sm shadow-accent-100/40 transition-colors hover:border-accent-300 hover:bg-accent-50"
          >
            <Download className="h-3.5 w-3.5" />
            下载 CSV 模板
          </button>
        </div>
        <div className="mx-auto mb-4 max-w-2xl rounded-2xl border border-border-light bg-white/70 px-4 py-3 text-left">
          <div className="mb-2 text-[11px] font-medium text-text-secondary">标准字段</div>
          <div className="flex flex-wrap gap-1.5">
            {['类型', '竞品品牌', '商品名称', '平台', '评论内容', '客服问题', '文案内容'].map((field) => (
              <span key={field} className={`rounded-lg px-2 py-1 text-[10px] ${field === '类型' ? 'bg-accent-50 text-accent-500' : 'bg-gray-50 text-text-muted'}`}>
                {field}
              </span>
            ))}
          </div>
        </div>
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {['导入评论表', '导入商品参数', '导入客服记录', '导入历史文案'].map((label) => (
            <span key={label} onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click() }}
              className="text-[11px] px-3 py-1.5 rounded-[10px] cursor-pointer bg-gray-50 text-text-muted hover:bg-accent-50 hover:text-accent-600 transition-colors"
            >{label}</span>
          ))}
        </div>
      </div>

      {/* Competitors */}
      <div className="flex items-center justify-between mb-4">
        <span className="section-title">竞品商品 · {competitors.length}</span>
        <button onClick={openAddComp} className="text-[11px] font-medium text-accent-600 hover:text-accent-500 flex items-center gap-1">
          <Plus className="w-3.5 h-3.5" />添加竞品
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        {competitors.map((comp, i) => (
          <div key={i} className="card-surface rounded-[20px] p-5 bg-gradient-to-b from-bg-surface to-accent-500/[0.10]/20 relative group">
            <div className="absolute top-3 right-3 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button onClick={() => openEditComp(i)} className="w-7 h-7 rounded-lg bg-bg-surface border border-border-light flex items-center justify-center hover:bg-accent-50 transition-colors">
                <Pencil className="w-3 h-3 text-text-muted" />
              </button>
              <button onClick={() => handleDeleteComp(i)} className="w-7 h-7 rounded-lg bg-bg-surface border border-border-light flex items-center justify-center hover:bg-red-500/10 hover:border-red-200 transition-colors">
                <X className="w-3 h-3 text-text-muted hover:text-error" />
              </button>
            </div>
            <div className="flex items-center justify-between mb-3 pr-16">
              <span className="text-[15px] font-medium text-text-main">{comp.brand}</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-md font-medium ${platformColors[comp.platform] || 'bg-white/[0.06] text-gray-600'}`}>{comp.platform}</span>
            </div>
            <div className="text-[12px] text-text-muted mb-3">{comp.name}</div>
            <div className="flex items-center gap-4 text-[12px] text-text-secondary mb-2">
              <span className="font-medium">{comp.price}</span>
              {comp.reviewCount > 0 && <span>{comp.reviewCount} 条评论</span>}
              {comp.rating > 0 && <span className="text-success font-medium">{comp.rating}% 好评</span>}
            </div>
            {comp.topIssues.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1">
                {comp.topIssues.map((issue) => (
                  <span key={issue} className="text-[10px] px-2 py-0.5 rounded-md bg-accent-50 text-accent-500">{issue}</span>
                ))}
              </div>
            )}
          </div>
        ))}
        {competitors.length === 0 && (
          <div className="col-span-full text-center py-10 border-2 border-dashed border-border-default rounded-2xl">
            <p className="text-[13px] text-text-muted mb-2">暂无竞品商品</p>
            <p className="text-[11px] text-text-muted mb-4">上传竞品评论数据自动识别，或手动添加</p>
            <button onClick={openAddComp} className="text-[12px] font-medium text-accent-600 hover:text-accent-500">+ 手动添加竞品</button>
          </div>
        )}
      </div>

      {/* Comp form modal */}
      {showCompForm && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50" onClick={() => setShowCompForm(false)}>
          <div className="bg-bg-surface rounded-2xl p-6 w-[480px] max-w-[90vw] shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-[16px] font-medium text-text-main">{editingIndex !== null ? '编辑竞品' : '添加竞品商品'}</h3>
              <button onClick={() => setShowCompForm(false)} className="p-1 rounded-lg hover:bg-white/[0.06]"><X className="w-4 h-4 text-text-muted" /></button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-[11px] font-medium text-text-muted mb-1.5">商品名称 *</label><input type="text" value={compForm.name} onChange={(e) => setCompForm({ ...compForm, name: e.target.value })} placeholder="例：米家高速吹风机 H700" className="w-full text-[13px] px-3 py-2.5 border border-border-default rounded-xl focus:outline-none focus:border-accent-400" autoFocus /></div>
                <div><label className="block text-[11px] font-medium text-text-muted mb-1.5">品牌</label><input type="text" value={compForm.brand} onChange={(e) => setCompForm({ ...compForm, brand: e.target.value })} placeholder="例：小米米家" className="w-full text-[13px] px-3 py-2.5 border border-border-default rounded-xl focus:outline-none focus:border-accent-400" /></div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div><label className="block text-[11px] font-medium text-text-muted mb-1.5">平台</label><select value={compForm.platform} onChange={(e) => setCompForm({ ...compForm, platform: e.target.value })} className="w-full text-[13px] px-3 py-2.5 border border-border-default rounded-xl focus:outline-none focus:border-accent-400 bg-white">{PLATFORMS.map((p) => <option key={p} value={p}>{p}</option>)}</select></div>
                <div><label className="block text-[11px] font-medium text-text-muted mb-1.5">价格</label><input type="text" value={compForm.price} onChange={(e) => setCompForm({ ...compForm, price: e.target.value })} placeholder="¥499" className="w-full text-[13px] px-3 py-2.5 border border-border-default rounded-xl focus:outline-none focus:border-accent-400" /></div>
                <div><label className="block text-[11px] font-medium text-text-muted mb-1.5">评论数</label><input type="number" value={compForm.reviewCount} onChange={(e) => setCompForm({ ...compForm, reviewCount: e.target.value })} placeholder="426" className="w-full text-[13px] px-3 py-2.5 border border-border-default rounded-xl focus:outline-none focus:border-accent-400" /></div>
              </div>
              <div><label className="block text-[11px] font-medium text-text-muted mb-1.5">好评率 (%)</label><input type="number" value={compForm.rating} onChange={(e) => setCompForm({ ...compForm, rating: e.target.value })} placeholder="91.4" step="0.1" min="0" max="100" className="w-24 text-[13px] px-3 py-2.5 border border-border-default rounded-xl focus:outline-none focus:border-accent-400" /></div>
              <div><label className="block text-[11px] font-medium text-text-muted mb-1.5">高频差评问题</label><input type="text" value={compForm.topIssues} onChange={(e) => setCompForm({ ...compForm, topIssues: e.target.value })} placeholder="噪音偏大 | 风嘴松动 | 发热明显（用 | 分隔）" className="w-full text-[13px] px-3 py-2.5 border border-border-default rounded-xl focus:outline-none focus:border-accent-400" /><p className="text-[10px] text-text-muted mt-1">多个问题用 "|" 分隔</p></div>
            </div>
            <div className="flex items-center justify-end gap-3 mt-6">
              <button onClick={() => setShowCompForm(false)} className="btn-ghost text-[13px]">取消</button>
              <button onClick={handleSaveComp} className="btn-primary-filled text-[13px]">{editingIndex !== null ? '保存修改' : '添加竞品'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Materials */}
      <div className="mb-4 mt-6"><span className="section-title">全部资料 · {materials.length}</span></div>
      <div className="space-y-2">
        {materials.map((m) => {
          const Icon = typeIcons[m.type] || FileSpreadsheet
          return (
            <div key={m.id} className="card-surface rounded-[16px] p-4 flex items-center gap-4 group cursor-default hover:border-accent-500/20 transition-colors border-l-[3px] border-l-transparent hover:border-l-accent-400">
              <div className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center shrink-0 group-hover:bg-accent-50 transition-colors"><Icon className="w-4.5 h-4.5 text-text-muted group-hover:text-accent-500 transition-colors" /></div>
              <div className="flex-1 min-w-0"><div className="text-[13px] font-medium text-text-main truncate">{m.label}</div><div className="text-[10px] text-text-muted">{m.fileName} · {m.uploadedAt}</div></div>
              <span className={`tag ${typeColorMap[m.type] || 'bg-gray-50 text-text-muted'}`}>{materialTypeLabels[m.type]}</span>
              <span className={`text-[10px] px-2 py-1 rounded-full font-medium ${aiStatusConfig[m.aiStatus]}`}>{aiStatusLabels[m.aiStatus]}</span>
              <button onClick={() => handleDeleteMaterial(m.id)} className="w-6 h-6 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/10"><Trash2 className="w-3.5 h-3.5 text-text-muted hover:text-error" /></button>
            </div>
          )
        })}
        {materials.length === 0 && <div className="text-center py-10 text-[13px] text-text-muted">暂无资料，上传 CSV 数据包自动分类填充</div>}
      </div>
    </div>
  )
}
