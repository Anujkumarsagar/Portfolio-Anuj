"use client"

import { createContext, useContext, useEffect, useState } from 'react'
import { Howl } from "howler"
import { sounds, SoundName } from '@/utils/sounds'

interface SoundContextType {
  playSound: (soundName: SoundName) => void
  stopSound: (soundName: SoundName) => void
  isMuted: boolean
  toggleMute: () => void
}

const SoundContext = createContext<SoundContextType | null>(null)

export function SoundProvider({ children }: { children: React.ReactNode }) {
  const [soundInstances, setSoundInstances] = useState<Record<SoundName, Howl>>({} as Record<SoundName, Howl>)
  const [isMuted, setIsMuted] = useState(false)

  useEffect(() => {
    // Initialize all sound instances
    const instances: Record<SoundName, Howl> = {} as Record<SoundName, Howl>
    
    Object.entries(sounds).forEach(([name, src]) => {
      instances[name as SoundName] = new Howl({
        src: [src],
        volume: 0.5,
        preload: true,
      })
    })

    setSoundInstances(instances)

    // Cleanup function
    return () => {
      Object.values(instances).forEach(sound => {
        sound.unload()
      })
    }
  }, [])

  const playSound = (soundName: SoundName) => {
    if (!isMuted && soundInstances[soundName]) {
      soundInstances[soundName].play()
    }
  }

  const stopSound = (soundName: SoundName) => {
    if (soundInstances[soundName]) {
      soundInstances[soundName].stop()
    }
  }

  const toggleMute = () => {
    setIsMuted(prev => !prev)
  }

  return (
    <SoundContext.Provider value={{ playSound, stopSound, isMuted, toggleMute }}>
      {children}
    </SoundContext.Provider>
  )
}

export function useSoundContext() {
  const context = useContext(SoundContext)
  if (!context) {
    throw new Error('useSoundContext must be used within a SoundProvider')
  }
  return context
}
