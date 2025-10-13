import { memo, useCallback } from "react";
import { m } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import StarRating from "@/components/ui/star-rating";
import { fadeUp, containerStagger, item, standardViewport } from "@/lib/motion";
import { 
  FileText, 
  Brain, 
  Shield, 
  CheckCircle, 
  Download,
  ExternalLink
} from "lucide-react";

const PDFStoreSection = memo(() => {
  const pdfs = [
    {
      title: "Guia Prático: Como Não Ser Substituído Pela IA - Vol 1",
      description: "Manual essencial para profissionais que querem evoluir junto com a inteligência artificial",
      topics: ["Adaptação Profissional", "Habilidades do Futuro", "Convivência com IA", "Estratégias Práticas"],
      price: "R$ 49,90",
      
      downloads: 1247,
      categories: ["IA", "Carreira"],
      validated: true,
      accessible: true
    },
    {
      title: "Curso Excel - Básico ao Intermediário",
      description: "Domine as principais funcionalidades do Excel para aumentar sua produtividade",
      topics: ["Fórmulas Básicas", "Tabelas Dinâmicas", "Gráficos", "Funções Avançadas"],
      price: "R$ 49,90",
      
      downloads: 2156,
      categories: ["Office", "Produtividade"],
      validated: true,
      accessible: true
    },
    {
      title: "Curso Power Point - Básico ao Intermediário",
      description: "Crie apresentações profissionais e impactantes com técnicas avançadas",
      topics: ["Design de Slides", "Animações", "Templates", "Apresentação Eficaz"],
      price: "R$ 49,90",
      
      downloads: 1834,
      categories: ["Office", "Design"],
      validated: true,
      accessible: true
    }
  ];

  const handlePurchase = useCallback((title: string, price: string) => {
    // Abre o bot do PDF Store no Telegram
    window.open('https://t.me/pdfstore_cyberclass_bot', '_blank');
  }, []);

  const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
      case 'ia':
        return <Brain className="w-3 h-3" />;
      case 'cibersegurança':
      case 'segurança':
        return <Shield className="w-3 h-3" />;
      default:
        return <FileText className="w-3 h-3" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category.toLowerCase()) {
      case 'ia':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'cibersegurança':
      case 'segurança':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'educação':
        return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'negócios':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      default:
        return 'bg-amber-neon/10 text-amber-neon border-amber-neon/20';
    }
  };

  return (
    <section id="pdfs" className="py-20 bg-background">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <m.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={standardViewport}
          className="text-center mb-16 gpu-accelerated"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            PDF <span className="text-amber-neon">STORE</span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Materiais didáticos validados por humanos e IA, desenvolvidos para aprendizado prático e acessível para todos
          </p>
        </m.div>

        <m.div 
          variants={containerStagger}
          initial="hidden"
          whileInView="show"
          viewport={standardViewport}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
        >
          {pdfs.map((pdf) => (
            <m.div
              key={pdf.title}
              variants={item}
              className="bg-card p-6 rounded-lg border border-border hover:border-amber-neon/50 transition-all duration-300 group h-full flex flex-col gpu-accelerated"
            >
              {/* Header with badges */}
              <div className="flex flex-wrap gap-2 mb-4">
                {pdf.categories.map((category, i) => (
                  <Badge
                    key={i}
                    variant="outline"
                    className={`${getCategoryColor(category)} border`}
                  >
                    {getCategoryIcon(category)}
                    <span className="ml-1 text-xs">{category}</span>
                  </Badge>
                ))}
                 {pdf.validated && (
                  <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/20">
                    <CheckCircle className="w-3 h-3" />
                    <span className="ml-1 text-xs">Revisão humana com apoio de IA</span>
                  </Badge>
                )}
                {pdf.accessible && (
                  <Badge variant="outline" className="bg-amber-neon/10 text-amber-neon border-amber-neon/20">
                    <span className="text-xs">PDF/A Acessível</span>
                  </Badge>
                )}
              </div>

              {/* Content */}
              <div className="flex-1 space-y-4">
                <h3 className="text-xl font-semibold group-hover:text-amber-neon transition-colors duration-300">
                  {pdf.title}
                </h3>
                
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {pdf.description}
                </p>

                <div>
                  <h4 className="font-medium mb-2 text-sm">Tópicos inclusos:</h4>
                  <div className="flex flex-wrap gap-1">
                    {pdf.topics.map((topic, i) => (
                      <span
                        key={i}
                        className="text-xs bg-muted px-2 py-1 rounded text-muted-foreground"
                      >
                        {topic}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <StarRating rating={4.5} />
                  <div className="flex items-center gap-1">
                    <Download className="w-4 h-4" />
                    <span>{pdf.downloads}</span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="pt-4 border-t border-border mt-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-2xl font-bold text-amber-neon">{pdf.price}</span>
                </div>
                
                <Button
                  variant="cyber"
                  className="w-full"
                  onClick={() => handlePurchase(pdf.title, pdf.price)}
                >
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Comprar via Telegram
                </Button>
              </div>
            </m.div>
          ))}
        </m.div>

        <m.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={standardViewport}
          className="text-center mt-12 p-6 bg-card rounded-lg border border-border gpu-accelerated"
        >
          <h3 className="text-lg font-semibold mb-2">Todos os PDFs incluem:</h3>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span>Produzidos por especialistas com apoio de IA</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span>Formato acessível PDF/A</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span>Linguagem descomplicada</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span>Exemplos práticos</span>
            </div>
          </div>
        </m.div>
      </div>
    </section>
  );
});

PDFStoreSection.displayName = "PDFStoreSection";

export default PDFStoreSection;