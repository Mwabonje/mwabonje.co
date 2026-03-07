import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { GalleryItem, BlogPost, AboutContent } from '../types';
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
  aboutContent: AboutContent | null;
  updateAboutContent: (updated: AboutContent) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [aboutContent, setAboutContent] = useState<AboutContent | null>(null);
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
      const [galleryRes, blogRes, aboutRes] = await Promise.all([
        insforge.database.from('gallery_items').select('*').order('id', { ascending: true }),
        insforge.database.from('blog_posts').select('*').order('created_at', { ascending: false }),
        insforge.database.from('about_content').select('*').eq('id', 1).single()
      ]);

      if (galleryRes.data) setGalleryItems(galleryRes.data);
      if (blogRes.data) setBlogPosts(blogRes.data.map(mapBlogPostFromDB));
      if (aboutRes.data) setAboutContent(aboutRes.data);

      if (galleryRes.error) console.error('Gallery fetch error:', galleryRes.error);
      if (blogRes.error) console.error('Blog fetch error:', blogRes.error);
      if (aboutRes.error) console.error('About fetch error:', aboutRes.error);
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
    // 1. Find the item to get its storage URLs
    const itemToDelete = galleryItems.find(item => item.id === id);

    if (itemToDelete) {
      const urlsToDelete: string[] = [];

      // Collect all image URLs with defensive checks
      if (itemToDelete.src) urlsToDelete.push(itemToDelete.src);
      if (Array.isArray(itemToDelete.images)) urlsToDelete.push(...itemToDelete.images);

      if (Array.isArray(itemToDelete.albums)) {
        itemToDelete.albums.forEach(album => {
          if (album.cover) urlsToDelete.push(album.cover);
          if (Array.isArray(album.images)) urlsToDelete.push(...album.images);
        });
      }

      // Filter to only include InsForge storage URLs and extract the filename/path
      const storagePrefix = '/storage/buckets/portfolio-images/objects/';
      const filesToRemove = urlsToDelete
        .filter(url => url && typeof url === 'string' && url.includes(storagePrefix))
        .map(url => {
          const parts = url.split(storagePrefix);
          let filename = parts[parts.length - 1];
          // Strip query parameters if present
          if (filename.includes('?')) {
            filename = filename.split('?')[0];
          }
          return filename;
        })
        // Remove duplicates and empty strings
        .filter((val, index, self) => val && self.indexOf(val) === index);

      if (filesToRemove.length > 0) {
        console.log('Cleaning up storage files:', filesToRemove);
        // Delete in parallel
        await Promise.allSettled(
          filesToRemove.map(async (file) => {
            try {
              const { error } = await insforge.storage.from('portfolio-images').remove(file);
              if (error) {
                console.warn(`Storage removal notice for ${file}:`, error);
              } else {
                console.log(`Successfully removed ${file} from storage`);
              }
            } catch (err) {
              console.warn(`Exception while removing ${file}:`, err);
            }
          })
        );
      }
    }

    // 2. Delete from database
    const { error } = await insforge.database
      .from('gallery_items')
      .delete()
      .eq('id', id);

    if (!error) {
      setGalleryItems(prev => prev.filter(item => item.id !== id));
      console.log('Successfully deleted gallery item:', id);
    } else {
      console.error('Delete gallery error:', error);
      throw error; // Throw so UI can handle/display it if needed
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
    // 1. Find the post to get its storage URLs
    const postToDelete = blogPosts.find(post => post.id === id);

    if (postToDelete) {
      const urlsToDelete: string[] = [];
      if (postToDelete.coverImage) urlsToDelete.push(postToDelete.coverImage);
      if (postToDelete.author?.avatar) urlsToDelete.push(postToDelete.author.avatar);

      const storagePrefix = '/storage/buckets/portfolio-images/objects/';
      const filesToRemove = urlsToDelete
        .filter(url => url && url.includes(storagePrefix))
        .map(url => {
          const parts = url.split(storagePrefix);
          let filename = parts[parts.length - 1];
          if (filename.includes('?')) {
            filename = filename.split('?')[0];
          }
          return filename;
        })
        .filter((val, index, self) => val && self.indexOf(val) === index);

      if (filesToRemove.length > 0) {
        console.log('Cleaning up blog storage files:', filesToRemove);
        await Promise.allSettled(
          filesToRemove.map(async (file) => {
            try {
              await insforge.storage.from('portfolio-images').remove(file);
            } catch (e) {
              console.warn(`Failed to remove blog file ${file}:`, e);
            }
          })
        );
      }
    }

    // 2. Delete from database
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

  const updateAboutContent = async (updated: AboutContent) => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { id, updated_at, ...toUpdate } = updated;
    const { data, error } = await insforge.database
      .from('about_content')
      .update(toUpdate)
      .eq('id', 1)
      .select();

    if (!error && data) {
      setAboutContent(data[0]);
    } else {
      console.error('Update about error:', error);
    }
  };

  const cleanupOrphanedStorage = async () => {
    console.log('Starting storage cleanup...');
    const storagePrefix = '/storage/buckets/portfolio-images/objects/';

    // 1. Collect ALL referenced filenames from current data
    const referencedUrls: string[] = [];
    galleryItems.forEach(item => {
      if (item.src) referencedUrls.push(item.src);
      if (item.images) referencedUrls.push(...item.images);
      if (item.albums) {
        item.albums.forEach(a => {
          if (a.cover) referencedUrls.push(a.cover);
          if (a.images) referencedUrls.push(...a.images);
        });
      }
    });
    blogPosts.forEach(post => {
      if (post.coverImage) referencedUrls.push(post.coverImage);
      if (post.author?.avatar) referencedUrls.push(post.author.avatar);
    });
    if (aboutContent?.image_url) referencedUrls.push(aboutContent.image_url);

    const referencedSet = new Set(
      referencedUrls
        .filter(url => url && url.includes(storagePrefix))
        .map(url => {
          const parts = url.split(storagePrefix);
          let filename = parts[parts.length - 1];
          if (filename.includes('?')) filename = filename.split('?')[0];
          return decodeURIComponent(filename);
        })
    );

    console.log('Referenced files in database:', [...referencedSet]);

    // 2. Use direct REST API call to reliably list storage objects
    const PRODUCTION_URL = 'https://9se6drpg.us-east.insforge.app';
    const API_KEY = import.meta.env.VITE_INSFORGE_API_KEY;
    const baseUrl = import.meta.env.VITE_INSFORGE_API_BASE_URL || PRODUCTION_URL;

    let allFileNames: string[] = [];

    try {
      const res = await fetch(`${baseUrl}/storage/buckets/portfolio-images/objects`, {
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
        },
      });

      console.log('Storage list status:', res.status);
      const rawData = await res.json();
      console.log('Raw storage list response:', rawData);

      if (!res.ok) {
        return { success: false, message: `Storage error: ${rawData?.message || res.statusText}` };
      }

      // Handle various response shapes
      const objects = Array.isArray(rawData)
        ? rawData
        : rawData?.objects || rawData?.data || rawData?.items || [];

      allFileNames = objects.map((f: any) => {
        const raw = f.name || f.key || f.Key || f.fileName || '';
        // Strip any path prefix and decode
        const filename = decodeURIComponent(raw.split('/').pop() || raw);
        return filename;
      }).filter(Boolean);

      console.log('All files in storage:', allFileNames);
    } catch (err) {
      console.error('Fetch error listing storage:', err);
      return { success: false, message: `Network error listing files: ${err}` };
    }

    // 3. Find orphaned files
    const orphanedFiles = allFileNames.filter(name => !referencedSet.has(name));
    console.log('Orphaned files to delete:', orphanedFiles);

    if (orphanedFiles.length === 0) {
      return {
        success: true,
        message: `Storage is clean! (${allFileNames.length} total files, all referenced)`
      };
    }

    // 4. Delete the orphaned files
    let deletedCount = 0;
    let failedCount = 0;
    for (const file of orphanedFiles) {
      try {
        const { error } = await insforge.storage.from('portfolio-images').remove(file);
        if (error) {
          console.warn(`Failed to delete ${file}:`, error);
          failedCount++;
        } else {
          deletedCount++;
        }
      } catch (e) {
        failedCount++;
        console.warn(`Exception deleting ${file}:`, e);
      }
    }

    return {
      success: true,
      message: `Cleaned up ${deletedCount} orphaned file(s). ${failedCount > 0 ? `${failedCount} failed.` : ''}`
    };
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
      deleteBlogPost,
      aboutContent,
      updateAboutContent,
      cleanupOrphanedStorage
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