import React from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../context/DataContext';
import { BlogPost } from '../types';
import { motion } from 'framer-motion';

const AuthorAvatar: React.FC<{ name?: string; avatar?: string }> = ({ name = 'Anonymous', avatar }) => {
  const initials = name
    .includes(' ')
    ? name.split(' ').map(n => n[0]).join('').toUpperCase()
    : name.slice(0, 2).toUpperCase();

  const colors = [
    'bg-emerald-500',
    'bg-blue-500',
    'bg-purple-500',
    'bg-gray-500',
    'bg-indigo-500'
  ];
  const colorIndex = name.length % colors.length;

  return (
    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-xs ring-2 ring-white/10 ${avatar ? '' : colors[colorIndex]}`}>
      {avatar ? (
        <img src={avatar} alt={name} className="w-full h-full rounded-full object-cover" />
      ) : (
        initials
      )}
    </div>
  );
};

const Blog: React.FC = () => {
  const { blogPosts } = useData();

  const isPostVisible = (post: BlogPost) => {
    const status = post.status || 'published'; // Default to published for legacy data
    if (status === 'published') return true;
    if (status === 'scheduled') {
      const postDate = new Date(post.date);
      const now = new Date();
      return postDate <= now;
    }
    return false;
  };

  const visiblePosts = (blogPosts || []).filter(isPostVisible);

  const sortedPosts = [...visiblePosts].sort((a, b) =>
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const featuredPost = sortedPosts[0];
  const otherPosts = sortedPosts.slice(1);

  if (!featuredPost) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center text-slate-400 font-montserrat uppercase tracking-widest text-xs">
        No entries found in the journal
      </div>
    );
  }

  return (
    <div className="bg-[#020617] min-h-screen py-10 transition-colors duration-300">
      <div className="container mx-auto px-6 max-w-7xl">

        {/* Featured Post Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-[#0f172a] rounded-[2rem] overflow-hidden border border-white/5 mb-12 shadow-2xl"
        >
          <div className="flex flex-col lg:flex-row">
            {/* Image Container with Reflection Effect */}
            <div className="lg:w-1/2 p-6 md:p-8">
              <div className="relative group">
                <div className="aspect-[16/10] rounded-2xl overflow-hidden shadow-xl ring-1 ring-white/10">
                  <img
                    src={featuredPost.coverImage}
                    alt={featuredPost.title}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                {/* Reflection effect placeholder - subtle gradient below */}
                <div className="absolute -bottom-8 left-0 right-0 h-8 bg-gradient-to-b from-white/10 to-transparent blur-xl opacity-50 group-hover:opacity-70 transition-opacity" />
              </div>
            </div>

            {/* Content Container */}
            <div className="lg:w-1/2 p-8 md:p-12 lg:pl-4 flex flex-col justify-center">
              <div className="flex items-center gap-3 mb-6">
                <span className="text-slate-500 text-xs font-montserrat font-medium uppercase tracking-wider">
                  {new Date(featuredPost.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                </span>
                <span className="px-3 py-1 bg-blue-500/10 text-blue-400 text-[10px] font-montserrat font-bold uppercase tracking-widest rounded-full border border-blue-500/20">
                  {featuredPost.seo.keywords[0] || 'Featured'}
                </span>
              </div>
              <h2 className="text-3xl md:text-5xl font-montserrat font-bold text-white mb-6 leading-tight tracking-tight hover:text-blue-400 transition-colors">
                <Link to={`/blog/${featuredPost.slug}`}>
                  {featuredPost.title}
                </Link>
              </h2>
              <p className="text-slate-400 font-montserrat text-base md:text-lg leading-relaxed mb-10 line-clamp-3">
                {featuredPost.excerpt}
              </p>

              {/* Author Information */}
              <div className="flex items-center gap-4 mt-auto">
                <AuthorAvatar name={featuredPost.author?.name} avatar={featuredPost.author?.avatar} />
                <div className="flex flex-col">
                  <span className="text-white font-montserrat font-bold text-sm">{featuredPost.author?.name || 'Anonymous'}</span>
                  <span className="text-slate-500 font-montserrat text-[11px] uppercase tracking-wider">{featuredPost.author?.role || 'Contributor'}</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-10">
          {otherPosts.map((post, idx) => (
            <motion.article
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="bg-[#0f172a] rounded-[2rem] overflow-hidden border border-white/5 flex flex-col shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all group"
            >
              <Link to={`/blog/${post.slug}`} className="block overflow-hidden aspect-[16/10] m-5 mb-0 rounded-2xl relative">
                <img
                  src={post.coverImage}
                  alt={post.title}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />
              </Link>

              <div className="p-8 flex-grow flex flex-col">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-slate-500 text-[10px] font-montserrat font-medium uppercase tracking-wider">
                    {new Date(post.date).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                  </span>
                  <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 text-[9px] font-montserrat font-bold uppercase tracking-widest rounded-full border border-blue-500/20">
                    {post.seo.keywords[0] || 'Article'}
                  </span>
                </div>

                <h3 className="text-xl font-montserrat font-bold text-white mb-4 line-clamp-2 leading-tight group-hover:text-blue-400 transition-colors">
                  <Link to={`/blog/${post.slug}`}>
                    {post.title}
                  </Link>
                </h3>

                <p className="text-slate-400 font-montserrat text-sm leading-relaxed mb-10 line-clamp-3">
                  {post.excerpt}
                </p>

                <div className="flex items-center gap-3 mt-auto">
                  <AuthorAvatar name={post.author?.name} avatar={post.author?.avatar} />
                  <div className="flex flex-col">
                    <span className="text-white font-montserrat font-bold text-[13px]">{post.author?.name || 'Anonymous'}</span>
                    <span className="text-slate-500 font-montserrat text-[10px] uppercase tracking-wider">{post.author?.role || 'Contributor'}</span>
                  </div>
                </div>
              </div>
            </motion.article>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Blog;