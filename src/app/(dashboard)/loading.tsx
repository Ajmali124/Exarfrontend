import React from 'react'
import { Spinner } from '@/components/ui/spinner'
import { cn } from '@/lib/utils'

const Loading = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="flex flex-col items-center space-y-6 max-w-md w-full">
        {/* Main Loading Container */}
        <div className="relative floating">
          {/* Outer Ring */}
          <div className="w-20 h-20 sm:w-24 sm:h-24 md:w-32 md:h-32 rounded-full border-4 border-muted/20 relative overflow-hidden solana-glow">
            {/* Animated Gradient Ring */}
            <div className="absolute inset-0 rounded-full border-4 border-transparent gradient-shift"
                 style={{
                   background: 'conic-gradient(from 0deg, #8b5cf6, #3b82f6, #10b981, #8b5cf6)',
                   animation: 'spin 2s linear infinite'
                 }}>
            </div>
            
            {/* Inner Glow Effect */}
            <div className="absolute inset-2 rounded-full bg-gradient-to-r from-purple-400/20 via-blue-400/20 to-green-400/20 solana-pulse">
            </div>
            
            {/* Center Spinner */}
            <div className="absolute inset-0 flex items-center justify-center">
              <Spinner className="w-6 h-6 sm:w-8 sm:h-8 text-purple-500 dark:text-purple-400 solana-pulse" />
            </div>
          </div>
          
          {/* Floating Particles */}
          <div className="absolute -top-2 -left-2 w-2 h-2 bg-purple-400 rounded-full animate-ping opacity-75"></div>
          <div className="absolute -top-1 -right-3 w-1.5 h-1.5 bg-blue-400 rounded-full animate-ping opacity-60" style={{ animationDelay: '0.5s' }}></div>
          <div className="absolute -bottom-2 -right-1 w-2 h-2 bg-green-400 rounded-full animate-ping opacity-70" style={{ animationDelay: '1s' }}></div>
          <div className="absolute -bottom-1 -left-3 w-1.5 h-1.5 bg-purple-400 rounded-full animate-ping opacity-50" style={{ animationDelay: '1.5s' }}></div>
        </div>

        {/* Loading Text */}
        <div className="text-center space-y-2">
          <h2 className="text-lg sm:text-xl md:text-2xl font-semibold bg-gradient-to-r from-purple-600 via-blue-600 to-green-600 dark:from-purple-400 dark:via-blue-400 dark:to-green-400 bg-clip-text text-transparent">
            Loading
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground">
            Preparing your dashboard...
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-full max-w-xs">
          <div className="h-1 bg-muted rounded-full overflow-hidden">
            <div className="h-full bg-gradient-to-r from-purple-500 via-blue-500 to-green-500 rounded-full gradient-shift"
                 style={{
                   width: '100%',
                   background: 'linear-gradient(90deg, #8b5cf6, #3b82f6, #10b981)'
                 }}>
            </div>
          </div>
        </div>

        {/* Solana Brand Element */}
        <div className="flex items-center space-x-2 text-xs text-muted-foreground">
          <div className="w-2 h-2 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full solana-pulse"></div>
          <span>Powered by Solana</span>
          <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-green-500 rounded-full solana-pulse" style={{ animationDelay: '1s' }}></div>
        </div>
      </div>

      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        {/* Gradient Orbs */}
        <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-purple-500/10 rounded-full blur-xl floating"></div>
        <div className="absolute bottom-1/4 right-1/4 w-40 h-40 bg-blue-500/10 rounded-full blur-xl floating" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 right-1/3 w-24 h-24 bg-green-500/10 rounded-full blur-xl floating" style={{ animationDelay: '2s' }}></div>
      </div>
    </div>
  )
}

export default Loading