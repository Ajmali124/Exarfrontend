'use client';

import SphereImageGrid, { ImageData } from "@/components/ui/image-sphere";
import { trpc } from "@/trpc/client";
import { useEffect, useMemo, useState } from "react";

// Component configuration - easily adjustable
interface SphereConfig {
  containerSize: number;
  sphereRadius: number;
  dragSensitivity: number;
  momentumDecay: number;
  maxRotationSpeed: number;
  baseImageScale: number;
  hoverScale: number;
  perspective: number;
  autoRotate: boolean;
  autoRotateSpeed: number;
}

const CONFIG: SphereConfig = {
  containerSize: 600,          // Container size in pixels
  sphereRadius: 200,           // Virtual sphere radius (increased for better spacing)
  dragSensitivity: 0.8,        // Mouse drag sensitivity (0.1 - 2.0)
  momentumDecay: 0.96,         // How fast momentum fades (0.8 - 0.99)
  maxRotationSpeed: 6,         // Maximum rotation speed (1 - 10)
  baseImageScale: 0.15,        // Base image size (reduced to minimize overlap)
  hoverScale: 1.3,             // Hover scale multiplier (1.0 - 2.0)
  perspective: 1000,           // CSS perspective value (500 - 2000)
  autoRotate: true,            // Enable/disable auto rotation
  autoRotateSpeed: 0.2         // Auto rotation speed (0.1 - 2.0, higher = faster)
};

const getResponsiveSettings = (width: number) => {
  if (width <= 480) {
    const containerSize = Math.max(260, Math.min(width - 48, 360));
    return {
      containerSize,
      sphereRadius: Math.max(120, containerSize * 0.45),
      baseImageScale: 0.22
    };
  }

  if (width <= 768) {
    const containerSize = Math.max(360, Math.min(width - 64, 480));
    return {
      containerSize,
      sphereRadius: Math.max(160, containerSize * 0.42),
      baseImageScale: 0.18
    };
  }

  const containerSize = Math.min(600, Math.max(420, width * 0.45));
  return {
    containerSize,
    sphereRadius: Math.max(200, containerSize * 0.38),
    baseImageScale: 0.15
  };
};

const TeamImageSphere = () => {
  const [viewportWidth, setViewportWidth] = useState<number>(375);

  const { data: sphereData } = trpc.user.getTeamSphereImages.useQuery({
    max: 60,
    maxLevels: 10,
  });

  useEffect(() => {
    const measure = () => window.innerWidth;

    const handleResize = () => {
      setViewportWidth((prev) => {
        const nextWidth = measure();
        return Math.abs(prev - nextWidth) > 10 ? nextWidth : prev;
      });
    };

    handleResize();
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const sphereConfig = useMemo(() => {
    const responsive = getResponsiveSettings(viewportWidth);
    return {
      ...CONFIG,
      ...responsive
    };
  }, [viewportWidth]);

  const images = useMemo<ImageData[]>(() => {
    const base = sphereData?.images ?? [];
    if (base.length === 0) return [];

    // Fill the sphere by repeating real user images
    const filled: ImageData[] = [];
    for (let i = 0; i < 60; i++) {
      const img = base[i % base.length];
      filled.push({
        id: `${img.id}-${i}`,
        src: img.src,
        alt: img.alt ?? `Team member ${i + 1}`,
      });
    }
    return filled;
  }, [sphereData]);

  return (
    <section className="w-full px-4 sm:px-6 md:px-0">
      <div className="mx-auto flex max-w-3xl flex-col items-center justify-center py-6 md:py-10">
        <SphereImageGrid
          images={images}
          {...sphereConfig}
          className="mx-auto"
        />
      </div>
    </section>
  );
};

export default TeamImageSphere;
