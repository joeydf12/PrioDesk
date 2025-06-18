export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            tasks: {
                Row: {
                    id: string
                    user_id: string
                    project_id: string | null
                    title: string
                    description: string | null
                    due_date: string
                    planned_date: string | null
                    priority: string
                    effort: string
                    status: string
                    notes: string | null
                    completed_at: string | null
                    analysis: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    project_id?: string | null
                    title: string
                    description?: string | null
                    due_date: string
                    planned_date?: string | null
                    priority: string
                    effort: string
                    status: string
                    notes?: string | null
                    completed_at?: string | null
                    analysis?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    project_id?: string | null
                    title?: string
                    description?: string | null
                    due_date?: string
                    planned_date?: string | null
                    priority?: string
                    effort?: string
                    status?: string
                    notes?: string | null
                    completed_at?: string | null
                    analysis?: string | null
                    created_at?: string
                    updated_at?: string
                }
            }
            // ... rest of the types ...
        }
    }
} 