interface LogoProps {
  variant?: 'full' | 'icon'
  theme?: 'light' | 'dark'
  size?: number
}

export default function Logo({ variant = 'full', theme = 'light', size = 24 }: LogoProps) {
  const primary = '#E07B4C'
  const primaryDark = '#C9693F'
  const textColor = theme === 'light' ? '#1A1A1A' : '#FFFFFF'
  const textMuted = theme === 'light' ? '#8A8A8A' : 'rgba(255,255,255,0.5)'
  const boxFill = theme === 'light' ? '#FDF6F2' : 'rgba(224,123,76,0.15)'

  const icon = (
    <svg
      width={size}
      height={size}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ flexShrink: 0 }}
    >
      {/* Kit box body */}
      <rect
        x="5"
        y="8"
        width="35"
        height="34"
        rx="9"
        stroke={primary}
        strokeWidth="2.5"
        fill={boxFill}
      />
      {/* Box lid accent line */}
      <path
        d="M5 17 L40 17"
        stroke={primary}
        strokeWidth="2"
        opacity="0.6"
      />
      {/* Upward growth arrow */}
      <path
        d="M18 33 L24 21 L27 21 L33 33"
        stroke={primaryDark}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* Arrow head */}
      <path
        d="M21 21 L24 14 L27 21"
        stroke={primaryDark}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      {/* AI node dots */}
      <circle cx="38" cy="11" r="2.5" fill={primary} />
      <circle cx="38" cy="22" r="2" fill={primary} opacity="0.7" />
    </svg>
  )

  if (variant === 'icon') return icon

  return (
    <div className="flex items-center gap-2.5" style={{ whiteSpace: 'nowrap' }}>
      {icon}
      <div className="flex flex-col leading-tight">
        <span
          className="text-[15px] font-semibold tracking-[-0.01em]"
          style={{ color: textColor }}
        >
          PromoKit AI
        </span>
        {size >= 24 && (
          <span
            className="text-[10px] tracking-[0.04em]"
            style={{ color: textMuted }}
          >
            电商大促 AI 工作包系统
          </span>
        )}
      </div>
    </div>
  )
}
