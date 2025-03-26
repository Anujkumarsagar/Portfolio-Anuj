"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Menu, X } from "lucide-react"
import gsap from "gsap"
import { ScrollToPlugin } from "gsap/ScrollToPlugin"
import { useSoundContext } from "@/context/sound-context"

// Register GSAP plugins
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollToPlugin)
}

const menuItems = [
  { name: "Home", href: "#home" },
  { name: "About", href: "#about" },
  { name: "Skills", href: "#skills" },
  { name: "Projects", href: "#projects" },
  { name: "Experience", href: "#experience" },
  { name: "Contact", href: "#contact" },
]

export default function Header() {
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { playSound } = useSoundContext()

  // Handle scroll effects
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50)
    }

    // Only add event listener on client side
    if (typeof window !== "undefined") {
      window.addEventListener("scroll", handleScroll)

      // Initial check
      handleScroll()

      // Cleanup
      return () => window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  // Handle menu item click - smooth scroll with GSAP
  const handleMenuClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault()
    setIsOpen(false)

    if (typeof document !== "undefined" && typeof window !== "undefined") {
      const target = document.querySelector(href)
      if (target) {
        gsap.to(window, {
          duration: 1.5,
          scrollTo: { y: target, offsetY: 80 },
          ease: "power3.inOut",
        })
        playSound("click")
      }
    }
  }

  return (
    <header
      className={`fixed top-0 left-0 w-full z-50 transition-all duration-500 ${
        scrolled ? "py-3 bg-black/80 backdrop-blur-md" : "py-5 bg-transparent"
      }`}
    >
      <div className="container mx-auto px-4 md:px-6 flex items-center justify-between">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <a href="#home" className="text-2xl font-bold text-white relative overflow-hidden group">
            <span className="relative z-10 font-mono tracking-wider">CodeAlchemist</span>
            <span className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-cyan-400 to-fuchsia-600 transform translate-x-[-100%] group-hover:translate-x-0 transition-transform duration-500" />
          </a>
        </motion.div>

        {/* Desktop Menu */}
        <nav className="hidden md:flex space-x-6">
          {menuItems.map((item, index) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <a
                href={item.href}
                onClick={(e) => handleMenuClick(e, item.href)}
                className="text-gray-300 hover:text-white relative group font-medium"
              >
                <span>{item.name}</span>
                <span className="absolute bottom-0 left-0 w-full h-[1px] bg-gradient-to-r from-cyan-400 to-fuchsia-600 transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
              </a>
            </motion.div>
          ))}
        </nav>

        {/* Mobile Menu Toggle */}
        <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="block md:hidden">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-white p-2 rounded-full hover:bg-white/10"
            aria-label="Toggle menu"
          >
            {isOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </motion.div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="md:hidden bg-black/90 backdrop-blur-lg overflow-hidden"
          >
            <div className="container mx-auto px-4 py-4">
              <nav className="flex flex-col space-y-4">
                {menuItems.map((item, index) => (
                  <motion.a
                    key={item.name}
                    href={item.href}
                    onClick={(e) => handleMenuClick(e, item.href)}
                    className="text-gray-300 hover:text-white py-2 text-lg font-medium border-b border-gray-800"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    {item.name}
                  </motion.a>
                ))}
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}

