"use client"

import { SpaceBackground } from '@/components/ui/space-background'
import { dashboardTheme } from '@/lib/theme-utils'

const Loading = () => {
  return (
    <div className={`min-h-screen ${dashboardTheme.backgroundGradient.default}`}>
      <SpaceBackground 
        particleCount={450}
        className={dashboardTheme.backgroundGradient.default}
      />
    </div>
  )
}

export default Loading