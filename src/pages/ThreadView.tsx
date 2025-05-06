import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { usePublication, useActiveProfile, useCreateMirror, useCreateComment, useCollect } from '@lens-protocol/react-web';
import { motion } from 'framer-motion';
import { Heart, MessageCircle, Repeat, Bookmark, Share2, AlertCircle } from 'lucide-react';
import { parseContentMedia } from '../utils/bonsaiHelpers';

const ThreadView: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data: activeProfile } = useActiveProfile();
  const { data: publication, loading, error } = usePublication({ publicationId: id });
  
  const { execute: createMirror } = useCreateMirror();
  const { execute: createComment } = useCreateComment();
  const { execute: collect } = useCollect();
  
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Parse content media if publication exists
  const contentMedia = publication ? parseContentMedia(publication) : null;
  
  // Handle mirror action
  const handleMirror = async () => {
    if (!activeProfile || !publication) return;
    
    try {
      await createMirror({
        publication,
      });
    } catch (error) {
      console.error('Error mirroring publication:', error);
    }
  };

  // Handle collect action
  const handleCollect = async () => {
    if (!activeProfile || !publication) return;
    
    try {
      await collect({
        publication,
      });
    } catch (error) {
      console.error('Error collecting publication:', error);
    }
  };

  // Handle comment submission
  const handleSubmitComment = async () => {
    if (!activeProfile || !publication || !comment.trim()) return;
    
    setIsSubmitting(true);
    
    try {
      await createComment({
        publication,
        content: comment,
      });
      
      setComment('');
    } catch (error) {
      console.error('Error creating comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="text-center py-16">
        <div className="w-12 h-12 border-t-2 border-indigo-600 border-solid rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-gray-600 dark:text-gray-400">Loading thread...</p>
      </div>
    );
  }

  // Error state
  if (error || !publication) {
    return (
      <div className="text-center py-16 max-w-lg mx-auto">
        <div className="bg-red-50 dark:bg-red-900/20 p-8 rounded-xl border border-red-200 dark:border-red-800">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Thread not found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            This thread may have been deleted or doesn't exist.
          </p>
          <Link
            to="/"
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium inline-block transition-colors"
          >
            Back to home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Thread Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-6"
      >
        <Link to={`/profile/${publication.profile.handle}`} className="flex items-center mb-3">
          <img 
            src={publication.profile.picture?.original?.url || `https://avatar.vercel.sh/${publication.profile.handle}`}
            alt={publication.profile.handle || 'Profile'} 
            className="w-10 h-10 rounded-full object-cover mr-3"
          />
          <div>
            <h2 className="font-bold text-gray-900 dark:text-white text-lg">
              {publication.profile.name || publication.profile.handle}
            </h2>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              @{publication.profile.handle}
            </p>
          </div>
        </Link>
        
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {contentMedia?.content.substring(0, 100) || 'Thread'}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-sm">
          Posted on {new Date(publication.createdAt).toLocaleDateString()} · 
          {publication.stats.reactions || 0} likes · 
          {publication.stats.comments || 0} comments
        </p>
      </motion.div>

      {/* Thread Content */}
      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden mb-6">
        <div className="p-6">
          {/* Media */}
          {contentMedia?.mediaItems.length > 0 && (
            <div className="mb-6">
              {contentMedia.mediaItems.map((media, index) => (
                <div key={index} className="mb-4">
                  {media.type === 'image' ? (
                    <img 
                      src={media.url} 
                      alt="" 
                      className="w-full h-auto rounded-lg"
                    />
                  ) : media.type === 'video' ? (
                    <video 
                      src={media.url} 
                      controls 
                      className="w-full h-auto rounded-lg"
                    />
                  ) : null}
                </div>
              ))}
            </div>
          )}
          
          {/* Text Content */}
          <div className="prose dark:prose-invert max-w-none">
            <p className="text-gray-800 dark:text-gray-200 whitespace-pre-wrap">
              {contentMedia?.content || publication.metadata.content}
            </p>
          </div>
        </div>
        
        {/* Actions */}
        <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700 flex justify-between text-gray-500 dark:text-gray-400">
          <button 
            className="flex items-center hover:text-red-500 transition-colors"
            onClick={() => {}}
          >
            <Heart className="w-5 h-5 mr-1" />
            <span>{publication.stats.reactions || 0}</span>
          </button>
          <button 
            className="flex items-center hover:text-indigo-500 transition-colors"
            onClick={() => {}}
          >
            <MessageCircle className="w-5 h-5 mr-1" />
            <span>{publication.stats.comments || 0}</span>
          </button>
          <button 
            className="flex items-center hover:text-green-500 transition-colors"
            onClick={handleMirror}
          >
            <Repeat className="w-5 h-5 mr-1" />
            <span>{publication.stats.mirrors || 0}</span>
          </button>
          <button 
            className="flex items-center hover:text-amber-500 transition-colors"
            onClick={handleCollect}
          >
            <Bookmark className="w-5 h-5 mr-1" />
            <span>{publication.stats.collects || 0}</span>
          </button>
          <button 
            className="flex items-center hover:text-blue-500 transition-colors"
            onClick={() => {}}
          >
            <Share2 className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Comment Section */}
      <div className="mb-6">
        <h3 className="font-bold text-gray-900 dark:text-white text-lg mb-4">Comments</h3>
        
        {activeProfile ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 mb-6">
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="Add a comment..."
              className="w-full p-3 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg resize-none min-h-[100px] focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 mb-3"
            />
            <div className="flex justify-end">
              <button
                onClick={handleSubmitComment}
                disabled={isSubmitting || !comment.trim()}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-lg transition-colors"
              >
                {isSubmitting ? 'Posting...' : 'Post Comment'}
              </button>
            </div>
          </div>
        ) : (
          <div className="bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4 mb-6 text-center">
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              Connect your wallet to comment on this thread
            </p>
          </div>
        )}
        
        {/* Comments List - In a real app, you would fetch and display comments here */}
        <div className="space-y-4">
          {publication.stats.comments > 0 ? (
            <p className="text-center text-gray-600 dark:text-gray-400">
              Comments would be loaded and displayed here
            </p>
          ) : (
            <div className="text-center py-8 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No comments yet</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Be the first to leave a comment
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ThreadView;