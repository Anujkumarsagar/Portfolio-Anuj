"use client"

import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { ScrollToPlugin } from "gsap/ScrollToPlugin"
import { useWindowSize } from "@/hooks/use-window-size"
import { useSoundContext } from "@/context/sound-context"
import CanvasHeroAnimation from "@/components/canvas/hero-animation"

// Register ScrollTrigger plugin
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, ScrollToPlugin)
}

export default function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)
  const subHeadingRef = useRef<HTMLParagraphElement>(null)
  const buttonRef = useRef<HTMLDivElement>(null)
  const { width, height } = useWindowSize()
  const { playSound } = useSoundContext()
  const [scrollProgress, setScrollProgress] = useState(0)

  // Initialize GSAP animations
  useEffect(() => {
    if (!sectionRef.current || !headingRef.current || !subHeadingRef.current || !buttonRef.current) return

    // Heading text animation
    const chars = gsap.utils.selector(headingRef.current)(".char")

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top center",
        end: "bottom top",
        toggleActions: "play none none reverse",
      },
    })

    // Play sound when animation starts
    tl.add(() => playSound("whoosh"))

    // Animate each character
    tl.from(chars, {
      opacity: 0,
      y: 100,
      rotateX: 90,
      stagger: 0.05,
      duration: 1,
      ease: "back.out(1.7)",
      onStart: () => {
        // Play a subtle sound for each character
        const soundInterval = setInterval(() => playSound("tick"), 50)
        setTimeout(() => clearInterval(soundInterval), 1000)
      },
    })

    // Animate subheading after heading
    tl.from(
      subHeadingRef.current,
      {
        opacity: 0,
        y: 20,
        duration: 0.8,
        ease: "power3.out",
      },
      "-=0.4",
    )

    // Animate button
    tl.from(
      buttonRef.current,
      {
        opacity: 0,
        y: 30,
        duration: 0.8,
        ease: "power3.out",
      },
      "-=0.6",
    )

    // Create a scroll-triggered animation that moves the hero content
    ScrollTrigger.create({
      trigger: sectionRef.current,
      start: "top top",
      end: "bottom top",
      scrub: true,
      onUpdate: (self) => {
        setScrollProgress(self.progress)
      },
    })

    // Cleanup function
    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill())
    }
  }, [width, height, playSound])

  // Apply scroll-based animations
  const headingY = scrollProgress * 150
  const headingOpacity = 1 - scrollProgress
  const subHeadingY = scrollProgress * 100
  const subHeadingOpacity = 1 - scrollProgress
  const buttonY = scrollProgress * 50
  const buttonOpacity = 1 - scrollProgress

  return (
    <section
      ref={sectionRef}
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
    >
      <div className="absolute inset-0 z-0">
        <CanvasHeroAnimation />
      </div>

      <div className="container mx-auto px-4 md:px-6 z-10 relative pt-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1
            ref={headingRef}
            className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight"
            style={{
              transform: `translateY(${headingY}px)`,
              opacity: headingOpacity,
            }}
          >
            {"Code Alchemist".split("").map((char, index) => (
              <span
                key={index}
                className="char inline-block"
                style={{
                  textShadow: "0 0 10px rgba(0, 255, 255, 0.7), 0 0 20px rgba(0, 255, 255, 0.5)",
                }}
              >
                {char === " " ? "\u00A0" : char}
              </span>
            ))}
          </h1>

          <p
            ref={subHeadingRef}
            className="text-xl md:text-2xl text-gray-300 mb-10 max-w-2xl mx-auto"
            style={{
              transform: `translateY(${subHeadingY}px)`,
              opacity: subHeadingOpacity,
              textShadow: "0 0 5px rgba(255, 0, 255, 0.5)",
            }}
          >
            Transforming ideas into extraordinary digital experiences through code and creativity
          </p>

          <div
            ref={buttonRef}
            className="flex justify-center space-x-4"
            style={{
              transform: `translateY(${buttonY}px)`,
              opacity: buttonOpacity,
            }}
          >
            <motion.a
              href="#projects"
              className="px-8 py-3 rounded-full bg-gradient-to-r from-cyan-500 to-fuchsia-500 text-white font-medium text-lg relative overflow-hidden group"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onMouseEnter={() => playSound("hover")}
              onClick={() => playSound("click")}
            >
              <span className="relative z-10">Explore My Work</span>
              <span className="absolute inset-0 bg-gradient-to-r from-fuchsia-600 to-cyan-600 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
            </motion.a>

            <motion.a
              href="#contact"
              className="px-8 py-3 rounded-full border-2 border-white/30 text-white font-medium text-lg relative overflow-hidden group"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onMouseEnter={() => playSound("hover")}
              onClick={() => playSound("click")}
            >
              <span className="relative z-10">Contact Me</span>
              <span className="absolute inset-0 bg-white/10 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
            </motion.a>
          </div>
        </div>
      </div>

      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2, duration: 0.8 }}
        >
          <svg
            width="30"
            height="30"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-white opacity-70"
          >
            <path
              d="M7 13L12 18L17 13"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M7 7L12 12L17 7"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </motion.div>
      </div>
    </section>
  )
}

