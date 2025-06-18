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
    due_date: new Date().toISOString(),
    planned_date: null as string | null,
    priority: 'medium' as Task['priority'],
    effort: 'medium' as Task['effort'],
    project_id: '',
    notes: '',
    status: 'pending' as Task['status'],
    completed_at: null as string | null,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Ensure due_date has time set to 23:59 if not specified
    const dueDate = new Date(formData.due_date);
    if (!formData.due_date.includes('T')) {
      dueDate.setHours(23, 59, 0, 0);
    }

    // Ensure planned_date has time set to 09:00 if not specified
    let plannedDate = null;
    if (formData.planned_date) {
      plannedDate = new Date(formData.planned_date);
      if (!formData.planned_date.includes('T')) {
        plannedDate.setHours(9, 0, 0, 0);
      }
    }

    // Format dates without timezone conversion
    const formatDateWithoutTimezone = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const hours = String(date.getHours()).padStart(2, '0');
      const minutes = String(date.getMinutes()).padStart(2, '0');
      return `${year}-${month}-${day}T${hours}:${minutes}:00`;
    };

    const taskData = {
      ...formData,
      due_date: formatDateWithoutTimezone(dueDate),
      planned_date: plannedDate ? formatDateWithoutTimezone(plannedDate) : null,
    };

    await onCreateTask(taskData);
  };

  const isFormValid = formData.title && formData.due_date && formData.project_id;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Nieuwe taak</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Titel *</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                className="mt-1"
                required
              />
            </div>

            <div>
              <Label htmlFor="priority">Prioriteit *</Label>
              <Select
                value={formData.priority}
                onValueChange={(value) => setFormData(prev => ({ ...prev, priority: value as Task['priority'] }))}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecteer prioriteit" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">Hoog</SelectItem>
                  <SelectItem value="medium">Normaal</SelectItem>
                  <SelectItem value="low">Laag</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Beschrijving</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="mt-1"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
              <Label htmlFor="effort">Inspanning *</Label>
              <Select
                value={formData.effort}
                onValueChange={(value) => setFormData(prev => ({ ...prev, effort: value as Task['effort'] }))}
              >
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

          <div>
            <Label htmlFor="dueDate">Deadline *</Label>
            <div className="grid grid-cols-[1fr,auto] gap-2 mt-1">
              <Input
                id="dueDate"
                type="date"
                value={formData.due_date.split('T')[0]}
                onChange={(e) => {
                  const time = formData.due_date.split('T')[1] || '23:59';
                  setFormData(prev => ({ ...prev, due_date: `${e.target.value}T${time}` }));
                }}
                required
              />
              <Input
                id="dueTime"
                type="time"
                value={formData.due_date.split('T')[1]?.substring(0, 5) || '23:59'}
                onChange={(e) => {
                  const date = formData.due_date.split('T')[0];
                  setFormData(prev => ({ ...prev, due_date: `${date}T${e.target.value}:00` }));
                }}
                className="w-[120px]"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="plannedDate">Inplannen op</Label>
            <div className="grid grid-cols-[1fr,auto] gap-2 mt-1">
              <Input
                id="plannedDate"
                type="date"
                value={formData.planned_date?.split('T')[0] || ''}
                onChange={(e) => {
                  const time = formData.planned_date?.split('T')[1] || '09:00';
                  setFormData(prev => ({ ...prev, planned_date: `${e.target.value}T${time}` }));
                }}
              />
              <Input
                id="plannedTime"
                type="time"
                value={formData.planned_date?.split('T')[1]?.substring(0, 5) || '09:00'}
                onChange={(e) => {
                  const date = formData.planned_date?.split('T')[0];
                  if (date) {
                    setFormData(prev => ({ ...prev, planned_date: `${date}T${e.target.value}:00` }));
                  }
                }}
                className="w-[120px]"
              />
            </div>
            <p className="text-xs text-slate-500 mt-1">Optioneel: wanneer wil je deze taak uitvoeren?</p>
          </div>

          <div className="flex justify-end gap-2 pt-2">
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
