import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import {
  Package, CheckCircle2, ArrowRight, Target, MessageSquareText, Palette,
  Mic, FileText, Calendar, Users, ShoppingBag,
} from 'lucide-react'
import { mockProjects, mockTaskCards, mockAIResults, roleLabels } from '../data/mock'
import { useToast } from '../components/Toast'
import PageHeader from '../components/PageHeader'
import StatusBadge from '../components/StatusBadge'
import SectionCard from '../components/SectionCard'

export default function Report() {
  const { projectId } = useParams<{ projectId: string }>()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const project = mockProjects.find((p) => p.id === projectId)
  const tasks = mockTaskCards[projectId ?? ''] ?? []
  const [activeTab, setActiveTab] = useState(tasks[0]?.role ?? 'merchandise')
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [saved, setSaved] = useState(false)

  if (!project) return <div className="text-text-muted text-sm p-8">项目不存在</div>

  const roleTabs = [...new Set(tasks.map((t) => t.role))]
  const submittedCount = tasks.filter((t) => mockAIResults[t.id]?.submitted).length

  return (
    <div className="max-w-5xl">
      <PageHeader
        title="618 大促策略报告"
        description={`${project.name} — ${submittedCount}/${tasks.length} 个岗位结果已提交。`}
        actions={
          <div className="flex items-center gap-2">
            <Link to={`/tasks/${projectId}`} className="inline-flex items-center gap-2 px-4 py-2.5 border border-border-default text-text-secondary text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors">
              返回任务卡
            </Link>
            <button onClick={() => setShowSaveDialog(true)} className="inline-flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-biz-500 to-biz-600 text-white text-sm font-medium rounded-xl hover:from-biz-600 hover:to-biz-700 transition-all shadow-sm btn-biz-glow">
              <Package className="w-4 h-4" /> 沉淀为复用工作包
            </button>
          </div>
        }
      />

      {/* 报告封面 */}
      <SectionCard className="mb-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-semibold text-biz-500 bg-biz-50 px-2 py-0.5 rounded-full">{project.campaign}</span>
              <span className="text-[10px] text-text-muted">{project.category}</span>
            </div>
            <h2 className="text-lg font-semibold text-text-main mb-2">{project.name}</h2>
            <p className="text-sm text-text-secondary max-w-2xl leading-relaxed mb-4">{project.description}</p>
            <div className="flex items-center gap-4 text-xs text-text-muted flex-wrap">
              <span className="flex items-center gap-1.5"><Target className="w-3.5 h-3.5" />覆盖 {project.competitors.length} 个竞品 · {project.competitors.reduce((s, c) => s + c.reviewCount, 0)} 条评论</span>
              <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" />{project.team.length} 个岗位参与</span>
              <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />生成时间：{new Date().toISOString().split('T')[0]}</span>
            </div>
          </div>
        </div>
      </SectionCard>

      {/* 执行摘要 */}
      <SectionCard title="执行摘要" className="mb-6">
        <div className="space-y-2.5">
          {[
            '用户对风力和干发速度最敏感：三个竞品的高频好评均围绕「风速快、干发快」，差评集中在噪音、发热和售后——这三个问题是当前品类最大的差异化机会。',
            '噪音是最大共性痛点：62条高频评论提到噪音偏大或声音尖锐，覆盖全部3个竞品。低噪音风道技术是可量化且极具传播力的核心卖点。',
            '详情页信息层级需要重排：当前所有竞品详情页将技术参数放在第三屏之后，但用户评论显示「静音」「恒温」「售后」才是决策关键信息。',
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-3 text-sm text-text-secondary leading-relaxed">
              <span className="w-6 h-6 rounded-lg bg-biz-50 text-biz-600 font-medium text-xs flex items-center justify-center shrink-0">{i + 1}</span>
              {item}
            </div>
          ))}
        </div>
      </SectionCard>

      {/* 岗位 Tab */}
      <div className="flex gap-1 mb-6 border-b border-border-default overflow-x-auto">
        {roleTabs.map((role) => (
          <button key={role} onClick={() => setActiveTab(role)}
            className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${activeTab === role ? 'border-ai-600 text-ai-700' : 'border-transparent text-text-muted hover:text-text-secondary'}`}>
            {roleLabels[role]}
          </button>
        ))}
      </div>

      {roleTabs.map((role) => {
        if (role !== activeTab) return null
        return (
          <div key={role} className="space-y-5">
            {tasks.filter((t) => t.role === role).map((task) => {
              const result = mockAIResults[task.id]
              const SectionIcon = task.title.includes('商品') ? ShoppingBag : task.title.includes('文案') || task.title.includes('卖点') ? FileText : task.title.includes('FAQ') || task.title.includes('客服') ? MessageSquareText : task.title.includes('设计') || task.title.includes('详情') ? Palette : task.title.includes('话术') || task.title.includes('直播') ? Mic : Target

              return (
                <SectionCard key={task.id}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-xl bg-ai-50 flex items-center justify-center"><SectionIcon className="w-4 h-4 text-ai-600" /></div>
                    <h3 className="text-sm font-semibold text-text-main">{task.title}</h3>
                    <StatusBadge status={task.status} />
                    {result?.submitted && <span className="inline-flex items-center gap-1 text-xs text-success font-medium"><CheckCircle2 className="w-3.5 h-3.5" />已提交</span>}
                  </div>
                  {result?.submitted ? (
                    <div className="space-y-3">
                      {result.sections.slice(0, 2).map((section, i) => (
                        <div key={i} className="border border-border-light rounded-xl p-4 bg-gray-50/50">
                          <h4 className="text-xs font-semibold text-text-main mb-2">{section.title}</h4>
                          {section.type === 'matrix' && section.headers && section.rows && (
                            <div className="overflow-x-auto">
                              <table className="w-full text-xs">
                                <thead><tr className="border-b border-border-light">{section.headers.map((h) => <th key={h} className="text-left py-1.5 px-2 font-medium text-text-muted">{h}</th>)}</tr></thead>
                                <tbody>{section.rows.slice(0, 4).map((row, ri) => <tr key={ri}>{row.map((cell, ci) => <td key={ci} className={`py-1.5 px-2 ${ci === 0 ? 'text-text-main font-medium' : 'text-text-secondary'}`}>{cell}</td>)}</tr>)}</tbody>
                              </table>
                            </div>
                          )}
                          {section.type === 'list' && section.items && (
                            <ul className="space-y-1">{section.items.slice(0, 3).map((item, j) => <li key={j} className="text-xs text-text-secondary">• {item}</li>)}</ul>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6">
                      <p className="text-xs text-text-muted mb-2">尚未生成分析结果</p>
                      <Link to={`/workspace/${projectId}/${task.id}`} className="inline-flex items-center gap-1.5 text-xs font-medium text-ai-600"><ArrowRight className="w-3.5 h-3.5" />前往 AI 分析工作台</Link>
                    </div>
                  )}
                </SectionCard>
              )
            })}
          </div>
        )
      })}

      {/* 下一步执行清单 */}
      <SectionCard title="下一步执行清单" className="mt-8">
        <div className="space-y-2.5">
          {[
            '商品岗确认产品能力：能否做到低噪音风道和恒温控制',
            '文案岗优化首屏标题：突出「静音速干」双卖点',
            '客服岗补充售后话术：尤其是退换货和保修流程',
            '设计岗重排详情页模块：静音→恒温→质感→售后',
            '运营岗确认618主推策略和定价方案',
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-3 text-sm text-text-secondary leading-relaxed">
              <span className="w-6 h-6 rounded-lg bg-ai-50 text-ai-600 font-medium text-xs flex items-center justify-center shrink-0">{i + 1}</span>
              {item}
            </div>
          ))}
        </div>
      </SectionCard>

      {/* 因果提示 */}
      <div className="mt-6 bg-ai-50/50 border border-ai-100 rounded-xl p-3.5 text-center">
        <p className="text-xs text-ai-700">报告由已提交的岗位分析结果汇总生成，保存为 Work Kit 后可复用于下一次大促。</p>
      </div>

      {/* 保存弹窗 */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-[440px] shadow-xl border border-border-default">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-biz-50 flex items-center justify-center"><Package className="w-5 h-5 text-biz-600" /></div>
              <div>
                <h3 className="font-semibold text-text-main">沉淀为复用工作包</h3>
                <p className="text-xs text-text-muted">系统将保存当前资料结构、岗位任务、Prompt 模板、报告格式和反馈记录，用于下一次大促复用。</p>
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 mb-5 text-xs text-text-secondary space-y-1.5">
              <div className="flex justify-between"><span>项目</span><span className="font-medium text-text-main">{project.name}</span></div>
              <div className="flex justify-between"><span>版本</span><span className="font-medium text-text-main">v1.0</span></div>
              <div className="flex justify-between"><span>包含</span><span className="font-medium text-text-main">{tasks.length} 个任务模板 · {roleTabs.length} 个岗位 · 报告结构</span></div>
            </div>
            <div className="flex items-center gap-2 justify-end">
              <button onClick={() => setShowSaveDialog(false)} className="px-4 py-2.5 text-sm text-text-muted hover:text-text-secondary transition-colors">取消</button>
              <button onClick={() => { setSaved(true); setShowSaveDialog(false); showToast('Work Kit 已保存到资产库', 'success') }} className="px-5 py-2.5 bg-gradient-to-r from-biz-500 to-biz-600 text-white text-sm font-medium rounded-xl hover:from-biz-600 hover:to-biz-700 transition-all shadow-sm btn-biz-glow">确认保存</button>
            </div>
          </div>
        </div>
      )}
      {saved && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 w-[440px] shadow-xl border border-border-default text-center">
            <div className="w-14 h-14 rounded-2xl bg-success-soft flex items-center justify-center mx-auto mb-4"><CheckCircle2 className="w-7 h-7 text-success" /></div>
            <h3 className="text-lg font-semibold text-text-main mb-1">618 Work Kit v1 已沉淀</h3>
            <p className="text-sm text-text-muted mb-6">已将「{project.name}」保存为可复用工作包，可在 AI 工作包资产库中查看和复用。</p>
            <div className="flex items-center justify-center gap-3">
              <button onClick={() => setSaved(false)} className="px-4 py-2.5 text-sm text-text-muted hover:text-text-secondary transition-colors">关闭</button>
              <button onClick={() => navigate('/archive')} className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-ai-500 to-ai-700 text-white text-sm font-medium rounded-xl hover:from-ai-600 hover:to-ai-800 transition-all shadow-sm btn-primary-glow">查看资产库 <ArrowRight className="w-4 h-4" /></button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
