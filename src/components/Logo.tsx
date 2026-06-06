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
      <path
        d="
          M 7 6
          C 7 4.9 7.9 4 9 4
          H 19.8
          C 25.4 4 29 7.4 29 12.6
          C 29 17.8 25.4 21.2 19.8 21.2
          H 15.2
          V 25
          C 15.2 26.7 13.9 28 12.2 28
          H 9
          C 7.9 28 7 27.1 7 26
          V 6
          Z

          M 15.2 9.4
          V 15.8
          H 19
          C 21.7 15.8 23.4 14.6 23.4 12.6
          C 23.4 10.6 21.7 9.4 19 9.4
          H 15.2
          Z
        "
        fill={primary}
        fillRule="evenodd"
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
