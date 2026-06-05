export interface Project {
  id: string
  name: string
  description: string
  category: string // 商品类目
  campaign: string // 活动场景 e.g. "618 年中大促"
  competitors: Competitor[]
  status: 'draft' | 'in_progress' | 'completed'
  createdAt: string
  team: TeamMember[]
}

export interface Competitor {
  name: string
  brand: string
  platform: '天猫' | '京东' | '抖音商城' | '拼多多'
  price: string
  reviewCount: number
  rating: number
  topIssues: string[]
  productUrl?: string
}

export interface ReviewSample {
  id: string
  competitorId: string
  text: string
  rating: 1 | 2 | 3 | 4 | 5
  platform: string
  sentiment: 'positive' | 'negative' | 'neutral'
  topic: string
}

export interface CustomerQuery {
  id: string
  question: string
  category: 'pre_sale' | 'after_sale'
  frequency: 'high' | 'medium' | 'low'
  riskLevel: 'normal' | 'caution' | 'high'
}

export interface CopySnippet {
  id: string
  type: 'detail_page' | 'livestream' | 'xiaohongshu' | 'campaign'
  content: string
  source: string
}

export type Role = 'operations' | 'copywriting' | 'customer_service' | 'design' | 'merchandise'

export interface TeamMember {
  name: string
  role: Role
}

export type MaterialType = 'review' | 'spec' | 'faq' | 'copy_asset'
export type Sensitivity = 'normal' | 'sensitive' | 'need_review'

export interface Material {
  id: string
  projectId: string
  type: MaterialType
  label: string
  content: string
  uploadedAt: string
  fileName?: string
  aiStatus: 'readable' | 'processing' | 'need_review'
  sensitivity: Sensitivity
  responsibleRole: Role
  referencedBy: string[]
  reviewCount?: number
  rating?: number
  platform?: string
  price?: string
  topIssues?: string[]
}

export interface TaskCard {
  id: string
  projectId: string
  role: Role
  title: string
  description: string
  status: 'pending' | 'ready' | 'generated' | 'submitted'
  assignedTo?: string
  inputMaterials: string[]
  promptPreview: string
  outputFormat: string
  judgmentCriteria: string[]
  sourceTags: string[] // 资料来源标签
}

export interface AISection {
  title: string
  type: 'matrix' | 'list' | 'qa' | 'text' | 'bullet' | 'quotes'
  headers?: string[]
  rows?: string[][]
  items?: string[]
  qa?: { q: string; a: string }[]
  body?: string
  quotes?: { text: string; source: string }[]
}

export interface AIResult {
  id: string
  taskId: string
  title: string
  sections: AISection[]
  generatedAt: string
  submitted: boolean
}

export interface Report {
  id: string
  projectId: string
  title: string
  background: string
  dataScope: string
  sections: ReportSection[]
  nextSteps: string[]
  createdAt: string
  executiveSummary: string[]
}

export interface ReportSection {
  role: Role
  roleLabel: string
  results: AIResult[]
}

export interface WorkKitVersion {
  version: string
  date: string
  changes: string
}

export interface WorkKit {
  id: string
  name: string
  version: string
  basedOnProjectId: string
  basedOnProjectName: string
  description: string
  scenario: string
  includedRoles: Role[]
  materialStructure: string
  sections: WorkKitSection[]
  createdAt: string
  tags: string[]
  feedback: string
  versionHistory: WorkKitVersion[]
  reuseCount: number
  rating: number
}

export interface WorkKitSection {
  title: string
  role: Role
  content: AISection[]
}
