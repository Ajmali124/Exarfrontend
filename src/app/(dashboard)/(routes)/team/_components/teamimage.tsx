'use client';

import SphereImageGrid, { ImageData } from "@/components/ui/image-sphere";
import { useEffect, useMemo, useState } from "react";

// ==========================================
// EASY CONFIGURATION - Edit these values to customize the component
// ==========================================

// Image sources using project assets - duplicated to fill sphere better
const BASE_IMAGE_SOURCES: string[] = [
  "https://res.cloudinary.com/dctgknnt7/image/upload/v1758731403/1_d8uozd.jpg",
  "https://res.cloudinary.com/dctgknnt7/image/upload/v1758731402/5_ionpyy.jpg",
  "https://res.cloudinary.com/dctgknnt7/image/upload/v1758731402/4_zeoqje.jpg",
  "https://res.cloudinary.com/dctgknnt7/image/upload/v1758731402/2_hme6yu.jpg",
  "https://res.cloudinary.com/dctgknnt7/image/upload/v1758731402/3_nfdtim.jpg",
  "https://res.cloudinary.com/dctgknnt7/image/upload/v1758823070/11_c9flg6.jpg",
  "https://res.cloudinary.com/dctgknnt7/image/upload/v1758823069/10_qujlpy.jpg",
  "https://res.cloudinary.com/dctgknnt7/image/upload/v1758823070/8_hkn2jm.jpg",
  "https://res.cloudinary.com/dctgknnt7/image/upload/v1758823069/6_li3ger.jpg",
  "https://res.cloudinary.com/dctgknnt7/image/upload/v1758823069/12_kitql2.jpg",
  "https://res.cloudinary.com/dctgknnt7/image/upload/v1758823069/7_ojrozd.jpg",
  "https://res.cloudinary.com/dctgknnt7/image/upload/v1758823069/9_gkuidt.jpg"
];

// Generate more images by repeating the base set
const IMAGES: ImageData[] = [];
for (let i = 0; i < 60; i++) {
  const baseIndex = i % BASE_IMAGE_SOURCES.length;
  const src = BASE_IMAGE_SOURCES[baseIndex];
  IMAGES.push({
    id: `img-${i + 1}`,
    src,
    alt: `Bulb team member ${baseIndex + 1}`
  });
}

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

  return (
    <section className="w-full px-4 sm:px-6 md:px-0">
      <div className="mx-auto flex max-w-3xl flex-col items-center justify-center py-6 md:py-10">
        <SphereImageGrid
          images={IMAGES}
          {...sphereConfig}
          className="mx-auto"
        />
      </div>
    </section>
  );
};

export default TeamImageSphere;
