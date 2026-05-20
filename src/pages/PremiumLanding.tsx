import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Palette, Share2, Globe, ArrowRight, Star, Sparkles, Gem,
  Instagram, Linkedin, Twitter, Menu, X
} from "lucide-react";
import { LogoPremium } from "@/components/premium/LogoPremium";

// Custom easing for cinematic motion simulating mass and spring physics
const premiumEasing = [0.32, 0.72, 0, 1];

const fadeUp = {
  hidden: { opacity: 0, y: 60, filter: "blur(10px)" },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { delay: i * 0.1, duration: 1.2, ease: premiumEasing }
  })
};

const handleContact = () => {
  window.open("https://wa.me/5538999105529?text=Olá,%20quero%20transformar%20minha%20marca%20com%20vocês!", "_blank");
};

// Button-in-Button CTA Architecture (Haptic Micro-Aesthetic)
const MagneticCTA = ({ text, className = "", primary = true }: { text: string, className?: string, primary?: boolean }) => (
  <button 
    onClick={handleContact}
    className={`group relative pl-8 pr-[4.5rem] py-4 rounded-full font-bold tracking-wide active:scale-[0.98] transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] ${
      primary 
        ? "bg-[#FFDE21] text-black shadow-[0_0_30px_rgba(255,222,33,0.3)] hover:shadow-[0_0_50px_rgba(255,222,33,0.5)]" 
        : "bg-white/5 text-white border border-white/10 hover:bg-white/10"
    } ${className}`}
  >
    {text}
    <div className={`absolute right-1.5 top-1.5 bottom-1.5 aspect-square rounded-full flex items-center justify-center transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:translate-x-1 group-hover:-translate-y-[1px] group-hover:scale-105 ${
      primary ? "bg-black/10" : "bg-white/10"
    }`}>
      <ArrowRight className="w-5 h-5" />
    </div>
  </button>
);

// Double-Bezel Card (Nested Architectural Layout)
const DoubleBezelCard = ({ children, className = "", delay = 0, bentoClass = "" }: any) => (
  <motion.div 
    initial={{ opacity: 0, y: 40, filter: "blur(5px)" }}
    whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
    viewport={{ once: false, margin: "-100px" }}
    transition={{ duration: 1.2, delay, ease: premiumEasing }}
    className={`p-1.5 rounded-[2rem] bg-white/5 border border-white/10 ring-1 ring-black/5 ${bentoClass}`}
  >
    <div className={`h-full rounded-[calc(2rem-0.375rem)] bg-[#050505] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] p-8 ${className}`}>
      {children}
    </div>
  </motion.div>
);

const PremiumLanding = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Prevent scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "auto";
  }, [isMenuOpen]);

  return (
    <div className="min-h-[100dvh] bg-[#050505] text-white selection:bg-[#FFDE21]/30 overflow-x-hidden font-sans">
      
      {/* Vibe & Texture: Ethereal Glass */}
      <div className="fixed inset-0 z-0 opacity-100 scale-100">
        <img 
          src="/premium-bg-new.png" 
          alt="Background" 
          className="w-full h-full object-cover opacity-60 mix-blend-screen"
        />
      </div>
      <div className="fixed inset-0 bg-[#050505]/60 z-[1] pointer-events-none" />
      <div className="fixed inset-0 noise-bg z-[2] opacity-30 pointer-events-none mix-blend-overlay" />

      {/* Fluid Island Nav */}
      <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-[60] w-[90%] max-w-5xl rounded-full border border-white/10 bg-black/40 backdrop-blur-2xl shadow-2xl p-2 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]">
        <div className="flex items-center justify-between px-6 h-14">
          <LogoPremium />
          
          <div className="hidden md:flex items-center gap-8">
            {["Serviços", "Portfólio", "Processo", "Depoimentos"].map((item) => (
              <a 
                key={item} 
                href={`#${item.toLowerCase()}`} 
                className="text-xs font-bold uppercase tracking-[0.2em] text-white/50 hover:text-[#FFDE21] transition-colors"
              >
                {item}
              </a>
            ))}
          </div>
          
          <div className="hidden md:block">
            <button onClick={handleContact} className="px-6 py-2.5 rounded-full bg-white/5 hover:bg-[#FFDE21] hover:text-black border border-white/10 text-xs font-bold uppercase tracking-widest transition-all duration-500">
              Falar com Consultor
            </button>
          </div>

          <button 
            className="md:hidden relative w-10 h-10 flex items-center justify-center text-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <span className={`absolute h-[2px] w-6 bg-current transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${isMenuOpen ? 'rotate-45' : '-translate-y-1.5'}`} />
            <span className={`absolute h-[2px] w-6 bg-current transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${isMenuOpen ? 'opacity-0' : 'opacity-100'}`} />
            <span className={`absolute h-[2px] w-6 bg-current transition-all duration-500 ease-[cubic-bezier(0.32,0.72,0,1)] ${isMenuOpen ? '-rotate-45' : 'translate-y-1.5'}`} />
          </button>
        </div>
      </nav>

      {/* Full Screen Menu Modal with Staggered Reveals */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: premiumEasing }}
            className="fixed inset-0 z-[50] bg-[#050505]/95 backdrop-blur-3xl flex flex-col justify-center items-center"
          >
            <div className="flex flex-col items-center gap-10">
              {["Serviços", "Portfólio", "Processo", "Depoimentos"].map((item, i) => (
                <motion.a 
                  key={item} 
                  href={`#${item.toLowerCase()}`}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ delay: 0.1 * i, duration: 0.8, ease: premiumEasing }}
                  className="text-4xl md:text-6xl font-black uppercase tracking-tighter text-white hover:text-[#FFDE21] transition-colors"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item}
                </motion.a>
              ))}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ delay: 0.4, duration: 0.8, ease: premiumEasing }}
                className="mt-8"
              >
                 <MagneticCTA text="Falar com Consultor" />
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="relative z-10 pt-40 pb-20">
        
        {/* Hero Z-Axis Cascade & Massive Typography */}
        <section className="min-h-[90dvh] flex items-center justify-center pt-24 pb-32">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
              
              <div className="relative z-10 text-center lg:text-left">
                <motion.div 
                  custom={0} variants={fadeUp} initial="hidden" animate="visible"
                  className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 mb-12 backdrop-blur-md"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-[#FFDE21] animate-pulse" />
                  <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#FFDE21]">Agência Boutique de Design</span>
                </motion.div>

                <motion.h1 
                  custom={1} variants={fadeUp} initial="hidden" animate="visible"
                  className="text-5xl sm:text-7xl md:text-8xl font-black mb-10 leading-[0.85] tracking-tighter"
                >
                  A Essência do <br className="hidden lg:block"/>
                  <span className="relative inline-block mt-4 md:mt-2 text-[#FFDE21] drop-shadow-[0_0_80px_rgba(255,222,33,0.3)]">
                    Design Premium
                  </span>
                </motion.h1>

                <motion.p 
                  custom={2} variants={fadeUp} initial="hidden" animate="visible"
                  className="text-lg md:text-2xl text-white/50 max-w-2xl mx-auto lg:mx-0 mb-16 leading-relaxed font-medium"
                >
                  Construímos a presença digital de marcas que não aceitam o padrão. Estética cinemática, conversão e autoridade absoluta.
                </motion.p>

                <motion.div 
                  custom={3} variants={fadeUp} initial="hidden" animate="visible"
                  className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-8"
                >
                  <MagneticCTA text="Iniciar meu Projeto" />
                  <div className="flex items-center gap-4 text-left">
                    <div className="flex -space-x-4">
                      {[1, 2, 3].map(i => (
                        <div key={i} className="w-12 h-12 rounded-full border-[3px] border-[#050505] overflow-hidden grayscale hover:grayscale-0 transition-all duration-500">
                          <img src={`https://i.pravatar.cc/150?img=${i+20}`} alt="client" />
                        </div>
                      ))}
                    </div>
                    <div>
                      <p className="font-black text-white text-lg leading-none">+200</p>
                      <p className="text-white/30 text-[9px] uppercase font-bold tracking-widest mt-1">Marcas</p>
                    </div>
                  </div>
                </motion.div>
              </div>

              {/* Equipe / Sócio Photo */}
              <motion.div 
                custom={4} variants={fadeUp} initial="hidden" animate="visible"
                className="relative mt-12 lg:mt-0 lg:-translate-x-8 xl:-translate-x-16"
              >
                 <div className="relative flex justify-center items-end group w-full lg:w-[130%] xl:w-[160%] lg:-ml-[15%] xl:-ml-[30%]">
                    <div className="relative inline-block">
                      {/* Yellow Flare Behind Image */}
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70%] h-[70%] bg-[#FFDE21]/20 rounded-full blur-[100px] lg:blur-[140px] z-0 animate-[pulse_6s_ease-in-out_infinite]" />
                      
                      <motion.img 
                        src="/hero-image.png" 
                        alt="Equipe Ideal Solutions" 
                        animate={{ y: [0, -15, 0] }}
                        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                        className="w-full max-w-[600px] xl:max-w-[900px] h-auto object-contain drop-shadow-[0_0_50px_rgba(0,0,0,0.6)] group-hover:scale-[1.02] transition-transform duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] relative z-10" 
                      />
                      
                      {/* Floating Element over the image */}
                      <div className="absolute bottom-[25%] left-4 lg:bottom-[30%] lg:left-0 xl:bottom-[35%] xl:left-8 z-30 p-1.5 rounded-[2.5rem] bg-white/10 border border-white/20 ring-1 ring-white/10 backdrop-blur-2xl animate-[float-flare_6s_ease-in-out_infinite_alternate] hidden sm:block shadow-[0_8px_32px_rgba(255,255,255,0.1)]">
                        <div className="rounded-[calc(2.5rem-0.375rem)] bg-white/5 p-5 flex items-center gap-4">
                          <div className="w-12 h-12 bg-gradient-to-br from-[#FFDE21] to-yellow-600 rounded-2xl flex items-center justify-center shadow-lg shadow-yellow-500/30">
                             <Gem className="text-black w-6 h-6" />
                          </div>
                          <div>
                             <p className="text-xs text-white/70 uppercase font-black tracking-widest leading-none mb-1 drop-shadow-md">Estratégia</p>
                             <p className="text-lg font-black text-white drop-shadow-lg">Premium</p>
                          </div>
                        </div>
                      </div>
                    </div>
                 </div>
              </motion.div>

            </div>
          </div>
        </section>

        {/* Asymmetrical Bento Grid - Services */}
        <section id="serviços" className="py-24 md:py-32">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="mb-24">
              <span className="inline-block px-3 py-1 bg-[#FFDE21]/10 text-[#FFDE21] rounded-full text-[10px] font-black uppercase tracking-widest mb-6">Expertise</span>
              <h2 className="text-4xl md:text-7xl font-black uppercase tracking-tighter">Nossas <br/><span className="text-[#FFDE21]">Soluções</span></h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-[minmax(250px,auto)]">
              
              {/* Bento Card 1 - Large */}
              <DoubleBezelCard delay={0.1} bentoClass="md:col-span-8 md:row-span-2 group">
                <div className="flex flex-col h-full justify-between">
                  <div className="w-16 h-16 bg-[#FFDE21]/10 rounded-[1.2rem] flex items-center justify-center group-hover:bg-[#FFDE21] transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)]">
                    <Palette className="w-8 h-8 text-[#FFDE21] group-hover:text-black transition-colors" />
                  </div>
                  <div className="mt-12">
                    <h3 className="text-3xl md:text-5xl font-black mb-4 uppercase tracking-tighter">Identidade Visual</h3>
                    <p className="text-white/50 text-lg max-w-md">Sistemas de design complexos, logotipos marcantes e manuais de marca que posicionam você como a autoridade máxima do seu nicho.</p>
                  </div>
                </div>
              </DoubleBezelCard>

              {/* Bento Card 2 - Small */}
              <DoubleBezelCard delay={0.2} bentoClass="md:col-span-4 md:row-span-1 group">
                <div className="flex flex-col h-full justify-between">
                  <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center group-hover:bg-white/10 transition-colors">
                    <Share2 className="w-5 h-5 text-white/70 group-hover:text-[#FFDE21]" />
                  </div>
                  <div className="mt-8">
                    <h3 className="text-xl font-black mb-2 uppercase tracking-tight">Social Media</h3>
                    <p className="text-white/40 text-sm">Artes para Instagram e LinkedIn com visual de altíssimo nível.</p>
                  </div>
                </div>
              </DoubleBezelCard>

              {/* Bento Card 3 - Small */}
              <DoubleBezelCard delay={0.3} bentoClass="md:col-span-4 md:row-span-1 group">
                <div className="flex flex-col h-full justify-between">
                  <div className="w-12 h-12 bg-white/5 rounded-xl flex items-center justify-center group-hover:bg-white/10 transition-colors">
                    <Globe className="w-5 h-5 text-white/70 group-hover:text-[#FFDE21]" />
                  </div>
                  <div className="mt-8">
                    <h3 className="text-xl font-black mb-2 uppercase tracking-tight">Web Design</h3>
                    <p className="text-white/40 text-sm">Experiências web imersivas com alta taxa de conversão.</p>
                  </div>
                </div>
              </DoubleBezelCard>

            </div>
          </div>
        </section>

        {/* Portfolio Section */}
        <section id="portfólio" className="py-24 md:py-32 relative z-10">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="text-center mb-20">
              <span className="inline-block px-3 py-1 bg-white/5 text-white/50 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest mb-6">Projetos de Sucesso</span>
              <h2 className="text-4xl sm:text-5xl md:text-7xl font-black mb-6 text-white uppercase tracking-tighter">Impacto em <span className="text-[#FFDE21]">Números</span></h2>
              <p className="text-white/50 text-lg md:text-xl max-w-2xl mx-auto font-medium">Projetos que elevaram marcas ao próximo nível de autoridade e reconhecimento.</p>
            </div>
  
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { 
                  label: "Engenharia Civil", 
                  title: "Conteúdo Estratégico", 
                  tag: "WELIS",
                  img: "/portfolio-welis.png",
                  desc: "Posicionamento visual e autoridade no Instagram para engenheiro especialista."
                },
                { 
                  label: "Fast Food Urbano", 
                  title: "Identidade Jovem", 
                  tag: "CHOP'S",
                  img: "/portfolio-chops.jpg",
                  desc: "Marca impactante e memorável para atrair público jovem do segmento food."
                },
                { 
                  label: "Beleza & Bem-estar", 
                  title: "Design Sofisticado", 
                  tag: "GABI",
                  img: "/portfolio-gabi.png",
                  desc: "Marca elegante e memorável com foco no público feminino de alto padrão."
                }
              ].map((p, i) => (
                <motion.div 
                  key={i}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: false }}
                  variants={fadeUp}
                  custom={i}
                  whileHover={{ y: -10 }}
                  className="group relative aspect-[4/5] rounded-[2.5rem] overflow-hidden border border-white/10 bg-[#050505] shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] cursor-pointer"
                >
                  <img 
                    src={p.img} 
                    alt={p.title} 
                    className="absolute inset-0 w-full h-full object-cover opacity-40 group-hover:opacity-70 transition-all duration-700 ease-[cubic-bezier(0.32,0.72,0,1)] group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/40 to-transparent opacity-90" />
                  
                  <div className="absolute bottom-8 left-8 right-8">
                    <span className="inline-block px-3 py-1 bg-[#FFDE21] text-black rounded-full text-[10px] font-black uppercase tracking-widest mb-4">
                      {p.tag}
                    </span>
                    <p className="text-white/40 text-xs font-black uppercase tracking-[0.2em] mb-1">{p.label}</p>
                    <h4 className="text-2xl font-black text-white uppercase tracking-tight mb-3">{p.title}</h4>
                    <p className="text-white/60 text-sm leading-relaxed font-medium opacity-0 group-hover:opacity-100 transition-all duration-500 translate-y-4 group-hover:translate-y-0">
                      {p.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Cinematic Testimonial Split */}
        <section id="depoimentos" className="py-24 md:py-32 relative">
          <div className="container mx-auto px-4 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-20 items-center">
              
              <motion.div 
                initial={{ opacity: 0, x: -40 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: false }} transition={{ duration: 1.2, ease: premiumEasing }}
                className="order-2 lg:order-1"
              >
                <span className="inline-block px-3 py-1 bg-white/5 text-white/50 border border-white/10 rounded-full text-[10px] font-black uppercase tracking-widest mb-6">Validação Real</span>
                <h2 className="text-5xl md:text-8xl font-black mb-10 leading-[0.9] tracking-tighter">A Palavra de <br/>quem <span className="text-[#FFDE21]">Lidera</span></h2>
                <MagneticCTA text="Ver Portfólio Completo" primary={false} />
              </motion.div>

              <div className="space-y-8 order-1 lg:order-2">
                {[
                  { name: "Gabriela Gomes", role: "CEO, Gabi Cosméticos", text: "A Ideal Solutions criou toda a nossa identidade. Ficou moderno, com cara de luxo e passamos muita credibilidade agora." },
                  { name: "Jonas Santos", role: "CEO, Chop's Burger", text: "Nós da Chop's Burger estamos muito satisfeitos com os resultados visuais e indicamos a Ideal Solutions para todos!" },
                  { name: "Wellis Josue", role: "Engenheiro Especialista", text: "A estratégia mudou nossa presença online. Antes éramos invisíveis, agora temos engajamento e crescimento imediato. Resultado real." }
                ].map((t, i) => (
                  <DoubleBezelCard key={i} delay={0.2 * i}>
                    <Star className="w-8 h-8 text-[#FFDE21] mb-8" />
                    <p className="text-xl md:text-2xl text-white/70 leading-relaxed font-medium mb-10">"{t.text}"</p>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full border border-white/10 overflow-hidden bg-white/5 flex items-center justify-center">
                         <img src={`/testimonial-${i + 1}.png`} alt={t.name} className="w-full h-full object-cover" onError={(e) => (e.currentTarget.style.display = 'none')} />
                      </div>
                      <div>
                        <h4 className="font-black text-white uppercase tracking-widest text-sm">{t.name}</h4>
                        <p className="text-[#FFDE21] text-[10px] font-bold tracking-[0.2em] mt-1">{t.role}</p>
                      </div>
                    </div>
                  </DoubleBezelCard>
                ))}
              </div>

            </div>
          </div>
        </section>

        {/* Pricing / CTA Closing nested architectural pattern */}
        <section id="planos" className="py-24 md:py-32">
           <div className="container mx-auto px-4 lg:px-8">
              <motion.div 
                 initial={{ opacity: 0, scale: 0.95 }}
                 whileInView={{ opacity: 1, scale: 1 }}
                 viewport={{ once: false }}
                 transition={{ duration: 1.2, ease: premiumEasing }}
                 className="relative p-1.5 rounded-[3rem] bg-gradient-to-b from-[#FFDE21]/20 to-transparent"
              >
                 <div className="absolute inset-0 bg-[#FFDE21]/5 blur-3xl -z-10 rounded-[3rem]" />
                 <div className="rounded-[calc(3rem-0.375rem)] bg-[#050505] p-12 md:p-32 text-center relative overflow-hidden flex flex-col items-center">
                    
                    <span className="inline-block px-4 py-2 bg-[#FFDE21]/10 text-[#FFDE21] rounded-full text-xs font-black uppercase tracking-[0.2em] mb-10">
                      Última Chamada
                    </span>
                    <h2 className="text-5xl md:text-8xl font-black mb-10 tracking-tighter">
                       Pronto para o <br/> Próximo <span className="text-[#FFDE21]">Nível?</span>
                    </h2>
                    <p className="text-white/40 text-xl max-w-2xl mb-16 leading-relaxed">
                       O design comum gera resultados comuns. Escolha a excelência e destaque-se no mercado premium de forma definitiva.
                    </p>
                    
                    <MagneticCTA text="Agendar Consultoria Grátis" className="text-xl px-12 py-6" />

                 </div>
              </motion.div>
           </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="py-12 border-t border-white/5 relative z-10 bg-[#020202]">
        <div className="container mx-auto px-8 flex flex-col md:flex-row items-center justify-between gap-8">
          <LogoPremium />
          <p className="text-white/20 text-xs font-black uppercase tracking-[0.2em]">© {new Date().getFullYear()} Ideal Solutions. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default PremiumLanding;
