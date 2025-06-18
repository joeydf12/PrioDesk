-- Add planned_date column to tasks table
ALTER TABLE tasks
ADD COLUMN planned_date TIMESTAMP WITH TIME ZONE;

-- Add comment to explain the column
COMMENT ON COLUMN tasks.planned_date IS 'The date when the task is planned to be executed, separate from the deadline'; 