import type { LucideIcon } from 'lucide-react'

interface MetricCardProps {
  icon: LucideIcon
  label: string
  value: string
  sub?: string
  progress?: number // 0-100
  color?: 'blue' | 'green' | 'purple' | 'gray'
}

const colorMap = {
  blue: {
    iconBg: 'bg-gradient-to-br from-blue-50 to-indigo-100',
    iconColor: 'text-blue-600',
    barGradient: 'progress-gradient',
    valueColor: 'text-blue-700',
    border: 'border-l-blue-500',
  },
  green: {
    iconBg: 'bg-gradient-to-br from-emerald-50 to-teal-100',
    iconColor: 'text-emerald-600',
    barGradient: 'bg-gradient-to-r from-emerald-400 to-teal-400',
    valueColor: 'text-emerald-700',
    border: 'border-l-emerald-500',
  },
  purple: {
    iconBg: 'bg-gradient-to-br from-purple-50 to-violet-100',
    iconColor: 'text-purple-600',
    barGradient: 'bg-gradient-to-r from-purple-400 to-violet-400',
    valueColor: 'text-purple-700',
    border: 'border-l-purple-500',
  },
  gray: {
    iconBg: 'bg-gray-50',
    iconColor: 'text-gray-400',
    barGradient: 'bg-gray-300',
    valueColor: 'text-gray-500',
    border: 'border-l-gray-400',
  },
}

export default function MetricCard({ icon: Icon, label, value, sub, progress, color = 'blue' }: MetricCardProps) {
  const c = colorMap[color]

  return (
    <div className={`card-surface p-5 flex flex-col gap-3 border-l-[3px] ${c.border} pl-[17px]`}>
      <div className="flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl ${c.iconBg} flex items-center justify-center shrink-0`}>
          <Icon className={`w-5 h-5 ${c.iconColor}`} />
        </div>
        <div>
          <div className="text-xs font-medium text-text-muted uppercase tracking-wide">{label}</div>
          <div className={`text-xl font-semibold tracking-tight ${c.valueColor}`}>{value}</div>
        </div>
      </div>
      {progress !== undefined && (
        <div>
          <div className="w-full h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
            <div
              className={`h-full ${c.barGradient} rounded-full transition-all duration-500`}
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            />
          </div>
        </div>
      )}
      {sub && <div className="text-xs text-text-muted">{sub}</div>}
    </div>
  )
}
