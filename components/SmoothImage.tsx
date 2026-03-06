import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SmoothImageProps {
    src: string;
    alt: string;
    className?: string;
    containerClassName?: string;
    loading?: "lazy" | "eager";
    decoding?: "async" | "sync" | "auto";
    onClick?: () => void;
    hoverEffect?: boolean;
    duration?: number;
}

const SmoothImage: React.FC<SmoothImageProps> = ({
    src,
    alt,
    className = "",
    containerClassName = "",
    loading = "lazy",
    decoding = "async",
    onClick,
    hoverEffect = false,
    duration = 0.3
}) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [error, setError] = useState(false);

    // Reset state when src changes
    useEffect(() => {
        setIsLoaded(false);
        setError(false);
    }, [src]);

    return (
        <div
            className={`relative overflow-hidden ${containerClassName}`}
            onClick={onClick}
        >
            {/* Background/Skeleton loader */}
            <AnimatePresence shadow-sm>
                {!isLoaded && !error && (
                    <motion.div
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-slate-100 dark:bg-slate-900"
                    />
                )}
            </AnimatePresence>

            {error ? (
                <div className="absolute inset-0 flex items-center justify-center bg-slate-100 dark:bg-slate-900 px-4 text-center">
                    <span className="text-xs text-slate-400 font-sans uppercase tracking-widest">Image unavailable</span>
                </div>
            ) : (
                <motion.img
                    src={src}
                    alt={alt}
                    loading={loading}
                    decoding={decoding}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: isLoaded ? 1 : 0 }}
                    transition={{ duration: duration, ease: "easeOut" }}
                    onLoad={() => setIsLoaded(true)}
                    onError={() => setError(true)}
                    className={`${className} ${hoverEffect ? 'transition-transform duration-700 hover:scale-105' : ''}`}
                />
            )}
        </div>
    );
};

export default SmoothImage;
