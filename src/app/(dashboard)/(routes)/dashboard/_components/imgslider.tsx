"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useTheme } from "@/context/ThemeContext";

const lightImages = ["/10promolight.png", "/shardlight1.png"];
const darkImages = ["/10promodark.png", "/sharddark.png"];

export default function ImageSlider() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  // State to track current index and direction
  const [[currentIndex, direction], setCurrentIndex] = useState([0, 0]);

  // Get images based on theme
  const images = theme === "light" ? lightImages : darkImages;

  // Handle hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // Animation variants for enter, center, and exit states
  const variants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 300 : -300,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
      transition: { duration: 0.5 },
    },
    exit: (dir: number) => ({
      x: dir < 0 ? 300 : -300,
      opacity: 0,
      transition: { duration: 0.5 },
    }),
  };

  // Function to handle pagination
  const paginate = (newDirection: number) => {
    setCurrentIndex(([prevIndex]) => {
      const newIndex = prevIndex + newDirection;
      if (newIndex < 0) return [images.length - 1, newDirection];
      if (newIndex >= images.length) return [0, newDirection];
      return [newIndex, newDirection];
    });
  };

  // Automatically change image every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      paginate(1);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Reset to first image when theme changes
  useEffect(() => {
    setCurrentIndex([0, 0]);
  }, [theme]);

  if (!mounted) {
    return (
      <div className="relative w-full h-28 overflow-hidden max-w-md px-4 rounded-xl md:hidden bg-gray-200 dark:bg-neutral-800 animate-pulse" />
    );
  }

  return (
    <div className="relative w-full h-28 overflow-hidden max-w-md px-4 rounded-sm md:hidden">
      <AnimatePresence initial={false} custom={direction} mode="wait">
        <motion.img
          key={`${theme}-${currentIndex}`}
          src={images[currentIndex]}
          alt={`Slide ${currentIndex + 1} - ${theme} theme`}
          className="absolute top-0 left-0 w-full h-full object-cover"
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
        />
      </AnimatePresence>
    </div>
  );
}
