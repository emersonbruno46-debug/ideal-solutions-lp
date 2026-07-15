import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Logo from "@/components/Logo";
import { Bot, RefreshCw, QrCode } from "lucide-react";
import { toast } from "sonner";

const ConnectQR = () => {
  const { id } = useParams();
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "connecting" | "connected">("idle");
  const [error, setError] = useState<string | null>(null);

  const instanceName = id ? `b_${id.slice(0, 8)}` : "";

  const generateQR = async () => {
    if (!instanceName) return;
    
    setStatus("connecting");
    setQrCode(null);
    setError(null);
    
    try {
      // 1. Limpeza profunda
      await fetch(`/api/evolution?path=/instance/delete/${instanceName}`, { method: "DELETE" }).catch(() => {});
      await new Promise(resolve => setTimeout(resolve, 2000));

      // 2. Criar instância
      await fetch(`/api/evolution?path=/instance/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          instanceName, 
          qrcode: true, 
          integration: "WHATSAPP-BAILEYS" 
        })
      });

      await new Promise(resolve => setTimeout(resolve, 3000));
      pollQR();
    } catch (e: any) {
      setError(e.message);
      setStatus("idle");
    }
  };

  const pollQR = async () => {
    try {
      let attempts = 0;
      let connected = false;

      while (attempts < 15 && !connected) {
        const connectRes = await fetch(`/api/evolution?path=/instance/connect/${instanceName}`, { method: "GET" });
        const data = await connectRes.json();
        
        if (data.instance && data.instance.status === "open") {
          connected = true;
          setStatus("connected");
          setQrCode(null);
          toast.success("WhatsApp Conectado com Sucesso!");
          break;
        }

        if (data.base64 || (data.qrcode && data.qrcode.base64)) {
          setQrCode(data.base64 || data.qrcode.base64);
        }

        attempts++;
        await new Promise(resolve => setTimeout(resolve, 3000));
      }

      if (!connected && attempts >= 15) {
        setStatus("idle");
        setError("Tempo limite excedido. Tente gerar novamente.");
      }
    } catch (e: any) {
      setError("Erro ao buscar QR Code.");
      setStatus("idle");
    }
  };

  if (!id) {
    return <div className="p-10 text-center font-bold text-red-500">ID Inválido</div>;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-4">
      <div className="absolute top-8">
        <Logo size="lg" />
      </div>

      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-gray-100 p-8 flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-2xl bg-[#2AD467]/10 flex items-center justify-center mb-6">
          <Bot className="w-8 h-8 text-[#2AD467]" />
        </div>
        
        <h1 className="text-2xl font-black text-[#132239] mb-2">Conectar WhatsApp</h1>
        <p className="text-gray-500 font-medium mb-8">
          Abra o WhatsApp no seu celular, vá em Aparelhos Conectados e escaneie o código abaixo.
        </p>

        {status === "connected" ? (
          <div className="bg-[#2AD467]/10 border border-[#2AD467]/20 rounded-2xl p-6 w-full mb-6">
            <p className="text-[#2AD467] font-black text-xl mb-2">Conectado!</p>
            <p className="text-sm font-bold text-[#2AD467]/80">Você já pode fechar esta aba.</p>
          </div>
        ) : qrCode ? (
          <div className="bg-white p-4 rounded-2xl border-2 border-gray-100 mb-6 relative">
            <img src={qrCode} alt="WhatsApp QR Code" className="w-64 h-64" style={{ filter: "grayscale(100%) contrast(1.5)" }} />
          </div>
        ) : status === "connecting" ? (
          <div className="w-64 h-64 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center mb-6">
            <RefreshCw className="w-8 h-8 text-[#2AD467] animate-spin mb-3" />
            <p className="text-gray-400 font-bold text-sm">Gerando código...</p>
          </div>
        ) : (
          <div className="w-64 h-64 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center mb-6">
            <QrCode className="w-10 h-10 text-gray-300 mb-3" />
            <p className="text-gray-400 font-bold text-sm">Pronto para gerar</p>
          </div>
        )}

        {error && (
          <p className="text-red-500 font-bold text-sm mb-4 bg-red-50 px-4 py-2 rounded-lg w-full">{error}</p>
        )}

        {status !== "connected" && (
          <Button 
            onClick={generateQR} 
            disabled={status === "connecting"}
            className="btn-zap w-full h-14 font-black text-lg shadow-xl shadow-[#2AD467]/20"
          >
            {status === "connecting" ? "Aguarde..." : qrCode ? "Gerar Novo Código" : "Gerar QR Code"}
          </Button>
        )}
      </div>
    </div>
  );
};

export default ConnectQR;
