import React from 'react';
import { motion } from 'framer-motion';

const About: React.FC = () => {
    return (
        <section id="about" className="bg-background-light dark:bg-background-dark py-20 md:py-32 transition-colors duration-300">
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
                                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=2000&auto=format&fit=crop"
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
                            "Capturing the unseen threads that weave our urban narratives."
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
                            <p className="mb-6">
                                I am an architecture, travel & conceptual photographer forged in Kenya and based in Nairobi. I see myself as an artist using photography as a medium to see the world and invite you to see the world as I do.
                            </p>
                            <p>
                                My passion for urban living and the stories of the people within them drives my desire to document the different and deeper aspects of being African. By centering architecture and people, my work challenges the way we perceive cities and urbanity.
                            </p>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, delay: 0.4 }}
                        >
                            <p className="mb-6">
                                I am currently on a mission to photograph all African cities in a project called <span className="font-bold border-b border-slate-400 dark:border-slate-600 italic">'Unscrambling Africa'</span>, which is at heart an exploration into African urbanity, architecture & culture.
                            </p>
                            <p>
                                Above all, it is the pursuit of authenticity and the beauty in the mundane that brings me the most joy. My work is an invitation to pause, look closer, and find the extraordinary in the everyday.
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
                            "In essence, art is reaching for the future by manipulating the present."
                        </h3>
                        <p className="text-slate-400 text-sm uppercase tracking-widest">— Emily Wood, Africa is a Country</p>
                    </motion.div>

                </div>
            </div>
        </section>
    );
};

export default About;
