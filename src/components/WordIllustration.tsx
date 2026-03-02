interface Props {
  wordId: number;
  size?: number;
}

export default function WordIllustration({ wordId, size = 200 }: Props) {
  const svg = illustrations[wordId];
  if (!svg) return null;

  return (
    <div
      className="flex items-center justify-center"
      style={{ width: size, height: size }}
    >
      <svg
        viewBox="0 0 200 200"
        width={size}
        height={size}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id={`bg-${wordId}`} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#e0e7ff" />
            <stop offset="100%" stopColor="#f3e8ff" />
          </linearGradient>
        </defs>
        <rect width="200" height="200" rx="24" fill={`url(#bg-${wordId})`} />
        {svg}
      </svg>
    </div>
  );
}

// Stick figure helper
function Person({ x, y, color = "#4f46e5" }: { x: number; y: number; color?: string }) {
  return (
    <g>
      <circle cx={x} cy={y - 28} r={10} fill={color} />
      <line x1={x} y1={y - 18} x2={x} y2={y + 10} stroke={color} strokeWidth="3" strokeLinecap="round" />
      <line x1={x - 12} y1={y - 8} x2={x + 12} y2={y - 8} stroke={color} strokeWidth="3" strokeLinecap="round" />
      <line x1={x} y1={y + 10} x2={x - 10} y2={y + 28} stroke={color} strokeWidth="3" strokeLinecap="round" />
      <line x1={x} y1={y + 10} x2={x + 10} y2={y + 28} stroke={color} strokeWidth="3" strokeLinecap="round" />
    </g>
  );
}

const illustrations: Record<number, React.ReactNode> = {
  // 1: get — 自分のところに来る・手に入る
  1: (
    <g>
      <Person x={130} y={100} />
      {/* Object coming toward person */}
      <circle cx={60} cy={90} r={14} fill="#f59e0b" />
      <path d="M78 90 L110 90" stroke="#4f46e5" strokeWidth="3" strokeDasharray="6 4" markerEnd="url(#arrow)" />
      <defs>
        <marker id="arrow" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#4f46e5" />
        </marker>
      </defs>
      {/* Hands reaching */}
      <line x1={118} y1={92} x2={108} y2={86} stroke="#4f46e5" strokeWidth="3" strokeLinecap="round" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">GET</text>
    </g>
  ),

  // 2: take — 手を伸ばして自分のものにする
  2: (
    <g>
      <Person x={130} y={95} />
      <circle cx={65} cy={85} r={14} fill="#f59e0b" />
      {/* Reaching arm */}
      <line x1={118} y1={87} x2={82} y2={85} stroke="#4f46e5" strokeWidth="3" strokeLinecap="round" />
      <circle cx={82} cy={85} r={4} fill="#4f46e5" />
      <path d="M85 85 C95 60 110 60 120 75" stroke="#a5b4fc" strokeWidth="2" fill="none" strokeDasharray="4 3" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">TAKE</text>
    </g>
  ),

  // 3: make — 何もないところから作り出す
  3: (
    <g>
      <Person x={70} y={95} />
      {/* Sparks / creation */}
      <rect x={110} y={75} width={40} height={35} rx="4" fill="#fbbf24" stroke="#f59e0b" strokeWidth="2" />
      <line x1={82} y1={87} x2={108} y2={87} stroke="#4f46e5" strokeWidth="3" strokeLinecap="round" />
      {/* Stars around created object */}
      <circle cx={115} cy={65} r={3} fill="#c084fc" />
      <circle cx={155} cy={72} r={2} fill="#c084fc" />
      <circle cx={145} cy={60} r={3} fill="#a78bfa" />
      <circle cx={160} cy={85} r={2} fill="#c084fc" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">MAKE</text>
    </g>
  ),

  // 4: have — 自分の領域に持っている
  4: (
    <g>
      <Person x={100} y={90} />
      {/* Circle around person = own area */}
      <circle cx={100} cy={95} r={45} fill="none" stroke="#a5b4fc" strokeWidth="2" strokeDasharray="6 3" />
      {/* Items inside circle */}
      <circle cx={80} cy={72} r={6} fill="#fbbf24" />
      <rect x={115} y={68} width={12} height={12} rx="2" fill="#34d399" />
      <circle cx={120} cy={110} r={5} fill="#f472b6" />
      <text x={100} y={165} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">HAVE</text>
    </g>
  ),

  // 5: give — 自分から相手へ渡す
  5: (
    <g>
      <Person x={60} y={95} />
      <Person x={140} y={95} color="#7c3aed" />
      {/* Object moving from left to right */}
      <circle cx={100} cy={82} r={10} fill="#fbbf24" />
      <path d="M75 87 L90 82" stroke="#4f46e5" strokeWidth="2" strokeLinecap="round" />
      <path d="M110 82 L125 87" stroke="#4f46e5" strokeWidth="2" strokeDasharray="5 3" markerEnd="url(#arr5)" />
      <defs>
        <marker id="arr5" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#4f46e5" />
        </marker>
      </defs>
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">GIVE</text>
    </g>
  ),

  // 6: put — ポンと置く
  6: (
    <g>
      <Person x={80} y={85} />
      {/* Table */}
      <rect x={105} y={110} width={60} height={5} rx="2" fill="#94a3b8" />
      <rect x={112} y={115} width={4} height={20} fill="#94a3b8" />
      <rect x={154} y={115} width={4} height={20} fill="#94a3b8" />
      {/* Object being placed */}
      <rect x={125} y={96} width={18} height={14} rx="3" fill="#fbbf24" />
      {/* Arm reaching to place */}
      <line x1={92} y1={77} x2={124} y2={100} stroke="#4f46e5" strokeWidth="2" strokeLinecap="round" />
      {/* Down arrow */}
      <path d="M134 88 L134 94" stroke="#a5b4fc" strokeWidth="2" markerEnd="url(#arr6)" />
      <defs>
        <marker id="arr6" viewBox="0 0 10 10" refX="5" refY="9" markerWidth="5" markerHeight="5" orient="auto">
          <path d="M 0 0 L 5 10 L 10 0 z" fill="#a5b4fc" />
        </marker>
      </defs>
      <text x={100} y={165} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">PUT</text>
    </g>
  ),

  // 7: go — 今いる場所から離れて進む
  7: (
    <g>
      {/* Starting point */}
      <circle cx={50} cy={100} r={20} fill="none" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="4 3" />
      {/* Person moving right */}
      <Person x={110} y={95} />
      {/* Arrow showing direction */}
      <path d="M75 100 L90 100" stroke="#4f46e5" strokeWidth="3" markerEnd="url(#arr7)" />
      <path d="M125 100 L155 100" stroke="#4f46e5" strokeWidth="3" markerEnd="url(#arr7)" />
      <defs>
        <marker id="arr7" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#4f46e5" />
        </marker>
      </defs>
      {/* Speed lines */}
      <line x1={88} y1={85} x2={95} y2={85} stroke="#a5b4fc" strokeWidth="2" />
      <line x1={85} y1={95} x2={93} y2={95} stroke="#a5b4fc" strokeWidth="2" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">GO</text>
    </g>
  ),

  // 8: come — こちらへ近づいてくる
  8: (
    <g>
      {/* Target (here) */}
      <Person x={140} y={95} color="#7c3aed" />
      {/* Person approaching */}
      <Person x={70} y={95} />
      {/* Arrow toward target */}
      <path d="M90 95 L120 95" stroke="#4f46e5" strokeWidth="3" markerEnd="url(#arr8)" />
      <defs>
        <marker id="arr8" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#4f46e5" />
        </marker>
      </defs>
      {/* Welcoming gesture */}
      <line x1={128} y1={87} x2={120} y2={80} stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">COME</text>
    </g>
  ),

  // 9: run — 勢いよく動き続ける
  9: (
    <g>
      {/* Running person (leaning forward) */}
      <circle cx={95} cy={62} r={10} fill="#4f46e5" />
      <line x1={95} y1={72} x2={88} y2={98} stroke="#4f46e5" strokeWidth="3" strokeLinecap="round" />
      {/* Arms */}
      <line x1={90} y1={80} x2={75} y2={75} stroke="#4f46e5" strokeWidth="3" strokeLinecap="round" />
      <line x1={90} y1={80} x2={105} y2={88} stroke="#4f46e5" strokeWidth="3" strokeLinecap="round" />
      {/* Legs in running pose */}
      <line x1={88} y1={98} x2={75} y2={118} stroke="#4f46e5" strokeWidth="3" strokeLinecap="round" />
      <line x1={88} y1={98} x2={108} y2={115} stroke="#4f46e5" strokeWidth="3" strokeLinecap="round" />
      {/* Speed lines */}
      <line x1={55} y1={70} x2={68} y2={70} stroke="#a5b4fc" strokeWidth="2" />
      <line x1={50} y1={80} x2={65} y2={80} stroke="#c7d2fe" strokeWidth="2" />
      <line x1={52} y1={90} x2={63} y2={90} stroke="#a5b4fc" strokeWidth="2" />
      <line x1={48} y1={100} x2={60} y2={100} stroke="#c7d2fe" strokeWidth="1.5" />
      {/* Ground */}
      <line x1={30} y1={120} x2={170} y2={120} stroke="#cbd5e1" strokeWidth="2" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">RUN</text>
    </g>
  ),

  // 10: turn — 回転して向きが変わる
  10: (
    <g>
      <Person x={100} y={90} />
      {/* Circular arrow */}
      <path d="M65 80 A40 40 0 1 1 100 55" fill="none" stroke="#4f46e5" strokeWidth="3" markerEnd="url(#arr10)" />
      <defs>
        <marker id="arr10" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#4f46e5" />
        </marker>
      </defs>
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">TURN</text>
    </g>
  ),

  // 11: look — 意識して目を向ける
  11: (
    <g>
      <Person x={70} y={95} />
      {/* Eye */}
      <ellipse cx={70} cy={65} rx={8} ry={5} fill="white" stroke="#4f46e5" strokeWidth="2" />
      <circle cx={73} cy={65} r={3} fill="#4f46e5" />
      {/* Gaze lines */}
      <line x1={82} y1={63} x2={130} y2={55} stroke="#a5b4fc" strokeWidth="2" />
      <line x1={82} y1={67} x2={130} y2={67} stroke="#a5b4fc" strokeWidth="2" />
      <line x1={82} y1={71} x2={130} y2={79} stroke="#a5b4fc" strokeWidth="2" />
      {/* Target */}
      <rect x={130} y={50} width={35} height={35} rx="4" fill="#fef3c7" stroke="#f59e0b" strokeWidth="2" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">LOOK</text>
    </g>
  ),

  // 12: keep — ずっと保ち続ける
  12: (
    <g>
      <Person x={100} y={90} />
      {/* Holding object firmly */}
      <circle cx={100} cy={72} r={12} fill="#fbbf24" stroke="#f59e0b" strokeWidth="2" />
      {/* Time arrows (continuous) */}
      <path d="M60 130 L140 130" stroke="#4f46e5" strokeWidth="2" markerEnd="url(#arr12)" />
      <line x1={70} y1={126} x2={70} y2={134} stroke="#4f46e5" strokeWidth="2" />
      <line x1={90} y1={126} x2={90} y2={134} stroke="#4f46e5" strokeWidth="2" />
      <line x1={110} y1={126} x2={110} y2={134} stroke="#4f46e5" strokeWidth="2" />
      <line x1={130} y1={126} x2={130} y2={134} stroke="#4f46e5" strokeWidth="2" />
      <defs>
        <marker id="arr12" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#4f46e5" />
        </marker>
      </defs>
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">KEEP</text>
    </g>
  ),

  // 13: bring — こちらへ持ってくる
  13: (
    <g>
      <Person x={75} y={95} />
      {/* Object being carried */}
      <circle cx={90} cy={80} r={8} fill="#fbbf24" />
      {/* Arrow toward here */}
      <path d="M100 90 L130 90" stroke="#4f46e5" strokeWidth="3" markerEnd="url(#arr13)" />
      <defs>
        <marker id="arr13" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#4f46e5" />
        </marker>
      </defs>
      {/* "Here" marker */}
      <circle cx={145} cy={90} r={15} fill="none" stroke="#7c3aed" strokeWidth="2" strokeDasharray="4 3" />
      <text x={145} y={94} textAnchor="middle" fontSize="10" fill="#7c3aed">here</text>
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">BRING</text>
    </g>
  ),

  // 14: set — しっかり定位置にセットする
  14: (
    <g>
      {/* Target position */}
      <rect x={80} y={75} width={40} height={40} rx="4" fill="none" stroke="#4f46e5" strokeWidth="2" strokeDasharray="6 3" />
      {/* Object snapping into place */}
      <rect x={83} y={78} width={34} height={34} rx="3" fill="#fbbf24" />
      {/* Check mark */}
      <path d="M92 95 L98 102 L112 85" stroke="#059669" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {/* Click/snap effect */}
      <line x1={75} y1={72} x2={68} y2={65} stroke="#a5b4fc" strokeWidth="2" />
      <line x1={125} y1={72} x2={132} y2={65} stroke="#a5b4fc" strokeWidth="2" />
      <line x1={75} y1={118} x2={68} y2={125} stroke="#a5b4fc" strokeWidth="2" />
      <line x1={125} y1={118} x2={132} y2={125} stroke="#a5b4fc" strokeWidth="2" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">SET</text>
    </g>
  ),

  // 15: break — バラバラに壊れる
  15: (
    <g>
      {/* Broken pieces */}
      <polygon points="85,70 95,65 100,80 88,82" fill="#f59e0b" />
      <polygon points="102,65 115,68 112,82 100,78" fill="#fbbf24" />
      <polygon points="88,85 100,83 98,100 85,98" fill="#fcd34d" />
      <polygon points="103,84 115,85 118,100 105,98" fill="#fbbf24" />
      {/* Crack lines */}
      <line x1={97} y1={60} x2={94} y2={50} stroke="#ef4444" strokeWidth="2" />
      <line x1={120} y1={75} x2={130} y2={70} stroke="#ef4444" strokeWidth="2" />
      <line x1={80} y1={78} x2={70} y2={73} stroke="#ef4444" strokeWidth="2" />
      <line x1={105} y1={105} x2={110} y2={115} stroke="#ef4444" strokeWidth="2" />
      {/* Impact */}
      <circle cx={100} cy={82} r={4} fill="#ef4444" opacity="0.5" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">BREAK</text>
    </g>
  ),

  // 16: hold — しっかり保持する
  16: (
    <g>
      <Person x={100} y={95} />
      {/* Both hands holding */}
      <line x1={88} y1={87} x2={80} y2={78} stroke="#4f46e5" strokeWidth="3" strokeLinecap="round" />
      <line x1={112} y1={87} x2={120} y2={78} stroke="#4f46e5" strokeWidth="3" strokeLinecap="round" />
      {/* Held object */}
      <circle cx={100} cy={73} r={14} fill="#fbbf24" stroke="#f59e0b" strokeWidth="2" />
      {/* Grip lines */}
      <circle cx={80} cy={78} r={4} fill="#4f46e5" />
      <circle cx={120} cy={78} r={4} fill="#4f46e5" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">HOLD</text>
    </g>
  ),

  // 17: stand — 直立して立つ
  17: (
    <g>
      {/* Person standing tall */}
      <circle cx={100} cy={55} r={12} fill="#4f46e5" />
      <line x1={100} y1={67} x2={100} y2={105} stroke="#4f46e5" strokeWidth="4" strokeLinecap="round" />
      <line x1={85} y1={82} x2={115} y2={82} stroke="#4f46e5" strokeWidth="3" strokeLinecap="round" />
      <line x1={100} y1={105} x2={88} y2={128} stroke="#4f46e5" strokeWidth="4" strokeLinecap="round" />
      <line x1={100} y1={105} x2={112} y2={128} stroke="#4f46e5" strokeWidth="4" strokeLinecap="round" />
      {/* Ground */}
      <line x1={60} y1={130} x2={140} y2={130} stroke="#cbd5e1" strokeWidth="2" />
      {/* Vertical emphasis */}
      <line x1={100} y1={40} x2={100} y2={48} stroke="#a5b4fc" strokeWidth="2" strokeDasharray="3 2" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">STAND</text>
    </g>
  ),

  // 18: leave — その場から離れて去る
  18: (
    <g>
      {/* Door frame */}
      <rect x={55} y={55} width={40} height={60} rx="2" fill="none" stroke="#94a3b8" strokeWidth="2" />
      <circle cx={60} cy={85} r={2} fill="#94a3b8" />
      {/* Person walking away */}
      <Person x={130} y={95} />
      {/* Arrow leaving */}
      <path d="M98 85 L110 85" stroke="#4f46e5" strokeWidth="3" markerEnd="url(#arr18)" />
      <defs>
        <marker id="arr18" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#4f46e5" />
        </marker>
      </defs>
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">LEAVE</text>
    </g>
  ),

  // 19: call — 声を出して呼ぶ
  19: (
    <g>
      <Person x={70} y={95} />
      {/* Mouth / voice */}
      <path d="M82 65 L95 58 L95 72 Z" fill="#a5b4fc" />
      {/* Sound waves */}
      <path d="M98 60 Q105 65 98 70" fill="none" stroke="#4f46e5" strokeWidth="2" />
      <path d="M104 55 Q115 65 104 75" fill="none" stroke="#4f46e5" strokeWidth="2" />
      <path d="M110 50 Q125 65 110 80" fill="none" stroke="#a5b4fc" strokeWidth="2" />
      {/* Target person */}
      <Person x={150} y={95} color="#7c3aed" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">CALL</text>
    </g>
  ),

  // 20: fall — 重力で下に落ちる
  20: (
    <g>
      {/* Falling object */}
      <circle cx={100} cy={60} r={12} fill="#fbbf24" />
      <circle cx={100} cy={85} r={12} fill="#fbbf24" opacity="0.5" />
      <circle cx={100} cy={110} r={12} fill="#fbbf24" opacity="0.2" />
      {/* Down arrow */}
      <path d="M120 55 L120 115" stroke="#4f46e5" strokeWidth="3" markerEnd="url(#arr20)" />
      <defs>
        <marker id="arr20" viewBox="0 0 10 10" refX="5" refY="9" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 0 L 5 10 L 10 0 z" fill="#4f46e5" />
        </marker>
      </defs>
      {/* Ground */}
      <line x1={60} y1={130} x2={140} y2={130} stroke="#cbd5e1" strokeWidth="2" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">FALL</text>
    </g>
  ),

  // 21: pick — たくさんの中からひとつ選ぶ
  21: (
    <g>
      {/* Multiple items */}
      <circle cx={55} cy={80} r={10} fill="#cbd5e1" />
      <circle cx={80} cy={75} r={10} fill="#cbd5e1" />
      <circle cx={105} cy={78} r={10} fill="#fbbf24" stroke="#f59e0b" strokeWidth="2" />
      <circle cx={130} cy={80} r={10} fill="#cbd5e1" />
      <circle cx={150} cy={82} r={10} fill="#cbd5e1" />
      {/* Hand picking */}
      <line x1={105} y1={65} x2={105} y2={50} stroke="#4f46e5" strokeWidth="3" strokeLinecap="round" />
      <circle cx={105} cy={47} r={5} fill="#4f46e5" />
      {/* Up arrow */}
      <path d="M105 42 L105 35" stroke="#4f46e5" strokeWidth="2" markerEnd="url(#arr21)" />
      <defs>
        <marker id="arr21" viewBox="0 0 10 10" refX="5" refY="1" markerWidth="5" markerHeight="5" orient="auto">
          <path d="M 0 10 L 5 0 L 10 10 z" fill="#4f46e5" />
        </marker>
      </defs>
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">PICK</text>
    </g>
  ),

  // 22: pass — 通り過ぎる
  22: (
    <g>
      {/* Point A */}
      <rect x={55} y={80} width={20} height={30} rx="3" fill="#94a3b8" />
      {/* Point B (passing) */}
      <rect x={125} y={80} width={20} height={30} rx="3" fill="#94a3b8" />
      {/* Person passing through */}
      <Person x={100} y={90} />
      {/* Arrow through */}
      <path d="M40 130 L160 130" stroke="#4f46e5" strokeWidth="3" markerEnd="url(#arr22)" />
      <defs>
        <marker id="arr22" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#4f46e5" />
        </marker>
      </defs>
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">PASS</text>
    </g>
  ),

  // 23: catch — 動いているものをつかまえる
  23: (
    <g>
      <Person x={120} y={95} />
      {/* Ball flying toward */}
      <circle cx={60} cy={75} r={10} fill="#fbbf24" />
      <path d="M72 78 L100 85" stroke="#f59e0b" strokeWidth="2" strokeDasharray="4 3" />
      {/* Hands ready */}
      <line x1={108} y1={87} x2={100} y2={80} stroke="#4f46e5" strokeWidth="3" strokeLinecap="round" />
      <circle cx={100} cy={80} r={4} fill="#4f46e5" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">CATCH</text>
    </g>
  ),

  // 24: pull — 自分の方へ引く
  24: (
    <g>
      <Person x={130} y={95} />
      {/* Rope/connection */}
      <line x1={70} y1={90} x2={118} y2={87} stroke="#94a3b8" strokeWidth="3" />
      {/* Object being pulled */}
      <rect x={50} y={80} width={25} height={20} rx="3" fill="#fbbf24" />
      {/* Arrow toward person */}
      <path d="M80 75 L110 75" stroke="#4f46e5" strokeWidth="3" markerEnd="url(#arr24)" />
      <defs>
        <marker id="arr24" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#4f46e5" />
        </marker>
      </defs>
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">PULL</text>
    </g>
  ),

  // 25: push — 離れる方向に力を加える
  25: (
    <g>
      <Person x={70} y={95} />
      {/* Object being pushed */}
      <rect x={110} y={80} width={25} height={20} rx="3" fill="#fbbf24" />
      {/* Pushing force */}
      <line x1={82} y1={87} x2={108} y2={87} stroke="#4f46e5" strokeWidth="3" strokeLinecap="round" />
      {/* Arrow away */}
      <path d="M138 90 L160 90" stroke="#4f46e5" strokeWidth="3" markerEnd="url(#arr25)" />
      <defs>
        <marker id="arr25" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#4f46e5" />
        </marker>
      </defs>
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">PUSH</text>
    </g>
  ),

  // 26: carry — 持ったまま移動する
  26: (
    <g>
      {/* Person carrying box */}
      <circle cx={90} cy={62} r={10} fill="#4f46e5" />
      <line x1={90} y1={72} x2={90} y2={100} stroke="#4f46e5" strokeWidth="3" strokeLinecap="round" />
      <line x1={90} y1={100} x2={80} y2={120} stroke="#4f46e5" strokeWidth="3" strokeLinecap="round" />
      <line x1={90} y1={100} x2={100} y2={120} stroke="#4f46e5" strokeWidth="3" strokeLinecap="round" />
      {/* Arms holding box */}
      <line x1={78} y1={82} x2={78} y2={92} stroke="#4f46e5" strokeWidth="3" strokeLinecap="round" />
      <line x1={102} y1={82} x2={102} y2={92} stroke="#4f46e5" strokeWidth="3" strokeLinecap="round" />
      {/* Box */}
      <rect x={72} y={78} width={36} height={18} rx="3" fill="#fbbf24" stroke="#f59e0b" strokeWidth="2" />
      {/* Movement arrow */}
      <path d="M115 90 L145 90" stroke="#a5b4fc" strokeWidth="2" markerEnd="url(#arr26)" />
      <defs>
        <marker id="arr26" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#a5b4fc" />
        </marker>
      </defs>
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">CARRY</text>
    </g>
  ),

  // 27: cut — 鋭いもので分断する
  27: (
    <g>
      {/* Object being cut */}
      <rect x={60} y={78} width={80} height={24} rx="4" fill="#fbbf24" />
      {/* Cut line */}
      <line x1={100} y1={65} x2={100} y2={115} stroke="#ef4444" strokeWidth="3" strokeDasharray="6 3" />
      {/* Scissors / blade */}
      <polygon points="95,60 100,50 105,60" fill="#94a3b8" stroke="#64748b" strokeWidth="1" />
      {/* Separated pieces */}
      <rect x={58} y={80} width={38} height={20} rx="3" fill="#fbbf24" opacity="0.6" />
      <rect x={104} y={80} width={38} height={20} rx="3" fill="#fbbf24" opacity="0.6" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">CUT</text>
    </g>
  ),

  // 28: draw — 線を引く
  28: (
    <g>
      {/* Paper */}
      <rect x={55} y={55} width={90} height={70} rx="4" fill="white" stroke="#cbd5e1" strokeWidth="2" />
      {/* Drawing */}
      <path d="M70 100 Q90 70 110 90 Q120 100 130 80" fill="none" stroke="#4f46e5" strokeWidth="3" strokeLinecap="round" />
      {/* Pencil */}
      <line x1={130} y1={80} x2={145} y2={60} stroke="#f59e0b" strokeWidth="4" strokeLinecap="round" />
      <polygon points="130,80 127,83 133,83" fill="#374151" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">DRAW</text>
    </g>
  ),

  // 29: play — 自由に楽しむ
  29: (
    <g>
      <Person x={80} y={90} />
      <Person x={120} y={90} color="#7c3aed" />
      {/* Ball */}
      <circle cx={100} cy={65} r={12} fill="#fbbf24" stroke="#f59e0b" strokeWidth="2" />
      {/* Joy marks */}
      <text x={65} y={65} fontSize="12" fill="#f472b6">♪</text>
      <text x={140} y={70} fontSize="10" fill="#f472b6">♪</text>
      <text x={100} y={50} fontSize="10" fill="#a78bfa">★</text>
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">PLAY</text>
    </g>
  ),

  // 30: work — エネルギーを使って機能する
  30: (
    <g>
      <Person x={80} y={95} />
      {/* Desk */}
      <rect x={95} y={88} width={55} height={4} rx="1" fill="#94a3b8" />
      <rect x={100} y={92} width={3} height={18} fill="#94a3b8" />
      <rect x={142} y={92} width={3} height={18} fill="#94a3b8" />
      {/* Computer */}
      <rect x={105} y={72} width={30} height={18} rx="2" fill="#e0e7ff" stroke="#4f46e5" strokeWidth="2" />
      {/* Energy */}
      <path d="M148 70 L155 60 L150 72 L158 62" stroke="#f59e0b" strokeWidth="2" fill="none" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">WORK</text>
    </g>
  ),

  // 31: move — 別の位置へ動く
  31: (
    <g>
      {/* Position A (faded) */}
      <circle cx={60} cy={90} r={15} fill="#4f46e5" opacity="0.2" />
      {/* Position B */}
      <circle cx={140} cy={90} r={15} fill="#4f46e5" />
      {/* Arrow */}
      <path d="M80 90 L120 90" stroke="#4f46e5" strokeWidth="3" markerEnd="url(#arr31)" strokeDasharray="8 4" />
      <defs>
        <marker id="arr31" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#4f46e5" />
        </marker>
      </defs>
      <text x={60} y={95} textAnchor="middle" fontSize="10" fill="#4f46e5" opacity="0.5">A</text>
      <text x={140} y={95} textAnchor="middle" fontSize="10" fill="white">B</text>
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">MOVE</text>
    </g>
  ),

  // 32: think — 頭の中でイメージを巡らせる
  32: (
    <g>
      <Person x={100} y={105} />
      {/* Thought bubble */}
      <ellipse cx={100} cy={55} rx={35} ry={22} fill="white" stroke="#a5b4fc" strokeWidth="2" />
      <circle cx={90} cy={78} r={4} fill="white" stroke="#a5b4fc" strokeWidth="1.5" />
      <circle cx={95} cy={72} r={3} fill="white" stroke="#a5b4fc" strokeWidth="1.5" />
      {/* Ideas inside */}
      <text x={90} y={52} fontSize="10" fill="#f59e0b">?</text>
      <text x={105} y={58} fontSize="10" fill="#4f46e5">!</text>
      <circle cx={100} cy={48} r={3} fill="#c084fc" />
      <text x={100} y={165} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">THINK</text>
    </g>
  ),

  // 33: feel — 心や体で感じ取る
  33: (
    <g>
      <Person x={100} y={100} />
      {/* Heart (feeling) */}
      <path d="M88 65 C88 58 78 55 78 65 C78 75 88 80 88 80 C88 80 98 75 98 65 C98 55 88 58 88 65" fill="#f472b6" opacity="0.8" />
      {/* Ripples from hand */}
      <path d="M115 88 Q125 85 120 78" fill="none" stroke="#a5b4fc" strokeWidth="2" />
      <path d="M120 90 Q132 86 126 76" fill="none" stroke="#c7d2fe" strokeWidth="1.5" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">FEEL</text>
    </g>
  ),

  // 34: try — やってみようと挑戦
  34: (
    <g>
      <Person x={80} y={100} />
      {/* Mountain/challenge */}
      <polygon points="120,60 150,120 90,120" fill="none" stroke="#94a3b8" strokeWidth="2" />
      {/* Flag at top */}
      <line x1={120} y1={45} x2={120} y2={60} stroke="#ef4444" strokeWidth="2" />
      <polygon points="120,45 135,50 120,55" fill="#ef4444" />
      {/* Arrow attempting */}
      <path d="M95 100 L110 85" stroke="#4f46e5" strokeWidth="3" markerEnd="url(#arr34)" />
      <defs>
        <marker id="arr34" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#4f46e5" />
        </marker>
      </defs>
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">TRY</text>
    </g>
  ),

  // 35: help — 手を差し伸べる
  35: (
    <g>
      <Person x={65} y={100} />
      <Person x={135} y={110} color="#7c3aed" />
      {/* Helping hand */}
      <line x1={77} y1={92} x2={110} y2={100} stroke="#4f46e5" strokeWidth="3" strokeLinecap="round" />
      <line x1={123} y1={102} x2={112} y2={100} stroke="#7c3aed" strokeWidth="3" strokeLinecap="round" />
      {/* Sparkle */}
      <circle cx={100} cy={70} r={3} fill="#fbbf24" />
      <line x1={100} y1={62} x2={100} y2={66} stroke="#fbbf24" strokeWidth="2" />
      <line x1={100} y1={74} x2={100} y2={78} stroke="#fbbf24" strokeWidth="2" />
      <line x1={92} y1={70} x2={96} y2={70} stroke="#fbbf24" strokeWidth="2" />
      <line x1={104} y1={70} x2={108} y2={70} stroke="#fbbf24" strokeWidth="2" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">HELP</text>
    </g>
  ),

  // 36: tell — 相手に情報を伝える
  36: (
    <g>
      <Person x={65} y={95} />
      <Person x={135} y={95} color="#7c3aed" />
      {/* Speech bubble */}
      <rect x={82} y={60} width={36} height={22} rx="8" fill="white" stroke="#4f46e5" strokeWidth="2" />
      <polygon points="84,82 88,76 92,82" fill="white" stroke="#4f46e5" strokeWidth="2" />
      <rect x={84} y={75} width={10} height={8} fill="white" />
      {/* Info inside */}
      <text x={100} y={76} textAnchor="middle" fontSize="12" fill="#4f46e5" fontWeight="bold">abc</text>
      {/* Arrow to listener */}
      <path d="M120 71 L128 71" stroke="#a5b4fc" strokeWidth="2" markerEnd="url(#arr36)" />
      <defs>
        <marker id="arr36" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#a5b4fc" />
        </marker>
      </defs>
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">TELL</text>
    </g>
  ),

  // 37: show — 見える状態にして示す
  37: (
    <g>
      <Person x={70} y={100} />
      {/* Presentation screen */}
      <rect x={105} y={55} width={55} height={40} rx="4" fill="white" stroke="#4f46e5" strokeWidth="2" />
      {/* Content on screen */}
      <line x1={115} y1={65} x2={150} y2={65} stroke="#a5b4fc" strokeWidth="2" />
      <line x1={115} y1={73} x2={145} y2={73} stroke="#c7d2fe" strokeWidth="2" />
      <line x1={115} y1={81} x2={140} y2={81} stroke="#c7d2fe" strokeWidth="2" />
      {/* Pointing */}
      <line x1={82} y1={92} x2={105} y2={75} stroke="#4f46e5" strokeWidth="2" strokeLinecap="round" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">SHOW</text>
    </g>
  ),

  // 38: send — こちらから向こうへ送り出す
  38: (
    <g>
      {/* Sender */}
      <Person x={55} y={95} />
      {/* Envelope */}
      <rect x={90} y={75} width={24} height={16} rx="2" fill="white" stroke="#4f46e5" strokeWidth="2" />
      <path d="M90 75 L102 85 L114 75" fill="none" stroke="#4f46e5" strokeWidth="2" />
      {/* Arrow sending */}
      <path d="M118 83 L150 83" stroke="#4f46e5" strokeWidth="3" markerEnd="url(#arr38)" />
      <defs>
        <marker id="arr38" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#4f46e5" />
        </marker>
      </defs>
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">SEND</text>
    </g>
  ),

  // 39: find — 探していたものに出会う
  39: (
    <g>
      {/* Magnifying glass */}
      <circle cx={90} cy={75} r={20} fill="none" stroke="#4f46e5" strokeWidth="3" />
      <line x1={104} y1={89} x2={118} y2={103} stroke="#4f46e5" strokeWidth="4" strokeLinecap="round" />
      {/* Found object inside */}
      <circle cx={90} cy={75} r={8} fill="#fbbf24" />
      {/* Exclamation */}
      <text x={130} y={70} fontSize="24" fill="#f59e0b" fontWeight="bold">!</text>
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">FIND</text>
    </g>
  ),

  // 40: open — 閉じていたものを開放する
  40: (
    <g>
      {/* Door closed -> open */}
      <rect x={65} y={55} width={30} height={55} rx="2" fill="#94a3b8" opacity="0.3" />
      {/* Open door */}
      <path d="M65 55 L50 65 L50 120 L65 110 Z" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="2" />
      {/* Light coming through */}
      <line x1={98} y1={65} x2={130} y2={55} stroke="#fbbf24" strokeWidth="2" />
      <line x1={98} y1={80} x2={140} y2={75} stroke="#fbbf24" strokeWidth="2" />
      <line x1={98} y1={95} x2={130} y2={100} stroke="#fbbf24" strokeWidth="2" />
      {/* Arrow opening */}
      <path d="M75 82 L50 82" stroke="#4f46e5" strokeWidth="2" strokeDasharray="4 3" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">OPEN</text>
    </g>
  ),

  // 41: close — 開いていたものを閉じる
  41: (
    <g>
      {/* Door open -> closing */}
      <rect x={75} y={55} width={30} height={55} rx="2" fill="#94a3b8" />
      <circle cx={80} cy={82} r={2} fill="#64748b" />
      {/* Closing arrows */}
      <path d="M55 70 L72 70" stroke="#4f46e5" strokeWidth="3" markerEnd="url(#arr41)" />
      <path d="M55 95 L72 95" stroke="#4f46e5" strokeWidth="3" markerEnd="url(#arr41)" />
      <defs>
        <marker id="arr41" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#4f46e5" />
        </marker>
      </defs>
      {/* Frame */}
      <rect x={108} y={55} width={30} height={55} rx="2" fill="none" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="4 3" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">CLOSE</text>
    </g>
  ),

  // 42: follow — 後に続いてついていく
  42: (
    <g>
      {/* Leader */}
      <Person x={130} y={90} color="#7c3aed" />
      {/* Follower */}
      <Person x={75} y={95} />
      {/* Footsteps */}
      <ellipse cx={95} cy={125} rx={5} ry={3} fill="#a5b4fc" />
      <ellipse cx={108} cy={122} rx={5} ry={3} fill="#a5b4fc" opacity="0.7" />
      <ellipse cx={120} cy={119} rx={5} ry={3} fill="#a5b4fc" opacity="0.4" />
      {/* Arrow */}
      <path d="M90 88 L115 88" stroke="#4f46e5" strokeWidth="2" strokeDasharray="4 3" markerEnd="url(#arr42)" />
      <defs>
        <marker id="arr42" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#4f46e5" />
        </marker>
      </defs>
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">FOLLOW</text>
    </g>
  ),

  // 43: let — 自由にさせる・許す
  43: (
    <g>
      {/* Cage/barrier open */}
      <rect x={55} y={60} width={40} height={50} rx="2" fill="none" stroke="#cbd5e1" strokeWidth="2" />
      {/* Open gate */}
      <line x1={95} y1={60} x2={95} y2={80} stroke="#cbd5e1" strokeWidth="2" />
      {/* Person free */}
      <Person x={130} y={90} />
      {/* Arrow - free to go */}
      <path d="M100 85 L115 85" stroke="#34d399" strokeWidth="3" markerEnd="url(#arr43)" />
      <defs>
        <marker id="arr43" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#34d399" />
        </marker>
      </defs>
      {/* OK hand */}
      <text x={68} y={55} fontSize="10" fill="#34d399" fontWeight="bold">OK</text>
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">LET</text>
    </g>
  ),

  // 44: speak — 声を出して言葉を発する
  44: (
    <g>
      <Person x={85} y={95} />
      {/* Mouth */}
      <ellipse cx={85} cy={70} rx={4} ry={3} fill="#ef4444" opacity="0.5" />
      {/* Words coming out */}
      <text x={105} y={65} fontSize="11" fill="#4f46e5" fontWeight="bold">A</text>
      <text x={120} y={72} fontSize="9" fill="#7c3aed">B</text>
      <text x={133} y={65} fontSize="10" fill="#a5b4fc">C</text>
      {/* Sound waves */}
      <path d="M96 68 Q102 72 96 76" fill="none" stroke="#a5b4fc" strokeWidth="1.5" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">SPEAK</text>
    </g>
  ),

  // 45: hear — 音が耳に入ってくる
  45: (
    <g>
      <Person x={120} y={95} />
      {/* Ear */}
      <path d="M132 62 Q140 58 138 68 Q136 74 132 70" fill="none" stroke="#4f46e5" strokeWidth="2" />
      {/* Sound coming in */}
      <path d="M70 70 Q60 80 70 90" fill="none" stroke="#a5b4fc" strokeWidth="2" />
      <path d="M80 68 Q72 80 80 92" fill="none" stroke="#818cf8" strokeWidth="2" />
      <path d="M90 66 Q84 80 90 94" fill="none" stroke="#4f46e5" strokeWidth="2" />
      {/* Musical notes */}
      <text x={55} y={75} fontSize="14" fill="#f59e0b">♪</text>
      <text x={62} y={90} fontSize="10" fill="#f59e0b">♫</text>
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">HEAR</text>
    </g>
  ),

  // 46: pay — 対価として差し出す
  46: (
    <g>
      <Person x={65} y={95} />
      {/* Money / coins */}
      <circle cx={100} cy={82} r={10} fill="#fbbf24" stroke="#f59e0b" strokeWidth="2" />
      <text x={100} y={86} textAnchor="middle" fontSize="10" fill="#92400e" fontWeight="bold">$</text>
      {/* Arrow giving money */}
      <path d="M112 82 L140 82" stroke="#4f46e5" strokeWidth="3" markerEnd="url(#arr46)" />
      <defs>
        <marker id="arr46" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#4f46e5" />
        </marker>
      </defs>
      {/* Shop */}
      <rect x={142} y={70} width={25} height={25} rx="3" fill="#e0e7ff" stroke="#4f46e5" strokeWidth="2" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">PAY</text>
    </g>
  ),

  // 47: grow — 少しずつ大きくなる
  47: (
    <g>
      {/* Plant growing */}
      <line x1={100} y1={120} x2={100} y2={80} stroke="#34d399" strokeWidth="3" />
      {/* Leaves */}
      <path d="M100 95 Q85 85 90 95" fill="#34d399" />
      <path d="M100 85 Q115 75 110 85" fill="#34d399" />
      {/* Flower */}
      <circle cx={100} cy={72} r={10} fill="#fbbf24" />
      <circle cx={100} cy={72} r={5} fill="#f59e0b" />
      {/* Ground */}
      <line x1={60} y1={120} x2={140} y2={120} stroke="#94a3b8" strokeWidth="2" />
      {/* Growth stages */}
      <line x1={65} y1={120} x2={65} y2={112} stroke="#86efac" strokeWidth="2" />
      <circle cx={65} cy={110} r={3} fill="#86efac" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">GROW</text>
    </g>
  ),

  // 48: build — 部品を組み合わせて築く
  48: (
    <g>
      {/* Building blocks */}
      <rect x={75} y={100} width={50} height={15} rx="2" fill="#94a3b8" />
      <rect x={80} y={85} width={40} height={15} rx="2" fill="#a5b4fc" />
      <rect x={85} y={70} width={30} height={15} rx="2" fill="#818cf8" />
      <rect x={90} y={55} width={20} height={15} rx="2" fill="#6366f1" />
      {/* Crane / placing block */}
      <rect x={120} y={40} width={16} height={12} rx="2" fill="#fbbf24" stroke="#f59e0b" strokeWidth="1" />
      <line x1={128} y1={52} x2={128} y2={55} stroke="#94a3b8" strokeWidth="1" strokeDasharray="2 1" />
      {/* Arrow down */}
      <path d="M140 45 L150 45" stroke="#a5b4fc" strokeWidth="1" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">BUILD</text>
    </g>
  ),

  // 49: drive — 力を加えて前に進ませる
  49: (
    <g>
      {/* Car body */}
      <rect x={55} y={82} width={70} height={25} rx="8" fill="#4f46e5" />
      <rect x={65} y={72} width={40} height={15} rx="5" fill="#818cf8" />
      {/* Windows */}
      <rect x={70} y={75} width={14} height={10} rx="2" fill="#e0e7ff" />
      <rect x={88} y={75} width={14} height={10} rx="2" fill="#e0e7ff" />
      {/* Wheels */}
      <circle cx={75} cy={108} r={8} fill="#374151" />
      <circle cx={75} cy={108} r={3} fill="#94a3b8" />
      <circle cx={110} cy={108} r={8} fill="#374151" />
      <circle cx={110} cy={108} r={3} fill="#94a3b8" />
      {/* Speed lines */}
      <line x1={38} y1={85} x2={50} y2={85} stroke="#a5b4fc" strokeWidth="2" />
      <line x1={35} y1={93} x2={52} y2={93} stroke="#c7d2fe" strokeWidth="2" />
      <line x1={38} y1={101} x2={50} y2={101} stroke="#a5b4fc" strokeWidth="2" />
      {/* Road */}
      <line x1={30} y1={118} x2={170} y2={118} stroke="#cbd5e1" strokeWidth="2" />
      <text x={100} y={155} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">DRIVE</text>
    </g>
  ),

  // 50: reach — 手を伸ばして届く
  50: (
    <g>
      <Person x={75} y={105} />
      {/* Extended arm reaching up */}
      <line x1={87} y1={97} x2={130} y2={65} stroke="#4f46e5" strokeWidth="3" strokeLinecap="round" />
      <circle cx={132} cy={63} r={4} fill="#4f46e5" />
      {/* Star / goal */}
      <polygon points="145,55 148,62 156,62 150,67 152,75 145,71 138,75 140,67 134,62 142,62" fill="#fbbf24" />
      {/* Stretch lines */}
      <path d="M95 90 Q110 75 125 65" fill="none" stroke="#a5b4fc" strokeWidth="1.5" strokeDasharray="3 2" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">REACH</text>
    </g>
  ),

  // 51: sit — 腰を下ろして座る
  51: (
    <g>
      {/* Person sitting on chair */}
      <circle cx={100} cy={55} r={10} fill="#4f46e5" />
      <line x1={100} y1={65} x2={100} y2={90} stroke="#4f46e5" strokeWidth="3" strokeLinecap="round" />
      {/* Arms */}
      <line x1={88} y1={78} x2={112} y2={78} stroke="#4f46e5" strokeWidth="3" strokeLinecap="round" />
      {/* Legs bent */}
      <line x1={100} y1={90} x2={85} y2={90} stroke="#4f46e5" strokeWidth="3" strokeLinecap="round" />
      <line x1={85} y1={90} x2={85} y2={115} stroke="#4f46e5" strokeWidth="3" strokeLinecap="round" />
      <line x1={100} y1={90} x2={115} y2={90} stroke="#4f46e5" strokeWidth="3" strokeLinecap="round" />
      <line x1={115} y1={90} x2={115} y2={115} stroke="#4f46e5" strokeWidth="3" strokeLinecap="round" />
      {/* Chair */}
      <rect x={80} y={88} width={45} height={4} rx="2" fill="#94a3b8" />
      <line x1={122} y1={92} x2={122} y2={118} stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" />
      <line x1={122} y1={68} x2={122} y2={92} stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" />
      {/* Ground */}
      <line x1={60} y1={118} x2={140} y2={118} stroke="#cbd5e1" strokeWidth="2" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">SIT</text>
    </g>
  ),

  // 52: eat — 食べ物を口に入れる
  52: (
    <g>
      <Person x={80} y={95} />
      {/* Arm to mouth */}
      <line x1={92} y1={87} x2={88} y2={70} stroke="#4f46e5" strokeWidth="3" strokeLinecap="round" />
      {/* Food */}
      <circle cx={88} cy={68} r={6} fill="#fbbf24" />
      {/* Plate */}
      <ellipse cx={130} cy={100} rx={25} ry={6} fill="#e0e7ff" stroke="#a5b4fc" strokeWidth="2" />
      {/* Food on plate */}
      <circle cx={125} cy={94} r={5} fill="#34d399" />
      <circle cx={135} cy={93} r={4} fill="#f59e0b" />
      <circle cx={130} cy={96} r={3} fill="#ef4444" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">EAT</text>
    </g>
  ),

  // 53: drink — 飲み物を口にする
  53: (
    <g>
      <Person x={75} y={95} />
      {/* Arm lifting cup */}
      <line x1={87} y1={87} x2={100} y2={72} stroke="#4f46e5" strokeWidth="3" strokeLinecap="round" />
      {/* Cup/glass */}
      <path d="M95 65 L93 85 L113 85 L111 65 Z" fill="#a5b4fc" stroke="#4f46e5" strokeWidth="2" />
      {/* Liquid inside */}
      <path d="M95 72 L93 85 L113 85 L111 72 Z" fill="#818cf8" opacity="0.5" />
      {/* Drops */}
      <circle cx={120} cy={70} r={2} fill="#818cf8" />
      <circle cx={124} cy={78} r={1.5} fill="#818cf8" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">DRINK</text>
    </g>
  ),

  // 54: sleep — 眠って休む
  54: (
    <g>
      {/* Person lying down */}
      <circle cx={70} cy={82} r={10} fill="#4f46e5" />
      <line x1={80} y1={82} x2={130} y2={82} stroke="#4f46e5" strokeWidth="3" strokeLinecap="round" />
      {/* Arms */}
      <line x1={90} y1={82} x2={85} y2={92} stroke="#4f46e5" strokeWidth="3" strokeLinecap="round" />
      {/* Legs */}
      <line x1={130} y1={82} x2={140} y2={92} stroke="#4f46e5" strokeWidth="3" strokeLinecap="round" />
      <line x1={130} y1={82} x2={138} y2={96} stroke="#4f46e5" strokeWidth="3" strokeLinecap="round" />
      {/* Bed */}
      <rect x={55} y={95} width={100} height={8} rx="3" fill="#a5b4fc" />
      {/* Pillow */}
      <ellipse cx={70} cy={92} rx={12} ry={6} fill="#c7d2fe" />
      {/* Zzz */}
      <text x={115} y={65} fontSize="10" fill="#7c3aed">z</text>
      <text x={128} y={55} fontSize="14" fill="#7c3aed">z</text>
      <text x={142} y={42} fontSize="18" fill="#7c3aed">z</text>
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">SLEEP</text>
    </g>
  ),

  // 55: walk — 歩いて進む
  55: (
    <g>
      {/* Walking person */}
      <circle cx={100} cy={55} r={10} fill="#4f46e5" />
      <line x1={100} y1={65} x2={100} y2={92} stroke="#4f46e5" strokeWidth="3" strokeLinecap="round" />
      {/* Arms swinging */}
      <line x1={100} y1={75} x2={85} y2={85} stroke="#4f46e5" strokeWidth="3" strokeLinecap="round" />
      <line x1={100} y1={75} x2={115} y2={68} stroke="#4f46e5" strokeWidth="3" strokeLinecap="round" />
      {/* Legs in walking pose */}
      <line x1={100} y1={92} x2={88} y2={115} stroke="#4f46e5" strokeWidth="3" strokeLinecap="round" />
      <line x1={100} y1={92} x2={112} y2={115} stroke="#4f46e5" strokeWidth="3" strokeLinecap="round" />
      {/* Footprints behind */}
      <ellipse cx={60} cy={118} rx={5} ry={3} fill="#c7d2fe" />
      <ellipse cx={48} cy={118} rx={5} ry={3} fill="#c7d2fe" opacity="0.5" />
      {/* Ground */}
      <line x1={30} y1={120} x2={170} y2={120} stroke="#cbd5e1" strokeWidth="2" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">WALK</text>
    </g>
  ),

  // 56: read — 文字を読む
  56: (
    <g>
      <Person x={75} y={100} />
      {/* Book */}
      <path d="M95 70 L95 110 L125 110 L125 70 Z" fill="white" stroke="#4f46e5" strokeWidth="2" />
      <path d="M125 70 L125 110 L155 110 L155 70 Z" fill="white" stroke="#4f46e5" strokeWidth="2" />
      {/* Text lines */}
      <line x1={100} y1={80} x2={120} y2={80} stroke="#a5b4fc" strokeWidth="1.5" />
      <line x1={100} y1={86} x2={118} y2={86} stroke="#c7d2fe" strokeWidth="1.5" />
      <line x1={100} y1={92} x2={120} y2={92} stroke="#a5b4fc" strokeWidth="1.5" />
      <line x1={100} y1={98} x2={116} y2={98} stroke="#c7d2fe" strokeWidth="1.5" />
      <line x1={130} y1={80} x2={150} y2={80} stroke="#a5b4fc" strokeWidth="1.5" />
      <line x1={130} y1={86} x2={148} y2={86} stroke="#c7d2fe" strokeWidth="1.5" />
      <line x1={130} y1={92} x2={150} y2={92} stroke="#a5b4fc" strokeWidth="1.5" />
      {/* Eyes looking at book */}
      <line x1={82} y1={72} x2={95} y2={78} stroke="#a5b4fc" strokeWidth="1.5" strokeDasharray="3 2" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">READ</text>
    </g>
  ),

  // 57: write — 文字を書く
  57: (
    <g>
      <Person x={70} y={100} />
      {/* Paper */}
      <rect x={100} y={70} width={55} height={50} rx="3" fill="white" stroke="#cbd5e1" strokeWidth="2" />
      {/* Written lines */}
      <line x1={108} y1={80} x2={145} y2={80} stroke="#4f46e5" strokeWidth="1.5" />
      <line x1={108} y1={88} x2={140} y2={88} stroke="#4f46e5" strokeWidth="1.5" />
      <line x1={108} y1={96} x2={130} y2={96} stroke="#4f46e5" strokeWidth="1.5" />
      {/* Pencil writing */}
      <line x1={130} y1={96} x2={138} y2={106} stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" />
      <polygon points="130,96 128,99 132,99" fill="#374151" />
      {/* Arm reaching */}
      <line x1={82} y1={92} x2={128} y2={96} stroke="#4f46e5" strokeWidth="2" strokeLinecap="round" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">WRITE</text>
    </g>
  ),

  // 58: learn — 知識を吸収して学ぶ
  58: (
    <g>
      <Person x={100} y={105} />
      {/* Brain / head glow */}
      <circle cx={100} cy={60} r={18} fill="none" stroke="#a5b4fc" strokeWidth="2" strokeDasharray="4 3" />
      {/* Knowledge flowing in */}
      <circle cx={55} cy={50} r={6} fill="#fbbf24" />
      <circle cx={145} cy={45} r={6} fill="#34d399" />
      <circle cx={70} cy={35} r={5} fill="#f472b6" />
      {/* Arrows into head */}
      <path d="M62 52 L85 58" stroke="#fbbf24" strokeWidth="2" markerEnd="url(#arr58)" />
      <path d="M138 48 L115 58" stroke="#34d399" strokeWidth="2" markerEnd="url(#arr58g)" />
      <defs>
        <marker id="arr58" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#fbbf24" />
        </marker>
        <marker id="arr58g" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#34d399" />
        </marker>
      </defs>
      {/* Light bulb */}
      <circle cx={100} cy={58} r={5} fill="#fbbf24" opacity="0.6" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">LEARN</text>
    </g>
  ),

  // 59: teach — 相手に知識を伝える
  59: (
    <g>
      <Person x={60} y={95} />
      {/* Blackboard */}
      <rect x={95} y={50} width={65} height={45} rx="3" fill="#1e293b" />
      {/* Writing on board */}
      <text x={110} y={70} fontSize="10" fill="#fbbf24">ABC</text>
      <text x={115} y={85} fontSize="10" fill="white">1+1=2</text>
      {/* Pointer */}
      <line x1={72} y1={87} x2={95} y2={72} stroke="#4f46e5" strokeWidth="2" strokeLinecap="round" />
      {/* Student */}
      <Person x={145} y={110} color="#7c3aed" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">TEACH</text>
    </g>
  ),

  // 60: wait — その場で時間が過ぎるのを待つ
  60: (
    <g>
      <Person x={100} y={100} />
      {/* Clock */}
      <circle cx={100} cy={50} r={18} fill="white" stroke="#4f46e5" strokeWidth="2" />
      <line x1={100} y1={50} x2={100} y2={40} stroke="#4f46e5" strokeWidth="2" strokeLinecap="round" />
      <line x1={100} y1={50} x2={108} y2={52} stroke="#4f46e5" strokeWidth="2" strokeLinecap="round" />
      <circle cx={100} cy={50} r={2} fill="#4f46e5" />
      {/* Hour marks */}
      <circle cx={100} cy={34} r={1.5} fill="#94a3b8" />
      <circle cx={116} cy={50} r={1.5} fill="#94a3b8" />
      <circle cx={100} cy={66} r={1.5} fill="#94a3b8" />
      <circle cx={84} cy={50} r={1.5} fill="#94a3b8" />
      {/* Waiting dots */}
      <circle cx={70} cy={120} r={3} fill="#a5b4fc" />
      <circle cx={82} cy={120} r={3} fill="#a5b4fc" opacity="0.6" />
      <circle cx={94} cy={120} r={3} fill="#a5b4fc" opacity="0.3" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">WAIT</text>
    </g>
  ),

  // 61: big — 大きい
  61: (
    <g>
      {/* Big circle */}
      <circle cx={100} cy={80} r={45} fill="#4f46e5" opacity="0.2" stroke="#4f46e5" strokeWidth="2" />
      {/* Small circle for contrast */}
      <circle cx={155} cy={115} r={12} fill="#a5b4fc" opacity="0.3" stroke="#a5b4fc" strokeWidth="1.5" />
      {/* Expanding arrows */}
      <line x1={100} y1={30} x2={100} y2={22} stroke="#4f46e5" strokeWidth="2" strokeLinecap="round" />
      <line x1={148} y1={80} x2={155} y2={80} stroke="#4f46e5" strokeWidth="2" strokeLinecap="round" />
      <line x1={52} y1={80} x2={45} y2={80} stroke="#4f46e5" strokeWidth="2" strokeLinecap="round" />
      <line x1={100} y1={128} x2={100} y2={135} stroke="#4f46e5" strokeWidth="2" strokeLinecap="round" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">BIG</text>
    </g>
  ),

  // 62: small — 小さい
  62: (
    <g>
      {/* Small circle */}
      <circle cx={100} cy={80} r={12} fill="#7c3aed" opacity="0.3" stroke="#7c3aed" strokeWidth="2" />
      {/* Big circle for contrast (outline only) */}
      <circle cx={100} cy={80} r={45} fill="none" stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="4 3" />
      {/* Shrinking arrows */}
      <path d="M100 30 L100 42" stroke="#7c3aed" strokeWidth="2" markerEnd="url(#arr62)" />
      <path d="M155 80 L148 80" stroke="#7c3aed" strokeWidth="2" markerEnd="url(#arr62)" />
      <path d="M45 80 L52 80" stroke="#7c3aed" strokeWidth="2" markerEnd="url(#arr62)" />
      <path d="M100 130 L100 122" stroke="#7c3aed" strokeWidth="2" markerEnd="url(#arr62)" />
      <defs>
        <marker id="arr62" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#7c3aed" />
        </marker>
      </defs>
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">SMALL</text>
    </g>
  ),

  // 63: hot — 熱い
  63: (
    <g>
      {/* Sun */}
      <circle cx={100} cy={70} r={22} fill="#fbbf24" />
      {/* Rays */}
      <line x1={100} y1={40} x2={100} y2={30} stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" />
      <line x1={125} y1={48} x2={132} y2={40} stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" />
      <line x1={130} y1={70} x2={140} y2={70} stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" />
      <line x1={125} y1={92} x2={132} y2={100} stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" />
      <line x1={75} y1={48} x2={68} y2={40} stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" />
      <line x1={70} y1={70} x2={60} y2={70} stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" />
      <line x1={75} y1={92} x2={68} y2={100} stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" />
      {/* Heat waves */}
      <path d="M80 110 Q85 105 90 110 Q95 115 100 110" fill="none" stroke="#ef4444" strokeWidth="2" />
      <path d="M100 115 Q105 110 110 115 Q115 120 120 115" fill="none" stroke="#ef4444" strokeWidth="2" opacity="0.6" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">HOT</text>
    </g>
  ),

  // 64: cold — 冷たい
  64: (
    <g>
      {/* Snowflake */}
      <line x1={100} y1={45} x2={100} y2={105} stroke="#4f46e5" strokeWidth="2" />
      <line x1={70} y1={60} x2={130} y2={90} stroke="#4f46e5" strokeWidth="2" />
      <line x1={70} y1={90} x2={130} y2={60} stroke="#4f46e5" strokeWidth="2" />
      {/* Snowflake branches */}
      <line x1={100} y1={55} x2={95} y2={50} stroke="#4f46e5" strokeWidth="1.5" />
      <line x1={100} y1={55} x2={105} y2={50} stroke="#4f46e5" strokeWidth="1.5" />
      <line x1={100} y1={95} x2={95} y2={100} stroke="#4f46e5" strokeWidth="1.5" />
      <line x1={100} y1={95} x2={105} y2={100} stroke="#4f46e5" strokeWidth="1.5" />
      {/* Small snowflakes */}
      <circle cx={60} cy={50} r={3} fill="#a5b4fc" />
      <circle cx={145} cy={60} r={2} fill="#c7d2fe" />
      <circle cx={55} cy={95} r={2} fill="#c7d2fe" />
      <circle cx={150} cy={100} r={3} fill="#a5b4fc" />
      {/* Icicles */}
      <polygon points="70,110 73,125 76,110" fill="#a5b4fc" />
      <polygon points="95,110 98,128 101,110" fill="#a5b4fc" />
      <polygon points="120,110 123,122 126,110" fill="#a5b4fc" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">COLD</text>
    </g>
  ),

  // 65: fast — 速い
  65: (
    <g>
      {/* Fast arrow */}
      <path d="M40 80 L150 80" stroke="#4f46e5" strokeWidth="4" markerEnd="url(#arr65)" />
      <defs>
        <marker id="arr65" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="8" markerHeight="8" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#4f46e5" />
        </marker>
      </defs>
      {/* Speed lines */}
      <line x1={35} y1={65} x2={65} y2={65} stroke="#a5b4fc" strokeWidth="2" />
      <line x1={30} y1={72} x2={55} y2={72} stroke="#c7d2fe" strokeWidth="2" />
      <line x1={35} y1={88} x2={65} y2={88} stroke="#a5b4fc" strokeWidth="2" />
      <line x1={30} y1={95} x2={55} y2={95} stroke="#c7d2fe" strokeWidth="2" />
      {/* Lightning bolt for speed */}
      <polygon points="130,55 120,72 128,72 118,95 140,72 132,72 142,55" fill="#fbbf24" stroke="#f59e0b" strokeWidth="1" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">FAST</text>
    </g>
  ),

  // 66: slow — 遅い
  66: (
    <g>
      {/* Snail */}
      <ellipse cx={95} cy={100} rx={25} ry={10} fill="#94a3b8" />
      {/* Shell */}
      <circle cx={105} cy={85} r={15} fill="#fbbf24" stroke="#f59e0b" strokeWidth="2" />
      <path d="M105 75 Q98 85 105 90 Q112 82 105 78" fill="none" stroke="#f59e0b" strokeWidth="1.5" />
      {/* Antennae */}
      <line x1={75} y1={95} x2={68} y2={82} stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
      <circle cx={68} cy={80} r={2} fill="#94a3b8" />
      <line x1={80} y1={93} x2={75} y2={82} stroke="#94a3b8" strokeWidth="2" strokeLinecap="round" />
      <circle cx={75} cy={80} r={2} fill="#94a3b8" />
      {/* Dotted trail (slow) */}
      <circle cx={130} cy={105} r={2} fill="#cbd5e1" />
      <circle cx={140} cy={105} r={2} fill="#cbd5e1" opacity="0.6" />
      <circle cx={150} cy={105} r={2} fill="#cbd5e1" opacity="0.3" />
      {/* Ground */}
      <line x1={40} y1={112} x2={160} y2={112} stroke="#cbd5e1" strokeWidth="2" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">SLOW</text>
    </g>
  ),

  // 67: happy — 嬉しい・幸せ
  67: (
    <g>
      {/* Happy face */}
      <circle cx={100} cy={75} r={30} fill="#fbbf24" />
      {/* Eyes */}
      <circle cx={88} cy={68} r={4} fill="#374151" />
      <circle cx={112} cy={68} r={4} fill="#374151" />
      {/* Happy mouth */}
      <path d="M85 82 Q100 98 115 82" fill="none" stroke="#374151" strokeWidth="3" strokeLinecap="round" />
      {/* Sparkles */}
      <circle cx={55} cy={55} r={3} fill="#f472b6" />
      <circle cx={148} cy={52} r={3} fill="#f472b6" />
      <line x1={60} y1={45} x2={60} y2={40} stroke="#f59e0b" strokeWidth="2" />
      <line x1={57} y1={42} x2={63} y2={42} stroke="#f59e0b" strokeWidth="2" />
      <line x1={143} y1={42} x2={143} y2={37} stroke="#f59e0b" strokeWidth="2" />
      <line x1={140} y1={39} x2={146} y2={39} stroke="#f59e0b" strokeWidth="2" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">HAPPY</text>
    </g>
  ),

  // 68: sad — 悲しい
  68: (
    <g>
      {/* Sad face */}
      <circle cx={100} cy={75} r={30} fill="#a5b4fc" />
      {/* Eyes */}
      <circle cx={88} cy={68} r={4} fill="#374151" />
      <circle cx={112} cy={68} r={4} fill="#374151" />
      {/* Sad mouth */}
      <path d="M85 90 Q100 78 115 90" fill="none" stroke="#374151" strokeWidth="3" strokeLinecap="round" />
      {/* Tear */}
      <path d="M88 75 Q86 82 88 88 Q92 82 88 75" fill="#4f46e5" opacity="0.5" />
      {/* Rain drops */}
      <line x1={60} y1={45} x2={58} y2={55} stroke="#a5b4fc" strokeWidth="1.5" />
      <line x1={75} y1={38} x2={73} y2={48} stroke="#c7d2fe" strokeWidth="1.5" />
      <line x1={130} y1={40} x2={128} y2={50} stroke="#a5b4fc" strokeWidth="1.5" />
      <line x1={145} y1={45} x2={143} y2={55} stroke="#c7d2fe" strokeWidth="1.5" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">SAD</text>
    </g>
  ),

  // 69: easy — 簡単
  69: (
    <g>
      {/* Smooth path */}
      <path d="M40 90 Q70 90 100 90 Q130 90 160 90" fill="none" stroke="#34d399" strokeWidth="4" strokeLinecap="round" />
      {/* Check mark */}
      <path d="M85 60 L95 72 L120 45" stroke="#34d399" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {/* Stars */}
      <circle cx={60} cy={55} r={3} fill="#fbbf24" />
      <circle cx={145} cy={58} r={3} fill="#fbbf24" />
      {/* Smile */}
      <path d="M90 105 Q100 115 110 105" fill="none" stroke="#34d399" strokeWidth="2" strokeLinecap="round" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">EASY</text>
    </g>
  ),

  // 70: hard — 難しい・硬い
  70: (
    <g>
      {/* Rocky/jagged path */}
      <path d="M40 95 L55 75 L70 100 L85 65 L100 95 L115 60 L130 90 L145 70 L160 95" fill="none" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      {/* Exclamation */}
      <text x={100} y={50} fontSize="20" fill="#ef4444" textAnchor="middle" fontWeight="bold">!!</text>
      {/* Sweat drops */}
      <path d="M70 45 Q68 52 70 55 Q72 52 70 45" fill="#a5b4fc" />
      <path d="M135 42 Q133 49 135 52 Q137 49 135 42" fill="#a5b4fc" />
      {/* X mark */}
      <line x1={55} y1={108} x2={65} y2={118} stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
      <line x1={65} y1={108} x2={55} y2={118} stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">HARD</text>
    </g>
  ),

  // 71: new — 新しい
  71: (
    <g>
      {/* Shiny new box */}
      <rect x={70} y={60} width={60} height={50} rx="6" fill="#4f46e5" stroke="#4f46e5" strokeWidth="2" />
      {/* NEW label */}
      <rect x={95} y={52} width={40} height={18} rx="9" fill="#ef4444" />
      <text x={115} y={65} textAnchor="middle" fontSize="10" fill="white" fontWeight="bold">NEW</text>
      {/* Sparkle effects */}
      <line x1={55} y1={55} x2={55} y2={48} stroke="#fbbf24" strokeWidth="2" />
      <line x1={51} y1={51} x2={59} y2={51} stroke="#fbbf24" strokeWidth="2" />
      <line x1={150} y1={60} x2={150} y2={53} stroke="#fbbf24" strokeWidth="2" />
      <line x1={146} y1={56} x2={154} y2={56} stroke="#fbbf24" strokeWidth="2" />
      <circle cx={145} cy={45} r={3} fill="#fbbf24" />
      <circle cx={60} cy={70} r={2} fill="#fbbf24" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">NEW</text>
    </g>
  ),

  // 72: old — 古い
  72: (
    <g>
      {/* Old worn box */}
      <rect x={70} y={60} width={60} height={50} rx="6" fill="#94a3b8" stroke="#64748b" strokeWidth="2" />
      {/* Cracks */}
      <path d="M80 65 L85 75 L82 85" fill="none" stroke="#64748b" strokeWidth="1.5" />
      <path d="M115 62 L120 72 L118 80" fill="none" stroke="#64748b" strokeWidth="1.5" />
      {/* Dust particles */}
      <circle cx={55} cy={85} r={2} fill="#cbd5e1" />
      <circle cx={145} cy={78} r={2} fill="#cbd5e1" />
      <circle cx={60} cy={70} r={1.5} fill="#cbd5e1" />
      <circle cx={148} cy={90} r={1.5} fill="#cbd5e1" />
      {/* Cobweb */}
      <path d="M70 60 L58 50 L70 70" fill="none" stroke="#cbd5e1" strokeWidth="1" />
      <path d="M58 50 L65 65" fill="none" stroke="#cbd5e1" strokeWidth="1" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">OLD</text>
    </g>
  ),

  // 73: long — 長い
  73: (
    <g>
      {/* Long horizontal bar */}
      <rect x={25} y={75} width={150} height={16} rx="8" fill="#4f46e5" />
      {/* Double-headed arrow showing length */}
      <path d="M30 100 L170 100" stroke="#a5b4fc" strokeWidth="2" />
      <polygon points="30,100 38,96 38,104" fill="#a5b4fc" />
      <polygon points="170,100 162,96 162,104" fill="#a5b4fc" />
      {/* Short bar for contrast */}
      <rect x={80} y={55} width={40} height={10} rx="5" fill="#cbd5e1" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">LONG</text>
    </g>
  ),

  // 74: short — 短い
  74: (
    <g>
      {/* Short bar */}
      <rect x={80} y={75} width={40} height={16} rx="8" fill="#7c3aed" />
      {/* Double-headed arrow showing shortness */}
      <path d="M82 100 L118 100" stroke="#a5b4fc" strokeWidth="2" />
      <polygon points="82,100 90,96 90,104" fill="#a5b4fc" />
      <polygon points="118,100 110,96 110,104" fill="#a5b4fc" />
      {/* Long bar for contrast */}
      <rect x={25} y={55} width={150} height={10} rx="5" fill="#cbd5e1" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">SHORT</text>
    </g>
  ),

  // 75: high — 高い
  75: (
    <g>
      {/* Tall bar */}
      <rect x={90} y={30} width={20} height={100} rx="4" fill="#4f46e5" />
      {/* Arrow pointing up */}
      <path d="M70 100 L70 35" stroke="#a5b4fc" strokeWidth="2" markerEnd="url(#arr75)" />
      <defs>
        <marker id="arr75" viewBox="0 0 10 10" refX="5" refY="1" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 10 L 5 0 L 10 10 z" fill="#a5b4fc" />
        </marker>
      </defs>
      {/* Low bar for contrast */}
      <rect x={135} y={110} width={20} height={20} rx="4" fill="#cbd5e1" />
      {/* Ground */}
      <line x1={50} y1={132} x2={170} y2={132} stroke="#cbd5e1" strokeWidth="2" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">HIGH</text>
    </g>
  ),

  // 76: low — 低い
  76: (
    <g>
      {/* Low bar */}
      <rect x={90} y={110} width={20} height={20} rx="4" fill="#7c3aed" />
      {/* Arrow pointing down */}
      <path d="M130 40 L130 115" stroke="#a5b4fc" strokeWidth="2" markerEnd="url(#arr76)" />
      <defs>
        <marker id="arr76" viewBox="0 0 10 10" refX="5" refY="9" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 0 L 5 10 L 10 0 z" fill="#a5b4fc" />
        </marker>
      </defs>
      {/* Tall bar for contrast */}
      <rect x={55} y={30} width={20} height={100} rx="4" fill="#cbd5e1" />
      {/* Ground */}
      <line x1={40} y1={132} x2={160} y2={132} stroke="#cbd5e1" strokeWidth="2" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">LOW</text>
    </g>
  ),

  // 77: strong — 強い
  77: (
    <g>
      {/* Person with muscles */}
      <circle cx={100} cy={50} r={12} fill="#4f46e5" />
      <line x1={100} y1={62} x2={100} y2={95} stroke="#4f46e5" strokeWidth="4" strokeLinecap="round" />
      {/* Flexed arms */}
      <line x1={100} y1={72} x2={78} y2={65} stroke="#4f46e5" strokeWidth="4" strokeLinecap="round" />
      <line x1={78} y1={65} x2={75} y2={50} stroke="#4f46e5" strokeWidth="4" strokeLinecap="round" />
      <line x1={100} y1={72} x2={122} y2={65} stroke="#4f46e5" strokeWidth="4" strokeLinecap="round" />
      <line x1={122} y1={65} x2={125} y2={50} stroke="#4f46e5" strokeWidth="4" strokeLinecap="round" />
      {/* Muscle bumps */}
      <circle cx={75} cy={55} r={6} fill="#4f46e5" opacity="0.5" />
      <circle cx={125} cy={55} r={6} fill="#4f46e5" opacity="0.5" />
      {/* Legs */}
      <line x1={100} y1={95} x2={88} y2={118} stroke="#4f46e5" strokeWidth="4" strokeLinecap="round" />
      <line x1={100} y1={95} x2={112} y2={118} stroke="#4f46e5" strokeWidth="4" strokeLinecap="round" />
      {/* Power lines */}
      <line x1={62} y1={45} x2={55} y2={42} stroke="#fbbf24" strokeWidth="2" />
      <line x1={138} y1={45} x2={145} y2={42} stroke="#fbbf24" strokeWidth="2" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">STRONG</text>
    </g>
  ),

  // 78: weak — 弱い
  78: (
    <g>
      {/* Wilting person */}
      <circle cx={100} cy={60} r={10} fill="#94a3b8" />
      <path d="M100 70 Q95 90 92 105" stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" fill="none" />
      {/* Drooping arms */}
      <line x1={97} y1={80} x2={82} y2={95} stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" />
      <line x1={97} y1={80} x2={115} y2={95} stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" />
      {/* Drooping legs */}
      <line x1={92} y1={105} x2={85} y2={120} stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" />
      <line x1={92} y1={105} x2={100} y2={120} stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" />
      {/* Broken bar */}
      <rect x={50} y={42} width={25} height={6} rx="2" fill="#cbd5e1" />
      <rect x={82} y={44} width={20} height={6} rx="2" fill="#cbd5e1" />
      {/* Down arrow */}
      <path d="M140 60 L140 100" stroke="#cbd5e1" strokeWidth="2" markerEnd="url(#arr78)" />
      <defs>
        <marker id="arr78" viewBox="0 0 10 10" refX="5" refY="9" markerWidth="5" markerHeight="5" orient="auto">
          <path d="M 0 0 L 5 10 L 10 0 z" fill="#cbd5e1" />
        </marker>
      </defs>
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">WEAK</text>
    </g>
  ),

  // 79: rich — 裕福な
  79: (
    <g>
      <Person x={100} y={95} />
      {/* Gold coins stacked */}
      <circle cx={55} cy={85} r={10} fill="#fbbf24" stroke="#f59e0b" strokeWidth="2" />
      <text x={55} y={89} textAnchor="middle" fontSize="10" fill="#92400e" fontWeight="bold">$</text>
      <circle cx={55} cy={100} r={10} fill="#fbbf24" stroke="#f59e0b" strokeWidth="2" />
      <text x={55} y={104} textAnchor="middle" fontSize="10" fill="#92400e" fontWeight="bold">$</text>
      <circle cx={145} cy={85} r={10} fill="#fbbf24" stroke="#f59e0b" strokeWidth="2" />
      <text x={145} y={89} textAnchor="middle" fontSize="10" fill="#92400e" fontWeight="bold">$</text>
      <circle cx={145} cy={100} r={10} fill="#fbbf24" stroke="#f59e0b" strokeWidth="2" />
      <text x={145} y={104} textAnchor="middle" fontSize="10" fill="#92400e" fontWeight="bold">$</text>
      {/* Sparkles */}
      <circle cx={70} cy={60} r={3} fill="#fbbf24" />
      <circle cx={130} cy={58} r={3} fill="#fbbf24" />
      <circle cx={100} cy={52} r={2} fill="#fbbf24" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">RICH</text>
    </g>
  ),

  // 80: poor — 貧しい
  80: (
    <g>
      <Person x={100} y={95} color="#94a3b8" />
      {/* Empty pockets */}
      <path d="M85 92 L80 100 L90 100 Z" fill="none" stroke="#cbd5e1" strokeWidth="1.5" />
      <path d="M115 92 L110 100 L120 100 Z" fill="none" stroke="#cbd5e1" strokeWidth="1.5" />
      {/* Empty wallet */}
      <rect x={60} y={108} width={20} height={14} rx="2" fill="none" stroke="#cbd5e1" strokeWidth="2" />
      {/* Moth flying out */}
      <path d="M72 108 Q75 102 78 105" fill="none" stroke="#cbd5e1" strokeWidth="1" />
      <path d="M78 105 Q82 100 85 103" fill="none" stroke="#cbd5e1" strokeWidth="1" />
      {/* Empty coin */}
      <circle cx={140} cy={110} r={10} fill="none" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="4 3" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">POOR</text>
    </g>
  ),

  // 81: always — いつも（100%の頻度）
  81: (
    <g>
      {/* Timeline */}
      <line x1={30} y1={80} x2={170} y2={80} stroke="#94a3b8" strokeWidth="2" />
      {/* All marks filled */}
      <circle cx={40} cy={80} r={6} fill="#4f46e5" />
      <circle cx={60} cy={80} r={6} fill="#4f46e5" />
      <circle cx={80} cy={80} r={6} fill="#4f46e5" />
      <circle cx={100} cy={80} r={6} fill="#4f46e5" />
      <circle cx={120} cy={80} r={6} fill="#4f46e5" />
      <circle cx={140} cy={80} r={6} fill="#4f46e5" />
      <circle cx={160} cy={80} r={6} fill="#4f46e5" />
      {/* 100% label */}
      <text x={100} y={60} textAnchor="middle" fontSize="12" fill="#4f46e5" fontWeight="bold">100%</text>
      {/* Infinity symbol */}
      <path d="M80 105 Q90 95 100 105 Q110 115 120 105 Q110 95 100 105 Q90 115 80 105" fill="none" stroke="#a5b4fc" strokeWidth="2" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">ALWAYS</text>
    </g>
  ),

  // 82: never — 決して〜ない（0%の頻度）
  82: (
    <g>
      {/* Timeline */}
      <line x1={30} y1={80} x2={170} y2={80} stroke="#94a3b8" strokeWidth="2" />
      {/* All marks empty */}
      <circle cx={40} cy={80} r={6} fill="none" stroke="#cbd5e1" strokeWidth="2" />
      <circle cx={60} cy={80} r={6} fill="none" stroke="#cbd5e1" strokeWidth="2" />
      <circle cx={80} cy={80} r={6} fill="none" stroke="#cbd5e1" strokeWidth="2" />
      <circle cx={100} cy={80} r={6} fill="none" stroke="#cbd5e1" strokeWidth="2" />
      <circle cx={120} cy={80} r={6} fill="none" stroke="#cbd5e1" strokeWidth="2" />
      <circle cx={140} cy={80} r={6} fill="none" stroke="#cbd5e1" strokeWidth="2" />
      <circle cx={160} cy={80} r={6} fill="none" stroke="#cbd5e1" strokeWidth="2" />
      {/* 0% label */}
      <text x={100} y={60} textAnchor="middle" fontSize="12" fill="#ef4444" fontWeight="bold">0%</text>
      {/* Big X */}
      <line x1={80} y1={100} x2={120} y2={125} stroke="#ef4444" strokeWidth="3" strokeLinecap="round" />
      <line x1={120} y1={100} x2={80} y2={125} stroke="#ef4444" strokeWidth="3" strokeLinecap="round" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">NEVER</text>
    </g>
  ),

  // 83: often — しばしば（高い頻度）
  83: (
    <g>
      {/* Timeline */}
      <line x1={30} y1={80} x2={170} y2={80} stroke="#94a3b8" strokeWidth="2" />
      {/* Most marks filled */}
      <circle cx={40} cy={80} r={6} fill="#4f46e5" />
      <circle cx={60} cy={80} r={6} fill="#4f46e5" />
      <circle cx={80} cy={80} r={6} fill="none" stroke="#cbd5e1" strokeWidth="2" />
      <circle cx={100} cy={80} r={6} fill="#4f46e5" />
      <circle cx={120} cy={80} r={6} fill="#4f46e5" />
      <circle cx={140} cy={80} r={6} fill="#4f46e5" />
      <circle cx={160} cy={80} r={6} fill="none" stroke="#cbd5e1" strokeWidth="2" />
      {/* ~70% label */}
      <text x={100} y={60} textAnchor="middle" fontSize="12" fill="#4f46e5" fontWeight="bold">~70%</text>
      {/* Bar graph */}
      <rect x={70} y={100} width={60} height={15} rx="3" fill="#e0e7ff" stroke="#a5b4fc" strokeWidth="1" />
      <rect x={70} y={100} width={42} height={15} rx="3" fill="#4f46e5" opacity="0.6" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">OFTEN</text>
    </g>
  ),

  // 84: usually — たいてい（高い頻度）
  84: (
    <g>
      {/* Timeline */}
      <line x1={30} y1={80} x2={170} y2={80} stroke="#94a3b8" strokeWidth="2" />
      {/* Almost all filled */}
      <circle cx={40} cy={80} r={6} fill="#4f46e5" />
      <circle cx={60} cy={80} r={6} fill="#4f46e5" />
      <circle cx={80} cy={80} r={6} fill="#4f46e5" />
      <circle cx={100} cy={80} r={6} fill="#4f46e5" />
      <circle cx={120} cy={80} r={6} fill="#4f46e5" />
      <circle cx={140} cy={80} r={6} fill="none" stroke="#cbd5e1" strokeWidth="2" />
      <circle cx={160} cy={80} r={6} fill="#4f46e5" />
      {/* ~85% label */}
      <text x={100} y={60} textAnchor="middle" fontSize="12" fill="#4f46e5" fontWeight="bold">~85%</text>
      {/* Bar graph */}
      <rect x={70} y={100} width={60} height={15} rx="3" fill="#e0e7ff" stroke="#a5b4fc" strokeWidth="1" />
      <rect x={70} y={100} width={51} height={15} rx="3" fill="#4f46e5" opacity="0.6" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">USUALLY</text>
    </g>
  ),

  // 85: sometimes — 時々（中程度の頻度）
  85: (
    <g>
      {/* Timeline */}
      <line x1={30} y1={80} x2={170} y2={80} stroke="#94a3b8" strokeWidth="2" />
      {/* Some marks filled */}
      <circle cx={40} cy={80} r={6} fill="none" stroke="#cbd5e1" strokeWidth="2" />
      <circle cx={60} cy={80} r={6} fill="#7c3aed" />
      <circle cx={80} cy={80} r={6} fill="none" stroke="#cbd5e1" strokeWidth="2" />
      <circle cx={100} cy={80} r={6} fill="none" stroke="#cbd5e1" strokeWidth="2" />
      <circle cx={120} cy={80} r={6} fill="#7c3aed" />
      <circle cx={140} cy={80} r={6} fill="none" stroke="#cbd5e1" strokeWidth="2" />
      <circle cx={160} cy={80} r={6} fill="#7c3aed" />
      {/* ~40% label */}
      <text x={100} y={60} textAnchor="middle" fontSize="12" fill="#7c3aed" fontWeight="bold">~40%</text>
      {/* Bar graph */}
      <rect x={70} y={100} width={60} height={15} rx="3" fill="#e0e7ff" stroke="#a5b4fc" strokeWidth="1" />
      <rect x={70} y={100} width={24} height={15} rx="3" fill="#7c3aed" opacity="0.6" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">SOMETIMES</text>
    </g>
  ),

  // 86: very — とても（強調）
  86: (
    <g>
      {/* Small circle growing to big */}
      <circle cx={60} cy={80} r={10} fill="#a5b4fc" opacity="0.3" />
      <circle cx={100} cy={80} r={25} fill="#4f46e5" opacity="0.3" />
      <circle cx={100} cy={80} r={35} fill="#4f46e5" opacity="0.15" />
      {/* Amplification arrows */}
      <path d="M75 80 L90 80" stroke="#4f46e5" strokeWidth="3" markerEnd="url(#arr86)" />
      <defs>
        <marker id="arr86" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#4f46e5" />
        </marker>
      </defs>
      {/* Exclamation marks */}
      <text x={140} y={65} fontSize="18" fill="#ef4444" fontWeight="bold">!</text>
      <text x={150} y={72} fontSize="14" fill="#ef4444" fontWeight="bold">!</text>
      <text x={158} y={68} fontSize="10" fill="#ef4444" fontWeight="bold">!</text>
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">VERY</text>
    </g>
  ),

  // 87: really — 本当に（強調・事実の確認）
  87: (
    <g>
      {/* Double underline for emphasis */}
      <rect x={60} y={60} width={80} height={35} rx="6" fill="white" stroke="#4f46e5" strokeWidth="3" />
      <rect x={58} y={58} width={84} height={39} rx="8" fill="none" stroke="#4f46e5" strokeWidth="1.5" />
      {/* TRUE text inside */}
      <text x={100} y={83} textAnchor="middle" fontSize="16" fill="#4f46e5" fontWeight="bold">TRUE</text>
      {/* Check mark */}
      <path d="M85 108 L95 118 L120 95" stroke="#34d399" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {/* Sparkles */}
      <circle cx={50} cy={55} r={3} fill="#fbbf24" />
      <circle cx={155} cy={50} r={3} fill="#fbbf24" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">REALLY</text>
    </g>
  ),

  // 88: almost — ほとんど（あと少し）
  88: (
    <g>
      {/* Progress bar nearly full */}
      <rect x={40} y={70} width={120} height={20} rx="10" fill="#e0e7ff" stroke="#a5b4fc" strokeWidth="2" />
      <rect x={42} y={72} width={110} height={16} rx="8" fill="#4f46e5" />
      {/* Gap indicator */}
      <line x1={155} y1={65} x2={155} y2={95} stroke="#ef4444" strokeWidth="1.5" strokeDasharray="3 2" />
      {/* 95% */}
      <text x={100} y={60} textAnchor="middle" fontSize="12" fill="#4f46e5" fontWeight="bold">95%</text>
      {/* Arrow pointing to gap */}
      <path d="M155 100 L155 108" stroke="#ef4444" strokeWidth="2" />
      <text x={155} y={120} textAnchor="middle" fontSize="9" fill="#ef4444">gap!</text>
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">ALMOST</text>
    </g>
  ),

  // 89: already — すでに（完了済み）
  89: (
    <g>
      {/* Timeline with past marker */}
      <line x1={30} y1={85} x2={170} y2={85} stroke="#94a3b8" strokeWidth="2" />
      {/* Past section */}
      <line x1={30} y1={85} x2={110} y2={85} stroke="#4f46e5" strokeWidth="4" />
      {/* Done marker */}
      <circle cx={110} cy={85} r={8} fill="#34d399" />
      <path d="M105 85 L108 89 L116 81" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* Now label */}
      <text x={140} y={80} textAnchor="middle" fontSize="10" fill="#94a3b8">now</text>
      <line x1={140} y1={82} x2={140} y2={92} stroke="#94a3b8" strokeWidth="1.5" />
      {/* DONE text */}
      <text x={70} y={70} textAnchor="middle" fontSize="11" fill="#4f46e5" fontWeight="bold">DONE</text>
      <path d="M55 72 L85 72" stroke="#4f46e5" strokeWidth="1" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">ALREADY</text>
    </g>
  ),

  // 90: just — ちょうど・たった今
  90: (
    <g>
      {/* Timeline */}
      <line x1={30} y1={85} x2={170} y2={85} stroke="#94a3b8" strokeWidth="2" />
      {/* Now marker */}
      <circle cx={130} cy={85} r={8} fill="#4f46e5" />
      <text x={130} y={75} textAnchor="middle" fontSize="10" fill="#4f46e5" fontWeight="bold">now</text>
      {/* Just happened marker (very close to now) */}
      <circle cx={115} cy={85} r={6} fill="#fbbf24" stroke="#f59e0b" strokeWidth="2" />
      {/* Very small gap */}
      <path d="M115 95 Q122 100 130 95" fill="none" stroke="#a5b4fc" strokeWidth="1.5" />
      <text x={122} y={110} textAnchor="middle" fontSize="9" fill="#a5b4fc">tiny gap</text>
      {/* Flash effect */}
      <line x1={115} y1={70} x2={115} y2={65} stroke="#fbbf24" strokeWidth="2" />
      <line x1={108} y1={73} x2={105} y2={68} stroke="#fbbf24" strokeWidth="2" />
      <line x1={122} y1={73} x2={125} y2={68} stroke="#fbbf24" strokeWidth="2" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">JUST</text>
    </g>
  ),

  // 91: time — 時間
  91: (
    <g>
      {/* Clock */}
      <circle cx={100} cy={75} r={35} fill="white" stroke="#4f46e5" strokeWidth="3" />
      {/* Hour markers */}
      <circle cx={100} cy={44} r={2} fill="#4f46e5" />
      <circle cx={131} cy={75} r={2} fill="#4f46e5" />
      <circle cx={100} cy={106} r={2} fill="#4f46e5" />
      <circle cx={69} cy={75} r={2} fill="#4f46e5" />
      {/* Clock hands */}
      <line x1={100} y1={75} x2={100} y2={52} stroke="#4f46e5" strokeWidth="3" strokeLinecap="round" />
      <line x1={100} y1={75} x2={120} y2={68} stroke="#4f46e5" strokeWidth="2" strokeLinecap="round" />
      <circle cx={100} cy={75} r={3} fill="#4f46e5" />
      {/* Second hand */}
      <line x1={100} y1={75} x2={95} y2={95} stroke="#ef4444" strokeWidth="1" strokeLinecap="round" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">TIME</text>
    </g>
  ),

  // 92: world — 世界
  92: (
    <g>
      {/* Globe */}
      <circle cx={100} cy={75} r={35} fill="#a5b4fc" stroke="#4f46e5" strokeWidth="2" />
      {/* Continents (simplified) */}
      <ellipse cx={100} cy={75} rx={35} ry={35} fill="none" stroke="#4f46e5" strokeWidth="1" />
      <ellipse cx={100} cy={75} rx={18} ry={35} fill="none" stroke="#4f46e5" strokeWidth="1" />
      {/* Latitude lines */}
      <ellipse cx={100} cy={60} rx={33} ry={8} fill="none" stroke="#4f46e5" strokeWidth="1" />
      <ellipse cx={100} cy={90} rx={33} ry={8} fill="none" stroke="#4f46e5" strokeWidth="1" />
      {/* Land patches */}
      <path d="M80 55 Q88 50 95 55 Q88 62 80 55" fill="#34d399" />
      <path d="M105 65 Q115 60 120 68 Q112 72 105 65" fill="#34d399" />
      <path d="M85 80 Q92 78 95 85 Q88 88 85 80" fill="#34d399" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">WORLD</text>
    </g>
  ),

  // 93: life — 人生・生命
  93: (
    <g>
      {/* Heartbeat line */}
      <path d="M30 85 L60 85 L70 60 L80 105 L90 70 L100 95 L110 85 L170 85" fill="none" stroke="#ef4444" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      {/* Heart */}
      <path d="M95 50 C95 44 86 42 86 50 C86 58 95 62 95 62 C95 62 104 58 104 50 C104 42 95 44 95 50" fill="#ef4444" opacity="0.6" />
      {/* Sprout (life) */}
      <line x1={140} y1={110} x2={140} y2={95} stroke="#34d399" strokeWidth="2" />
      <path d="M140 100 Q132 92 135 100" fill="#34d399" />
      <path d="M140 95 Q148 88 145 95" fill="#34d399" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">LIFE</text>
    </g>
  ),

  // 94: way — 道・方法
  94: (
    <g>
      {/* Winding path */}
      <path d="M40 120 Q60 100 80 105 Q100 110 100 90 Q100 70 120 65 Q140 60 160 45" fill="none" stroke="#4f46e5" strokeWidth="4" strokeLinecap="round" />
      {/* Path edges */}
      <path d="M35 125 Q55 105 75 110 Q95 115 95 95 Q95 75 115 70 Q135 65 155 50" fill="none" stroke="#a5b4fc" strokeWidth="1.5" strokeDasharray="4 3" />
      <path d="M45 115 Q65 95 85 100 Q105 105 105 85 Q105 65 125 60 Q145 55 165 40" fill="none" stroke="#a5b4fc" strokeWidth="1.5" strokeDasharray="4 3" />
      {/* Arrow at end */}
      <polygon points="160,45 165,38 155,42" fill="#4f46e5" />
      {/* Signpost */}
      <line x1={55} y1={70} x2={55} y2={95} stroke="#94a3b8" strokeWidth="2" />
      <rect x={42} y={65} width={26} height={10} rx="2" fill="#fbbf24" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">WAY</text>
    </g>
  ),

  // 95: day — 日・一日
  95: (
    <g>
      {/* Sun */}
      <circle cx={100} cy={60} r={20} fill="#fbbf24" />
      {/* Rays */}
      <line x1={100} y1={32} x2={100} y2={25} stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
      <line x1={120} y1={42} x2={125} y2={36} stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
      <line x1={128} y1={60} x2={135} y2={60} stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
      <line x1={120} y1={78} x2={125} y2={84} stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
      <line x1={80} y1={42} x2={75} y2={36} stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
      <line x1={72} y1={60} x2={65} y2={60} stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
      <line x1={80} y1={78} x2={75} y2={84} stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
      {/* Horizon */}
      <line x1={30} y1={100} x2={170} y2={100} stroke="#94a3b8" strokeWidth="2" />
      {/* Cloud */}
      <circle cx={50} cy={50} r={8} fill="white" opacity="0.8" />
      <circle cx={60} cy={48} r={10} fill="white" opacity="0.8" />
      <circle cx={70} cy={52} r={7} fill="white" opacity="0.8" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">DAY</text>
    </g>
  ),

  // 96: water — 水
  96: (
    <g>
      {/* Water drop */}
      <path d="M100 35 Q80 70 80 85 Q80 105 100 110 Q120 105 120 85 Q120 70 100 35" fill="#a5b4fc" stroke="#4f46e5" strokeWidth="2" />
      {/* Shine */}
      <ellipse cx={92} cy={75} rx={4} ry={8} fill="white" opacity="0.5" />
      {/* Ripples at bottom */}
      <path d="M65 120 Q80 115 95 120 Q110 125 125 120 Q140 115 155 120" fill="none" stroke="#a5b4fc" strokeWidth="2" />
      <path d="M70 128 Q85 123 100 128 Q115 133 130 128 Q145 123 155 128" fill="none" stroke="#c7d2fe" strokeWidth="1.5" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">WATER</text>
    </g>
  ),

  // 97: money — お金
  97: (
    <g>
      {/* Dollar bill */}
      <rect x={55} y={55} width={90} height={50} rx="4" fill="#34d399" stroke="#059669" strokeWidth="2" />
      <rect x={62} y={62} width={76} height={36} rx="2" fill="none" stroke="#059669" strokeWidth="1" />
      {/* Dollar sign */}
      <text x={100} y={90} textAnchor="middle" fontSize="28" fill="#059669" fontWeight="bold">$</text>
      {/* Coins */}
      <circle cx={60} cy={120} r={10} fill="#fbbf24" stroke="#f59e0b" strokeWidth="2" />
      <circle cx={80} cy={122} r={10} fill="#fbbf24" stroke="#f59e0b" strokeWidth="2" />
      <text x={60} y={124} textAnchor="middle" fontSize="8" fill="#92400e" fontWeight="bold">¢</text>
      <text x={80} y={126} textAnchor="middle" fontSize="8" fill="#92400e" fontWeight="bold">¢</text>
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">MONEY</text>
    </g>
  ),

  // 98: family — 家族
  98: (
    <g>
      {/* Parent 1 (taller) */}
      <circle cx={70} cy={55} r={10} fill="#4f46e5" />
      <line x1={70} y1={65} x2={70} y2={95} stroke="#4f46e5" strokeWidth="3" strokeLinecap="round" />
      <line x1={58} y1={78} x2={82} y2={78} stroke="#4f46e5" strokeWidth="3" strokeLinecap="round" />
      <line x1={70} y1={95} x2={62} y2={115} stroke="#4f46e5" strokeWidth="3" strokeLinecap="round" />
      <line x1={70} y1={95} x2={78} y2={115} stroke="#4f46e5" strokeWidth="3" strokeLinecap="round" />
      {/* Parent 2 */}
      <circle cx={130} cy={58} r={9} fill="#7c3aed" />
      <line x1={130} y1={67} x2={130} y2={95} stroke="#7c3aed" strokeWidth="3" strokeLinecap="round" />
      <line x1={118} y1={80} x2={142} y2={80} stroke="#7c3aed" strokeWidth="3" strokeLinecap="round" />
      <line x1={130} y1={95} x2={122} y2={115} stroke="#7c3aed" strokeWidth="3" strokeLinecap="round" />
      <line x1={130} y1={95} x2={138} y2={115} stroke="#7c3aed" strokeWidth="3" strokeLinecap="round" />
      {/* Child */}
      <circle cx={100} cy={72} r={7} fill="#f472b6" />
      <line x1={100} y1={79} x2={100} y2={100} stroke="#f472b6" strokeWidth="2" strokeLinecap="round" />
      <line x1={92} y1={88} x2={108} y2={88} stroke="#f472b6" strokeWidth="2" strokeLinecap="round" />
      <line x1={100} y1={100} x2={95} y2={115} stroke="#f472b6" strokeWidth="2" strokeLinecap="round" />
      <line x1={100} y1={100} x2={105} y2={115} stroke="#f472b6" strokeWidth="2" strokeLinecap="round" />
      {/* Heart above */}
      <path d="M100 42 C100 37 93 36 93 42 C93 48 100 51 100 51 C100 51 107 48 107 42 C107 36 100 37 100 42" fill="#ef4444" opacity="0.5" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">FAMILY</text>
    </g>
  ),

  // 99: school — 学校
  99: (
    <g>
      {/* School building */}
      <rect x={60} y={60} width={80} height={55} rx="2" fill="#e0e7ff" stroke="#4f46e5" strokeWidth="2" />
      {/* Roof */}
      <polygon points="55,60 100,35 145,60" fill="#4f46e5" />
      {/* Door */}
      <rect x={90} y={90} width={20} height={25} rx="2" fill="#4f46e5" />
      <circle cx={106} cy={103} r={2} fill="#fbbf24" />
      {/* Windows */}
      <rect x={68} y={70} width={15} height={12} rx="1" fill="white" stroke="#4f46e5" strokeWidth="1" />
      <rect x={117} y={70} width={15} height={12} rx="1" fill="white" stroke="#4f46e5" strokeWidth="1" />
      {/* Bell/clock on top */}
      <circle cx={100} cy={40} r={5} fill="#fbbf24" stroke="#f59e0b" strokeWidth="1" />
      {/* Flag */}
      <line x1={100} y1={25} x2={100} y2={35} stroke="#94a3b8" strokeWidth="2" />
      <polygon points="100,25 115,29 100,33" fill="#ef4444" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">SCHOOL</text>
    </g>
  ),

  // 100: friend — 友達
  100: (
    <g>
      {/* Two people */}
      <Person x={75} y={90} />
      <Person x={125} y={90} color="#7c3aed" />
      {/* Handshake / connection */}
      <line x1={87} y1={82} x2={100} y2={78} stroke="#4f46e5" strokeWidth="3" strokeLinecap="round" />
      <line x1={113} y1={82} x2={100} y2={78} stroke="#7c3aed" strokeWidth="3" strokeLinecap="round" />
      <circle cx={100} cy={78} r={4} fill="#fbbf24" />
      {/* Heart between them */}
      <path d="M100 55 C100 50 93 48 93 55 C93 62 100 65 100 65 C100 65 107 62 107 55 C107 48 100 50 100 55" fill="#f472b6" opacity="0.6" />
      {/* Sparkles */}
      <circle cx={60} cy={60} r={2} fill="#fbbf24" />
      <circle cx={140} cy={58} r={2} fill="#fbbf24" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">FRIEND</text>
    </g>
  ),
  // 101: know — 頭の中にすでに情報がある
  101: (
    <g>
      <Person x={100} y={105} />
      {/* Head with lightbulb - knowledge inside */}
      <circle cx={100} cy={55} r={20} fill="none" stroke="#a5b4fc" strokeWidth="2" strokeDasharray="4 3" />
      <circle cx={100} cy={52} r={6} fill="#fbbf24" />
      <line x1={100} y1={42} x2={100} y2={38} stroke="#fbbf24" strokeWidth="2" />
      <line x1={93} y1={45} x2={90} y2={42} stroke="#fbbf24" strokeWidth="2" />
      <line x1={107} y1={45} x2={110} y2={42} stroke="#fbbf24" strokeWidth="2" />
      {/* Info symbols */}
      <text x={92} y={66} fontSize="9" fill="#4f46e5">abc</text>
      <text x={100} y={165} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">KNOW</text>
    </g>
  ),

  // 102: want — まだ手にしていないものに手を伸ばす気持ち
  102: (
    <g>
      <Person x={75} y={100} />
      {/* Desired object */}
      <circle cx={145} cy={65} r={16} fill="#fbbf24" stroke="#f59e0b" strokeWidth="2" />
      {/* Reaching hands */}
      <line x1={87} y1={92} x2={120} y2={75} stroke="#4f46e5" strokeWidth="3" strokeLinecap="round" />
      {/* Dotted gap - can't reach */}
      <path d="M120 75 L135 68" stroke="#a5b4fc" strokeWidth="2" strokeDasharray="4 3" />
      {/* Heart desire */}
      <path d="M80 68 C80 64 75 62 75 66 C75 70 80 73 80 73 C80 73 85 70 85 66 C85 62 80 64 80 68" fill="#f472b6" opacity="0.6" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">WANT</text>
    </g>
  ),

  // 103: need — それがないと困る・なくてはならない
  103: (
    <g>
      <Person x={100} y={100} />
      {/* Empty space where something must go */}
      <rect x={70} y={60} width={25} height={25} rx="4" fill="none" stroke="#ef4444" strokeWidth="2" strokeDasharray="5 3" />
      {/* Exclamation - urgency */}
      <text x={82} y={80} textAnchor="middle" fontSize="16" fill="#ef4444" fontWeight="bold">!</text>
      {/* Required item */}
      <circle cx={140} cy={72} r={12} fill="#fbbf24" stroke="#f59e0b" strokeWidth="2" />
      {/* Arrow - must have */}
      <path d="M128 72 L100 72" stroke="#ef4444" strokeWidth="3" markerEnd="url(#arr103)" />
      <defs>
        <marker id="arr103" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#ef4444" />
        </marker>
      </defs>
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">NEED</text>
    </g>
  ),

  // 104: like — 心が引き寄せられる
  104: (
    <g>
      <Person x={100} y={100} />
      {/* Thumbs up */}
      <rect x={120} y={62} width={10} height={16} rx="3" fill="#4f46e5" />
      <rect x={117} y={58} width={6} height={22} rx="3" fill="#4f46e5" transform="rotate(-15 120 69)" />
      {/* Small heart */}
      <path d="M140 60 C140 56 135 54 135 58 C135 62 140 65 140 65 C140 65 145 62 145 58 C145 54 140 56 140 60" fill="#f472b6" opacity="0.7" />
      {/* Happy face hint */}
      <path d="M93 70 Q100 76 107 70" fill="none" stroke="#4f46e5" strokeWidth="2" strokeLinecap="round" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">LIKE</text>
    </g>
  ),

  // 105: love — 心の底から大切に思う
  105: (
    <g>
      <Person x={80} y={100} />
      <Person x={120} y={100} color="#7c3aed" />
      {/* Big heart between them */}
      <path d="M100 60 C100 50 85 47 85 57 C85 67 100 75 100 75 C100 75 115 67 115 57 C115 47 100 50 100 60" fill="#ef4444" opacity="0.8" />
      {/* Small hearts floating */}
      <path d="M70 55 C70 52 67 51 67 53 C67 55 70 57 70 57 C70 57 73 55 73 53 C73 51 70 52 70 55" fill="#f472b6" opacity="0.5" />
      <path d="M135 50 C135 47 132 46 132 48 C132 50 135 52 135 52 C135 52 138 50 138 48 C138 46 135 47 135 50" fill="#f472b6" opacity="0.5" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">LOVE</text>
    </g>
  ),

  // 106: hate — 心が強く拒否する
  106: (
    <g>
      <Person x={70} y={100} />
      {/* Object being rejected */}
      <circle cx={140} cy={80} r={14} fill="#cbd5e1" />
      {/* X mark - rejection */}
      <line x1={133} y1={73} x2={147} y2={87} stroke="#ef4444" strokeWidth="3" strokeLinecap="round" />
      <line x1={147} y1={73} x2={133} y2={87} stroke="#ef4444" strokeWidth="3" strokeLinecap="round" />
      {/* Pushing away gesture */}
      <line x1={82} y1={92} x2={110} y2={85} stroke="#4f46e5" strokeWidth="3" strokeLinecap="round" />
      {/* Angry marks */}
      <line x1={60} y1={65} x2={68} y2={60} stroke="#ef4444" strokeWidth="2" />
      <line x1={68} y1={65} x2={60} y2={60} stroke="#ef4444" strokeWidth="2" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">HATE</text>
    </g>
  ),

  // 107: hope — 良い結果を信じて待つ気持ち
  107: (
    <g>
      <Person x={100} y={105} />
      {/* Sun rising - hope */}
      <circle cx={100} cy={50} r={16} fill="#fbbf24" opacity="0.8" />
      {/* Rays */}
      <line x1={100} y1={28} x2={100} y2={22} stroke="#fbbf24" strokeWidth="2" />
      <line x1={118} y1={38} x2={124} y2={33} stroke="#fbbf24" strokeWidth="2" />
      <line x1={82} y1={38} x2={76} y2={33} stroke="#fbbf24" strokeWidth="2" />
      <line x1={122} y1={50} x2={128} y2={50} stroke="#fbbf24" strokeWidth="2" />
      <line x1={78} y1={50} x2={72} y2={50} stroke="#fbbf24" strokeWidth="2" />
      {/* Upward gaze */}
      <line x1={100} y1={72} x2={100} y2={66} stroke="#a5b4fc" strokeWidth="1.5" strokeDasharray="2 2" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">HOPE</text>
    </g>
  ),

  // 108: wish — 現実とは違うことを強く願う
  108: (
    <g>
      <Person x={80} y={105} />
      {/* Star - wishing star */}
      <polygon points="130,40 133,50 143,50 135,56 138,66 130,60 122,66 125,56 117,50 127,50" fill="#fbbf24" stroke="#f59e0b" strokeWidth="1" />
      {/* Sparkles around */}
      <circle cx={115} cy={38} r={2} fill="#c7d2fe" />
      <circle cx={148} cy={45} r={2} fill="#a5b4fc" />
      <circle cx={142} cy={70} r={2} fill="#c7d2fe" />
      {/* Wishing gesture - hands together */}
      <line x1={75} y1={92} x2={85} y2={88} stroke="#4f46e5" strokeWidth="2" strokeLinecap="round" />
      <line x1={85} y1={92} x2={75} y2={88} stroke="#4f46e5" strokeWidth="2" strokeLinecap="round" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">WISH</text>
    </g>
  ),

  // 109: believe — 心の中で本当だと受け入れる
  109: (
    <g>
      <Person x={100} y={105} />
      {/* Heart in head area - trust */}
      <circle cx={100} cy={55} r={22} fill="none" stroke="#a5b4fc" strokeWidth="2" />
      <path d="M100 50 C100 46 95 44 95 48 C95 52 100 55 100 55 C100 55 105 52 105 48 C105 44 100 46 100 50" fill="#7c3aed" opacity="0.7" />
      {/* Check mark - accepted */}
      <path d="M92 60 L98 66 L110 52" stroke="#34d399" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">BELIEVE</text>
    </g>
  ),

  // 110: understand — 意味が頭の中でつながる
  110: (
    <g>
      <Person x={100} y={108} />
      {/* Puzzle pieces connecting in head */}
      <circle cx={100} cy={55} r={24} fill="none" stroke="#a5b4fc" strokeWidth="2" strokeDasharray="4 3" />
      {/* Piece A */}
      <rect x={85} y={45} width={12} height={12} rx="2" fill="#818cf8" />
      {/* Piece B connecting */}
      <rect x={99} y={45} width={12} height={12} rx="2" fill="#fbbf24" />
      {/* Connection spark */}
      <circle cx={98} cy={51} r={3} fill="#34d399" />
      {/* Lightbulb */}
      <text x={100} y={38} textAnchor="middle" fontSize="12" fill="#fbbf24">!</text>
      <text x={100} y={165} textAnchor="middle" fontSize="12" fill="#6366f1" fontWeight="bold">UNDERSTAND</text>
    </g>
  ),

  // 111: remember — 過去の記憶がよみがえる
  111: (
    <g>
      <Person x={100} y={108} />
      {/* Thought bubble with image from past */}
      <ellipse cx={100} cy={52} rx={32} ry={20} fill="white" stroke="#a5b4fc" strokeWidth="2" />
      <circle cx={92} cy={74} r={3} fill="white" stroke="#a5b4fc" strokeWidth="1.5" />
      {/* Memory image inside */}
      <circle cx={95} cy={48} r={5} fill="#fbbf24" opacity="0.7" />
      <rect x={105} y={45} width={10} height={8} rx="2" fill="#a5b4fc" opacity="0.7" />
      {/* Rewind arrow */}
      <path d="M115 55 Q120 52 115 49" fill="none" stroke="#7c3aed" strokeWidth="1.5" />
      <text x={100} y={165} textAnchor="middle" fontSize="13" fill="#6366f1" fontWeight="bold">REMEMBER</text>
    </g>
  ),

  // 112: forget — 頭の中から記憶が消える
  112: (
    <g>
      <Person x={100} y={108} />
      {/* Head area */}
      <circle cx={100} cy={55} r={22} fill="none" stroke="#cbd5e1" strokeWidth="2" strokeDasharray="4 3" />
      {/* Fading text - memory disappearing */}
      <text x={92} y={52} fontSize="10" fill="#94a3b8" opacity="0.7">abc</text>
      <text x={96} y={62} fontSize="8" fill="#cbd5e1" opacity="0.4">xyz</text>
      {/* Floating away */}
      <path d="M115 45 Q125 35 135 40" fill="none" stroke="#cbd5e1" strokeWidth="1.5" />
      <circle cx={138} cy={40} r={3} fill="#cbd5e1" opacity="0.4" />
      {/* Question mark */}
      <text x={130} y={58} fontSize="14" fill="#94a3b8">?</text>
      <text x={100} y={165} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">FORGET</text>
    </g>
  ),

  // 113: begin — 最初の一歩が踏み出される
  113: (
    <g>
      {/* Starting line */}
      <line x1={60} y1={45} x2={60} y2={125} stroke="#4f46e5" strokeWidth="3" />
      {/* Person at start */}
      <Person x={80} y={95} />
      {/* Arrow forward */}
      <path d="M95 90 L130 90" stroke="#4f46e5" strokeWidth="3" markerEnd="url(#arr113)" />
      <defs>
        <marker id="arr113" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#4f46e5" />
        </marker>
      </defs>
      {/* "START" flag */}
      <line x1={60} y1={45} x2={60} y2={55} stroke="#4f46e5" strokeWidth="2" />
      <polygon points="60,45 80,50 60,55" fill="#34d399" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">BEGIN</text>
    </g>
  ),

  // 114: start — 動いていなかったものが動き出す
  114: (
    <g>
      {/* Power button */}
      <circle cx={100} cy={75} r={25} fill="none" stroke="#4f46e5" strokeWidth="3" />
      <path d="M100 55 L100 70" stroke="#34d399" strokeWidth="4" strokeLinecap="round" />
      <path d="M88 60 A18 18 0 1 0 112 60" fill="none" stroke="#34d399" strokeWidth="3" />
      {/* Energy sparks */}
      <circle cx={70} cy={60} r={3} fill="#fbbf24" />
      <circle cx={135} cy={65} r={2} fill="#fbbf24" />
      <circle cx={125} cy={50} r={2} fill="#fbbf24" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">START</text>
    </g>
  ),

  // 115: stop — ピタッと止まる
  115: (
    <g>
      {/* Stop sign */}
      <polygon points="100,45 120,55 120,75 100,85 80,75 80,55" fill="#ef4444" />
      <text x={100} y={73} textAnchor="middle" fontSize="12" fill="white" fontWeight="bold">STOP</text>
      {/* Person halting */}
      <Person x={100} y={115} />
      {/* Halt lines */}
      <line x1={70} y1={100} x2={70} y2={130} stroke="#ef4444" strokeWidth="2" opacity="0.5" />
      <line x1={130} y1={100} x2={130} y2={130} stroke="#ef4444" strokeWidth="2" opacity="0.5" />
      <text x={100} y={165} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">STOP</text>
    </g>
  ),

  // 116: finish — 最後まで完了する
  116: (
    <g>
      {/* Finish line */}
      <rect x={130} y={45} width={5} height={80} fill="#4f46e5" />
      {/* Checkered pattern */}
      <rect x={130} y={45} width={5} height={8} fill="#4f46e5" />
      <rect x={135} y={53} width={5} height={8} fill="#4f46e5" />
      <rect x={130} y={61} width={5} height={8} fill="#4f46e5" />
      <rect x={135} y={45} width={5} height={8} fill="#cbd5e1" />
      <rect x={130} y={53} width={5} height={8} fill="#cbd5e1" />
      <rect x={135} y={61} width={5} height={8} fill="#cbd5e1" />
      {/* Person crossing finish */}
      <Person x={120} y={95} />
      {/* Check mark */}
      <path d="M148 60 L155 68 L168 50" stroke="#34d399" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {/* Progress bar */}
      <rect x={45} y={130} width={100} height={6} rx="3" fill="#e0e7ff" />
      <rect x={45} y={130} width={100} height={6} rx="3" fill="#4f46e5" />
      <text x={100} y={165} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">FINISH</text>
    </g>
  ),

  // 117: change — 今までと違うものになる
  117: (
    <g>
      {/* Before state */}
      <circle cx={60} cy={75} r={18} fill="#4f46e5" />
      {/* After state */}
      <rect x={122} y={57} width={36} height={36} rx="4" fill="#7c3aed" />
      {/* Transformation arrow */}
      <path d="M82 75 L118 75" stroke="#f59e0b" strokeWidth="3" markerEnd="url(#arr117)" />
      <defs>
        <marker id="arr117" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#f59e0b" />
        </marker>
      </defs>
      {/* Sparkles */}
      <circle cx={100} cy={60} r={3} fill="#fbbf24" />
      <circle cx={105} cy={90} r={2} fill="#fbbf24" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">CHANGE</text>
    </g>
  ),

  // 118: choose — いくつかの中から一つを決める
  118: (
    <g>
      <Person x={100} y={108} />
      {/* Multiple options */}
      <circle cx={55} cy={55} r={12} fill="#cbd5e1" />
      <circle cx={100} cy={50} r={12} fill="#fbbf24" stroke="#f59e0b" strokeWidth="2" />
      <circle cx={145} cy={55} r={12} fill="#cbd5e1" />
      {/* Hand pointing to chosen one */}
      <line x1={100} y1={72} x2={100} y2={64} stroke="#4f46e5" strokeWidth="3" strokeLinecap="round" />
      {/* Check on chosen */}
      <path d="M94 48 L98 53 L107 44" stroke="#34d399" strokeWidth="2" fill="none" strokeLinecap="round" />
      <text x={100} y={165} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">CHOOSE</text>
    </g>
  ),

  // 119: decide — 迷いを断ち切って一つに決める
  119: (
    <g>
      <Person x={100} y={108} />
      {/* Fork in the road */}
      <line x1={100} y1={90} x2={100} y2={75} stroke="#94a3b8" strokeWidth="3" />
      <line x1={100} y1={75} x2={70} y2={50} stroke="#cbd5e1" strokeWidth="3" />
      <line x1={100} y1={75} x2={130} y2={50} stroke="#4f46e5" strokeWidth="3" />
      {/* X on rejected path */}
      <line x1={65} y1={45} x2={75} y2={55} stroke="#ef4444" strokeWidth="2" opacity="0.5" />
      <line x1={75} y1={45} x2={65} y2={55} stroke="#ef4444" strokeWidth="2" opacity="0.5" />
      {/* Arrow on chosen path */}
      <path d="M135 48 L145 40" stroke="#4f46e5" strokeWidth="2" markerEnd="url(#arr119)" />
      <defs>
        <marker id="arr119" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#4f46e5" />
        </marker>
      </defs>
      {/* Bold check */}
      <path d="M140 55 L145 60 L155 48" stroke="#34d399" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <text x={100} y={165} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">DECIDE</text>
    </g>
  ),

  // 120: agree — 同じ方向を向く
  120: (
    <g>
      <Person x={70} y={95} />
      <Person x={130} y={95} color="#7c3aed" />
      {/* Both nodding - same direction arrows */}
      <path d="M75 58 L75 52" stroke="#4f46e5" strokeWidth="2" markerEnd="url(#arr120)" />
      <path d="M125 58 L125 52" stroke="#7c3aed" strokeWidth="2" markerEnd="url(#arr120)" />
      <defs>
        <marker id="arr120" viewBox="0 0 10 10" refX="5" refY="1" markerWidth="5" markerHeight="5" orient="auto">
          <path d="M 0 10 L 5 0 L 10 10 z" fill="#34d399" />
        </marker>
      </defs>
      {/* Handshake in middle */}
      <line x1={82} y1={87} x2={95} y2={82} stroke="#4f46e5" strokeWidth="2" strokeLinecap="round" />
      <line x1={118} y1={87} x2={105} y2={82} stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" />
      <circle cx={100} cy={82} r={5} fill="#34d399" />
      {/* Check mark */}
      <path d="M97 82 L100 85 L105 78" stroke="white" strokeWidth="2" fill="none" strokeLinecap="round" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">AGREE</text>
    </g>
  ),

  // 121: win — 一番になる
  121: (
    <g>
      <Person x={100} y={95} />
      {/* Trophy */}
      <rect x={88} y={52} width={24} height={18} rx="4" fill="#fbbf24" stroke="#f59e0b" strokeWidth="2" />
      <rect x={95} y={70} width={10} height={6} fill="#f59e0b" />
      <rect x={90} y={76} width={20} height={4} rx="2" fill="#f59e0b" />
      {/* Trophy handles */}
      <path d="M88 56 Q80 60 88 66" fill="none" stroke="#f59e0b" strokeWidth="2" />
      <path d="M112 56 Q120 60 112 66" fill="none" stroke="#f59e0b" strokeWidth="2" />
      {/* Star */}
      <polygon points="100,38 103,46 111,46 105,50 107,58 100,54 93,58 95,50 89,46 97,46" fill="#fbbf24" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">WIN</text>
    </g>
  ),

  // 122: lose — 手の中にあったものが離れていく
  122: (
    <g>
      <Person x={80} y={100} />
      {/* Object fading away */}
      <circle cx={120} cy={75} r={10} fill="#fbbf24" opacity="0.6" />
      <circle cx={140} cy={65} r={10} fill="#fbbf24" opacity="0.3" />
      <circle cx={158} cy={55} r={10} fill="#fbbf24" opacity="0.1" />
      {/* Reaching hand failing */}
      <line x1={92} y1={92} x2={108} y2={80} stroke="#4f46e5" strokeWidth="2" strokeLinecap="round" />
      {/* Sad marks */}
      <line x1={70} y1={62} x2={66} y2={58} stroke="#94a3b8" strokeWidth="2" />
      <line x1={75} y1={58} x2={71} y2={62} stroke="#94a3b8" strokeWidth="2" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">LOSE</text>
    </g>
  ),

  // 123: fly — 空中を自由に移動する
  123: (
    <g>
      {/* Bird */}
      <path d="M80 60 Q90 48 100 60" fill="none" stroke="#4f46e5" strokeWidth="3" strokeLinecap="round" />
      <path d="M100 60 Q110 48 120 60" fill="none" stroke="#4f46e5" strokeWidth="3" strokeLinecap="round" />
      <circle cx={100} cy={63} r={5} fill="#4f46e5" />
      {/* Clouds */}
      <ellipse cx={55} cy={50} rx={18} ry={10} fill="#e0e7ff" />
      <ellipse cx={155} cy={70} rx={15} ry={8} fill="#e0e7ff" />
      {/* Motion trail */}
      <path d="M75 68 Q60 75 50 72" fill="none" stroke="#a5b4fc" strokeWidth="1.5" strokeDasharray="3 2" />
      {/* Sky dots */}
      <circle cx={140} cy={45} r={2} fill="#c7d2fe" />
      <circle cx={65} cy={80} r={2} fill="#c7d2fe" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">FLY</text>
    </g>
  ),

  // 124: swim — 水の中で体を動かして進む
  124: (
    <g>
      {/* Water */}
      <rect x={30} y={75} width={140} height={55} rx="4" fill="#a5b4fc" opacity="0.3" />
      {/* Waves */}
      <path d="M30 75 Q50 68 70 75 Q90 82 110 75 Q130 68 150 75 Q160 78 170 75" fill="none" stroke="#818cf8" strokeWidth="2" />
      {/* Swimmer */}
      <circle cx={100} cy={72} r={8} fill="#4f46e5" />
      <line x1={100} y1={80} x2={100} y2={100} stroke="#4f46e5" strokeWidth="3" strokeLinecap="round" />
      {/* Arms in swimming motion */}
      <line x1={100} y1={85} x2={80} y2={78} stroke="#4f46e5" strokeWidth="3" strokeLinecap="round" />
      <line x1={100} y1={85} x2={120} y2={92} stroke="#4f46e5" strokeWidth="3" strokeLinecap="round" />
      {/* Legs */}
      <line x1={100} y1={100} x2={90} y2={112} stroke="#4f46e5" strokeWidth="3" strokeLinecap="round" />
      <line x1={100} y1={100} x2={115} y2={110} stroke="#4f46e5" strokeWidth="3" strokeLinecap="round" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">SWIM</text>
    </g>
  ),

  // 125: sing — 声を出してメロディーにのせる
  125: (
    <g>
      <Person x={85} y={100} />
      {/* Open mouth */}
      <ellipse cx={85} cy={74} rx={4} ry={3} fill="#ef4444" opacity="0.4" />
      {/* Musical notes */}
      <text x={110} y={60} fontSize="16" fill="#7c3aed">♪</text>
      <text x={125} y={50} fontSize="12" fill="#a5b4fc">♫</text>
      <text x={140} y={65} fontSize="14" fill="#f472b6">♪</text>
      {/* Sound waves */}
      <path d="M95 70 Q102 74 95 78" fill="none" stroke="#a5b4fc" strokeWidth="1.5" />
      <path d="M100 66 Q110 74 100 82" fill="none" stroke="#c7d2fe" strokeWidth="1.5" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">SING</text>
    </g>
  ),

  // 126: dance — 音楽に合わせて体を動かす
  126: (
    <g>
      {/* Dancing figure - dynamic pose */}
      <circle cx={100} cy={50} r={10} fill="#7c3aed" />
      <line x1={100} y1={60} x2={95} y2={88} stroke="#7c3aed" strokeWidth="3" strokeLinecap="round" />
      {/* Arms in dance pose */}
      <line x1={97} y1={68} x2={78} y2={55} stroke="#7c3aed" strokeWidth="3" strokeLinecap="round" />
      <line x1={97} y1={68} x2={118} y2={60} stroke="#7c3aed" strokeWidth="3" strokeLinecap="round" />
      {/* Legs in dance pose */}
      <line x1={95} y1={88} x2={80} y2={110} stroke="#7c3aed" strokeWidth="3" strokeLinecap="round" />
      <line x1={95} y1={88} x2={115} y2={105} stroke="#7c3aed" strokeWidth="3" strokeLinecap="round" />
      {/* Music notes */}
      <text x={55} y={60} fontSize="12" fill="#f472b6">♪</text>
      <text x={145} y={55} fontSize="14" fill="#f472b6">♫</text>
      {/* Motion lines */}
      <path d="M125 62 L130 58" stroke="#a5b4fc" strokeWidth="1.5" />
      <path d="M72 56 L67 52" stroke="#a5b4fc" strokeWidth="1.5" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">DANCE</text>
    </g>
  ),

  // 127: cry — 感情があふれて涙が出る
  127: (
    <g>
      <Person x={100} y={100} />
      {/* Tears */}
      <ellipse cx={90} cy={72} rx={2} ry={4} fill="#818cf8" />
      <ellipse cx={110} cy={72} rx={2} ry={4} fill="#818cf8" />
      <ellipse cx={88} cy={82} rx={2} ry={3} fill="#818cf8" opacity="0.6" />
      <ellipse cx={112} cy={80} rx={2} ry={3} fill="#818cf8" opacity="0.6" />
      {/* Sad mouth */}
      <path d="M94 76 Q100 72 106 76" fill="none" stroke="#4f46e5" strokeWidth="2" strokeLinecap="round" />
      {/* More tears falling */}
      <ellipse cx={86} cy={90} rx={1.5} ry={3} fill="#a5b4fc" opacity="0.4" />
      <ellipse cx={114} cy={88} rx={1.5} ry={3} fill="#a5b4fc" opacity="0.4" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">CRY</text>
    </g>
  ),

  // 128: laugh — 声を出して笑う
  128: (
    <g>
      <Person x={100} y={100} />
      {/* Big smile */}
      <path d="M90 70 Q100 80 110 70" fill="none" stroke="#4f46e5" strokeWidth="2.5" strokeLinecap="round" />
      {/* Laugh lines */}
      <text x={120} y={60} fontSize="11" fill="#f59e0b" fontWeight="bold">ha</text>
      <text x={135} y={52} fontSize="9" fill="#f59e0b">ha</text>
      <text x={128} y={70} fontSize="10" fill="#fbbf24">ha</text>
      {/* Happy eyes */}
      <path d="M92 64 Q95 61 98 64" fill="none" stroke="#4f46e5" strokeWidth="2" />
      <path d="M102 64 Q105 61 108 64" fill="none" stroke="#4f46e5" strokeWidth="2" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">LAUGH</text>
    </g>
  ),

  // 129: die — 命が尽きる
  129: (
    <g>
      {/* Wilting flower */}
      <line x1={100} y1={120} x2={100} y2={75} stroke="#94a3b8" strokeWidth="3" />
      <circle cx={100} cy={68} r={12} fill="#cbd5e1" opacity="0.5" />
      {/* Drooping petals */}
      <path d="M100 68 Q90 55 85 65" fill="none" stroke="#cbd5e1" strokeWidth="2" />
      <path d="M100 68 Q110 55 115 65" fill="none" stroke="#cbd5e1" strokeWidth="2" />
      <path d="M100 68 Q95 80 88 78" fill="none" stroke="#cbd5e1" strokeWidth="2" />
      {/* Ground */}
      <line x1={60} y1={120} x2={140} y2={120} stroke="#94a3b8" strokeWidth="2" />
      {/* X marks */}
      <line x1={60} y1={55} x2={70} y2={65} stroke="#ef4444" strokeWidth="2" opacity="0.5" />
      <line x1={70} y1={55} x2={60} y2={65} stroke="#ef4444" strokeWidth="2" opacity="0.5" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">DIE</text>
    </g>
  ),

  // 130: live — ある場所で生活する・命がある
  130: (
    <g>
      {/* House */}
      <polygon points="100,40 65,65 135,65" fill="#818cf8" />
      <rect x={75} y={65} width={50} height={40} fill="#e0e7ff" stroke="#4f46e5" strokeWidth="2" />
      {/* Door */}
      <rect x={93} y={80} width={14} height={25} rx="2" fill="#4f46e5" />
      <circle cx={104} cy={93} r={2} fill="#fbbf24" />
      {/* Window */}
      <rect x={78} y={72} width={10} height={10} rx="1" fill="#fbbf24" opacity="0.6" />
      {/* Heart - alive */}
      <path d="M115 72 C115 69 112 68 112 70 C112 72 115 74 115 74 C115 74 118 72 118 70 C118 68 115 69 115 72" fill="#ef4444" opacity="0.6" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">LIVE</text>
    </g>
  ),

  // 131: beautiful — 目や心に強く訴える美しさ
  131: (
    <g>
      {/* Flower */}
      <circle cx={100} cy={70} r={8} fill="#f59e0b" />
      <circle cx={100} cy={55} r={7} fill="#f472b6" opacity="0.8" />
      <circle cx={112} cy={63} r={7} fill="#f472b6" opacity="0.8" />
      <circle cx={112} cy={77} r={7} fill="#f472b6" opacity="0.8" />
      <circle cx={100} cy={85} r={7} fill="#f472b6" opacity="0.8" />
      <circle cx={88} cy={77} r={7} fill="#f472b6" opacity="0.8" />
      <circle cx={88} cy={63} r={7} fill="#f472b6" opacity="0.8" />
      {/* Sparkles */}
      <circle cx={65} cy={55} r={3} fill="#fbbf24" />
      <circle cx={140} cy={60} r={2} fill="#fbbf24" />
      <circle cx={130} cy={85} r={3} fill="#fbbf24" />
      <circle cx={70} cy={90} r={2} fill="#fbbf24" />
      {/* Stem */}
      <line x1={100} y1={92} x2={100} y2={120} stroke="#34d399" strokeWidth="2" />
      <path d="M100 105 Q90 98 88 105" fill="#34d399" />
      <text x={100} y={160} textAnchor="middle" fontSize="12" fill="#6366f1" fontWeight="bold">BEAUTIFUL</text>
    </g>
  ),

  // 132: wonderful — 驚くほど素晴らしい
  132: (
    <g>
      {/* Stars burst */}
      <polygon points="100,35 105,50 120,50 108,58 113,72 100,63 87,72 92,58 80,50 95,50" fill="#fbbf24" />
      <circle cx={65} cy={55} r={4} fill="#fbbf24" opacity="0.6" />
      <circle cx={140} cy={50} r={3} fill="#fbbf24" opacity="0.6" />
      <circle cx={55} cy={80} r={3} fill="#f472b6" opacity="0.5" />
      <circle cx={150} cy={75} r={4} fill="#f472b6" opacity="0.5" />
      {/* Exclamation marks */}
      <text x={70} y={72} fontSize="14" fill="#7c3aed" fontWeight="bold">!</text>
      <text x={130} y={68} fontSize="14" fill="#7c3aed" fontWeight="bold">!</text>
      {/* Radiating lines */}
      <line x1={100} y1={25} x2={100} y2={30} stroke="#f59e0b" strokeWidth="2" />
      <line x1={125} y1={35} x2={130} y2={30} stroke="#f59e0b" strokeWidth="2" />
      <line x1={75} y1={35} x2={70} y2={30} stroke="#f59e0b" strokeWidth="2" />
      <text x={100} y={160} textAnchor="middle" fontSize="12" fill="#6366f1" fontWeight="bold">WONDERFUL</text>
    </g>
  ),

  // 133: important — 大きな意味を持つ
  133: (
    <g>
      {/* Crown / key symbol */}
      <polygon points="100,40 85,60 90,55 100,65 110,55 115,60" fill="#fbbf24" stroke="#f59e0b" strokeWidth="2" />
      {/* Document with star */}
      <rect x={78} y={68} width={44} height={50} rx="4" fill="white" stroke="#4f46e5" strokeWidth="2" />
      <line x1={88} y1={80} x2={112} y2={80} stroke="#a5b4fc" strokeWidth="2" />
      <line x1={88} y1={88} x2={108} y2={88} stroke="#c7d2fe" strokeWidth="2" />
      <line x1={88} y1={96} x2={110} y2={96} stroke="#c7d2fe" strokeWidth="2" />
      {/* Star - important */}
      <polygon points="100,100 102,106 108,106 103,110 105,116 100,112 95,116 97,110 92,106 98,106" fill="#fbbf24" />
      <text x={100} y={160} textAnchor="middle" fontSize="12" fill="#6366f1" fontWeight="bold">IMPORTANT</text>
    </g>
  ),

  // 134: different — 他とは同じではない
  134: (
    <g>
      {/* Same shapes */}
      <circle cx={50} cy={70} r={15} fill="#a5b4fc" />
      <circle cx={90} cy={70} r={15} fill="#a5b4fc" />
      {/* Different one */}
      <rect x={118} y={55} width={30} height={30} rx="4" fill="#f59e0b" />
      {/* Not equal sign */}
      <line x1={95} y1={100} x2={115} y2={100} stroke="#4f46e5" strokeWidth="2" />
      <line x1={95} y1={108} x2={115} y2={108} stroke="#4f46e5" strokeWidth="2" />
      <line x1={100} y1={95} x2={110} y2={113} stroke="#ef4444" strokeWidth="2.5" />
      {/* Pointer to different one */}
      <text x={133} y={50} textAnchor="middle" fontSize="10" fill="#f59e0b" fontWeight="bold">!</text>
      <text x={100} y={160} textAnchor="middle" fontSize="13" fill="#6366f1" fontWeight="bold">DIFFERENT</text>
    </g>
  ),

  // 135: special — 他とは違う特別な価値がある
  135: (
    <g>
      {/* Regular items */}
      <circle cx={50} cy={80} r={12} fill="#cbd5e1" />
      <circle cx={80} cy={80} r={12} fill="#cbd5e1" />
      <circle cx={150} cy={80} r={12} fill="#cbd5e1" />
      {/* Special item with glow */}
      <circle cx={115} cy={75} r={16} fill="#fbbf24" stroke="#f59e0b" strokeWidth="2" />
      {/* Sparkle around special */}
      <line x1={115} y1={52} x2={115} y2={46} stroke="#fbbf24" strokeWidth="2" />
      <line x1={102} y1={62} x2={98} y2={58} stroke="#fbbf24" strokeWidth="2" />
      <line x1={128} y1={62} x2={132} y2={58} stroke="#fbbf24" strokeWidth="2" />
      <line x1={136} y1={75} x2={140} y2={75} stroke="#fbbf24" strokeWidth="2" />
      <line x1={94} y1={75} x2={90} y2={75} stroke="#fbbf24" strokeWidth="2" />
      {/* Star */}
      <polygon points="115,67 117,72 122,72 118,75 119,80 115,77 111,80 112,75 108,72 113,72" fill="white" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">SPECIAL</text>
    </g>
  ),

  // 136: popular — 多くの人に好かれている
  136: (
    <g>
      {/* Central item */}
      <circle cx={100} cy={75} r={15} fill="#fbbf24" stroke="#f59e0b" strokeWidth="2" />
      {/* Many people around */}
      <circle cx={60} cy={55} r={6} fill="#4f46e5" />
      <circle cx={140} cy={55} r={6} fill="#4f46e5" />
      <circle cx={50} cy={85} r={6} fill="#7c3aed" />
      <circle cx={150} cy={85} r={6} fill="#7c3aed" />
      <circle cx={65} cy={110} r={6} fill="#4f46e5" />
      <circle cx={135} cy={110} r={6} fill="#4f46e5" />
      {/* Hearts pointing to center */}
      <path d="M70 60 L85 68" stroke="#f472b6" strokeWidth="1.5" />
      <path d="M130 60 L115 68" stroke="#f472b6" strokeWidth="1.5" />
      <path d="M60 90 L85 80" stroke="#f472b6" strokeWidth="1.5" />
      <path d="M140 90 L115 80" stroke="#f472b6" strokeWidth="1.5" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">POPULAR</text>
    </g>
  ),

  // 137: famous — 広く知られている
  137: (
    <g>
      {/* Star person */}
      <Person x={100} y={90} color="#f59e0b" />
      {/* Spotlight */}
      <path d="M85 40 L70 30 L130 30 L115 40" fill="#fbbf24" opacity="0.2" />
      <rect x={80} y={40} width={40} height={5} rx="2" fill="#fbbf24" opacity="0.5" />
      {/* Star */}
      <polygon points="100,30 103,38 111,38 105,42 107,50 100,46 93,50 95,42 89,38 97,38" fill="#fbbf24" />
      {/* Eyes watching */}
      <ellipse cx={50} cy={80} rx={6} ry={4} fill="white" stroke="#4f46e5" strokeWidth="1.5" />
      <circle cx={52} cy={80} r={2} fill="#4f46e5" />
      <ellipse cx={150} cy={80} rx={6} ry={4} fill="white" stroke="#4f46e5" strokeWidth="1.5" />
      <circle cx={148} cy={80} r={2} fill="#4f46e5" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">FAMOUS</text>
    </g>
  ),

  // 138: dangerous — 害を受ける可能性がある
  138: (
    <g>
      {/* Warning triangle */}
      <polygon points="100,35 70,90 130,90" fill="#fbbf24" stroke="#f59e0b" strokeWidth="2" />
      <text x={100} y={80} textAnchor="middle" fontSize="28" fill="#374151" fontWeight="bold">!</text>
      {/* Lightning bolts */}
      <path d="M55 60 L60 50 L55 65 L62 55" stroke="#ef4444" strokeWidth="2" fill="none" />
      <path d="M145 55 L150 45 L145 60 L152 50" stroke="#ef4444" strokeWidth="2" fill="none" />
      {/* Skull mark */}
      <line x1={75} y1={100} x2={80} y2={105} stroke="#ef4444" strokeWidth="2" />
      <line x1={80} y1={100} x2={75} y2={105} stroke="#ef4444" strokeWidth="2" />
      <line x1={120} y1={100} x2={125} y2={105} stroke="#ef4444" strokeWidth="2" />
      <line x1={125} y1={100} x2={120} y2={105} stroke="#ef4444" strokeWidth="2" />
      <text x={100} y={160} textAnchor="middle" fontSize="12" fill="#6366f1" fontWeight="bold">DANGEROUS</text>
    </g>
  ),

  // 139: safe — 危険がなく守られている
  139: (
    <g>
      {/* Shield */}
      <path d="M100 40 L130 55 L130 85 Q130 110 100 120 Q70 110 70 85 L70 55 Z" fill="#34d399" opacity="0.3" stroke="#34d399" strokeWidth="2" />
      {/* Check mark in shield */}
      <path d="M88 78 L96 88 L115 65" stroke="#34d399" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {/* Person inside */}
      <circle cx={100} cy={90} r={5} fill="#4f46e5" />
      <line x1={100} y1={95} x2={100} y2={108} stroke="#4f46e5" strokeWidth="2" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">SAFE</text>
    </g>
  ),

  // 140: clean — 汚れがなくすっきりしている
  140: (
    <g>
      {/* Sparkling surface */}
      <rect x={60} y={60} width={80} height={60} rx="8" fill="white" stroke="#a5b4fc" strokeWidth="2" />
      {/* Sparkles */}
      <polygon points="80,70 82,75 87,75 83,78 84,83 80,80 76,83 77,78 73,75 78,75" fill="#fbbf24" />
      <polygon points="120,75 122,79 126,79 123,82 124,86 120,83 116,86 117,82 114,79 118,79" fill="#fbbf24" />
      <polygon points="100,55 101,58 104,58 102,60 103,63 100,61 97,63 98,60 96,58 99,58" fill="#fbbf24" />
      {/* Shiny lines */}
      <line x1={70} y1={90} x2={75} y2={85} stroke="#a5b4fc" strokeWidth="1.5" />
      <line x1={130} y1={92} x2={125} y2={87} stroke="#a5b4fc" strokeWidth="1.5" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">CLEAN</text>
    </g>
  ),

  // 141: dirty — 汚れがついている
  141: (
    <g>
      {/* Object */}
      <rect x={60} y={60} width={80} height={60} rx="8" fill="#f5f5f4" stroke="#94a3b8" strokeWidth="2" />
      {/* Dirt spots */}
      <circle cx={80} cy={75} r={6} fill="#92400e" opacity="0.5" />
      <circle cx={110} cy={85} r={8} fill="#92400e" opacity="0.4" />
      <circle cx={95} cy={100} r={5} fill="#92400e" opacity="0.5" />
      <circle cx={125} cy={72} r={4} fill="#92400e" opacity="0.3" />
      <circle cx={72} cy={95} r={5} fill="#92400e" opacity="0.4" />
      {/* Stink lines */}
      <path d="M85 52 Q88 45 85 38" fill="none" stroke="#94a3b8" strokeWidth="1.5" />
      <path d="M100 50 Q103 43 100 36" fill="none" stroke="#94a3b8" strokeWidth="1.5" />
      <path d="M115 52 Q118 45 115 38" fill="none" stroke="#94a3b8" strokeWidth="1.5" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">DIRTY</text>
    </g>
  ),

  // 142: quiet — 音がなく穏やかな状態
  142: (
    <g>
      <Person x={100} y={95} />
      {/* Finger on lips - shh */}
      <line x1={100} y1={68} x2={100} y2={62} stroke="#4f46e5" strokeWidth="3" strokeLinecap="round" />
      {/* Shh text */}
      <text x={120} y={65} fontSize="12" fill="#94a3b8" fontStyle="italic">shh</text>
      {/* Silent waves (very faint) */}
      <path d="M65 80 Q62 85 65 90" fill="none" stroke="#cbd5e1" strokeWidth="1" />
      <path d="M55 78 Q51 85 55 92" fill="none" stroke="#e2e8f0" strokeWidth="1" />
      {/* Muted speaker */}
      <rect x={135} y={75} width={12} height={14} rx="2" fill="#cbd5e1" />
      <line x1={150} y1={72} x2={158} y2={65} stroke="#ef4444" strokeWidth="2" />
      <line x1={150} y1={65} x2={158} y2={72} stroke="#ef4444" strokeWidth="2" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">QUIET</text>
    </g>
  ),

  // 143: loud — 音が大きく響いている
  143: (
    <g>
      {/* Speaker */}
      <rect x={55} y={65} width={20} height={25} rx="3" fill="#4f46e5" />
      <polygon points="75,60 95,45 95,110 75,95" fill="#818cf8" />
      {/* Big sound waves */}
      <path d="M100 60 Q115 78 100 95" fill="none" stroke="#4f46e5" strokeWidth="3" />
      <path d="M110 50 Q130 78 110 105" fill="none" stroke="#818cf8" strokeWidth="3" />
      <path d="M120 40 Q145 78 120 115" fill="none" stroke="#a5b4fc" strokeWidth="2" />
      {/* Shake lines */}
      <line x1={140} y1={55} x2={148} y2={50} stroke="#f59e0b" strokeWidth="2" />
      <line x1={145} y1={75} x2={155} y2={75} stroke="#f59e0b" strokeWidth="2" />
      <line x1={140} y1={95} x2={148} y2={100} stroke="#f59e0b" strokeWidth="2" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">LOUD</text>
    </g>
  ),

  // 144: bright — 光があふれて輝いている
  144: (
    <g>
      {/* Sun / light source */}
      <circle cx={100} cy={70} r={22} fill="#fbbf24" />
      {/* Rays */}
      <line x1={100} y1={40} x2={100} y2={30} stroke="#f59e0b" strokeWidth="3" />
      <line x1={100} y1={100} x2={100} y2={110} stroke="#f59e0b" strokeWidth="3" />
      <line x1={70} y1={70} x2={60} y2={70} stroke="#f59e0b" strokeWidth="3" />
      <line x1={130} y1={70} x2={140} y2={70} stroke="#f59e0b" strokeWidth="3" />
      <line x1={79} y1={49} x2={72} y2={42} stroke="#f59e0b" strokeWidth="2" />
      <line x1={121} y1={49} x2={128} y2={42} stroke="#f59e0b" strokeWidth="2" />
      <line x1={79} y1={91} x2={72} y2={98} stroke="#f59e0b" strokeWidth="2" />
      <line x1={121} y1={91} x2={128} y2={98} stroke="#f59e0b" strokeWidth="2" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">BRIGHT</text>
    </g>
  ),

  // 145: dark — 光がなく見えにくい
  145: (
    <g>
      {/* Dark background area */}
      <rect x={50} y={40} width={100} height={80} rx="10" fill="#1e1b4b" opacity="0.7" />
      {/* Moon */}
      <circle cx={130} cy={55} r={12} fill="#fbbf24" opacity="0.7" />
      <circle cx={135} cy={52} r={10} fill="#1e1b4b" opacity="0.7" />
      {/* Stars */}
      <circle cx={70} cy={55} r={2} fill="#fbbf24" opacity="0.6" />
      <circle cx={90} cy={48} r={1.5} fill="#fbbf24" opacity="0.5" />
      <circle cx={110} cy={65} r={1.5} fill="#fbbf24" opacity="0.5" />
      <circle cx={75} cy={75} r={1} fill="#fbbf24" opacity="0.4" />
      {/* Silhouette */}
      <circle cx={100} cy={90} r={8} fill="#0f172a" opacity="0.8" />
      <line x1={100} y1={98} x2={100} y2={115} stroke="#0f172a" strokeWidth="3" opacity="0.8" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">DARK</text>
    </g>
  ),

  // 146: deep — 表面から底まで距離がある
  146: (
    <g>
      {/* Water surface */}
      <path d="M45 55 Q65 48 85 55 Q105 62 125 55 Q145 48 165 55" fill="none" stroke="#818cf8" strokeWidth="2" />
      {/* Water body */}
      <rect x={55} y={55} width={90} height={65} fill="#818cf8" opacity="0.2" />
      {/* Depth arrow */}
      <line x1={100} y1={55} x2={100} y2={118} stroke="#4f46e5" strokeWidth="2" />
      <polygon points="95,115 100,125 105,115" fill="#4f46e5" />
      {/* Depth labels */}
      <rect x={55} y={115} width={90} height={5} fill="#4f46e5" opacity="0.3" />
      {/* Fish at depth */}
      <ellipse cx={75} cy={90} rx={8} ry={4} fill="#fbbf24" opacity="0.6" />
      <polygon points="67,90 62,85 62,95" fill="#fbbf24" opacity="0.6" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">DEEP</text>
    </g>
  ),

  // 147: wide — 横に大きく広がっている
  147: (
    <g>
      {/* Wide road/surface */}
      <rect x={35} y={70} width={130} height={40} rx="4" fill="#e0e7ff" stroke="#a5b4fc" strokeWidth="2" />
      {/* Width arrows */}
      <line x1={40} y1={90} x2={160} y2={90} stroke="#4f46e5" strokeWidth="2" />
      <polygon points="40,85 30,90 40,95" fill="#4f46e5" />
      <polygon points="160,85 170,90 160,95" fill="#4f46e5" />
      {/* Width label */}
      <line x1={35} y1={60} x2={35} y2={110} stroke="#94a3b8" strokeWidth="1" strokeDasharray="3 2" />
      <line x1={165} y1={60} x2={165} y2={110} stroke="#94a3b8" strokeWidth="1" strokeDasharray="3 2" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">WIDE</text>
    </g>
  ),

  // 148: narrow — 幅が小さくせまい
  148: (
    <g>
      {/* Narrow path between walls */}
      <rect x={40} y={45} width={20} height={80} rx="3" fill="#94a3b8" />
      <rect x={140} y={45} width={20} height={80} rx="3" fill="#94a3b8" />
      {/* Narrow space */}
      <rect x={80} y={55} width={40} height={65} fill="#e0e7ff" opacity="0.5" />
      {/* Width arrows - small */}
      <line x1={82} y1={85} x2={118} y2={85} stroke="#4f46e5" strokeWidth="2" />
      <polygon points="82,81 75,85 82,89" fill="#4f46e5" />
      <polygon points="118,81 125,85 118,89" fill="#4f46e5" />
      {/* Person squeezing through */}
      <circle cx={100} cy={72} r={6} fill="#4f46e5" />
      <line x1={100} y1={78} x2={100} y2={95} stroke="#4f46e5" strokeWidth="2" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">NARROW</text>
    </g>
  ),

  // 149: heavy — 持ち上げるのに力がいるほど重い
  149: (
    <g>
      <Person x={100} y={95} />
      {/* Heavy box */}
      <rect x={80} y={68} width={40} height={25} rx="3" fill="#94a3b8" stroke="#64748b" strokeWidth="2" />
      <text x={100} y={85} textAnchor="middle" fontSize="10" fill="white" fontWeight="bold">kg</text>
      {/* Arms struggling */}
      <line x1={88} y1={87} x2={82} y2={78} stroke="#4f46e5" strokeWidth="3" strokeLinecap="round" />
      <line x1={112} y1={87} x2={118} y2={78} stroke="#4f46e5" strokeWidth="3" strokeLinecap="round" />
      {/* Down arrow - weight */}
      <path d="M100 96 L100 108" stroke="#ef4444" strokeWidth="3" />
      <polygon points="95,108 100,116 105,108" fill="#ef4444" />
      {/* Strain marks */}
      <line x1={75} y1={62} x2={72} y2={58} stroke="#ef4444" strokeWidth="1.5" />
      <line x1={128} y1={62} x2={131} y2={58} stroke="#ef4444" strokeWidth="1.5" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">HEAVY</text>
    </g>
  ),

  // 150: light — 重さが少なくふわっとしている
  150: (
    <g>
      {/* Feather */}
      <path d="M90 55 Q100 50 115 55 Q120 58 118 65 Q115 70 105 72 Q100 73 95 70 Q88 65 90 55" fill="#a5b4fc" opacity="0.6" stroke="#818cf8" strokeWidth="1.5" />
      <line x1={95} y1={72} x2={105} y2={55} stroke="#818cf8" strokeWidth="1.5" />
      {/* Floating up */}
      <path d="M100 80 Q95 90 100 100" fill="none" stroke="#c7d2fe" strokeWidth="1.5" strokeDasharray="3 2" />
      <path d="M100 100 Q105 108 100 115" fill="none" stroke="#e0e7ff" strokeWidth="1.5" strokeDasharray="3 2" />
      {/* Light box */}
      <rect x={55} y={85} width={25} height={18} rx="3" fill="#e0e7ff" stroke="#a5b4fc" strokeWidth="1.5" />
      {/* Up arrow - light weight */}
      <path d="M67 82 L67 72" stroke="#34d399" strokeWidth="2" />
      <polygon points="62,72 67,64 72,72" fill="#34d399" />
      {/* Person lifting easily */}
      <Person x={145} y={100} />
      <rect x={130} y={78} width={18} height={12} rx="2" fill="#e0e7ff" stroke="#a5b4fc" strokeWidth="1" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">LIGHT</text>
    </g>
  ),

  // 151: thick — 層が分厚く詰まっている
  151: (
    <g>
      {/* Thick book */}
      <rect x={75} y={55} width={50} height={65} rx="3" fill="#4f46e5" />
      <rect x={78} y={58} width={44} height={59} rx="2" fill="#e0e7ff" />
      {/* Pages showing thickness */}
      <line x1={78} y1={65} x2={122} y2={65} stroke="#c7d2fe" strokeWidth="1" />
      <line x1={78} y1={72} x2={122} y2={72} stroke="#c7d2fe" strokeWidth="1" />
      <line x1={78} y1={79} x2={122} y2={79} stroke="#c7d2fe" strokeWidth="1" />
      <line x1={78} y1={86} x2={122} y2={86} stroke="#c7d2fe" strokeWidth="1" />
      <line x1={78} y1={93} x2={122} y2={93} stroke="#c7d2fe" strokeWidth="1" />
      <line x1={78} y1={100} x2={122} y2={100} stroke="#c7d2fe" strokeWidth="1" />
      <line x1={78} y1={107} x2={122} y2={107} stroke="#c7d2fe" strokeWidth="1" />
      {/* Thickness indicator */}
      <line x1={140} y1={55} x2={140} y2={120} stroke="#f59e0b" strokeWidth="2" />
      <line x1={136} y1={55} x2={144} y2={55} stroke="#f59e0b" strokeWidth="2" />
      <line x1={136} y1={120} x2={144} y2={120} stroke="#f59e0b" strokeWidth="2" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">THICK</text>
    </g>
  ),

  // 152: thin — 厚みが少なくペラペラしている
  152: (
    <g>
      {/* Thin paper/sheet */}
      <rect x={70} y={82} width={60} height={3} rx="1" fill="#a5b4fc" stroke="#4f46e5" strokeWidth="1" />
      {/* Thickness indicator - small */}
      <line x1={140} y1={82} x2={140} y2={85} stroke="#f59e0b" strokeWidth="2" />
      <line x1={136} y1={82} x2={144} y2={82} stroke="#f59e0b" strokeWidth="2" />
      <line x1={136} y1={85} x2={144} y2={85} stroke="#f59e0b" strokeWidth="2" />
      {/* Wavy thin sheet */}
      <path d="M50 90 Q70 85 90 90 Q110 95 130 90 Q150 85 160 90" fill="none" stroke="#c7d2fe" strokeWidth="2" />
      {/* Thin person silhouette */}
      <circle cx={100} cy={55} r={8} fill="#4f46e5" />
      <line x1={100} y1={63} x2={100} y2={78} stroke="#4f46e5" strokeWidth="2" strokeLinecap="round" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">THIN</text>
    </g>
  ),

  // 153: soft — 触るとふわっとしている
  153: (
    <g>
      {/* Soft pillow */}
      <ellipse cx={100} cy={85} rx={40} ry={22} fill="#e0e7ff" stroke="#a5b4fc" strokeWidth="2" />
      {/* Fluffy curves on pillow */}
      <path d="M65 80 Q75 70 85 78" fill="none" stroke="#c7d2fe" strokeWidth="1.5" />
      <path d="M90 75 Q100 68 110 75" fill="none" stroke="#c7d2fe" strokeWidth="1.5" />
      <path d="M115 78 Q125 70 135 80" fill="none" stroke="#c7d2fe" strokeWidth="1.5" />
      {/* Hand pressing down */}
      <circle cx={100} cy={72} r={5} fill="#4f46e5" />
      <line x1={100} y1={67} x2={100} y2={55} stroke="#4f46e5" strokeWidth="3" strokeLinecap="round" />
      {/* Soft impression marks */}
      <path d="M85 95 Q90 100 95 95" fill="none" stroke="#a5b4fc" strokeWidth="1" />
      <path d="M105 95 Q110 100 115 95" fill="none" stroke="#a5b4fc" strokeWidth="1" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">SOFT</text>
    </g>
  ),

  // 154: hard — 力を入れても変形しない
  154: (
    <g>
      {/* Hard rock/block */}
      <rect x={70} y={70} width={60} height={45} rx="4" fill="#94a3b8" stroke="#64748b" strokeWidth="2" />
      {/* Impact marks - hitting and bouncing */}
      <line x1={100} y1={55} x2={100} y2={68} stroke="#4f46e5" strokeWidth="3" strokeLinecap="round" />
      <circle cx={100} cy={52} r={5} fill="#4f46e5" />
      {/* Bounce lines */}
      <line x1={90} y1={62} x2={85} y2={55} stroke="#ef4444" strokeWidth="2" />
      <line x1={110} y1={62} x2={115} y2={55} stroke="#ef4444" strokeWidth="2" />
      <line x1={100} y1={60} x2={100} y2={50} stroke="#ef4444" strokeWidth="2" />
      {/* Crack resistance lines */}
      <text x={100} y={97} textAnchor="middle" fontSize="16" fill="#64748b" fontWeight="bold">X</text>
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">HARD</text>
    </g>
  ),

  // 155: warm — ほどよい温度で心地よい
  155: (
    <g>
      {/* Sun - mild warmth */}
      <circle cx={100} cy={65} r={20} fill="#fbbf24" />
      {/* Gentle rays */}
      <line x1={100} y1={40} x2={100} y2={35} stroke="#f59e0b" strokeWidth="2" />
      <line x1={118} y1={48} x2={122} y2={44} stroke="#f59e0b" strokeWidth="2" />
      <line x1={125} y1={65} x2={130} y2={65} stroke="#f59e0b" strokeWidth="2" />
      <line x1={118} y1={82} x2={122} y2={86} stroke="#f59e0b" strokeWidth="2" />
      <line x1={82} y1={48} x2={78} y2={44} stroke="#f59e0b" strokeWidth="2" />
      <line x1={75} y1={65} x2={70} y2={65} stroke="#f59e0b" strokeWidth="2" />
      <line x1={82} y1={82} x2={78} y2={86} stroke="#f59e0b" strokeWidth="2" />
      {/* Warm waves rising */}
      <path d="M80 100 Q85 95 90 100 Q95 105 100 100" fill="none" stroke="#f59e0b" strokeWidth="1.5" opacity="0.5" />
      <path d="M100 100 Q105 95 110 100 Q115 105 120 100" fill="none" stroke="#f59e0b" strokeWidth="1.5" opacity="0.5" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">WARM</text>
    </g>
  ),

  // 156: cool — ひんやりと心地よい
  156: (
    <g>
      {/* Snowflake / cool breeze */}
      <line x1={100} y1={50} x2={100} y2={90} stroke="#a5b4fc" strokeWidth="2" />
      <line x1={80} y1={60} x2={120} y2={80} stroke="#a5b4fc" strokeWidth="2" />
      <line x1={80} y1={80} x2={120} y2={60} stroke="#a5b4fc" strokeWidth="2" />
      {/* Small branches on snowflake */}
      <line x1={100} y1={55} x2={95} y2={52} stroke="#a5b4fc" strokeWidth="1.5" />
      <line x1={100} y1={55} x2={105} y2={52} stroke="#a5b4fc" strokeWidth="1.5" />
      <line x1={100} y1={85} x2={95} y2={88} stroke="#a5b4fc" strokeWidth="1.5" />
      <line x1={100} y1={85} x2={105} y2={88} stroke="#a5b4fc" strokeWidth="1.5" />
      {/* Cool breeze lines */}
      <path d="M55 95 Q65 90 75 95" fill="none" stroke="#c7d2fe" strokeWidth="2" />
      <path d="M65 105 Q80 98 95 105" fill="none" stroke="#c7d2fe" strokeWidth="2" />
      <path d="M105 100 Q120 93 135 100" fill="none" stroke="#c7d2fe" strokeWidth="1.5" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">COOL</text>
    </g>
  ),

  // 157: dry — 水分がなくカラカラの状態
  157: (
    <g>
      {/* Cracked ground */}
      <rect x={50} y={80} width={100} height={40} rx="2" fill="#fbbf24" opacity="0.3" />
      <line x1={80} y1={80} x2={75} y2={120} stroke="#f59e0b" strokeWidth="2" />
      <line x1={110} y1={80} x2={115} y2={120} stroke="#f59e0b" strokeWidth="2" />
      <line x1={75} y1={100} x2={115} y2={95} stroke="#f59e0b" strokeWidth="1.5" />
      {/* Sun beating down */}
      <circle cx={100} cy={45} r={15} fill="#f59e0b" />
      <line x1={100} y1={25} x2={100} y2={20} stroke="#f59e0b" strokeWidth="2" />
      <line x1={115} y1={33} x2={120} y2={28} stroke="#f59e0b" strokeWidth="2" />
      <line x1={85} y1={33} x2={80} y2={28} stroke="#f59e0b" strokeWidth="2" />
      {/* No water droplet - crossed out */}
      <path d="M145 70 Q150 60 155 70 Q155 78 150 80 Q145 78 145 70" fill="none" stroke="#94a3b8" strokeWidth="1.5" />
      <line x1={142} y1={64} x2={158} y2={82} stroke="#ef4444" strokeWidth="2" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">DRY</text>
    </g>
  ),

  // 158: wet — 水分を含んでびしょびしょ
  158: (
    <g>
      {/* Rain drops */}
      <path d="M70 50 Q73 42 76 50 Q76 55 73 57 Q70 55 70 50" fill="#4f46e5" />
      <path d="M95 40 Q98 32 101 40 Q101 45 98 47 Q95 45 95 40" fill="#4f46e5" />
      <path d="M120 48 Q123 40 126 48 Q126 53 123 55 Q120 53 120 48" fill="#4f46e5" />
      <path d="M85 65 Q88 57 91 65 Q91 70 88 72 Q85 70 85 65" fill="#a5b4fc" />
      <path d="M110 60 Q113 52 116 60 Q116 65 113 67 Q110 65 110 60" fill="#a5b4fc" />
      {/* Puddle */}
      <ellipse cx={100} cy={110} rx={45} ry={10} fill="#a5b4fc" opacity="0.4" />
      {/* Splash marks */}
      <path d="M85 105 Q80 95 85 100" fill="none" stroke="#4f46e5" strokeWidth="1.5" />
      <path d="M115 105 Q120 95 115 100" fill="none" stroke="#4f46e5" strokeWidth="1.5" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">WET</text>
    </g>
  ),

  // 159: sweet — 砂糖のような甘さ
  159: (
    <g>
      {/* Candy / cupcake */}
      <rect x={80} y={75} width={40} height={30} rx="4" fill="#fbbf24" stroke="#f59e0b" strokeWidth="2" />
      {/* Frosting on top */}
      <path d="M78 75 Q85 60 92 70 Q100 58 108 70 Q115 60 122 75" fill="#f472b6" />
      {/* Cherry on top */}
      <circle cx={100} cy={55} r={5} fill="#ef4444" />
      <line x1={100} y1={50} x2={103} y2={45} stroke="#34d399" strokeWidth="1.5" />
      {/* Sweet sparkles */}
      <circle cx={65} cy={65} r={2} fill="#fbbf24" />
      <circle cx={140} cy={70} r={2} fill="#fbbf24" />
      <circle cx={55} cy={85} r={1.5} fill="#f472b6" />
      <circle cx={150} cy={80} r={1.5} fill="#f472b6" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">SWEET</text>
    </g>
  ),

  // 160: bitter — 舌にピリッとくる不快な味
  160: (
    <g>
      {/* Coffee cup */}
      <rect x={78} y={70} width={44} height={35} rx="4" fill="#94a3b8" />
      <path d="M122 80 Q135 80 135 90 Q135 100 122 100" fill="none" stroke="#94a3b8" strokeWidth="2" />
      {/* Dark liquid */}
      <rect x={82} y={74} width={36} height={12} rx="2" fill="#374151" />
      {/* Steam */}
      <path d="M88 60 Q85 50 90 45" fill="none" stroke="#cbd5e1" strokeWidth="1.5" />
      <path d="M100 58 Q97 48 102 42" fill="none" stroke="#cbd5e1" strokeWidth="1.5" />
      <path d="M112 60 Q109 50 114 45" fill="none" stroke="#cbd5e1" strokeWidth="1.5" />
      {/* Grimace face */}
      <circle cx={100} cy={120} r={3} fill="#ef4444" opacity="0.5" />
      <path d="M92 118 Q100 125 108 118" fill="none" stroke="#ef4444" strokeWidth="1.5" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">BITTER</text>
    </g>
  ),

  // 161: fresh — できたて・とれたてで生き生き
  161: (
    <g>
      {/* Fresh leaf */}
      <path d="M100 50 Q130 55 130 80 Q130 100 100 105 Q70 100 70 80 Q70 55 100 50" fill="#34d399" opacity="0.6" />
      <line x1={100} y1={55} x2={100} y2={100} stroke="#059669" strokeWidth="2" />
      <line x1={100} y1={70} x2={85} y2={65} stroke="#059669" strokeWidth="1.5" />
      <line x1={100} y1={80} x2={115} y2={75} stroke="#059669" strokeWidth="1.5" />
      {/* Water droplet - freshness */}
      <path d="M120 90 Q123 84 126 90 Q126 95 123 97 Q120 95 120 90" fill="#4f46e5" opacity="0.6" />
      {/* Sparkle marks */}
      <circle cx={75} cy={55} r={2} fill="#fbbf24" />
      <circle cx={130} cy={60} r={2} fill="#fbbf24" />
      <circle cx={140} cy={85} r={1.5} fill="#fbbf24" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">FRESH</text>
    </g>
  ),

  // 162: free — 束縛がなく好きにできる
  162: (
    <g>
      {/* Broken chains */}
      <path d="M55 80 Q60 75 65 80 Q70 85 65 90" fill="none" stroke="#94a3b8" strokeWidth="3" />
      <path d="M135 80 Q140 75 145 80 Q150 85 145 90" fill="none" stroke="#94a3b8" strokeWidth="3" />
      {/* Person with arms wide */}
      <circle cx={100} cy={55} r={10} fill="#4f46e5" />
      <line x1={100} y1={65} x2={100} y2={95} stroke="#4f46e5" strokeWidth="3" strokeLinecap="round" />
      <line x1={100} y1={75} x2={70} y2={65} stroke="#4f46e5" strokeWidth="3" strokeLinecap="round" />
      <line x1={100} y1={75} x2={130} y2={65} stroke="#4f46e5" strokeWidth="3" strokeLinecap="round" />
      <line x1={100} y1={95} x2={88} y2={115} stroke="#4f46e5" strokeWidth="3" strokeLinecap="round" />
      <line x1={100} y1={95} x2={112} y2={115} stroke="#4f46e5" strokeWidth="3" strokeLinecap="round" />
      {/* Bird flying - freedom */}
      <path d="M140 45 Q145 38 150 45" fill="none" stroke="#7c3aed" strokeWidth="2" />
      <path d="M150 45 Q155 38 160 45" fill="none" stroke="#7c3aed" strokeWidth="2" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">FREE</text>
    </g>
  ),

  // 163: busy — やることがたくさんあって手が離せない
  163: (
    <g>
      <Person x={100} y={90} />
      {/* Multiple task items around person */}
      <rect x={55} y={55} width={18} height={14} rx="2" fill="#fbbf24" />
      <rect x={130} y={55} width={18} height={14} rx="2" fill="#f472b6" />
      <rect x={45} y={85} width={18} height={14} rx="2" fill="#34d399" />
      <rect x={140} y={85} width={18} height={14} rx="2" fill="#a5b4fc" />
      <rect x={55} y={110} width={18} height={14} rx="2" fill="#ef4444" />
      <rect x={130} y={110} width={18} height={14} rx="2" fill="#fbbf24" />
      {/* Swirl of busyness */}
      <path d="M75 70 L88 78" stroke="#94a3b8" strokeWidth="1" strokeDasharray="3 2" />
      <path d="M128 62 L112 78" stroke="#94a3b8" strokeWidth="1" strokeDasharray="3 2" />
      <path d="M63 92 L88 87" stroke="#94a3b8" strokeWidth="1" strokeDasharray="3 2" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">BUSY</text>
    </g>
  ),

  // 164: lazy — 動きたくない・のんびりだらだら
  164: (
    <g>
      {/* Person lying on couch */}
      <rect x={50} y={95} width={100} height={10} rx="4" fill="#94a3b8" />
      <rect x={45} y={80} width={15} height={25} rx="4" fill="#94a3b8" />
      {/* Lying person */}
      <circle cx={70} cy={80} r={8} fill="#4f46e5" />
      <line x1={78} y1={82} x2={130} y2={88} stroke="#4f46e5" strokeWidth="3" strokeLinecap="round" />
      <line x1={90} y1={78} x2={85} y2={72} stroke="#4f46e5" strokeWidth="2" strokeLinecap="round" />
      {/* Zzz */}
      <text x={115} y={70} fontSize="14" fill="#a5b4fc" fontWeight="bold">Z</text>
      <text x={128} y={60} fontSize="11" fill="#c7d2fe" fontWeight="bold">z</text>
      <text x={138} y={52} fontSize="9" fill="#c7d2fe" fontWeight="bold">z</text>
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">LAZY</text>
    </g>
  ),

  // 165: angry — 心の中で怒りが燃えている
  165: (
    <g>
      {/* Angry face */}
      <circle cx={100} cy={75} r={25} fill="#fbbf24" />
      {/* Angry eyebrows */}
      <line x1={85} y1={65} x2={95} y2={70} stroke="#374151" strokeWidth="3" strokeLinecap="round" />
      <line x1={115} y1={65} x2={105} y2={70} stroke="#374151" strokeWidth="3" strokeLinecap="round" />
      {/* Eyes */}
      <circle cx={92} cy={74} r={2} fill="#374151" />
      <circle cx={108} cy={74} r={2} fill="#374151" />
      {/* Angry mouth */}
      <path d="M90 85 Q100 80 110 85" fill="none" stroke="#374151" strokeWidth="2" strokeLinecap="round" />
      {/* Anger marks */}
      <line x1={130} y1={50} x2={140} y2={50} stroke="#ef4444" strokeWidth="2" />
      <line x1={135} y1={45} x2={135} y2={55} stroke="#ef4444" strokeWidth="2" />
      <line x1={60} y1={50} x2={70} y2={50} stroke="#ef4444" strokeWidth="2" />
      <line x1={65} y1={45} x2={65} y2={55} stroke="#ef4444" strokeWidth="2" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">ANGRY</text>
    </g>
  ),

  // 166: kind — 相手を思いやる優しい気持ち
  166: (
    <g>
      <Person x={70} y={95} />
      <Person x={130} y={100} color="#7c3aed" />
      {/* Heart between them */}
      <path d="M95 70 C95 63 85 60 85 70 C85 80 95 85 95 85 C95 85 105 80 105 70 C105 60 95 63 95 70" fill="#f472b6" />
      {/* Helping hand extended */}
      <line x1={82} y1={87} x2={105} y2={87} stroke="#4f46e5" strokeWidth="2" strokeLinecap="round" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">KIND</text>
    </g>
  ),

  // 167: brave — 怖くても立ち向かう強い心
  167: (
    <g>
      <Person x={80} y={95} />
      {/* Shield */}
      <path d="M110 60 L125 65 L125 85 L110 95 L95 85 L95 65 Z" fill="#4f46e5" opacity="0.3" stroke="#4f46e5" strokeWidth="2" />
      {/* Star on shield */}
      <polygon points="110,70 112,76 118,76 113,80 115,86 110,82 105,86 107,80 102,76 108,76" fill="#fbbf24" />
      {/* Danger ahead (fire/dragon) */}
      <path d="M150 75 Q155 65 150 55 Q160 65 165 55 Q165 70 155 80" fill="#ef4444" opacity="0.5" />
      {/* Arrow forward */}
      <path d="M90 120 L120 120" stroke="#4f46e5" strokeWidth="2" markerEnd="url(#arr167)" />
      <defs>
        <marker id="arr167" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#4f46e5" />
        </marker>
      </defs>
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">BRAVE</text>
    </g>
  ),

  // 168: shy — 人前に出ると緊張して引っ込む
  168: (
    <g>
      {/* Person hiding behind wall */}
      <rect x={90} y={50} width={8} height={70} rx="2" fill="#94a3b8" />
      {/* Shy person peeking */}
      <circle cx={82} cy={70} r={9} fill="#4f46e5" />
      <line x1={82} y1={79} x2={82} y2={105} stroke="#4f46e5" strokeWidth="3" strokeLinecap="round" />
      {/* One eye peeking */}
      <circle cx={86} cy={69} r={2} fill="white" />
      {/* Blush marks */}
      <circle cx={76} cy={74} r={3} fill="#f472b6" opacity="0.4" />
      {/* Other people */}
      <Person x={130} y={90} color="#7c3aed" />
      <Person x={155} y={90} color="#7c3aed" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">SHY</text>
    </g>
  ),

  // 169: proud — 胸を張って自信を持っている
  169: (
    <g>
      {/* Person standing tall with chest out */}
      <circle cx={100} cy={50} r={11} fill="#4f46e5" />
      <line x1={100} y1={61} x2={100} y2={95} stroke="#4f46e5" strokeWidth="4" strokeLinecap="round" />
      <line x1={85} y1={75} x2={115} y2={75} stroke="#4f46e5" strokeWidth="3" strokeLinecap="round" />
      <line x1={100} y1={95} x2={88} y2={118} stroke="#4f46e5" strokeWidth="3" strokeLinecap="round" />
      <line x1={100} y1={95} x2={112} y2={118} stroke="#4f46e5" strokeWidth="3" strokeLinecap="round" />
      {/* Trophy/medal */}
      <circle cx={100} cy={72} r={8} fill="#fbbf24" stroke="#f59e0b" strokeWidth="2" />
      <text x={100} y={76} textAnchor="middle" fontSize="8" fill="#92400e" fontWeight="bold">1</text>
      {/* Sparkles around */}
      <circle cx={70} cy={50} r={2} fill="#fbbf24" />
      <circle cx={130} cy={50} r={2} fill="#fbbf24" />
      <circle cx={65} cy={70} r={1.5} fill="#f59e0b" />
      <circle cx={135} cy={70} r={1.5} fill="#f59e0b" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">PROUD</text>
    </g>
  ),

  // 170: careful — 一つ一つ気を配って慎重に進む
  170: (
    <g>
      <Person x={90} y={95} />
      {/* Magnifying glass / careful eye */}
      <circle cx={120} cy={70} r={12} fill="none" stroke="#4f46e5" strokeWidth="2" />
      <line x1={128} y1={79} x2={136} y2={87} stroke="#4f46e5" strokeWidth="3" strokeLinecap="round" />
      {/* Eye inside magnifier */}
      <ellipse cx={120} cy={70} rx={6} ry={4} fill="white" stroke="#4f46e5" strokeWidth="1" />
      <circle cx={121} cy={70} r={2} fill="#4f46e5" />
      {/* Warning triangle */}
      <polygon points="60,105 70,90 80,105" fill="none" stroke="#f59e0b" strokeWidth="2" />
      <text x={70} y={103} textAnchor="middle" fontSize="10" fill="#f59e0b" fontWeight="bold">!</text>
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">CAREFUL</text>
    </g>
  ),

  // 171: quickly — スピードを上げてすばやく
  171: (
    <g>
      {/* Fast person running */}
      <circle cx={110} cy={60} r={10} fill="#4f46e5" />
      <line x1={110} y1={70} x2={105} y2={95} stroke="#4f46e5" strokeWidth="3" strokeLinecap="round" />
      <line x1={105} y1={80} x2={90} y2={75} stroke="#4f46e5" strokeWidth="3" strokeLinecap="round" />
      <line x1={105} y1={80} x2={120} y2={85} stroke="#4f46e5" strokeWidth="3" strokeLinecap="round" />
      <line x1={105} y1={95} x2={92} y2={112} stroke="#4f46e5" strokeWidth="3" strokeLinecap="round" />
      <line x1={105} y1={95} x2={118} y2={110} stroke="#4f46e5" strokeWidth="3" strokeLinecap="round" />
      {/* Multiple speed lines */}
      <line x1={55} y1={65} x2={75} y2={65} stroke="#a5b4fc" strokeWidth="2" />
      <line x1={50} y1={75} x2={72} y2={75} stroke="#c7d2fe" strokeWidth="2" />
      <line x1={52} y1={85} x2={70} y2={85} stroke="#a5b4fc" strokeWidth="2" />
      <line x1={55} y1={95} x2={68} y2={95} stroke="#c7d2fe" strokeWidth="1.5" />
      {/* Lightning bolt for speed */}
      <path d="M140 55 L135 70 L145 68 L138 82" stroke="#f59e0b" strokeWidth="2" fill="none" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">QUICKLY</text>
    </g>
  ),

  // 172: slowly — スピードを落として丁寧に
  172: (
    <g>
      {/* Snail */}
      <ellipse cx={100} cy={95} rx={25} ry={10} fill="#94a3b8" />
      <path d="M110 85 Q125 60 110 65 Q95 70 105 80" fill="none" stroke="#94a3b8" strokeWidth="3" />
      <circle cx={110} cy={80} r={5} fill="#cbd5e1" stroke="#94a3b8" strokeWidth="1.5" />
      {/* Antennae */}
      <line x1={80} y1={90} x2={72} y2={78} stroke="#94a3b8" strokeWidth="2" />
      <circle cx={72} cy={76} r={2} fill="#94a3b8" />
      <line x1={85} y1={88} x2={80} y2={78} stroke="#94a3b8" strokeWidth="2" />
      <circle cx={80} cy={76} r={2} fill="#94a3b8" />
      {/* Slow dotted trail */}
      <circle cx={135} cy={98} r={2} fill="#cbd5e1" />
      <circle cx={145} cy={98} r={2} fill="#cbd5e1" opacity="0.7" />
      <circle cx={153} cy={98} r={2} fill="#cbd5e1" opacity="0.4" />
      {/* Clock showing passage of time */}
      <circle cx={60} cy={60} r={12} fill="white" stroke="#a5b4fc" strokeWidth="2" />
      <line x1={60} y1={60} x2={60} y2={52} stroke="#4f46e5" strokeWidth="2" />
      <line x1={60} y1={60} x2={67} y2={63} stroke="#4f46e5" strokeWidth="1.5" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">SLOWLY</text>
    </g>
  ),

  // 173: carefully — 一つ一つ気を配りながら丁寧に
  173: (
    <g>
      <Person x={80} y={95} />
      {/* Fragile box being handled */}
      <rect x={105} y={75} width={30} height={25} rx="3" fill="#fbbf24" stroke="#f59e0b" strokeWidth="2" />
      {/* Fragile symbol on box */}
      <path d="M115 80 L118 88 L112 85 L120 85 L114 88 L117 80" fill="none" stroke="#ef4444" strokeWidth="1" />
      {/* Gentle hands */}
      <line x1={92} y1={87} x2={104} y2={85} stroke="#4f46e5" strokeWidth="2" strokeLinecap="round" />
      {/* Careful dotted path */}
      <path d="M110 105 Q110 115 115 120" fill="none" stroke="#a5b4fc" strokeWidth="1.5" strokeDasharray="3 2" />
      {/* Eye watching closely */}
      <ellipse cx={78} cy={63} rx={6} ry={4} fill="white" stroke="#4f46e5" strokeWidth="1.5" />
      <circle cx={80} cy={63} r={2} fill="#4f46e5" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">CAREFULLY</text>
    </g>
  ),

  // 174: easily — 苦労せずにすんなりと
  174: (
    <g>
      <Person x={80} y={95} />
      {/* Checkmark - done easily */}
      <path d="M110 75 L120 88 L145 55" stroke="#34d399" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {/* Breeze/effortless swoosh */}
      <path d="M55 70 Q70 65 85 70" fill="none" stroke="#c7d2fe" strokeWidth="2" />
      <path d="M60 80 Q72 75 82 80" fill="none" stroke="#c7d2fe" strokeWidth="1.5" />
      {/* Smiling face indicator */}
      <path d="M75 70 Q80 62 85 70" fill="none" stroke="#fbbf24" strokeWidth="1.5" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">EASILY</text>
    </g>
  ),

  // 175: happily — 嬉しさや喜びに満ちた様子で
  175: (
    <g>
      <Person x={100} y={95} />
      {/* Smiley face on person */}
      <path d="M94 64 Q100 70 106 64" fill="none" stroke="#fbbf24" strokeWidth="2" strokeLinecap="round" />
      {/* Joy marks */}
      <text x={65} y={65} fontSize="14" fill="#f472b6">♪</text>
      <text x={130} y={60} fontSize="12" fill="#f472b6">♪</text>
      {/* Stars of happiness */}
      <circle cx={60} cy={80} r={3} fill="#fbbf24" />
      <circle cx={145} cy={75} r={2} fill="#fbbf24" />
      <circle cx={140} cy={90} r={2.5} fill="#f59e0b" />
      {/* Raised arms (joy) */}
      <line x1={88} y1={87} x2={75} y2={70} stroke="#4f46e5" strokeWidth="3" strokeLinecap="round" />
      <line x1={112} y1={87} x2={125} y2={70} stroke="#4f46e5" strokeWidth="3" strokeLinecap="round" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">HAPPILY</text>
    </g>
  ),

  // 176: suddenly — 予想していなかったことが急に起こる
  176: (
    <g>
      {/* Lightning bolt - sudden */}
      <polygon points="100,35 85,70 95,70 80,105 115,65 105,65 120,35" fill="#fbbf24" stroke="#f59e0b" strokeWidth="2" />
      {/* Shock lines */}
      <line x1={60} y1={50} x2={50} y2={45} stroke="#ef4444" strokeWidth="2" />
      <line x1={55} y1={70} x2={45} y2={70} stroke="#ef4444" strokeWidth="2" />
      <line x1={140} y1={50} x2={150} y2={45} stroke="#ef4444" strokeWidth="2" />
      <line x1={145} y1={70} x2={155} y2={70} stroke="#ef4444" strokeWidth="2" />
      {/* Exclamation */}
      <text x={60} y={95} fontSize="20" fill="#ef4444" fontWeight="bold">!</text>
      <text x={135} y={95} fontSize="20" fill="#ef4444" fontWeight="bold">!</text>
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">SUDDENLY</text>
    </g>
  ),

  // 177: finally — 長い時間の後にやっとたどり着く
  177: (
    <g>
      {/* Timeline */}
      <line x1={40} y1={85} x2={160} y2={85} stroke="#cbd5e1" strokeWidth="2" />
      {/* Dots along timeline */}
      <circle cx={50} cy={85} r={4} fill="#cbd5e1" />
      <circle cx={70} cy={85} r={4} fill="#cbd5e1" />
      <circle cx={90} cy={85} r={4} fill="#cbd5e1" />
      <circle cx={110} cy={85} r={4} fill="#a5b4fc" />
      <circle cx={130} cy={85} r={4} fill="#818cf8" />
      {/* Final destination - star */}
      <polygon points="150,85 153,77 160,77 155,72 157,65 150,69 143,65 145,72 140,77 147,77" fill="#fbbf24" stroke="#f59e0b" strokeWidth="1" />
      {/* Flag at end */}
      <line x1={150} y1={55} x2={150} y2={65} stroke="#ef4444" strokeWidth="2" />
      <polygon points="150,55 165,60 150,65" fill="#ef4444" />
      {/* Person at end */}
      <Person x={145} y={105} />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">FINALLY</text>
    </g>
  ),

  // 178: actually — 見かけとは違う本当のことを言う
  178: (
    <g>
      {/* Mask / surface appearance */}
      <circle cx={80} cy={70} r={18} fill="#cbd5e1" stroke="#94a3b8" strokeWidth="2" />
      <circle cx={74} cy={66} r={2} fill="#374151" />
      <circle cx={86} cy={66} r={2} fill="#374151" />
      <path d="M74 76 Q80 80 86 76" fill="none" stroke="#374151" strokeWidth="1.5" />
      {/* Arrow revealing truth */}
      <path d="M100 70 L115 70" stroke="#4f46e5" strokeWidth="3" markerEnd="url(#arr178)" />
      <defs>
        <marker id="arr178" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#4f46e5" />
        </marker>
      </defs>
      {/* Real face behind */}
      <circle cx={135} cy={70} r={18} fill="#fbbf24" stroke="#f59e0b" strokeWidth="2" />
      <circle cx={129} cy={66} r={2} fill="#374151" />
      <circle cx={141} cy={66} r={2} fill="#374151" />
      <path d="M129 78 Q135 72 141 78" fill="none" stroke="#374151" strokeWidth="1.5" />
      {/* "!" truth */}
      <text x={135} y={56} textAnchor="middle" fontSize="12" fill="#ef4444" fontWeight="bold">!</text>
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">ACTUALLY</text>
    </g>
  ),

  // 179: probably — 高い確率でそうだろうと予想する
  179: (
    <g>
      {/* Probability meter */}
      <rect x={75} y={55} width={50} height={65} rx="4" fill="none" stroke="#94a3b8" strokeWidth="2" />
      {/* Fill level ~80% */}
      <rect x={78} y={68} width={44} height={49} rx="2" fill="#4f46e5" opacity="0.3" />
      {/* Percentage lines */}
      <line x1={70} y1={117} x2={75} y2={117} stroke="#94a3b8" strokeWidth="1" />
      <line x1={70} y1={102} x2={75} y2={102} stroke="#94a3b8" strokeWidth="1" />
      <line x1={70} y1={87} x2={75} y2={87} stroke="#94a3b8" strokeWidth="1" />
      <line x1={70} y1={72} x2={75} y2={72} stroke="#94a3b8" strokeWidth="1" />
      <line x1={70} y1={57} x2={75} y2={57} stroke="#94a3b8" strokeWidth="1" />
      {/* ~80% text */}
      <text x={100} y={95} textAnchor="middle" fontSize="16" fill="#4f46e5" fontWeight="bold">80%</text>
      {/* Question mark */}
      <text x={140} y={70} fontSize="18" fill="#f59e0b" fontWeight="bold">?</text>
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">PROBABLY</text>
    </g>
  ),

  // 180: certainly — 疑いなく間違いなくそうだ
  180: (
    <g>
      {/* Big checkmark */}
      <path d="M65 80 L90 105 L140 50" stroke="#34d399" strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {/* 100% text */}
      <text x={100} y={130} textAnchor="middle" fontSize="14" fill="#4f46e5" fontWeight="bold">100%</text>
      {/* Certainty sparkles */}
      <circle cx={55} cy={55} r={3} fill="#fbbf24" />
      <circle cx={155} cy={60} r={2} fill="#fbbf24" />
      <circle cx={150} cy={45} r={2.5} fill="#f59e0b" />
      <circle cx={50} cy={70} r={2} fill="#f59e0b" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">CERTAINLY</text>
    </g>
  ),

  // 181: together — バラバラではなくひとまとまりに
  181: (
    <g>
      <Person x={80} y={90} />
      <Person x={120} y={90} color="#7c3aed" />
      {/* Circle encompassing both */}
      <circle cx={100} cy={90} r={40} fill="none" stroke="#a5b4fc" strokeWidth="2" strokeDasharray="6 3" />
      {/* Joined hands */}
      <line x1={92} y1={82} x2={108} y2={82} stroke="#34d399" strokeWidth="3" strokeLinecap="round" />
      {/* Hearts/connection */}
      <circle cx={100} cy={60} r={4} fill="#f472b6" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">TOGETHER</text>
    </g>
  ),

  // 182: alone — 誰もそばにいない・自分だけ
  182: (
    <g>
      <Person x={100} y={90} />
      {/* Empty space around - isolation circle */}
      <circle cx={100} cy={90} r={40} fill="none" stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="4 4" />
      {/* Faded people far away */}
      <circle cx={40} cy={75} r={5} fill="#cbd5e1" opacity="0.3" />
      <circle cx={160} cy={80} r={5} fill="#cbd5e1" opacity="0.3" />
      <circle cx={45} cy={105} r={4} fill="#cbd5e1" opacity="0.2" />
      <circle cx={155} cy={100} r={4} fill="#cbd5e1" opacity="0.2" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">ALONE</text>
    </g>
  ),

  // 183: again — 前と同じことをもう一回繰り返す
  183: (
    <g>
      {/* Circular arrow - repeat */}
      <path d="M130 70 A35 35 0 1 0 125 100" fill="none" stroke="#4f46e5" strokeWidth="3" markerEnd="url(#arr183)" />
      <defs>
        <marker id="arr183" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#4f46e5" />
        </marker>
      </defs>
      {/* "1" first time */}
      <text x={80} y={75} textAnchor="middle" fontSize="16" fill="#94a3b8">1</text>
      {/* "2" second time */}
      <text x={115} y={90} textAnchor="middle" fontSize="20" fill="#4f46e5" fontWeight="bold">2</text>
      {/* Replay symbol */}
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">AGAIN</text>
    </g>
  ),

  // 184: once — たった一回だけ
  184: (
    <g>
      {/* Big number 1 */}
      <text x={100} y={95} textAnchor="middle" fontSize="60" fill="#4f46e5" fontWeight="bold">1</text>
      {/* Single finger held up */}
      <line x1={55} y1={110} x2={55} y2={80} stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" />
      <circle cx={55} cy={78} r={4} fill="#f59e0b" />
      {/* Single dot emphasis */}
      <circle cx={145} cy={85} r={6} fill="#fbbf24" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">ONCE</text>
    </g>
  ),

  // 185: twice — 同じことを二回繰り返す
  185: (
    <g>
      {/* Two circles - representing twice */}
      <circle cx={75} cy={75} r={18} fill="#4f46e5" opacity="0.3" stroke="#4f46e5" strokeWidth="2" />
      <text x={75} y={81} textAnchor="middle" fontSize="18" fill="#4f46e5" fontWeight="bold">1</text>
      <circle cx={125} cy={75} r={18} fill="#7c3aed" opacity="0.3" stroke="#7c3aed" strokeWidth="2" />
      <text x={125} y={81} textAnchor="middle" fontSize="18" fill="#7c3aed" fontWeight="bold">2</text>
      {/* x2 */}
      <text x={100} y={120} textAnchor="middle" fontSize="20" fill="#f59e0b" fontWeight="bold">x2</text>
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">TWICE</text>
    </g>
  ),

  // 186: even — 予想を超えて・まさかと思うほど
  186: (
    <g>
      {/* Bar chart with surprising height */}
      <rect x={55} y={95} width={20} height={25} rx="2" fill="#a5b4fc" />
      <rect x={85} y={80} width={20} height={40} rx="2" fill="#818cf8" />
      <rect x={115} y={50} width={20} height={70} rx="2" fill="#4f46e5" />
      {/* Arrow pointing to tallest - surprising */}
      <path d="M145 55 L138 55" stroke="#ef4444" strokeWidth="2" markerEnd="url(#arr186)" />
      <defs>
        <marker id="arr186" viewBox="0 0 10 10" refX="1" refY="5" markerWidth="5" markerHeight="5" orient="auto">
          <path d="M 10 0 L 0 5 L 10 10 z" fill="#ef4444" />
        </marker>
      </defs>
      {/* Exclamation - surprise */}
      <text x={148} y={58} fontSize="16" fill="#ef4444" fontWeight="bold">!</text>
      {/* "even" emphasis */}
      <path d="M115 45 Q125 35 135 45" fill="none" stroke="#f59e0b" strokeWidth="2" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">EVEN</text>
    </g>
  ),

  // 187: still — 状態が変わらずそのまま続いている
  187: (
    <g>
      {/* Timeline with same state */}
      <line x1={40} y1={85} x2={160} y2={85} stroke="#4f46e5" strokeWidth="2" markerEnd="url(#arr187)" />
      <defs>
        <marker id="arr187" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#4f46e5" />
        </marker>
      </defs>
      {/* Same circle at different time points */}
      <circle cx={55} cy={70} r={10} fill="#fbbf24" />
      <circle cx={90} cy={70} r={10} fill="#fbbf24" />
      <circle cx={125} cy={70} r={10} fill="#fbbf24" />
      {/* Equal signs */}
      <line x1={70} y1={67} x2={78} y2={67} stroke="#94a3b8" strokeWidth="2" />
      <line x1={70} y1={73} x2={78} y2={73} stroke="#94a3b8" strokeWidth="2" />
      <line x1={105} y1={67} x2={113} y2={67} stroke="#94a3b8" strokeWidth="2" />
      <line x1={105} y1={73} x2={113} y2={73} stroke="#94a3b8" strokeWidth="2" />
      {/* Time labels */}
      <text x={55} y={105} textAnchor="middle" fontSize="8" fill="#94a3b8">past</text>
      <text x={125} y={105} textAnchor="middle" fontSize="8" fill="#94a3b8">now</text>
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">STILL</text>
    </g>
  ),

  // 188: yet — 期待されていることがまだ起きていない
  188: (
    <g>
      {/* Empty checkbox */}
      <rect x={75} y={60} width={30} height={30} rx="4" fill="white" stroke="#94a3b8" strokeWidth="2" />
      {/* Dotted checkmark - not yet */}
      <path d="M82 75 L88 82 L100 67" stroke="#cbd5e1" strokeWidth="3" fill="none" strokeLinecap="round" strokeDasharray="4 3" />
      {/* Clock with waiting */}
      <circle cx={130} cy={75} r={15} fill="white" stroke="#a5b4fc" strokeWidth="2" />
      <line x1={130} y1={75} x2={130} y2={65} stroke="#4f46e5" strokeWidth="2" />
      <line x1={130} y1={75} x2={138} y2={78} stroke="#4f46e5" strokeWidth="1.5" />
      {/* Hourglass indicator */}
      <text x={100} y={115} textAnchor="middle" fontSize="12" fill="#94a3b8">not yet...</text>
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">YET</text>
    </g>
  ),

  // 189: also — 前に言ったことに加えてさらに
  189: (
    <g>
      {/* Item A */}
      <circle cx={70} cy={70} r={15} fill="#4f46e5" opacity="0.6" />
      <text x={70} y={75} textAnchor="middle" fontSize="14" fill="white" fontWeight="bold">A</text>
      {/* Plus sign */}
      <line x1={95} y1={70} x2={105} y2={70} stroke="#34d399" strokeWidth="3" />
      <line x1={100} y1={65} x2={100} y2={75} stroke="#34d399" strokeWidth="3" />
      {/* Item B */}
      <circle cx={130} cy={70} r={15} fill="#7c3aed" opacity="0.6" />
      <text x={130} y={75} textAnchor="middle" fontSize="14" fill="white" fontWeight="bold">B</text>
      {/* Bracket combining both */}
      <path d="M55 95 L55 100 L145 100 L145 95" fill="none" stroke="#94a3b8" strokeWidth="2" />
      <line x1={100} y1={100} x2={100} y2={110} stroke="#94a3b8" strokeWidth="2" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">ALSO</text>
    </g>
  ),

  // 190: too — 同じように・度を超えて
  190: (
    <g>
      {/* Two identical items */}
      <circle cx={70} cy={65} r={14} fill="#4f46e5" opacity="0.5" />
      <circle cx={130} cy={65} r={14} fill="#4f46e5" opacity="0.5" />
      {/* Equal sign between */}
      <line x1={92} y1={62} x2={108} y2={62} stroke="#94a3b8" strokeWidth="2" />
      <line x1={92} y1={68} x2={108} y2={68} stroke="#94a3b8" strokeWidth="2" />
      {/* "too much" - overflowing cup */}
      <rect x={82} y={90} width={36} height={25} rx="3" fill="none" stroke="#94a3b8" strokeWidth="2" />
      <rect x={85} y={92} width={30} height={20} rx="2" fill="#a5b4fc" opacity="0.5" />
      {/* Overflow */}
      <path d="M82 92 Q78 88 75 92" fill="none" stroke="#a5b4fc" strokeWidth="1.5" />
      <path d="M118 92 Q122 88 125 92" fill="none" stroke="#a5b4fc" strokeWidth="1.5" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">TOO</text>
    </g>
  ),

  // 191: heart — 体の中心で鼓動を打つ・気持ちの源
  191: (
    <g>
      {/* Big heart */}
      <path d="M100 60 C100 48 80 42 80 58 C80 75 100 90 100 90 C100 90 120 75 120 58 C120 42 100 48 100 60" fill="#ef4444" />
      {/* Pulse/heartbeat line */}
      <path d="M55 110 L75 110 L80 100 L85 120 L90 95 L95 115 L100 110 L145 110" fill="none" stroke="#ef4444" strokeWidth="2" />
      {/* Glow */}
      <circle cx={100} cy={70} r={30} fill="#ef4444" opacity="0.1" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">HEART</text>
    </g>
  ),

  // 192: dream — 眠っている間に見る映像・将来の希望
  192: (
    <g>
      {/* Sleeping person */}
      <circle cx={65} cy={95} r={8} fill="#4f46e5" />
      <line x1={73} y1={98} x2={95} y2={105} stroke="#4f46e5" strokeWidth="3" strokeLinecap="round" />
      {/* Dream cloud */}
      <ellipse cx={125} cy={65} rx={35} ry={22} fill="white" stroke="#a5b4fc" strokeWidth="2" />
      <circle cx={95} cy={85} r={4} fill="white" stroke="#a5b4fc" strokeWidth="1" />
      <circle cx={105} cy={78} r={5} fill="white" stroke="#a5b4fc" strokeWidth="1" />
      {/* Dream content - stars and moon */}
      <polygon points="120,58 122,64 128,64 123,68 125,74 120,70 115,74 117,68 112,64 118,64" fill="#fbbf24" />
      <path d="M135 55 Q145 55 140 65 Q135 75 130 65 Q128 58 135 55" fill="#fbbf24" />
      {/* Zzz */}
      <text x={78} y={85} fontSize="10" fill="#a5b4fc">z</text>
      <text x={83} y={78} fontSize="8" fill="#c7d2fe">z</text>
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">DREAM</text>
    </g>
  ),

  // 193: idea — 頭の中にひらめく思いつき
  193: (
    <g>
      <Person x={100} y={105} />
      {/* Light bulb above head */}
      <circle cx={100} cy={55} r={16} fill="#fbbf24" stroke="#f59e0b" strokeWidth="2" />
      <rect x={95} y={71} width={10} height={6} rx="1" fill="#94a3b8" />
      {/* Filament */}
      <path d="M96 55 Q100 48 104 55" fill="none" stroke="#f59e0b" strokeWidth="1.5" />
      {/* Light rays */}
      <line x1={100} y1={34} x2={100} y2={28} stroke="#fbbf24" strokeWidth="2" />
      <line x1={118} y1={42} x2={124} y2={38} stroke="#fbbf24" strokeWidth="2" />
      <line x1={82} y1={42} x2={76} y2={38} stroke="#fbbf24" strokeWidth="2" />
      <line x1={122} y1={55} x2={128} y2={55} stroke="#fbbf24" strokeWidth="2" />
      <line x1={78} y1={55} x2={72} y2={55} stroke="#fbbf24" strokeWidth="2" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">IDEA</text>
    </g>
  ),

  // 194: story — 始まりから終わりまでつながった話
  194: (
    <g>
      {/* Open book */}
      <path d="M60 60 L100 70 L100 120 L60 110 Z" fill="#e0e7ff" stroke="#4f46e5" strokeWidth="2" />
      <path d="M140 60 L100 70 L100 120 L140 110 Z" fill="#e0e7ff" stroke="#4f46e5" strokeWidth="2" />
      {/* Text lines */}
      <line x1={68} y1={75} x2={94} y2={80} stroke="#a5b4fc" strokeWidth="1.5" />
      <line x1={68} y1={82} x2={94} y2={87} stroke="#a5b4fc" strokeWidth="1.5" />
      <line x1={68} y1={89} x2={94} y2={94} stroke="#a5b4fc" strokeWidth="1.5" />
      <line x1={106} y1={80} x2={132} y2={75} stroke="#a5b4fc" strokeWidth="1.5" />
      <line x1={106} y1={87} x2={132} y2={82} stroke="#a5b4fc" strokeWidth="1.5" />
      <line x1={106} y1={94} x2={132} y2={89} stroke="#a5b4fc" strokeWidth="1.5" />
      {/* Story sparkle */}
      <circle cx={100} cy={55} r={3} fill="#fbbf24" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">STORY</text>
    </g>
  ),

  // 195: music — メロディーやリズムが組み合わさった音の芸術
  195: (
    <g>
      {/* Musical notes */}
      <circle cx={70} cy={85} r={7} fill="#4f46e5" />
      <line x1={77} y1={85} x2={77} y2={55} stroke="#4f46e5" strokeWidth="2" />
      <line x1={77} y1={55} x2={90} y2={52} stroke="#4f46e5" strokeWidth="2" />
      <circle cx={90} cy={78} r={7} fill="#4f46e5" />
      <line x1={97} y1={78} x2={97} y2={52} stroke="#4f46e5" strokeWidth="2" />
      {/* Treble clef style */}
      <path d="M120 55 Q125 50 125 60 Q125 70 115 75 Q120 80 125 75 Q130 70 125 60" fill="none" stroke="#7c3aed" strokeWidth="2" />
      {/* Sound waves */}
      <path d="M140 60 Q148 70 140 80" fill="none" stroke="#a5b4fc" strokeWidth="2" />
      <path d="M148 55 Q158 70 148 85" fill="none" stroke="#c7d2fe" strokeWidth="2" />
      {/* Musical notes floating */}
      <text x={55} y={60} fontSize="12" fill="#f472b6">♪</text>
      <text x={150} y={50} fontSize="10" fill="#f472b6">♫</text>
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">MUSIC</text>
    </g>
  ),

  // 196: food — 体に栄養を与えるために食べるもの
  196: (
    <g>
      {/* Plate */}
      <ellipse cx={100} cy={90} rx={40} ry={12} fill="white" stroke="#cbd5e1" strokeWidth="2" />
      {/* Food items on plate */}
      <circle cx={88} cy={80} r={10} fill="#ef4444" opacity="0.7" />
      <rect x={100} y={75} width={18} height={12} rx="3" fill="#fbbf24" />
      <circle cx={80} cy={75} r={5} fill="#34d399" />
      {/* Steam */}
      <path d="M85 65 Q82 58 86 52" fill="none" stroke="#cbd5e1" strokeWidth="1.5" />
      <path d="M100 63 Q97 56 101 50" fill="none" stroke="#cbd5e1" strokeWidth="1.5" />
      <path d="M115 65 Q112 58 116 52" fill="none" stroke="#cbd5e1" strokeWidth="1.5" />
      {/* Fork and knife */}
      <line x1={55} y1={75} x2={55} y2={110} stroke="#94a3b8" strokeWidth="2" />
      <line x1={50} y1={75} x2={55} y2={82} stroke="#94a3b8" strokeWidth="1.5" />
      <line x1={55} y1={75} x2={55} y2={82} stroke="#94a3b8" strokeWidth="1.5" />
      <line x1={60} y1={75} x2={55} y2={82} stroke="#94a3b8" strokeWidth="1.5" />
      <line x1={145} y1={75} x2={145} y2={110} stroke="#94a3b8" strokeWidth="2" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">FOOD</text>
    </g>
  ),

  // 197: home — 安心して帰る場所・自分の居場所
  197: (
    <g>
      {/* House */}
      <polygon points="100,40 55,75 145,75" fill="#4f46e5" />
      <rect x={70} y={75} width={60} height={40} rx="2" fill="#e0e7ff" stroke="#4f46e5" strokeWidth="2" />
      {/* Door */}
      <rect x={92} y={90} width={16} height={25} rx="2" fill="#4f46e5" />
      <circle cx={104} cy={103} r={2} fill="#fbbf24" />
      {/* Window */}
      <rect x={75} y={80} width={12} height={10} rx="1" fill="#fbbf24" opacity="0.5" stroke="#4f46e5" strokeWidth="1" />
      <rect x={113} y={80} width={12} height={10} rx="1" fill="#fbbf24" opacity="0.5" stroke="#4f46e5" strokeWidth="1" />
      {/* Heart inside - warmth of home */}
      <path d="M100 55 C100 51 95 49 95 53 C95 57 100 60 100 60 C100 60 105 57 105 53 C105 49 100 51 100 55" fill="#f472b6" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">HOME</text>
    </g>
  ),

  // 198: city — たくさんの建物や人が集まる大きな町
  198: (
    <g>
      {/* Skyline of buildings */}
      <rect x={40} y={65} width={18} height={50} rx="2" fill="#4f46e5" />
      <rect x={62} y={50} width={20} height={65} rx="2" fill="#818cf8" />
      <rect x={86} y={40} width={22} height={75} rx="2" fill="#4f46e5" />
      <rect x={112} y={55} width={18} height={60} rx="2" fill="#a5b4fc" />
      <rect x={134} y={60} width={22} height={55} rx="2" fill="#818cf8" />
      {/* Windows */}
      <rect x={44} y={72} width={4} height={4} rx="1" fill="#fbbf24" opacity="0.6" />
      <rect x={50} y={72} width={4} height={4} rx="1" fill="#fbbf24" opacity="0.6" />
      <rect x={44} y={82} width={4} height={4} rx="1" fill="#fbbf24" opacity="0.6" />
      <rect x={66} y={58} width={4} height={4} rx="1" fill="#fbbf24" opacity="0.6" />
      <rect x={74} y={58} width={4} height={4} rx="1" fill="#fbbf24" opacity="0.6" />
      <rect x={90} y={48} width={4} height={4} rx="1" fill="#fbbf24" opacity="0.6" />
      <rect x={100} y={48} width={4} height={4} rx="1" fill="#fbbf24" opacity="0.6" />
      <rect x={90} y={58} width={4} height={4} rx="1" fill="#fbbf24" opacity="0.6" />
      <rect x={138} y={68} width={4} height={4} rx="1" fill="#fbbf24" opacity="0.6" />
      <rect x={148} y={68} width={4} height={4} rx="1" fill="#fbbf24" opacity="0.6" />
      {/* Road */}
      <line x1={30} y1={118} x2={170} y2={118} stroke="#cbd5e1" strokeWidth="2" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">CITY</text>
    </g>
  ),

  // 199: nature — 人の手が加わっていない山や川や森の世界
  199: (
    <g>
      {/* Mountain */}
      <polygon points="100,40 55,105 145,105" fill="#34d399" opacity="0.4" />
      <polygon points="100,40 80,70 120,70" fill="#34d399" opacity="0.6" />
      {/* Snow cap */}
      <polygon points="100,40 92,52 108,52" fill="white" />
      {/* Tree */}
      <polygon points="55,75 45,105 65,105" fill="#059669" />
      <rect x={53} y={105} width={4} height={10} fill="#94a3b8" />
      {/* Sun */}
      <circle cx={150} cy={45} r={10} fill="#fbbf24" />
      <line x1={150} y1={30} x2={150} y2={25} stroke="#f59e0b" strokeWidth="1.5" />
      <line x1={160} y1={38} x2={165} y2={33} stroke="#f59e0b" strokeWidth="1.5" />
      <line x1={165} y1={45} x2={170} y2={45} stroke="#f59e0b" strokeWidth="1.5" />
      {/* River */}
      <path d="M60 115 Q80 108 100 115 Q120 122 140 115 Q155 110 170 115" fill="none" stroke="#4f46e5" strokeWidth="2" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">NATURE</text>
    </g>
  ),

  // 200: future — 今よりも先にやってくる時間
  200: (
    <g>
      {/* Timeline */}
      <line x1={35} y1={85} x2={165} y2={85} stroke="#cbd5e1" strokeWidth="2" />
      {/* Now marker */}
      <circle cx={70} cy={85} r={5} fill="#4f46e5" />
      <text x={70} y={105} textAnchor="middle" fontSize="9" fill="#4f46e5">NOW</text>
      {/* Future arrow */}
      <path d="M85 85 L150 85" stroke="#7c3aed" strokeWidth="3" markerEnd="url(#arr200)" />
      <defs>
        <marker id="arr200" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#7c3aed" />
        </marker>
      </defs>
      {/* Glowing future star */}
      <polygon points="155,70 158,62 165,62 160,56 162,48 155,53 148,48 150,56 145,62 152,62" fill="#fbbf24" stroke="#f59e0b" strokeWidth="1" />
      {/* Dotted possibilities */}
      <circle cx={110} cy={65} r={3} fill="#c7d2fe" />
      <circle cx={125} cy={60} r={3} fill="#a5b4fc" />
      <circle cx={140} cy={55} r={3} fill="#818cf8" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">FUTURE</text>
    </g>
  ),

  // 201: hand — 腕の先にある五本の指がついた部分
  201: (
    <g>
      {/* Palm */}
      <rect x={80} y={65} width={40} height={40} rx="8" fill="#f5d0b0" stroke="#e0a880" strokeWidth="2" />
      {/* Fingers */}
      <rect x={82} y={40} width={8} height={30} rx="4" fill="#f5d0b0" stroke="#e0a880" strokeWidth="1.5" />
      <rect x={92} y={35} width={8} height={35} rx="4" fill="#f5d0b0" stroke="#e0a880" strokeWidth="1.5" />
      <rect x={102} y={38} width={8} height={32} rx="4" fill="#f5d0b0" stroke="#e0a880" strokeWidth="1.5" />
      <rect x={112} y={45} width={8} height={25} rx="4" fill="#f5d0b0" stroke="#e0a880" strokeWidth="1.5" />
      {/* Thumb */}
      <rect x={68} y={68} width={18} height={8} rx="4" fill="#f5d0b0" stroke="#e0a880" strokeWidth="1.5" />
      {/* Wrist */}
      <rect x={88} y={105} width={24} height={15} rx="3" fill="#f5d0b0" stroke="#e0a880" strokeWidth="1.5" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">HAND</text>
    </g>
  ),

  // 202: head — 体の一番上にある考える部分
  202: (
    <g>
      {/* Head circle */}
      <circle cx={100} cy={70} r={30} fill="#4f46e5" />
      {/* Eyes */}
      <circle cx={90} cy={65} r={4} fill="white" />
      <circle cx={110} cy={65} r={4} fill="white" />
      <circle cx={91} cy={65} r={2} fill="#1e1b4b" />
      <circle cx={111} cy={65} r={2} fill="#1e1b4b" />
      {/* Mouth */}
      <path d="M92 80 Q100 86 108 80" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" />
      {/* Neck */}
      <line x1={100} y1={100} x2={100} y2={120} stroke="#4f46e5" strokeWidth="4" strokeLinecap="round" />
      {/* Brain spark */}
      <circle cx={100} cy={52} r={3} fill="#fbbf24" />
      <line x1={100} y1={45} x2={100} y2={48} stroke="#fbbf24" strokeWidth="2" />
      <line x1={94} y1={49} x2={96} y2={51} stroke="#fbbf24" strokeWidth="2" />
      <line x1={106} y1={49} x2={104} y2={51} stroke="#fbbf24" strokeWidth="2" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">HEAD</text>
    </g>
  ),

  // 203: eye — ものを見るための体の器官
  203: (
    <g>
      {/* Large eye shape */}
      <ellipse cx={100} cy={80} rx={45} ry={28} fill="white" stroke="#4f46e5" strokeWidth="3" />
      {/* Iris */}
      <circle cx={100} cy={80} r={18} fill="#818cf8" />
      {/* Pupil */}
      <circle cx={100} cy={80} r={9} fill="#1e1b4b" />
      {/* Light reflection */}
      <circle cx={106} cy={74} r={4} fill="white" />
      <circle cx={96} cy={84} r={2} fill="white" opacity="0.6" />
      {/* Eyelashes */}
      <line x1={60} y1={68} x2={55} y2={58} stroke="#4f46e5" strokeWidth="2" strokeLinecap="round" />
      <line x1={75} y1={58} x2={72} y2={48} stroke="#4f46e5" strokeWidth="2" strokeLinecap="round" />
      <line x1={125} y1={58} x2={128} y2={48} stroke="#4f46e5" strokeWidth="2" strokeLinecap="round" />
      <line x1={140} y1={68} x2={145} y2={58} stroke="#4f46e5" strokeWidth="2" strokeLinecap="round" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">EYE</text>
    </g>
  ),

  // 204: face — 頭の前面にある表情が表れる部分
  204: (
    <g>
      {/* Face oval */}
      <ellipse cx={100} cy={78} rx={35} ry={42} fill="#fcd9b6" stroke="#e0a880" strokeWidth="2" />
      {/* Eyes */}
      <circle cx={86} cy={72} r={5} fill="white" />
      <circle cx={114} cy={72} r={5} fill="white" />
      <circle cx={87} cy={72} r={3} fill="#4f46e5" />
      <circle cx={115} cy={72} r={3} fill="#4f46e5" />
      {/* Nose */}
      <path d="M98 80 Q100 86 102 80" fill="none" stroke="#d4a574" strokeWidth="2" />
      {/* Smile */}
      <path d="M86 94 Q100 106 114 94" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
      {/* Hair */}
      <path d="M65 65 Q70 35 100 32 Q130 35 135 65" fill="#4f46e5" stroke="none" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">FACE</text>
    </g>
  ),

  // 205: body — 人や動物の全体の形をした物理的な存在
  205: (
    <g>
      {/* Full body stick figure - bigger */}
      <circle cx={100} cy={42} r={14} fill="#4f46e5" />
      <line x1={100} y1={56} x2={100} y2={95} stroke="#4f46e5" strokeWidth="4" strokeLinecap="round" />
      <line x1={78} y1={72} x2={122} y2={72} stroke="#4f46e5" strokeWidth="4" strokeLinecap="round" />
      <line x1={100} y1={95} x2={82} y2={125} stroke="#4f46e5" strokeWidth="4" strokeLinecap="round" />
      <line x1={100} y1={95} x2={118} y2={125} stroke="#4f46e5" strokeWidth="4" strokeLinecap="round" />
      {/* Body outline highlight */}
      <ellipse cx={100} cy={82} rx={30} ry={50} fill="none" stroke="#a5b4fc" strokeWidth="2" strokeDasharray="5 3" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">BODY</text>
    </g>
  ),

  // 206: voice — 口から出る音・話すときの音
  206: (
    <g>
      <Person x={80} y={95} />
      {/* Open mouth */}
      <ellipse cx={80} cy={70} rx={4} ry={3} fill="#ef4444" opacity="0.6" />
      {/* Sound waves spreading */}
      <path d="M92 65 Q98 70 92 75" fill="none" stroke="#4f46e5" strokeWidth="2" />
      <path d="M98 60 Q108 70 98 80" fill="none" stroke="#7c3aed" strokeWidth="2" />
      <path d="M105 55 Q118 70 105 85" fill="none" stroke="#a5b4fc" strokeWidth="2" />
      <path d="M112 50 Q128 70 112 90" fill="none" stroke="#c7d2fe" strokeWidth="1.5" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">VOICE</text>
    </g>
  ),

  // 207: word — 意味を持つ最小の言語単位
  207: (
    <g>
      {/* Word blocks */}
      <rect x={30} y={60} width={45} height={24} rx="6" fill="#4f46e5" />
      <text x={52} y={76} textAnchor="middle" fontSize="11" fill="white" fontWeight="bold">Hello</text>
      <rect x={80} y={75} width={42} height={24} rx="6" fill="#7c3aed" />
      <text x={101} y={91} textAnchor="middle" fontSize="11" fill="white" fontWeight="bold">Word</text>
      <rect x={128} y={60} width={40} height={24} rx="6" fill="#a5b4fc" />
      <text x={148} y={76} textAnchor="middle" fontSize="11" fill="white" fontWeight="bold">Cat</text>
      {/* Sparkle around center word */}
      <circle cx={78} cy={82} r={2} fill="#fbbf24" />
      <circle cx={124} cy={82} r={2} fill="#fbbf24" />
      <circle cx={101} cy={68} r={2} fill="#fbbf24" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">WORD</text>
    </g>
  ),

  // 208: name — 人やものを区別するための呼び方
  208: (
    <g>
      <Person x={100} y={100} />
      {/* Name tag */}
      <rect x={68} y={50} width={64} height={28} rx="6" fill="white" stroke="#4f46e5" strokeWidth="2" />
      <text x={100} y={60} textAnchor="middle" fontSize="8" fill="#94a3b8">HELLO, my name is</text>
      <text x={100} y={73} textAnchor="middle" fontSize="12" fill="#4f46e5" fontWeight="bold">Tom</text>
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">NAME</text>
    </g>
  ),

  // 209: place — ある特定の位置・空間
  209: (
    <g>
      {/* Map pin */}
      <path d="M100 40 C80 40 68 55 68 70 C68 90 100 115 100 115 C100 115 132 90 132 70 C132 55 120 40 100 40" fill="#ef4444" />
      <circle cx={100} cy={68} r={12} fill="white" />
      {/* Location dot */}
      <circle cx={100} cy={68} r={5} fill="#ef4444" />
      {/* Ground shadow */}
      <ellipse cx={100} cy={120} rx={20} ry={5} fill="#cbd5e1" opacity="0.5" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">PLACE</text>
    </g>
  ),

  // 210: room — 壁で仕切られた空間
  210: (
    <g>
      {/* Room - 3D perspective */}
      <polygon points="50,50 150,50 150,130 50,130" fill="#e0e7ff" stroke="#94a3b8" strokeWidth="2" />
      {/* Floor */}
      <polygon points="50,130 150,130 170,145 30,145" fill="#c7d2fe" stroke="#94a3b8" strokeWidth="1" />
      {/* Left wall */}
      <polygon points="50,50 30,65 30,145 50,130" fill="#a5b4fc" stroke="#94a3b8" strokeWidth="1" />
      {/* Door */}
      <rect x={90} y={75} width={25} height={55} rx="2" fill="#94a3b8" />
      <circle cx={110} cy={105} r={2} fill="#fbbf24" />
      {/* Window */}
      <rect x={60} y={68} width={20} height={18} fill="#93c5fd" stroke="#94a3b8" strokeWidth="1" />
      <line x1={70} y1={68} x2={70} y2={86} stroke="#94a3b8" strokeWidth="1" />
      <line x1={60} y1={77} x2={80} y2={77} stroke="#94a3b8" strokeWidth="1" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">ROOM</text>
    </g>
  ),

  // 211: door — 部屋や建物の出入り口を開閉するもの
  211: (
    <g>
      {/* Door frame */}
      <rect x={65} y={40} width={70} height={90} rx="3" fill="#94a3b8" />
      {/* Door panel */}
      <rect x={70} y={44} width={60} height={82} rx="2" fill="#c7d2fe" />
      {/* Door knob */}
      <circle cx={120} cy={88} r={4} fill="#fbbf24" stroke="#f59e0b" strokeWidth="1.5" />
      {/* Door panels */}
      <rect x={80} y={52} width={40} height={28} rx="2" fill="none" stroke="#a5b4fc" strokeWidth="1.5" />
      <rect x={80} y={88} width={40} height={30} rx="2" fill="none" stroke="#a5b4fc" strokeWidth="1.5" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">DOOR</text>
    </g>
  ),

  // 212: window — 壁にある光や風を通す開口部
  212: (
    <g>
      {/* Wall */}
      <rect x={40} y={35} width={120} height={100} rx="4" fill="#cbd5e1" />
      {/* Window frame */}
      <rect x={60} y={48} width={80} height={60} rx="3" fill="#93c5fd" stroke="#94a3b8" strokeWidth="3" />
      {/* Window panes */}
      <line x1={100} y1={48} x2={100} y2={108} stroke="#94a3b8" strokeWidth="2" />
      <line x1={60} y1={78} x2={140} y2={78} stroke="#94a3b8" strokeWidth="2" />
      {/* Sun through window */}
      <circle cx={82} cy={63} r={8} fill="#fbbf24" opacity="0.7" />
      {/* Light rays */}
      <line x1={82} y1={52} x2={82} y2={56} stroke="#fbbf24" strokeWidth="1.5" />
      <line x1={72} y1={63} x2={76} y2={63} stroke="#fbbf24" strokeWidth="1.5" />
      <line x1={90} y1={57} x2={87} y2={59} stroke="#fbbf24" strokeWidth="1.5" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">WINDOW</text>
    </g>
  ),

  // 213: table — ものを置くための平らな面を持つ家具
  213: (
    <g>
      {/* Table top */}
      <rect x={40} y={75} width={120} height={8} rx="3" fill="#94a3b8" stroke="#64748b" strokeWidth="1.5" />
      {/* Legs */}
      <rect x={50} y={83} width={5} height={35} fill="#94a3b8" />
      <rect x={145} y={83} width={5} height={35} fill="#94a3b8" />
      {/* Items on table */}
      <circle cx={80} cy={70} r={8} fill="#fbbf24" />
      <rect x={105} y={60} width={15} height={15} rx="2" fill="#34d399" />
      <rect x={130} y={65} width={12} height={10} rx="1" fill="#f472b6" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">TABLE</text>
    </g>
  ),

  // 214: chair — 座るための背もたれのある家具
  214: (
    <g>
      {/* Back rest */}
      <rect x={75} y={40} width={50} height={40} rx="4" fill="#4f46e5" />
      {/* Seat */}
      <rect x={70} y={80} width={60} height={10} rx="3" fill="#818cf8" />
      {/* Front legs */}
      <rect x={75} y={90} width={5} height={30} fill="#4f46e5" />
      <rect x={120} y={90} width={5} height={30} fill="#4f46e5" />
      {/* Back legs */}
      <rect x={80} y={80} width={4} height={5} fill="#4f46e5" />
      <rect x={116} y={80} width={4} height={5} fill="#4f46e5" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">CHAIR</text>
    </g>
  ),

  // 215: bed — 眠るために横になる家具
  215: (
    <g>
      {/* Bed frame */}
      <rect x={35} y={80} width={130} height={30} rx="4" fill="#94a3b8" />
      {/* Mattress */}
      <rect x={40} y={68} width={120} height={16} rx="4" fill="white" stroke="#cbd5e1" strokeWidth="1.5" />
      {/* Pillow */}
      <rect x={42} y={62} width={30} height={14} rx="6" fill="#c7d2fe" stroke="#a5b4fc" strokeWidth="1" />
      {/* Blanket */}
      <rect x={75} y={60} width={82} height={24} rx="4" fill="#818cf8" opacity="0.6" />
      {/* Headboard */}
      <rect x={35} y={45} width={10} height={40} rx="3" fill="#64748b" />
      {/* Legs */}
      <rect x={38} y={110} width={5} height={10} fill="#94a3b8" />
      <rect x={157} y={110} width={5} height={10} fill="#94a3b8" />
      {/* Zzz */}
      <text x={55} y={50} fontSize="10" fill="#a5b4fc">z</text>
      <text x={65} y={42} fontSize="12" fill="#818cf8">z</text>
      <text x={78} y={34} fontSize="14" fill="#4f46e5">z</text>
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">BED</text>
    </g>
  ),

  // 216: car — エンジンで動く四輪の乗り物
  216: (
    <g>
      {/* Car body */}
      <rect x={45} y={78} width={110} height={28} rx="8" fill="#4f46e5" />
      <rect x={60} y={60} width={65} height={22} rx="8" fill="#818cf8" />
      {/* Windows */}
      <rect x={66} y={64} width={24} height={15} rx="3" fill="#e0e7ff" />
      <rect x={94} y={64} width={24} height={15} rx="3" fill="#e0e7ff" />
      {/* Wheels */}
      <circle cx={75} cy={108} r={10} fill="#374151" />
      <circle cx={75} cy={108} r={4} fill="#94a3b8" />
      <circle cx={130} cy={108} r={10} fill="#374151" />
      <circle cx={130} cy={108} r={4} fill="#94a3b8" />
      {/* Headlight */}
      <rect x={148} y={85} width={8} height={6} rx="2" fill="#fbbf24" />
      {/* Road */}
      <line x1={25} y1={120} x2={175} y2={120} stroke="#cbd5e1" strokeWidth="2" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">CAR</text>
    </g>
  ),

  // 217: train — 線路の上を走る長い乗り物
  217: (
    <g>
      {/* Train body */}
      <rect x={30} y={68} width={55} height={35} rx="6" fill="#4f46e5" />
      <rect x={85} y={72} width={40} height={31} rx="4" fill="#818cf8" />
      <rect x={125} y={72} width={40} height={31} rx="4" fill="#818cf8" />
      {/* Windows */}
      <rect x={38} y={74} width={14} height={12} rx="2" fill="#e0e7ff" />
      <rect x={56} y={74} width={14} height={12} rx="2" fill="#e0e7ff" />
      <rect x={93} y={76} width={10} height={10} rx="2" fill="#e0e7ff" />
      <rect x={107} y={76} width={10} height={10} rx="2" fill="#e0e7ff" />
      <rect x={133} y={76} width={10} height={10} rx="2" fill="#e0e7ff" />
      <rect x={147} y={76} width={10} height={10} rx="2" fill="#e0e7ff" />
      {/* Wheels */}
      <circle cx={48} cy={106} r={6} fill="#374151" />
      <circle cx={70} cy={106} r={6} fill="#374151" />
      <circle cx={105} cy={106} r={5} fill="#374151" />
      <circle cx={145} cy={106} r={5} fill="#374151" />
      {/* Rails */}
      <line x1={20} y1={113} x2={175} y2={113} stroke="#94a3b8" strokeWidth="3" />
      <line x1={25} y1={118} x2={30} y2={113} stroke="#94a3b8" strokeWidth="2" />
      <line x1={55} y1={118} x2={60} y2={113} stroke="#94a3b8" strokeWidth="2" />
      <line x1={85} y1={118} x2={90} y2={113} stroke="#94a3b8" strokeWidth="2" />
      <line x1={115} y1={118} x2={120} y2={113} stroke="#94a3b8" strokeWidth="2" />
      <line x1={145} y1={118} x2={150} y2={113} stroke="#94a3b8" strokeWidth="2" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">TRAIN</text>
    </g>
  ),

  // 218: bus — たくさんの人を運ぶ大きな乗り物
  218: (
    <g>
      {/* Bus body */}
      <rect x={35} y={55} width={130} height={50} rx="8" fill="#fbbf24" stroke="#f59e0b" strokeWidth="2" />
      {/* Windows */}
      <rect x={45} y={62} width={18} height={16} rx="3" fill="#e0e7ff" />
      <rect x={68} y={62} width={18} height={16} rx="3" fill="#e0e7ff" />
      <rect x={91} y={62} width={18} height={16} rx="3" fill="#e0e7ff" />
      <rect x={114} y={62} width={18} height={16} rx="3" fill="#e0e7ff" />
      {/* Front windshield */}
      <rect x={140} y={60} width={18} height={20} rx="3" fill="#e0e7ff" />
      {/* Door */}
      <rect x={45} y={84} width={14} height={21} rx="2" fill="#f59e0b" stroke="#d97706" strokeWidth="1" />
      {/* Wheels */}
      <circle cx={65} cy={108} r={8} fill="#374151" />
      <circle cx={65} cy={108} r={3} fill="#94a3b8" />
      <circle cx={140} cy={108} r={8} fill="#374151" />
      <circle cx={140} cy={108} r={3} fill="#94a3b8" />
      {/* Road */}
      <line x1={20} y1={118} x2={180} y2={118} stroke="#cbd5e1" strokeWidth="2" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">BUS</text>
    </g>
  ),

  // 219: tree — 地面から高く伸びる幹と葉を持つ植物
  219: (
    <g>
      {/* Trunk */}
      <rect x={92} y={85} width={16} height={40} rx="3" fill="#92400e" />
      {/* Crown - layered circles */}
      <circle cx={80} cy={70} r={22} fill="#34d399" />
      <circle cx={120} cy={70} r={22} fill="#34d399" />
      <circle cx={100} cy={55} r={25} fill="#34d399" />
      <circle cx={95} cy={68} r={18} fill="#22c55e" />
      <circle cx={108} cy={60} r={16} fill="#22c55e" />
      {/* Ground */}
      <line x1={55} y1={125} x2={145} y2={125} stroke="#94a3b8" strokeWidth="2" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">TREE</text>
    </g>
  ),

  // 220: flower — 植物が咲かせる美しい色の部分
  220: (
    <g>
      {/* Stem */}
      <line x1={100} y1={85} x2={100} y2={125} stroke="#34d399" strokeWidth="3" />
      {/* Leaves */}
      <path d="M100 105 Q85 95 88 105" fill="#34d399" />
      <path d="M100 110 Q115 100 112 110" fill="#34d399" />
      {/* Petals */}
      <ellipse cx={100} cy={55} rx={8} ry={14} fill="#f472b6" />
      <ellipse cx={85} cy={68} rx={8} ry={14} fill="#f472b6" transform="rotate(-45 85 68)" />
      <ellipse cx={115} cy={68} rx={8} ry={14} fill="#f472b6" transform="rotate(45 115 68)" />
      <ellipse cx={88} cy={82} rx={8} ry={14} fill="#f472b6" transform="rotate(-90 88 82)" />
      <ellipse cx={112} cy={82} rx={8} ry={14} fill="#f472b6" transform="rotate(90 112 82)" />
      {/* Center */}
      <circle cx={100} cy={72} r={8} fill="#fbbf24" />
      {/* Ground */}
      <line x1={60} y1={125} x2={140} y2={125} stroke="#94a3b8" strokeWidth="2" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">FLOWER</text>
    </g>
  ),

  // 221: river — 山から海へ流れる水の道
  221: (
    <g>
      {/* River winding path */}
      <path d="M40 45 Q70 50 60 70 Q50 90 80 100 Q110 110 100 125 Q90 140 120 145" fill="none" stroke="#4f46e5" strokeWidth="20" opacity="0.3" />
      <path d="M40 45 Q70 50 60 70 Q50 90 80 100 Q110 110 100 125 Q90 140 120 145" fill="none" stroke="#4f46e5" strokeWidth="3" />
      {/* Water ripples */}
      <path d="M55 60 Q60 57 65 60" fill="none" stroke="white" strokeWidth="1.5" />
      <path d="M65 90 Q72 87 78 90" fill="none" stroke="white" strokeWidth="1.5" />
      <path d="M90 115 Q97 112 104 115" fill="none" stroke="white" strokeWidth="1.5" />
      {/* Banks */}
      <circle cx={35} cy={55} r={3} fill="#34d399" />
      <circle cx={120} cy={100} r={3} fill="#34d399" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">RIVER</text>
    </g>
  ),

  // 222: mountain — 地面から高くそびえ立つ大きな地形
  222: (
    <g>
      {/* Background mountain */}
      <polygon points="40,125 90,50 140,125" fill="#a5b4fc" />
      {/* Foreground mountain */}
      <polygon points="60,125 110,35 160,125" fill="#4f46e5" />
      {/* Snow cap */}
      <polygon points="100,45 110,35 120,45" fill="white" />
      <polygon points="95,50 110,35 125,50" fill="white" opacity="0.7" />
      {/* Sun */}
      <circle cx={55} cy={45} r={10} fill="#fbbf24" />
      {/* Ground */}
      <line x1={30} y1={125} x2={170} y2={125} stroke="#94a3b8" strokeWidth="2" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">MOUNTAIN</text>
    </g>
  ),

  // 223: sea — 広く青い塩水が広がる場所
  223: (
    <g>
      {/* Sky */}
      <rect x={30} y={35} width={140} height={40} rx="4" fill="#e0e7ff" />
      {/* Sea */}
      <rect x={30} y={75} width={140} height={55} rx="4" fill="#4f46e5" opacity="0.6" />
      {/* Waves */}
      <path d="M30 80 Q50 72 70 80 Q90 88 110 80 Q130 72 150 80 Q160 84 170 80" fill="none" stroke="#818cf8" strokeWidth="2" />
      <path d="M30 95 Q50 87 70 95 Q90 103 110 95 Q130 87 150 95" fill="none" stroke="#a5b4fc" strokeWidth="2" />
      <path d="M30 110 Q50 102 70 110 Q90 118 110 110 Q130 102 150 110" fill="none" stroke="#c7d2fe" strokeWidth="1.5" />
      {/* Sun */}
      <circle cx={130} cy={50} r={12} fill="#fbbf24" />
      {/* Bird */}
      <path d="M60 48 Q65 44 70 48" fill="none" stroke="#94a3b8" strokeWidth="1.5" />
      <path d="M75 42 Q80 38 85 42" fill="none" stroke="#94a3b8" strokeWidth="1.5" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">SEA</text>
    </g>
  ),

  // 224: sky — 頭の上に広がる青い空間
  224: (
    <g>
      {/* Sky gradient area */}
      <rect x={30} y={30} width={140} height={100} rx="8" fill="#93c5fd" />
      {/* Clouds */}
      <circle cx={60} cy={55} r={12} fill="white" />
      <circle cx={75} cy={52} r={15} fill="white" />
      <circle cx={90} cy={55} r={12} fill="white" />
      <circle cx={140} cy={75} r={10} fill="white" opacity="0.8" />
      <circle cx={152} cy={73} r={12} fill="white" opacity="0.8" />
      {/* Sun */}
      <circle cx={145} cy={48} r={10} fill="#fbbf24" />
      <line x1={145} y1={34} x2={145} y2={38} stroke="#fbbf24" strokeWidth="2" />
      <line x1={158} y1={48} x2={155} y2={48} stroke="#fbbf24" strokeWidth="2" />
      <line x1={155} y1={38} x2={152} y2={40} stroke="#fbbf24" strokeWidth="2" />
      {/* Ground silhouette */}
      <rect x={30} y={125} width={140} height={10} rx="2" fill="#34d399" opacity="0.4" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">SKY</text>
    </g>
  ),

  // 225: sun — 空に輝く熱と光の源
  225: (
    <g>
      {/* Sun circle */}
      <circle cx={100} cy={80} r={28} fill="#fbbf24" />
      <circle cx={100} cy={80} r={22} fill="#f59e0b" />
      {/* Rays */}
      <line x1={100} y1={40} x2={100} y2={48} stroke="#fbbf24" strokeWidth="3" strokeLinecap="round" />
      <line x1={100} y1={112} x2={100} y2={120} stroke="#fbbf24" strokeWidth="3" strokeLinecap="round" />
      <line x1={60} y1={80} x2={68} y2={80} stroke="#fbbf24" strokeWidth="3" strokeLinecap="round" />
      <line x1={132} y1={80} x2={140} y2={80} stroke="#fbbf24" strokeWidth="3" strokeLinecap="round" />
      <line x1={72} y1={52} x2={78} y2={58} stroke="#fbbf24" strokeWidth="3" strokeLinecap="round" />
      <line x1={122} y1={102} x2={128} y2={108} stroke="#fbbf24" strokeWidth="3" strokeLinecap="round" />
      <line x1={128} y1={52} x2={122} y2={58} stroke="#fbbf24" strokeWidth="3" strokeLinecap="round" />
      <line x1={72} y1={108} x2={78} y2={102} stroke="#fbbf24" strokeWidth="3" strokeLinecap="round" />
      {/* Face */}
      <circle cx={92} cy={76} r={3} fill="#92400e" />
      <circle cx={108} cy={76} r={3} fill="#92400e" />
      <path d="M92 88 Q100 94 108 88" fill="none" stroke="#92400e" strokeWidth="2" strokeLinecap="round" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">SUN</text>
    </g>
  ),

  // 226: moon — 夜空に浮かぶ丸く光る天体
  226: (
    <g>
      {/* Night sky */}
      <rect x={35} y={30} width={130} height={105} rx="10" fill="#1e1b4b" />
      {/* Moon crescent */}
      <circle cx={100} cy={75} r={28} fill="#fbbf24" />
      <circle cx={115} cy={65} r={24} fill="#1e1b4b" />
      {/* Stars */}
      <circle cx={55} cy={50} r={2} fill="white" />
      <circle cx={145} cy={55} r={2} fill="white" />
      <circle cx={70} cy={110} r={1.5} fill="white" />
      <circle cx={140} cy={100} r={2} fill="white" />
      <circle cx={120} cy={40} r={1.5} fill="white" />
      <circle cx={50} cy={90} r={1.5} fill="white" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">MOON</text>
    </g>
  ),

  // 227: star — 夜空にキラキラと光る小さな点
  227: (
    <g>
      {/* Large star */}
      <polygon points="100,35 108,65 140,68 115,85 122,118 100,98 78,118 85,85 60,68 92,65" fill="#fbbf24" stroke="#f59e0b" strokeWidth="2" />
      {/* Small stars */}
      <polygon points="55,45 58,52 65,53 60,57 61,65 55,60 49,65 50,57 45,53 52,52" fill="#fbbf24" opacity="0.6" />
      <polygon points="150,50 152,55 158,55 154,58 155,64 150,60 145,64 146,58 142,55 148,55" fill="#fbbf24" opacity="0.5" />
      {/* Sparkle lines */}
      <line x1={100} y1={28} x2={100} y2={32} stroke="#f59e0b" strokeWidth="2" />
      <line x1={145} y1={68} x2={148} y2={68} stroke="#f59e0b" strokeWidth="1.5" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">STAR</text>
    </g>
  ),

  // 228: rain — 空から落ちてくる水の粒
  228: (
    <g>
      {/* Cloud */}
      <circle cx={75} cy={50} r={18} fill="#94a3b8" />
      <circle cx={100} cy={45} r={22} fill="#94a3b8" />
      <circle cx={125} cy={50} r={18} fill="#94a3b8" />
      <rect x={57} y={50} width={86} height={15} fill="#94a3b8" />
      {/* Rain drops */}
      <line x1={70} y1={70} x2={66} y2={85} stroke="#4f46e5" strokeWidth="2" strokeLinecap="round" />
      <line x1={85} y1={75} x2={81} y2={90} stroke="#4f46e5" strokeWidth="2" strokeLinecap="round" />
      <line x1={100} y1={70} x2={96} y2={85} stroke="#4f46e5" strokeWidth="2" strokeLinecap="round" />
      <line x1={115} y1={75} x2={111} y2={90} stroke="#4f46e5" strokeWidth="2" strokeLinecap="round" />
      <line x1={130} y1={70} x2={126} y2={85} stroke="#4f46e5" strokeWidth="2" strokeLinecap="round" />
      <line x1={77} y1={92} x2={73} y2={107} stroke="#818cf8" strokeWidth="2" strokeLinecap="round" />
      <line x1={92} y1={97} x2={88} y2={112} stroke="#818cf8" strokeWidth="2" strokeLinecap="round" />
      <line x1={108} y1={92} x2={104} y2={107} stroke="#818cf8" strokeWidth="2" strokeLinecap="round" />
      <line x1={123} y1={97} x2={119} y2={112} stroke="#818cf8" strokeWidth="2" strokeLinecap="round" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">RAIN</text>
    </g>
  ),

  // 229: snow — 空から降る白くて冷たい結晶
  229: (
    <g>
      {/* Cloud */}
      <circle cx={75} cy={45} r={16} fill="#cbd5e1" />
      <circle cx={100} cy={40} r={20} fill="#cbd5e1" />
      <circle cx={125} cy={45} r={16} fill="#cbd5e1" />
      <rect x={59} y={45} width={82} height={12} fill="#cbd5e1" />
      {/* Snowflakes */}
      <text x={65} y={78} fontSize="14" fill="#a5b4fc">*</text>
      <text x={90} y={88} fontSize="12" fill="#c7d2fe">*</text>
      <text x={115} y={75} fontSize="16" fill="#818cf8">*</text>
      <text x={140} y={90} fontSize="10" fill="#a5b4fc">*</text>
      <text x={75} y={108} fontSize="12" fill="#c7d2fe">*</text>
      <text x={105} y={105} fontSize="14" fill="#a5b4fc">*</text>
      <text x={130} y={115} fontSize="12" fill="#818cf8">*</text>
      <text x={55} y={118} fontSize="10" fill="#c7d2fe">*</text>
      {/* Ground snow */}
      <path d="M30 125 Q60 118 100 122 Q140 118 170 125" fill="white" stroke="#e2e8f0" strokeWidth="1" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">SNOW</text>
    </g>
  ),

  // 230: wind — 空気が動いて肌に感じる流れ
  230: (
    <g>
      {/* Wind lines */}
      <path d="M35 55 Q80 50 100 55 Q130 62 145 50" fill="none" stroke="#4f46e5" strokeWidth="3" strokeLinecap="round" />
      <path d="M40 80 Q90 72 120 80 Q150 88 165 75" fill="none" stroke="#818cf8" strokeWidth="3" strokeLinecap="round" />
      <path d="M30 105 Q75 95 100 100 Q140 108 160 98" fill="none" stroke="#a5b4fc" strokeWidth="3" strokeLinecap="round" />
      {/* Arrow tips */}
      <path d="M145 50 L150 45 L148 52" fill="#4f46e5" />
      <path d="M165 75 L170 70 L168 78" fill="#818cf8" />
      <path d="M160 98 L165 93 L163 100" fill="#a5b4fc" />
      {/* Leaves blowing */}
      <ellipse cx={110} cy={65} rx={4} ry={2} fill="#34d399" transform="rotate(30 110 65)" />
      <ellipse cx={135} cy={88} rx={3} ry={1.5} fill="#34d399" transform="rotate(-20 135 88)" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">WIND</text>
    </g>
  ),

  // 231: book — 紙のページをまとめた読み物
  231: (
    <g>
      {/* Book spine */}
      <rect x={60} y={45} width={80} height={75} rx="4" fill="#4f46e5" />
      {/* Book cover front */}
      <rect x={65} y={48} width={72} height={69} rx="3" fill="#818cf8" />
      {/* Pages */}
      <rect x={68} y={51} width={66} height={63} rx="2" fill="white" />
      {/* Text lines */}
      <line x1={76} y1={62} x2={126} y2={62} stroke="#c7d2fe" strokeWidth="2" />
      <line x1={76} y1={72} x2={120} y2={72} stroke="#c7d2fe" strokeWidth="2" />
      <line x1={76} y1={82} x2={124} y2={82} stroke="#c7d2fe" strokeWidth="2" />
      <line x1={76} y1={92} x2={118} y2={92} stroke="#c7d2fe" strokeWidth="2" />
      <line x1={76} y1={102} x2={122} y2={102} stroke="#c7d2fe" strokeWidth="2" />
      {/* Page edge */}
      <line x1={134} y1={52} x2={134} y2={114} stroke="#e2e8f0" strokeWidth="2" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">BOOK</text>
    </g>
  ),

  // 232: picture — 目に見える形で描かれた・映された像
  232: (
    <g>
      {/* Picture frame */}
      <rect x={50} y={40} width={100} height={80} rx="4" fill="white" stroke="#94a3b8" strokeWidth="3" />
      {/* Mountain scene inside */}
      <polygon points="65,100 85,65 105,100" fill="#34d399" />
      <polygon points="90,100 115,55 140,100" fill="#22c55e" />
      {/* Sun in picture */}
      <circle cx={130} cy={55} r={8} fill="#fbbf24" />
      {/* Sky in picture */}
      <rect x={53} y={43} width={94} height={30} rx="2" fill="#93c5fd" opacity="0.3" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">PICTURE</text>
    </g>
  ),

  // 233: letter — 文字で書かれた伝える紙
  233: (
    <g>
      {/* Envelope */}
      <rect x={50} y={50} width={100} height={68} rx="4" fill="white" stroke="#4f46e5" strokeWidth="2" />
      {/* Envelope flap */}
      <path d="M50 50 L100 88 L150 50" fill="none" stroke="#4f46e5" strokeWidth="2" />
      {/* Letter peeking out */}
      <rect x={58} y={38} width={84} height={30} rx="3" fill="#e0e7ff" stroke="#a5b4fc" strokeWidth="1" />
      {/* Text on letter */}
      <line x1={68} y1={48} x2={132} y2={48} stroke="#a5b4fc" strokeWidth="2" />
      <line x1={68} y1={56} x2={120} y2={56} stroke="#c7d2fe" strokeWidth="2" />
      {/* Stamp */}
      <rect x={128} y={96} width={14} height={14} rx="1" fill="#f472b6" opacity="0.6" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">LETTER</text>
    </g>
  ),

  // 234: number — ものの量や順番を表す記号
  234: (
    <g>
      {/* Numbers floating */}
      <text x={50} y={65} fontSize="28" fill="#4f46e5" fontWeight="bold">1</text>
      <text x={80} y={80} fontSize="32" fill="#7c3aed" fontWeight="bold">2</text>
      <text x={115} y={70} fontSize="26" fill="#818cf8" fontWeight="bold">3</text>
      <text x={55} y={105} fontSize="24" fill="#a5b4fc" fontWeight="bold">4</text>
      <text x={95} y={110} fontSize="30" fill="#4f46e5" fontWeight="bold">5</text>
      <text x={130} y={100} fontSize="22" fill="#c7d2fe" fontWeight="bold">6</text>
      <text x={140} y={55} fontSize="20" fill="#a5b4fc" fontWeight="bold">7</text>
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">NUMBER</text>
    </g>
  ),

  // 235: color — 目に映る赤・青・黄などの見え方
  235: (
    <g>
      {/* Color palette */}
      <circle cx={70} cy={60} r={16} fill="#ef4444" />
      <circle cx={100} cy={50} r={16} fill="#fbbf24" />
      <circle cx={130} cy={60} r={16} fill="#4f46e5" />
      <circle cx={60} cy={90} r={16} fill="#34d399" />
      <circle cx={90} cy={95} r={16} fill="#f472b6" />
      <circle cx={120} cy={92} r={16} fill="#7c3aed" />
      <circle cx={145} cy={85} r={16} fill="#f59e0b" />
      {/* Overlap effects */}
      <circle cx={85} cy={55} r={8} fill="#f97316" opacity="0.5" />
      <circle cx={115} cy={55} r={8} fill="#22d3ee" opacity="0.5" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">COLOR</text>
    </g>
  ),

  // 236: sound — 耳に聞こえる振動
  236: (
    <g>
      {/* Speaker / source */}
      <rect x={55} y={68} width={20} height={24} rx="4" fill="#4f46e5" />
      <polygon points="75,62 95,48 95,112 75,98" fill="#818cf8" />
      {/* Sound waves */}
      <path d="M100 65 Q112 80 100 95" fill="none" stroke="#a5b4fc" strokeWidth="3" />
      <path d="M108 55 Q125 80 108 105" fill="none" stroke="#c7d2fe" strokeWidth="3" />
      <path d="M116 48 Q138 80 116 112" fill="none" stroke="#e0e7ff" strokeWidth="3" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">SOUND</text>
    </g>
  ),

  // 237: light — 暗闇を照らす明るいもの
  237: (
    <g>
      {/* Light bulb shape */}
      <circle cx={100} cy={65} r={25} fill="#fbbf24" opacity="0.3" />
      <circle cx={100} cy={65} r={18} fill="#fbbf24" opacity="0.6" />
      <circle cx={100} cy={65} r={10} fill="#fbbf24" />
      {/* Bulb base */}
      <rect x={92} y={88} width={16} height={10} rx="2" fill="#94a3b8" />
      <rect x={95} y={98} width={10} height={5} rx="2" fill="#94a3b8" />
      {/* Rays */}
      <line x1={100} y1={30} x2={100} y2={38} stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
      <line x1={68} y1={40} x2={74} y2={46} stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
      <line x1={132} y1={40} x2={126} y2={46} stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
      <line x1={60} y1={65} x2={68} y2={65} stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
      <line x1={132} y1={65} x2={140} y2={65} stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
      <line x1={68} y1={90} x2={74} y2={84} stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
      <line x1={132} y1={90} x2={126} y2={84} stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">LIGHT</text>
    </g>
  ),

  // 238: air — 目に見えないが呼吸するために必要なもの
  238: (
    <g>
      <Person x={80} y={100} />
      {/* Breath / air flow */}
      <path d="M90 68 Q100 62 110 66" fill="none" stroke="#a5b4fc" strokeWidth="2" strokeLinecap="round" />
      <path d="M92 60 Q105 52 118 58" fill="none" stroke="#c7d2fe" strokeWidth="2" strokeLinecap="round" />
      <path d="M95 52 Q110 42 125 50" fill="none" stroke="#e0e7ff" strokeWidth="2" strokeLinecap="round" />
      {/* Air particles */}
      <circle cx={120} cy={70} r={2} fill="#a5b4fc" opacity="0.5" />
      <circle cx={135} cy={55} r={2} fill="#a5b4fc" opacity="0.4" />
      <circle cx={140} cy={75} r={1.5} fill="#c7d2fe" opacity="0.5" />
      <circle cx={128} cy={45} r={1.5} fill="#c7d2fe" opacity="0.3" />
      <circle cx={150} cy={65} r={2} fill="#a5b4fc" opacity="0.3" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">AIR</text>
    </g>
  ),

  // 239: earth — 私たちが住んでいる丸い星・大地
  239: (
    <g>
      {/* Earth globe */}
      <circle cx={100} cy={78} r={40} fill="#4f46e5" />
      {/* Continents */}
      <path d="M75 55 Q80 50 90 52 Q95 48 100 52 Q105 55 102 62 Q96 65 88 62 Q80 60 75 55" fill="#34d399" />
      <path d="M110 58 Q118 55 122 60 Q125 68 118 72 Q112 70 110 65 Q108 60 110 58" fill="#34d399" />
      <path d="M80 78 Q88 75 95 80 Q100 88 95 95 Q85 98 78 92 Q75 85 80 78" fill="#34d399" />
      <path d="M112 82 Q120 78 128 82 Q132 90 125 95 Q118 92 112 88 Q110 85 112 82" fill="#34d399" />
      {/* Shine */}
      <circle cx={82} cy={58} r={5} fill="white" opacity="0.2" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">EARTH</text>
    </g>
  ),

  // 240: fire — 熱と光を出して燃えるもの
  240: (
    <g>
      {/* Flames */}
      <path d="M100 35 Q85 60 80 80 Q78 95 90 105 Q95 108 100 110 Q105 108 110 105 Q122 95 120 80 Q115 60 100 35" fill="#f59e0b" />
      <path d="M100 50 Q90 65 88 80 Q86 92 95 100 Q100 103 105 100 Q114 92 112 80 Q110 65 100 50" fill="#ef4444" />
      <path d="M100 65 Q94 78 95 88 Q96 95 100 98 Q104 95 105 88 Q106 78 100 65" fill="#fbbf24" />
      {/* Sparks */}
      <circle cx={75} cy={60} r={2} fill="#f59e0b" />
      <circle cx={128} cy={55} r={2} fill="#f59e0b" />
      <circle cx={70} cy={45} r={1.5} fill="#fbbf24" />
      <circle cx={132} cy={42} r={1.5} fill="#fbbf24" />
      {/* Log base */}
      <rect x={72} y={110} width={56} height={10} rx="5" fill="#92400e" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">FIRE</text>
    </g>
  ),

  // 241: animal — 自分で動き回る生き物
  241: (
    <g>
      {/* Dog silhouette */}
      <circle cx={65} cy={65} r={10} fill="#f59e0b" />
      <rect x={55} y={70} width={30} height={18} rx="5" fill="#f59e0b" />
      <rect x={58} y={85} width={4} height={14} fill="#f59e0b" />
      <rect x={72} y={85} width={4} height={14} fill="#f59e0b" />
      <path d="M85 78 Q92 75 90 82" fill="#f59e0b" />
      {/* Bird */}
      <circle cx={135} cy={50} r={7} fill="#4f46e5" />
      <path d="M128 50 L120 48 L128 52" fill="#4f46e5" />
      <path d="M138 44 Q148 38 145 45" fill="none" stroke="#4f46e5" strokeWidth="2" />
      <path d="M138 46 Q150 42 146 48" fill="none" stroke="#4f46e5" strokeWidth="2" />
      {/* Fish */}
      <ellipse cx={100} cy={105} rx={16} ry={8} fill="#818cf8" />
      <polygon points="116,105 128,96 128,114" fill="#818cf8" />
      <circle cx={92} cy={103} r={2} fill="white" />
      {/* Paw prints */}
      <circle cx={50} cy={110} r={2} fill="#cbd5e1" />
      <circle cx={42} cy={118} r={2} fill="#cbd5e1" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">ANIMAL</text>
    </g>
  ),

  // 242: bird — 翼を持ち空を飛ぶ生き物
  242: (
    <g>
      {/* Bird body */}
      <ellipse cx={100} cy={75} rx={18} ry={12} fill="#4f46e5" />
      {/* Head */}
      <circle cx={120} cy={65} r={10} fill="#4f46e5" />
      {/* Beak */}
      <polygon points="130,63 142,65 130,68" fill="#f59e0b" />
      {/* Eye */}
      <circle cx={124} cy={63} r={3} fill="white" />
      <circle cx={125} cy={63} r={1.5} fill="#1e1b4b" />
      {/* Wings */}
      <path d="M90 68 Q70 45 55 55 Q70 58 85 68" fill="#818cf8" />
      <path d="M95 72 Q78 52 60 58 Q75 60 90 72" fill="#a5b4fc" />
      {/* Tail */}
      <polygon points="82,75 65,68 68,82" fill="#818cf8" />
      {/* Feet */}
      <line x1={95} y1={87} x2={92} y2={100} stroke="#f59e0b" strokeWidth="2" />
      <line x1={105} y1={87} x2={108} y2={100} stroke="#f59e0b" strokeWidth="2" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">BIRD</text>
    </g>
  ),

  // 243: fish — 水の中を泳ぐヒレのある生き物
  243: (
    <g>
      {/* Water background */}
      <rect x={35} y={40} width={130} height={85} rx="8" fill="#e0e7ff" opacity="0.5" />
      {/* Fish body */}
      <ellipse cx={105} cy={80} rx={32} ry={16} fill="#4f46e5" />
      {/* Tail */}
      <polygon points="73,80 55,65 55,95" fill="#818cf8" />
      {/* Eye */}
      <circle cx={122} cy={76} r={5} fill="white" />
      <circle cx={124} cy={76} r={2.5} fill="#1e1b4b" />
      {/* Fins */}
      <path d="M105 64 Q110 50 115 64" fill="#818cf8" />
      <path d="M95 90 Q100 100 108 92" fill="#818cf8" />
      {/* Mouth */}
      <circle cx={135} cy={82} r={2} fill="#a5b4fc" />
      {/* Bubbles */}
      <circle cx={145} cy={72} r={3} fill="none" stroke="#a5b4fc" strokeWidth="1.5" />
      <circle cx={150} cy={62} r={2} fill="none" stroke="#a5b4fc" strokeWidth="1" />
      <circle cx={155} cy={55} r={1.5} fill="none" stroke="#c7d2fe" strokeWidth="1" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">FISH</text>
    </g>
  ),

  // 244: dog — 人間と一緒に暮らす忠実な動物
  244: (
    <g>
      {/* Dog body */}
      <ellipse cx={95} cy={85} rx={28} ry={16} fill="#f59e0b" />
      {/* Head */}
      <circle cx={128} cy={68} r={16} fill="#f59e0b" />
      {/* Ears */}
      <ellipse cx={118} cy={54} rx={6} ry={10} fill="#d97706" transform="rotate(-15 118 54)" />
      <ellipse cx={138} cy={56} rx={6} ry={10} fill="#d97706" transform="rotate(15 138 56)" />
      {/* Eyes */}
      <circle cx={122} cy={65} r={3} fill="white" />
      <circle cx={134} cy={65} r={3} fill="white" />
      <circle cx={123} cy={65} r={1.5} fill="#1e1b4b" />
      <circle cx={135} cy={65} r={1.5} fill="#1e1b4b" />
      {/* Nose */}
      <circle cx={128} cy={74} r={3} fill="#1e1b4b" />
      {/* Mouth */}
      <path d="M125 77 Q128 80 131 77" fill="none" stroke="#92400e" strokeWidth="1.5" />
      {/* Tail */}
      <path d="M67 80 Q55 60 60 50" fill="none" stroke="#f59e0b" strokeWidth="4" strokeLinecap="round" />
      {/* Legs */}
      <rect x={80} y={96} width={6} height={18} rx="3" fill="#f59e0b" />
      <rect x={100} y={96} width={6} height={18} rx="3" fill="#f59e0b" />
      <rect x={118} y={80} width={5} height={18} rx="3" fill="#f59e0b" />
      <rect x={132} y={80} width={5} height={18} rx="3" fill="#f59e0b" />
      {/* Ground */}
      <line x1={50} y1={118} x2={155} y2={118} stroke="#cbd5e1" strokeWidth="2" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">DOG</text>
    </g>
  ),

  // 245: cat — しなやかな体で自由に動く小さな動物
  245: (
    <g>
      {/* Cat body */}
      <ellipse cx={95} cy={88} rx={25} ry={14} fill="#7c3aed" />
      {/* Head */}
      <circle cx={125} cy={72} r={14} fill="#7c3aed" />
      {/* Ears - triangles */}
      <polygon points="115,60 118,48 124,58" fill="#7c3aed" />
      <polygon points="128,58 134,48 137,60" fill="#7c3aed" />
      <polygon points="117,58 119,52 123,58" fill="#f472b6" />
      <polygon points="130,58 133,52 135,58" fill="#f472b6" />
      {/* Eyes */}
      <ellipse cx={120} cy={70} rx={3} ry={4} fill="#fbbf24" />
      <ellipse cx={132} cy={70} rx={3} ry={4} fill="#fbbf24" />
      <ellipse cx={120} cy={70} rx={1} ry={3} fill="#1e1b4b" />
      <ellipse cx={132} cy={70} rx={1} ry={3} fill="#1e1b4b" />
      {/* Nose */}
      <polygon points="124,76 126,73 128,76" fill="#f472b6" />
      {/* Whiskers */}
      <line x1={110} y1={74} x2={100} y2={72} stroke="#c7d2fe" strokeWidth="1" />
      <line x1={110} y1={76} x2={100} y2={78} stroke="#c7d2fe" strokeWidth="1" />
      <line x1={142} y1={74} x2={152} y2={72} stroke="#c7d2fe" strokeWidth="1" />
      <line x1={142} y1={76} x2={152} y2={78} stroke="#c7d2fe" strokeWidth="1" />
      {/* Tail */}
      <path d="M70 85 Q55 75 52 60 Q50 50 55 45" fill="none" stroke="#7c3aed" strokeWidth="4" strokeLinecap="round" />
      {/* Legs */}
      <rect x={82} y={98} width={5} height={14} rx="2" fill="#7c3aed" />
      <rect x={98} y={98} width={5} height={14} rx="2" fill="#7c3aed" />
      {/* Ground */}
      <line x1={45} y1={115} x2={155} y2={115} stroke="#cbd5e1" strokeWidth="2" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">CAT</text>
    </g>
  ),

  // 246: child — まだ小さくて成長途中の人間
  246: (
    <g>
      {/* Adult for scale */}
      <Person x={60} y={80} color="#94a3b8" />
      {/* Small child - shorter stick figure */}
      <circle cx={120} cy={78} r={8} fill="#4f46e5" />
      <line x1={120} y1={86} x2={120} y2={102} stroke="#4f46e5" strokeWidth="3" strokeLinecap="round" />
      <line x1={110} y1={92} x2={130} y2={92} stroke="#4f46e5" strokeWidth="3" strokeLinecap="round" />
      <line x1={120} y1={102} x2={113} y2={116} stroke="#4f46e5" strokeWidth="3" strokeLinecap="round" />
      <line x1={120} y1={102} x2={127} y2={116} stroke="#4f46e5" strokeWidth="3" strokeLinecap="round" />
      {/* Height comparison line */}
      <line x1={90} y1={52} x2={90} y2={108} stroke="#a5b4fc" strokeWidth="1" strokeDasharray="3 2" />
      <line x1={87} y1={52} x2={93} y2={52} stroke="#a5b4fc" strokeWidth="1.5" />
      <line x1={87} y1={70} x2={93} y2={70} stroke="#a5b4fc" strokeWidth="1.5" />
      {/* Star above child */}
      <circle cx={135} cy={70} r={3} fill="#fbbf24" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">CHILD</text>
    </g>
  ),

  // 247: baby — 生まれたばかりのとても小さな人間
  247: (
    <g>
      {/* Blanket/swaddle */}
      <ellipse cx={100} cy={85} rx={30} ry={22} fill="#c7d2fe" />
      <ellipse cx={100} cy={88} rx={26} ry={18} fill="#e0e7ff" />
      {/* Baby face */}
      <circle cx={100} cy={65} r={18} fill="#fcd9b6" />
      {/* Eyes - closed sleeping */}
      <path d="M90 62 Q93 65 96 62" fill="none" stroke="#4f46e5" strokeWidth="2" strokeLinecap="round" />
      <path d="M104 62 Q107 65 110 62" fill="none" stroke="#4f46e5" strokeWidth="2" strokeLinecap="round" />
      {/* Mouth */}
      <circle cx={100} cy={72} r={2} fill="#f472b6" />
      {/* Cheeks */}
      <circle cx={88} cy={68} r={4} fill="#f472b6" opacity="0.3" />
      <circle cx={112} cy={68} r={4} fill="#f472b6" opacity="0.3" />
      {/* Zzz */}
      <text x={125} y={52} fontSize="8" fill="#a5b4fc">z</text>
      <text x={132} y={45} fontSize="10" fill="#818cf8">z</text>
      <text x={140} y={37} fontSize="12" fill="#4f46e5">z</text>
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">BABY</text>
    </g>
  ),

  // 248: boy — 若い男性・少年
  248: (
    <g>
      {/* Boy - stick figure with short hair */}
      <circle cx={100} cy={55} r={14} fill="#4f46e5" />
      {/* Spiky hair */}
      <line x1={90} y1={44} x2={88} y2={38} stroke="#4f46e5" strokeWidth="3" strokeLinecap="round" />
      <line x1={98} y1={42} x2={97} y2={35} stroke="#4f46e5" strokeWidth="3" strokeLinecap="round" />
      <line x1={106} y1={42} x2={108} y2={35} stroke="#4f46e5" strokeWidth="3" strokeLinecap="round" />
      <line x1={112} y1={44} x2={115} y2={38} stroke="#4f46e5" strokeWidth="3" strokeLinecap="round" />
      {/* Face */}
      <circle cx={94} cy={53} r={2} fill="white" />
      <circle cx={106} cy={53} r={2} fill="white" />
      <path d="M96 60 Q100 64 104 60" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      {/* Body */}
      <line x1={100} y1={69} x2={100} y2={100} stroke="#4f46e5" strokeWidth="3" strokeLinecap="round" />
      <line x1={85} y1={82} x2={115} y2={82} stroke="#4f46e5" strokeWidth="3" strokeLinecap="round" />
      <line x1={100} y1={100} x2={88} y2={122} stroke="#4f46e5" strokeWidth="3" strokeLinecap="round" />
      <line x1={100} y1={100} x2={112} y2={122} stroke="#4f46e5" strokeWidth="3" strokeLinecap="round" />
      {/* T-shirt */}
      <rect x={90} y={72} width={20} height={18} rx="3" fill="#818cf8" opacity="0.5" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">BOY</text>
    </g>
  ),

  // 249: girl — 若い女性・少女
  249: (
    <g>
      {/* Girl - stick figure with long hair */}
      <circle cx={100} cy={55} r={14} fill="#7c3aed" />
      {/* Long hair */}
      <path d="M86 50 Q80 55 78 70 Q76 80 82 85" fill="none" stroke="#7c3aed" strokeWidth="4" strokeLinecap="round" />
      <path d="M114 50 Q120 55 122 70 Q124 80 118 85" fill="none" stroke="#7c3aed" strokeWidth="4" strokeLinecap="round" />
      {/* Face */}
      <circle cx={94} cy={53} r={2} fill="white" />
      <circle cx={106} cy={53} r={2} fill="white" />
      <path d="M96 60 Q100 64 104 60" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      {/* Body */}
      <line x1={100} y1={69} x2={100} y2={95} stroke="#7c3aed" strokeWidth="3" strokeLinecap="round" />
      <line x1={85} y1={80} x2={115} y2={80} stroke="#7c3aed" strokeWidth="3" strokeLinecap="round" />
      {/* Skirt */}
      <path d="M90 92 L85 118 L115 118 L110 92" fill="#f472b6" opacity="0.5" />
      {/* Legs */}
      <line x1={90} y1={118} x2={88} y2={130} stroke="#7c3aed" strokeWidth="3" strokeLinecap="round" />
      <line x1={110} y1={118} x2={112} y2={130} stroke="#7c3aed" strokeWidth="3" strokeLinecap="round" />
      {/* Ribbon */}
      <circle cx={88} cy={46} r={3} fill="#f472b6" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">GIRL</text>
    </g>
  ),

  // 250: man — 大人の男の人
  250: (
    <g>
      {/* Tall adult man stick figure */}
      <circle cx={100} cy={45} r={14} fill="#4f46e5" />
      {/* Face features */}
      <circle cx={95} cy={43} r={2} fill="white" />
      <circle cx={105} cy={43} r={2} fill="white" />
      <line x1={96} y1={50} x2={104} y2={50} stroke="white" strokeWidth="1.5" strokeLinecap="round" />
      {/* Body - taller */}
      <line x1={100} y1={59} x2={100} y2={100} stroke="#4f46e5" strokeWidth="4" strokeLinecap="round" />
      <line x1={80} y1={78} x2={120} y2={78} stroke="#4f46e5" strokeWidth="3" strokeLinecap="round" />
      <line x1={100} y1={100} x2={85} y2={130} stroke="#4f46e5" strokeWidth="4" strokeLinecap="round" />
      <line x1={100} y1={100} x2={115} y2={130} stroke="#4f46e5" strokeWidth="4" strokeLinecap="round" />
      {/* Tie */}
      <polygon points="97,62 100,75 103,62" fill="#ef4444" />
      {/* Shoulders broader */}
      <line x1={82} y1={66} x2={118} y2={66} stroke="#4f46e5" strokeWidth="4" strokeLinecap="round" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">MAN</text>
    </g>
  ),

  // 251: woman — 大人の女の人
  251: (
    <g>
      {/* Woman figure with longer hair */}
      <circle cx={100} cy={55} r={12} fill="#7c3aed" />
      {/* Hair */}
      <path d="M88 52 Q88 38 100 38 Q112 38 112 52" fill="#7c3aed" />
      <path d="M88 52 Q84 65 86 70" stroke="#7c3aed" strokeWidth="3" fill="none" />
      <path d="M112 52 Q116 65 114 70" stroke="#7c3aed" strokeWidth="3" fill="none" />
      {/* Body */}
      <line x1={100} y1={67} x2={100} y2={95} stroke="#7c3aed" strokeWidth="3" strokeLinecap="round" />
      {/* Arms */}
      <line x1={100} y1={78} x2={82} y2={88} stroke="#7c3aed" strokeWidth="3" strokeLinecap="round" />
      <line x1={100} y1={78} x2={118} y2={88} stroke="#7c3aed" strokeWidth="3" strokeLinecap="round" />
      {/* Skirt */}
      <path d="M100 95 L85 120 L115 120 Z" fill="#c7d2fe" stroke="#7c3aed" strokeWidth="2" />
      {/* Ground */}
      <line x1={60} y1={122} x2={140} y2={122} stroke="#cbd5e1" strokeWidth="2" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">WOMAN</text>
    </g>
  ),

  // 252: king — 国を治める最も偉い男性
  252: (
    <g>
      <Person x={100} y={95} />
      {/* Crown */}
      <polygon points="82,42 88,30 94,40 100,28 106,40 112,30 118,42" fill="#fbbf24" stroke="#f59e0b" strokeWidth="1.5" />
      <rect x={82} y={42} width={36} height={6} fill="#fbbf24" stroke="#f59e0b" strokeWidth="1" />
      {/* Jewels on crown */}
      <circle cx={94} cy={36} r={2} fill="#ef4444" />
      <circle cx={100} cy={32} r={2} fill="#4f46e5" />
      <circle cx={106} cy={36} r={2} fill="#34d399" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">KING</text>
    </g>
  ),

  // 253: queen — 国を治める最も偉い女性
  253: (
    <g>
      {/* Queen figure */}
      <circle cx={100} cy={58} r={11} fill="#7c3aed" />
      <line x1={100} y1={69} x2={100} y2={95} stroke="#7c3aed" strokeWidth="3" strokeLinecap="round" />
      <line x1={100} y1={78} x2={84} y2={88} stroke="#7c3aed" strokeWidth="3" strokeLinecap="round" />
      <line x1={100} y1={78} x2={116} y2={88} stroke="#7c3aed" strokeWidth="3" strokeLinecap="round" />
      <path d="M100 95 L86 118 L114 118 Z" fill="#c7d2fe" stroke="#7c3aed" strokeWidth="2" />
      {/* Tiara */}
      <path d="M88 52 L92 40 L96 48 L100 38 L104 48 L108 40 L112 52" fill="none" stroke="#fbbf24" strokeWidth="2" />
      <circle cx={100} cy={40} r={3} fill="#fbbf24" />
      {/* Hair */}
      <path d="M89 55 Q86 65 87 72" stroke="#7c3aed" strokeWidth="2.5" fill="none" />
      <path d="M111 55 Q114 65 113 72" stroke="#7c3aed" strokeWidth="2.5" fill="none" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">QUEEN</text>
    </g>
  ),

  // 254: teacher — 知識や技術を教える人
  254: (
    <g>
      <Person x={60} y={95} />
      {/* Blackboard */}
      <rect x={95} y={50} width={70} height={50} rx="3" fill="#34d399" stroke="#059669" strokeWidth="2" />
      {/* Writing on board */}
      <text x={115} y={70} fontSize="10" fill="white">ABC</text>
      <text x={110} y={85} fontSize="10" fill="white">1+2=3</text>
      {/* Pointer stick */}
      <line x1={72} y1={87} x2={95} y2={72} stroke="#f59e0b" strokeWidth="2" strokeLinecap="round" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">TEACHER</text>
    </g>
  ),

  // 255: doctor — 病気やけがを治す専門家
  255: (
    <g>
      <Person x={100} y={95} />
      {/* Stethoscope */}
      <path d="M92 80 Q85 95 90 105" fill="none" stroke="#94a3b8" strokeWidth="2" />
      <circle cx={90} cy={107} r={4} fill="#94a3b8" />
      {/* Cross on head (medical) */}
      <rect x={94} y={38} width={12} height={12} rx="2" fill="white" stroke="#ef4444" strokeWidth="2" />
      <line x1={100} y1={40} x2={100} y2={48} stroke="#ef4444" strokeWidth="2" />
      <line x1={96} y1={44} x2={104} y2={44} stroke="#ef4444" strokeWidth="2" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">DOCTOR</text>
    </g>
  ),

  // 256: student — 学校で勉強する人
  256: (
    <g>
      <Person x={80} y={95} />
      {/* Desk */}
      <rect x={65} y={105} width={70} height={4} rx="1" fill="#94a3b8" />
      {/* Book on desk */}
      <rect x={78} y={92} width={20} height={14} rx="2" fill="#a5b4fc" stroke="#4f46e5" strokeWidth="1.5" />
      <line x1={88} y1={93} x2={88} y2={105} stroke="#4f46e5" strokeWidth="1" />
      {/* Pencil */}
      <line x1={102} y1={100} x2={112} y2={92} stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" />
      {/* Thought bubble */}
      <circle cx={115} cy={65} r={3} fill="#c7d2fe" />
      <circle cx={122} cy={58} r={4} fill="#c7d2fe" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">STUDENT</text>
    </g>
  ),

  // 257: player — スポーツやゲームをする人
  257: (
    <g>
      {/* Running person */}
      <circle cx={95} cy={55} r={10} fill="#4f46e5" />
      <line x1={95} y1={65} x2={90} y2={90} stroke="#4f46e5" strokeWidth="3" strokeLinecap="round" />
      <line x1={90} y1={75} x2={75} y2={70} stroke="#4f46e5" strokeWidth="3" strokeLinecap="round" />
      <line x1={90} y1={75} x2={108} y2={82} stroke="#4f46e5" strokeWidth="3" strokeLinecap="round" />
      <line x1={90} y1={90} x2={78} y2={110} stroke="#4f46e5" strokeWidth="3" strokeLinecap="round" />
      <line x1={90} y1={90} x2={105} y2={108} stroke="#4f46e5" strokeWidth="3" strokeLinecap="round" />
      {/* Ball */}
      <circle cx={140} cy={70} r={14} fill="#fbbf24" stroke="#f59e0b" strokeWidth="2" />
      {/* Jersey number */}
      <text x={95} y={82} textAnchor="middle" fontSize="8" fill="white" fontWeight="bold">10</text>
      {/* Ground */}
      <line x1={40} y1={115} x2={170} y2={115} stroke="#34d399" strokeWidth="2" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">PLAYER</text>
    </g>
  ),

  // 258: singer — 歌を歌うことを仕事にする人
  258: (
    <g>
      <Person x={100} y={95} />
      {/* Microphone */}
      <line x1={112} y1={87} x2={125} y2={75} stroke="#94a3b8" strokeWidth="2" />
      <circle cx={128} cy={72} r={6} fill="#94a3b8" stroke="#64748b" strokeWidth="1.5" />
      {/* Musical notes */}
      <text x={140} y={60} fontSize="16" fill="#f472b6">♪</text>
      <text x={150} y={75} fontSize="12" fill="#a5b4fc">♫</text>
      <text x={60} y={65} fontSize="14" fill="#fbbf24">♪</text>
      {/* Sound waves */}
      <path d="M136 68 Q142 72 136 76" fill="none" stroke="#a5b4fc" strokeWidth="1.5" />
      <path d="M140 64 Q148 72 140 80" fill="none" stroke="#c7d2fe" strokeWidth="1.5" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">SINGER</text>
    </g>
  ),

  // 259: cook — 食べ物を作る仕事をする人
  259: (
    <g>
      <Person x={80} y={95} />
      {/* Chef hat */}
      <ellipse cx={80} cy={50} rx={14} ry={10} fill="white" stroke="#cbd5e1" strokeWidth="1.5" />
      <rect x={70} y={52} width={20} height={6} fill="white" stroke="#cbd5e1" strokeWidth="1" />
      {/* Pan */}
      <ellipse cx={130} cy={95} rx={22} ry={8} fill="#94a3b8" />
      <line x1={152} y1={95} x2={170} y2={90} stroke="#64748b" strokeWidth="3" strokeLinecap="round" />
      {/* Steam */}
      <path d="M122 82 Q120 75 124 70" fill="none" stroke="#cbd5e1" strokeWidth="1.5" />
      <path d="M130 80 Q128 72 132 66" fill="none" stroke="#cbd5e1" strokeWidth="1.5" />
      <path d="M138 82 Q136 75 140 70" fill="none" stroke="#cbd5e1" strokeWidth="1.5" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">COOK</text>
    </g>
  ),

  // 260: driver — 車やバスを運転する人
  260: (
    <g>
      {/* Car body */}
      <rect x={45} y={80} width={80} height={25} rx="8" fill="#4f46e5" />
      <rect x={55} y={70} width={45} height={14} rx="5" fill="#818cf8" />
      {/* Windows */}
      <rect x={60} y={73} width={14} height={9} rx="2" fill="#e0e7ff" />
      <rect x={78} y={73} width={14} height={9} rx="2" fill="#e0e7ff" />
      {/* Person in driver seat */}
      <circle cx={85} cy={76} r={4} fill="#f59e0b" />
      {/* Steering wheel */}
      <circle cx={85} cy={88} r={5} fill="none" stroke="#cbd5e1" strokeWidth="1.5" />
      {/* Wheels */}
      <circle cx={65} cy={106} r={8} fill="#374151" />
      <circle cx={65} cy={106} r={3} fill="#94a3b8" />
      <circle cx={105} cy={106} r={8} fill="#374151" />
      <circle cx={105} cy={106} r={3} fill="#94a3b8" />
      {/* Road */}
      <line x1={25} y1={116} x2={175} y2={116} stroke="#cbd5e1" strokeWidth="2" />
      <text x={100} y={155} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">DRIVER</text>
    </g>
  ),

  // 261: young — 年齢が低く元気にあふれている
  261: (
    <g>
      {/* Small young figure */}
      <circle cx={100} cy={65} r={10} fill="#4f46e5" />
      <line x1={100} y1={75} x2={100} y2={95} stroke="#4f46e5" strokeWidth="3" strokeLinecap="round" />
      <line x1={88} y1={82} x2={112} y2={82} stroke="#4f46e5" strokeWidth="3" strokeLinecap="round" />
      <line x1={100} y1={95} x2={90} y2={112} stroke="#4f46e5" strokeWidth="3" strokeLinecap="round" />
      <line x1={100} y1={95} x2={110} y2={112} stroke="#4f46e5" strokeWidth="3" strokeLinecap="round" />
      {/* Energy sparkles */}
      <circle cx={70} cy={60} r={3} fill="#fbbf24" />
      <circle cx={130} cy={58} r={3} fill="#fbbf24" />
      <circle cx={65} cy={80} r={2} fill="#f59e0b" />
      <circle cx={135} cy={78} r={2} fill="#f59e0b" />
      {/* Sprout / growth symbol */}
      <path d="M100 55 Q95 45 100 40 Q105 45 100 55" fill="#34d399" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">YOUNG</text>
    </g>
  ),

  // 262: old — 長い時間が経っている
  262: (
    <g>
      {/* Old person with cane */}
      <circle cx={95} cy={60} r={10} fill="#94a3b8" />
      {/* Hunched body */}
      <path d="M95 70 Q92 85 90 100" stroke="#94a3b8" strokeWidth="3" fill="none" strokeLinecap="round" />
      <line x1={90} y1={80} x2={78} y2={88} stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" />
      <line x1={90} y1={80} x2={105} y2={85} stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" />
      <line x1={90} y1={100} x2={82} y2={118} stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" />
      <line x1={90} y1={100} x2={98} y2={118} stroke="#94a3b8" strokeWidth="3" strokeLinecap="round" />
      {/* Walking cane */}
      <line x1={105} y1={85} x2={112} y2={118} stroke="#f59e0b" strokeWidth="3" strokeLinecap="round" />
      <path d="M105 85 Q108 80 112 82" stroke="#f59e0b" strokeWidth="3" fill="none" strokeLinecap="round" />
      {/* Ground */}
      <line x1={60} y1={120} x2={140} y2={120} stroke="#cbd5e1" strokeWidth="2" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">OLD</text>
    </g>
  ),

  // 263: tall — 上に向かって長く伸びている
  263: (
    <g>
      {/* Tall figure */}
      <circle cx={100} cy={35} r={10} fill="#4f46e5" />
      <line x1={100} y1={45} x2={100} y2={95} stroke="#4f46e5" strokeWidth="3" strokeLinecap="round" />
      <line x1={88} y1={60} x2={112} y2={60} stroke="#4f46e5" strokeWidth="3" strokeLinecap="round" />
      <line x1={100} y1={95} x2={90} y2={118} stroke="#4f46e5" strokeWidth="3" strokeLinecap="round" />
      <line x1={100} y1={95} x2={110} y2={118} stroke="#4f46e5" strokeWidth="3" strokeLinecap="round" />
      {/* Height arrow */}
      <line x1={135} y1={30} x2={135} y2={118} stroke="#f59e0b" strokeWidth="2" />
      <polygon points="135,28 130,36 140,36" fill="#f59e0b" />
      <polygon points="135,120 130,112 140,112" fill="#f59e0b" />
      {/* Ground */}
      <line x1={60} y1={120} x2={160} y2={120} stroke="#cbd5e1" strokeWidth="2" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">TALL</text>
    </g>
  ),

  // 264: short — 長さや高さが足りない
  264: (
    <g>
      {/* Short figure */}
      <circle cx={100} cy={75} r={9} fill="#4f46e5" />
      <line x1={100} y1={84} x2={100} y2={100} stroke="#4f46e5" strokeWidth="3" strokeLinecap="round" />
      <line x1={90} y1={90} x2={110} y2={90} stroke="#4f46e5" strokeWidth="3" strokeLinecap="round" />
      <line x1={100} y1={100} x2={92} y2={115} stroke="#4f46e5" strokeWidth="3" strokeLinecap="round" />
      <line x1={100} y1={100} x2={108} y2={115} stroke="#4f46e5" strokeWidth="3" strokeLinecap="round" />
      {/* Short height arrow */}
      <line x1={135} y1={70} x2={135} y2={118} stroke="#f59e0b" strokeWidth="2" />
      <polygon points="135,68 130,76 140,76" fill="#f59e0b" />
      <polygon points="135,120 130,112 140,112" fill="#f59e0b" />
      {/* Ground */}
      <line x1={60} y1={120} x2={160} y2={120} stroke="#cbd5e1" strokeWidth="2" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">SHORT</text>
    </g>
  ),

  // 265: round — 角がなく円の形をしている
  265: (
    <g>
      {/* Various round shapes */}
      <circle cx={100} cy={75} r={30} fill="none" stroke="#4f46e5" strokeWidth="3" />
      <circle cx={100} cy={75} r={20} fill="#c7d2fe" opacity="0.5" />
      <circle cx={100} cy={75} r={10} fill="#a5b4fc" opacity="0.7" />
      {/* Small round objects */}
      <circle cx={55} cy={110} r={10} fill="#fbbf24" />
      <circle cx={145} cy={110} r={10} fill="#34d399" />
      <circle cx={100} cy={115} r={8} fill="#f472b6" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">ROUND</text>
    </g>
  ),

  // 266: flat — でこぼこがなく平面的な
  266: (
    <g>
      {/* Flat surface */}
      <rect x={40} y={80} width={120} height={6} rx="1" fill="#a5b4fc" stroke="#4f46e5" strokeWidth="2" />
      {/* Arrows showing flatness */}
      <line x1={50} y1={75} x2={150} y2={75} stroke="#cbd5e1" strokeWidth="1" strokeDasharray="4 3" />
      <line x1={50} y1={90} x2={150} y2={90} stroke="#cbd5e1" strokeWidth="1" strokeDasharray="4 3" />
      {/* Comparison: bumpy vs flat */}
      <path d="M45 55 Q55 45 65 55 Q75 45 85 55 Q95 45 105 55" fill="none" stroke="#ef4444" strokeWidth="2" opacity="0.4" />
      <line x1={45} y1={55} x2={105} y2={55} stroke="#ef4444" strokeWidth="2" strokeDasharray="4 3" opacity="0.4" />
      {/* X mark on bumpy */}
      <text x={75} y={48} textAnchor="middle" fontSize="14" fill="#ef4444" opacity="0.5">X</text>
      {/* Check on flat */}
      <path d="M92 98 L98 105 L112 92" stroke="#34d399" strokeWidth="3" fill="none" strokeLinecap="round" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">FLAT</text>
    </g>
  ),

  // 267: clear — くもりがなく透き通っている
  267: (
    <g>
      {/* Clear glass */}
      <rect x={75} y={50} width={50} height={60} rx="4" fill="none" stroke="#a5b4fc" strokeWidth="2" />
      {/* Sparkle effects */}
      <line x1={82} y1={58} x2={82} y2={64} stroke="#fbbf24" strokeWidth="2" />
      <line x1={79} y1={61} x2={85} y2={61} stroke="#fbbf24" strokeWidth="2" />
      <line x1={115} y1={70} x2={115} y2={76} stroke="#fbbf24" strokeWidth="2" />
      <line x1={112} y1={73} x2={118} y2={73} stroke="#fbbf24" strokeWidth="2" />
      {/* See-through lines */}
      <circle cx={100} cy={80} r={8} fill="none" stroke="#c7d2fe" strokeWidth="1.5" strokeDasharray="3 2" />
      {/* Sun */}
      <circle cx={50} cy={45} r={12} fill="#fbbf24" />
      <line x1={50} y1={30} x2={50} y2={25} stroke="#f59e0b" strokeWidth="2" />
      <line x1={62} y1={38} x2={66} y2={34} stroke="#f59e0b" strokeWidth="2" />
      <line x1={38} y1={38} x2={34} y2={34} stroke="#f59e0b" strokeWidth="2" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">CLEAR</text>
    </g>
  ),

  // 268: simple — 複雑でなくわかりやすい
  268: (
    <g>
      {/* Simple circle - clean */}
      <circle cx={100} cy={70} r={25} fill="#e0e7ff" stroke="#4f46e5" strokeWidth="3" />
      {/* Check inside */}
      <path d="M90 70 L96 78 L112 60" stroke="#34d399" strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {/* vs complex (crossed out) */}
      <g opacity="0.3">
        <path d="M40 105 L55 95 L50 115 L65 100 L60 120" fill="none" stroke="#94a3b8" strokeWidth="1.5" />
        <line x1={38} y1={95} x2={65} y2={120} stroke="#ef4444" strokeWidth="2" />
      </g>
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">SIMPLE</text>
    </g>
  ),

  // 269: right — 間違いがなく合っている
  269: (
    <g>
      {/* Big check mark */}
      <path d="M65 85 L90 110 L140 55" stroke="#34d399" strokeWidth="6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {/* Circle around */}
      <circle cx={100} cy={82} r={40} fill="none" stroke="#34d399" strokeWidth="2" opacity="0.4" />
      {/* Sparkles */}
      <circle cx={55} cy={55} r={3} fill="#fbbf24" />
      <circle cx={148} cy={48} r={3} fill="#fbbf24" />
      <circle cx={145} cy={110} r={2} fill="#fbbf24" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">RIGHT</text>
    </g>
  ),

  // 270: wrong — 正しくない・合っていない
  270: (
    <g>
      {/* Big X mark */}
      <line x1={65} y1={50} x2={135} y2={110} stroke="#ef4444" strokeWidth="6" strokeLinecap="round" />
      <line x1={135} y1={50} x2={65} y2={110} stroke="#ef4444" strokeWidth="6" strokeLinecap="round" />
      {/* Circle around */}
      <circle cx={100} cy={80} r={40} fill="none" stroke="#ef4444" strokeWidth="2" opacity="0.4" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">WRONG</text>
    </g>
  ),

  // 271: true — 事実に合っていて嘘がない
  271: (
    <g>
      {/* Shield of truth */}
      <path d="M100 40 L130 55 L130 90 Q130 115 100 125 Q70 115 70 90 L70 55 Z" fill="#e0e7ff" stroke="#4f46e5" strokeWidth="2" />
      {/* Check mark inside */}
      <path d="M85 82 L95 94 L118 65" stroke="#34d399" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      {/* Glow */}
      <circle cx={100} cy={82} r={35} fill="none" stroke="#fbbf24" strokeWidth="1" opacity="0.3" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">TRUE</text>
    </g>
  ),

  // 272: false — 事実ではなく嘘である
  272: (
    <g>
      {/* Mask symbol */}
      <path d="M70 60 Q100 45 130 60 Q130 85 100 95 Q70 85 70 60" fill="#cbd5e1" stroke="#94a3b8" strokeWidth="2" />
      {/* Eyes (shifty) */}
      <circle cx={88} cy={70} r={5} fill="white" />
      <circle cx={90} cy={70} r={2.5} fill="#374151" />
      <circle cx={112} cy={70} r={5} fill="white" />
      <circle cx={114} cy={70} r={2.5} fill="#374151" />
      {/* X mark */}
      <line x1={85} y1={105} x2={115} y2={125} stroke="#ef4444" strokeWidth="3" strokeLinecap="round" />
      <line x1={115} y1={105} x2={85} y2={125} stroke="#ef4444" strokeWidth="3" strokeLinecap="round" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">FALSE</text>
    </g>
  ),

  // 273: same — 違いがなく一緒である
  273: (
    <g>
      {/* Two identical shapes */}
      <circle cx={70} cy={75} r={20} fill="#a5b4fc" stroke="#4f46e5" strokeWidth="2" />
      <circle cx={130} cy={75} r={20} fill="#a5b4fc" stroke="#4f46e5" strokeWidth="2" />
      {/* Equals sign */}
      <line x1={92} y1={70} x2={108} y2={70} stroke="#4f46e5" strokeWidth="3" />
      <line x1={92} y1={80} x2={108} y2={80} stroke="#4f46e5" strokeWidth="3" />
      {/* Stars in both */}
      <text x={70} y={80} textAnchor="middle" fontSize="14" fill="#4f46e5">★</text>
      <text x={130} y={80} textAnchor="middle" fontSize="14" fill="#4f46e5">★</text>
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">SAME</text>
    </g>
  ),

  // 274: different — 同じではなく別のものである
  274: (
    <g>
      {/* Two different shapes */}
      <circle cx={65} cy={75} r={20} fill="#a5b4fc" stroke="#4f46e5" strokeWidth="2" />
      <rect x={115} y={55} width={40} height={40} rx="4" fill="#fbbf24" stroke="#f59e0b" strokeWidth="2" />
      {/* Not-equal sign */}
      <line x1={88} y1={70} x2={112} y2={70} stroke="#ef4444" strokeWidth="3" />
      <line x1={88} y1={80} x2={112} y2={80} stroke="#ef4444" strokeWidth="3" />
      <line x1={95} y1={63} x2={105} y2={87} stroke="#ef4444" strokeWidth="3" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">DIFFERENT</text>
    </g>
  ),

  // 275: full — これ以上入らないほど満たされている
  275: (
    <g>
      {/* Container */}
      <rect x={70} y={45} width={60} height={70} rx="4" fill="none" stroke="#4f46e5" strokeWidth="2" />
      {/* Filled to top */}
      <rect x={72} y={47} width={56} height={66} rx="3" fill="#a5b4fc" opacity="0.7" />
      {/* Overflow drops */}
      <circle cx={80} cy={40} r={3} fill="#a5b4fc" />
      <circle cx={120} cy={38} r={3} fill="#a5b4fc" />
      <circle cx={100} cy={36} r={3} fill="#a5b4fc" />
      {/* MAX label */}
      <line x1={60} y1={47} x2={68} y2={47} stroke="#ef4444" strokeWidth="2" />
      <text x={55} y={50} textAnchor="middle" fontSize="8" fill="#ef4444">MAX</text>
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">FULL</text>
    </g>
  ),

  // 276: empty — 中に何も入っていない
  276: (
    <g>
      {/* Empty container */}
      <rect x={70} y={45} width={60} height={70} rx="4" fill="none" stroke="#94a3b8" strokeWidth="2" />
      {/* Nothing inside - just whitespace */}
      {/* Dashed line at bottom showing empty */}
      <line x1={75} y1={108} x2={125} y2={108} stroke="#cbd5e1" strokeWidth="1" strokeDasharray="3 3" />
      {/* Zero label */}
      <text x={100} y={85} textAnchor="middle" fontSize="18" fill="#cbd5e1">0</text>
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">EMPTY</text>
    </g>
  ),

  // 277: sick — 体の調子が悪い状態
  277: (
    <g>
      <Person x={100} y={95} />
      {/* Thermometer */}
      <line x1={118} y1={75} x2={125} y2={60} stroke="#ef4444" strokeWidth="3" strokeLinecap="round" />
      <circle cx={126} cy={58} r={3} fill="#ef4444" />
      {/* Sweat drops */}
      <circle cx={82} cy={68} r={3} fill="#a5b4fc" />
      <circle cx={75} cy={75} r={2} fill="#a5b4fc" />
      {/* Dizzy marks */}
      <path d="M115 55 Q120 52 118 48" fill="none" stroke="#94a3b8" strokeWidth="1.5" />
      <path d="M85 50 Q80 48 82 44" fill="none" stroke="#94a3b8" strokeWidth="1.5" />
      {/* Green face tint */}
      <circle cx={100} cy={67} r={11} fill="#34d399" opacity="0.15" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">SICK</text>
    </g>
  ),

  // 278: healthy — 体も心も元気で調子が良い
  278: (
    <g>
      <Person x={100} y={90} />
      {/* Heart (health) */}
      <path d="M95 50 C95 44 85 42 85 50 C85 58 95 62 95 62 C95 62 105 58 105 50 C105 42 95 44 95 50" fill="#ef4444" />
      {/* Energy/sparkle marks */}
      <line x1={120} y1={55} x2={128} y2={55} stroke="#fbbf24" strokeWidth="2" />
      <line x1={124} y1={50} x2={124} y2={60} stroke="#fbbf24" strokeWidth="2" />
      <line x1={72} y1={58} x2={80} y2={58} stroke="#fbbf24" strokeWidth="2" />
      <line x1={76} y1={53} x2={76} y2={63} stroke="#fbbf24" strokeWidth="2" />
      {/* Flexing arm */}
      <path d="M112 82 Q125 72 120 85" stroke="#4f46e5" strokeWidth="3" fill="none" strokeLinecap="round" />
      <circle cx={122} cy={75} r={5} fill="none" stroke="#4f46e5" strokeWidth="2" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">HEALTHY</text>
    </g>
  ),

  // 279: lucky — 良いことが偶然に起こる
  279: (
    <g>
      <Person x={100} y={100} />
      {/* Four-leaf clover */}
      <circle cx={62} cy={55} r={8} fill="#34d399" />
      <circle cx={75} cy={55} r={8} fill="#34d399" />
      <circle cx={62} cy={67} r={8} fill="#34d399" />
      <circle cx={75} cy={67} r={8} fill="#34d399" />
      <line x1={68} y1={70} x2={68} y2={80} stroke="#059669" strokeWidth="2" />
      {/* Stars */}
      <circle cx={140} cy={50} r={4} fill="#fbbf24" />
      <circle cx={150} cy={65} r={3} fill="#fbbf24" />
      <circle cx={45} cy={45} r={3} fill="#fbbf24" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">LUCKY</text>
    </g>
  ),

  // 280: unlucky — 悪いことが偶然に起こる
  280: (
    <g>
      <Person x={100} y={100} />
      {/* Rain cloud */}
      <ellipse cx={100} cy={48} rx={25} ry={12} fill="#94a3b8" />
      <circle cx={82} cy={45} r={10} fill="#94a3b8" />
      <circle cx={118} cy={45} r={10} fill="#94a3b8" />
      {/* Rain drops */}
      <line x1={85} y1={60} x2={83} y2={68} stroke="#a5b4fc" strokeWidth="2" />
      <line x1={95} y1={62} x2={93} y2={70} stroke="#a5b4fc" strokeWidth="2" />
      <line x1={105} y1={60} x2={103} y2={68} stroke="#a5b4fc" strokeWidth="2" />
      <line x1={115} y1={62} x2={113} y2={70} stroke="#a5b4fc" strokeWidth="2" />
      {/* Lightning bolt */}
      <path d="M130 42 L125 52 L132 52 L126 65" stroke="#f59e0b" strokeWidth="2" fill="none" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">UNLUCKY</text>
    </g>
  ),

  // 281: here — 話し手がいるこの場所
  281: (
    <g>
      <Person x={100} y={90} />
      {/* Pin marker on person's location */}
      <path d="M100 35 Q88 35 88 48 Q88 58 100 68 Q112 58 112 48 Q112 35 100 35" fill="#ef4444" />
      <circle cx={100} cy={48} r={5} fill="white" />
      {/* Concentric circles at feet */}
      <circle cx={100} cy={120} r={10} fill="none" stroke="#a5b4fc" strokeWidth="1.5" />
      <circle cx={100} cy={120} r={20} fill="none" stroke="#c7d2fe" strokeWidth="1" />
      <circle cx={100} cy={120} r={30} fill="none" stroke="#e0e7ff" strokeWidth="1" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">HERE</text>
    </g>
  ),

  // 282: there — 話し手から離れたあの場所
  282: (
    <g>
      <Person x={55} y={100} />
      {/* Pointing arm */}
      <line x1={67} y1={92} x2={100} y2={80} stroke="#4f46e5" strokeWidth="3" strokeLinecap="round" />
      {/* Distant pin marker */}
      <path d="M145 50 Q135 50 135 60 Q135 68 145 76 Q155 68 155 60 Q155 50 145 50" fill="#ef4444" opacity="0.6" />
      <circle cx={145} cy={60} r={4} fill="white" opacity="0.6" />
      {/* Dashed line showing distance */}
      <line x1={105} y1={80} x2={135} y2={65} stroke="#a5b4fc" strokeWidth="2" strokeDasharray="5 3" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">THERE</text>
    </g>
  ),

  // 283: now — まさにこの瞬間
  283: (
    <g>
      {/* Clock */}
      <circle cx={100} cy={75} r={32} fill="white" stroke="#4f46e5" strokeWidth="3" />
      {/* Clock marks */}
      <line x1={100} y1={47} x2={100} y2={52} stroke="#4f46e5" strokeWidth="2" />
      <line x1={100} y1={98} x2={100} y2={103} stroke="#4f46e5" strokeWidth="2" />
      <line x1={72} y1={75} x2={77} y2={75} stroke="#4f46e5" strokeWidth="2" />
      <line x1={123} y1={75} x2={128} y2={75} stroke="#4f46e5" strokeWidth="2" />
      {/* Hands pointing to now */}
      <line x1={100} y1={75} x2={100} y2={55} stroke="#4f46e5" strokeWidth="3" strokeLinecap="round" />
      <line x1={100} y1={75} x2={118} y2={75} stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
      <circle cx={100} cy={75} r={3} fill="#ef4444" />
      {/* Flash / emphasis */}
      <line x1={140} y1={50} x2={150} y2={45} stroke="#fbbf24" strokeWidth="2" />
      <line x1={145} y1={58} x2={155} y2={55} stroke="#fbbf24" strokeWidth="2" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">NOW</text>
    </g>
  ),

  // 284: then — 今ではないあの時点・次の段階
  284: (
    <g>
      {/* Timeline */}
      <line x1={35} y1={80} x2={165} y2={80} stroke="#94a3b8" strokeWidth="2" />
      {/* Now marker (small) */}
      <circle cx={60} cy={80} r={6} fill="#a5b4fc" stroke="#4f46e5" strokeWidth="2" />
      <text x={60} y={72} textAnchor="middle" fontSize="8" fill="#94a3b8">now</text>
      {/* Then marker (highlighted) */}
      <circle cx={140} cy={80} r={8} fill="#fbbf24" stroke="#f59e0b" strokeWidth="2" />
      <text x={140} y={72} textAnchor="middle" fontSize="9" fill="#f59e0b" fontWeight="bold">then</text>
      {/* Arrow from now to then */}
      <path d="M70 80 L128 80" stroke="#4f46e5" strokeWidth="2" strokeDasharray="5 3" markerEnd="url(#arr284)" />
      <defs>
        <marker id="arr284" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#4f46e5" />
        </marker>
      </defs>
      {/* Dots between */}
      <circle cx={85} cy={80} r={2} fill="#cbd5e1" />
      <circle cx={100} cy={80} r={2} fill="#cbd5e1" />
      <circle cx={115} cy={80} r={2} fill="#cbd5e1" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">THEN</text>
    </g>
  ),

  // 285: soon — 今からそう遠くない近い将来
  285: (
    <g>
      {/* Timeline */}
      <line x1={40} y1={80} x2={160} y2={80} stroke="#94a3b8" strokeWidth="2" />
      {/* Now marker */}
      <circle cx={70} cy={80} r={6} fill="#4f46e5" />
      <text x={70} y={72} textAnchor="middle" fontSize="8" fill="#4f46e5">now</text>
      {/* Soon marker (close to now) */}
      <circle cx={110} cy={80} r={8} fill="#34d399" stroke="#059669" strokeWidth="2" />
      <text x={110} y={72} textAnchor="middle" fontSize="9" fill="#059669" fontWeight="bold">soon</text>
      {/* Short arrow */}
      <path d="M78 80 L98 80" stroke="#34d399" strokeWidth="3" markerEnd="url(#arr285)" />
      <defs>
        <marker id="arr285" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#34d399" />
        </marker>
      </defs>
      {/* Hourglass */}
      <polygon points="95,95 105,95 102,105 98,105" fill="#fbbf24" stroke="#f59e0b" strokeWidth="1" />
      <polygon points="98,108 102,108 105,118 95,118" fill="none" stroke="#f59e0b" strokeWidth="1" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">SOON</text>
    </g>
  ),

  // 286: late — 予定の時間より後になっている
  286: (
    <g>
      {/* Clock */}
      <circle cx={100} cy={70} r={28} fill="white" stroke="#ef4444" strokeWidth="3" />
      <line x1={100} y1={70} x2={100} y2={50} stroke="#374151" strokeWidth="2" strokeLinecap="round" />
      <line x1={100} y1={70} x2={118} y2={78} stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
      <circle cx={100} cy={70} r={2} fill="#374151" />
      {/* Running person */}
      <circle cx={150} cy={85} r={7} fill="#4f46e5" />
      <line x1={150} y1={92} x2={147} y2={105} stroke="#4f46e5" strokeWidth="2" />
      <line x1={147} y1={105} x2={142} y2={115} stroke="#4f46e5" strokeWidth="2" />
      <line x1={147} y1={105} x2={155} y2={113} stroke="#4f46e5" strokeWidth="2" />
      {/* Exclamation */}
      <text x={140} y={80} fontSize="14" fill="#ef4444" fontWeight="bold">!</text>
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">LATE</text>
    </g>
  ),

  // 287: early — 予定の時間より前に・朝の早い時間に
  287: (
    <g>
      {/* Sunrise */}
      <circle cx={100} cy={95} r={20} fill="#fbbf24" />
      <line x1={100} y1={70} x2={100} y2={60} stroke="#f59e0b" strokeWidth="2" />
      <line x1={120} y1={78} x2={130} y2={70} stroke="#f59e0b" strokeWidth="2" />
      <line x1={80} y1={78} x2={70} y2={70} stroke="#f59e0b" strokeWidth="2" />
      <line x1={125} y1={92} x2={135} y2={90} stroke="#f59e0b" strokeWidth="2" />
      <line x1={75} y1={92} x2={65} y2={90} stroke="#f59e0b" strokeWidth="2" />
      {/* Horizon */}
      <line x1={40} y1={95} x2={160} y2={95} stroke="#94a3b8" strokeWidth="2" />
      {/* Clock showing early */}
      <circle cx={50} cy={60} r={15} fill="white" stroke="#4f46e5" strokeWidth="2" />
      <line x1={50} y1={60} x2={50} y2={50} stroke="#4f46e5" strokeWidth="2" />
      <line x1={50} y1={60} x2={58} y2={55} stroke="#34d399" strokeWidth="1.5" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">EARLY</text>
    </g>
  ),

  // 288: far — 距離が離れている
  288: (
    <g>
      <Person x={45} y={95} />
      {/* Long dashed line */}
      <line x1={60} y1={100} x2={150} y2={100} stroke="#a5b4fc" strokeWidth="2" strokeDasharray="6 4" />
      {/* Distant object (small) */}
      <rect x={152} y={92} width={12} height={16} rx="2" fill="#fbbf24" opacity="0.5" />
      {/* Double-headed arrow showing distance */}
      <line x1={55} y1={125} x2={155} y2={125} stroke="#4f46e5" strokeWidth="2" />
      <polygon points="55,125 62,121 62,129" fill="#4f46e5" />
      <polygon points="155,125 148,121 148,129" fill="#4f46e5" />
      <text x={105} y={138} textAnchor="middle" fontSize="9" fill="#94a3b8">far</text>
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">FAR</text>
    </g>
  ),

  // 289: near — 距離が近い
  289: (
    <g>
      <Person x={80} y={95} />
      {/* Nearby object */}
      <rect x={112} y={82} width={20} height={20} rx="3" fill="#fbbf24" stroke="#f59e0b" strokeWidth="2" />
      {/* Short arrow */}
      <line x1={95} y1={120} x2={118} y2={120} stroke="#4f46e5" strokeWidth="2" />
      <polygon points="95,120 102,116 102,124" fill="#4f46e5" />
      <polygon points="118,120 111,116 111,124" fill="#4f46e5" />
      <text x={106} y={133} textAnchor="middle" fontSize="9" fill="#34d399">near</text>
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">NEAR</text>
    </g>
  ),

  // 290: well — 良い状態で・うまく
  290: (
    <g>
      <Person x={100} y={90} />
      {/* Thumbs up */}
      <line x1={112} y1={82} x2={125} y2={70} stroke="#4f46e5" strokeWidth="3" strokeLinecap="round" />
      <circle cx={127} cy={67} r={5} fill="#4f46e5" />
      <line x1={127} y1={62} x2={127} y2={56} stroke="#4f46e5" strokeWidth="3" strokeLinecap="round" />
      {/* Sparkles */}
      <circle cx={140} cy={52} r={3} fill="#fbbf24" />
      <circle cx={148} cy={62} r={2} fill="#fbbf24" />
      <circle cx={60} cy={55} r={3} fill="#34d399" />
      <circle cx={68} cy={65} r={2} fill="#34d399" />
      {/* Check */}
      <path d="M55 90 L62 98 L75 82" stroke="#34d399" strokeWidth="2" fill="none" strokeLinecap="round" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">WELL</text>
    </g>
  ),

  // 291: fight — 相手に負けないように力を出す
  291: (
    <g>
      <Person x={65} y={90} />
      <Person x={135} y={90} color="#7c3aed" />
      {/* Clash in middle */}
      <polygon points="100,70 105,75 102,80 107,85 100,82 93,85 98,80 95,75" fill="#fbbf24" />
      {/* Fists */}
      <circle cx={85} cy={82} r={5} fill="#4f46e5" />
      <circle cx={115} cy={82} r={5} fill="#7c3aed" />
      {/* Impact lines */}
      <line x1={90} y1={78} x2={95} y2={75} stroke="#ef4444" strokeWidth="2" />
      <line x1={110} y1={78} x2={105} y2={75} stroke="#ef4444" strokeWidth="2" />
      <line x1={96} y1={88} x2={100} y2={92} stroke="#ef4444" strokeWidth="1.5" />
      <line x1={104} y1={88} x2={100} y2={92} stroke="#ef4444" strokeWidth="1.5" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">FIGHT</text>
    </g>
  ),

  // 292: save — 大切なものを失わないように守る
  292: (
    <g>
      <Person x={100} y={95} />
      {/* Shield */}
      <path d="M100 50 L120 58 L120 78 Q120 92 100 98 Q80 92 80 78 L80 58 Z" fill="#e0e7ff" stroke="#4f46e5" strokeWidth="2" />
      {/* Heart inside shield */}
      <path d="M96 68 C96 63 89 61 89 68 C89 74 96 78 96 78 C96 78 103 74 103 68 C103 61 96 63 96 68" fill="#ef4444" />
      {/* Protected sparkle */}
      <circle cx={65} cy={55} r={3} fill="#fbbf24" />
      <circle cx={135} cy={55} r={3} fill="#fbbf24" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">SAVE</text>
    </g>
  ),

  // 293: spend — 時間やお金を消費する
  293: (
    <g>
      <Person x={70} y={95} />
      {/* Money flying away */}
      <circle cx={100} cy={80} r={8} fill="#fbbf24" stroke="#f59e0b" strokeWidth="1.5" />
      <text x={100} y={84} textAnchor="middle" fontSize="8" fill="#92400e">$</text>
      <circle cx={120} cy={70} r={7} fill="#fbbf24" stroke="#f59e0b" strokeWidth="1.5" opacity="0.7" />
      <text x={120} y={74} textAnchor="middle" fontSize="7" fill="#92400e">$</text>
      <circle cx={138} cy={62} r={6} fill="#fbbf24" stroke="#f59e0b" strokeWidth="1.5" opacity="0.4" />
      <text x={138} y={66} textAnchor="middle" fontSize="6" fill="#92400e">$</text>
      {/* Arrow outward */}
      <path d="M85 85 L95 82" stroke="#94a3b8" strokeWidth="2" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">SPEND</text>
    </g>
  ),

  // 294: share — 一つのものをみんなで使う・分け合う
  294: (
    <g>
      <Person x={60} y={100} />
      <Person x={140} y={100} color="#7c3aed" />
      {/* Pie/circle being shared */}
      <circle cx={100} cy={72} r={18} fill="#fbbf24" stroke="#f59e0b" strokeWidth="2" />
      {/* Dividing line */}
      <line x1={100} y1={54} x2={100} y2={90} stroke="#f59e0b" strokeWidth="2" />
      {/* Hands reaching */}
      <line x1={72} y1={92} x2={85} y2={78} stroke="#4f46e5" strokeWidth="2" strokeLinecap="round" />
      <line x1={128} y1={92} x2={115} y2={78} stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">SHARE</text>
    </g>
  ),

  // 295: join — グループや活動に加わる
  295: (
    <g>
      {/* Group circle */}
      <circle cx={110} cy={80} r={30} fill="none" stroke="#a5b4fc" strokeWidth="2" strokeDasharray="5 3" />
      {/* People in group */}
      <Person x={100} y={80} color="#7c3aed" />
      <Person x={125} y={82} color="#7c3aed" />
      {/* Person joining */}
      <Person x={55} y={88} />
      {/* Arrow joining */}
      <path d="M68 88 L78 85" stroke="#34d399" strokeWidth="3" markerEnd="url(#arr295)" />
      <defs>
        <marker id="arr295" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#34d399" />
        </marker>
      </defs>
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">JOIN</text>
    </g>
  ),

  // 296: visit — 人や場所を訪ねて行く
  296: (
    <g>
      <Person x={55} y={95} />
      {/* House */}
      <polygon points="140,60 115,40 165,40 140,60" fill="#f59e0b" />
      <rect x={122} y={60} width={36} height={30} fill="#e0e7ff" stroke="#4f46e5" strokeWidth="2" />
      <rect x={134} y={70} width={10} height={18} rx="1" fill="#4f46e5" />
      {/* Path/arrow to house */}
      <path d="M72 95 L115 80" stroke="#a5b4fc" strokeWidth="2" strokeDasharray="5 3" markerEnd="url(#arr296)" />
      <defs>
        <marker id="arr296" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="5" markerHeight="5" orient="auto">
          <path d="M 0 0 L 10 5 L 0 10 z" fill="#a5b4fc" />
        </marker>
      </defs>
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">VISIT</text>
    </g>
  ),

  // 297: arrive — 目的地にたどり着く
  297: (
    <g>
      {/* Path traveled */}
      <path d="M35 100 Q60 70 85 90 Q100 100 120 85" fill="none" stroke="#a5b4fc" strokeWidth="2" strokeDasharray="5 3" />
      {/* Person at destination */}
      <Person x={140} y={85} />
      {/* Flag/destination marker */}
      <line x1={145} y1={45} x2={145} y2={57} stroke="#ef4444" strokeWidth="2" />
      <polygon points="145,45 160,50 145,55" fill="#ef4444" />
      {/* Checkmark */}
      <path d="M128 112 L135 120 L150 108" stroke="#34d399" strokeWidth="3" fill="none" strokeLinecap="round" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">ARRIVE</text>
    </g>
  ),

  // 298: return — 元の場所や状態に戻る
  298: (
    <g>
      {/* Home/origin point */}
      <circle cx={60} cy={80} r={18} fill="#e0e7ff" stroke="#4f46e5" strokeWidth="2" />
      <text x={60} y={84} textAnchor="middle" fontSize="10" fill="#4f46e5">A</text>
      {/* Person returning */}
      <Person x={120} y={90} />
      {/* Curved return arrow */}
      <path d="M130 70 Q140 45 100 45 Q65 45 65 60" fill="none" stroke="#4f46e5" strokeWidth="2" strokeDasharray="5 3" markerEnd="url(#arr298)" />
      <defs>
        <marker id="arr298" viewBox="0 0 10 10" refX="5" refY="9" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M 0 0 L 5 10 L 10 0 z" fill="#4f46e5" />
        </marker>
      </defs>
      {/* U-turn symbol */}
      <path d="M108 100 L100 108 L108 116" stroke="#a5b4fc" strokeWidth="2" fill="none" strokeLinecap="round" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">RETURN</text>
    </g>
  ),

  // 299: believe — 本当だと心から思う
  299: (
    <g>
      <Person x={100} y={100} />
      {/* Heart/chest glow */}
      <circle cx={100} cy={90} r={12} fill="#fbbf24" opacity="0.2" />
      {/* Shining star of belief */}
      <polygon points="100,40 103,50 113,50 105,56 108,66 100,60 92,66 95,56 87,50 97,50" fill="#fbbf24" stroke="#f59e0b" strokeWidth="1" />
      {/* Light rays */}
      <line x1={100} y1={30} x2={100} y2={36} stroke="#fbbf24" strokeWidth="2" />
      <line x1={118} y1={38} x2={114} y2={42} stroke="#fbbf24" strokeWidth="2" />
      <line x1={82} y1={38} x2={86} y2={42} stroke="#fbbf24" strokeWidth="2" />
      <line x1={122} y1={52} x2={117} y2={52} stroke="#fbbf24" strokeWidth="2" />
      <line x1={78} y1={52} x2={83} y2={52} stroke="#fbbf24" strokeWidth="2" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">BELIEVE</text>
    </g>
  ),

  // 300: promise — 必ずそうすると言葉で誓う
  300: (
    <g>
      <Person x={70} y={100} />
      <Person x={130} y={100} color="#7c3aed" />
      {/* Handshake */}
      <line x1={82} y1={92} x2={98} y2={88} stroke="#4f46e5" strokeWidth="3" strokeLinecap="round" />
      <line x1={118} y1={92} x2={102} y2={88} stroke="#7c3aed" strokeWidth="3" strokeLinecap="round" />
      <circle cx={100} cy={88} r={5} fill="#fbbf24" />
      {/* Speech bubble with pinky promise */}
      <ellipse cx={100} cy={55} rx={28} ry={16} fill="white" stroke="#a5b4fc" strokeWidth="2" />
      <polygon points="95,71 100,68 105,71" fill="white" stroke="#a5b4fc" strokeWidth="1.5" />
      <rect x={94} y={67} width={12} height={5} fill="white" />
      {/* Checkmark in bubble */}
      <path d="M90 55 L96 62 L112 48" stroke="#34d399" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <text x={100} y={160} textAnchor="middle" fontSize="14" fill="#6366f1" fontWeight="bold">PROMISE</text>
    </g>
  ),

};
