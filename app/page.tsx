"use client"

import { useEffect, useState, Suspense } from "react"
import { AnimatePresence, motion } from "framer-motion"
import dynamic from "next/dynamic"
import Preloader from "@/components/preloader"
import Header from "@/components/header"
import ScrollProgress from "@/components/scroll-progress"
import SoundToggle from "@/components/sound-toggle"
import { useWindowSize } from "@/hooks/use-window-size"
import { useMobile } from "@/hooks/use-mobile"

// Dynamically import heavy components
const MainScene = dynamic(() => import("@/components/main-scene"), {
  ssr: false,
  loading: () => <div className="w-full h-screen bg-black" />
})

const HeroSection = dynamic(() => import("@/components/sections/hero-section"))
const AboutSection = dynamic(() => import("@/components/sections/about-section"))
const SkillsSection = dynamic(() => import("@/components/sections/skills-section"))
const ProjectsSection = dynamic(() => import("@/components/sections/projects-section"))
const ExperienceSection = dynamic(() => import("@/components/sections/experience-section"))
const ContactSection = dynamic(() => import("@/components/sections/contact-section"))

export default function Home() {
  const [loading, setLoading] = useState(true)
  const { width, height } = useWindowSize()
  const isMobile = useMobile()

  useEffect(() => {
    // Reduced loading time and added performance optimization
    const timer = setTimeout(() => {
      setLoading(false)
    }, 2000)

    return () => clearTimeout(timer)
  }, [])

  return (
    <main className="relative bg-black min-h-screen overflow-hidden">
      <AnimatePresence mode="wait">
        {loading ? (
          <motion.div
            key="preloader"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
            className="fixed inset-0 z-50"
          >
            <Preloader />
          </motion.div>
        ) : (
          <motion.div
            key="content"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="relative z-10"
          >
            <Suspense fallback={<div className="w-full h-screen bg-black" />}>
              <MainScene />
            </Suspense>
            <div className="relative z-20">
              <Header />
              <ScrollProgress />
              <SoundToggle />
              <div className="relative" id="smooth-content">
                <Suspense fallback={<div className="h-screen bg-black" />}>
                  <HeroSection />
                </Suspense>
                <Suspense fallback={<div className="h-screen bg-black" />}>
                  <AboutSection />
                </Suspense>
                <Suspense fallback={<div className="h-screen bg-black" />}>
                  <SkillsSection />
                </Suspense>
                <Suspense fallback={<div className="h-screen bg-black" />}>
                  <ProjectsSection />
                </Suspense>
                <Suspense fallback={<div className="h-screen bg-black" />}>
                  <ExperienceSection />
                </Suspense>
                <Suspense fallback={<div className="h-screen bg-black" />}>
                  <ContactSection />
                </Suspense>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  )
}

