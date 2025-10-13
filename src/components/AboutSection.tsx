import { memo } from "react";
import { m } from "framer-motion";
import { ShieldCheck, Brain, Laptop, Users, Heart, Target } from "lucide-react";
import { fadeUp, containerStagger, item, headingViewport, cardGridViewport } from "@/lib/motion";

const AboutSection = memo(() => {
  const features = [
    {
      icon: Brain,
      title: "IA Acessível",
      description: "Democratizamos o conhecimento em inteligência artificial com linguagem simples e aplicações práticas."
    },
    {
      icon: ShieldCheck,
      title: "Cibersegurança",
      description: "Protegemos pessoas comuns de golpes online com ferramentas e educação em segurança digital."
    },
    {
      icon: Laptop,
      title: "Suporte Técnico",
      description: "Oferecemos manutenção e suporte técnico presencial e remoto para resolver problemas reais."
    }
  ];

  const values = [
    {
      icon: Users,
      title: "Inclusão Digital",
      description: "Acreditamos que todos merecem acesso ao mundo digital de forma segura e educativa."
    },
    {
      icon: Heart,
      title: "Atendimento Humano",
      description: "Combinamos tecnologia avançada com o cuidado e atenção que cada pessoa merece."
    },
    {
      icon: Target,
      title: "Soluções Práticas",
      description: "Focamos em resolver problemas reais com soluções diretas e funcionais."
    }
  ];

  return (
    <section id="sobre" className="py-20 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <m.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={headingViewport}
          className="text-center mb-16 gpu-accelerated"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6">
            Sobre a <span className="text-amber-neon">Cyber Class</span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed px-2">
            Atuamos com a energia de quem está começando e o olhar atento de quem conhece a realidade das pessoas. 
            Nosso propósito é ser a ponte entre o universo digital e quem ainda precisa de apoio humano para atravessá-lo.
          </p>
        </m.div>

        {/* Main Services */}
        <m.div
          variants={containerStagger}
          initial="hidden"
          whileInView="show"
          viewport={cardGridViewport}
          className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8 mb-16 sm:mb-20"
        >
          {features.map((feature) => (
            <m.div
              key={feature.title}
              variants={item}
              className="bg-card p-5 sm:p-6 md:p-8 rounded-lg border border-border hover:border-amber-neon/50 transition-all duration-200 group gpu-accelerated"
            >
              <div className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 bg-amber-neon/10 rounded-lg mb-4 sm:mb-6 mx-auto group-hover:bg-amber-neon/20 transition-colors duration-300">
                <feature.icon className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-amber-neon" />
              </div>
              <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-center">{feature.title}</h3>
              <p className="text-sm sm:text-base text-muted-foreground text-center leading-relaxed">{feature.description}</p>
            </m.div>
          ))}
        </m.div>

        {/* Values Section */}
        <m.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={headingViewport}
          className="text-center mb-8 sm:mb-12 gpu-accelerated"
        >
          <h3 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 px-2">Nossos Valores</h3>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
            Cada projeto que realizamos é guiado por nossos valores fundamentais, 
            sempre colocando as pessoas em primeiro lugar.
          </p>
        </m.div>

        <m.div
          variants={containerStagger}
          initial="hidden"
          whileInView="show"
          viewport={cardGridViewport}
          className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8"
        >
          {values.map((value) => (
            <m.div
              key={value.title}
              variants={item}
              className="text-center group px-2 gpu-accelerated"
            >
              <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-amber-neon/10 rounded-full mb-3 sm:mb-4 mx-auto group-hover:bg-amber-neon/20 transition-colors duration-300">
                <value.icon className="w-5 h-5 sm:w-6 sm:h-6 text-amber-neon" />
              </div>
              <h4 className="text-base sm:text-lg font-semibold mb-2 sm:mb-3">{value.title}</h4>
              <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed">{value.description}</p>
            </m.div>
          ))}
        </m.div>
      </div>
    </section>
  );
});

AboutSection.displayName = "AboutSection";

export default AboutSection;