import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { GalleryItem, BlogPost } from '../types';
import { initialGalleryItems, initialBlogPosts } from '../data';

interface DataContextType {
  galleryItems: GalleryItem[];
  blogPosts: BlogPost[];
  updateGalleryItem: (updatedItem: GalleryItem) => void;
  addGalleryItem: (item: GalleryItem) => void;
  deleteGalleryItem: (id: number) => void;
  addBlogPost: (post: BlogPost) => void;
  updateBlogPost: (post: BlogPost) => void;
  deleteBlogPost: (id: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Initialize from localStorage or fallback to initial data
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>(() => {
    try {
      const saved = localStorage.getItem('galleryItems');
      return saved ? JSON.parse(saved) : initialGalleryItems;
    } catch (e) {
      console.error("Failed to parse galleryItems from local storage", e);
      return initialGalleryItems;
    }
  });

  const [blogPosts, setBlogPosts] = useState<BlogPost[]>(() => {
    try {
      const saved = localStorage.getItem('blogPosts');
      return saved ? JSON.parse(saved) : initialBlogPosts;
    } catch (e) {
      console.error("Failed to parse blogPosts from local storage", e);
      return initialBlogPosts;
    }
  });

  // Persist changes to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('galleryItems', JSON.stringify(galleryItems));
    } catch (e) {
      console.error("Failed to save galleryItems to localStorage (likely quota exceeded)", e);
    }
  }, [galleryItems]);

  useEffect(() => {
    try {
      localStorage.setItem('blogPosts', JSON.stringify(blogPosts));
    } catch (e) {
      console.error("Failed to save blogPosts to localStorage (likely quota exceeded)", e);
    }
  }, [blogPosts]);

  const updateGalleryItem = (updatedItem: GalleryItem) => {
    setGalleryItems(prev => prev.map(item => item.id === updatedItem.id ? updatedItem : item));
  };

  const addGalleryItem = (item: GalleryItem) => {
    setGalleryItems(prev => [...prev, item]);
  };

  const deleteGalleryItem = (id: number) => {
    setGalleryItems(prev => prev.filter(item => item.id !== id));
  };

  const addBlogPost = (post: BlogPost) => {
    setBlogPosts(prev => [post, ...prev]);
  };

  const updateBlogPost = (updatedPost: BlogPost) => {
    setBlogPosts(prev => prev.map(post => post.id === updatedPost.id ? updatedPost : post));
  };

  const deleteBlogPost = (id: string) => {
    setBlogPosts(prev => prev.filter(post => post.id !== id));
  };

  return (
    <DataContext.Provider value={{
      galleryItems,
      blogPosts,
      updateGalleryItem,
      addGalleryItem,
      deleteGalleryItem,
      addBlogPost,
      updateBlogPost,
      deleteBlogPost
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};