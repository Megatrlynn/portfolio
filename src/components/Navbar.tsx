import { useState, useEffect, useRef, type FormEvent, type MouseEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSun, FiMoon, FiMenu, FiX, FiLock } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';

const Navbar = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [showLogin, setShowLogin] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const clickScrollTargetRef = useRef<string | null>(null);
  const clickScrollTimeoutRef = useRef<number | null>(null);
  const navigate = useNavigate();

  const navLinks = [
    { name: 'Home', href: '#home', id: 'home' },
    { name: 'About', href: '#about', id: 'about' },
    { name: 'Skills', href: '#skills', id: 'skills' },
    { name: 'Projects', href: '#projects', id: 'projects' },
    { name: 'Experience', href: '#experience', id: 'experience' },
    { name: 'Blog', href: '#blog', id: 'blog' },
    { name: 'Contact', href: '#contact', id: 'contact' },
  ];

  useEffect(() => {
    const savedTheme = window.localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setDarkMode(savedTheme ? savedTheme === 'dark' : prefersDark);
  }, []);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    document.documentElement.style.colorScheme = darkMode ? 'dark' : 'light';
    window.localStorage.setItem('theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  useEffect(() => {
    const sectionFromHash = window.location.hash.replace('#', '');
    if (sectionFromHash && navLinks.some((link) => link.id === sectionFromHash)) {
      setActiveSection(sectionFromHash);
    }
  }, []);

  useEffect(() => {
    const sectionElements = navLinks
      .map((link) => document.getElementById(link.id))
      .filter((element): element is HTMLElement => Boolean(element));

    if (sectionElements.length === 0) {
      return;
    }

    const updateActiveSectionOnScroll = () => {
      if (clickScrollTargetRef.current) {
        const targetElement = document.getElementById(clickScrollTargetRef.current);

        if (targetElement) {
          const navOffset = 96;
          const targetTop = targetElement.getBoundingClientRect().top;
          const isAtTarget = Math.abs(targetTop - navOffset) <= 24;

          if (isAtTarget) {
            setActiveSection(clickScrollTargetRef.current);
            clickScrollTargetRef.current = null;
          } else {
            return;
          }
        } else {
          clickScrollTargetRef.current = null;
        }
      }

      const navOffset = 96;
      const scrollPosition = window.scrollY + navOffset;
      let currentSection = sectionElements[0]?.id ?? 'home';

      for (const section of sectionElements) {
        const sectionTop = section.offsetTop;
        const sectionBottom = sectionTop + section.offsetHeight;

        if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
          currentSection = section.id;
          break;
        }

        if (scrollPosition >= sectionTop) {
          currentSection = section.id;
        }
      }

      setActiveSection(currentSection);
    };

    updateActiveSectionOnScroll();
    window.addEventListener('scroll', updateActiveSectionOnScroll, { passive: true });
    window.addEventListener('resize', updateActiveSectionOnScroll);

    return () => {
      window.removeEventListener('scroll', updateActiveSectionOnScroll);
      window.removeEventListener('resize', updateActiveSectionOnScroll);
    };
  }, []);

  const handleNavClick = (event: MouseEvent<HTMLAnchorElement>, sectionId: string) => {
    event.preventDefault();
    const targetSection = document.getElementById(sectionId);

    if (!targetSection) {
      setIsOpen(false);
      return;
    }

    setActiveSection(sectionId);
    setIsOpen(false);
    clickScrollTargetRef.current = sectionId;
    if (clickScrollTimeoutRef.current) {
      window.clearTimeout(clickScrollTimeoutRef.current);
    }
    clickScrollTimeoutRef.current = window.setTimeout(() => {
      clickScrollTargetRef.current = null;
    }, 1200);

    window.requestAnimationFrame(() => {
      targetSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      window.history.replaceState(null, '', `#${sectionId}`);
    });
  };

  useEffect(() => {
    return () => {
      if (clickScrollTimeoutRef.current) {
        window.clearTimeout(clickScrollTimeoutRef.current);
      }
    };
  }, []);

  const linkVariants = {
    initial: { opacity: 0, y: -10 },
    animate: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.08, duration: 0.4 },
    }),
    hover: { scale: 1.05 },
  };

  const iconVariants = {
    rest: { scale: 1 },
    hover: { scale: 1.15, rotate: 10 },
    tap: { scale: 0.95 },
  };

  const mobileMenuVariants = {
    closed: {
      opacity: 0,
      height: 0,
      transition: { duration: 0.3 },
    },
    open: {
      opacity: 1,
      height: 'auto',
      transition: { duration: 0.3 },
    },
  };

  const mobileItemVariants = {
    closed: { x: -20, opacity: 0 },
    open: (i: number) => ({
      x: 0,
      opacity: 1,
      transition: { delay: i * 0.1, duration: 0.3 },
    }),
  };

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setShowLogin(false);
      navigate('/vault');
    } catch (err) {
      setError('Invalid credentials');
    }
  };

  return (
    <>
      <nav className="fixed w-full z-40 bg-linear-to-b from-white via-white/95 to-white/90 dark:from-gray-950 dark:via-gray-900/95 dark:to-gray-900/90 backdrop-blur-xl shadow-lg dark:shadow-2xl transition-all duration-300 border-b border-gray-100/50 dark:border-gray-800/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5 }}
              className="shrink-0"
            >
              <div className="relative group cursor-pointer">
                <div className="absolute -inset-1 bg-linear-to-r from-orange-500/60 via-amber-400/60 to-blue-500/60 rounded-xl blur opacity-60 group-hover:opacity-90 transition duration-500"></div>
                <div className="relative px-3 py-2.5 bg-white dark:bg-gray-950 rounded-xl border border-gray-200/60 dark:border-gray-800/60 overflow-hidden">
                  <motion.div
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-y-0 -left-1/3 w-1/3 bg-linear-to-r from-transparent via-orange-300/70 to-transparent dark:via-amber-300/40"
                    initial={{ x: '-180%' }}
                    animate={{ x: ['-180%', '460%'] }}
                    transition={{ duration: 4.8, ease: 'linear', repeat: Infinity }}
                  />

                  <div className="relative z-10 flex items-center gap-2">
                    <motion.div
                      initial={{ scale: 0.85, opacity: 0, rotate: -8 }}
                      animate={{ scale: [1, 1.018], opacity: 1, rotate: [0, -1] }}
                      transition={{ duration: 3.2, delay: 0.1, ease: 'easeInOut', repeat: Infinity, repeatType: 'mirror' }}
                      className="grid h-8 w-8 place-items-center rounded-lg bg-linear-to-br from-orange-500 to-amber-500 text-white shadow-md"
                    >
                      <span className="text-[11px] font-extrabold tracking-wide">TF</span>
                    </motion.div>

                    <div className="leading-none">
                      <motion.span
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="block font-black text-lg sm:text-xl tracking-tight"
                      >
                        <motion.span
                          className="bg-clip-text text-transparent"
                          style={{
                            backgroundImage: 'linear-gradient(115deg, #f97316, #f59e0b, #ef4444, #f59e0b, #f97316)',
                            backgroundSize: '220% 220%',
                          }}
                          animate={{ backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] }}
                          transition={{ duration: 7.5, ease: 'linear', repeat: Infinity }}
                        >
                          TitanForge
                        </motion.span>
                      </motion.span>
                      <motion.span
                        initial={{ opacity: 0, y: 6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.45, delay: 0.3 }}
                        className="block text-[10px] uppercase tracking-[0.18em] text-gray-600 dark:text-gray-400"
                      >
                      </motion.span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden md:block">
              <div className="ml-10 flex items-center space-x-2">
                {navLinks.map((link, index) => {
                  const isActive = activeSection === link.id;

                  return (
                    <motion.a
                      key={link.name}
                      href={link.href}
                      custom={index}
                      initial="initial"
                      animate="animate"
                      whileHover="hover"
                      variants={linkVariants}
                      onClick={(event) => handleNavClick(event, link.id)}
                      className={`relative group px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-300 ${
                        isActive
                          ? 'text-blue-600 dark:text-blue-400'
                          : 'text-gray-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
                      }`}
                    >
                      {isActive && (
                        <motion.div
                          layoutId="activeDesktopNav"
                          transition={{ type: 'spring', stiffness: 360, damping: 34 }}
                          className="absolute inset-0 rounded-lg bg-linear-to-r from-blue-500/12 via-blue-500/18 to-purple-500/12"
                        ></motion.div>
                      )}
                      <div className={`absolute inset-0 rounded-lg transition-opacity duration-300 ${
                        isActive
                          ? 'opacity-0'
                          : 'bg-linear-to-r from-blue-500/0 via-blue-500/10 to-purple-500/0 opacity-0 group-hover:opacity-100'
                      }`}></div>
                      <span className="relative z-10">{link.name}</span>
                      {isActive ? (
                        <motion.span
                          layoutId="activeDesktopUnderline"
                          transition={{ type: 'spring', stiffness: 360, damping: 34 }}
                          className="absolute left-3 right-3 -bottom-0.5 h-0.5 rounded-full bg-linear-to-r from-blue-600 to-purple-600"
                        ></motion.span>
                      ) : (
                        <span className="absolute left-3 right-3 -bottom-0.5 h-0.5 rounded-full bg-linear-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                      )}
                    </motion.a>
                  );
                })}

                {/* Divider */}
                <div className="w-px h-6 bg-linear-to-b from-transparent via-gray-300 dark:via-gray-600 to-transparent mx-2"></div>

                {/* Theme Toggle */}
                <motion.button
                  onClick={() => setDarkMode(!darkMode)}
                  variants={iconVariants}
                  initial="rest"
                  whileHover="hover"
                  whileTap="tap"
                  className="p-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-300 text-gray-700 dark:text-gray-300 cursor-pointer group"
                >
                  <motion.div className="relative flex items-center justify-center h-5 w-5">
                    <AnimatePresence mode="wait">
                      {darkMode ? (
                        <motion.div
                          key="sun"
                          initial={{ y: -20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          exit={{ y: 20, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <FiSun size={20} className="group-hover:text-yellow-500" />
                        </motion.div>
                      ) : (
                        <motion.div
                          key="moon"
                          initial={{ y: -20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          exit={{ y: 20, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <FiMoon size={20} className="group-hover:text-blue-400" />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                </motion.button>

                {/* Vault Lock Button */}
                <motion.button
                  onClick={() => setShowLogin(true)}
                  variants={iconVariants}
                  initial="rest"
                  whileHover="hover"
                  whileTap="tap"
                  className="relative p-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-300 text-gray-700 dark:text-gray-300 cursor-pointer group overflow-hidden"
                >
                  <div className="absolute inset-0 bg-linear-to-r from-amber-400/0 via-amber-400/20 to-amber-400/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <FiLock size={18} className="relative z-10" />
                </motion.button>
              </div>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center space-x-2">
              <motion.button
                onClick={() => setShowLogin(true)}
                variants={iconVariants}
                initial="rest"
                whileHover="hover"
                whileTap="tap"
                className="p-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300 cursor-pointer"
              >
                <FiLock size={18} />
              </motion.button>

              <motion.button
                onClick={() => setDarkMode(!darkMode)}
                variants={iconVariants}
                initial="rest"
                whileHover="hover"
                whileTap="tap"
                className="p-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300 cursor-pointer"
              >
                {darkMode ? <FiSun size={20} /> : <FiMoon size={20} />}
              </motion.button>

              <motion.button
                onClick={() => setIsOpen(!isOpen)}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="p-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-700 dark:text-gray-300 focus:outline-none cursor-pointer"
              >
                <motion.div
                  animate={{ rotate: isOpen ? 90 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {isOpen ? <FiX size={24} /> : <FiMenu size={24} />}
                </motion.div>
              </motion.button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        <motion.div
          initial="closed"
          animate={isOpen ? "open" : "closed"}
          variants={mobileMenuVariants}
          className="md:hidden bg-linear-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950 border-t border-gray-100 dark:border-gray-800"
        >
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navLinks.map((link, i) => {
              const isActive = activeSection === link.id;

              return (
                <motion.a
                  key={link.name}
                  href={link.href}
                  custom={i}
                  initial="closed"
                  animate="open"
                  variants={mobileItemVariants}
                  onClick={(event) => handleNavClick(event, link.id)}
                  className={`relative group block px-4 py-3 rounded-lg text-base font-medium transition-all duration-300 ${
                    isActive
                      ? 'text-blue-600 dark:text-blue-400 bg-linear-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-linear-to-r hover:from-blue-500/10 hover:via-purple-500/10 hover:to-pink-500/10 hover:text-blue-600 dark:hover:text-blue-400'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeMobileNav"
                      transition={{ type: 'spring', stiffness: 360, damping: 34 }}
                      className="absolute inset-0 rounded-lg bg-linear-to-r from-blue-500/12 via-purple-500/12 to-pink-500/12"
                    ></motion.div>
                  )}
                  <span className="relative z-10">{link.name}</span>
                </motion.a>
              );
            })}
          </div>
        </motion.div>
      </nav>

      {/* Login Modal */}
      <AnimatePresence>
        {showLogin && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-md px-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.95, y: 20, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="relative bg-linear-to-br from-white to-gray-50 dark:from-gray-900 dark:to-gray-950 p-8 rounded-2xl shadow-2xl w-full max-w-md border border-gray-200/50 dark:border-gray-800/50 overflow-hidden"
            >
              {/* Background gradient effect */}
              <div className="absolute top-0 right-0 w-40 h-40 bg-linear-to-br from-blue-500/10 to-purple-500/10 rounded-full blur-3xl -z-10"></div>

              {/* Close Button */}
              <motion.button
                onClick={() => setShowLogin(false)}
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <FiX size={24} />
              </motion.button>

              {/* Title */}
              <motion.h2
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-3xl font-bold bg-linear-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-2 text-center"
              >
                Access Vault
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="text-gray-500 dark:text-gray-400 text-center mb-6"
              >
                Enter your admin credentials to continue
              </motion.p>

              {/* Form */}
              <form onSubmit={handleLogin}>
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="mb-4 group"
                >
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    placeholder="admin@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none focus:ring-0 transition-colors duration-300 placeholder-gray-400 dark:placeholder-gray-500"
                    required
                  />
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  className="mb-6 group"
                >
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-gray-50 dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none focus:ring-0 transition-colors duration-300 placeholder-gray-400 dark:placeholder-gray-500"
                    required
                  />
                </motion.div>

                {error && (
                  <motion.p
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="text-red-500 text-sm mb-4 text-center font-medium"
                  >
                    {error}
                  </motion.p>
                )}

                <motion.button
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  className="w-full py-3 px-6 bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                  <span className="relative">Enter Vault</span>
                </motion.button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;