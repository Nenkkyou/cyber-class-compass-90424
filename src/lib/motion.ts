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
 * Viewport for hero/above-fold content
 * Triggers immediately when any part enters viewport
 */
export const heroViewport = {
  once: true,
  amount: 0.05 as const,
  margin: "0px 0px 0px 0px"
};

/**
 * Viewport for section headings and single elements
 * Mobile-optimized: triggers when 10% visible, compensates navbar
 */
export const headingViewport = {
  once: true,
  amount: 0.1 as const,
  margin: "-80px 0px -100px 0px"
};

/**
 * Viewport for card grids and stagger containers
 * Mobile-optimized: lower threshold, triggers earlier for smoother stagger
 */
export const cardGridViewport = {
  once: true,
  amount: 0.08 as const,
  margin: "-80px 0px -150px 0px"
};

/**
 * Viewport for large content sections
 * More forgiving threshold for tall sections on mobile
 */
export const sectionViewport = {
  once: true,
  amount: 0.12 as const,
  margin: "-80px 0px -120px 0px"
};
