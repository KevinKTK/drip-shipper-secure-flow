
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Anchor } from 'lucide-react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAuth } from '@/contexts/AuthContext';

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isConnected } = useAuth();

  const navItems = [
    { path: '/marketplace', label: 'Marketplace' },
    { path: '/shipping', label: 'Shipping' },
    { path: '/contract-builder', label: 'Build Policy' },
    { path: '/portfolio', label: 'My Portfolio' },
  ];

  return (
    <nav className="bg-[#0A192F] border-b border-[#D4AF37]/20 sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <button
            onClick={() => navigate('/')}
            className="maritime-nav-glow flex items-center space-x-2 text-[#FFFFFF] hover:text-[#D4AF37] transition-colors rounded-lg px-2 py-1"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-[#D4AF37] to-[#B8860B] rounded-full flex items-center justify-center">
              <Anchor className="w-5 h-5 text-[#0A192F]" />
            </div>
            <span className="text-xl font-serif font-medium">DripShippa</span>
          </button>

          {/* Navigation Items */}
          <div className="flex space-x-1 items-center">
            {navItems.map(({ path, label }) => (
              <Button
                key={path}
                variant={location.pathname === path ? "default" : "ghost"}
                onClick={() => navigate(path)}
                className={`
                  maritime-nav-glow font-serif font-normal
                  ${location.pathname === path 
                    ? 'bg-[#D4AF37] text-[#0A192F] hover:bg-[#B8860B]' 
                    : 'text-[#CCD6F6] hover:text-[#D4AF37] hover:bg-[#1E3A5F]'
                  }
                `}
              >
                <span>{label}</span>
              </Button>
            ))}
            
            {/* Wallet Connection */}
            <div className="flex items-center space-x-3 ml-4">
              <ConnectButton />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
