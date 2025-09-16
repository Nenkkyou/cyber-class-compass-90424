import { memo, lazy, Suspense } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";

// Lazy load components that are below the fold
const AboutSection = lazy(() => import("@/components/AboutSection"));
const ServicesSection = lazy(() => import("@/components/ServicesSection"));
const PortfolioShowcase = lazy(() => import("@/components/PortfolioShowcase"));
const PDFStoreSection = lazy(() => import("@/components/PDFStoreSection"));
const ContactSection = lazy(() => import("@/components/ContactSection"));
const MiniChat = lazy(() => import("@/components/MiniChat"));

const LoadingSpinner = () => (
  <div className="animate-pulse bg-muted/30 h-32 rounded-lg flex items-center justify-center">
    <div className="w-6 h-6 border-2 border-amber-neon border-t-transparent rounded-full animate-spin"></div>
  </div>
);

const Index = memo(() => {
  return (
    <div className="min-h-screen bg-background overflow-x-hidden">
      <Navbar />
      <Hero />
      <Suspense fallback={<LoadingSpinner />}>
        <AboutSection />
      </Suspense>
      <Suspense fallback={<LoadingSpinner />}>
        <ServicesSection />
      </Suspense>
      <Suspense fallback={<LoadingSpinner />}>
        <PortfolioShowcase />
      </Suspense>
      <Suspense fallback={<LoadingSpinner />}>
        <PDFStoreSection />
      </Suspense>
      <Suspense fallback={<LoadingSpinner />}>
        <ContactSection />
      </Suspense>
      <Suspense fallback={<div />}>
        <MiniChat />
      </Suspense>
    </div>
  );
});

Index.displayName = "Index";

export default Index;
