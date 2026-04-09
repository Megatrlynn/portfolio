import { useState, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiGithub, FiLinkedin, FiTwitter, FiMail, FiPhone, FiMapPin, FiCheck, FiAlertCircle } from 'react-icons/fi';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useInView } from '../hooks/useInView';
import { useReducedMotion } from '../hooks/useReducedMotion';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const { ref: contactRef, inView: contactInView } = useInView({ threshold: 0.2, triggerOnce: false });
  const prefersReduced = useReducedMotion();

  const socialLinks = [
    { icon: FiGithub, label: 'GitHub', href: 'https://github.com/Megatrlynn', color: 'from-gray-600 to-gray-800' },
    { icon: FiLinkedin, label: 'LinkedIn', href: 'https://www.linkedin.com/in/raymond-igabineza-7564a9187/', color: 'from-blue-600 to-blue-800' },
    { icon: FiTwitter, label: 'Twitter', href: 'https://x.com/megatrlynn', color: 'from-cyan-500 to-blue-600' },
    { icon: FiMail, label: 'Email', href: 'https://mail.google.com/mail/?view=cm&fs=1&to=lynnslyna@gmail.com', color: 'from-orange-500 to-red-600' },
  ];

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setStatus('submitting');

    try {
      await addDoc(collection(db, 'messages'), {
        name: formData.name,
        email: formData.email,
        message: formData.message,
        timestamp: new Date()
      });
      
      setStatus('success');
      setFormData({ name: '', email: '', message: '' });
      
      setTimeout(() => {
        setStatus('idle');
      }, 3000);
    } catch (error) {
      console.error(error);
      setStatus('error');
      setTimeout(() => {
        setStatus('idle');
      }, 3000);
    }
  };

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

  const socialVariants = {
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
  };

  const inputVariants = {
    focus: { scale: 1.01 },
  };

  return (
    <section id="contact" className="relative py-20 md:py-32 overflow-hidden" aria-labelledby="contact-heading" ref={contactRef}>
      {/* Background */}
      <div className="absolute inset-0 bg-linear-to-br from-white via-blue-50/20 to-purple-50/20 dark:from-gray-950 dark:via-blue-950/10 dark:to-purple-950/10" aria-hidden="true"></div>

      {/* Animated Background Elements */}
      <motion.div
        className="absolute top-20 left-10 w-72 h-72 bg-linear-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl dark:from-blue-600/10 dark:to-purple-600/10"
        animate={!prefersReduced && contactInView ? { x: [0, 30, 0], y: [0, -30, 0] } : { x: 0, y: 0 }}
        transition={!prefersReduced && contactInView ? { duration: 8, repeat: Infinity, ease: "easeInOut" } : { duration: 0 }}
        aria-hidden="true"
      ></motion.div>

      <motion.div
        className="absolute bottom-10 right-10 w-72 h-72 bg-linear-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-3xl dark:from-purple-600/10 dark:to-pink-600/10"
        animate={!prefersReduced && contactInView ? { x: [0, -30, 0], y: [0, 30, 0] } : { x: 0, y: 0 }}
        transition={!prefersReduced && contactInView ? { duration: 10, repeat: Infinity, ease: "easeInOut" } : { duration: 0 }}
        aria-hidden="true"
      ></motion.div>

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Title */}
        <motion.div
          variants={itemVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-16"
        >
          <h2 id="contact-heading" className="text-4xl md:text-5xl lg:text-6xl font-black tracking-tight mb-4">
            <span className="block bg-linear-to-r from-gray-900 via-blue-600 to-purple-600 dark:from-white dark:via-blue-400 dark:to-purple-400 bg-clip-text text-transparent">
              Get In Touch
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
            Have a question or want to collaborate? Let's connect and build something amazing together.
          </motion.p>
        </motion.div>

        <motion.div
          className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-stretch"
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
        >
          {/* Left Side - Info & Social */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col justify-between"
          >
            <div>
              <h3 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Let's Connect
              </h3>
              <p className="text-lg text-gray-700 dark:text-gray-300 mb-8 leading-relaxed">
                Whether you have a question, a project proposal, or just want to chat about technology and innovation, feel free to reach out. I'd love to hear from you!
              </p>

              {/* Contact Info Cards */}
              <motion.div
                className="grid gap-4 mb-8"
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
                <motion.div
                  variants={itemVariants}
                  className="group p-4 rounded-xl bg-linear-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200/50 dark:border-blue-700/30 hover:border-blue-400/50 dark:hover:border-blue-500/50 transition-all duration-300"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-linear-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white">
                      <FiMail className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Email</p>
                      <p className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">lynnslyna@gmail.com</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  variants={itemVariants}
                  className="group p-4 rounded-xl bg-linear-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200/50 dark:border-blue-700/30 hover:border-blue-400/50 dark:hover:border-blue-500/50 transition-all duration-300"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-linear-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white">
                      <FiPhone className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Phone</p>
                      <p className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">+250782582857</p>
                    </div>
                  </div>
                </motion.div>

                <motion.div
                  variants={itemVariants}
                  className="group p-4 rounded-xl bg-linear-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 border border-blue-200/50 dark:border-blue-700/30 hover:border-blue-400/50 dark:hover:border-blue-500/50 transition-all duration-300"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-linear-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white">
                      <FiMapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Location</p>
                      <p className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Kicukiro, Kigali, Rwanda</p>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            </div>

            {/* Social Links */}
            <motion.div
              className="space-y-3"
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
              <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">Follow Me</p>
              <div className="flex gap-4">
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
                      whileHover={{ scale: 1.2, rotate: 10 }}
                      whileTap={{ scale: 0.9 }}
                      className="group relative"
                      title={social.label}
                    >
                      <motion.div
                        className={`w-12 h-12 rounded-xl bg-linear-to-br ${social.color} flex items-center justify-center text-white shadow-lg hover:shadow-xl transition-all duration-300`}
                      >
                        <Icon className="w-5 h-5" />
                      </motion.div>
                      <motion.div
                        className="absolute inset-0 bg-linear-to-br from-white/20 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                      ></motion.div>
                    </motion.a>
                  );
                })}
              </div>
            </motion.div>
          </motion.div>

          {/* Right Side - Form */}
          <motion.div
            variants={itemVariants}
            className="group relative"
          >
            {/* Animated Border */}
            <motion.div
              className="absolute -inset-1 bg-linear-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl blur opacity-0 group-hover:opacity-75 transition duration-500 -z-10"
            ></motion.div>

            {/* Form Card */}
            <div className="relative bg-white dark:bg-gray-800/50 backdrop-blur-sm p-8 md:p-10 rounded-2xl border border-gray-200/50 dark:border-gray-700/50 group-hover:border-blue-400/50 dark:group-hover:border-blue-500/50 shadow-lg group-hover:shadow-xl transition-all duration-300">
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name Field */}
                <motion.div
                  layout
                  className="space-y-2"
                >
                  <label htmlFor="name" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Full Name
                  </label>
                  <motion.input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    variants={inputVariants}
                    whileFocus="focus"
                    placeholder="Enter your name"
                    className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-900/50 border-2 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none focus:ring-0 transition-all duration-300"
                    required
                  />
                </motion.div>

                {/* Email Field */}
                <motion.div
                  layout
                  className="space-y-2"
                >
                  <label htmlFor="email" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Email Address
                  </label>
                  <motion.input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    variants={inputVariants}
                    whileFocus="focus"
                    placeholder="your@email.com"
                    className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-900/50 border-2 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none focus:ring-0 transition-all duration-300"
                    required
                  />
                </motion.div>

                {/* Message Field */}
                <motion.div
                  layout
                  className="space-y-2"
                >
                  <label htmlFor="message" className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                    Message
                  </label>
                  <motion.textarea
                    id="message"
                    rows={4}
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    variants={inputVariants}
                    whileFocus="focus"
                    placeholder="Tell me about your project or inquiry..."
                    className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-900/50 border-2 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none focus:ring-0 transition-all duration-300 resize-none"
                    required
                  ></motion.textarea>
                </motion.div>

                {/* Submit Button */}
                <motion.button
                  type="submit"
                  disabled={status === 'submitting'}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-3 px-6 bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer relative overflow-hidden group/btn disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <motion.div
                    className="absolute inset-0 bg-white/20 opacity-0 group-hover/btn:opacity-20 transition-opacity duration-300"
                  ></motion.div>
                  <span className="relative flex items-center justify-center gap-2">
                    {status === 'submitting' && (
                      <motion.div
                        animate={prefersReduced ? { rotate: 0 } : { rotate: 360 }}
                        transition={prefersReduced ? { duration: 0 } : { duration: 1, repeat: Infinity, ease: "linear" }}
                        className="w-4 h-4 border-2 border-white border-t-transparent rounded-full"
                      ></motion.div>
                    )}
                    {status === 'success' && <FiCheck className="w-5 h-5" />}
                    {status === 'submitting' ? 'Sending...' : status === 'success' ? 'Message Sent!' : 'Send Message'}
                  </span>
                </motion.button>
              </form>

              {/* Status Messages */}
              <AnimatePresence>
                {status === 'success' && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute inset-x-0 top-4 mx-4 p-4 rounded-lg bg-linear-to-r from-green-50 to-emerald-50 dark:from-green-900/30 dark:to-emerald-900/30 border border-green-300 dark:border-green-700"
                  >
                    <div className="flex items-center gap-2 text-green-700 dark:text-green-400 font-medium">
                      <FiCheck className="w-5 h-5" />
                      Thanks for your message! I'll get back to you soon.
                    </div>
                  </motion.div>
                )}
                {status === 'error' && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute inset-x-0 top-4 mx-4 p-4 rounded-lg bg-linear-to-r from-red-50 to-pink-50 dark:from-red-900/30 dark:to-pink-900/30 border border-red-300 dark:border-red-700"
                  >
                    <div className="flex items-center gap-2 text-red-700 dark:text-red-400 font-medium">
                      <FiAlertCircle className="w-5 h-5" />
                      Something went wrong. Please try again.
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Contact;