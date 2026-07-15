import { useState, useEffect } from "react";
import { X, ArrowRight, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useBusiness } from "@/hooks/useBusiness";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

interface Step {
  id: string;
  title: string;
  description: string;
  targetId?: string;
}

export const Onboarding = () => {
  const { data: business } = useBusiness();
  const queryClient = useQueryClient();
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [tooltipPos, setTooltipPos] = useState<{ top: number; left: number; arrowOffset?: number } | null>(null);

  const steps: Step[] = [
    {
      id: "welcome",
      title: "Boas-vindas ao ZapAgenda! 👋",
      description: "Vamos deixar sua agenda pronta em menos de 2 minutos.",
    },
    {
      id: "services",
      title: "Crie seus serviços ✂️",
      description: "Defina o que você oferece e a duração de cada serviço.",
      targetId: "nav-services",
    },
    {
      id: "hours",
      title: "Horários e Almoço ⏰",
      description: "Defina seus horários de atendimento e intervalo de almoço.",
      targetId: "nav-hours",
    },
    {
      id: "settings",
      title: "Conecte seu WhatsApp 📱",
      description: "Conecte seu número para automatizar os agendamentos.",
      targetId: "nav-settings",
    },
    {
      id: "final",
      title: "Pronto para decolar! 🚀",
      description: "Agora é só compartilhar seu link e começar a receber agendamentos.",
    },
  ];

  useEffect(() => {
    if (business) {
      const isCompletedInDB = business.description?.includes("[ONBOARDING:COMPLETED]");
      const isCompletedInLocal = localStorage.getItem("onboardingCompleted");
      
      if (!isCompletedInDB && !isCompletedInLocal) {
        setIsVisible(true);
      }
    }
  }, [business]);

  useEffect(() => {
    if (!isVisible) return;
    const targetId = steps[currentStep]?.targetId;
    if (targetId) {
      const el = document.getElementById(targetId);
      if (el) {
        const rect = el.getBoundingClientRect();
        const screenWidth = window.innerWidth;
        const padding = 20;
        const tooltipWidth = Math.min(320, screenWidth - padding * 2);
        
        let left = rect.left + rect.width / 2;
        
        // Clamp to screen edges
        const minLeft = tooltipWidth / 2 + padding;
        const maxLeft = screenWidth - tooltipWidth / 2 - padding;
        
        const clampedLeft = Math.max(minLeft, Math.min(maxLeft, left));
        const arrowOffset = left - clampedLeft;

        setTooltipPos({
          top: rect.bottom + window.scrollY + 12,
          left: clampedLeft + window.scrollX,
          arrowOffset: arrowOffset
        });
        return;
      }
    }
    setTooltipPos(null);
  }, [currentStep, isVisible]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeOnboarding();
    }
  };

  const completeOnboarding = async () => {
    if (!business) return;
    
    // Save to local storage for immediate UI response
    localStorage.setItem("onboardingCompleted", "true");
    setIsVisible(false);

    // Persist to DB in description
    if (!business.description?.includes("[ONBOARDING:COMPLETED]")) {
      const newDesc = `${business.description || ""}\n[ONBOARDING:COMPLETED]`.trim();
      await supabase.from("businesses").update({ description: newDesc }).eq("id", business.id);
      queryClient.invalidateQueries({ queryKey: ["business"] });
    }
  };

  if (!isVisible) return null;

  const step = steps[currentStep];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay Background */}
      <div 
        className="absolute inset-0 bg-[#0F172A]/50 backdrop-blur-sm transition-all duration-300"
        onClick={completeOnboarding}
      />

      {/* Conditional Tooltip Position */}
      {tooltipPos ? (
        <div 
          className="absolute z-50 bg-white border border-gray-100 rounded-2xl p-6 shadow-2xl w-[280px] sm:w-[320px] flex flex-col gap-4 animate-in fade-in zoom-in-95 duration-300"
          style={{ 
            top: tooltipPos.top, 
            left: tooltipPos.left,
            transform: "translateX(-50%)"
          }}
        >
          {/* Arrow pointing up */}
          <div 
            className="absolute -top-2 left-1/2 w-4 h-4 bg-white border-t border-l border-gray-100 rotate-45"
            style={{ 
              transform: `translateX(-50%) translateX(${tooltipPos.arrowOffset || 0}px) rotate(45deg)`
            }}
          />
          
          <div className="relative">
            <p className="text-[10px] font-black text-[#2AD467] uppercase tracking-wider mb-1">
              Passo {currentStep + 1} de {steps.length}
            </p>
            <h3 className="font-display font-black text-lg text-[#132239] leading-tight">
              {step.title}
            </h3>
            <p className="text-gray-500 font-medium text-xs sm:text-sm mt-1 leading-relaxed">
              {step.description}
            </p>
          </div>

          <div className="flex items-center justify-between gap-4 mt-1">
            <Button variant="ghost" onClick={completeOnboarding} className="text-gray-400 hover:text-gray-600 font-bold text-xs h-9 px-3 rounded-xl">
              Pular
            </Button>
            <Button onClick={handleNext} className="btn-zap h-10 px-5 rounded-xl font-bold gap-2 text-xs flex items-center">
              Próximo
              <ArrowRight className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      ) : (
        /* Central Welcome/Completion Modal */
        <div className="absolute z-50 bg-white border border-gray-100 rounded-3xl p-8 shadow-2xl max-w-md w-[90%] flex flex-col items-center text-center gap-6 animate-in fade-in zoom-in-95 duration-300">
          <div className="relative">
            <p className="text-[10px] font-black text-[#2AD467] uppercase tracking-wider mb-2">
              Passo {currentStep + 1} de {steps.length}
            </p>
            <h2 className="font-display font-black text-2xl text-[#132239] leading-tight">
              {step.title}
            </h2>
            <p className="text-gray-500 font-medium text-base mt-2 leading-relaxed">
              {step.description}
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 w-full mt-2">
            <Button 
              onClick={handleNext} 
              className="btn-zap w-full h-12 rounded-2xl font-black text-base gap-2 flex items-center justify-center shadow-lg shadow-[#2AD467]/20 transition-all hover:scale-[1.02]"
            >
              {currentStep === 0 ? "Começar" : "Finalizar"}
              {currentStep === 0 ? <ArrowRight className="w-5 h-5" /> : <Check className="w-5 h-5" />}
            </Button>
            {currentStep === 0 && (
              <Button 
                variant="ghost" 
                onClick={completeOnboarding} 
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-50 font-bold text-sm w-full h-12 rounded-2xl"
              >
                Pular onboarding
              </Button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};


