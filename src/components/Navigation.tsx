
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Anchor, Shield, User, Package } from 'lucide-react';

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { path: '/marketplace', label: 'Marketplace', icon: Package },
    { path: '/portfolio', label: 'My Portfolio', icon: User },
    { path: '/contract-builder', label: 'Build Policy', icon: Shield },
  ];

  return (
    <nav className="bg-[#0A192F] border-b border-[#3C5B6F] sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <button
            onClick={() => navigate('/')}
            className="flex items-center space-x-2 text-white hover:text-[#FFD700] transition-colors"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-[#FFD700] to-[#B8860B] rounded-full flex items-center justify-center">
              <Anchor className="w-5 h-5 text-[#0A192F]" />
            </div>
            <span className="text-xl font-serif font-bold">DripShippa</span>
          </button>

          {/* Navigation Items */}
          <div className="flex space-x-1">
            {navItems.map(({ path, label, icon: Icon }) => (
              <Button
                key={path}
                variant={location.pathname === path ? "default" : "ghost"}
                onClick={() => navigate(path)}
                className={`
                  flex items-center space-x-2 font-sans
                  ${location.pathname === path 
                    ? 'bg-[#FFD700] text-[#0A192F] hover:bg-[#B8860B]' 
                    : 'text-white hover:text-[#FFD700] hover:bg-[#1D566E]'
                  }
                `}
              >
                <Icon className="w-4 h-4" />
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
