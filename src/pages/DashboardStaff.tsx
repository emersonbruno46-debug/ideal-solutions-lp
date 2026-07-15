import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useBusiness } from "@/hooks/useBusiness";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Users } from "lucide-react";
import { toast } from "sonner";

const DashboardStaff = () => {
  const { data: business } = useBusiness();
  const queryClient = useQueryClient();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [form, setForm] = useState({ name: "", role: "" });

  const { data: staff } = useQuery({
    queryKey: ["staff", business?.id],
    queryFn: async () => {
      const { data, error } = await supabase.from("staff_members").select("*").eq("business_id", business!.id).order("created_at");
      if (error) throw error;
      return data;
    },
    enabled: !!business,
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = { business_id: business!.id, name: form.name, role: form.role || null };
      if (editing) {
        const { error } = await supabase.from("staff_members").update(payload).eq("id", editing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("staff_members").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff"] });
      setOpen(false); setEditing(null); setForm({ name: "", role: "" });
      toast.success(editing ? "Profissional atualizado!" : "Profissional adicionado!");
    },
    onError: (err: any) => toast.error(err.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("staff_members").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["staff"] });
      toast.success("Profissional removido!");
    },
  });

  const openEdit = (s: any) => {
    setEditing(s); setForm({ name: s.name, role: s.role ?? "" }); setOpen(true);
  };

  const colors = ["from-primary to-accent", "from-accent to-primary", "from-primary/80 to-primary", "from-accent/80 to-accent"];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="rounded-3xl bg-gradient-to-r from-[#132239] to-[#1a2d45] p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
            <Users className="w-5 h-5 text-[#2AD467]" />
          </div>
          <h1 className="font-display text-2xl font-extrabold tracking-tight text-white">Equipe</h1>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditing(null); setForm({ name: "", role: "" }); setOpen(true); }} className="rounded-xl gradient-primary border-0 shadow-lg hover:shadow-xl transition-all">
              <Plus className="w-4 h-4 mr-2" /> Novo
            </Button>
          </DialogTrigger>
          <DialogContent className="rounded-2xl">
            <DialogHeader>
              <DialogTitle className="font-display font-bold">{editing ? "Editar" : "Novo"} Profissional</DialogTitle>
            </DialogHeader>
            <form onSubmit={e => { e.preventDefault(); saveMutation.mutate(); }} className="space-y-4">
              <div>
                <Label className="text-sm font-medium">Nome</Label>
                <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="mt-1.5 h-11 rounded-xl" required />
              </div>
              <div>
                <Label className="text-sm font-medium">Função</Label>
                <Input value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))} placeholder="Ex: Barbeiro, Manicure" className="mt-1.5 h-11 rounded-xl" />
              </div>
              <Button type="submit" className="w-full h-11 rounded-xl gradient-primary border-0 font-semibold" disabled={saveMutation.isPending}>
                {saveMutation.isPending ? "Salvando..." : "Salvar"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {!staff?.length ? (
        <div className="card-interactive rounded-2xl p-10 text-center">
          <p className="text-4xl mb-3">🧑‍🤝‍🧑</p>
          <p className="text-muted-foreground text-sm font-medium">Nenhum profissional cadastrado.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {staff.map((s: any, i: number) => (
            <div key={s.id} className="card-interactive rounded-2xl p-5 flex items-center gap-4">
              <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${colors[i % colors.length]} flex items-center justify-center text-primary-foreground font-bold text-sm shadow-lg`}>
                {s.name.charAt(0)}
              </div>
              <div className="flex-1">
                <p className="font-semibold text-sm">{s.name}</p>
                {s.role && <p className="text-xs text-muted-foreground mt-0.5">{s.role}</p>}
              </div>
              <Button variant="ghost" size="icon" className="rounded-xl" onClick={() => openEdit(s)}><Pencil className="w-4 h-4" /></Button>
              <Button variant="ghost" size="icon" className="rounded-xl hover:bg-destructive/10 hover:text-destructive" onClick={() => deleteMutation.mutate(s.id)}><Trash2 className="w-4 h-4" /></Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DashboardStaff;
