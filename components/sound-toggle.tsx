"use client"
import { motion } from "framer-motion"
import { Volume2, VolumeX } from "lucide-react"
import { useSoundContext } from "@/context/sound-context"

export default function SoundToggle() {
  const { isMuted, toggleMute } = useSoundContext()

  return (
    <motion.button
      className="fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full flex items-center justify-center bg-black/50 backdrop-blur-md border border-white/20 text-white"
      onClick={toggleMute}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1, duration: 0.5 }}
      aria-label={isMuted ? "Unmute sounds" : "Mute sounds"}
    >
      {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
    </motion.button>
  )
}

