import React, { useState, useEffect } from 'react';
import { useExplorePublications, PublicationSortCriteria } from '@lens-protocol/react-web';
import ThreadCard from '../components/thread/ThreadCard';
import { Sparkles, TrendingUp, Clock, PlusCircle } from 'lucide-react';
import { motion } from 'framer-motion';

type FeedType = 'trending' | 'latest' | 'curated';

const Home: React.FC = () => {
  const [activeTab, setActiveTab] = useState<FeedType>('trending');
  
  // Get publications based on active tab
  const { data: publications, loading, error } = useExplorePublications({
    orderBy: activeTab === 'trending' ? PublicationSortCriteria.MOST_COLLECTED : PublicationSortCriteria.LATEST,
    limit: 25,
  });

  // Filter for threads that use our app's metadata format (would be more robust in production)
  const threads = publications?.filter(pub => 
    pub.metadata?.content?.includes('threadiverse') || 
    pub.metadata?.content?.includes('bonsai')
  );

  return (
    <div className="max-w-3xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold mb-3 text-gray-900 dark:text-white">Discover Threads</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Explore and engage with the latest threads from creators around the web3 world.
        </p>
      </motion.div>

      {/* Feed Tabs */}
      <div className="flex border-b border-gray-200 dark:border-gray-700 mb-6">
        <button
          onClick={() => setActiveTab('trending')}
          className={`flex items-center px-4 py-3 border-b-2 font-medium text-sm ${
            activeTab === 'trending'
              ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
        >
          <TrendingUp className="w-4 h-4 mr-2" />
          Trending
        </button>
        <button
          onClick={() => setActiveTab('latest')}
          className={`flex items-center px-4 py-3 border-b-2 font-medium text-sm ${
            activeTab === 'latest'
              ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
        >
          <Clock className="w-4 h-4 mr-2" />
          Latest
        </button>
        <button
          onClick={() => setActiveTab('curated')}
          className={`flex items-center px-4 py-3 border-b-2 font-medium text-sm ${
            activeTab === 'curated'
              ? 'border-indigo-600 text-indigo-600 dark:border-indigo-400 dark:text-indigo-400'
              : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
          }`}
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Curated
        </button>
      </div>

      {/* Thread List */}
      <div className="space-y-6">
        {loading ? (
          <div className="text-center py-8">
            <div className="w-12 h-12 border-t-2 border-indigo-600 border-solid rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading threads...</p>
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <p className="text-red-500">Error loading threads. Please try again.</p>
          </div>
        ) : threads?.length ? (
          threads.map((thread, index) => (
            <motion.div
              key={thread.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <ThreadCard 
                publication={thread} 
                isHighlighted={activeTab === 'curated' && index < 3} 
              />
            </motion.div>
          ))
        ) : (
          <div className="text-center py-16 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <Sparkles className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No threads found</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-4">Be the first to create a thread!</p>
            <a 
              href="/create" 
              className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
            >
              <PlusCircle className="w-5 h-5 mr-2" />
              Create Thread
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;