
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Anchor, Waves, Shield } from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0A192F] maritime-background relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-20 left-20 w-2 h-2 bg-[#D4AF37] rounded-full animate-pulse opacity-80"></div>
        <div className="absolute top-40 right-32 w-1 h-1 bg-[#64FFDA] rounded-full animate-pulse opacity-60"></div>
        <div className="absolute bottom-32 left-1/4 w-1.5 h-1.5 bg-[#D4AF37] rounded-full animate-pulse opacity-70"></div>
        <div className="absolute bottom-20 right-20 w-2 h-2 bg-[#CCD6F6] rounded-full animate-pulse opacity-50"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen text-center px-6">
        {/* Animated Logo Section */}
        <div className="relative mb-12 page-enter">
          {/* Rotating Sonar Rings */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-64 h-64 border-2 border-dashed border-[#CCD6F6]/20 rounded-full animate-spin opacity-40" style={{animationDuration: '20s'}}></div>
            <div className="absolute w-48 h-48 border border-dashed border-[#D4AF37] rounded-full animate-spin opacity-60" style={{animationDuration: '15s', animationDirection: 'reverse'}}></div>
            <div className="absolute w-32 h-32 border border-dashed border-[#64FFDA]/40 rounded-full animate-spin opacity-30" style={{animationDuration: '10s'}}></div>
          </div>
          
          {/* Central Ship's Wheel with Sonar Effect */}
          <div className="sonar-pulse w-32 h-32 bg-gradient-to-br from-[#D4AF37] to-[#B8860B] rounded-full flex items-center justify-center shadow-lg animate-pulse border-4 border-[#0A192F]">
            <div className="w-20 h-20 border-4 border-[#0A192F] rounded-full flex items-center justify-center">
              <Anchor className="w-8 h-8 text-[#0A192F]" />
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
        </div>

        {/* Brand Name */}
        <div className="page-enter" style={{ animationDelay: '0.2s' }}>
          <h1 className="text-6xl font-serif font-medium text-[#FFFFFF] mb-4 tracking-wider">
            Drip<span className="text-[#D4AF37]">Shippa</span>
          </h1>
        </div>

        {/* Animated Tagline */}
        <div className="h-16 mb-12 page-enter" style={{ animationDelay: '0.4s' }}>
          <p className="text-xl text-[#CCD6F6] font-serif animate-pulse font-light">
            Decentralized Shipping. Parametric Protection.
          </p>
        </div>

        {/* Feature Icons */}
        <div className="flex space-x-8 mb-12 page-enter" style={{ animationDelay: '0.6s' }}>
          <div className="flex flex-col items-center text-[#CCD6F6]">
            <div className="maritime-glow w-16 h-16 bg-[#1E3A5F] rounded-full flex items-center justify-center mb-2 border border-[#D4AF37]/30">
              <Waves className="w-8 h-8" />
            </div>
            <span className="text-sm font-serif">NFT Orders</span>
          </div>
          <div className="flex flex-col items-center text-[#CCD6F6]">
            <div className="maritime-glow w-16 h-16 bg-[#1E3A5F] rounded-full flex items-center justify-center mb-2 border border-[#D4AF37]/30">
              <Shield className="w-8 h-8" />
            </div>
            <span className="text-sm font-serif">Smart Insurance</span>
          </div>
        </div>

        {/* CTA Button */}
        <div className="page-enter" style={{ animationDelay: '0.8s' }}>
          <Button
            onClick={() => navigate('/marketplace')}
            className="golden-button maritime-button font-serif font-medium py-4 px-8 text-lg rounded-lg shadow-lg"
          >
            Enter Marketplace
          </Button>
        </div>

        {/* Subtle footer text */}
        <div className="page-enter" style={{ animationDelay: '1.0s' }}>
          <p className="text-[#CCD6F6] text-sm mt-12 font-serif font-light opacity-70">
            Built on ink! blockchain • Powered by parametric smart contracts
          </p>
        </div>
      </div>
    </div>
  );
};

export default Landing;
