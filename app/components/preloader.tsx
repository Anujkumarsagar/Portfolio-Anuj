"use client"

import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import type * as THREE from "three"
import { Canvas, useFrame } from "@react-three/fiber"
import { Environment } from "@react-three/drei"

function CubeModel({ progress }: { progress: number }) {
  const cubeRef = useRef<THREE.Group>(null)

  // Use useFrame instead of GSAP for Three.js animations
  useFrame(() => {
    if (!cubeRef.current) return

    // Apply rotation based on progress
    cubeRef.current.rotation.y = progress * Math.PI * 4
    cubeRef.current.rotation.x = progress * Math.PI * 2

    // Apply scale based on progress
    const scale = 1 + progress * 0.5
    cubeRef.current.scale.set(scale, scale, scale)
  })

  return (
    <group ref={cubeRef}>
      <mesh>
        <boxGeometry args={[1, 1, 1]} />
        <meshStandardMaterial
          color="#00FFFF"
          emissive="#00FFFF"
          emissiveIntensity={0.5}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>
    </group>
  )
}

export default function Preloader() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        const newProgress = prev + 0.02
        return newProgress >= 1 ? 1 : newProgress
      })
    }, 100)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-black">
      <Canvas className="h-[300px] w-[300px]">
        <ambientLight intensity={0.5} />
        <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} />
        <CubeModel progress={progress} />
        <Environment preset="night" />
      </Canvas>

      <div className="w-[300px] h-2 bg-gray-800 rounded-full overflow-hidden mt-8">
        <motion.div
          className="h-full bg-gradient-to-r from-cyan-400 to-fuchsia-600"
          initial={{ width: 0 }}
          animate={{ width: `${progress * 100}%` }}
        />
      </div>

      <motion.p className="mt-4 text-xl font-mono text-white" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        Loading Experience... {Math.floor(progress * 100)}%
      </motion.p>

      <motion.div
        className="absolute inset-0 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{
          opacity: [0, 0.1, 0],
          transition: { repeat: Number.POSITIVE_INFINITY, duration: 2 },
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-900/20 to-fuchsia-900/20" />
      </motion.div>
    </div>
  )
}

