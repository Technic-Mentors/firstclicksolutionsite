/**
 * The artwork on the sign-in brand panel: a dashboard reduced to its shapes.
 *
 * Decoration, so it is hidden from screen readers — the heading beside it already says what
 * this product is. Drawn rather than photographed so it stays sharp at any size and adds no
 * weight to a page whose whole job is to load fast and take a password.
 *
 * The motion is deliberately small: bars grow in once, the trend line draws itself once, and
 * after that only the cards drift. Anything livelier competes with the form. The `art-*`
 * classes live in index.css and all stop under prefers-reduced-motion.
 */
export default function DashboardArt({ className }) {
  return (
    <svg
      viewBox="0 0 420 250"
      preserveAspectRatio="xMidYMid meet"
      className={className}
      fill="none"
      aria-hidden="true"
    >
      <circle
        cx="210"
        cy="132"
        r="104"
        stroke="#ffffff"
        strokeOpacity="0.1"
        strokeWidth="2"
        strokeDasharray="4 7"
        className="art-ring"
        style={{ transformBox: 'fill-box' }}
      />
      <circle cx="210" cy="132" r="78" fill="#ffffff" fillOpacity="0.04" />

      {/* monitor */}
      <rect x="128" y="68" width="164" height="104" rx="7" fill="#0f3d21" stroke="#ffffff" strokeOpacity="0.35" strokeWidth="2" />
      <rect x="140" y="80" width="34" height="7" rx="3.5" fill="#ffffff" fillOpacity="0.3" />
      <rect x="182" y="80" width="24" height="7" rx="3.5" fill="#ffffff" fillOpacity="0.18" />
      <rect x="238" y="80" width="42" height="7" rx="3.5" fill="#f06c0c" fillOpacity="0.8" />

      {/* bars — each one starts a beat after the last, left to right */}
      <g style={{ transformBox: 'fill-box' }}>
        <rect x="146" y="132" width="13" height="26" rx="3" fill="#ffffff" fillOpacity="0.35" className="art-bar" style={{ animationDelay: '0.15s' }} />
        <rect x="167" y="116" width="13" height="42" rx="3" fill="#a3d244" className="art-bar" style={{ animationDelay: '0.27s' }} />
        <rect x="188" y="126" width="13" height="32" rx="3" fill="#ffffff" fillOpacity="0.35" className="art-bar" style={{ animationDelay: '0.39s' }} />
        <rect x="209" y="104" width="13" height="54" rx="3" fill="#a3d244" className="art-bar" style={{ animationDelay: '0.51s' }} />
        <rect x="230" y="122" width="13" height="36" rx="3" fill="#ffffff" fillOpacity="0.35" className="art-bar" style={{ animationDelay: '0.63s' }} />
      </g>

      <path
        d="M146 142l21-14 21 8 21-20 21 10 21-22"
        stroke="#f06c0c"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="art-draw"
      />
      <rect x="186" y="180" width="48" height="10" fill="#0f3d21" stroke="#ffffff" strokeOpacity="0.25" strokeWidth="2" />
      <rect x="168" y="190" width="84" height="7" rx="3.5" fill="#ffffff" fillOpacity="0.25" />

      {/* tower */}
      <rect x="312" y="96" width="34" height="78" rx="5" fill="#0f3d21" stroke="#ffffff" strokeOpacity="0.25" strokeWidth="2" />
      <rect x="320" y="106" width="18" height="4" rx="2" fill="#ffffff" fillOpacity="0.3" />
      <rect x="320" y="116" width="18" height="4" rx="2" fill="#ffffff" fillOpacity="0.18" />
      <circle cx="329" cy="158" r="4" fill="#a3d244" className="dash-pulse" />

      {/* floating cards, each drifting out of step with the others */}
      <g className="art-drift" style={{ transformBox: 'fill-box' }}>
        <rect x="52" y="96" width="86" height="34" rx="7" fill="#ffffff" />
        <circle cx="70" cy="113" r="8" fill="#15803d" />
        <path d="m66.5 113 2.6 2.6 4.6-5" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="84" y="106" width="40" height="5" rx="2.5" fill="#d6d3d1" />
        <rect x="84" y="116" width="26" height="5" rx="2.5" fill="#e7e5e4" />
      </g>

      <g className="art-drift-slow" style={{ transformBox: 'fill-box' }}>
        <rect x="282" y="50" width="76" height="32" rx="7" fill="#ffffff" />
        <path d="m300 58 2 4.2 4.6.6-3.4 3.2.8 4.6-4-2.2-4 2.2.8-4.6-3.4-3.2 4.6-.6 2-4.2Z" fill="#f06c0c" />
        <rect x="314" y="60" width="34" height="5" rx="2.5" fill="#d6d3d1" />
        <rect x="314" y="69" width="22" height="5" rx="2.5" fill="#e7e5e4" />
      </g>

      <g className="art-drift-slower" style={{ transformBox: 'fill-box' }}>
        <rect x="46" y="172" width="86" height="36" rx="7" fill="#f06c0c" />
        <path d="m62 182 8 4 8-4-8-4-8 4Zm0 0v8l8 4 8-4v-8" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="86" y="183" width="34" height="5" rx="2.5" fill="#ffffff" fillOpacity="0.85" />
        <rect x="86" y="193" width="22" height="5" rx="2.5" fill="#ffffff" fillOpacity="0.55" />
      </g>

      <circle cx="140" cy="214" r="4" fill="#f06c0c" className="dash-pulse" />
      <circle cx="276" cy="98" r="4" fill="#a3d244" className="dash-pulse-slow" />
    </svg>
  );
}
