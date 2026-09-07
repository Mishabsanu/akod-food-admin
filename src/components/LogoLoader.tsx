"use client";

import React from 'react';

interface LogoLoaderProps {
  text?: string;
  subtext?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fullscreen?: boolean;
  className?: string;
}

export default function LogoLoader({ 
  text = "Loading...", 
  subtext,
  size = 'md',
  fullscreen = false,
  className = ""
}: LogoLoaderProps) {
  const sizeMap = {
    sm: { container: 'w-9 h-9', logo: 'w-5 h-5', ring: 'w-12 h-12', text: 'text-[11px]' },
    md: { container: 'w-13 h-13', logo: 'w-8 h-8', ring: 'w-18 h-18', text: 'text-xs' },
    lg: { container: 'w-16 h-16', logo: 'w-10 h-10', ring: 'w-24 h-24', text: 'text-sm' },
    xl: { container: 'w-20 h-20', logo: 'w-12 h-12', ring: 'w-30 h-30', text: 'text-base' }
  };

  const current = sizeMap[size];

  const content = (
    <div className={`flex flex-col items-center justify-center gap-3.5 py-6 animate-in fade-in duration-300 ${className}`}>
      <div className="relative flex items-center justify-center">
        {/* Ambient Glow Pulse */}
        <div className={`absolute ${current.ring} rounded-full bg-[#546b5a]/15 blur-xl animate-pulse pointer-events-none`} />

        {/* Outer Orbital Orbit Ring with Brand Gradient Accent */}
        <div 
          className={`absolute ${current.ring} rounded-full border-2 border-slate-200 border-t-[#546b5a] border-r-[#f59e0b] animate-spin`} 
          style={{ animationDuration: '1.2s' }}
        />

        {/* Inner Counter-Rotation Dashed Ring */}
        <div 
          className={`absolute ${current.ring} scale-90 rounded-full border border-dashed border-[#546b5a]/30 animate-spin`} 
          style={{ animationDuration: '3s', animationDirection: 'reverse' }}
        />
        
        {/* Center High-Gloss Logo Badge */}
        <div className={`${current.container} rounded-2xl bg-white/95 backdrop-blur-sm border border-slate-200/90 shadow-md flex items-center justify-center p-2 relative z-10`}>
          <img 
            src="/logo.png" 
            alt="AKOD" 
            className={`${current.logo} object-contain select-none`} 
          />
        </div>
      </div>

      {(text || subtext) && (
        <div className="text-center space-y-1">
          {text && (
            <div className="flex items-center justify-center gap-1.5">
              <span className={`${current.text} font-bold text-slate-800 tracking-tight`}>
                {text}
              </span>
              <span className="flex items-center gap-0.5 mt-0.5">
                <span className="w-1 h-1 rounded-full bg-[#546b5a] animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1 h-1 rounded-full bg-[#546b5a] animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1 h-1 rounded-full bg-[#f59e0b] animate-bounce" style={{ animationDelay: '300ms' }} />
              </span>
            </div>
          )}
          {subtext && (
            <p className="text-[10px] text-slate-400 font-medium tracking-wide">
              {subtext}
            </p>
          )}
        </div>
      )}
    </div>
  );

  if (fullscreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/20 backdrop-blur-sm">
        <div className="bg-white/95 backdrop-blur-md p-8 rounded-2xl border border-slate-200/80 shadow-2xl">
          {content}
        </div>
      </div>
    );
  }

  return content;
}
