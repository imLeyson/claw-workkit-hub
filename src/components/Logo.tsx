interface LogoProps {
  variant?: 'full' | 'icon'
  theme?: 'light' | 'dark'
  size?: number
}

export default function Logo({ variant = 'full', theme = 'light', size = 24 }: LogoProps) {
  const accent = '#E07B4C'
  const accentDark = '#C9693F'
  const textColor = theme === 'light' ? '#1A1A1A' : '#FFFFFF'
  const textMuted = theme === 'light' ? '#8A8A8A' : 'rgba(255,255,255,0.45)'

  const icon = (
    <svg
      width={size}
      height={size}
      viewBox="0 0 36 36"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ flexShrink: 0 }}
    >
      {/* P stem */}
      <rect x="6" y="5" width="5" height="26" rx="2.5" fill={accent} />
      {/* P bowl */}
      <path
        d="M 11 5 H 25 A 8 8 0 0 1 25 21 H 11 V 5 Z"
        fill={accent}
        opacity="0.85"
      />
      {/* K accent slash */}
      <path
        d="M 8 20 L 14 18 L 8 16"
        stroke={accentDark}
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.6"
      />
    </svg>
  )

  if (variant === 'icon') return icon

  return (
    <div className="flex items-center gap-2.5 select-none" style={{ whiteSpace: 'nowrap' }}>
      {icon}
      <div className="flex flex-col">
        <span
          className="text-[15px] font-semibold tracking-[-0.01em] leading-tight"
          style={{ color: textColor }}
        >
          PromoKit AI
        </span>
        {size >= 20 && (
          <span
            className="text-[10px] tracking-[0.04em] leading-tight"
            style={{ color: textMuted }}
          >
            电商大促 AI 工作包系统
          </span>
        )}
      </div>
    </div>
  )
}
