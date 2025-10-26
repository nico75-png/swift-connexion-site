import type { HTMLAttributes } from "react";
import { motion, type MotionProps } from "framer-motion";

import { cn } from "@/lib/utils";

type AnimatedSectionProps = {
  /**
   * Décalage de l'animation pour orchestrer l'entrée des sections.
   */
  delay?: number;
} & MotionProps &
  HTMLAttributes<HTMLDivElement>;

const AnimatedSection = ({
  children,
  className,
  delay = 0,
  initial,
  animate,
  transition,
  ...rest
}: AnimatedSectionProps) => {
  return (
    <motion.div
      initial={initial ?? { opacity: 0, y: 30 }}
      animate={animate ?? { opacity: 1, y: 0 }}
      transition={
        transition ?? {
          duration: 0.45,
          ease: "easeOut",
          delay,
        }
      }
      className={cn("will-change-transform", className)}
      {...rest}
    >
      {children}
    </motion.div>
  );
};

export default AnimatedSection;
