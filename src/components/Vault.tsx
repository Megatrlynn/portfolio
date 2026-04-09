import { useState, useEffect, type FormEvent } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, addDoc, query, orderBy, doc, getDoc, setDoc, deleteDoc, updateDoc } from 'firebase/firestore';
import { signOut } from 'firebase/auth';
import { auth, db } from '../firebase';
import { useReducedMotion } from '../hooks/useReducedMotion';
import {
  FiLogOut,
  FiArrowLeft,
  FiMessageSquare,
  FiBriefcase,
  FiEdit3,
  FiInbox,
  FiSend,
  FiCheckCircle,
  FiAlertCircle,
  FiShield,
  FiFileText,
  FiExternalLink,
  FiTrash2,
  FiX,
} from 'react-icons/fi';

interface Message {
  id: string;
  name: string;
  email: string;
  message: string;
  timestamp: { toDate?: () => Date } | null;
}

interface ImgBBUploadResponse {
  success?: boolean;
  data?: {
    url?: string;
  };
  error?: {
    message?: string;
  };
}

const toCsvString = (value: unknown): string => {
  if (Array.isArray(value)) {
    return value.join(', ');
  }

  if (typeof value === 'string') {
    return value;
  }

  return '';
};

const toStringArray = (value: string): string[] =>
  value
    .split(',')
    .map((item) => item.trim())
    .filter((item) => item !== '');

const toDisplayArray = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter((item) => item !== '');
  }

  if (typeof value === 'string') {
    return value
      .split(',')
      .map((item) => item.trim())
      .filter((item) => item !== '');
  }

  return [];
};

const toPreviewText = (value: unknown, maxLength = 180): string => {
  const text = typeof value === 'string' ? value.trim() : '';

  if (!text) {
    return '';
  }

  return text.length > maxLength ? `${text.slice(0, maxLength).trimEnd()}…` : text;
};

const Vault = () => {
  const env = import.meta.env as Record<string, string | undefined>;
  const imgbbApiKey = env.VITE_IMGBB_API_KEY ?? env.IMGBB_API_KEY ?? '';

  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminCheckDone, setAdminCheckDone] = useState(false);
  const [activeTab, setActiveTab] = useState<'messages' | 'projects' | 'blog' | 'cv'>('messages');
  const navigate = useNavigate();
  const prefersReduced = useReducedMotion();

  const [projectData, setProjectData] = useState({
    title: '',
    description: '',
    fullDescription: '',
    tech: '',
    features: '',
    challenges: '',
    outcomes: '',
    role: '',
    duration: '',
    status: 'Completed',
    demoUrl: '',
    repoUrl: '',
    link: '',
  });
  const [projectStatus, setProjectStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [projectImageFile, setProjectImageFile] = useState<File | null>(null);
  const [projectErrorMessage, setProjectErrorMessage] = useState('');
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);

  const [blogData, setBlogData] = useState({
    title: '',
    excerpt: '',
    content: '',
    category: 'Software',
    date: '',
    readTime: '',
    audience: '',
    difficulty: 'Intermediate',
    tools: '',
    keyTakeaways: '',
    referenceLinks: '',
  });
  const [blogStatus, setBlogStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [blogImageFile, setBlogImageFile] = useState<File | null>(null);
  const [blogErrorMessage, setBlogErrorMessage] = useState('');
  const [isArticleModalOpen, setIsArticleModalOpen] = useState(false);

  const [currentCvUrl, setCurrentCvUrl] = useState('');
  const [currentCvName, setCurrentCvName] = useState('');
  const [externalCvUrl, setExternalCvUrl] = useState('');
  const [externalCvStatus, setExternalCvStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [externalCvError, setExternalCvError] = useState('');

  // Projects list and edit state
  const [projects, setProjects] = useState<any[]>([]);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [deleteProjectConfirm, setDeleteProjectConfirm] = useState<string | null>(null);
  const [projectsLoading, setProjectsLoading] = useState(false);

  // Blog list and edit state
  const [articles, setArticles] = useState<any[]>([]);
  const [editingArticleId, setEditingArticleId] = useState<string | null>(null);
  const [deleteArticleConfirm, setDeleteArticleConfirm] = useState<string | null>(null);
  const [articlesLoading, setArticlesLoading] = useState(false);

  const tabs: Array<{
    key: 'messages' | 'projects' | 'blog' | 'cv';
    label: string;
    icon: typeof FiMessageSquare;
  }> = [
    { key: 'messages', label: 'Inbox', icon: FiMessageSquare },
    { key: 'projects', label: 'Add Project', icon: FiBriefcase },
    { key: 'blog', label: 'Add Article', icon: FiEdit3 },
    { key: 'cv', label: 'Upload CV', icon: FiFileText },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.45 },
    },
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        navigate('/');
        return;
      }

      try {
        const tokenResult = await user.getIdTokenResult();
        const hasAdminClaim = tokenResult.claims.admin === true;
        setIsAdmin(hasAdminClaim);
        setAdminCheckDone(true);

        if (hasAdminClaim) {
          fetchMessages();
          fetchCurrentCv();
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error(error);
        setIsAdmin(false);
        setAdminCheckDone(true);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (isAdmin && adminCheckDone) {
      if (activeTab === 'projects') {
        fetchProjects();
      } else if (activeTab === 'blog') {
        fetchArticles();
      }
    }
  }, [activeTab, isAdmin, adminCheckDone]);

  const fetchMessages = async () => {
    try {
      const q = query(collection(db, 'messages'), orderBy('timestamp', 'desc'));
      const querySnapshot = await getDocs(q);
      const fetchedMessages: Message[] = [];
      querySnapshot.forEach((doc) => {
        fetchedMessages.push({ id: doc.id, ...doc.data() } as Message);
      });
      setMessages(fetchedMessages);
      setLoading(false);
    } catch (error) {
      console.error(error);
      setLoading(false);
    }
  };

  const fetchProjects = async () => {
    try {
      setProjectsLoading(true);
      const querySnapshot = await getDocs(collection(db, 'projects'));
      const fetchedProjects: any[] = [];
      querySnapshot.forEach((doc) => {
        fetchedProjects.push({ id: doc.id, ...doc.data() });
      });

      const sortedProjects = fetchedProjects.sort((a, b) => {
        const aTime = a?.createdAt?.toDate?.()?.getTime?.() ?? 0;
        const bTime = b?.createdAt?.toDate?.()?.getTime?.() ?? 0;
        return bTime - aTime;
      });

      setProjects(sortedProjects);
      setProjectsLoading(false);
    } catch (error) {
      console.error(error);
      setProjectsLoading(false);
    }
  };

  const fetchArticles = async () => {
    try {
      setArticlesLoading(true);
      const querySnapshot = await getDocs(collection(db, 'posts'));
      const fetchedArticles: any[] = [];
      querySnapshot.forEach((doc) => {
        fetchedArticles.push({ id: doc.id, ...doc.data() });
      });

      const sortedArticles = fetchedArticles.sort((a, b) => {
        const aTime = a?.createdAt?.toDate?.()?.getTime?.() ?? 0;
        const bTime = b?.createdAt?.toDate?.()?.getTime?.() ?? 0;
        return bTime - aTime;
      });

      setArticles(sortedArticles);
      setArticlesLoading(false);
    } catch (error) {
      console.error(error);
      setArticlesLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  const uploadImageToImgBB = async (file: File) => {
    if (!imgbbApiKey) {
      throw new Error('Missing IMGBB API key. Set VITE_IMGBB_API_KEY in your .env file.');
    }

    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(`https://api.imgbb.com/1/upload?key=${imgbbApiKey}`, {
      method: 'POST',
      body: formData,
    });

    const result = (await response.json()) as ImgBBUploadResponse;
    const imageUrl = result?.data?.url;

    if (!response.ok || !result?.success || !imageUrl) {
      throw new Error(result?.error?.message || 'Failed to upload image to ImgBB.');
    }

    return imageUrl;
  };

  const handleAddProject = async (e: FormEvent) => {
    e.preventDefault();
    setProjectErrorMessage('');
    setProjectStatus('submitting');
    try {
      if (!projectImageFile) {
        throw new Error('Please select a project image.');
      }

      const techArray = projectData.tech.split(',').map(item => item.trim()).filter(item => item !== '');
      const featuresArray = projectData.features.split(',').map(item => item.trim()).filter(item => item !== '');
      const challengesArray = projectData.challenges.split(',').map(item => item.trim()).filter(item => item !== '');
      const outcomesArray = projectData.outcomes.split(',').map(item => item.trim()).filter(item => item !== '');

      const normalizedDemoUrl = projectData.demoUrl.trim() || projectData.link.trim();
      const normalizedRepoUrl = projectData.repoUrl.trim() || projectData.link.trim();
      const imageUrl = await uploadImageToImgBB(projectImageFile);

      await addDoc(collection(db, 'projects'), {
        imageUrl,
        title: projectData.title,
        description: projectData.description,
        fullDescription: projectData.fullDescription || projectData.description,
        tech: techArray,
        features: featuresArray,
        challenges: challengesArray,
        outcomes: outcomesArray,
        role: projectData.role,
        duration: projectData.duration,
        status: projectData.status,
        demoUrl: normalizedDemoUrl,
        repoUrl: normalizedRepoUrl,
        link: projectData.link || normalizedDemoUrl
      });
      setProjectStatus('success');
      setProjectImageFile(null);
      setProjectData({
        title: '',
        description: '',
        fullDescription: '',
        tech: '',
        features: '',
        challenges: '',
        outcomes: '',
        role: '',
        duration: '',
        status: 'Completed',
        demoUrl: '',
        repoUrl: '',
        link: '',
      });
      setTimeout(() => setProjectStatus('idle'), 3000);
    } catch (error) {
      console.error(error);
      setProjectErrorMessage(error instanceof Error ? error.message : 'Unable to add project.');
      setProjectStatus('error');
    }
  };

  const handleAddBlog = async (e: FormEvent) => {
    e.preventDefault();
    setBlogErrorMessage('');
    setBlogStatus('submitting');
    try {
      if (!blogImageFile) {
        throw new Error('Please select an article image.');
      }

      const toolsArray = blogData.tools.split(',').map(item => item.trim()).filter(item => item !== '');
      const takeawaysArray = blogData.keyTakeaways.split(',').map(item => item.trim()).filter(item => item !== '');
      const referenceLinksArray = blogData.referenceLinks.split(',').map(item => item.trim()).filter(item => item !== '');
      const imageUrl = await uploadImageToImgBB(blogImageFile);

      await addDoc(collection(db, 'posts'), {
        imageUrl,
        title: blogData.title,
        excerpt: blogData.excerpt,
        content: blogData.content || blogData.excerpt,
        category: blogData.category,
        date: blogData.date,
        readTime: blogData.readTime,
        audience: blogData.audience,
        difficulty: blogData.difficulty,
        tools: toolsArray,
        keyTakeaways: takeawaysArray,
        referenceLinks: referenceLinksArray,
      });
      setBlogStatus('success');
      setBlogImageFile(null);
      setBlogData({
        title: '',
        excerpt: '',
        content: '',
        category: 'Software',
        date: '',
        readTime: '',
        audience: '',
        difficulty: 'Intermediate',
        tools: '',
        keyTakeaways: '',
        referenceLinks: '',
      });
      setTimeout(() => setBlogStatus('idle'), 3000);
    } catch (error) {
      console.error(error);
      setBlogErrorMessage(error instanceof Error ? error.message : 'Unable to publish article.');
      setBlogStatus('error');
    }
  };

  const fetchCurrentCv = async () => {
    try {
      const cvDocRef = doc(db, 'settings', 'cv');
      const cvDoc = await getDoc(cvDocRef);
      if (cvDoc.exists()) {
        const data = cvDoc.data() as { url?: string; fileName?: string };
        setCurrentCvUrl(data.url ?? '');
        setCurrentCvName(data.fileName ?? '');
        setExternalCvUrl(data.url ?? '');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleSaveExternalCvUrl = async (e: FormEvent) => {
    e.preventDefault();

    if (!externalCvUrl.trim()) {
      setExternalCvError('Please enter a valid CV URL.');
      setExternalCvStatus('error');
      return;
    }

    const normalizedUrl = externalCvUrl.trim();
    if (!/^https?:\/\//i.test(normalizedUrl)) {
      setExternalCvError('URL must start with http:// or https://');
      setExternalCvStatus('error');
      return;
    }

    setExternalCvError('');
    setExternalCvStatus('submitting');

    try {
      await setDoc(doc(db, 'settings', 'cv'), {
        url: normalizedUrl,
        fileName: 'External CV Link',
        source: 'external-url',
        updatedAt: new Date(),
      });

      setCurrentCvUrl(normalizedUrl);
      setCurrentCvName('External CV Link');
      setExternalCvStatus('success');
      setTimeout(() => setExternalCvStatus('idle'), 3000);
    } catch (error) {
      console.error(error);
      setExternalCvError('Failed to save external CV URL.');
      setExternalCvStatus('error');
    }
  };

  // Project Edit & Delete Handlers
  const handleEditProject = (projectId: string) => {
    const project = projects.find((p) => p.id === projectId);
    if (project) {
      setProjectData({
        title: project.title,
        description: project.description,
        fullDescription: project.fullDescription,
        tech: toCsvString(project.tech),
        features: toCsvString(project.features),
        challenges: toCsvString(project.challenges),
        outcomes: toCsvString(project.outcomes),
        role: project.role,
        duration: project.duration,
        status: project.status,
        demoUrl: project.demoUrl,
        repoUrl: project.repoUrl,
        link: project.link,
      });
      setEditingProjectId(projectId);
      setProjectErrorMessage('');
      setProjectStatus('idle');
      setIsProjectModalOpen(true);
    }
  };

  const handleUpdateProject = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingProjectId) return;

    try {
      setProjectStatus('submitting');
      const project = projects.find((p) => p.id === editingProjectId);
      let imageUrl = project?.imageUrl;

      // Upload new image if provided
      if (projectImageFile) {
        imageUrl = await uploadImageToImgBB(projectImageFile);
      }

      const techArray = toStringArray(projectData.tech);
      const featuresArray = toStringArray(projectData.features);
      const challengesArray = toStringArray(projectData.challenges);
      const outcomesArray = toStringArray(projectData.outcomes);

      const normalizedDemoUrl = projectData.demoUrl.trim() || projectData.link.trim();
      const normalizedRepoUrl = projectData.repoUrl.trim() || projectData.link.trim();

      await updateDoc(doc(db, 'projects', editingProjectId), {
        title: projectData.title,
        description: projectData.description,
        fullDescription: projectData.fullDescription || projectData.description,
        tech: techArray,
        features: featuresArray,
        challenges: challengesArray,
        outcomes: outcomesArray,
        role: projectData.role,
        duration: projectData.duration,
        status: projectData.status,
        demoUrl: normalizedDemoUrl,
        repoUrl: normalizedRepoUrl,
        link: projectData.link || normalizedDemoUrl,
        imageUrl,
        updatedAt: new Date(),
      });

      setProjectStatus('success');
      setEditingProjectId(null);
      setProjectImageFile(null);
      setProjectData({
        title: '',
        description: '',
        fullDescription: '',
        tech: '',
        features: '',
        challenges: '',
        outcomes: '',
        role: '',
        duration: '',
        status: 'Completed',
        demoUrl: '',
        repoUrl: '',
        link: '',
      });
      setIsProjectModalOpen(false);
      setTimeout(() => setProjectStatus('idle'), 3000);
      await fetchProjects();
    } catch (error) {
      console.error(error);
      setProjectErrorMessage(error instanceof Error ? error.message : 'Unable to update project.');
      setProjectStatus('error');
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    try {
      await deleteDoc(doc(db, 'projects', projectId));
      setDeleteProjectConfirm(null);
      await fetchProjects();
    } catch (error) {
      console.error(error);
    }
  };

  // Article Edit & Delete Handlers
  const handleEditArticle = (articleId: string) => {
    const article = articles.find((a) => a.id === articleId);
    if (article) {
      setBlogData({
        title: article.title,
        excerpt: article.excerpt,
        content: article.content,
        category: article.category,
        date: article.date,
        readTime: article.readTime,
        audience: article.audience,
        difficulty: article.difficulty,
        tools: toCsvString(article.tools),
        keyTakeaways: toCsvString(article.keyTakeaways),
        referenceLinks: toCsvString(article.referenceLinks),
      });
      setEditingArticleId(articleId);
      setBlogErrorMessage('');
      setBlogStatus('idle');
      setIsArticleModalOpen(true);
    }
  };

  const handleUpdateArticle = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingArticleId) return;

    try {
      setBlogStatus('submitting');
      const article = articles.find((a) => a.id === editingArticleId);
      let imageUrl = article?.imageUrl;

      // Upload new image if provided
      if (blogImageFile) {
        imageUrl = await uploadImageToImgBB(blogImageFile);
      }

      const toolsArray = toStringArray(blogData.tools);
      const takeawaysArray = toStringArray(blogData.keyTakeaways);
      const referenceLinksArray = toStringArray(blogData.referenceLinks);

      await updateDoc(doc(db, 'posts', editingArticleId), {
        title: blogData.title,
        excerpt: blogData.excerpt,
        content: blogData.content || blogData.excerpt,
        category: blogData.category,
        date: blogData.date,
        readTime: blogData.readTime,
        audience: blogData.audience,
        difficulty: blogData.difficulty,
        tools: toolsArray,
        keyTakeaways: takeawaysArray,
        referenceLinks: referenceLinksArray,
        imageUrl,
        updatedAt: new Date(),
      });

      setBlogStatus('success');
      setEditingArticleId(null);
      setBlogImageFile(null);
      setBlogData({
        title: '',
        excerpt: '',
        content: '',
        category: 'Software',
        date: '',
        readTime: '',
        audience: '',
        difficulty: 'Intermediate',
        tools: '',
        keyTakeaways: '',
        referenceLinks: '',
      });
      setIsArticleModalOpen(false);
      setTimeout(() => setBlogStatus('idle'), 3000);
      await fetchArticles();
    } catch (error) {
      console.error(error);
      setBlogErrorMessage(error instanceof Error ? error.message : 'Unable to update article.');
      setBlogStatus('error');
    }
  };

  const handleDeleteArticle = async (articleId: string) => {
    try {
      await deleteDoc(doc(db, 'posts', articleId));
      setDeleteArticleConfirm(null);
      await fetchArticles();
    } catch (error) {
      console.error(error);
    }
  };

  const cancelEditProject = () => {
    setEditingProjectId(null);
    setProjectData({
      title: '',
      description: '',
      fullDescription: '',
      tech: '',
      features: '',
      challenges: '',
      outcomes: '',
      role: '',
      duration: '',
      status: 'Completed',
      demoUrl: '',
      repoUrl: '',
      link: '',
    });
    setProjectImageFile(null);
  };

  const openNewProjectModal = () => {
    cancelEditProject();
    setProjectErrorMessage('');
    setProjectStatus('idle');
    setIsProjectModalOpen(true);
  };

  const closeProjectModal = () => {
    setIsProjectModalOpen(false);
    cancelEditProject();
    setProjectErrorMessage('');
    setProjectStatus('idle');
  };

  const cancelEditArticle = () => {
    setEditingArticleId(null);
    setBlogData({
      title: '',
      excerpt: '',
      content: '',
      category: 'Software',
      date: '',
      readTime: '',
      audience: '',
      difficulty: 'Intermediate',
      tools: '',
      keyTakeaways: '',
      referenceLinks: '',
    });
    setBlogImageFile(null);
  };

  const openNewArticleModal = () => {
    cancelEditArticle();
    setBlogErrorMessage('');
    setBlogStatus('idle');
    setIsArticleModalOpen(true);
  };

  const closeArticleModal = () => {
    setIsArticleModalOpen(false);
    cancelEditArticle();
    setBlogErrorMessage('');
    setBlogStatus('idle');
  };

  if (loading) {
    return (
      <div className="relative min-h-screen flex items-center justify-center bg-gray-950 text-white overflow-hidden">
        <motion.div
          className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-blue-500/15 blur-3xl"
          animate={!prefersReduced ? { x: [0, 25, 0], y: [0, -20, 0] } : { x: 0, y: 0 }}
          transition={!prefersReduced ? { duration: 7, repeat: Infinity, ease: 'easeInOut' } : { duration: 0 }}
        ></motion.div>
        <div className="flex flex-col items-center gap-4">
          <div className="relative w-14 h-14">
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-blue-400/30"
              animate={!prefersReduced ? { scale: [1, 1.3], opacity: [0.8, 0] } : { scale: 1, opacity: 0.8 }}
              transition={!prefersReduced ? { duration: 1.4, repeat: Infinity } : { duration: 0 }}
            ></motion.div>
            <motion.div
              className="w-14 h-14 rounded-full border-3 border-blue-400 border-t-transparent"
              animate={!prefersReduced ? { rotate: 360 } : { rotate: 0 }}
              transition={!prefersReduced ? { duration: 1, repeat: Infinity, ease: 'linear' } : { duration: 0 }}
            ></motion.div>
          </div>
          <p className="text-sm text-blue-100">Opening Vault...</p>
        </div>
      </div>
    );
  }

  if (adminCheckDone && !isAdmin) {
    return (
      <section className="relative min-h-screen overflow-hidden py-10 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-gray-950 text-gray-900 dark:text-white">
        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="rounded-2xl border border-gray-200/60 dark:border-gray-700/60 bg-white/80 dark:bg-gray-900/70 backdrop-blur-xl p-8 md:p-10 shadow-xl text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide uppercase bg-red-100/80 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200/70 dark:border-red-700/40 mb-4">
              <FiShield className="w-3.5 h-3.5" />
              Access Restricted
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tight text-gray-900 dark:text-white mb-3">
              Admin Claim Required
            </h1>
            <p className="text-sm md:text-base text-gray-600 dark:text-gray-300 mb-7">
              Your account is authenticated but does not have the <span className="font-semibold">admin</span> custom claim yet. Sign out and sign in again after claim assignment.
            </p>

            <div className="flex flex-wrap justify-center gap-3">
              <motion.button
                onClick={() => navigate('/')}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 transition-all cursor-pointer"
              >
                <FiArrowLeft className="w-4 h-4" />
                Back to Portfolio
              </motion.button>
              <motion.button
                onClick={handleLogout}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.97 }}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-red-600 hover:bg-red-700 shadow-lg transition-all cursor-pointer"
              >
                <FiLogOut className="w-4 h-4" />
                Logout
              </motion.button>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="relative min-h-screen overflow-hidden py-10 px-4 sm:px-6 lg:px-8 bg-slate-50 dark:bg-gray-950 text-gray-900 dark:text-white">
      <motion.div
        className="absolute -top-24 left-0 w-96 h-96 rounded-full bg-blue-500/20 blur-3xl dark:bg-blue-500/10"
        animate={!prefersReduced ? { x: [0, 30, 0], y: [0, -20, 0] } : { x: 0, y: 0 }}
        transition={!prefersReduced ? { duration: 9, repeat: Infinity, ease: 'easeInOut' } : { duration: 0 }}
      ></motion.div>
      <motion.div
        className="absolute -bottom-20 right-0 w-96 h-96 rounded-full bg-pink-500/15 blur-3xl dark:bg-pink-500/10"
        animate={!prefersReduced ? { x: [0, -25, 0], y: [0, 20, 0] } : { x: 0, y: 0 }}
        transition={!prefersReduced ? { duration: 11, repeat: Infinity, ease: 'easeInOut' } : { duration: 0 }}
      ></motion.div>

      <div className="relative z-10 max-w-6xl mx-auto">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          <motion.header
            variants={itemVariants}
            className="rounded-2xl border border-gray-200/60 dark:border-gray-700/60 bg-white/80 dark:bg-gray-900/70 backdrop-blur-xl p-6 md:p-8 shadow-xl"
          >
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide uppercase bg-blue-100/80 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200/70 dark:border-blue-700/40">
                  <FiShield className="w-3.5 h-3.5" />
                  Secure Dashboard - Admin Verified
                </div>
                <h1 className="text-3xl md:text-4xl font-black tracking-tight text-gray-900 dark:text-white">
                  Admin Vault
                </h1>
                <p className="text-sm md:text-base text-gray-600 dark:text-gray-300 max-w-xl">
                  Manage inbound messages and publish fresh portfolio content from one command center.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <motion.button
                  onClick={() => navigate('/')}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 transition-all cursor-pointer"
                >
                  <FiArrowLeft className="w-4 h-4" />
                  Back to Portfolio
                </motion.button>
                <motion.button
                  onClick={handleLogout}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-red-600 hover:bg-red-700 shadow-lg transition-all cursor-pointer"
                >
                  <FiLogOut className="w-4 h-4" />
                  Logout
                </motion.button>
              </div>
            </div>
          </motion.header>

          <motion.nav variants={itemVariants} className="flex flex-wrap gap-3">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.key;
              return (
                <motion.button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  className={`relative inline-flex items-center gap-2 px-5 py-3 rounded-xl font-semibold border transition-all cursor-pointer ${
                    isActive
                      ? 'text-white border-transparent shadow-lg'
                      : 'text-gray-700 dark:text-gray-300 bg-white/80 dark:bg-gray-900/60 border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600'
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="vault-active-tab"
                      className="absolute inset-0 rounded-xl bg-blue-600"
                      transition={{ type: 'spring', stiffness: 280, damping: 30 }}
                    ></motion.span>
                  )}
                  <span className="relative z-10 inline-flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </span>
                </motion.button>
              );
            })}
          </motion.nav>

          <motion.div
            variants={itemVariants}
            className="rounded-2xl border border-gray-200/60 dark:border-gray-700/60 bg-white/80 dark:bg-gray-900/70 backdrop-blur-xl p-6 md:p-8 shadow-xl"
          >
            <AnimatePresence mode="wait">
              {activeTab === 'messages' && (
                <motion.div
                  key="messages"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between border-b border-gray-200/70 dark:border-gray-700/70 pb-4">
                    <h2 className="text-2xl font-bold inline-flex items-center gap-2">
                      <FiInbox className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      Inbox Messages
                    </h2>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800/40">
                      {messages.length} Total
                    </span>
                  </div>

                  {messages.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-gray-300 dark:border-gray-700 py-12 text-center">
                      <p className="text-gray-500 dark:text-gray-400">No messages yet.</p>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {messages.map((msg, index) => (
                        <motion.article
                          key={msg.id}
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: index * 0.04, duration: 0.3 }}
                          whileHover={{ y: -2 }}
                          className="rounded-xl border border-gray-200/70 dark:border-gray-700/70 bg-white dark:bg-gray-900/70 p-5 shadow-sm"
                        >
                          <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3 mb-3">
                            <div>
                              <h3 className="font-bold text-lg text-gray-900 dark:text-white">{msg.name}</h3>
                              <a
                                href={`mailto:${msg.email}`}
                                className="text-sm text-blue-600 dark:text-blue-400 hover:underline"
                              >
                                {msg.email}
                              </a>
                            </div>
                            <span className="text-xs font-medium text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full border border-gray-200 dark:border-gray-700">
                              {msg.timestamp?.toDate?.() ? msg.timestamp.toDate().toLocaleString() : 'No timestamp'}
                            </span>
                          </div>
                          <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">{msg.message}</p>
                        </motion.article>
                      ))}
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'projects' && (
                <motion.div
                  key="projects"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-6"
                >
                  <div className="flex flex-wrap items-center justify-end gap-3">
                    <motion.button
                      type="button"
                      onClick={openNewProjectModal}
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:bg-blue-700 cursor-pointer"
                    >
                      <FiBriefcase className="w-4 h-4" />
                      New Project
                    </motion.button>
                  </div>

                  {projectsLoading ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500 dark:text-gray-400">Loading projects...</p>
                    </div>
                  ) : (
                    <>
                      {projects.length > 0 && (
                        <div className="space-y-4">
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Existing Projects</h3>
                          <div className="grid gap-4 xl:grid-cols-2">
                            {projects.map((project, index) => (
                              <motion.div
                                key={project.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                whileHover={{ y: -4 }}
                                className="group overflow-hidden rounded-3xl border border-gray-200/70 dark:border-gray-700/70 bg-white/90 dark:bg-gray-900/80 shadow-lg hover:shadow-2xl transition-all"
                              >
                                <div className="grid xl:grid-cols-[280px,1fr]">
                                  <div className="relative min-h-60 overflow-hidden bg-slate-900">
                                    {project.imageUrl ? (
                                      <img
                                        src={project.imageUrl}
                                        alt={project.title}
                                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                                        loading="lazy"
                                      />
                                    ) : (
                                      <div className="absolute inset-0 bg-blue-600" />
                                    )}
                                    <div className="absolute inset-0 bg-black/60" />
                                    <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                                      <div className="flex flex-wrap items-center gap-2">
                                        <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
                                          <FiBriefcase className="h-3.5 w-3.5" />
                                          Project
                                        </span>
                                        <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-100 backdrop-blur-sm">
                                          {project.status}
                                        </span>
                                      </div>
                                      <p className="mt-3 text-sm text-white/80">{project.role || 'Portfolio project'}</p>
                                    </div>
                                  </div>

                                  <div className="flex flex-col gap-5 p-5 md:p-6">
                                    <div>
                                      <div className="flex flex-wrap items-start justify-between gap-3">
                                        <div>
                                          <h4 className="text-xl font-bold text-gray-900 dark:text-white">{project.title}</h4>
                                          <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300">
                                            {toPreviewText(project.description || project.fullDescription, 220)}
                                          </p>
                                        </div>
                                      </div>

                                      <div className="mt-4 grid gap-3 sm:grid-cols-3">
                                        <div className="rounded-2xl border border-gray-200/70 dark:border-gray-700/70 bg-gray-50/80 dark:bg-gray-800/50 px-4 py-3">
                                          <p className="text-[11px] uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">Role</p>
                                          <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">{project.role || 'Not specified'}</p>
                                        </div>
                                        <div className="rounded-2xl border border-gray-200/70 dark:border-gray-700/70 bg-gray-50/80 dark:bg-gray-800/50 px-4 py-3">
                                          <p className="text-[11px] uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">Duration</p>
                                          <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">{project.duration || 'Not specified'}</p>
                                        </div>
                                        <div className="rounded-2xl border border-gray-200/70 dark:border-gray-700/70 bg-gray-50/80 dark:bg-gray-800/50 px-4 py-3">
                                          <p className="text-[11px] uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">Tech Stack</p>
                                          <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">{toDisplayArray(project.tech).slice(0, 2).join(' • ') || 'Not specified'}</p>
                                        </div>
                                      </div>

                                      <div className="mt-4 flex flex-wrap gap-2">
                                        {toDisplayArray(project.tech).slice(0, 4).map((tech) => (
                                          <span
                                            key={`${project.id}-${tech}`}
                                            className="inline-flex items-center rounded-full border border-blue-200/70 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 dark:border-blue-800/40 dark:bg-blue-900/25 dark:text-blue-200"
                                          >
                                            {tech}
                                          </span>
                                        ))}
                                      </div>
                                    </div>

                                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-200/70 dark:border-gray-700/70 pt-4">
                                      <div className="flex flex-wrap gap-2">
                                        <span className="inline-flex items-center rounded-full bg-purple-100 px-3 py-1 text-xs font-semibold text-purple-700 dark:bg-purple-900/30 dark:text-purple-200">
                                          {project.status}
                                        </span>
                                        {project.link && (
                                          <span className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                                            Live link ready
                                          </span>
                                        )}
                                      </div>

                                      <div className="flex gap-2">
                                        <motion.button
                                          onClick={() => handleEditProject(project.id)}
                                          whileHover={{ scale: 1.03 }}
                                          whileTap={{ scale: 0.97 }}
                                          className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 cursor-pointer"
                                        >
                                          <FiEdit3 className="w-4 h-4" />
                                          Edit
                                        </motion.button>
                                        <motion.button
                                          onClick={() => setDeleteProjectConfirm(project.id)}
                                          whileHover={{ scale: 1.03 }}
                                          whileTap={{ scale: 0.97 }}
                                          className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-100 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-200 dark:hover:bg-red-900/30 cursor-pointer"
                                        >
                                          <FiTrash2 className="w-4 h-4" />
                                          Delete
                                        </motion.button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {typeof document !== 'undefined' &&
                    createPortal(
                      <AnimatePresence>
                        {isProjectModalOpen && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-4 sm:p-6"
                            onClick={closeProjectModal}
                          >
                            <motion.div
                              initial={{ scale: 0.96, opacity: 0, y: 16 }}
                              animate={{ scale: 1, opacity: 1, y: 0 }}
                              exit={{ scale: 0.96, opacity: 0, y: 16 }}
                              transition={{ duration: 0.2 }}
                              onClick={(e) => e.stopPropagation()}
                              className="relative my-8 w-full max-w-5xl overflow-hidden rounded-3xl border border-gray-200/70 dark:border-gray-700/70 bg-white/95 dark:bg-gray-950/95 shadow-2xl"
                            >
                              <div className="max-h-[85vh] overflow-y-auto p-6 md:p-8">
                                <div className="flex items-start justify-between gap-4 mb-6">
                                  <h2 className="text-2xl font-bold inline-flex items-center gap-2">
                                    <FiBriefcase className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                    {editingProjectId ? 'Edit Project' : 'Publish New Project'}
                                  </h2>
                                  <motion.button
                                    type="button"
                                    onClick={closeProjectModal}
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                    className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-gray-100 px-3 py-2 text-gray-700 transition hover:bg-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 cursor-pointer"
                                    aria-label="Close project form"
                                  >
                                    <FiX className="w-4 h-4" />
                                  </motion.button>
                                </div>
                                {editingProjectId && (
                                  <div className="mb-4 p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200/70 dark:border-blue-700/40">
                                    <p className="text-sm text-blue-700 dark:text-blue-300">
                                      You are editing a project. Changes will update the existing data.
                                    </p>
                                  </div>
                                )}
                                <form onSubmit={editingProjectId ? handleUpdateProject : handleAddProject} className="max-w-3xl space-y-4">
                    <div>
                       <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Project Image {!editingProjectId && <span className="text-red-500">*</span>}</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setProjectImageFile(e.target.files?.[0] ?? null)}
                        className="w-full px-4 py-2.5 rounded-lg bg-gray-50/90 dark:bg-gray-800/80 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white file:mr-3 file:rounded-md file:border-0 file:bg-blue-600 file:px-3 file:py-1.5 file:text-white hover:file:bg-blue-700 transition"
                        required={!editingProjectId}
                      />
                       <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{editingProjectId ? 'Leave empty to keep current image.' : 'Image is uploaded to ImgBB and stored as URL in Firestore.'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Project Title</label>
                      <input
                        type="text"
                        value={projectData.title}
                        onChange={(e) => setProjectData({ ...projectData, title: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg bg-gray-50/90 dark:bg-gray-800/80 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none transition"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Description</label>
                      <textarea
                        rows={4}
                        value={projectData.description}
                        onChange={(e) => setProjectData({ ...projectData, description: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg bg-gray-50/90 dark:bg-gray-800/80 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none resize-none transition"
                        required
                      ></textarea>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Full Description (for Read More popup)</label>
                      <textarea
                        rows={4}
                        value={projectData.fullDescription}
                        onChange={(e) => setProjectData({ ...projectData, fullDescription: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg bg-gray-50/90 dark:bg-gray-800/80 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none resize-none transition"
                        placeholder="Expanded project overview, architecture decisions, implementation details..."
                      ></textarea>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Technologies</label>
                        <input
                          type="text"
                          placeholder="React, TypeScript, ESP32"
                          value={projectData.tech}
                          onChange={(e) => setProjectData({ ...projectData, tech: e.target.value })}
                          className="w-full px-4 py-3 rounded-lg bg-gray-50/90 dark:bg-gray-800/80 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none transition"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Fallback Link</label>
                        <input
                          type="text"
                          placeholder="https://your-main-link.com"
                          value={projectData.link}
                          onChange={(e) => setProjectData({ ...projectData, link: e.target.value })}
                          className="w-full px-4 py-3 rounded-lg bg-gray-50/90 dark:bg-gray-800/80 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none transition"
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Role</label>
                        <input
                          type="text"
                          placeholder="Full Stack & IoT Developer"
                          value={projectData.role}
                          onChange={(e) => setProjectData({ ...projectData, role: e.target.value })}
                          className="w-full px-4 py-3 rounded-lg bg-gray-50/90 dark:bg-gray-800/80 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none transition"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Duration</label>
                        <input
                          type="text"
                          placeholder="e.g. 3 months"
                          value={projectData.duration}
                          onChange={(e) => setProjectData({ ...projectData, duration: e.target.value })}
                          className="w-full px-4 py-3 rounded-lg bg-gray-50/90 dark:bg-gray-800/80 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none transition"
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Status</label>
                        <select
                          value={projectData.status}
                          onChange={(e) => setProjectData({ ...projectData, status: e.target.value })}
                          className="w-full px-4 py-3 rounded-lg bg-gray-50/90 dark:bg-gray-800/80 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none transition"
                        >
                          <option value="Completed">Completed</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Maintenance">Maintenance</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Demo URL</label>
                        <input
                          type="url"
                          placeholder="https://demo-link.com"
                          value={projectData.demoUrl}
                          onChange={(e) => setProjectData({ ...projectData, demoUrl: e.target.value })}
                          className="w-full px-4 py-3 rounded-lg bg-gray-50/90 dark:bg-gray-800/80 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none transition"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Repository URL</label>
                        <input
                          type="url"
                          placeholder="https://github.com/..."
                          value={projectData.repoUrl}
                          onChange={(e) => setProjectData({ ...projectData, repoUrl: e.target.value })}
                          className="w-full px-4 py-3 rounded-lg bg-gray-50/90 dark:bg-gray-800/80 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none transition"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Key Features (comma separated)</label>
                        <input
                          type="text"
                          placeholder="Realtime alerts, Admin dashboard, Role-based auth"
                          value={projectData.features}
                          onChange={(e) => setProjectData({ ...projectData, features: e.target.value })}
                          className="w-full px-4 py-3 rounded-lg bg-gray-50/90 dark:bg-gray-800/80 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none transition"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Challenges Solved (comma separated)</label>
                        <input
                          type="text"
                          placeholder="Low latency streaming, Sensor noise filtering"
                          value={projectData.challenges}
                          onChange={(e) => setProjectData({ ...projectData, challenges: e.target.value })}
                          className="w-full px-4 py-3 rounded-lg bg-gray-50/90 dark:bg-gray-800/80 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none transition"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Outcomes (comma separated)</label>
                        <input
                          type="text"
                          placeholder="40% faster response time, Reduced manual effort"
                          value={projectData.outcomes}
                          onChange={(e) => setProjectData({ ...projectData, outcomes: e.target.value })}
                          className="w-full px-4 py-3 rounded-lg bg-gray-50/90 dark:bg-gray-800/80 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none transition"
                        />
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 pt-1">
                      <motion.button
                        type="submit"
                        disabled={projectStatus === 'submitting'}
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-lg transition disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                      >
                        <FiSend className="w-4 h-4" />
                        {projectStatus === 'submitting' ? 'Saving...' : editingProjectId ? 'Update Project' : 'Publish Project'}
                      </motion.button>
                      {editingProjectId && (
                        <motion.button
                          type="button"
                          onClick={cancelEditProject}
                          whileHover={{ y: -2 }}
                          whileTap={{ scale: 0.98 }}
                          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 shadow-lg transition cursor-pointer"
                        >
                          <FiX className="w-4 h-4" />
                          Cancel
                        </motion.button>
                      )}
                      {projectStatus === 'success' && (
                        <span className="inline-flex items-center gap-1.5 text-sm font-medium text-green-600 dark:text-green-400">
                          <FiCheckCircle className="w-4 h-4" />
                          {editingProjectId ? 'Project updated successfully.' : 'Project added successfully.'}
                        </span>
                      )}
                      {projectStatus === 'error' && (
                        <span className="inline-flex items-center gap-1.5 text-sm font-medium text-red-600 dark:text-red-400">
                          <FiAlertCircle className="w-4 h-4" />
                          {projectErrorMessage || 'Unable to save project.'}
                        </span>
                      )}
                    </div>
                                </form>
                              </div>
                            </motion.div>
                          </motion.div>
                        )}
                      </AnimatePresence>,
                      document.body,
                    )}

                  <AnimatePresence>
                    {deleteProjectConfirm && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                        onClick={() => setDeleteProjectConfirm(null)}
                      >
                        <motion.div
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.9, opacity: 0 }}
                          onClick={(e) => e.stopPropagation()}
                          className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200/70 dark:border-gray-700/70 shadow-2xl p-6 max-w-sm w-full"
                        >
                          <div className="flex items-start gap-4 mb-4">
                            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0">
                              <FiAlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                            </div>
                            <div>
                              <h3 className="font-bold text-lg text-gray-900 dark:text-white">Delete Project?</h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                This will permanently delete the project. This action cannot be undone.
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-3 justify-end">
                            <motion.button
                              onClick={() => setDeleteProjectConfirm(null)}
                              whileHover={{ y: -2 }}
                              whileTap={{ scale: 0.97 }}
                              className="px-4 py-2 rounded-lg font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition cursor-pointer"
                            >
                              Cancel
                            </motion.button>
                            <motion.button
                              onClick={() => handleDeleteProject(deleteProjectConfirm)}
                              whileHover={{ y: -2 }}
                              whileTap={{ scale: 0.97 }}
                              className="px-4 py-2 rounded-lg font-medium bg-red-600 text-white hover:bg-red-700 transition cursor-pointer"
                            >
                              Delete
                            </motion.button>
                          </div>
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}

              {activeTab === 'blog' && (
                <motion.div
                  key="blog"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-6"
                >
                  <div className="flex flex-wrap items-center justify-end gap-3">
                    <motion.button
                      type="button"
                      onClick={openNewArticleModal}
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      className="inline-flex items-center gap-2 rounded-xl bg-pink-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg transition hover:bg-pink-700 cursor-pointer"
                    >
                      <FiEdit3 className="w-4 h-4" />
                      New Article
                    </motion.button>
                  </div>

                  {articlesLoading ? (
                    <div className="text-center py-8">
                      <p className="text-gray-500 dark:text-gray-400">Loading articles...</p>
                    </div>
                  ) : (
                    <>
                      {articles.length > 0 && (
                        <div className="space-y-4">
                          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Existing Articles</h3>
                          <div className="grid gap-4 xl:grid-cols-2">
                            {articles.map((article, index) => (
                              <motion.div
                                key={article.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                whileHover={{ y: -4 }}
                                className="group overflow-hidden rounded-3xl border border-gray-200/70 dark:border-gray-700/70 bg-white/90 dark:bg-gray-900/80 shadow-lg hover:shadow-2xl transition-all"
                              >
                                <div className="grid xl:grid-cols-[280px,1fr]">
                                  <div className="relative min-h-60 overflow-hidden bg-slate-900">
                                    {article.imageUrl ? (
                                      <img
                                        src={article.imageUrl}
                                        alt={article.title}
                                        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                                        loading="lazy"
                                      />
                                    ) : (
                                      <div className="absolute inset-0 bg-pink-600" />
                                    )}
                                    <div className="absolute inset-0 bg-black/60" />
                                    <div className="absolute inset-x-0 bottom-0 p-5 text-white">
                                      <div className="flex flex-wrap items-center gap-2">
                                        <span className="inline-flex items-center gap-1 rounded-full bg-white/15 px-3 py-1 text-xs font-semibold backdrop-blur-sm">
                                          <FiFileText className="h-3.5 w-3.5" />
                                          Article
                                        </span>
                                        <span className="rounded-full bg-amber-500/20 px-3 py-1 text-xs font-semibold text-amber-100 backdrop-blur-sm">
                                          {article.category}
                                        </span>
                                      </div>
                                      <p className="mt-3 text-sm text-white/80">{article.audience || 'Featured writing'}</p>
                                    </div>
                                  </div>

                                  <div className="flex flex-col gap-5 p-5 md:p-6">
                                    <div>
                                      <div className="flex flex-wrap items-start justify-between gap-3">
                                        <div>
                                          <h4 className="text-xl font-bold text-gray-900 dark:text-white">{article.title}</h4>
                                          <p className="mt-2 text-sm leading-6 text-gray-600 dark:text-gray-300">
                                            {toPreviewText(article.excerpt || article.content, 220)}
                                          </p>
                                        </div>
                                      </div>

                                      <div className="mt-4 grid gap-3 sm:grid-cols-3">
                                        <div className="rounded-2xl border border-gray-200/70 dark:border-gray-700/70 bg-gray-50/80 dark:bg-gray-800/50 px-4 py-3">
                                          <p className="text-[11px] uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">Read Time</p>
                                          <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">{article.readTime || 'Not specified'}</p>
                                        </div>
                                        <div className="rounded-2xl border border-gray-200/70 dark:border-gray-700/70 bg-gray-50/80 dark:bg-gray-800/50 px-4 py-3">
                                          <p className="text-[11px] uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">Difficulty</p>
                                          <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">{article.difficulty || 'Not specified'}</p>
                                        </div>
                                        <div className="rounded-2xl border border-gray-200/70 dark:border-gray-700/70 bg-gray-50/80 dark:bg-gray-800/50 px-4 py-3">
                                          <p className="text-[11px] uppercase tracking-[0.2em] text-gray-500 dark:text-gray-400">Published</p>
                                          <p className="mt-1 text-sm font-semibold text-gray-900 dark:text-white">{article.date || 'Not specified'}</p>
                                        </div>
                                      </div>

                                      <div className="mt-4 flex flex-wrap gap-2">
                                        {toDisplayArray(article.tools).slice(0, 4).map((tool) => (
                                          <span
                                            key={`${article.id}-${tool}`}
                                            className="inline-flex items-center rounded-full border border-pink-200/70 bg-pink-50 px-3 py-1 text-xs font-medium text-pink-700 dark:border-pink-800/40 dark:bg-pink-900/25 dark:text-pink-200"
                                          >
                                            {tool}
                                          </span>
                                        ))}
                                      </div>
                                    </div>

                                    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-200/70 dark:border-gray-700/70 pt-4">
                                      <div className="flex flex-wrap gap-2">
                                        <span className="inline-flex items-center rounded-full bg-pink-100 px-3 py-1 text-xs font-semibold text-pink-700 dark:bg-pink-900/30 dark:text-pink-200">
                                          {article.category}
                                        </span>
                                        <span className="inline-flex items-center rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700 dark:bg-amber-900/30 dark:text-amber-200">
                                          {article.difficulty}
                                        </span>
                                      </div>

                                      <div className="flex gap-2">
                                        <motion.button
                                          onClick={() => handleEditArticle(article.id)}
                                          whileHover={{ scale: 1.03 }}
                                          whileTap={{ scale: 0.97 }}
                                          className="inline-flex items-center gap-2 rounded-xl bg-pink-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-pink-700 cursor-pointer"
                                        >
                                          <FiEdit3 className="w-4 h-4" />
                                          Edit
                                        </motion.button>
                                        <motion.button
                                          onClick={() => setDeleteArticleConfirm(article.id)}
                                          whileHover={{ scale: 1.03 }}
                                          whileTap={{ scale: 0.97 }}
                                          className="inline-flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-semibold text-red-700 transition hover:bg-red-100 dark:border-red-900/40 dark:bg-red-900/20 dark:text-red-200 dark:hover:bg-red-900/30 cursor-pointer"
                                        >
                                          <FiTrash2 className="w-4 h-4" />
                                          Delete
                                        </motion.button>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            ))}
                          </div>
                        </div>
                      )}
                    </>
                  )}

                  {typeof document !== 'undefined' &&
                    createPortal(
                      <AnimatePresence>
                        {isArticleModalOpen && (
                          <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/60 p-4 sm:p-6"
                            onClick={closeArticleModal}
                          >
                            <motion.div
                              initial={{ scale: 0.96, opacity: 0, y: 16 }}
                              animate={{ scale: 1, opacity: 1, y: 0 }}
                              exit={{ scale: 0.96, opacity: 0, y: 16 }}
                              transition={{ duration: 0.2 }}
                              onClick={(e) => e.stopPropagation()}
                              className="relative my-8 w-full max-w-5xl overflow-hidden rounded-3xl border border-gray-200/70 dark:border-gray-700/70 bg-white/95 dark:bg-gray-950/95 shadow-2xl"
                            >
                              <div className="max-h-[85vh] overflow-y-auto p-6 md:p-8">
                                <div className="flex items-start justify-between gap-4 mb-6">
                                  <h2 className="text-2xl font-bold inline-flex items-center gap-2">
                                    <FiEdit3 className="w-5 h-5 text-pink-600 dark:text-pink-400" />
                                    {editingArticleId ? 'Edit Article' : 'Draft New Article'}
                                  </h2>
                                  <motion.button
                                    type="button"
                                    onClick={closeArticleModal}
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                    className="inline-flex items-center justify-center rounded-xl border border-gray-200 bg-gray-100 px-3 py-2 text-gray-700 transition hover:bg-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700 cursor-pointer"
                                    aria-label="Close article form"
                                  >
                                    <FiX className="w-4 h-4" />
                                  </motion.button>
                                </div>
                                {editingArticleId && (
                                  <div className="mb-4 p-4 rounded-lg bg-pink-50 dark:bg-pink-900/20 border border-pink-200/70 dark:border-pink-700/40">
                                    <p className="text-sm text-pink-700 dark:text-pink-300">
                                      You are editing an article. Changes will update the existing data.
                                    </p>
                                  </div>
                                )}
                                <form onSubmit={editingArticleId ? handleUpdateArticle : handleAddBlog} className="max-w-3xl space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Article Cover Image {!editingArticleId && <span className="text-red-500">*</span>}</label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setBlogImageFile(e.target.files?.[0] ?? null)}
                        className="w-full px-4 py-2.5 rounded-lg bg-gray-50/90 dark:bg-gray-800/80 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white file:mr-3 file:rounded-md file:border-0 file:bg-purple-600 file:px-3 file:py-1.5 file:text-white hover:file:bg-purple-700 transition"
                          required={!editingArticleId}
                      />
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{editingArticleId ? 'Leave empty to keep current image.' : 'Cover image is uploaded to ImgBB and reused in article cards and popup.'}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Article Title</label>
                      <input
                        type="text"
                        value={blogData.title}
                        onChange={(e) => setBlogData({ ...blogData, title: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg bg-gray-50/90 dark:bg-gray-800/80 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none transition"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Short Excerpt</label>
                      <textarea
                        rows={3}
                        value={blogData.excerpt}
                        onChange={(e) => setBlogData({ ...blogData, excerpt: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg bg-gray-50/90 dark:bg-gray-800/80 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none resize-none transition"
                        required
                      ></textarea>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Full Article Content (for Read More popup)</label>
                      <textarea
                        rows={6}
                        value={blogData.content}
                        onChange={(e) => setBlogData({ ...blogData, content: e.target.value })}
                        className="w-full px-4 py-3 rounded-lg bg-gray-50/90 dark:bg-gray-800/80 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none resize-none transition"
                        placeholder="Write the detailed article body, methods, references, and practical insights..."
                      ></textarea>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Category</label>
                        <select
                          value={blogData.category}
                          onChange={(e) => setBlogData({ ...blogData, category: e.target.value })}
                          className="w-full px-4 py-3 rounded-lg bg-gray-50/90 dark:bg-gray-800/80 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none transition"
                        >
                          <option value="Software">Software</option>
                          <option value="Hardware">Hardware</option>
                          <option value="Cybersecurity">Cybersecurity</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Date</label>
                        <input
                          type="text"
                          placeholder="e.g. Apr 1, 2026"
                          value={blogData.date}
                          onChange={(e) => setBlogData({ ...blogData, date: e.target.value })}
                          className="w-full px-4 py-3 rounded-lg bg-gray-50/90 dark:bg-gray-800/80 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none transition"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Read Time</label>
                        <input
                          type="text"
                          placeholder="e.g. 5 min read"
                          value={blogData.readTime}
                          onChange={(e) => setBlogData({ ...blogData, readTime: e.target.value })}
                          className="w-full px-4 py-3 rounded-lg bg-gray-50/90 dark:bg-gray-800/80 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none transition"
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Audience</label>
                        <input
                          type="text"
                          placeholder="Developers, IoT Engineers, Security Analysts"
                          value={blogData.audience}
                          onChange={(e) => setBlogData({ ...blogData, audience: e.target.value })}
                          className="w-full px-4 py-3 rounded-lg bg-gray-50/90 dark:bg-gray-800/80 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none transition"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Difficulty</label>
                        <select
                          value={blogData.difficulty}
                          onChange={(e) => setBlogData({ ...blogData, difficulty: e.target.value })}
                          className="w-full px-4 py-3 rounded-lg bg-gray-50/90 dark:bg-gray-800/80 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none transition"
                        >
                          <option value="Beginner">Beginner</option>
                          <option value="Intermediate">Intermediate</option>
                          <option value="Advanced">Advanced</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Tools and Technologies (comma separated)</label>
                        <input
                          type="text"
                          placeholder="React, Firebase, Wazuh"
                          value={blogData.tools}
                          onChange={(e) => setBlogData({ ...blogData, tools: e.target.value })}
                          className="w-full px-4 py-3 rounded-lg bg-gray-50/90 dark:bg-gray-800/80 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none transition"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Key Takeaways (comma separated)</label>
                        <input
                          type="text"
                          placeholder="Practical setup steps, Security checklist, Common mistakes"
                          value={blogData.keyTakeaways}
                          onChange={(e) => setBlogData({ ...blogData, keyTakeaways: e.target.value })}
                          className="w-full px-4 py-3 rounded-lg bg-gray-50/90 dark:bg-gray-800/80 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none transition"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Reference Links (comma separated URLs)</label>
                        <input
                          type="text"
                          placeholder="https://docs..., https://github.com/..."
                          value={blogData.referenceLinks}
                          onChange={(e) => setBlogData({ ...blogData, referenceLinks: e.target.value })}
                          className="w-full px-4 py-3 rounded-lg bg-gray-50/90 dark:bg-gray-800/80 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none transition"
                        />
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 pt-1">
                      <motion.button
                        type="submit"
                        disabled={blogStatus === 'submitting'}
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-white bg-purple-600 hover:bg-purple-700 shadow-lg transition disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                      >
                        <FiSend className="w-4 h-4" />
                        {blogStatus === 'submitting' ? 'Saving...' : editingArticleId ? 'Update Article' : 'Publish Article'}
                      </motion.button>
                      {editingArticleId && (
                        <motion.button
                          type="button"
                          onClick={cancelEditArticle}
                          whileHover={{ y: -2 }}
                          whileTap={{ scale: 0.98 }}
                          className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-gray-700 dark:text-gray-300 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 shadow-lg transition cursor-pointer"
                        >
                          <FiX className="w-4 h-4" />
                          Cancel
                        </motion.button>
                      )}
                      {blogStatus === 'success' && (
                        <span className="inline-flex items-center gap-1.5 text-sm font-medium text-green-600 dark:text-green-400">
                          <FiCheckCircle className="w-4 h-4" />
                          {editingArticleId ? 'Article updated successfully.' : 'Article published successfully.'}
                        </span>
                      )}
                      {blogStatus === 'error' && (
                        <span className="inline-flex items-center gap-1.5 text-sm font-medium text-red-600 dark:text-red-400">
                          <FiAlertCircle className="w-4 h-4" />
                          {blogErrorMessage || 'Unable to save article.'}
                        </span>
                      )}
                    </div>
                                </form>
                              </div>
                            </motion.div>
                          </motion.div>
                        )}
                      </AnimatePresence>,
                      document.body,
                    )}

                  <AnimatePresence>
                    {deleteArticleConfirm && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
                        onClick={() => setDeleteArticleConfirm(null)}
                      >
                        <motion.div
                          initial={{ scale: 0.9, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          exit={{ scale: 0.9, opacity: 0 }}
                          onClick={(e) => e.stopPropagation()}
                          className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200/70 dark:border-gray-700/70 shadow-2xl p-6 max-w-sm w-full"
                        >
                          <div className="flex items-start gap-4 mb-4">
                            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0">
                              <FiAlertCircle className="w-6 h-6 text-red-600 dark:text-red-400" />
                            </div>
                            <div>
                              <h3 className="font-bold text-lg text-gray-900 dark:text-white">Delete Article?</h3>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                This will permanently delete the article. This action cannot be undone.
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-3 justify-end">
                            <motion.button
                              onClick={() => setDeleteArticleConfirm(null)}
                              whileHover={{ y: -2 }}
                              whileTap={{ scale: 0.97 }}
                              className="px-4 py-2 rounded-lg font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition cursor-pointer"
                            >
                              Cancel
                            </motion.button>
                            <motion.button
                              onClick={() => handleDeleteArticle(deleteArticleConfirm)}
                              whileHover={{ y: -2 }}
                              whileTap={{ scale: 0.97 }}
                              className="px-4 py-2 rounded-lg font-medium bg-red-600 text-white hover:bg-red-700 transition cursor-pointer"
                            >
                              Delete
                            </motion.button>
                          </div>
                        </motion.div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}

              {activeTab === 'cv' && (
                <motion.div
                  key="cv"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.25 }}
                  className="space-y-6"
                >
                  <h2 className="text-2xl font-bold border-b border-gray-200/70 dark:border-gray-700/70 pb-4 inline-flex items-center gap-2">
                    <FiFileText className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    Set CV Link
                  </h2>

                  <form onSubmit={handleSaveExternalCvUrl} className="max-w-3xl space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Public CV URL (Google Drive or any HTTPS PDF link)</label>
                      <input
                        type="url"
                        placeholder="https://.../your-cv.pdf"
                        value={externalCvUrl}
                        onChange={(e) => {
                          setExternalCvUrl(e.target.value);
                          setExternalCvError('');
                          setExternalCvStatus('idle');
                        }}
                        className="w-full px-4 py-3 rounded-lg bg-gray-50/90 dark:bg-gray-800/80 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-white focus:border-blue-500 dark:focus:border-blue-400 focus:outline-none transition"
                        required
                      />
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">Example: https://drive.google.com/uc?export=download&id=FILE_ID</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 pt-1">
                      <motion.button
                        type="submit"
                        disabled={externalCvStatus === 'submitting'}
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        className="inline-flex items-center gap-2 px-6 py-3 rounded-lg font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-lg transition disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                      >
                        <FiExternalLink className="w-4 h-4" />
                        {externalCvStatus === 'submitting' ? 'Saving URL...' : 'Save External CV URL'}
                      </motion.button>

                      {externalCvStatus === 'success' && (
                        <span className="inline-flex items-center gap-1.5 text-sm font-medium text-green-600 dark:text-green-400">
                          <FiCheckCircle className="w-4 h-4" />
                          External CV URL saved.
                        </span>
                      )}

                      {(externalCvStatus === 'error' || externalCvError) && (
                        <span className="inline-flex items-center gap-1.5 text-sm font-medium text-red-600 dark:text-red-400">
                          <FiAlertCircle className="w-4 h-4" />
                          {externalCvError || 'Unable to save URL.'}
                        </span>
                      )}
                    </div>
                  </form>

                  <div className="rounded-xl border border-gray-200/70 dark:border-gray-700/70 bg-white dark:bg-gray-900/70 p-5 shadow-sm">
                    <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">Current public CV:</p>
                    {currentCvUrl ? (
                      <a
                        href={currentCvUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 font-medium hover:underline"
                      >
                        <FiExternalLink className="w-4 h-4" />
                        {currentCvName || 'Open current CV'}
                      </a>
                    ) : (
                      <p className="text-sm text-gray-500 dark:text-gray-400">No CV uploaded yet.</p>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default Vault;