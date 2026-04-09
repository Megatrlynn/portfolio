import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, onSnapshot } from 'firebase/firestore';
import { createPortal } from 'react-dom';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { db } from '../firebase';
import { FiCalendar, FiClock, FiArrowRight, FiTag, FiX, FiExternalLink } from 'react-icons/fi';
import { useInView } from '../hooks/useInView';
import { useReducedMotion } from '../hooks/useReducedMotion';

interface BlogPost {
  id: string;
  imageUrl: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  date: string;
  readTime: string;
  tools: string[];
  keyTakeaways: string[];
  audience: string;
  difficulty: string;
  referenceLinks: string[];
}

const categories = ['All', 'Software', 'Hardware', 'Cybersecurity'];

const categoryColors: { [key: string]: string } = {
  'Software': 'bg-blue-500',
  'Hardware': 'bg-purple-500',
  'Cybersecurity': 'bg-orange-500',
  'All': 'bg-blue-600',
};

const Blog = () => {
  const [activeCategory, setActiveCategory] = useState('All');
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const { ref: blogRef, inView: blogInView } = useInView({ threshold: 0.2, triggerOnce: false });
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'posts'),
      (querySnapshot) => {
        const postsData: BlogPost[] = [];

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          postsData.push({
            id: doc.id,
            imageUrl: data.imageUrl || '',
            title: data.title,
            excerpt: data.excerpt,
            content: data.content || data.excerpt || '',
            category: data.category,
            date: data.date,
            readTime: data.readTime,
            tools: data.tools || [],
            keyTakeaways: data.keyTakeaways || [],
            audience: data.audience || 'General Developers',
            difficulty: data.difficulty || 'Intermediate',
            referenceLinks: data.referenceLinks || []
          });
        });

        setBlogPosts(postsData);
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
    if (!selectedPost) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [selectedPost]);

  const filteredPosts = activeCategory === 'All'
    ? blogPosts
    : blogPosts.filter(post => post.category === activeCategory);

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

  const categoryButtonVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: (i: number) => ({
      opacity: 1,
      scale: 1,
      transition: {
        delay: i * 0.05,
        duration: 0.4,
      },
    }),
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
    animate: prefersReduced
      ? { opacity: 1 }
      : {
          opacity: [0.5, 1, 0.5],
          transition: {
            duration: 2,
            repeat: Infinity,
          },
        },
  };

  return (
    <section id="blog" className="relative py-20 md:py-32 overflow-hidden" aria-labelledby="blog-heading" ref={blogRef}>
      {/* Background */}
      <div className="absolute inset-0 bg-white dark:bg-gray-950" aria-hidden="true"></div>

      {/* Animated Background Elements */}
      <motion.div
        className="absolute top-20 right-10 w-72 h-72 bg-blue-400/15 rounded-full blur-3xl dark:bg-blue-600/10"
        animate={!prefersReduced && blogInView ? { x: [0, 30, 0], y: [0, -30, 0] } : { x: 0, y: 0 }}
        transition={!prefersReduced && blogInView ? { duration: 8, repeat: Infinity, ease: "easeInOut" } : { duration: 0 }}
        aria-hidden="true"
      ></motion.div>

      <motion.div
        className="absolute bottom-10 left-10 w-72 h-72 bg-purple-400/15 rounded-full blur-3xl dark:bg-purple-600/10"
        animate={!prefersReduced && blogInView ? { x: [0, -30, 0], y: [0, 30, 0] } : { x: 0, y: 0 }}
        transition={!prefersReduced && blogInView ? { duration: 10, repeat: Infinity, ease: "easeInOut" } : { duration: 0 }}
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
          <h2 id="blog-heading" className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-4">
            <span className="block text-gray-900 dark:text-white">
              Latest Articles
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
            Insights on software development, embedded systems, and cybersecurity best practices.
          </motion.p>
        </motion.div>

        {/* Category Filter */}
        <motion.div
          className="flex justify-center gap-3 mb-12 flex-wrap"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
        >
          {categories.map((category, i) => (
            <motion.button
              key={category}
              custom={i}
              variants={categoryButtonVariants}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveCategory(category)}
              className={`relative px-6 py-3 rounded-full text-sm font-semibold transition-all duration-300 cursor-pointer overflow-hidden group ${
                activeCategory === category
                  ? 'text-white'
                  : 'text-gray-700 dark:text-gray-300'
              }`}
            >
              {activeCategory === category && (
                <motion.div
                  layoutId="activeCategory"
                  className={`absolute inset-0 ${categoryColors[category]} -z-10`}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                ></motion.div>
              )}
              <div className={`absolute inset-0 ${categoryColors[category]} opacity-0 group-hover:opacity-10 transition-opacity duration-300 -z-10`}></div>
              <span className="relative flex items-center gap-2">
                {category}
              </span>
            </motion.button>
          ))}
        </motion.div>

        {/* Blog Posts Grid */}
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
                <div className="relative bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl border border-gray-200/50 dark:border-gray-700/50 h-96 p-6 flex flex-col">
                  <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded-lg mb-4"></div>
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-3"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6 mb-8"></div>
                  <div className="flex gap-2 mt-auto">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full w-16"></div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded-full w-20"></div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
          >
            <AnimatePresence mode="popLayout">
              {filteredPosts.map((post, index) => (
                <motion.div
                  key={post.id}
                  custom={index}
                  variants={cardVariants}
                  whileHover="hover"
                  initial="hidden"
                  animate="visible"
                  exit={{ opacity: 0, scale: 0.9 }}
                  layout
                  className="group relative overflow-hidden rounded-2xl h-full"
                >
                  {/* Subtle glow ring */}
                  <div className="absolute inset-0 pointer-events-none rounded-2xl border border-transparent group-hover:border-blue-300/60 dark:group-hover:border-blue-500/60 shadow-[0_0_0_0_rgba(59,130,246,0.0)] group-hover:shadow-[0_0_0_2px_rgba(59,130,246,0.18),0_0_28px_rgba(147,51,234,0.16)] transition-all duration-300 z-10"></div>

                  {/* Card Content */}
                  <div className="relative bg-white dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 h-full flex flex-col border border-gray-200/50 dark:border-gray-700/50 group-hover:border-blue-400/50 dark:group-hover:border-blue-500/50 transition-all duration-300 shadow-lg group-hover:shadow-xl">
                    {/* Image Placeholder */}
                    <div className="relative h-40 mb-4 rounded-xl overflow-hidden bg-blue-100 dark:bg-blue-900/30">
                      {post.imageUrl ? (
                        <img
                          src={post.imageUrl}
                          alt={`${post.title} cover`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <motion.div
                            animate={prefersReduced ? { rotate: 0 } : { rotate: 360 }}
                            transition={prefersReduced ? { duration: 0 } : { duration: 20, repeat: Infinity, ease: "linear" }}
                          >
                            <div className="text-4xl opacity-20">📝</div>
                          </motion.div>
                        </div>
                      )}
                    </div>

                    {/* Category Badge */}
                    <div className="flex items-center gap-2 mb-3">
                      <motion.span
                        whileHover={{ scale: 1.1 }}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${categoryColors[post.category] || categoryColors['All']} text-white text-xs font-semibold`}
                      >
                        <FiTag className="w-3 h-3" />
                        {post.category}
                      </motion.span>
                    </div>

                    {/* Title */}
                    <h3 className="text-xl md:text-lg font-bold text-gray-900 dark:text-white mb-3 line-clamp-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      {post.title}
                    </h3>

                    {/* Excerpt */}
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-4 grow line-clamp-3 group-hover:text-gray-700 dark:group-hover:text-gray-300 transition-colors">
                      {post.excerpt}
                    </p>

                    {/* Divider */}
                    <div className="border-t border-gray-200/50 dark:border-gray-700/50 my-4"></div>

                    {/* Footer */}
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                        <motion.div
                          className="flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-default"
                          whileHover={{ scale: 1.1 }}
                        >
                          <FiCalendar className="w-3.5 h-3.5" />
                          {post.date}
                        </motion.div>
                        <motion.div
                          className="flex items-center gap-1 hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-default"
                          whileHover={{ scale: 1.1 }}
                        >
                          <FiClock className="w-3.5 h-3.5" />
                          {post.readTime}
                        </motion.div>
                      </div>
                      <motion.button
                        onClick={() => setSelectedPost(post)}
                        whileHover={{ x: 4, scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 font-semibold text-sm hover:text-blue-700 dark:hover:text-blue-300 transition-colors group/btn"
                      >
                        <span>Read More</span>
                        <FiArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Empty State */}
        {!isLoading && filteredPosts.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-20"
          >
            <p className="text-lg text-gray-600 dark:text-gray-400">No articles found in this category.</p>
          </motion.div>
        )}

        {typeof window !== 'undefined' && selectedPost && createPortal(
          <AnimatePresence>
            {selectedPost && (
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
                    onClick={() => setSelectedPost(null)}
                    className="absolute top-4 right-4 p-2 rounded-lg text-gray-500 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer"
                    aria-label="Close article details"
                  >
                    <FiX className="w-5 h-5" />
                  </button>

                  <div className="pr-10">
                  {selectedPost.imageUrl && (
                    <div className="mb-5 h-56 md:h-72 rounded-xl overflow-hidden border border-gray-200 dark:border-gray-700">
                      <img
                        src={selectedPost.imageUrl}
                        alt={`${selectedPost.title} cover`}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <div className="flex flex-wrap items-center gap-2 mb-3">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg ${categoryColors[selectedPost.category] || categoryColors.All} text-white text-xs font-semibold`}>
                      <FiTag className="w-3 h-3" />
                      {selectedPost.category}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 inline-flex items-center gap-1">
                      <FiCalendar className="w-3.5 h-3.5" />
                      {selectedPost.date}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400 inline-flex items-center gap-1">
                      <FiClock className="w-3.5 h-3.5" />
                      {selectedPost.readTime}
                    </span>
                  </div>

                  <h3 className="text-2xl md:text-3xl font-black text-gray-900 dark:text-white mb-4">{selectedPost.title}</h3>
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
                      {selectedPost.content || selectedPost.excerpt}
                    </ReactMarkdown>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                    <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-3 bg-gray-50/70 dark:bg-gray-800/50">
                      <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Audience</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{selectedPost.audience}</p>
                    </div>
                    <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-3 bg-gray-50/70 dark:bg-gray-800/50">
                      <p className="text-xs uppercase tracking-wide text-gray-500 dark:text-gray-400">Difficulty</p>
                      <p className="font-semibold text-gray-900 dark:text-white">{selectedPost.difficulty}</p>
                    </div>
                  </div>

                  {selectedPost.tools.length > 0 && (
                    <div className="mb-5">
                      <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">Tools and Technologies</p>
                      <div className="flex flex-wrap gap-2">
                        {selectedPost.tools.map((tool) => (
                          <span
                            key={`tool-${selectedPost.id}-${tool}`}
                            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-blue-50 dark:bg-blue-900/30 text-gray-700 dark:text-gray-300 border border-blue-200/50 dark:border-blue-700/50"
                          >
                            {tool}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedPost.keyTakeaways.length > 0 && (
                    <div className="mb-5">
                      <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">Key Takeaways</p>
                      <ul className="list-disc list-inside text-sm text-gray-600 dark:text-gray-300 space-y-1">
                        {selectedPost.keyTakeaways.map((takeaway) => (
                          <li key={`takeaway-${selectedPost.id}-${takeaway}`}>{takeaway}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {selectedPost.referenceLinks.length > 0 && (
                    <div className="mb-5">
                      <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-2">Reference Links</p>
                      <div className="flex flex-col gap-2">
                        {selectedPost.referenceLinks.map((link) => (
                          <a
                            key={`ref-${selectedPost.id}-${link}`}
                            href={link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:underline break-all"
                          >
                            <FiExternalLink className="w-4 h-4" />
                            {link}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}
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

export default Blog;