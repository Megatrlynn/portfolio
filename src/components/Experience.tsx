import { motion } from 'framer-motion';
import { FiBriefcase, FiBookOpen, FiCalendar } from 'react-icons/fi';
import { useInView } from '../hooks/useInView';
import { useReducedMotion } from '../hooks/useReducedMotion';

interface ExperienceItem {
  id: number;
  type: 'work' | 'education';
  title: string;
  organization: string;
  date: string;
  description: string;
}

const experienceData: ExperienceItem[] = [
  {
    id: 1,
    type: 'education',
    title: 'Bachelor of Technology in ICT',
    organization: 'RP-Kigali College',
    date: 'Current',
    description: 'Specializing in software development, embedded systems, and network administration. Currently developing the VitalTrack Mobility System as a capstone project.'
  },
  {
    id: 2,
    type: 'work',
    title: 'IT & Programming Mentor',
    organization: 'Independent',
    date: 'Jan 2026 - Present',
    description: 'Developed and delivered a comprehensive curriculum coaching individuals on programming languages, networking, and modern IT practices.'
  },
  {
    id: 3,
    type: 'work',
    title: 'Full Stack & IoT Developer',
    organization: 'Freelance',
    date: '2025 - Present',
    description: 'Building custom hardware and software solutions, including smart home network monitors and robotic systems using React, Python, ESP32, and Raspberry Pi.'
  }
];

const Experience = () => {
  const { ref: experienceRef, inView: experienceInView } = useInView({ threshold: 0.2, triggerOnce: false });
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

  const timelineItemVariants = {
    hidden: { opacity: 0, x: -30, y: 10 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      y: 0,
      transition: {
        delay: i * 0.15,
        duration: 0.6,
      },
    }),
    hover: {
      x: 8,
      transition: { duration: 0.3 },
    },
  };

  const dotVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: (i: number) => ({
      scale: 1,
      opacity: 1,
      transition: {
        delay: i * 0.15 + 0.3,
        duration: 0.5,
      },
    }),
  };

  return (
    <section id="experience" className="relative py-20 md:py-32 overflow-hidden" aria-labelledby="experience-heading" ref={experienceRef}>
      {/* Background */}
      <div className="absolute inset-0 bg-linear-to-br from-white via-blue-50/20 to-purple-50/20 dark:from-gray-950 dark:via-blue-950/10 dark:to-purple-950/10" aria-hidden="true"></div>

      {/* Animated Background Elements */}
      <motion.div
        className="absolute top-10 right-10 w-72 h-72 bg-linear-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl dark:from-blue-600/10 dark:to-purple-600/10"
        animate={!prefersReduced && experienceInView ? { x: [0, 30, 0], y: [0, -30, 0] } : { x: 0, y: 0 }}
        transition={!prefersReduced && experienceInView ? { duration: 8, repeat: Infinity, ease: "easeInOut" } : { duration: 0 }}
        aria-hidden="true"
      ></motion.div>

      <motion.div
        className="absolute bottom-10 left-10 w-72 h-72 bg-linear-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl dark:from-purple-600/10 dark:to-pink-600/10"
        animate={!prefersReduced && experienceInView ? { x: [0, -30, 0], y: [0, 30, 0] } : { x: 0, y: 0 }}
        transition={!prefersReduced && experienceInView ? { duration: 10, repeat: Infinity, ease: "easeInOut" } : { duration: 0 }}
        aria-hidden="true"
      ></motion.div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Title */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-16"
        >
          <h2 id="experience-heading" className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-4">
            <span className="block bg-linear-to-r from-gray-900 via-blue-600 to-purple-600 dark:from-white dark:via-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
              Experience & Education
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
          <motion.p
            variants={itemVariants}
            className="text-lg md:text-xl text-gray-700 dark:text-gray-300 mt-6 max-w-2xl mx-auto"
          >
            My academic journey and professional background in technology development.
          </motion.p>
        </motion.div>

        {/* Timeline */}
        <div className="relative">
          {/* Timeline Line */}
          <motion.div
            className="absolute left-4 md:left-1/2 top-0 bottom-0 w-1 bg-linear-to-b from-blue-600 via-purple-600 to-pink-600 rounded-full"
            initial={{ height: 0 }}
            whileInView={{ height: "100%" }}
            viewport={{ once: true }}
            transition={{ duration: 1.5, delay: 0.3 }}
          ></motion.div>

          {/* Timeline Items Container */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="space-y-8 md:space-y-0"
          >
            {experienceData.map((item, index) => (
              <motion.div
                key={item.id}
                custom={index}
                variants={timelineItemVariants}
                whileHover="hover"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="relative md:mb-12"
              >
                {/* Desktop Layout */}
                <div className="hidden md:flex gap-8 items-stretch">
                  {/* Left Side */}
                  <div className="w-1/2 text-right pr-8">
                    {index % 2 === 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.15 + 0.2 }}
                        className="group cursor-pointer"
                      >
                        <motion.div
                          className="absolute inset-0 bg-linear-to-br from-blue-500/0 via-purple-500/0 to-pink-500/0 group-hover:from-blue-500/10 group-hover:via-purple-500/10 group-hover:to-pink-500/10 transition-all duration-300 rounded-2xl -z-10"
                        ></motion.div>
                        <motion.div
                          layout
                          whileHover={{ scale: 1.03, y: -4 }}
                          transition={{ duration: 0.25, ease: 'easeOut' }}
                          className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 group-hover:border-blue-400/50 dark:group-hover:border-blue-500/50 shadow-lg group-hover:shadow-2xl transition-all duration-300 overflow-hidden"
                        >
                          <div className="p-6 md:p-8">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-linear-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 text-blue-600 dark:text-blue-400 text-sm font-semibold mb-3">
                              {item.type === 'work' ? <FiBriefcase className="w-4 h-4" /> : <FiBookOpen className="w-4 h-4" />}
                              {item.type === 'work' ? 'Work' : 'Education'}
                            </div>
                            <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                              {item.title}
                            </h3>
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              whileInView={{ opacity: 1, height: "auto" }}
                              viewport={{ once: true }}
                              transition={{ delay: 0.1 }}
                              className="overflow-hidden"
                            >
                              <p className="text-gray-700 dark:text-gray-300 font-semibold mb-2 pt-2">{item.organization}</p>
                              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-sm mb-4">
                                <FiCalendar className="w-4 h-4" />
                                {item.date}
                              </div>
                            </motion.div>
                            <motion.p
                              initial={{ opacity: 0, height: 0 }}
                              whileInView={{ opacity: 1, height: "auto" }}
                              viewport={{ once: true }}
                              transition={{ delay: 0.15 }}
                              className="text-gray-600 dark:text-gray-400 leading-relaxed pt-2 text-sm md:text-base group-hover:opacity-100"
                            >
                              {item.description}
                            </motion.p>
                          </div>
                        </motion.div>
                      </motion.div>
                    )}
                  </div>

                  {/* Center Dot */}
                  <motion.div
                    custom={index}
                    variants={dotVariants}
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    className="relative flex items-center justify-center"
                  >
                    <div className="w-12 h-12 rounded-full bg-linear-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white shadow-xl border-4 border-white dark:border-gray-950 z-20">
                      {item.type === 'work' ? (
                        <FiBriefcase className="w-6 h-6" />
                      ) : (
                        <FiBookOpen className="w-6 h-6" />
                      )}
                    </div>
                  </motion.div>

                  {/* Right Side */}
                  <div className="w-1/2 pl-8">
                    {index % 2 !== 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: index * 0.15 + 0.2 }}
                        className="group cursor-pointer"
                      >
                        <motion.div
                          className="absolute inset-0 bg-linear-to-br from-blue-500/0 via-purple-500/0 to-pink-500/0 group-hover:from-blue-500/10 group-hover:via-purple-500/10 group-hover:to-pink-500/10 transition-all duration-300 rounded-2xl -z-10"
                        ></motion.div>
                        <motion.div
                          layout
                          whileHover={{ scale: 1.03, y: -4 }}
                          transition={{ duration: 0.25, ease: 'easeOut' }}
                          className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 group-hover:border-blue-400/50 dark:group-hover:border-blue-500/50 shadow-lg group-hover:shadow-2xl transition-all duration-300 overflow-hidden"
                        >
                          <div className="p-6 md:p-8">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-linear-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 text-blue-600 dark:text-blue-400 text-sm font-semibold mb-3">
                              {item.type === 'work' ? <FiBriefcase className="w-4 h-4" /> : <FiBookOpen className="w-4 h-4" />}
                              {item.type === 'work' ? 'Work' : 'Education'}
                            </div>
                            <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                              {item.title}
                            </h3>
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              whileInView={{ opacity: 1, height: "auto" }}
                              viewport={{ once: true }}
                              transition={{ delay: 0.1 }}
                              className="overflow-hidden"
                            >
                              <p className="text-gray-700 dark:text-gray-300 font-semibold mb-2 pt-2">{item.organization}</p>
                              <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-sm mb-4">
                                <FiCalendar className="w-4 h-4" />
                                {item.date}
                              </div>
                            </motion.div>
                            <motion.p
                              initial={{ opacity: 0, height: 0 }}
                              whileInView={{ opacity: 1, height: "auto" }}
                              viewport={{ once: true }}
                              transition={{ delay: 0.15 }}
                              className="text-gray-600 dark:text-gray-400 leading-relaxed pt-2 text-sm md:text-base group-hover:opacity-100"
                            >
                              {item.description}
                            </motion.p>
                          </div>
                        </motion.div>
                      </motion.div>
                    )}
                  </div>
                </div>

                {/* Mobile Layout */}
                <div className="md:hidden ml-12">
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.15 + 0.2 }}
                    className="group cursor-pointer"
                  >
                    <div className="absolute -left-6 mt-1.5 w-10 h-10 rounded-full bg-linear-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white shadow-xl border-4 border-white dark:border-gray-950 z-20">
                      {item.type === 'work' ? (
                        <FiBriefcase className="w-5 h-5" />
                      ) : (
                        <FiBookOpen className="w-5 h-5" />
                      )}
                    </div>

                    <div className="absolute inset-0 bg-linear-to-br from-blue-500/0 via-purple-500/0 to-pink-500/0 group-hover:from-blue-500/10 group-hover:via-purple-500/10 group-hover:to-pink-500/10 transition-all duration-300 rounded-2xl -z-10"></div>
                    <motion.div
                      layout
                      whileHover={{ scale: 1.02, y: -3 }}
                      transition={{ duration: 0.25, ease: 'easeOut' }}
                      className="bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 group-hover:border-blue-400/50 dark:group-hover:border-blue-500/50 shadow-lg group-hover:shadow-xl transition-all duration-300 overflow-hidden"
                    >
                      <div className="p-6">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-linear-to-r from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 text-blue-600 dark:text-blue-400 text-sm font-semibold mb-3">
                          {item.type === 'work' ? <FiBriefcase className="w-4 h-4" /> : <FiBookOpen className="w-4 h-4" />}
                          {item.type === 'work' ? 'Work' : 'Education'}
                        </div>
                        <h3 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {item.title}
                        </h3>
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          whileInView={{ opacity: 1, height: "auto" }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.1 }}
                          className="overflow-hidden"
                        >
                          <p className="text-gray-700 dark:text-gray-300 font-semibold mb-2 pt-2">{item.organization}</p>
                          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-sm mb-4">
                            <FiCalendar className="w-4 h-4" />
                            {item.date}
                          </div>
                        </motion.div>
                        <motion.p
                          initial={{ opacity: 0, height: 0 }}
                          whileInView={{ opacity: 1, height: "auto" }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.15 }}
                          className="text-gray-600 dark:text-gray-400 leading-relaxed pt-2 text-sm group-hover:opacity-100"
                        >
                          {item.description}
                        </motion.p>
                      </div>
                    </motion.div>
                  </motion.div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Experience;