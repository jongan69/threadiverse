import React, { createContext, useContext, useState } from 'react';
import { motion } from 'framer-motion';

// Context
type TabsContextType = {
  value: string;
  onValueChange: (value: string) => void;
};

const TabsContext = createContext<TabsContextType | undefined>(undefined);

const useTabs = () => {
  const context = useContext(TabsContext);
  if (!context) throw new Error('Tabs components must be used within a Tabs provider');
  return context;
};

// Props types
interface TabsProps {
  defaultValue: string;
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
}

interface TabProps {
  value: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}

interface TabsListProps {
  children: React.ReactNode;
  className?: string;
}

interface TabsContentProps {
  value: string;
  children: React.ReactNode;
}

// Components
export const Tabs: React.FC<TabsProps> = ({ children, defaultValue, value, onValueChange }) => {
  const [selectedTab, setSelectedTab] = useState(value || defaultValue);
  
  const handleValueChange = (newValue: string) => {
    if (!value) {
      setSelectedTab(newValue);
    }
    onValueChange?.(newValue);
  };
  
  return (
    <TabsContext.Provider value={{ value: value || selectedTab, onValueChange: handleValueChange }}>
      <div className="w-full">{children}</div>
    </TabsContext.Provider>
  );
};

export const TabsList: React.FC<TabsListProps> = ({ children, className = '' }) => {
  return (
    <div className={`flex space-x-1 border-b border-gray-200 dark:border-gray-700 ${className}`}>
      {children}
    </div>
  );
};

export const Tab: React.FC<TabProps> = ({ children, value, icon }) => {
  const { value: selectedValue, onValueChange } = useTabs();
  const isActive = selectedValue === value;
  
  return (
    <button
      onClick={() => onValueChange(value)}
      className={`flex items-center px-4 py-3 text-sm font-medium relative ${
        isActive 
          ? 'text-indigo-600 dark:text-indigo-400' 
          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200'
      }`}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {children}
      {isActive && (
        <motion.div 
          layoutId="activeTab"
          className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600 dark:bg-indigo-400"
          initial={false}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      )}
    </button>
  );
};

export const TabsContent: React.FC<TabsContentProps> = ({ children, value }) => {
  const { value: selectedValue } = useTabs();
  
  if (selectedValue !== value) return null;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  );
};