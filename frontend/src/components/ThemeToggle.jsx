import React, { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { motion } from 'framer-motion';

const ThemeToggle = () => {
    // Check local storage or system preference
    const [theme, setTheme] = useState(
        localStorage.getItem('theme') ||
        (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    );

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    };

    return (
        <motion.button
            whileHover={{ scale: 1.1, translateY: -2 }}
            whileTap={{ scale: 0.95, translateY: 0 }}
            onClick={toggleTheme}
            className={`fixed top-6 right-6 z-50 p-4 rounded-full transition-all duration-300 border ${theme === 'dark'
                    ? 'bg-gradient-to-br from-slate-800 to-slate-950 border-amber-500/30 text-amber-400 shadow-[0_6px_0_#1e293b,0_10px_20px_rgba(0,0,0,0.5)] hover:shadow-[0_8px_0_#1e293b,0_15px_30px_rgba(251,191,36,0.2)]'
                    : 'bg-gradient-to-br from-white to-slate-100 border-white/50 text-indigo-600 shadow-[0_6px_0_#94a3b8,0_10px_20px_rgba(59,130,246,0.3)] hover:shadow-[0_8px_0_#94a3b8,0_15px_30px_rgba(59,130,246,0.4)]'
                }`}
            style={{
                backdropFilter: 'blur(10px)',
            }}
        >
            <motion.div
                initial={false}
                animate={{ rotate: theme === 'dark' ? 180 : 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 10 }}
            >
                {theme === 'dark' ? <Sun size={26} strokeWidth={2.5} fill="currentColor" className="opacity-90" /> : <Moon size={26} strokeWidth={2.5} fill="currentColor" className="opacity-90" />}
            </motion.div>
        </motion.button>
    );
};

export default ThemeToggle;
