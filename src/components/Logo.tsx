interface LogoProps {
  variant?: 'full' | 'icon'
  theme?: 'light' | 'dark'
  size?: number
}

export default function Logo({ variant = 'full', theme = 'light', size = 24 }: LogoProps) {
  const accent = '#E07B4C'
  const textColor = theme === 'light' ? '#1A1A1A' : '#FFFFFF'
  const muted = theme === 'light' ? '#8A8A8A' : 'rgba(255,255,255,0.40)'

  const icon = (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ flexShrink: 0 }}
    >
      {/* P stem — solid vertical bar */}
      <rect x="6" y="5" width="5.5" height="22" rx="2.75" fill={accent} />
      {/* P bowl — open arc on the right */}
      <path
        d="M 11.5 5 C 22 5 26 12 26 16 C 26 20 22 27 11.5 27"
        stroke={accent}
        strokeWidth="5.5"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  )

  if (variant === 'icon') return icon

  return (
    <div className="flex items-center gap-2.5 select-none" style={{ whiteSpace: 'nowrap' }}>
      {icon}
      <div className="flex flex-col leading-tight">
        <span className="text-[15px] font-semibold tracking-[-0.01em]" style={{ color: textColor }}>
          PromoKit AI
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
