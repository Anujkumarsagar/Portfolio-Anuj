"use client"

import dynamic from 'next/dynamic'
import { Suspense, useMemo, useState } from "react"
import { useRef, useEffect } from "react"
import * as THREE from "three"
import { Canvas, useFrame } from "@react-three/fiber"
import { Html, Environment, useScroll } from "@react-three/drei"
import { EffectComposer, Bloom, Glitch } from "@react-three/postprocessing"
import { GlitchMode } from "postprocessing"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useSoundContext } from "@/context/sound-context"

// Dynamically import heavy components
const DynamicEffectComposer = dynamic(() => import('@react-three/postprocessing').then(mod => mod.EffectComposer), {
  ssr: false,
  loading: () => null,
})

const DynamicBloom = dynamic(() => import('@react-three/postprocessing').then(mod => mod.Bloom), {
  ssr: false,
  loading: () => null,
})

const DynamicGlitch = dynamic(() => import('@react-three/postprocessing').then(mod => mod.Glitch), {
  ssr: false,
  loading: () => null,
})

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

function Avatar() {
  const groupRef = useRef<THREE.Group>(null)
  const scroll = useScroll()
  const { playSound } = useSoundContext()
  const [animationProgress, setAnimationProgress] = useState(0)
  const [eyesVisible, setEyesVisible] = useState(false)
  const [panelsVisible, setPanelsVisible] = useState(false)
  const [groupRotationX, setGroupRotationX] = useState(0)
  const [groupPositionZ, setGroupPositionZ] = useState(-3)
  const [groupRotationY, setGroupRotationY] = useState(Math.PI)
  const [groupPositionY, setGroupPositionY] = useState(0)
  const [partPositions, setPartPositions] = useState<THREE.Vector3[]>([])

  // Assembled parts of the avatar
  const parts = useMemo(() => {
    const partsData = [
      {
        geometry: new THREE.BoxGeometry(0.5, 0.5, 0.5),
        position: [0, 1.2, 0], // Head
        color: "#ff00ff",
        initialPosition: [2, 3, -5],
      },
      {
        geometry: new THREE.BoxGeometry(1, 1.5, 0.5),
        position: [0, 0, 0], // Torso
        color: "#00ffff",
        initialPosition: [-3, -1, -5],
      },
      {
        geometry: new THREE.BoxGeometry(0.25, 1, 0.25),
        position: [0.6, 0, 0], // Right arm
        color: "#7000ff",
        initialPosition: [4, -2, -3],
      },
      {
        geometry: new THREE.BoxGeometry(0.25, 1, 0.25),
        position: [-0.6, 0, 0], // Left arm
        color: "#7000ff",
        initialPosition: [-4, -2, -3],
      },
      {
        geometry: new THREE.BoxGeometry(0.25, 1, 0.25),
        position: [0.3, -1.2, 0], // Right leg
        color: "#ff00a0",
        initialPosition: [2, -5, -2],
      },
      {
        geometry: new THREE.BoxGeometry(0.25, 1, 0.25),
        position: [-0.3, -1.2, 0], // Left leg
        color: "#ff00a0",
        initialPosition: [-2, -5, -2],
      },
    ]

    // Initialize part positions with default Vector3 objects
    const initialPositions = partsData.map(
      (part) => new THREE.Vector3(part.initialPosition[0], part.initialPosition[1], part.initialPosition[2]),
    )
    setPartPositions(initialPositions)

    return partsData
  }, [])

  // Initialize animations
  useEffect(() => {
    if (typeof window === "undefined") return

    // Create timeline for animation progress
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: "#about",
        start: "top 80%",
        end: "bottom 20%",
        toggleActions: "play none none reverse",
      },
    })

    // Play sound
    tl.add(() => playSound("mechaSound"))

    // Animate progress for part assembly
    const obj = { progress: 0 }
    tl.to(obj, {
      progress: 1,
      duration: 1.5,
      ease: "power3.out",
      onUpdate: () => {
        setAnimationProgress(obj.progress)
      },
    })

    // Show eyes after assembly
    tl.add(() => {
      setEyesVisible(true)
      playSound("powerUp")
    }, "+=0.7")

    // Show panels after eyes
    tl.add(() => {
      setPanelsVisible(true)
      playSound("woosh")
    }, "+=0.3")

    // Create scroll-based animation
    const scrollTrigger = ScrollTrigger.create({
      trigger: "#about",
      start: "top bottom",
      end: "bottom top",
      scrub: true,
      onUpdate: (self) => {
        setGroupRotationX(self.progress * 0.5)
        setGroupPositionZ(-3 + self.progress * 2)
      },
    })

    return () => {
      if (scrollTrigger) scrollTrigger.kill()
    }
  }, [playSound, parts])

  // Update part positions based on animation progress
  useEffect(() => {
    if (!parts || parts.length === 0) return
    if (!partPositions || partPositions.length === 0) return
    if (parts.length !== partPositions.length) return

    // Create a new array with updated positions
    const newPositions = partPositions.map((currentPos, i) => {
      if (!parts[i] || !parts[i].position || !parts[i].initialPosition) {
        return currentPos
      }

      if (animationProgress < 1) {
        // Assemble parts animation
        const initialPos = new THREE.Vector3(
          parts[i].initialPosition[0],
          parts[i].initialPosition[1],
          parts[i].initialPosition[2],
        )
        const targetPos = new THREE.Vector3(parts[i].position[0], parts[i].position[1], parts[i].position[2])

        // Lerp between initial and target positions
        const lerpedPos = initialPos.clone().lerp(targetPos, animationProgress)

        // Play mechanical click sound at certain thresholds
        if (animationProgress > i * 0.15 && animationProgress < i * 0.15 + 0.1) {
          playSound("mechanicalClick")
        }

        return lerpedPos
      } else {
        // Subtle idle animation
        const time = Date.now() * 0.001 // Current time in seconds
        const x = parts[i].position[0] + Math.sin(time * 0.5 + i) * 0.02
        const y = parts[i].position[1] + Math.cos(time * 0.5 + i) * 0.02
        const z = parts[i].position[2]

        return new THREE.Vector3(x, y, z)
      }
    })

    setPartPositions(newPositions)
  }, [animationProgress, parts, playSound, partPositions])

  // Create panel elements
  const panels = useMemo(() => {
    return ["Code", "Design", "Create"].map((text, i) => {
      const angle = (i / 3) * Math.PI * 2
      return {
        text,
        position: [Math.cos(angle) * 2, Math.sin(angle) * 2, 0],
        initialPosition: [Math.cos(angle) * 5, Math.sin(angle) * 5, -5],
      }
    })
  }, [])

  // Animate avatar based on scroll
  useFrame(({ clock }) => {
    if (!groupRef.current) return

    const time = clock.getElapsedTime()

    // Subtle idle animation for the whole avatar
    setGroupRotationY(Math.PI + Math.sin(time * 0.5) * 0.2)
    setGroupPositionY(Math.sin(time * 0.5) * 0.1)

    // Apply values to the group
    if (groupRef.current) {
      // Use .set() for rotation and position
      groupRef.current.rotation.set(groupRotationX, groupRotationY, 0)
      groupRef.current.position.set(0, groupPositionY, groupPositionZ)
    }

    // Apply positions to parts
    if (groupRef.current.children && partPositions && partPositions.length > 0) {
      groupRef.current.children.forEach((child, i) => {
        if (i >= parts.length || i >= partPositions.length) return
        if (!child) return

        const mesh = child as THREE.Mesh
        const position = partPositions[i]

        if (position) {
          // Use .set() instead of direct assignment
          mesh.position.set(position.x, position.y, position.z)
        }
      })
    }
  })

  return (
    <group
      ref={groupRef}
      position={[0, 0, -3]} // Initial position, will be updated in useFrame
      rotation={[0, Math.PI, 0]} // Initial rotation, will be updated in useFrame
    >
      {/* Avatar parts */}
      {parts.map((part, i) => {
        const position = partPositions[i] || new THREE.Vector3(0, 0, 0)
        return (
          <mesh key={i} position={[position.x, position.y, position.z]}>
            <primitive object={part.geometry} attach="geometry" />
            <meshStandardMaterial
              color={part.color}
              emissive={part.color}
              emissiveIntensity={0.5}
              metalness={0.8}
              roughness={0.2}
            />

            {/* Add eyes to the head */}
            {i === 0 && eyesVisible && (
              <>
                <mesh position={[0.15, 0.1, 0.26]} scale={[1, 1, 1]}>
                  <sphereGeometry args={[0.05, 16, 16]} />
                  <meshBasicMaterial color="#ffffff" />
                </mesh>
                <mesh position={[-0.15, 0.1, 0.26]} scale={[1, 1, 1]}>
                  <sphereGeometry args={[0.05, 16, 16]} />
                  <meshBasicMaterial color="#ffffff" />
                </mesh>
              </>
            )}
          </mesh>
        )
      })}

      {/* Holographic panels */}
      {panelsVisible &&
        panels.map((panel, i) => {
          const pos = panelsVisible ? panel.position : panel.initialPosition
          return (
            <group key={`panel-${i}`} position={[pos[0], pos[1], pos[2]]}>
              <Html transform distanceFactor={10}>
                <div
                  className="bg-black/70 backdrop-blur p-3 rounded border border-cyan-500 w-[100px] text-center"
                  style={{ color: "cyan" }}
                >
                  {panel.text}
                </div>
              </Html>
            </group>
          )
        })}
    </group>
  )
}

export default function CanvasAboutAnimation() {
  return (
    <Canvas className="h-full w-full" dpr={[1, 2]}>
      <ambientLight intensity={0.2} />
      <spotLight position={[5, 5, 5]} intensity={0.5} />
      <Suspense fallback={null}>
        <Avatar />
      </Suspense>
      <Environment preset="night" />
      <Suspense fallback={null}>
        <DynamicEffectComposer>
          <DynamicBloom luminanceThreshold={0.2} luminanceSmoothing={0.9} intensity={0.5} />
          <DynamicGlitch
            delay={new THREE.Vector2(1.5, 3.5)}
            duration={new THREE.Vector2(0.1, 0.3)}
            strength={new THREE.Vector2(0.05, 0.1)}
            mode={GlitchMode.SPORADIC}
            active
            ratio={0.85}
          />
        </DynamicEffectComposer>
      </Suspense>
    </Canvas>
  )
}

