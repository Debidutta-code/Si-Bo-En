const BADGE_VARIANTS: Record<number, string> = {
  1: "bg-green-100 text-green-800 border-green-200",
  2: "bg-yellow-100 text-yellow-800 border-yellow-200",
  3: "bg-orange-100 text-orange-800 border-orange-200",
  4: "bg-red-100 text-red-800 border-red-200",
  5: "bg-pink-100 text-pink-800 border-pink-200",
  6: "bg-purple-100 text-purple-800 border-purple-200",
  7: "bg-gradient-to-r from-slate-800 to-black text-white border-slate-700 shadow-md",
};

const DefaultBadge = "bg-gray-100 text-gray-800 border-gray-200";

const Badge = ({ level }: { level: number }) => {
  const styleLevel = Math.max(1, Math.min(level, 7));
  const badgeStyle = BADGE_VARIANTS[styleLevel] || DefaultBadge;

  return (
    <span 
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-bold uppercase tracking-wide rounded-full border shadow-sm transition-transform duration-200 hover:scale-105 cursor-default ${badgeStyle}`}
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width="14" 
        height="14" 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2.5" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        // Ensure the icon scales nicely if it's on the dark max-level background
        className={styleLevel === 7 ? "text-yellow-400" : ""} 
      >
        <path d="M3.85 8.62a4 4 0 0 1 4.78-4.77 4 4 0 0 1 6.74 0 4 4 0 0 1 4.78 4.78 4 4 0 0 1 0 6.74 4 4 0 0 1-4.77 4.78 4 4 0 0 1-6.75 0 4 4 0 0 1-4.78-4.77 4 4 0 0 1 0-6.76Z"/>
        <path d="m9 12 2 2 4-4"/>
      </svg>
      
      Level {level}
    </span>
  );
};

export default Badge;