import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useBusiness } from "@/hooks/useBusiness";
import { Button } from "@/components/ui/button";
import { format, addDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Plus, ChevronLeft, ChevronRight, X, Calendar, Scissors, User, Phone, Clock } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const DashboardSchedule = () => {
  const { data: business } = useBusiness();
  const queryClient = useQueryClient();
  const [currentDate, setCurrentDate] = useState(new Date());

  const weekDates = Array.from({ length: 7 }, (_, i) => {
    const start = new Date(currentDate);
    start.setDate(start.getDate() - start.getDay() + i);
    return start;
  });

  const { data: appointments } = useQuery({
    queryKey: ["schedule-appointments", business?.id, format(weekDates[0], "yyyy-MM-dd")],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("appointments")
        .select("*, services(name, duration_minutes), staff_members(name), customers(name, phone)")
        .eq("business_id", business!.id)
        .gte("appointment_date", format(weekDates[0], "yyyy-MM-dd"))
        .lte("appointment_date", format(weekDates[6], "yyyy-MM-dd"))
        .neq("status", "canceled")
        .order("start_time");
      if (error) throw error;
      return data;
    },
    enabled: !!business,
  });

  const cancelMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("appointments").update({ status: "canceled" }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedule-appointments"] });
      toast.success("Agendamento cancelado!");
    },
  });

  const [selectedDay, setSelectedDay] = useState(new Date());
  const dayAppointments = appointments?.filter(
    (a: any) => a.appointment_date === format(selectedDay, "yyyy-MM-dd")
  );

  // Manual Booking Form State
  const [isAdding, setIsAdding] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    customerName: "",
    customerPhone: "",
    serviceId: "",
    date: format(selectedDay, "yyyy-MM-dd"),
    time: "09:00"
  });

  const { data: services } = useQuery({
    queryKey: ["services", business?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("services").select("*").eq("business_id", business!.id).eq("is_active", true);
      if (error) throw error;
      return data;
    },
    enabled: !!business,
  });

  const addBookingMutation = useMutation({
    mutationFn: async () => {
      // 1. Ensure customer exists
      let customerId;
      const { data: existingCust } = await supabase
        .from("customers")
        .select("id")
        .eq("business_id", business!.id)
        .eq("phone", bookingForm.customerPhone)
        .maybeSingle();

      if (existingCust) {
        customerId = existingCust.id;
      } else {
        const { data: newCust, error: custErr } = await supabase
          .from("customers")
          .insert({
            business_id: business!.id,
            name: bookingForm.customerName,
            phone: bookingForm.customerPhone
          })
          .select()
          .single();
        if (custErr) throw custErr;
        customerId = newCust.id;
      }

      // 2. Create appointment
      const { error: aptErr } = await supabase
        .from("appointments")
        .insert({
          business_id: business!.id,
          customer_id: customerId,
          service_id: bookingForm.serviceId,
          appointment_date: bookingForm.date,
          start_time: bookingForm.time,
          status: "confirmed"
        });
      if (aptErr) throw aptErr;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["schedule-appointments"] });
      setIsAdding(false);
      setBookingForm({ customerName: "", customerPhone: "", serviceId: "", date: format(selectedDay, "yyyy-MM-dd"), time: "09:00" });
      toast.success("Agendamento realizado com sucesso!");
    },
    onError: (err: any) => toast.error(err.message),
  });

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="rounded-3xl bg-gradient-to-r from-[#132239] to-[#1a2d45] p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
            <Calendar className="w-5 h-5 text-[#2AD467]" />
          </div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-white">Agenda</h1>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full sm:w-auto">
          <div className="flex items-center justify-between sm:justify-start gap-1 bg-card border border-border/50 rounded-xl px-2 py-1 w-full sm:w-auto">
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => setCurrentDate(addDays(currentDate, -7))}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm font-semibold px-2 text-center flex-1">
              {format(weekDates[0], "dd MMM", { locale: ptBR })} – {format(weekDates[6], "dd MMM", { locale: ptBR })}
            </span>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={() => setCurrentDate(addDays(currentDate, 7))}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>

          <Dialog open={isAdding} onOpenChange={setIsAdding}>
            <DialogTrigger asChild>
              <Button className="btn-zap h-11 px-4 gap-2 font-bold shadow-lg shadow-[#2AD467]/20">
                <Plus className="w-4 h-4" /> Novo Agendamento
              </Button>
            </DialogTrigger>
            <DialogContent className="rounded-[2rem] sm:max-w-[450px]">
              <DialogHeader>
                <DialogTitle className="text-2xl font-black">Agendamento Manual</DialogTitle>
              </DialogHeader>
              <div className="space-y-6 py-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-black uppercase tracking-widest text-gray-400">Cliente</Label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input 
                        placeholder="Nome do cliente" 
                        className="pl-11 h-12 rounded-2xl border-gray-100 bg-gray-50 focus:bg-white transition-all font-bold"
                        value={bookingForm.customerName}
                        onChange={e => setBookingForm(f => ({ ...f, customerName: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-black uppercase tracking-widest text-gray-400">WhatsApp</Label>
                    <div className="relative">
                      <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input 
                        placeholder="DD999999999" 
                        className="pl-11 h-12 rounded-2xl border-gray-100 bg-gray-50 focus:bg-white transition-all font-bold"
                        value={bookingForm.customerPhone}
                        onChange={e => setBookingForm(f => ({ ...f, customerPhone: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="text-xs font-black uppercase tracking-widest text-gray-400">Serviço</Label>
                  <Select onValueChange={v => setBookingForm(f => ({ ...f, serviceId: v }))}>
                    <SelectTrigger className="h-12 rounded-2xl border-gray-100 bg-gray-50 font-bold">
                      <SelectValue placeholder="Selecione o serviço" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl">
                      {services?.map((s: any) => (
                        <SelectItem key={s.id} value={s.id} className="font-bold">{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-xs font-black uppercase tracking-widest text-gray-400">Data</Label>
                    <Input 
                      type="date" 
                      className="h-12 rounded-2xl border-gray-100 bg-gray-50 font-bold"
                      value={bookingForm.date}
                      onChange={e => setBookingForm(f => ({ ...f, date: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-black uppercase tracking-widest text-gray-400">Horário</Label>
                    <div className="relative">
                      <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <Input 
                        type="time" 
                        className="pl-11 h-12 rounded-2xl border-gray-100 bg-gray-50 font-bold"
                        value={bookingForm.time}
                        onChange={e => setBookingForm(f => ({ ...f, time: e.target.value }))}
                      />
                    </div>
                  </div>
                </div>

                <Button 
                  className="btn-zap w-full h-14 rounded-2xl text-lg font-black shadow-xl shadow-[#2AD467]/20 mt-4"
                  onClick={() => addBookingMutation.mutate()}
                  disabled={addBookingMutation.isPending || !bookingForm.serviceId || !bookingForm.customerName || !bookingForm.customerPhone}
                >
                  {addBookingMutation.isPending ? "Agendando..." : "Confirmar Agendamento"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Week strip */}
      {/* Week strip */}
      <div className="overflow-x-auto scrollbar-hide -mx-4 px-4 mb-8">
        <div className="flex gap-2 min-w-max">
          {weekDates.map(date => {
            const isToday = format(date, "yyyy-MM-dd") === format(new Date(), "yyyy-MM-dd");
            const isSelected = format(date, "yyyy-MM-dd") === format(selectedDay, "yyyy-MM-dd");
            const dayCount = appointments?.filter((a: any) => a.appointment_date === format(date, "yyyy-MM-dd")).length ?? 0;
            return (
              <button
                key={date.toISOString()}
                onClick={() => setSelectedDay(date)}
                className={`text-center p-3 w-16 rounded-2xl transition-all duration-200 ${
                  isSelected
                    ? "btn-zap !rounded-2xl text-white shadow-lg scale-105"
                    : isToday
                    ? "bg-[#2AD467]/10 border border-[#2AD467]/30 text-[#2AD467]"
                    : "bg-white border border-gray-100 text-gray-500"
                }`}
              >
                <p className="text-[10px] font-black uppercase">{format(date, "EEE", { locale: ptBR })}</p>
                <p className="text-xl font-black mt-0.5">{format(date, "d")}</p>
                {dayCount > 0 && (
                  <div className={`mt-1 mx-auto w-5 h-5 rounded-full text-[10px] font-black flex items-center justify-center ${
                    isSelected ? "bg-white/20" : "bg-[#2AD467]/10 text-[#2AD467]"
                  }`}>
                    {dayCount}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Day appointments */}
      <h2 className="text-xl font-black mb-6 capitalize px-1">
        {format(selectedDay, "EEEE, d 'de' MMMM", { locale: ptBR })}
      </h2>

      {!dayAppointments?.length ? (
        <div className="card-premium !p-12 text-center bg-gray-50/50 border-dashed border-gray-200">
          <p className="text-5xl mb-4">📭</p>
          <p className="text-gray-400 font-bold">Nenhum agendamento neste dia.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {dayAppointments.map((apt: any) => (
            <div key={apt.id} className="card-premium !p-4 flex items-center gap-4 group">
              <div className="flex-shrink-0 w-16 h-16 rounded-2xl bg-[#2AD467]/10 flex flex-col items-center justify-center border border-[#2AD467]/10">
                <p className="text-base font-black text-[#2AD467]">{apt.start_time?.slice(0, 5)}</p>
                <p className="text-[10px] text-[#2AD467]/60 font-black">{apt.end_time?.slice(0, 5)}</p>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-black text-[#132239] truncate">{apt.customers?.name}</p>
                <div className="flex items-center gap-2 text-xs text-gray-400 font-bold mt-1 truncate">
                  <Scissors className="w-3 h-3" /> {apt.services?.name}
                </div>
                <p className="text-xs text-gray-400 font-bold truncate mt-0.5">{apt.customers?.phone}</p>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-10 w-10 rounded-xl hover:bg-red-50 hover:text-red-500 transition-colors" 
                onClick={() => cancelMutation.mutate(apt.id)} 
                title="Cancelar"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DashboardSchedule;
