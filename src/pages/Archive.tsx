import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Repeat, Star, Package, Sparkles } from 'lucide-react'
import { mockWorkKits, roleLabels } from '../data/mock'

export default function Archive() {
  const navigate = useNavigate()
  const [reuseKit, setReuseKit] = useState<string | null>(null)

  return (
    <div className="max-w-5xl">
      <h1 className="text-[32px] font-light tracking-[-0.02em] text-text-main mb-3">AI 工作包资产库</h1>
      <p className="text-[14px] text-text-secondary mb-12 max-w-md leading-relaxed">沉淀可复用的大促分析流程，让下一次活动在几分钟内启动。</p>

      {mockWorkKits.length > 0 ? (
        <div className="grid grid-cols-2 gap-5">
          {mockWorkKits.map((wk) => (
            <div key={wk.id} className="card-surface rounded-[24px] card-hover overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <span className="text-[10px] font-medium uppercase tracking-[0.1em] text-text-muted">{wk.version}</span>
                    <h3 className="text-[17px] font-medium text-text-main mt-1">{wk.name}</h3>
                  </div>
                  <span className="flex items-center gap-1 text-[12px] text-text-muted">
                    <Star className="w-3.5 h-3.5 text-amber-400" />{wk.rating}
                  </span>
                </div>
                <p className="text-[13px] text-text-muted leading-relaxed mb-4">{wk.description}</p>
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  {wk.tags.map((tag) => (
                    <span key={tag} className="text-[10px] px-2 py-1 rounded-md bg-gray-50 text-text-muted">{tag}</span>
                  ))}
                </div>
                <div className="flex items-center gap-3 text-[11px] text-text-muted">
                  <span className="flex items-center gap-1"><Repeat className="w-3 h-3" />复用 {wk.reuseCount} 次</span>
                  <span>适用：{wk.scenario}</span>
                </div>
              </div>
              <div className="px-6 py-3 bg-gray-50/50 border-t border-border-light flex items-center justify-between">
                <div className="flex items-center gap-2 text-[11px] text-text-muted">
                  {wk.includedRoles.map((role) => (
                    <span key={role}>{roleLabels[role]}</span>
                  ))}
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => setReuseKit(wk.id)} className="text-[11px] font-medium text-accent-600 hover:text-accent-700 transition-colors flex items-center gap-1">
                    <Repeat className="w-3 h-3" /> 复用
                  </button>
                  <button onClick={() => navigate(`/create?from=archive&kit=${wk.id}`)} className="text-[11px] text-text-muted hover:text-text-secondary transition-colors">
                    创建项目
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-24">
          <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-4"><Package className="w-7 h-7 text-text-muted" /></div>
          <p className="text-[14px] text-text-muted">暂无 AI 工作包</p>
          <p className="text-[12px] text-text-muted mt-1">完成大促分析项目后，可将策略报告沉淀为可复用工作包。</p>
        </div>
      )}

      {/* Reuse dialog */}
      {reuseKit && (() => {
        const wk = mockWorkKits.find((k) => k.id === reuseKit)
        if (!wk) return null
        return (
          <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
            <div className="bg-white rounded-[24px] p-6 w-[440px] shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-accent-50 flex items-center justify-center"><Package className="w-5 h-5 text-accent-500" /></div>
                <div>
                  <h3 className="font-medium text-text-main">复用工作包：{wk.name}</h3>
                  <p className="text-[12px] text-text-muted">基于此模板创建新的大促分析项目</p>
                </div>
              </div>
              <div className="bg-gray-50 rounded-2xl p-4 mb-4 text-[12px] space-y-1.5">
                <div className="flex justify-between"><span className="text-text-muted">版本</span><span className="font-medium">{wk.version}</span></div>
                <div className="flex justify-between"><span className="text-text-muted">场景</span><span className="font-medium">{wk.scenario}</span></div>
                <div className="flex justify-between"><span className="text-text-muted">岗位</span><span className="font-medium">{wk.includedRoles.map((r) => roleLabels[r]).join('、')}</span></div>
              </div>
              <div className="bg-accent-50/50 rounded-2xl p-3 mb-5 text-center">
                <p className="text-[12px] text-accent-700"><Sparkles className="w-3.5 h-3.5 inline mr-1" />系统将自动预填 {wk.includedRoles.length} 个岗位角色和资料结构</p>
              </div>
              <div className="flex items-center gap-2 justify-end">
                <button onClick={() => setReuseKit(null)} className="btn-ghost">取消</button>
                <button onClick={() => { setReuseKit(null); navigate(`/create?from=archive&kit=${wk.id}`) }} className="btn-primary-filled">确认，开始创建</button>
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}
