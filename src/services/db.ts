import type { Project, Material, TaskCard, AIResult, WorkKit, Role, MaterialType } from '../types'
import { mockProjects, mockMaterials, mockTaskCards, mockAIResults, mockWorkKits } from '../data/mock'
import { isSupabaseConfigured, supabase } from './supabase'

// ── LocalStorage helpers ──────────────────────────────────
function read<T>(key: string, fallback: T): T {
  try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback }
  catch { return fallback }
}
function write<T>(key: string, data: T) { localStorage.setItem(key, JSON.stringify(data)) }

const SEEDED_KEY = 'promokit_seeded'
function ensureSeeded() {
  if (!localStorage.getItem(SEEDED_KEY)) {
    write('promokit_projects', mockProjects)
    write('promokit_materials', mockMaterials)
    write('promokit_tasks', mockTaskCards)
    write('promokit_results', mockAIResults)
    write('promokit_kits', mockWorkKits)
    localStorage.setItem(SEEDED_KEY, '1')
  }
}
ensureSeeded()

// ── Supabase sync: load on init ──────────────────────────
async function syncFromSupabase() {
  if (!isSupabaseConfigured) return
  try {
    const { data: projects } = await supabase.from('projects').select('*')
    if (projects && projects.length > 0) {
      const enriched: Project[] = []
      for (const p of projects) {
        const { data: comps } = await supabase.from('competitors').select('*').eq('project_id', p.id)
        enriched.push({
          id: p.id, slug: p.slug, name: p.name, description: p.description || '',
          category: p.category || '', campaign: p.campaign || '',
          status: p.status || 'draft', createdAt: p.created_at?.split('T')[0] || '',
          competitors: (comps || []).map((c: any) => ({
            name: c.name || '', brand: c.brand || '', platform: c.platform || '天猫',
            price: c.price || '¥0', reviewCount: c.review_count || 0,
            rating: c.rating || 0, topIssues: c.top_issues || [],
          })),
          team: [],
        })
      }
      write('promokit_projects', enriched)
    }
    const { data: tasks } = await supabase.from('task_cards').select('*')
    if (tasks && tasks.length > 0) {
      const grouped: Record<string, TaskCard[]> = {}
      for (const t of tasks) {
        if (!grouped[t.project_id]) grouped[t.project_id] = []
        grouped[t.project_id].push({
          id: t.id, projectId: t.project_id, role: t.role, title: t.title || '',
          description: t.description || '', status: t.status || 'pending',
          assignedTo: t.assigned_to || '', promptPreview: t.prompt_preview || '',
          inputMaterials: t.input_materials || [], outputFormat: t.output_format || '',
          judgmentCriteria: t.judgment_criteria || [], sourceTags: t.source_tags || [],
        })
      }
      write('promokit_tasks', grouped)
    }
    const { data: results } = await supabase.from('ai_results').select('*')
    if (results && results.length > 0) {
      const grouped: Record<string, AIResult> = {}
      for (const r of results) {
        grouped[r.task_id] = {
          id: r.id, taskId: r.task_id, title: r.title || '',
          sections: r.sections || [], generatedAt: r.generated_at || '', submitted: r.submitted || false,
        }
      }
      write('promokit_results', grouped)
    }
  } catch { /* offline — localStorage is fine */ }
}
syncFromSupabase()

// ── Projects ───────────────────────────────────────────────
export function getProjects(): Project[] {
  return read<Project[]>('promokit_projects', mockProjects)
}
export function getProjectBySlug(slug: string): Project | undefined {
  return getProjects().find((p) => p.slug === slug)
}
export function getProjectById(id: string): Project | undefined {
  return getProjects().find((p) => p.id === id)
}
export async function addProject(p: Project) {
  const projects = getProjects(); projects.push(p)
  write('promokit_projects', projects)
  try {
    await supabase.from('projects').insert({
      id: p.id, slug: p.slug, name: p.name, description: p.description,
      category: p.category, campaign: p.campaign, status: p.status,
    })
    for (const c of p.competitors) {
      await supabase.from('competitors').insert({
        project_id: p.id, name: c.name, brand: c.brand, platform: c.platform,
        price: c.price, review_count: c.reviewCount, rating: c.rating, top_issues: c.topIssues,
      })
    }
  } catch { /* offline — localStorage is fine */ }
}

export function deleteProject(projectId: string) {
  const projects = getProjects().filter((p) => p.id !== projectId)
  write('promokit_projects', projects)

  const allMats = read<Record<string, Material[]>>('promokit_materials', mockMaterials)
  delete allMats[projectId]
  write('promokit_materials', allMats)

  const allTasks = read<Record<string, TaskCard[]>>('promokit_tasks', mockTaskCards)
  const deletedTaskIds = new Set((allTasks[projectId] || []).map((t) => t.id))
  delete allTasks[projectId]
  write('promokit_tasks', allTasks)

  const allResults = read<Record<string, AIResult>>('promokit_results', mockAIResults)
  deletedTaskIds.forEach((taskId) => { delete allResults[taskId] })
  write('promokit_results', allResults)

  const kits = getWorkKits().filter((k) => k.basedOnProjectId !== projectId)
  write('promokit_kits', kits)
}

// ── Materials ──────────────────────────────────────────────
export function getMaterials(projectId: string): Material[] {
  const all = read<Record<string, Material[]>>('promokit_materials', mockMaterials)
  return all[projectId] ?? []
}
export async function addMaterial(projectId: string, m: Material) {
  const all = read<Record<string, Material[]>>('promokit_materials', mockMaterials)
  if (!all[projectId]) all[projectId] = []; all[projectId].push(m)
  write('promokit_materials', all)
  try { await supabase.from('materials').insert({ id: m.id, project_id: projectId, type: m.type, label: m.label, file_name: m.fileName, content: m.content }) } catch {}
}

// ── Task Cards ─────────────────────────────────────────────
export function getTasks(projectId: string): TaskCard[] {
  const all = read<Record<string, TaskCard[]>>('promokit_tasks', mockTaskCards)
  return all[projectId] ?? []
}
export async function addTask(task: TaskCard) {
  const all = read<Record<string, TaskCard[]>>('promokit_tasks', mockTaskCards)
  if (!all[task.projectId]) all[task.projectId] = []; all[task.projectId].push(task)
  write('promokit_tasks', all)
  try { await supabase.from('task_cards').insert({ id: task.id, project_id: task.projectId, role: task.role, title: task.title, description: task.description, status: task.status, prompt_preview: task.promptPreview, assigned_to: task.assignedTo, input_materials: task.inputMaterials, source_tags: task.sourceTags }) } catch {}
}
export function updateTask(task: TaskCard) {
  const all = read<Record<string, TaskCard[]>>('promokit_tasks', mockTaskCards)
  const list = all[task.projectId]
  if (list) { const idx = list.findIndex((t) => t.id === task.id); if (idx >= 0) { list[idx] = task; write('promokit_tasks', all) } }
}

const roleMaterialRules: Record<Role, MaterialType[]> = {
  merchandise: ['review', 'spec'],
  copywriting: ['review', 'spec', 'copy_asset'],
  customer_service: ['review', 'faq'],
  design: ['review', 'spec', 'copy_asset'],
  operations: ['review', 'spec', 'faq', 'copy_asset'],
}

export function refreshTaskMaterialLinks(projectId: string) {
  const materials = getMaterials(projectId)
  const all = read<Record<string, TaskCard[]>>('promokit_tasks', mockTaskCards)
  const list = all[projectId]
  if (!list) return

  all[projectId] = list.map((task) => {
    const allowedTypes = roleMaterialRules[task.role] ?? ['review']
    const inputMaterials = materials.filter((m) => allowedTypes.includes(m.type)).map((m) => m.id)
    const status = task.status === 'generated' || task.status === 'submitted'
      ? task.status
      : inputMaterials.length > 0 ? 'ready' : 'pending'
    if (inputMaterials.join('|') === task.inputMaterials.join('|') && status === task.status) return task
    return { ...task, inputMaterials, status }
  })
  write('promokit_tasks', all)
}

// ── AI Results ─────────────────────────────────────────────
export function getAIResult(taskId: string): AIResult | undefined {
  const all = read<Record<string, AIResult>>('promokit_results', mockAIResults)
  return all[taskId]
}
export async function saveAIResult(r: AIResult) {
  const all = read<Record<string, AIResult>>('promokit_results', mockAIResults)
  all[r.taskId] = r; write('promokit_results', all)
  try { await supabase.from('ai_results').upsert({ id: r.id, task_id: r.taskId, title: r.title, sections: r.sections, submitted: r.submitted }) } catch {}
}

// ── Work Kits ──────────────────────────────────────────────
export function getWorkKits(): WorkKit[] { return read<WorkKit[]>('promokit_kits', mockWorkKits) }
export function getWorkKitById(id: string): WorkKit | undefined { return getWorkKits().find((k) => k.id === id) }
function nextMinorVersion(version: string): string {
  const match = version.match(/^v(\d+)\.(\d+)$/)
  if (!match) return 'v1.1'
  return `v${match[1]}.${Number(match[2]) + 1}`
}

export function upsertWorkKitFromProject(kit: WorkKit): { kit: WorkKit; mode: 'created' | 'updated' } {
  const kits = getWorkKits()
  const existingIndex = kits.findIndex((k) => k.basedOnProjectId === kit.basedOnProjectId)
  const today = new Date().toISOString().split('T')[0]

  if (existingIndex >= 0) {
    const existing = kits[existingIndex]
    const nextVersion = nextMinorVersion(existing.version)
    const updated: WorkKit = {
      ...existing,
      ...kit,
      id: existing.id,
      version: nextVersion,
      createdAt: existing.createdAt,
      reuseCount: existing.reuseCount,
      rating: existing.rating,
      versionHistory: [
        { version: nextVersion, date: today, changes: `更新版本：同步「${kit.basedOnProjectName}」最新报告结果与任务模板` },
        ...existing.versionHistory,
      ],
    }
    kits[existingIndex] = updated
    write('promokit_kits', kits)
    return { kit: updated, mode: 'updated' }
  }

  write('promokit_kits', [...kits, kit])
  return { kit, mode: 'created' }
}

export function incrementWorkKitReuse(id: string) {
  const kits = getWorkKits()
  const idx = kits.findIndex((k) => k.id === id)
  if (idx < 0) return
  kits[idx] = { ...kits[idx], reuseCount: kits[idx].reuseCount + 1 }
  write('promokit_kits', kits)
}

// ── Cleanup ────────────────────────────────────────────────
export function deleteProjectData(projectId: string) {
  deleteProject(projectId)
}

export function resetAllData() {
  localStorage.removeItem(SEEDED_KEY)
  ensureSeeded()
}
