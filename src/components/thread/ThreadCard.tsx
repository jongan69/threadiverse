import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Heart, MessageCircle, Repeat, Bookmark, Share2 } from 'lucide-react';
import { Publication } from '@lens-protocol/react-web';
import { parseContentMedia } from '../../utils/bonsaiHelpers';

interface ThreadCardProps {
  publication: Publication;
  isHighlighted?: boolean;
}

const ThreadCard: React.FC<ThreadCardProps> = ({ publication, isHighlighted = false }) => {
  // Parse the content media from publication metadata
  const { content, mediaItems, template } = parseContentMedia(publication);
  
  // Determine the card layout based on the media content
  const hasBanner = mediaItems.some(media => media.type === 'image');
  const hasVideo = mediaItems.some(media => media.type === 'video');
  
  return (
    <motion.div 
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      className={`rounded-xl overflow-hidden border ${
        isHighlighted 
          ? 'border-indigo-300 dark:border-indigo-700 bg-indigo-50 dark:bg-indigo-900/20' 
          : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
      } shadow-sm transition-all`}
    >
      <Link to={`/thread/${publication.id}`} className="block">
        {/* Media Banner (if available) */}
        {hasBanner && (
          <div className="aspect-video w-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
            <img 
              src={mediaItems.find(media => media.type === 'image')?.url || ''}
              alt={content.substring(0, 50)}
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        {/* Video (if available) */}
        {hasVideo && (
          <div className="aspect-video w-full bg-gray-100 dark:bg-gray-700 overflow-hidden">
            <video 
              src={mediaItems.find(media => media.type === 'video')?.url || ''}
              controls
              className="w-full h-full object-cover"
            />
          </div>
        )}
        
        {/* Content */}
        <div className="p-4">
          {/* Author info */}
          <div className="flex items-center mb-3">
            <img 
              src={publication.profile.picture?.original?.url || `https://avatar.vercel.sh/${publication.profile.handle}`}
              alt={publication.profile.handle || 'Profile'}
              className="w-8 h-8 rounded-full object-cover mr-2"
            />
            <div>
              <p className="font-medium text-gray-900 dark:text-white">
                {publication.profile.name || publication.profile.handle}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                @{publication.profile.handle} · {new Date(publication.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          
          {/* Thread content */}
          <div className="mb-3">
            <p className="text-gray-800 dark:text-gray-200">
              {content.length > 280 ? `${content.substring(0, 280)}...` : content}
            </p>
          </div>
          
          {/* Template info (if applicable) */}
          {template && (
            <div className="text-xs bg-gray-50 dark:bg-gray-700/50 rounded py-1 px-2 inline-block mb-3">
              <span className="text-gray-600 dark:text-gray-300">
                {template.name || 'Bonsai Template'}
              </span>
            </div>
          )}
        </div>
      </Link>
      
      {/* Actions */}
      <div className="px-4 py-3 border-t border-gray-100 dark:border-gray-700 flex justify-between text-gray-500 dark:text-gray-400">
        <button className="flex items-center hover:text-red-500 transition-colors">
          <Heart className="w-4 h-4 mr-1" />
          <span className="text-xs">{publication.stats.reactions || 0}</span>
        </button>
        <button className="flex items-center hover:text-indigo-500 transition-colors">
          <MessageCircle className="w-4 h-4 mr-1" />
          <span className="text-xs">{publication.stats.comments || 0}</span>
        </button>
        <button className="flex items-center hover:text-green-500 transition-colors">
          <Repeat className="w-4 h-4 mr-1" />
          <span className="text-xs">{publication.stats.mirrors || 0}</span>
        </button>
        <button className="flex items-center hover:text-amber-500 transition-colors">
          <Bookmark className="w-4 h-4 mr-1" />
          <span className="text-xs">{publication.stats.collects || 0}</span>
        </button>
        <button className="flex items-center hover:text-blue-500 transition-colors">
          <Share2 className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  );
};

export default ThreadCard;