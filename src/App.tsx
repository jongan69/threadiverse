import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Web3Provider } from './providers/Web3Provider';
import { SupabaseProvider } from './providers/SupabaseProvider';
import { LensProvider } from './providers/LensProvider';
import Navigation from './components/layout/Navigation';
import Home from './pages/Home';
import Profile from './pages/Profile';
import CreateThread from './pages/CreateThread';
import ThreadView from './pages/ThreadView';
import NotFound from './pages/NotFound';

function App() {
  return (
    <Web3Provider>
      <LensProvider>
        <SupabaseProvider>
          <Router>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
              <Navigation />
              <main className="container mx-auto px-4 pt-16 pb-20">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/profile/:handle?" element={<Profile />} />
                  <Route path="/create" element={<CreateThread />} />
                  <Route path="/thread/:id" element={<ThreadView />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
            </div>
          </Router>
        </SupabaseProvider>
      </LensProvider>
    </Web3Provider>
  );
}

export default App;