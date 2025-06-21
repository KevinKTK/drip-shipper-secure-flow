import { useEffect, useState } from "react";
import { polygonZkEvmCardona } from "wagmi/chains";
import { fetchWalletSecrets } from "@/lib/walletSecrets"
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import Landing from "./pages/Landing";
import Marketplace from "./pages/Marketplace";
import Shipping from "./pages/Shipping";
import VesselDashboard from "./pages/VesselDashboard";
import RegisterVessel from "./pages/RegisterVessel";
import LogJourney from "./pages/LogJourney";
import ContractBuilder from "./pages/ContractBuilder";
import Portfolio from "./pages/Portfolio";
import NotFound from "./pages/NotFound";
import '@rainbow-me/rainbowkit/styles.css';

import { getDefaultConfig, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { WagmiProvider, http } from "wagmi";

const queryClient = new QueryClient();

const App = () => {
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWalletSecrets().then(({ RPC_PROVIDER_URL, WALLETCONNECT_PROJECT_ID }) => {
      const wagmiConfig = getDefaultConfig({
        appName: "DripShippa",
        projectId: WALLETCONNECT_PROJECT_ID,
        chains: [polygonZkEvmCardona],
        transports: {
          [polygonZkEvmCardona.id]: http(RPC_PROVIDER_URL),
        },
      });
      setConfig(wagmiConfig);
      setLoading(false);
    });
  }, []);

  if (loading || !config) return <div>Loading...</div>;

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <AuthProvider>
            <TooltipProvider>
              <BrowserRouter>
                <Toaster />
                <Sonner />
                <Routes>
                  <Route path="/" element={<Landing />} />
                  <Route path="/marketplace" element={<Marketplace />} />
                  <Route path="/shipping" element={<Shipping />} />
                  <Route path="/vessels" element={<VesselDashboard />} />
                  <Route path="/vessels/register" element={<RegisterVessel />} />
                  <Route path="/vessels/:vesselId/log-journey" element={<LogJourney />} />
                  <Route path="/contract-builder" element={<ContractBuilder />} />
                  <Route path="/portfolio" element={<Portfolio />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </BrowserRouter>
            </TooltipProvider>
          </AuthProvider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};

export default App;
