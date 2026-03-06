import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { GalleryItem, BlogPost } from '../types';
import { insforge } from '../lib/insforge';

interface DataContextType {
  galleryItems: GalleryItem[];
  blogPosts: BlogPost[];
  loading: boolean;
  updateGalleryItem: (updatedItem: GalleryItem) => Promise<void>;
  addGalleryItem: (item: GalleryItem) => Promise<GalleryItem | undefined>;
  deleteGalleryItem: (id: number) => Promise<void>;
  addBlogPost: (post: BlogPost) => Promise<BlogPost | undefined>;
  updateBlogPost: (post: BlogPost) => Promise<void>;
  deleteBlogPost: (id: string) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);

  // Helper to map DB blog post to TypeScript interface
  const mapBlogPostFromDB = (post: any): BlogPost => ({
    ...post,
    coverImage: post.cover_image // map snake_case to camelCase
  });

  const mapBlogPostToDB = (post: BlogPost) => {
    const { coverImage, ...rest } = post;
    return {
      ...rest,
      cover_image: coverImage
    };
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [galleryRes, blogRes] = await Promise.all([
        insforge.database.from('gallery_items').select('*').order('id', { ascending: true }),
        insforge.database.from('blog_posts').select('*').order('created_at', { ascending: false })
      ]);

      if (galleryRes.data) setGalleryItems(galleryRes.data);
      if (blogRes.data) setBlogPosts(blogRes.data.map(mapBlogPostFromDB));

      if (galleryRes.error) console.error('Gallery fetch error:', galleryRes.error);
      if (blogRes.error) console.error('Blog fetch error:', blogRes.error);
    } catch (e) {
      console.error('Failed to fetch data from InsForge:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const updateGalleryItem = async (updatedItem: GalleryItem) => {
    const { id, ...itemToUpdate } = updatedItem;
    const { data, error } = await insforge.database
      .from('gallery_items')
      .update(itemToUpdate)
      .eq('id', id)
      .select();

    if (!error && data) {
      setGalleryItems(prev => prev.map(item => item.id === updatedItem.id ? updatedItem : item));
    } else {
      console.error('Update gallery error:', error);
    }
  };

  const addGalleryItem = async (item: GalleryItem) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, ...itemToInsert } = item;
    const { data, error } = await insforge.database
      .from('gallery_items')
      .insert([itemToInsert])
      .select();

    if (!error && data) {
      const newItem = data[0] as GalleryItem;
      setGalleryItems(prev => [...prev, newItem]);
      return newItem;
    } else {
      console.error('Add gallery error:', error);
      return undefined;
    }
  };

  const deleteGalleryItem = async (id: number) => {
    const { error } = await insforge.database
      .from('gallery_items')
      .delete()
      .eq('id', id);

    if (!error) {
      setGalleryItems(prev => prev.filter(item => item.id !== id));
    } else {
      console.error('Delete gallery error:', error);
    }
  };

  const addBlogPost = async (post: BlogPost) => {
    const dbPost = mapBlogPostToDB(post);
    // Remove ID for insert to allow DB to generate UUID if needed, 
    // though the code currently sends a timestamp based one.
    // Let's stick with what the code does but return the result.
    const { data, error } = await insforge.database
      .from('blog_posts')
      .insert([dbPost])
      .select();

    if (!error && data) {
      const newPost = mapBlogPostFromDB(data[0]);
      setBlogPosts(prev => [newPost, ...prev]);
      return newPost;
    } else {
      console.error('Add blog error:', error);
      return undefined;
    }
  };

  const updateBlogPost = async (updatedPost: BlogPost) => {
    const dbPost = mapBlogPostToDB(updatedPost);
    const { id, ...postToUpdate } = dbPost;
    const { data, error } = await insforge.database
      .from('blog_posts')
      .update(postToUpdate)
      .eq('id', id)
      .select();

    if (!error && data) {
      setBlogPosts(prev => prev.map(post => post.id === updatedPost.id ? updatedPost : post));
    } else {
      console.error('Update blog error:', error);
    }
  };

  const deleteBlogPost = async (id: string) => {
    const { error } = await insforge.database
      .from('blog_posts')
      .delete()
      .eq('id', id);

    if (!error) {
      setBlogPosts(prev => prev.filter(post => post.id !== id));
    } else {
      console.error('Delete blog error:', error);
    }
  };

  return (
    <DataContext.Provider value={{
      galleryItems,
      blogPosts,
      loading,
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