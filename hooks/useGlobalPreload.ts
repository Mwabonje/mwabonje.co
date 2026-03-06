import { useEffect } from 'react';
import { GalleryItem, BlogPost } from '../types';

export const useGlobalPreload = (galleryItems: GalleryItem[], blogPosts: BlogPost[]) => {
    useEffect(() => {
        if (!galleryItems.length && !blogPosts.length) return;

        const preloadImage = (url: string) => {
            if (!url) return;
            const img = new Image();
            img.src = url;
        };

        // Priority 1: Gallery Covers
        galleryItems.forEach(item => {
            if (item.src) preloadImage(item.src);
        });

        // Priority 2: Blog Covers
        blogPosts.forEach(post => {
            if (post.coverImage) preloadImage(post.coverImage);
        });

        // Priority 3: Internal Gallery Images (Delayed to allow UI to breathe)
        const timeout = setTimeout(() => {
            galleryItems.forEach(item => {
                // Category internal images
                if (Array.isArray(item.images)) {
                    item.images.forEach(url => preloadImage(url));
                }

                // Album internal images
                if (Array.isArray(item.albums)) {
                    item.albums.forEach(album => {
                        if (album.cover) preloadImage(album.cover);
                        if (Array.isArray(album.images)) {
                            album.images.forEach(url => preloadImage(url));
                        }
                    });
                }
            });
        }, 2000);

        return () => clearTimeout(timeout);
    }, [galleryItems, blogPosts]);
};
