import { memo } from "react";
import { m } from "framer-motion";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { fadeUp, headingViewport } from "@/lib/motion";
import { 
  Bot, 
  Sparkles, 
  MessageCircle,
  Zap,
  Brain,
  Clock
} from "lucide-react";

const AISection = memo(() => {
  const features = [
    {
      icon: <MessageCircle className="w-5 h-5" />,
      title: "Tire Dúvidas Instantâneas",
      description: "Pergunte sobre nossos cursos e serviços a qualquer momento"
    },
    {
      icon: <Brain className="w-5 h-5" />,
      title: "Respostas Inteligentes",
      description: "Powered by GPT-4o Mini para respostas precisas e contextuais"
    },
    {
      icon: <Clock className="w-5 h-5" />,
      title: "Disponível 24/7",
      description: "Atendimento automático a qualquer hora do dia ou da noite"
    },
    {
      icon: <Zap className="w-5 h-5" />,
      title: "Respostas Rápidas",
      description: "Obtenha informações em segundos, sem espera"
    }
  ];

  return (
    <section id="ia" className="py-20 bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <m.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={headingViewport}
          className="text-center mb-16 gpu-accelerated"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Fale com a <span className="text-amber-neon">Nossa IA</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Tire suas dúvidas sobre cursos, serviços e tudo relacionado à CyberClass com nossa inteligência artificial
          </p>
        </m.div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Card Principal */}
          <m.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6 }}
            className="relative"
          >
            <div className="relative p-8 rounded-3xl border-2 border-amber-neon/30 bg-gradient-to-br from-card via-card to-amber-neon/5 overflow-hidden group hover:border-amber-neon/50 transition-all duration-500">
              {/* Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-amber-neon/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              
              {/* Icon */}
              <div className="relative mb-6">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-neon/20 to-amber-neon/5 flex items-center justify-center border border-amber-neon/30 group-hover:scale-110 transition-transform duration-500">
                  <Bot className="w-10 h-10 text-amber-neon" />
                </div>
                <m.div
                  animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity }}
                  className="absolute -top-2 -right-2"
                >
                  <Sparkles className="w-6 h-6 text-amber-neon" />
                </m.div>
              </div>

              {/* Content */}
              <h3 className="text-2xl font-bold mb-4 relative">
                Assistente Virtual <span className="text-amber-neon">CyberClass</span>
              </h3>
              <p className="text-muted-foreground mb-6 relative leading-relaxed">
                Nossa IA está pronta para responder suas perguntas sobre cursos, preços, 
                serviços de desenvolvimento, automações e muito mais. Experimente agora!
              </p>

              {/* CTA Button */}
              <Link to="/ia">
                <Button className="w-full bg-amber-neon hover:bg-amber-neon/90 text-black font-semibold py-6 text-lg rounded-xl group/btn relative overflow-hidden">
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    <MessageCircle className="w-5 h-5" />
                    Iniciar Conversa
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-neon via-amber-glow to-amber-neon bg-[length:200%_100%] group-hover/btn:animate-[shimmer_1.5s_infinite] opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                </Button>
              </Link>

              {/* Decorative Elements */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-neon/10 rounded-full blur-3xl opacity-50" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-amber-neon/10 rounded-full blur-2xl opacity-30" />
            </div>
          </m.div>

          {/* Features Grid */}
          <m.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          >
            {features.map((feature, index) => (
              <m.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 * index }}
                className="p-5 rounded-xl border border-border bg-card/50 hover:bg-card hover:border-amber-neon/30 transition-all duration-300 group"
              >
                <div className="flex items-start space-x-4">
                  <div className="w-10 h-10 rounded-lg bg-amber-neon/10 flex items-center justify-center text-amber-neon group-hover:bg-amber-neon group-hover:text-black transition-all duration-300">
                    {feature.icon}
                  </div>
                  <div>
                    <h4 className="font-semibold mb-1">{feature.title}</h4>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </div>
                </div>
              </m.div>
            ))}
          </m.div>
        </div>
      </div>
    </section>
  );
});

AISection.displayName = "AISection";

export default AISection;
