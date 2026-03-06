import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Header from './components/Header';
import Gallery from './components/Gallery';
import Footer from './components/Footer';
import Admin from './components/Admin';
import Blog from './components/Blog';
import BlogPost from './components/BlogPost';
import About from './components/About';
import { DataProvider, useData } from './context/DataContext';
import { useSmoothScroll } from './hooks/useSmoothScroll';
import { useGlobalPreload } from './hooks/useGlobalPreload';

const HomePage: React.FC = () => (
  <>
    <Gallery />
  </>
);

const AppContent: React.FC = () => {
  const { loading, galleryItems, blogPosts } = useData();
  const location = useLocation();
  useSmoothScroll();
  useGlobalPreload(galleryItems, blogPosts);

  if (loading) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
          <p className="text-slate-500 dark:text-slate-400 font-medium animate-pulse">Loading portfolio...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-background-light dark:bg-background-dark">
      <Header />
      <main className="flex-grow pt-8 md:pt-16 overflow-x-hidden">
        <AnimatePresence mode="wait">
          <Routes location={location}>
            <Route
              path="/"
              element={
                <motion.div
                  key="home"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                >
                  <HomePage />
                </motion.div>
              }
            />
            <Route
              path="/about"
              element={
                <motion.div
                  key="about"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                >
                  <About />
                </motion.div>
              }
            />
            <Route
              path="/admin"
              element={
                <motion.div
                  key="admin"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <Admin />
                </motion.div>
              }
            />
            <Route
              path="/blog"
              element={
                <motion.div
                  key="blog"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                >
                  <Blog />
                </motion.div>
              }
            />
            <Route
              path="/blog/:slug"
              element={
                <motion.div
                  key={location.pathname}
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.02 }}
                  transition={{ duration: 0.4, ease: "easeOut" }}
                >
                  <BlogPost />
                </motion.div>
              }
            />
          </Routes>
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  );
};

const App: React.FC = () => {
  return (
    <DataProvider>
      <AppContent />
    </DataProvider>
  );
};

export default App;