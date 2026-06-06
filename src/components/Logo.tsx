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
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ flexShrink: 0 }}
    >
      <defs>
        <linearGradient id="promokit-logo-gradient" x1="7" y1="6" x2="42" y2="42" gradientUnits="userSpaceOnUse">
          <stop stopColor="#FF7A2F" />
          <stop offset="1" stopColor="#E85F1E" />
        </linearGradient>
      </defs>
      <path
        d="
          M 9 8
          C 9 6.35 10.35 5 12 5
          H 29.2
          C 37.9 5 44 11.25 44 19.4
          C 44 27.55 37.95 33.6 29.2 33.6
          H 23.4
          C 21.75 33.6 20.4 32.25 20.4 30.6
          V 25.55
          C 20.4 23.9 21.75 22.55 23.4 22.55
          H 28.2
          C 32.05 22.55 34.4 20.6 34.4 17.8
          C 34.4 14.95 32.05 13.05 28.2 13.05
          H 9
          V 8
          Z
        "
        fill="url(#promokit-logo-gradient)"
      />
      <path
        d="
          M 9 20.3
          C 9 18.65 10.35 17.3 12 17.3
          H 15.8
          C 17.45 17.3 18.8 18.65 18.8 20.3
          V 40
          C 18.8 41.65 17.45 43 15.8 43
          H 12
          C 10.35 43 9 41.65 9 40
          V 20.3
          Z
        "
        fill="url(#promokit-logo-gradient)"
      />
    </svg>
  )

  if (variant === 'icon') return icon

  return (
    <div className="flex items-center gap-[12px] select-none" style={{ whiteSpace: 'nowrap' }}>
      {icon}
      <div className="flex flex-col leading-tight">
        <span className="text-[18px] font-bold tracking-[-0.03em]" style={{ color: textColor }}>
          PromoKit{' '}
          <span style={{ color: primary }}>AI</span>
        </span>
        {size >= 20 && (
          <span className="text-[10.5px] tracking-[0.13em] mt-0.5" style={{ color: muted }}>
            电商大促 AI 工作包系统
          </span>
        )}
      </div>
    </div>
  )
}
