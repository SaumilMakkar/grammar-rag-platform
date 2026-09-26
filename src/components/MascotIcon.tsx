export default function MascotIcon() {
  return (
    <svg viewBox="0 0 200 220" className="mascot-svg" role="img" aria-label="Marginalia assistant mascot">
      <defs>
        <linearGradient id="mascot-body" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="var(--neon-strong)" />
          <stop offset="100%" stopColor="#0fae63" />
        </linearGradient>
        <radialGradient id="mascot-eye" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#eafff4" />
          <stop offset="100%" stopColor="var(--neon)" />
        </radialGradient>
      </defs>

      {/* antenna */}
      <line x1="100" y1="18" x2="100" y2="40" stroke="var(--neon)" strokeWidth="3" />
      <circle cx="100" cy="14" r="7" fill="url(#mascot-body)" />

      {/* head */}
      <rect x="35" y="40" width="130" height="110" rx="34" fill="url(#mascot-body)" />
      <rect x="35" y="40" width="130" height="110" rx="34" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="2" />

      {/* visor */}
      <rect x="55" y="70" width="90" height="46" rx="20" fill="#04160d" opacity="0.55" />
      <circle cx="82" cy="93" r="12" fill="url(#mascot-eye)" />
      <circle cx="118" cy="93" r="12" fill="url(#mascot-eye)" />

      {/* body */}
      <rect x="55" y="155" width="90" height="55" rx="18" fill="url(#mascot-body)" opacity="0.9" />
      <circle cx="100" cy="182" r="10" fill="#04160d" opacity="0.5" />

      {/* side antennae */}
      <circle cx="30" cy="95" r="6" fill="var(--neon)" />
      <circle cx="170" cy="95" r="6" fill="var(--neon)" />
    </svg>
  );
}
