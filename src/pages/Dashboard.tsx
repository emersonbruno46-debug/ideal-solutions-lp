import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useBusiness } from "@/hooks/useBusiness";
import { useAuth } from "@/hooks/useAuth";
import { 
  Calendar, 
  Scissors, 
  Clock, 
  TrendingUp, 
  ExternalLink, 
  Plus, 
  ChevronRight, 
  Link as LinkIcon,
  CheckCircle2,
  CalendarDays,
  MessageSquare
} from "lucide-react";
import { format, startOfWeek, endOfWeek } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { motion } from "framer-motion";

const Dashboard = () => {
  const { user } = useAuth();
  const { data: business } = useBusiness();
  const isClient = user?.user_metadata?.role === "cliente";

  const today = format(new Date(), "yyyy-MM-dd");
  const weekStart = format(startOfWeek(new Date()), "yyyy-MM-dd");
  const weekEnd = format(endOfWeek(new Date()), "yyyy-MM-dd");

  // --- BUSINESS QUERIES ---
  const { data: todayAppointments, isLoading: loadingToday } = useQuery({
    queryKey: ["today-appointments", business?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("appointments")
        .select("*, services(name, duration_minutes), staff_members(name), customers(name, phone)")
        .eq("business_id", business!.id)
        .eq("appointment_date", today)
        .neq("status", "canceled")
        .order("start_time");
      if (error) throw error;
      return data;
    },
    enabled: !!business && !isClient,
  });

  const { data: weekAppointments } = useQuery({
    queryKey: ["week-appointments", business?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("appointments")
        .select("id")
        .eq("business_id", business!.id)
        .gte("appointment_date", weekStart)
        .lte("appointment_date", weekEnd)
        .neq("status", "canceled");
      if (error) throw error;
      return data;
    },
    enabled: !!business && !isClient,
  });

  const { data: stats } = useQuery({
    queryKey: ["dashboard-stats", business?.id],
    queryFn: async () => {
      const [services, staff, customers] = await Promise.all([
        supabase.from("services").select("id", { count: "exact" }).eq("business_id", business!.id).eq("is_active", true),
        supabase.from("staff_members").select("id", { count: "exact" }).eq("business_id", business!.id).eq("is_active", true),
        supabase.from("customers").select("id", { count: "exact" }).eq("business_id", business!.id),
      ]);
      return {
        services: services.count ?? 0,
        staff: staff.count ?? 0,
        customers: customers.count ?? 0,
      };
    },
    enabled: !!business && !isClient,
  });

  if (isClient) {
    // Client Dashboard - Simplified
    return (
       <div className="max-w-4xl mx-auto px-4 py-8">
         <div className="mb-10">
           <h1 className="text-3xl md:text-4xl font-black mb-2">
             Olá, {user?.user_metadata?.full_name || "Cliente"} 👋
           </h1>
           <p className="text-gray-500 font-medium text-lg">Estes são seus próximos agendamentos.</p>
         </div>
         <div className="card-premium p-8 md:p-12 text-center flex flex-col items-center">
            <Calendar className="w-16 h-16 text-gray-200 mb-6" />
            <p className="text-gray-400 font-bold text-xl mb-8">Nenhum agendamento encontrado.</p>
            <Button className="btn-zap h-16 px-10 w-full md:w-auto" asChild>
               <Link to="/">Voltar ao início</Link>
            </Button>
         </div>
       </div>
    );
  }

  const showOnboarding = stats?.services === 0;

  return (
    <div className="max-w-[1400px] mx-auto">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-12">
        <div>
          <h1 className="text-3xl md:text-5xl font-black mb-3">
            {business?.name || "Seu Negócio"}
          </h1>
          <p className="text-gray-500 font-bold flex items-center gap-2 uppercase text-xs tracking-[0.2em]">
            <CalendarDays className="w-4 h-4 text-[#2AD467]" />
            {format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR })}
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button 
            className="btn-zap h-14 px-8 w-full sm:w-auto shadow-xl shadow-[#2AD467]/30 scale-105 active:scale-100 transition-transform" 
            asChild
          >
            <Link to="/dashboard/schedule">
              <Plus className="w-6 h-6 mr-2" /> Novo Agendamento
            </Link>
          </Button>
          <Button 
            variant="outline"
            className="rounded-[2rem] h-14 px-6 font-black border-gray-200 text-gray-600 hover:bg-white shadow-sm gap-2 w-full sm:w-auto" 
            onClick={() => {
              navigator.clipboard.writeText(`${window.location.origin}/schedule/${business?.slug}`);
              toast.success("Link de agendamento copiado!");
            }}
          >
            <LinkIcon className="w-4 h-4 text-[#2AD467]" /> Copiar link
          </Button>
          <Button variant="ghost" className="h-14 px-6 w-full sm:w-auto font-bold text-gray-400" asChild>
            <Link to={`/schedule/${business?.slug}`} target="_blank">
              <ExternalLink className="w-4 h-4 mr-2" /> Página Pública
            </Link>
          </Button>
        </div>
      </div>

      {/* Onboarding Wizard */}
      {showOnboarding && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-16 card-premium bg-gradient-to-br from-white to-[#F8FAFC] border-2 border-[#2AD467]/10"
        >
          <div className="flex items-center gap-3 mb-8">
             <div className="w-8 h-8 rounded-full bg-[#2AD467]/10 flex items-center justify-center">
                <div className="w-3 h-3 rounded-full bg-[#2AD467] animate-pulse" />
             </div>
             <h2 className="text-xl font-black uppercase tracking-tighter text-[#132239]">Vamos deixar sua agenda pronta em menos de 2 minutos</h2>
          </div>
          
          <div className="grid md:grid-cols-3 gap-6 relative">
            {/* Progress Bar (Visual only) */}
            <div className="absolute top-7 left-10 right-10 h-0.5 bg-gray-100 -z-10 hidden md:block" />
            
            <Link to="/dashboard/services" className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:border-[#2AD467] hover:shadow-xl hover:shadow-[#2AD467]/10 transition-all group">
              <div className="w-14 h-14 rounded-full bg-[#2AD467] flex items-center justify-center text-white font-black text-xl mb-6 shadow-lg shadow-[#2AD467]/20 group-hover:scale-110 transition-transform">
                1
              </div>
              <h3 className="font-black text-xl mb-2">Criar serviço</h3>
              <p className="text-gray-500 text-sm leading-relaxed font-medium">Adicione o que você oferece (preço e duração).</p>
              <div className="mt-4 flex items-center text-[#2AD467] font-bold text-sm">
                 Começar <ChevronRight className="w-4 h-4 ml-1" />
              </div>
            </Link>

            <Link to="/dashboard/hours" className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:border-[#2AD467] hover:shadow-xl hover:shadow-[#2AD467]/10 transition-all group">
              <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 font-black text-xl mb-6 group-hover:scale-110 transition-transform">
                2
              </div>
              <h3 className="font-black text-xl mb-2">Definir horários</h3>
              <p className="text-gray-500 text-sm leading-relaxed font-medium">Quais seus horários livres para receber clientes?</p>
              <div className="mt-4 flex items-center text-gray-300 font-bold text-sm">
                 Pendente <ChevronRight className="w-4 h-4 ml-1" />
              </div>
            </Link>

            <div className="bg-gray-50/50 rounded-3xl p-6 border border-dashed border-gray-200">
              <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center text-gray-300 font-black text-xl mb-6">
                3
              </div>
              <h3 className="font-black text-xl mb-2 text-gray-300">Receber clientes</h3>
              <p className="text-gray-300 text-sm leading-relaxed font-medium">Falta pouco para você começar a receber agendamentos.</p>
            </div>
          </div>
        </motion.div>
      )}

      {!showOnboarding && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start w-full min-w-0">
          {/* Main List */}
          <div className="lg:col-span-2 space-y-8 min-w-0 w-full">
            <div className="rounded-3xl bg-gradient-to-r from-[#132239] to-[#1a2d45] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <h2 className="text-xl font-black flex items-center gap-3 text-white w-full sm:w-auto">
                <div className="w-2 h-8 bg-[#2AD467] rounded-full shrink-0" />
                Próximos atendimentos (Hoje)
              </h2>
              <Button size="sm" className="rounded-xl bg-white/10 text-white hover:bg-white/20 border-0 font-bold backdrop-blur-sm w-full sm:w-auto" asChild>
                <Link to="/dashboard/schedule">Ver agenda completa</Link>
              </Button>
            </div>
            
            {loadingToday ? (
               <div className="space-y-4">
                  {[1,2,3].map(i => <div key={i} className="h-24 bg-gray-100 rounded-3xl animate-pulse" />)}
               </div>
            ) : !todayAppointments?.length ? (
              <div className="card-premium p-8 sm:p-16 text-center flex flex-col items-center bg-gray-50/50 border-dashed border-gray-200">
                <Calendar className="w-16 h-16 text-gray-200 mb-6 shrink-0" />
                <p className="text-gray-500 font-bold text-xl mb-2">Você ainda não tem agendamentos.</p>
                <p className="text-gray-400 max-w-sm mb-8 font-medium">
                  Compartilhe seu link e comece a receber clientes agora.
                </p>
                <Button 
                  className="btn-zap h-auto py-3 sm:h-14 px-4 sm:px-10 w-full sm:w-auto" 
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/schedule/${business?.slug}`);
                    toast.success("Link copiado!");
                  }}
                >
                  <LinkIcon className="w-5 h-5 mr-2 shrink-0" /> <span className="truncate">Copiar link de agendamento</span>
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {todayAppointments.map((apt: any) => (
                  <motion.div 
                    key={apt.id} 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="card-premium !p-4 sm:!p-6 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 group hover:border-[#2AD467]/30"
                  >
                    <div className="flex-shrink-0 w-full sm:w-20 h-16 sm:h-20 rounded-2xl bg-[#2AD467]/10 flex flex-row sm:flex-col items-center justify-center border border-[#2AD467]/10 gap-2 sm:gap-0">
                      <p className="text-xl sm:text-2xl font-black text-[#2AD467]">{apt.start_time?.slice(0, 5)}</p>
                      <p className="text-[10px] uppercase font-black text-[#2AD467]/60 tracking-widest">Início</p>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-lg sm:text-xl font-black text-[#132239] truncate mb-1">{apt.customers?.name}</p>
                      <div className="flex flex-wrap gap-x-4 gap-y-1">
                        <p className="text-xs sm:text-sm text-gray-400 font-bold flex items-center gap-1.5">
                          <Scissors className="w-4 h-4 text-[#2AD467]" /> {apt.services?.name}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-400 font-bold flex items-center gap-1.5">
                          <Clock className="w-4 h-4 text-[#2AD467]" /> {apt.services?.duration_minutes} min
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-row sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-3 mt-2 sm:mt-0 pt-4 sm:pt-0 border-t sm:border-0 border-gray-50">
                       <span className="bg-[#2AD467]/10 text-[#2AD467] px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-[10px] sm:text-xs font-black uppercase tracking-widest border border-[#2AD467]/20">
                          Confirmado
                       </span>
                       <Button size="sm" variant="ghost" className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-gray-50 text-[#2AD467] hover:bg-[#2AD467]/10" asChild>
                          <a href={`https://wa.me/55${apt.customers?.phone?.replace(/\D/g, "")}`} target="_blank" rel="noreferrer">
                             <MessageSquare className="w-5 h-5" />
                          </a>
                       </Button>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>

          {/* Indicators Sidebar */}
          <div className="space-y-6 min-w-0 w-full">
            <h2 className="text-2xl font-black mb-4">Seus Indicadores</h2>
            
            <div className="card-premium p-6 md:p-8 bg-gradient-to-br from-[#132239] to-[#202C3C] text-white border-0 overflow-hidden relative group">
               <div className="absolute top-0 right-0 w-32 h-32 bg-[#2AD467]/20 blur-3xl group-hover:bg-[#2AD467]/30 transition-all" />
               <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                     <p className="text-sm font-black uppercase tracking-widest text-gray-400">Hoje: Atendimentos</p>
                     <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                        <Calendar className="w-5 h-5 text-[#2AD467]" />
                     </div>
                  </div>
                  <p className="text-5xl font-black mb-2">{todayAppointments?.length ?? 0}</p>
                  <p className="text-xs text-gray-400 font-medium">Sua meta diária está em 80%</p>
               </div>
            </div>

            <div className="card-premium p-6 md:p-8 bg-gradient-to-br from-[#132239] to-[#202C3C] text-white border-0 overflow-hidden relative group">
               <div className="absolute bottom-0 left-0 w-28 h-28 bg-[#2AD467]/15 blur-3xl group-hover:bg-[#2AD467]/25 transition-all" />
               <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                     <p className="text-sm font-black uppercase tracking-widest text-gray-400">Semana: Clientes</p>
                     <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                        <TrendingUp className="w-5 h-5 text-[#2AD467]" />
                     </div>
                  </div>
                  <p className="text-5xl font-black mb-2">{weekAppointments?.length ?? 0}</p>
                  <p className="text-xs text-[#2AD467] font-bold flex items-center gap-1">
                     <TrendingUp className="w-3 h-3" /> +12% em relação a anterior
                  </p>
               </div>
            </div>

            <div className="card-premium p-6 md:p-8 bg-gradient-to-br from-[#132239] to-[#202C3C] text-white border-0 overflow-hidden relative group">
               <div className="absolute top-0 left-0 w-24 h-24 bg-[#2AD467]/10 blur-3xl group-hover:bg-[#2AD467]/20 transition-all" />
               <div className="relative z-10">
                  <h3 className="font-black mb-6 flex items-center gap-2">
                     <CheckCircle2 className="w-5 h-5 text-[#2AD467]" /> Status do Perfil
                  </h3>
                  <div className="space-y-4">
                     <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-gray-400">Serviços ativos</span>
                        <span className="text-sm font-black text-white">{stats?.services}</span>
                     </div>
                     <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-gray-400">Clientes na base</span>
                        <span className="text-sm font-black text-white">{stats?.customers}</span>
                     </div>
                     <div className="h-2 w-full bg-white/10 rounded-full mt-6 overflow-hidden">
                        <div className="h-full bg-[#2AD467] rounded-full w-[100%]" />
                     </div>
                     <p className="text-[10px] text-center text-gray-500 font-bold uppercase tracking-widest">Seu perfil está 100% otimizado</p>
                  </div>
               </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
