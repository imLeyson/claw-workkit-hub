import React, { useState, useRef, useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { Sparkles, X, Send, Activity, Plus, Flame, MessageSquareText, HelpCircle, PackageCheck } from 'lucide-react'
import { roleLabels } from '../data/mock'
import { getProjects, getProjectBySlug, getTasks, getAIResult, addTask, updateTask, getMaterials, getWorkKits } from '../services/db'
import type { AIResult, Role } from '../types'
import { useToast } from './Toast'

interface Message {
  role: 'user' | 'ai'
  text: string
  customAction?: {
    type: 'add_task' | 'apply_prompt'
    payload: any
    applied?: boolean
  }
}

interface ActionOption {
  label: string
  icon: React.ReactNode
  handler: () => void
}

const pageTips: Record<string, string[]> = {
  '/': [
    '当前在项目看板。建议先查看「资产运营信号」，判断哪些项目需要补交接、补验证或发布 Work Kit。',
    '若要开启新产品分析，可点击「新建项目」，或到资产库挑选 Work Kit 模版复用。',
  ],
  '/materials': [
    '当前在资料库。建议查看「资料如何驱动岗位任务」，确认每份资料会支撑哪些任务卡。',
    '资料齐全后，相关岗位任务卡会自动激活，并在最终 Work Kit 中沉淀为资料结构模板。',
  ],
  '/tasks': [
    '当前在任务卡列表。建议优先处理「启动就绪度」不足的任务，避免工作台分析缺输入。',
    '每张任务卡的 Prompt、输出格式和验收标准都会成为后续 Work Kit 的可复用结构。',
  ],
  '/workspace': [
    '当前在 AI 工作台。生成结果后，请先查看「资产化交接」，确认结果区块、知识依据和复核标记是否完整。',
    '点击「提交到报告」后，系统会保存交接记录，供报告和资产库追溯。',
  ],
  '/report': [
    '当前在策略报告。发布 Work Kit 前，请检查「资产交接证据」是否覆盖关键岗位。',
    '点击「沉淀为复用工作包」会把岗位结果、验证结论、交接证据和执行清单一并写入资产库。',
  ],
}

function readLocalList(key: string): any[] {
  try {
    return JSON.parse(localStorage.getItem(key) || '[]')
  } catch {
    return []
  }
}

export default function AIAssistant() {
  const location = useLocation()
  const { showToast } = useToast()
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [streaming, setStreaming] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Context evaluation
  const getActiveContext = () => {
    const p = location.pathname
    const match = p.match(/\/(materials|tasks|workspace|report)\/([^/]+)/)
    if (match) {
      const type = match[1]
      const slug = match[2]
      const project = getProjectBySlug(slug)
      
      let taskId: string | undefined = undefined
      if (type === 'workspace') {
        const parts = p.split('/')
        taskId = parts[parts.length - 1]
      }
      return { type, slug, project, taskId }
    }
    return { type: p === '/' ? 'dashboard' : null, slug: null, project: null, taskId: null }
  }

  const { type: activeType, project: activeProject, taskId: activeTaskId } = getActiveContext()

  // Greet user on open
  const handleOpen = () => {
    setOpen(true)
    if (messages.length === 0) {
      let greet = '👋 您好！我是 PromoKit AI 助手。'
      if (activeProject) {
        greet += ` 当前您在处理项目「${activeProject.name}」。\n\n我可以帮您：\n- 🔍 诊断项目整体进度与资料健康度\n- 📦 判断下一步资产化动作\n- ✨ 优化 Prompt、交接证据和 Work Kit 沉淀路径`
      } else {
        greet += ' 您可以在此看板管理大促项目。我可以帮您诊断资产运营信号，找出最该补齐的项目。'
      }
      
      // Use pageTips to show a relevant tip
      const p = location.pathname
      const tipKey = Object.keys(pageTips).find(k => k !== '/' && p.startsWith(k)) || '/'
      const tipsForPage = pageTips[tipKey] || []
      if (tipsForPage.length > 0) {
        greet += `\n\n💡 页面提示：${tipsForPage[0]}`
      }

      setMessages([{ role: 'ai', text: greet }])
    }
  }

  // Streaming typewriter effect
  const streamAIResponse = (text: string, action?: any) => {
    setStreaming(true)
    setMessages((prev) => [...prev, { role: 'ai', text: '' }])
    
    let currentText = ''
    const chars = text.split('')
    let idx = 0
    
    const interval = setInterval(() => {
      if (idx < chars.length) {
        currentText += chars[idx]
        setMessages((prev) => {
          const next = [...prev]
          if (next.length > 0) {
            next[next.length - 1] = {
              role: 'ai',
              text: currentText,
              customAction: idx === chars.length - 1 ? action : undefined
            }
          }
          return next
        })
        idx++
      } else {
        clearInterval(interval)
        setStreaming(false)
      }
    }, 12)
  }

  // Dashboard Progress Diagnosis
  const handleDashboardDiagnose = () => {
    if (streaming) return
    setMessages((prev) => [...prev, { role: 'user', text: '🔍 智能进度诊断' }])
    
    const projectsList = getProjects()
    if (projectsList.length === 0) {
      streamAIResponse('📊 诊断结论：当前工作区没有项目。建议点击右上角「新建项目」开始分析。')
      return
    }
    
    let report = '📊 项目进度诊断报告：\n\n'
    projectsList.forEach((p, idx) => {
      const pTasks = getTasks(p.id)
      const done = pTasks.filter((t) => getAIResult(t.id)?.submitted).length
      const handoffs = readLocalList('promokit_asset_handoffs').filter((handoff) => handoff.projectId === p.id).length
      const hasKit = getWorkKits().some((kit) => kit.basedOnProjectId === p.id)
      const pct = pTasks.length > 0 ? Math.round((done / pTasks.length) * 100) : 0
      report += `${idx + 1}. 【${p.name}】（${p.category}）\n`
      report += `   · 进度：${pct}% (已提交 ${done}/${pTasks.length} 个岗位任务)\n`
      report += `   · 竞品数：${p.competitors.length} ｜ 资料数：${getMaterials(p.id).length}\n`
      report += `   · 资产链路：${handoffs} 条交接记录 ｜ ${hasKit ? '已发布 Work Kit' : '未发布 Work Kit'}\n`
      
      const pendingTasks = pTasks.filter((t) => !getAIResult(t.id)?.submitted).map((t) => t.title)
      if (pendingTasks.length > 0) {
        report += `   · 待提交：${pendingTasks.slice(0, 2).join('、')}${pendingTasks.length > 2 ? ' 等' : ''}\n`
      }
      report += '\n'
    })
    report += '💡 优化建议：优先处理没有交接记录或尚未发布 Work Kit 的项目，让分析结果真正进入资产库。'
    streamAIResponse(report)
  }

  // Materials Checklist Check
  const handleMaterialsCheck = () => {
    if (streaming || !activeProject) return
    setMessages((prev) => [...prev, { role: 'user', text: '📋 诊断资料库健康度' }])
    
    const mats = getMaterials(activeProject.id)
    const pTasks = getTasks(activeProject.id)
    const taskInputReady = pTasks.filter((task) => task.inputMaterials.length > 0).length
    
    let diag = `📋 「${activeProject.name}」资料库健康度分析：\n\n`
    diag += `当前已上传 ${mats.length} 份分析资料，已支撑 ${taskInputReady}/${pTasks.length} 张任务卡：\n`
    
    const counts = { review: 0, spec: 0, faq: 0, copy_asset: 0 }
    mats.forEach((m) => {
      if (counts[m.type] !== undefined) counts[m.type]++
    })
    
    diag += `· 竞品差评评论：${counts.review} 份\n`
    diag += `· 产品参数规格：${counts.spec} 份\n`
    diag += `· 历史客服问答：${counts.faq} 份\n`
    diag += `· 历史文案素材：${counts.copy_asset} 份\n\n`
    
    const warnings = []
    if (counts.review === 0) {
      warnings.push('⚠️ 警告：当前项目未关联任何「竞品评论」资料。多数岗位分析卡片依赖此数据，建议尽快导入差评 CSV 文本。')
    }
    if (counts.spec === 0 && pTasks.some((t) => t.role === 'merchandise')) {
      warnings.push('💡 提示：商品运营岗任务缺少【商品参数/规格说明书】，对比分析可能因数据不足而受限。')
    }
    if (counts.faq === 0 && pTasks.some((t) => t.role === 'customer_service')) {
      warnings.push('💡 建议：补充【客服历史聊天记录】，能更准确地提炼大促高频 FAQ。')
    }
    
    if (warnings.length > 0) {
      diag += `诊断警告：\n${warnings.join('\n')}`
    } else {
      diag += `✅ 诊断合格：所有核心岗位的数据输入均已就绪，资料结构可进入任务卡，并可在最终 Work Kit 中复用。`
    }
    
    streamAIResponse(diag)
  }

  // Recommend Custom Task
  const handleRecommendTask = () => {
    if (streaming || !activeProject) return
    setMessages((prev) => [...prev, { role: 'user', text: '➕ 智能推荐岗位任务' }])
    
    const isCosmetics = activeProject.category.includes('美妆') || activeProject.category.includes('个护')
    const title = isCosmetics ? '小红书爆款美妆文案包装' : '详情页卖点逆转文案转化'
    const role = 'copywriting' as Role
    const description = isCosmetics
      ? '针对美妆个护大促，提取用户评论中的功效及肤感关键词，生成符合小红书博主种草口吻的带货文案模板。'
      : '针对该品类高频痛点进行卖点逆转，提炼高转化率的详情页卖点及设计指令。'
    
    const promptPreview = `你是一名百万粉电商种草达人。请分析已关联的竞品好评及差评评论，深度剖析用户最关心的体验（如包装设计、上脸肤感、使用效果），提炼出 3 个核心优势卖点，并针对每一个卖点撰写一版符合真实消费者口吻、高互动率的小红书带货推广文案模板。`
    const outputFormat = '列表：核心卖点 ＋ 小红书推广文案模板 ＋ 视觉配图建议'
    
    const newTask = {
      projectId: activeProject.id,
      role,
      title,
      description,
      promptPreview,
      outputFormat,
      judgmentCriteria: ['卖点必须针对用户真实痛点进行破局', '文案排版包含小红书流行语与常用 emoji', '配图方向具备实际拍摄落地性'],
      sourceTags: ['竞品评论', '历史文案']
    }
    
    const reply = `💡 根据项目大促类目「${activeProject.category}」，我为您推荐以下自定义分析任务卡：\n\n` +
      `【任务名称】：${title}\n` +
      `【岗位角色】：内容文案岗\n` +
      `【说明】：${description}\n\n` +
      `您可以点击下方按钮，直接将此推荐任务一键添加至当前项目的分析列表中：`
    
    streamAIResponse(reply, {
      type: 'add_task',
      payload: newTask
    })
  }

  // Optimize Workspace Prompt
  const handleOptimizePrompt = () => {
    if (streaming || !activeProject || !activeTaskId) return
    setMessages((prev) => [...prev, { role: 'user', text: '✨ 提示词指令深度优化' }])
    
    const pTasks = getTasks(activeProject.id)
    const task = pTasks.find((t) => t.id === activeTaskId)
    if (!task) {
      streamAIResponse('⚠️ 诊断失败：找不到对应的任务卡。')
      return
    }
    
    const optimizedPrompt = `你是一名资深的电商分析总监。针对岗位任务「${task.title}」，请深度读取已关联的数据包。
 
 请按照以下严格要求进行分析并输出结构化内容：
 1. 深度提炼：请勿罗列表面现象，必须将消费者差评以【发生场景 + 根本原因 + 用户情绪负荷】进行归类；
 2. 落地实施：针对输出格式「${task.outputFormat}」，提供 3 项最紧迫、能立即排期落地的产品或营销改进建议方案；
 3. 量化考核：为本项任务产出设计 2 个量化的岗位考核指标（KPI）建议。`
 
    const reply = `✨ 针对当前任务「${task.title}」，我为您量身定制了电商大促场景专用的提示词模板（包含场景归类法与量化考核）：\n\n` +
      `\`\`\`\n${optimizedPrompt}\n\`\`\`\n\n` +
      `您可以点击下方按钮，直接将此优化版 Prompt 覆盖到当前的分析参数中。`
      
    streamAIResponse(reply, {
      type: 'apply_prompt',
      payload: {
        taskId: task.id,
        projectId: activeProject.id,
        prompt: optimizedPrompt
      }
    })
  }

  // Report Summary Synthesis
  const handleReportSynthesize = () => {
    if (streaming || !activeProject) return
    setMessages((prev) => [...prev, { role: 'user', text: '📝 提炼核心结论摘要' }])
    
    const pTasks = getTasks(activeProject.id)
    const results = pTasks.map((t) => getAIResult(t.id)).filter(Boolean) as AIResult[]
    
    if (results.length === 0) {
      streamAIResponse('📊 诊断结论：当前项目尚未提交任何岗位的分析结论，请先在各岗位工作台点击「提交到报告」。')
      return
    }
    
    let summary = `📝 已为您汇总当前项目「${activeProject.name}」已提交的 ${results.length} 个岗位分析结论，智能生成大促主攻方向：\n\n`
    
    results.forEach((r, idx) => {
      summary += `${idx + 1}. 【${r.title}】\n`
      if (r.title.includes('痛点')) {
        summary += `   · 核心痛点：集中在产品噪音偏大、材质质感与预期有落差，退换率偏高。\n`
      } else if (r.title.includes('卖点')) {
        summary += `   · 核心卖点：主打「便携机身」与「母婴级静音」，直击竞品核心痛点。\n`
      } else {
        const first = r.sections[0]
        if (first && first.items && first.items.length > 0) {
          summary += `   · 核心发现：${first.items[0].slice(0, 45)}...\n`
        } else {
          summary += `   · 核心发现：岗位交付结构完整，已完成人工修订校准。\n`
        }
      }
    })
    
    summary += `\n🎯 整合行动计划（岗位对齐）：\n` +
      `- 视觉岗：在详情页前三屏加粗突出「降噪对比图」，消除噪音痛点顾虑；\n` +
      `- 文案岗：宣传卖点强化「轻量静音」，直接对冲竞品短板；\n` +
      `- 客服岗：梳理退换货常见话术包，前置进行投诉纠纷降级。\n\n` +
      `💡 推荐步骤：当前项目流程已臻完善，点击右上角「沉淀为复用工作包」，将其存入资产库以供下次直接复用！`
       
    streamAIResponse(summary)
  }

  const handleAssetNextStep = () => {
    if (streaming) return
    setMessages((prev) => [...prev, { role: 'user', text: '📦 下一步资产化建议' }])

    if (!activeProject) {
      const kits = getWorkKits()
      const projects = getProjects()
      const reusable = kits.filter((kit) => kit.rating >= 4.6).length
      streamAIResponse(
        `📦 全局资产化建议：\n\n` +
        `当前已有 ${projects.length} 个项目、${kits.length} 个 Work Kit，其中 ${reusable} 个适合作为新项目启动模板。\n\n` +
        `建议下一步：\n` +
        `1. 如果要启动新项目，优先进入「资产库」选择高评分 Work Kit 复用；\n` +
        `2. 如果已有项目进行中，打开项目报告页，检查是否已经发布为 Work Kit；\n` +
        `3. 每次复用后补充学习记录和验证反馈，形成模板迭代历史。\n\n` +
        `目标不是多做一份报告，而是让下一次大促少走一遍重复路。`
      )
      return
    }

    const mats = getMaterials(activeProject.id)
    const tasks = getTasks(activeProject.id)
    const submitted = tasks.filter((task) => getAIResult(task.id)?.submitted)
    const generated = tasks.filter((task) => Boolean(getAIResult(task.id)?.generatedAt))
    const existingKit = getWorkKits().find((kit) => kit.basedOnProjectId === activeProject.id)
    const assetHandoffs = readLocalList('promokit_asset_handoffs').filter((handoff) => handoff.projectId === activeProject.id)
    const learningRecords = readLocalList('promokit_prelearning_records').filter((record) => record.projectId === activeProject.id || record.workKitName?.includes(activeProject.name))
    const validationHistory = readLocalList('promokit_validation_history')
    const materialTypes = new Set(mats.map((mat) => mat.type))
    const missingMaterials = [
      ['review', '竞品评论'],
      ['spec', '商品参数'],
      ['faq', '客服记录'],
      ['copy_asset', '历史文案'],
    ].filter(([type]) => !materialTypes.has(type as any)).map(([, label]) => label)

    let next = ''
    if (mats.length === 0 || !materialTypes.has('review')) {
      next = `优先补齐资料库，尤其是「竞品评论」。没有真实评论，后面的痛点矩阵和卖点转译会变成空泛判断。`
    } else if (generated.length < tasks.length) {
      next = `进入任务卡/工作台，把未生成的岗位任务跑完。当前已生成 ${generated.length}/${tasks.length} 个任务结果。`
    } else if (submitted.length < tasks.length) {
      next = `把已生成但未提交的岗位结果提交到报告。当前报告只收到 ${submitted.length}/${tasks.length} 个岗位结果。`
    } else if (assetHandoffs.length === 0) {
      next = `进入已提交任务的工作台，确认「资产化交接」并提交到报告。没有交接记录，报告发布 Work Kit 时会缺少可追溯证据。`
    } else if (!existingKit) {
      next = `进入策略报告，完成发布前资产化检查，并点击「发布 Work Kit」。这是把本次分析变成下次资产的关键动作。`
    } else {
      next = `当前项目已沉淀为 ${existingKit.version}。建议去资产库补充验证反馈，记录哪些结论应该保留、修订或废弃。`
    }

    const score = Math.round((
      (mats.length > 0 ? 25 : 0) +
      (materialTypes.has('review') ? 15 : 0) +
      (tasks.length > 0 ? 15 : 0) +
      (tasks.length ? (generated.length / tasks.length) * 20 : 0) +
      (tasks.length ? (submitted.length / tasks.length) * 15 : 0) +
      (assetHandoffs.length > 0 ? 10 : 0) +
      (existingKit ? 10 : 0)
    ))

    streamAIResponse(
      `📦 「${activeProject.name}」资产化诊断：\n\n` +
      `· 资产化就绪度：${score}%\n` +
      `· 资料覆盖：${mats.length} 份${missingMaterials.length ? `，缺少 ${missingMaterials.join('、')}` : '，核心类型已覆盖'}\n` +
      `· 岗位结果：已生成 ${generated.length}/${tasks.length}，已提交 ${submitted.length}/${tasks.length}\n` +
      `· 资产交接：${assetHandoffs.length} 条记录\n` +
      `· 启动学习：${learningRecords.length} 条记录\n` +
      `· 验证历史：${validationHistory.length} 条记录\n` +
      `· Work Kit：${existingKit ? `已沉淀 ${existingKit.version}` : '尚未发布'}\n\n` +
      `建议下一步：${next}\n\n` +
      `判断标准：只有当资料结构、岗位输出、报告验证和 Work Kit 发布都留下记录，这次分析才真正变成下一次可复用的资产。`
    )
  }

  // General Page Action Fallback
  const handleGeneralAdvice = (context: string) => {
    if (streaming) return
    let q = ''
    let reply = ''
    if (context === 'dashboard') {
      q = '💡 大促策划建议'
      reply = '💡 大促项目目标建议：\n\n1. **先看资产运营信号**：优先处理缺资料、缺交接、缺验证的项目；\n2. **明确可复用产物**：每个项目不只完成一次分析，还要沉淀资料结构、Prompt、岗位输出和执行清单；\n3. **用 Work Kit 衡量完成度**：当项目能被下一次大促直接复用，才算真正闭环。'
    } else if (context === 'materials') {
      q = '💡 大促资料推荐'
      reply = '💡 推荐上传以下资料组合，并检查「资料如何驱动岗位任务」：\n\n1. **竞品评论 CSV**：支撑痛点矩阵、FAQ 和客服话术；\n2. **产品规格参数表**：支撑卖点翻译、详情页优化和差异化策略；\n3. **历史文案素材**：让 Prompt 继承品牌表达方式；\n4. **客服历史记录**：沉淀高频问题、反驳话术和售前决策依据。'
    } else if (context === 'tasks') {
      q = '⚡ 批量快速生成说明'
      reply = '⚡ 岗位任务卡操作指导：\n\n1. **先看启动就绪度**：优先补齐输入资料不足的任务；\n2. **检查三件套**：Prompt、输出格式、验收标准要清楚，后续才可复用；\n3. **进入工作台交接**：生成结果后要完成资产化交接，让任务卡不只是一段分析，而是 Work Kit 的组成模块。'
    } else if (context === 'workspace') {
      q = '📐 自动补全验收标准'
      reply = '📐 推荐为当前岗位任务补充以下量化验收标准：\n\n1. **评论实例支撑**：痛点/卖点需定位至真实评价或明确资料来源；\n2. **改进行动明确**：运营、文案或设计建议要能直接执行；\n3. **岗位成果对齐**：输出内容可被其他岗位继续引用；\n4. **资产交接完整**：提交报告前确认结果区块、知识依据、复核标记都已记录。'
    } else if (context === 'report') {
      q = '📦 快速沉淀为 Work Kit'
      reply = '📦 如何快速沉淀为 Work Kit 工作包模版：\n\n1. **补齐岗位结果**：确保关键任务都已提交到报告；\n2. **检查交接证据**：确认每个关键结论有来源、负责人和复用去向；\n3. **写清复盘建议**：把适用场景、注意事项和下次启动前要学习的内容写入资产；\n4. **保存归档并验证**：发布 Work Kit 后，在资产库继续记录复用反馈，让资产健康度持续变高。'
    }
    
    setMessages((prev) => [...prev, { role: 'user', text: q }])
    streamAIResponse(reply)
  }

  // Handle Embedded Chat Card Executions
  const handleExecuteCustomAction = async (index: number) => {
    const msg = messages[index]
    if (!msg || !msg.customAction || msg.customAction.applied) return

    const { type, payload } = msg.customAction

    try {
      if (type === 'add_task') {
        const { projectId, role, title, description, promptPreview, outputFormat, judgmentCriteria, sourceTags } = payload
        const newTask = {
          id: 't_' + Date.now(),
          projectId,
          role,
          title,
          description,
          status: 'pending' as const,
          assignedTo: '未分配',
          inputMaterials: [],
          promptPreview,
          outputFormat,
          judgmentCriteria,
          sourceTags,
        }
        await addTask(newTask)
        window.dispatchEvent(new Event('promokit_db_update'))
        showToast('推荐任务卡已注入到任务列表中！', 'success')
      } else if (type === 'apply_prompt') {
        const { taskId, prompt } = payload
        const pTasks = getTasks(payload.projectId)
        const target = pTasks.find((t) => t.id === taskId)
        if (target) {
          updateTask({
            ...target,
            promptPreview: prompt
          })
          window.dispatchEvent(new Event('promokit_db_update'))
          showToast('已成功应用优化版 Prompt！', 'success')
        } else {
          showToast('找不到对应的任务卡，应用失败。', 'error')
        }
      }

      setMessages((prev) => {
        const next = [...prev]
        if (next[index] && next[index].customAction) {
          next[index] = {
            ...next[index],
            customAction: {
              ...next[index].customAction!,
              applied: true
            }
          }
        }
        return next
      })
    } catch {
      showToast('操作失败，请重试', 'error')
    }
  }

  const handleSend = () => {
    const q = input.trim()
    if (!q) return
    setMessages((prev) => [...prev, { role: 'user', text: q }])
    setInput('')
    setStreaming(true)

    // Simulate AI response delay
    setTimeout(() => {
      let replyText = '您可以向我提问任何关于 PromoKit 的问题，或使用上方的快捷指令进行快速诊断。'
      
      const responses: Record<string, string> = {
        '怎么': '建议按「看板诊断 → 资料映射 → 任务卡生成 → 工作台交接 → 报告发布 → Work Kit 验证」推进。目标不是只生成一次结果，而是让这次分析能被下一次大促复用。',
        '如何': '可以到「资产库」选择健康度较高的 Work Kit，先查看启动前学习包和复用前检查，再创建新项目。这样新项目会继承资料结构、Prompt 经验和验证反馈。',
        '什么': 'PromoKit AI 是面向电商大促团队的 AI 工作包资产化系统，用来沉淀资料结构、Prompt、岗位分析结果、交接证据和复用验证反馈。',
        '创建': '点击侧边栏的「新建项目」即可开始，表单中会引导您填写项目名称、目类和关联竞品。',
        '上传': '进入对应项目的资料库，拖拽或点击上传资料。上传后建议查看「资料如何驱动岗位任务」，确认每份资料会支撑哪些任务卡和后续 Work Kit 模板。',
      }
      
      for (const [k, v] of Object.entries(responses)) {
        if (q.includes(k)) {
          replyText = v
          break
        }
      }

      setStreaming(false)
      streamAIResponse(replyText)
    }, 1000)
  }

  const getActionOptions = (): ActionOption[] => {
    if (activeType === 'dashboard') {
      return [
        { label: '📦 下一步资产化建议', icon: <PackageCheck className="w-3 h-3 text-accent-500" />, handler: handleAssetNextStep },
        { label: '🔍 智能进度诊断', icon: <Activity className="w-3 h-3 text-accent-500" />, handler: handleDashboardDiagnose },
        { label: '💡 大促策划建议', icon: <HelpCircle className="w-3 h-3 text-accent-500" />, handler: () => handleGeneralAdvice('dashboard') },
      ]
    }
    if (activeType === 'materials') {
      return [
        { label: '📦 下一步资产化建议', icon: <PackageCheck className="w-3 h-3 text-accent-500" />, handler: handleAssetNextStep },
        { label: '📋 诊断上传完整度', icon: <Activity className="w-3 h-3 text-accent-500" />, handler: handleMaterialsCheck },
        { label: '💡 大促资料推荐', icon: <HelpCircle className="w-3 h-3 text-accent-500" />, handler: () => handleGeneralAdvice('materials') },
      ]
    }
    if (activeType === 'tasks') {
      return [
        { label: '📦 下一步资产化建议', icon: <PackageCheck className="w-3 h-3 text-accent-500" />, handler: handleAssetNextStep },
        { label: '➕ 智能推荐岗位任务', icon: <Plus className="w-3 h-3 text-accent-500" />, handler: handleRecommendTask },
        { label: '⚡ 批量快速生成说明', icon: <Flame className="w-3 h-3 text-accent-500" />, handler: () => handleGeneralAdvice('tasks') },
      ]
    }
    if (activeType === 'workspace') {
      return [
        { label: '📦 下一步资产化建议', icon: <PackageCheck className="w-3 h-3 text-accent-500" />, handler: handleAssetNextStep },
        { label: '✨ 提示词指令优化', icon: <Flame className="w-3 h-3 text-accent-500" />, handler: handleOptimizePrompt },
        { label: '📐 自动补全验收标准', icon: <Activity className="w-3 h-3 text-accent-500" />, handler: () => handleGeneralAdvice('workspace') },
      ]
    }
    if (activeType === 'report') {
      return [
        { label: '📦 下一步资产化建议', icon: <PackageCheck className="w-3 h-3 text-accent-500" />, handler: handleAssetNextStep },
        { label: '📝 提炼核心结论摘要', icon: <MessageSquareText className="w-3 h-3 text-accent-500" />, handler: handleReportSynthesize },
        { label: '📦 快速沉淀为 Work Kit', icon: <HelpCircle className="w-3 h-3 text-accent-500" />, handler: () => handleGeneralAdvice('report') },
      ]
    }
    return []
  }

  const actionOptions = getActionOptions()

  return (
    <>
      {/* Floating button */}
      {!open && (
        <button
          onClick={handleOpen}
          className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl bg-bg-surface border border-border-default text-text-main flex items-center gap-2 shadow-sm hover:border-accent-500/35 transition-colors cursor-pointer active:scale-95"
        >
          <Sparkles className="w-4 h-4 text-accent-500" />
          <span className="text-[12px] font-semibold tracking-wide">AI 助手</span>
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div 
          className="fixed bottom-6 right-6 z-50 w-[390px] max-w-[calc(100vw-32px)] bg-bg-surface border border-border-default rounded-xl shadow-xl flex flex-col overflow-hidden" 
          style={{ height: '510px', maxHeight: 'calc(100vh - 100px)' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-border-light shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-bg-primary flex items-center justify-center border border-border-light">
                <Sparkles className="w-4 h-4 text-accent-500" />
              </div>
              <div>
                <span className="text-[13px] font-semibold text-text-main flex items-center gap-1.5">
                  AI 智能顾问
                  <span className="w-1.5 h-1.5 rounded-full bg-success" />
                </span>
                <p className="text-[10px] text-text-muted mt-0.5">
                  {activeProject ? `当前对齐：${activeProject.name}` : '全局看板状态'}
                </p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="p-1 rounded-lg hover:bg-bg-primary transition-colors cursor-pointer">
              <X className="w-4 h-4 text-text-muted hover:text-text-main" />
            </button>
          </div>

          {/* Page-specific Quick Commands Drawer */}
          {actionOptions.length > 0 && (
            <div className="px-5 py-2.5 bg-bg-primary/45 border-b border-border-light shrink-0 flex items-center gap-2 overflow-x-auto select-none no-scrollbar">
              {actionOptions.map((opt) => (
                <button
                  key={opt.label}
                  onClick={opt.handler}
                  disabled={streaming}
                  className="shrink-0 text-[10px] px-3 py-1.5 rounded-lg bg-bg-surface border border-border-light text-text-secondary hover:border-accent-500/30 hover:text-accent-500 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {opt.icon}
                  <span>{opt.label}</span>
                </button>
              ))}
            </div>
          )}

          {/* Messages body */}
          <div className="flex-1 overflow-auto px-5 py-4 space-y-4 no-scrollbar">
            {messages.map((msg, i) => (
              <div key={i} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                <div 
                  className={`max-w-[88%] rounded-[18px] px-4 py-3 text-[12px] leading-relaxed whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-accent-500 text-black font-medium rounded-tr-none'
                      : 'bg-bg-primary border border-border-light text-text-secondary rounded-tl-none'
                  }`}
                >
                  {msg.text}
                  
                  {/* Streaming indicator inside final AI message block */}
                  {streaming && i === messages.length - 1 && msg.role === 'ai' && (
                    <span className="inline-block w-1.5 h-3.5 bg-accent-500 ml-0.5 animate-pulse align-middle" />
                  )}

                  {/* Custom Action Cards rendering */}
                  {msg.customAction && (
                    <div className="mt-4 p-3.5 bg-bg-primary border border-border-light rounded-xl space-y-2.5">
                      <div className="flex items-center gap-1.5 text-[10px] font-semibold text-accent-500 uppercase tracking-wider">
                        <Sparkles className="w-3 h-3" />
                        <span>推荐执行动作</span>
                      </div>
                      
                      {msg.customAction.type === 'add_task' && (
                        <>
                          <div className="text-[12.5px] font-medium text-text-main">{msg.customAction.payload.title}</div>
                          <p className="text-[11px] text-text-muted leading-relaxed font-light">{msg.customAction.payload.description}</p>
                          <div className="flex items-center justify-between text-[10px] text-text-muted mt-1 bg-bg-surface p-1.5 rounded">
                            <span>岗位：{roleLabels[msg.customAction.payload.role as Role]}岗</span>
                            <span>输出：{msg.customAction.payload.outputFormat.split('：')[0]}</span>
                          </div>
                        </>
                      )}

                      {msg.customAction.type === 'apply_prompt' && (
                        <div className="text-[11px] text-text-muted leading-relaxed font-light line-clamp-3 bg-bg-surface p-2 rounded border border-border-light font-mono">
                          {msg.customAction.payload.prompt}
                        </div>
                      )}

                      <button
                        disabled={msg.customAction.applied || streaming}
                        onClick={() => handleExecuteCustomAction(i)}
                        className={`w-full py-2 rounded-lg text-[11px] font-semibold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                          msg.customAction.applied
                            ? 'bg-success-soft text-success border border-success/20 cursor-default'
                            : 'bg-accent-500 text-black hover:bg-accent-600 active:scale-[0.98] font-bold'
                        }`}
                      >
                        {msg.customAction.applied ? '✓ 已应用成功' : msg.customAction.type === 'add_task' ? '立即注入此任务卡' : '应用此提示词模板'}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
            
            {/* Typing indicator */}
            {streaming && messages[messages.length - 1]?.role === 'user' && (
              <div className="flex justify-start">
                <div className="bg-bg-primary border border-border-light rounded-[18px] rounded-tl-none px-4 py-3 flex items-center gap-1.5 shrink-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-accent-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-accent-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            
            <div ref={bottomRef} />
          </div>

          {/* Input text block */}
          <div className="px-5 py-4 border-t border-border-light shrink-0 flex items-center gap-3 bg-bg-primary/45">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSend()
              }}
              placeholder="向 AI 咨询关于大促工作包的任何问题..."
              className="flex-1 bg-bg-surface border border-border-default rounded-xl px-3.5 py-2.5 text-[12px] text-text-main placeholder:text-text-placeholder outline-none focus:border-accent-500/40 transition-colors"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || streaming}
              className="w-9 h-9 rounded-xl bg-accent-500 hover:bg-accent-600 text-black flex items-center justify-center disabled:opacity-20 disabled:cursor-not-allowed transition-all shrink-0 cursor-pointer active:scale-95"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  )
}
