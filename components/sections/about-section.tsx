"use client"

import { useEffect, useRef } from "react"
import { motion, useInView } from "framer-motion"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import CanvasAboutAnimation from "@/components/canvas/about-animation"
import { useSoundContext } from "@/context/sound-context"

gsap.registerPlugin(ScrollTrigger)

export default function AboutSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const textRef = useRef<HTMLDivElement>(null)
  const isInView = useInView(sectionRef, { once: false, amount: 0.3 })
  const { playSound } = useSoundContext()

  useEffect(() => {
    if (!sectionRef.current || !textRef.current) return

    // Animate the text panels when scrolling into view
    const textElements = textRef.current.querySelectorAll(".text-panel")

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top 80%",
        end: "bottom 20%",
        toggleActions: "play none none reverse",
      },
    })

    // Play sound when animation starts
    tl.add(() => playSound("sweep"))

    // Animate text panels
    tl.fromTo(
      textElements,
      {
        opacity: 0,
        x: (index) => (index % 2 === 0 ? -100 : 100),
        rotate: (index) => (index % 2 === 0 ? -5 : 5),
      },
      {
        opacity: 1,
        x: 0,
        rotate: 0,
        stagger: 0.2,
        duration: 0.8,
        ease: "power3.out",
        onStart: () => {
          // Play a sound for each panel
          const soundInterval = setInterval(() => playSound("tick"), 200)
          setTimeout(() => clearInterval(soundInterval), 800)
        },
      },
    )

    // Create scroll animation for 3D model
    ScrollTrigger.create({
      trigger: sectionRef.current,
      start: "top bottom",
      end: "bottom top",
      scrub: true,
      onUpdate: (self) => {
        // Can be used to control 3D animations in the CanvasAboutAnimation
      },
    })

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill())
    }
  }, [playSound])

  return (
    <section ref={sectionRef} id="about" className="relative min-h-screen py-20 flex items-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <CanvasAboutAnimation />
      </div>

      <div className="container mx-auto px-4 md:px-6 z-10 relative">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
          <div className="w-full lg:w-1/2">
            <div ref={textRef} className="space-y-6">
              <motion.h2
                className="text-4xl md:text-5xl font-bold text-white mb-6"
                initial={{ opacity: 0, y: 50 }}
                animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 to-fuchsia-600">
                  About Me
                </span>
              </motion.h2>

              <div className="text-panel p-4 bg-black/40 backdrop-blur-sm rounded-lg border-l-4 border-cyan-500 shadow-[0_0_15px_rgba(0,255,255,0.3)]">
                <p className="text-lg text-gray-300">
                  I'm a <span className="text-cyan-400 font-semibold">creative developer</span> who blends technical
                  expertise with artistic vision to craft immersive digital experiences that push the boundaries of
                  what's possible on the web.
                </p>
              </div>

              <div className="text-panel p-4 bg-black/40 backdrop-blur-sm rounded-lg border-l-4 border-fuchsia-500 shadow-[0_0_15px_rgba(255,0,255,0.3)]">
                <p className="text-lg text-gray-300">
                  With a background in{" "}
                  <span className="text-fuchsia-400 font-semibold">both design and development</span>, I create
                  experiences that are not only visually stunning but also technically sophisticated and performant.
                </p>
              </div>

              <div className="text-panel p-4 bg-black/40 backdrop-blur-sm rounded-lg border-l-4 border-violet-500 shadow-[0_0_15px_rgba(138,43,226,0.3)]">
                <p className="text-lg text-gray-300">
                  I'm passionate about <span className="text-violet-400 font-semibold">interactive animations</span>,
                  immersive 3D experiences, and creating digital worlds that captivate and engage users in unexpected
                  ways.
                </p>
              </div>
            </div>
          </div>

          <div className="w-full lg:w-1/2 h-[500px] relative">
            {/* The 3D avatar will be rendered here via CanvasAboutAnimation */}
          </div>
        </div>
      </div>
    </section>
  )
}

