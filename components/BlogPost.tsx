import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { ArrowLeft, User, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

const BlogPost: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const { blogPosts } = useData();

  const post = blogPosts.find(p => {
    if (p.slug !== slug) return false;

    // Visibility logic
    const status = p.status || 'published';
    if (status === 'published') return true;
    if (status === 'scheduled') {
      const postDate = new Date(p.date);
      const now = new Date();
      return postDate <= now;
    }
    return false;
  });

  useEffect(() => {
    if (post) {
      document.title = `${post.title} | Journal`;
      window.scrollTo(0, 0);
    }
  }, [post]);

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#020617]">
        <h1 className="text-2xl font-montserrat mb-4 text-white">Post not found</h1>
        <Link to="/blog" className="text-sm font-bold uppercase tracking-widest text-blue-400">Back to Journal</Link>
      </div>
    );
  }

  return (
    <div className="bg-[#020617] min-h-screen text-white font-montserrat">
      <motion.article
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="py-6 md:py-12 transition-colors duration-300"
      >
        <div className="container mx-auto px-4 md:px-6 max-w-4xl">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-slate-500 hover:text-white transition-colors mb-6 md:mb-10 text-[10px] font-bold uppercase tracking-widest group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Journal
          </Link>

          {/* Featured Image */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="aspect-[16/9] w-full rounded-[2rem] overflow-hidden shadow-2xl mb-16 ring-1 ring-white/10"
          >
            <img
              src={post.coverImage}
              alt={post.title}
              className="w-full h-full object-cover"
            />
          </motion.div>

          {/* Title and Excerpt */}
          <div className="space-y-6 mb-16">
            <h1 className="text-3xl md:text-5xl lg:text-7xl font-montserrat font-bold text-white mb-6 md:mb-8 leading-[1.1] tracking-tight">
              {post.title}
            </h1>
            {post.excerpt && (
              <p className="text-lg md:text-2xl text-slate-400 font-montserrat leading-relaxed max-w-3xl">
                {post.excerpt}
              </p>
            )}

            <div className="flex items-center gap-6 pt-6 border-t border-white/5">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-[10px] font-bold">
                  {(post.author?.name || 'A')[0]}
                </div>
                <div>
                  <p className="text-xs font-bold">{post.author?.name || 'Anonymous'}</p>
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest">{post.author?.role || 'Contributor'}</p>
                </div>
              </div>
              <div className="h-8 w-[1px] bg-white/5" />
              <div className="flex items-center gap-2 text-slate-500 text-[10px] font-bold uppercase tracking-widest">
                <Calendar className="w-3 h-3" /> {new Date(post.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
          </div>

          {/* Content with screenshot matching styles */}
          <div
            className="prose prose-invert prose-slate max-w-none 
              font-montserrat text-lg leading-relaxed 
              prose-headings:text-white prose-headings:font-bold prose-headings:tracking-tight prose-headings:mt-16 prose-headings:mb-8
              prose-h2:text-3xl prose-h3:text-2xl
              prose-p:text-slate-400 prose-p:mb-8 
              prose-a:text-blue-400 prose-a:no-underline hover:prose-a:underline
              prose-img:rounded-3xl prose-img:my-16
              prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:bg-blue-500/5 prose-blockquote:px-8 prose-blockquote:py-8 prose-blockquote:my-12 prose-blockquote:italic prose-blockquote:text-white prose-blockquote:text-xl prose-blockquote:rounded-r-2xl prose-blockquote:font-medium
              prose-ul:list-disc prose-ul:pl-6 prose-ul:space-y-4 prose-ul:text-slate-400 prose-li:marker:text-blue-500
              selection:bg-blue-500/20"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* Footer Navigation */}
          <div className="mt-24 pt-12 border-t border-white/10 flex flex-col items-center">
            <h3 className="text-xl font-bold mb-8">Continue reading?</h3>
            <Link
              to="/blog"
              className="px-10 py-4 bg-white text-black rounded-full font-bold text-[10px] uppercase tracking-[0.2em] hover:scale-105 hover:bg-blue-400 transition-all shadow-xl"
            >
              Explore Journal Archives
            </Link>
          </div>
        </div>
      </motion.article>
    </div>
  );
};

export default BlogPost;