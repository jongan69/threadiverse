import React, { createContext, useContext, useState, useEffect } from 'react';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Create Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Create context
interface SupabaseContextProps {
  supabase: SupabaseClient;
  userDrafts: ThreadDraft[];
  saveDraft: (draft: ThreadDraft) => Promise<void>;
  deleteDraft: (draftId: string) => Promise<void>;
}

export interface ThreadDraft {
  id: string;
  title: string;
  posts: BonsaiPost[];
  createdAt: string;
  updatedAt: string;
}

export interface BonsaiPost {
  id: string;
  templateId: string;
  content: Record<string, any>;
}

const SupabaseContext = createContext<SupabaseContextProps | undefined>(undefined);

export function useSupabase() {
  const context = useContext(SupabaseContext);
  if (context === undefined) {
    throw new Error('useSupabase must be used within a SupabaseProvider');
  }
  return context;
}

interface SupabaseProviderProps {
  children: React.ReactNode;
}

export function SupabaseProvider({ children }: SupabaseProviderProps) {
  const [userDrafts, setUserDrafts] = useState<ThreadDraft[]>([]);
  const [userAddress, setUserAddress] = useState<string | null>(null);

  // Listen for wallet changes (simplified example - in real app would use wagmi hooks)
  useEffect(() => {
    const handleAccountChange = (address: string | null) => {
      setUserAddress(address);
    };
    
    // This would be replaced with proper wagmi subscription in a real implementation
    const mockAddress = localStorage.getItem('connectedWallet');
    if (mockAddress) {
      handleAccountChange(mockAddress);
    }
    
    return () => {
      // Cleanup
    };
  }, []);

  // Fetch user drafts when wallet changes
  useEffect(() => {
    if (!userAddress) {
      setUserDrafts([]);
      return;
    }
    
    const fetchDrafts = async () => {
      try {
        const { data, error } = await supabase
          .from('threadDrafts')
          .select('*')
          .eq('walletAddress', userAddress);
          
        if (error) throw error;
        setUserDrafts(data as ThreadDraft[] || []);
      } catch (error) {
        console.error('Error fetching drafts:', error);
      }
    };
    
    fetchDrafts();
  }, [userAddress]);

  // Save a draft
  const saveDraft = async (draft: ThreadDraft) => {
    if (!userAddress) return;
    
    try {
      const { error } = await supabase
        .from('threadDrafts')
        .upsert({
          id: draft.id,
          walletAddress: userAddress,
          title: draft.title,
          posts: draft.posts,
          updatedAt: new Date().toISOString(),
          createdAt: draft.createdAt || new Date().toISOString(),
        });
        
      if (error) throw error;
      
      // Update local state
      setUserDrafts(prev => 
        prev.find(d => d.id === draft.id)
          ? prev.map(d => d.id === draft.id ? draft : d)
          : [...prev, draft]
      );
    } catch (error) {
      console.error('Error saving draft:', error);
    }
  };

  // Delete a draft
  const deleteDraft = async (draftId: string) => {
    if (!userAddress) return;
    
    try {
      const { error } = await supabase
        .from('threadDrafts')
        .delete()
        .eq('id', draftId)
        .eq('walletAddress', userAddress);
        
      if (error) throw error;
      
      // Update local state
      setUserDrafts(prev => prev.filter(d => d.id !== draftId));
    } catch (error) {
      console.error('Error deleting draft:', error);
    }
  };

  const value = {
    supabase,
    userDrafts,
    saveDraft,
    deleteDraft
  };

  return (
    <SupabaseContext.Provider value={value}>
      {children}
    </SupabaseContext.Provider>
  );
}