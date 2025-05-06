import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useActiveProfile, useCreatePost } from '@lens-protocol/react-web';
import { useAccount } from 'wagmi';
import { motion } from 'framer-motion';
import { X, Plus, ImageIcon, FileText, BarChart2, Send } from 'lucide-react';
import PostComposer from '../components/thread/PostComposer';
import { useSupabase, ThreadDraft, BonsaiPost } from '../providers/SupabaseProvider';
import { v4 as uuidv4 } from 'uuid';
import { uploadBonsaiContent } from '../utils/bonsaiHelpers';

// Bonsai template options
const templateOptions = [
  { id: 'text-image', name: 'Text & Image', icon: <ImageIcon className="w-5 h-5" /> },
  { id: 'article', name: 'Article', icon: <FileText className="w-5 h-5" /> },
  { id: 'poll', name: 'Poll', icon: <BarChart2 className="w-5 h-5" /> },
];

const CreateThread: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const draftId = searchParams.get('draft');
  
  const { isConnected } = useAccount();
  const { data: activeProfile } = useActiveProfile();
  const { userDrafts, saveDraft } = useSupabase();
  
  // Thread state
  const [threadTitle, setThreadTitle] = useState('');
  const [posts, setPosts] = useState<BonsaiPost[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);
  const [currentDraftId, setCurrentDraftId] = useState('');
  
  // Check if user can create thread
  const canCreateThread = isConnected && activeProfile;

  // Only create the post hook if we have an active profile
  const createPostHook = canCreateThread ? useCreatePost() : null;
  
  // Load draft if provided
  useEffect(() => {
    if (draftId) {
      const draft = userDrafts.find(d => d.id === draftId);
      if (draft) {
        setThreadTitle(draft.title);
        setPosts(draft.posts);
        setCurrentDraftId(draft.id);
      }
    } else {
      // New draft
      setCurrentDraftId(uuidv4());
    }
  }, [draftId, userDrafts]);

  // Save draft on change
  useEffect(() => {
    const autosaveDraft = async () => {
      if (currentDraftId && (threadTitle.trim() || posts.length > 0)) {
        const draft: ThreadDraft = {
          id: currentDraftId,
          title: threadTitle,
          posts: posts,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        await saveDraft(draft);
      }
    };
    
    const timeoutId = setTimeout(autosaveDraft, 3000);
    return () => clearTimeout(timeoutId);
  }, [threadTitle, posts, currentDraftId, saveDraft]);

  // Add new post with selected template
  const addNewPost = (templateId: string) => {
    const newPost: BonsaiPost = {
      id: uuidv4(),
      templateId,
      content: { text: '', media: [] },
    };
    
    setPosts(prevPosts => [...prevPosts, newPost]);
    setShowTemplateSelector(false);
  };

  // Update post content
  const updatePost = (postId: string, content: Record<string, any>) => {
    setPosts(prevPosts => 
      prevPosts.map(post => 
        post.id === postId ? { ...post, content } : post
      )
    );
  };

  // Remove post
  const removePost = (postId: string) => {
    setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
  };

  // Handle thread submission
  const handleSubmitThread = async () => {
    if (!canCreateThread || !createPostHook) {
      alert('Please connect your wallet and sign in with Lens');
      return;
    }
    
    if (posts.length === 0) {
      alert('Please add at least one post to your thread');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // 1. Upload posts to Bonsai
      const bonsaiUris = await Promise.all(
        posts.map(post => uploadBonsaiContent(post))
      );
      
      // 2. Create main thread post on Lens
      const mainPostContent = {
        content: threadTitle || posts[0].content.text || 'New Thread',
        media: [{ 
          item: bonsaiUris[0], 
          type: 'BONSAI'
        }],
        attributes: [
          {
            key: 'threadiverse',
            value: 'thread'
          },
          {
            key: 'threadCount',
            value: posts.length.toString()
          }
        ]
      };
      
      // 3. Create the main post
      const result = await createPostHook.execute({
        content: mainPostContent,
      });
      
      // 4. Handle success
      if (result) {
        navigate(`/thread/${result.id}`);
      }
    } catch (error) {
      console.error('Error creating thread:', error);
      alert('Failed to create thread. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold mb-3 text-gray-900 dark:text-white">Create Thread</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Craft your thread with rich media using Bonsai Smart Media templates.
        </p>
      </motion.div>

      {!canCreateThread ? (
        <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 p-4 rounded-lg mb-8">
          <p className="text-indigo-700 dark:text-indigo-300">
            Connect your wallet and sign in with Lens to create a thread.
          </p>
        </div>
      ) : (
        <>
          {/* Thread Title */}
          <div className="mb-6">
            <label htmlFor="threadTitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Thread Title (optional)
            </label>
            <input
              type="text"
              id="threadTitle"
              value={threadTitle}
              onChange={(e) => setThreadTitle(e.target.value)}
              placeholder="What's this thread about?"
              className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          {/* Thread Posts */}
          <div className="space-y-4 mb-8">
            {posts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="relative"
              >
                <div className="absolute -left-8 top-4 flex flex-col items-center">
                  <div className="w-6 h-6 rounded-full bg-indigo-600 text-white flex items-center justify-center text-xs font-medium">
                    {index + 1}
                  </div>
                  {index < posts.length - 1 && (
                    <div className="w-0.5 h-full bg-indigo-200 dark:bg-indigo-800 mt-2"></div>
                  )}
                </div>

                <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4 relative">
                  <button 
                    onClick={() => removePost(post.id)}
                    className="absolute top-3 right-3 p-1 text-gray-400 hover:text-red-500 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  
                  <div className="mb-2">
                    <span className="text-xs font-medium px-2 py-1 bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300 rounded-full">
                      {templateOptions.find(t => t.id === post.templateId)?.name || 'Custom'}
                    </span>
                  </div>
                  
                  <PostComposer 
                    post={post} 
                    onChange={(content) => updatePost(post.id, content)} 
                  />
                </div>
              </motion.div>
            ))}

            {/* Add post button */}
            {showTemplateSelector ? (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-4"
              >
                <h3 className="font-medium text-gray-900 dark:text-white mb-3">Select a template</h3>
                <div className="grid grid-cols-3 gap-3">
                  {templateOptions.map((template) => (
                    <button
                      key={template.id}
                      onClick={() => addNewPost(template.id)}
                      className="flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 transition-colors"
                    >
                      <div className="text-indigo-600 dark:text-indigo-400 mb-2">
                        {template.icon}
                      </div>
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {template.name}
                      </span>
                    </button>
                  ))}
                </div>
                <button 
                  onClick={() => setShowTemplateSelector(false)}
                  className="mt-3 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  Cancel
                </button>
              </motion.div>
            ) : (
              <button
                onClick={() => setShowTemplateSelector(true)}
                className="w-full py-3 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-xl flex items-center justify-center text-gray-500 hover:text-indigo-600 hover:border-indigo-300 dark:hover:text-indigo-400 dark:hover:border-indigo-800 transition-colors"
              >
                <Plus className="w-5 h-5 mr-2" />
                Add Post
              </button>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-between items-center">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {posts.length} post{posts.length !== 1 ? 's' : ''} in thread
            </div>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSubmitThread}
              disabled={isSubmitting || posts.length === 0}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white rounded-lg font-medium flex items-center transition-colors"
            >
              {isSubmitting ? (
                <span className="flex items-center">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Publishing...
                </span>
              ) : (
                <span className="flex items-center">
                  <Send className="w-4 h-4 mr-2" />
                  Publish Thread
                </span>
              )}
            </motion.button>
          </div>
        </>
      )}
    </div>
  );
};

export default CreateThread;