"use client"

import { useMemo, useState } from "react"
import { useEffect, useRef } from "react"
import * as THREE from "three"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { Environment, Stars, useScroll, PerspectiveCamera } from "@react-three/drei"
import { useWindowSize } from "@/hooks/use-window-size"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { ScrollToPlugin } from "gsap/ScrollToPlugin"

// Register GSAP plugins
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin)
}

function BackgroundParticles({ count = 3000 }) {
  const { viewport } = useThree()
  const scroll = useScroll()
  const particlesRef = useRef<THREE.Points>(null)

  // Generate particles
  const [positions, sizes] = useMemo(() => {
    const positions = new Float32Array(count * 3)
    const sizes = new Float32Array(count)

    for (let i = 0; i < count; i++) {
      // Spread particles in a 3D space
      positions[i * 3] = (Math.random() - 0.5) * 40 // x
      positions[i * 3 + 1] = (Math.random() - 0.5) * 40 // y
      positions[i * 3 + 2] = (Math.random() - 0.5) * 40 // z

      // Random sizes
      sizes[i] = Math.random() * 0.5
    }

    return [positions, sizes]
  }, [count])

  useFrame(({ clock }) => {
    if (!particlesRef.current) return
    if (!particlesRef.current.geometry) return
    if (!particlesRef.current.geometry.attributes.position) return

    // Get scroll progress (0 to 1) with safety check
    const scrollProgress = scroll?.offset ?? 0

    // Get the position attribute
    const positionAttribute = particlesRef.current.geometry.attributes.position

    // Create a copy of the positions array to modify
    const positionsArray = [...Array.from(positionAttribute.array)] as number[]

    // Animate particles based on time and scroll
    const time = clock.getElapsedTime() * 0.2

    for (let i = 0; i < count; i++) {
      const i3 = i * 3

      // Add subtle movement - use direct array access instead of assignment
      positionsArray[i3 + 1] += Math.sin(time + i * 0.1) * 0.01

      // Add scroll-based movement (particles flowing down as user scrolls)
      positionsArray[i3 + 1] -= 0.03 * scrollProgress

      // Reset particles that go out of view
      if (positionsArray[i3 + 1] < -viewport.height) {
        positionsArray[i3 + 1] = viewport.height
      }
    }

    // Update the position attribute with the modified array
    for (let i = 0; i < positionsArray.length; i++) {
      positionAttribute.array[i] = positionsArray[i]
    }

    positionAttribute.needsUpdate = true
  })

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute 
          attach="attributes-position" 
          count={count} 
          array={positions} 
          itemSize={3}
          args={[positions, 3]} 
        />
        <bufferAttribute 
          attach="attributes-size" 
          count={count} 
          array={sizes} 
          itemSize={1}
          args={[sizes, 1]} 
        />
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

function SceneContent() {
  const { width, height } = useWindowSize()
  const scroll = useScroll()
  const camera = useRef<THREE.PerspectiveCamera>(null)
  const [cameraZ, setCameraZ] = useState(10)
  const [cameraRotation, setCameraRotation] = useState({ x: 0, y: 0 })

  useFrame(() => {
    if (!camera.current) return

    // Get scroll progress (0 to 1) with safety check
    const scrollProgress = scroll?.offset ?? 0

    // Update camera position based on scroll
    setCameraZ(10 - scrollProgress * 3)

    // Update camera rotation based on scroll
    setCameraRotation({
      x: Math.sin(scrollProgress * Math.PI) * 0.1,
      y: Math.cos(scrollProgress * Math.PI) * 0.1,
    })
  })

  // Apply camera updates
  useEffect(() => {
    if (!camera.current) return

    // Use .set() for position and rotation
    camera.current.position.set(0, 0, cameraZ)
    camera.current.rotation.set(cameraRotation.x, cameraRotation.y, 0)
  }, [cameraZ, cameraRotation])

  return (
    <>
      <PerspectiveCamera ref={camera} makeDefault position={[0, 0, 10]} fov={75} />
      <Stars radius={100} depth={50} count={5000} factor={4} saturation={0} fade speed={1} />
      <BackgroundParticles />
      <Environment preset="night" />

      {/* Add additional 3D objects here that will be present throughout the site */}
      <mesh position={[3, -2, -5]} rotation={[0, Math.PI / 4, 0]}>
        <torusKnotGeometry args={[1, 0.3, 128, 32]} />
        <meshStandardMaterial
          color="#FF00FF"
          emissive="#FF00FF"
          emissiveIntensity={0.5}
          metalness={1}
          roughness={0.2}
        />
      </mesh>
    </>
  )
}

export default function MainScene() {
  return (
    <div className="fixed inset-0 z-0 bg-black">
      <Canvas
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: "high-performance",
        }}
        dpr={[1, 2]}
        performance={{ min: 0.5 }}
      >
        <SceneContent />
      </Canvas>
    </div>
  )
}

