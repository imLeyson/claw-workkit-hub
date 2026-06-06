interface LogoProps {
  variant?: 'full' | 'icon'
  theme?: 'light' | 'dark'
  size?: number
}

export default function Logo({ variant = 'full', theme = 'light', size = 24 }: LogoProps) {
  const primary = '#E07B4C'
  const textColor = theme === 'light' ? '#1C1C1E' : '#FAFAF9'
  const muted = theme === 'light' ? '#6B7280' : 'rgba(255,255,255,0.40)'

  const icon = (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ flexShrink: 0 }}
    >
      {/* Stem — solid vertical module */}
      <rect x="7" y="5" width="5" height="22" rx="2.5" fill={primary} />
      {/* Bowl — open stroke container */}
      <path
        d="M 12 5 H 19 C 24 5 27 9 27 13.5 C 27 18 24 21 19 21"
        stroke={primary}
        strokeWidth="5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )

  if (variant === 'icon') return icon

  return (
    <div className="flex items-center gap-2.5 select-none" style={{ whiteSpace: 'nowrap' }}>
      {icon}
      <div className="flex flex-col leading-tight">
        <span className="text-[15px] font-semibold tracking-[-0.01em]" style={{ color: textColor }}>
          PromoKit{' '}
          <span style={{ color: primary }}>AI</span>
        </span>
        {size >= 20 && (
          <span className="text-[10px] tracking-[0.04em]" style={{ color: muted }}>
            电商大促 AI 工作包系统
          </span>
        )}
      </div>
    </div>
  )
}
