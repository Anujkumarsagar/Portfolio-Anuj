"use client"

import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { useForm } from "react-hook-form"
import { Github, Linkedin, Twitter, Send } from "lucide-react"
import CanvasContactAnimation from "@/components/canvas/contact-animation"
import { useSoundContext } from "@/context/sound-context"

gsap.registerPlugin(ScrollTrigger)

export default function ContactSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const formRef = useRef<HTMLFormElement>(null)
  const terminalRef = useRef<HTMLDivElement>(null)
  const cursorRef = useRef<HTMLSpanElement>(null)
  const socialRefs = useRef<(HTMLAnchorElement | null)[]>([])
  const { playSound } = useSoundContext()
  const [formSubmitted, setFormSubmitted] = useState(false)
  const [typedText, setTypedText] = useState("")

  // Form handling
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm()

  const onSubmit = (data: any) => {
    // Simulate form submission
    setFormSubmitted(true)
    playSound("success")

    // Reset form after 3 seconds
    setTimeout(() => {
      setFormSubmitted(false)
    }, 3000)
  }

  // Setup animations
  useEffect(() => {
    if (!sectionRef.current || !terminalRef.current) return

    // Create timeline for terminal animation
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: sectionRef.current,
        start: "top 70%",
        end: "center center",
        toggleActions: "play none none reverse",
      },
    })

    // Text to type in terminal
    const text = "Let's connect and build something amazing together!"
    let currentText = ""

    // Play sound when animation starts
    tl.add(() => playSound("powerUp"))

    // Animate terminal appearing
    tl.fromTo(terminalRef.current, { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" })

    // Typing animation
    tl.to(
      {},
      {
        duration: text.length * 0.05,
        onUpdate: function () {
          const progress = this.progress()
          const charIndex = Math.floor(progress * text.length)
          currentText = text.substring(0, charIndex)
          setTypedText(currentText)

          // Play typing sound occasionally
          if (charIndex % 3 === 0 && charIndex > 0) {
            playSound("tick")
          }
        },
      },
    )

    // Animate form appearing
    tl.fromTo(formRef.current, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.8, ease: "power3.out" })

    // Animate cursor blinking
    if (cursorRef.current) {
      gsap.to(cursorRef.current, {
        opacity: 0,
        ease: "steps(1)",
        repeat: -1,
        yoyo: true,
        duration: 0.5,
      })
    }

    // Animate social icons appearing
    tl.fromTo(
      socialRefs.current,
      {
        opacity: 0,
        y: 20,
        scale: 0.5,
      },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        stagger: 0.1,
        duration: 0.6,
        ease: "back.out(1.7)",
        onStart: () => playSound("pop"),
      },
    )

    return () => {
      ScrollTrigger.getAll().forEach((t) => t.kill())
    }
  }, [playSound])

  return (
    <section ref={sectionRef} id="contact" className="relative min-h-screen py-20 flex items-center overflow-hidden">
      <div className="absolute inset-0 z-0">
        <CanvasContactAnimation formSubmitted={formSubmitted} />
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
            Let's Connect
          </span>
        </motion.h2>

        <div className="max-w-4xl mx-auto">
          <div
            ref={terminalRef}
            className="bg-black/70 backdrop-blur-md p-6 rounded-lg border border-cyan-500 mb-10"
            style={{
              boxShadow: "0 0 30px rgba(0, 255, 255, 0.3)",
            }}
          >
            <div className="flex items-center gap-2 mb-4">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <div className="w-3 h-3 rounded-full bg-yellow-500" />
              <div className="w-3 h-3 rounded-full bg-green-500" />
              <div className="ml-2 text-gray-400 text-sm font-mono">terminal@portfolio ~ </div>
            </div>

            <div className="font-mono text-cyan-400">
              <span className="text-green-400">$</span> echo {typedText}
              <span ref={cursorRef} className="text-white">
                ▋
              </span>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-10">
            <form
              ref={formRef}
              onSubmit={handleSubmit(onSubmit)}
              className="backdrop-blur-sm bg-black/30 p-6 rounded-lg border border-white/10"
            >
              <div className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-gray-300 mb-2">
                    Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    className="w-full px-4 py-2 bg-black/50 border border-gray-700 rounded-md text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                    {...register("name", { required: true })}
                    onFocus={() => playSound("hover")}
                  />
                  {errors.name && <span className="text-red-500 text-sm mt-1">Name is required</span>}
                </div>

                <div>
                  <label htmlFor="email" className="block text-gray-300 mb-2">
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    className="w-full px-4 py-2 bg-black/50 border border-gray-700 rounded-md text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors"
                    {...register("email", { required: true, pattern: /^\S+@\S+$/i })}
                    onFocus={() => playSound("hover")}
                  />
                  {errors.email && <span className="text-red-500 text-sm mt-1">Valid email is required</span>}
                </div>

                <div>
                  <label htmlFor="message" className="block text-gray-300 mb-2">
                    Message
                  </label>
                  <textarea
                    id="message"
                    rows={5}
                    className="w-full px-4 py-2 bg-black/50 border border-gray-700 rounded-md text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-colors resize-none"
                    {...register("message", { required: true })}
                    onFocus={() => playSound("hover")}
                  ></textarea>
                  {errors.message && <span className="text-red-500 text-sm mt-1">Message is required</span>}
                </div>

                <motion.button
                  type="submit"
                  className="w-full px-6 py-3 bg-gradient-to-r from-cyan-500 to-fuchsia-500 text-white font-medium rounded-md flex items-center justify-center group"
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onMouseEnter={() => playSound("hover")}
                  onClick={() => playSound("click")}
                >
                  <Send className="mr-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  Send Message
                </motion.button>
              </div>
            </form>

            <div className="backdrop-blur-sm bg-black/30 p-6 rounded-lg border border-white/10 flex flex-col justify-between">
              <div>
                <h3 className="text-2xl font-bold text-white mb-4">Contact Information</h3>

                <p className="text-gray-300 mb-6">
                  I'm always open to discussing new projects, creative ideas or opportunities to be part of your vision.
                </p>

                <div className="space-y-4 text-gray-200">
                  <div>
                    <span className="font-bold">Email:</span> hello@codealchemist.dev
                  </div>
                  <div>
                    <span className="font-bold">Location:</span> San Francisco, CA
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-xl font-medium text-white mb-4">Find me on</h4>

                <div className="flex space-x-4">
                  <motion.a
                    href="#"
                    ref={(el) => {
                      socialRefs.current[0] = el
                    }}
                    className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center text-white hover:bg-gray-700 transition-colors"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    whileTap={{ scale: 0.9 }}
                    onMouseEnter={() => playSound("hover")}
                    onClick={() => playSound("click")}
                  >
                    <Github />
                  </motion.a>

                  <motion.a
                    href="#"
                    ref={(el) => {
                      socialRefs.current[1] = el
                    }}
                    className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center text-white hover:bg-gray-700 transition-colors"
                    whileHover={{ scale: 1.1, rotate: -5 }}
                    whileTap={{ scale: 0.9 }}
                    onMouseEnter={() => playSound("hover")}
                    onClick={() => playSound("click")}
                  >
                    <Linkedin />
                  </motion.a>

                  <motion.a
                    href="#"
                    ref={(el) => {
                      socialRefs.current[2] = el
                    }}
                    className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center text-white hover:bg-gray-700 transition-colors"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                    whileTap={{ scale: 0.9 }}
                    onMouseEnter={() => playSound("hover")}
                    onClick={() => playSound("click")}
                  >
                    <Twitter />
                  </motion.a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

