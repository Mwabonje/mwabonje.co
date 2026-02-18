export interface Album {
  id: number | string;
  title: string;
  cover: string;
  images: string[];
}

export interface GalleryItem {
  id: number;
  type: 'wide' | 'tall' | 'square';
  src: string;
  title: string;
  alt: string;
  images?: string[];
  albums?: Album[];
}

export interface NavLink {
  label: string;
  href: string;
  external?: boolean;
}

export type BlogStatus = 'published' | 'draft' | 'scheduled';

export interface BlogPost {
  status: BlogStatus;
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string; // HTML or Markdown
  coverImage: string;
  date: string;
  seo: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
  };
  author: {
    name: string;
    role: string;
    avatar?: string;
  };
}