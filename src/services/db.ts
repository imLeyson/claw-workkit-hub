import type { Project, Material, TaskCard, AIResult, WorkKit } from '../types'
import { mockProjects, mockMaterials, mockTaskCards, mockAIResults, mockWorkKits } from '../data/mock'

// ── LocalStorage wrapper ──────────────────────────────────

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : fallback
  } catch { return fallback }
}

function write<T>(key: string, data: T) {
  localStorage.setItem(key, JSON.stringify(data))
}

// ── Initialize with mock data on first load ──────────────

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

// ── Export API ────────────────────────────────────────────

// Projects
export function getProjects(): Project[] {
  return read<Project[]>('promokit_projects', mockProjects)
}

export function getProjectBySlug(slug: string): Project | undefined {
  return getProjects().find((p) => p.slug === slug)
}

export function getProjectById(id: string): Project | undefined {
  return getProjects().find((p) => p.id === id)
}

export function addProject(p: Project) {
  const projects = getProjects()
  projects.push(p)
  write('promokit_projects', projects)
}

export function updateProject(p: Project) {
  const projects = getProjects().map((x) => (x.id === p.id ? p : x))
  write('promokit_projects', projects)
}

// Materials (keyed by projectId)
export function getMaterials(projectId: string): Material[] {
  const all = read<Record<string, Material[]>>('promokit_materials', mockMaterials)
  return all[projectId] ?? []
}

export function addMaterial(projectId: string, m: Material) {
  const all = read<Record<string, Material[]>>('promokit_materials', mockMaterials)
  if (!all[projectId]) all[projectId] = []
  all[projectId].push(m)
  write('promokit_materials', all)
}

// Task Cards (keyed by projectId)
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

// AI Results (keyed by taskId)
export function getAIResult(taskId: string): AIResult | undefined {
  const all = read<Record<string, AIResult>>('promokit_results', mockAIResults)
  return all[taskId]
}

export function saveAIResult(r: AIResult) {
  const all = read<Record<string, AIResult>>('promokit_results', mockAIResults)
  all[r.taskId] = r
  write('promokit_results', all)
}

// Work Kits (templates)
export function getWorkKits(): WorkKit[] {
  return read<WorkKit[]>('promokit_kits', mockWorkKits)
}

export function getWorkKitById(id: string): WorkKit | undefined {
  return getWorkKits().find((k) => k.id === id)
}

// Reset (for debugging)
export function resetAllData() {
  localStorage.removeItem(SEEDED_KEY)
  ensureSeeded()
}
