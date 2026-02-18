import React from 'react';
import { Instagram, Video, Youtube, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="w-full py-16 bg-background-light dark:bg-background-dark transition-colors duration-300 border-t border-slate-200 dark:border-slate-800">
      <div className="container mx-auto px-6 flex flex-col items-center">
        
        <div className="flex flex-wrap justify-center gap-8 md:gap-12 mb-8">
          <a href="#" className="flex items-center gap-2 group">
            <Instagram className="w-4 h-4 text-slate-900 dark:text-white group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors" />
            <span className="text-xs font-bold uppercase tracking-widest text-slate-900 dark:text-white group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">Instagram</span>
          </a>
          <a href="#" className="flex items-center gap-2 group">
            <Video className="w-4 h-4 text-slate-900 dark:text-white group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors" />
            <span className="text-xs font-bold uppercase tracking-widest text-slate-900 dark:text-white group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">Tik Tok</span>
          </a>
          <a href="#" className="flex items-center gap-2 group">
            <Youtube className="w-4 h-4 text-slate-900 dark:text-white group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors" />
            <span className="text-xs font-bold uppercase tracking-widest text-slate-900 dark:text-white group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">Youtube</span>
          </a>
          <a href="#" className="flex items-center gap-2 group">
            <MessageCircle className="w-4 h-4 text-slate-900 dark:text-white group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors" />
            <span className="text-xs font-bold uppercase tracking-widest text-slate-900 dark:text-white group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">Whatsapp</span>
          </a>
        </div>

        <div className="text-center flex flex-col gap-4">
          <p className="text-xs text-slate-400 font-light">
            © 2026 Mwabonje Photography, All Rights Reserved
          </p>
          <Link to="/admin" className="text-[10px] text-slate-300 dark:text-slate-700 hover:text-primary dark:hover:text-white transition-colors uppercase tracking-widest">
            Admin Login
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;