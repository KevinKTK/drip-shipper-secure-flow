
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
    { path: '/vessels', label: 'My Vessels' },
    { path: '/contract-builder', label: 'Build Policy' },
    { path: '/portfolio', label: 'My Portfolio' },
  ];

  return (
    <nav className="bg-slate-900 border-b border-cyan-400/20 sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <button
            onClick={() => navigate('/')}
            className="maritime-nav-glow flex items-center space-x-2 text-white hover:text-cyan-400 transition-colors rounded-lg px-2 py-1"
          >
            <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-full flex items-center justify-center">
              <Anchor className="w-5 h-5 text-slate-900" />
            </div>
            <span className="text-xl font-serif font-medium">DripShippa</span>
          </button>

          {/* Navigation Items */}
          <div className="flex space-x-1 items-center">
            {navItems.map(({ path, label }) => (
              <Button
                key={path}
                variant={location.pathname === path || (path === '/vessels' && location.pathname.startsWith('/vessels')) ? "default" : "ghost"}
                onClick={() => navigate(path)}
                className={`
                  maritime-nav-glow font-serif font-normal
                  ${location.pathname === path || (path === '/vessels' && location.pathname.startsWith('/vessels'))
                    ? 'bg-cyan-400 text-slate-900 hover:bg-cyan-500' 
                    : 'text-slate-200 hover:text-cyan-400 hover:bg-slate-700'
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
