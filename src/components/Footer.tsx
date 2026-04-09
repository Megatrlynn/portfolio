import { motion } from 'framer-motion';
import { FiArrowUp, FiGithub, FiLinkedin, FiTwitter, FiMail } from 'react-icons/fi';
import { useInView } from '../hooks/useInView';
import { useReducedMotion } from '../hooks/useReducedMotion';

const Footer = () => {
  const { ref: footerRef, inView: footerInView } = useInView({ threshold: 0.3, triggerOnce: false });
  const prefersReduced = useReducedMotion();
  
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const socialLinks = [
    { icon: FiGithub, label: 'GitHub', href: 'https://github.com/Megatrlynn', color: 'bg-gray-700' },
    { icon: FiLinkedin, label: 'LinkedIn', href: 'https://www.linkedin.com/in/raymond-igabineza-7564a9187/', color: 'bg-blue-600' },
    { icon: FiTwitter, label: 'Twitter', href: 'https://x.com/megatrlynn', color: 'bg-cyan-500' },
    { icon: FiMail, label: 'Email', href: 'https://mail.google.com/mail/?view=cm&fs=1&to=lynnslyna@gmail.com', color: 'bg-orange-500' },
  ];

  const quickLinks = [
    { label: 'Home', href: '#home' },
    { label: 'About', href: '#about' },
    { label: 'Skills', href: '#skills' },
    { label: 'Projects', href: '#projects' },
    { label: 'Experience', href: '#experience' },
    { label: 'Blog', href: '#blog' },
    { label: 'Contact', href: '#contact' },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6 },
    },
  };

  const socialVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: (i: number) => ({
      opacity: 1,
      scale: 1,
      transition: {
        delay: i * 0.1,
        duration: 0.5,
      },
    }),
  };

  return (
    <footer className="relative py-20 overflow-hidden border-t border-gray-200/50 dark:border-gray-700/50 bg-white dark:bg-gray-950" ref={footerRef}>
      {/* Animated Background Elements */}
      <motion.div
        className="absolute top-0 left-20 w-96 h-96 bg-blue-300/10 rounded-full blur-3xl dark:bg-blue-600/5"
        animate={!prefersReduced && footerInView ? { x: [0, 30, 0], y: [0, -20, 0] } : { x: 0, y: 0 }}
        transition={!prefersReduced && footerInView ? { duration: 10, repeat: Infinity, ease: "easeInOut" } : { duration: 0 }}
        aria-hidden="true"
      ></motion.div>

      <motion.div
        className="absolute bottom-0 right-20 w-96 h-96 bg-purple-300/10 rounded-full blur-3xl dark:bg-purple-600/5"
        animate={!prefersReduced && footerInView ? { x: [0, -30, 0], y: [0, 20, 0] } : { x: 0, y: 0 }}
        transition={!prefersReduced && footerInView ? { duration: 12, repeat: Infinity, ease: "easeInOut" } : { duration: 0 }}
        aria-hidden="true"
      ></motion.div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Footer Content */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {/* Brand Section */}
          <motion.div variants={itemVariants} className="lg:col-span-1">
            <h3 className="text-xl font-black text-blue-600 dark:text-blue-400 mb-3">
              TitanForge
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
              Forging Software, Hardware, and Intelligence through modern engineering and design.
            </p>
          </motion.div>

          {/* Quick Links */}
          <motion.div variants={itemVariants}>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <motion.a
                    href={link.href}
                    whileHover={{ x: 4 }}
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-200 inline-flex items-center gap-2"
                  >
                    <motion.span
                      className="w-1 h-1 bg-blue-600 dark:bg-blue-400 rounded-full"
                      initial={{ scale: 0 }}
                      whileHover={{ scale: 1 }}
                      transition={{ duration: 0.2 }}
                    ></motion.span>
                    {link.label}
                  </motion.a>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Tech Stack */}
          <motion.div variants={itemVariants}>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Built With</h4>
            <ul className="space-y-2">
              {['React', 'TypeScript', 'Tailwind CSS', 'Framer Motion'].map((tech) => (
                <li key={tech}>
                  <motion.span
                    whileHover={{ x: 4 }}
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-200 inline-flex items-center gap-2 cursor-default"
                  >
                    <motion.span
                      className="w-1 h-1 bg-purple-600 dark:bg-purple-400 rounded-full"
                      initial={{ scale: 0 }}
                      whileHover={{ scale: 1 }}
                      transition={{ duration: 0.2 }}
                    ></motion.span>
                    {tech}
                  </motion.span>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Social Links */}
          <motion.div variants={itemVariants}>
            <h4 className="font-semibold text-gray-900 dark:text-white mb-4">Connect</h4>
            <div className="grid grid-cols-2 gap-3">
              {socialLinks.map((social, i) => {
                const Icon = social.icon;
                return (
                  <motion.a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    custom={i}
                    variants={socialVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    title={social.label}
                    className="group relative"
                  >
                    <div
                      className={`w-10 h-10 rounded-lg ${social.color} flex items-center justify-center text-white shadow-md group-hover:shadow-lg transition-all duration-300`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                  </motion.a>
                );
              })}
            </div>
          </motion.div>
        </motion.div>

        {/* Divider */}
        <motion.div
          className="h-px bg-gray-200 dark:bg-gray-700 mb-8"
          initial={{ scaleX: 0 }}
          whileInView={{ scaleX: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        ></motion.div>

        {/* Bottom Section */}
        <motion.div
          className="flex flex-col md:flex-row justify-between items-center gap-6"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {/* Copyright */}
          <motion.p
            variants={itemVariants}
            className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2"
          >
            © {new Date().getFullYear()} Personal Portfolio. Developed by
            <span className="font-semibold text-blue-600 dark:text-blue-400">Raymond IGABINEZA</span>.
            All rights reserved.
          </motion.p>

          {/* Back to Top Button */}
          <motion.button
            variants={itemVariants}
            onClick={scrollToTop}
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            className="group flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium shadow-lg hover:shadow-xl transition-all duration-300"
          >
            Back to Top
            <motion.div
              animate={prefersReduced ? { y: 0 } : { y: [0, -2, 0] }}
              transition={prefersReduced ? { duration: 0 } : { duration: 1.5, repeat: Infinity }}
            >
              <FiArrowUp className="w-4 h-4" />
            </motion.div>
          </motion.button>
        </motion.div>
      </div>
    </footer>
  );
};

export default Footer;