"use client"

import { motion, useMotionValue, useTransform, animate } from "framer-motion"
import { useEffect, useState } from "react"
import { cn } from "@/lib/utils"

interface AnimatedRadialChartProps {
  value?: number
  size?: number
  strokeWidth?: number
  className?: string
  showLabels?: boolean
  duration?: number
  displayValue?: string
}

export function AnimatedRadialChart({ 
  value = 74, 
  size = 300,
  strokeWidth: customStrokeWidth,
  className,
  showLabels = true,
  duration = 2,
  displayValue,
}: AnimatedRadialChartProps) {
  // Dynamic stroke width based on size if not provided
  const strokeWidth = customStrokeWidth ?? Math.max(12, size * 0.06)
  const radius = size * 0.35
  const center = size / 2
  const circumference = Math.PI * radius

  // Calculate inner line radius (4px inside the main arc)
  const innerLineRadius = radius - strokeWidth - 4

  // Motion values for animation
  const animatedValue = useMotionValue(0)
  const offset = useTransform(animatedValue, [0, 100], [circumference, 0])
  const animatedDisplay = useTransform(animatedValue, (latest) => Math.round(latest))

  // Calculate animated positions
  const progressAngle = useTransform(animatedValue, [0, 100], [-Math.PI, 0])
  const innerRadius = radius - strokeWidth / 2

  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window === "undefined") return false
    return document.documentElement.classList.contains("dark")
  })

  useEffect(() => {
    if (typeof window === "undefined") return

    const updateTheme = () => {
      setIsDarkMode(document.documentElement.classList.contains("dark"))
    }

    updateTheme()

    const observer = new MutationObserver(updateTheme)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] })

    return () => {
      observer.disconnect()
    }
  }, [])

  // Animate to the target value on mount or when value changes
  useEffect(() => {
    const controls = animate(animatedValue, value, {
      duration,
      ease: "easeOut",
    })

    return controls.stop
  }, [value, animatedValue, duration])

  // Calculate responsive font size
  const fontSize = Math.max(16, size * 0.1)
  const labelFontSize = Math.max(12, size * 0.04)

  return (
    <div className={cn("relative", className)} style={{ width: size, height: size * 0.7 }}>
      <svg width={size} height={size * 0.7} viewBox={`0 0 ${size} ${size * 0.7}`} className="overflow-visible">
        <defs>
          {/* Base track gradient - white to silver/gray */}
          <linearGradient id={`baseGradient-${size}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
            <stop offset="50%" stopColor="#d1d5db" stopOpacity="0.7" />
            <stop offset="100%" stopColor="#6b7280" stopOpacity="0.6" />
          </linearGradient>

          {/* Progress gradient - emerald/teal */}
          <linearGradient id={`progressGradient-${size}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#34d399" />
            <stop offset="50%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#14b8a6" />
          </linearGradient>

          <linearGradient id={`progressGradientDark-${size}`} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#a855f7" />
            <stop offset="50%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#6366f1" />
          </linearGradient>

          {/* Drop shadow filter */}
          <filter id={`dropshadow-${size}`} x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#000000" floodOpacity="0.3" />
          </filter>
        </defs>

        {/* Inner thin line (1px light gray) */}
        <path
          d={`M ${center - innerLineRadius} ${center} A ${innerLineRadius} ${innerLineRadius} 0 0 1 ${center + innerLineRadius} ${center}`}
          fill="none"
          stroke="#6b7280"
          strokeWidth="1"
          strokeLinecap="butt"
          opacity="0.6"
        />

        {/* Base track */}
        <path
          d={`M ${center - radius} ${center} A ${radius} ${radius} 0 0 1 ${center + radius} ${center}`}
          fill="none"
          stroke={`url(#baseGradient-${size})`}
          strokeWidth={strokeWidth}
          strokeLinecap="butt"
          filter={`url(#dropshadow-${size})`}
        />

        {/* Animated Progress track */}
        <motion.path
          d={`M ${center - radius} ${center} A ${radius} ${radius} 0 0 1 ${center + radius} ${center}`}
          fill="none"
          stroke={`url(#${isDarkMode ? `progressGradientDark-${size}` : `progressGradient-${size}`})`}
          strokeWidth={strokeWidth}
          strokeLinecap="butt"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          filter={`url(#dropshadow-${size})`}
        />

        {/* Animated extending line */}
        <motion.line
          x1={useTransform(progressAngle, (angle) => center + Math.cos(angle) * innerRadius)}
          y1={useTransform(progressAngle, (angle) => center + Math.sin(angle) * innerRadius)}
          x2={useTransform(progressAngle, (angle) => center + Math.cos(angle) * innerRadius - Math.cos(angle) * 30)}
          y2={useTransform(progressAngle, (angle) => center + Math.sin(angle) * innerRadius - Math.sin(angle) * 30)}
          stroke="#cbd5f5"
          strokeWidth="1"
          strokeLinecap="butt"
          opacity={0.6}
        />
      </svg>

      {/* Animated center percentage display with gradient text */}
      <div className="absolute inset-0 flex items-center justify-center">
        <motion.div
          className="mt-10 font-bold tracking-tight"
          style={{ fontSize: `${fontSize}px` }}
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: duration * 0.75 }}
        >
          <span className="text-gray-900 dark:text-gray-100">
            {displayValue ?? (
              <>
                <motion.span>{animatedDisplay}</motion.span>%
              </>
            )}
          </span>
        </motion.div>
      </div>

      {/* 0% and 100% labels */}
      {showLabels && (
        <>
          <motion.div
            className="absolute text-gray-400 font-medium"
            style={{
              fontSize: `${labelFontSize}px`,
              left: center - radius - 5,
              top: center + strokeWidth / 2,
            }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: duration * 0.25 }}
          >
            0%
          </motion.div>
          <motion.div
            className="absolute text-gray-400 font-medium"
            style={{
              fontSize: `${labelFontSize}px`,
              left: center + radius - 20,
              top: center + strokeWidth / 2,
            }}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: duration * 0.25 }}
          >
            100%
          </motion.div>
        </>
      )}
    </div>
  )
}
