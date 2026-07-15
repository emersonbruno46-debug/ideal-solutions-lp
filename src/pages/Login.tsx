import { useState, useEffect } from "react";
import Logo from "@/components/Logo";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { LogIn } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/dashboard");
      }
    });
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      toast.error(error.message);
    } else {
      navigate("/dashboard");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 relative overflow-hidden">
      <div className="absolute inset-0 gradient-hero" />
      <div className="absolute top-20 right-20 w-80 h-80 bg-[#2AD467]/5 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-[#06C98E]/5 rounded-full blur-3xl animate-float" style={{ animationDelay: "3s" }} />
      
      <div className="w-full max-w-sm relative z-10">
        <Link to="/" className="block text-center mb-8">
          <Logo size="lg" />
        </Link>
        <div className="card-premium !p-8">
          <div className="flex items-center gap-4 mb-8 text-center justify-center flex-col">
            <div className="w-14 h-14 rounded-2xl btn-zap flex items-center justify-center shadow-none">
              <LogIn className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="font-display text-2xl font-black">Bem-vindo de volta</h1>
              <p className="text-sm text-gray-500 font-medium">Acesse sua agenda para começar</p>
            </div>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <Label htmlFor="email" className="text-sm font-medium">Email</Label>
              <Input id="email" type="email" value={email} onChange={e => setEmail(e.target.value)} className="mt-1.5 h-11 rounded-xl" required />
            </div>
            <div>
              <Label htmlFor="password" className="text-sm font-medium">Senha</Label>
              <Input id="password" type="password" value={password} onChange={e => setPassword(e.target.value)} className="mt-1.5 h-11 rounded-xl" required />
            </div>
            <Button type="submit" className="w-full h-14 btn-zap text-lg font-bold" disabled={loading}>
              {loading ? "Entrando..." : "Entrar na minha conta"}
            </Button>
          </form>
          <p className="text-sm text-gray-500 text-center mt-8 font-medium">
            Não tem uma conta? <Link to="/signup" className="text-[#2AD467] font-black hover:underline">Criar agora gratuitamente</Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
