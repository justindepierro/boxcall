/**
 * FormationIcon - SVG icons for offensive formations
 * 
 * Features:
 * - Visual representation of player positions
 * - Consistent sizing (48x48px)
 * - Accessible with proper labels
 */

interface FormationIconProps {
  type: "spread2x2" | "spread3x1Right" | "spread3x1Left" | "pro" | "pistol" | "trips";
  size?: number;
  className?: string;
}

export function FormationIcon({ type, size = 48, className = "" }: FormationIconProps) {
  const viewBox = "0 0 48 48";

  // Offense players are blue circles
  const offensePlayer = (x: number, y: number, key: string) => (
    <circle key={key} cx={x} cy={y} r="2.5" fill="#3B82F6" stroke="#1E40AF" strokeWidth="0.5" />
  );

  // Line of scrimmage
  const los = (
    <line x1="4" y1="24" x2="44" y2="24" stroke="#666" strokeWidth="0.5" strokeDasharray="1,1" />
  );

  const formations = {
    spread2x2: (
      <>
        {los}
        {/* QB in shotgun */}
        {offensePlayer(24, 16, "qb")}
        {/* O-Line (5 players) */}
        {offensePlayer(20, 25, "og1")}
        {offensePlayer(22, 25, "c")}
        {offensePlayer(24, 25, "c-mid")}
        {offensePlayer(26, 25, "og2")}
        {offensePlayer(28, 25, "ot")}
        {/* WR Left (2) */}
        {offensePlayer(8, 20, "wr1")}
        {offensePlayer(14, 20, "wr2")}
        {/* WR Right (2) */}
        {offensePlayer(34, 20, "wr3")}
        {offensePlayer(40, 20, "wr4")}
        {/* RB */}
        {offensePlayer(24, 12, "rb")}
      </>
    ),
    spread3x1Right: (
      <>
        {los}
        {/* QB in shotgun */}
        {offensePlayer(24, 16, "qb")}
        {/* O-Line (5 players) */}
        {offensePlayer(20, 25, "og1")}
        {offensePlayer(22, 25, "c")}
        {offensePlayer(24, 25, "c-mid")}
        {offensePlayer(26, 25, "og2")}
        {offensePlayer(28, 25, "ot")}
        {/* WR Left (1) */}
        {offensePlayer(8, 20, "wr1")}
        {/* WR Right (3) */}
        {offensePlayer(32, 20, "wr2")}
        {offensePlayer(37, 20, "wr3")}
        {offensePlayer(42, 20, "wr4")}
        {/* RB */}
        {offensePlayer(24, 12, "rb")}
      </>
    ),
    spread3x1Left: (
      <>
        {los}
        {/* QB in shotgun */}
        {offensePlayer(24, 16, "qb")}
        {/* O-Line (5 players) */}
        {offensePlayer(20, 25, "og1")}
        {offensePlayer(22, 25, "c")}
        {offensePlayer(24, 25, "c-mid")}
        {offensePlayer(26, 25, "og2")}
        {offensePlayer(28, 25, "ot")}
        {/* WR Left (3) */}
        {offensePlayer(6, 20, "wr1")}
        {offensePlayer(11, 20, "wr2")}
        {offensePlayer(16, 20, "wr3")}
        {/* WR Right (1) */}
        {offensePlayer(40, 20, "wr4")}
        {/* RB */}
        {offensePlayer(24, 12, "rb")}
      </>
    ),
    pro: (
      <>
        {los}
        {/* QB under center */}
        {offensePlayer(24, 22, "qb")}
        {/* O-Line (5 players) */}
        {offensePlayer(20, 25, "og1")}
        {offensePlayer(22, 25, "c")}
        {offensePlayer(24, 25, "c-mid")}
        {offensePlayer(26, 25, "og2")}
        {offensePlayer(28, 25, "ot")}
        {/* WR Left (1) */}
        {offensePlayer(10, 20, "wr1")}
        {/* WR Right (1) */}
        {offensePlayer(38, 20, "wr2")}
        {/* TE */}
        {offensePlayer(30, 25, "te")}
        {/* RB */}
        {offensePlayer(24, 18, "rb")}
        {/* FB */}
        {offensePlayer(24, 20, "fb")}
      </>
    ),
    pistol: (
      <>
        {los}
        {/* QB in pistol (closer to line) */}
        {offensePlayer(24, 20, "qb")}
        {/* O-Line (5 players) */}
        {offensePlayer(20, 25, "og1")}
        {offensePlayer(22, 25, "c")}
        {offensePlayer(24, 25, "c-mid")}
        {offensePlayer(26, 25, "og2")}
        {offensePlayer(28, 25, "ot")}
        {/* WR Left (2) */}
        {offensePlayer(8, 20, "wr1")}
        {offensePlayer(14, 20, "wr2")}
        {/* WR Right (2) */}
        {offensePlayer(34, 20, "wr3")}
        {offensePlayer(40, 20, "wr4")}
        {/* RB */}
        {offensePlayer(24, 16, "rb")}
      </>
    ),
    trips: (
      <>
        {los}
        {/* QB in shotgun */}
        {offensePlayer(24, 16, "qb")}
        {/* O-Line (5 players) */}
        {offensePlayer(20, 25, "og1")}
        {offensePlayer(22, 25, "c")}
        {offensePlayer(24, 25, "c-mid")}
        {offensePlayer(26, 25, "og2")}
        {offensePlayer(28, 25, "ot")}
        {/* WR Right (3 - Trips) */}
        {offensePlayer(32, 18, "wr1")}
        {offensePlayer(36, 18, "wr2")}
        {offensePlayer(40, 18, "wr3")}
        {/* WR Left (1) */}
        {offensePlayer(8, 20, "wr4")}
        {/* RB */}
        {offensePlayer(24, 12, "rb")}
      </>
    ),
  };

  return (
    <svg
      width={size}
      height={size}
      viewBox={viewBox}
      className={className}
      role="img"
      aria-label={`${type} formation`}
    >
      {/* Field background */}
      <rect width="48" height="48" fill="#059669" opacity="0.1" rx="4" />
      {formations[type]}
    </svg>
  );
}
