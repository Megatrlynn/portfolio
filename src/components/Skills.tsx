import { motion } from 'framer-motion';
import { FiCode, FiCpu, FiDatabase, FiShield } from 'react-icons/fi';
import type { ComponentType } from 'react';
import { useInView } from '../hooks/useInView';
import { useReducedMotion } from '../hooks/useReducedMotion';

interface Skill {
  name: string;
  expertise: 'Expert' | 'Advanced' | 'Strong';
  highlights: string[];
  tools: string[];
}

interface SkillCategory {
  title: string;
  summary: string;
  icon: ComponentType<{ className?: string }>;
  skills: Skill[];
}

const skillCategories: SkillCategory[] = [
  {
    title: 'Frontend Development',
    summary: 'Designing polished interfaces and scalable component architectures for production-grade web apps.',
    icon: FiCode,
    skills: [
      {
        name: 'Modern React Engineering',
        expertise: 'Expert',
        highlights: ['Composable UI systems', 'State-driven interactions', 'Performance-focused rendering'],
        tools: ['React', 'TypeScript', 'Vite', 'Framer Motion'],
      },
      {
        name: 'Design System Thinking',
        expertise: 'Advanced',
        highlights: ['Reusable primitives', 'Visual consistency', 'Accessible component patterns'],
        tools: ['Tailwind CSS', 'CSS Tokens', 'Responsive Layouts'],
      },
    ],
  },
  {
    title: 'Embedded Systems & IoT',
    summary: 'Building reliable hardware-software integrations for smart automation and sensor-driven systems.',
    icon: FiCpu,
    skills: [
      {
        name: 'Microcontroller Programming',
        expertise: 'Expert',
        highlights: ['Real-time control logic', 'Sensor integrations', 'Low-level debugging workflows'],
        tools: ['C/C++', 'ESP32', 'Arduino', 'Raspberry Pi'],
      },
      {
        name: 'Automation & Device Scripting',
        expertise: 'Advanced',
        highlights: ['Serial communication pipelines', 'Data logging automation', 'Task orchestration'],
        tools: ['Python', 'Shell Scripts', 'Telemetry Pipelines'],
      },
    ],
  },
  {
    title: 'Backend & Data',
    summary: 'Designing secure data flows and scalable backends aligned with modern product requirements.',
    icon: FiDatabase,
    skills: [
      {
        name: 'Cloud-Backed Application Services',
        expertise: 'Advanced',
        highlights: ['Realtime data modeling', 'Authentication flows', 'Production-ready Firebase integration'],
        tools: ['Firebase', 'Firestore', 'Cloud Storage', 'Access Rules'],
      },
      {
        name: 'Data Architecture & APIs',
        expertise: 'Strong',
        highlights: ['Structured payload design', 'Validation strategies', 'Query efficiency'],
        tools: ['REST Patterns', 'SQL', 'Pandas', 'NumPy'],
      },
    ],
  },
  {
    title: 'Cybersecurity & Networking',
    summary: 'Applying practical security principles to improve reliability, resilience, and operational safety.',
    icon: FiShield,
    skills: [
      {
        name: 'Defensive Security Practices',
        expertise: 'Advanced',
        highlights: ['Traffic observation', 'Threat-aware configuration', 'Monitoring-first operations'],
        tools: ['Wazuh', 'OpenSSL', 'Security Baselines'],
      },
      {
        name: 'Secure Infrastructure Hygiene',
        expertise: 'Strong',
        highlights: ['Hardening checklists', 'Access policy discipline', 'Risk-driven remediation'],
        tools: ['Access Control', 'Audit Workflows', 'Config Reviews'],
      },
    ],
  },
];

const Skills = () => {
  const { ref: skillsRef, inView: skillsInView } = useInView({ threshold: 0.2, triggerOnce: false });
  const prefersReduced = useReducedMotion();

  const categoryVariants = {
    hidden: { opacity: 0, y: 26 },
    visible: (index: number) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.65, delay: index * 0.1, ease: 'easeOut' as const },
    }),
  };

  const detailVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: (index: number) => ({
      opacity: 1,
      y: 0,
      transition: { duration: 0.45, delay: 0.12 + index * 0.08, ease: 'easeOut' as const },
    }),
  };

  return (
    <section id="skills" className="relative py-20 md:py-32 overflow-hidden" aria-labelledby="skills-heading" ref={skillsRef}>
      <div className="absolute inset-0 bg-white dark:bg-gray-950" aria-hidden="true"></div>

      <motion.div
        className="absolute top-10 left-10 w-72 h-72 bg-blue-400/15 rounded-full blur-3xl dark:bg-blue-600/10"
        animate={!prefersReduced && skillsInView ? { x: [0, 24, 0], y: [0, -24, 0] } : { x: 0, y: 0 }}
        transition={!prefersReduced && skillsInView ? { duration: 8, repeat: Infinity, ease: 'easeInOut' } : { duration: 0 }}
        aria-hidden="true"
      ></motion.div>

      <motion.div
        className="absolute bottom-10 right-10 w-72 h-72 bg-purple-400/15 rounded-full blur-3xl dark:bg-purple-600/10"
        animate={!prefersReduced && skillsInView ? { x: [0, -24, 0], y: [0, 24, 0] } : { x: 0, y: 0 }}
        transition={!prefersReduced && skillsInView ? { duration: 10, repeat: Infinity, ease: 'easeInOut' } : { duration: 0 }}
        aria-hidden="true"
      ></motion.div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.7 }}
          className="text-center mb-16"
        >
          <h2 id="skills-heading" className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-4">
            <span className="block text-gray-900 dark:text-white">
              Professional Skills
            </span>
          </h2>
          <motion.div
            className="h-1 bg-blue-600 w-24 mx-auto rounded-full"
            initial={{ width: 0 }}
            whileInView={{ width: 96 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            aria-hidden="true"
          ></motion.div>
          <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 mt-6 max-w-3xl mx-auto">
            Focused capabilities across software engineering, systems integration, and secure product delivery.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {skillCategories.map((category, categoryIndex) => {
            const Icon = category.icon;
            return (
              <motion.article
                key={category.title}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true, margin: '-80px' }}
                custom={categoryIndex}
                variants={categoryVariants}
                whileHover={prefersReduced ? {} : { y: -6 }}
                className="group relative rounded-2xl border border-gray-200/60 dark:border-gray-700/60 bg-white/70 dark:bg-gray-800/50 backdrop-blur-sm p-6 md:p-8 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <motion.div
                  className="absolute -inset-px rounded-2xl bg-blue-500/0 group-hover:bg-blue-500/10 transition-all duration-500 pointer-events-none"
                  aria-hidden="true"
                ></motion.div>

                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">{category.title}</h3>
                </div>

                <p className="text-sm md:text-base text-gray-700 dark:text-gray-300 leading-relaxed mb-6">{category.summary}</p>

                <div className="space-y-6">
                  {category.skills.map((skill, skillIndex) => (
                    <motion.div
                      key={skill.name}
                      className="space-y-3 rounded-xl border border-gray-200/70 dark:border-gray-700/70 bg-white/70 dark:bg-gray-900/30 p-4"
                      custom={skillIndex}
                      variants={detailVariants}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm md:text-base font-semibold text-gray-800 dark:text-gray-100">{skill.name}</p>
                        <span className="px-2.5 py-1 rounded-md text-xs font-semibold border border-blue-200/80 text-blue-700 bg-blue-50 dark:border-blue-700/60 dark:text-blue-200 dark:bg-blue-900/30">
                          {skill.expertise}
                        </span>
                      </div>

                      <ul className="space-y-1.5">
                        {skill.highlights.map((point) => (
                          <li key={`${skill.name}-${point}`} className="text-sm text-gray-700 dark:text-gray-300">
                            {point}
                          </li>
                        ))}
                      </ul>

                      <div className="flex flex-wrap gap-2 pt-1">
                        {skill.tools.map((item) => (
                          <span
                            key={`${skill.name}-${item}`}
                            className="px-2.5 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200/70 dark:bg-blue-900/30 dark:text-blue-200 dark:border-blue-700/60"
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Skills;
