import { useState, memo, useCallback } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import StarRating from "@/components/ui/star-rating";
import { ChevronLeft, ChevronRight, Star, ExternalLink } from "lucide-react";
import { useKeenSlider } from "keen-slider/react";
import "keen-slider/keen-slider.min.css";
import { autoplayPlugin } from "@/lib/keenAutoplay";

const PortfolioShowcase = memo(() => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [loaded, setLoaded] = useState(false);

  const [sliderRef, instanceRef] = useKeenSlider<HTMLDivElement>(
    {
      initial: 0,
      slideChanged(slider) {
        setCurrentSlide(slider.track.details.rel);
      },
      created() {
        setLoaded(true);
      },
      loop: true,
      mode: "snap",
      slides: {
        perView: 1,
        spacing: 16,
        origin: "auto",
      },
      breakpoints: {
        "(min-width: 768px)": {
          slides: {
            perView: 2,
            spacing: 20,
            origin: "auto",
          },
        },
        "(min-width: 1024px)": {
          slides: {
            perView: 3,
            spacing: 24,
            origin: "auto",
          },
        },
      },
      renderMode: "performance",
      drag: true,
      rubberband: false,
    },
    [autoplayPlugin({ delay: 3500, pauseOnHover: true, pauseOnFocus: true })]
  );

  const portfolioItems = [
    {
      type: "maintenance",
      title: "Notebook Dell Inspiron - Restauração Completa",
      before: "Sistema lento, vírus, superaquecimento",
      after: "Performance 300% melhor, sistema limpo",
      client: "Professora Maria - Escola Pública",
      rating: 5,
      image: "/api/placeholder/300/200"
    },
    {
      type: "student-feedback",
      title: "Curso IA para Educadores",
      content: "Aprendi a usar IA para criar exercícios personalizados para meus alunos. Revolucionou minha forma de ensinar!",
      client: "João Silva - Professor de Matemática",
      rating: 5,
      course: "IA Básica para Educação"
    },
    {
      type: "pdf-result",
      title: "PDF: Cibersegurança para Iniciantes",
      downloads: 847,
      
      testimonial: "Material didático excelente, linguagem clara e exemplos práticos",
      topics: ["Senhas Seguras", "Golpes Online", "Navegação Segura"]
    },
    {
      type: "maintenance",
      title: "Setup Home Office Completo",
      before: "Equipamentos desorganizados, rede instável",
      after: "Ambiente profissional, rede otimizada",
      client: "Ana Costa - Freelancer",
      rating: 5,
      image: "/api/placeholder/300/200"
    },
    {
      type: "student-feedback",
      title: "Mentoria Pessoal em IA",
      content: "Em 3 meses consegui implementar IA no meu pequeno negócio. O retorno já pagou o investimento!",
      client: "Carlos Mendes - Empreendedor",
      rating: 5,
      course: "Mentoria Individual"
    },
    {
      type: "pdf-result",
      title: "PDF: IA no Dia a Dia",
      downloads: 1200,
      
      testimonial: "Transformou minha percepção sobre inteligência artificial",
      topics: ["Ferramentas Práticas", "Cases Reais", "Passo a Passo"]
    }
  ];

  const renderCard = (item: any, index: number) => {
    switch (item.type) {
      case "maintenance":
        return (
          <div className="bg-card/80 backdrop-blur-sm p-6 rounded-lg border border-border/50 h-[340px] md:h-[360px] flex flex-col shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="space-y-4 flex-1">
              <h3 className="text-lg font-semibold text-foreground">{item.title}</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div className="space-y-2">
                  <span className="text-red-400 font-medium block">Antes:</span>
                  <p className="text-muted-foreground">{item.before}</p>
                </div>
                <div className="space-y-2">
                  <span className="text-green-400 font-medium block">Depois:</span>
                  <p className="text-muted-foreground">{item.after}</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-4 border-t border-border/50 mt-auto">
                <span className="text-sm text-muted-foreground font-medium">{item.client}</span>
                <div className="flex gap-0.5">
                  {[...Array(item.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-neon text-amber-neon" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case "student-feedback":
        return (
          <div className="bg-card/80 backdrop-blur-sm p-6 rounded-lg border border-border/50 h-[340px] md:h-[360px] flex flex-col shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="space-y-4 flex-1">
              <h3 className="text-lg font-semibold text-foreground">{item.title}</h3>
              
              <blockquote className="text-muted-foreground italic leading-relaxed flex-1">
                "{item.content}"
              </blockquote>

              <div className="flex items-center justify-between pt-4 border-t border-border/50 mt-auto">
                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground">{item.client}</p>
                  <p className="text-xs text-muted-foreground">{item.course}</p>
                </div>
                <div className="flex gap-0.5">
                  {[...Array(item.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-neon text-amber-neon" />
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case "pdf-result":
        return (
          <div className="bg-card/80 backdrop-blur-sm p-6 rounded-lg border border-border/50 h-[340px] md:h-[360px] flex flex-col shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="space-y-4 flex-1">
              <h3 className="text-lg font-semibold text-foreground">{item.title}</h3>
              
              <div className="flex gap-2 flex-wrap">
                {item.topics.map((topic: string, i: number) => (
                  <span key={i} className="text-xs bg-amber-neon/20 text-amber-neon px-3 py-1 rounded-full font-medium border border-amber-neon/30">
                    {topic}
                  </span>
                ))}
              </div>

              <blockquote className="text-sm text-muted-foreground italic leading-relaxed flex-1">
                "{item.testimonial}"
              </blockquote>

              <div className="flex items-center justify-between pt-4 border-t border-border/50 mt-auto">
                <span className="text-sm text-muted-foreground font-medium">{item.downloads} downloads</span>
                <StarRating rating={4.5} />
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <section id="portfolio" className="py-20 bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          viewport={{ once: true, margin: "-50px" }}
          className="text-center mb-16 gpu-accelerated"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Nosso <span className="text-amber-neon">Portfólio</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Resultados reais de clientes reais. Veja o impacto dos nossos serviços na vida das pessoas.
          </p>
        </motion.div>

        <div className="relative px-4 sm:px-8">
          <div ref={sliderRef} className="keen-slider overflow-hidden">
            {portfolioItems.map((item, index) => (
              <div key={index} className="keen-slider__slide flex min-h-0">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.25, delay: Math.min(index * 0.03, 0.3), ease: "easeOut" }}
                  className="w-full gpu-accelerated"
                >
                  {renderCard(item, index)}
                </motion.div>
              </div>
            ))}
          </div>

          {loaded && instanceRef.current && (
            <>
              <Button
                variant="outline"
                size="icon"
                className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm border-border hover:bg-background/90 hover:border-amber-neon/50 transition-all duration-300"
                onClick={() => instanceRef.current?.prev()}
                
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>

              <Button
                variant="outline"
                size="icon"
                className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-background/80 backdrop-blur-sm border-border hover:bg-background/90 hover:border-amber-neon/50 transition-all duration-300"
                onClick={() => instanceRef.current?.next()}
                
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>

      </div>
    </section>
  );
});

PortfolioShowcase.displayName = "PortfolioShowcase";

export default PortfolioShowcase;
