import type { Project, Material, TaskCard, AIResult, WorkKit } from '../types'
import { mockProjects, mockMaterials, mockTaskCards, mockAIResults, mockWorkKits } from '../data/mock'
import { supabase } from './supabase'

// ── LocalStorage ───────────────────────────────────────────

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
  const projects = getProjects()
  projects.push(p)
  write('promokit_projects', projects)
  // Sync to Supabase
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

// ── Materials ──────────────────────────────────────────────

export function getMaterials(projectId: string): Material[] {
  const all = read<Record<string, Material[]>>('promokit_materials', mockMaterials)
  return all[projectId] ?? []
}

// ── Task Cards ─────────────────────────────────────────────

export function getTasks(projectId: string): TaskCard[] {
  const all = read<Record<string, TaskCard[]>>('promokit_tasks', mockTaskCards)
  return all[projectId] ?? []
}

export function updateTask(task: TaskCard) {
  const all = read<Record<string, TaskCard[]>>('promokit_tasks', mockTaskCards)
  const list = all[task.projectId]
  if (list) {
    const idx = list.findIndex((t) => t.id === task.id)
    if (idx >= 0) { list[idx] = task; write('promokit_tasks', all) }
  }
}

// ── AI Results ─────────────────────────────────────────────

export function getAIResult(taskId: string): AIResult | undefined {
  const all = read<Record<string, AIResult>>('promokit_results', mockAIResults)
  return all[taskId]
}

export async function saveAIResult(r: AIResult) {
  const all = read<Record<string, AIResult>>('promokit_results', mockAIResults)
  all[r.taskId] = r
  write('promokit_results', all)
  try {
    await supabase.from('ai_results').upsert({
      id: r.id, task_id: r.taskId, title: r.title,
      sections: r.sections, submitted: r.submitted,
    })
  } catch { /* offline */ }
}

// ── Work Kits ──────────────────────────────────────────────

export function getWorkKits(): WorkKit[] {
  return read<WorkKit[]>('promokit_kits', mockWorkKits)
}

export function getWorkKitById(id: string): WorkKit | undefined {
  return getWorkKits().find((k) => k.id === id)
}

// ── Reset ──────────────────────────────────────────────────

export function resetAllData() {
  localStorage.removeItem(SEEDED_KEY)
  ensureSeeded()
}
