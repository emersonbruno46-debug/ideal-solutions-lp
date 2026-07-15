import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  Clock, 
  CheckCircle2, 
  ArrowRight, 
  MessageCircle, 
  MessageSquare,
  Zap, 
  ShieldCheck, 
  Star,
  Smartphone,
  LayoutDashboard,
  Check,
  XCircle,
  Link as LinkIcon
} from "lucide-react";
import { motion } from "framer-motion";
import Logo from "@/components/Logo";

const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({ 
    opacity: 1, 
    y: 0, 
    transition: { 
      delay: i * 0.1, 
      duration: 0.8, 
      ease: [0.22, 1, 0.36, 1] 
    } 
  }),
};

const Landing = () => {
  return (
    <div className="min-h-screen bg-white text-[#132239] font-body selection:bg-[#2AD467]/30">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass-effect border-b border-gray-100">
        <div className="container mx-auto px-4 h-24 flex items-center justify-between">
          <Link to="/">
            <Logo size="md" />
          </Link>
          <div className="hidden md:flex items-center gap-8 font-medium">
            <a href="#como-funciona" className="hover:text-[#2AD467] transition-colors">Como funciona</a>
            <a href="#beneficios" className="hover:text-[#2AD467] transition-colors">Benefícios</a>
            <a href="#depoimentos" className="hover:text-[#2AD467] transition-colors">Depoimentos</a>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="hidden sm:block font-bold hover:text-[#2AD467] transition-colors">Entrar</Link>
            <Button className="btn-zap px-6 h-12" asChild>
              <Link to="/signup">Criar minha agenda grátis</Link>
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-24 overflow-hidden">
        <div className="absolute top-0 right-0 -z-10 w-1/2 h-full bg-gradient-to-l from-[#2AD467]/5 to-transparent blur-3xl" />
        <div className="absolute -top-24 -left-24 -z-10 w-96 h-96 bg-[#06C98E]/5 rounded-full blur-3xl animate-pulse" />
        
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-[#2AD467]/10 text-[#2AD467] rounded-full px-4 py-2 text-sm font-bold mb-8"
          >
            <Zap className="w-4 h-4 fill-current" />
            O agendador #1 para profissionais no WhatsApp
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.1 }}
            className="text-4xl md:text-7xl font-black mb-6 leading-[1.1] max-w-4xl mx-auto"
          >
            Seus clientes agendam sozinhos <span className="text-gradient">enquanto você atende</span>
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-xl md:text-2xl text-gray-500 mb-6 max-w-3xl mx-auto leading-relaxed"
          >
            Automatize seus agendamentos, organize seus horários e pare de perder clientes no WhatsApp com o ZapAgenda.
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-sm font-black uppercase tracking-[0.3em] text-[#2AD467] mb-10"
          >
            Para barbeiros, tatuadores e profissionais autônomos
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16 px-4"
          >
            <Button size="lg" className="btn-zap h-20 px-12 text-xl w-full sm:w-auto shadow-2xl" asChild>
              <Link to="/signup">
                Criar minha agenda grátis
                <ArrowRight className="w-6 h-6 ml-2" />
              </Link>
            </Button>
          </motion.div>

          {/* Dashboard Mockup */}
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.4 }}
            className="relative max-w-[320px] md:max-w-[380px] mx-auto px-4"
          >
            {/* Real Smartphone Mockup */}
            <div className="relative z-10 bg-gray-900 rounded-[3.5rem] p-3 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] border-[8px] border-gray-800 aspect-[9/19.5] overflow-hidden">
               {/* Phone Notch */}
               <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-7 bg-gray-900 rounded-b-3xl z-30 flex items-center justify-center">
                  <div className="w-12 h-1 bg-gray-800 rounded-full" />
               </div>

               {/* Screen Content (Blurred Dashboard) */}
               <div className="bg-white h-full w-full rounded-[2.5rem] overflow-hidden relative group">
                  <div className="absolute inset-0 bg-gray-50 flex flex-col blur-[4px] opacity-40 select-none">
                     <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                        <div className="h-6 w-24 bg-gray-200 rounded" />
                        <div className="h-8 w-8 bg-gray-100 rounded-full" />
                     </div>
                     <div className="p-6 space-y-6">
                        <div className="h-24 w-full bg-white border border-gray-100 rounded-2xl" />
                        <div className="grid grid-cols-2 gap-4">
                           <div className="h-20 bg-white border border-gray-100 rounded-2xl" />
                           <div className="h-20 bg-white border border-gray-100 rounded-2xl" />
                        </div>
                        <div className="h-40 w-full bg-white border border-gray-100 rounded-2xl" />
                        <div className="h-40 w-full bg-white border border-gray-100 rounded-2xl" />
                     </div>
                  </div>
               </div>
            </div>

            {/* Floating Appointment Card Popping Out */}
            <motion.div 
              initial={{ scale: 0.5, opacity: 0, x: 20 }}
              animate={{ scale: 1, opacity: 1, x: 0 }}
              transition={{ delay: 1.2, duration: 0.6, type: "spring", stiffness: 100 }}
              className="absolute -right-12 md:-right-24 top-1/2 -translate-y-1/2 bg-white p-6 md:p-8 rounded-[2.5rem] shadow-[0_40px_100px_-15px_rgba(0,0,0,0.2)] border border-gray-100 w-[280px] md:w-[340px] z-20"
            >
              <div className="flex items-center gap-5 mb-6">
                <div className="w-16 h-16 rounded-2xl bg-[#2AD467] flex items-center justify-center text-white shadow-xl shadow-[#2AD467]/30">
                  <Calendar className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-[10px] text-[#2AD467] font-black uppercase tracking-[0.2em] mb-1">Novo Agendamento</p>
                  <h4 className="text-xl font-black text-[#132239]">Corte & Barba</h4>
                </div>
              </div>
              <div className="space-y-3">
                 <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
                    <div className="flex items-center gap-3 text-gray-500 font-bold text-sm">
                       <Clock className="w-4 h-4 text-[#2AD467]" /> 14:30 - 15:15
                    </div>
                    <span className="bg-[#2AD467]/10 text-[#2AD467] px-3 py-1 rounded-full text-[9px] font-black uppercase">Confirmado</span>
                 </div>
                 <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-2xl text-gray-500 font-bold text-sm">
                    <CheckCircle2 className="w-4 h-4 text-[#2AD467]" /> João Silva
                 </div>
              </div>
              
              {/* Pulsing Dot to show activity */}
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-[#2AD467] rounded-full flex items-center justify-center shadow-lg shadow-[#2AD467]/40 border-4 border-white">
                 <div className="w-2 h-2 bg-white rounded-full animate-ping" />
              </div>
            </motion.div>

            {/* Decorative background glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[#2AD467]/10 rounded-full blur-[120px] -z-10" />
          </motion.div>
        </div>
      </section>

      {/* Como Funciona */}
      <section id="como-funciona" className="py-24 bg-[#F8FAFC]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-black mb-4">Em menos de 2 minutos você está pronto</h2>
            <p className="text-gray-500 text-lg">Simplicidade é a nossa marca registrada.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              { 
                step: "1", 
                title: "Crie seus serviços", 
                desc: "Adicione o que você oferece, defina preços e tempo de atendimento.",
                icon: <LayoutDashboard className="w-6 h-6" />
              },
              { 
                step: "2", 
                title: "Defina seus horários", 
                desc: "Escolha seus dias de folga e horários de atendimento com um clique.",
                icon: <Clock className="w-6 h-6" />
              },
              { 
                step: "3", 
                title: "Receba agendamentos", 
                desc: "Compartilhe seu link e veja sua agenda encher sozinha 24h por dia.",
                icon: <Calendar className="w-6 h-6" />
              }
            ].map((item, i) => (
              <motion.div
                key={i}
                custom={i}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                variants={fadeUp}
                className="card-premium"
              >
                <div className="w-14 h-14 btn-zap flex items-center justify-center mb-6 shadow-none">
                  <span className="text-xl font-black">{item.step}</span>
                </div>
                <h3 className="text-2xl font-black mb-4">{item.title}</h3>
                <p className="text-gray-500 leading-relaxed text-lg">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefícios */}
      <section id="beneficios" className="py-24 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            <div className="lg:w-1/2">
              <h2 className="text-4xl md:text-6xl font-black mb-8 leading-tight">
                Tudo o que você precisa para <span className="text-gradient">escalar seu negócio</span>
              </h2>
              <div className="grid gap-6">
                {[
                  "Nunca mais perca clientes por falta de resposta",
                  "Evite horários duplicados e confusão",
                  "Sua agenda organizada automaticamente",
                  "Receba agendamentos 24h (até dormindo)",
                  "Passe mais profissionalismo e confiança"
                ].map((text, i) => (
                  <motion.div 
                    key={i} 
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    className="flex items-center gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-100"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#2AD467] flex items-center justify-center text-white shrink-0">
                      <Check className="w-5 h-5" />
                    </div>
                    <span className="text-lg font-bold text-gray-700">{text}</span>
                  </motion.div>
                ))}
              </div>
              <Button size="lg" className="btn-zap mt-10 h-16 px-10 text-lg group" asChild>
                <Link to="/signup">Quero organizar minha agenda</Link>
              </Button>
            </div>
            <div className="lg:w-1/2 relative">
               <div className="absolute inset-0 bg-[#2AD467]/10 rounded-[3rem] blur-3xl" />
               <div className="relative bg-white border border-gray-100 p-8 rounded-[3rem] shadow-2xl">
                  <div className="space-y-6">
                     <div className="flex items-center gap-4 border-b border-gray-50 pb-6">
                        <div className="w-16 h-16 rounded-2xl bg-gray-100" />
                        <div className="space-y-2">
                           <div className="h-4 w-32 bg-gray-200 rounded" />
                           <div className="h-3 w-20 bg-gray-100 rounded" />
                        </div>
                     </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div className="h-12 bg-[#2AD467]/10 rounded-xl flex items-center justify-center font-bold text-[#2AD467]">09:00</div>
                        <div className="h-12 bg-gray-50 rounded-xl flex items-center justify-center font-bold text-gray-400">10:00</div>
                        <div className="h-12 bg-gray-50 rounded-xl flex items-center justify-center font-bold text-gray-400">11:00</div>
                        <div className="h-12 bg-gray-50 rounded-xl flex items-center justify-center font-bold text-gray-400">12:00</div>
                     </div>
                     <div className="h-14 btn-zap rounded-2xl flex items-center justify-center font-bold">Confirmar Agendamento</div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* Antes vs Depois */}
      <section className="py-24 bg-[#132239] text-white overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-black mb-6">A diferença é brutal</h2>
            <p className="text-gray-400 text-xl">Veja como sua rotina vai mudar.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Antes */}
            <div className="bg-white/5 border border-white/10 p-10 rounded-[2.5rem]">
               <h3 className="text-red-400 text-2xl font-black mb-8 flex items-center gap-3">
                  <span className="w-3 h-3 bg-red-400 rounded-full" /> ANTES
               </h3>
               <ul className="space-y-6">
                  {[
                    "Confusão de mensagens no WhatsApp",
                    "Horários bagunçados em papel",
                    "Esquecimento de clientes importantes",
                    "Perda de tempo respondendo preços",
                    "Agenda furada por falta de confirmação"
                  ].map((text, i) => (
                    <li key={i} className="flex items-start gap-4 text-gray-400">
                      <div className="w-6 h-6 rounded-full border border-white/10 flex items-center justify-center shrink-0 mt-1">
                        <span className="text-xs">×</span>
                      </div>
                      <span className="text-lg">{text}</span>
                    </li>
                  ))}
               </ul>
            </div>
            {/* Depois */}
            <div className="bg-[#2AD467]/10 border-2 border-[#2AD467]/30 p-10 rounded-[2.5rem] relative overflow-hidden">
               <div className="absolute top-0 right-0 w-32 h-32 bg-[#2AD467]/20 blur-3xl" />
               <h3 className="text-[#2AD467] text-2xl font-black mb-8 flex items-center gap-3">
                  <span className="w-3 h-3 bg-[#2AD467] rounded-full" /> DEPOIS
               </h3>
               <ul className="space-y-6">
                  {[
                    "Agenda automática e organizada",
                    "Clientes agendando sozinhos 24h",
                    "Rotina previsível e profissional",
                    "Tudo centralizado em um só lugar",
                    "Link profissional na bio do Instagram"
                  ].map((text, i) => (
                    <li key={i} className="flex items-start gap-4 text-white">
                      <div className="w-6 h-6 rounded-full bg-[#2AD467] flex items-center justify-center shrink-0 mt-1">
                        <Check className="w-4 h-4 text-[#132239]" />
                      </div>
                      <span className="text-lg font-bold">{text}</span>
                    </li>
                  ))}
               </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof Section */}
      <section className="py-24 bg-[#F8FAFC]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-black mb-4">+100 profissionais já usam o ZapAgenda</h2>
            <p className="text-xl text-gray-500 font-medium">Junte-se aos profissionais que recuperaram seu tempo.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: "Carlos Silva", role: "Barbeiro", text: "Agora meus clientes marcam sozinhos, facilitou demais minha rotina!" },
              { name: "Ana Souza", role: "Manicure", text: "Parei de perder tempo respondendo WhatsApp o dia todo. O sistema faz tudo!" },
              { name: "Pedro Lima", role: "Tatuador", text: "O agendamento automático é sensacional. Recomendo para todos os autônomos." }
            ].map((d, i) => (
              <div key={i} className="card-premium bg-white">
                <div className="flex items-center gap-4 mb-4">
                  <div className="w-12 h-12 rounded-full bg-[#2AD467]/10 flex items-center justify-center font-bold text-[#2AD467]">
                    {d.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold">{d.name}</p>
                    <p className="text-sm text-gray-400 font-medium">{d.role}</p>
                  </div>
                </div>
                <p className="text-gray-600 font-medium italic">"{d.text}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Before vs After Section */}
      <section className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <h2 className="text-4xl font-black leading-tight">Chega de perder tempo com agendamentos manuais</h2>
              
              <div className="space-y-6">
                <div className="p-6 rounded-3xl bg-red-50 border border-red-100">
                  <h3 className="text-red-600 font-black mb-3 flex items-center gap-2">
                    <XCircle className="w-5 h-5" /> ANTES
                  </h3>
                  <ul className="space-y-2 text-red-800/70 font-bold">
                    <li>• Conversas confusas no WhatsApp</li>
                    <li>• Horários duplicados e erros</li>
                    <li>• Clientes perdidos por falta de resposta</li>
                  </ul>
                </div>

                <div className="p-6 rounded-3xl bg-[#2AD467]/5 border border-[#2AD467]/10">
                  <h3 className="text-[#2AD467] font-black mb-3 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5" /> DEPOIS
                  </h3>
                  <ul className="space-y-2 text-[#2AD467] font-bold">
                    <li>• Agenda organizada e automatizada</li>
                    <li>• Clientes agendando sozinhos 24h</li>
                    <li>• Rotina simples e foco total no serviço</li>
                  </ul>
                </div>
              </div>

              <Button className="btn-zap h-16 px-10 text-xl w-full sm:w-auto" asChild>
                <Link to="/signup">Criar minha agenda grátis</Link>
              </Button>
            </div>
            
            <div className="relative">
               <div className="absolute inset-0 bg-[#2AD467]/10 blur-[100px] rounded-full -z-10" />
               <div className="card-premium overflow-hidden border-4 border-white shadow-2xl">
                 <div className="flex items-center gap-2 p-4 border-b border-gray-100 bg-gray-50">
                   <div className="w-3 h-3 rounded-full bg-red-400" />
                   <div className="w-3 h-3 rounded-full bg-yellow-400" />
                   <div className="w-3 h-3 rounded-full bg-green-400" />
                   <div className="ml-4 h-6 w-48 bg-gray-200 rounded-full" />
                 </div>
                 <div className="p-8 space-y-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-[#2AD467]/10 animate-pulse" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-32 bg-gray-100 rounded" />
                        <div className="h-3 w-48 bg-gray-50 rounded" />
                      </div>
                    </div>
                    <div className="h-40 w-full bg-[#2AD467]/5 rounded-2xl flex items-center justify-center">
                       <Zap className="w-12 h-12 text-[#2AD467] animate-bounce" />
                    </div>
                 </div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* WhatsApp Feature Highlight */}
      <section className="py-24 bg-[#132239] text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-[#2AD467]/10 blur-[120px] rounded-full -z-0" />
        <div className="container mx-auto px-4 text-center relative z-10">
           <div className="inline-flex items-center gap-2 bg-[#2AD467] text-[#132239] px-6 py-2 rounded-full font-black text-sm mb-8">
             <MessageSquare className="w-4 h-4" /> RECURSO EXCLUSIVO
           </div>
           <h2 className="text-4xl md:text-6xl font-black mb-8">Confirmações automáticas via WhatsApp</h2>
           <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto mb-16 leading-relaxed">
             Seu cliente recebe uma mensagem automática assim que agenda, com todos os detalhes e lembretes.
           </p>
           <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <div className="bg-white/5 backdrop-blur-xl border border-white/10 p-8 rounded-[3rem] text-left">
                <p className="text-[#2AD467] font-black text-sm mb-4">MENSAGEM DO SISTEMA</p>
                <div className="space-y-4">
                   <div className="bg-white/10 p-4 rounded-2xl rounded-tl-none">
                     <p className="font-bold">Olá João! Seu agendamento foi confirmado para amanhã às 14:00. Nos vemos lá! 👋</p>
                   </div>
                   <div className="flex justify-end">
                      <div className="bg-[#2AD467]/20 p-4 rounded-2xl rounded-tr-none">
                        <p className="font-bold text-[#2AD467]">Obrigado! Estarei aí. 👍</p>
                      </div>
                   </div>
                </div>
              </div>
              <div className="flex flex-col justify-center text-left space-y-6">
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#2AD467] flex items-center justify-center shrink-0">
                       <CheckCircle2 className="w-6 h-6 text-[#132239]" />
                    </div>
                    <p className="text-xl font-bold">Lembretes de 24h e 1h antes</p>
                 </div>
                 <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#2AD467] flex items-center justify-center shrink-0">
                       <CheckCircle2 className="w-6 h-6 text-[#132239]" />
                    </div>
                    <p className="text-xl font-bold">Botão de confirmação/cancelamento</p>
                 </div>
              </div>
           </div>
        </div>
      </section>

      {/* Prova Social */}
      <section id="depoimentos" className="py-24">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8 text-center md:text-left">
            <div>
              <h2 className="text-4xl md:text-6xl font-black mb-4">
                Quem usa, <span className="text-gradient">não vive sem</span>
              </h2>
              <p className="text-gray-500 text-xl font-bold">Mais de 100 profissionais já transformaram sua agenda.</p>
            </div>
            <div className="flex -space-x-4">
              {[1,2,3,4,5].map(i => (
                <div key={i} className="w-14 h-14 rounded-full border-4 border-white bg-gray-200 overflow-hidden">
                  <img src={`https://i.pravatar.cc/100?u=${i}`} alt="Avatar" />
                </div>
              ))}
              <div className="w-14 h-14 rounded-full border-4 border-white bg-[#2AD467] flex items-center justify-center text-[#132239] font-black text-sm">
                +100
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { name: "Carlos Silva", role: "Barbeiro", text: "Minha agenda mudou da água pro vinho. Meus clientes adoraram a facilidade de marcar pelo link." },
              { name: "Mariana Costa", role: "Manicure", text: "Não perco mais tempo no WhatsApp. Agora eu só abro o app e vejo quem marcou. Perfeito!" },
              { name: "Ricardo Alves", role: "Tatuador", text: "Sistema limpo, rápido e profissional. O suporte é excelente e a interface é muito bonita." }
            ].map((d, i) => (
              <motion.div key={i} className="card-premium flex flex-col justify-between">
                <div>
                   <div className="flex gap-1 mb-4">
                      {[1,2,3,4,5].map(s => <Star key={s} className="w-5 h-5 fill-[#2AD467] text-[#2AD467]" />)}
                   </div>
                   <p className="text-gray-600 text-lg italic mb-6">"{d.text}"</p>
                </div>
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 rounded-full bg-gray-100" />
                   <div>
                      <p className="font-bold">{d.name}</p>
                      <p className="text-sm text-gray-400">{d.role}</p>
                   </div>
                </div>
              </motion.div>
            ))}
          </div>
          
          <div className="mt-16 text-center">
             <Button size="lg" className="btn-zap h-16 px-10 text-lg" asChild>
                <Link to="/signup">Começar agora</Link>
             </Button>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-24 relative overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="bg-[#132239] rounded-[2rem] md:rounded-[3.5rem] p-8 md:p-24 text-center relative overflow-hidden">
            <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#2AD467]/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#06C98E]/10 rounded-full blur-3xl" />
            
            <h2 className="text-3xl md:text-7xl font-black text-white mb-8 relative z-10 leading-[1.1]">
              Comece grátis e receba seus primeiros <span className="text-gradient">agendamentos hoje</span>
            </h2>
            <p className="text-gray-400 text-lg md:text-xl mb-12 max-w-2xl mx-auto relative z-10">
              Junte-se a centenas de profissionais que já automatizaram sua agenda. Sem cartão de crédito.
            </p>
            <Button size="lg" className="btn-zap h-16 md:h-20 px-8 md:px-16 text-lg md:text-xl shadow-[0_20px_50px_-15px_rgba(42,212,103,0.5)] relative z-10 w-full md:w-auto" asChild>
               <Link to="/signup">Criar minha agenda grátis</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t border-gray-50 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <Logo size="md" />
             <div className="flex flex-wrap justify-center gap-6 md:gap-8 text-gray-500 font-medium">
               <a href="#" className="hover:text-[#2AD467] transition-colors">Termos de Uso</a>
               <a href="#" className="hover:text-[#2AD467] transition-colors">Privacidade</a>
               <a href="#" className="hover:text-[#2AD467] transition-colors">Suporte</a>
            </div>
            <p className="text-gray-400 font-medium">
              © {new Date().getFullYear()} ZapAgenda. Todos os direitos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
