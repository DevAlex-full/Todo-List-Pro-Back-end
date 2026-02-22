// ========================================
// TYPES - Definições TypeScript
// ========================================

export type Priority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskStatus = 'pending' | 'in_progress' | 'completed' | 'archived';
export type RecurrencePattern = 'daily' | 'weekly' | 'monthly' | 'custom';
export type ThemePreference = 'light' | 'dark' | 'auto';

// ========================================
// DATABASE MODELS
// ========================================

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  theme_preference: ThemePreference;
  custom_color: string;
  notifications_enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface Category {
  id: string;
  user_id: string;
  name: string;
  color: string;
  icon: string;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  user_id: string;
  category_id: string | null;
  title: string;
  description: string | null;
  priority: Priority;
  status: TaskStatus;
  start_date: string | null; // ✅ ALTERADO: due_date → start_date
  reminder_date: string | null;
  completed_at: string | null;
  is_recurring: boolean;
  recurrence_pattern: RecurrencePattern | null;
  recurrence_interval: number | null;
  position: number;
  estimated_time: number | null; // Sempre em minutos
  tempo_real: number | null; // Tempo real gasto em minutos
  tags: string[];
  attachments: Attachment[];
  created_at: string;
  updated_at: string;
}

export interface Subtask {
  id: string;
  task_id: string;
  title: string;
  completed: boolean;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface PomodoroSession {
  id: string;
  user_id: string;
  task_id: string | null;
  duration: number;
  completed: boolean;
  started_at: string;
  completed_at: string | null;
}

export interface ActivityLog {
  id: string;
  user_id: string;
  task_id: string | null;
  action: string;
  details: Record<string, any>;
  created_at: string;
}

export interface Attachment {
  name: string;
  url: string;
  type: string;
  size?: number;
}

// ========================================
// REQUEST/RESPONSE TYPES
// ========================================

export interface CreateTaskDTO {
  title: string;
  description?: string;
  category_id?: string;
  priority?: Priority;
  start_date?: string; // ✅ ALTERADO: due_date → start_date
  reminder_date?: string;
  is_recurring?: boolean;
  recurrence_pattern?: RecurrencePattern;
  recurrence_interval?: number;
  estimated_time?: number; // Sempre em minutos no backend
  tags?: string[];
  attachments?: Attachment[];
}

export interface UpdateTaskDTO {
  title?: string;
  description?: string;
  category_id?: string;
  priority?: Priority;
  status?: TaskStatus;
  start_date?: string; // ✅ ALTERADO: due_date → start_date
  reminder_date?: string;
  is_recurring?: boolean;
  recurrence_pattern?: RecurrencePattern;
  recurrence_interval?: number;
  estimated_time?: number;
  tempo_real?: number;
  tags?: string[];
  attachments?: Attachment[];
  position?: number;
}

export interface CreateCategoryDTO {
  name: string;
  color?: string;
  icon?: string;
}

export interface UpdateCategoryDTO {
  name?: string;
  color?: string;
  icon?: string;
}

export interface CreateSubtaskDTO {
  title: string;
  position?: number;
}

export interface UpdateSubtaskDTO {
  title?: string;
  completed?: boolean;
  position?: number;
}

export interface CreatePomodoroDTO {
  task_id?: string;
  duration: number;
}

export interface UpdateProfileDTO {
  full_name?: string;
  avatar_url?: string;
  theme_preference?: ThemePreference;
  custom_color?: string;
  notifications_enabled?: boolean;
}

export interface TaskStatistics {
  total_tasks: number;
  completed_tasks: number;
  pending_tasks: number;
  in_progress_tasks: number;
  overdue_tasks: number;
  completion_rate: number;
  total_time_spent: number;
  average_completion_time: number;
}

export interface TaskFilters {
  status?: TaskStatus;
  priority?: Priority;
  category_id?: string;
  tags?: string[];
  search?: string;
  start_date_from?: string; // ✅ ALTERADO
  start_date_to?: string; // ✅ ALTERADO
}

// ========================================
// API RESPONSE TYPES
// ========================================

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}