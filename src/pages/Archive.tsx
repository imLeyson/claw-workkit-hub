import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Repeat, Star, Package, Sparkles, ChevronDown, ChevronUp, GitBranch, FileText, Database, Users, Lightbulb, ArrowRight, Search, BookOpen, TrendingUp } from 'lucide-react'
import { roleLabels } from '../data/mock'
import { getProjects, getWorkKits } from '../services/db'

export default function Archive() {
  const navigate = useNavigate()
  const [reuseKit, setReuseKit] = useState<string | null>(null)
  const [expandedHistory, setExpandedHistory] = useState<Record<string, boolean>>({})
  const [filterTag, setFilterTag] = useState<string | null>(null)
  const [searchText, setSearchText] = useState('')
  const [kits] = useState(getWorkKits())

  const toggleHistory = (id: string) => {
    setExpandedHistory((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const allTags = [...new Set(kits.flatMap((k) => k.tags))]
  const totalReuse = kits.reduce((s, k) => s + k.reuseCount, 0)

  // Filter by tag + text search
  const filteredKits = useMemo(() => {
    let result = filterTag ? kits.filter((k) => k.tags.includes(filterTag)) : kits
    if (searchText.trim()) {
      const q = searchText.trim().toLowerCase()
      result = result.filter((k) =>
        k.name.toLowerCase().includes(q) ||
        k.description.toLowerCase().includes(q) ||
        k.tags.some((t) => t.includes(q)) ||
        k.scenario.includes(q)
      )
    }
    return result
  }, [kits, filterTag, searchText])

  const successKits = kits.filter((k) => k.rating >= 4.8)

  return (
    <div className="max-w-4xl">
      {/* Knowledge Base Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-[6px] h-[6px] rounded-full bg-accent-500" />
          <span className="section-title">KNOWLEDGE BASE · 团队知识库</span>
        </div>
        <h1 className="text-[32px] font-light tracking-[-0.02em] text-text-main mb-2">AI 工作包资产库</h1>
        <p className="text-[14px] text-text-secondary max-w-lg leading-relaxed">
          沉淀可复用的分析流程与团队经验。新项目启动前，在此浏览成功案例、学习历史经验。
        </p>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { icon: Package, value: String(kits.length), label: 'Work Kit 模板', sub: '可复用分析流程' },
          { icon: TrendingUp, value: String(totalReuse), label: '累计复用次数', sub: '跨项目经验传承' },
          { icon: Star, value: String(successKits.length), label: '已验证成功案例', sub: `评分 ≥ 4.8` },
        ].map((s) => (
          <div key={s.label} className="card-surface rounded-2xl p-5 flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-accent-50 flex items-center justify-center shrink-0">
              <s.icon className="w-5 h-5 text-accent-500" />
            </div>
            <div>
              <div className="text-[22px] font-light tracking-[-0.02em] text-text-main leading-none mb-0.5">{s.value}</div>
              <div className="text-[11px] font-medium text-text-main">{s.label}</div>
              <div className="text-[10px] text-text-muted">{s.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Learning CTA — 纪要建议：启动新项目前先学习 */}
      <div className="bg-accent-500/[0.04] rounded-2xl p-5 border border-accent-500/15 mb-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-accent-500/15 flex items-center justify-center">
            <BookOpen className="w-4.5 h-4.5 text-accent-600" />
          </div>
          <div>
            <div className="text-[13px] font-medium text-text-main">准备启动新项目？</div>
            <div className="text-[11px] text-text-muted">先浏览知识库中的成功案例，了解相似品类的大促分析经验</div>
          </div>
        </div>
        <button onClick={() => navigate('/create')} className="btn-primary-filled text-[12px]">
          创建新项目 <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Search + Filter bar */}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-[320px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-text-muted" />
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="搜索 Work Kit 名称、描述、标签..."
            className="w-full pl-9 pr-3 py-2 border border-border-default rounded-xl text-[12px] focus:outline-none focus:border-accent-400 bg-transparent"
          />
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          <button onClick={() => setFilterTag(null)} className={`text-[11px] px-3 py-1.5 rounded-lg transition-colors ${!filterTag ? 'bg-accent-500 text-white' : 'bg-gray-50 text-text-muted hover:bg-white/[0.06]'}`}>全部</button>
          {allTags.map((tag) => (
            <button key={tag} onClick={() => setFilterTag(filterTag === tag ? null : tag)} className={`text-[11px] px-3 py-1.5 rounded-lg transition-colors ${filterTag === tag ? 'bg-accent-500 text-white' : 'bg-gray-50 text-text-muted hover:bg-white/[0.06]'}`}>{tag}</button>
          ))}
        </div>
      </div>

      {/* Success Cases — 纪要建议：成功项目自动标星 */}
      {successKits.length > 0 && (
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span className="text-[11px] font-semibold text-text-muted uppercase tracking-[0.08em]">已验证成功案例 · 优先学习</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {successKits.map((k) => (
              <div key={k.id} className="bg-bg-surface rounded-2xl p-4 border border-amber-500/20 flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer" onClick={() => setReuseKit(k.id)}>
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center shrink-0">
                  <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-semibold text-text-main truncate">{k.name}</div>
                  <div className="text-[11px] text-text-muted">{k.version} · 复用 {k.reuseCount} 次 · 评分 {k.rating}</div>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 font-medium shrink-0">成功案例</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Work Kit List */}
      {filteredKits.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center mx-auto mb-4">
            <Package className="w-7 h-7 text-text-muted" />
          </div>
          <p className="text-[14px] text-text-muted">{searchText ? '没有匹配的 Work Kit' : '暂无 AI 工作包'}</p>
          <p className="text-[12px] text-text-muted mt-1">
            {searchText ? '尝试其他关键词' : '完成大促分析项目后，可将策略报告沉淀为可复用工作包。'}
          </p>
        </div>
      ) : (
        <div className="space-y-5 stagger">
          {filteredKits.map((wk) => {
            const showHistory = expandedHistory[wk.id] ?? false
            const sourceProject = getProjects().find((p) => p.id === wk.basedOnProjectId)
            return (
              <div key={wk.id} className="card-surface rounded-[24px] overflow-hidden animate-fade-in-up">
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
                      <span key={tag} className="text-[10px] px-2 py-1 rounded-md bg-white/5 text-text-muted">{tag}</span>
                    ))}
                  </div>
                </div>

                <div className="px-6 pb-0 space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="w-5 shrink-0 flex justify-center mt-0.5"><Lightbulb className="w-3.5 h-3.5 text-accent-400" /></div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-medium uppercase tracking-[0.08em] text-text-muted">适用场景</span>
                      <p className="text-[13px] text-text-secondary mt-0.5">{wk.scenario}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-5 shrink-0 flex justify-center mt-0.5"><Users className="w-3.5 h-3.5 text-accent-400" /></div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-medium uppercase tracking-[0.08em] text-text-muted">包含岗位</span>
                      <p className="text-[13px] text-text-secondary mt-0.5">{wk.includedRoles.map((r) => roleLabels[r]).join(' · ')}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="w-5 shrink-0 flex justify-center mt-0.5"><Database className="w-3.5 h-3.5 text-accent-400" /></div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-medium uppercase tracking-[0.08em] text-text-muted">资料结构</span>
                      <p className="text-[13px] text-text-secondary mt-0.5">{wk.materialStructure}</p>
                    </div>
                  </div>
                  {wk.sections.length > 0 && (
                    <div className="flex items-start gap-3">
                      <div className="w-5 shrink-0 flex justify-center mt-0.5"><FileText className="w-3.5 h-3.5 text-accent-400" /></div>
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

                {/* Version history */}
                <div className="mx-6 mt-5 border-t border-border-light pt-4">
                  <button onClick={() => toggleHistory(wk.id)} className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.08em] text-text-muted hover:text-text-secondary transition-colors w-full">
                    <GitBranch className="w-3.5 h-3.5" />
                    版本历史 ({wk.versionHistory.length})
                    {showHistory ? <ChevronUp className="w-3.5 h-3.5 ml-auto" /> : <ChevronDown className="w-3.5 h-3.5 ml-auto" />}
                  </button>
                  {showHistory && (
                    <div className="mt-3 ml-[22px] pl-4 border-l-2 border-accent-500/20 space-y-3">
                      {wk.versionHistory.map((v) => (
                        <div key={v.version} className="relative">
                          <div className="absolute -left-[25px] top-1.5 w-[10px] h-[10px] rounded-full bg-bg-surface border-2 border-accent-400" />
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
                    <div className="w-5 shrink-0 flex justify-center mt-0.5"><Lightbulb className="w-3.5 h-3.5 text-amber-400" /></div>
                    <div className="flex-1 min-w-0">
                      <span className="text-[10px] font-medium uppercase tracking-[0.08em] text-text-muted">上次反馈</span>
                      <p className="text-[13px] text-text-secondary mt-0.5 leading-relaxed">{wk.feedback}</p>
                    </div>
                  </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 mt-5 bg-white/[0.03] border-t border-border-light flex items-center justify-between">
                  <div className="text-[11px] text-text-muted">
                    来源项目：
                    {sourceProject ? (
                      <button onClick={() => navigate(`/report/${sourceProject.slug}`)} className="text-accent-600 hover:text-accent-500 transition-colors font-medium">
                        {sourceProject.name}
                      </button>
                    ) : (
                      <span>{wk.basedOnProjectName}</span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    {sourceProject && (
                      <button onClick={() => navigate(`/report/${sourceProject.slug}`)} className="btn-ghost text-[12px]">
                        查看来源报告 <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button onClick={() => setReuseKit(wk.id)} className="btn-primary-filled text-[13px]">
                      <Repeat className="w-4 h-4" /> 复用此模板创建项目
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Reuse dialog */}
      {reuseKit && (() => {
        const wk = kits.find((k) => k.id === reuseKit)
        if (!wk) return null
        return (
          <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
            <div className="bg-bg-surface rounded-[24px] p-6 w-[460px] shadow-xl">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-11 h-11 rounded-xl bg-accent-50 flex items-center justify-center shrink-0"><Package className="w-5 h-5 text-accent-500" /></div>
                <div>
                  <h3 className="text-[16px] font-medium text-text-main">复用 "{wk.name}"</h3>
                  <p className="text-[12px] text-text-muted">基于此模板创建新的大促分析项目</p>
                </div>
              </div>
              <div className="bg-bg-primary rounded-2xl p-4 mb-4 space-y-2 text-[12px]">
                <div className="flex justify-between"><span className="text-text-muted">模板版本</span><span className="font-medium text-text-main">{wk.version} · 复用 {wk.reuseCount} 次</span></div>
                <div className="flex justify-between"><span className="text-text-muted">预填岗位</span><span className="font-medium text-text-main">{wk.includedRoles.map((r) => roleLabels[r]).join('、')}</span></div>
                <div className="flex justify-between"><span className="text-text-muted">任务模板</span><span className="font-medium text-text-main">{wk.sections.length} 个</span></div>
                <div className="flex justify-between"><span className="text-text-muted">资料结构</span><span className="font-medium text-text-main text-right max-w-[220px] leading-snug">{wk.materialStructure}</span></div>
              </div>
              <div className="bg-accent-500/[0.05] rounded-2xl p-3.5 mb-5 text-center">
                <p className="text-[12px] text-accent-500 leading-relaxed">
                  <Sparkles className="w-3.5 h-3.5 inline mr-1" />
                  基于此模板创建新项目，{wk.includedRoles.length} 个岗位角色和资料结构将自动预填。你只需补充活动信息即可开始。
                </p>
              </div>
              <div className="flex items-center gap-2 justify-end">
                <button onClick={() => setReuseKit(null)} className="btn-ghost text-[13px]">取消</button>
                <button onClick={() => { setReuseKit(null); navigate(`/create?from=archive&kit=${wk.id}`) }} className="btn-primary-filled text-[13px]">确认，开始创建</button>
              </div>
            </div>
          </div>
        )
      })()}
    </div>
  )
}
