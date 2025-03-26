"use client"

import { useMemo, useState } from "react"
import { useRef, useEffect } from "react"
import * as THREE from "three"
import { Canvas, useFrame } from "@react-three/fiber"
import { useScroll, Environment } from "@react-three/drei"
import { EffectComposer, Bloom } from "@react-three/postprocessing"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useSoundContext } from "@/context/sound-context"

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

function TimeVortex() {
  const groupRef = useRef<THREE.Group>(null)
  const ringsRef = useRef<(THREE.Mesh | null)[]>([])
  const scroll = useScroll()
  const { playSound } = useSoundContext()
  const [groupScale, setGroupScale] = useState(0.1)
  const [groupOpacity, setGroupOpacity] = useState(0)
  const [ringScales, setRingScales] = useState<{ x: number; y: number; z: number }[]>([])
  const [groupRotationY, setGroupRotationY] = useState(0)
  const [groupRotationZ, setGroupRotationZ] = useState(0)

  // Create rings for the vortex
  const rings = useMemo(() => {
    const items = []
    const ringCount = 12

    for (let i = 0; i < ringCount; i++) {
      const progress = i / ringCount
      const angle = progress * Math.PI * 2

      // Ring color based on position (gradient from cyan to magenta to violet)
      const color = new THREE.Color()
      const hue = 0.5 + progress * 0.3 // Cyan to violet
      const saturation = 0.8
      const lightness = 0.5

      color.setHSL(hue, saturation, lightness)

      items.push({
        radius: 1 + progress * 3,
        tubeRadius: 0.03 + progress * 0.05,
        color: color,
        rotationOffset: angle,
        position: new THREE.Vector3(0, -5 + progress * 10, -10 + progress * 10),
      })
    }

    // Initialize ring scales with default values
    const initialScales = Array(ringCount)
      .fill(null)
      .map(() => ({ x: 0, y: 0, z: 0 }))
    setRingScales(initialScales)

    return items
  }, [])

  // Initialize animations
  useEffect(() => {
    if (typeof window === "undefined") return

    // Create timeline for vortex animation
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: "#experience",
        start: "top 70%",
        end: "bottom 30%",
        toggleActions: "play none none reverse",
      },
    })

    // Play sound when animation starts
    tl.add(() => playSound("swoosh"))

    // Animate vortex appearing - using state variables instead of direct manipulation
    const scaleObj = { scale: 0.1, opacity: 0 }
    tl.to(scaleObj, {
      scale: 1,
      opacity: 1,
      duration: 1.5,
      ease: "elastic.out(1, 0.5)",
      onUpdate: () => {
        setGroupScale(scaleObj.scale)
        setGroupOpacity(scaleObj.opacity)
      },
    })

    // Animate each ring appearing
    if (ringScales && ringScales.length > 0) {
      rings.forEach((_, i) => {
        const ringObj = { scale: 0 }

        tl.to(
          ringObj,
          {
            scale: 1,
            duration: 0.5,
            ease: "back.out(1.7)",
            onStart: () => {
              if (i % 3 === 0) playSound("ping")
            },
            onUpdate: () => {
              // Create a new array with updated values
              setRingScales((prevScales) => {
                if (!prevScales) return []

                const newScales = [...prevScales]
                newScales[i] = { x: ringObj.scale, y: ringObj.scale, z: ringObj.scale }
                return newScales
              })
            },
          },
          `-=${0.4}`,
        )
      })
    }

    // Create a continuous spin animation
    const rotationObj = { y: 0 }
    gsap.to(rotationObj, {
      y: Math.PI * 2,
      repeat: -1,
      duration: 20,
      ease: "none",
      onUpdate: () => {
        setGroupRotationY(rotationObj.y)
      },
    })

    // Create scroll-based animation
    ScrollTrigger.create({
      trigger: "#experience",
      start: "top top",
      end: "bottom top",
      scrub: true,
      onUpdate: (self) => {
        // Increase spin speed based on scroll
        setGroupRotationZ(self.progress * Math.PI)

        // Scale rings based on scroll
        setRingScales((prevScales) => {
          if (!prevScales) return []

          return prevScales.map((scale, i) => {
            const distortFactor = Math.sin(self.progress * Math.PI)

            // Distort rings in the middle of the scroll
            return {
              x: 1 + distortFactor * 0.2 * (i / rings.length),
              y: 1 + distortFactor * 0.1,
              z: 1,
            }
          })
        })
      },
    })

    return () => {
      if (typeof ScrollTrigger !== "undefined") {
        ScrollTrigger.getAll().forEach((t) => t.kill())
      }
    }
  }, [rings, playSound, ringScales])

  // Frame animation
  useFrame(({ clock }) => {
    if (!groupRef.current) return

    const time = clock.getElapsedTime()

    // Apply state values to Three.js objects
    if (groupRef.current) {
      // Apply scale and rotation from state using .set()
      groupRef.current.scale.set(groupScale, groupScale, groupScale)
      groupRef.current.rotation.set(0, groupRotationY, groupRotationZ)

      // Breathing animation for group - calculate but don't directly modify
      const breathingScale = 1 + Math.sin(time * 0.5) * 0.05
      // Use set() instead of direct assignment or multiplyScalar
      groupRef.current.scale.set(groupScale * breathingScale, groupScale * breathingScale, groupScale * breathingScale)
    }

    // Animate rings
    ringsRef.current.forEach((ring, i) => {
      if (!ring) return
      if (i >= rings.length || i >= ringScales.length) return

      const ringData = rings[i]
      const ringScale = ringScales[i] || { x: 1, y: 1, z: 1 }

      // Apply scale from state using .set()
      ring.scale.set(ringScale.x, ringScale.y, ringScale.z)

      // Each ring rotates independently - use .set() for rotation
      ring.rotation.set(time * 0.2 + ringData.rotationOffset, time * 0.3 + ringData.rotationOffset * 2, 0)

      // Pulse effect for rings - calculate but don't directly modify
      const pulse = Math.sin(time * 0.5 + i * 0.2) * 0.05
      // Use set() instead of direct assignment
      ring.scale.set(ringScale.x * (1 + pulse), ringScale.y * (1 + pulse), ringScale.z)

      // Flying satellites for some rings
      if (i % 2 === 0 && ring.children.length > 0) {
        const satellite = ring.children[0] as THREE.Mesh

        // Orbit around the ring
        const orbitSpeed = 1 + i * 0.2
        const orbitRadius = ringData.radius * 0.2

        // Use .set() for position
        satellite.position.set(Math.cos(time * orbitSpeed) * orbitRadius, Math.sin(time * orbitSpeed) * orbitRadius, 0)
      }
    })
  })

  return (
    <group
      ref={groupRef}
      position={[0, 0, -5]}
      rotation={[0, 0, 0]} // Initial rotation, will be updated in useFrame
    >
      {rings.map((ring, i) => {
        return (
          <group key={i} position={ring.position}>
            <mesh
              ref={(el) => {
                ringsRef.current[i] = el
              }}
            >
              <torusGeometry args={[ring.radius, ring.tubeRadius, 16, 64]} />
              <meshStandardMaterial
                color={ring.color}
                emissive={ring.color}
                emissiveIntensity={0.5}
                metalness={0.8}
                roughness={0.2}
              />

              {/* Add a satellite to every other ring */}
              {i % 2 === 0 && (
                <mesh position={[ring.radius * 0.2, 0, 0]}>
                  <sphereGeometry args={[ring.tubeRadius * 3, 16, 16]} />
                  <meshStandardMaterial
                    color={ring.color}
                    emissive={ring.color}
                    emissiveIntensity={0.8}
                    metalness={0.9}
                    roughness={0.1}
                  />
                </mesh>
              )}
            </mesh>
          </group>
        )
      })}

      {/* Add glowing particles for additional visual effect */}
      {Array.from({ length: 100 }).map((_, i) => {
        const theta = Math.random() * Math.PI * 2
        const radius = 2 + Math.random() * 6
        const verticalPos = -5 + Math.random() * 10

        return (
          <mesh key={`particle-${i}`} position={[Math.cos(theta) * radius, verticalPos, Math.sin(theta) * radius]}>
            <sphereGeometry args={[0.03 + Math.random() * 0.05, 8, 8]} />
            <meshBasicMaterial
              color={new THREE.Color().setHSL(0.5 + Math.random() * 0.3, 0.8, 0.5)}
              transparent
              opacity={0.7}
            />
          </mesh>
        )
      })}
    </group>
  )
}

export default function CanvasExperienceAnimation() {
  return (
    <Canvas className="h-full w-full">
      <ambientLight intensity={0.2} />
      <spotLight position={[5, 5, 5]} intensity={0.5} />
      <TimeVortex />
      <Environment preset="night" />
      <EffectComposer>
        <Bloom luminanceThreshold={0.2} luminanceSmoothing={0.9} intensity={0.8} />
      </EffectComposer>
    </Canvas>
  )
}

