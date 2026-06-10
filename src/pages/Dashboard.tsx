import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Target, Trash2, RotateCcw, Pencil, X, Package, BookOpen, GitBranch, Sparkles, Database, ClipboardCheck, ShieldCheck } from 'lucide-react'
import { roleLabels } from '../data/mock'
import { getProjects, getTasks, getAIResult, getWorkKits, getMaterials, deleteProject, resetAllData, updateProject } from '../services/db'
import type { Project } from '../types'

function readLocalList(key: string): any[] {
  try {
    return JSON.parse(localStorage.getItem(key) || '[]')
  } catch {
    return []
  }
}

export default function Dashboard() {
  const [projects, setProjects] = useState(getProjects())
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [showReset, setShowReset] = useState(false)

  // Project form editing state
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [projectForm, setProjectForm] = useState({
    name: '',
    description: '',
    category: '',
    campaign: '',
  })

  const handleOpenEdit = (p: Project) => {
    setEditingProject(p)
    setProjectForm({
      name: p.name,
      description: p.description,
      category: p.category,
      campaign: p.campaign,
    })
  }

  const handleSaveProject = () => {
    if (!editingProject) return
    if (!projectForm.name.trim()) {
      alert('项目名称不能为空')
      return
    }
    const updated: Project = {
      ...editingProject,
      name: projectForm.name.trim(),
      description: projectForm.description.trim(),
      category: projectForm.category.trim(),
      campaign: projectForm.campaign.trim(),
    }
    updateProject(updated)
    setProjects(getProjects())
    setEditingProject(null)
  }

  const handleDelete = (id: string) => {
    deleteProject(id)
    setProjects(getProjects())
    setDeleteId(null)
  }

  const totalCompetitors = projects.reduce((s, p) => s + p.competitors.length, 0)
  const totalReviews = projects.reduce((s, p) => s + p.competitors.reduce((a, c) => a + c.reviewCount, 0), 0)
  const allTasks = projects.flatMap((p) => getTasks(p.id))
  const submittedTasks = allTasks.filter((t) => getAIResult(t.id)?.submitted).length
  const workKits = getWorkKits()
  const learningRecords = readLocalList('promokit_prelearning_records')
  const assetHandoffs = readLocalList('promokit_asset_handoffs')
  const validationHistory = readLocalList('promokit_validation_history')
  const completedProjects = projects.filter((p) => p.status === 'completed').length
  const assetizedProjects = new Set(workKits.map((kit) => kit.basedOnProjectId)).size
  const assetizationRate = completedProjects > 0 ? Math.round((assetizedProjects / completedProjects) * 100) : 0
  const reuseTotal = workKits.reduce((sum, kit) => sum + kit.reuseCount, 0)
  const averageLearningPercent = learningRecords.length
    ? Math.round(learningRecords.reduce((sum, record) => sum + (record.learningPercent || 0), 0) / learningRecords.length)
    : 0
  const totalHandoffSections = assetHandoffs.reduce((sum, handoff) => sum + (handoff.sectionCount || 0), 0)
  const totalHandoffKnowledge = assetHandoffs.reduce((sum, handoff) => sum + ((handoff.adoptedKnowledge || []).length), 0)
  const projectAssetSignals = projects.map((project) => {
    const tasks = getTasks(project.id)
    const materials = getMaterials(project.id)
    const submitted = tasks.filter((task) => getAIResult(task.id)?.submitted).length
    const handoffs = assetHandoffs.filter((handoff) => handoff.projectId === project.id)
    const hasKit = workKits.some((kit) => kit.basedOnProjectId === project.id)
    const score = Math.round(([
      materials.length > 0,
      tasks.length > 0,
      submitted > 0,
      handoffs.length > 0,
      hasKit,
    ].filter(Boolean).length / 5) * 100)
    return { project, score, submitted, totalTasks: tasks.length, handoffs: handoffs.length, hasKit }
  }).sort((a, b) => a.score - b.score)
  const firstSlug = projects[0]?.slug || '618-hair-dryer'
  const actionQueue = projects.map((project) => {
    const tasks = getTasks(project.id)
    const materials = getMaterials(project.id)
    const submitted = tasks.filter((task) => getAIResult(task.id)?.submitted).length
    const generated = tasks.filter((task) => Boolean(getAIResult(task.id)?.generatedAt)).length
    const hasKit = workKits.some((kit) => kit.basedOnProjectId === project.id)
    const pct = tasks.length > 0 ? Math.round((submitted / tasks.length) * 100) : 0

    if (materials.length === 0) {
      return {
        project,
        icon: Database,
        tone: 'warning',
        title: '补齐资料结构',
        desc: '先导入竞品评论、商品参数等资料，任务卡才能形成可信输入。',
        to: `/materials/${project.slug}`,
        meta: '资料缺口',
      }
    }
    if (generated < tasks.length) {
      return {
        project,
        icon: Sparkles,
        tone: 'accent',
        title: '生成岗位分析',
        desc: `还有 ${Math.max(tasks.length - generated, 0)} 个岗位任务需要进入工作台生成结果。`,
        to: `/tasks/${project.slug}`,
        meta: `${generated}/${tasks.length} 已生成`,
      }
    }
    if (submitted < tasks.length) {
      return {
        project,
        icon: ClipboardCheck,
        tone: 'ai',
        title: '提交到策略报告',
        desc: `已生成的岗位结果需要提交到报告，当前提交进度 ${submitted}/${tasks.length}。`,
        to: `/report/${project.slug}`,
        meta: `${pct}% 报告进度`,
      }
    }
    if (!hasKit) {
      return {
        project,
        icon: Package,
        tone: 'kit',
        title: '发布 Work Kit',
        desc: '报告已具备沉淀条件，建议完成发布前检查并保存为复用工作包。',
        to: `/report/${project.slug}`,
        meta: '待资产化',
      }
    }
    return {
      project,
      icon: ShieldCheck,
      tone: 'success',
      title: '补充复用验证',
      desc: '项目已沉淀为资产，建议进入资产库记录保留/修订结论。',
      to: '/archive',
      meta: '已资产化',
    }
  }).slice(0, 4)

  return (
    <div className="max-w-5xl">
      <div className="mb-10 rounded-[28px] border border-border-default bg-bg-surface p-6 overflow-hidden relative">
        <div className="absolute right-[-90px] top-[-140px] w-[320px] h-[320px] rounded-full bg-accent-500/8" />
        <div className="relative grid lg:grid-cols-[1.1fr_0.9fr] gap-7 items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-ai-400/20 bg-ai-400/10 px-3 py-1 text-[11px] text-ai-400 mb-5">
              <GitBranch className="w-3.5 h-3.5" />
              分析资产化闭环
            </div>
            <h1 className="text-[34px] font-light tracking-[-0.03em] text-text-main mb-3">把每一次分析变成下一次可复用的起点</h1>
            <p className="text-[14px] text-text-secondary leading-relaxed max-w-2xl">
              看板现在追踪项目执行、报告沉淀、Work Kit 复用和启动前学习记录，帮助团队判断经验是否真的被传承，而不只是完成了一份报告。
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[
              { icon: Package, value: `${assetizationRate}%`, label: '项目资产化率', sub: `${assetizedProjects}/${Math.max(completedProjects, 1)} 个完成项目已沉淀` },
              { icon: BookOpen, value: String(learningRecords.length), label: '启动前学习', sub: '学习包使用记录' },
              { icon: Sparkles, value: String(reuseTotal), label: '模板复用', sub: 'Work Kit 累计复用' },
              { icon: GitBranch, value: String(workKits.length), label: '经验资产', sub: '可复用工作包' },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-border-light bg-bg-primary/60 p-4">
                <item.icon className="w-4 h-4 text-accent-500 mb-3" />
                <div className="text-[24px] font-light text-text-main leading-none mb-1">{item.value}</div>
                <div className="text-[11px] font-medium text-text-main">{item.label}</div>
                <div className="text-[10px] text-text-muted mt-1">{item.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6 mb-10 lg:mb-14">
        {[
          { value: String(totalCompetitors), label: '竞品覆盖', sub: `${projects.length} 品类 · ${totalCompetitors} 产品`, to: `/materials/${firstSlug}` },
          { value: totalReviews.toLocaleString(), label: '评论样本', sub: '全项目聚合数据', to: `/materials/${firstSlug}` },
          { value: `${submittedTasks}/${allTasks.length}`, label: '分析任务', sub: '已提交 / 总量', to: `/tasks/${firstSlug}` },
          { value: String(workKits.length), label: 'Work Kit', sub: '可复用模板资产', to: '/archive' },
        ].map((s) => (
          <Link key={s.label} to={s.to} className="card-surface rounded-2xl p-6 card-hover">
            <div className="text-[36px] font-light tracking-[-0.03em] text-text-main leading-none mb-2">{s.value}</div>
            <div className="h-px w-8 bg-accent-400 mb-3" />
            <div className="text-[12px] font-semibold text-text-main mb-1">{s.label}</div>
            <div className="text-[11px] text-text-muted">{s.sub}</div>
          </Link>
        ))}
      </div>

      <div className="mb-10 rounded-[28px] border border-border-default bg-bg-surface p-6 overflow-hidden relative">
        <div className="absolute left-[-110px] bottom-[-140px] w-[280px] h-[280px] rounded-full bg-ai-400/7" />
        <div className="relative flex flex-wrap items-start justify-between gap-4 mb-5">
          <div>
            <span className="section-title">Asset Operations</span>
            <h2 className="text-[20px] font-medium text-text-main mt-2">资产运营信号</h2>
            <p className="text-[13px] text-text-muted mt-1 max-w-2xl">
              汇总学习包、工作台交接、验证历史和 Work Kit 复用情况，判断团队经验是否真的从一次分析流向下一次项目。
            </p>
          </div>
          <Link to="/archive" className="btn-primary text-[12px]">
            进入资产库 <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="relative grid lg:grid-cols-[0.85fr_1.15fr] gap-4">
          <div className="rounded-2xl border border-accent-500/15 bg-accent-500/[0.035] p-5">
            <div className="flex items-end justify-between gap-4 mb-4">
              <div>
                <div className="text-[42px] font-light leading-none text-text-main">{assetizationRate}%</div>
                <div className="text-[11px] text-text-muted mt-1">项目资产化率</div>
              </div>
              <span className={`tag ${assetizationRate >= 70 ? 'bg-success-soft text-success' : 'bg-warning-soft text-warning'}`}>
                {assetizationRate >= 70 ? '资产化良好' : '继续沉淀'}
              </span>
            </div>
            <div className="h-2 rounded-full bg-bg-primary overflow-hidden mb-4">
              <div className="h-full rounded-full bg-accent-500 transition-all" style={{ width: `${assetizationRate}%` }} />
            </div>
            <div className="grid grid-cols-3 gap-2">
              {[
                ['学习度', averageLearningPercent ? `${averageLearningPercent}%` : '待记录'],
                ['交接区块', `${totalHandoffSections}`],
                ['验证', `${validationHistory.length}`],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl border border-border-light bg-bg-surface/75 p-3">
                  <div className="text-[15px] font-medium text-text-main leading-none">{value}</div>
                  <div className="text-[9px] text-text-muted mt-1">{label}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { icon: ClipboardCheck, label: '资产交接', value: `${assetHandoffs.length} 条`, sub: `${totalHandoffKnowledge} 个知识依据进入报告` },
              { icon: BookOpen, label: '启动前学习', value: `${learningRecords.length} 条`, sub: averageLearningPercent ? `平均学习 ${averageLearningPercent}%` : '等待复用学习记录' },
              { icon: ShieldCheck, label: '验证历史', value: `${validationHistory.length} 条`, sub: validationHistory[0] ? `最近：${validationHistory[0].status}` : '等待资产验证' },
              { icon: Package, label: '低闭环项目', value: `${projectAssetSignals.filter((item) => item.score < 80).length} 个`, sub: '优先补齐资料、交接或 Work Kit' },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-border-light bg-bg-primary/55 p-4">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <item.icon className="w-4 h-4 text-accent-500" />
                  <span className="text-[16px] font-light text-text-main leading-none">{item.value}</span>
                </div>
                <div className="text-[12px] font-medium text-text-main">{item.label}</div>
                <div className="text-[10px] text-text-muted mt-1">{item.sub}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="relative mt-4 rounded-2xl border border-border-light bg-bg-primary/45 p-4">
          <div className="flex items-center justify-between gap-3 mb-3">
            <div className="text-[12px] font-semibold text-text-main">需要优先补齐的项目</div>
            <span className="text-[10px] text-text-muted">按资产闭环分排序</span>
          </div>
          <div className="grid md:grid-cols-3 gap-2">
            {projectAssetSignals.slice(0, 3).map((item) => (
              <Link key={item.project.id} to={item.hasKit ? '/archive' : `/report/${item.project.slug}`} className="rounded-xl border border-border-light bg-bg-surface/80 p-3 hover:border-accent-500/25 transition-colors">
                <div className="flex items-center justify-between gap-2 mb-2">
                  <div className="text-[12px] font-medium text-text-main truncate">{item.project.name}</div>
                  <span className={`text-[11px] font-medium ${item.score >= 80 ? 'text-success' : item.score >= 60 ? 'text-warning' : 'text-text-muted'}`}>{item.score}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-bg-primary overflow-hidden mb-2">
                  <div className={`h-full rounded-full ${item.score >= 80 ? 'bg-success' : item.score >= 60 ? 'bg-warning' : 'bg-text-muted'}`} style={{ width: `${item.score}%` }} />
                </div>
                <div className="text-[10px] text-text-muted">{item.submitted}/{item.totalTasks} 提交 · {item.handoffs} 交接 · {item.hasKit ? '已入库' : '待 Work Kit'}</div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <div className="mb-10 rounded-[28px] border border-border-default bg-bg-surface p-6">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-5">
          <div>
            <span className="section-title">Next Best Actions</span>
            <h2 className="text-[20px] font-medium text-text-main mt-2">资产化下一步行动队列</h2>
            <p className="text-[13px] text-text-muted mt-1">按资料、任务、报告和 Work Kit 状态自动判断每个项目下一步该做什么。</p>
          </div>
          <Link to="/archive" className="btn-ghost text-[12px]">
            查看资产库 <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="grid md:grid-cols-2 gap-3">
          {actionQueue.map((item) => {
            const toneClass = {
              warning: 'bg-warning-soft text-warning border-warning/20',
              accent: 'bg-accent-500/10 text-accent-600 border-accent-500/20',
              ai: 'bg-ai-400/10 text-ai-400 border-ai-400/20',
              kit: 'bg-kit-50 text-kit-600 border-kit-600/20',
              success: 'bg-success-soft text-success border-success/20',
            }[item.tone]
            return (
              <Link key={item.project.id} to={item.to} className="rounded-2xl border border-border-light bg-bg-primary/50 p-4 hover:border-accent-500/25 transition-colors">
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-xl border flex items-center justify-center shrink-0 ${toneClass}`}>
                    <item.icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-3 mb-1">
                      <div className="text-[13px] font-medium text-text-main truncate">{item.title}</div>
                      <span className="text-[10px] text-text-muted shrink-0">{item.meta}</span>
                    </div>
                    <div className="text-[12px] text-text-secondary truncate mb-1">{item.project.name}</div>
                    <p className="text-[11px] text-text-muted leading-relaxed">{item.desc}</p>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-text-muted shrink-0 mt-1" />
                </div>
              </Link>
            )
          })}
        </div>
      </div>

      <div className="flex items-center justify-between mb-5">
        <span className="section-title">分析项目 · {projects.length}</span>
        <Link to="/create" className="text-[11px] font-medium text-accent-600 hover:text-accent-500 flex items-center gap-1">
          + 新建项目
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
        {projects.map((p) => {
          const tasks = getTasks(p.id)
          const done = tasks.filter((t) => getAIResult(t.id)?.submitted).length
          const pct = tasks.length > 0 ? Math.round((done / tasks.length) * 100) : 0
          return (
            <div key={p.id} className="relative group/card">
              <Link
                to={p.status === 'in_progress' ? `/materials/${p.slug}` : p.status === 'completed' ? `/report/${p.slug}` : `/tasks/${p.slug}`}
                className="card-surface rounded-[24px] card-hover overflow-hidden flex flex-col relative block"
              >
                {p.status === 'in_progress' && <div className="absolute top-0 left-4 right-4 h-[3px] rounded-b-full bg-accent-500" />}
                <div className={`p-6 flex-1 ${p.status === 'in_progress' ? 'pt-7' : ''}`}>
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-text-muted bg-white/[0.03] px-2 py-1 rounded-md">{p.category}</span>
                    {p.status === 'in_progress' && <span className="w-[6px] h-[6px] rounded-full bg-accent-500 pulse-dot" />}
                    {p.status === 'completed' && <span className="w-[6px] h-[6px] rounded-full bg-success" />}
                  </div>
                  <h3 className="text-[15px] font-semibold text-text-main mb-2 leading-snug">{p.name}</h3>
                  <p className="text-[12px] text-text-muted leading-relaxed line-clamp-2 mb-4">{p.description}</p>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-accent-500 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-[10px] font-medium text-text-muted">{done}/{tasks.length}</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-text-muted">
                    <span className="flex items-center gap-1"><Target className="w-3 h-3" />{p.competitors.length} 竞品</span>
                    <span>{p.createdAt}</span>
                  </div>
                </div>
                <div className="px-6 py-3 bg-white/[0.03]/50 border-t border-border-light flex items-center justify-between">
                  <span className="text-[11px] text-text-muted">{p.team.map((t) => roleLabels[t.role]).join(' · ')}</span>
                  <span className="text-[11px] font-medium text-accent-600 flex items-center gap-1 group-hover:gap-2 transition-all">
                    {p.status === 'in_progress' ? '进入' : p.status === 'completed' ? '查看' : '开始'}
                    <ArrowRight className="w-3 h-3" />
                  </span>
                </div>
              </Link>
              <div className="absolute top-3 right-3 flex items-center gap-1.5 opacity-0 group-hover/card:opacity-100 transition-opacity">
                <button
                  onClick={(e) => { e.preventDefault(); handleOpenEdit(p) }}
                  className="w-7 h-7 rounded-lg bg-bg-surface border border-border-light flex items-center justify-center hover:bg-white/5 cursor-pointer"
                  title="编辑项目"
                >
                  <Pencil className="w-3.5 h-3.5 text-text-muted hover:text-accent-500" />
                </button>
                <button
                  onClick={(e) => { e.preventDefault(); setDeleteId(p.id) }}
                  className="w-7 h-7 rounded-lg bg-bg-surface border border-border-light flex items-center justify-center hover:bg-red-500/10 hover:border-red-200 cursor-pointer"
                  title="删除项目"
                >
                  <Trash2 className="w-3.5 h-3.5 text-text-muted hover:text-error" />
                </button>
              </div>
            </div>
          )
        })}
      </div>

      {deleteId && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
          <div className="bg-bg-surface rounded-2xl p-6 w-[360px] shadow-xl text-center">
            <div className="w-11 h-11 rounded-xl bg-red-50 flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-5 h-5 text-error" />
            </div>
            <h3 className="text-[16px] font-medium text-text-main mb-2">确认删除项目？</h3>
            <p className="text-[13px] text-text-muted mb-6">删除后该项目的所有资料和任务卡将被永久移除。</p>
            <div className="flex items-center gap-3 justify-center">
              <button onClick={() => setDeleteId(null)} className="btn-ghost">取消</button>
              <button onClick={() => handleDelete(deleteId)} className="px-5 py-2.5 bg-error text-white text-sm font-medium rounded-xl hover:bg-red-600 transition-colors">确认删除</button>
            </div>
          </div>
        </div>
      )}

      {/* Reset data */}
      <div className="mt-12 text-center">
        <button onClick={() => setShowReset(true)} className="text-[11px] text-text-muted hover:text-accent-600 transition-colors flex items-center gap-1.5 mx-auto">
          <RotateCcw className="w-3 h-3" />恢复默认演示数据
        </button>
      </div>

      {showReset && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
          <div className="bg-bg-surface rounded-2xl p-6 w-[380px] shadow-xl text-center">
            <div className="w-11 h-11 rounded-xl bg-accent-50 flex items-center justify-center mx-auto mb-4">
              <RotateCcw className="w-5 h-5 text-accent-500" />
            </div>
            <h3 className="text-[16px] font-medium text-text-main mb-2">恢复默认演示数据？</h3>
            <p className="text-[13px] text-text-muted mb-6">将清除所有修改，恢复为初始的 3 个演示项目和完整示例数据。此操作不可撤销。</p>
            <div className="flex items-center gap-3 justify-center">
              <button onClick={() => setShowReset(false)} className="btn-ghost">取消</button>
              <button onClick={() => { resetAllData(); setProjects(getProjects()); setShowReset(false); window.location.reload() }} className="btn-primary-filled">
                确认恢复
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit project modal */}
      {editingProject && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center z-50 animate-fade-in" onClick={() => setEditingProject(null)}>
          <div className="bg-bg-surface rounded-2xl p-6 w-[480px] max-w-[90vw] shadow-2xl border border-border-default" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-[16px] font-medium text-text-main font-semibold">编辑项目信息</h3>
              <button onClick={() => setEditingProject(null)} className="p-1 rounded-lg hover:bg-white/[0.06] cursor-pointer"><X className="w-4 h-4 text-text-muted" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-[11px] font-medium text-text-muted mb-1.5 font-semibold">项目名称 *</label>
                <input
                  type="text"
                  value={projectForm.name}
                  onChange={(e) => setProjectForm({ ...projectForm, name: e.target.value })}
                  placeholder="例：618 美妆个护竞品分析"
                  className="w-full text-[13px] px-3 py-2.5 border border-border-default rounded-xl focus:outline-none focus:border-accent-400 bg-transparent text-text-main"
                  autoFocus
                />
              </div>
              
              <div>
                <label className="block text-[11px] font-medium text-text-muted mb-1.5 font-semibold">商品类目</label>
                <input
                  type="text"
                  value={projectForm.category}
                  onChange={(e) => setProjectForm({ ...projectForm, category: e.target.value })}
                  placeholder="例：个护美妆"
                  className="w-full text-[13px] px-3 py-2.5 border border-border-default rounded-xl focus:outline-none focus:border-accent-400 bg-transparent text-text-main"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-text-muted mb-1.5 font-semibold">活动场景</label>
                <input
                  type="text"
                  value={projectForm.campaign}
                  onChange={(e) => setProjectForm({ ...projectForm, campaign: e.target.value })}
                  placeholder="例：618 年中大促"
                  className="w-full text-[13px] px-3 py-2.5 border border-border-default rounded-xl focus:outline-none focus:border-accent-400 bg-transparent text-text-main"
                />
              </div>

              <div>
                <label className="block text-[11px] font-medium text-text-muted mb-1.5 font-semibold">项目描述</label>
                <textarea
                  value={projectForm.description}
                  onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })}
                  placeholder="例：针对竞品评论、参数及文案进行多维度调研..."
                  rows={3}
                  className="w-full text-[13px] px-3 py-2.5 border border-border-default rounded-xl focus:outline-none focus:border-accent-400 bg-transparent text-text-main resize-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button onClick={() => setEditingProject(null)} className="btn-ghost text-[13px] cursor-pointer">取消</button>
              <button onClick={handleSaveProject} className="btn-primary-filled text-[13px] cursor-pointer">保存修改</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
