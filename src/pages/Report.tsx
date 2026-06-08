import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { CheckCircle2, ArrowRight, Package, Circle } from 'lucide-react'
import { roleLabels, reportSummaries, reportNextSteps } from '../data/mock'
import { getProjectBySlug, getTasks, getAIResult } from '../services/db'
import { useToast } from '../components/Toast'

function CheckItem({ text }: { text: string }) {
  const [done, setDone] = useState(false)
  return (
    <button onClick={() => setDone(!done)} className="flex items-center gap-4 text-[14px] text-text-secondary text-left w-full hover:text-text-main transition-colors">
      {done ? <CheckCircle2 className="w-4 h-4 text-success shrink-0" /> : <Circle className="w-4 h-4 text-text-muted shrink-0" />}
      <span className={done ? 'line-through text-text-muted' : ''}>{text}</span>
    </button>
  )
}

export default function Report() {
  const { projectSlug } = useParams<{ projectSlug: string }>()
  const navigate = useNavigate()
  const { showToast } = useToast()
  const project = getProjectBySlug(projectSlug!)
  const tasks = project ? getTasks(project.id) : []
  const [activeTab, setActiveTab] = useState(tasks[0]?.role ?? 'merchandise')
  const [showSaveDialog, setShowSaveDialog] = useState(false)
  const [saved, setSaved] = useState(false)

  if (!project) return <div className="text-text-muted text-sm p-8">项目不存在</div>

  const roleOrder = ['operations', 'merchandise', 'copywriting', 'customer_service', 'design']
  const roleTabs = [...new Set(tasks.map((t) => t.role))].sort((a, b) => roleOrder.indexOf(a) - roleOrder.indexOf(b))
  const submittedCount = tasks.filter((t) => getAIResult(t.id)?.submitted).length

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="mb-14">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-[6px] h-[6px] rounded-full bg-accent-500" />
          <span className="section-title">{project.campaign} · {project.category}</span>
        </div>
        <h1 className="text-[36px] font-light tracking-[-0.02em] text-text-main mb-4">大促策略报告</h1>
        <p className="text-[15px] text-text-secondary max-w-lg leading-relaxed mb-6">
          {project.name} — {submittedCount}/{tasks.length} 个岗位结果已提交。
        </p>
        <div className="flex items-center gap-3">
          <button onClick={() => setShowSaveDialog(true)} className="btn-primary">
            <Package className="w-4 h-4" /> 沉淀为复用工作包
          </button>
          <Link to={`/tasks/${projectSlug}`} className="btn-ghost">返回任务卡</Link>
        </div>
      </div>

      {/* Executive summary */}
      <div className="mb-14">
        <span className="section-title">执行摘要</span>
        <div className="mt-5 space-y-4">
          {(reportSummaries[project.id] || reportSummaries['p1']).map((item, i) => (
            <div key={i} className="flex items-start gap-4 text-[14px] text-text-secondary leading-relaxed">
              <span className="text-[28px] font-light text-accent-400 leading-none mt-0.5">{String(i + 1).padStart(2, '0')}</span>
              {item}
            </div>
          ))}
        </div>
      </div>

      {/* Role tabs - vertical nav */}
      <div className="flex gap-12">
        <nav className="space-y-1 shrink-0 w-[120px]">
          <span className="section-title block mb-4">岗位</span>
          {roleTabs.map((role) => (
            <button
              key={role}
              onClick={() => setActiveTab(role)}
              className={`block w-full text-left py-2 pl-3 text-[13px] transition-colors border-l-[3px] ${
                activeTab === role ? 'text-text-main font-medium border-l-accent-500' : 'text-text-muted hover:text-text-secondary border-l-transparent hover:border-l-accent-300'
              }`}
            >
              {roleLabels[role]}
            </button>
          ))}
        </nav>

        <div className="flex-1 space-y-8">
          {roleTabs.map((role) => {
            if (role !== activeTab) return null
            return tasks.filter((t) => t.role === role).map((task) => {
              const result = getAIResult(task.id)
              return (
                <div key={task.id}>
                  <div className="flex items-center gap-3 mb-4">
                    <h3 className="text-[17px] font-medium text-text-main">{task.title}</h3>
                    {result?.submitted && (
                      <span className="flex items-center gap-1 text-[12px] text-success font-medium">
                        <CheckCircle2 className="w-3.5 h-3.5" />已提交
                      </span>
                    )}
                  </div>
                  {result?.submitted ? (
                    <div className="space-y-3">
                      {result.sections.slice(0, 2).map((section, i) => (
                        <div key={i} className="card-surface rounded-[20px] p-5">
                          <h4 className="text-[13px] font-medium text-text-main mb-3">{section.title}</h4>
                          {section.type === 'matrix' && section.headers && section.rows && (
                            <div className="overflow-x-auto">
                              <table className="w-full text-[12px]">
                                <thead><tr className="border-b border-border-light">{section.headers.map((h) => <th key={h} className="text-left py-2 px-2 text-[10px] font-medium uppercase tracking-[0.06em] text-text-muted">{h}</th>)}</tr></thead>
                                <tbody>{section.rows.slice(0, 4).map((row, ri) => <tr key={ri}>{row.map((cell, ci) => <td key={ci} className={`py-2 px-2 ${ci === 0 ? 'text-text-main font-medium' : 'text-text-secondary'}`}>{cell}</td>)}</tr>)}</tbody>
                              </table>
                            </div>
                          )}
                          {section.type === 'list' && section.items && (
                            <ul className="space-y-1.5">{section.items.slice(0, 3).map((item, j) => <li key={j} className="text-[12px] text-text-secondary">— {item}</li>)}</ul>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="card-surface rounded-[20px] p-6 text-center">
                      <p className="text-[13px] text-text-muted mb-2">尚未生成分析结果</p>
                      <Link to={`/workspace/${projectSlug}/${task.id}`} className="text-[12px] font-medium text-accent-600 hover:text-accent-700">前往 AI 工作台 <ArrowRight className="w-3.5 h-3.5 inline" /></Link>
                    </div>
                  )}
                </div>
              )
            })
          })}
        </div>
      </div>

      {/* Verification review */}
      <div className="mt-12 bg-accent-50/40 rounded-2xl p-6 border border-accent-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-xl bg-accent-100 flex items-center justify-center">
            <CheckCircle2 className="w-4 h-4 text-accent-600" />
          </div>
          <div>
            <span className="text-[12px] font-semibold text-accent-600 uppercase tracking-[0.06em]">验证审核 · 知识库对标准入</span>
            <p className="text-[11px] text-text-muted mt-0.5">设置验证角色，判断分析结果与市场竞品的优劣，确定保留和修改内容</p>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3 text-[11px]">
          {[
            { label: '内部知识库对比', status: '已通过', pass: true },
            { label: '市场竞品对标', status: '待验证', pass: false },
            { label: '审核角色确认', status: '待分配', pass: false },
          ].map((item) => (
            <div key={item.label} className={`rounded-xl p-3 ${item.pass ? 'bg-success-soft border border-success/20' : 'bg-white border border-border-light'}`}>
              <div className="flex items-center justify-between mb-1">
                <span className="font-medium text-text-main">{item.label}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${item.pass ? 'bg-success/10 text-success' : 'bg-gray-100 text-text-muted'}`}>{item.status}</span>
              </div>
              <div className="text-text-muted text-[10px]">{item.pass ? '公司知识库已验证通过' : '需分配审核人员进行验证'}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Next steps */}
      <div className="mt-12">
        <span className="section-title">下一步执行清单</span>
        <div className="mt-5 space-y-3">
          {(reportNextSteps[project.id] || reportNextSteps['p1']).map((item, i) => {
            return <CheckItem key={i} text={item} />
          })}
        </div>
      </div>

      {/* Save dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
          <div className="bg-white rounded-[24px] p-6 w-[420px] shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-accent-50 flex items-center justify-center"><Package className="w-5 h-5 text-accent-500" /></div>
              <div>
                <h3 className="font-medium text-text-main">沉淀为复用工作包</h3>
                <p className="text-[12px] text-text-muted">保存流程和模板，下次大促直接复用。</p>
              </div>
            </div>
            <div className="bg-gray-50 rounded-2xl p-4 mb-5 text-[12px] space-y-1.5">
              <div className="flex justify-between"><span className="text-text-muted">项目</span><span className="font-medium">{project.name}</span></div>
              <div className="flex justify-between"><span className="text-text-muted">版本</span><span className="font-medium">v1.0</span></div>
              <div className="flex justify-between"><span className="text-text-muted">包含</span><span className="font-medium">{tasks.length} 个任务模板 · {roleTabs.length} 个岗位</span></div>
            </div>
            <div className="flex items-center gap-2 justify-end">
              <button onClick={() => setShowSaveDialog(false)} className="btn-ghost">取消</button>
              <button onClick={() => { setSaved(true); setShowSaveDialog(false); showToast('Work Kit 已保存到资产库', 'success') }} className="btn-primary-filled">确认保存</button>
            </div>
          </div>
        </div>
      )}
      {saved && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
          <div className="bg-white rounded-[24px] p-8 w-[400px] shadow-xl text-center">
            <div className="w-14 h-14 rounded-2xl bg-success-soft flex items-center justify-center mx-auto mb-4"><CheckCircle2 className="w-7 h-7 text-success" /></div>
            <h3 className="text-[18px] font-medium text-text-main mb-2">618 Work Kit v1 已沉淀</h3>
            <p className="text-[13px] text-text-muted mb-6">已将「{project.name}」保存为可复用工作包，可在资产库中查看和复用。</p>
            <div className="flex items-center justify-center gap-3">
              <button onClick={() => setSaved(false)} className="btn-ghost">关闭</button>
              <button onClick={() => navigate('/archive')} className="btn-primary-filled">查看资产库 <ArrowRight className="w-4 h-4" /></button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
