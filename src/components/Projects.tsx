import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, onSnapshot } from 'firebase/firestore';
import { createPortal } from 'react-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { db } from '../firebase';
import { FiArrowUpRight, FiGithub, FiExternalLink, FiX } from 'react-icons/fi';
import { useInView } from '../hooks/useInView';
import { useReducedMotion } from '../hooks/useReducedMotion';

interface ProjectType {
  id: string;
  imageUrl: string;
  title: string;
  description: string;
  fullDescription: string;
  tech: string[];
  features: string[];
  challenges: string[];
  outcomes: string[];
  role: string;
  duration: string;
  status: string;
  link: string;
  demoUrl: string;
  repoUrl: string;
}

const Projects = () => {
  const [projects, setProjects] = useState<ProjectType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [selectedProject, setSelectedProject] = useState<ProjectType | null>(null);
  const { ref: projectsRef, inView: projectsInView } = useInView({ threshold: 0.2, triggerOnce: false });
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'projects'),
      (querySnapshot) => {
        const projectsData: ProjectType[] = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          projectsData.push({
            id: doc.id,
            imageUrl: data.imageUrl || '',
            title: data.title,
            description: data.description,
            fullDescription: data.fullDescription || data.description || '',
            tech: data.tech || [],
            features: data.features || [],
            challenges: data.challenges || [],
            outcomes: data.outcomes || [],
            role: data.role || 'Full Stack & IoT Developer',
            duration: data.duration || 'N/A',
            status: data.status || 'Completed',
            link: data.link || '#',
            demoUrl: data.demoUrl || data.link || '#',
            repoUrl: data.repoUrl || data.link || '#',
          });
        });

        setProjects(projectsData);
        setIsLoading(false);
      },
      (error) => {
        console.error(error);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!selectedProject) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [selectedProject]);

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

  const cardVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 20 },
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

  const loadingSkeletonVariants = {
    animate: {
      opacity: [0.5, 1, 0.5],
      transition: {
        duration: 2,
        repeat: Infinity,
      },
    },
  };

  return (
    <section id="projects" className="relative py-20 md:py-32 overflow-hidden" aria-labelledby="projects-heading" ref={projectsRef}>
      {/* Background */}
      <div className="absolute inset-0 bg-white dark:bg-gray-950"></div>

      {/* Animated Background Elements */}
      <motion.div
        className="absolute top-20 left-10 w-72 h-72 bg-blue-400/15 rounded-full blur-3xl dark:bg-blue-600/10"
        animate={!prefersReduced && projectsInView ? { x: [0, 30, 0], y: [0, -30, 0] } : { x: 0, y: 0 }}
        transition={!prefersReduced && projectsInView ? { duration: 10, repeat: Infinity, ease: "easeInOut" } : { duration: 0 }}
        aria-hidden="true"
      ></motion.div>

      <motion.div
        className="absolute bottom-20 right-10 w-72 h-72 bg-purple-400/15 rounded-full blur-3xl dark:bg-purple-600/10"
        animate={!prefersReduced && projectsInView ? { x: [0, -30, 0], y: [0, 30, 0] } : { x: 0, y: 0 }}
        transition={!prefersReduced && projectsInView ? { duration: 10, repeat: Infinity, ease: "easeInOut" } : { duration: 0 }}
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
          <h2 id="projects-heading" className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-4">
            <span className="block text-gray-900 dark:text-white">
              Featured Projects
            </span>
          </h2>
          <motion.div
            className="h-1 bg-blue-600 w-24 mx-auto rounded-full"
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
            A selection of my recent hardware and software development work showcasing innovation and technical expertise.
          </motion.p>
        </motion.div>

        {isLoading ? (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {[...Array(6)].map((_, index) => (
              <motion.div
                key={index}
                variants={loadingSkeletonVariants}
                animate="animate"
                className="group relative overflow-hidden rounded-2xl"
              >
                <div className="absolute inset-0 pointer-events-none rounded-2xl border border-transparent group-hover:border-blue-300/60 dark:group-hover:border-blue-500/60 shadow-[0_0_0_0_rgba(59,130,246,0.0)] group-hover:shadow-[0_0_0_2px_rgba(59,130,246,0.18),0_0_28px_rgba(147,51,234,0.16)] transition-all duration-300 z-10"></div>
                <div className="relative bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 h-96 p-6">
                  <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-3"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6 mb-6"></div>
                  <div className="flex gap-2 mb-8">
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-16"></div>
                    <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-20"></div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            {projects.map((project, index) => (
              <motion.div
                key={project.id}
                custom={index}
                variants={cardVariants}
                whileHover="hover"
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                onHoverStart={() => setHoveredId(project.id)}
                onHoverEnd={() => setHoveredId(null)}
                className="group relative overflow-hidden rounded-2xl"
              >
                {/* Subtle glow ring */}
                <motion.div
                  className="absolute inset-0 pointer-events-none rounded-2xl border border-transparent shadow-[0_0_0_0_rgba(59,130,246,0.0)] z-10"
                  animate={{
                    borderColor: hoveredId === project.id ? 'rgba(96,165,250,0.55)' : 'rgba(96,165,250,0)',
                    boxShadow: hoveredId === project.id
                      ? '0 0 0 2px rgba(59,130,246,0.18), 0 0 28px rgba(147,51,234,0.16)'
                      : '0 0 0 0 rgba(59,130,246,0)',
                  }}
                  transition={{ duration: 0.25 }}
                ></motion.div>

                {/* Card Content */}
                <div className="relative bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 h-full flex flex-col border border-gray-200/50 dark:border-gray-700/50 group-hover:border-blue-400/50 dark:group-hover:border-blue-500/50 transition-all duration-300 shadow-lg group-hover:shadow-xl">
                  <motion.button
                    type="button"
                    onClick={() => setSelectedProject(project)}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    className="group/image mb-4 block w-full overflow-hidden rounded-[1.75rem] border border-gray-200/70 bg-white/70 p-1 text-left shadow-sm transition-all duration-300 hover:border-blue-300 hover:shadow-xl dark:border-gray-700/70 dark:bg-gray-900/40 dark:hover:border-blue-500 cursor-pointer"
                    aria-label={`Open larger preview for ${project.title}`}
                  >
                    <div className="relative h-40 overflow-hidden rounded-[1.35rem] bg-blue-100 dark:bg-blue-900/30">
                      {project.imageUrl ? (
                        <img
                          src={project.imageUrl}
                          alt={`${project.title} preview`}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover/image:scale-105"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-4xl opacity-40">🚀</div>
                      )}
                      <div className="absolute inset-0 bg-black/20 opacity-0 transition-opacity duration-300 group-hover/image:opacity-100" />
                      <div className="absolute bottom-3 right-3 rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold tracking-wide text-gray-700 shadow-md backdrop-blur-sm dark:bg-gray-950/80 dark:text-gray-100">
                        Click to expand
                      </div>
                    </div>
                  </motion.button>

                  {/* Header */}
                  <div className="mb-4 flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {project.title}
                      </h3>
                    </div>
                    <motion.div
                      animate={{
                        rotate: hoveredId === project.id ? 45 : 0,
                        scale: hoveredId === project.id ? 1.2 : 1,
                      }}
                      transition={{ duration: 0.3 }}
                      className="ml-2 text-blue-600 dark:text-blue-400"
                    >
                      <FiArrowUpRight className="w-5 h-5" />
                    </motion.div>
                  </div>

                  {/* Description */}
                  <p className="text-gray-600 dark:text-gray-400 mb-6 grow line-clamp-3 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">                    {project.description}
                  </p>

                  {/* Tech Tags */}
                  <div className="mb-6">
                    <motion.div
                      className="flex flex-wrap gap-2"
                      variants={{
                        hidden: { opacity: 0 },
                        visible: {
                          opacity: 1,
                          transition: {
                            staggerChildren: 0.05,
                          },
                        },
                      }}
                      initial="hidden"
                      whileInView="visible"
                      viewport={{ once: true }}
                    >
                      {project.tech.map((techItem) => (
                        <motion.span
                          key={techItem}
                          initial={{ opacity: 0, scale: 0.8 }}
                          whileInView={{ opacity: 1, scale: 1 }}
                          viewport={{ once: true }}
                          transition={{ duration: 0.3 }}
                          className="px-3 py-1.5 text-xs font-medium rounded-lg bg-blue-50 dark:bg-blue-900/30 text-gray-700 dark:text-gray-300 border border-blue-200/50 dark:border-blue-700/50 group-hover:border-blue-400 dark:group-hover:border-blue-500 transition-all duration-300"
                        >
                          {techItem}
                        </motion.span>
                      ))}
                    </motion.div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4 border-t border-gray-200/50 dark:border-gray-700/50">
                    <motion.button
                      onClick={() => setSelectedProject(project)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg border-2 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300 font-semibold text-sm hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all duration-300 cursor-pointer"
                    >
                      Read More
                    </motion.button>
                    <motion.a
                      href={project.demoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition-all duration-300"
                    >
                      <FiExternalLink className="w-4 h-4" />
                      View
                    </motion.a>
                    <motion.a
                      href={project.repoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold text-sm hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-300"
                    >
                      <FiGithub className="w-4 h-4" />
                      Code
                    </motion.a>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}

        {typeof window !== 'undefined' && selectedProject && createPortal(
          <AnimatePresence>
            {selectedProject && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-70 bg-black/55 backdrop-blur-sm overflow-y-auto"
              >
                <div className="min-h-svh flex items-center justify-center px-4 py-24 md:px-8 md:py-28">
                  <motion.div
                    initial={{ opacity: 0, y: 20, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 12, scale: 0.98 }}
                    transition={{ duration: 0.25 }}
                    className="relative w-full max-w-4xl max-h-[calc(100svh-11rem)] overflow-y-auto rounded-2xl border border-gray-200/70 dark:border-gray-700/70 bg-white dark:bg-gray-900 p-6 md:p-8 shadow-2xl"
                  >
                  <button
                    onClick={() => setSelectedProject(null)}
                    className="absolute top-4 right-4 p-2 rounded-lg text-gray-500 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer"
                    aria-label="Close project details"
                  >
                    <FiX className="w-5 h-5" />
                  </button>

                  <div className="pr-10">
                  {selectedProject.imageUrl && (
                    <div className="mb-5 overflow-hidden rounded-4xl border-2 border-white/70 shadow-2xl ring-1 ring-gray-200/70 dark:border-gray-700/70 dark:ring-gray-700/60">
                      <img
                        src={selectedProject.imageUrl}
                        alt={`${selectedProject.title} cover`}
                        className="w-full max-h-128 object-cover"
                      />
                    </div>
                  )}
                  <h3 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white mb-3">{selectedProject.title}</h3>
                  <div className="prose prose-invert max-w-none mb-6 text-gray-600 dark:text-gray-300">
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm]}
                      components={{
                        h1: ({node, ...props}) => <h1 className="text-3xl font-bold text-gray-900 dark:text-white mt-6 mb-3" {...props} />,
                        h2: ({node, ...props}) => <h2 className="text-2xl font-bold text-gray-900 dark:text-white mt-5 mb-3" {...props} />,
                        h3: ({node, ...props}) => <h3 className="text-xl font-bold text-gray-900 dark:text-white mt-4 mb-2" {...props} />,
                        h4: ({node, ...props}) => <h4 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mt-3 mb-2" {...props} />,
                        p: ({node, ...props}) => <p className="text-gray-600 dark:text-gray-300 leading-relaxed mb-4" {...props} />,
                        ul: ({node, ...props}) => <ul className="list-disc list-inside text-gray-600 dark:text-gray-300 mb-4 space-y-2" {...props} />,
                        ol: ({node, ...props}) => <ol className="list-decimal list-inside text-gray-600 dark:text-gray-300 mb-4 space-y-2" {...props} />,
                        li: ({node, ...props}) => <li className="text-gray-600 dark:text-gray-300 ml-2" {...props} />,
                        blockquote: ({node, ...props}) => <blockquote className="border-l-4 border-blue-500 pl-4 italic text-gray-600 dark:text-gray-300 my-4" {...props} />,
                        code: ({node, inline, ...props}: any) => inline ? 
                          <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-sm font-mono text-gray-800 dark:text-gray-200" {...props} /> :
                          <code className="block bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-sm font-mono text-gray-800 dark:text-gray-200 overflow-x-auto mb-4" {...props} />,
                        pre: ({node, ...props}) => <pre className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg overflow-x-auto mb-4" {...props} />,
                        a: ({node, ...props}) => <a className="text-blue-600 dark:text-blue-400 hover:underline" {...props} />,
                        strong: ({node, ...props}) => <strong className="font-semibold text-gray-700 dark:text-gray-200" {...props} />,
                        em: ({node, ...props}) => <em className="italic text-gray-600 dark:text-gray-300" {...props} />,
                      }}
                    >
                      {selectedProject.fullDescription || selectedProject.description}
                    </ReactMarkdown>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
                    <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-3 bg-gray-50/70 dark:bg-gray-800/50">
                      <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Role</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{selectedProject.role}</p>
                    </div>
                    <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-3 bg-gray-50/70 dark:bg-gray-800/50">
                      <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Duration</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{selectedProject.duration}</p>
                    </div>
                    <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-3 bg-gray-50/70 dark:bg-gray-800/50">
                      <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Status</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{selectedProject.status}</p>
                    </div>
                  </div>

                  <div className="mb-6">
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">Technology Stack</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedProject.tech.map((item) => (
                        <span
                          key={`stack-${selectedProject.id}-${item}`}
                          className="px-3 py-1.5 text-xs font-medium rounded-lg bg-blue-50 dark:bg-blue-900/30 text-gray-700 dark:text-gray-300 border border-blue-200/50 dark:border-blue-700/50"
                        >
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>

                  {selectedProject.features.length > 0 && (
                    <div className="mb-5">
                      <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">Key Features</p>
                      <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-300 space-y-1">
                        {selectedProject.features.map((feature) => (
                          <li key={`feature-${selectedProject.id}-${feature}`}>{feature}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {selectedProject.challenges.length > 0 && (
                    <div className="mb-5">
                      <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">Challenges Solved</p>
                      <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-300 space-y-1">
                        {selectedProject.challenges.map((challenge) => (
                          <li key={`challenge-${selectedProject.id}-${challenge}`}>{challenge}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {selectedProject.outcomes.length > 0 && (
                    <div className="mb-7">
                      <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">Outcomes</p>
                      <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-300 space-y-1">
                        {selectedProject.outcomes.map((outcome) => (
                          <li key={`outcome-${selectedProject.id}-${outcome}`}>{outcome}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  <div className="flex flex-wrap gap-3">
                    <a
                      href={selectedProject.demoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm transition"
                    >
                      <FiExternalLink className="w-4 h-4" />
                      View Demo
                    </a>
                    <a
                      href={selectedProject.repoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-semibold text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                    >
                      <FiGithub className="w-4 h-4" />
                      Source Code
                    </a>
                  </div>
                  </div>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
      </div>
    </section>
  );
};

export default Projects;