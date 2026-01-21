import React from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { ImageIcon, BarChart2 } from 'lucide-react';

const GFGVisuals = ({ wordCloudImage, aggregateData }) => {
    if (!wordCloudImage && !aggregateData) return null;

    // Prepare Histogram Data
    const histogramData = [
        { name: 'Positive', count: aggregateData?.positive || 0, fill: '#10b981' },
        { name: 'Neutral', count: aggregateData?.neutral || 0, fill: '#f59e0b' },
        { name: 'Negative', count: aggregateData?.negative || 0, fill: '#ef4444' },
    ];

    return (
        <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-2 gap-8 mt-12 mb-12">

            {/* Word Cloud Section */}
            {wordCloudImage && (
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="card-3d p-6 flex flex-col items-center bg-white/80 backdrop-blur-xl"
                >
                    <div className="flex items-center gap-3 mb-6 w-full border-b border-slate-200 pb-4">
                        <div className="icon-3d-small text-purple-600">
                            <ImageIcon size={20} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800">Word Cloud</h3>
                    </div>

                    <div className="relative group overflow-hidden rounded-2xl border-4 border-white shadow-inner">
                        <img
                            src={`data:image/png;base64,${wordCloudImage}`}
                            alt="Word Cloud"
                            className="w-full h-auto object-contain transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors pointer-events-none" />
                    </div>
                    <p className="mt-4 text-sm text-slate-500 font-medium">Top frequent words in this batch</p>
                </motion.div>
            )}

            {/* Histogram Section */}
            {aggregateData && (
                <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="card-3d p-6 flex flex-col items-center bg-white/80 backdrop-blur-xl"
                >
                    <div className="flex items-center gap-3 mb-6 w-full border-b border-slate-200 pb-4">
                        <div className="icon-3d-small text-blue-600">
                            <BarChart2 size={20} />
                        </div>
                        <h3 className="text-xl font-bold text-slate-800">Sentiment Histogram</h3>
                    </div>

                    <div className="w-full h-[300px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart
                                data={histogramData}
                                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                                <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                                <Tooltip
                                    cursor={{ fill: 'transparent' }}
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' }}
                                />
                                <Bar dataKey="count" radius={[8, 8, 0, 0]} barSize={60} animationDuration={1500} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                    <p className="mt-4 text-sm text-slate-500 font-medium">Frequency distribution of sentiments</p>
                </motion.div>
            )}

        </div>
    );
};

export default GFGVisuals;
