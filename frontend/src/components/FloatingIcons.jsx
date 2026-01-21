import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Heart, MessageCircle, Smile, Frown, Hash, Globe, MessageSquare, Zap } from 'lucide-react';

const icons = [Heart, MessageCircle, Smile, Frown, Hash, Globe, MessageSquare, Zap];

const FloatingIcons = () => {
    const [floatingItems, setFloatingItems] = useState([]);

    useEffect(() => {
        // Reduced count from 15 to 6 for performance
        const items = Array.from({ length: 6 }).map((_, i) => ({
            id: i,
            Icon: icons[Math.floor(Math.random() * icons.length)],
            top: `${Math.random() * 90}%`,
            left: `${Math.random() * 90}%`,
            size: Math.random() * 10 + 20, // 20px - 30px
            delay: Math.random() * 5,
            duration: Math.random() * 20 + 20, // Very slow movement (20s-40s)
        }));
        setFloatingItems(items);
    }, []);

    return (
        <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
            {floatingItems.map((item) => (
                <motion.div
                    key={item.id}
                    className="absolute text-slate-400/20 dark:text-slate-500/10"
                    style={{ top: item.top, left: item.left }}
                    initial={{ y: 0, opacity: 0 }}
                    animate={{
                        y: [0, -30], // Short move
                        opacity: [0, 0.3, 0], // Subtle fade
                    }}
                    transition={{
                        duration: item.duration,
                        repeat: Infinity,
                        delay: item.delay,
                        ease: "linear",
                    }}
                >
                    <item.Icon size={item.size} strokeWidth={1.5} />
                </motion.div>
            ))}
        </div>
    );
};

export default FloatingIcons;
