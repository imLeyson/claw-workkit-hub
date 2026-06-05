import { useState, useMemo } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowRight, ArrowLeft, Package } from 'lucide-react'
import PageHeader from '../components/PageHeader'
import SectionCard from '../components/SectionCard'
import { mockWorkKits, roleLabels } from '../data/mock'
import { useToast } from '../components/Toast'
import type { Role } from '../types'

const steps = [
  { num: 1, label: '基础信息' },
  { num: 2, label: '参与岗位' },
  { num: 3, label: '竞品设置' },
]

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
    () => (fromArchive && kitId ? mockWorkKits.find((k) => k.id === kitId) : null),
    [fromArchive, kitId],
  )

  // Pre-fill role selections from work kit
  const initRoles = useMemo(() => {
    if (!workKit) return defaultRoles
    return defaultRoles.map((r) => ({
      ...r,
      checked: workKit.includedRoles.includes(r.role as Role),
    }))
  }, [workKit])

  const [step, setStep] = useState(0)
  const [name, setName] = useState(workKit ? `618 ${workKit.name.replace(' Work Kit', '')}` : '')
  const [description, setDescription] = useState(workKit ? `基于「${workKit.name}」模板创建。${workKit.description}` : '')
  const [competitorInput, setCompetitorInput] = useState('')
  const [competitors, setCompetitors] = useState<string[]>([])
  const [roles, setRoles] = useState(initRoles)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const addCompetitor = () => {
    const trimmed = competitorInput.trim()
    if (trimmed && !competitors.includes(trimmed)) {
      setCompetitors([...competitors, trimmed])
      setCompetitorInput('')
    }
  }

  const goToErrorStep = (errs: Record<string, string>) => {
    if (errs.name) return 0
    if (errs.roles) return 1
    if (errs.competitors) return 2
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

  const handleCreate = () => {
    const errs: Record<string, string> = {}
    if (name.trim().length < 2) errs.name = '项目名称至少需要 2 个字符'
    if (!roles.some((r) => r.checked)) errs.roles = '请至少选择 1 个参与岗位'
    if (competitors.length === 0) errs.competitors = '请至少添加 1 个竞品'
    if (Object.keys(errs).length === 0) {
      setErrors({})
      showToast('项目创建成功，跳转到资料库', 'success')
      navigate('/materials/p1')
    } else {
      setErrors(errs)
      setStep(goToErrorStep(errs))
      showToast('请完善表单信息', 'error')
    }
  }

  return (
    <div className="max-w-2xl">
      <PageHeader
        title={workKit ? '基于模板创建项目' : '创建新项目'}
        description={workKit ? `正在复用「${workKit.name}」模板，角色和资料结构已预填。` : '配置竞品分析项目，系统将根据资料自动生成各岗位 AI 任务卡。'}
      />

      {workKit && (
        <div className="card-surface rounded-2xl p-4 mb-6 border-kit-200 bg-kit-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-kit-100 flex items-center justify-center shrink-0">
              <Package className="w-5 h-5 text-kit-600" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium text-text-main">基于 Work Kit 模板创建</div>
              <div className="text-xs text-text-muted mt-0.5">
                模板「{workKit.name}」v{workKit.version} — 已预填 {workKit.includedRoles.map((r) => roleLabels[r]).join('、')} 岗位，复用 {workKit.reuseCount} 次
              </div>
            </div>
            <button
              onClick={() => navigate('/archive')}
              className="text-xs text-text-muted hover:text-text-secondary transition-colors"
            >
              返回资产库
            </button>
          </div>
        </div>
      )}

      {/* 步骤指示器 */}
      <div className="flex items-center gap-2 mb-8">
        {steps.map((s, i) => (
          <div key={s.num} className="flex items-center gap-2">
            <div
              className={`w-8 h-8 rounded-xl flex items-center justify-center text-sm font-semibold transition-all ${
                i < step
                  ? 'bg-success text-white'
                  : i <= step
                    ? 'bg-ai-600 text-white'
                    : 'bg-gray-100 text-gray-400'
              }`}
            >
              {i < step ? '✓' : s.num}
            </div>
            <span className={`text-sm font-medium ${i <= step ? 'text-text-main' : 'text-text-muted'}`}>
              {s.label}
            </span>
            {i < steps.length - 1 && <div className="w-8 h-px bg-border-default mx-1" />}
          </div>
        ))}
      </div>

      {/* 表单内容 */}
      <SectionCard className="mb-6">
        {step === 0 && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-main mb-1.5">项目名称</label>
              <input
                type="text"
                value={name}
                onChange={(e) => { setName(e.target.value); if (errors.name) setErrors((prev) => { const { name: _, ...rest } = prev; return rest }) }}
                placeholder="例：618 美妆个护竞品分析"
                className={`w-full px-4 py-2.5 border rounded-xl text-sm text-text-main placeholder:text-text-placeholder focus:outline-none focus:ring-2 focus:ring-ai-500/20 focus:border-ai-400 transition-all ${errors.name ? 'border-red-300 bg-red-50/30' : 'border-border-default'}`}
              />
              {errors.name && <p className="text-xs text-error mt-1.5">{errors.name}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-text-main mb-1.5">项目描述</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="描述本次分析的目标、范围和预期输出..."
                className="w-full px-4 py-2.5 border border-border-default rounded-xl text-sm text-text-main placeholder:text-text-placeholder focus:outline-none focus:ring-2 focus:ring-ai-500/20 focus:border-ai-400 transition-all resize-none"
              />
            </div>
          </div>
        )}
        {step === 1 && (
          <div className="space-y-3">
            <p className="text-sm text-text-muted mb-4">选择参与本项目的岗位角色，系统将为每个角色生成对应的 AI 任务卡。</p>
            {errors.roles && <p className="text-xs text-error bg-red-50 px-3 py-2 rounded-lg">{errors.roles}</p>}
            {roles.map((r) => (
              <label key={r.role} className="flex items-center gap-4 p-4 border border-border-default rounded-xl cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="checkbox"
                  checked={r.checked}
                  onChange={() => { setRoles((prev) => prev.map((x) => x.role === r.role ? { ...x, checked: !x.checked } : x)); if (errors.roles) setErrors((prev) => { const { roles: _, ...rest } = prev; return rest }) }}
                  className="w-4 h-4 rounded accent-ai-600"
                />
                <div>
                  <div className="text-sm font-medium text-text-main">{r.label}</div>
                  <div className="text-xs text-text-muted mt-0.5">{r.desc}</div>
                </div>
              </label>
            ))}
          </div>
        )}
        {step === 2 && (
          <div className="space-y-4">
            <p className="text-sm text-text-muted">输入竞品品牌名称，AI 将针对这些品牌进行评论挖掘与对比分析。</p>
            {errors.competitors && <p className="text-xs text-error bg-red-50 px-3 py-2 rounded-lg">{errors.competitors}</p>}
            <div className="flex gap-2">
              <input
                type="text"
                value={competitorInput}
                onChange={(e) => { setCompetitorInput(e.target.value); if (errors.competitors) setErrors((prev) => { const { competitors: _, ...rest } = prev; return rest }) }}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addCompetitor() } }}
                placeholder="输入竞品品牌名称"
                className="flex-1 px-4 py-2.5 border border-border-default rounded-xl text-sm text-text-main placeholder:text-text-placeholder focus:outline-none focus:ring-2 focus:ring-ai-500/20 focus:border-ai-400 transition-all"
              />
              <button type="button" onClick={addCompetitor} className="px-5 py-2.5 bg-gray-100 text-text-secondary rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors">
                添加
              </button>
            </div>
            {competitors.length > 0 && (
              <div className="space-y-2">
                {competitors.map((c) => (
                  <div key={c} className="flex items-center justify-between px-4 py-2.5 bg-ai-50 border border-ai-100 rounded-xl text-sm text-text-main">
                    {c}
                    <button onClick={() => setCompetitors(competitors.filter((x) => x !== c))} className="text-text-muted hover:text-error transition-colors text-lg leading-none">×</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </SectionCard>

      <div className="flex items-center justify-between">
        <button
          onClick={() => setStep(Math.max(0, step - 1))}
          disabled={step === 0}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm text-text-muted hover:text-text-secondary disabled:opacity-30 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          上一步
        </button>
        {step < steps.length - 1 ? (
          <button
            onClick={handleNext}
            className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-gradient-to-r from-ai-500 to-ai-700 text-white text-sm font-semibold rounded-xl hover:from-ai-600 hover:to-ai-800 transition-all shadow-sm btn-primary-glow"
          >
            下一步
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={handleCreate}
            className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-gradient-to-r from-ai-500 to-ai-700 text-white text-sm font-semibold rounded-xl hover:from-ai-600 hover:to-ai-800 transition-all shadow-sm btn-primary-glow"
          >
            创建项目
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>
    </div>
  )
}
