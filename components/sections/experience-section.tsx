"use client"

import { useEffect, useRef } from "react"
import { motion } from "framer-motion"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import CanvasExperienceAnimation from "@/components/canvas/experience-animation"
import { useSoundContext } from "@/context/sound-context"

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

// Define experience data
const experiences = [
  {
    id: 1,
    title: "Senior Frontend Developer",
    company: "TechVision Inc.",
    period: "2021 - Present",
    description:
      "Leading the development of immersive web experiences using Three.js and WebGL. Optimized performance for complex 3D animations and implemented cutting-edge UI techniques.",
    color: "#00ffff",
  },
  {
    id: 2,
    title: "Creative Developer",
    company: "InteractiveMinds",
    period: "2019 - 2021",
    description:
      "Created interactive data visualizations and animations for client projects. Specialized in GSAP animations and SVG manipulation for award-winning websites.",
    color: "#ff00ff",
  },
  {
    id: 3,
    title: "Web Developer",
    company: "DigitalCraft Studios",
    period: "2017 - 2019",
    description:
      "Developed responsive websites and progressive web applications. Implemented modern JavaScript frameworks and animation libraries for enhanced user experiences.",
    color: "#aa00ff",
  },
  {
    id: 4,
    title: "Frontend Intern",
    company: "WebPioneer",
    period: "2016 - 2017",
    description:
      "Assisted in building UI components and implementing designs. Learned modern web development practices and contributed to production code bases.",
    color: "#ff00aa",
  },
]

export default function ExperienceSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const timelineRef = useRef<HTMLDivElement>(null)
  const experienceRefs = useRef<(HTMLDivElement | null)[]>([])
  const { playSound } = useSoundContext()

  // Setup animations
  useEffect(() => {
    if (!sectionRef.current || !timelineRef.current) return

    // Create main timeline
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top 70%",
        end: "bottom top",
        toggleActions: "play none none reverse",
      },
    })

    // Play sound when animation starts
    tl.add(() => playSound("swoosh"))

    // Animate timeline line
    tl.fromTo(timelineRef.current, { height: 0 }, { height: "100%", duration: 1.5, ease: "power3.inOut" })

    // Animate each experience card
    experienceRefs.current.forEach((el, index) => {
      if (!el) return

      tl.fromTo(
        el,
        {
          x: index % 2 === 0 ? -50 : 50,
          opacity: 0,
          scale: 0.8,
        },
        {
          x: 0,
          opacity: 1,
          scale: 1,
          duration: 0.7,
          ease: "back.out(1.7)",
          onStart: () => playSound("pop"),
        },
        "-=0.5",
      )
    })

    // Create hover animations for each card - FIX HERE
    experienceRefs.current.forEach((el) => {
      // Check if element exists before adding event listeners
      if (!el) return

      // Use a safer approach with inline event handlers in the JSX instead
      // We'll handle this with Framer Motion in the JSX below
    })

    return () => {
      if (typeof ScrollTrigger !== "undefined") {
        ScrollTrigger.getAll().forEach((t) => t.kill())
      }
    }
  }, [playSound])

  return (
    <section ref={sectionRef} id="experience" className="relative min-h-screen py-20 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <CanvasExperienceAnimation />
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
            Professional Journey
          </span>
        </motion.h2>

        <div className="relative max-w-4xl mx-auto">
          {/* Timeline central line */}
          <div
            className="absolute top-0 bottom-0 left-1/2 w-1 bg-gradient-to-b from-cyan-400 via-fuchsia-500 to-violet-500 transform -translate-x-1/2"
            ref={timelineRef}
          />

          {/* Experience items */}
          <div className="space-y-16 relative">
            {experiences.map((exp, index) => (
              <div key={exp.id} className={`flex ${index % 2 === 0 ? "flex-row" : "flex-row-reverse"}`}>
                <div className="w-1/2" />

                <div
                  className="w-10 h-10 rounded-full bg-black border-4 flex items-center justify-center z-10 relative top-5 mx-4"
                  style={{ borderColor: exp.color }}
                >
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: exp.color }} />
                </div>

                <div className="w-1/2">
                  <motion.div
                    ref={(el) => {experienceRefs.current[index] = el}}
                    className="backdrop-blur-sm bg-black/30 p-6 rounded-lg border border-white/10"
                    style={{
                      boxShadow: `0 0 20px ${exp.color}33`,
                    }}
                    whileHover={{
                      scale: 1.03,
                      y: -5,
                      boxShadow: `0 10px 30px rgba(0, 0, 0, 0.2)`,
                    }}
                    onHoverStart={() => playSound("hover")}
                    transition={{ duration: 0.3 }}
                  >
                    <h3 className="text-xl font-bold mb-1" style={{ color: exp.color }}>
                      {exp.title}
                    </h3>

                    <h4 className="text-white text-lg font-medium mb-1">{exp.company}</h4>

                    <p className="text-gray-400 text-sm mb-4">{exp.period}</p>

                    <p className="text-gray-300">{exp.description}</p>
                  </motion.div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

