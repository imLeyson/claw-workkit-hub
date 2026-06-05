import { useRef, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import {
  UploadCloud, FileSpreadsheet, MessageSquareText, ClipboardList, Paperclip,
  ArrowRight, CheckCircle2,
} from 'lucide-react'
import {
  mockProjects, mockMaterials, mockTaskCards, materialTypeLabels,
  roleLabels, aiStatusLabels, platformColors,
} from '../data/mock'
import PageHeader from '../components/PageHeader'
import SectionCard from '../components/SectionCard'
import { useToast } from '../components/Toast'

const typeIcons: Record<string, typeof FileSpreadsheet> = {
  review: MessageSquareText,
  spec: ClipboardList,
  faq: MessageSquareText,
  copy_asset: Paperclip,
}

const aiStatusConfig: Record<string, string> = {
  readable: 'bg-success-soft text-success',
  processing: 'bg-ai-50 text-ai-600',
  need_review: 'bg-warning-soft text-warning',
}

export default function MaterialLibrary() {
  const { projectId } = useParams<{ projectId: string }>()
  const project = mockProjects.find((p) => p.id === projectId)
  const materials = mockMaterials[projectId ?? ''] ?? []
  const tasks = mockTaskCards[projectId ?? ''] ?? []
  const { showToast } = useToast()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [activeQuickType, setActiveQuickType] = useState<string | null>(null)

  if (!project) return <div className="text-text-muted text-sm p-8">项目不存在</div>

  return (
    <div className="max-w-4xl">
      <PageHeader
        title="电商资料库"
        description={`${project.name} — 竞品评论、商品参数、客服记录和历史内容资产的统一管理中心。`}
        actions={
          <Link to={`/tasks/${projectId}`} className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-ai-500 to-ai-700 text-white text-sm font-medium rounded-xl hover:from-ai-600 hover:to-ai-800 transition-all shadow-sm btn-primary-glow">
            下一步：岗位分析任务 <ArrowRight className="w-4 h-4" />
          </Link>
        }
      />

      {/* 上传区域 */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className="border-2 border-dashed border-border-default rounded-2xl p-8 text-center mb-6 hover:border-ai-300 hover:bg-ai-50/20 transition-all cursor-pointer group"
      >
        <div className="w-14 h-14 rounded-2xl bg-ai-50 flex items-center justify-center mx-auto mb-4 group-hover:scale-105 transition-transform">
          <UploadCloud className="w-7 h-7 text-ai-500" />
        </div>
        <p className="text-sm font-medium text-text-main mb-1.5">导入电商数据</p>
        <p className="text-xs text-text-muted mb-4">支持 Excel · CSV · PDF · TXT — 单文件最大 20MB</p>
        <input
          ref={fileInputRef}
          type="file"
          accept=".xlsx,.csv,.pdf,.txt"
          onChange={() => showToast('资料导入功能将在正式版上线', 'info')}
          className="hidden"
        />
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {['导入评论表', '导入商品信息', '导入客服记录', '导入历史文案'].map((label) => (
            <span
              key={label}
              onClick={(e) => { e.stopPropagation(); setActiveQuickType(activeQuickType === label ? null : label); fileInputRef.current?.click() }}
              className={`text-[11px] px-2.5 py-1 rounded-lg cursor-pointer transition-colors ${
                activeQuickType === label
                  ? 'bg-ai-100 text-ai-700 border border-ai-300'
                  : 'bg-gray-100 text-text-muted hover:bg-ai-50 hover:text-ai-600'
              }`}
            >
              {activeQuickType === label && <CheckCircle2 className="w-3 h-3 inline mr-1" />}
              {label}
            </span>
          ))}
        </div>
      </div>

      {/* 竞品资料卡片 */}
      <SectionCard title={`竞品商品（${project.competitors.length}）`} className="mb-6">
        <div className="grid grid-cols-3 gap-4">
          {project.competitors.map((comp) => {
            const mat = materials.find((m) => m.label.includes(comp.brand))
            return (
              <div key={comp.name} className="border border-border-light rounded-xl p-4 hover:shadow-sm transition-shadow">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-text-main">{comp.brand}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${platformColors[comp.platform] || 'bg-gray-100 text-gray-600'}`}>
                    {comp.platform}
                  </span>
                </div>
                <div className="text-sm font-medium text-text-main mb-2">{comp.name}</div>
                <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                  <div><span className="text-text-muted">价格：</span><span className="font-medium text-text-main">{comp.price}</span></div>
                  <div><span className="text-text-muted">评论数：</span><span className="font-medium text-text-main">{comp.reviewCount}</span></div>
                  <div><span className="text-text-muted">好评率：</span><span className="font-medium text-success">{comp.rating}%</span></div>
                  <div><span className="text-text-muted">差评率：</span><span className="font-medium text-error">{(100 - comp.rating).toFixed(1)}%</span></div>
                </div>
                <div className="text-[10px] text-text-muted mb-1">高频问题：</div>
                <div className="flex flex-wrap gap-1 mb-2">
                  {comp.topIssues.map((issue) => (
                    <span key={issue} className="text-[10px] px-1.5 py-0.5 rounded bg-orange-50 text-orange-700">{issue}</span>
                  ))}
                </div>
                {mat && (
                  <div className="flex flex-wrap gap-1 text-[10px]">
                    {mat.referencedBy.map((tid) => {
                      const t = tasks.find((x) => x.id === tid)
                      return t ? <span key={tid} className="px-1.5 py-0.5 rounded bg-ai-50 text-ai-700">{t.title.slice(0, 6)}...</span> : null
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </SectionCard>

      {/* 资料表格 */}
      <SectionCard title={`全部资料（${materials.length}）`} className="mb-6">
        <div className="overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border-light">
                <th className="text-left py-2.5 px-3 text-[11px] font-semibold text-text-muted uppercase tracking-wider">资料名称</th>
                <th className="text-left py-2.5 px-3 text-[11px] font-semibold text-text-muted uppercase tracking-wider">类型</th>
                <th className="text-left py-2.5 px-3 text-[11px] font-semibold text-text-muted uppercase tracking-wider">负责岗位</th>
                <th className="text-left py-2.5 px-3 text-[11px] font-semibold text-text-muted uppercase tracking-wider">AI 状态</th>
                <th className="text-left py-2.5 px-3 text-[11px] font-semibold text-text-muted uppercase tracking-wider">引用任务</th>
              </tr>
            </thead>
            <tbody>
              {materials.map((m) => {
                const Icon = typeIcons[m.type] || FileSpreadsheet
                const refTasks = tasks.filter((t) => m.referencedBy.includes(t.id))
                return (
                  <tr key={m.id} className="border-b border-border-light last:border-0 hover:bg-gray-50/50 transition-colors">
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-gray-50 flex items-center justify-center shrink-0">
                          <Icon className="w-4 h-4 text-gray-400" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-text-main truncate max-w-[220px]">{m.label}</div>
                          {m.fileName && <div className="text-[11px] text-text-muted">{m.fileName}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="text-[10px] px-2 py-1 rounded-lg bg-gray-50 text-text-muted border border-gray-100">{materialTypeLabels[m.type]}</span>
                    </td>
                    <td className="py-3 px-3"><span className="text-xs text-text-secondary">{roleLabels[m.responsibleRole]}</span></td>
                    <td className="py-3 px-3">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${aiStatusConfig[m.aiStatus]}`}>{aiStatusLabels[m.aiStatus]}</span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1 flex-wrap">
                        {refTasks.map((t) => (
                          <span key={t.id} className="text-[10px] px-1.5 py-0.5 rounded bg-ai-50 text-ai-700 font-medium">{t.title.slice(0, 8)}...</span>
                        ))}
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </SectionCard>

      {/* 因果提示 */}
      <div className="bg-ai-50/50 border border-ai-100 rounded-xl p-3.5 text-center">
        <p className="text-xs text-ai-700">
          📐 这些资料将作为输入源，用于生成各岗位的 AI 分析任务卡。
        </p>
      </div>
    </div>
  )
}
