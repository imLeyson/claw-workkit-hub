import type { ReactNode } from 'react'

interface SectionCardProps {
  title?: string
  subtitle?: string
  children: ReactNode
  className?: string
  compact?: boolean
}

export default function SectionCard({ title, subtitle, children, className = '', compact }: SectionCardProps) {
  return (
    <div className={`card-surface rounded-2xl ${compact ? 'p-4' : 'p-5'} ${className}`}>
      {title && (
        <div className="mb-4">
          <h3 className="heading-card">{title}</h3>
          {subtitle && <p className="text-xs text-text-muted mt-0.5">{subtitle}</p>}
        </div>
      )}
      {children}
    </div>
  )
}
