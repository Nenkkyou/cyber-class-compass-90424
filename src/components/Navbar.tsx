import { useState, memo, useCallback } from "react";
import { m, AnimatePresence } from "framer-motion";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";

const Navbar = memo(() => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const isHomePage = location.pathname === '/';

  const menuItems = [
    { label: "Sobre", href: "#sobre", isSection: true },
    { label: "Serviços", href: "#servicos", isSection: true },
    { label: "Portfólio", href: "#portfolio", isSection: true },
    { label: "PDFs", href: "#pdfs", isSection: true },
    { label: "Eventos", href: "/events", isSection: false },
    { label: "Contato", href: "#contato", isSection: true },
  ];

  const handleNavClick = useCallback((item: typeof menuItems[0]) => {
    setIsOpen(false);
    
    if (!item.isSection) {
      // Navegar para outra página
      navigate(item.href);
      return;
    }
    
    if (!isHomePage) {
      // Se não está na home, navegar para home com hash
      navigate('/' + item.href);
      return;
    }
    
    // Se está na home, scroll suave
    const element = document.getElementById(item.href.replace('#', ''));
    element?.scrollIntoView({ behavior: 'smooth' });
  }, [isHomePage, navigate]);

  return (
    <m.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6 }}
      className="fixed top-0 left-0 right-0 z-50 bg-background/95 md:backdrop-blur-sm border-b border-border gpu-accelerated"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <m.div
            whileHover={{ scale: 1.05 }}
            className="flex items-center space-x-2"
          >
            <img 
              src="/cyberclass-logo.png" 
              alt="CyberClass Logo" 
              className="w-8 h-8"
            />
            <span className="text-xl font-bold">
              <span className="text-amber-neon">Cyber</span>
              <span className="text-foreground">Class</span>
            </span>
          </m.div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            {menuItems.map((item) => (
              <button
                key={item.label}
                onClick={() => handleNavClick(item)}
                className={`transition-colors duration-300 ${
                  !item.isSection && location.pathname === item.href
                    ? 'text-amber-neon font-semibold'
                    : 'text-foreground hover:text-amber-neon'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsOpen(!isOpen)}
              className="text-foreground"
            >
              {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isOpen && (
            <m.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="md:hidden bg-card border-t border-border"
            >
              <div className="py-4 space-y-2">
                {menuItems.map((item) => (
                  <button
                    key={item.label}
                    onClick={() => handleNavClick(item)}
                    className={`block w-full text-left px-4 py-3 transition-colors duration-300 ${
                      !item.isSection && location.pathname === item.href
                        ? 'text-amber-neon font-semibold bg-amber-neon/10'
                        : 'text-foreground hover:text-amber-neon hover:bg-muted'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </m.div>
          )}
        </AnimatePresence>
      </div>
    </m.nav>
  );
});

Navbar.displayName = "Navbar";

export default Navbar;