import React from 'react';
import { motion } from 'framer-motion';

const SentimentCard = ({ result, minimal = false }) => {
    if (!result) return null;

    const { label, score, emoji } = result;

    // Determine color based on label
    const getColor = () => {
        switch (label.toLowerCase()) {
            case 'positive': return 'text-green-600 border-green-200 bg-green-50';
            case 'negative': return 'text-red-600 border-red-200 bg-red-50';
            default: return 'text-yellow-600 border-yellow-200 bg-yellow-50';
        }
    };

    const colorClass = getColor();
    const percentage = Math.round(score * 100);

    if (minimal) {
        return (
            <div className={`p-4 rounded-xl border ${colorClass} flex items-center justify-between`}>
                <div className="flex items-center space-x-3">
                    <span className="text-2xl">{emoji}</span>
                    <span className="font-bold capitalize">{label}</span>
                </div>
                <span className="font-bold">{percentage}%</span>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-8 p-8 text-center rounded-2xl border ${colorClass} bg-white shadow-lg relative overflow-hidden max-w-xl mx-auto`}
        >
            <div className="absolute top-0 left-0 w-full h-1.5 bg-slate-100">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className={`h-full ${label === 'positive' ? 'bg-green-500' : label === 'negative' ? 'bg-red-500' : 'bg-yellow-500'}`}
                />
            </div>

            <motion.div
                initial={{ scale: 0.5 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, damping: 10 }}
                className="text-7xl mb-6 filter drop-shadow-md"
            >
                {emoji}
            </motion.div>

            <h2 className="text-3xl font-bold capitalize mb-2 tracking-tight text-slate-900">{label}</h2>
            <p className="text-slate-500 font-medium text-sm uppercase tracking-widest mb-6">Sentiment Detected</p>

            {/* Language & Translation Info */}
            {(result.language && result.language !== 'unknown') && (
                <div className="mb-6 p-4 bg-slate-50 rounded-xl border border-slate-200 text-sm">
                    <div className="flex items-center justify-between text-slate-500 mb-3">
                        <div className="flex items-center space-x-2">
                            <span className="uppercase text-xs font-bold tracking-wider">Language:</span>
                            <span className="text-blue-700 bg-blue-100 px-2.5 py-1 rounded-md text-xs font-semibold">
                                {result.language_name || result.language}
                            </span>
                        </div>

                        {/* Language Actions */}
                        <div className="flex space-x-3">
                            <button
                                onClick={() => {
                                    if (result.translation) {
                                        const u = new SpeechSynthesisUtterance(result.translation);
                                        u.lang = 'en';
                                        window.speechSynthesis.speak(u);
                                    }
                                }}
                                className="icon-3d-small text-slate-600 hover:text-blue-600"
                                title="Speak Translation"
                            >
                                🔊
                            </button>
                            <a
                                href={`https://en.wikipedia.org/wiki/${result.language_name || result.language}_language`}
                                target="_blank"
                                rel="noreferrer"
                                className="icon-3d-small text-slate-600 hover:text-emerald-600"
                                title="About this Language"
                            >
                                🌍
                            </a>
                        </div>
                    </div>

                    {result.translation && (
                        <div className="mt-3 pt-3 border-t border-slate-200 text-left">
                            <span className="block text-xs text-slate-400 mb-1.5 uppercase tracking-wider font-semibold">Translation:</span>
                            <p className="italic text-slate-700 font-medium">"{result.translation}"</p>
                        </div>
                    )}
                </div>
            )}

            <div className="inline-block px-4 py-2 rounded-full bg-slate-100 border border-slate-200">
                <span className="font-bold text-xl text-slate-900">{percentage}%</span>
                <span className="text-sm text-slate-500 ml-2">Confidence</span>
            </div>
        </motion.div>
    );
};

export default SentimentCard;
