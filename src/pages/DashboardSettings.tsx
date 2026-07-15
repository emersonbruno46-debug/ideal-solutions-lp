import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useBusiness } from "@/hooks/useBusiness";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { Store, Palette, Phone, Link as LinkIcon, Save, Image as ImageIcon, Bot, Settings } from "lucide-react";

const DashboardSettings = () => {
  const { data: business } = useBusiness();
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    name: "", description: "", pixKey: "", phone: "", address: "", instagram_url: "", brand_color: "#25D366",
    webhook_url: "",
  });
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [isConnectingWhatsApp, setIsConnectingWhatsApp] = useState(false);
  const [whatsappState, setWhatsappState] = useState<string | null>(null);

  useEffect(() => {
    const checkStatus = async () => {
      if (business?.evolution_instance_id) {
        try {
          const res = await fetch(`/api/evolution?path=/instance/connectionState/${business.evolution_instance_id}`);
          const data = await res.json();
          if (data?.instance?.state) {
            setWhatsappState(data.instance.state);
          } else {
            setWhatsappState("unknown");
          }
        } catch (e) {
          console.error("Failed to check WhatsApp status", e);
        }
      }
    };
    checkStatus();
    // Poll status every 10s if we have an instance id but no qr code
    const interval = setInterval(() => {
      if (!qrCode && business?.evolution_instance_id) checkStatus();
    }, 10000);
    return () => clearInterval(interval);
  }, [business?.evolution_instance_id, qrCode]);

  useEffect(() => {
    if (business) {
      const dbDesc = business.description ?? "";
      const pixMatch = dbDesc.match(/\[PIX:(.*?)\]/);
      const pixKey = pixMatch ? pixMatch[1] : "";
      
      // Clean all tags for the UI
      const cleanDesc = dbDesc
        .replace(/\[PIX:.*?\]/g, "")
        .replace(/\[LUNCH:.*?\]/g, "")
        .replace(/\[INTERVAL:.*?\]/g, "")
        .trim();

      setForm({
        name: business.name ?? "", description: cleanDesc, pixKey,
        phone: business.phone ?? "", address: business.address ?? "",
        instagram_url: business.instagram_url ?? "", brand_color: business.brand_color ?? "#25D366",
        webhook_url: business.webhook_url ?? "",
      });
    }
  }, [business]);

  const saveMutation = useMutation({
    mutationFn: async () => {
      // Preserve existing tags except PIX which is in the form
      let finalDescription = form.description;
      
      if (business?.description) {
        const lunchMatch = business.description.match(/\[LUNCH:.*?\]/);
        const intervalMatch = business.description.match(/\[INTERVAL:.*?\]/);
        if (lunchMatch) finalDescription += `\n${lunchMatch[0]}`;
        if (intervalMatch) finalDescription += `\n${intervalMatch[0]}`;
      }
      
      if (form.pixKey) {
        finalDescription += `\n[PIX:${form.pixKey}]`;
      }

      const { pixKey, ...toSave } = form; // remove virtual field
      const { error } = await supabase.from("businesses").update({ ...toSave, description: finalDescription.trim() }).eq("id", business!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["business"] });
      toast.success("Configurações salvas!");
    },
    onError: (err: any) => toast.error(err.message),
  });

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !business) return;
    const ext = file.name.split(".").pop();
    const path = `${business.id}/logo.${ext}`;
    const { error: uploadError } = await supabase.storage.from("business-assets").upload(path, file, { upsert: true });
    if (uploadError) { toast.error(uploadError.message); return; }
    const { data: { publicUrl } } = supabase.storage.from("business-assets").getPublicUrl(path);
    const cacheBusterUrl = `${publicUrl}?v=${new Date().getTime()}`;
    await supabase.from("businesses").update({ logo_url: cacheBusterUrl }).eq("id", business.id);
    queryClient.invalidateQueries({ queryKey: ["business"] });
    toast.success("Logo atualizada!");
  };

  const connectWhatsApp = async () => {
    if (!business) return;

    setIsConnectingWhatsApp(true);
    setQrCode(null);
    
    try {
      const instanceName = `b_${business.id.slice(0, 8)}`;

      // 1. Limpeza profunda
      await fetch(`/api/evolution?path=/instance/delete/${instanceName}`, { method: "DELETE" }).catch(() => {});
      await new Promise(resolve => setTimeout(resolve, 2000));

      // 2. Criar instância
      const res = await fetch(`/api/evolution?path=/instance/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          instanceName, 
          qrcode: true, 
          integration: "WHATSAPP-BAILEYS" 
        })
      });

      let data = await res.json();
      console.log("[Evolution] Create response:", JSON.stringify(data).slice(0, 500));
      await new Promise(resolve => setTimeout(resolve, 3000));

      // 3. Se for via QR Code
      if (data.instance && data.instance.status === "connecting" && (!data.qrcode || !data.qrcode.base64)) {
        let attempts = 0;
        let qrFound = false;
        while (attempts < 5 && !qrFound) {
          await new Promise(resolve => setTimeout(resolve, 2000));
          const connectRes = await fetch(`/api/evolution?path=/instance/connect/${instanceName}`, { method: "GET" });
          const connectData = await connectRes.json();
          console.log(`[Evolution] Connect attempt ${attempts + 1}:`, JSON.stringify(connectData).slice(0, 500));
          if (connectData.base64 || (connectData.qrcode && connectData.qrcode.base64)) {
            data.qrcode = { base64: connectData.base64 || connectData.qrcode.base64 };
            qrFound = true;
          }
          attempts++;
        }
      }

      if (data.qrcode && data.qrcode.base64) {
        setQrCode(data.qrcode.base64);
        await supabase.from("businesses").update({ evolution_instance_id: instanceName }).eq("id", business.id);
        queryClient.invalidateQueries({ queryKey: ["business"] });
        toast.success("Escaneie o QR Code para conectar!");
      } else if (data.instance && data.instance.status === "open") {
        toast.success("Este número já está conectado!");
        await supabase.from("businesses").update({ evolution_instance_id: instanceName }).eq("id", business.id);
        queryClient.invalidateQueries({ queryKey: ["business"] });
      } else {
        console.log("[Evolution] Final state - no QR found:", JSON.stringify(data).slice(0, 500));
        toast.error("Falha ao conectar. Tente novamente.");
      }
    } catch (e: any) {
      toast.error("Erro de conexão: " + e.message);
    } finally {
      setIsConnectingWhatsApp(false);
    }
  };

  const disconnectWhatsApp = async () => {
    if (!business || !business.evolution_instance_id) return;
    try {
      await fetch(`/api/evolution?path=/instance/delete/${business.evolution_instance_id}`, {
        method: "DELETE"
      });
      
      await supabase.from("businesses").update({ evolution_instance_id: null }).eq("id", business.id);
      queryClient.invalidateQueries({ queryKey: ["business"] });
      setQrCode(null);
      toast.success("WhatsApp desconectado!");
    } catch (e: any) {
      toast.error("Erro ao desconectar: " + e.message);
    }
  };

  return (
    <div className="pb-24">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
        <div className="rounded-3xl bg-gradient-to-r from-[#132239] to-[#1a2d45] p-5 flex items-center gap-4 flex-1">
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
            <Settings className="w-5 h-5 text-[#2AD467]" />
          </div>
          <div>
            <h1 className="font-display text-2xl font-black text-white">Configurações</h1>
            <p className="text-gray-400 font-medium text-sm mt-0.5">Personalize a identidade da sua página pública</p>
          </div>
        </div>
        <Button onClick={() => saveMutation.mutate()} disabled={saveMutation.isPending} className="btn-zap h-12 px-8 font-bold gap-2">
          <Save className="w-4 h-4" />
          {saveMutation.isPending ? "Salvando..." : "Salvar Alterações"}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-5xl">
        
        {/* Coluna Esquerda */}
        <div className="space-y-6">
          
          {/* Sessão de Identidade Visual */}
          <div className="card-premium">
            <h2 className="flex items-center gap-2 font-display font-semibold text-lg mb-4">
              <Palette className="w-5 h-5 text-primary" /> Identidade Visual
            </h2>
            <div className="space-y-5">
              <div>
                <Label>Logo do Negócio</Label>
                <div className="flex items-center gap-4 mt-2">
                  <div className="w-16 h-16 rounded-lg bg-accent/10 flex items-center justify-center border border-border overflow-hidden shrink-0">
                    {business?.logo_url ? (
                      <img src={business.logo_url} alt="Logo" className="w-full h-full object-contain" />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1">
                    <Input type="file" accept="image/*" onChange={handleLogoUpload} className="text-xs sm:text-sm" />
                    <p className="text-xs text-muted-foreground mt-1.5">Formatos JPG ou PNG. Recomendado 400x400px.</p>
                  </div>
                </div>
              </div>

              <div>
                <Label>Cor da Marca (Botões e Destaques)</Label>
                <div className="flex items-center gap-3 mt-1.5 p-1 bg-background border border-border rounded-lg max-w-[200px]">
                  <input type="color" value={form.brand_color} onChange={e => setForm(f => ({ ...f, brand_color: e.target.value }))} className="w-10 h-10 rounded box-border p-1 cursor-pointer" />
                  <Input value={form.brand_color.toUpperCase()} readOnly className="border-0 focus-visible:ring-0 shadow-none font-mono text-sm uppercase" />
                </div>
              </div>
            </div>
          </div>

          {/* Sessão de Informações Básicas */}
          <div className="card-premium">
            <h2 className="flex items-center gap-2 font-display font-semibold text-lg mb-4">
              <Store className="w-5 h-5 text-primary" /> Sobre o Negócio
            </h2>
            <div className="space-y-4">
              <div>
                <Label>Nome do Negócio</Label>
                <Input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Ex: Studio da Beleza" className="mt-1.5" />
              </div>
              <div>
                <Label>Breve Descrição</Label>
                <Textarea value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} placeholder="Conte um pouco sobre o seu espaço..." className="mt-1.5 resize-none" />
              </div>
            </div>
          </div>
          
        </div>

        {/* Coluna Direita */}
        <div className="space-y-6">

          {/* Sessão de Contato */}
          <div className="card-premium">
            <h2 className="flex items-center gap-2 font-display font-semibold text-lg mb-4">
              <Phone className="w-5 h-5 text-primary" /> Contato e Redes
            </h2>
            <div className="space-y-4">
              <div>
                <Label>WhatsApp de Atendimento</Label>
                <Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="(11) 99999-9999" className="mt-1.5" />
                <p className="text-xs text-muted-foreground mt-1">Gera um link direto de contato na página pública.</p>
              </div>
              <div>
                <Label>Endereço Físico</Label>
                <Input value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} placeholder="Rua Exemplo, 123 - Centro" className="mt-1.5" />
              </div>
              <div>
                <Label>Link do Instagram</Label>
                <Input value={form.instagram_url} onChange={e => setForm(f => ({ ...f, instagram_url: e.target.value }))} placeholder="https://instagram.com/seu-perfil" className="mt-1.5" />
              </div>
              <div>
                <Label>Chave PIX</Label>
                <Input value={form.pixKey} onChange={e => setForm(f => ({ ...f, pixKey: e.target.value }))} placeholder="CNPJ, CPF, Email ou Telefone" className="mt-1.5" />
                <p className="text-xs text-muted-foreground mt-1">Permite que clientes escolham pagar via Pix no agendamento.</p>
              </div>
            </div>
          </div>

          {/* Automação e Integração */}
          <div className="card-premium">
            <h2 className="flex items-center gap-2 font-display font-semibold text-lg mb-4">
              <Bot className="w-5 h-5 text-primary" /> Automação e Integração
            </h2>
            <div className="space-y-4">
              <div className="bg-primary/5 p-4 rounded-lg border border-primary/20 space-y-3">
                <Label className="text-primary font-semibold">WhatsApp Bot (Evolution API)</Label>
                <p className="text-sm text-muted-foreground">
                  Conecte o seu número de WhatsApp escaneando o QR Code. Isso permitirá que o sistema envie lembretes automáticos diretamente para seus clientes como se fosse você.
                </p>
                
                {business?.evolution_instance_id && !qrCode ? (
                  <div className={`flex flex-col sm:flex-row items-center justify-between border p-3 rounded-md ${whatsappState === 'open' ? 'bg-green-500/10 border-green-500/30' : 'bg-red-500/10 border-red-500/30'}`}>
                    <span className={`${whatsappState === 'open' ? 'text-green-600' : 'text-red-600'} font-medium flex items-center gap-2`}>
                      <div className={`w-2 h-2 rounded-full ${whatsappState === 'open' ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
                      {whatsappState === 'open' ? `Instância Conectada: ${business.evolution_instance_id}` : 'Desconectado (Reconecte)'}
                    </span>
                    <Button variant="destructive" size="sm" onClick={disconnectWhatsApp} className="mt-2 sm:mt-0">Desconectar</Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {!qrCode ? (
                      <div className="grid gap-3">
                        <div className="md:hidden bg-yellow-50 border border-yellow-200 p-4 rounded-xl mb-2">
                          <p className="text-yellow-800 text-[13px] leading-relaxed">
                            <b className="font-black">⚠️ Atenção:</b> Como você precisará usar a câmera deste celular para ler o QR Code, envie o <b className="font-bold">Link Mágico</b> para um computador (via WhatsApp ou Email) e gere o código por lá.
                          </p>
                        </div>
                        <Button onClick={() => connectWhatsApp()} disabled={isConnectingWhatsApp} className="w-full h-11">
                          {isConnectingWhatsApp ? "Gerando..." : "Gerar QR Code Aqui"}
                        </Button>
                        <div className="relative my-2">
                          <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                          <div className="relative flex justify-center text-xs uppercase"><span className="bg-card px-2 text-muted-foreground font-bold">A recomendada</span></div>
                        </div>
                        <Button 
                          variant="outline" 
                          className="w-full h-11 bg-[#2AD467]/5 text-[#2AD467] hover:bg-[#2AD467]/10 border-[#2AD467]/30 hover:border-[#2AD467]/50 transition-all shadow-sm"
                          onClick={() => {
                            navigator.clipboard.writeText(`${window.location.origin}/connect/${business.id}`);
                            toast.success("Link Mágico copiado! Envie para o seu computador.");
                          }}
                        >
                          <LinkIcon className="w-4 h-4 mr-2" /> Copiar Link Mágico (Abrir no PC)
                        </Button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center p-4 bg-white rounded-lg border">
                        <img src={qrCode} alt="WhatsApp QR Code" className="w-64 h-64" style={{ filter: "grayscale(100%) contrast(2)" }} />
                        <p className="text-sm text-center text-muted-foreground mt-3">
                          Abra o WhatsApp no seu celular, vá em "Aparelhos Conectados" e escaneie este código.
                        </p>
                        <Button variant="ghost" size="sm" onClick={() => setQrCode(null)} className="mt-2 text-muted-foreground">Cancelar</Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
              <div>
                <Label>Webhook URL (Make/n8n/Zapier)</Label>
                <Input value={form.webhook_url} onChange={e => setForm(f => ({ ...f, webhook_url: e.target.value }))} placeholder="https://hook.us1.make.com/..." className="mt-1.5" />
                <p className="text-xs text-muted-foreground mt-1">Para onde vamos enviar os dados quando um agendamento for feito.</p>
              </div>
            </div>
          </div>

          {/* Compartilhar Link */}
          {business && (
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-6">
              <h2 className="flex items-center gap-2 font-display font-semibold text-lg text-primary mb-2">
                <LinkIcon className="w-5 h-5" /> Compartilhe seu Link
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                Envie este link para seus clientes agendarem horários com você.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Input readOnly value={`${window.location.origin}/schedule/${business.slug}`} className="bg-background italic text-muted-foreground" />
                <Button 
                  variant="outline" 
                  className="shrink-0" 
                  onClick={() => {
                    navigator.clipboard.writeText(`${window.location.origin}/schedule/${business.slug}`);
                    toast.success("Link copiado!");
                  }}
                >
                  Copiar
                </Button>
                <Button 
                  className="shrink-0" 
                  onClick={() => window.open(`/schedule/${business.slug}`, "_blank")}
                >
                  Abrir
                </Button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default DashboardSettings;
