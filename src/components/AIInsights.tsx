
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
        title: 'Attention Needed',
        message: `You have ${overdueTasks.length} overdue task${overdueTasks.length > 1 ? 's' : ''}. Consider rescheduling or breaking them into smaller parts.`,
        action: 'Review overdue tasks'
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
        title: 'Stagnant Tasks Detected',
        message: `${oldTasks.length} task${oldTasks.length > 1 ? 's have' : ' has'} been open for over a week. Consider breaking them down or reassessing priority.`,
        action: 'Review old tasks'
      });
    }

    // Check workload balance
    const highPriorityTasks = tasks.filter(t => t.priority === 'high' && t.status !== 'completed').length;
    if (highPriorityTasks > 3) {
      insights.push({
        type: 'warning',
        icon: TrendingUp,
        title: 'Heavy High-Priority Workload',
        message: `You have ${highPriorityTasks} high-priority tasks. Consider focusing on 2-3 key items to maintain quality.`,
        action: 'Optimize priorities'
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
        title: 'Great Progress Today!',
        message: `You've completed ${completedToday} task${completedToday > 1 ? 's' : ''} today. Keep up the momentum!`,
        action: 'View achievements'
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
              <h3 className="font-semibold text-green-800">All Good!</h3>
              <p className="text-green-700 text-sm">Your tasks are well-organized. Keep up the great work!</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center space-x-2 text-lg">
          <Brain className="w-5 h-5 text-blue-600" />
          <span>AI Insights</span>
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
