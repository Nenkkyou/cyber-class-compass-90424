import { memo } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ShieldCheck, Brain, Zap } from "lucide-react";
import { ShootingStars } from "@/components/ui/shooting-stars";
import { SparklesCore } from "@/components/ui/sparkles";
import { GalaxyBackground } from "@/components/ui/galaxy-background";

const Hero = memo(() => {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    element?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-[#0a1628] via-[#0c1e3d] to-[#0f2847]">
      {/* Galaxy Background */}
      <GalaxyBackground />
      
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
          {/* Logo/Brand with Sparkles */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.1, ease: "easeOut" }}
            className="mb-8 gpu-accelerated relative"
          >
            <h1 className="text-6xl md:text-8xl font-bold mb-4 relative z-20">
              <span className="text-amber-neon animate-glow">Cyber</span>
              <span className="text-foreground"> Class</span>
            </h1>
            
            {/* Sparkles Effect */}
            <div className="w-full h-32 absolute -bottom-4 left-0">
              {/* Gradients */}
              <div className="absolute inset-x-20 top-0 bg-gradient-to-r from-transparent via-amber-neon to-transparent h-[2px] w-3/4 blur-sm" />
              <div className="absolute inset-x-20 top-0 bg-gradient-to-r from-transparent via-amber-neon to-transparent h-px w-3/4" />
              <div className="absolute inset-x-60 top-0 bg-gradient-to-r from-transparent via-amber-neon/70 to-transparent h-[5px] w-1/4 blur-sm" />
              <div className="absolute inset-x-60 top-0 bg-gradient-to-r from-transparent via-amber-neon/70 to-transparent h-px w-1/4" />

              {/* Sparkles Core */}
              <SparklesCore
                background="transparent"
                minSize={0.4}
                maxSize={1}
                particleDensity={1200}
                className="w-full h-full"
                particleColor="#FFC107"
              />

              {/* Radial Gradient Mask */}
              <div className="absolute inset-0 w-full h-full [mask-image:radial-gradient(350px_200px_at_top,transparent_20%,white)]"></div>
            </div>
          </motion.div>

          {/* Slogan */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2, ease: "easeOut" }}
            className="text-xl md:text-2xl text-muted-foreground mb-12 leading-relaxed gpu-accelerated"
          >
            O elo entre o futuro digital e quem precisa de um guia humano para chegar lá
          </motion.p>

          {/* Feature highlights */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3, ease: "easeOut" }}
            className="flex flex-wrap justify-center gap-6 mb-12 gpu-accelerated"
          >
            <div className="flex items-center gap-2 text-amber-neon">
              <Brain className="w-5 h-5" />
              <span>IA Acessível</span>
            </div>
            <div className="flex items-center gap-2 text-amber-neon">
              <ShieldCheck className="w-5 h-5" />
              <span>Cibersegurança</span>
            </div>
            <div className="flex items-center gap-2 text-amber-neon">
              <Zap className="w-5 h-5" />
              <span>Suporte Técnico</span>
            </div>
          </motion.div>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3, delay: 0.4, ease: "easeOut" }}
            className="gpu-accelerated"
          >
            <Button
              variant="cyber"
              size="lg"
              onClick={() => scrollToSection('sobre')}
              className="text-lg px-8 py-6 h-auto"
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