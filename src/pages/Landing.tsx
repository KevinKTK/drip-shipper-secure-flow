
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Anchor, Waves, Shield } from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A192F] via-[#1D566E] to-[#0A2E36] relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-2 h-2 bg-[#FFD700] rounded-full animate-pulse opacity-60"></div>
        <div className="absolute top-40 right-32 w-1 h-1 bg-white rounded-full animate-pulse opacity-40"></div>
        <div className="absolute bottom-32 left-1/4 w-1.5 h-1.5 bg-[#FFD700] rounded-full animate-pulse opacity-50"></div>
        <div className="absolute bottom-20 right-20 w-2 h-2 bg-white rounded-full animate-pulse opacity-30"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen text-center px-6">
        {/* Animated Logo Section */}
        <div className="relative mb-12">
          {/* Rotating Sonar Rings */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-64 h-64 border-2 border-dashed border-[#3C5B6F] rounded-full animate-spin opacity-30" style={{animationDuration: '20s'}}></div>
            <div className="absolute w-48 h-48 border border-dashed border-[#FFD700] rounded-full animate-spin opacity-40" style={{animationDuration: '15s', animationDirection: 'reverse'}}></div>
            <div className="absolute w-32 h-32 border border-dashed border-white rounded-full animate-spin opacity-20" style={{animationDuration: '10s'}}></div>
          </div>
          
          {/* Central Ship's Wheel */}
          <div className="relative w-32 h-32 bg-gradient-to-br from-[#FFD700] to-[#B8860B] rounded-full flex items-center justify-center shadow-lg animate-pulse border-4 border-[#3C5B6F]">
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
        <h1 className="text-6xl font-serif font-bold text-white mb-4 tracking-wider">
          Drip<span className="text-[#FFD700]">Shippa</span>
        </h1>

        {/* Animated Tagline */}
        <div className="h-16 mb-12">
          <p className="text-xl text-[#3C5B6F] font-serif animate-pulse">
            Decentralized Shipping. Parametric Protection.
          </p>
        </div>

        {/* Feature Icons */}
        <div className="flex space-x-8 mb-12">
          <div className="flex flex-col items-center text-white">
            <div className="w-16 h-16 bg-[#3C5B6F] rounded-full flex items-center justify-center mb-2 hover:bg-[#FFD700] hover:text-[#0A192F] transition-all duration-300">
              <Waves className="w-8 h-8" />
            </div>
            <span className="text-sm font-sans">NFT Orders</span>
          </div>
          <div className="flex flex-col items-center text-white">
            <div className="w-16 h-16 bg-[#3C5B6F] rounded-full flex items-center justify-center mb-2 hover:bg-[#FFD700] hover:text-[#0A192F] transition-all duration-300">
              <Shield className="w-8 h-8" />
            </div>
            <span className="text-sm font-sans">Smart Insurance</span>
          </div>
        </div>

        {/* CTA Button */}
        <Button
          onClick={() => navigate('/marketplace')}
          className="bg-gradient-to-r from-[#FFD700] to-[#B8860B] hover:from-[#B8860B] hover:to-[#FFD700] text-[#0A192F] font-bold py-4 px-8 text-lg rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
        >
          Enter Marketplace
        </Button>

        {/* Subtle footer text */}
        <p className="text-[#3C5B6F] text-sm mt-12 font-sans">
          Built on ink! blockchain • Powered by parametric smart contracts
        </p>
      </div>
    </div>
  );
};

export default Landing;
