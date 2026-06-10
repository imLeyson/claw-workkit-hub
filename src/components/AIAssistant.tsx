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
    '当前在项目看板。您可以点击「智能进度诊断」了解有哪些岗位任务尚未提交。',
    '若要开启新产品分析，可点击右上角「新建项目」，或到资产库挑选 Work Kit 模版。',
  ],
  '/materials': [
    '当前在资料库。建议上传竞品差评评论数据，以便 AI 能定位最真实的消费者体验点。',
    '资料齐全后，相关的岗位任务卡会自动激活为「就绪」状态。',
  ],
  '/tasks': [
    '当前在分析任务列表。您可以点击「智能推荐岗位任务」，由 AI 针对该类目一键添加专属分析维度。',
    '也可以点击「批量快速生成」引导，批量初始化所有就绪状态的岗位卡片。',
  ],
  '/workspace': [
    '当前在 AI 工作台。您可以点击「提示词指令优化」，让我为您注入大促专用的爆品挖掘框架。',
    '生成结果后，支持直接点击段落进入编辑，最后点击「提交到报告」进行沉淀。',
  ],
  '/report': [
    '当前在策略报告。您可以点击「提炼核心结论摘要」，自动提取已提交岗位的电商落地建议。',
    '报告支持多岗位 Tab 切换查看，点击右上角「沉淀为复用工作包」可归档为团队模板。',
  ],
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
        greet += ` 当前您在处理项目「${activeProject.name}」。\n\n我可以帮您：\n- 🔍 诊断项目整体进度与资料健康度\n- ➕ 智能推荐大促岗位分析任务\n- ✨ 深度优化当前工作台提示词 (Prompt)`
      } else {
        greet += ' 您可以在此看板管理大促项目。我可以帮您诊断各项目进度，或推荐新建策划大促方案。'
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
      const pct = pTasks.length > 0 ? Math.round((done / pTasks.length) * 100) : 0
      report += `${idx + 1}. 【${p.name}】（${p.category}）\n`
      report += `   · 进度：${pct}% (已提交 ${done}/${pTasks.length} 个岗位任务)\n`
      report += `   · 竞品数：${p.competitors.length} ｜ 资料数：${getMaterials(p.id).length}\n`
      
      const pendingTasks = pTasks.filter((t) => !getAIResult(t.id)?.submitted).map((t) => t.title)
      if (pendingTasks.length > 0) {
        report += `   · 待提交：${pendingTasks.slice(0, 2).join('、')}${pendingTasks.length > 2 ? ' 等' : ''}\n`
      }
      report += '\n'
    })
    report += '💡 优化建议：您可以点击列表进入具体项目，在资料库补充数据或到工作台生成 AI 报告。'
    streamAIResponse(report)
  }

  // Materials Checklist Check
  const handleMaterialsCheck = () => {
    if (streaming || !activeProject) return
    setMessages((prev) => [...prev, { role: 'user', text: '📋 诊断资料库健康度' }])
    
    const mats = getMaterials(activeProject.id)
    const pTasks = getTasks(activeProject.id)
    
    let diag = `📋 「${activeProject.name}」资料库健康度分析：\n\n`
    diag += `当前已上传 ${mats.length} 份分析资料：\n`
    
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
      diag += `✅ 诊断合格：所有核心岗位的数据输入均已就绪，资料健康，可以进入「任务卡」大批量生成！`
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
      (existingKit ? 10 : 0)
    ))

    streamAIResponse(
      `📦 「${activeProject.name}」资产化诊断：\n\n` +
      `· 资产化就绪度：${score}%\n` +
      `· 资料覆盖：${mats.length} 份${missingMaterials.length ? `，缺少 ${missingMaterials.join('、')}` : '，核心类型已覆盖'}\n` +
      `· 岗位结果：已生成 ${generated.length}/${tasks.length}，已提交 ${submitted.length}/${tasks.length}\n` +
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
      reply = '💡 大促项目策划建议：\n\n1. **确定大促场景**：在项目名称中标明是大促活动（如 618、双11）；\n2. **明确主攻品类**：在创建项目时选择特定的商品类目，有助于 AI 推荐相应的核心指标；\n3. **多岗位协同**：在大促准备期，将任务分配给运营、文案、设计、客服等不同成员，以闭环管理进度。'
    } else if (context === 'materials') {
      q = '💡 大促资料推荐'
      reply = '💡 推荐上传以下资料组合以发挥最大效能：\n\n1. **竞品评论 CSV**：包含真实的好评与负评文本，为痛点挖掘提供最直接的土壤；\n2. **产品规格参数表**：以便 AI 深入剖析物理规格，定位性能短板；\n3. **历史文案素材**：如卖点清单，让 AI 在分析时自动对齐品牌自身的话术风格；\n4. **客服历史记录**：最适合用来一键提炼高转化 FAQ 话术。'
    } else if (context === 'tasks') {
      q = '⚡ 批量快速生成说明'
      reply = '⚡ 岗位任务卡操作指导：\n\n1. **关联资料**：部分标注「待补资料」的任务卡需要特定输入，可先到资料库上传；\n2. **一键生成**：点击右上角「生成全部任务卡」，系统会调用模拟分析将待生成的任务卡一并初始化；\n3. **单项精修**：生成后点击任务卡底部的「进入分析」，可进入工作台进行微调、重生成或修改。'
    } else if (context === 'workspace') {
      q = '📐 自动补全验收标准'
      reply = '📐 推荐为当前岗位任务补充以下量化验收标准：\n\n1. **评论实例支撑**：所提取出的痛点/卖点必须定位至至少 2 条真实评价原文；\n2. **改进行动明确**：分析结论中提及的运营或设计修改方案必须有可执行的文字细节；\n3. **岗位成果对齐**：输出内容必须能够作为其他岗位（如文案或设计）的直接参考指标。'
    } else if (context === 'report') {
      q = '📦 快速沉淀为 Work Kit'
      reply = '📦 如何快速沉淀为 Work Kit 工作包模版：\n\n1. **汇总结论**：确保所有岗位的分析均已在工作台点击「提交到报告」；\n2. **微调润色**：点击「编辑报告」对整篇报告进行细节调整 and 修正；\n3. **保存归档**：点击右上角「沉淀为复用工作包」，输入模版名称及复盘建议。保存后，项目将被归档，下次只需在资产库一键点击「复用」即可建立全新项目！'
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
        '怎么': '建议从 Dashboard 看板选择一个项目，进入资料库上传竞品评论等数据包，然后前往任务卡页面进行岗位 AI 智能生成。',
        '如何': '您可以到「资产库」选择已经保存的电商 Work Kit，点击「复用模板」快速创建新项目。',
        '什么': 'PromoKit AI 是针对电商团队打造的 AI 工作包模板沉淀系统，帮助把每次大促竞品挖掘与策略策划流程标准化、模板化。',
        '创建': '点击侧边栏的「新建项目」即可开始，表单中会引导您填写项目名称、目类和关联竞品。',
        '上传': '进入对应项目的资料库，拖拽或点击上传 CSV 文件即可。系统会自动按评论、参数等类型分类识别。',
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
          className="fixed bottom-6 right-6 z-50 px-4 py-3 rounded-2xl bg-gradient-to-r from-accent-500 to-accent-600 text-black flex items-center gap-2 shadow-[0_12px_24px_rgba(224,123,76,0.3)] hover:scale-105 transition-all cursor-pointer group hover-lift active:scale-95 ai-pulse"
        >
          <Sparkles className="w-4 h-4 animate-pulse" />
          <span className="text-[12px] font-semibold tracking-wide">AI 助手</span>
        </button>
      )}

      {/* Chat panel */}
      {open && (
        <div 
          className="fixed bottom-6 right-6 z-50 w-[390px] max-w-[calc(100vw-32px)] bg-[#141416]/90 backdrop-blur-xl border border-white/[0.08] rounded-[24px] shadow-[0_32px_80px_-16px_rgba(0,0,0,0.6)] flex flex-col overflow-hidden animate-scale-in" 
          style={{ height: '510px', maxHeight: 'calc(100vh - 100px)' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/[0.05] shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-xl bg-accent-500/10 flex items-center justify-center border border-accent-500/20">
                <Sparkles className="w-4 h-4 text-accent-500" />
              </div>
              <div>
                <span className="text-[13px] font-semibold text-text-main flex items-center gap-1.5">
                  AI 智能顾问
                  <span className="w-1.5 h-1.5 rounded-full bg-success animate-pulse" />
                </span>
                <p className="text-[10px] text-text-muted mt-0.5">
                  {activeProject ? `当前对齐：${activeProject.name}` : '全局看板状态'}
                </p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="p-1 rounded-lg hover:bg-white/5 transition-colors cursor-pointer">
              <X className="w-4 h-4 text-text-muted hover:text-text-main" />
            </button>
          </div>

          {/* Page-specific Quick Commands Drawer */}
          {actionOptions.length > 0 && (
            <div className="px-5 py-2.5 bg-white/[0.02] border-b border-white/[0.05] shrink-0 flex items-center gap-2 overflow-x-auto select-none no-scrollbar">
              {actionOptions.map((opt) => (
                <button
                  key={opt.label}
                  onClick={opt.handler}
                  disabled={streaming}
                  className="shrink-0 text-[10px] px-3 py-1.5 rounded-full bg-white/5 border border-white/[0.04] text-text-secondary hover:border-accent-500/30 hover:text-accent-500 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
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
                      ? 'bg-gradient-to-r from-accent-500 to-accent-600 text-black font-medium rounded-tr-none shadow-[0_4px_16px_rgba(224,123,76,0.2)]'
                      : 'bg-white/[0.03] border border-white/[0.05] text-text-secondary rounded-tl-none font-light'
                  }`}
                >
                  {msg.text}
                  
                  {/* Streaming indicator inside final AI message block */}
                  {streaming && i === messages.length - 1 && msg.role === 'ai' && (
                    <span className="inline-block w-1.5 h-3.5 bg-accent-500 ml-0.5 animate-pulse align-middle" />
                  )}

                  {/* Custom Action Cards rendering */}
                  {msg.customAction && (
                    <div className="mt-4 p-3.5 bg-black/40 border border-white/[0.06] rounded-xl space-y-2.5">
                      <div className="flex items-center gap-1.5 text-[10px] font-semibold text-accent-500 uppercase tracking-wider">
                        <Sparkles className="w-3 h-3 animate-pulse" />
                        <span>推荐执行动作</span>
                      </div>
                      
                      {msg.customAction.type === 'add_task' && (
                        <>
                          <div className="text-[12.5px] font-medium text-text-main">{msg.customAction.payload.title}</div>
                          <p className="text-[11px] text-text-muted leading-relaxed font-light">{msg.customAction.payload.description}</p>
                          <div className="flex items-center justify-between text-[10px] text-text-muted mt-1 bg-white/[0.02] p-1.5 rounded">
                            <span>岗位：{roleLabels[msg.customAction.payload.role as Role]}岗</span>
                            <span>输出：{msg.customAction.payload.outputFormat.split('：')[0]}</span>
                          </div>
                        </>
                      )}

                      {msg.customAction.type === 'apply_prompt' && (
                        <div className="text-[11px] text-text-muted leading-relaxed font-light line-clamp-3 bg-white/[0.02] p-2 rounded border border-white/[0.04] font-mono">
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
                <div className="bg-white/[0.03] border border-white/[0.04] rounded-[18px] rounded-tl-none px-4 py-3 flex items-center gap-1.5 shrink-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-accent-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-accent-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-1.5 h-1.5 rounded-full bg-accent-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            
            <div ref={bottomRef} />
          </div>

          {/* Input text block */}
          <div className="px-5 py-4 border-t border-white/[0.05] shrink-0 flex items-center gap-3 bg-black/[0.15]">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSend()
              }}
              placeholder="向 AI 咨询关于大促工作包的任何问题..."
              className="flex-1 bg-white/[0.04] border border-white/[0.06] rounded-xl px-3.5 py-2.5 text-[12px] text-text-main placeholder:text-text-placeholder outline-none focus:border-accent-500/40 transition-all focus:bg-white/[0.07]"
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
