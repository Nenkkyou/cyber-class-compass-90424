import { memo } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Brain, Zap } from "lucide-react";
import { ShootingStars } from "@/components/ui/shooting-stars";
import { DottedSurface } from "@/components/ui/dotted-surface";

const Hero = memo(() => {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center bg-cyber-gradient overflow-hidden">
      {/* Dotted Surface - only in Hero */}
      <DottedSurface />
      
      {/* Shooting Stars Background */}
      <ShootingStars
        starColor="#FFC107"
        trailColor="#FF6B35"
        minSpeed={15}
        maxSpeed={35}
        minDelay={1000}
        maxDelay={3000}
      />
      <ShootingStars
        starColor="#00BCD4"
        trailColor="#9C27B0"
        minSpeed={10}
        maxSpeed={25}
        minDelay={2000}
        maxDelay={4000}
      />
      
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-amber-neon rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-navy rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="max-w-4xl mx-auto gpu-accelerated"
        >
          {/* Logo/Brand */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
            className="mb-6 sm:mb-8 gpu-accelerated"
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-8xl font-bold mb-3 sm:mb-4 px-2">
              <span className="text-amber-neon animate-glow">Cyber</span>
              <span className="text-foreground"> Class</span>
            </h1>
          </motion.div>

          {/* Slogan */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }}
            className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground mb-8 sm:mb-12 leading-relaxed px-4 gpu-accelerated"
          >
            O elo entre o futuro digital e quem precisa de um guia humano para chegar lá
          </motion.p>

          {/* Feature highlights */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3, ease: "easeOut" }}
            className="flex flex-wrap justify-center gap-3 sm:gap-4 md:gap-6 mb-8 sm:mb-12 px-4 gpu-accelerated"
          >
            <div className="flex items-center gap-1.5 sm:gap-2 text-amber-neon text-sm sm:text-base">
              <Brain className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
              <span>IA Acessível</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 text-amber-neon text-sm sm:text-base">
              <ShieldCheck className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
              <span>Cibersegurança</span>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 text-amber-neon text-sm sm:text-base">
              <Zap className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
              <span>Suporte Técnico</span>
            </div>
          </motion.div>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.4, ease: "easeOut" }}
            className="gpu-accelerated px-4"
          >
            <Button
              variant="cyber"
              size="lg"
              onClick={() => scrollToSection('sobre')}
              className="text-sm sm:text-base md:text-lg px-6 sm:px-8 py-4 sm:py-6 h-auto"
            >
              Conheça a Cyber Class
            </Button>
          </motion.div>
        </motion.div>

      </div>
    </section>
  );
});

Hero.displayName = "Hero";

export default Hero;