// Logo conceptual de River ID: un escudo blanco con la banda roja.
function Logo({ size = 40 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true">
      <defs>
        <clipPath id="logo-clip">
          <rect x="1" y="1" width="38" height="38" rx="10" />
        </clipPath>
      </defs>
      <rect x="1" y="1" width="38" height="38" rx="10" fill="#fff" />
      <path d="M-2 30 L30 -2 L42 10 L10 42 Z" fill="#9E182B" clipPath="url(#logo-clip)" />
      <rect x="1" y="1" width="38" height="38" rx="10" fill="none" stroke="#171717" strokeWidth="2" />
    </svg>
  )
}

export default Logo
