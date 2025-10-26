import { useEffect, useMemo, useState } from "react";
import { animate, motion, useReducedMotion } from "framer-motion";

const clamp = (value: number, min: number, max: number) =>
  Math.min(Math.max(value, min), max);

export type AnimatedCounterProps = {
  /** Valeur finale à atteindre */
  value: number;
  /** Durée de l'animation en secondes. Si omis, elle est calculée en fonction de la valeur. */
  duration?: number;
  /** Décalage du démarrage en secondes. */
  delay?: number;
  /** Nombre de décimales à afficher. */
  decimals?: number;
  /** Classe Tailwind personnalisée pour le wrapper. */
  className?: string;
  /** Texte optionnel à afficher avant la valeur. */
  prefix?: string;
  /** Texte optionnel à afficher après la valeur. */
  suffix?: string;
};

const AnimatedCounter = ({
  value,
  duration,
  delay = 0,
  decimals = 0,
  className = "",
  prefix = "",
  suffix = "",
}: AnimatedCounterProps) => {
  const shouldReduceMotion = useReducedMotion();
  const [displayValue, setDisplayValue] = useState(() =>
    shouldReduceMotion ? value : 0,
  );

  const resolvedDuration = useMemo(() => {
    if (typeof duration === "number") {
      return duration;
    }

    if (!Number.isFinite(value) || value <= 0) {
      return 1;
    }

    const dynamicDuration = value / 80;
    return clamp(dynamicDuration, 0.8, 2.6);
  }, [duration, value]);

  useEffect(() => {
    if (shouldReduceMotion) {
      setDisplayValue(value);
      return;
    }

    setDisplayValue(0);

    const controls = animate(0, value, {
      duration: resolvedDuration,
      delay,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (latest) => {
        const rounded =
          decimals > 0
            ? Number.parseFloat(latest.toFixed(decimals))
            : Math.round(latest);
        setDisplayValue(rounded);
      },
    });

    return () => controls.stop();
  }, [value, resolvedDuration, delay, decimals, shouldReduceMotion]);

  const formattedValue = useMemo(() => {
    const formatter = new Intl.NumberFormat("fr-FR", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });

    return formatter.format(displayValue);
  }, [displayValue, decimals]);

  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.45, ease: "easeOut", delay }}
      className={`inline-flex items-baseline font-semibold tracking-tight text-slate-900 ${className}`}
    >
      {prefix}
      <span>{formattedValue}</span>
      {suffix}
    </motion.span>
  );
};

export default AnimatedCounter;
