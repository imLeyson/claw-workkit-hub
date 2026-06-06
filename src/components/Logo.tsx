interface LogoProps {
  variant?: 'full' | 'icon'
  theme?: 'light' | 'dark'
  size?: number
}

export default function Logo({ variant = 'full', theme = 'light', size = 24 }: LogoProps) {
  const primary = '#E07B4C'
  const textColor = theme === 'light' ? '#1C1C1E' : '#FAFAF9'
  const muted = theme === 'light' ? '#6B7280' : 'rgba(255,255,255,0.45)'

  const icon = (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ flexShrink: 0 }}
    >
      {/* Left vertical module — Work Kit structure */}
      <rect x="7" y="6" width="6" height="21" rx="3" fill={primary} />
      {/* Right bowl module — Promo flow container, separated from left */}
      <path
        d="
          M 14.5 6
          H 21
          C 25.5 6 28 8.8 28 13
          C 28 17.2 25.5 20 21 20
          H 16.5
          C 15.4 20 14.5 19.1 14.5 18
          V 16.5
          H 20.5
          C 23.1 16.5 24.7 15.2 24.7 13
          C 24.7 10.8 23.1 9.5 20.5 9.5
          H 14.5
          V 6
          Z
        "
        fill={primary}
      />
    </svg>
  )

  if (variant === 'icon') return icon

  return (
    <div className="flex items-center gap-[10px] select-none" style={{ whiteSpace: 'nowrap' }}>
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
