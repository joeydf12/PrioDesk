
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Project, Task } from '@/pages/Index';
import { FolderOpen, CheckSquare, Clock, Calendar } from 'lucide-react';

interface ProjectOverviewProps {
  projects: Project[];
  tasks: Task[];
}

export const ProjectOverview: React.FC<ProjectOverviewProps> = ({ projects, tasks }) => {
  const getProjectStats = (projectName: string) => {
    const projectTasks = tasks.filter(task => task.project === projectName);
    const completed = projectTasks.filter(task => task.status === 'completed').length;
    const total = projectTasks.length;
    const inProgress = projectTasks.filter(task => task.status === 'in-progress').length;
    const overdue = projectTasks.filter(task => {
      const today = new Date();
      const dueDate = new Date(task.dueDate);
      return task.status !== 'completed' && dueDate < today;
    }).length;
    
    return {
      total,
      completed,
      inProgress,
      overdue,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
    };
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-slate-800">Project Overview</h2>
        <Badge variant="outline" className="bg-blue-50 text-blue-700">
          {projects.length} Active Projects
        </Badge>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {projects.map(project => {
          const stats = getProjectStats(project.name);
          
          return (
            <Card key={project.id} className="hover:shadow-lg transition-shadow duration-200">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <FolderOpen className="w-5 h-5 text-slate-600" />
                    <span className="text-lg">{project.name}</span>
                  </div>
                  <Badge className={project.color}>
                    {stats.completionRate}% Complete
                  </Badge>
                </CardTitle>
                <p className="text-slate-600 text-sm">{project.description}</p>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm text-slate-600 mb-2">
                    <span>Progress</span>
                    <span>{stats.completed}/{stats.total} tasks</span>
                  </div>
                  <Progress value={stats.completionRate} className="h-2" />
                </div>

                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="bg-blue-50 rounded-lg p-3">
                    <Calendar className="w-5 h-5 text-blue-600 mx-auto mb-1" />
                    <div className="text-lg font-semibold text-blue-800">{stats.total}</div>
                    <div className="text-xs text-blue-600">Total</div>
                  </div>
                  
                  <div className="bg-orange-50 rounded-lg p-3">
                    <Clock className="w-5 h-5 text-orange-600 mx-auto mb-1" />
                    <div className="text-lg font-semibold text-orange-800">{stats.inProgress}</div>
                    <div className="text-xs text-orange-600">In Progress</div>
                  </div>
                  
                  <div className="bg-green-50 rounded-lg p-3">
                    <CheckSquare className="w-5 h-5 text-green-600 mx-auto mb-1" />
                    <div className="text-lg font-semibold text-green-800">{stats.completed}</div>
                    <div className="text-xs text-green-600">Completed</div>
                  </div>
                </div>

                {stats.overdue > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                      <span className="text-red-800 text-sm font-medium">
                        {stats.overdue} overdue task{stats.overdue > 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};
