import { memo } from "react";
import { m } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ExternalLink, Brain, Target, Lightbulb, Rocket } from "lucide-react";
import { fadeUp, containerStagger, item as itemVariant, headingViewport, cardGridViewport, sectionViewport } from "@/lib/motion";

const EventsSection = memo(() => {
  const agenda = [
    {
      number: 1,
      time: "19:00 - 19:45",
      title: "Fundamentos de IA",
      description: "O que é Inteligência Artificial, Machine Learning e Deep Learning na prática. Construa uma base sólida para compreender o que está por trás das ferramentas modernas de IA.",
      icon: Brain,
      color: "bg-amber-neon/10"
    },
    {
      number: 2,
      time: "19:45 - 20:30",
      title: "Ferramentas Essenciais",
      description: "ChatGPT é interessante, mas existem outras ferramentas que você precisa conhecer. Exploraremos desde o ChatGPT até plataformas que potencializam sua produtividade e criatividade com o apoio da automação.",
      icon: Target,
      color: "bg-amber-neon/10"
    },
    {
      number: 3,
      time: "20:30 - 21:15",
      title: "Aplicações Práticas",
      description: "Como usar IA no marketing, vendas, produtividade e automação de tarefas.",
      icon: Lightbulb,
      color: "bg-amber-neon/10"
    },
    {
      number: 4,
      time: "21:15 - 22:00",
      title: "Revisão Completa - Mapeamento",
      description: "Um mapa que conecta tudo o que você aprendeu durante a aula e transforma em ação para seus projetos profissionais.",
      icon: Rocket,
      color: "bg-amber-neon/10"
    }
  ];

  const handleLearnMore = () => {
    window.open('https://www.cyberclasseventos.com.br', '_blank');
  };

  return (
    <>
      {/* Gradient separator before section */}
      <div className="h-24 bg-gradient-to-b from-background to-white"></div>
      
      <section id="eventos" className="py-20 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <m.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={headingViewport}
          className="text-center mb-16 gpu-accelerated"
        >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              <span className="text-black">Eventos </span>
              <span className="text-amber-neon">CyberClass</span>
            </h2>
          </m.div>

          <div className="max-w-5xl mx-auto mb-12">
        <m.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={headingViewport}
          className="text-center mb-12 gpu-accelerated"
        >
              <h4 className="text-2xl md:text-3xl font-bold text-black mb-4">
                Agenda do Aulão
              </h4>
              <p className="text-gray-600">
                3 horas de conteúdo intensivo e prático, divididas em 4 módulos estratégicos
              </p>
            </m.div>

            <m.div 
              variants={containerStagger}
              initial="hidden"
              whileInView="show"
              viewport={cardGridViewport}
              className="grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              {agenda.map((item) => (
                <m.div
                  key={item.number}
                  variants={itemVariant}
                  className="relative bg-white border-2 border-gray-200 rounded-2xl p-6 hover:border-amber-neon/50 transition-all duration-300 md:hover:shadow-lg gpu-accelerated"
                >
                  <div className="absolute -top-4 -right-4 w-12 h-12 bg-amber-neon rounded-full flex items-center justify-center text-black font-bold text-lg shadow-lg">
                    {item.number}
                  </div>
                  
                  <div className="flex items-start gap-4 mb-4">
                    <div className={`w-12 h-12 ${item.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                      <item.icon className="w-6 h-6 text-amber-neon" />
                    </div>
                  <div className="flex-1">
                      <p className="text-amber-neon text-sm font-semibold mb-1">
                        {item.time}
                      </p>
                      <h5 className="text-xl font-bold text-black mb-2">
                        {item.title}
                      </h5>
                    </div>
                  </div>
                  
                  <p className="text-gray-700 leading-relaxed">
                    {item.description}
                  </p>
                </m.div>
              ))}
            </m.div>
          </div>

        <m.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={sectionViewport}
          className="text-center gpu-accelerated"
        >
            <Button
              onClick={handleLearnMore}
              className="text-lg px-8 py-6 bg-amber-neon hover:bg-amber-neon/90 text-black font-semibold transition-transform duration-200 hover:scale-105"
            >
              <ExternalLink className="w-5 h-5 mr-2" />
              Saiba Mais
            </Button>
          </m.div>
        </div>
      </section>

      {/* Gradient separator after section */}
      <div className="h-24 bg-gradient-to-b from-white to-background"></div>
    </>
  );
});

EventsSection.displayName = "EventsSection";

export default EventsSection;
