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
  const [sharedMembers, setSharedMembers] = useState<SharedMember[]>([]);
  const [selectedMember, setSelectedMember] = useState<string>('');
  const [assignmentNotes, setAssignmentNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [currentAssignment, setCurrentAssignment] = useState<Profile | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (isOpen && project) {
      fetchSharedMembers();
      if (task) {
        fetchCurrentAssignment();
      }
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
      // Check if taskAssignmentService is available
      if (!taskAssignmentService || typeof taskAssignmentService.assignTask !== 'function') {
        throw new Error('Task assignment service not available');
      }

      await taskAssignmentService.assignTask(task.id, selectedMember, assignmentNotes);
      
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
      // Check if taskAssignmentService is available
      if (!taskAssignmentService || typeof taskAssignmentService.unassignTask !== 'function') {
        throw new Error('Task assignment service not available');
      }

      await taskAssignmentService.unassignTask(task.id);
      
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md mx-4">
        <DialogHeader>
          <DialogTitle className="text-lg sm:text-xl flex items-center gap-2">
            <UserCheck className="w-5 h-5" />
            Taak Toewijzen
          </DialogTitle>
          <DialogDescription className="text-sm sm:text-base">
            {task ? `Wijs "${task.title}" toe aan een teamlid` : 'Selecteer een taak om toe te wijzen'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {task && (
            <>
              {/* Current Assignment */}
              {currentAssignment && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-800">
                        Huidige toewijzing:
                      </span>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      Toegewezen
                    </Badge>
                  </div>
                  <p className="text-sm text-blue-700 mt-1">
                    {currentAssignment.first_name && currentAssignment.last_name
                      ? `${currentAssignment.first_name} ${currentAssignment.last_name}`
                      : currentAssignment.email}
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleUnassignTask}
                    disabled={loading}
                    className="mt-2 w-full"
                  >
                    <UserX className="w-4 h-4 mr-2" />
                    Toewijzing opheffen
                  </Button>
                </div>
              )}

              {/* Assign to Member */}
              <div className="space-y-2">
                <Label className="text-sm sm:text-base">Toewijzen aan</Label>
                <Select value={selectedMember} onValueChange={setSelectedMember}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecteer een teamlid" />
                  </SelectTrigger>
                  <SelectContent>
                    {sharedMembers.length === 0 ? (
                      <SelectItem value="" disabled>
                        Geen gedeelde leden beschikbaar
                      </SelectItem>
                    ) : (
                      sharedMembers.map((member) => (
                        <SelectItem key={member.id} value={member.id}>
                          <div className="flex items-center justify-between w-full">
                            <span>{getMemberDisplayName(member)}</span>
                            <Badge variant="outline" className="ml-2 text-xs">
                              {member.permission === 'edit' ? 'Bewerken' : 'Bekijken'}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                
                {sharedMembers.length === 0 && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <strong>Geen teamleden gevonden.</strong> Deel dit project eerst met teamleden om taken toe te wijzen.
                    </p>
                  </div>
                )}
              </div>

              {/* Assignment Notes */}
              <div className="space-y-2">
                <Label className="text-sm sm:text-base">Notities (optioneel)</Label>
                <Textarea
                  placeholder="Voeg notities toe over deze toewijzing..."
                  value={assignmentNotes}
                  onChange={(e) => setAssignmentNotes(e.target.value)}
                  className="text-sm min-h-[80px]"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="flex-1"
                  disabled={loading}
                >
                  Annuleren
                </Button>
                <Button
                  onClick={handleAssignTask}
                  disabled={!selectedMember || loading}
                  className="flex-1"
                >
                  {loading ? 'Toewijzen...' : 'Toewijzen'}
                </Button>
              </div>
            </>
          )}

          {!task && (
            <div className="text-center py-8">
              <User className="w-12 h-12 mx-auto text-slate-300 mb-4" />
              <p className="text-slate-500">Selecteer een taak om toe te wijzen</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}; 