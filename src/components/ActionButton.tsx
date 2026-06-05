import type { ReactNode } from 'react'
import type { LucideIcon } from 'lucide-react'

interface ActionButtonProps {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
  icon?: LucideIcon
  onClick?: () => void
  className?: string
  type?: 'button' | 'submit'
  disabled?: boolean
}

const variants = {
  primary: 'bg-ai-600 text-white hover:bg-ai-700 shadow-sm',
  secondary: 'bg-white border border-border-default text-text-secondary hover:bg-gray-50',
  danger: 'bg-error-soft text-error border border-red-200 hover:bg-red-100',
  ghost: 'text-text-muted hover:text-text-secondary hover:bg-gray-50',
}

export default function ActionButton({
  children,
  variant = 'primary',
  icon: Icon,
  onClick,
  className = '',
  type = 'button',
  disabled,
}: ActionButtonProps) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium rounded-xl transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
    >
      {Icon && <Icon className="w-4 h-4" />}
      {children}
    </button>
  )
}
