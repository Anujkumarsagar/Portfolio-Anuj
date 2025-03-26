"use client"

import { useMemo, useState, useEffect, useRef, Suspense } from "react"
import * as THREE from "three"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { Environment, Stars, useScroll, PerspectiveCamera, useProgress } from "@react-three/drei"
import { useWindowSize } from "@/hooks/use-window-size"
import { useMobile } from "@/hooks/use-mobile"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { ScrollToPlugin } from "gsap/ScrollToPlugin"

// Register GSAP plugins
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin)
}

// Performance optimized particle system
function BackgroundParticles({ count = 1000 }) {
  const { viewport } = useThree()
  const scroll = useScroll()
  const particlesRef = useRef<THREE.Points>(null)
  const isMobile = useMobile()
  const frameRef = useRef<number | undefined>(undefined)

  // Generate particles with optimized memory usage
  const [positions, sizes] = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const sizes = new Float32Array(count)

    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 40
      positions[i * 3 + 1] = (Math.random() - 0.5) * 40
      positions[i * 3 + 2] = (Math.random() - 0.5) * 40
      sizes[i] = Math.random() * 0.5
    }

    return [positions, sizes]
  }, [count])

  // Optimized animation frame
  useFrame(({ clock }) => {
    if (!particlesRef.current) return

    const scrollProgress = scroll?.offset ?? 0
    const time = clock.getElapsedTime() * 0.2
    const positionArray = particlesRef.current.geometry.attributes.position.array as Float32Array

    // Batch update positions
    for (let i = 0; i < count; i++) {
      const i3 = i * 3
      positionArray[i3 + 1] += Math.sin(time + i * 0.1) * 0.01
      positionArray[i3 + 1] -= 0.03 * scrollProgress

      if (positionArray[i3 + 1] < -viewport.height) {
        positionArray[i3 + 1] = viewport.height
      }
    }

    particlesRef.current.geometry.attributes.position.needsUpdate = true
  })

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current)
      }
    }
  }, [])

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" count={count} array={positions} itemSize={3} args={[positions, 3]} />
        <bufferAttribute attach="attributes-size" count={count} array={sizes} itemSize={1} args={[sizes, 1]} />
      </bufferGeometry>
      <pointsMaterial
        size={0.1}
        sizeAttenuation={true}
        color="#00ffff"
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

// Loading component
function LoadingScreen() {
  const { progress } = useProgress()
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-black">
      <div className="text-white text-xl">{Math.round(progress)}% loaded</div>
    </div>
  )
}

function SceneContent() {
  const { width, height } = useWindowSize()
  const isMobile = useMobile()
  const scroll = useScroll()
  const camera = useRef<THREE.PerspectiveCamera>(null)
  const [cameraZ, setCameraZ] = useState(10)
  const [cameraRotation, setCameraRotation] = useState({ x: 0, y: 0 })

  // Optimized camera updates
  useFrame(() => {
    if (!camera.current) return

    const scrollProgress = scroll?.offset ?? 0
    setCameraZ(10 - scrollProgress * 3)
    setCameraRotation({
      x: Math.sin(scrollProgress * Math.PI) * 0.1,
      y: Math.cos(scrollProgress * Math.PI) * 0.1,
    })
  })

  useEffect(() => {
    if (!camera.current) return

    camera.current.position.z = cameraZ
    camera.current.rotation.x = cameraRotation.x
    camera.current.rotation.y = cameraRotation.y
  }, [cameraZ, cameraRotation])

  return (
    <>
      <PerspectiveCamera ref={camera} makeDefault position={[0, 0, 10]} fov={75} />
      <Stars radius={100} depth={50} count={isMobile ? 1500 : 3000} factor={4} saturation={0} fade speed={1} />
      <BackgroundParticles count={isMobile ? 500 : 1000} />
      <Environment preset="night" />

      {!isMobile && (
        <mesh position={[3, -2, -5]} rotation={[0, Math.PI / 4, 0]}>
          <torusKnotGeometry args={[1, 0.3, 32, 8]} />
          <meshStandardMaterial
            color="#FF00FF"
            emissive="#FF00FF"
            emissiveIntensity={0.5}
            metalness={1}
            roughness={0.2}
          />
        </mesh>
      )}
    </>
  )
}

export default function MainScene() {
  const isMobile = useMobile()
  
  return (
    <div className="fixed inset-0 z-0 bg-black">
      <Canvas
        gl={{
          antialias: !isMobile,
          alpha: true,
          powerPreference: "high-performance",
          stencil: false,
          depth: true,
        }}
        dpr={isMobile ? 1 : [1, 2]}
        performance={{ min: 0.5 }}
        shadows={!isMobile}
        camera={{ position: [0, 0, 10], fov: 75 }}
      >
        <Suspense fallback={<LoadingScreen />}>
          <SceneContent />
        </Suspense>
      </Canvas>
    </div>
  )
}

