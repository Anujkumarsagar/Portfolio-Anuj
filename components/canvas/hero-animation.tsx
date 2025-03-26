"use client"

import { useMemo, useState, useRef } from "react"
import { useEffect } from "react"
import * as THREE from "three"
import { Canvas, useFrame } from "@react-three/fiber"
import { Environment, useScroll } from "@react-three/drei"
import { EffectComposer, Bloom, Noise } from "@react-three/postprocessing"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useSoundContext } from "@/context/sound-context"

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

function HeroPolyhedrons() {
  const groupRef = useRef<THREE.Group>(null)
  const { playSound } = useSoundContext()
  const [animationProgress, setAnimationProgress] = useState(0)
  const [scrollProgress, setScrollProgress] = useState(0)
  const scroll = useScroll()
  const [polyhedronStates, setPolyhedronStates] = useState<
    {
      position: THREE.Vector3
      scale: number
    }[]
  >([])

  // Create polyhedrons
  const polyhedrons = useMemo(() => {
    const shapes = []
    const count = 20

    // Create different types of polyhedrons
    for (let i = 0; i < count; i++) {
      const geometry =
        Math.random() > 0.5
          ? new THREE.OctahedronGeometry(0.5 + Math.random() * 0.5)
          : Math.random() > 0.5
            ? new THREE.TetrahedronGeometry(0.5 + Math.random() * 0.5)
            : new THREE.IcosahedronGeometry(0.5 + Math.random() * 0.5)

      const position = new THREE.Vector3(
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10,
        (Math.random() - 0.5) * 10,
      )

      const rotationSpeed = {
        x: (Math.random() - 0.5) * 0.01,
        y: (Math.random() - 0.5) * 0.01,
        z: (Math.random() - 0.5) * 0.01,
      }

      // Randomize colors (cyan to magenta to violet range)
      const color = new THREE.Color()
      const hue = 0.5 + Math.random() * 0.3 // Range from cyan (0.5) to violet (0.8)
      const saturation = 0.7 + Math.random() * 0.3
      const lightness = 0.5 + Math.random() * 0.2

      color.setHSL(hue, saturation, lightness)

      shapes.push({
        geometry,
        position,
        rotationSpeed,
        color,
        scale: 0.5 + Math.random() * 1.5,
      })
    }

    // Initialize polyhedron states with default values
    const initialStates = shapes.map(() => ({
      position: new THREE.Vector3(0, 0, 0),
      scale: 0.1,
    }))
    setPolyhedronStates(initialStates)

    return shapes
  }, [])

  // Setup animations and effects
  useEffect(() => {
    if (typeof window === "undefined") return

    // Play sound when animation starts
    playSound("whoosh")

    // Animate our progress value which we'll use in useFrame
    const obj = { progress: 0 }
    gsap.to(obj, {
      progress: 1,
      duration: 2,
      ease: "power3.out",
      onUpdate: () => {
        setAnimationProgress(obj.progress)
      },
    })

    // Scroll animation - collapse into vortex
    const scrollTrigger = ScrollTrigger.create({
      trigger: "#home",
      start: "top top",
      end: "bottom top",
      scrub: true,
      onUpdate: (self) => {
        setScrollProgress(self.progress)
      },
    })

    return () => {
      if (scrollTrigger) scrollTrigger.kill()
    }
  }, [playSound])

  // Update polyhedron states based on animation and scroll progress
  useEffect(() => {
    if (!polyhedrons || polyhedrons.length === 0) return
    if (!polyhedronStates || polyhedronStates.length === 0) return
    if (polyhedrons.length !== polyhedronStates.length) return

    // Create a new array instead of spreading to avoid null issues
    const newStates = polyhedronStates.map((state, i) => {
      if (!polyhedrons[i] || !polyhedrons[i].position) {
        return state
      }

      const originalPos = polyhedrons[i].position
      const originalScale = polyhedrons[i].scale || 1

      if (animationProgress < 1) {
        // Intro animation - spread out from center
        const targetPos = originalPos.clone()
        const startPos = new THREE.Vector3(0, 0, 0)
        const lerpedPos = startPos.clone().lerp(targetPos, animationProgress)

        // Scale animation
        const scale = 0.1 + (originalScale - 0.1) * animationProgress

        return {
          position: lerpedPos,
          scale: scale,
        }
      } else if (scrollProgress > 0) {
        // Create vortex effect on scroll
        const angle = scrollProgress * Math.PI * 4 * (originalPos.z > 0 ? 1 : -1)
        const radius = 5 * (1 - scrollProgress) * Math.abs(originalPos.z / 5)

        const x = Math.cos(angle) * radius
        const y = Math.sin(angle) * radius - scrollProgress * 10
        const z = -10 * scrollProgress

        // Scale down as we scroll
        const scale = originalScale * (1 - scrollProgress * 0.8)

        return {
          position: new THREE.Vector3(x, y, z),
          scale: scale,
        }
      } else {
        // Normal animation after intro - subtle floating
        const time = Date.now() * 0.001 // Current time in seconds
        const x = originalPos.x + Math.sin(time * 0.5 + i * 0.5) * 0.2
        const y = originalPos.y + Math.cos(time * 0.7 + i * 0.3) * 0.2
        const z = originalPos.z + Math.sin(time * 0.3 + i * 0.7) * 0.2

        return {
          position: new THREE.Vector3(x, y, z),
          scale: originalScale,
        }
      }
    })

    setPolyhedronStates(newStates)
  }, [animationProgress, scrollProgress, polyhedrons, polyhedronStates])

  // Apply states to polyhedrons
  useFrame(({ clock }) => {
    if (!groupRef.current) return
    if (!polyhedronStates || polyhedronStates.length === 0) return
    if (!polyhedrons || polyhedrons.length === 0) return

    const time = clock.getElapsedTime()

    // Animate each polyhedron
    groupRef.current.children.forEach((child, i) => {
      if (i >= polyhedrons.length || i >= polyhedronStates.length) return
      if (!child) return

      const mesh = child as THREE.Mesh
      const shape = polyhedrons[i]
      const state = polyhedronStates[i]

      if (!mesh || !shape || !state) return

      // Apply position and scale from state using .set() method
      if (state.position) {
        mesh.position.set(state.position.x, state.position.y, state.position.z)
      }

      if (typeof state.scale === "number") {
        mesh.scale.set(state.scale, state.scale, state.scale)
      }

      // Rotate each polyhedron - use .x += instead of direct assignment
      if (shape.rotationSpeed) {
        mesh.rotation.x += shape.rotationSpeed.x || 0
        mesh.rotation.y += shape.rotationSpeed.y || 0
        mesh.rotation.z += shape.rotationSpeed.z || 0
      }
    })
  })

  return (
    <group ref={groupRef}>
      {polyhedrons.map((shape, i) => (
        <mesh
          key={i}
          position={[0, 0, 0]} // Start at center, will be updated in useFrame
          userData={{
            originalPosition: shape.position ? shape.position.clone() : new THREE.Vector3(),
            rotationSpeed: shape.rotationSpeed || { x: 0, y: 0, z: 0 },
            originalScale: shape.scale || 1,
          }}
        >
          <primitive object={shape.geometry} attach="geometry" />
          <meshStandardMaterial
            color={shape.color || "#ffffff"}
            emissive={shape.color || "#ffffff"}
            emissiveIntensity={0.5}
            metalness={0.8}
            roughness={0.2}
          />
        </mesh>
      ))}
    </group>
  )
}

export default function CanvasHeroAnimation() {
  return (
    <Canvas className="h-full w-full">
      <ambientLight intensity={0.2} />
      <directionalLight position={[0, 10, 5]} intensity={0.5} />
      <HeroPolyhedrons />
      <Environment preset="night" />
      <EffectComposer>
        <Bloom luminanceThreshold={0.2} luminanceSmoothing={0.9} intensity={0.8} />
        <Noise opacity={0.05} />
      </EffectComposer>
    </Canvas>
  )
}

