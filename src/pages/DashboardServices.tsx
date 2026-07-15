import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useBusiness } from "@/hooks/useBusiness";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Scissors } from "lucide-react";
import { toast } from "sonner";

const DashboardServices = () => {
  const { data: business } = useBusiness();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: "", duration_minutes: 30, price: "", description: "" });

  const { data: services } = useQuery({
    queryKey: ["services", business?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("services").select("*").eq("business_id", business!.id).order("created_at");
      if (error) throw error;
      return data;
    },
    enabled: !!business,
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        business_id: business!.id,
        name: form.name,
        duration_minutes: form.duration_minutes,
        price: form.price ? parseFloat(form.price) : null,
        description: form.description || null,
      };
      if (editing) {
        const { error } = await supabase.from("services").update(payload).eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("services").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      setOpen(false); setEditing(null);
      setForm({ name: "", duration_minutes: 30, price: "", description: "" });
      toast.success(editing ? "Serviço atualizado!" : "Serviço criado!");
    },
    onError: (err: any) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("services").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["services"] });
      toast.success("Serviço removido!");
    },
  });

  const openEdit = (service: any) => {
    setEditing(service);
    setForm({ name: service.name, duration_minutes: service.duration_minutes, price: service.price?.toString() ?? "", description: service.description ?? "" });
    setOpen(true);
  };

  const openNew = () => {
    setEditing(null);
    setForm({ name: "", duration_minutes: 30, price: "", description: "" });
    setOpen(true);
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="rounded-3xl bg-gradient-to-r from-[#132239] to-[#1a2d45] p-4 flex items-center gap-3 w-full md:w-auto">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
            <Scissors className="w-5 h-5 text-[#2AD467]" />
          </div>
          <h1 className="font-display text-2xl font-black tracking-tight text-white truncate">O que você oferece</h1>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={openNew} className="btn-zap h-11 px-6 font-bold w-full md:w-auto">
              <Plus className="w-4 h-4 mr-2" /> Adicionar serviço
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-2xl">
            <DialogHeader>
              <DialogTitle className="font-display font-bold">{editing ? "Editar Serviço" : "Novo Serviço"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={e => { e.preventDefault(); saveMutation.mutate(); }} className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Nome</Label>
                <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="mt-1.5 h-11 rounded-xl" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Duração (min)</Label>
                  <Input type="number" value={form.duration_minutes} onChange={e => setForm(f => ({ ...f, duration_minutes: parseInt(e.target.value) || 30 }))} min={5} className="mt-1.5 h-11 rounded-xl" required />
                </div>
                <div>
                  <Label className="text-sm font-medium">Preço (R$)</Label>
                  <Input type="number" step="0.01" value={form.price} onChange={e => setForm(f => ({ ...f, price: e.target.value }))} placeholder="Opcional" className="mt-1.5 h-11 rounded-xl" />
                </div>
              </div>
              <div>
                <Label className="text-sm font-medium">Descrição</Label>
                <Input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Opcional" className="mt-1.5 h-11 rounded-xl" />
              </div>
              <Button type="submit" className="w-full h-11 rounded-xl gradient-primary border-0 font-semibold text-white shadow-md hover:shadow-lg transition-all" disabled={saveMutation.isPending}>
                {saveMutation.isPending ? "Salvando..." : "Salvar e continuar"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {!services?.length ? (
        <div className="card-interactive rounded-2xl p-10 text-center">
          <p className="text-gray-500 font-bold text-xl mb-2">Você ainda não tem agendamentos.</p>
          <p className="text-gray-400 max-w-sm mx-auto mb-8 font-medium">
            Compartilhe seu link e comece a receber clientes agora.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {services.map((s: any) => (
            <div key={s.id} className="card-premium !p-3 md:!p-6 flex items-center gap-4 md:gap-6">
              <div className="w-12 h-12 rounded-2xl bg-[#2AD467]/10 flex items-center justify-center text-[#2AD467]">
                <Scissors className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-black text-lg">{s.name}</p>
                <p className="text-sm text-gray-400 font-bold mt-1">
                  {s.duration_minutes} min
                  {s.price ? ` • R$ ${parseFloat(s.price).toFixed(2)}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="rounded-2xl h-10 w-10" onClick={() => openEdit(s)}>
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="rounded-2xl h-10 w-10 hover:bg-red-50 hover:text-red-500" onClick={() => deleteMutation.mutate(s.id)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DashboardServices;
