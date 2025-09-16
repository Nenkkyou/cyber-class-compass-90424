import { memo, useCallback } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, Brain, Laptop, Users, Heart, Target } from "lucide-react";

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
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          viewport={{ once: true, margin: "-50px" }}
          className="text-center mb-16 gpu-accelerated"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Sobre a <span className="text-amber-neon">Cyber Class</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Atuamos com a energia de quem está começando e o olhar atento de quem conhece a realidade das pessoas. 
            Nosso propósito é ser a ponte entre o universo digital e quem ainda precisa de apoio humano para atravessá-lo.
          </p>
        </motion.div>

        {/* Main Services */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
          viewport={{ once: true, margin: "-50px" }}
          className="grid md:grid-cols-3 gap-8 mb-20 gpu-accelerated"
        >
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05, ease: "easeOut" }}
              viewport={{ once: true, margin: "-50px" }}
              className="bg-card p-8 rounded-lg border border-border hover:border-amber-neon/50 transition-all duration-200 group gpu-accelerated"
            >
              <div className="flex items-center justify-center w-16 h-16 bg-amber-neon/10 rounded-lg mb-6 mx-auto group-hover:bg-amber-neon/20 transition-colors duration-300">
                <feature.icon className="w-8 h-8 text-amber-neon" />
              </div>
              <h3 className="text-xl font-semibold mb-4 text-center">{feature.title}</h3>
              <p className="text-muted-foreground text-center leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Values Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h3 className="text-3xl font-bold mb-6">Nossos Valores</h3>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Cada projeto que realizamos é guiado por nossos valores fundamentais, 
            sempre colocando as pessoas em primeiro lugar.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          viewport={{ once: true }}
          className="grid md:grid-cols-3 gap-8"
        >
          {values.map((value, index) => (
            <motion.div
              key={value.title}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="text-center group"
            >
              <div className="flex items-center justify-center w-12 h-12 bg-navy/20 rounded-full mb-4 mx-auto group-hover:bg-navy/40 transition-colors duration-300">
                <value.icon className="w-6 h-6 text-navy" />
              </div>
              <h4 className="text-lg font-semibold mb-3">{value.title}</h4>
              <p className="text-muted-foreground text-sm leading-relaxed">{value.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
});

AboutSection.displayName = "AboutSection";

export default AboutSection;