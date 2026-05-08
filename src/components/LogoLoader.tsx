"use client";

export default function LogoLoader() {
  return (
    <div className="flex flex-col items-center justify-center gap-6 animate-in fade-in duration-700">
      <div className="relative flex items-center justify-center">
        {/* Advanced Atmospheric Outer Rings */}
        <div className="absolute w-24 h-24 border border-[#5f7161]/5 rounded-full" />
        <div className="absolute w-20 h-20 border border-[#5f7161]/10 rounded-full animate-[spin_3s_linear_infinite]" />
        
        {/* Primary Minimal Spin */}
        <div className="w-16 h-16 border-2 border-[#5f7161]/5 rounded-full" />
        <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-[#5f7161] rounded-full animate-spin shadow-[0_0_15px_rgba(95,113,97,0.2)]" />
        
        {/* Core Logo Node - Scaled for Maximum Clarity */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-11 h-11 bg-white rounded-full flex items-center justify-center overflow-hidden p-2.5 shadow-xl border border-[#f1f1ee] group">
            <img 
              src="/logo.png" 
              alt="AKOD" 
              className="w-full h-full object-contain transition-transform duration-1000 group-hover:scale-110" 
            />
          </div>
        </div>
      </div>
      
      <div className="flex flex-col items-center gap-2 text-center">
        <div className="space-y-1">
          <h3 className="text-[10px] font-bold text-[#4a554b] uppercase tracking-[0.2em]">Please Wait</h3>
          <p className="text-[8px] font-medium text-[#8b968c] uppercase tracking-[0.3em] flex items-center justify-center gap-2">
            Loading <span className="inline-flex gap-1">
              <span className="w-1 h-1 bg-[#5f7161] rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
              <span className="w-1 h-1 bg-[#5f7161] rounded-full animate-pulse" style={{ animationDelay: '200ms' }} />
              <span className="w-1 h-1 bg-[#5f7161] rounded-full animate-pulse" style={{ animationDelay: '400ms' }} />
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}
