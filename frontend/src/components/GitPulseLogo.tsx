"use client";

interface GitPulseLogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
}

export function GitPulseLogo({
  className = "",
  size = 30,
  showText = false,
}: GitPulseLogoProps) {
  return (
    <div className={`flex items-center gap-2.5 select-none ${className}`}>
      <div
        style={{ width: size, height: size }}
        className="relative flex items-center justify-center shrink-0 border border-white/[0.18] bg-white/[0.04] text-white hover:border-white/40 transition-colors"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-[72%] h-[72%]"
        >
          {/* Distributed Git Commit Nodes */}
          <circle cx="4" cy="12" r="1.75" fill="currentColor" />
          <circle cx="20" cy="12" r="1.75" fill="currentColor" />
          
          {/* Precision Architectural Pulse Vector */}
          <path
            d="M5.75 12H9.25L11.25 5.5L13.75 18.5L15.75 12H18.25"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Precision Apex Anchor */}
          <circle cx="11.25" cy="5.5" r="1" fill="currentColor" opacity="0.8" />
        </svg>
      </div>

      {showText && (
        <div className="flex items-baseline gap-1.5 font-mono">
          <span className="font-bold text-sm tracking-tight text-white">GITPULSE</span>
          <span className="text-[10px] text-zinc-500 font-normal">/ 1.1</span>
        </div>
      )}
    </div>
  );
}
