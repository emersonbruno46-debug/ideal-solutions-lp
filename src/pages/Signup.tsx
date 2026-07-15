import { useState } from "react";
import Logo from "@/components/Logo";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { UserPlus, UserCircle, Building2 } from "lucide-react";

const Signup = () => {
  const [role, setRole] = useState<"empresa" | "cliente">("empresa");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const generateSlug = (name: string) =>
    name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error(role === "empresa" ? "Nome do negócio é obrigatório" : "Nome é obrigatório");
      return;
    }
    if (!phone.replace(/\D/g, '')) {
      toast.error("Contato (WhatsApp) é obrigatório");
      return;
    }

    setLoading(true);
    
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { 
        data: { role, phone, full_name: name },
        emailRedirectTo: window.location.origin + "/login"
      },
    });

    if (authError) {
      toast.error(authError.message);
      setLoading(false);
      return;
    }

    if (authData.user) {
      if (role === "empresa") {
        const slug = generateSlug(name);
        const { error: bizError } = await supabase.rpc("create_business_for_user" as any, {
          _user_id: authData.user.id,
          _name: name,
          _slug: slug,
        });

        if (bizError) {
          toast.error("Erro ao criar negócio: " + bizError.message);
        } else {
          toast.success("Conta criada! (Pode ser necessário confirmar o email na caixa de entrada)");
          navigate("/login");
        }
      } else {
        toast.success("Conta cliente criada com sucesso!");
        navigate("/login");
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 gradient-hero" />
      <div className="absolute top-20 left-20 w-80 h-80 bg-[#2AD467]/5 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 right-20 w-96 h-96 bg-[#06C98E]/5 rounded-full blur-3xl animate-float" style={{ animationDelay: "3s" }} />

      <div className="w-full max-w-sm relative z-10 py-10">
        <Link to="/" className="block text-center mb-6">
          <Logo size="lg" />
        </Link>
        <div className="glass-card rounded-2xl p-6 sm:p-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
              <UserPlus className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-display text-xl font-bold">Criar Conta</h1>
              <p className="text-xs text-muted-foreground">Rápido e fácil</p>
            </div>
          </div>
          
          <div className="flex gap-2 p-1 bg-muted/50 rounded-xl mb-6">
            <button
              type="button"
              onClick={() => setRole("empresa")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-lg transition-all ${role === "empresa" ? "bg-background shadow text-primary" : "text-muted-foreground hover:text-foreground"}`}
            >
              <Building2 className="w-4 h-4" /> Empresa
            </button>
            <button
              type="button"
              onClick={() => setRole("cliente")}
              className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-lg transition-all ${role === "cliente" ? "bg-background shadow text-primary" : "text-muted-foreground hover:text-foreground"}`}
            >
              <UserCircle className="w-4 h-4" /> Cliente
            </button>
          </div>

          <form onSubmit={handleSignup} className="space-y-4">
            <div>
              <Label htmlFor="name" className="text-sm font-medium">{role === "empresa" ? "Nome da Empresa" : "Seu Nome Completo"}</Label>
              <Input id="name" value={name} onChange={e => setName(e.target.value)} placeholder={role === "empresa" ? "Ex: Barbearia Vip" : "Ex: João Silva"} className="mt-1 h-11 rounded-xl" required />
            </div>
            <div>
              <Label htmlFor="phone" className="text-sm font-medium">WhatsApp</Label>
              <Input id="phone" value={phone} onChange={e => setPhone(e.target.value)} placeholder="(11) 99999-9999" className="mt-1 h-11 rounded-xl" required />
            </div>
            <div>
              <Label htmlFor="email" className="text-sm font-medium">Email</Label>
              <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} className="mt-1 h-11 rounded-xl" required />
            </div>
            <div>
              <Label htmlFor="password" className="text-sm font-medium">Senha</Label>
              <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} minLength={6} className="mt-1 h-11 rounded-xl" required />
            </div>
            <Button type="submit" className="w-full h-11 rounded-xl gradient-primary border-0 font-semibold shadow-lg hover:shadow-xl transition-all" disabled={loading}>
              {loading ? "Criando..." : "Criar Conta"}
            </Button>
          </form>
          <p className="text-sm text-muted-foreground text-center mt-6">
            Já tem conta? <Link to="/login" className="text-primary font-semibold hover:underline">Entrar</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
