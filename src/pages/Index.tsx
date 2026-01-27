import { memo, lazy, Suspense, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import { StarsBackground } from "@/components/ui/stars-background";

// Lazy load components that are below the fold
const AboutSection = lazy(() => import("@/components/AboutSection"));
const ServicesSection = lazy(() => import("@/components/ServicesSection"));
const PortfolioShowcase = lazy(() => import("@/components/PortfolioShowcase"));
const AISection = lazy(() => import("@/components/AISection"));
const EventsSection = lazy(() => import("@/components/EventsSection"));
const ContactSection = lazy(() => import("@/components/ContactSection"));


const LoadingSpinner = () => (
  <div className="animate-pulse bg-muted/30 h-32 rounded-lg flex items-center justify-center">
    <div className="w-6 h-6 border-2 border-amber-neon border-t-transparent rounded-full animate-spin"></div>
  </div>
);

const Index = memo(() => {
  const location = useLocation();

  // Handle hash navigation when coming from another page
  useEffect(() => {
    if (location.hash) {
      // Pequeno delay para garantir que os componentes lazy-loaded estejam montados
      const timer = setTimeout(() => {
        const element = document.getElementById(location.hash.replace('#', ''));
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [location.hash]);

  return (
    <div className="min-h-screen bg-background overflow-x-hidden relative">
      {/* Stars Background - Fixed to cover entire viewport */}
      <StarsBackground
        starDensity={0.00025}
        allStarsTwinkle={true}
        minTwinkleSpeed={0.5}
        maxTwinkleSpeed={1.5}
        className="fixed top-0 left-0 w-full h-full z-0 pointer-events-none"
      />
      
      <div className="relative z-10">
        <Navbar />
        <Hero />
        <Suspense fallback={<LoadingSpinner />}>
          <AboutSection />
        </Suspense>
        <Suspense fallback={<LoadingSpinner />}>
          <ServicesSection />
        </Suspense>
        <Suspense fallback={<LoadingSpinner />}>
          <AISection />
        </Suspense>
        <Suspense fallback={<LoadingSpinner />}>
          <PortfolioShowcase />
        </Suspense>
        <Suspense fallback={<LoadingSpinner />}>
          <EventsSection />
        </Suspense>
        <Suspense fallback={<LoadingSpinner />}>
          <ContactSection />
        </Suspense>
      </div>
    </div>
  );
});

Index.displayName = "Index";

export default Index;
