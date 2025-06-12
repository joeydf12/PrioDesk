
import React, { useEffect, useState } from 'react';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckSquare, Sparkles } from 'lucide-react';
import { Task } from '@/types';

interface CompletionCelebrationProps {
  task: Task | null;
  onClose: () => void;
}

const motivationalQuotes = [
  "Great job! Every completed task brings you closer to your goals.",
  "Fantastic work! You're building unstoppable momentum.",
  "Well done! Your consistency is your superpower.",
  "Excellent! You're making progress one task at a time.",
  "Amazing! You're turning your plans into reality.",
  "Outstanding! Your focus is paying off beautifully.",
  "Brilliant! You're creating positive change every day.",
  "Wonderful! Your dedication is truly inspiring.",
  "Superb! You're proving that small steps lead to big achievements.",
  "Incredible! You're mastering the art of getting things done."
];

export const CompletionCelebration: React.FC<CompletionCelebrationProps> = ({
  task,
  onClose
}) => {
  const [quote, setQuote] = useState('');

  useEffect(() => {
    if (task) {
      const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];
      setQuote(randomQuote);
    }
  }, [task]);

  if (!task) return null;

  return (
    <Dialog open={!!task} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md text-center">
        <div className="flex flex-col items-center space-y-4 py-6">
          <div className="relative">
            <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-green-600 rounded-full flex items-center justify-center">
              <CheckSquare className="w-8 h-8 text-white" />
            </div>
            <Sparkles className="w-6 h-6 text-yellow-400 absolute -top-1 -right-1 animate-pulse" />
          </div>
          
          <div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Task Completed!</h3>
            <p className="text-slate-600 font-medium mb-4">"{task.title}"</p>
            
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 rounded-lg border border-blue-200">
              <p className="text-slate-700 italic">{quote}</p>
            </div>
          </div>

          <Button
            onClick={onClose}
            className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
          >
            Continue
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
