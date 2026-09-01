import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { Hero } from './components/sections/Hero';
import { FeaturesSection } from './components/sections/FeaturesSection';
import { HowItWorks } from './components/sections/HowItWorks';
import { Login } from './components/auth/Login';
import { Signup } from './components/auth/Signup';
import { AuthProvider, useAuth } from './context/AuthContext';
import DashboardApp from './DashboardApp';

function LandingPage() {
  return (
    <div className="min-h-screen bg-white text-black font-sans selection:bg-blue/30 selection:text-black">
      <Navbar />
      
      <main>
        <Hero />
        <FeaturesSection />
        <HowItWorks />
      </main>

      <Footer />
    </div>
  );
}

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route 
          path="/dashboard/*" 
          element={
            <ProtectedRoute>
              <DashboardApp />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </AuthProvider>
  );
}

export default App;
