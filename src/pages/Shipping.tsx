
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Ship, Package } from 'lucide-react';
import Navigation from '@/components/Navigation';
import ShipperView from '@/components/shipping/ShipperView';
import CarrierView from '@/components/shipping/CarrierView';

type UserRole = 'shipper' | 'carrier' | null;

const Shipping = () => {
  const [selectedRole, setSelectedRole] = useState<UserRole>(null);

  const roleCards = [
    {
      id: 'shipper' as UserRole,
      title: 'Shipper',
      subtitle: 'List your cargo for transport',
      icon: Package,
      description: 'Create shipping orders and find reliable carriers for your cargo'
    },
    {
      id: 'carrier' as UserRole,
      title: 'Carrier',
      subtitle: 'Find freight for your vessel',
      icon: Ship,
      description: 'Log your routes and discover profitable shipping opportunities'
    }
  ];

  return (
    <div className="min-h-screen bg-[#0A192F] maritime-background">
      <Navigation />
      
      <div className="container mx-auto px-6 py-8 relative z-10">
        <div className="text-center mb-8 page-enter">
          <h1 className="text-4xl font-serif font-medium text-[#FFFFFF] mb-2">Shipping Hub</h1>
          <p className="text-[#CCD6F6] font-serif font-light">Create orders or find freight opportunities</p>
        </div>

        {/* Role Selector */}
        <div className="mb-8 page-enter" style={{ animationDelay: '0.2s' }}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {roleCards.map((role, index) => (
              <Card
                key={role.id}
                className={`
                  maritime-card cursor-pointer transition-all duration-300 hover:scale-105
                  ${selectedRole === role.id 
                    ? 'maritime-card-glow border-[#D4AF37] bg-[#1E3A5F]/50' 
                    : 'maritime-card-glow hover:border-[#D4AF37]/50'
                  }
                `}
                onClick={() => setSelectedRole(role.id)}
                style={{ animationDelay: `${(index + 1) * 0.1}s` }}
              >
                <CardHeader className="text-center pb-4">
                  <div className="flex justify-center mb-4">
                    <div className={`
                      w-16 h-16 rounded-full flex items-center justify-center
                      ${selectedRole === role.id 
                        ? 'bg-[#D4AF37] text-[#0A192F]' 
                        : 'bg-[#CCD6F6]/20 text-[#D4AF37]'
                      }
                    `}>
                      <role.icon className="w-8 h-8" />
                    </div>
                  </div>
                  <CardTitle className="text-[#FFFFFF] font-serif font-medium text-2xl">
                    {role.title}
                  </CardTitle>
                  <p className="text-[#D4AF37] font-serif text-lg">{role.subtitle}</p>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-[#CCD6F6] font-serif">{role.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Dynamic Content Based on Role Selection */}
        {selectedRole && (
          <div className="page-enter" style={{ animationDelay: '0.4s' }}>
            {selectedRole === 'shipper' && <ShipperView />}
            {selectedRole === 'carrier' && <CarrierView />}
          </div>
        )}
      </div>
    </div>
  );
};

export default Shipping;
