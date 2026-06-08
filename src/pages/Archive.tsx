import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Repeat, Star, Package, Sparkles, ChevronDown, ChevronUp, GitBranch, FileText, Database, Users, Lightbulb, ArrowRight, Search } from 'lucide-react'
import { mockWorkKits, roleLabels } from '../data/mock'

export default function Archive() {
  const navigate = useNavigate()
  const [reuseKit, setReuseKit] = useState<string | null>(null)
  const [expandedHistory, setExpandedHistory] = useState<Record<string, boolean>>({})
  const [filterTag, setFilterTag] = useState<string | null>(null)

  const toggleHistory = (id: string) => {
    setExpandedHistory((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const allTags = [...new Set(mockWorkKits.flatMap((k) => k.tags))]
  const filteredKits = filterTag ? mockWorkKits.filter((k) => k.tags.includes(filterTag)) : mockWorkKits
  const successKits = mockWorkKits.filter((k) => k.rating >= 4.8)

  return (
    <div className="max-w-4xl">
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-[6px] h-[6px] rounded-full bg-accent-500" />
          <span className="section-title">KNOWLEDGE BASE · 知识库</span>
        </div>
        <h1 className="text-[32px] font-light tracking-[-0.02em] text-text-main mb-3">PromoKit AI 工作包资产库</h1>
        <p className="text-[14px] text-text-secondary max-w-lg leading-relaxed">
          新项目启动前，可在此浏览成功案例、学习历史经验。系统会根据你的项目自动关联相关知识。
        </p>
      </div>

      {/* Success highlights */}
      {successKits.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span className="text-[11px] font-semibold text-text-muted uppercase tracking-[0.08em]">成功案例 · 已验证</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {successKits.map((k) => (
              <div key={k.id} className="bg-white rounded-2xl p-4 border border-amber-200 flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer" onClick={() => setReuseKit(k.id)}>
                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
                  <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-semibold text-text-main truncate">{k.name}</div>
                  <div className="text-[11px] text-text-muted">评分 {k.rating} · 复用 {k.reuseCount} 次 · {k.version}</div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 font-medium shrink-0">成功案例</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Filter tags */}
      <div className="flex items-center gap-2 mb-8 flex-wrap">
        <span className="text-[11px] text-text-muted mr-1 flex items-center gap-1"><Search className="w-3 h-3" />筛选：</span>
        <button onClick={() => setFilterTag(null)} className={`text-[11px] px-3 py-1.5 rounded-lg transition-colors ${!filterTag ? 'bg-accent-500 text-white' : 'bg-gray-50 text-text-muted hover:bg-gray-100'}`}>全部</button>
        {allTags.map((tag) => (
          <button key={tag} onClick={() => setFilterTag(filterTag === tag ? null : tag)} className={`text-[11px] px-3 py-1.5 rounded-lg transition-colors ${filterTag === tag ? 'bg-accent-500 text-white' : 'bg-gray-50 text-text-muted hover:bg-gray-100'}`}>{tag}</button>
        ))}
      </div>

      {filteredKits.length === 0 ? (
        <div className="text-center py-24">
          <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mx-auto mb-4">
            <Package className="w-7 h-7 text-text-muted" />
          </div>
          <p className="text-[14px] text-text-muted">暂无 AI 工作包</p>
          <p className="text-[12px] text-text-muted mt-1">完成大促分析项目后，可将策略报告沉淀为可复用工作包。</p>
        </div>
      ) : (
        <div className="space-y-6 stagger">
          {filteredKits.map((wk) => {
            const showHistory = expandedHistory[wk.id] ?? false
            return (
              <div key={wk.id} className="card-surface rounded-[24px] overflow-hidden animate-fade-in-up">
                {/* Header */}
                <div className="p-6 pb-0">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-accent-50 text-accent-600">{wk.version}</span>
                      <span className="flex items-center gap-1 text-[12px] text-text-muted">
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />{wk.rating}
                      </span>
                      <span className="flex items-center gap-1 text-[12px] text-text-muted">
                        <Repeat className="w-3.5 h-3.5" />复用 {wk.reuseCount} 次
                      </span>
                    </div>
                    <span className="text-[11px] text-text-muted">创建于 {wk.createdAt}</span>
                  </div>

                  <h2 className="text-[20px] font-medium text-text-main mb-2">{wk.name}</h2>
                  <p className="text-[13px] text-text-secondary leading-relaxed mb-4">{wk.description}</p>

                  <div className="flex flex-wrap items-center gap-2 mb-5">
                    {wk.tags.map((tag) => (
                      <span key={tag} className="text-[10px] px-2 py-1 rounded-md bg-gray-50 text-text-muted">{tag}</span>
                    ))}
                  </div>
                </div>

                {/* Detail sections */}
                <div className="px-6 pb-0 space-y-4">
                  {/* Scenario */}
                  <div className="flex items-start gap-3">
                    <div className="w-5 shrink-0 flex justify-center mt-0.5">
                      <Lightbulb className="w-3.5 h-3.5 text-accent-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-medium uppercase tracking-[0.08em] text-text-muted">适用场景</span>
                      <p className="text-[13px] text-text-secondary mt-0.5">{wk.scenario}</p>
                    </div>
                  </div>

                  {/* Roles */}
                  <div className="flex items-start gap-3">
                    <div className="w-5 shrink-0 flex justify-center mt-0.5">
                      <Users className="w-3.5 h-3.5 text-accent-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-medium uppercase tracking-[0.08em] text-text-muted">包含岗位</span>
                      <p className="text-[13px] text-text-secondary mt-0.5">
                        {wk.includedRoles.map((r) => roleLabels[r]).join(' · ')}
                      </p>
                    </div>
                  </div>

                  {/* Materials */}
                  <div className="flex items-start gap-3">
                    <div className="w-5 shrink-0 flex justify-center mt-0.5">
                      <Database className="w-3.5 h-3.5 text-accent-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-medium uppercase tracking-[0.08em] text-text-muted">资料结构</span>
                      <p className="text-[13px] text-text-secondary mt-0.5">{wk.materialStructure}</p>
                    </div>
                  </div>

                  {/* Task templates */}
                  {wk.sections.length > 0 && (
                    <div className="flex items-start gap-3">
                      <div className="w-5 shrink-0 flex justify-center mt-0.5">
                        <FileText className="w-3.5 h-3.5 text-accent-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <span className="text-[10px] font-medium uppercase tracking-[0.08em] text-text-muted">任务模板</span>
                        <div className="mt-1 space-y-1">
                          {wk.sections.map((s, i) => (
                            <div key={i} className="text-[13px] text-text-secondary flex items-center gap-2">
                              <span className="w-1 h-1 rounded-full bg-accent-300 shrink-0" />
                              {s.title} <span className="text-[11px] text-text-muted">({roleLabels[s.role]})</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Version history (collapsible) */}
                <div className="mx-6 mt-5 border-t border-border-light pt-4">
                  <button
                    onClick={() => toggleHistory(wk.id)}
                    className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.08em] text-text-muted hover:text-text-secondary transition-colors w-full"
                  >
                    <GitBranch className="w-3.5 h-3.5" />
                    版本历史 ({wk.versionHistory.length})
                    {showHistory ? <ChevronUp className="w-3.5 h-3.5 ml-auto" /> : <ChevronDown className="w-3.5 h-3.5 ml-auto" />}
                  </button>

                  {showHistory && (
                    <div className="mt-3 ml-[22px] pl-4 border-l-2 border-accent-200 space-y-3">
                      {wk.versionHistory.map((v) => (
                        <div key={v.version} className="relative">
                          <div className="absolute -left-[25px] top-1.5 w-[10px] h-[10px] rounded-full bg-white border-2 border-accent-400" />
                          <div className="text-[12px] font-medium text-text-main">{v.version}</div>
                          <div className="text-[11px] text-text-muted mt-0.5">{v.date} — {v.changes}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Feedback */}
                <div className="mx-6 mb-0 mt-4 pt-4 border-t border-border-light">
                  <div className="flex items-start gap-3">
                    <div className="w-5 shrink-0 flex justify-center mt-0.5">
                      <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-medium uppercase tracking-[0.08em] text-text-muted">上次反馈</span>
                      <p className="text-[13px] text-text-secondary mt-0.5 leading-relaxed">{wk.feedback}</p>
                    </div>
                  </div>
                </div>

                {/* Footer actions */}
                <div className="px-6 py-4 mt-5 bg-gray-50/50 border-t border-border-light flex items-center justify-between">
                  <div className="text-[11px] text-text-muted">
                    来源项目：<button onClick={() => navigate(`/report/${wk.basedOnProjectId}`)} className="text-accent-600 hover:text-accent-700 transition-colors font-medium">{wk.basedOnProjectName}</button>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => navigate(`/report/${wk.basedOnProjectId}`)}
                      className="btn-ghost text-[12px]"
                    >
                      查看来源报告 <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setReuseKit(wk.id)}
                      className="btn-primary-filled text-[13px]"
                    >
                      <Repeat className="w-4 h-4" /> 复用此模板创建项目
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Reuse confirmation dialog */}
      {reuseKit && (() => {
        const wk = mockWorkKits.find((k) => k.id === reuseKit)
        if (!wk) return null
        return (
          <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
            <div className="bg-white rounded-[24px] p-6 w-[460px] shadow-xl">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-11 h-11 rounded-xl bg-accent-50 flex items-center justify-center shrink-0">
                  <Package className="w-5 h-5 text-accent-500" />
                </div>
                <div>
                  <h3 className="text-[16px] font-medium text-text-main">复用 "{wk.name}"</h3>
                  <p className="text-[12px] text-text-muted">基于此模板创建新的大促分析项目</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded-2xl p-4 mb-4 space-y-2 text-[12px]">
                <div className="flex justify-between">
                  <span className="text-text-muted">模板版本</span>
                  <span className="font-medium text-text-main">{wk.version} · 复用 {wk.reuseCount} 次</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">预填岗位</span>
                  <span className="font-medium text-text-main">{wk.includedRoles.map((r) => roleLabels[r]).join('、')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">任务模板</span>
                  <span className="font-medium text-text-main">{wk.sections.length} 个</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-text-muted">资料结构</span>
                  <span className="font-medium text-text-main text-right max-w-[220px] leading-snug">{wk.materialStructure}</span>
                </div>
              </div>

              <div className="bg-accent-50/50 rounded-2xl p-3.5 mb-5 text-center">
                <p className="text-[12px] text-accent-700 leading-relaxed">
                  <Sparkles className="w-3.5 h-3.5 inline mr-1" />
                  将基于此模板创建新项目，{wk.includedRoles.length} 个岗位角色和资料结构将自动预填。你只需补充活动信息即可开始。
                </p>
              </div>

              <div className="flex items-center gap-2 justify-end">
                <button onClick={() => setReuseKit(null)} className="btn-ghost text-[13px]">取消</button>
                <button
                  onClick={() => { setReuseKit(null); navigate(`/create?from=archive&kit=${wk.id}`) }}
                  className="btn-primary-filled text-[13px]"
                >
                  确认，开始创建
                </button>
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}
