"use client"

import { useEffect, useRef, useMemo, useState, Suspense } from "react"
import { motion, AnimatePresence } from "framer-motion"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import dynamic from 'next/dynamic'
import { useSoundContext } from "@/context/sound-context"

// Dynamically import the 3D animation component
const DynamicCanvasSkillsAnimation = dynamic(() => import('@/components/canvas/skills-animation'), {
  ssr: false,
  loading: () => null,
})

gsap.registerPlugin(ScrollTrigger)

// Define skills data
const skillsData = [
  { name: "JavaScript", level: 95, color: "#F7DF1E" },
  { name: "TypeScript", level: 90, color: "#3178C6" },
  { name: "React", level: 92, color: "#61DAFB" },
  { name: "Three.js", level: 85, color: "#000000" },
  { name: "GSAP", level: 88, color: "#88CE02" },
  { name: "WebGL", level: 80, color: "#990000" },
  { name: "CSS/SCSS", level: 93, color: "#264DE4" },
  { name: "Node.js", level: 85, color: "#339933" },
  { name: "Next.js", level: 87, color: "#000000" },
]

export default function SkillsSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const progressRefs = useRef<(HTMLDivElement | null)[]>([])
  const { playSound } = useSoundContext()
  const [isVisible, setIsVisible] = useState(false)

  // Memoize the skills grid to prevent unnecessary re-renders
  const skillsGrid = useMemo(() => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto backdrop-blur-sm bg-black/30 p-8 rounded-lg border border-white/10">
      {skillsData.map((skill, index) => (
        <motion.div
          key={index}
          className="group"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: index * 0.1 }}
        >
          <div className="flex justify-between mb-1">
            <span className="text-white font-medium">{skill.name}</span>
            <span className="text-gray-300">{skill.level}%</span>
          </div>
          <div className="h-3 bg-gray-700/50 rounded-full overflow-hidden">
            <div
              ref={function(el: HTMLDivElement | null) {
                progressRefs.current[index] = el
              }}
              className="h-full rounded-full transition-all duration-300 group-hover:brightness-125"
              style={{
                width: "0%",
                background: `linear-gradient(90deg, ${skill.color} 0%, ${skill.color}bb 100%)`,
                boxShadow: `0 0 10px ${skill.color}66`,
              }}
            />
          </div>
        </motion.div>
      ))}
    </div>
  ), [])

  // Setup animations
  useEffect(() => {
    if (!sectionRef.current) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      { threshold: 0.1 }
    )

    observer.observe(sectionRef.current)

    // Create timeline for skill bars
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top 70%",
        end: "center center",
        toggleActions: "play none none reverse",
      },
    })

    // Play sound when animation starts
    tl.add(() => playSound("powerUp"))

    // Animate skill progress bars
    progressRefs.current.forEach((el, index) => {
      if (!el) return

      const skillLevel = skillsData[index].level

      tl.fromTo(
        el,
        { width: 0 },
        {
          width: `${skillLevel}%`,
          duration: 1.2,
          ease: "power3.out",
          onStart: () => {
            if (index % 3 === 0) playSound("tick")
          },
        },
        index * 0.1,
      )
    })

    return () => {
      observer.disconnect()
      ScrollTrigger.getAll().forEach((t) => t.kill())
    }
  }, [playSound])

  return (
    <section ref={sectionRef} id="skills" className="relative min-h-screen py-20 flex items-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Suspense fallback={null}>
          <DynamicCanvasSkillsAnimation skills={skillsData} />
        </Suspense>
      </div>

      <div className="container mx-auto px-4 md:px-6 z-10 relative">
        <motion.h2
          className="text-4xl md:text-5xl font-bold text-white text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          viewport={{ once: false, amount: 0.3 }}
        >
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-violet-500">
            Technical Arsenal
          </span>
        </motion.h2>

        <AnimatePresence>
          {isVisible && skillsGrid}
        </AnimatePresence>
      </div>
    </section>
  )
}

