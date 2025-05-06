import React, { useState } from 'react';
import { ImageIcon, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { BonsaiPost } from '../../providers/SupabaseProvider';

interface PostComposerProps {
  post: BonsaiPost;
  onChange: (content: Record<string, any>) => void;
}

const PostComposer: React.FC<PostComposerProps> = ({ post, onChange }) => {
  const [text, setText] = useState(post.content.text || '');
  const [mediaItems, setMediaItems] = useState<Array<{ type: string; url: string }>>(
    post.content.media || []
  );
  const [mediaUrl, setMediaUrl] = useState('');
  const [showMediaInput, setShowMediaInput] = useState(false);

  // Handle text change
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    updateContent(e.target.value, mediaItems);
  };

  // Add media item
  const addMediaItem = () => {
    if (!mediaUrl.trim()) return;
    
    const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(mediaUrl);
    const isVideo = /\.(mp4|webm|ogg)$/i.test(mediaUrl);
    
    if (!isImage && !isVideo) {
      alert('Please enter a valid image or video URL');
      return;
    }
    
    const newMediaItem = {
      type: isImage ? 'image' : 'video',
      url: mediaUrl
    };
    
    const updatedMedia = [...mediaItems, newMediaItem];
    setMediaItems(updatedMedia);
    setMediaUrl('');
    setShowMediaInput(false);
    updateContent(text, updatedMedia);
  };

  // Remove media item
  const removeMediaItem = (index: number) => {
    const updatedMedia = mediaItems.filter((_, i) => i !== index);
    setMediaItems(updatedMedia);
    updateContent(text, updatedMedia);
  };

  // Update content
  const updateContent = (newText: string, newMedia: Array<{ type: string; url: string }>) => {
    onChange({
      text: newText,
      media: newMedia
    });
  };

  // Custom composer for different templates
  const renderTemplateFields = () => {
    switch (post.templateId) {
      case 'text-image':
        return (
          <>
            <textarea
              value={text}
              onChange={handleTextChange}
              placeholder="What's on your mind?"
              className="w-full p-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg resize-none min-h-[100px] focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            
            {/* Media Items Preview */}
            {mediaItems.length > 0 && (
              <div className="mt-3 space-y-3">
                {mediaItems.map((media, index) => (
                  <div key={index} className="relative border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                    {media.type === 'image' ? (
                      <img src={media.url} alt="" className="w-full h-auto max-h-[300px] object-cover" />
                    ) : (
                      <video src={media.url} controls className="w-full h-auto max-h-[300px]" />
                    )}
                    <button
                      onClick={() => removeMediaItem(index)}
                      className="absolute top-2 right-2 bg-black/60 text-white p-1 rounded-full hover:bg-black/80 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            
            {/* Media Uploader */}
            {showMediaInput ? (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-3"
              >
                <div className="flex">
                  <input
                    type="text"
                    value={mediaUrl}
                    onChange={(e) => setMediaUrl(e.target.value)}
                    placeholder="Enter image or video URL"
                    className="flex-1 p-2 border border-gray-300 dark:border-gray-700 rounded-l-lg"
                  />
                  <button
                    onClick={addMediaItem}
                    className="px-3 py-2 bg-indigo-600 text-white rounded-r-lg hover:bg-indigo-700 transition-colors"
                  >
                    Add
                  </button>
                </div>
                <button
                  onClick={() => setShowMediaInput(false)}
                  className="mt-2 text-sm text-gray-500"
                >
                  Cancel
                </button>
              </motion.div>
            ) : (
              <button
                onClick={() => setShowMediaInput(true)}
                className="mt-3 flex items-center text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
              >
                <ImageIcon className="w-4 h-4 mr-1" />
                Add media
              </button>
            )}
          </>
        );
        
      case 'article':
        return (
          <>
            <input
              type="text"
              value={post.content.title || ''}
              onChange={(e) => onChange({ ...post.content, title: e.target.value })}
              placeholder="Article title"
              className="w-full p-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg mb-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            <textarea
              value={text}
              onChange={handleTextChange}
              placeholder="Write your article..."
              className="w-full p-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg resize-none min-h-[200px] focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </>
        );
        
      case 'poll':
        const options = post.content.options || ['', ''];
        
        return (
          <>
            <input
              type="text"
              value={post.content.question || ''}
              onChange={(e) => onChange({ ...post.content, question: e.target.value })}
              placeholder="Ask a question..."
              className="w-full p-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg mb-3 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
            
            <div className="space-y-2 mb-3">
              {options.map((option, index) => (
                <div key={index} className="flex">
                  <input
                    type="text"
                    value={option}
                    onChange={(e) => {
                      const newOptions = [...options];
                      newOptions[index] = e.target.value;
                      onChange({ ...post.content, options: newOptions });
                    }}
                    placeholder={`Option ${index + 1}`}
                    className="flex-1 p-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                  {options.length > 2 && (
                    <button
                      onClick={() => {
                        const newOptions = options.filter((_, i) => i !== index);
                        onChange({ ...post.content, options: newOptions });
                      }}
                      className="ml-2 p-2 text-red-500 hover:text-red-700 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
            
            {options.length < 5 && (
              <button
                onClick={() => onChange({ 
                  ...post.content, 
                  options: [...options, ''] 
                })}
                className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300"
              >
                + Add option
              </button>
            )}
          </>
        );
        
      default:
        return (
          <textarea
            value={text}
            onChange={handleTextChange}
            placeholder="What's on your mind?"
            className="w-full p-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg resize-none min-h-[100px] focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
        );
    }
  };

  return (
    <div className="w-full">
      {renderTemplateFields()}
    </div>
  );
};

export default PostComposer;