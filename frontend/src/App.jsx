import React, { useState } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Twitter, Send, Activity, Search, AlertCircle, Info, ThumbsUp, ThumbsDown, Heart, Loader2, Sparkles } from 'lucide-react';
import SentimentCard from './components/SentimentCard';
import AnalysisCharts from './components/AnalysisCharts';
import TweetCard from './components/TweetCard';
import ThemeToggle from './components/ThemeToggle';
import GFGVisuals from './components/GFGVisuals';
import FloatingIcons from './components/FloatingIcons';

import ThreeBackground from './components/ThreeBackground';

function App() {
  const [mode, setMode] = useState('manual');

  const [text, setText] = useState('');
  const [manualLoading, setManualLoading] = useState(false);
  const [manualResult, setManualResult] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [fetchedTweets, setFetchedTweets] = useState([]);
  const [fetching, setFetching] = useState(false);
  const [liveResults, setLiveResults] = useState({});
  const [analyzingIndex, setAnalyzingIndex] = useState(null);

  const [analyzingAll, setAnalyzingAll] = useState(false);
  const [aggregateData, setAggregateData] = useState(null);
  const [wordCloudImage, setWordCloudImage] = useState(null);
  const [error, setError] = useState('');
  const [developerTeam] = useState('Team Ignite'); // Replace with your team name


  const analyzeManual = async () => {
    if (!text.trim()) return;
    setManualLoading(true);
    setError('');
    setManualResult(null);

    try {
      const response = await axios.post('https://great-queens-follow.loca.lt/analyze', { text }, { timeout: 15000 }); // 15s timeout
      setManualResult(response.data);
    } catch (err) {
      console.error(err);
      const errorMessage = err.code === 'ECONNABORTED' ? 'Analysis timed out. Server is busy or downloading models.' :
        err.response?.data?.detail || err.message || 'Connection Error: Is the backend server running?';
      setError(errorMessage);
    } finally {
      setManualLoading(false);
    }
  };

  const searchTweets = async () => {
    if (!searchTerm.trim()) return;
    setFetching(true);
    setFetchedTweets([]);
    setError('');
    setLiveResults({});
    setAggregateData(null);

    try {
      const response = await axios.post('https://great-queens-follow.loca.lt/fetch_tweets', {
        term: searchTerm,
        limit: 5
      });

      if (response.data.tweets && response.data.tweets.length > 0) {
        setFetchedTweets(response.data.tweets);
      } else {
        setError(response.data.error ? `Error: ${response.data.error} ` : 'No tweets found.');
      }
    } catch (err) {
      console.error(err);
      setError('Failed to fetch tweets.');
    } finally {
      setFetching(false);
    }
  };

  const analyzeSingleTweet = async (tweetText, index) => {
    setAnalyzingIndex(index);
    try {
      const response = await axios.post('https://great-queens-follow.loca.lt/analyze', { text: tweetText });
      const result = response.data;
      setLiveResults(prev => ({ ...prev, [index]: result }));
      return result;
    } catch (err) {
      console.error(err);
      return null;
    } finally {
      setAnalyzingIndex(null);
    }
  };

  const analyzeAllTweets = async () => {
    if (fetchedTweets.length === 0) return;
    setAnalyzingAll(true);

    const promises = fetchedTweets.map((tweet, idx) => {
      if (liveResults[idx]) return Promise.resolve(liveResults[idx]);
      return axios.post('https://great-queens-follow.loca.lt/analyze', { text: tweet.text })
        .then(res => {
          const resData = res.data;
          setLiveResults(prev => ({ ...prev, [idx]: resData }));
          return resData;
        })
        .catch(() => null);
    });

    const results = await Promise.all(promises);

    let pos = 0, neg = 0, neu = 0;
    results.forEach(r => {
      if (r) {
        if (r.label === 'positive') pos++;
        else if (r.label === 'negative') neg++;
        else neu++;
      }
    });

    setAggregateData({
      positive: pos,
      negative: neg,
      neutral: neu,
      total: results.length
    });

    setAggregateData({
      positive: pos,
      negative: neg,
      neutral: neu,
      total: results.length
    });

    // Generate Word Cloud
    try {
      const fullText = fetchedTweets.map(t => t.text).join(' ');
      const wcRes = await axios.post('https://great-queens-follow.loca.lt/generate_wordcloud', { text: fullText });
      if (wcRes.data.image) {
        setWordCloudImage(wcRes.data.image);
      }
    } catch (e) {
      console.error("Word cloud generation failed", e);
    }

    setAnalyzingAll(false);
  };


  return (
    <div className="min-h-screen w-full flex flex-col items-center py-12 px-4 relative">
      <ThreeBackground />
      <FloatingIcons />
      <ThemeToggle />

      {/* Main Content Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1 }}
        className="z-10 w-full max-w-5xl flex flex-col items-center card-3d p-8 md:p-12 mb-10 relative overflow-hidden"
      >
        {/* Floating 3D Logos */}
        <motion.div
          animate={{ y: [0, -15, 0], rotate: [0, 5, 0] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-6 -right-6 w-24 h-24 opacity-40 z-0 pointer-events-none"
        >
          <img src="https://img.icons8.com/color/144/twitter--v1.png" alt="Twitter 3D" className="drop-shadow-2xl" />
        </motion.div>
        <motion.div
          animate={{ y: [0, 15, 0], rotate: [0, -5, 0] }}
          transition={{ duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute -bottom-10 -left-6 w-32 h-32 opacity-30 z-0 pointer-events-none"
        >
          <img src="https://img.icons8.com/color/144/twitter--v1.png" alt="Twitter 3D" className="drop-shadow-2xl filter blur-[1px]" />
        </motion.div>

        <header className="text-center mb-10 w-full flex flex-col items-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center justify-center mb-6"
          >
            {/* 3D Icon Container */}
            <div className="icon-3d-container w-28 h-28 animate-float-smooth flex items-center justify-center bg-white/20 backdrop-blur-md rounded-[2.5rem] shadow-2xl border border-white/30">
              <Twitter className="w-14 h-14 text-blue-400 fill-blue-400 drop-shadow-[0_5px_15px_rgba(59,130,246,0.5)]" />
            </div>

            <div className="ml-8 text-left">
              <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-none drop-shadow-xl" style={{ fontFamily: '"Outfit", sans-serif' }}>
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 filter drop-shadow-sm">Tweet</span>
                <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500">Pulse</span>
              </h1>
              <div className="flex items-center gap-3 mt-2">
                <div className="h-[2px] w-12 bg-gradient-to-r from-blue-400 to-transparent rounded-full" />
                <p className="text-slate-500 font-bold text-lg tracking-[0.3em] uppercase">
                  <span className="text-indigo-600">{developerTeam}</span>
                </p>
              </div>
            </div>
          </motion.div>
        </header>


        {/* 3D Toggle Switch */}
        <div className="bg-slate-100/80 p-2 rounded-2xl flex space-x-2 mb-12 shadow-[inset_0_2px_4px_rgba(0,0,0,0.05)] border border-slate-200/50 backdrop-blur-sm">
          <button
            onClick={() => setMode('manual')}
            className={`px-8 py-3 rounded-xl font-bold text-lg transition-all duration-300 ${mode === 'manual' ? 'bg-white text-indigo-600 shadow-md transform scale-105' : 'text-slate-500 hover:text-slate-700 hover:bg-white/40'}`}
          >
            Manual Input
          </button>
          <button
            onClick={() => setMode('live')}
            className={`px-8 py-3 rounded-xl font-bold text-lg transition-all duration-300 ${mode === 'live' ? 'bg-white text-indigo-600 shadow-md transform scale-105' : 'text-slate-500 hover:text-slate-700 hover:bg-white/40'}`}
          >
            Live Search
          </button>
        </div>

        <AnimatePresence mode="wait">
          {mode === 'manual' ? (
            <motion.div
              key="manual"
              initial={{ opacity: 0, scale: 0.95, rotateX: 10 }}
              animate={{ opacity: 1, scale: 1, rotateX: 0 }}
              exit={{ opacity: 0, scale: 0.95, rotateX: -10 }}
              transition={{ duration: 0.4 }}
              className="w-full max-w-3xl perspective-1000"
            >
              <section className="bg-white/40 p-1.5 rounded-[2rem] shadow-sm border border-white/60 backdrop-blur-md">
                <div className="relative">
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        analyzeManual();
                      }
                    }}
                    placeholder="Type or paste text to analyze..."
                    className="w-full h-56 resize-none text-xl leading-relaxed p-8 input-3d outline-none text-slate-700 placeholder:text-slate-400/70"
                    spellCheck="false"
                  />

                  <div className="absolute bottom-6 right-6">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={analyzeManual}
                      disabled={manualLoading || !text.trim()}
                      className={`btn-3d px-8 py-3 rounded-xl font-bold flex items-center space-x-3 text-lg ${manualLoading ? 'opacity-80 cursor-wait' : ''}`}
                    >
                      {manualLoading ? (
                        <>
                          <Loader2 className="animate-spin" size={22} />
                          <span>Processing</span>
                        </>
                      ) : (
                        <>
                          <Sparkles size={22} />
                          <span>Analyze</span>
                        </>
                      )}
                    </motion.button>
                  </div>
                </div>
              </section>

              {manualResult && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="mt-12"
                >
                  <SentimentCard result={manualResult} />
                  <div className="mt-8 bg-white/40 rounded-[2rem] p-8 border border-white/50 shadow-sm backdrop-blur-sm">
                    <AnalysisCharts
                      currentDetails={manualResult.details}
                      comparisonDetails={manualResult.comparison_details}
                    />
                  </div>
                </motion.div>
              )}
            </motion.div>
          ) : (
            <motion.div
              key="live"
              initial={{ opacity: 0, scale: 0.95, rotateX: 10 }}
              animate={{ opacity: 1, scale: 1, rotateX: 0 }}
              exit={{ opacity: 0, scale: 0.95, rotateX: -10 }}
              className="w-full max-w-4xl space-y-10"
            >
              <section className="bg-white/40 p-2 rounded-2xl border border-white/60 flex items-center space-x-4 shadow-sm backdrop-blur-sm transition-all focus-within:shadow-md focus-within:bg-white/60">
                <div className="pl-6 text-indigo-400">
                  <Search size={28} />
                </div>
                <input
                  type="text"
                  placeholder="Enter a hashtag or keyword..."
                  className="flex-1 bg-transparent border-none text-2xl p-4 outline-none text-slate-700 placeholder:text-slate-400/70 font-medium"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && searchTweets()}
                />
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={searchTweets}
                  disabled={fetching || !searchTerm.trim()}
                  className="btn-3d px-8 py-4 rounded-xl font-bold text-lg"
                >
                  {fetching ? <Loader2 className="animate-spin" /> : 'Fetch'}
                </motion.button>
              </section>

              {fetchedTweets.length > 0 && fetchedTweets[0].user === "ByteWizard" && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-center space-x-3 text-amber-600 bg-amber-50/90 p-4 rounded-xl border border-amber-200/60 backdrop-blur-sm shadow-sm"
                >
                  <AlertCircle size={22} />
                  <span className="font-semibold text-base">
                    <strong>Demo Mode:</strong> Live data scraping is currently limited. Showing sample data.
                  </span>
                </motion.div>
              )}

              {aggregateData && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  transition={{ duration: 0.5 }}
                  className="bg-white/60 backdrop-blur-md rounded-[2rem] p-8 border border-white/70 shadow-lg"
                >
                  <h2 className="text-2xl font-bold gradient-text mb-8 text-center flex items-center justify-center gap-2">
                    <Activity className="w-6 h-6 text-indigo-500" />
                    Aggregate Report
                  </h2>
                  <div className="grid grid-cols-3 gap-6 text-center mb-10">
                    <motion.div whileHover={{ y: -5 }} className="p-6 bg-emerald-50/80 rounded-2xl border border-emerald-100 shadow-[0_4px_20px_rgba(16,185,129,0.1)]">
                      <p className="text-xs text-emerald-600 font-extrabold uppercase tracking-widest mb-2">Positive</p>
                      <p className="text-4xl font-black text-emerald-500">{aggregateData.positive}</p>
                    </motion.div>
                    <motion.div whileHover={{ y: -5 }} className="p-6 bg-rose-50/80 rounded-2xl border border-rose-100 shadow-[0_4px_20px_rgba(244,63,94,0.1)]">
                      <p className="text-xs text-rose-600 font-extrabold uppercase tracking-widest mb-2">Negative</p>
                      <p className="text-4xl font-black text-rose-500">{aggregateData.negative}</p>
                    </motion.div>
                    <motion.div whileHover={{ y: -5 }} className="p-6 bg-amber-50/80 rounded-2xl border border-amber-100 shadow-[0_4px_20px_rgba(245,158,11,0.1)]">
                      <p className="text-xs text-amber-600 font-extrabold uppercase tracking-widest mb-2">Neutral</p>
                      <p className="text-4xl font-black text-amber-500">{aggregateData.neutral}</p>
                    </motion.div>
                  </div>

                  <AnalysisCharts
                    currentDetails={[
                      { label: 'positive', score: aggregateData.total ? aggregateData.positive / aggregateData.total : 0 },
                      { label: 'negative', score: aggregateData.total ? aggregateData.negative / aggregateData.total : 0 },
                      { label: 'neutral', score: aggregateData.total ? aggregateData.neutral / aggregateData.total : 0 }
                    ]}
                    titlePie="Market Sentiment"
                    titleBar="Distribution"
                  />

                  {/* GFG Style Word Cloud and Histogram */}
                  <GFGVisuals wordCloudImage={wordCloudImage} aggregateData={aggregateData} />
                </motion.div>
              )}

              {fetchedTweets.length > 0 && (
                <div className="space-y-6 w-full">
                  {!aggregateData && (
                    <div className="flex justify-center mb-6">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={analyzeAllTweets} // This now triggers Word Cloud generation too
                        disabled={analyzingAll}
                        className="btn-3d-secondary px-10 py-4 rounded-2xl font-bold flex items-center space-x-3 text-lg"
                      >
                        {analyzingAll ? <Loader2 className="animate-spin w-5 h-5" /> : <Activity className="w-5 h-5" />}
                        <span>Analyze Batch</span>
                      </motion.button>
                    </div>
                  )}

                  {fetchedTweets.map((tweet, idx) => (
                    <motion.div
                      initial={{ opacity: 0, y: 30, rotateX: -5 }}
                      animate={{ opacity: 1, y: 0, rotateX: 0 }}
                      transition={{ delay: idx * 0.1, type: "spring", stiffness: 100 }}
                      key={idx}
                    >
                      <TweetCard
                        tweet={tweet}
                        analysis={liveResults[idx]}
                        onAnalyze={() => analyzeSingleTweet(tweet.text, idx)}
                        isAnalyzing={analyzingIndex === idx}
                      />
                    </motion.div>
                  ))}
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="fixed bottom-8 right-8 z-50 p-6 rounded-2xl bg-red-500 text-white shadow-[0_20px_50px_rgba(220,38,38,0.4)] flex items-center space-x-4 border-2 border-red-400 backdrop-blur-md"
          >
            <div className="bg-white/20 p-2 rounded-full">
              <AlertCircle size={24} />
            </div>
            <span className="font-bold text-lg">{error}</span>
          </motion.div>
        )}

        <footer className="mt-24 pb-12 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-block"
          >
            <div className="px-8 py-4 rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl">
              <div className="flex items-center gap-3">
                <Sparkles className="w-6 h-6 text-yellow-500 animate-pulse" />
                <p className="text-slate-300 font-medium">
                  Developed by <span className="text-white font-bold bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">{developerTeam}</span>
                </p>
                <div className="h-6 w-[1px] bg-white/20 mx-2" />
                <div className="flex gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-ping" />
                  <span className="text-[10px] text-white/50 uppercase tracking-tighter font-black">Live System</span>
                </div>
              </div>
            </div>
          </motion.div>
        </footer>

      </motion.div>
    </div>
  );
}

export default App;
