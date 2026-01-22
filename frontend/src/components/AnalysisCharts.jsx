import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import { Info } from 'lucide-react';

const COLORS = {
    positive: '#10b981', // Green
    negative: '#ef4444', // Red
    neutral: '#f59e0b'   // Amber
};

const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-slate-800 text-white p-2 rounded border border-slate-700 text-sm shadow-xl">
                <p className="font-bold mb-1 capitalize">{label || payload[0].name}</p>
                <p>{`Score: ${(payload[0].value * 100).toFixed(1)}%`}</p>
            </div>
        );
    }
    return null;
};

const AnalysisCharts = ({ currentDetails, comparisonDetails, titlePie = "Confidence Distribution", titleBar = "Decision Logic" }) => {
    const [showConfInfo, setShowConfInfo] = useState(true);
    const [showDecInfo, setShowDecInfo] = useState(true);

    if (!currentDetails || currentDetails.length === 0) return null;

    // Prepare data for Pie Chart (Confidence Breakdown)
    // currentDetails is list of {label, score}
    const chartData = currentDetails.map(item => ({
        name: item.label,
        value: item.score
    }));

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8 w-full max-w-4xl mx-auto">
            {/* Confidence Breakdown (Pie) */}
            <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="glass-panel p-6 flex flex-col items-center"
            >
                <div className="flex items-center gap-3 mb-4 cursor-pointer group" onClick={() => setShowConfInfo(!showConfInfo)}>
                    <h3 className="text-xl font-bold gradient-text">{titlePie}</h3>
                    <div className="icon-3d-small group-hover:text-blue-500">
                        <Info size={16} />
                    </div>
                </div>
                <AnimatePresence>
                    {showConfInfo && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="text-sm text-slate-600 bg-slate-100 p-3 rounded-lg mb-4 text-center overflow-hidden border border-slate-200"
                        >
                            Visualizes the distribution of sentiment.
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="w-full" style={{ height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={chartData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="value"
                                label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
                                    const RADIAN = Math.PI / 180;
                                    const radius = outerRadius + 20;
                                    const x = cx + radius * Math.cos(-midAngle * RADIAN);
                                    const y = cy + radius * Math.sin(-midAngle * RADIAN);

                                    return (
                                        <text x={x} y={y} fill="#475569" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={12} fontWeight="500">
                                            {`${(percent * 100).toFixed(0)}%`}
                                        </text>
                                    );
                                }}
                            >
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[entry.name.toLowerCase()] || '#8884d8'} stroke="none" />
                                ))}
                            </Pie>
                            <Tooltip content={<CustomTooltip />} />
                            <Legend verticalAlign="bottom" height={36} iconType="circle" />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </motion.div>

            {/* Score Comparison (Bar) */}
            <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
                className="glass-panel p-6 flex flex-col items-center"
            >
                <div className="flex items-center gap-3 mb-4 cursor-pointer group" onClick={() => setShowDecInfo(!showDecInfo)}>
                    <h3 className="text-xl font-bold gradient-text">{titleBar}</h3>
                    <div className="icon-3d-small group-hover:text-blue-500">
                        <Info size={16} />
                    </div>
                </div>
                <AnimatePresence>
                    {showDecInfo && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="text-sm text-slate-600 bg-slate-100 p-3 rounded-lg mb-4 text-center overflow-hidden border border-slate-200"
                        >
                            Compares the sentiment scores side-by-side.
                        </motion.div>
                    )}
                </AnimatePresence>

                <div className="w-full" style={{ height: 300 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 20, right: 10, left: -20, bottom: 0 }}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                            <XAxis
                                dataKey="name"
                                stroke="#64748b"
                                tick={{ fill: '#64748b', fontSize: 12 }}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(val) => val.charAt(0).toUpperCase() + val.slice(1)}
                            />
                            <YAxis
                                stroke="#64748b"
                                tick={{ fill: '#64748b', fontSize: 12 }}
                                tickLine={false}
                                axisLine={false}
                                tickFormatter={(val) => `${(val * 100).toFixed(0)}%`}
                            />
                            <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f1f5f9' }} />
                            <Bar dataKey="value" radius={[6, 6, 0, 0]} label={{ position: 'top', fill: '#475569', formatter: (val) => `${(val * 100).toFixed(0)}%` }}>
                                {chartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[entry.name.toLowerCase()] || '#8884d8'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </motion.div>

            {/* Hybrid Logic Visualization (If available) */}
            {comparisonDetails && comparisonDetails.translated && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="glass-panel p-6 flex flex-col items-center col-span-1 md:col-span-2 mt-6 bg-blue-50/50 border-blue-200"
                >
                    <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-xl font-bold text-slate-700">🤖 AI Decision Path</h3>
                    </div>
                    <p className="text-slate-500 text-sm mb-6">How the model analyzed this text</p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-2xl mx-auto">
                        {/* Wrapper for side-by-side comparison */}
                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-slate-300"></div>
                            <h4 className="font-bold text-slate-700 mb-2">Raw Text Analysis</h4>
                            <div className="flex justify-between items-end mb-2">
                                <span className="text-2xl font-bold text-slate-800">{(comparisonDetails.raw.score * 100).toFixed(1)}%</span>
                                <span className={`text-sm font-bold uppercase px-2 py-1 rounded bg-slate-100/10 ${comparisonDetails.raw.label === 'positive' ? 'text-green-600' : comparisonDetails.raw.label === 'negative' ? 'text-red-600' : 'text-yellow-600'}`}>
                                    {comparisonDetails.raw.label}
                                </span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-2">
                                <div className="bg-slate-400 h-2 rounded-full" style={{ width: `${comparisonDetails.raw.score * 100}%` }}></div>
                            </div>
                        </div>

                        <div className={`bg-white p-4 rounded-xl border-2 shadow-sm relative overflow-hidden ${comparisonDetails.translated.score > comparisonDetails.raw.score ? 'border-blue-400 ring-4 ring-blue-50' : 'border-slate-200'}`}>
                            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                            <div className="flex justify-between items-start mb-2">
                                <h4 className="font-bold text-slate-700">Translated Analysis</h4>
                                {comparisonDetails.translated.score > comparisonDetails.raw.score && (
                                    <span className="bg-blue-600 text-white text-[10px] uppercase font-bold px-2 py-0.5 rounded-full">Selected</span>
                                )}
                            </div>

                            <div className="flex justify-between items-end mb-2">
                                <span className="text-2xl font-bold text-blue-600">{(comparisonDetails.translated.score * 100).toFixed(1)}%</span>
                                <span className={`text-sm font-bold uppercase px-2 py-1 rounded bg-slate-100/10 ${comparisonDetails.translated.label === 'positive' ? 'text-green-600' : comparisonDetails.translated.label === 'negative' ? 'text-red-600' : 'text-yellow-600'}`}>
                                    {comparisonDetails.translated.label}
                                </span>
                            </div>
                            <div className="w-full bg-slate-100 rounded-full h-2">
                                <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${comparisonDetails.translated.score * 100}%` }}></div>
                            </div>
                            <p className="text-xs text-slate-400 mt-3 italic truncate">"{comparisonDetails.translated.text}"</p>
                        </div>
                    </div>
                </motion.div>
            )}
        </div>
    );
};

export default AnalysisCharts;
