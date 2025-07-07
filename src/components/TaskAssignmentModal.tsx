import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { User, UserCheck, UserX } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { taskAssignmentService } from '@/services/taskAssignmentService';
import { supabase } from '@/lib/supabase';
import { Task, Project, Profile } from '@/types';

interface TaskAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  task: Task | null;
  project: Project | null;
  onAssignmentChange: () => void;
}

interface SharedMember extends Profile {
  permission: string;
  shareId: string;
}

export const TaskAssignmentModal: React.FC<TaskAssignmentModalProps> = ({
  isOpen,
  onClose,
  task,
  project,
  onAssignmentChange,
}) => {
  console.log('TaskAssignmentModal rendered', { isOpen, task, project });

  const [sharedMembers, setSharedMembers] = useState<SharedMember[]>([]);
  const [selectedMember, setSelectedMember] = useState<string>('');
  const [assignmentNotes, setAssignmentNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentAssignment, setCurrentAssignment] = useState<Profile | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    try {
      if (isOpen && project) {
        fetchSharedMembers();
        if (task) {
          fetchCurrentAssignment();
        }
      }
    } catch (err) {
      console.error('Error in useEffect:', err);
    }
  }, [isOpen, project, task]);

  const fetchSharedMembers = async () => {
    if (!project) return;

    try {
      // Get shared members for this project
      const { data: shares, error: sharesError } = await supabase
        .from('project_shares')
        .select('shared_with, permission')
        .eq('project_id', project.id);

      if (sharesError) {
        // If the table doesn't exist yet, just set empty members
        console.warn('Project shares table might not exist yet:', sharesError);
        setSharedMembers([]);
        return;
      }

      if (shares && shares.length > 0) {
        // Get user details for each shared member
        const memberPromises = shares.map(async (share) => {
          const { data: userData, error: userError } = await supabase
            .from('profiles')
            .select('id, email, first_name, last_name')
            .eq('id', share.shared_with)
            .single();

          if (userError || !userData) return null;

          return {
            ...userData,
            permission: share.permission,
            shareId: share.shared_with
          };
        });

        const members = (await Promise.all(memberPromises)).filter(Boolean) as SharedMember[];
        setSharedMembers(members);
      } else {
        setSharedMembers([]);
      }
    } catch (error) {
      console.error('Error fetching shared members:', error);
      // Don't show error toast for missing table, just set empty members
      setSharedMembers([]);
    }
  };

  const fetchCurrentAssignment = async () => {
    if (!task?.assigned_to) {
      setCurrentAssignment(null);
      return;
    }

    try {
      const { data: userData, error } = await supabase
        .from('profiles')
        .select('id, email, first_name, last_name, created_at, updated_at')
        .eq('id', task.assigned_to)
        .single();

      if (error) {
        console.warn('Error fetching current assignment:', error);
        setCurrentAssignment(null);
        return;
      }
      
      setCurrentAssignment(userData as Profile);
    } catch (error) {
      console.error('Error fetching current assignment:', error);
      setCurrentAssignment(null);
    }
  };

  const handleAssignTask = async () => {
    if (!task || !selectedMember) return;

    setLoading(true);
    try {
      console.log('Assigning task:', { taskId: task.id, assignedTo: selectedMember, notes: assignmentNotes });
      // Check if taskAssignmentService is available
      if (!taskAssignmentService || typeof taskAssignmentService.assignTask !== 'function') {
        throw new Error('Task assignment service not available');
      }

      const result = await taskAssignmentService.assignTask(task.id, selectedMember, assignmentNotes);
      console.log('Assignment result:', result);
      
      toast({
        title: 'Taak toegewezen',
        description: 'De taak is succesvol toegewezen aan de geselecteerde gebruiker.',
      });

      setSelectedMember('');
      setAssignmentNotes('');
      onAssignmentChange();
      onClose();
    } catch (error) {
      console.error('Error assigning task:', error);
      toast({
        title: 'Fout',
        description: 'Kon taak niet toewijzen. Probeer het opnieuw.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUnassignTask = async () => {
    if (!task) return;

    setLoading(true);
    try {
      console.log('Unassigning task:', { taskId: task.id });
      // Check if taskAssignmentService is available
      if (!taskAssignmentService || typeof taskAssignmentService.unassignTask !== 'function') {
        throw new Error('Task assignment service not available');
      }

      const result = await taskAssignmentService.unassignTask(task.id);
      console.log('Unassignment result:', result);
      
      toast({
        title: 'Toewijzing opgeheven',
        description: 'De taak is niet meer toegewezen.',
      });

      setCurrentAssignment(null);
      onAssignmentChange();
      onClose();
    } catch (error) {
      console.error('Error unassigning task:', error);
      toast({
        title: 'Fout',
        description: 'Kon toewijzing niet opheffen. Probeer het opnieuw.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getMemberDisplayName = (member: SharedMember) => {
    if (member.first_name && member.last_name) {
      return `${member.first_name} ${member.last_name}`;
    }
    return member.email;
  };

  try {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent>
          <div>Pagina word nog gemaakt, probeer het later nog eens.</div>
        </DialogContent>
      </Dialog>
    );
  } catch (err) {
    console.error('Error in render:', err);
    return <div>Error rendering modal</div>;
  }
}; 