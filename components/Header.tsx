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

  // Combine dynamic gallery categories with static links
  const dynamicNavLinks: NavLinkType[] = [
    ...(galleryItems || []).map(item => ({
      label: item.title,
      href: '/#work'
    })),
    { label: 'Blog', href: '/blog' },
    { label: 'About', href: '/#about' },
    { label: 'Book', href: 'https://mwabonjebooking.netlify.app/', external: true },
  ];

  // Helper to handle scrolling for hash links if on home page
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
      <header className="w-full bg-background-light dark:bg-background-dark transition-colors duration-300 pt-4 md:pt-12 relative overflow-hidden">
        <div className="container mx-auto px-4 md:px-6 relative flex flex-col items-center">
          {/* Controls - The theme and menu buttons */}
          <div className="absolute right-0 top-0 h-10 sm:h-12 md:h-auto md:top-2 flex items-center gap-2 md:gap-4 z-[60]">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus:outline-none focus:ring-2 focus:ring-slate-200 dark:focus:ring-slate-700"
              aria-label="Toggle Dark Mode"
            >
              {theme === 'light' ? (
                <Moon className="h-6 w-6 text-slate-800" strokeWidth={2} />
              ) : (
                <Sun className="h-6 w-6 text-yellow-400" strokeWidth={2} />
              )}
            </button>

            <button
              className="md:hidden p-2 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-slate-200 dark:focus:ring-slate-700"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle Menu"
            >
              {isMenuOpen ? <X className="h-6 w-6" strokeWidth={2} /> : <Menu className="h-6 w-6" strokeWidth={2} />}
            </button>
          </div>

          {/* Logo Section */}
          <Link to="/" className="mb-4 md:mb-10 group relative z-10 block">
            <h1 className="font-hand text-3xl xs:text-4xl sm:text-5xl md:text-7xl text-primary dark:text-white transition-opacity text-center leading-tight">
              Mwabonje
            </h1>
          </Link>
        </div>
      </header>

      {/* Sticky Navigation Bar */}
      <nav className="sticky top-0 z-50 w-full bg-background-light/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-slate-100/50 dark:border-slate-800/50 py-4 md:py-6 transition-all duration-300">
        <div className="container mx-auto px-4 md:px-6">
          {/* Desktop Links */}
          <div className="hidden md:flex flex-wrap justify-center gap-x-6 lg:gap-x-8 gap-y-4">
            {dynamicNavLinks.map((link) => (
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
            ))}
          </div>

          {/* Mobile Navigation Menu */}
          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0, marginTop: 0 }}
                animate={{ opacity: 1, height: 'auto', marginTop: 16 }}
                exit={{ opacity: 0, height: 0, marginTop: 0 }}
                className="md:hidden flex flex-col items-center space-y-4 overflow-hidden"
              >
                {dynamicNavLinks.map((link) => (
                  link.external ? (
                    <a
                      key={link.label}
                      href={link.href}
                      className="text-xs uppercase tracking-[0.2em] text-slate-600 dark:text-slate-300 py-1 font-medium"
                    >
                      {link.label}
                    </a>
                  ) : (
                    <Link
                      key={link.label}
                      to={link.href}
                      onClick={() => handleNavClick(link.href)}
                      className="text-xs uppercase tracking-[0.2em] text-slate-600 dark:text-slate-300 py-1 font-medium"
                    >
                      {link.label}
                    </Link>
                  )
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </nav>
    </>
  );
};

export default Header;