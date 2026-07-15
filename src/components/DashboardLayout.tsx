import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  Clock, 
  Users, 
  Settings, 
  Scissors, 
  LayoutDashboard, 
  LogOut, 
  Menu, 
  X, 
  ExternalLink, 
  Wallet,
  Plus
} from "lucide-react";
import Logo from "@/components/Logo";
import { supabase } from "@/integrations/supabase/client";
import { useBusiness } from "@/hooks/useBusiness";
import { useAuth } from "@/hooks/useAuth";
import { useState } from "react";

import { Onboarding } from "@/components/Onboarding";

const navItems = [
  { to: "/dashboard", icon: LayoutDashboard, label: "Sua agenda", id: "nav-agenda" },
  { to: "/dashboard/schedule", icon: Calendar, label: "Agendamentos", id: "nav-schedule" },
  { to: "/dashboard/customers", icon: Users, label: "Clientes", id: "nav-customers" },
  { to: "/dashboard/finance", icon: Wallet, label: "Financeiro", id: "nav-finance" },
  { to: "/dashboard/services", icon: Scissors, label: "O que você oferece", id: "nav-services" },
  { to: "/dashboard/hours", icon: Clock, label: "Seus horários livres", id: "nav-hours" },
  { to: "/dashboard/settings", icon: Settings, label: "Configurações", id: "nav-settings" },
];

const DashboardLayout = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { data: business } = useBusiness();
  const [mobileOpen, setMobileOpen] = useState(false);
  
  const isClient = user?.user_metadata?.role === "cliente";
  const displayedNavItems = isClient 
    ? [{ to: "/dashboard", icon: LayoutDashboard, label: "Meus Agendamentos" }]
    : navItems;

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col font-body">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-xl border-b border-gray-100">
        <div className="flex h-28 md:h-24 w-full items-center justify-between px-4 md:px-8 max-w-[1600px] mx-auto">
          <div className="flex items-center gap-6 md:gap-10">
            <Link to="/dashboard" className="hover:opacity-80 transition-opacity">
              <Logo size="sm" />
            </Link>
            
            {/* Desktop Nav */}
            <nav className="hidden lg:flex items-center gap-1">
              {displayedNavItems.map(item => {
                const isActive = location.pathname === item.to;
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    id={item.id}
                    className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-sm font-bold transition-all duration-300 ${
                      isActive
                        ? "bg-[#2AD467] text-white shadow-lg shadow-[#2AD467]/20"
                        : "text-gray-500 hover:bg-gray-50 hover:text-[#2AD467]"
                    }`}
                  >
                    <item.icon className={`w-4 h-4 ${isActive ? "" : "opacity-70"}`} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden lg:flex items-center gap-4">
              {!isClient && business && (
                <Button variant="outline" className="rounded-2xl border-gray-100 font-bold text-gray-600 hover:bg-gray-50 gap-2 h-11" asChild>
                  <Link to={`/schedule/${business.slug}`} target="_blank">
                    <ExternalLink className="w-4 h-4" /> Ver Link Público
                  </Link>
                </Button>
              )}
              {!isClient && (
                <Button 
                  className="btn-zap h-11 px-5 rounded-2xl flex items-center gap-2"
                  asChild
                >
                  <Link to="/dashboard/schedule">
                    <Plus className="w-4 h-4" /> Novo Agendamento
                  </Link>
                </Button>
              )}
              <Button variant="ghost" size="icon" className="text-gray-400 hover:text-red-500 rounded-2xl h-11 w-11" onClick={handleLogout} title="Sair">
                <LogOut className="w-5 h-5" />
              </Button>
            </div>

            {/* Mobile Menu Toggle */}
            <Button variant="ghost" size="icon" className="lg:hidden rounded-2xl h-11 w-11" onClick={() => setMobileOpen(!mobileOpen)}>
              {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>
        </div>
      </header>

      {/* Mobile Nav Menu */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 pt-20 bg-white animate-in slide-in-from-top duration-300">
           <div className="flex justify-between items-center p-4 border-b border-gray-100">
             <Logo size="sm" />
             <Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)}>
                <X className="w-6 h-6" />
             </Button>
           </div>
          <nav className="p-6 space-y-2">
            {displayedNavItems.map(item => {
              const isActive = location.pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-4 px-6 py-4 rounded-[2rem] text-lg font-bold transition-all ${
                    isActive
                      ? "bg-[#2AD467] text-white shadow-xl shadow-[#2AD467]/20"
                      : "text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  <item.icon className="w-6 h-6" />
                  {item.label}
                </Link>
              );
            })}
            <div className="pt-8 mt-4 border-t border-gray-100 space-y-4">
              {!isClient && business && (
                <Button variant="outline" className="w-full justify-center h-14 rounded-[2rem] border-gray-200 font-bold text-gray-700 gap-2" asChild>
                  <Link to={`/schedule/${business.slug}`} target="_blank">
                    <ExternalLink className="w-5 h-5" /> Ver Página Pública
                  </Link>
                </Button>
              )}
              <Button variant="ghost" className="w-full justify-center h-14 rounded-[2rem] text-red-500 font-bold gap-2" onClick={handleLogout}>
                <LogOut className="w-5 h-5" /> Sair da conta
              </Button>
            </div>
          </nav>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-8">
        <div className="max-w-[1600px] mx-auto w-full">
          {children}
        </div>
      </main>
      {!isClient && <Onboarding />}
    </div>
  );
};

export default DashboardLayout;
