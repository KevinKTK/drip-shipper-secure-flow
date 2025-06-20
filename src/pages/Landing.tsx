
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Anchor, Waves, Shield } from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F4F1E8] maritime-background relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-20 left-20 w-2 h-2 bg-[#D4AF37] rounded-full animate-pulse opacity-60"></div>
        <div className="absolute top-40 right-32 w-1 h-1 bg-[#1B365D] rounded-full animate-pulse opacity-40"></div>
        <div className="absolute bottom-32 left-1/4 w-1.5 h-1.5 bg-[#D4AF37] rounded-full animate-pulse opacity-50"></div>
        <div className="absolute bottom-20 right-20 w-2 h-2 bg-[#1B365D] rounded-full animate-pulse opacity-30"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen text-center px-6">
        {/* Animated Logo Section */}
        <div className="relative mb-12">
          {/* Rotating Sonar Rings */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-64 h-64 border-2 border-dashed border-[#1B365D]/30 rounded-full animate-spin opacity-30" style={{animationDuration: '20s'}}></div>
            <div className="absolute w-48 h-48 border border-dashed border-[#D4AF37] rounded-full animate-spin opacity-40" style={{animationDuration: '15s', animationDirection: 'reverse'}}></div>
            <div className="absolute w-32 h-32 border border-dashed border-[#1B365D]/40 rounded-full animate-spin opacity-20" style={{animationDuration: '10s'}}></div>
          </div>
          
          {/* Central Ship's Wheel */}
          <div className="relative w-32 h-32 bg-gradient-to-br from-[#D4AF37] to-[#B8860B] rounded-full flex items-center justify-center shadow-lg animate-pulse border-4 border-[#1B365D]">
            <div className="w-20 h-20 border-4 border-[#1B365D] rounded-full flex items-center justify-center">
              <Anchor className="w-8 h-8 text-[#1B365D]" />
            </div>
            {/* Wheel Spokes */}
            {[...Array(8)].map((_, i) => (
              <div
                key={i}
                className="absolute w-0.5 h-8 bg-[#1B365D] transform -translate-y-4"
                style={{
                  transform: `rotate(${i * 45}deg) translateY(-2rem)`,
                  transformOrigin: 'bottom center'
                }}
              />
            ))}
          </div>
        </div>

        {/* Brand Name */}
        <h1 className="text-6xl font-serif font-medium text-[#1B365D] mb-4 tracking-wider">
          Drip<span className="text-[#D4AF37]">Shippa</span>
        </h1>

        {/* Animated Tagline */}
        <div className="h-16 mb-12">
          <p className="text-xl text-[#8B755D] font-serif animate-pulse font-light">
            Decentralized Shipping. Parametric Protection.
          </p>
        </div>

        {/* Feature Icons */}
        <div className="flex space-x-8 mb-12">
          <div className="flex flex-col items-center text-[#1B365D]">
            <div className="w-16 h-16 bg-[#1B365D] rounded-full flex items-center justify-center mb-2 hover:bg-[#D4AF37] hover:text-[#1B365D] transition-all duration-300">
              <Waves className="w-8 h-8" />
            </div>
            <span className="text-sm font-serif">NFT Orders</span>
          </div>
          <div className="flex flex-col items-center text-[#1B365D]">
            <div className="w-16 h-16 bg-[#1B365D] rounded-full flex items-center justify-center mb-2 hover:bg-[#D4AF37] hover:text-[#1B365D] transition-all duration-300">
              <Shield className="w-8 h-8" />
            </div>
            <span className="text-sm font-serif">Smart Insurance</span>
          </div>
        </div>

        {/* CTA Button */}
        <Button
          onClick={() => navigate('/marketplace')}
          className="golden-button font-serif font-medium py-4 px-8 text-lg rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
        >
          Enter Marketplace
        </Button>

        {/* Subtle footer text */}
        <p className="text-[#8B755D] text-sm mt-12 font-serif font-light">
          Built on ink! blockchain • Powered by parametric smart contracts
        </p>
      </div>
    </div>
  );
};

export default Landing;
