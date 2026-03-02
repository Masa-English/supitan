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
};
