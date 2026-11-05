import { motion, useReducedMotion, useScroll, useSpring } from 'framer-motion';
export function ScrollProgress() {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });
  const reduced = useReducedMotion();
  return reduced ? null : <motion.div aria-hidden="true" className="page-scroll-progress" style={{ scaleX }} />;
}
