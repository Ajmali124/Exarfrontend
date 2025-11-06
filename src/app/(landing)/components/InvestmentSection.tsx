"use client";

import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef, useState } from "react";
import TradingInterface from "./TradingInterface";

// Register GSAP plugins
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const InvestmentSection = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const pinnedRef = useRef<HTMLDivElement>(null);
  const textContainerRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const [currentSection, setCurrentSection] = useState(0);
  const [mounted, setMounted] = useState(false);

  // Generate static particles for consistent rendering
  const particles = Array.from({ length: 8 }, (_, i) => ({
    id: i,
    left: (i * 12.5 + Math.sin(i) * 10) % 100,
    top: (i * 15 + Math.cos(i) * 20) % 100,
    delay: i * 0.5,
    duration: 4 + (i % 3),
  }));

  // Handle mounting to avoid hydration issues
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (
      !mounted ||
      !containerRef.current ||
      !pinnedRef.current ||
      !textContainerRef.current ||
      !progressBarRef.current
    )
      return;

    const container = containerRef.current;
    const textContainer = textContainerRef.current;
    const progressBar = progressBarRef.current;

    // Set initial states
    gsap.set(textContainer, { x: "0%" });
    gsap.set(progressBar, { scaleX: 0 });

    // Handle scroll progress
    const handleProgress = (self: any) => {
      const progress = self.progress; // 0 → 1

      // Calculate section based on progress
      let newIndex = 0;
      let textTranslateX = 0;

      if (progress <= 0.333) {
        newIndex = 0; // Invest section
        textTranslateX = 0; // Show "Invest" text (0%)
      } else if (progress <= 0.666) {
        newIndex = 1; // Maximum section
        textTranslateX = -100; // Show "Maximum" text (-100%)
      } else {
        newIndex = 2; // Earn section
        textTranslateX = -200; // Show "Earn" text (-200%)
      }

      // Update text position to match section
      gsap.set(textContainer, { x: `${textTranslateX}%` });

      // Progress bar scale
      gsap.set(progressBar, { scaleX: progress });

      // Update section if changed
      if (newIndex !== currentSection) {
        setCurrentSection(newIndex);
      }
    };

    // Create main scroll trigger
    const mainTrigger = ScrollTrigger.create({
      trigger: container,
      start: "top top",
      end: "bottom bottom",
      pin: ".investment-pinned-content",
      scrub: 1,
      onUpdate: handleProgress,
    });

    return () => {
      mainTrigger.kill();
    };
  }, [mounted, currentSection]);

  if (!mounted) {
    return (
      <div style={{ height: "300vh" }} className="bg-slate-900">
        <div className="h-screen flex items-center justify-center">
          <div className="text-slate-500 text-6xl font-bold">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} style={{ height: "300vh" }}>
      <div
        ref={pinnedRef}
        className="investment-pinned-content h-screen w-full overflow-hidden relative bg-slate-900"
      >
        {/* Background Particles */}
        <div className="absolute inset-0 pointer-events-none">
          {particles.map((particle) => (
            <div
              key={particle.id}
              className="particle absolute w-2 h-2 rounded-full bg-blue-400/30"
              style={
                {
                  left: `${particle.left}%`,
                  top: `${particle.top}%`,
                  "--delay": `${particle.delay}s`,
                  "--duration": `${particle.duration}s`,
                } as React.CSSProperties
              }
            />
          ))}
        </div>

        {/* Giant Background Text Carousel */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div
            ref={textContainerRef}
            className="flex w-[300%] h-full"
            style={{ transform: "translateX(0%)" }}
          >
            <div className="w-1/3 flex  justify-center">
              <h1 className="hero-word">Invest</h1>
            </div>
            <div className="w-1/3 flex  justify-center">
              <h1 className="hero-word">Maximum</h1>
            </div>
            <div className="w-1/3 flex  justify-center">
              <h1 className="hero-word">Earn</h1>
            </div>
          </div>
        </div>

        {/* Section Content */}
        <div className="relative z-20 h-full flex items-center justify-center">
          <div className="w-full h-full flex items-center justify-center">
            <TradingInterface currentSection={currentSection} />
          </div>
        </div>

        {/* Progress Bar */}
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-slate-800">
          <div
            ref={progressBarRef}
            className="h-full bg-gradient-to-r from-[#F0B90B] via-[#00A3FF] to-[#00CED1] origin-left"
            style={{ transform: "scaleX(0)" }}
          />
        </div>
      </div>

      <style jsx>{`
        .hero-word {
          font-size: clamp(3rem, 8vw, 12rem);
          font-weight: 900;
          background: linear-gradient(
            180deg,
            rgba(255, 255, 255, 0.08),
            rgba(255, 255, 255, 0.02)
          );
          -webkit-background-clip: text;
          background-clip: text;
          color: transparent;
          filter: blur(0.5px);
          text-shadow: 0 0 20px rgba(148, 163, 184, 0.3);
          line-height: 0.9;
          user-select: none;
          pointer-events: none;
          letter-spacing: -0.02em;
        }

        .particle {
          animation: floatUp var(--duration) linear infinite;
          animation-delay: var(--delay);
        }

        @keyframes floatUp {
          0% {
            transform: translateY(0);
            opacity: 0;
          }
          20% {
            opacity: 1;
          }
          100% {
            transform: translateY(-120vh);
            opacity: 0;
          }
        }

        /* Responsive adjustments */
        @media (max-width: 768px) {
          .hero-word {
            font-size: clamp(2rem, 8vw, 6rem);
          }
        }

        @media (max-width: 480px) {
          .hero-word {
            font-size: clamp(1.5rem, 6vw, 4rem);
          }
        }
      `}</style>
    </div>
  );
};

export default InvestmentSection;
