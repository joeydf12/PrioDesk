import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { TaskCard } from '@/components/TaskCard';
import { TaskCreationModal } from '@/components/TaskCreationModal';
import { CompletionCelebration } from '@/components/CompletionCelebration';
import { Task, Project } from '@/types';
import { useTasks } from '@/hooks/useTasks';
import { useProjects } from '@/hooks/useProjects';
import { Input } from '@/components/ui/input';
import { Search, Calendar, X, CheckSquare, ListTodo } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { taskAttachmentService } from '@/services/taskAttachmentService';
import { supabase } from '@/lib/supabase';
import { toast } from "@/components/ui/use-toast";
import { useAuth } from '@/contexts/AuthContext';

const Tasks = () => {
  const { tasks: initialTasks, createTask, updateTask } = useTasks();
  const { projects, loading: projectsLoading } = useProjects();
  const { user } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [isDayFilterOpen, setIsDayFilterOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('active');
  const [celebrationTask, setCelebrationTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setLoading(true);
      fetchTasks();
    }
  }, [user]);

  const handleTaskComplete = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      const isCurrentlyCompleted = task.status === 'completed';
      const newStatus = isCurrentlyCompleted ? 'pending' : 'completed';
      const completedAt = isCurrentlyCompleted ? null : new Date().toISOString();
      
      await updateTask(taskId, {
        status: newStatus,
        completed_at: completedAt
      });
      
      // Only show celebration when completing a task (not when uncompleting)
      if (!isCurrentlyCompleted) {
        setCelebrationTask({ ...task, status: 'completed', completed_at: completedAt });
      }
      
      await fetchTasks(); // Refresh the tasks to update the UI
    }
  };

  const handleTaskStatusChange = async (taskId: string, newStatus: Task['status']) => {
    await updateTask(taskId, { status: newStatus });
  };

  const handleTaskEdit = async (taskId: string, updatedTask: Partial<Task>) => {
    try {
      await updateTask(taskId, updatedTask);
      await fetchTasks(); // Refresh the tasks to update the UI
      
      toast({
        title: "Taak bijgewerkt",
        description: "De taak is succesvol bijgewerkt.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Kon taak niet bijwerken: " + error.message,
        variant: "destructive",
      });
    }
  };

  const handleTaskCreate = async (newTask: Omit<Task, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Niet ingelogd');

      const { data, error } = await supabase
        .from('tasks')
        .insert([{ ...newTask, user_id: user.id }])
        .select()
        .single();

      if (error) throw error;
      
      // Fetch attachments for the new task
      const attachments = await taskAttachmentService.getTaskAttachments(data.id);
      const taskWithAttachments = { ...data, attachments };
      
      setTasks(prev => [...prev, taskWithAttachments]);
      setIsTaskModalOpen(false);
      
      toast({
        title: "Taak aangemaakt",
        description: "De taak is succesvol toegevoegd.",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Kon taak niet aanmaken: " + error.message,
        variant: "destructive",
      });
    }
  };

  const handleUpload = async (type: 'file' | 'image' | 'text', content: string, analysis: string) => {
    try {
      // Since we don't have the taskId in this context, we'll refresh all tasks
      await fetchTasks();
      
      toast({
        title: "Upload succesvol",
        description: "De bijlage is toegevoegd aan de taak.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Kon bijlage niet toevoegen.",
        variant: "destructive",
      });
    }
  };

  const handleTaskUpload = async (type: 'file' | 'image' | 'text', content: string, analysis: string) => {
    // Refresh the tasks data to show the new attachment
    await fetchTasks();
  };

  const activeTasks = tasks.filter(task => task.status !== 'completed');
  const completedTasks = tasks.filter(task => task.status === 'completed');

  const filteredTasks = (activeTab === 'active' ? activeTasks : completedTasks).filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase());

    if (selectedDays.length === 0) return matchesSearch;

    const taskDate = task.due_date ? new Date(task.due_date) : null;
    if (!taskDate) return selectedDays.includes('no-date') && matchesSearch;

    const dayKey = taskDate.toISOString().split('T')[0];
    return selectedDays.includes(dayKey) && matchesSearch;
  });

  const getNextDays = (count: number) => {
    const days = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    for (let i = 0; i < count; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      days.push(date);
    }
    return days;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('nl-NL', {
      weekday: 'long',
      day: 'numeric',
      month: 'long'
    });
  };

  const getDateKey = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const toggleDay = (dayKey: string) => {
    setSelectedDays(prev =>
      prev.includes(dayKey)
        ? prev.filter(d => d !== dayKey)
        : [...prev, dayKey]
    );
  };

  const clearDayFilters = () => {
    setSelectedDays([]);
  };

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const { data: tasks, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('due_date', { ascending: true });

      if (error) throw error;

      // Fetch attachments for each task
      const tasksWithAttachments = await Promise.all(
        tasks.map(async (task) => {
          const attachments = await taskAttachmentService.getTaskAttachments(task.id);
          return { ...task, attachments };
        })
      );

      setTasks(tasksWithAttachments);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching tasks:', error);
      toast({
        title: "Error",
        description: "Failed to fetch tasks",
        variant: "destructive",
      });
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <Header onCreateTask={() => setIsTaskModalOpen(true)} />

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-800 mb-2">Mijn Taken</h1>
          <p className="text-slate-600">Beheer al je taken op één plek</p>
        </div>

        <Tabs defaultValue="active" value={activeTab} onValueChange={(value) => setActiveTab(value as 'active' | 'completed')} className="mb-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="active" className="flex items-center gap-2">
              <ListTodo className="h-4 w-4" />
              Actieve Taken
            </TabsTrigger>
            <TabsTrigger value="completed" className="flex items-center gap-2">
              <CheckSquare className="h-4 w-4" />
              Afgeronde Taken
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {activeTab === 'active' && (
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                type="text"
                placeholder="Zoek in taken..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <Popover open={isDayFilterOpen} onOpenChange={setIsDayFilterOpen}>
              <PopoverTrigger asChild>
                <Button variant="outline" className="w-full sm:w-[200px] justify-start">
                  <Calendar className="h-4 w-4 mr-2" />
                  {selectedDays.length > 0 ? (
                    <span>{selectedDays.length} dagen geselecteerd</span>
                  ) : (
                    <span>Filter op datum</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-[300px] p-0" align="start">
                <div className="flex items-center justify-between p-4 border-b">
                  <h4 className="font-medium">Selecteer dagen</h4>
                  {selectedDays.length > 0 && (
                    <Button variant="ghost" size="sm" onClick={clearDayFilters}>
                      <X className="h-4 w-4 mr-2" />
                      Wissen
                    </Button>
                  )}
                </div>
                <ScrollArea className="h-[300px]">
                  <div className="p-4 space-y-4">
                    {getNextDays(14).map((date) => {
                      const dayKey = getDateKey(date);
                      return (
                        <div key={dayKey} className="flex items-center space-x-2">
                          <Checkbox
                            id={dayKey}
                            checked={selectedDays.includes(dayKey)}
                            onCheckedChange={() => toggleDay(dayKey)}
                          />
                          <label
                            htmlFor={dayKey}
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                          >
                            {formatDate(date)}
                          </label>
                        </div>
                      );
                    })}
                    <div className="flex items-center space-x-2 pt-2 border-t">
                      <Checkbox
                        id="no-date"
                        checked={selectedDays.includes('no-date')}
                        onCheckedChange={() => toggleDay('no-date')}
                      />
                      <label
                        htmlFor="no-date"
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        Geen datum
                      </label>
                    </div>
                  </div>
                </ScrollArea>
              </PopoverContent>
            </Popover>
          </div>
        )}

        {activeTab === 'active' && selectedDays.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-4">
            {selectedDays.map(day => (
              <Badge key={day} variant="secondary" className="flex items-center gap-1">
                {day === 'no-date' ? 'Geen datum' : formatDate(new Date(day))}
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 hover:bg-transparent"
                  onClick={() => toggleDay(day)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
        )}

        <div className="grid gap-4">
          {loading ? (
            <div className="flex justify-center items-center py-16">
              <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredTasks.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              {activeTab === 'active' ? (
                searchQuery || selectedDays.length > 0
                  ? 'Geen taken gevonden voor deze filters'
                  : 'Geen actieve taken'
              ) : (
                'Geen afgeronde taken'
              )}
            </div>
          ) : (
            filteredTasks.map(task => (
              <TaskCard
                key={task.id}
                task={task}
                projects={projects}
                onComplete={handleTaskComplete}
                onTaskStatusChange={handleTaskStatusChange}
                onUpload={handleTaskUpload}
                onEdit={handleTaskEdit}
                onAssignmentChange={fetchTasks}
                canAssign={false} // Users can only assign tasks in project context
              />
            ))
          )}
        </div>
      </main>

      <TaskCreationModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onCreateTask={handleTaskCreate}
        projects={projects}
      />

      <CompletionCelebration
        task={celebrationTask}
        onClose={() => setCelebrationTask(null)}
      />
    </div>
  );
};

export default Tasks;
