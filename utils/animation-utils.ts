import type * as THREE from "three"
import gsap from "gsap"

// Safe animation state manager
export interface AnimationState {
  position: {
    x: number
    y: number
    z: number
  }
  rotation: {
    x: number
    y: number
    z: number
  }
  scale: {
    x: number
    y: number
    z: number
  }
}

// Create default animation state
export const createDefaultAnimationState = (): AnimationState => ({
  position: { x: 0, y: 0, z: 0 },
  rotation: { x: 0, y: 0, z: 0 },
  scale: { x: 1, y: 1, z: 1 },
})

// Safely animate values without directly modifying Three.js objects
export const animateValue = (
  target: { [key: string]: any },
  property: string,
  endValue: number,
  duration = 0.5,
  ease = "power2.out",
  onUpdate?: () => void,
) => {
  if (typeof window === "undefined") return

  const obj = { value: target[property] }

  gsap.to(obj, {
    value: endValue,
    duration,
    ease,
    onUpdate: () => {
      target[property] = obj.value
      if (onUpdate) onUpdate()
    },
  })
}

// Apply animation state to a Three.js object
export const applyAnimationState = (object: THREE.Object3D | null, state: AnimationState) => {
  if (!object) return

  // Apply position
  object.position.set(state.position.x, state.position.y, state.position.z)

  // Apply rotation
  object.rotation.set(state.rotation.x, state.rotation.y, state.rotation.z)

  // Apply scale
  object.scale.set(state.scale.x, state.scale.y, state.scale.z)
}

