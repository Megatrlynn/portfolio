import { useState, useRef, useEffect, type FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMessageCircle, FiX, FiSend, FiCpu } from 'react-icons/fi';

interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
}

const AiAssistant = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      sender: 'ai',
      text: 'Hey there! 👋 I\'m Terachad\'s AI Assistant. I can help you explore his skills in hardware, software, or cybersecurity. What interests you?'
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const generateResponse = (userInput: string) => {
    const lowerInput = userInput.toLowerCase();
    
    if (lowerInput.includes('hardware') || lowerInput.includes('iot') || lowerInput.includes('esp32') || lowerInput.includes('raspberry')) {
      return "Awesome! Hardware is Terachad's forte! Check out his 'VitalTrack Mobility System' and 'Voice-Controlled Robotic Hand' projects. He's a master with C++, Python, and microcontrollers like ESP32 and Raspberry Pi.";
    }
    
    if (lowerInput.includes('security') || lowerInput.includes('cyber') || lowerInput.includes('network') || lowerInput.includes('wazuh')) {
      return "Cybersecurity enthusiast? Perfect! You'll love his 'Smart Home Network Monitor' project. He has hands-on expertise with anomaly detection, Wazuh, and network security. Technical prowess at its finest!";
    }

    if (lowerInput.includes('software') || lowerInput.includes('web') || lowerInput.includes('react') || lowerInput.includes('frontend')) {
      return "Software development is where Terachad shines! He builds stunning, responsive applications with React, TypeScript, and Tailwind CSS. In fact, this portfolio you're exploring right now? He built it with those exact technologies!";
    }

    if (lowerInput.includes('contact') || lowerInput.includes('hire') || lowerInput.includes('email')) {
      return "Great choice! Scroll down to the Contact section to reach out directly. Your message will go straight to his secure database, and he'll get back to you promptly!";
    }

    if (lowerInput.includes('skills') || lowerInput.includes('experience') || lowerInput.includes('resume') || lowerInput.includes('about')) {
      return "Want to learn more? Head to the About section to see his full resume and skill breakdown. You'll find his tech stack, certifications, and professional journey there!";
    }

    if (lowerInput.includes('project') || lowerInput.includes('portfolio') || lowerInput.includes('work')) {
      return "Check out the Projects section! Terachad has built some incredible things across hardware, software, and cybersecurity. Each project showcases his innovation and technical depth.";
    }

    if (lowerInput.includes('blog') || lowerInput.includes('article') || lowerInput.includes('write')) {
      return "Terachad shares his knowledge through blog posts! Visit the Blog section to read about his insights on technology, software design, and engineering best practices.";
    }

    return "That's an interesting question! While I'm just a specialized AI guide, I can tell you Terachad is a versatile ICT professional constantly pushing boundaries. Browse around to explore all his amazing work!";
  };

  const handleSendMessage = (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg: Message = { id: Date.now().toString(), sender: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    setTimeout(() => {
      const aiResponseText = generateResponse(userMsg.text);
      const aiMsg: Message = { id: (Date.now() + 1).toString(), sender: 'ai', text: aiResponseText };
      setMessages(prev => [...prev, aiMsg]);
      setIsTyping(false);
    }, 1500);
  };

  const suggestedQuestions = [
    'Tell me about hardware',
    'Cybersecurity projects?',
    'Software skills?',
  ];

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="fixed bottom-6 right-6 group z-50 cursor-pointer"
          >
            {/* Glow effect */}
            <motion.div
              className="absolute inset-0 bg-linear-to-r from-blue-600 to-purple-600 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              animate={{ scale: [1, 1.1, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            ></motion.div>

            {/* Button */}
            <div className="relative w-16 h-16 bg-linear-to-br from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full shadow-2xl flex items-center justify-center border border-blue-400/30 transition-all duration-300">
              <motion.div
                animate={{ rotate: [0, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <FiMessageCircle size={28} />
              </motion.div>
              
              {/* Pulse indicator */}
              <motion.div
                className="absolute inset-0 rounded-full border-2 border-blue-400"
                animate={{ scale: [1, 1.2], opacity: [1, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              ></motion.div>
            </div>
          </motion.button>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-6 right-6 w-96 rounded-2xl shadow-2xl border border-gray-200/50 dark:border-gray-700/50 z-50 overflow-hidden flex flex-col bg-white dark:bg-gray-900"
            style={{ height: '600px', maxHeight: '85vh' }}
          >
            {/* Animated background gradient */}
            <div className="absolute inset-0 -z-10">
              <motion.div
                className="absolute top-0 left-0 w-96 h-96 bg-linear-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl dark:from-blue-600/5 dark:to-purple-600/5"
                animate={{
                  x: [0, 20, 0],
                  y: [0, -20, 0],
                }}
                transition={{
                  duration: 8,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              ></motion.div>
            </div>

            {/* Header */}
            <motion.div
              className="relative bg-linear-to-r from-blue-600 via-purple-600 to-pink-600 text-white p-5 flex justify-between items-center border-b border-blue-400/20 backdrop-blur-sm"
              layout
            >
              <motion.div
                className="flex items-center gap-3"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                  className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center border border-white/30 backdrop-blur-sm"
                >
                  <FiCpu size={18} />
                </motion.div>
                <div>
                  <h3 className="font-black text-sm tracking-wide">AI GUIDE</h3>
                  <p className="text-xs text-blue-100 font-medium">Portfolio Assistant</p>
                </div>
              </motion.div>
              <motion.button
                onClick={() => setIsOpen(false)}
                whileHover={{ rotate: 90, scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="text-white hover:text-blue-100 transition-colors p-1"
              >
                <FiX size={24} />
              </motion.button>
            </motion.div>

            {/* Messages Container */}
            <div className="flex-1 p-5 overflow-y-auto bg-white dark:bg-gray-900/50 flex flex-col gap-4 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700">
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.4 }}
                  className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.sender === 'ai' ? (
                    <motion.div
                      className="flex gap-2 items-flex-end"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                    >
                      <div className="w-7 h-7 rounded-full bg-linear-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white shrink-0 shadow-md">
                        <FiCpu size={14} />
                      </div>
                      <motion.div
                        className="max-w-xs px-4 py-3 rounded-2xl rounded-tl-none bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border border-gray-200/50 dark:border-gray-700/50 shadow-sm"
                        layout
                      >
                        <p className="text-sm leading-relaxed text-gray-900 dark:text-white">{msg.text}</p>
                      </motion.div>
                    </motion.div>
                  ) : (
                    <motion.div
                      className="max-w-xs px-4 py-3 rounded-2xl rounded-tr-none bg-linear-to-br from-blue-600 to-purple-600 text-white shadow-md"
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0 }}
                    >
                      <p className="text-sm leading-relaxed font-medium">{msg.text}</p>
                    </motion.div>
                  )}
                </motion.div>
              ))}

              {isTyping && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-2 items-center"
                >
                  <div className="w-7 h-7 rounded-full bg-linear-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white shrink-0 shadow-md">
                    <FiCpu size={14} />
                  </div>
                  <div className="px-4 py-3 rounded-2xl rounded-tl-none bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 border border-gray-200/50 dark:border-gray-700/50 flex gap-1 items-center">
                    <motion.div
                      animate={{ scale: [0.8, 1, 0.8] }}
                      transition={{ repeat: Infinity, duration: 0.6, delay: 0 }}
                      className="w-2 h-2 bg-blue-500 rounded-full"
                    ></motion.div>
                    <motion.div
                      animate={{ scale: [0.8, 1, 0.8] }}
                      transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }}
                      className="w-2 h-2 bg-purple-500 rounded-full"
                    ></motion.div>
                    <motion.div
                      animate={{ scale: [0.8, 1, 0.8] }}
                      transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }}
                      className="w-2 h-2 bg-pink-500 rounded-full"
                    ></motion.div>
                  </div>
                </motion.div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Suggested Questions - Show on initial state */}
            {messages.length === 1 && !isTyping && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="px-5 pb-3 space-y-2"
              >
                <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">Quick questions:</p>
                <div className="flex flex-wrap gap-2">
                  {suggestedQuestions.map((question, i) => (
                    <motion.button
                      key={i}
                      onClick={() => {
                        setInput(question);
                      }}
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      className="text-xs px-3 py-1.5 rounded-full bg-linear-to-r from-blue-100 to-purple-100 dark:from-blue-900/30 dark:to-purple-900/30 text-blue-700 dark:text-blue-300 border border-blue-200/50 dark:border-blue-700/50 hover:border-blue-400/50 dark:hover:border-blue-500/50 transition-all duration-200 font-medium"
                    >
                      {question}
                    </motion.button>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Input Form */}
            <motion.form
              onSubmit={handleSendMessage}
              className="p-4 bg-white dark:bg-gray-900/50 border-t border-gray-200/50 dark:border-gray-700/50 flex gap-2 backdrop-blur-sm"
              layout
            >
              <motion.input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything..."
                whileFocus={{ scale: 1.02 }}
                className="flex-1 px-4 py-2 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-purple-500 transition-all duration-200 border border-transparent focus:border-blue-400/50 dark:focus:border-purple-400/50"
              />
              <motion.button
                type="submit"
                disabled={!input.trim() || isTyping}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-2.5 bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <motion.div
                  animate={input.trim() && !isTyping ? { x: [0, 2, 0] } : {}}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                >
                  <FiSend size={18} />
                </motion.div>
              </motion.button>
            </motion.form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AiAssistant;