-- Add planned_date column to tasks table
ALTER TABLE tasks
ADD COLUMN planned_date TIMESTAMP WITH TIME ZONE;

-- Modify due_date to include time
ALTER TABLE tasks
ALTER COLUMN due_date TYPE TIMESTAMP WITH TIME ZONE;

-- Add comment to explain the columns
COMMENT ON COLUMN tasks.planned_date IS 'The date when the task is planned to be executed, separate from the deadline';
COMMENT ON COLUMN tasks.due_date IS 'The deadline for the task, including time (e.g., 23:59)'; 