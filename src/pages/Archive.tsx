import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Repeat, Star, Package, Sparkles, ChevronDown, ChevronUp, GitBranch, FileText, Database, Users, Lightbulb, ArrowRight, Search, BookOpen, TrendingUp, ShieldCheck, Bot, AlertTriangle, CheckCircle2, Pencil, SlidersHorizontal } from 'lucide-react'
import { roleLabels } from '../data/mock'
import { getProjects, getWorkKits } from '../services/db'
import { useToast } from '../components/Toast'
import type { WorkKit } from '../types'

type ValidationDecision = 'keep' | 'revise'

function readValidationState(): Record<string, Record<string, ValidationDecision>> {
  try {
    const raw = localStorage.getItem('promokit_validation_runs')
    return raw ? JSON.parse(raw) : {}
  } catch {
    return {}
  }
}

function readLearningRecords(): any[] {
  try {
    return JSON.parse(localStorage.getItem('promokit_prelearning_records') || '[]')
  } catch {
    return []
  }
}

function buildValidationRows(kit: WorkKit) {
  const hasCopy = kit.includedRoles.includes('copywriting')
  const hasService = kit.includedRoles.includes('customer_service')
  const hasDesign = kit.includedRoles.includes('design')
  return [
    {
      id: 'agent-copy',
      agent: hasCopy ? '话术对比智能体' : '流程完整性智能体',
      target: hasCopy ? '公司文案框架 vs 市场竞品话术' : '公司流程结构 vs 外部通用流程',
      score: hasCopy ? 88 : 82,
      finding: hasCopy ? '公司知识库结构完整，但竞品近期更强调场景化开场和数字钩子。' : '流程覆盖主要环节，但缺少每日运行后的异常回写口径。',
      action: hasCopy ? '保留五段式结构，修订开场钩子与互动问答模板。' : '增加“验证角色结论”和“下一次修订点”字段。',
      suggested: 'revise' as ValidationDecision,
    },
    {
      id: 'agent-market',
      agent: '市场竞品验证角色',
      target: `${kit.scenario} · 竞品策略横向对比`,
      score: kit.rating >= 4.8 ? 93 : 79,
      finding: kit.rating >= 4.8 ? '历史验证表现稳定，可作为新项目启动前优先学习样本。' : '当前评分未达到优先标星标准，需要补充更多复用反馈。',
      action: kit.rating >= 4.8 ? '保持成功案例标星，并在新项目中默认推荐。' : '标记为观察模板，待下一次项目复用后更新评分。',
      suggested: kit.rating >= 4.8 ? 'keep' as ValidationDecision : 'revise' as ValidationDecision,
    },
    {
      id: 'agent-knowledge',
      agent: hasService || hasDesign ? '知识库修订审核人' : '知识库保留审核人',
      target: '公司知识库沉淀项',
      score: kit.versionHistory.length >= 2 ? 86 : 74,
      finding: kit.versionHistory.length >= 2 ? '已有版本迭代记录，可追溯团队反馈和修改依据。' : '版本历史较少，暂时无法证明经验持续复用有效。',
      action: kit.versionHistory.length >= 2 ? '保留版本历史，并把本次验证结论写入下一版变更说明。' : '补充项目反馈来源和复用后的效果指标。',
      suggested: kit.versionHistory.length >= 2 ? 'keep' as ValidationDecision : 'revise' as ValidationDecision,
    },
  ]
}

export default function Archive() {
  const navigate = useNavigate()
  const [reuseKit, setReuseKit] = useState<string | null>(null)
  const [validationKit, setValidationKit] = useState<string | null>(null)
  const [expandedHistory, setExpandedHistory] = useState<Record<string, boolean>>({})
  const [filterTag, setFilterTag] = useState<string | null>(null)
  const [searchText, setSearchText] = useState('')
  const [kits] = useState(getWorkKits())
  const [validationRuns, setValidationRuns] = useState<Record<string, Record<string, ValidationDecision>>>(readValidationState)
  const [learningRecords] = useState(readLearningRecords)
  const [draftValidation, setDraftValidation] = useState<Record<string, ValidationDecision>>({})
  const { showToast } = useToast()
  const [editKit, setEditKit] = useState<WorkKit | null>(null)

  const toggleHistory = (id: string) => {
    setExpandedHistory((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const allTags = [...new Set(kits.flatMap((k) => k.tags))]
  const totalReuse = kits.reduce((s, k) => s + k.reuseCount, 0)
  const validatedCount = Object.keys(validationRuns).length
  const learningCount = learningRecords.length
  const avgRating = kits.length > 0 ? (kits.reduce((s, k) => s + k.rating, 0) / kits.length).toFixed(1) : '0.0'
  const avgLearningPercent = learningCount > 0
    ? Math.round(learningRecords.reduce((sum, record) => sum + (record.learningPercent ?? 0), 0) / learningCount)
    : 0
  const avgSaving = learningCount > 0
    ? Math.round(learningRecords.reduce((sum, record) => sum + (record.estimatedSaving ?? 0), 0) / learningCount)
    : 0

  const openValidation = (id: string) => {
    const kit = kits.find((k) => k.id === id)
    if (!kit) return
    const existing = validationRuns[id]
    const initial = existing || Object.fromEntries(buildValidationRows(kit).map((row) => [row.id, row.suggested]))
    setDraftValidation(initial)
    setValidationKit(id)
  }

  const saveValidation = () => {
    if (!validationKit) return
    const next = { ...validationRuns, [validationKit]: draftValidation }
    setValidationRuns(next)
    localStorage.setItem('promokit_validation_runs', JSON.stringify(next))
    setValidationKit(null)
  }

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
    <div className="max-w-5xl">
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
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {[
          { icon: Package, value: String(kits.length), label: 'Work Kit 模板', sub: '可复用分析流程' },
          { icon: TrendingUp, value: String(totalReuse), label: '累计复用次数', sub: '跨项目经验传承' },
          { icon: Star, value: String(successKits.length), label: '已验证成功案例', sub: `评分 ≥ 4.8` },
          { icon: ShieldCheck, value: String(validatedCount), label: '对比验证记录', sub: '保留/修订决策' },
          { icon: BookOpen, value: String(learningCount), label: '启动前学习', sub: `平均评分 ${avgRating}` },
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

      <div className="card-surface rounded-[28px] p-6 mb-8 overflow-hidden relative">
        <div className="absolute -right-16 -top-20 w-56 h-56 rounded-full bg-ai-400/6" />
        <div className="relative grid lg:grid-cols-[0.9fr_1.1fr] gap-6">
          <div>
            <div className="text-[11px] font-semibold text-ai-400 uppercase tracking-[0.08em] mb-2">Experience Loop · 经验传承轨迹</div>
            <h2 className="text-[22px] font-medium text-text-main mb-2">从一次分析到下一次启动</h2>
            <p className="text-[13px] text-text-muted leading-relaxed">
              这里记录 Work Kit 被学习、复用和验证的过程。团队不只保存结果，还能看见哪些经验正在被下一次项目吸收。
            </p>
          </div>
          <div className="grid sm:grid-cols-3 gap-3">
            {[
              ['学习记录', `${learningCount} 条`, '启动前学习包的使用痕迹'],
              ['复用强度', `${totalReuse} 次`, '模板被再次用于项目'],
              ['平均学习', `${avgLearningPercent}%`, avgLearningPercent ? `预计节省 ${avgSaving}%` : '等待复用记录'],
            ].map(([label, value, sub]) => (
              <div key={label} className="rounded-2xl bg-bg-primary/70 border border-border-light p-4">
                <div className="text-[24px] font-light text-text-main leading-none mb-2">{value}</div>
                <div className="text-[12px] font-medium text-text-main">{label}</div>
                <div className="text-[10px] text-text-muted mt-1">{sub}</div>
              </div>
            ))}
          </div>
        </div>
        {learningRecords.length > 0 && (
          <div className="relative mt-5 grid md:grid-cols-2 gap-3">
            {learningRecords.slice(0, 4).map((record, index) => (
              <div key={`${record.projectId}-${index}`} className="rounded-2xl border border-border-light bg-bg-primary/60 p-4">
                <div className="flex items-center justify-between gap-3 mb-2">
                  <div className="text-[13px] font-medium text-text-main truncate">{record.projectName}</div>
                  <span className="tag bg-ai-400/10 text-ai-400">学习包</span>
                </div>
                <p className="text-[11px] text-text-muted mb-2">来自 {record.workKitName}</p>
                <div className="grid grid-cols-3 gap-2 mb-3">
                  {[
                    ['学习', `${record.learningPercent ?? Math.round(((record.learnedIds || []).length / Math.max((record.learnedIds || []).length, 1)) * 100)}%`],
                    ['节省', record.estimatedSaving ? `${record.estimatedSaving}%` : '待评估'],
                    ['任务', record.plannedTaskCount ? `${record.plannedTaskCount}张` : `${(record.learnedIds || []).length}项`],
                  ].map(([label, value]) => (
                    <div key={label} className="rounded-xl border border-border-light bg-bg-surface/70 p-2">
                      <div className="text-[13px] font-medium text-text-main leading-none">{value}</div>
                      <div className="text-[9px] text-text-muted mt-1">{label}</div>
                    </div>
                  ))}
                </div>
                <p className="text-[12px] text-text-secondary leading-relaxed line-clamp-2">
                  {(record.summary || []).join(' / ') || '暂无学习笔记'}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Validation console — 纪要建议：固定流程 + 小智能体对比 */}
      <div className="card-surface rounded-[26px] p-6 mb-8 overflow-hidden relative">
        <div className="absolute right-0 top-0 w-48 h-48 rounded-full bg-accent-500/5 translate-x-20 -translate-y-24" />
        <div className="relative flex items-start justify-between gap-8">
          <div className="flex items-start gap-4">
            <div className="w-11 h-11 rounded-2xl bg-accent-50 flex items-center justify-center shrink-0">
              <Bot className="w-5 h-5 text-accent-500" />
            </div>
            <div>
              <div className="text-[11px] font-semibold text-accent-600 uppercase tracking-[0.08em] mb-1">Validation Agents · 知识库对比验证</div>
              <h2 className="text-[20px] font-medium text-text-main mb-2">固定流程每天跑，判断知识该保留还是修订</h2>
              <p className="text-[13px] text-text-muted leading-relaxed max-w-2xl">
                将公司 Work Kit 与市场竞品话术、流程结构和项目反馈横向对比，用验证角色输出可执行的保留/修改动作，避免每次项目都重新设定。
              </p>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2 w-[310px] shrink-0">
            {[
              ['运行频率', '每日'],
              ['智能体', '3 个'],
              ['动作', '保留/修订'],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl bg-bg-primary/70 border border-border-light p-3 text-center">
                <div className="text-[18px] font-light text-text-main leading-none mb-1">{value}</div>
                <div className="text-[10px] text-text-muted">{label}</div>
              </div>
            ))}
          </div>
        </div>
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
      <div className="space-y-6 mb-10">
        {/* Search Row */}
        <div className="relative w-full group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted group-focus-within:text-accent-500 transition-colors" />
          <input
            type="text"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            placeholder="搜索 Work Kit 模板名称、应用场景或技术标签..."
            className="w-full pl-11 pr-16 py-3.5 bg-bg-surface border border-border-default rounded-2xl text-[13px] focus:outline-none focus:border-accent-500/50 focus:ring-4 focus:ring-accent-500/5 text-text-main placeholder-text-placeholder shadow-sm transition-all duration-300"
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1 text-[10px] font-mono text-text-placeholder bg-white/5 border border-border-light px-2 py-1 rounded-md max-sm:hidden">
            <span>ESC</span>
          </div>
        </div>

        {/* Category Tabs Row */}
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center gap-2 text-[10px] font-semibold text-text-muted uppercase tracking-wider">
            <SlidersHorizontal className="w-3.5 h-3.5 text-accent-500" />
            <span>按类别筛选工作包</span>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setFilterTag(null)}
              className={`text-[12px] px-4 py-2 rounded-xl border transition-all cursor-pointer ${
                !filterTag
                  ? 'bg-accent-500 border-accent-500 text-white shadow-md shadow-accent-500/15'
                  : 'bg-bg-surface border-border-default text-text-secondary hover:border-accent-500/30 hover:text-accent-500 hover:bg-accent-500/[0.01]'
              }`}
            >
              全部模板
            </button>
            {allTags.map((tag) => {
              const isActive = filterTag === tag
              return (
                <button
                  key={tag}
                  onClick={() => setFilterTag(isActive ? null : tag)}
                  className={`text-[12px] px-4 py-2 rounded-xl border transition-all cursor-pointer ${
                    isActive
                      ? 'bg-accent-500 border-accent-500 text-white shadow-md shadow-accent-500/15'
                      : 'bg-bg-surface border-border-default text-text-secondary hover:border-accent-500/30 hover:text-accent-500 hover:bg-accent-500/[0.01]'
                  }`}
                >
                  {tag}
                </button>
              )
            })}
          </div>
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
            const kitLearningRecords = learningRecords.filter((record) => record.workKitId === wk.id)
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

                {kitLearningRecords.length > 0 && (
                  <div className="mx-6 mt-4 rounded-2xl border border-ai-400/15 bg-ai-400/[0.04] p-4">
                    <div className="flex items-center justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-ai-400" />
                        <span className="text-[12px] font-semibold text-text-main">最近学习与复用</span>
                      </div>
                  <span className="text-[10px] text-ai-400">{kitLearningRecords.length} 条记录</span>
                </div>
                    {kitLearningRecords.some((record) => record.estimatedSaving || record.learningPercent) && (
                      <div className="grid grid-cols-3 gap-2 mb-3">
                        {[
                          ['平均学习', `${Math.round(kitLearningRecords.reduce((sum, record) => sum + (record.learningPercent ?? 0), 0) / kitLearningRecords.length)}%`],
                          ['预计节省', `${Math.round(kitLearningRecords.reduce((sum, record) => sum + (record.estimatedSaving ?? 0), 0) / kitLearningRecords.length)}%`],
                          ['计划任务', `${kitLearningRecords.reduce((sum, record) => sum + (record.plannedTaskCount ?? 0), 0)}张`],
                        ].map(([label, value]) => (
                          <div key={label} className="rounded-xl bg-bg-surface/75 border border-border-light p-3">
                            <div className="text-[16px] font-light text-text-main leading-none">{value}</div>
                            <div className="text-[10px] text-text-muted mt-1">{label}</div>
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="grid md:grid-cols-2 gap-2">
                      {kitLearningRecords.slice(0, 2).map((record, index) => (
                        <div key={`${record.projectId}-${index}`} className="rounded-xl bg-bg-surface/75 border border-border-light p-3">
                          <div className="text-[12px] font-medium text-text-main truncate">{record.projectName}</div>
                          <div className="text-[10px] text-text-muted mt-1">
                            {record.learningPercent ? `学习 ${record.learningPercent}%` : `${(record.learnedIds || []).length} 个学习项`}
                            {record.estimatedSaving ? ` · 预计节省 ${record.estimatedSaving}%` : ''}
                            {record.plannedTaskCount ? ` · ${record.plannedTaskCount} 张任务` : ''}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

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
                    <button onClick={() => setEditKit(wk)} className="btn-ghost text-[12px]">
                      <Pencil className="w-3.5 h-3.5" /> 编辑
                    </button>
                    <button onClick={() => openValidation(wk.id)} className="btn-ghost text-[12px]">
                      <ShieldCheck className="w-3.5 h-3.5" /> 启动验证
                    </button>
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

      {/* Validation dialog */}
      {validationKit && (() => {
        const wk = kits.find((k) => k.id === validationKit)
        if (!wk) return null
        const rows = buildValidationRows(wk)
        const reviseCount = rows.filter((row) => draftValidation[row.id] === 'revise').length
        return (
          <div className="fixed inset-0 bg-black/25 flex items-center justify-center z-50">
            <div className="bg-bg-surface rounded-[28px] p-6 w-[760px] max-h-[86vh] overflow-auto shadow-2xl">
              <div className="flex items-start justify-between gap-6 mb-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-accent-50 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-5 h-5 text-accent-500" />
                  </div>
                  <div>
                    <div className="text-[11px] font-semibold text-accent-600 uppercase tracking-[0.08em] mb-1">Validation Run</div>
                    <h3 className="text-[20px] font-medium text-text-main">{wk.name}</h3>
                    <p className="text-[12px] text-text-muted mt-1">对比公司知识库与市场竞品，决定保留、修订和下一版动作。</p>
                  </div>
                </div>
                <div className="rounded-2xl bg-bg-primary border border-border-light px-4 py-3 text-center">
                  <div className="text-[20px] font-light text-text-main leading-none">{rows.length - reviseCount}/{rows.length}</div>
                  <div className="text-[10px] text-text-muted mt-1">建议保留</div>
                </div>
              </div>

              <div className="grid grid-cols-[1fr_1fr] gap-4 mb-5">
                <div className="rounded-2xl border border-border-light bg-bg-primary/70 p-4">
                  <div className="text-[11px] font-semibold text-text-muted uppercase tracking-[0.08em] mb-2">公司知识库</div>
                  <p className="text-[13px] text-text-secondary leading-relaxed">{wk.materialStructure}</p>
                </div>
                <div className="rounded-2xl border border-accent-500/20 bg-accent-500/[0.04] p-4">
                  <div className="text-[11px] font-semibold text-accent-600 uppercase tracking-[0.08em] mb-2">市场竞品参照</div>
                  <p className="text-[13px] text-text-secondary leading-relaxed">竞品评论、详情页话术、直播脚本、用户反馈和外部优秀流程。</p>
                </div>
              </div>

              <div className="space-y-3">
                {rows.map((row) => {
                  const decision = draftValidation[row.id] || row.suggested
                  return (
                    <div key={row.id} className="rounded-2xl border border-border-light bg-bg-primary/60 p-4">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Bot className="w-4 h-4 text-accent-500" />
                            <span className="text-[14px] font-medium text-text-main">{row.agent}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-bg-surface text-text-muted">{row.score} 分</span>
                          </div>
                          <div className="text-[11px] text-text-muted">{row.target}</div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <button
                            onClick={() => setDraftValidation((prev) => ({ ...prev, [row.id]: 'keep' }))}
                            className={`text-[11px] px-3 py-1.5 rounded-xl border transition-colors ${decision === 'keep' ? 'border-success/30 bg-success-soft text-success' : 'border-border-light text-text-muted hover:text-text-main'}`}
                          >
                            保留
                          </button>
                          <button
                            onClick={() => setDraftValidation((prev) => ({ ...prev, [row.id]: 'revise' }))}
                            className={`text-[11px] px-3 py-1.5 rounded-xl border transition-colors ${decision === 'revise' ? 'border-warning/30 bg-warning-soft text-warning' : 'border-border-light text-text-muted hover:text-text-main'}`}
                          >
                            标记修订
                          </button>
                        </div>
                      </div>
                      <div className="grid grid-cols-[1fr_1fr] gap-3">
                        <div className="rounded-xl bg-bg-surface/70 p-3">
                          <div className="flex items-center gap-2 text-[11px] font-medium text-text-main mb-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-success" /> 对比发现
                          </div>
                          <p className="text-[12px] text-text-muted leading-relaxed">{row.finding}</p>
                        </div>
                        <div className="rounded-xl bg-bg-surface/70 p-3">
                          <div className="flex items-center gap-2 text-[11px] font-medium text-text-main mb-1">
                            <AlertTriangle className="w-3.5 h-3.5 text-warning" /> 修订动作
                          </div>
                          <p className="text-[12px] text-text-muted leading-relaxed">{row.action}</p>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="mt-6 rounded-2xl bg-accent-500/[0.05] border border-accent-500/15 p-4 flex items-start gap-3">
                <Sparkles className="w-4 h-4 text-accent-500 mt-0.5 shrink-0" />
                <p className="text-[12px] text-text-secondary leading-relaxed">
                  保存后，本次验证会成为资产库的验证记录；下一次创建项目或执行任务时，可优先采用“保留”项，并对“修订”项进行人工复核。
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 mt-6">
                <button onClick={() => setValidationKit(null)} className="btn-ghost text-[13px]">取消</button>
                <button onClick={saveValidation} className="btn-primary-filled text-[13px]">
                  保存验证结论
                </button>
              </div>
            </div>
          </div>
        )
      })()}

      {editKit && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50" onClick={() => setEditKit(null)}>
          <div className="bg-bg-surface rounded-[24px] p-6 w-[500px] shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-11 h-11 rounded-xl bg-accent-50 flex items-center justify-center shrink-0">
                <Pencil className="w-5 h-5 text-accent-500" />
              </div>
              <div>
                <h3 className="text-[16px] font-medium text-text-main">编辑工作包信息</h3>
                <p className="text-[12px] text-text-muted">修改 Work Kit 在资产库中的基础信息描述</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-medium text-text-muted mb-1.5">工作包名称 *</label>
                <input
                  type="text"
                  value={editKit.name}
                  onChange={(e) => setEditKit({ ...editKit, name: e.target.value })}
                  className="w-full text-[13px] px-3 py-2.5 bg-bg-primary border border-border-default rounded-xl focus:outline-none focus:border-accent-400 text-text-main"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-text-muted mb-1.5">描述信息 *</label>
                <textarea
                  value={editKit.description}
                  onChange={(e) => setEditKit({ ...editKit, description: e.target.value })}
                  rows={3}
                  className="w-full text-[13px] px-3 py-2.5 bg-bg-primary border border-border-default rounded-xl focus:outline-none focus:border-accent-400 text-text-main"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-medium text-text-muted mb-1.5">适用场景</label>
                  <input
                    type="text"
                    value={editKit.scenario}
                    onChange={(e) => setEditKit({ ...editKit, scenario: e.target.value })}
                    className="w-full text-[13px] px-3 py-2.5 bg-bg-primary border border-border-default rounded-xl focus:outline-none focus:border-accent-400 text-text-main"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-text-muted mb-1.5">资料结构描述</label>
                  <input
                    type="text"
                    value={editKit.materialStructure}
                    onChange={(e) => setEditKit({ ...editKit, materialStructure: e.target.value })}
                    className="w-full text-[13px] px-3 py-2.5 bg-bg-primary border border-border-default rounded-xl focus:outline-none focus:border-accent-400 text-text-main"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[11px] font-medium text-text-muted mb-1.5">标签 (以逗号或空格分隔)</label>
                <input
                  type="text"
                  value={editKit.tags.join(', ')}
                  onChange={(e) => setEditKit({ ...editKit, tags: e.target.value.split(/[,，\s]+/).map(t => t.trim()).filter(Boolean) })}
                  className="w-full text-[13px] px-3 py-2.5 bg-bg-primary border border-border-default rounded-xl focus:outline-none focus:border-accent-400 text-text-main"
                />
              </div>
            </div>
            <div className="flex items-center gap-2 justify-end mt-6">
              <button onClick={() => setEditKit(null)} className="btn-ghost text-[13px]">取消</button>
              <button
                onClick={() => {
                  if (!editKit.name.trim() || !editKit.description.trim()) {
                    showToast('请填写完整名称和描述', 'error')
                    return
                  }
                  const allKits = getWorkKits()
                  const idx = allKits.findIndex((k) => k.id === editKit.id)
                  if (idx >= 0) {
                    allKits[idx] = editKit
                    localStorage.setItem('promokit_kits', JSON.stringify(allKits))
                    showToast('工作包已更新', 'success')
                    setTimeout(() => window.location.reload(), 800)
                  }
                  setEditKit(null)
                }}
                className="btn-primary-filled text-[13px]"
              >
                保存修改
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
