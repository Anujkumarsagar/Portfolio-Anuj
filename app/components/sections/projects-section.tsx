"use client"

import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import CanvasProjectsAnimation from "@/components/canvas/projects-animation"
import { useSoundContext } from "@/context/sound-context"

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger)
}

// Define projects data
const projects = [
  {
    id: 1,
    title: "Immersive VR Experience",
    description:
      "A WebGL-powered virtual reality experience with interactive 3D elements and dynamic lighting effects.",
    tech: ["Three.js", "WebGL", "GSAP", "React"],
    image: "/placeholder.svg?height=400&width=600",
    color: "#00ffff",
  },
  {
    id: 2,
    title: "E-Commerce Platform",
    description: "A modern, responsive e-commerce platform with 3D product visualization and real-time updates.",
    tech: ["Next.js", "Three.js", "Framer Motion", "Stripe"],
    image: "/placeholder.svg?height=400&width=600",
    color: "#ff00ff",
  },
  {
    id: 3,
    title: "Interactive Data Visualization",
    description: "Real-time data visualization with animated transitions between datasets and interactive filtering.",
    tech: ["D3.js", "React", "GSAP", "Node.js"],
    image: "/placeholder.svg?height=400&width=600",
    color: "#aa00ff",
  },
  {
    id: 4,
    title: "AI-Powered Web Application",
    description: "A machine learning application with a futuristic UI and real-time processing capabilities.",
    tech: ["TensorFlow.js", "React", "WebGL", "Three.js"],
    image: "/placeholder.svg?height=400&width=600",
    color: "#ff00aa",
  },
]

export default function ProjectsSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const projectRefs = useRef<(HTMLDivElement | null)[]>([])
  const [activeProject, setActiveProject] = useState(0)
  const { playSound } = useSoundContext()

  // Setup animations
  useEffect(() => {
    if (!sectionRef.current) return

    // Create main timeline
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top 60%",
        end: "bottom top",
        toggleActions: "play none none reverse",
      },
    })

    // Play sound when animation starts
    tl.add(() => playSound("transition"))

    // Animate each project card
    projectRefs.current.forEach((el, index) => {
      if (!el) return

      tl.fromTo(
        el,
        {
          y: 100,
          opacity: 0,
          rotateY: -15,
        },
        {
          y: 0,
          opacity: 1,
          rotateY: 0,
          duration: 0.8,
          ease: "power3.out",
          onStart: () => {
            if (index % 2 === 0) playSound("swoosh")
          },
        },
        index * 0.2,
      )
    })

    // Create individual pin sections for each project
    projects.forEach((project, index) => {
      const projectEl = projectRefs.current[index]
      if (!projectEl) return

      ScrollTrigger.create({
        trigger: projectEl,
        start: "top 60%",
        end: "bottom 40%",
        onEnter: () => {
          setActiveProject(index)
          playSound("ping")
        },
        onEnterBack: () => {
          setActiveProject(index)
          playSound("ping")
        },
      })
    })

    return () => {
      if (typeof ScrollTrigger !== "undefined") {
        ScrollTrigger.getAll().forEach((t) => t.kill())
      }
    }
  }, [playSound])

  return (
    <section ref={sectionRef} id="projects" className="relative min-h-screen py-20 overflow-hidden">
      <div className="absolute inset-0 z-0">
        <CanvasProjectsAnimation activeProject={activeProject} />
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
            Featured Projects
          </span>
        </motion.h2>

        <div className="space-y-32">
          {projects.map((project, index) => (
            <div
              key={project.id}
              ref={function(el) {
                projectRefs.current[index] = el
              }}
              className="flex flex-col md:flex-row items-center gap-10 md:gap-16"
            >
              <div className="w-full md:w-1/2 order-2 md:order-none md:odd:order-2">
                <div
                  className="backdrop-blur-sm bg-black/30 p-6 rounded-lg border border-white/10 h-full"
                  style={{
                    boxShadow: `0 0 30px ${project.color}33`,
                  }}
                >
                  <h3 className="text-2xl md:text-3xl font-bold mb-4" style={{ color: project.color }}>
                    {project.title}
                  </h3>

                  <p className="text-gray-300 mb-6">{project.description}</p>

                  <div className="flex flex-wrap gap-2 mb-6">
                    {project.tech.map((tech, i) => (
                      <span
                        key={i}
                        className="px-3 py-1 rounded-full text-sm font-medium"
                        style={{
                          backgroundColor: `${project.color}22`,
                          color: project.color,
                        }}
                      >
                        {tech}
                      </span>
                    ))}
                  </div>

                  <div className="flex space-x-4">
                    <motion.a
                      href="#"
                      className="px-4 py-2 rounded-md bg-white/10 text-white text-sm font-medium hover:bg-white/20 transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onHoverStart={() => playSound("hover")}
                      onClick={() => playSound("click")}
                    >
                      View Project
                    </motion.a>

                    <motion.a
                      href="#"
                      className="px-4 py-2 rounded-md bg-transparent border border-white/30 text-white text-sm font-medium hover:bg-white/10 transition-colors"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onHoverStart={() => playSound("hover")}
                      onClick={() => playSound("click")}
                    >
                      Source Code
                    </motion.a>
                  </div>
                </div>
              </div>

              <div className="w-full md:w-1/2 order-1 md:order-none md:odd:order-1">
                <motion.div
                  className="relative rounded-lg overflow-hidden border border-white/10"
                  style={{
                    boxShadow: `0 0 30px ${project.color}33`,
                  }}
                  whileHover={{
                    scale: 1.02,
                    boxShadow: `0 0 40px ${project.color}66`,
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <img
                    src={project.image || "/placeholder.svg"}
                    alt={project.title}
                    className="w-full h-auto object-cover"
                  />

                  {/* Overlay effect */}
                  <div
                    className="absolute inset-0 opacity-30"
                    style={{
                      background: `linear-gradient(45deg, ${project.color}22, transparent)`,
                    }}
                  />
                </motion.div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

