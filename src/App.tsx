import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MonthProvider } from "@/contexts/MonthContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import OverviewPage from "./pages/OverviewPage";
import WebsitePerformancePage from "./pages/WebsitePerformancePage";
import WebstoreSalesPage from "./pages/WebstoreSalesPage";
import MarketplacePage from "./pages/MarketplacePage";
import ShopeeAdsPage from "./pages/ShopeeAdsPage";
import AdsBudgetPage from "./pages/AdsBudgetPage";
import InsightsPage from "./pages/InsightsPage";
import RecommendationsPage from "./pages/RecommendationsPage";
import ClosingPage from "./pages/ClosingPage";
import ROIRevenuePage from "./pages/ROIRevenuePage";
import BenchmarkPage from "./pages/BenchmarkPage";
import AuthPage from "./pages/AuthPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AppRoutes() {
  return (
    <DashboardLayout>
      <Routes>
        <Route path="/" element={<OverviewPage />} />
        <Route path="/website" element={<WebsitePerformancePage />} />
        <Route path="/webstore" element={<WebstoreSalesPage />} />
        <Route path="/marketplace" element={<MarketplacePage />} />
        <Route path="/benchmark" element={<BenchmarkPage />} />
        <Route path="/shopee-ads" element={<ShopeeAdsPage />} />
        <Route path="/ads-budget" element={<AdsBudgetPage />} />
        <Route path="/roi-revenue" element={<ROIRevenuePage />} />
        <Route path="/insights" element={<InsightsPage />} />
        <Route path="/recommendations" element={<RecommendationsPage />} />
        <Route path="/closing" element={<ClosingPage />} />
        <Route path="/admin-login" element={<AuthPage />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </DashboardLayout>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <MonthProvider>
            <AppRoutes />
          </MonthProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
