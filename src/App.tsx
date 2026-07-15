import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Dashboard from "./pages/Dashboard";
import DashboardServices from "./pages/DashboardServices";
import DashboardStaff from "./pages/DashboardStaff";
import DashboardHours from "./pages/DashboardHours";
import DashboardSchedule from "./pages/DashboardSchedule";
import DashboardCustomers from "./pages/DashboardCustomers";
import DashboardFinance from "./pages/DashboardFinance";
import DashboardSettings from "./pages/DashboardSettings";
import PublicBooking from "./pages/PublicBooking";
import DashboardLayout from "./components/DashboardLayout";
import ProtectedRoute from "./components/ProtectedRoute";
import NotFound from "./pages/NotFound";
import PublicRoute from "./components/PublicRoute";
import ConnectQR from "./pages/ConnectQR";
import PremiumLanding from "./pages/PremiumLanding";

const queryClient = new QueryClient();

const DashboardWrapper = ({ children }: { children: React.ReactNode }) => (
  <ProtectedRoute>
    <DashboardLayout>{children}</DashboardLayout>
  </ProtectedRoute>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Sonner position="bottom-center" richColors closeButton />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<PublicRoute><Landing /></PublicRoute>} />
          <Route path="/premium" element={<PremiumLanding />} />
          <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
          <Route path="/signup" element={<PublicRoute><Signup /></PublicRoute>} />
          <Route path="/dashboard" element={<DashboardWrapper><Dashboard /></DashboardWrapper>} />
          <Route path="/dashboard/services" element={<DashboardWrapper><DashboardServices /></DashboardWrapper>} />
          <Route path="/dashboard/staff" element={<DashboardWrapper><DashboardStaff /></DashboardWrapper>} />
          <Route path="/dashboard/hours" element={<DashboardWrapper><DashboardHours /></DashboardWrapper>} />
          <Route path="/dashboard/schedule" element={<DashboardWrapper><DashboardSchedule /></DashboardWrapper>} />
          <Route path="/dashboard/customers" element={<DashboardWrapper><DashboardCustomers /></DashboardWrapper>} />
          <Route path="/dashboard/finance" element={<DashboardWrapper><DashboardFinance /></DashboardWrapper>} />
          <Route path="/dashboard/settings" element={<DashboardWrapper><DashboardSettings /></DashboardWrapper>} />
          <Route path="/schedule/:slug" element={<PublicBooking />} />
          <Route path="/connect/:id" element={<ConnectQR />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
