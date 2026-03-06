import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { GalleryItem } from '../types';
import CategoryModal from './CategoryModal';
import { useData } from '../context/DataContext';
import SmoothImage from './SmoothImage';

const Gallery: React.FC = () => {
  const { galleryItems } = useData();
  const [selectedItem, setSelectedItem] = useState<GalleryItem | null>(null);

  const preloadImages = (item: GalleryItem) => {
    const urlsToPreload: string[] = [];
    if (item.images) urlsToPreload.push(...item.images);
    if (item.albums) {
      item.albums.forEach(album => {
        urlsToPreload.push(album.cover);
        urlsToPreload.push(...album.images);
      });
    }

    urlsToPreload.forEach(url => {
      const img = new Image();
      img.src = url;
    });
  };

  if (!galleryItems || galleryItems.length === 0) {
    return (
      <section id="work" className="container mx-auto px-6 mb-20 text-center text-slate-500">
        <p>No gallery items found.</p>
      </section>
    );
  }

  return (
    <>
      <section id="work" className="container mx-auto px-6 mb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {galleryItems.map((item, index) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              onClick={() => setSelectedItem(item)}
              onMouseEnter={() => preloadImages(item)}
              className="relative group overflow-hidden bg-slate-100 dark:bg-slate-900 rounded-sm cursor-pointer aspect-[4/3]"
            >
              <SmoothImage
                src={item.src}
                alt={item.alt}
                className="w-full h-full object-cover"
                containerClassName="w-full h-full"
                hoverEffect={true}
              />
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors duration-300 flex items-end justify-center pb-6 md:pb-10">
                <span className="text-white font-display text-2xl sm:text-3xl md:text-4xl tracking-wider drop-shadow-lg text-center px-4">
                  {item.title}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      <CategoryModal
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
      />
    </>
  );
};

export default Gallery;