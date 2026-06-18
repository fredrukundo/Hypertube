"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, useScroll, useTransform, useInView } from "framer-motion";
import { Film, Shield, Globe, Zap, Play, Star, ChevronDown } from "lucide-react";
import { LANDING_MOVIES } from "@/lib/landingMovies";
import Image from "next/image";

// Animation variants
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, delay, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number]},
  }),
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: (delay = 0) => ({
    opacity: 1,
    transition: { duration: 0.6, delay },
  }),
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: (delay = 0) => ({
    opacity: 1,
    scale: 1,
    transition: { duration: 0.6, delay, ease: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number]},
  }),
};

// Animated section wrapper
function AnimatedSection({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div
      ref={ref}
      variants={fadeUp}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      custom={delay}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// Floating movie card
function FloatingCard({
  movie,
  index,
}: {
  movie: (typeof LANDING_MOVIES)[0];
  index: number;
}) {
  const delays = [0, 0.1, 0.2, 0.15, 0.05, 0.25];

  return (
    <motion.div
      variants={scaleIn}
      initial="hidden"
      animate="visible"
      custom={delays[index] ?? 0}
      whileHover={{ y: -8, scale: 1.03 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="group cursor-pointer"
    >
      <Link href="/register">
        <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/10">
          <div className="aspect-[2/3] bg-[#1A4A6B] relative overflow-hidden">
            {movie.coverImage && movie.coverImage.trim() !== "" && (
              <img
                src={movie.coverImage}
                alt={movie.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
            )}

            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

            {/* Rating */}
            {movie.rating && (
              <div className="absolute top-3 right-3 flex items-center gap-1 bg-black/60 backdrop-blur-sm text-yellow-400 text-xs font-bold px-2.5 py-1 rounded-full border border-yellow-400/30">
                <Star size={10} fill="currentColor" />
                {movie.rating.toFixed(1)}
              </div>
            )}

            {/* Play button on hover */}
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300">
              <motion.div
                initial={{ scale: 0 }}
                whileHover={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                className="w-14 h-14 bg-[#2872A1]/90 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/30 shadow-xl"
              >
                <Play size={20} className="text-white ml-1" fill="white" />
              </motion.div>
            </div>

            {/* Bottom info */}
            <div className="absolute bottom-0 left-0 right-0 p-3">
              <p className="text-white text-xs font-bold line-clamp-1">
                {movie.title}
              </p>
              <p className="text-white/60 text-xs">{movie.year}</p>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}

// Feature card
function FeatureCard({
  icon: Icon,
  title,
  description,
  index,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  index: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-50px" });

  return (
    <motion.div
      ref={ref}
      variants={fadeUp}
      initial="hidden"
      animate={isInView ? "visible" : "hidden"}
      custom={index * 0.1}
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className="group relative bg-card/50 backdrop-blur-sm border border-border rounded-3xl p-7 overflow-hidden cursor-default"
    >
      {/* Hover glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#2872A1]/0 to-[#2872A1]/0 group-hover:from-[#2872A1]/5 group-hover:to-[#CBDDE9]/10 transition-all duration-500 rounded-3xl" />

      {/* Icon */}
      <div className="relative w-14 h-14 mb-5">
        <div className="absolute inset-0 bg-[#2872A1]/20 rounded-2xl blur-md group-hover:bg-[#2872A1]/40 transition-all duration-300" />
        <div className="relative w-14 h-14 bg-gradient-to-br from-[#2872A1] to-[#4A90B8] rounded-2xl flex items-center justify-center shadow-lg">
          <Icon size={24} className="text-white" />
        </div>
      </div>

      <h3 className="text-lg font-black text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">
        {description}
      </p>

      {/* Bottom accent */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#2872A1]/50 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300" />
    </motion.div>
  );
}

// Scroll indicator
function ScrollIndicator() {
  return (
    <motion.div
      className="flex flex-col items-center gap-2 text-muted-foreground"
      animate={{ y: [0, 8, 0] }}
      transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
    >
      <span className="text-xs font-medium tracking-widest uppercase">
        Scroll
      </span>
      <ChevronDown size={18} />
    </motion.div>
  );
}

// Typewriter effect
function TypeWriter({ words }: { words: string[] }) {
  const [index, setIndex] = useState(0);
  const [subIndex, setSubIndex] = useState(0);
  const [deleting, setDeleting] = useState(false);
  const [blink, setBlink] = useState(true);

  useEffect(() => {
    const blinkTimer = setInterval(() => setBlink((v) => !v), 500);
    return () => clearInterval(blinkTimer);
  }, []);

  useEffect(() => {
    if (subIndex === words[index].length + 1 && !deleting) {
      setTimeout(() => setDeleting(true), 1500);
      return;
    }
    if (subIndex === 0 && deleting) {
      setDeleting(false);
      setIndex((v) => (v + 1) % words.length);
      return;
    }
    const timeout = setTimeout(
      () => setSubIndex((v) => v + (deleting ? -1 : 1)),
      deleting ? 60 : 100
    );
    return () => clearTimeout(timeout);
  }, [subIndex, index, deleting, words]);

  return (
    <span className="text-[#2872A1]">
      {words[index].substring(0, subIndex)}
      <span
        className={`inline-block w-0.5 h-[0.9em] bg-[#2872A1] ml-1 align-middle transition-opacity ${
          blink ? "opacity-100" : "opacity-0"
        }`}
      />
    </span>
  );
}

// Noise texture overlay
function NoiseTexture() {
  return (
    <div
      className="pointer-events-none fixed inset-0 z-[1] opacity-[0.015] dark:opacity-[0.03]"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E")`,
        backgroundRepeat: "repeat",
        backgroundSize: "128px 128px",
      }}
    />
  );
}

// Animated background orbs
function BackgroundOrbs() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
      <motion.div
        className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(40,114,161,0.15) 0%, transparent 70%)",
        }}
        animate={{
          scale: [1, 1.2, 1],
          x: [0, 30, 0],
          y: [0, -20, 0],
        }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(203,221,233,0.2) 0%, transparent 70%)",
        }}
        animate={{
          scale: [1, 1.15, 1],
          x: [0, -20, 0],
          y: [0, 30, 0],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
      />
      <motion.div
        className="absolute top-[40%] left-[30%] w-[300px] h-[300px] rounded-full"
        style={{
          background:
            "radial-gradient(circle, rgba(74,144,184,0.1) 0%, transparent 70%)",
        }}
        animate={{
          scale: [1, 1.3, 1],
          x: [0, 40, 0],
          y: [0, -30, 0],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 4,
        }}
      />
    </div>
  );
}

// Main Landing Page
export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const { scrollYProgress } = useScroll();
  const heroOpacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 0.3], [0, -60]);

  const topMovies = [...LANDING_MOVIES]
    .filter((m) => m.coverImage && m.coverImage.trim() !== "")
    .sort((a, b) => (b.rating ?? 0) - (a.rating ?? 0))
    .slice(0, 6);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-background relative">
      <NoiseTexture />
      <BackgroundOrbs />

      {/* Progress bar  */}
      <motion.div
        className="fixed top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#2872A1] via-[#4A90B8] to-[#CBDDE9] z-[100] origin-left"
        style={{ scaleX: scrollYProgress }}
      />

      {/* 
          NAVBAR
       */}
      <motion.header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-background/80 backdrop-blur-xl border-b border-border/50 shadow-lg shadow-black/5"
            : "bg-transparent"
        }`}
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <motion.div
            className="flex items-center gap-2.5"
            whileHover={{ scale: 1.03 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <div className="w-8 h-8 bg-gradient-to-br from-[#2872A1] to-[#4A90B8] rounded-lg flex items-center justify-center shadow-lg">
            
                          <Image
                              src="/favicon_hyper.png"
                              alt="Hypertube"
                              width={60}
                              height={60}
                              className="object-contain h-10 w-auto"
                              priority
                          
                          />
            </div>
            <span className="text-xl font-black text-foreground tracking-tight">
              Hypertube
            </span>
          </motion.div>

          {/* Nav links */}
          <nav className="hidden md:flex items-center gap-8">
            {["Features", "Movies", "About"].map((item) => (
              <motion.a
                key={item}
                href={`#${item.toLowerCase()}`}
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                whileHover={{ y: -1 }}
              >
                {item}
              </motion.a>
            ))}
          </nav>

          {/* Auth buttons */}
          <div className="flex items-center gap-3">
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link
                href="/login"
                className="text-sm font-semibold text-foreground hover:text-[#2872A1] transition-colors px-4 py-2"
              >
                Sign In
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <Link
                href="/register"
                className="relative overflow-hidden bg-[#2872A1] text-white text-sm font-bold px-5 py-2.5 rounded-xl shadow-lg shadow-[#2872A1]/30 group"
              >
                <span className="relative z-10">Get Started</span>
              </Link>
            </motion.div>
          </div>
        </div>
      </motion.header>

      {/*
          HERO SECTION
       */}
      <motion.section
        className="relative min-h-screen flex flex-col items-center justify-center px-4 pt-16 overflow-hidden"
        style={{ opacity: heroOpacity, y: heroY }}
      >
        {/* Grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03] dark:opacity-[0.06]"
          style={{
            backgroundImage: `linear-gradient(rgba(40,114,161,1) 1px, transparent 1px),
                             linear-gradient(90deg, rgba(40,114,161,1) 1px, transparent 1px)`,
            backgroundSize: "60px 60px",
          }}
        />

        <div className="relative z-10 max-w-5xl mx-auto text-center">

          {/* Badge */}
          <motion.div
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            custom={0.2}
            className="inline-flex items-center gap-2.5 bg-[#2872A1]/10 dark:bg-[#2872A1]/20 border border-[#2872A1]/30 backdrop-blur-sm text-[#2872A1] text-xs font-bold px-5 py-2.5 rounded-full mb-10 shadow-lg shadow-[#2872A1]/10"
          >
            <motion.span
              className="w-2 h-2 bg-[#2872A1] rounded-full"
              animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            Free & Legal Streaming Platform
            <span className="bg-[#2872A1] text-white text-[10px] px-2 py-0.5 rounded-full font-black">
              NEW
            </span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={0.3}
            className="text-6xl sm:text-7xl lg:text-8xl font-black leading-[0.95] tracking-tight mb-6"
          >
            <span className="text-foreground">Watch</span>
            <br />
            <TypeWriter
              words={["Movies Free.", "Without Limits.", "Legally Now.", "In HD Quality."]}
            />
          </motion.h1>

          {/* Subheading */}
          <motion.p
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={0.5}
            className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-12 leading-relaxed"
          >
            Stream thousands of free, legal movies directly in your browser.
            Powered by BitTorrent technology.{" "}
            <span className="text-foreground font-semibold">
              No subscription. No ads.
            </span>
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            custom={0.6}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20"
          >
            <motion.div
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
            >
              <Link
                href="/register"
                className="relative group flex items-center gap-3 bg-[#2872A1] text-white font-black text-base px-8 py-4 rounded-2xl shadow-2xl shadow-[#2872A1]/40 overflow-hidden"
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-[#1A4A6B] to-[#4A90B8]"
                  initial={{ x: "100%", opacity: 0 }}
                  whileHover={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.4 }}
                />
                <Play size={18} className="relative z-10" fill="white" />
                <span className="relative z-10">Start Watching Free</span>
                <motion.span
                  className="relative z-10"
                  animate={{ x: [0, 4, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                >
                  →
                </motion.span>
              </Link>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.03, y: -2 }}
              whileTap={{ scale: 0.97 }}
            >
              <Link
                href="/login"
                className="flex items-center gap-2 border-2 border-border hover:border-[#2872A1] text-foreground font-bold text-base px-8 py-4 rounded-2xl backdrop-blur-sm bg-card/50 transition-all duration-300 hover:shadow-xl hover:shadow-[#2872A1]/10"
              >
                Sign In
              </Link>
            </motion.div>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            variants={fadeIn}
            initial="hidden"
            animate="visible"
            custom={1}
          >
            <ScrollIndicator />
          </motion.div>
        </div>
      </motion.section>

      {/* 
          MOVIES PREVIEW
       */}
      <section
        id="movies"
        className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28"
      >
        <AnimatedSection className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-[#2872A1]/10 border border-[#2872A1]/20 text-[#2872A1] text-xs font-bold px-4 py-2 rounded-full mb-6">
            <Film size={12} />
            Now Streaming
          </div>
          <h2 className="text-4xl sm:text-5xl font-black text-foreground mb-4 leading-tight">
            Popular Right Now
          </h2>
          <p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Top rated free movies available to stream instantly
          </p>
        </AnimatedSection>

        {/* Movie grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 lg:gap-5 mb-12">
          {topMovies.map((movie, index) => (
            <FloatingCard key={movie.id} movie={movie} index={index} />
          ))}
        </div>

        {/* View all CTA */}
        <AnimatedSection className="text-center" delay={0.3}>
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
            <Link
              href="/register"
              className="inline-flex items-center gap-2 border-2 border-[#2872A1]/30 hover:border-[#2872A1] text-[#2872A1] font-bold px-8 py-3.5 rounded-2xl transition-all duration-300 hover:bg-[#2872A1]/5 hover:shadow-xl hover:shadow-[#2872A1]/10"
            >
              View Full Library →
            </Link>
          </motion.div>
        </AnimatedSection>
      </section>

      {/* 
          FEATURES
       */}
      <section
        id="features"
        className="relative z-10 py-28 overflow-hidden"
      >
        {/* Background */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#2872A1]/3 to-transparent pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AnimatedSection className="text-center mb-16">
            <div className="inline-flex items-center gap-2 bg-[#2872A1]/10 border border-[#2872A1]/20 text-[#2872A1] text-xs font-bold px-4 py-2 rounded-full mb-6">
              <Zap size={12} />
              Why Choose Us
            </div>
            <h2 className="text-4xl sm:text-5xl font-black text-foreground mb-4 leading-tight">
              Built Different
            </h2>
            <p className="text-muted-foreground text-lg max-w-xl mx-auto">
              A streaming experience designed for the modern web
            </p>
          </AnimatedSection>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              {
                icon: Film,
                title: "Massive Library",
                description:
                  "Access thousands of royalty-free and legally distributable movies sourced from multiple providers worldwide.",
              },
              {
                icon: Zap,
                title: "Instant Streaming",
                description:
                  "Videos start playing as soon as enough data downloads. No waiting — just instant entertainment.",
              },
              {
                icon: Shield,
                title: "100% Legal",
                description:
                  "Every movie on our platform is royalty-free or openly licensed. Stream with complete peace of mind.",
              },
              {
                icon: Globe,
                title: "Multi-language",
                description:
                  "Full support for English and French with subtitles available for most movies in our library.",
              },
            ].map((feature, index) => (
              <FeatureCard key={feature.title} {...feature} index={index} />
            ))}
          </div>
        </div>
      </section>

      
         {/* FOOTER */}
      <footer className="relative z-10 border-t border-border/50 bg-card/30 backdrop-blur-sm mt-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">

            {/* Logo */}
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 bg-gradient-to-br from-[#2872A1] to-[#4A90B8] rounded-lg flex items-center justify-center">
                                          <Image
                              src="/favicon_hyper.png"
                              alt="Hypertube"
                              width={60}
                              height={60}
                              className="object-contain h-10 w-auto"
                              priority
                          
                          />
              </div>
              <span className="font-black text-foreground">Hypertube</span>
            </div>

            {/* Legal note */}
            <p className="text-xs text-muted-foreground text-center max-w-sm">
              Only royalty-free and legally distributable content is used.
              <br />© {new Date().getFullYear()} Hypertube. All rights reserved.
            </p>

            {/* Links */}
            <div className="flex items-center gap-6">
              {[
                { href: "/login", label: "Sign In" },
                { href: "/register", label: "Register" },
              ].map(({ href, label }) => (
                <motion.div
                  key={href}
                  whileHover={{ y: -1 }}
                >
                  <Link
                    href={href}
                    className="text-xs text-muted-foreground hover:text-[#2872A1] transition-colors font-medium"
                  >
                    {label}
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}