import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowLeft } from 'lucide-react';
import { GalleryItem, Album } from '../types';

interface CategoryModalProps {
  item: GalleryItem | null;
  onClose: () => void;
}

const CategoryModal: React.FC<CategoryModalProps> = ({ item, onClose }) => {
  const [activeAlbum, setActiveAlbum] = useState<Album | null>(null);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (item) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [item]);

  // Reset active album when item closes or changes
  useEffect(() => {
    if (!item) {
      setActiveAlbum(null);
    }
  }, [item]);

  // Determine what content to show
  // If activeAlbum is selected, show its images
  // Else if item has albums, show albums
  // Else show item's images
  const showAlbums = !activeAlbum && item?.albums && item.albums.length > 0;
  const currentImages = activeAlbum
    ? activeAlbum.images
    : (item?.images || []);

  const handleClose = () => {
    setActiveAlbum(null);
    onClose();
  };

  const handleBack = () => {
    if (activeAlbum) {
      setActiveAlbum(null);
    } else {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {item && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex flex-col bg-white/95 dark:bg-black/95 backdrop-blur-sm overflow-hidden"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 md:p-8 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-3 md:gap-4 overflow-hidden">
              <button
                onClick={handleBack}
                className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                aria-label="Go back"
              >
                <ArrowLeft className="w-6 h-6 text-slate-900 dark:text-white" />
              </button>
              <motion.h2
                key={activeAlbum ? activeAlbum.title : item.title}
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-xl sm:text-3xl md:text-5xl font-display text-slate-900 dark:text-slate-100 truncate"
              >
                {activeAlbum ? activeAlbum.title : item.title}
              </motion.h2>
            </div>

            <button
              onClick={handleClose}
              className="p-1 md:p-2 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors group flex-shrink-0"
            >
              <X className="w-6 h-6 md:w-8 md:h-8 text-slate-500 group-hover:text-slate-900 dark:text-slate-400 dark:group-hover:text-white transition-colors" />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto p-4 md:p-8">
            <div className="container mx-auto">

              {showAlbums ? (
                /* Albums Grid */
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 pb-20">
                  {item.albums!.map((album, index) => (
                    <motion.div
                      key={album.id}
                      initial={{ opacity: 0, y: 50 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1 }}
                      onClick={() => setActiveAlbum(album)}
                      className="relative group overflow-hidden bg-slate-100 dark:bg-slate-900 rounded-sm cursor-pointer aspect-[4/3]"
                    >
                      <img
                        src={album.cover}
                        alt={album.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        loading="lazy"
                        decoding="async"
                      />
                      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-300 flex items-end justify-center pb-6 md:pb-10">
                        <span className="text-white font-display text-2xl md:text-3xl tracking-wider drop-shadow-lg text-center px-4">
                          {album.title}
                        </span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                /* Images Grid (Masonry) */
                <div className="columns-1 md:columns-2 lg:columns-3 gap-6 space-y-6 pb-20">
                  {currentImages.map((imgSrc, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 + 0.2 }}
                      className="break-inside-avoid rounded-sm overflow-hidden bg-slate-100 dark:bg-slate-900"
                    >
                      <img
                        src={imgSrc}
                        alt={`${activeAlbum ? activeAlbum.title : item.title} photo ${index + 1}`}
                        className="w-full h-auto object-cover hover:scale-[1.02] transition-transform duration-500"
                        loading="lazy"
                        decoding="async"
                      />
                    </motion.div>
                  ))}
                </div>
              )}

            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CategoryModal;