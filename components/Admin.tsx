import React, { useState, useEffect } from 'react';
import { useData } from '../context/DataContext';
import { GalleryItem, BlogPost, Album } from '../types';
import {
  Plus, Trash2, Edit, Save, ArrowLeft,
  Image as ImageIcon, LayoutDashboard,
  BookOpen, LogOut, ChevronRight, Search,
  Settings, User, Globe, Tag, Eye
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { insforge } from '../lib/insforge';
import { compressImage } from '../lib/imageUtils';


const ADMIN_PASSWORD = 'admin123';
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB in bytes

const Admin: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return localStorage.getItem('adminAuth') === 'true';
  });
  const [password, setPassword] = useState('');
  const [activeTab, setActiveTab] = useState<'gallery' | 'blog' | 'about'>('gallery');

  const {
    galleryItems, updateGalleryItem, addGalleryItem, deleteGalleryItem,
    blogPosts, addBlogPost, updateBlogPost, deleteBlogPost,
    aboutContent, updateAboutContent
  } = useData();

  // Gallery State
  const [selectedGalleryId, setSelectedGalleryId] = useState<number | null>(galleryItems[0]?.id || null);
  const [selectedAlbumId, setSelectedAlbumId] = useState<string | null>(null);
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newAlbumTitle, setNewAlbumTitle] = useState('');
  const [newAlbumCover, setNewAlbumCover] = useState('');
  const [newCategoryTitle, setNewCategoryTitle] = useState('');

  // Auto-select first category when data loads
  useEffect(() => {
    if (!selectedGalleryId && galleryItems.length > 0) {
      setSelectedGalleryId(galleryItems[0].id);
    }
  }, [galleryItems, selectedGalleryId]);

  // Blog State
  const [isEditingBlog, setIsEditingBlog] = useState(false);
  const [currentBlog, setCurrentBlog] = useState<BlogPost>({
    id: '',
    title: '',
    slug: '',
    excerpt: '',
    content: '',
    coverImage: '',
    date: new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16),
    status: 'draft',
    seo: { metaTitle: '', metaDescription: '', keywords: [] },
    author: { name: '', role: '' }
  });
  const [seoKeywordsInput, setSeoKeywordsInput] = useState('');

  // About State
  const [aboutForm, setAboutForm] = useState(aboutContent);

  // Upload Progress State
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (aboutContent) {
      setAboutForm(aboutContent);
    }
  }, [aboutContent]);

  // Auto-save logic
  useEffect(() => {
    if (isEditingBlog && currentBlog.title) {
      const timer = setTimeout(() => {
        localStorage.setItem('active_blog_draft', JSON.stringify({
          ...currentBlog,
          seo: { ...currentBlog.seo, keywords: seoKeywordsInput.split(',').map(k => k.trim()) }
        }));
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [currentBlog, isEditingBlog, seoKeywordsInput]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      localStorage.setItem('adminAuth', 'true');
    } else {
      alert('Incorrect password');
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('adminAuth');
  };

  // Gallery Handlers
  const handleAddImage = () => {
    if (!selectedGalleryId || !newImageUrl) return;
    const item = galleryItems.find(i => i.id === selectedGalleryId);
    if (!item) return;

    const newItem = { ...item };

    if (selectedAlbumId) {
      if (newItem.albums) {
        newItem.albums = newItem.albums.map(a => {
          if (a.id.toString() === selectedAlbumId.toString()) {
            return { ...a, images: [...a.images, newImageUrl] };
          }
          return a;
        });
      }
    } else {
      const currentImages = newItem.images || [];
      newItem.images = [...currentImages, newImageUrl];
    }
    updateGalleryItem(newItem);
    setNewImageUrl('');
  };

  const handleAddAlbum = () => {
    if (!selectedGalleryId || !newAlbumTitle) return;
    const item = galleryItems.find(i => i.id === selectedGalleryId);
    if (!item) return;

    const newAlbum: Album = {
      id: Date.now().toString(),
      title: newAlbumTitle,
      cover: newAlbumCover || 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d',
      images: []
    };

    const currentAlbums = item.albums || [];

    updateGalleryItem({
      ...item,
      albums: [...currentAlbums, newAlbum]
    });
    setNewAlbumTitle('');
    setNewAlbumCover('');
  };

  const handleAddCategory = async () => {
    if (!newCategoryTitle) return;
    const newItem: GalleryItem = {
      id: 0, // Database will generate real ID
      title: newCategoryTitle,
      type: 'wide', // Default type
      src: 'https://images.unsplash.com/photo-1452587925148-ce544e77e70d', // Placeholder
      alt: newCategoryTitle,
      images: [],
      albums: []
    };
    const createdItem = await addGalleryItem(newItem);
    setNewCategoryTitle('');
    if (createdItem) {
      setSelectedGalleryId(createdItem.id);
    }
    setSelectedAlbumId(null);
  };

  const handleDeleteCategory = async (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    console.log('Attempting to delete category:', id);
    if (confirm('Delete category and all its contents?')) {
      try {
        await deleteGalleryItem(id);
        console.log('Category deleted successfully from state');
        if (selectedGalleryId === id) {
          setSelectedGalleryId(galleryItems.find(i => i.id !== id)?.id || null);
          setSelectedAlbumId(null);
        }
      } catch (error: any) {
        console.error('Category deletion failed:', error);
        alert(`Failed to delete category: ${error.message || 'Unknown error'}`);
      }
    }
  };

  // Blog Handlers
  const handleSaveBlog = () => {
    if (!currentBlog.title) return;

    const postToSave = {
      ...currentBlog,
      id: currentBlog.id || Date.now().toString(),
      seo: {
        ...currentBlog.seo,
        keywords: seoKeywordsInput.split(',').map(k => k.trim())
      }
    };

    if (currentBlog.id) {
      updateBlogPost(postToSave);
    } else {
      addBlogPost(postToSave);
    }

    setIsEditingBlog(false);
    resetBlogForm();
    localStorage.removeItem('active_blog_draft');
  };

  const resetBlogForm = () => {
    setCurrentBlog({
      id: '',
      title: '',
      slug: '',
      excerpt: '',
      content: '',
      coverImage: '',
      date: new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16),
      status: 'draft',
      seo: { metaTitle: '', metaDescription: '', keywords: [] },
      author: { name: '', role: '' }
    });
    setSeoKeywordsInput('');
  };

  const handleCreateNewBlog = () => {
    resetBlogForm();
    const savedDraft = localStorage.getItem('active_blog_draft');
    if (savedDraft) {
      const draft = JSON.parse(savedDraft);
      if (confirm(`We found an unsaved draft for "${draft.title || 'Untitled'}". Would you like to restore it?`)) {
        setCurrentBlog(draft);
        setSeoKeywordsInput(draft.seo.keywords.join(', '));
      } else {
        localStorage.removeItem('active_blog_draft');
      }
    }
    setIsEditingBlog(true);
  };

  const formatForInput = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) throw new Error();
      // Adjust to local time string YYYY-MM-DDThh:mm
      return new Date(date.getTime() - date.getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    } catch {
      return new Date(new Date().getTime() - new Date().getTimezoneOffset() * 60000).toISOString().slice(0, 16);
    }
  };

  const handleEditBlog = (post: BlogPost) => {
    setCurrentBlog({
      ...post,
      date: formatForInput(post.date),
      status: post.status || 'published'
    });
    setSeoKeywordsInput(post.seo.keywords.join(', '));
    setIsEditingBlog(true);
  };

  const handleFileUpload = async (files: FileList | null) => {
    console.log('handleFileUpload triggered with files:', files?.length);
    if (!files || !selectedGalleryId) {
      if (!selectedGalleryId) alert('Please select a category first.');
      return;
    }

    const fileArray = Array.from(files);
    console.log('Processing files:', fileArray.map(f => `${f.name} (${(f.size / 1024 / 1024).toFixed(2)}MB)`));

    // Pre-filter oversized files
    const validFiles = fileArray.filter(file => {
      if (file.size > MAX_FILE_SIZE) {
        const msg = `File "${file.name}" is too large (${(file.size / 1024 / 1024).toFixed(2)}MB). Maximum allowed size is 5MB.`;
        console.warn(msg);
        alert(msg);
        return false;
      }
      return file.type.startsWith('image/');
    });

    if (validFiles.length === 0) return;

    const newUrls: string[] = [];
    const interval = simulateProgress();

    for (const file of validFiles) {
      try {
        // Automatically compress if > 500kb
        const processedFile = await compressImage(file, 500);
        
        // Upload to InsForge Storage
        const { data, error } = await insforge.storage
          .from('portfolio-images')
          .uploadAuto(processedFile);

        if (error || !data) {
          console.error('Image upload error:', error);
          alert(`Failed to upload ${file.name}. Please try again.`);
          continue;
        }

        newUrls.push(data.url);
      } catch (err) {
        console.error('Compression/Upload error:', err);
        alert(`Error processing ${file.name}`);
      }
    }
    finishProgress(interval);

    if (newUrls.length === 0) return;

    // Always find the LATEST item from galleryItems to avoid state drift
    const currentItems = [...galleryItems];
    const itemIndex = currentItems.findIndex(i => i.id === selectedGalleryId);
    if (itemIndex === -1) return;

    const item = { ...currentItems[itemIndex] };

    if (selectedAlbumId) {
      item.albums = item.albums?.map(a =>
        a.id.toString() === selectedAlbumId.toString() ? { ...a, images: [...(a.images || []), ...newUrls] } : a
      );
    } else {
      item.images = [...(item.images || []), ...newUrls];
    }

    updateGalleryItem(item);
  };

  const handleBlogCoverUpload = async (file: File | null) => {
    if (!file || !file.type.startsWith('image/')) return;

    if (file.size > MAX_FILE_SIZE) {
      alert(`File is too large (${(file.size / 1024 / 1024).toFixed(2)}MB). Maximum allowed size is 5MB.`);
      return;
    }

    const interval = simulateProgress();
    try {
      const processedFile = await compressImage(file, 500);
      const { data, error } = await insforge.storage
        .from('portfolio-images')
        .uploadAuto(processedFile);

      finishProgress(interval);

      if (error || !data) {
        console.error('Blog cover upload error:', error);
        alert('Failed to upload cover image. Please try again.');
        return;
      }

      setCurrentBlog({ ...currentBlog, coverImage: data.url });
    } catch (err) {
      finishProgress(interval);
      console.error('Compression/Upload error:', err);
      alert('Error processing image');
    }
  };

  const handleAlbumCoverUpload = async (file: File | null) => {
    if (!file || !file.type.startsWith('image/')) return;

    if (file.size > MAX_FILE_SIZE) {
      alert(`File is too large (${(file.size / 1024 / 1024).toFixed(2)}MB). Maximum allowed size is 5MB.`);
      return;
    }

    const interval = simulateProgress();
    try {
      const processedFile = await compressImage(file, 500);
      const { data, error } = await insforge.storage
        .from('portfolio-images')
        .uploadAuto(processedFile);

      finishProgress(interval);

      if (error || !data) {
        console.error('Album cover upload error:', error);
        alert('Failed to upload album cover. Please try again.');
        return;
      }

      setNewAlbumCover(data.url);
    } catch (err) {
      finishProgress(interval);
      console.error('Compression/Upload error:', err);
      alert('Error processing image');
    }
  };

  const handleCategoryCoverUpload = async (file: File | null) => {
    if (!file || !file.type.startsWith('image/') || !selectedGalleryId) return;

    if (file.size > MAX_FILE_SIZE) {
      alert(`File is too large (${(file.size / 1024 / 1024).toFixed(2)}MB). Maximum allowed size is 5MB.`);
      return;
    }

    const interval = simulateProgress();
    try {
      const processedFile = await compressImage(file, 500);
      const { data, error } = await insforge.storage
        .from('portfolio-images')
        .uploadAuto(processedFile);

      finishProgress(interval);

      if (error || !data) {
        console.error('Category cover upload error:', error);
        alert('Failed to upload cover image. Please try again.');
        return;
      }

      const item = galleryItems.find(i => i.id === selectedGalleryId);
      if (!item) return;
      updateGalleryItem({ ...item, src: data.url });
    } catch (err) {
      finishProgress(interval);
      console.error('Compression/Upload error:', err);
      alert('Error processing image');
    }
  };

  const handleAboutImageUpload = async (file: File | null) => {
    if (!file || !aboutForm) return;

    if (file.size > MAX_FILE_SIZE) {
      alert(`File is too large (${(file.size / 1024 / 1024).toFixed(2)}MB). Maximum allowed size is 5MB.`);
      return;
    }

    const interval = simulateProgress();
    try {
      const processedFile = await compressImage(file, 500);
      const { data, error } = await insforge.storage
        .from('portfolio-images')
        .uploadAuto(processedFile);

      finishProgress(interval);

      if (data) {
        setAboutForm({ ...aboutForm, image_url: data.url });
      } else {
        console.error('About image upload error:', error);
        alert('Failed to upload profile image.');
      }
    } catch (err) {
      finishProgress(interval);
      console.error('Compression/Upload error:', err);
      alert('Error processing image');
    }
  };

  const handleAboutSave = async () => {
    if (aboutForm) {
      await updateAboutContent(aboutForm);
      alert('About section updated successfully!');
    }
  };

  const simulateProgress = () => {
    setIsUploading(true);
    setUploadProgress(10);
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 5;
      });
    }, 200);
    return interval;
  };

  const finishProgress = (interval: NodeJS.Timeout) => {
    clearInterval(interval);
    setUploadProgress(100);
    setTimeout(() => {
      setIsUploading(false);
      setUploadProgress(0);
    }, 500);
  };


  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    handleFileUpload(e.dataTransfer.files);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-background-dark p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-slate-900 p-10 rounded-2xl shadow-2xl max-w-md w-full border border-slate-100 dark:border-slate-800"
        >
          <div className="text-center mb-10">
            <h2 className="text-3xl font-display mb-2 text-slate-900 dark:text-white">Mwabonje Admin</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm">Enter password to access the dashboard</p>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full px-4 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-xl focus:ring-2 focus:ring-slate-900 dark:focus:ring-white transition-all dark:text-white placeholder:text-slate-400"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-slate-900 dark:bg-white text-white dark:text-black py-4 rounded-xl font-bold uppercase tracking-widest text-xs hover:scale-[1.02] active:scale-[0.98] transition-all shadow-lg"
            >
              Unlock Dashboard
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-background-dark text-slate-900 dark:text-slate-100 flex flex-col md:flex-row">
      <aside className="w-full md:w-64 bg-white dark:bg-slate-900 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 p-4 md:p-6 flex flex-row md:flex-col gap-4 md:gap-8 overflow-x-auto md:overflow-x-visible sticky top-0 z-40">
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-8 h-8 bg-slate-900 dark:bg-white rounded-lg flex items-center justify-center">
            <LayoutDashboard className="w-5 h-5 text-white dark:text-black shrink-0" />
          </div>
          <span className="font-montserrat text-lg md:text-xl tracking-tight font-bold hidden xs:block">Admin</span>
        </div>

        <nav className="flex flex-row md:flex-col gap-1 items-center md:items-stretch">
          <button
            onClick={() => setActiveTab('gallery')}
            className={`flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 md:py-3 rounded-xl transition-all shrink-0 ${activeTab === 'gallery' ? 'bg-slate-100 dark:bg-slate-800 font-bold' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
          >
            <ImageIcon className="w-5 h-5" />
            <span className="text-xs md:text-sm">Gallery</span>
          </button>
          <button
            onClick={() => { setActiveTab('blog'); setIsEditingBlog(false); }}
            className={`flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 md:py-3 rounded-xl transition-all shrink-0 ${activeTab === 'blog' ? 'bg-slate-100 dark:bg-slate-800 font-bold' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
          >
            <BookOpen className="w-5 h-5" />
            <span className="text-xs md:text-sm">Blog</span>
          </button>
          <button
            onClick={() => setActiveTab('about')}
            className={`flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 md:py-3 rounded-xl transition-all shrink-0 ${activeTab === 'about' ? 'bg-slate-100 dark:bg-slate-800 font-bold' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
          >
            <User className="w-5 h-5" />
            <span className="text-xs md:text-sm">About</span>
          </button>
        </nav>

        <div className="hidden md:flex mt-auto pt-6 border-t border-slate-100 dark:border-slate-800 flex-col gap-4">
          <div className="flex items-center gap-3 px-4">
            <div className="w-8 h-8 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-slate-500" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold">Mwabonje</span>
              <span className="text-[10px] text-slate-400">Super Admin</span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 w-full rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 transition-all font-medium text-sm"
          >
            <LogOut className="w-5 h-5" />
            <span>Logout</span>
          </button>
        </div>
        <button onClick={handleLogout} className="md:hidden p-2 text-red-500 ml-auto" aria-label="Logout">
          <LogOut className="w-5 h-5" />
        </button>
      </aside>

      <main className="flex-grow p-6 md:p-10 overflow-auto relative">
        <AnimatePresence>
          {isUploading && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="fixed top-0 left-0 md:left-64 right-0 z-50 h-1.5 bg-slate-100 dark:bg-slate-800"
            >
              <motion.div
                className="h-full bg-slate-900 dark:bg-white"
                initial={{ width: '0%' }}
                animate={{ width: `${uploadProgress}%` }}
                transition={{ duration: 0.3 }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {activeTab === 'gallery' ? (
            <motion.div
              key="gallery"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="max-w-6xl mx-auto space-y-10"
            >
              <div>
                <h2 className="text-4xl font-montserrat font-bold mb-2">Gallery Management</h2>
                <p className="text-slate-500 dark:text-slate-400 font-montserrat">Curate and organize your visual narrative.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
                <div className="lg:col-span-1 space-y-4">
                  <h3 className="text-[10px] uppercase tracking-[0.2em] font-bold text-slate-400 px-4 font-montserrat">Categories</h3>
                  <div className="flex flex-row lg:flex-col gap-2 overflow-x-auto lg:overflow-x-visible pb-4 lg:pb-0 px-1">
                    {Array.isArray(galleryItems) && galleryItems.map(item => (
                      <div
                        key={item.id}
                        onClick={() => { setSelectedGalleryId(item.id); setSelectedAlbumId(null); }}
                        className={`group/cat w-full flex items-center justify-between px-4 py-3 rounded-xl transition-all cursor-pointer ${selectedGalleryId === item.id ? 'bg-white dark:bg-slate-800 shadow-sm border border-slate-100 dark:border-slate-700 font-bold translate-x-1' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-montserrat">{item.title}</span>
                          {selectedGalleryId === item.id && <ChevronRight className="w-3.5 h-3.5 text-slate-400" />}
                        </div>
                        <button
                          onClick={(e) => handleDeleteCategory(item.id, e)}
                          className={`p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-all ${selectedGalleryId === item.id ? 'opacity-100' : 'opacity-0 group-hover/cat:opacity-100'}`}
                          title="Delete Category"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
                      <input
                        value={newCategoryTitle}
                        onChange={e => setNewCategoryTitle(e.target.value)}
                        placeholder="New Category..."
                        className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs outline-none focus:ring-1 focus:ring-slate-200 dark:focus:ring-slate-700 font-montserrat"
                        onKeyDown={e => e.key === 'Enter' && handleAddCategory()}
                      />
                      <button
                        onClick={handleAddCategory}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-black rounded-xl text-[10px] font-bold uppercase tracking-wider hover:scale-[1.02] active:scale-[0.98] transition-all font-montserrat"
                      >
                        <Plus className="w-3 h-3" /> Add Category
                      </button>
                    </div>
                  </div>
                </div>

                <div className="lg:col-span-3 space-y-8">
                  {selectedGalleryId && (() => {
                    const item = galleryItems.find(i => i.id === selectedGalleryId);
                    if (!item) return <div className="p-10 text-center text-slate-400">Select a category to manage content</div>;

                    return (
                      <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-8 shadow-sm space-y-8">
                        {/* Category Cover Image */}
                        <div className="space-y-3">
                          <h4 className="text-sm font-bold flex items-center gap-2">
                            <ImageIcon className="w-4 h-4 text-slate-400" />
                            Category Cover Photo
                          </h4>
                          <div className="flex items-center gap-4">
                            <div className="w-20 h-16 rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-800 shrink-0">
                              <img src={item.src} alt={item.title} className="w-full h-full object-cover" />
                            </div>
                            <div className="flex-1 flex gap-2">
                              <input
                                value={item.src}
                                onChange={e => updateGalleryItem({ ...item, src: e.target.value })}
                                placeholder="Cover image URL"
                                className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-xs outline-none"
                              />
                              <label className="px-4 py-3 bg-slate-900 dark:bg-white text-white dark:text-black rounded-xl cursor-pointer hover:opacity-90 transition-opacity flex items-center gap-2 text-[10px] font-bold uppercase whitespace-nowrap">
                                <ImageIcon className="w-3.5 h-3.5" />
                                Upload
                                <input
                                  type="file"
                                  accept="image/*"
                                  className="hidden"
                                  onChange={(e) => handleCategoryCoverUpload(e.target.files?.[0] || null)}
                                />
                              </label>
                            </div>
                          </div>
                        </div>
                        {(item.albums || item.id === 7) && (
                          <div className="space-y-6">
                            <h4 className="text-sm font-bold flex items-center gap-2">
                              <LayoutDashboard className="w-4 h-4 text-slate-400" />
                              Albums
                            </h4>
                            <div className="flex flex-wrap gap-3">
                              <button
                                onClick={() => setSelectedAlbumId(null)}
                                className={`px-4 py-2 text-xs font-bold rounded-full transition-all border ${!selectedAlbumId ? 'bg-slate-900 dark:bg-white text-white dark:text-black border-transparent shadow-lg scale-105' : 'bg-transparent border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-400'}`}
                              >
                                Overview
                              </button>
                              {item.albums && item.albums.map(album => (
                                <button
                                  key={album.id}
                                  onClick={() => setSelectedAlbumId(album.id.toString())}
                                  className={`px-4 py-2 text-xs font-bold rounded-full transition-all border ${selectedAlbumId === album.id.toString() ? 'bg-slate-900 dark:bg-white text-white dark:text-black border-transparent shadow-lg scale-105' : 'bg-transparent border-slate-200 dark:border-slate-700 text-slate-500 hover:border-slate-400'}`}
                                >
                                  {album.title}
                                </button>
                              ))}
                            </div>

                            <AnimatePresence>
                              {!selectedAlbumId && (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className="flex flex-col md:flex-row gap-4 pt-4 border-t border-slate-50 dark:border-slate-800 overflow-hidden"
                                >
                                  <input
                                    value={newAlbumTitle}
                                    onChange={e => setNewAlbumTitle(e.target.value)}
                                    placeholder="Album Title"
                                    className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-sm outline-none"
                                  />
                                  <div className="flex-1 flex gap-2">
                                    <input
                                      value={newAlbumCover}
                                      onChange={e => setNewAlbumCover(e.target.value)}
                                      placeholder="Cover URL or Upload"
                                      className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-xl text-sm outline-none"
                                    />
                                    <label className="px-4 py-3 bg-slate-100 dark:bg-slate-700 rounded-xl cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors flex items-center justify-center">
                                      <ImageIcon className="w-4 h-4 text-slate-500" />
                                      <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) => handleAlbumCoverUpload(e.target.files?.[0] || null)}
                                      />
                                    </label>
                                  </div>
                                  <button onClick={handleAddAlbum} className="px-6 py-3 bg-slate-900 dark:bg-white text-white dark:text-black rounded-xl font-bold text-xs flex items-center gap-2">
                                    <Plus className="w-4 h-4" /> Create
                                  </button>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                        )}

                        <div className="space-y-6">
                          <h4 className="text-sm font-bold flex items-center gap-2">
                            <ImageIcon className="w-4 h-4 text-slate-400" />
                            Images
                          </h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {(selectedAlbumId
                              ? item.albums?.find(a => a.id.toString() === selectedAlbumId.toString())?.images
                              : item.images
                            )?.map((img, idx) => (
                              <div key={idx} className="relative group aspect-square rounded-2xl overflow-hidden bg-slate-50 dark:bg-slate-800">
                                <img src={img} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                  <button
                                    onClick={() => {
                                      if (confirm('Delete?')) {
                                        const updatedItem = { ...item };
                                        if (selectedAlbumId && updatedItem.albums) {
                                          updatedItem.albums = updatedItem.albums.map(a =>
                                            a.id.toString() === selectedAlbumId.toString() ? { ...a, images: a.images.filter((_, i) => i !== idx) } : a
                                          );
                                        } else if (updatedItem.images) {
                                          updatedItem.images = updatedItem.images.filter((_, i) => i !== idx);
                                        }
                                        updateGalleryItem(updatedItem);
                                      }
                                    }}
                                    className="p-2 bg-red-500 text-white rounded-full"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </div>
                            ))}
                            <label
                              onDragOver={handleDragOver}
                              onDrop={handleDrop}
                              className="aspect-square rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all group"
                            >
                              <Plus className="w-6 h-6 text-slate-300 group-hover:text-slate-500 transition-colors" />
                              <span className="text-[10px] uppercase font-bold text-slate-400">Upload or Drop</span>
                              <input
                                type="file"
                                multiple
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => handleFileUpload(e.target.files)}
                              />
                            </label>
                          </div>
                          <div className="flex flex-col sm:flex-row gap-3 p-3 md:p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl">
                            <input
                              value={newImageUrl}
                              onChange={e => setNewImageUrl(e.target.value)}
                              placeholder="Image URL"
                              className="flex-1 bg-white dark:bg-slate-900 border-none rounded-xl px-4 py-3 text-sm outline-none w-full"
                            />
                            <button onClick={handleAddImage} className="bg-slate-900 dark:bg-white text-white dark:text-black px-8 py-3 rounded-xl font-bold text-xs uppercase w-full sm:w-auto hover:scale-[1.02] active:scale-[0.98] transition-all">
                              Add
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
            </motion.div>
          ) : activeTab === 'blog' ? (
            <motion.div
              key="blog"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="max-w-6xl mx-auto space-y-10"
            >
              {!isEditingBlog ? (
                <div className="space-y-8">
                  <div className="flex justify-between items-end">
                    <div>
                      <h2 className="text-4xl font-montserrat font-bold mb-2">Editorial Hub</h2>
                      <p className="text-slate-500 dark:text-slate-400 font-montserrat">Manage your stories and updates.</p>
                    </div>
                    <button
                      onClick={handleCreateNewBlog}
                      className="bg-slate-900 dark:bg-white text-white dark:text-black px-6 py-4 rounded-xl font-bold text-xs uppercase"
                    >
                      New Post
                    </button>
                  </div>
                  <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl md:rounded-3xl overflow-hidden shadow-sm">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left min-w-[600px]">
                        <thead>
                          <tr className="bg-slate-50 dark:bg-slate-800/50">
                            <th className="p-6 text-[10px] font-bold text-slate-400 uppercase">Title</th>
                            <th className="p-6 text-[10px] font-bold text-slate-400 uppercase">Status</th>
                            <th className="p-6 text-[10px] font-bold text-slate-400 uppercase">Date</th>
                            <th className="p-6 text-[10px] font-bold text-slate-400 uppercase text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                          {blogPosts.map(post => (
                            <tr key={post.id}>
                              <td className="p-6 font-bold text-sm">{post.title}</td>
                              <td className="p-6">
                                <span className={`px-2 py-1 rounded-full text-[9px] font-bold uppercase ${post.status === 'published' ? 'bg-green-100 text-green-600 dark:bg-green-950/30' : post.status === 'scheduled' ? 'bg-blue-100 text-blue-600 dark:bg-blue-950/30' : 'bg-slate-100 text-slate-500 dark:bg-slate-800'}`}>
                                  {post.status}
                                </span>
                              </td>
                              <td className="p-6 text-xs text-slate-500">
                                {new Date(post.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                              </td>
                              <td className="p-6 text-right">
                                <div className="flex justify-end gap-2">
                                  <button onClick={() => handleEditBlog(post)} className="p-2 text-slate-400"><Edit className="w-4 h-4" /></button>
                                  <button onClick={() => { if (confirm('Delete?')) deleteBlogPost(post.id); }} className="p-2 text-slate-400"><Trash2 className="w-4 h-4" /></button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-8">
                  <div className="flex justify-between items-center">
                    <button onClick={() => setIsEditingBlog(false)} className="flex items-center gap-2 text-slate-400 font-bold uppercase text-[10px]">
                      <ArrowLeft className="w-4 h-4" /> Back
                    </button>
                    <button onClick={handleSaveBlog} className="bg-slate-900 dark:bg-white text-white dark:text-black px-8 py-3 rounded-xl font-bold text-xs uppercase">
                      Save Narrative
                    </button>
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
                    <div className="lg:col-span-2 space-y-6 md:space-y-8 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl md:rounded-3xl p-4 md:p-8">
                      <input
                        value={currentBlog.title}
                        onChange={e => setCurrentBlog({ ...currentBlog, title: e.target.value, slug: !currentBlog.id ? e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-') : currentBlog.slug })}
                        className="w-full text-2xl md:text-4xl font-display bg-transparent border-none focus:ring-0 p-0"
                        placeholder="Post Title"
                      />
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input value={currentBlog.slug} onChange={e => setCurrentBlog({ ...currentBlog, slug: e.target.value })} className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl text-xs" placeholder="slug" />
                        <input type="datetime-local" value={currentBlog.date} onChange={e => setCurrentBlog({ ...currentBlog, date: e.target.value })} className="bg-slate-50 dark:bg-slate-800 p-3 rounded-xl text-xs w-full" />
                      </div>
                      <div className="flex gap-2">
                        <input
                          value={currentBlog.coverImage}
                          onChange={e => setCurrentBlog({ ...currentBlog, coverImage: e.target.value })}
                          className="flex-grow bg-slate-50 dark:bg-slate-800 p-3 rounded-xl text-xs"
                          placeholder="Cover Image URL"
                        />
                        <label className="px-4 py-3 bg-slate-50 dark:bg-slate-800 rounded-xl cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-2 text-slate-400">
                          <ImageIcon className="w-4 h-4" />
                          <span className="text-[10px] font-bold uppercase">Upload</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleBlogCoverUpload(e.target.files?.[0] || null)}
                          />
                        </label>
                      </div>
                      <textarea rows={6} value={currentBlog.content} onChange={e => setCurrentBlog({ ...currentBlog, content: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-800 p-4 md:p-6 rounded-2xl md:rounded-3xl text-sm leading-relaxed" placeholder="Content..." />
                    </div>
                    <div className="lg:col-span-2 lg:grid-cols-1 space-y-8 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-2xl md:rounded-3xl p-4 md:p-8">
                      <h3 className="font-display text-xl">Optimization</h3>
                      <textarea rows={3} value={currentBlog.excerpt} onChange={e => setCurrentBlog({ ...currentBlog, excerpt: e.target.value })} className="w-full bg-slate-50 dark:bg-slate-800 p-3 rounded-xl text-xs" placeholder="Excerpt" />
                      <div className="space-y-4 pt-4 border-t border-slate-50 dark:border-slate-800">
                        <h4 className="text-[10px] uppercase font-bold text-slate-400">Visibility & Status</h4>
                        <div className="grid grid-cols-3 gap-2">
                          {(['draft', 'scheduled', 'published'] as const).map(status => (
                            <button
                              key={status}
                              onClick={() => setCurrentBlog({ ...currentBlog, status })}
                              className={`py-2 rounded-lg text-[9px] font-bold uppercase transition-all ${currentBlog.status === status ? 'bg-slate-900 dark:bg-white text-white dark:text-black scale-105' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-600'}`}
                            >
                              {status}
                            </button>
                          ))}
                        </div>
                        {currentBlog.status === 'scheduled' && (
                          <p className="text-[9px] text-blue-500 font-medium italic">Post will go live automatically on {currentBlog.date}</p>
                        )}
                      </div>
                      <div className="space-y-4 pt-4 border-t border-slate-50 dark:border-slate-800">
                        <h4 className="text-[10px] uppercase font-bold text-slate-400">Author Details</h4>
                        <input value={currentBlog.author.name} onChange={e => setCurrentBlog({ ...currentBlog, author: { ...currentBlog.author, name: e.target.value } })} className="w-full bg-slate-50 dark:bg-slate-800 p-3 rounded-xl text-xs" placeholder="Author Name" />
                        <input value={currentBlog.author.role} onChange={e => setCurrentBlog({ ...currentBlog, author: { ...currentBlog.author, role: e.target.value } })} className="w-full bg-slate-50 dark:bg-slate-800 p-3 rounded-xl text-xs" placeholder="Author Role" />
                      </div>
                      <div className="space-y-4 pt-4 border-t border-slate-50 dark:border-slate-800">
                        <h4 className="text-[10px] uppercase font-bold text-slate-400">SEO Setting</h4>
                        <input value={currentBlog.seo.metaTitle} onChange={e => setCurrentBlog({ ...currentBlog, seo: { ...currentBlog.seo, metaTitle: e.target.value } })} className="w-full bg-slate-50 dark:bg-slate-800 p-3 rounded-xl text-xs" placeholder="Meta Title" />
                        <textarea value={currentBlog.seo.metaDescription} onChange={e => setCurrentBlog({ ...currentBlog, seo: { ...currentBlog.seo, metaDescription: e.target.value } })} className="w-full bg-slate-50 dark:bg-slate-800 p-3 rounded-xl text-xs" placeholder="Meta Description" />
                        <input value={seoKeywordsInput} onChange={e => setSeoKeywordsInput(e.target.value)} className="w-full bg-slate-50 dark:bg-slate-800 p-3 rounded-xl text-xs" placeholder="Keywords" />
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="about"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="max-w-4xl mx-auto space-y-10"
            >
              <div className="flex justify-between items-end">
                <div>
                  <h2 className="text-4xl font-montserrat font-bold mb-2">About Management</h2>
                  <p className="text-slate-500 dark:text-slate-400 font-montserrat">Manage your professional biography and story.</p>
                </div>
                <button
                  onClick={handleAboutSave}
                  className="bg-slate-900 dark:bg-white text-white dark:text-black px-8 py-4 rounded-xl font-bold text-xs uppercase shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all"
                >
                  Save Changes
                </button>
              </div>

              {aboutForm ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                  <div className="lg:col-span-1 space-y-8">
                    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-6 shadow-sm space-y-6">
                      <h3 className="font-display text-xl">Profile Portrait</h3>
                      <div className="aspect-[4/5] rounded-2xl overflow-hidden bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800">
                        <img src={aboutForm.image_url} className="w-full h-full object-cover" alt="About Portrait" />
                      </div>
                      <div className="space-y-4">
                        <input
                          value={aboutForm.image_url}
                          onChange={e => setAboutForm({ ...aboutForm, image_url: e.target.value })}
                          className="w-full bg-slate-50 dark:bg-slate-800 p-3 rounded-xl text-[10px] outline-none"
                          placeholder="Image URL"
                        />
                        <label className="w-full py-3 bg-slate-900 dark:bg-white text-white dark:text-black rounded-xl cursor-pointer hover:opacity-90 transition-opacity flex items-center justify-center gap-2 text-[10px] font-bold uppercase">
                          <ImageIcon className="w-4 h-4" />
                          Update Portrait
                          <input
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={(e) => handleAboutImageUpload(e.target.files?.[0] || null)}
                          />
                        </label>
                      </div>
                    </div>
                  </div>

                  <div className="lg:col-span-2 space-y-8">
                    <div className="bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl p-8 shadow-sm space-y-8">
                      <div className="space-y-4">
                        <label className="text-[10px] uppercase font-bold text-slate-400">Specialties / Tags</label>
                        <input
                          value={aboutForm.specialties}
                          onChange={e => setAboutForm({ ...aboutForm, specialties: e.target.value })}
                          className="w-full text-sm font-medium bg-slate-50 dark:bg-slate-800 p-4 rounded-xl text-slate-900 dark:text-white outline-none focus:ring-1 focus:ring-slate-200 dark:focus:ring-slate-700"
                          placeholder="e.g. Architecture • Travel • Conceptual"
                        />
                      </div>

                      <div className="space-y-4">
                        <label className="text-[10px] uppercase font-bold text-slate-400">Intro Heading</label>
                        <input
                          value={aboutForm.intro_heading}
                          onChange={e => setAboutForm({ ...aboutForm, intro_heading: e.target.value })}
                          className="w-full text-xl md:text-2xl font-display bg-transparent border-none focus:ring-0 p-0 text-slate-900 dark:text-white"
                          placeholder="Short impactful intro..."
                        />
                      </div>

                      <div className="space-y-4">
                        <label className="text-[10px] uppercase font-bold text-slate-400">Biography - Paragraph 1</label>
                        <textarea
                          rows={4}
                          value={aboutForm.bio_text_p1}
                          onChange={e => setAboutForm({ ...aboutForm, bio_text_p1: e.target.value })}
                          className="w-full bg-slate-50 dark:bg-slate-800 p-4 rounded-xl text-sm leading-relaxed outline-none focus:ring-1 focus:ring-slate-200 dark:focus:ring-slate-700"
                          placeholder="First paragraph..."
                        />
                      </div>

                      <div className="space-y-4">
                        <label className="text-[10px] uppercase font-bold text-slate-400">Biography - Paragraph 2</label>
                        <textarea
                          rows={4}
                          value={aboutForm.bio_text_p2}
                          onChange={e => setAboutForm({ ...aboutForm, bio_text_p2: e.target.value })}
                          className="w-full bg-slate-50 dark:bg-slate-800 p-4 rounded-xl text-sm leading-relaxed outline-none focus:ring-1 focus:ring-slate-200 dark:focus:ring-slate-700"
                          placeholder="Second paragraph..."
                        />
                      </div>

                      <div className="pt-8 border-t border-slate-50 dark:border-slate-800 space-y-6">
                        <h3 className="font-display text-xl">Philosophy Statement</h3>
                        <div className="space-y-4">
                          <label className="text-[10px] uppercase font-bold text-slate-400">Quote</label>
                          <textarea
                            rows={3}
                            value={aboutForm.philosophy_quote}
                            onChange={e => setAboutForm({ ...aboutForm, philosophy_quote: e.target.value })}
                            className="w-full bg-slate-50 dark:bg-slate-800 p-4 rounded-xl text-sm italic leading-relaxed outline-none focus:ring-1 focus:ring-slate-200 dark:focus:ring-slate-700"
                            placeholder="A meaningful quote..."
                          />
                        </div>
                        <div className="space-y-4">
                          <label className="text-[10px] uppercase font-bold text-slate-400">Author</label>
                          <input
                            value={aboutForm.philosophy_author}
                            onChange={e => setAboutForm({ ...aboutForm, philosophy_author: e.target.value })}
                            className="w-full bg-slate-50 dark:bg-slate-800 p-3 rounded-xl text-xs outline-none focus:ring-1 focus:ring-slate-200 dark:focus:ring-slate-700"
                            placeholder="Quote author name..."
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-20 text-center bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
                  <p className="text-slate-400">Loading about content...</p>
                </div>
              )}
            </motion.div>
          )}

        </AnimatePresence>
      </main>
    </div>
  );
};

export default Admin;