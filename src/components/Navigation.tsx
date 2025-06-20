
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Anchor } from 'lucide-react';

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: '/marketplace', label: 'Marketplace' },
    { path: '/portfolio', label: 'My Portfolio' },
    { path: '/contract-builder', label: 'Build Policy' },
  ];

  return (
    <nav className="bg-[#1B365D] border-b border-[#A0957B]/20 sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <button
            onClick={() => navigate('/')}
            className="flex items-center space-x-2 text-white hover:text-[#D4AF37] transition-colors"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-[#D4AF37] to-[#B8860B] rounded-full flex items-center justify-center">
              <Anchor className="w-5 h-5 text-[#1B365D]" />
            </div>
            <span className="text-xl font-serif font-semibold">DripShippa</span>
          </button>

          {/* Navigation Items */}
          <div className="flex space-x-1">
            {navItems.map(({ path, label }) => (
              <Button
                key={path}
                variant={location.pathname === path ? "default" : "ghost"}
                onClick={() => navigate(path)}
                className={`
                  font-serif font-medium
                  ${location.pathname === path 
                    ? 'bg-[#D4AF37] text-[#1B365D] hover:bg-[#B8860B]' 
                    : 'text-white hover:text-[#D4AF37] hover:bg-[#1B365D]/80'
                  }
                `}
              >
                <span>{label}</span>
              </Button>
            ))}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
