import React, { useState } from 'react';
import { Moon, Sun, Menu, X } from 'lucide-react';
import { useTheme } from '../hooks/useTheme';
import { NavLink as NavLinkType } from '../types';
import { Link, useLocation } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { motion, AnimatePresence } from 'framer-motion';

const Header: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { galleryItems } = useData();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();

  const dynamicNavLinks: NavLinkType[] = [
    ...(galleryItems || []).map(item => ({
      label: item.title,
      href: '/#work'
    })),
    { label: 'Blog', href: '/blog' },
    { label: 'About', href: '/about' },
    { label: 'Book', href: 'https://mwabonjebooking.netlify.app/', external: true },
  ];

  const handleNavClick = (href: string) => {
    setIsMenuOpen(false);
    if (href.startsWith('/#')) {
      const elementId = href.replace('/#', '');
      if (location.pathname === '/') {
        const element = document.getElementById(elementId);
        element?.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  return (
    <>
      {/* ─── MOBILE HEADER: single compact sticky bar ─── */}
      <header className="md:hidden sticky top-0 z-50 w-full bg-background-light/90 dark:bg-background-dark/90 backdrop-blur-md border-b border-slate-100/50 dark:border-slate-800/50 transition-colors duration-300">
        <div className="flex items-center justify-between px-5 py-3">
          {/* Logo left */}
          <Link to="/" onClick={() => setIsMenuOpen(false)}>
            <span className="font-hand text-2xl text-primary dark:text-white leading-none">
              Mwabonje
            </span>
          </Link>

          {/* Hamburger right — always shows ☰, drawer has its own × */}
          <button
            onClick={() => setIsMenuOpen(true)}
            aria-label="Open Menu"
            className="p-1 text-slate-800 dark:text-slate-200"
          >
            <Menu className="h-6 w-6" strokeWidth={1.8} />
          </button>
        </div>

      </header>

      {/* ─── MOBILE LEFT DRAWER — rendered at root level for correct z-index ─── */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            {/* Dark overlay */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 z-[200] bg-black/40"
              onClick={() => setIsMenuOpen(false)}
            />

            {/* Drawer panel */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'tween', duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
              className="fixed top-0 left-0 h-full w-4/5 max-w-xs z-[210] flex flex-col pt-16 pb-10 px-8 shadow-2xl"
              style={{ backgroundColor: theme === 'dark' ? '#1e1e1e' : '#b8b8b3' }}
            >
              {/* × Close button */}
              <button
                onClick={() => setIsMenuOpen(false)}
                aria-label="Close menu"
                className="absolute top-5 right-6 text-3xl leading-none text-slate-900 dark:text-white hover:opacity-60 transition-opacity"
              >
                ×
              </button>

              {/* Nav links */}
              <nav className="flex flex-col gap-8 mt-2">
                {dynamicNavLinks.map((link, i) =>
                  link.external ? (
                    <motion.a
                      key={link.label}
                      href={link.href}
                      initial={{ opacity: 0, x: -24 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.15 + i * 0.07, ease: 'easeOut' }}
                      onClick={() => setIsMenuOpen(false)}
                      className="text-xl font-display font-bold uppercase tracking-[0.18em] text-slate-900 dark:text-white hover:opacity-50 transition-opacity"
                    >
                      {link.label}
                    </motion.a>
                  ) : (
                    <motion.div
                      key={link.label}
                      initial={{ opacity: 0, x: -24 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.15 + i * 0.07, ease: 'easeOut' }}
                    >
                      <Link
                        to={link.href}
                        onClick={() => handleNavClick(link.href)}
                        className="text-xl font-display font-bold uppercase tracking-[0.18em] text-slate-900 dark:text-white hover:opacity-50 transition-opacity"
                      >
                        {link.label}
                      </Link>
                    </motion.div>
                  )
                )}
              </nav>

              {/* Theme toggle pinned to bottom */}
              <div className="mt-auto">
                <button
                  onClick={toggleTheme}
                  className="p-2 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                  aria-label="Toggle Dark Mode"
                >
                  {theme === 'light'
                    ? <Moon className="h-5 w-5 text-slate-800" strokeWidth={1.8} />
                    : <Sun className="h-5 w-5 text-yellow-300" strokeWidth={1.8} />}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ─── DESKTOP HEADER: large centred logo + sticky nav ─── */}
      <header className="hidden md:block w-full bg-background-light dark:bg-background-dark transition-colors duration-300 pt-4 relative">
        <div className="container mx-auto px-6">
          <div className="relative flex items-center justify-center mb-2">
            <Link to="/" className="group relative z-10 block">
              <h1 className="font-hand text-5xl md:text-7xl text-primary dark:text-white transition-opacity text-center leading-tight">
                Mwabonje
              </h1>
            </Link>

            {/* Desktop theme toggle */}
            <div className="absolute right-0 inset-y-0 flex items-center gap-4 z-[60]">
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none"
                aria-label="Toggle Dark Mode"
              >
                {theme === 'light'
                  ? <Moon className="h-6 w-6 text-slate-800" strokeWidth={2} />
                  : <Sun className="h-6 w-6 text-yellow-400" strokeWidth={2} />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ─── DESKTOP STICKY NAV BAR ─── */}
      <nav className="hidden md:block sticky top-0 z-50 w-full bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-slate-100/50 dark:border-slate-800/50 py-2 transition-all duration-300">
        <div className="container mx-auto px-6">
          <div className="flex flex-wrap justify-center gap-x-6 lg:gap-x-8 gap-y-4">
            {dynamicNavLinks.map(link =>
              link.external ? (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-xs uppercase tracking-[0.15em] text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors font-sans font-normal"
                >
                  {link.label}
                </a>
              ) : (
                <Link
                  key={link.label}
                  to={link.href}
                  onClick={() => handleNavClick(link.href)}
                  className="text-xs uppercase tracking-[0.15em] text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors font-sans font-normal"
                >
                  {link.label}
                </Link>
              )
            )}
          </div>
        </div>
      </nav>
    </>
  );
};

export default Header;