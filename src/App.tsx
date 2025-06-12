
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthGuard } from "@/components/AuthGuard";
import Index from "./pages/Index";
import Tasks from "./pages/Tasks";
import CompletedTasks from "./pages/CompletedTasks";
import Planning from "./pages/Planning";
import Projects from "./pages/Projects";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <AuthGuard>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/completed" element={<CompletedTasks />} />
            <Route path="/planning" element={<Planning />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AuthGuard>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
