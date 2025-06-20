
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Anchor, LogIn, LogOut, User } from 'lucide-react';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading, signOut } = useAuth();

  const navItems = [
    { path: '/marketplace', label: 'Marketplace' },
    { path: '/shipping', label: 'Shipping' },
    { path: '/contract-builder', label: 'Build Policy' },
    { path: '/portfolio', label: 'My Portfolio' },
  ];

  const handleSignOut = async () => {
    try {
      await signOut();
      toast.success('Signed out successfully');
      navigate('/');
    } catch (error) {
      toast.error('Error signing out');
    }
  };

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
            
            {/* Authentication & Wallet Section */}
            <div className="flex items-center space-x-3 ml-4">
              {loading ? (
                <div className="w-8 h-8 animate-spin rounded-full border-2 border-[#D4AF37] border-t-transparent"></div>
              ) : user ? (
                <>
                  <div className="flex items-center space-x-2 text-[#CCD6F6] text-sm font-serif">
                    <User className="w-4 h-4" />
                    <span>{user.user_metadata?.full_name || user.email}</span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSignOut}
                    className="maritime-nav-glow text-[#CCD6F6] hover:text-[#FF6B6B] hover:bg-[#1E3A5F] font-serif"
                  >
                    <LogOut className="w-4 h-4 mr-1" />
                    Sign Out
                  </Button>
                </>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate('/auth')}
                  className="maritime-nav-glow text-[#CCD6F6] hover:text-[#D4AF37] hover:bg-[#1E3A5F] font-serif"
                >
                  <LogIn className="w-4 h-4 mr-1" />
                  Sign In
                </Button>
              )}
              <ConnectButton />
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
