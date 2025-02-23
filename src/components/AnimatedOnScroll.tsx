"use client";

import React, { useEffect, useState } from "react";
import { useInView } from "react-intersection-observer";

interface AnimatedOnScrollProps {
  children: React.ReactNode;
  animationClass?: string;
  delay?: string; // e.g., "2s"
}

const AnimatedOnScroll: React.FC<AnimatedOnScrollProps> = ({
  children,
  animationClass = "animate-fadeInUp",
  delay = "2s",
}) => {
  // Remove triggerOnce so that we can re-trigger on scroll up.
  const { ref, inView } = useInView({
    threshold: 0.2,
    triggerOnce: false,
  });

  const [shouldAnimate, setShouldAnimate] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (inView) {
      // Start timer when element comes into view.
      timer = setTimeout(() => {
        setShouldAnimate(true);
      }, parseFloat(delay) * 1000);
    } else {
      // Reset the animation state when element goes out of view.
      setShouldAnimate(false);
    }
    return () => clearTimeout(timer);
  }, [inView, delay]);

  const classNames = shouldAnimate
    ? `${animationClass} opacity-100 visible transition-opacity duration-500`
    : `opacity-0 invisible transition-opacity duration-500`;

  return (
    <div ref={ref} className={classNames}>
      {children}
    </div>
  );
};

export default AnimatedOnScroll;
