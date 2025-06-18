import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, AlertTriangle, TrendingUp, Calendar } from 'lucide-react';
import { Task } from '@/types';

interface AIInsightsProps {
  tasks: Task[];
}

export const AIInsights: React.FC<AIInsightsProps> = ({ tasks }) => {
  const getInsights = (tasks: Task[]) => {
    const insights = [];
    const today = new Date();
    
    // Check for overdue tasks
    const overdueTasks = tasks.filter(task => {
      const dueDate = new Date(task.due_date);
      return task.status !== 'completed' && dueDate < today;
    });
    
    if (overdueTasks.length > 0) {
      insights.push({
        type: 'warning',
        icon: AlertTriangle,
        title: 'Aandacht Nodig',
        message: `Je hebt ${overdueTasks.length} te late ${overdueTasks.length > 1 ? 'taken' : 'taak'}. Overweeg om ze te herplannen of op te splitsen in kleinere delen.`,
        action: 'Bekijk te late taken'
      });
    }

    // Check for old tasks
    const oldTasks = tasks.filter(task => {
      const createdDate = new Date(task.created_at);
      const daysDiff = Math.floor((today.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24));
      return task.status !== 'completed' && daysDiff > 7;
    });

    if (oldTasks.length > 0) {
      insights.push({
        type: 'info',
        icon: Calendar,
        title: 'Stagnerende Taken Gedetecteerd',
        message: `${oldTasks.length} ${oldTasks.length > 1 ? 'taken staan' : 'taak staat'} al meer dan een week open. Overweeg om ze op te splitsen of de prioriteit te herzien.`,
        action: 'Bekijk oude taken'
      });
    }

    // Check workload balance
    const highPriorityTasks = tasks.filter(t => t.priority === 'high' && t.status !== 'completed').length;
    if (highPriorityTasks > 3) {
      insights.push({
        type: 'warning',
        icon: TrendingUp,
        title: 'Hoge Werkdruk',
        message: `Je hebt ${highPriorityTasks} hoge-prioriteit taken. Focus op 2-3 belangrijke items om de kwaliteit te behouden.`,
        action: 'Optimaliseer prioriteiten'
      });
    }

    // Positive insights
    const completedToday = tasks.filter(task => {
      if (!task.completed_at) return false;
      const completedDate = new Date(task.completed_at);
      return completedDate.toDateString() === today.toDateString();
    }).length;

    if (completedToday > 0) {
      insights.push({
        type: 'success',
        icon: TrendingUp,
        title: 'Goede Voortgang Vandaag!',
        message: `Je hebt vandaag ${completedToday} ${completedToday > 1 ? 'taken' : 'taak'} afgerond. Ga zo door!`,
        action: 'Bekijk prestaties'
      });
    }

    return insights;
  };

  const insights = getInsights(tasks);

  if (insights.length === 0) {
    return (
      <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardContent className="p-4">
          <div className="flex items-center space-x-3">
            <Brain className="w-6 h-6 text-green-600" />
            <div>
              <h3 className="font-semibold text-green-800">Alles in Orde!</h3>
              <p className="text-green-700 text-sm">Je taken zijn goed georganiseerd. Ga zo door!</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex justify-between text-lg">
          <span>AI Inzichten</span>
          <Brain className="w-5 h-5 text-blue-600" />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {insights.map((insight, index) => {
          const IconComponent = insight.icon;
          const getInsightStyle = (type: string) => {
            switch (type) {
              case 'warning': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
              case 'success': return 'bg-green-50 border-green-200 text-green-800';
              case 'info': return 'bg-blue-50 border-blue-200 text-blue-800';
              default: return 'bg-slate-50 border-slate-200 text-slate-800';
            }
          };

          return (
            <div key={index} className={`p-3 rounded-lg border ${getInsightStyle(insight.type)}`}>
              <div className="flex items-start space-x-3">
                <IconComponent className="w-5 h-5 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="font-medium text-sm">{insight.title}</h4>
                  <p className="text-sm opacity-90 mt-1">{insight.message}</p>
                </div>
                <Badge variant="outline" className="text-xs">
                  {insight.action}
                </Badge>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};
