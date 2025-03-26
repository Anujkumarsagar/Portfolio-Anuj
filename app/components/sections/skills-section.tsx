"use client"

import { useEffect, useRef } from "react"
import { motion } from "framer-motion"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import CanvasSkillsAnimation from "@/components/canvas/skills-animation"
import { useSoundContext } from "@/context/sound-context"

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

  // Setup animations
  useEffect(() => {
    if (!sectionRef.current) return

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

    // Scroll animation for 3D skill reactor
    ScrollTrigger.create({
      trigger: sectionRef.current,
      start: "top bottom",
      end: "bottom top",
      scrub: true,
      onUpdate: (self) => {
        // Update the 3D animation in CanvasSkillsAnimation
        // This is handled via the scroll context in the 3D component
      },
    })

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill())
    }
  }, [playSound])

  return (
    <section ref={sectionRef} id="skills" className="relative min-h-screen py-20 flex items-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <CanvasSkillsAnimation skills={skillsData} />
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto backdrop-blur-sm bg-black/30 p-8 rounded-lg border border-white/10">
          {skillsData.map((skill, index) => (
            <div key={index} className="group">
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
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

