import { motion } from 'framer-motion';
import { FiCode, FiCpu, FiDatabase, FiShield } from 'react-icons/fi';
import { useInView } from '../hooks/useInView';
import { useReducedMotion } from '../hooks/useReducedMotion';

interface Skill {
  name: string;
  level: number;
  related: string[];
}

interface SkillCategory {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  skills: Skill[];
}

const skillCategories: SkillCategory[] = [
  {
    title: 'Frontend Development',
    icon: FiCode,
    skills: [
      { name: 'React', level: 95, related: ['TypeScript', 'Tailwind CSS', 'Framer Motion'] },
      { name: 'TypeScript', level: 92, related: ['Vite', 'ESLint', 'Component Architecture'] },
      { name: 'Responsive UI Design', level: 90, related: ['Accessibility', 'Mobile-first', 'Design Systems'] },
    ],
  },
  {
    title: 'Embedded Systems & IoT',
    icon: FiCpu,
    skills: [
      { name: 'Embedded Systems', level: 94, related: ['ESP32', 'Raspberry Pi', 'Arduino'] },
      { name: 'C/C++ for Microcontrollers', level: 91, related: ['Sensors', 'Actuators', 'Hardware Debugging'] },
      { name: 'Python for Automation', level: 89, related: ['Serial Communication', 'Data Logging', 'Scripting'] },
    ],
  },
  {
    title: 'Backend & Data',
    icon: FiDatabase,
    skills: [
      { name: 'Firebase', level: 90, related: ['Firestore', 'Authentication', 'Storage'] },
      { name: 'API & Data Modeling', level: 87, related: ['JSON Structures', 'Validation', 'Collections'] },
      { name: 'SQL & Data Analysis', level: 86, related: ['NumPy', 'Pandas', 'Query Optimization'] },
    ],
  },
  {
    title: 'Cybersecurity & Networking',
    icon: FiShield,
    skills: [
      { name: 'Network Security', level: 88, related: ['Traffic Monitoring', 'Threat Detection', 'Wazuh'] },
      { name: 'System Hardening', level: 85, related: ['OpenSSL', 'Access Control', 'Best Practices'] },
      { name: 'Incident Awareness', level: 84, related: ['Risk Analysis', 'Secure Configurations', 'Auditing'] },
    ],
  },
];

const Skills = () => {
  const { ref: skillsRef, inView: skillsInView } = useInView({ threshold: 0.2, triggerOnce: false });
  const prefersReduced = useReducedMotion();
  return (
    <section id="skills" className="relative py-20 md:py-32 overflow-hidden" aria-labelledby="skills-heading" ref={skillsRef}>
      <div className="absolute inset-0 bg-linear-to-br from-white via-blue-50/20 to-purple-50/20 dark:from-gray-950 dark:via-blue-950/10 dark:to-purple-950/10" aria-hidden="true"></div>

      <motion.div
        className="absolute top-10 left-10 w-72 h-72 bg-linear-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl dark:from-blue-600/10 dark:to-purple-600/10"
        animate={!prefersReduced && skillsInView ? { x: [0, 24, 0], y: [0, -24, 0] } : { x: 0, y: 0 }}
        transition={!prefersReduced && skillsInView ? { duration: 8, repeat: Infinity, ease: 'easeInOut' } : { duration: 0 }}
        aria-hidden="true"
      ></motion.div>

      <motion.div
        className="absolute bottom-10 right-10 w-72 h-72 bg-linear-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl dark:from-purple-600/10 dark:to-pink-600/10"
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
            <span className="block bg-linear-to-r from-gray-900 via-blue-600 to-purple-600 dark:from-white dark:via-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
              Skills & Proficiency
            </span>
          </h2>
          <motion.div
            className="h-1 bg-linear-to-r from-blue-600 via-purple-600 to-pink-600 w-24 mx-auto rounded-full"
            initial={{ width: 0 }}
            whileInView={{ width: 96 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            aria-hidden="true"
          ></motion.div>
          <p className="text-lg md:text-xl text-gray-700 dark:text-gray-300 mt-6 max-w-3xl mx-auto">
            Core strengths aligned with the technologies highlighted in the hero section, including React, TypeScript, Embedded Systems, and Python.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {skillCategories.map((category, categoryIndex) => {
            const Icon = category.icon;
            return (
              <motion.article
                key={category.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.6, delay: categoryIndex * 0.1 }}
                className="group relative rounded-2xl border border-gray-200/60 dark:border-gray-700/60 bg-white/70 dark:bg-gray-800/50 backdrop-blur-sm p-6 md:p-8 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-linear-to-r from-blue-600 to-purple-600 text-white flex items-center justify-center">
                    <Icon className="w-5 h-5" />
                  </div>
                  <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white">{category.title}</h3>
                </div>

                <div className="space-y-6">
                  {category.skills.map((skill, skillIndex) => (
                    <div key={skill.name} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <p className="text-sm md:text-base font-semibold text-gray-800 dark:text-gray-100">{skill.name}</p>
                        <span className="text-sm font-bold text-blue-600 dark:text-blue-400">{skill.level}%</span>
                      </div>

                      <div className="h-3 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          whileInView={{ width: `${skill.level}%` }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.9, delay: 0.15 + skillIndex * 0.08, ease: 'easeOut' }}
                          className="h-full rounded-full bg-linear-to-r from-blue-600 via-purple-600 to-pink-500"
                        ></motion.div>
                      </div>

                      <div className="flex flex-wrap gap-2 pt-1">
                        {skill.related.map((item) => (
                          <span
                            key={`${skill.name}-${item}`}
                            className="px-2.5 py-1 rounded-md text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200/70 dark:bg-blue-900/30 dark:text-blue-200 dark:border-blue-700/60"
                          >
                            {item}
                          </span>
                        ))}
                      </div>
                    </div>
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
