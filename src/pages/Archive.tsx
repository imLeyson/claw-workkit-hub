import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Package, Tag, Users, GitBranch, ArrowRight, FileText, Clock, Star, Repeat, Sparkles } from 'lucide-react'
import { mockWorkKits, roleLabels } from '../data/mock'
import PageHeader from '../components/PageHeader'
import SectionCard from '../components/SectionCard'

export default function Archive() {
  const navigate = useNavigate()
  const [reuseKit, setReuseKit] = useState<string | null>(null)
  return (
    <div className="max-w-5xl">
      <PageHeader
        title="AI 工作包资产库"
        description="沉淀可复用的大促分析流程，减少下一次活动的重复整理成本。"
      />

      {/* Hero */}
      <div className="card-surface rounded-2xl p-6 mb-6">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold text-text-main mb-2">电商 AI 工作包资产库</h2>
            <p className="text-sm text-text-secondary max-w-lg leading-relaxed">
              每个工作包记录了完整的分析流程——从资料导入到任务模板再到报告格式，
              让下一次大促在几分钟内启动，而非几小时。
            </p>
          </div>
          <div className="hidden md:flex items-center gap-3 text-xs">
            {[
              { v: 'v1.0', label: '初始模板' },
              { v: 'v1.1', label: '客服增强' },
              { v: 'v1.2', label: '首屏优化' },
            ].map((item, i, arr) => (
              <div key={item.v} className="flex items-center gap-2">
                <div className="text-center">
                  <div className={`w-10 h-10 rounded-xl ${i === arr.length - 1 ? 'bg-kit-100' : 'bg-kit-50'} flex items-center justify-center mx-auto mb-1`}>
                    <GitBranch className={`w-5 h-5 ${i === arr.length - 1 ? 'text-kit-700' : 'text-kit-600'}`} />
                  </div>
                  <div className="text-text-main font-medium">{item.v}</div>
                  <div className="text-text-muted">{item.label}</div>
                </div>
                {i < arr.length - 1 && <ArrowRight className="w-4 h-4 text-gray-300" />}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 工作包卡片 */}
      {mockWorkKits.length > 0 ? (
        <div className="space-y-5">
          {mockWorkKits.map((wk) => (
            <div key={wk.id} className="card-surface rounded-2xl card-hover overflow-hidden">
              <div className="p-5 border-b border-border-light">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-kit-50 flex items-center justify-center">
                      <Package className="w-5 h-5 text-kit-600" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-text-main">{wk.name}</h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[11px] font-medium text-kit-600 bg-kit-50 px-2 py-0.5 rounded-lg">{wk.version}</span>
                        <span className="text-[11px] text-text-muted">基于：{wk.basedOnProjectName}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setReuseKit(wk.id)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-kit-600 bg-kit-50 border border-purple-200 rounded-xl hover:bg-purple-100 transition-colors"
                    >
                      <Repeat className="w-3.5 h-3.5" /> 复用此工作包
                    </button>
                    <button
                      onClick={() => navigate(`/create?from=archive&kit=${wk.id}`)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-text-secondary border border-border-default rounded-xl hover:bg-gray-50 transition-colors"
                    >
                      创建新大促项目
                    </button>
                  </div>
                </div>
                <p className="text-xs text-text-secondary leading-relaxed mb-3">{wk.description}</p>
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1 text-[10px] px-2 py-1 rounded-lg bg-biz-50 text-biz-700 font-medium">
                    <Tag className="w-3 h-3" /> 适用场景：{wk.scenario}
                  </span>
                  {wk.tags.map((tag) => <span key={tag} className="text-[10px] px-2 py-1 rounded-lg bg-gray-100 text-text-muted">{tag}</span>)}
                </div>
              </div>

              <div className="p-5 grid grid-cols-2 gap-4">
                <div>
                  <div className="text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-2">包含岗位</div>
                  <div className="flex items-center gap-2 flex-wrap">
                    {wk.includedRoles.map((role) => (
                      <span key={role} className="inline-flex items-center gap-1 text-[11px] bg-gray-50 border border-border-light rounded-lg px-2.5 py-1.5 text-text-secondary">
                        <Users className="w-3 h-3" />{roleLabels[role]}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-2">包含资料</div>
                  <p className="text-[11px] text-text-secondary leading-relaxed">{wk.materialStructure}</p>
                </div>
                <div>
                  <div className="text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-2">任务模板</div>
                  <div className="space-y-1">
                    {wk.sections.map((s, i) => (
                      <div key={i} className="text-[11px] text-text-secondary flex items-center gap-1.5"><FileText className="w-3 h-3 text-gray-400" />{s.title} · {roleLabels[s.role]}</div>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-2">上次反馈</div>
                  <p className="text-[11px] text-text-secondary leading-relaxed">{wk.feedback}</p>
                </div>
              </div>

              {/* 复用统计 */}
              <div className="px-5 py-2.5 bg-gray-50/50 border-t border-border-light flex items-center gap-4 text-[11px] text-text-muted">
                <span className="flex items-center gap-1"><Repeat className="w-3 h-3" />复用 {wk.reuseCount} 次</span>
                <span className="flex items-center gap-1"><Star className="w-3 h-3 text-amber-400" />{wk.rating}</span>
              </div>

              {/* 版本历史 */}
              <div className="px-5 py-3 bg-white border-t border-border-light overflow-x-auto">
                <div className="text-[10px] font-semibold text-text-muted uppercase tracking-wider mb-2">版本历史</div>
                <div className="flex items-center gap-3 min-w-max">
                  {wk.versionHistory.map((v, i) => (
                    <div key={v.version} className="flex items-center gap-2">
                      <div className="flex items-center gap-1.5 text-[11px]">
                        <span className="font-medium text-text-main">{v.version}</span>
                        <span className="text-text-muted">{v.date}</span>
                        <span className="text-text-muted">— {v.changes}</span>
                      </div>
                      {i < wk.versionHistory.length - 1 && <ArrowRight className="w-3 h-3 text-gray-300" />}
                    </div>
                  ))}
                </div>
              </div>

              <div className="px-5 py-2.5 flex items-center gap-4 text-[11px] text-text-muted">
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />创建于 {wk.createdAt}</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4"><Package className="w-7 h-7 text-gray-300" /></div>
          <p className="text-sm text-text-muted">暂无 AI 工作包</p>
          <p className="text-xs text-text-muted mt-1">完成大促分析项目后，将策略报告沉淀为可复用工作包。</p>
        </div>
      )}

      {/* 因果提示 */}
      <div className="mt-6 bg-ai-50/50 border border-ai-100 rounded-xl p-3.5 text-center">
        <p className="text-xs text-ai-700">Work Kit 保存的是资料结构、任务模板、Prompt 和报告格式，而不是单次结果——确保下一次大促可直接复用。</p>
      </div>

      {/* 版本价值 */}
      <SectionCard className="mt-8">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-kit-50 flex items-center justify-center shrink-0"><GitBranch className="w-5 h-5 text-kit-600" /></div>
          <div>
            <h3 className="text-sm font-semibold text-text-main mb-1">为什么需要版本迭代</h3>
            <p className="text-xs text-text-muted leading-relaxed mb-2">
              每次大促后，根据真实反馈迭代工作包——更准确的风险分类、更精准的卖点转译、更高转化的直播话术。
              版本化确保团队经验持续积累，不随人员变动而丢失。
            </p>
            <div className="flex items-center gap-3 text-[11px]">
              <span className="text-text-muted">v1.0 初始模板</span><span className="text-text-muted">→</span>
              <span className="text-text-muted">v1.1 客服风险增强</span><span className="text-text-muted">→</span>
              <span className="text-text-muted">v1.2 详情页首屏优化</span>
            </div>
          </div>
        </div>
      </SectionCard>

      {/* 复用工作包对话框 */}
      {reuseKit && (() => {
        const wk = mockWorkKits.find((k) => k.id === reuseKit)
        if (!wk) return null
        return (
          <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 w-[460px] shadow-xl border border-border-default">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-kit-50 flex items-center justify-center">
                  <Package className="w-5 h-5 text-kit-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-text-main">复用工作包：{wk.name}</h3>
                  <p className="text-xs text-text-muted">基于此模板创建新的大促分析项目</p>
                </div>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 mb-5 text-xs text-text-secondary space-y-2">
                <div className="flex justify-between">
                  <span>版本</span>
                  <span className="font-medium text-text-main">{wk.version}</span>
                </div>
                <div className="flex justify-between">
                  <span>适用场景</span>
                  <span className="font-medium text-text-main">{wk.scenario}</span>
                </div>
                <div className="flex justify-between">
                  <span>包含岗位</span>
                  <span className="font-medium text-text-main">{wk.includedRoles.map((r) => roleLabels[r]).join('、')}</span>
                </div>
                <div className="flex justify-between">
                  <span>资料结构</span>
                  <span className="font-medium text-text-main text-right max-w-[240px]">{wk.materialStructure}</span>
                </div>
              </div>
              <div className="bg-ai-50/50 border border-ai-100 rounded-xl p-3 mb-5 text-center">
                <p className="text-xs text-ai-700">
                  <Sparkles className="w-3.5 h-3.5 inline mr-1" />
                  系统将自动预填 {wk.includedRoles.length} 个岗位角色和资料结构，快速启动新项目。
                </p>
              </div>
              <div className="flex items-center gap-2 justify-end">
                <button onClick={() => setReuseKit(null)} className="px-4 py-2.5 text-sm text-text-muted hover:text-text-secondary transition-colors">取消</button>
                <button
                  onClick={() => { setReuseKit(null); navigate(`/create?from=archive&kit=${wk.id}`) }}
                  className="px-5 py-2.5 bg-kit-500 text-white text-sm font-medium rounded-xl hover:bg-kit-600 transition-colors shadow-sm"
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
