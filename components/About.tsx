import React from 'react';
import { motion } from 'framer-motion';
import { useData } from '../context/DataContext';

const About: React.FC = () => {
    const { aboutContent, loading } = useData();

    if (loading && !aboutContent) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background-light dark:bg-background-dark">
                <div className="w-10 h-10 border-4 border-slate-200 border-t-slate-900 rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!aboutContent) return null;

    return (
        <section id="about" className="bg-background-light dark:bg-background-dark pt-12 md:pt-20 pb-12 md:pb-20 transition-colors duration-300">
            <div className="container mx-auto px-6">
                <div className="max-w-4xl mx-auto flex flex-col items-center">

                    {/* Main Image */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="w-full mb-16 md:mb-24"
                    >
                        <div className="relative aspect-[4/5] md:aspect-[16/9] overflow-hidden rounded-sm grayscale hover:grayscale-0 transition-all duration-1000">
                            <img
                                src={aboutContent.image_url}
                                alt="Mwabonje - Professional Photographer"
                                className="w-full h-full object-cover"
                            />
                        </div>
                    </motion.div>

                    {/* Intro Text */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        className="text-center mb-12 md:mb-20"
                    >
                        <p className="text-slate-500 dark:text-slate-400 uppercase tracking-[0.3em] text-xs font-bold mb-6">
                            Architecture • Travel • Conceptual
                        </p>
                        <h2 className="font-serif text-3xl md:text-5xl text-slate-900 dark:text-white leading-tight max-w-2xl mx-auto italic">
                            "{aboutContent.intro_heading}"
                        </h2>
                    </motion.div>

                    {/* Biography Content */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 text-slate-600 dark:text-slate-300 font-light leading-relaxed text-lg">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, delay: 0.4 }}
                        >
                            <p className="mb-6 whitespace-pre-wrap">
                                {aboutContent.bio_text_p1}
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, delay: 0.4 }}
                        >
                            <p className="mb-6 whitespace-pre-wrap">
                                {aboutContent.bio_text_p2}
                            </p>
                        </motion.div>
                    </div>

                    {/* Philosophy Section */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.6 }}
                        className="mt-24 md:mt-32 text-center border-t border-slate-200 dark:border-slate-800 pt-16 w-full"
                    >
                        <h3 className="font-serif text-2xl md:text-3xl text-slate-900 dark:text-white mb-8 italic">
                            "{aboutContent.philosophy_quote}"
                        </h3>
                        <p className="text-slate-400 text-sm uppercase tracking-widest">— {aboutContent.philosophy_author}</p>
                    </motion.div>

                </div>
            </div>
        </section>
    );
};

export default About;
