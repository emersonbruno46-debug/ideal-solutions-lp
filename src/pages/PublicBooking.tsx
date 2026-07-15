import { useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { format, addDays, parse } from "date-fns";
import { ptBR } from "date-fns/locale";
import { MapPin, Phone, Instagram, CheckCircle2, ArrowLeft, Sparkles, Clock, DollarSign, User as UserIcon, QrCode, Check } from "lucide-react";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

const PublicBooking = () => {
  const { slug } = useParams<{ slug: string }>();
  const [step, setStep] = useState(0); // 0=service, 1=staff, 2=date, 3=time, 4=info, 5=done
  const [selectedServices, setSelectedServices] = useState<any[]>([]);
  const [selectedStaff, setSelectedStaff] = useState<any>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"dinheiro" | "pix">("dinheiro");
  const [submitting, setSubmitting] = useState(false);

  // Total calculations
  const totalDuration = useMemo(() => selectedServices.reduce((acc, s) => acc + (s.duration_minutes || 0), 0), [selectedServices]);
  const totalPrice = useMemo(() => selectedServices.reduce((acc, s) => acc + parseFloat(s.price || 0), 0), [selectedServices]);

  // Queries remain identical...
  const { data: business } = useQuery({
    queryKey: ["public-business", slug],
    queryFn: async () => {
      const { data, error } = await supabase.from("businesses").select("*").eq("slug", slug).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const { data: services } = useQuery({
    queryKey: ["public-services", business?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("services").select("*").eq("business_id", business!.id).eq("is_active", true).order("name");
      if (error) throw error;
      return data;
    },
    enabled: !!business,
  });

  const { data: staff } = useQuery({
    queryKey: ["public-staff", business?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("staff_members").select("*").eq("business_id", business!.id).eq("is_active", true).order("name");
      if (error) throw error;
      return data;
    },
    enabled: !!business,
  });

  const { data: workingHours } = useQuery({
    queryKey: ["public-hours", business?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("working_hours").select("*").eq("business_id", business!.id).eq("is_active", true);
      if (error) throw error;
      return data;
    },
    enabled: !!business,
  });

  const { data: existingAppointments } = useQuery({
    queryKey: ["public-appointments", business?.id, selectedDate ? format(selectedDate, "yyyy-MM-dd") : ""],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("appointments").select("start_time, end_time, staff_id")
        .eq("business_id", business!.id).eq("appointment_date", format(selectedDate!, "yyyy-MM-dd")).neq("status", "canceled");
      if (error) throw error;
      return data;
    },
    enabled: !!business && !!selectedDate,
  });

  const brandColor = business?.brand_color || "#2AD467";
  const dbDesc = business?.description ?? "";
  const pixMatch = dbDesc.match(/\[PIX:(.*?)\]/);
  const pixKey = pixMatch ? pixMatch[1] : "";
  const cleanDesc = dbDesc
    .replace(/\[PIX:.*?\]/g, "")
    .replace(/\[LUNCH:.*?\]/g, "")
    .replace(/\[INTERVAL:.*?\]/g, "")
    .trim();

  const availableDates = Array.from({ length: 30 }, (_, i) => addDays(new Date(), i + 1))
    .filter(date => {
      const dow = date.getDay();
      if (!workingHours || workingHours.length === 0) return dow >= 1 && dow <= 5;
      return workingHours?.some((wh: any) => wh.day_of_week === dow && wh.is_active);
    }).slice(0, 14);

  const generateSlots = () => {
    if (!selectedDate || selectedServices.length === 0) return [];
    const dow = selectedDate.getDay();
    let startTimeStr = "09:00";
    let endTimeStr = "18:00";
    if (workingHours && workingHours.length > 0) {
      const wh = workingHours.find((h: any) => h.day_of_week === dow);
      if (!wh || !wh.is_active) return [];
      startTimeStr = wh.start_time.slice(0, 5);
      endTimeStr = wh.end_time.slice(0, 5);
    }

    // Extract global settings
    const lunchMatch = dbDesc.match(/\[LUNCH:(.*?)-(.*?)\]/);
    const lunchStart = lunchMatch ? lunchMatch[1] : null;
    const lunchEnd = lunchMatch ? lunchMatch[2] : null;
    
    const intervalMatch = dbDesc.match(/\[INTERVAL:(\d+)\]/);
    const baseInterval = intervalMatch ? parseInt(intervalMatch[1]) : 15;

    const slots: string[] = [];
    const start = parse(startTimeStr, "HH:mm", new Date());
    const end = parse(endTimeStr, "HH:mm", new Date());
    const duration = totalDuration;
    
    let current = start;
    while (current.getTime() + duration * 60000 <= end.getTime()) {
      const timeStr = format(current, "HH:mm");
      const endTimeDate = new Date(current.getTime() + duration * 60000);
      const endStr = format(endTimeDate, "HH:mm");

      // Check lunch overlap
      const isLunchOverlap = lunchStart && lunchEnd && (
        (timeStr < lunchEnd && endStr > lunchStart)
      );

      if (!isLunchOverlap) {
        const isTaken = existingAppointments?.some((apt: any) => {
          const aptStart = apt.start_time.slice(0, 5);
          const aptEnd = apt.end_time.slice(0, 5);
          if (selectedStaff && apt.staff_id !== selectedStaff.id) return false;
          return timeStr < aptEnd && endStr > aptStart;
        });
        
        if (!isTaken) slots.push(timeStr);
      }
      
      current = new Date(current.getTime() + baseInterval * 60000);
    }
    return slots;
  };
  const timeSlots = generateSlots();

  const handleBook = async () => {
    if (!business || selectedServices.length === 0 || !selectedDate || !selectedTime) return;
    setSubmitting(true);
    try {
      const { data: existingCustomer } = await supabase.from("customers").select("id").eq("business_id", business.id).eq("phone", customerPhone).maybeSingle();
      let customerId: string;
      if (existingCustomer) {
        customerId = existingCustomer.id;
        await supabase.from("customers").update({ name: customerName, last_visit: new Date().toISOString() }).eq("id", customerId);
      } else {
        const { data: newCustomer, error } = await supabase.from("customers").insert({ business_id: business.id, name: customerName, phone: customerPhone, last_visit: new Date().toISOString() }).select("id").single();
        if (error) throw error;
        customerId = newCustomer.id;
      }

      const servicesNames = selectedServices.map(s => s.name).join(", ");
      const endTime = format(new Date(parse(selectedTime, "HH:mm", new Date()).getTime() + totalDuration * 60000), "HH:mm");
      
      const { error } = await supabase.from("appointments").insert({
        business_id: business.id, 
        service_id: selectedServices[0].id, 
        staff_id: selectedStaff?.id || null, 
        customer_id: customerId,
        appointment_date: format(selectedDate, "yyyy-MM-dd"), 
        start_time: selectedTime, 
        end_time: endTime,
        notes: `Serviços: ${servicesNames}\nPagamento: ${paymentMethod === 'pix' ? 'Pix Antecipado' : 'No Local'}`
      });
      if (error) throw error;

      await supabase.from("webhook_events").insert({
        business_id: business.id, event_type: "appointment_created",
        payload: { customer_name: customerName, customer_phone: customerPhone, service: servicesNames, date: format(selectedDate, "yyyy-MM-dd"), time: selectedTime, staff: selectedStaff?.name || null },
      });

      // Formatador automático para garantir o código 55 (Brasil) no WhatsApp
      const formatWhatsApp = (phone: string | null | undefined) => {
        if (!phone) return "";
        let clean = phone.replace(/\D/g, "");
        if (clean.length === 10 || clean.length === 11) clean = "55" + clean;
        return clean;
      };

      // Disparar Webhook para automação do WhatsApp (Make/n8n)
      const webhookUrl = business.webhook_url || import.meta.env.VITE_N8N_WEBHOOK_URL || "http://187.77.46.175:5678/webhook/f8c603a9-ce9a-49eb-a2fd-6ba7bf0bad34";
      if (webhookUrl) {
        fetch("/api/webhook?url=" + encodeURIComponent(webhookUrl), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            event: "new_booking",
            business: {
              id: business.id,
              name: business.name,
              whatsapp: formatWhatsApp(business.phone),
              address: business.address,
              evolution_instance_id: business.evolution_instance_id
            },
            customer: {
              name: customerName,
              phone: formatWhatsApp(customerPhone)
            },
            appointment: {
              service: servicesNames,
              date: format(selectedDate, "yyyy-MM-dd"),
              time: selectedTime,
              duration: totalDuration,
              staff: selectedStaff?.name || "Sem preferência",
              paymentMethod
            }
          })
        }).catch(err => console.error("Webhook error:", err));
      }

      setStep(5);
    } catch (err: any) {
      toast.error("Erro ao agendar: " + err.message);
    }
    setSubmitting(false);
  };

  if (!business) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  const steps = ["Serviço", "Profissional", "Data", "Horário", "Dados"];

  const toggleService = (service: any) => {
    setSelectedServices(prev => {
      const isSelected = prev.find(s => s.id === service.id);
      if (isSelected) {
        return prev.filter(s => s.id !== service.id);
      } else {
        return [...prev, service];
      }
    });
  };

  return (
    <div className="min-h-screen bg-background relative selection:bg-primary/20">
      
      {/* Background Hero com Gradiente Dinâmico baseado na Cor da Marca */}
      <div 
        className="absolute top-0 left-0 right-0 h-[300px] z-0 opacity-80"
        style={{ 
          background: `linear-gradient(to bottom, ${brandColor}40, transparent)`,
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
      </div>

      <div className="relative z-10 max-w-lg mx-auto px-4 py-8">
        
        {/* Header Premium / Bento Header */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-card/80 backdrop-blur-xl border border-border/50 shadow-xl shadow-black/5 rounded-[2rem] p-6 mb-8 text-center"
        >
          {business.logo_url ? (
            <img src={business.logo_url} alt={business.name} className="w-48 h-48 mx-auto mb-6 object-contain" />
          ) : (
            <div className="w-40 h-40 rounded-2xl mx-auto mb-4 shadow-lg bg-accent/10 flex items-center justify-center">
              <span className="text-4xl font-display font-bold text-accent">{business.name.charAt(0)}</span>
            </div>
          )}
          
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-foreground">{business.name}</h1>
          {cleanDesc && <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{cleanDesc}</p>}
          
          <div className="flex flex-wrap items-center justify-center gap-2 mt-5">
            {business.phone && (
              <a href={`https://wa.me/55${business.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" 
                 className="flex items-center gap-1.5 px-3 py-1.5 bg-background border border-border rounded-full hover:border-primary/50 hover:bg-primary/5 transition-all text-sm font-medium">
                <Phone className="w-3.5 h-3.5 text-primary" /> Contato
              </a>
            )}
            {business.instagram_url && (
              <a href={business.instagram_url} target="_blank" rel="noopener noreferrer" 
                 className="flex items-center gap-1.5 px-3 py-1.5 bg-background border border-border rounded-full hover:border-primary/50 hover:bg-primary/5 transition-all text-sm font-medium">
                <Instagram className="w-3.5 h-3.5 text-primary" /> Instagram
              </a>
            )}
            {business.address && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-background border border-border rounded-full text-sm font-medium text-muted-foreground">
                <MapPin className="w-3.5 h-3.5" /> {business.address}
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Progress */}
      {step < 5 && (
        <div className="max-w-lg mx-auto px-4 py-4">
          <div className="flex items-center gap-1">
            {steps.map((s, i) => (
              <div key={s} className="flex-1">
                <div className={`h-1.5 rounded-full transition-all duration-500 ${i <= step ? "" : "bg-muted"}`}
                  style={i <= step ? { background: brandColor } : {}}
                />
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-1.5">
            {steps.map((s, i) => (
              <span key={s} className={`text-[10px] font-medium ${i <= step ? "" : "text-muted-foreground"}`}
                style={i <= step ? { color: brandColor } : {}}>
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Booking Flow */}

      <div className="relative z-10 max-w-lg mx-auto px-4 pb-12">
        <AnimatePresence mode="wait">
          {step > 0 && step < 5 && (
            <motion.div 
              initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
              className="mb-4"
            >
              <Button variant="ghost" size="sm" onClick={() => setStep(step - 1)} className="hover:bg-card">
                <ArrowLeft className="w-4 h-4 mr-1" /> Voltar
              </Button>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {/* Step 0: Select Service */}
          {step === 0 && (
            <motion.div 
              key="step0"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="font-display text-lg font-semibold mb-4 px-1">O que você deseja agendar?</h2>
              <div className="grid gap-3">
                {services?.map((s: any) => {
                  const isSelected = selectedServices.find(prev => prev.id === s.id);
                  return (
                    <button
                      key={s.id}
                      onClick={() => toggleService(s)}
                      className={`group w-full text-left bg-card/60 backdrop-blur-md border rounded-2xl p-5 transition-all ${isSelected ? "border-primary shadow-lg shadow-primary/5 ring-1 ring-primary" : "border-border/50 hover:border-primary/50 hover:bg-card"}`}
                    >
                      <div className="flex justify-between items-start gap-4 mb-2">
                        <div className="flex items-center gap-3">
                           <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${isSelected ? "bg-primary border-primary" : "border-gray-300"}`}>
                             {isSelected && <Check className="w-3 h-3 text-white" />}
                           </div>
                           <p className={`font-semibold text-base transition-colors ${isSelected ? "text-primary" : "group-hover:text-primary"}`}>{s.name}</p>
                        </div>
                        {s.price && (
                          <span className="shrink-0 inline-flex items-center gap-1 bg-primary/10 text-primary text-xs font-bold px-2 py-1 rounded-md">
                            <DollarSign className="w-3 h-3" /> {parseFloat(s.price).toFixed(2)}
                          </span>
                        )}
                      </div>
                      {s.description && <p className="text-sm text-muted-foreground mb-3 line-clamp-2 ml-8">{s.description}</p>}
                      <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground bg-muted/50 w-fit px-2 py-1 rounded-md ml-8">
                        <Clock className="w-3.5 h-3.5" /> {s.duration_minutes} min
                      </div>
                    </button>
                  );
                })}
              </div>
              
              <div className="fixed bottom-0 left-0 right-0 p-4 bg-background/80 backdrop-blur-lg border-t z-50 flex items-center justify-between gap-4 max-w-lg mx-auto">
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground font-bold uppercase tracking-wider">{selectedServices.length} selecionados</span>
                  <span className="text-lg font-black text-primary">R$ {totalPrice.toFixed(2)}</span>
                </div>
                <Button 
                  onClick={() => setStep(1)} 
                  disabled={selectedServices.length === 0}
                  className="btn-zap h-12 px-8 font-black gap-2 text-base shadow-xl"
                  style={{ backgroundColor: brandColor }}
                >
                  Continuar
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </div>
              <div className="h-24" /> {/* Spacer */}
            </motion.div>
          )}

          {/* Step 1: Select Staff (optional) */}
          {step === 1 && (
            <motion.div 
              key="step1"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="font-display text-lg font-semibold mb-4 px-1">Com quem você prefere?</h2>
              <div className="grid gap-3">
                <button
                  onClick={() => { setSelectedStaff(null); setStep(2); }}
                  className="w-full text-left bg-card/60 backdrop-blur-md border border-border/50 rounded-2xl p-5 hover:border-primary/50 hover:bg-card hover:shadow-lg hover:shadow-primary/5 transition-all flex items-center gap-4"
                >
                  <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg border bg-accent/10 border-accent/20 text-accent">
                    <UserIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-semibold text-base">Sem preferência</p>
                    <p className="text-sm text-muted-foreground">Qualquer profissional disponível</p>
                  </div>
                </button>

                {staff?.map((s: any) => (
                  <button
                    key={s.id}
                    onClick={() => { setSelectedStaff(s); setStep(2); }}
                    className="group w-full text-left bg-card/60 backdrop-blur-md border border-border/50 rounded-2xl p-5 hover:border-primary/50 hover:bg-card hover:shadow-lg hover:shadow-primary/5 transition-all flex items-center gap-4"
                  >
                    <div className="w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg border" style={{ backgroundColor: brandColor + "20", borderColor: brandColor + "30", color: brandColor }}>
                      {s.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-base group-hover:text-primary transition-colors">{s.name}</p>
                      {s.role && <p className="text-sm text-muted-foreground">{s.role}</p>}
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 2: Select Date */}
          {step === 2 && (
            <motion.div 
              key="step2"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="font-display text-lg font-semibold mb-4 px-1">Qual é a melhor data?</h2>
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                {availableDates.map(date => (
                  <button
                    key={date.toISOString()}
                    onClick={() => { setSelectedDate(date); setSelectedTime(null); setStep(3); }}
                    className="text-center bg-card/60 backdrop-blur-md border border-border/50 rounded-2xl p-4 hover:border-primary/50 hover:bg-card hover:shadow-lg hover:shadow-primary/5 transition-all"
                  >
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{format(date, "EEE", { locale: ptBR })}</p>
                    <p className="text-3xl font-display font-bold my-1">{format(date, "d")}</p>
                    <p className="text-xs font-medium text-muted-foreground capitalize">{format(date, "MMM", { locale: ptBR })}</p>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 3: Select Time */}
          {step === 3 && (
            <motion.div 
              key="step3"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="font-display text-lg font-semibold mb-4 px-1">
                Escolha o horário para {selectedDate && format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}
              </h2>
              <p className="text-xs text-muted-foreground font-bold mb-4 ml-1 uppercase tracking-widest bg-primary/5 w-fit px-2 py-1 rounded">Total: {totalDuration} min</p>
              {!timeSlots.length ? (
                <div className="bg-card/60 backdrop-blur-md border border-border/50 rounded-2xl p-8 text-center ring-1 ring-border/5">
                  <p className="text-muted-foreground font-medium">
                    Nenhum horário disponível neste dia para essa duração ({totalDuration} min).
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                  {timeSlots.map(time => (
                    <button
                      key={time}
                      onClick={() => { setSelectedTime(time); setStep(4); }}
                      className="bg-card/60 backdrop-blur-md border border-border/50 rounded-2xl p-4 text-base font-semibold hover:border-primary/50 hover:bg-card hover:shadow-lg hover:shadow-primary/5 hover:text-primary transition-all"
                    >
                      {time}
                    </button>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Step 4: Customer Info */}
          {step === 4 && (
            <motion.div 
              key="step4"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="font-display text-lg font-semibold mb-4 px-1">Seus dados para confirmar</h2>
              
              <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5 mb-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full -mr-12 -mt-12 blur-xl" />
                <div className="relative z-10 grid gap-2">
                  <div className="flex flex-col gap-1 mb-2">
                    <span className="text-xs font-black text-primary uppercase tracking-widest">Serviços Selecionados</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedServices.map(s => (
                        <span key={s.id} className="bg-white/80 border border-primary/20 px-2 py-0.5 rounded-md text-[10px] font-bold text-primary">{s.name}</span>
                      ))}
                    </div>
                  </div>
                  {selectedStaff && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-muted-foreground">Profissional</span>
                      <span className="text-sm font-semibold">{selectedStaff.name}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-muted-foreground">Quando</span>
                    <span className="text-sm font-semibold">{selectedDate && format(selectedDate, "dd/MM")}, às {selectedTime}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-primary/10 mt-1">
                    <span className="text-sm font-black text-primary">Total</span>
                    <span className="text-lg font-black text-primary">R$ {totalPrice.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="bg-card/60 backdrop-blur-md border border-border/50 rounded-2xl p-6 space-y-5">
                <div className="space-y-2.5">
                  <Label>Qual é o seu nome?</Label>
                  <Input value={customerName} onChange={e => setCustomerName(e.target.value)} required className="h-12 bg-background/50" placeholder="Nome completo" />
                </div>
                <div className="space-y-2.5">
                  <Label>Qual é o seu WhatsApp?</Label>
                  <Input value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} placeholder="(11) 99999-9999" required className="h-12 bg-background/50" />
                </div>
                
                <div className="pt-4 border-t border-border/50 space-y-3">
                  <Label>Forma de Pagamento</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => setPaymentMethod("dinheiro")}
                      className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border transition-all ${paymentMethod === "dinheiro" ? "border-primary bg-primary/5 text-primary shadow-sm" : "border-border hover:bg-muted"}`}
                    >
                      <DollarSign className="w-5 h-5" />
                      <span className="text-sm font-semibold">No Local</span>
                    </button>
                    {pixKey && (
                      <button
                        onClick={() => setPaymentMethod("pix")}
                        className={`flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl border transition-all ${paymentMethod === "pix" ? "border-primary bg-primary/5 text-primary shadow-sm" : "border-border hover:bg-muted"}`}
                      >
                        <QrCode className="w-5 h-5" />
                        <span className="text-sm font-semibold">Pix Antecipado</span>
                      </button>
                    )}
                  </div>
                  
                  {paymentMethod === "pix" && pixKey && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-3 p-4 bg-primary/5 rounded-xl border border-primary/20">
                      <p className="text-sm font-semibold mb-2">Chave Pix da Empresa:</p>
                      <div className="flex items-center gap-2">
                        <Input readOnly value={pixKey} className="bg-background font-mono text-sm" />
                        <Button 
                          variant="secondary" 
                          onClick={() => { navigator.clipboard.writeText(pixKey); toast.success("Chave Pix copiada!"); }}
                        >
                          Copiar
                        </Button>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2 text-center text-primary/80">Faça o pagamento no seu banco e mostre o comprovante no local.</p>
                    </motion.div>
                  )}
                </div>

                <Button
                  className="w-full h-12 text-base font-semibold shadow-lg shadow-black/5 mt-2"
                  onClick={handleBook}
                  disabled={!customerName || !customerPhone || submitting}
                  style={{ backgroundColor: brandColor }}
                >
                  {submitting ? "Agendando..." : "Confirmar Agendamento"}
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 5: Confirmation */}
          {step === 5 && (
            <motion.div 
              key="step5"
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              className="text-center py-12 px-6 bg-card/60 backdrop-blur-md border border-border/50 rounded-[2rem] shadow-xl shadow-black/5"
            >
              <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-green-500" />
              </div>
              <h2 className="font-display text-2xl font-bold mb-3">Tudo certo!</h2>
              <p className="text-base text-muted-foreground mb-8">
                Seu agendamento para <strong className="text-foreground">{selectedServices.map(s => s.name).join(", ")}</strong> foi confirmado para o dia <strong className="text-foreground">{selectedDate && format(selectedDate, "dd/MM/yyyy")}</strong> às <strong className="text-foreground">{selectedTime}</strong>.
              </p>
              <Button 
                variant="outline" 
                className="h-12 px-8 rounded-xl font-semibold hover:bg-card"
                onClick={() => { setStep(0); setSelectedServices([]); setSelectedStaff(null); setSelectedDate(null); setSelectedTime(null); setCustomerName(""); setCustomerPhone(""); setPaymentMethod("dinheiro"); }}
              >
                Fazer novo agendamento
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default PublicBooking;
