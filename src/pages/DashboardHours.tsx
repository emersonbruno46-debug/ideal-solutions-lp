import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useBusiness } from "@/hooks/useBusiness";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Clock, Save, Coffee, Timer } from "lucide-react";

const DAYS = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
const DAY_EMOJI = ["🌙", "💼", "💼", "💼", "💼", "💼", "🌴"];

interface DayHours {
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_active: boolean;
}

const DashboardHours = () => {
  const { data: business } = useBusiness();
  const queryClient = useQueryClient();
  const [hours, setHours] = useState<DayHours[]>(
    DAYS.map((_, i) => ({
      day_of_week: i,
      start_time: "09:00",
      end_time: "18:00",
      is_active: i >= 1 && i <= 5,
    }))
  );

  const [lunchTime, setLunchTime] = useState({ start: "12:00", end: "13:00", enabled: false });
  const [baseInterval, setBaseInterval] = useState(10);

  const { data: savedHours } = useQuery({
    queryKey: ["working-hours", business?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("working_hours").select("*").eq("business_id", business!.id);
      if (error) throw error;
      return data;
    },
    enabled: !!business,
  });

  useEffect(() => {
    if (savedHours?.length) {
      setHours(prev =>
        prev.map(day => {
          const saved = savedHours.find((s: any) => s.day_of_week === day.day_of_week);
          return saved ? { ...day, start_time: saved.start_time.slice(0, 5), end_time: saved.end_time.slice(0, 5), is_active: saved.is_active } : day;
        })
      );
    }
  }, [savedHours]);

  useEffect(() => {
    if (business?.description) {
      const lunchMatch = business.description.match(/\[LUNCH:(.*?)-(.*?)\]/);
      if (lunchMatch) {
        setLunchTime({ start: lunchMatch[1], end: lunchMatch[2], enabled: true });
      }
      const intervalMatch = business.description.match(/\[INTERVAL:(\d+)\]/);
      if (intervalMatch) {
        setBaseInterval(parseInt(intervalMatch[1]));
      }
    }
  }, [business]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      // Save working hours
      for (const day of hours) {
        const existing = savedHours?.find((s: any) => s.day_of_week === day.day_of_week);
        if (existing) {
          await supabase.from("working_hours").update({
            start_time: day.start_time, end_time: day.end_time, is_active: day.is_active,
          }).eq("id", existing.id);
        } else {
          await supabase.from("working_hours").insert({
            business_id: business!.id, day_of_week: day.day_of_week,
            start_time: day.start_time, end_time: day.end_time, is_active: day.is_active,
          });
        }
      }

      // Update global settings in description
      let newDesc = business?.description || "";
      
      // Clean up old tags first to avoid duplicates
      newDesc = newDesc.replace(/\[LUNCH:.*?\]/g, "").replace(/\[INTERVAL:.*?\]/g, "").trim();

      if (lunchTime.enabled) {
        newDesc += `\n[LUNCH:${lunchTime.start}-${lunchTime.end}]`;
      }
      newDesc += `\n[INTERVAL:${baseInterval}]`;

      const { error } = await supabase.from("businesses").update({ description: newDesc.trim() }).eq("id", business!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["working-hours"] });
      queryClient.invalidateQueries({ queryKey: ["business"] });
      toast.success("Horários salvos!");
    },
    onError: (err: any) => toast.error(err.message),
  });

  const updateDay = (index: number, field: string, value: any) => {
    setHours(prev => prev.map((d, i) => (i === index ? { ...d, [field]: value } : d)));
  };

  return (
    <div className="pb-20">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div className="rounded-3xl bg-gradient-to-r from-[#132239] to-[#1a2d45] p-4 flex items-center gap-3 w-full sm:w-auto">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5 text-[#2AD467]" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-black tracking-tight text-white truncate">Horários de Atendimento</h1>
            <p className="text-gray-400 text-xs font-medium">Configure quando você está disponível</p>
          </div>
        </div>
        <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending} className="btn-zap h-11 px-6 font-bold w-full sm:w-auto">
          <Save className="w-4 h-4 mr-2" />
          {saveMutation.isPending ? "Salvando..." : "Salvar alterações"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configurações Globais */}
        <div className="lg:col-span-1 space-y-6">
          <div className="card-premium h-fit">
            <h2 className="flex items-center gap-2 font-display font-black text-lg mb-6 text-[#132239]">
              <Coffee className="w-5 h-5 text-primary" /> Intervalo de Almoço
            </h2>
            <div className="space-y-6">
              <div className="flex items-center justify-between bg-gray-50 p-4 rounded-2xl border border-gray-100">
                <Label className="font-bold text-gray-600">Ativar intervalo?</Label>
                <Switch checked={lunchTime.enabled} onCheckedChange={v => setLunchTime(l => ({ ...l, enabled: v }))} className="data-[state=checked]:bg-primary" />
              </div>

              {lunchTime.enabled && (
                <div className="grid grid-cols-1 gap-4 animate-in fade-in slide-in-from-top-2 duration-300">
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase font-black tracking-widest text-gray-400 ml-1">Início do Almoço</Label>
                    <Input type="time" value={lunchTime.start} onChange={e => setLunchTime(l => ({ ...l, start: e.target.value }))} className="h-12 rounded-xl font-bold" />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-[10px] uppercase font-black tracking-widest text-gray-400 ml-1">Fim do Almoço</Label>
                    <Input type="time" value={lunchTime.end} onChange={e => setLunchTime(l => ({ ...l, end: e.target.value }))} className="h-12 rounded-xl font-bold" />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="card-premium h-fit">
            <h2 className="flex items-center gap-2 font-display font-black text-lg mb-6 text-[#132239]">
              <Timer className="w-5 h-5 text-primary" /> Intervalo entre Slots
            </h2>
            <div className="space-y-4">
              <p className="text-sm text-gray-500 font-medium leading-relaxed">
                Define a "quebra" de horários na sua agenda. Serviços serão encaixados seguindo este intervalo.
              </p>
              
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100 space-y-3">
                <Label className="text-[10px] uppercase font-black tracking-widest text-gray-400 ml-1">Intervalo Personalizado (min)</Label>
                <div className="flex items-center gap-3">
                  <Input 
                    type="number" 
                    value={baseInterval} 
                    onChange={e => setBaseInterval(parseInt(e.target.value) || 0)} 
                    className="h-12 rounded-xl font-bold bg-white"
                    min="1"
                  />
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                    <Timer className="w-5 h-5" />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-2">
                {[10, 15, 30, 60].map((v) => (
                  <button
                    key={v}
                    onClick={() => setBaseInterval(v)}
                    className={`h-10 rounded-lg text-xs font-bold transition-all ${baseInterval === v ? "bg-primary text-white" : "bg-white border border-gray-100 text-gray-400 hover:border-primary/50"}`}
                  >
                    {v}m
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Horários por Dia */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="font-display font-black text-lg mb-2 text-[#132239] ml-1">Horários por dia</h2>
          {hours.map((day, i) => (
            <div key={i} className={`card-premium !p-4 flex flex-col sm:flex-row sm:items-center gap-4 transition-all ${!day.is_active ? "opacity-50 grayscale bg-gray-50/50" : ""}`}>
              <div className="flex items-center gap-4 w-full sm:w-auto">
                <Switch checked={day.is_active} onCheckedChange={v => updateDay(i, "is_active", v)} className="data-[state=checked]:bg-[#2AD467]" />
                <div className="w-10 h-10 rounded-xl bg-gray-100 flex items-center justify-center text-xl shrink-0">
                   {DAY_EMOJI[i]}
                </div>
                <span className={`flex-1 sm:w-28 text-base font-black ${!day.is_active ? "text-gray-400" : "text-[#132239]"}`}>
                  {DAYS[i]}
                </span>
              </div>
              {day.is_active ? (
                <div className="flex items-center justify-between sm:justify-start gap-2 sm:gap-4 w-full sm:flex-1">
                  <Input type="time" value={day.start_time} onChange={e => updateDay(i, "start_time", e.target.value)} className="flex-1 sm:w-28 h-10 rounded-xl font-bold text-center" />
                  <span className="text-gray-400 font-bold uppercase text-[10px] tracking-widest shrink-0">até</span>
                  <Input type="time" value={day.end_time} onChange={e => updateDay(i, "end_time", e.target.value)} className="flex-1 sm:w-28 h-10 rounded-xl font-bold text-center" />
                </div>
              ) : (
                <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest bg-gray-100 px-4 py-2 rounded-full w-fit">Indisponível</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DashboardHours;

