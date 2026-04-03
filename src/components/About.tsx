import { useState } from 'react';
import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { FiDownload, FiAward, FiCode, FiTarget } from 'react-icons/fi';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';
import { useInView } from '../hooks/useInView';
import { useReducedMotion } from '../hooks/useReducedMotion';

const skills = [
  {
    category: 'Frontend Development',
    items: ['React', 'TypeScript', 'Tailwind CSS', 'Framer Motion', 'Responsive UI Design', 'Vite'],
  },
  {
    category: 'Embedded Systems & IoT',
    items: ['ESP32', 'Raspberry Pi', 'Arduino', 'C/C++', 'Hardware Debugging', 'Sensor Integration'],
  },
  {
    category: 'Backend, AI & Data',
    items: ['Firebase', 'Firestore', 'Python', 'SQL', 'Pandas', 'NumPy', 'Vosk'],
  },
  {
    category: 'Cybersecurity & Networking',
    items: ['Wazuh', 'OpenSSL', 'Network Security', 'Access Control', 'System Hardening', 'Network Admin'],
  },
];

const stats = [
  { label: 'Projects Completed', value: '15+', icon: FiCode },
  { label: 'Technologies', value: '20+', icon: FiAward },
  { label: 'Years Experience', value: '4+', icon: FiTarget },
];

const About = () => {
  const [imageFailed, setImageFailed] = useState(false);
  const [cvUrl, setCvUrl] = useState('/cv.pdf');
  const { ref: aboutRef, inView: aboutInView } = useInView({ threshold: 0.2, triggerOnce: false });
  const prefersReduced = useReducedMotion();

  const profileImageModules = {
    ...import.meta.glob<{ default: string }>('../assets/images/terachad.{png,jpg,jpeg,webp,avif,gif,svg}', { eager: true }),
    ...import.meta.glob<{ default: string }>('../assets/terachad.{png,jpg,jpeg,webp,avif,gif,svg}', { eager: true }),
  };
  const profileImageSrc = Object.values(profileImageModules)[0]?.default ?? null;

  useEffect(() => {
    const unsubscribe = onSnapshot(
      doc(db, 'settings', 'cv'),
      (cvDoc) => {
        if (cvDoc.exists()) {
          const data = cvDoc.data() as { url?: string };
          if (data.url) {
            setCvUrl(data.url);
          }
        }
      },
      (error) => {
        console.error(error);
      }
    );

    return () => unsubscribe();
  }, []);

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
      transition: { duration: 0.8 },
    },
  };

  const skillCardVariants = {
    hidden: { opacity: 0, scale: 0.8, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      scale: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.6,
      },
    }),
    hover: {
      y: -8,
      transition: { duration: 0.3 },
    },
  };

  const statVariants = {
    hidden: { opacity: 0, scale: 0.5 },
    visible: (i: number) => ({
      opacity: 1,
      scale: 1,
      transition: {
        delay: 0.5 + i * 0.15,
        duration: 0.6,
      },
    }),
  };

  return (
    <section id="about" className="relative py-20 md:py-32 overflow-hidden" aria-labelledby="about-heading" ref={aboutRef}>
      {/* Background */}
      <div className="absolute inset-0 bg-linear-to-br from-white via-blue-50/20 to-purple-50/20 dark:from-gray-950 dark:via-blue-950/10 dark:to-purple-950/10" aria-hidden="true"></div>

      {/* Animated Background Elements */}
      <motion.div
        className="absolute top-10 right-10 w-72 h-72 bg-linear-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl dark:from-blue-600/10 dark:to-purple-600/10"
        animate={!prefersReduced && aboutInView ? {
          x: [0, 30, 0],
          y: [0, -30, 0],
        } : { x: 0, y: 0 }}
        transition={!prefersReduced && aboutInView ? {
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        } : { duration: 0 }}
        aria-hidden="true"
      ></motion.div>

      <motion.div
        className="absolute bottom-10 left-10 w-72 h-72 bg-linear-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl dark:from-purple-600/10 dark:to-pink-600/10"
        animate={!prefersReduced && aboutInView ? {
          x: [0, -30, 0],
          y: [0, 30, 0],
        } : { x: 0, y: 0 }}
        transition={!prefersReduced && aboutInView ? {
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        } : { duration: 0 }}
        aria-hidden="true"
      ></motion.div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Title */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-16"
        >
          <h2 id="about-heading" className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-4">
            <span className="block bg-linear-to-r from-gray-900 via-blue-600 to-purple-600 dark:from-white dark:via-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
              About Me
            </span>
          </h2>
          <motion.div
            className="h-1 bg-linear-to-r from-blue-600 via-purple-600 to-pink-600 w-24 mx-auto rounded-full"
            initial={{ width: 0 }}
            whileInView={{ width: 96 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.3 }}
            aria-hidden="true"
          ></motion.div>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-16"
        >
          {/* Left Side - Image with Floating Elements */}
          <motion.div
            variants={itemVariants}
            className="relative"
          >
            <div className="relative mx-auto max-w-sm">
              {/* Animated Border */}
              <motion.div
                className="absolute -inset-1 bg-linear-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl blur opacity-75"
                animate={{
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                }}
                aria-hidden="true"
              ></motion.div>

              {/* Image Container */}
              <div className="relative bg-linear-to-br from-blue-500/20 to-purple-500/20 dark:from-blue-600/20 dark:to-purple-600/20 rounded-3xl overflow-hidden shadow-2xl aspect-square flex items-center justify-center border border-blue-400/30 dark:border-blue-500/30">
                {profileImageSrc && !imageFailed ? (
                  <img
                    src={profileImageSrc}
                    alt="Terachad - Full Stack Developer and IoT Specialist"
                    className="h-full w-full object-cover"
                    onError={() => setImageFailed(true)}
                  />
                ) : (
                  <div className="text-center">
                    <div className="text-6xl mb-4">👨‍💻</div>
                    <p className="text-gray-600 dark:text-gray-400 font-medium">Profile Image</p>
                  </div>
                )}
              </div>

              {/* Floating Stats */}
              <motion.div
                className="absolute -bottom-6 -left-6 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-4 border border-gray-200/50 dark:border-gray-700/50"
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5, duration: 0.6 }}
                whileHover={{ scale: 1.1 }}
              >
                <div className="text-center">
                  <p className="text-sm text-gray-600 dark:text-gray-400">Passionate Creator</p>
                  <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">4+ Yrs</p>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Right Side - Content */}
          <motion.div
            variants={itemVariants}
            className="space-y-8"
          >
            {/* Bio */}
            <motion.p
              variants={itemVariants}
              className="text-lg md:text-xl text-gray-700 dark:text-gray-300 leading-relaxed"
            >
              I'm a passionate{' '}
              <span className="font-semibold bg-linear-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
                Information and Communication Technology student in Btech at RP Kigali College, specializing in Software & Embedded Systems, ML, Network Architecture Implementation, and IoT.
              </span>{' '}
              with a strong focus on blending hardware and software. From configuring secure networks to developing patient tracking systems, I love solving complex problems with modern technology.
            </motion.p>

            {/* Quick Stats */}
            <motion.div
              className="grid grid-cols-3 gap-4"
              variants={{
                hidden: { opacity: 0 },
                visible: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.1,
                  },
                },
              }}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {stats.map((stat, i) => {
                const Icon = stat.icon;
                return (
                  <motion.div
                    key={i}
                    custom={i}
                    variants={statVariants}
                    className="group bg-linear-to-br from-blue-500/10 to-purple-500/10 dark:from-blue-600/10 dark:to-purple-600/10 rounded-xl p-4 border border-blue-300/20 dark:border-blue-500/20 hover:border-blue-400/50 dark:hover:border-blue-400/50 transition-all duration-300"
                    whileHover={{ scale: 1.05, y: -5 }}
                  >
                    <Icon className="w-6 h-6 text-blue-600 dark:text-blue-400 mb-2 group-hover:scale-110 transition-transform" />
                    <p className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
                      {stat.value}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                      {stat.label}
                    </p>
                  </motion.div>
                );
              })}
            </motion.div>

            {/* Download CV Button */}
            <motion.a
              href={cvUrl}
              download
              target="_blank"
              rel="noopener noreferrer"
              variants={itemVariants}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center justify-center gap-2 px-6 py-3 md:py-4 bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <FiDownload className="w-5 h-5" />
              Download CV
            </motion.a>
          </motion.div>
        </motion.div>

        {/* Skills Section */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={containerVariants}
        >
          <motion.h3
            variants={itemVariants}
            className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center"
          >
            Technical <span className="bg-linear-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 bg-clip-text text-transparent">Expertise</span>
          </motion.h3>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 gap-6"
            variants={{
              hidden: { opacity: 0 },
              visible: {
                opacity: 1,
                transition: {
                  staggerChildren: 0.1,
                },
              },
            }}
          >
            {skills.map((skillGroup, index) => (
              <motion.div
                key={index}
                custom={index}
                variants={skillCardVariants}
                whileHover="hover"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="group"
              >
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-700 group-hover:border-blue-400/60 dark:group-hover:border-blue-500/60 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:-translate-y-1">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-lg bg-linear-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-bold group-hover:scale-110 transition-transform">
                      {index + 1}
                    </div>
                    <h4 className="font-semibold text-lg text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {skillGroup.category}
                    </h4>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {skillGroup.items.map((item, idx) => (
                      <motion.span
                        key={idx}
                        initial={{ opacity: 0, scale: 0.8 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.3 + idx * 0.05 }}
                        className="px-3 py-1.5 rounded-lg bg-linear-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 text-gray-700 dark:text-gray-300 text-xs font-medium border border-blue-200/50 dark:border-blue-700/50 hover:border-blue-400 dark:hover:border-blue-500 transition-all duration-300 hover:scale-105"
                      >
                        {item}
                      </motion.span>
                    ))}
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default About;