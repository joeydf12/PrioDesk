import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Task, Project } from '@/types';

interface TaskCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateTask: (task: Omit<Task, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => void;
  projects: Project[];
}

export const TaskCreationModal: React.FC<TaskCreationModalProps> = ({
  isOpen,
  onClose,
  onCreateTask,
  projects
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    due_date: '',
    priority: 'medium' as Task['priority'],
    effort: 'medium' as Task['effort'],
    project_id: '',
    notes: '',
    status: 'pending' as Task['status'],
    completed_at: null as string | null,
    planned_date: null as string | null
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.due_date || !formData.project_id) return;

    onCreateTask(formData);
    setFormData({
      title: '',
      description: '',
      due_date: '',
      priority: 'medium',
      effort: 'medium',
      project_id: '',
      notes: '',
      status: 'pending',
      completed_at: null,
      planned_date: null
    });
  };

  const isFormValid = formData.title && formData.due_date && formData.project_id;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold">Nieuwe taak aanmaken</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Titel *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="mt-1"
                placeholder="Wat moet er gedaan worden?"
              />
            </div>

            <div>
              <Label htmlFor="description">Beschrijving</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                className="mt-1"
                placeholder="Voeg details toe over de taak..."
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="dueDate">Deadline *</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData(prev => ({ ...prev, due_date: e.target.value }))}
                  className="mt-1"
                />
              </div>

              <div>
                <Label htmlFor="plannedDate">Inplannen op</Label>
                <Input
                  id="plannedDate"
                  type="date"
                  value={formData.planned_date || ''}
                  onChange={(e) => setFormData(prev => ({ ...prev, planned_date: e.target.value }))}
                  className="mt-1"
                />
                <p className="text-xs text-slate-500 mt-1">Optioneel: wanneer wil je deze taak uitvoeren?</p>
              </div>

              <div>
                <Label htmlFor="project">Project *</Label>
                <Select value={formData.project_id} onValueChange={(value) => setFormData(prev => ({ ...prev, project_id: value }))}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Selecteer project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map(project => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="priority">Prioriteit *</Label>
                <Select value={formData.priority} onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value }))}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Selecteer prioriteit" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Laag</SelectItem>
                    <SelectItem value="medium">Gemiddeld</SelectItem>
                    <SelectItem value="high">Hoog</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="effort">Inspanning *</Label>
                <Select value={formData.effort} onValueChange={(value) => setFormData(prev => ({ ...prev, effort: value }))}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Selecteer inspanning" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Klein</SelectItem>
                    <SelectItem value="medium">Gemiddeld</SelectItem>
                    <SelectItem value="large">Groot</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Annuleren
            </Button>
            <Button type="submit" disabled={!isFormValid}>
              Taak aanmaken
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
