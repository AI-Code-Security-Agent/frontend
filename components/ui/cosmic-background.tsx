import React from 'react';

interface CosmicBackgroundProps {
  children: React.ReactNode;
  className?: string;
}

export const CosmicBackground: React.FC<CosmicBackgroundProps> = ({ 
  children, 
  className = "" 
}) => {
  return (
    <div className={`min-h-screen min-w-full bg-background relative overflow-hidden ${className}`}>
      {/* Animated Background */}
      <div className="absolute inset-0 cosmic-background">
        {/* Main gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-white via-blue-50/30 to-purple-50/20 dark:from-black dark:via-purple-950/30 dark:to-black"></div>
        
        {/* Animated nebula clouds */}
        <div className="absolute inset-0 opacity-20 dark:opacity-50">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gradient-radial from-blue-200/30 via-purple-100/20 to-transparent rounded-full blur-3xl animate-float-slow"></div>
          <div className="absolute top-3/4 right-1/4 w-80 h-80 bg-gradient-radial from-pink-200/30 via-purple-100/20 to-transparent rounded-full blur-3xl animate-float-reverse"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-radial from-purple-100/20 via-blue-100/10 to-transparent rounded-full blur-3xl animate-pulse-slow"></div>
        </div>

        {/* Main planet */}
        <div className="absolute bottom-0 right-0 transform translate-x-1/3 translate-y-1/3">
          <div className="relative w-[800px] h-[800px] md:w-[1000px] md:h-[1000px]">
            {/* Planet body */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-gray-100 via-gray-200 to-gray-300 dark:from-slate-800 dark:via-slate-900 dark:to-black opacity-60 dark:opacity-80 shadow-lg dark:shadow-2xl"></div>
            {/* Planet atmosphere glow */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-200/30 via-purple-200/20 to-pink-200/30 dark:from-blue-500/20 dark:via-purple-500/10 dark:to-pink-500/20 blur-xl scale-110"></div>
            {/* Planet surface details */}
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-transparent via-gray-300/20 dark:via-slate-600/30 to-transparent opacity-30 dark:opacity-50"></div>
          </div>
        </div>

        {/* Smaller planets */}
        <div className="absolute top-1/4 left-0 transform -translate-x-1/2">
          <div className="w-32 h-32 md:w-48 md:h-48 rounded-full bg-gradient-to-br from-blue-200/60 via-blue-300/50 to-blue-400/60 dark:from-blue-500/50 dark:via-blue-600/40 dark:to-blue-700/50 shadow-sm dark:shadow-lg animate-float"></div>
        </div>

        <div className="absolute top-3/4 left-1/4 transform -translate-y-1/2">
          <div className="w-20 h-20 md:w-28 md:h-28 rounded-full bg-gradient-to-br from-pink-200/70 via-purple-300/60 to-pink-300/70 dark:from-pink-500/60 dark:via-purple-600/50 dark:to-pink-700/60 shadow-sm dark:shadow-lg animate-float-reverse"></div>
        </div>

        {/* Stars */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/3 w-1 h-1 bg-gray-400 dark:bg-white rounded-full animate-twinkle"></div>
          <div className="absolute top-1/3 right-1/4 w-1 h-1 bg-blue-300 dark:bg-blue-200 rounded-full animate-twinkle-delay"></div>
          <div className="absolute top-2/3 left-1/5 w-0.5 h-0.5 bg-purple-300 dark:bg-purple-200 rounded-full animate-twinkle"></div>
          <div className="absolute top-1/5 right-1/3 w-1 h-1 bg-pink-300 dark:bg-pink-200 rounded-full animate-twinkle-delay"></div>
          <div className="absolute bottom-1/4 left-2/3 w-0.5 h-0.5 bg-gray-400 dark:bg-white rounded-full animate-twinkle"></div>
          <div className="absolute top-1/2 left-1/6 w-1 h-1 bg-blue-400 dark:bg-blue-100 rounded-full animate-twinkle-delay"></div>
          <div className="absolute bottom-1/3 right-1/5 w-0.5 h-0.5 bg-purple-400 dark:bg-purple-100 rounded-full animate-twinkle"></div>
          <div className="absolute top-3/4 right-2/3 w-1 h-1 bg-pink-400 dark:bg-pink-100 rounded-full animate-twinkle-delay"></div>
        </div>

        {/* Orbital rings */}
        <div className="absolute bottom-0 right-0 transform translate-x-1/3 translate-y-1/3">
          <div className="absolute inset-0 w-[900px] h-[900px] md:w-[1100px] md:h-[1100px] border border-gray-200/40 dark:border-white/10 rounded-full animate-spin-slow"></div>
          <div className="absolute inset-0 w-[950px] h-[950px] md:w-[1150px] md:h-[1150px] border border-purple-300/30 dark:border-purple-400/20 rounded-full animate-spin-reverse"></div>
        </div>
      </div>

      {/* Content overlay */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
};