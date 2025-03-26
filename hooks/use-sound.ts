import { useSoundContext } from '@/context/sound-context'
import { SoundName } from '@/utils/sounds'

export function useSound() {
  const soundContext = useSoundContext()

  const playSound = (soundName: SoundName) => {
    soundContext.playSound(soundName)
  }

  const stopSound = (soundName: SoundName) => {
    soundContext.stopSound(soundName)
  }

  const toggleMute = () => {
    soundContext.toggleMute()
  }

  return {
    playSound,
    stopSound,
    toggleMute,
    isMuted: soundContext.isMuted,
  }
} 