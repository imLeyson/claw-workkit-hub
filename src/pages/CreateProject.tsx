import { useState, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowRight, ArrowLeft, Package, BookOpen, CheckCircle2, Star, GitBranch, Sparkles, Database, Target, Pencil, Lightbulb, ListChecks } from 'lucide-react'
import { roleLabels } from '../data/mock'
import { getWorkKitById, getProjects, addProject, addTask, refreshTaskMaterialLinks, incrementWorkKitReuse } from '../services/db'
import type { Project, Competitor, TaskCard, WorkKit } from '../types'
import { useToast } from '../components/Toast'
import type { Role } from '../types'

const normalSteps = ['基础信息', '参与岗位', '竞品设置']
const templateSteps = ['基础信息', '参与岗位', '活动信息']

const defaultRoles = [
  { role: 'merchandise', label: '商品', checked: true, desc: '竞品评论挖掘、痛点矩阵、产品机会判断' },
  { role: 'operations', label: '运营', checked: true, desc: '用户痛点挖掘、数据分析、竞品洞察' },
  { role: 'copywriting', label: '文案', checked: true, desc: '卖点转译、文案输出、直播话术生成' },
  { role: 'customer_service', label: '客服', checked: true, desc: 'FAQ 生成、用户应答知识库' },
  { role: 'design', label: '设计', checked: true, desc: '详情页优化、视觉层级建议' },
]

const defaultTaskTemplates: Record<Role, Omit<TaskCard, 'id' | 'projectId' | 'assignedTo' | 'inputMaterials' | 'status'>> = {
  merchandise: {
    role: 'merchandise',
    title: '竞品评论痛点矩阵',
    description: '从竞品评论和商品参数中归纳用户高频问题，形成痛点矩阵、机会点和选品建议。',
    promptPreview: '你是一位电商选品经理。请基于竞品评论和商品参数，识别TOP5用户痛点、功能机会和差异化选品建议，按频次、严重度和转化影响排序。',
    outputFormat: '痛点矩阵 · 功能机会 · 选品建议',
    judgmentCriteria: ['问题分类是否清晰', '是否有评论或参数依据', '建议是否可落地'],
    sourceTags: ['竞品评论', '商品参数'],
  },
  copywriting: {
    role: 'copywriting',
    title: '卖点文案转译',
    description: '将用户痛点和真实评论转化为详情页、直播和种草内容中的卖点表达。',
    promptPreview: '你是一位资深电商文案。请把竞品评论中的用户原话和痛点转译为可感知、可量化、可传播的卖点文案，并给出标题方向。',
    outputFormat: '卖点文案库 · 用户原话摘录 · 标题方向',
    judgmentCriteria: ['卖点是否可量化', '是否引用真实用户语言', '表达是否适合大促转化'],
    sourceTags: ['竞品评论', '商品参数', '历史文案'],
  },
  customer_service: {
    role: 'customer_service',
    title: '客服 FAQ 与风险话术',
    description: '整理售前疑虑和售后风险，生成可直接用于客服培训和详情页说明的 FAQ。',
    promptPreview: '你是一位客服培训主管。请基于用户高频问题、差评风险和客服记录，生成包含风险等级标注的客服应答模板。',
    outputFormat: '客服 FAQ · 风险话术 · 售后解释',
    judgmentCriteria: ['是否覆盖售前售后', '是否标注风险等级', '应答是否专业且口语化'],
    sourceTags: ['竞品评论', '客服记录'],
  },
  design: {
    role: 'design',
    title: '详情页信息结构优化',
    description: '根据用户关注点和痛点优先级，重排详情页模块顺序和首屏表达重点。',
    promptPreview: '你是一位电商详情页 UX 专家。请基于用户评论、历史文案和商品参数，规划详情页模块顺序、首屏信息结构和视觉表达重点。',
    outputFormat: '详情页模块建议 · 首屏信息结构 · 图示化建议',
    judgmentCriteria: ['首屏是否包含决策信息', '信息层级是否匹配用户关注热度', '是否降低决策门槛'],
    sourceTags: ['竞品评论', '商品参数', '历史文案'],
  },
  operations: {
    role: 'operations',
    title: '大促策略汇总',
    description: '汇总各岗位分析结果，判断主推策略、价格表达和核心卖点排序，输出执行清单。',
    promptPreview: '你是一位电商运营负责人。请综合商品、文案、客服和设计的分析结果，提炼本次大促主推策略、价格表达、核心卖点排序和执行清单。',
    outputFormat: '大促策略摘要 · 执行清单 · 风险提醒',
    judgmentCriteria: ['策略是否有数据支撑', '执行清单是否可落地', '是否识别关键风险'],
    sourceTags: ['竞品评论', '商品参数', '客服记录', '历史文案'],
  },
}

function buildLearningItems(workKit: WorkKit) {
  const sectionItems = workKit.sections.slice(0, 3).map((section, index) => ({
    id: `section-${index}`,
    title: section.title,
    meta: `${roleLabels[section.role]}岗任务模板`,
    desc: section.content[0]?.title || '学习该岗位的输出结构与判断口径',
    objective: `理解「${section.title}」在新项目里要复用的分析框架，以及哪些结论需要重新验证。`,
    takeaway: section.content[0]?.items?.slice(0, 3) || section.content[0]?.rows?.slice(0, 3).map((row) => row.slice(0, 3).join(' · ')) || ['识别该岗位的核心输入', '复用输出结构', '按新项目资料重新判断'],
    apply: `创建任务卡时会把该模板写入 ${roleLabels[section.role]} 岗 Prompt，并要求结合新项目资料重新判断。`,
    icon: BookOpen,
  }))
  return [
    {
      id: 'structure',
      title: '资料结构预学习',
      meta: '启动前准备',
      desc: workKit.materialStructure,
      objective: '先看清这个 Work Kit 依赖哪些资料，避免新项目启动后才发现关键输入缺失。',
      takeaway: workKit.materialStructure.split(' · ').map((item) => `准备${item}`).slice(0, 4),
      apply: '创建项目后，资料库会以这些资料类型作为导入提示，任务卡也会等待相应资料补齐。',
      icon: Database,
    },
    ...sectionItems,
    {
      id: 'feedback',
      title: '上次反馈与版本变化',
      meta: `${workKit.version} · ${workKit.versionHistory.length} 次迭代`,
      desc: workKit.feedback,
      objective: '学习团队上一次为什么修订模板，避免复用时重复踩同样的问题。',
      takeaway: [
        workKit.feedback || '暂无反馈，建议本次复用后补充效果记录',
        workKit.versionHistory[0]?.changes || '记录本次版本变化',
        `当前评分 ${workKit.rating}，复用 ${workKit.reuseCount} 次`,
      ],
      apply: '创建出的任务卡会提示团队说明“沿用/修订”的依据，便于后续再沉淀为新版 Work Kit。',
      icon: GitBranch,
    },
  ].slice(0, 5)
}

function createUniqueSlug(name: string) {
  const base = name.trim().replace(/\s+/g, '-').toLowerCase().replace(/[^a-z0-9一-鿿-]/g, '') || `project-${Date.now()}`
  const existing = new Set(getProjects().map((project) => project.slug))
  if (!existing.has(base)) return base
  let index = 2
  while (existing.has(`${base}-${index}`)) index += 1
  return `${base}-${index}`
}

export default function CreateProject() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [searchParams] = useSearchParams()
  const fromArchive = searchParams.get('from') === 'archive'
  const kitId = searchParams.get('kit')

  const workKit = useMemo(
    () => (fromArchive && kitId ? getWorkKitById(kitId) : null),
    [fromArchive, kitId],
  )

  const initRoles = useMemo(() => {
    if (!workKit) return defaultRoles
    return defaultRoles.map((r) => ({
      ...r,
      checked: workKit.includedRoles.includes(r.role as Role),
    }))
  }, [workKit])

  const steps = workKit ? templateSteps : normalSteps
  const learningItems = useMemo(() => (workKit ? buildLearningItems(workKit) : []), [workKit])

  const [step, setStep] = useState(0)
  const [name, setName] = useState(workKit ? workKit.name.replace(' Work Kit', '') : '')
  const [description, setDescription] = useState(workKit ? `基于「${workKit.name}」模板创建。${workKit.description}` : '')
  const [competitorInput, setCompetitorInput] = useState('')
  const [competitors, setCompetitors] = useState<string[]>([])
  const [roles, setRoles] = useState(initRoles)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [campaign, setCampaign] = useState('')
  const [category, setCategory] = useState('')
  const [campaignDate, setCampaignDate] = useState('')
  const [learnedIds, setLearnedIds] = useState<string[]>(() => (learningItems[0] ? [learningItems[0].id] : []))
  const [activeLearningId, setActiveLearningId] = useState(() => learningItems[0]?.id || '')
  const [learningNotes, setLearningNotes] = useState<Record<string, string>>({})
  const learnedCount = learnedIds.length
  const activeLearningItem = learningItems.find((item) => item.id === activeLearningId) || learningItems[0]
  const learningPercent = learningItems.length ? Math.round((learnedCount / learningItems.length) * 100) : 0
  const learnedItems = learningItems.filter((item) => learnedIds.includes(item.id))
  const learningSummary = learnedItems.map((item) => {
    const note = learningNotes[item.id]?.trim()
    return `${item.title}：${note || item.apply}`
  })
  const noteCount = Object.values(learningNotes).filter((note) => note.trim()).length
  const promptInjectionPreview = learnedItems.slice(0, 3).map((item) => {
    const note = learningNotes[item.id]?.trim()
    return note ? `${item.title}：${note}` : `${item.title}：${item.apply}`
  })
  const plannedTaskCount = workKit
    ? workKit.sections.filter((section) => roles.some((role) => role.checked && role.role === section.role)).length
    : roles.filter((role) => role.checked).length
  const selectedRoleCount = roles.filter((role) => role.checked).length
  const learningReadiness = workKit
    ? [
        { label: '已学习', value: `${learnedCount}/${learningItems.length}`, desc: learningPercent >= 60 ? '可进入项目创建' : '建议继续学习关键项' },
        { label: '学习笔记', value: `${noteCount} 条`, desc: noteCount ? '会写入任务 Prompt' : '可补充沿用/避坑说明' },
        { label: 'Prompt 继承', value: `${plannedTaskCount} 张`, desc: '任务卡会带上学习记录' },
      ]
    : []
  const launchAssets = workKit
    ? [
        { label: '继承任务模板', value: `${plannedTaskCount} 张`, desc: '从历史 Work Kit 复用岗位任务结构' },
        { label: '启动前学习', value: `${learnedCount}/${learningItems.length}`, desc: '记录已学习内容并写入任务 Prompt' },
        { label: '预计节省', value: `${Math.min(70, 30 + learnedCount * 8)}%`, desc: '减少重复定义资料、Prompt 与输出格式' },
        { label: '后续沉淀', value: '新版 Work Kit', desc: '本次复用结果可回流为模板迭代' },
      ]
    : [
        { label: '岗位任务', value: `${selectedRoleCount} 张`, desc: '创建后自动生成岗位分析卡' },
        { label: '资料结构', value: '待导入', desc: '资料库会沉淀评论、参数、客服和文案结构' },
        { label: '协作闭环', value: '报告复核', desc: '岗位结果汇总为可编辑策略报告' },
        { label: '最终资产', value: 'Work Kit', desc: '完成验证后保存为下一次可复用工作包' },
      ]

  const toggleLearned = (id: string) => {
    setLearnedIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])
    setActiveLearningId(id)
  }

  const addCompetitor = () => {
    const trimmed = competitorInput.trim()
    if (trimmed && !competitors.includes(trimmed)) {
      setCompetitors([...competitors, trimmed])
      setCompetitorInput('')
      if (errors.competitors) setErrors((prev) => { const { competitors: _, ...rest } = prev; return rest })
    }
  }

  const goToErrorStep = (errs: Record<string, string>) => {
    if (errs.name) return 0
    if (errs.roles) return 1
    if (errs.competitors || errs.campaign) return 2
    return 0
  }

  const validateStep = (s: number): boolean => {
    const errs: Record<string, string> = {}
    if (s === 0 && name.trim().length < 2) errs.name = '项目名称至少需要 2 个字符'
    if (s === 1 && !roles.some((r) => r.checked)) errs.roles = '请至少选择 1 个参与岗位'
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const handleNext = () => {
    if (validateStep(step)) setStep(step + 1)
  }

  const handleCreate = async () => {
    const errs: Record<string, string> = {}
    if (name.trim().length < 2) errs.name = '项目名称至少需要 2 个字符'
    if (!roles.some((r) => r.checked)) errs.roles = '请至少选择 1 个参与岗位'
    if (!workKit && competitors.length === 0) errs.competitors = '请至少添加 1 个竞品'
    if (workKit && campaign.trim().length < 2) errs.campaign = '请填写活动名称'
    if (Object.keys(errs).length === 0) {
      setErrors({})
      // Build real project
      const id = 'p' + Date.now()
      const slug = createUniqueSlug(name)
      const comps: Competitor[] = competitors.map((c) => ({
        name: c, brand: c, platform: '天猫', price: '¥0', reviewCount: 0, rating: 0, topIssues: [],
      }))
      const team = roles.filter((r) => r.checked).map((r) => ({
        name: roleLabels[r.role] + '负责人', role: r.role,
      }))
      const newProject: Project = {
        id, slug, name: name.trim(), description,
        category: category || '未分类', campaign: campaign || name.trim(),
        competitors: comps, status: 'in_progress',
        createdAt: new Date().toISOString().split('T')[0],
        team: team as any,
      }
      await addProject(newProject)
      if (workKit) {
        const records = JSON.parse(localStorage.getItem('promokit_prelearning_records') || '[]')
        records.unshift({
          projectId: id,
          projectName: name.trim(),
          workKitId: workKit.id,
          workKitName: workKit.name,
          learnedIds,
          notes: learningNotes,
          summary: learningSummary,
          plannedTaskCount,
          learningPercent,
          estimatedSaving: Math.min(70, 30 + learnedCount * 8),
          createdAt: new Date().toISOString(),
        })
        localStorage.setItem('promokit_prelearning_records', JSON.stringify(records.slice(0, 30)))
      }
      const selectedRoles = roles.filter((r) => r.checked).map((r) => r.role as Role)
      let createdTaskCount = 0

      // Clone task cards from template
      if (workKit) {
        incrementWorkKitReuse(workKit.id)
        for (const section of workKit.sections) {
          if (!selectedRoles.includes(section.role)) continue
          const firstContent = section.content[0]
          const taskCard: TaskCard = {
            id: 't' + Date.now() + Math.random().toString(36).slice(2, 6),
            projectId: id,
            role: section.role,
            title: section.title,
            description: `基于「${workKit.name}」模板生成。已完成 ${learnedCount}/${learningItems.length} 个启动前学习项，可继续在工作台关联知识库。`,
            status: 'ready',
            assignedTo: roleLabels[section.role] + '负责人',
            inputMaterials: [],
            promptPreview: [
              `你是一位${roleLabels[section.role]}岗位专家。请沿用「${workKit.name}」中的「${section.title}」流程。`,
              firstContent?.items?.length ? `参考模板要点：${firstContent.items.slice(0, 4).join('；')}` : '',
              firstContent?.rows?.length ? `参考矩阵维度：${firstContent.headers?.join('、') || '要素、判断、动作'}` : '',
              learningSummary.length ? `启动前学习记录：${learningSummary.join('｜')}` : '',
              `结合新项目的活动、类目和竞品资料重新判断，不直接照搬历史结论。`,
            ].filter(Boolean).join('\n'),
            outputFormat: firstContent?.title || '结构化分析结果',
            judgmentCriteria: ['是否结合新项目资料重新判断', '是否说明沿用与修订依据', '是否可沉淀为新的知识项'],
            sourceTags: workKit.tags.slice(0, 3),
          }
          addTask(taskCard)
          createdTaskCount += 1
        }
      } else {
        for (const role of selectedRoles) {
          const template = defaultTaskTemplates[role]
          const taskCard: TaskCard = {
            ...template,
            id: 't' + Date.now() + Math.random().toString(36).slice(2, 6),
            projectId: id,
            status: 'pending',
            assignedTo: roleLabels[role] + '负责人',
            inputMaterials: [],
          }
          addTask(taskCard)
          createdTaskCount += 1
        }
      }
      refreshTaskMaterialLinks(id)
      const msg = workKit
        ? `基于「${workKit.name}」模板创建成功 · ${createdTaskCount} 张任务卡已生成`
        : `项目创建成功 · ${createdTaskCount} 张岗位任务卡已生成`
      showToast(msg, 'success')
      navigate(`/materials/${slug}`)
    } else {
      setErrors(errs)
      setStep(goToErrorStep(errs))
      showToast('请完善表单信息', 'error')
    }
  }

  return (
    <div className={workKit ? 'max-w-6xl' : 'max-w-xl'}>
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-[6px] h-[6px] rounded-full bg-accent-500" />
          <span className="section-title">{workKit ? 'WORK KIT LAUNCH · 启动前学习' : 'NEW PROJECT · 项目配置'}</span>
        </div>
        <h1 className="text-[32px] font-light tracking-[-0.02em] text-text-main mb-3">
          {workKit ? `基于模板创建项目` : '创建新项目'}
        </h1>
        <p className="text-[14px] text-text-secondary max-w-xl leading-relaxed">
          {workKit
            ? `复用「${workKit.name}」— 先学习成功案例，再带着模板任务进入新项目。`
            : '配置竞品分析项目，系统自动生成各岗位 AI 任务卡。'}
        </p>
      </div>

      <div className="mb-8 brand-goal-panel p-5">
        <div className="relative grid lg:grid-cols-[0.9fr_1.1fr] gap-5 items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-lg border border-border-default bg-bg-surface/80 px-3 py-1 text-[11px] text-text-muted mb-4">
              <GitBranch className="w-3.5 h-3.5" />
              LAUNCH SYSTEM
            </div>
            <h2 className="text-[22px] font-medium tracking-[-0.02em] text-text-main mb-2">
              {workKit ? '从历史成功案例启动新项目' : '从项目创建开始规划资产沉淀'}
            </h2>
            <p className="text-[13px] text-text-secondary leading-relaxed max-w-xl">
              {workKit
                ? '复用不是复制旧结论，而是继承资料结构、任务框架和验证经验，再结合新活动重新判断。'
                : '每个新项目都会沿着资料、任务、工作台、报告、资产库的链路推进，最终沉淀成团队下一次能直接学习的 Work Kit。'}
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {['清晰配置', '可操作任务', '可沉淀资产'].map((item) => (
                <span key={item} className="rounded-lg border border-border-light bg-bg-surface/75 px-3 py-1.5 text-[11px] font-medium text-text-secondary">
                  {item}
                </span>
              ))}
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            {launchAssets.map((item) => (
              <div key={item.label} className="rounded-xl border border-border-light bg-bg-surface/75 p-4">
                <div className="text-[22px] font-light text-text-main leading-none mb-2">{item.value}</div>
                <div className="text-[12px] font-medium text-text-main">{item.label}</div>
                <div className="text-[10px] text-text-muted leading-relaxed mt-1">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Template info card (persistent in template mode) */}
      {workKit && (
        <div className="grid grid-cols-1 xl:grid-cols-[1.05fr_0.95fr] gap-6 mb-10">
          <div className="data-panel p-5">
            <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl bg-accent-50 flex items-center justify-center shrink-0">
                <Package className="w-5 h-5 text-accent-500" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h2 className="text-[18px] font-medium text-text-main truncate">{workKit.name}</h2>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 font-semibold flex items-center gap-1 shrink-0">
                    <Star className="w-3 h-3 fill-amber-400" />{workKit.rating}
                  </span>
                </div>
                <p className="text-[12px] text-text-muted leading-relaxed">{workKit.description}</p>
              </div>
            </div>
            <div className="grid grid-cols-4 gap-3 mb-6">
              {[
                ['模板版本', workKit.version],
                ['复用次数', `${workKit.reuseCount} 次`],
                ['岗位', `${workKit.includedRoles.length} 个`],
                ['任务', `${workKit.sections.length} 个`],
              ].map(([label, value]) => (
                <div key={label} className="data-metric p-3 text-center">
                  <div className="text-[18px] font-light text-text-main leading-none mb-1">{value}</div>
                  <div className="text-[10px] text-text-muted">{label}</div>
                </div>
              ))}
            </div>
            <div className="space-y-3 text-[12px]">
              <div className="flex items-start gap-3">
                <Database className="w-4 h-4 text-accent-500 mt-0.5 shrink-0" />
                <div>
                  <div className="text-text-muted mb-0.5">资料结构</div>
                  <div className="text-text-secondary leading-relaxed">{workKit.materialStructure}</div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Sparkles className="w-4 h-4 text-accent-500 mt-0.5 shrink-0" />
                <div>
                  <div className="text-text-muted mb-0.5">适用场景</div>
                  <div className="text-text-secondary leading-relaxed">{workKit.scenario}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="action-panel p-5">
            <div className="flex items-center justify-between mb-5">
              <div>
                <div className="text-[11px] font-semibold text-accent-600 uppercase tracking-[0.08em] mb-1">Pre-learning Pack</div>
                <h2 className="text-[18px] font-medium text-text-main">启动前学习包</h2>
              </div>
              <div className="w-16 h-16 rounded-xl bg-accent-50 flex flex-col items-center justify-center">
                <span className="text-[19px] font-light text-accent-600 leading-none">{learningPercent}%</span>
                <span className="text-[9px] text-accent-500 mt-1">{learnedCount}/{learningItems.length}</span>
              </div>
            </div>

            <div className="h-2 rounded-full bg-bg-primary overflow-hidden mb-5">
              <div className="h-full rounded-full bg-accent-500 transition-all" style={{ width: `${learningPercent}%` }} />
            </div>

            <div className="grid grid-cols-3 gap-2 mb-5">
              {learningReadiness.map((item) => (
                <div key={item.label} className="data-metric p-3">
                  <div className="text-[16px] font-light text-text-main leading-none">{item.value}</div>
                  <div className="text-[10px] font-medium text-text-main mt-1">{item.label}</div>
                  <div className="text-[9px] text-text-muted leading-snug mt-1">{item.desc}</div>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-[0.78fr_1.22fr] gap-4">
              <div className="space-y-2">
                {learningItems.map((item, index) => {
                  const Icon = item.icon
                  const learned = learnedIds.includes(item.id)
                  const active = activeLearningItem?.id === item.id
                  return (
                    <button
                      key={item.id}
                      onClick={() => setActiveLearningId(item.id)}
                      className={`w-full rounded-xl border p-3 text-left transition-all ${
                        active ? 'border-accent-500/35 bg-accent-500/[0.06]' : 'border-border-light bg-bg-primary/55 hover:border-accent-500/20'
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 ${learned ? 'bg-accent-500 text-white' : 'bg-bg-surface text-text-muted'}`}>
                          {learned ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Icon className="w-3.5 h-3.5" />}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="text-[10px] font-mono text-accent-600">{String(index + 1).padStart(2, '0')}</span>
                            <span className="text-[12px] font-medium text-text-main truncate">{item.title}</span>
                          </div>
                          <p className="text-[10px] text-text-muted truncate">{item.meta}</p>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>

              {activeLearningItem && (
                <div className="rounded-xl border border-border-light bg-bg-primary/60 p-4 min-h-[360px] flex flex-col">
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div>
                      <div className="text-[10px] text-text-muted mb-1">{activeLearningItem.meta}</div>
                      <h3 className="text-[16px] font-medium text-text-main">{activeLearningItem.title}</h3>
                    </div>
                    <button
                      onClick={() => toggleLearned(activeLearningItem.id)}
                      className={`text-[11px] px-3 py-1.5 rounded-xl border transition-colors ${
                        learnedIds.includes(activeLearningItem.id)
                          ? 'border-success/30 bg-success-soft text-success'
                          : 'border-accent-500/25 bg-accent-500/10 text-accent-600'
                      }`}
                    >
                      {learnedIds.includes(activeLearningItem.id) ? '已学会' : '标记学会'}
                    </button>
                  </div>

                  <div className="space-y-4 flex-1">
                    <div className="rounded-xl bg-bg-surface border border-border-light p-3">
                      <div className="flex items-center gap-2 text-[11px] font-semibold text-accent-600 mb-2">
                        <Target className="w-3.5 h-3.5" />学习目标
                      </div>
                      <p className="text-[12px] text-text-secondary leading-relaxed">{activeLearningItem.objective}</p>
                    </div>

                    <div className="rounded-xl bg-bg-surface border border-border-light p-3">
                      <div className="flex items-center gap-2 text-[11px] font-semibold text-ai-400 mb-2">
                        <Lightbulb className="w-3.5 h-3.5" />关键要点
                      </div>
                      <ul className="space-y-1.5">
                        {activeLearningItem.takeaway.map((item, index) => (
                          <li key={index} className="text-[12px] text-text-secondary leading-relaxed flex gap-2">
                            <span className="text-accent-500 mt-0.5">•</span>{item}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="rounded-xl bg-bg-surface border border-border-light p-3">
                      <div className="flex items-center gap-2 text-[11px] font-semibold text-kit-600 mb-2">
                        <ListChecks className="w-3.5 h-3.5" />如何带入新项目
                      </div>
                      <p className="text-[12px] text-text-secondary leading-relaxed">{activeLearningItem.apply}</p>
                    </div>

                    <div className="rounded-xl bg-accent-500/[0.04] border border-accent-500/20 p-3">
                      <div className="flex items-center gap-2 text-[11px] font-semibold text-accent-600 mb-2">
                        <Sparkles className="w-3.5 h-3.5" />将写入任务卡
                      </div>
                      <p className="text-[12px] text-text-secondary leading-relaxed">
                        {learnedIds.includes(activeLearningItem.id)
                          ? (learningNotes[activeLearningItem.id]?.trim() || activeLearningItem.apply)
                          : '标记学会后，这条学习记录会进入新项目任务卡 Prompt，提醒对应岗位说明沿用与修订依据。'}
                      </p>
                    </div>

                    <div>
                      <label className="flex items-center gap-2 text-[11px] font-semibold text-text-muted mb-2">
                        <Pencil className="w-3.5 h-3.5" />我的学习笔记
                      </label>
                      <textarea
                        value={learningNotes[activeLearningItem.id] || ''}
                        onChange={(e) => setLearningNotes((prev) => ({ ...prev, [activeLearningItem.id]: e.target.value }))}
                        rows={3}
                        placeholder="记录本次新项目要沿用什么、要避免什么、需要补充哪些资料..."
                        className="w-full bg-bg-surface border border-border-default rounded-xl p-3 text-[12px] text-text-main leading-relaxed resize-none focus:outline-none focus:border-accent-400"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className={workKit ? 'grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-8 items-start' : ''}>
        {/* Step dots */}
        <div className={workKit ? 'card-surface rounded-[24px] p-4 sticky top-6' : 'flex items-center gap-3 mb-12'}>
          {steps.map((label, i) => (
            <div key={label} className={workKit ? 'flex items-center gap-3 py-3' : 'flex items-center gap-3'}>
              <button
                onClick={() => { if (i < step) setStep(i) }}
                className={`w-[10px] h-[10px] rounded-full transition-all ${
                  i === step ? 'bg-accent-500 scale-125' : i < step ? 'bg-accent-200' : 'bg-gray-200'
                }`}
              />
              <span className={`text-[12px] transition-colors ${i === step ? 'text-text-main font-medium' : 'text-text-muted'}`}>
                {label}
              </span>
              {!workKit && i < steps.length - 1 && <div className="w-6 h-px bg-border-default" />}
            </div>
          ))}
          {workKit && (
            <div className="mt-4 rounded-2xl bg-bg-primary/70 border border-border-light p-3">
              <div className="text-[10px] text-text-muted mb-1">创建后将自动生成</div>
              <div className="text-[18px] font-light text-text-main leading-none">{plannedTaskCount} 张任务卡</div>
              <div className="text-[11px] text-accent-600 mt-2">已学习 {learnedCount} 个模板知识项</div>
            </div>
          )}
        </div>

        <div>
          {/* Form */}
          <div className="mb-12 min-h-[200px]">
        {step === 0 && (
          <div className="space-y-8">
            <div>
              <label className="block text-[12px] font-medium uppercase tracking-[0.08em] text-text-muted mb-3">项目名称</label>
              <input
                type="text"
                value={name}
                onChange={(e) => { setName(e.target.value); if (errors.name) setErrors((prev) => { const { name: _, ...rest } = prev; return rest }) }}
                placeholder="例：618 美妆个护竞品分析"
                className="input-underline"
              />
              {errors.name && <p className="text-[12px] text-error mt-2">{errors.name}</p>}
            </div>
            <div>
              <label className="block text-[12px] font-medium uppercase tracking-[0.08em] text-text-muted mb-3">描述（选填）</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={2}
                placeholder="描述本次分析的目标和预期输出..."
                className="input-underline resize-none"
              />
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-1">
            <label className="block text-[12px] font-medium uppercase tracking-[0.08em] text-text-muted mb-5">参与岗位</label>
            {errors.roles && <p className="text-[12px] text-error mb-4">{errors.roles}</p>}
            {roles.map((r) => (
              <label key={r.role} className="flex items-center gap-4 py-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={r.checked}
                  onChange={() => { setRoles((prev) => prev.map((x) => x.role === r.role ? { ...x, checked: !x.checked } : x)); if (errors.roles) setErrors((prev) => { const { roles: _, ...rest } = prev; return rest }) }}
                  className="w-[18px] h-[18px] rounded-[5px] accent-accent-500"
                />
                <div className="flex-1">
                  <div className="text-[14px] text-text-main group-hover:text-accent-600 transition-colors">{r.label}</div>
                  <div className="text-[12px] text-text-muted mt-0.5">{r.desc}</div>
                </div>
              </label>
            ))}
          </div>
        )}

        {step === 2 && !workKit && (
          <div className="space-y-6">
            <label className="block text-[12px] font-medium uppercase tracking-[0.08em] text-text-muted mb-2">竞品品牌</label>
            {errors.competitors && <p className="text-[12px] text-error mb-2">{errors.competitors}</p>}
            <div className="flex gap-3">
              <input
                type="text"
                value={competitorInput}
                onChange={(e) => { setCompetitorInput(e.target.value); if (errors.competitors) setErrors((prev) => { const { competitors: _, ...rest } = prev; return rest }) }}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCompetitor() } }}
                placeholder="输入竞品品牌名称"
                className="input-underline flex-1"
              />
              <button type="button" onClick={addCompetitor} className="btn-ghost shrink-0">添加</button>
            </div>
            {competitors.length > 0 && (
              <div className="space-y-2 mt-4">
                {competitors.map((c) => (
                  <div key={c} className="flex items-center justify-between py-3 border-b border-border-light text-[14px] text-text-main">
                    {c}
                    <button onClick={() => setCompetitors(competitors.filter((x) => x !== c))} className="text-text-muted hover:text-error transition-colors text-lg">×</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {step === 2 && workKit && (
          <div className="space-y-8">
            <div className="rounded-[24px] border border-accent-500/20 bg-accent-500/[0.04] p-5">
              <div className="flex items-start justify-between gap-4 mb-4">
                <div>
                  <div className="text-[11px] font-semibold text-accent-600 uppercase tracking-[0.08em] mb-1">Launch Handoff</div>
                  <h3 className="text-[16px] font-medium text-text-main">启动前继承摘要</h3>
                  <p className="text-[12px] text-text-secondary leading-relaxed mt-1">
                    模板已预设 {workKit.includedRoles.length} 个岗位角色、{workKit.sections.length} 个任务模板和资料结构。创建后会把学习记录写入对应任务卡。
                  </p>
                </div>
                <div className="w-14 h-14 rounded-2xl bg-bg-surface border border-border-light flex flex-col items-center justify-center shrink-0">
                  <span className="text-[18px] font-light text-accent-600 leading-none">{learningPercent}%</span>
                  <span className="text-[9px] text-text-muted mt-1">学习度</span>
                </div>
              </div>
              <div className="grid sm:grid-cols-3 gap-2 mb-4">
                {[
                  ['任务卡', `${plannedTaskCount} 张`],
                  ['学习记录', `${learnedCount} 条`],
                  ['笔记', `${noteCount} 条`],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-2xl border border-border-light bg-bg-surface/80 p-3">
                    <div className="text-[16px] font-light text-text-main leading-none">{value}</div>
                    <div className="text-[10px] text-text-muted mt-1">{label}</div>
                  </div>
                ))}
              </div>
              <div className="rounded-2xl bg-bg-surface/80 border border-border-light p-3">
                <div className="flex items-center gap-2 text-[11px] font-semibold text-text-main mb-2">
                  <Sparkles className="w-3.5 h-3.5 text-accent-500" />Prompt 注入预览
                </div>
                {promptInjectionPreview.length > 0 ? (
                  <div className="space-y-1.5">
                    {promptInjectionPreview.map((item) => (
                      <p key={item} className="text-[11px] text-text-secondary leading-relaxed line-clamp-2">{item}</p>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-text-muted leading-relaxed">还没有标记学习项。建议至少学习资料结构与一个岗位任务，创建后的任务卡会更具体。</p>
                )}
              </div>
            </div>
            {errors.campaign && <p className="text-[12px] text-error">{errors.campaign}</p>}
            <div>
              <label className="block text-[12px] font-medium uppercase tracking-[0.08em] text-text-muted mb-3">活动名称 *</label>
              <input
                type="text"
                value={campaign}
                onChange={(e) => { setCampaign(e.target.value); if (errors.campaign) setErrors((prev) => { const { campaign: _, ...rest } = prev; return rest }) }}
                placeholder="例：618 年中大促"
                className="input-underline"
              />
            </div>
            <div>
              <label className="block text-[12px] font-medium uppercase tracking-[0.08em] text-text-muted mb-3">商品类目（选填）</label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="例：个护小家电"
                className="input-underline"
              />
            </div>
            <div>
              <label className="block text-[12px] font-medium uppercase tracking-[0.08em] text-text-muted mb-3">活动周期（选填）</label>
              <input
                type="text"
                value={campaignDate}
                onChange={(e) => setCampaignDate(e.target.value)}
                placeholder="例：2026-06-01 ~ 2026-06-18"
                className="input-underline"
              />
            </div>
          </div>
        )}
      </div>

          {/* Navigation */}
          <div className="flex items-center justify-between">
            <button onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0} className="btn-ghost disabled:opacity-20">
              <ArrowLeft className="w-4 h-4" />
              上一步
            </button>
            {step < steps.length - 1 ? (
              <button onClick={handleNext} className="btn-primary">
                下一步
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button onClick={handleCreate} className="btn-primary-filled">
                创建项目
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
