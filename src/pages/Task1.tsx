import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { useTasks } from '@/hooks/useTasks';
import { useProjects } from '@/hooks/useProjects';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MobileNav } from '@/components/MobileNav';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { CheckCircle2, Clock, AlertCircle, Calendar, Tag, FileText, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { TaskCard } from '@/components/TaskCard';

const Task1 = () => {
    const { tasks, loading: tasksLoading } = useTasks();
    const { projects, loading: projectsLoading } = useProjects();
    const [selectedTask, setSelectedTask] = useState<any>(null);
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const navigate = useNavigate();

    const loading = tasksLoading || projectsLoading;

    const getPriorityColor = (priority: string) => {
        switch (priority.toLowerCase()) {
            case 'hoog':
                return 'bg-red-100 text-red-700';
            case 'gemiddeld':
                return 'bg-yellow-100 text-yellow-700';
            case 'laag':
                return 'bg-green-100 text-green-700';
            default:
                return 'bg-gray-100 text-gray-700';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status.toLowerCase()) {
            case 'voltooid':
                return <CheckCircle2 className="w-5 h-5 text-green-500" />;
            case 'in uitvoering':
                return <Clock className="w-5 h-5 text-blue-500" />;
            case 'gepland':
                return <Calendar className="w-5 h-5 text-purple-500" />;
            default:
                return <AlertCircle className="w-5 h-5 text-gray-500" />;
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('nl-NL', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    };

    const handleTaskClick = (task: any) => {
        setSelectedTask(task);
        setIsTaskModalOpen(true);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
            <Header onCreateTask={() => { }} />

            <main className="container mx-auto px-4 py-8 pb-24">
                <div className="max-w-4xl mx-auto">
                    <Button
                        variant="ghost"
                        className="mb-4"
                        onClick={() => navigate('/')}
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Terug naar home
                    </Button>

                    <div className="mb-6">
                        <h1 className="text-3xl font-bold text-slate-800 mb-2">Taken</h1>
                        <p className="text-slate-600">Beheer al je taken</p>
                    </div>

                    {loading ? (
                        <div className="text-center py-8">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
                            <p className="mt-2 text-slate-600">Taken laden...</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {tasks.map((task) => (
                                <div
                                    key={task.id}
                                    className="bg-white rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow cursor-pointer"
                                    onClick={() => handleTaskClick(task)}
                                >
                                    <div className="flex items-start justify-between">
                                        <div className="flex-1">
                                            <h3 className="font-medium text-slate-900">{task.title}</h3>
                                            <p className="text-sm text-slate-600 mt-1">{task.description}</p>

                                            <div className="flex flex-wrap gap-2 mt-3">
                                                <Badge variant="outline" className="flex items-center gap-1">
                                                    {getStatusIcon(task.status)}
                                                    {task.status}
                                                </Badge>
                                                <Badge variant="outline" className={getPriorityColor(task.priority)}>
                                                    {task.priority}
                                                </Badge>
                                                {task.due_date && (
                                                    <Badge variant="outline" className="flex items-center gap-1">
                                                        <Calendar className="w-3 h-3" />
                                                        {formatDate(task.due_date)}
                                                    </Badge>
                                                )}
                                                {task.effort && (
                                                    <Badge variant="outline" className="flex items-center gap-1">
                                                        <Clock className="w-3 h-3" />
                                                        {task.effort} uur
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </main>

            <Dialog open={isTaskModalOpen} onOpenChange={setIsTaskModalOpen}>
                <DialogContent className="sm:max-w-[600px] bg-white">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-semibold">{selectedTask?.title}</DialogTitle>
                    </DialogHeader>

                    {selectedTask && (
                        <div className="space-y-4">
                            <TaskCard
                                task={selectedTask}
                                projects={projects}
                                onComplete={() => { }}
                                onTaskStatusChange={() => { }}
                            />

                            <div>
                                <h4 className="text-sm font-medium text-slate-500 mb-1">Beschrijving</h4>
                                <p className="text-slate-700">{selectedTask.description}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <h4 className="text-sm font-medium text-slate-500 mb-1">Status</h4>
                                    <Badge variant="outline" className="flex items-center gap-1">
                                        {getStatusIcon(selectedTask.status)}
                                        {selectedTask.status}
                                    </Badge>
                                </div>

                                <div>
                                    <h4 className="text-sm font-medium text-slate-500 mb-1">Prioriteit</h4>
                                    <Badge variant="outline" className={getPriorityColor(selectedTask.priority)}>
                                        {selectedTask.priority}
                                    </Badge>
                                </div>

                                {selectedTask.due_date && (
                                    <div>
                                        <h4 className="text-sm font-medium text-slate-500 mb-1">Deadline</h4>
                                        <div className="flex items-center gap-1 text-slate-700">
                                            <Calendar className="w-4 h-4" />
                                            {formatDate(selectedTask.due_date)}
                                        </div>
                                    </div>
                                )}

                                {selectedTask.effort && (
                                    <div>
                                        <h4 className="text-sm font-medium text-slate-500 mb-1">Inspanning</h4>
                                        <div className="flex items-center gap-1 text-slate-700">
                                            <Clock className="w-4 h-4" />
                                            {selectedTask.effort} uur
                                        </div>
                                    </div>
                                )}
                            </div>

                            {selectedTask.notes && (
                                <div>
                                    <h4 className="text-sm font-medium text-slate-500 mb-1">Notities</h4>
                                    <p className="text-slate-700">{selectedTask.notes}</p>
                                </div>
                            )}

                            {selectedTask.attachments && selectedTask.attachments.length > 0 && (
                                <div>
                                    <h4 className="text-sm font-medium text-slate-500 mb-2">Bijlagen</h4>
                                    <div className="space-y-2">
                                        {selectedTask.attachments.map((attachment: any, index: number) => (
                                            <div
                                                key={index}
                                                className="flex items-center gap-2 p-2 bg-slate-50 rounded-md hover:bg-slate-100 transition-colors"
                                            >
                                                <FileText className="w-4 h-4 text-slate-500" />
                                                <span className="text-sm text-slate-700">{attachment.name}</span>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="ml-auto"
                                                    onClick={() => window.open(attachment.url, '_blank')}
                                                >
                                                    Downloaden
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-end gap-2 pt-4">
                                <Button variant="outline" onClick={() => setIsTaskModalOpen(false)}>
                                    Sluiten
                                </Button>
                                <Button>
                                    Bewerken
                                </Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            <MobileNav />
        </div>
    );
};

export default Task1; 