/**
 * Empty-state illustrations for the admin.
 *
 * One visual language across all of them: 2.5px rounded line work in neutral ink, a white
 * fill so they sit on any card, a simple face on the ones that stand in for a record, and a
 * single warm accent for the "still waiting" dots. Nothing here is brand-coloured beyond
 * that accent — the art is decoration, and the heading beside it carries the meaning, so
 * every one of these is hidden from assistive technology.
 *
 * The animations are the shared `dash-*` classes in index.css, which already stop for anyone
 * who asked their system for reduced motion.
 */

const INK = '#d6d3d1';
const INK_SOFT = '#e7e5e4';
const FACE = '#a8a29e';
const ACCENT = '#f06c0c';

/** The face every character wears: two eyes that blink together, and a small smile. */
function Face({ x = 0, y = 0, width = 16 }) {
  const half = width / 2;
  return (
    <g transform={`translate(${x} ${y})`}>
      <g className="dash-blink">
        <circle cx={-half} cy="0" r="2.6" fill={FACE} />
        <circle cx={half} cy="0" r="2.6" fill={FACE} />
      </g>
      <path d={`M${-half + 2} 7c1.6 1.6 ${width - 4} 1.6 ${width - 4} 0`} stroke={FACE} strokeWidth="2.2" strokeLinecap="round" fill="none" />
    </g>
  );
}

/** The two pulsing dots that mean "nothing has arrived yet". */
function WaitingDots({ x = 88, y = 16 }) {
  return (
    <g>
      <circle cx={x} cy={y} r="3" fill={ACCENT} className="dash-pulse" />
      <circle cx={x + 9} cy={y - 4} r="2.2" fill={ACCENT} className="dash-pulse-slow" />
    </g>
  );
}

/** A parcel on a conveyor — orders. */
export function WaitingForOrdersArt() {
  return (
    <svg width="116" height="96" viewBox="0 0 116 96" fill="none" aria-hidden="true">
      <g className="dash-float">
        <rect x="36" y="22" width="44" height="38" rx="5" stroke={INK} strokeWidth="2.5" fill="#fff" />
        <path d="M36 34h44" stroke={INK_SOFT} strokeWidth="2.5" />
        <path d="M58 22v12" stroke={INK_SOFT} strokeWidth="2.5" />
        <Face x={58} y={45} />
      </g>
      <path d="M22 72h72" stroke={INK} strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="32" cy="79" r="4" stroke={INK_SOFT} strokeWidth="2.2" />
      <circle cx="58" cy="79" r="4" stroke={INK_SOFT} strokeWidth="2.2" />
      <circle cx="84" cy="79" r="4" stroke={INK_SOFT} strokeWidth="2.2" />
      <WaitingDots x={90} y={18} />
    </svg>
  );
}

/** An empty shelf with a boxed-up product — products and inventory. */
export function NoProductsArt() {
  return (
    <svg width="116" height="96" viewBox="0 0 116 96" fill="none" aria-hidden="true">
      <g className="dash-float">
        <path d="M34 30 58 18l24 12v28L58 70 34 58V30Z" stroke={INK} strokeWidth="2.5" fill="#fff" strokeLinejoin="round" />
        <path d="m34 30 24 12 24-12M58 42v28" stroke={INK_SOFT} strokeWidth="2.5" strokeLinejoin="round" />
        <Face x={58} y={53} width={14} />
      </g>
      <path d="M20 80h76" stroke={INK} strokeWidth="2.5" strokeLinecap="round" />
      <WaitingDots x={92} y={20} />
    </svg>
  );
}

/** A price tag — categories. */
export function NoCategoriesArt() {
  return (
    <svg width="112" height="92" viewBox="0 0 112 92" fill="none" aria-hidden="true">
      <g className="dash-float">
        <path
          d="M56 16H28v28l26 26a3 3 0 0 0 4.2 0l20-20a3 3 0 0 0 0-4.2L56 16Z"
          stroke={INK}
          strokeWidth="2.5"
          fill="#fff"
          strokeLinejoin="round"
        />
        <circle cx="38" cy="26" r="3.4" stroke={INK_SOFT} strokeWidth="2.4" />
        <Face x={56} y={48} width={14} />
      </g>
      <path d="M18 82h76" stroke={INK_SOFT} strokeWidth="2.5" strokeLinecap="round" />
      <WaitingDots x={90} y={18} />
    </svg>
  );
}

/** A person — customers. */
export function NoCustomersArt() {
  return (
    <svg width="110" height="92" viewBox="0 0 110 92" fill="none" aria-hidden="true">
      <g className="dash-float">
        <circle cx="55" cy="32" r="15" stroke={INK} strokeWidth="2.5" fill="#fff" />
        <Face x={55} y={31} width={12} />
        <path d="M30 70a25 25 0 0 1 50 0" stroke={INK} strokeWidth="2.5" fill="#fff" strokeLinecap="round" />
      </g>
      <path d="M20 80h70" stroke={INK_SOFT} strokeWidth="2.5" strokeLinecap="round" />
      <WaitingDots x={88} y={18} />
    </svg>
  );
}

/** An envelope — contact messages. */
export function NoMessagesArt() {
  return (
    <svg width="116" height="92" viewBox="0 0 116 92" fill="none" aria-hidden="true">
      <g className="dash-float">
        <rect x="30" y="24" width="56" height="40" rx="5" stroke={INK} strokeWidth="2.5" fill="#fff" />
        <path d="m30 30 28 19 28-19" stroke={INK_SOFT} strokeWidth="2.5" strokeLinejoin="round" />
        <Face x={58} y={53} width={14} />
      </g>
      <path d="M20 80h76" stroke={INK_SOFT} strokeWidth="2.5" strokeLinecap="round" />
      <WaitingDots x={92} y={18} />
    </svg>
  );
}

/** A speech bubble with a star — reviews. */
export function NoReviewsArt() {
  return (
    <svg width="116" height="92" viewBox="0 0 116 92" fill="none" aria-hidden="true">
      <g className="dash-float">
        <path
          d="M30 24h56a5 5 0 0 1 5 5v26a5 5 0 0 1-5 5H56l-12 11V60h-14a5 5 0 0 1-5-5V29a5 5 0 0 1 5-5Z"
          stroke={INK}
          strokeWidth="2.5"
          fill="#fff"
          strokeLinejoin="round"
        />
        <Face x={58} y={40} width={16} />
      </g>
      <path
        d="m96 20 2.4 5 5.6.8-4 3.9.9 5.5-4.9-2.6-4.9 2.6.9-5.5-4-3.9 5.6-.8L96 20Z"
        stroke={ACCENT}
        strokeWidth="2"
        strokeLinejoin="round"
        opacity="0.55"
        className="dash-pulse"
      />
    </svg>
  );
}

/** A ticket — coupons. */
export function NoCouponsArt() {
  return (
    <svg width="120" height="88" viewBox="0 0 120 88" fill="none" aria-hidden="true">
      <g className="dash-float">
        <path
          d="M26 28h68v12a6 6 0 0 0 0 12v12H26V52a6 6 0 0 0 0-12V28Z"
          stroke={INK}
          strokeWidth="2.5"
          fill="#fff"
          strokeLinejoin="round"
        />
        <path d="M60 30v6M60 42v6M60 54v6" stroke={INK_SOFT} strokeWidth="2.4" strokeLinecap="round" />
        <Face x={42} y={46} width={12} />
      </g>
      <path d="M20 78h80" stroke={INK_SOFT} strokeWidth="2.5" strokeLinecap="round" />
      <WaitingDots x={96} y={18} />
    </svg>
  );
}

/** A document — blog posts and banners. */
export function NoContentArt() {
  return (
    <svg width="110" height="94" viewBox="0 0 110 94" fill="none" aria-hidden="true">
      <g className="dash-float">
        <path d="M34 16h26l16 16v38a4 4 0 0 1-4 4H34a4 4 0 0 1-4-4V20a4 4 0 0 1 4-4Z" stroke={INK} strokeWidth="2.5" fill="#fff" strokeLinejoin="round" />
        <path d="M60 16v16h16" stroke={INK_SOFT} strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M40 46h16M40 54h26" stroke={INK_SOFT} strokeWidth="2.4" strokeLinecap="round" />
        <Face x={53} y={64} width={12} />
      </g>
      <WaitingDots x={86} y={20} />
    </svg>
  );
}

/** A map pin — shipping zones. */
export function NoZonesArt() {
  return (
    <svg width="110" height="94" viewBox="0 0 110 94" fill="none" aria-hidden="true">
      <g className="dash-float">
        <path d="M55 16a20 20 0 0 1 20 20c0 14-20 32-20 32S35 50 35 36a20 20 0 0 1 20-20Z" stroke={INK} strokeWidth="2.5" fill="#fff" strokeLinejoin="round" />
        <Face x={55} y={34} width={12} />
      </g>
      <ellipse cx="55" cy="80" rx="22" ry="5" stroke={INK_SOFT} strokeWidth="2.4" />
      <WaitingDots x={88} y={20} />
    </svg>
  );
}

/** A magnifier over a blank sheet — a filter or search that matched nothing. */
export function NoResultsArt() {
  return (
    <svg width="112" height="92" viewBox="0 0 112 92" fill="none" aria-hidden="true">
      <rect x="26" y="18" width="46" height="56" rx="5" stroke={INK} strokeWidth="2.5" fill="#fff" />
      <path d="M36 34h26M36 44h20M36 54h14" stroke={INK_SOFT} strokeWidth="2.4" strokeLinecap="round" />
      <g className="dash-float">
        <circle cx="76" cy="54" r="15" stroke={INK} strokeWidth="2.5" fill="#fff" fillOpacity="0.9" />
        <Face x={76} y={53} width={12} />
        <path d="m87 65 9 9" stroke={INK} strokeWidth="3" strokeLinecap="round" />
      </g>
    </svg>
  );
}

/** An axis with a flat line that draws itself in — no sales in the window yet. */
export function NoSalesArt() {
  return (
    <svg width="132" height="84" viewBox="0 0 132 84" fill="none" aria-hidden="true">
      <path d="M18 12v52h96" stroke={INK} strokeWidth="2.5" strokeLinecap="round" />
      <path d="M26 64h88" stroke={INK_SOFT} strokeWidth="2" strokeDasharray="4 5" />
      <path
        d="M26 56h18l10 2 12-2 14 1 12-1 14 2"
        stroke={ACCENT}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.55"
        className="dash-draw"
      />
      <WaitingDots x={104} y={22} />
    </svg>
  );
}

/** Three podium bars, the leader empty — nothing has sold yet to rank. */
export function NoRankingArt() {
  return (
    <svg width="112" height="80" viewBox="0 0 112 80" fill="none" aria-hidden="true">
      <rect x="14" y="44" width="24" height="24" rx="3" stroke={INK} strokeWidth="2.5" />
      <rect x="44" y="30" width="24" height="38" rx="3" stroke={INK} strokeWidth="2.5" />
      <rect x="74" y="52" width="24" height="16" rx="3" stroke={INK} strokeWidth="2.5" />
      <path d="M8 68h96" stroke={INK} strokeWidth="2.5" strokeLinecap="round" />
      <g className="dash-float">
        <circle cx="56" cy="16" r="5" stroke={ACCENT} strokeWidth="2.2" opacity="0.6" />
      </g>
    </svg>
  );
}

/** A tick — for the empty state that is good news, not missing data. */
export function AllClearArt() {
  return (
    <svg width="96" height="80" viewBox="0 0 96 80" fill="none" aria-hidden="true">
      <circle cx="48" cy="40" r="24" stroke={INK} strokeWidth="2.5" />
      <path
        d="m37 40 8 8 15-16"
        stroke="#15803d"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.75"
        className="dash-draw"
      />
    </svg>
  );
}
