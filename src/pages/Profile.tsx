import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useProfile, useActiveProfile, useProfileFollowers, useWalletLogin, usePublications } from '@lens-protocol/react-web';
import { useAccount } from 'wagmi';
import { Tabs, Tab, TabsContent, TabsList } from '../components/ui/Tabs';
import ThreadCard from '../components/thread/ThreadCard';
import { motion } from 'framer-motion';
import { Users, Bookmark, Edit3, Settings, User, PlusCircle, FileText, PenTool } from 'lucide-react';
import { useSupabase } from '../providers/SupabaseProvider';

const Profile: React.FC = () => {
  const { handle } = useParams<{ handle?: string }>();
  const { address, isConnected } = useAccount();
  const { execute: login } = useWalletLogin();
  const { data: activeProfile } = useActiveProfile();
  const { data: userDrafts } = useSupabase();
  
  // If no handle provided, use the active profile
  const profileHandle = handle || (activeProfile?.handle || '');
  
  // Fetch profile data
  const { data: profile, loading: profileLoading } = useProfile({ handle: profileHandle });
  
  // Fetch profile's publications (threads)
  const { data: publications, loading: pubsLoading } = usePublications({
    profileId: profile?.id,
    limit: 20,
  });

  // Fetch profile followers
  const { data: followers, loading: followersLoading } = useProfileFollowers({
    profileId: profile?.id,
    limit: 50,
  });

  // Active tab state
  const [activeTab, setActiveTab] = useState('threads');

  // Handle login if not connected
  const handleConnectWallet = async () => {
    if (!isConnected) {
      // This will trigger the ConnectKit modal
      return;
    }
    
    if (!activeProfile) {
      try {
        // Login to Lens with connected wallet
        await login();
      } catch (error) {
        console.error('Error logging in to Lens:', error);
      }
    }
  };

  // Loading state
  if (profileLoading) {
    return (
      <div className="text-center py-16">
        <div className="w-12 h-12 border-t-2 border-indigo-600 border-solid rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-gray-600 dark:text-gray-400">Loading profile...</p>
      </div>
    );
  }

  // Profile not found state
  if (!profile && !profileLoading) {
    return (
      <div className="text-center py-16 max-w-lg mx-auto">
        <div className="bg-gray-50 dark:bg-gray-800 p-8 rounded-xl border border-gray-200 dark:border-gray-700">
          <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Profile not found</h2>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            {isConnected 
              ? "This profile doesn't exist or you don't have access to view it."
              : "Connect your wallet to view your profile or search for a specific handle."}
          </p>
          <button 
            onClick={handleConnectWallet}
            className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium transition-colors"
          >
            {isConnected ? 'Go to your profile' : 'Connect Wallet'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Profile Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-8"
      >
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 h-36 rounded-t-xl"></div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-b-xl shadow-sm relative">
          <div className="absolute -top-12 left-6 border-4 border-white dark:border-gray-800 rounded-full overflow-hidden">
            <img 
              src={profile?.picture?.original?.url || `https://avatar.vercel.sh/${profile?.handle}`}
              alt={profile?.handle || 'Profile'}
              className="w-24 h-24 object-cover bg-gray-100"
            />
          </div>
          
          <div className="pt-14">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {profile?.name || profile?.handle || 'Unnamed Profile'}
                </h1>
                <p className="text-gray-600 dark:text-gray-400 mb-2">@{profile?.handle}</p>
                <p className="text-gray-700 dark:text-gray-300 mb-4 max-w-2xl">
                  {profile?.bio || 'No bio provided'}
                </p>
                <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                  <span className="flex items-center">
                    <Users className="w-4 h-4 mr-1" />
                    {profile?.stats?.followers || 0} followers
                  </span>
                  <span className="flex items-center">
                    <PenTool className="w-4 h-4 mr-1" />
                    {profile?.stats?.posts || 0} posts
                  </span>
                </div>
              </div>
              
              {/* Profile Actions - Show only if viewing own profile */}
              {activeProfile?.id === profile?.id && (
                <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg flex items-center">
                  <Settings className="w-4 h-4 mr-2" />
                  Edit Profile
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Profile Content Tabs */}
      <Tabs defaultValue="threads" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <Tab value="threads" icon={<Edit3 className="w-4 h-4" />}>Threads</Tab>
          <Tab value="collected" icon={<Bookmark className="w-4 h-4" />}>Collected</Tab>
          {activeProfile?.id === profile?.id && (
            <Tab value="drafts" icon={<FileText className="w-4 h-4" />}>Drafts</Tab>
          )}
          <Tab value="following" icon={<Users className="w-4 h-4" />}>Following</Tab>
        </TabsList>
        
        <TabsContent value="threads">
          {pubsLoading ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-t-2 border-indigo-600 border-solid rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-gray-500">Loading threads...</p>
            </div>
          ) : publications?.length ? (
            <div className="space-y-6">
              {publications.map((publication, index) => (
                <motion.div
                  key={publication.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <ThreadCard publication={publication} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <Edit3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No threads yet</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">This profile hasn't published any threads</p>
              {activeProfile?.id === profile?.id && (
                <a 
                  href="/create" 
                  className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                >
                  <PlusCircle className="w-5 h-5 mr-2" />
                  Create Thread
                </a>
              )}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="collected">
          {/* Collected threads implementation */}
          <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
            <Bookmark className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No collected threads</h3>
            <p className="text-gray-600 dark:text-gray-400">
              This profile hasn't collected any threads yet
            </p>
          </div>
        </TabsContent>
        
        <TabsContent value="drafts">
          {activeProfile?.id === profile?.id ? (
            userDrafts?.length ? (
              <div className="space-y-6">
                {userDrafts.map((draft, index) => (
                  <motion.div
                    key={draft.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className="bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700"
                  >
                    <div className="flex justify-between items-center mb-3">
                      <h3 className="font-medium">{draft.title || 'Untitled Draft'}</h3>
                      <span className="text-sm text-gray-500">
                        {new Date(draft.updatedAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                      {draft.posts.length} post{draft.posts.length !== 1 ? 's' : ''}
                    </p>
                    <div className="flex space-x-2">
                      <a 
                        href={`/create?draft=${draft.id}`}
                        className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded transition-colors"
                      >
                        Edit
                      </a>
                      <button className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 text-sm rounded transition-colors">
                        Delete
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No draft threads</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  You haven't saved any drafts yet
                </p>
                <a 
                  href="/create" 
                  className="inline-flex items-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors"
                >
                  <PlusCircle className="w-5 h-5 mr-2" />
                  Create Thread
                </a>
              </div>
            )
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600 dark:text-gray-400">
                You can only view your own drafts
              </p>
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="following">
          {followersLoading ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-t-2 border-indigo-600 border-solid rounded-full animate-spin mx-auto mb-2"></div>
              <p className="text-gray-500">Loading following...</p>
            </div>
          ) : followers?.length ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {followers.map((follower, index) => (
                <motion.a
                  key={follower.id}
                  href={`/profile/${follower.handle}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="flex items-center p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-indigo-300 dark:hover:border-indigo-500 transition-colors"
                >
                  <img 
                    src={follower.picture?.original?.url || `https://avatar.vercel.sh/${follower.handle}`}
                    alt={follower.handle || 'Profile'} 
                    className="w-12 h-12 rounded-full object-cover mr-4"
                  />
                  <div>
                    <h3 className="font-medium text-gray-900 dark:text-white">
                      {follower.name || follower.handle}
                    </h3>
                    <p className="text-gray-600 dark:text-gray-400 text-sm">@{follower.handle}</p>
                  </div>
                </motion.a>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Not following anyone</h3>
              <p className="text-gray-600 dark:text-gray-400">
                This profile isn't following anyone yet
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Profile;