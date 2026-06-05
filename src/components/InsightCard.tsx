import type { ReactNode } from 'react'
import { Lightbulb } from 'lucide-react'

interface InsightCardProps {
  title: string
  children: ReactNode
}

export default function InsightCard({ title, children }: InsightCardProps) {
  return (
    <div className="border-l-4 border-ai-400 bg-ai-50/60 rounded-r-2xl p-5 card-hover">
      <div className="flex items-start gap-3">
        <div className="w-8 h-8 rounded-lg bg-ai-100 flex items-center justify-center shrink-0 mt-0.5">
          <Lightbulb className="w-4 h-4 text-ai-600" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-text-main mb-1.5">{title}</h3>
          <div className="text-sm text-text-secondary leading-relaxed">{children}</div>
        </div>
      </div>
    </div>
  )
}
