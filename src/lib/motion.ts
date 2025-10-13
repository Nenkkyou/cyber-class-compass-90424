// Standardized motion variants for mobile performance
import { Variants } from "framer-motion";

/**
 * Fade up animation for single elements
 * Optimized for mobile with reduced movement and fast timing
 */
export const fadeUp: Variants = {
  hidden: { 
    opacity: 0, 
    y: 16 
  },
  show: { 
    opacity: 1, 
    y: 0,
    transition: {
      duration: 0.28,
      ease: "easeOut"
    }
  }
};

/**
 * Container variant with stagger for child elements
 * Reduces IntersectionObserver overhead by coordinating from parent
 */
export const containerStagger: Variants = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.04
    }
  }
};

/**
 * Item variant for children in stagger containers
 * Uses same fadeUp motion but controlled by parent timing
 */
export const item: Variants = {
  hidden: { 
    opacity: 0, 
    y: 16 
  },
  show: { 
    opacity: 1, 
    y: 0 
  }
};

/**
 * Standardized viewport configuration
 * Compensates for fixed navbar (-64px) and triggers before bottom fold (-20%)
 */
export const standardViewport = {
  once: true,
  amount: 0.2 as const,
  margin: "-64px 0px -20% 0px"
};

/**
 * Lighter viewport for hero/above-fold content
 */
export const heroViewport = {
  once: true,
  amount: 0.1 as const,
  margin: "0px"
};
