import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import About from './components/About';
import Skills from './components/Skills';
import Projects from './components/Projects';
import Experience from './components/Experience';
import Blog from './components/Blog';
import Contact from './components/Contact';
import Footer from './components/Footer';
import Vault from './components/Vault';
import AiAssistant from './components/AiAssistant';

const Home = () => (
  <div className="bg-white dark:bg-gray-900 min-h-screen text-gray-900 dark:text-white transition-colors duration-300">
    <Navbar />
    <Hero />
    <About />
    <Skills />
    <Projects />
    <Experience />
    <Blog />
    <Contact />
    <Footer />
    <AiAssistant />
  </div>
);

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/vault" element={<Vault />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;