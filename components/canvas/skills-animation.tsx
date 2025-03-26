"use client"

import { useMemo, useState } from "react"
import { useRef, useEffect } from "react"
import * as THREE from "three"
import { Canvas, useFrame } from "@react-three/fiber"
import { Text, useScroll, Environment } from "@react-three/drei"
import { EffectComposer, Bloom } from "@react-three/postprocessing"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useSoundContext } from "@/context/sound-context"

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

interface Skill {
  name: string
  level: number
  color: string
}

interface SkillReactorProps {
  skills: Skill[]
}

function SkillReactor({ skills }: SkillReactorProps) {
  const groupRef = useRef<THREE.Group>(null)
  const orbitRef = useRef<THREE.Group>(null)
  const scroll = useScroll()
  const { playSound } = useSoundContext()
  const [animationProgress, setAnimationProgress] = useState(0)
  const [chaosEffect, setChaosEffect] = useState(0)

  // Create skill orbs
  const skillOrbs = useMemo(() => {
    return skills.map((skill, index) => {
      const angle = (index / skills.length) * Math.PI * 2
      const radius = 3

      return {
        position: new THREE.Vector3(Math.cos(angle) * radius, Math.sin(angle) * radius, 0),
        name: skill.name,
        level: skill.level,
        color: skill.color,
        orbitSpeed: 0.1 + (skill.level / 100) * 0.2,
        orbitRadius: 2 + (skill.level / 100) * 2,
        orbitOffset: angle,
      }
    })
  }, [skills])

  // Setup animations
  useEffect(() => {
    if (typeof window === "undefined") return

    // Create timeline for reactor animation
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: "#skills",
        start: "top 70%",
        end: "center center",
        toggleActions: "play none none reverse",
      },
    })

    // Play sound when animation starts
    tl.add(() => playSound("powerUp"))

    // Animate progress for reactor formation
    const obj = { progress: 0 }
    tl.to(obj, {
      progress: 1,
      duration: 1.5,
      ease: "elastic.out(1, 0.5)",
      onUpdate: () => {
        setAnimationProgress(obj.progress)
      },
    })

    // Scroll animation - chaos effect
    const scrollTrigger = ScrollTrigger.create({
      trigger: "#skills",
      start: "top top",
      end: "bottom top",
      scrub: true,
      onUpdate: (self) => {
        // Chaos effect at mid-scroll
        const chaos = Math.sin(self.progress * Math.PI)
        setChaosEffect(chaos)

        // Play sound during chaotic phase
        if (chaos > 0.8 && Math.random() > 0.95) {
          playSound("glitch")
        }
      },
    })

    return () => {
      if (scrollTrigger) scrollTrigger.kill()
    }
  }, [playSound, skillOrbs])

  // Animate the reactor
  useFrame(({ clock }) => {
    if (!groupRef.current || !orbitRef.current) return

    const time = clock.getElapsedTime()

    // Get scroll progress with safety check
    const scrollProgress = scroll?.offset ?? 0

    // Scale the whole group based on animation progress
    const scale = animationProgress
    groupRef.current.scale.set(scale, scale, scale)

    // Rotate the whole group for a gyroscope effect
    groupRef.current.rotation.x = Math.sin(time * 0.3)
    groupRef.current.rotation.y += 0.002

    // Individual orb animations
    orbitRef.current.children.forEach((child, i) => {
      if (i >= skillOrbs.length) return

      const orb = child as THREE.Object3D
      const orbData = skillOrbs[i]

      // Apply chaos effect
      const chaosFactor = chaosEffect * 3
      const randomX = (Math.random() - 0.5) * chaosFactor
      const randomY = (Math.random() - 0.5) * chaosFactor
      const randomZ = (Math.random() - 0.5) * chaosFactor

      // Circular orbit animation
      const angle = orbData.orbitOffset + time * orbData.orbitSpeed
      const radius = orbData.orbitRadius

      orb.position.x = Math.cos(angle) * radius + randomX * chaosEffect
      orb.position.y = Math.sin(angle) * radius + randomY * chaosEffect
      orb.position.z = Math.sin(angle * 2) * (radius / 3) + randomZ * chaosEffect

      // Rotate orbs
      orb.rotation.x += 0.01
      orb.rotation.y += 0.01

      // Apply chaos to rotation
      if (chaosEffect > 0.5) {
        orb.rotation.x = Math.random() * Math.PI * 2 * chaosEffect
        orb.rotation.y = Math.random() * Math.PI * 2 * chaosEffect
        orb.rotation.z = Math.random() * Math.PI * 2 * chaosEffect
      }
    })
  })

  return (
    <group ref={groupRef} position={[0, 0, 0]} scale={0}>
      {/* Core reactor */}
      <mesh>
        <torusGeometry args={[1, 0.2, 16, 32]} />
        <meshStandardMaterial
          color="#00ffff"
          emissive="#00ffff"
          emissiveIntensity={1}
          metalness={0.8}
          roughness={0.2}
        />
      </mesh>

      {/* Skill orbs group */}
      <group ref={orbitRef}>
        {skillOrbs.map((skill, i) => (
          <group key={i} position={[0, 0, 0]}>
            <mesh>
              <sphereGeometry args={[0.3 + (skill.level / 100) * 0.2, 16, 16]} />
              <meshStandardMaterial
                color={skill.color}
                emissive={skill.color}
                emissiveIntensity={0.7}
                metalness={0.9}
                roughness={0.1}
              />
            </mesh>
            <Text position={[0, 0.5, 0]} fontSize={0.15} color="white" anchorX="center" anchorY="middle">
              {skill.name}
            </Text>
          </group>
        ))}
      </group>
    </group>
  )
}

export default function CanvasSkillsAnimation({ skills }: SkillReactorProps) {
  return (
    <Canvas className="h-full w-full">
      <ambientLight intensity={0.2} />
      <spotLight position={[0, 0, 10]} intensity={0.5} />
      <SkillReactor skills={skills} />
      <Environment preset="night" />
      <EffectComposer>
        <Bloom luminanceThreshold={0.2} luminanceSmoothing={0.9} intensity={0.8} />
      </EffectComposer>
    </Canvas>
  )
}

