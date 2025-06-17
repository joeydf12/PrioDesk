import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { TaskCard } from '@/components/TaskCard';
import { TaskCreationModal } from '@/components/TaskCreationModal';
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

const Tasks = () => {
  const { tasks, createTask, updateTask } = useTasks();
  const { projects } = useProjects();
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDays, setSelectedDays] = useState<string[]>([]);
  const [isDayFilterOpen, setIsDayFilterOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'active' | 'completed'>('active');

  const handleTaskComplete = async (taskId: string) => {
    const task = tasks.find(t => t.id === taskId);
    if (task) {
      await updateTask(taskId, {
        status: task.status === 'completed' ? 'pending' : 'completed',
        completed_at: task.status === 'completed' ? null : new Date().toISOString()
      });
    }
  };

  const handleTaskStatusChange = async (taskId: string, newStatus: Task['status']) => {
    await updateTask(taskId, { status: newStatus });
  };

  const handleTaskCreate = async (newTask: Omit<Task, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
    await createTask(newTask);
    setIsTaskModalOpen(false);
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
          {filteredTasks.length === 0 ? (
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
    </div>
  );
};

export default Tasks;
