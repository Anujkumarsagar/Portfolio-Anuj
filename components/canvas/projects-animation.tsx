"use client"

import { useMemo, useState, useEffect } from "react"
import { useRef } from "react"
import * as THREE from "three"
import { Canvas, useFrame } from "@react-three/fiber"
import { Environment, useScroll } from "@react-three/drei"
import { EffectComposer, Bloom, ChromaticAberration } from "@react-three/postprocessing"
import { BlendFunction } from "postprocessing"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useSoundContext } from "@/context/sound-context"

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

interface ProjectsAnimationProps {
  activeProject: number
}

// Define device shapes for each project
const deviceTypes = [
  {
    name: "laptop",
    geometry: (w = 2, h = 1.3, d = 0.1) => {
      const group = new THREE.Group()

      // Screen
      const screen = new THREE.Mesh(
        new THREE.BoxGeometry(w, h, d),
        new THREE.MeshStandardMaterial({ color: "#111111" }),
      )
      screen.position.set(0, 0, 0)
      group.add(screen)

      // Screen inner (display)
      const display = new THREE.Mesh(
        new THREE.BoxGeometry(w * 0.9, h * 0.9, d * 1.1),
        new THREE.MeshStandardMaterial({
          color: "#00ffff",
          emissive: "#00ffff",
          emissiveIntensity: 0.5,
        }),
      )
      display.position.set(0, 0, 0.01)
      group.add(display)

      // Base
      const base = new THREE.Mesh(
        new THREE.BoxGeometry(w * 0.8, h * 0.05, d * 5),
        new THREE.MeshStandardMaterial({ color: "#222222" }),
      )
      base.position.set(0, -h * 0.6, -d * 2)
      group.add(base)

      return group
    },
  },
  {
    name: "phone",
    geometry: (w = 0.8, h = 1.6, d = 0.1) => {
      const group = new THREE.Group()

      // Phone body
      const body = new THREE.Mesh(
        new THREE.BoxGeometry(w, h, d),
        new THREE.MeshStandardMaterial({
          color: "#222222",
          metalness: 0.8,
          roughness: 0.2,
        }),
      )
      group.add(body)

      // Screen
      const screen = new THREE.Mesh(
        new THREE.BoxGeometry(w * 0.9, h * 0.85, d * 1.1),
        new THREE.MeshStandardMaterial({
          color: "#ff00ff",
          emissive: "#ff00ff",
          emissiveIntensity: 0.5,
        }),
      )
      screen.position.set(0, 0.1, 0.01)
      group.add(screen)

      // Home button
      const button = new THREE.Mesh(
        new THREE.CircleGeometry(0.05, 16),
        new THREE.MeshStandardMaterial({ color: "#444444" }),
      )
      button.position.set(0, -h * 0.38, 0.01)
      button.rotation.set(0, 0, 0)
      group.add(button)

      return group
    },
  },
  {
    name: "cube",
    geometry: (size = 1.5) => {
      const group = new THREE.Group()

      // Main cube
      const cube = new THREE.Mesh(
        new THREE.BoxGeometry(size, size, size),
        new THREE.MeshStandardMaterial({
          color: "#aa00ff",
          metalness: 0.7,
          roughness: 0.3,
        }),
      )
      group.add(cube)

      // Glowing edges
      const edges = new THREE.LineSegments(
        new THREE.EdgesGeometry(new THREE.BoxGeometry(size * 1.01, size * 1.01, size * 1.01)),
        new THREE.LineBasicMaterial({ color: "#aa00ff" }),
      )
      group.add(edges)

      // Inner cube (data visualization)
      const innerCube = new THREE.Mesh(
        new THREE.BoxGeometry(size * 0.5, size * 0.5, size * 0.5),
        new THREE.MeshStandardMaterial({
          color: "#aa00ff",
          emissive: "#aa00ff",
          emissiveIntensity: 0.8,
          wireframe: true,
        }),
      )
      group.add(innerCube)

      return group
    },
  },
  {
    name: "sphere",
    geometry: (radius = 1.2) => {
      const group = new THREE.Group()

      // Main sphere
      const sphere = new THREE.Mesh(
        new THREE.SphereGeometry(radius, 32, 32),
        new THREE.MeshStandardMaterial({
          color: "#ff00aa",
          metalness: 0.8,
          roughness: 0.2,
        }),
      )
      group.add(sphere)

      // Neural network visualization (nodes and connections)
      const nodeCount = 15
      const nodes = []

      for (let i = 0; i < nodeCount; i++) {
        const phi = Math.acos(-1 + (2 * i) / nodeCount)
        const theta = Math.sqrt(nodeCount * Math.PI) * phi

        const node = new THREE.Mesh(
          new THREE.SphereGeometry(0.05, 16, 16),
          new THREE.MeshStandardMaterial({
            color: "#ff00aa",
            emissive: "#ff00aa",
            emissiveIntensity: 1,
          }),
        )

        node.position.set(
          radius * 0.7 * Math.sin(phi) * Math.cos(theta),
          radius * 0.7 * Math.sin(phi) * Math.sin(theta),
          radius * 0.7 * Math.cos(phi),
        )

        group.add(node)
        nodes.push(node.position)
      }

      // Add connections between nodes
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          if (Math.random() > 0.8) continue // Only connect some nodes

          const points = [nodes[i], nodes[j]]
          const geometry = new THREE.BufferGeometry().setFromPoints(points)

          const line = new THREE.Line(
            geometry,
            new THREE.LineBasicMaterial({
              color: "#ff00aa",
              transparent: true,
              opacity: 0.3,
            }),
          )

          group.add(line)
        }
      }

      return group
    },
  },
]

function ProjectDevices({ activeProject }: ProjectsAnimationProps) {
  const deviceRefs = useRef<THREE.Group[]>([])
  const containerRef = useRef<THREE.Group>(null)
  const scroll = useScroll()
  const { playSound } = useSoundContext()
  const [devicePositions, setDevicePositions] = useState<THREE.Vector3[]>([])
  const [deviceRotations, setDeviceRotations] = useState<THREE.Euler[]>([])
  const [containerPositionY, setContainerPositionY] = useState(0)
  const [containerRotationY, setContainerRotationY] = useState(0)

  // Create device meshes
  const devices = useMemo(() => {
    return deviceTypes.map((type, index) => ({
      type,
      mesh: type.geometry(),
      position: new THREE.Vector3(0, 0, -5), // Initial hidden position
      targetPosition: new THREE.Vector3(0, 0, 0),
      rotation: new THREE.Euler(0, 0, 0),
    }))
  }, [])

  // Initialize device positions
  useEffect(() => {
    const positions = devices.map(() => new THREE.Vector3(0, 0, -5))
    const rotations = devices.map(() => new THREE.Euler(0, 0, 0))

    setDevicePositions(positions)
    setDeviceRotations(rotations)
  }, [devices])

  // Update on active project change
  useEffect(() => {
    if (typeof window === "undefined") return
    if (devicePositions.length === 0) return

    // Play transformation sound
    playSound("transform")

    // Update positions - hide all devices except active one
    const newPositions = [...devicePositions]

    devices.forEach((_, i) => {
      if (i === activeProject) {
        // Show active device - use a regular JS object for GSAP animation
        const obj = { x: newPositions[i].x, y: newPositions[i].y, z: newPositions[i].z }
        gsap.to(obj, {
          x: 0,
          y: 0,
          z: 0,
          duration: 0.8,
          ease: "elastic.out(1, 0.5)",
          onUpdate: () => {
            newPositions[i] = new THREE.Vector3(obj.x, obj.y, obj.z)
            setDevicePositions([...newPositions])
          },
        })
      } else {
        // Hide inactive devices
        const obj = { x: newPositions[i].x, y: newPositions[i].y, z: newPositions[i].z }
        gsap.to(obj, {
          x: 0,
          y: 0,
          z: -5,
          duration: 0.5,
          ease: "power3.out",
          onUpdate: () => {
            newPositions[i] = new THREE.Vector3(obj.x, obj.y, obj.z)
            setDevicePositions([...newPositions])
          },
        })
      }
    })

    // Special rotation animation for active device
    const newRotations = [...deviceRotations]
    const activeRotation = newRotations[activeProject]

    if (activeRotation) {
      // Use a regular JS object for GSAP animation
      const obj = { y: activeRotation.y || 0 }
      gsap.to(obj, {
        y: Math.PI * 4,
        duration: 1.5,
        ease: "power2.out",
        onUpdate: () => {
          newRotations[activeProject] = new THREE.Euler(activeRotation.x, obj.y, activeRotation.z)
          setDeviceRotations([...newRotations])
        },
      })
    }
  }, [activeProject, playSound, devicePositions, deviceRotations, devices])

  // Frame animation
  useFrame(({ clock }) => {
    if (!containerRef.current) return

    const time = clock.getElapsedTime()
    // Get scroll progress with safety check
    const scrollProgress = scroll?.offset ?? 0

    // Floating animation for container
    setContainerPositionY(Math.sin(time * 0.5) * 0.2)

    // Rotate container based on scroll
    setContainerRotationY(scrollProgress * Math.PI * 2)

    // Apply state values to Three.js objects
    if (containerRef.current) {
      containerRef.current.position.y = containerPositionY
      containerRef.current.rotation.y = containerRotationY
    }

    // Apply positions and rotations to device refs
    deviceRefs.current.forEach((device, i) => {
      if (!device) return

      // Apply position and rotation from state
      if (devicePositions[i]) {
        device.position.copy(devicePositions[i])
      }

      if (deviceRotations[i]) {
        device.rotation.copy(deviceRotations[i])
      }

      // Custom animations for each device type
      if (i === activeProject) {
        if (i === 0) {
          // Laptop screen opening/closing animation
          const child = device.children[0]
          if (child) {
            child.rotation.x = Math.sin(time) * 0.1
          }
        } else if (i === 2) {
          // Cube inner rotation
          const innerCube = device.children[2]
          if (innerCube) {
            innerCube.rotation.y += 0.01
            innerCube.rotation.x += 0.01
          }
        } else if (i === 3) {
          // Sphere neural network pulsing
          for (let j = 1; j < device.children.length; j++) {
            const child = device.children[j]
            if (child.type === "Mesh") {
              // Pulse the nodes
              const scale = 0.8 + 0.4 * Math.sin(time * 3 + j)
              child.scale.set(scale, scale, scale)
            } else if (child.type === "Line") {
              // Pulse the connections opacity
              const material = (child as THREE.Line).material as THREE.LineBasicMaterial
              material.opacity = 0.1 + 0.2 * Math.sin(time * 2 + j)
            }
          }
        }
      }
    })
  })

  return (
    <group ref={containerRef} position={[0, containerPositionY, 0]} rotation={[0, containerRotationY, 0]}>
      {devices.map((device, index) => (
        <group
          key={index}
          ref={(el) => {
            if (el) deviceRefs.current[index] = el
          }}
          position={devicePositions[index] || new THREE.Vector3(0, 0, -5)}
          rotation={deviceRotations[index] || new THREE.Euler(0, 0, 0)}
        >
          <primitive object={device.mesh} />
        </group>
      ))}
    </group>
  )
}

export default function CanvasProjectsAnimation({ activeProject }: ProjectsAnimationProps) {
  return (
    <Canvas className="h-full w-full">
      <ambientLight intensity={0.3} />
      <spotLight position={[5, 5, 5]} intensity={0.5} />
      <spotLight position={[-5, -5, 5]} intensity={0.3} color="#ff00ff" />
      <ProjectDevices activeProject={activeProject} />
      <Environment preset="night" />
      <EffectComposer>
        <Bloom luminanceThreshold={0.2} luminanceSmoothing={0.9} intensity={0.8} />
        <ChromaticAberration
          offset={[0.001, 0.001]}
          radialModulation={false}
          modulationOffset={0}
          blendFunction={BlendFunction.NORMAL}
        />
      </EffectComposer>
    </Canvas>
  )
}

