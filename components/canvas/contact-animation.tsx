"use client"

import { useMemo, useState } from "react"
import { useRef, useEffect } from "react"
import * as THREE from "three"
import { Canvas, useFrame } from "@react-three/fiber"
import { Environment, useScroll } from "@react-three/drei"
import { EffectComposer, Bloom } from "@react-three/postprocessing"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useSoundContext } from "@/context/sound-context"

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

interface ContactAnimationProps {
  formSubmitted: boolean
}

function SpaceShip({ formSubmitted }: ContactAnimationProps) {
  const shipRef = useRef<THREE.Group>(null)
  const rocketRef = useRef<THREE.Mesh>(null)
  const scroll = useScroll()
  const { playSound } = useSoundContext()
  const [hasLaunched, setHasLaunched] = useState(false)
  const [shipPosition, setShipPosition] = useState(new THREE.Vector3(0, 0, -3))
  const [shipRotation, setShipRotation] = useState(new THREE.Euler(0, Math.PI, 0))
  const [flameScale, setFlameScale] = useState(new THREE.Vector3(1, 1, 1))

  // Create spaceship model
  const shipModel = useMemo(() => {
    const group = new THREE.Group()

    // Ship body
    const body = new THREE.Mesh(
      new THREE.CylinderGeometry(0.2, 0.5, 1.5, 8),
      new THREE.MeshStandardMaterial({
        color: "#222222",
        metalness: 0.8,
        roughness: 0.2,
      }),
    )
    body.rotation.x = Math.PI / 2
    group.add(body)

    // Cockpit
    const cockpit = new THREE.Mesh(
      new THREE.SphereGeometry(0.3, 16, 16),
      new THREE.MeshStandardMaterial({
        color: "#00ffff",
        emissive: "#00ffff",
        emissiveIntensity: 0.5,
        metalness: 0.9,
        roughness: 0.1,
        transparent: true,
        opacity: 0.9,
      }),
    )
    cockpit.position.set(0, 0, -0.6)
    group.add(cockpit)

    // Wings
    const wing1 = new THREE.Mesh(
      new THREE.BoxGeometry(1, 0.1, 0.5),
      new THREE.MeshStandardMaterial({
        color: "#444444",
        metalness: 0.7,
        roughness: 0.3,
      }),
    )
    wing1.position.set(0, 0, 0.2)
    group.add(wing1)

    // Rocket engine
    const rocket = new THREE.Mesh(
      new THREE.CylinderGeometry(0.15, 0.15, 0.3, 16),
      new THREE.MeshStandardMaterial({
        color: "#ff5500",
        emissive: "#ff5500",
        emissiveIntensity: 1,
      }),
    )
    rocket.rotation.x = Math.PI / 2
    rocket.position.set(0, 0, 0.9)
    group.add(rocket)

    return group
  }, [])

  // Setup animations
  useEffect(() => {
    if (typeof window === "undefined") return

    // Initial animation
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: "#contact",
        start: "top 70%",
        end: "center center",
        toggleActions: "play none none reverse",
      },
    })

    // Play sound when animation starts
    tl.add(() => playSound("whoosh"))

    // Animate ship flying in
    const initialPos = { x: -10, y: 5, z: -5 }
    const targetPos = { x: 0, y: 0, z: -3 }

    gsap.to(initialPos, {
      x: targetPos.x,
      y: targetPos.y,
      z: targetPos.z,
      duration: 2,
      ease: "power3.out",
      onUpdate: () => {
        setShipPosition(new THREE.Vector3(initialPos.x, initialPos.y, initialPos.z))
      },
      onStart: () => {
        setShipRotation(new THREE.Euler(0, Math.PI, 0))
      },
    })

    // Subtle hover animation
    const hoverObj = { y: 0 }
    gsap.to(hoverObj, {
      y: 0.2,
      duration: 2,
      ease: "sine.inOut",
      repeat: -1,
      yoyo: true,
      onUpdate: () => {
        setShipPosition((prev) => new THREE.Vector3(prev.x, hoverObj.y, prev.z))
      },
    })

    return () => {
      if (typeof ScrollTrigger !== "undefined") {
        ScrollTrigger.getAll().forEach((t) => t.kill())
      }
    }
  }, [playSound])

  // Handle form submission animation
  useEffect(() => {
    if (!formSubmitted) return

    // Rocket launch animation
    playSound("rocketLaunch")
    setHasLaunched(true)

    // Launch animation
    const pos = { y: shipPosition.y, z: shipPosition.z }
    const rot = { z: shipRotation.z }

    // Animate flame
    const flameObj = { x: 1, y: 1, z: 1 }
    gsap.to(flameObj, {
      x: 3,
      y: 1,
      z: 3,
      duration: 0.3,
      repeat: 3,
      yoyo: true,
      onUpdate: () => {
        setFlameScale(new THREE.Vector3(flameObj.x, flameObj.y, flameObj.z))
      },
    })

    // Launch ship
    gsap.to(pos, {
      y: 10,
      z: -20,
      duration: 2,
      ease: "power2.in",
      onUpdate: () => {
        setShipPosition((prev) => new THREE.Vector3(prev.x, pos.y, pos.z))
      },
      onComplete: () => {
        // Reset ship after launch
        setTimeout(() => {
          const resetPos = { x: -10, y: 5, z: -5 }
          gsap.set(resetPos, {
            onComplete: () => {
              setShipPosition(new THREE.Vector3(resetPos.x, resetPos.y, resetPos.z))

              gsap.to(resetPos, {
                x: 0,
                y: 0,
                z: -3,
                duration: 2,
                ease: "power3.out",
                onUpdate: () => {
                  setShipPosition(new THREE.Vector3(resetPos.x, resetPos.y, resetPos.z))
                },
                onComplete: () => setHasLaunched(false),
              })
            },
          })
        }, 500)
      },
    })

    // Rotate during launch
    gsap.to(rot, {
      z: Math.PI * 2,
      duration: 2,
      ease: "power2.in",
      onUpdate: () => {
        setShipRotation((prev) => new THREE.Euler(prev.x, prev.y, rot.z))
      },
    })
  }, [formSubmitted, playSound, shipPosition, shipRotation])

  // Frame animation
  useFrame(({ clock }) => {
    if (!shipRef.current || !rocketRef.current) return

    const time = clock.getElapsedTime()

    // Engine flame effect
    if (rocketRef.current) {
      const flicker = 0.8 + Math.sin(time * 10) * 0.2

      if (!hasLaunched) {
        // Normal flame
        setFlameScale(new THREE.Vector3(1, flicker, 1))
      } else {
        // Increased flame during launch
        const intensity = 1 + Math.sin(time * 20) * 0.5
        setFlameScale(new THREE.Vector3(intensity * 2, intensity, intensity * 2))
      }
    }

    // Subtle ship rotation
    if (shipRef.current) {
      setShipRotation((prev) => new THREE.Euler(prev.x, Math.PI + Math.sin(time * 0.5) * 0.1, prev.z))
    }
  })

  return (
    <group>
      <primitive
        ref={shipRef}
        object={shipModel}
        position={[shipPosition.x, shipPosition.y, shipPosition.z]}
        rotation={[shipRotation.x, shipRotation.y, shipRotation.z]}
      />

      {/* Add engine flame */}
      <mesh
        ref={rocketRef}
        position={[0, 0, -2.1]}
        rotation={[Math.PI / 2, 0, 0]}
        scale={[flameScale.x, flameScale.y, flameScale.z]}
      >
        <coneGeometry args={[0.2, 1, 16]} />
        <meshBasicMaterial color="#ff8800" transparent opacity={0.8} />
      </mesh>

      {/* Add particles for engine */}
      {Array.from({ length: 30 }).map((_, i) => (
        <mesh
          key={`particle-${i}`}
          position={[(Math.random() - 0.5) * 0.5, (Math.random() - 0.5) * 0.5, -2 - Math.random() * 1.5]}
        >
          <sphereGeometry args={[0.03 + Math.random() * 0.05, 8, 8]} />
          <meshBasicMaterial color={Math.random() > 0.5 ? "#ff8800" : "#ffcc00"} transparent opacity={0.7} />
        </mesh>
      ))}
    </group>
  )
}

export default function CanvasContactAnimation({ formSubmitted }: ContactAnimationProps) {
  return (
    <Canvas className="h-full w-full">
      <ambientLight intensity={0.2} />
      <spotLight position={[5, 5, 5]} intensity={0.5} />
      <SpaceShip formSubmitted={formSubmitted} />
      <Environment preset="night" />
      <EffectComposer>
        <Bloom luminanceThreshold={0.2} luminanceSmoothing={0.9} intensity={0.8} />
      </EffectComposer>
    </Canvas>
  )
}

