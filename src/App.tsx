import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Profile from '@/pages/Profile';
import Settings from '@/pages/Settings';
import Account from '@/pages/Account';
import Projects from '@/pages/Projects';
import Events from '@/pages/Events';
import Index from '@/pages/Index';
import { useAuth } from '@/hooks/use-auth';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthGuard } from "@/components/AuthGuard";
import { MobileNav } from "@/components/MobileNav";
import { ScrollToTop } from "@/components/ScrollToTop";
import Tasks from "./pages/Tasks";
// import Task1 from "@/pages/Task1";
import Planning from "./pages/Planning";
import NotFound from "./pages/NotFound";
import { AuthProvider } from '@/contexts/AuthContext';

const queryClient = new QueryClient();

const App = () => {
  const { user } = useAuth();

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AuthProvider>
          <AuthGuard>
            <Router>
              <ScrollToTop />
              <div className="min-h-screen pb-16 md:pb-0">
                <Routes>
                  <Route
                    path="/login"
                    element={user ? <Navigate to="/" /> : <Login />}
                  />
                  <Route
                    path="/register"
                    element={user ? <Navigate to="/" /> : <Register />}
                  />
                  <Route
                    path="/profile"
                    element={user ? <Profile /> : <Navigate to="/login" />}
                  />
                  <Route
                    path="/settings"
                    element={user ? <Settings /> : <Navigate to="/login" />}
                  />
                  <Route
                    path="/account"
                    element={user ? <Account /> : <Navigate to="/login" />}
                  />
                  <Route
                    path="/projects"
                    element={user ? <Projects /> : <Navigate to="/login" />}
                  />
                  <Route
                    path="/events"
                    element={user ? <Events /> : <Navigate to="/login" />}
                  />
                  <Route
                    path="/"
                    element={user ? <Index /> : <Navigate to="/login" />}
                  />
                  <Route path="/tasks" element={<Tasks />} />
                  {/* <Route path="/task1" element={<Task1 />} /> */}
                  <Route path="/planning" element={<Planning />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
                <MobileNav />
              </div>
            </Router>
          </AuthGuard>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;
