import { useState } from 'react';
import { Activity, ShieldCheck, HeartPulse, Sparkles, ChevronRight } from 'lucide-react';

const painPoints = [
  {
    id: 'cervical',
    x: '50%',
    y: '15%',
    title: 'Coluna Cervical',
    desc: 'Alívio de tensões, dores de cabeça tensionais e limitação de movimento no pescoço.',
    icon: Sparkles
  },
  {
    id: 'ombro',
    x: '32%',
    y: '26%',
    title: 'Ombro',
    desc: 'Tratamento de bursite, tendinite e lesões no manguito rotador para restaurar a amplitude de movimento.',
    icon: ShieldCheck
  },
  {
    id: 'lombar',
    x: '50%',
    y: '45%',
    title: 'Lombar',
    desc: 'Abordagem focada em hérnias de disco, ciático e dores crônicas para devolver estabilidade.',
    icon: Activity
  },
  {
    id: 'joelho',
    x: '62%',
    y: '72%',
    title: 'Joelho',
    desc: 'Recuperação de artrose, menisco, Liggamentos (LCA) e fortalecimento para esportes.',
    icon: HeartPulse
  }
];

export default function InteractiveAnatomy() {
  const [active, setActive] = useState(painPoints[2]);

  return (
    <section className="py-16 md:py-24 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        
        <div className="text-center mb-16">
          <p className="text-[11px] font-bold tracking-[0.2em] uppercase mb-3 text-[#31B8D2]">MAPEAMENTO DA DOR</p>
          <h2 style={{ fontFamily: "'Sora', sans-serif" }} className="text-3xl md:text-4xl font-extrabold mb-4">
            Aonde dói? Eu sei como ajudar.
          </h2>
          <p className="text-gray-500 max-w-2xl mx-auto">
            Clique nos pontos indicados no corpo e entenda como nossa abordagem personalizada pode tratar e recuperar cada região específica.
          </p>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-center gap-10 lg:gap-20">
          
          {/* Lado Esquerdo: Anatomia (SVG abstrato) */}
          <div className="relative w-full max-w-[300px] aspect-[1/2] mx-auto flex items-center justify-center">
            {/* Minimalist Human Body Outline SVG */}
            <svg viewBox="0 0 100 200" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full text-[#E8F7FA] opacity-80">
              {/* Cabeça */}
              <circle cx="50" cy="15" r="10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              {/* Corpo */}
              <path d="M50 25 V90 M30 35 Q50 20 70 35 M30 35 L15 80 M70 35 L85 80" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              {/* Pernas */}
              <path d="M50 90 L35 185 M50 90 L65 185 M35 130 L40 185 M65 130 L60 185" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <path d="M25 100 Q50 90 75 100" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeDasharray="2 4" />
            </svg>

            {/* Glowing Dots */}
            {painPoints.map((pt) => (
              <button
                key={pt.id}
                onClick={() => setActive(pt)}
                className={`anatomy-dot absolute w-6 h-6 rounded-full -ml-3 -mt-3 flex items-center justify-center cursor-pointer
                  ${active.id === pt.id ? 'active' : 'bg-[#31B8D2]/60 hover:bg-[#31B8D2]'}`}
                style={{ top: pt.y, left: pt.x }}
                aria-label={pt.title}
              >
                <span className="w-2.5 h-2.5 bg-white rounded-full block"></span>
              </button>
            ))}
          </div>

          {/* Lado Direito: Glass Card Informativo */}
          <div className="w-full max-w-[400px]">
            <div className="glass-card !p-8 animate-fade-in" key={active.id}>
              <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6" style={{ background: "linear-gradient(135deg, #31B8D2, #7DD3E8)" }}>
                <active.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold mb-3" style={{ fontFamily: "'Sora', sans-serif" }}>
                {active.title}
              </h3>
              <p className="text-[15px] leading-relaxed text-gray-600 mb-6">
                {active.desc}
              </p>
              <a href="https://wa.me/5500000000000" className="inline-flex items-center gap-2 text-sm font-semibold text-[#31B8D2] hover:text-[#2499AE] transition-colors group">
                Saber mais sobre o tratamento
                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
