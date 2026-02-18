import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Header from './components/Header';
import Gallery from './components/Gallery';
import Footer from './components/Footer';
import Admin from './components/Admin';
import Blog from './components/Blog';
import BlogPost from './components/BlogPost';
import { DataProvider } from './context/DataContext';

const HomePage: React.FC = () => (
  <>
    <Gallery />
  </>
);

const App: React.FC = () => {
  return (
    <DataProvider>
      <div className="min-h-screen flex flex-col bg-background-light dark:bg-background-dark">
        <Header />
        <main className="flex-grow pt-10 md:pt-16">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:slug" element={<BlogPost />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </DataProvider>
  );
};

export default App;