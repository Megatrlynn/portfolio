import { motion } from 'framer-motion';
import { FiArrowRight, FiGithub, FiLinkedin, FiMail } from 'react-icons/fi';
import { useInView } from '../hooks/useInView';
import { useReducedMotion } from '../hooks/useReducedMotion';

const Hero = () => {
  const { ref: heroRef, inView: heroInView } = useInView({ threshold: 0.3, triggerOnce: false });
  const prefersReduced = useReducedMotion();
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.8 },
    },
  };

  const badgeVariants = {
    hidden: { opacity: 0, scale: 0.8, x: -20 },
    visible: (i: number) => ({
      opacity: 1,
      scale: 1,
      x: 0,
      transition: {
        delay: 0.5 + i * 0.1,
        duration: 0.6,
      },
    }),
  };

  return (
    <header id="home" className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20" role="banner" ref={heroRef}>
      {/* Animated Background */}
      <div className="absolute inset-0 bg-linear-to-br from-white via-blue-50/30 to-purple-50/30 dark:from-gray-950 dark:via-blue-950/20 dark:to-purple-950/20 z-0" aria-hidden="true"></div>

      {/* Animated Gradient Orbs */}
      <motion.div
        className="absolute top-20 -left-40 w-80 h-80 bg-linear-to-br from-blue-400/30 to-purple-400/30 rounded-full blur-3xl dark:from-blue-600/20 dark:to-purple-600/20"
        animate={!prefersReduced && heroInView ? {
          x: [0, 50, 0],
          y: [0, 40, 0],
        } : { x: 0, y: 0 }}
        transition={!prefersReduced && heroInView ? {
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        } : { duration: 0 }}
        aria-hidden="true"
      ></motion.div>

      <motion.div
        className="absolute bottom-20 -right-40 w-80 h-80 bg-linear-to-br from-purple-400/30 to-pink-400/30 rounded-full blur-3xl dark:from-purple-600/20 dark:to-pink-600/20"
        animate={!prefersReduced && heroInView ? {
          x: [0, -50, 0],
          y: [0, -40, 0],
        } : { x: 0, y: 0 }}
        transition={!prefersReduced && heroInView ? {
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        } : { duration: 0 }}
        aria-hidden="true"
      ></motion.div>

      {/* Main Content */}
      <motion.div
        className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Badge */}
        <motion.div
          variants={itemVariants}
          className="mb-8 flex justify-center"
        >
          <motion.div
            className="inline-flex items-center px-4 py-2 rounded-full bg-linear-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 border border-blue-300/30 dark:border-blue-600/30 backdrop-blur-md"
            whileHover={{ scale: 1.05 }}
          >
            <span className="text-sm font-medium bg-linear-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
              🔥 Welcome to TitanForge [My Personal Portfolio]
            </span>
          </motion.div>
        </motion.div>

        {/* Main Title */}
        <motion.div
          variants={itemVariants}
          className="mb-6"
        >
          <div className="overflow-hidden">
            <motion.h1
              className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tight mb-4"
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <span className="block bg-linear-to-r from-gray-900 via-blue-600 to-purple-600 dark:from-white dark:via-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                Hi, I'm Raymond IGABINEZA
              </span>
            </motion.h1>
            <p className="sr-only">Raymond IGABINEZA - Full Stack Developer, Embedded Systems Engineer, and IoT Specialist</p>
          </div>

          {/* Animated Underline */}
          <motion.div
            className="h-1 bg-linear-to-r from-blue-600 via-purple-600 to-pink-600 mx-auto rounded-full"
            initial={{ width: 0 }}
            animate={{ width: 120 }}
            transition={{ duration: 0.8, delay: 0.6 }}
          ></motion.div>
        </motion.div>

        {/* Subtitle */}
        <motion.p
          variants={itemVariants}
          className="text-xl md:text-2xl lg:text-3xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed max-w-2xl mx-auto"
        >
          Forging Software, Hardware, and Intelligence with{' '}
          <span className="font-semibold bg-linear-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
            Full-Stack Development, Embedded Systems, AI, Networking, and IoT.
          </span>
        </motion.p>

        {/* Tech Stack Badges */}
        <motion.div
          className="flex flex-wrap justify-center gap-3 mb-12"
          initial="hidden"
          animate="visible"
          variants={{
            visible: {
              transition: {
                staggerChildren: 0.1,
              },
            },
          }}
        >
          {['React', 'JavaScript', 'TypeScript', 'Embedded Systems', 'Python', 'C++', 'Java', 'Node.js'].map((tech, i) => (
            <motion.div
              key={tech}
              custom={i}
              variants={badgeVariants}
              whileHover={{ scale: 1.1, y: -5 }}
              className="px-4 py-2 rounded-lg bg-linear-to-r from-blue-500/20 to-purple-500/20 dark:from-blue-600/30 dark:to-purple-600/30 border border-blue-400/30 dark:border-blue-500/30 text-sm font-medium text-gray-700 dark:text-gray-200 backdrop-blur-sm"
            >
              {tech}
            </motion.div>
          ))}
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col sm:flex-row gap-4 justify-center mb-12"
        >
          {/* Primary Button */}
          <motion.a
            href="#projects"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-xl hover:shadow-2xl transition-all duration-300 group"
          >
            View My Work
            <motion.div
              animate={!prefersReduced && heroInView ? { x: [0, 5, 0] } : { x: 0 }}
              transition={!prefersReduced && heroInView ? { duration: 1.5, repeat: Infinity } : { duration: 0 }}
            >
              <FiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </motion.div>
          </motion.a>

          {/* Secondary Button */}
          <motion.a
            href="#contact"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="inline-flex items-center justify-center gap-2 px-8 py-4 border-2 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white font-semibold rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300"
          >
            Get in Touch
            <FiMail className="w-5 h-5" />
          </motion.a>
        </motion.div>

        {/* Social Links */}
        <motion.div
          variants={itemVariants}
          className="flex justify-center gap-6 mb-16"
        >
          {[
            { icon: FiGithub, label: 'GitHub', href: 'https://github.com/Megatrlynn' },
            { icon: FiLinkedin, label: 'LinkedIn', href: 'https://www.linkedin.com/in/raymond-igabineza-7564a9187/' },
            { icon: FiMail, label: 'Email', href: 'https://mail.google.com/mail/?view=cm&fs=1&to=lynnslyna@gmail.com' },
          ].map((social, i) => (
            <motion.a
              key={social.label}
              href={social.href}
              target="_blank"
              rel="noopener noreferrer"
              className="p-3 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-300"
              whileHover={{ scale: 1.15, rotate: 10 }}
              whileTap={{ scale: 0.9 }}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.7 + i * 0.1 }}
            >
              <social.icon className="w-6 h-6" />
            </motion.a>
          ))}
        </motion.div>
      </motion.div>

      {/* Scroll Indicator */}
      <motion.div
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-10"
        animate={!prefersReduced && heroInView ? {
          y: [0, 8, 0],
        } : { y: 0 }}
        transition={!prefersReduced && heroInView ? {
          duration: 1.5,
          repeat: Infinity,
        } : { duration: 0 }}
      >
        <motion.div
          className="flex flex-col items-center gap-2"
          whileHover={{ scale: 1.2 }}
        >
          <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-widest">
            Scroll to explore
          </p>
          <svg
            className="w-6 h-6 text-gray-400 dark:text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </motion.div>
      </motion.div>
    </header>
  );
};

export default Hero;