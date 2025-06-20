
import React from 'react';
import { cn } from "@/lib/utils";

interface MaritimeSkeletonProps {
  className?: string;
}

function MaritimeSkeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("maritime-shimmer rounded-md", className)}
      {...props}
    />
  )
}

function SkeletonOrderCard() {
  return (
    <div className="skeleton-card maritime-card rounded-lg p-6">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-2">
          <MaritimeSkeleton className="w-5 h-5 rounded" />
          <MaritimeSkeleton className="h-6 w-32 rounded" />
        </div>
        <MaritimeSkeleton className="h-6 w-16 rounded-full" />
      </div>

      {/* Route */}
      <div className="flex items-center gap-2 mb-3">
        <MaritimeSkeleton className="w-4 h-4 rounded" />
        <MaritimeSkeleton className="h-4 w-40 rounded" />
      </div>
      
      {/* Date */}
      <div className="flex items-center gap-2 mb-3">
        <MaritimeSkeleton className="w-4 h-4 rounded" />
        <MaritimeSkeleton className="h-4 w-32 rounded" />
      </div>

      {/* Badge */}
      <MaritimeSkeleton className="h-6 w-20 rounded-full mb-4" />

      {/* Footer */}
      <div className="flex justify-between items-center pt-3 border-t border-[#CCD6F6]/20">
        <div className="flex items-center gap-1">
          <MaritimeSkeleton className="w-4 h-4 rounded" />
          <MaritimeSkeleton className="h-5 w-16 rounded" />
        </div>
        <MaritimeSkeleton className="h-4 w-12 rounded" />
      </div>

      {/* Button */}
      <MaritimeSkeleton className="w-full h-10 rounded mt-4" />
    </div>
  );
}

function SonarLoader() {
  return (
    <div className="fixed inset-0 bg-[#0A192F] flex items-center justify-center z-50">
      <div className="relative">
        {/* Ship's Wheel with Sonar Pulse */}
        <div className="sonar-pulse w-32 h-32 bg-gradient-to-br from-[#D4AF37] to-[#B8860B] rounded-full flex items-center justify-center shadow-lg border-4 border-[#0A192F]">
          <div className="w-20 h-20 border-4 border-[#0A192F] rounded-full flex items-center justify-center">
            <div className="w-8 h-8 text-[#0A192F]">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
          </div>
          {/* Wheel Spokes */}
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute w-0.5 h-8 bg-[#0A192F] transform -translate-y-4"
              style={{
                transform: `rotate(${i * 45}deg) translateY(-2rem)`,
                transformOrigin: 'bottom center'
              }}
            />
          ))}
        </div>
        
        {/* Loading Text */}
        <div className="text-center mt-8">
          <p className="text-[#CCD6F6] font-serif text-lg animate-pulse">
            Scanning Maritime Networks...
          </p>
        </div>
      </div>
    </div>
  );
}

export { MaritimeSkeleton, SkeletonOrderCard, SonarLoader };
