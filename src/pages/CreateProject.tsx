import { useState, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowRight, ArrowLeft, Package } from 'lucide-react'
import { roleLabels } from '../data/mock'
import { getWorkKitById, addProject } from '../services/db'
import { updateTask } from '../services/db'
import type { Project, Competitor, TaskCard } from '../types'
import { useToast } from '../components/Toast'
import type { Role } from '../types'

const normalSteps = ['基础信息', '参与岗位', '竞品设置']
const templateSteps = ['基础信息', '参与岗位', '活动信息']

const defaultRoles = [
  { role: 'operations', label: '运营', checked: true, desc: '用户痛点挖掘、数据分析、竞品洞察' },
  { role: 'copywriting', label: '文案', checked: true, desc: '卖点转译、文案输出、直播话术生成' },
  { role: 'customer_service', label: '客服', checked: true, desc: 'FAQ 生成、用户应答知识库' },
  { role: 'design', label: '设计', checked: true, desc: '详情页优化、视觉层级建议' },
]

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
      const slug = name.trim().replace(/\s+/g, '-').toLowerCase().replace(/[^a-z0-9一-鿿-]/g, '')
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
      // Clone task cards from template
      if (workKit) {
        const selectedRoles = roles.filter((r) => r.checked).map((r) => r.role)
        for (const section of workKit.sections) {
          if (!selectedRoles.includes(section.role)) continue
          const taskCard: TaskCard = {
            id: 't' + Date.now() + Math.random().toString(36).slice(2, 6),
            projectId: id,
            role: section.role,
            title: section.title,
            description: `基于「${workKit.name}」模板生成`,
            status: 'ready',
            assignedTo: roleLabels[section.role] + '负责人',
            inputMaterials: [],
            promptPreview: section.content.map((c) => c.title).join('；'),
            outputFormat: '',
            judgmentCriteria: [],
            sourceTags: workKit.tags.slice(0, 2),
          }
          updateTask(taskCard)
        }
      }
      const msg = workKit
        ? `基于「${workKit.name}」模板创建成功 · ${workKit.sections.length} 张任务卡已生成`
        : '项目创建成功'
      showToast(msg, 'success')
      navigate(`/materials/${slug}`)
    } else {
      setErrors(errs)
      setStep(goToErrorStep(errs))
      showToast('请完善表单信息', 'error')
    }
  }

  return (
    <div className="max-w-xl">
      {/* Header */}
      <h1 className="text-[32px] font-light tracking-[-0.02em] text-text-main mb-3">
        {workKit ? `基于模板创建项目` : '创建新项目'}
      </h1>
      <p className="text-[14px] text-text-secondary mb-4 leading-relaxed">
        {workKit
          ? `复用「${workKit.name}」— 岗位角色、资料结构和分析流程已自动预填。`
          : '配置竞品分析项目，系统自动生成各岗位 AI 任务卡。'}
      </p>

      {/* Template info card (persistent in template mode) */}
      {workKit && (
        <div className="card-surface rounded-[20px] p-5 mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-xl bg-accent-50 flex items-center justify-center">
              <Package className="w-4.5 h-4.5 text-accent-500" />
            </div>
            <div>
              <div className="text-[13px] font-medium text-text-main">{workKit.name}</div>
              <div className="text-[11px] text-text-muted">{workKit.version} · 复用 {workKit.reuseCount} 次 · {workKit.includedRoles.length} 个岗位</div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3 text-[12px]">
            <div className="bg-gray-50 rounded-xl p-3">
              <div className="text-text-muted mb-0.5">资料结构</div>
              <div className="text-text-secondary leading-snug">{workKit.materialStructure}</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <div className="text-text-muted mb-0.5">包含岗位</div>
              <div className="text-text-secondary">{workKit.includedRoles.map((r) => roleLabels[r]).join('、')}</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <div className="text-text-muted mb-0.5">适用场景</div>
              <div className="text-text-secondary">{workKit.scenario}</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-3">
              <div className="text-text-muted mb-0.5">任务模板</div>
              <div className="text-text-secondary">{workKit.sections.length} 个任务</div>
            </div>
          </div>
        </div>
      )}

      {/* Step dots */}
      <div className="flex items-center gap-3 mb-12">
        {steps.map((label, i) => (
          <div key={label} className="flex items-center gap-3">
            <button
              onClick={() => { if (i < step) setStep(i) }}
              className={`w-[10px] h-[10px] rounded-full transition-all ${
                i === step ? 'bg-accent-500 scale-125' : i < step ? 'bg-accent-200' : 'bg-gray-200'
              }`}
            />
            <span className={`text-[12px] transition-colors ${i === step ? 'text-text-main font-medium' : 'text-text-muted'}`}>
              {label}
            </span>
            {i < steps.length - 1 && <div className="w-6 h-px bg-border-default" />}
          </div>
        ))}
      </div>

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
            <p className="text-[13px] text-text-secondary leading-relaxed bg-accent-50/30 rounded-xl p-4">
              模板已预设 {workKit.includedRoles.length} 个岗位角色、{workKit.sections.length} 个任务模板和资料结构。你只需补充活动信息即可启动项目。
            </p>
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
  )
}
