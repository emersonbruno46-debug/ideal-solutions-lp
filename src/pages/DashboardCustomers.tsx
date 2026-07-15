import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useBusiness } from "@/hooks/useBusiness";
import { format, differenceInDays } from "date-fns";
import { UserCircle, MessageCircle, Calendar, Clock } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const DashboardCustomers = () => {
  const { data: business } = useBusiness();
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [message, setMessage] = useState("");

  const { data: customers } = useQuery({
    queryKey: ["customers-with-appointments", business?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("customers")
        .select("*, appointments(appointment_date, start_time, status, services(name))")
        .eq("business_id", business!.id)
        .order("created_at", { ascending: false });
      if (error) throw error;
      
      // Process to find last appointment
      return data.map(c => {
        const validApts = c.appointments?.filter((a: any) => a.status !== "canceled" && new Date(`${a.appointment_date}T${a.start_time}`) < new Date()) || [];
        validApts.sort((a: any, b: any) => new Date(`${b.appointment_date}T${b.start_time}`).getTime() - new Date(`${a.appointment_date}T${a.start_time}`).getTime());
        
        const lastApt = validApts[0];
        const daysAgo = lastApt ? differenceInDays(new Date(), new Date(`${lastApt.appointment_date}T${lastApt.start_time}`)) : null;
        
        return { ...c, lastAppointment: lastApt, daysAgo };
      });
    },
    enabled: !!business,
  });

  const colors = ["from-primary to-accent", "from-accent to-primary", "from-primary/80 to-primary", "from-accent/80 to-accent"];

  const openReminder = (customer: any) => {
    setSelectedCustomer(customer);
    setMessage(`Oi ${customer.name}, tudo bem? Faz um tempinho desde o seu último agendamento. Que tal marcar um novo horário?`);
  };

  const templates = [
    { label: "Sumiço", text: "Oi {nome}, tudo bem? Faz um tempinho desde o seu último agendamento. Que tal marcar um novo horário?" },
    { label: "Novidades", text: "Oi {nome}, temos novidades por aqui! Que tal agendar um horário para conferir?" },
    { label: "Promoção", text: "Oi {nome}, estamos com condições especiais essa semana. Vamos agendar?" },
  ];

  const applyTemplate = (text: string) => {
    setMessage(text.replace("{nome}", selectedCustomer?.name || ""));
  };

  const sendWhatsApp = () => {
    if (!selectedCustomer?.phone) return;
    const cleanPhone = selectedCustomer.phone.replace(/\D/g, "");
    const url = `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
    setSelectedCustomer(null);
  };

  return (
    <div>
      <div className="rounded-3xl bg-gradient-to-r from-[#132239] to-[#1a2d45] p-5 flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
          <UserCircle className="w-5 h-5 text-[#2AD467]" />
        </div>
        <h1 className="font-display text-2xl font-extrabold tracking-tight text-white">Clientes</h1>
      </div>

      {!customers?.length ? (
        <div className="card-interactive rounded-2xl p-10 text-center">
          <p className="text-4xl mb-3">👥</p>
          <p className="text-muted-foreground text-sm font-medium">
            Nenhum cliente cadastrado ainda. Os clientes aparecerão aqui após o primeiro agendamento.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {customers.map((c: any, i: number) => (
            <div key={c.id} className="card-premium !p-4 sm:!p-6 flex flex-col gap-4 group">
              <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                <div className={`w-12 h-12 shrink-0 rounded-2xl bg-gradient-to-br ${colors[i % colors.length]} flex items-center justify-center text-white font-black text-xl shadow-lg shadow-[#2AD467]/10`}>
                  {c.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-black text-lg text-[#132239] truncate">{c.name}</p>
                  <p className="text-sm text-gray-400 font-bold">{c.phone}</p>
                </div>
                <Button variant="outline" size="sm" onClick={() => openReminder(c)} className="w-full sm:w-auto h-11 sm:h-10 shrink-0 gap-1.5 rounded-2xl border-[#2AD467]/30 text-[#2AD467] hover:bg-[#2AD467]/10 font-bold">
                  <MessageCircle className="w-4 h-4" /> Lembrar
                </Button>
              </div>
              
              <div className="bg-muted/30 rounded-xl p-3 border border-border/50 text-sm">
                {c.lastAppointment ? (
                  <div className="flex flex-col gap-1.5">
                    <p className="font-semibold text-foreground flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      Último serviço: <span className="font-normal text-muted-foreground">{c.lastAppointment.services?.name || "Serviço deletado"}</span>
                    </p>
                    <div className="flex items-center justify-between">
                      <p className="text-muted-foreground flex items-center gap-1.5">
                        <Clock className="w-4 h-4" />
                        {format(new Date(`${c.lastAppointment.appointment_date}T${c.lastAppointment.start_time}`), "dd/MM/yyyy")}
                      </p>
                      <span className={`px-2 py-0.5 rounded-md text-xs font-bold ${c.daysAgo > 30 ? 'bg-red-100 text-red-700' : 'bg-primary/10 text-primary'}`}>
                        {c.daysAgo === 0 ? "Hoje" : `Há ${c.daysAgo} dias`}
                      </span>
                    </div>
                  </div>
                ) : (
                  <p className="text-muted-foreground flex items-center gap-2">
                    <Calendar className="w-4 h-4" /> Nenhum agendamento concluído
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Dialog open={!!selectedCustomer} onOpenChange={(open) => !open && setSelectedCustomer(null)}>
        <DialogContent className="sm:max-w-[425px] rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-[#25D366]" />
              Enviar Lembrete
            </DialogTitle>
          </DialogHeader>
          <div className="mt-2 space-y-4">
            <p className="text-sm text-muted-foreground">
              Mensagem para <strong className="text-foreground">{selectedCustomer?.name}</strong>:
            </p>
            
            <div className="flex flex-wrap gap-2">
              {templates.map(t => (
                <Button key={t.label} variant="secondary" size="sm" onClick={() => applyTemplate(t.text)} className="rounded-full text-xs h-7">
                  {t.label}
                </Button>
              ))}
            </div>

            <Textarea 
              value={message} 
              onChange={e => setMessage(e.target.value)} 
              rows={4} 
              className="resize-none rounded-xl"
              placeholder="Digite a mensagem..."
            />

            <Button onClick={sendWhatsApp} className="w-full h-11 bg-[#25D366] hover:bg-[#128C7E] text-white font-bold rounded-xl shadow-lg border-0 gap-2">
              <MessageCircle className="w-5 h-5" /> Enviar no WhatsApp
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default DashboardCustomers;
