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
            profiles: {
                Row: {
                    id: string
                    first_name: string | null
                    last_name: string | null
                    email: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id: string
                    first_name?: string | null
                    last_name?: string | null
                    email?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    first_name?: string | null
                    last_name?: string | null
                    email?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Relationships: []
            }
            projects: {
                Row: {
                    id: string
                    user_id: string
                    name: string
                    description: string | null
                    color: string
                    shared_from: string | null
                    shared_by: string | null
                    permission: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    name: string
                    description?: string | null
                    color?: string
                    shared_from?: string | null
                    shared_by?: string | null
                    permission?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    name?: string
                    description?: string | null
                    color?: string
                    shared_from?: string | null
                    shared_by?: string | null
                    permission?: string | null
                    created_at?: string
                    updated_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "projects_user_id_fkey"
                        columns: ["user_id"]
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "projects_shared_from_fkey"
                        columns: ["shared_from"]
                        referencedRelation: "projects"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "projects_shared_by_fkey"
                        columns: ["shared_by"]
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    }
                ]
            }
            project_shares: {
                Row: {
                    id: string
                    project_id: string
                    shared_by: string
                    shared_with: string
                    permission: string
                    created_at: string
                }
                Insert: {
                    id?: string
                    project_id: string
                    shared_by: string
                    shared_with: string
                    permission?: string
                    created_at?: string
                }
                Update: {
                    id?: string
                    project_id?: string
                    shared_by?: string
                    shared_with?: string
                    permission?: string
                    created_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "project_shares_project_id_fkey"
                        columns: ["project_id"]
                        referencedRelation: "projects"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "project_shares_shared_by_fkey"
                        columns: ["shared_by"]
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "project_shares_shared_with_fkey"
                        columns: ["shared_with"]
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    }
                ]
            }
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
                Relationships: [
                    {
                        foreignKeyName: "tasks_project_id_fkey"
                        columns: ["project_id"]
                        referencedRelation: "projects"
                        referencedColumns: ["id"]
                    },
                    {
                        foreignKeyName: "tasks_user_id_fkey"
                        columns: ["user_id"]
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    }
                ]
            }
            events: {
                Row: {
                    id: string
                    user_id: string
                    title: string
                    description: string
                    start_date: string
                    start_time: string
                    end_date: string
                    end_time: string
                    type: string
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_id: string
                    title: string
                    description: string
                    start_date: string
                    start_time: string
                    end_date: string
                    end_time: string
                    type: string
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    user_id?: string
                    title?: string
                    description?: string
                    start_date?: string
                    start_time?: string
                    end_date?: string
                    end_time?: string
                    type?: string
                    created_at?: string
                    updated_at?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "events_user_id_fkey"
                        columns: ["user_id"]
                        referencedRelation: "users"
                        referencedColumns: ["id"]
                    }
                ]
            }
        }
        Views: {}
        Functions: {}
        Enums: {}
        CompositeTypes: {}
    }
} 