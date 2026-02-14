
import React from 'react';

interface LoaderProps {
  message: string;
}

export const Loader: React.FC<LoaderProps> = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center py-20 px-8 bg-secondary-bg rounded-lg border border-border-dark text-center max-w-2xl mx-auto">
      <style>{`
          @keyframes progress-bar-indeterminate {
              0% { transform: translateX(-100%) scaleX(0.1); }
              50% { transform: translateX(0) scaleX(0.8); }
              100% { transform: translateX(100%) scaleX(0.1); }
          }
          .animate-progress-bar {
              animation: progress-bar-indeterminate 2s infinite ease-in-out;
          }
      `}</style>
      <div className="relative w-40 h-40 mb-8 flex items-center justify-center">
        {/* Stylized File Icon */}
        <div className="relative w-32 h-40 bg-primary-bg border-2 border-border-dark rounded-lg shadow-lg overflow-hidden">
          
          {/* Abstract data lines inside the file */}
          <div className="absolute top-8 left-4 right-4 space-y-3">
            <div className="h-2 bg-border-dark/60 rounded-full w-5/6"></div>
            <div className="h-2 bg-border-dark/60 rounded-full"></div>
            <div className="h-2 bg-border-dark/60 rounded-full w-3/4"></div>
            <div className="h-2 bg-border-dark/60 rounded-full w-4/6"></div>
          </div>
          
          {/* The animated scanner line */}
          <div className="absolute left-0 right-0 h-1.5 bg-accent-primary/80 animate-scan-beam rounded-full"></div>
        </div>
      </div>
      
      <p className="text-xl font-semibold text-text-heading max-w-lg font-mono tracking-wide">{message}</p>
      
      <div className="w-64 h-1.5 bg-border-dark rounded-full mt-6 overflow-hidden">
        <div className="h-full w-full bg-accent-primary animate-progress-bar origin-left"></div>
      </div>
      
      <p className="text-sm text-text-muted-2 mt-8 max-w-md text-center">
        Please wait, this may take a moment. Complex emails require a more in-depth analysis which can extend processing time.
      </p>
    </div>
  );
};
