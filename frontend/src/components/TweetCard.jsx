import React from 'react';
import { Heart, MessageCircle, Repeat, Share, BadgeCheck } from 'lucide-react';
import SentimentCard from './SentimentCard';
import AnalysisCharts from './AnalysisCharts';

const TweetCard = ({ tweet, analysis, onAnalyze, isAnalyzing }) => {
    // Generate a consistent placeholder avatar if none provided
    const avatarUrl = tweet.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${tweet.user}`;

    // Format numbers like 3.5k
    const formatNumber = (num) => {
        if (!num) return 0;
        if (num > 1000) return (num / 1000).toFixed(1) + 'k';
        return num;
    };

    return (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors w-full max-w-2xl mx-auto mb-4">
            <div className="flex space-x-3">
                {/* Avatar */}
                <div className="flex-shrink-0">
                    <img
                        src={avatarUrl}
                        alt={tweet.user}
                        className="w-10 h-10 rounded-full bg-slate-200 object-cover"
                        onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${tweet.user}&background=random` }}
                    />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1 truncate">
                            <span className="font-bold text-slate-900 dark:text-white truncate">
                                {tweet.name || tweet.user}
                            </span>
                            {/* Simulate verified for some accounts or randomly */}
                            <BadgeCheck className="w-4 h-4 text-blue-500 fill-blue-500/10" />
                            <span className="text-slate-500 text-sm truncate">@{tweet.user}</span>
                            <span className="text-slate-500 text-sm">·</span>
                            <span className="text-slate-500 text-sm hover:underline cursor-pointer">{tweet.date}</span>
                        </div>
                    </div>

                    <p className="mt-1 text-slate-800 dark:text-slate-200 text-[15px] leading-normal whitespace-pre-wrap">
                        {tweet.text}
                    </p>

                    {/* Action Bar */}
                    <div className="flex justify-between items-center mt-4 max-w-md text-slate-500">
                        <button className="icon-3d-small group hover:text-blue-500 gap-2">
                            <MessageCircle size={18} />
                            <span className="text-xs font-bold">{formatNumber(tweet.stats?.comments || 0)}</span>
                        </button>
                        <button className="icon-3d-small group hover:text-green-500 gap-2">
                            <Repeat size={18} />
                            <span className="text-xs font-bold">{formatNumber(tweet.stats?.retweets || 0)}</span>
                        </button>
                        <button className="icon-3d-small group hover:text-pink-500 gap-2">
                            <Heart size={18} />
                            <span className="text-xs font-bold">{formatNumber(tweet.stats?.likes || 0)}</span>
                        </button>
                        <button className="icon-3d-small group hover:text-blue-500">
                            <Share size={18} />
                        </button>
                    </div>

                    {/* Analysis Section */}
                    <div className="mt-3">
                        {analysis ? (
                            <div className="border-t border-slate-100 dark:border-slate-800 pt-3">
                                <SentimentCard result={analysis} minimal={true} />
                                {/* Collapsible Details could go here, or inline charts */}
                            </div>
                        ) : (
                            <button
                                onClick={onAnalyze}
                                disabled={isAnalyzing}
                                className="mt-2 text-sm text-blue-500 font-medium hover:underline flex items-center"
                            >
                                {isAnalyzing ? 'Analyzing AI Models...' : 'Run Sentiment Analysis'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TweetCard;
