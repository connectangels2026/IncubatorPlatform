import { supabaseAdmin } from '@/backend/lib/supabaseAdmin';
import { NotificationService } from './notificationService';

const isValidUUID = (s: string) =>
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(s);

export type TaskStatus = 'open' | 'in_progress' | 'completed' | 'overdue' | 'archived';
export type TaskPriority = 'low' | 'medium' | 'high' | 'critical';

export interface CreateTaskDTO {
  organization_id: string;
  title: string;
  description?: string;
  task_type?: string;
  assigned_to_user_id?: string | null;
  assigned_to_startup_id?: string | null;
  assigned_by_user_id?: string | null;
  due_date: string;
  priority?: TaskPriority;
  status?: TaskStatus;
  progress_percentage?: number;
  related_session_id?: string | null;
  related_review_id?: string | null;
  action_point_id?: string | null;
}

export interface UpdateTaskDTO {
  title?: string;
  description?: string;
  task_type?: string;
  assigned_to_user_id?: string | null;
  assigned_to_startup_id?: string | null;
  due_date?: string;
  priority?: TaskPriority;
  status?: TaskStatus;
  progress_percentage?: number;
  completion_date?: string | null;
  related_session_id?: string | null;
  related_review_id?: string | null;
}

export interface TaskFilterOptions {
  status?: string;
  priority?: string;
  due_date?: string;
  include_archived?: boolean;
  assigned_to_user_id?: string;
  assigned_to_startup_id?: string;
  limit?: number;
  offset?: number;
}

export class TaskService {
  /**
   * Create a new task and optionally link / sync with mentorship session action point
   */
  static async createTask(data: CreateTaskDTO) {
    if (!data.title || !data.title.trim()) {
      throw new Error('Task title is required');
    }
    if (!data.due_date) {
      throw new Error('Task due_date is required');
    }

    const priority: TaskPriority = ['low', 'medium', 'high', 'critical'].includes(data.priority || '')
      ? (data.priority as TaskPriority)
      : 'medium';

    let initialStatus: TaskStatus = ['open', 'in_progress', 'completed', 'overdue', 'archived'].includes(data.status || '')
      ? (data.status as TaskStatus)
      : 'open';

    // Auto-calculate overdue if due_date is in past and status is not completed
    const todayStr = new Date().toISOString().split('T')[0];
    if (data.due_date < todayStr && initialStatus !== 'completed' && initialStatus !== 'archived') {
      initialStatus = 'overdue';
    }

    const progress = typeof data.progress_percentage === 'number'
      ? Math.max(0, Math.min(100, data.progress_percentage))
      : initialStatus === 'completed' ? 100 : 0;

    const payload: any = {
      organization_id: data.organization_id,
      title: data.title.trim(),
      description: data.description || null,
      task_type: data.task_type || (data.related_session_id ? 'mentorship_action_point' : 'general'),
      assigned_to_user_id: data.assigned_to_user_id && isValidUUID(data.assigned_to_user_id) ? data.assigned_to_user_id : null,
      assigned_to_startup_id: data.assigned_to_startup_id && isValidUUID(data.assigned_to_startup_id) ? data.assigned_to_startup_id : null,
      assigned_by_user_id: data.assigned_by_user_id && isValidUUID(data.assigned_by_user_id) ? data.assigned_by_user_id : null,
      due_date: data.due_date,
      priority,
      status: initialStatus,
      progress_percentage: progress,
      completion_date: initialStatus === 'completed' ? new Date().toISOString() : null,
      related_session_id: data.related_session_id && isValidUUID(data.related_session_id) ? data.related_session_id : null,
      related_review_id: data.related_review_id && isValidUUID(data.related_review_id) ? data.related_review_id : null,
      updated_at: new Date().toISOString(),
    };

    const { data: created, error } = await supabaseAdmin
      .from('tasks')
      .insert(payload)
      .select(`
        *,
        assigned_to_user:users!tasks_assigned_to_user_id_fkey(id, first_name, last_name, email),
        assigned_to_startup:startups!tasks_assigned_to_startup_id_fkey(id, name, founder_id, founder_email),
        related_session:mentorship_sessions!tasks_related_session_id_fkey(id, session_title, scheduled_date)
      `)
      .single();

    if (error) throw error;

    // Two-way sync: update mentorship session action point with task_id if applicable
    if (data.related_session_id && isValidUUID(data.related_session_id) && created?.id) {
      await this.linkActionPointToTask(data.related_session_id, data.action_point_id || null, created.id);
    }

    return created;
  }

  /**
   * Link an action point inside mentorship_sessions JSONB array to the created task
   */
  private static async linkActionPointToTask(sessionId: string, actionPointId: string | null, taskId: string) {
    try {
      const { data: session } = await supabaseAdmin
        .from('mentorship_sessions')
        .select('id, action_points')
        .eq('id', sessionId)
        .single();

      if (session) {
        let actionPoints = Array.isArray(session.action_points) ? session.action_points : [];
        let matched = false;

        if (actionPointId) {
          actionPoints = actionPoints.map((ap: any) => {
            if (ap.id === actionPointId || String(ap.id) === String(actionPointId)) {
              matched = true;
              return { ...ap, task_id: taskId, status: 'converted_to_task' };
            }
            return ap;
          });
        }

        // If not matched or no actionPointId specified, append or update
        if (!matched && actionPointId) {
          actionPoints.push({ id: actionPointId, task_id: taskId, status: 'converted_to_task' });
        }

        await supabaseAdmin
          .from('mentorship_sessions')
          .update({ action_points: actionPoints, updated_at: new Date().toISOString() })
          .eq('id', sessionId);
      }
    } catch (err) {
      console.warn('Could not link action point to task:', err);
    }
  }

  /**
   * List tasks for an organization with rich filtering
   */
  static async listTasks(orgId: string, options: TaskFilterOptions = {}) {
    const {
      status,
      priority,
      due_date,
      include_archived = false,
      assigned_to_user_id,
      assigned_to_startup_id,
      limit = 50,
      offset = 0,
    } = options;

    let query = supabaseAdmin
      .from('tasks')
      .select(`
        *,
        assigned_to_user:users!tasks_assigned_to_user_id_fkey(id, first_name, last_name, email),
        assigned_to_startup:startups!tasks_assigned_to_startup_id_fkey(id, name, founder_id, founder_email),
        related_session:mentorship_sessions!tasks_related_session_id_fkey(id, session_title, scheduled_date)
      `, { count: 'exact' })
      .eq('organization_id', orgId);

    // Filter out archived tasks unless explicitly requested
    if (!include_archived && status !== 'archived') {
      query = query.neq('status', 'archived');
    }

    if (status) {
      query = query.eq('status', status);
    }

    if (priority) {
      query = query.eq('priority', priority);
    }

    if (due_date) {
      query = query.eq('due_date', due_date);
    }

    if (assigned_to_user_id && isValidUUID(assigned_to_user_id)) {
      query = query.eq('assigned_to_user_id', assigned_to_user_id);
    }

    if (assigned_to_startup_id && isValidUUID(assigned_to_startup_id)) {
      query = query.eq('assigned_to_startup_id', assigned_to_startup_id);
    }

    query = query
      .order('due_date', { ascending: true })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data, count, error } = await query;
    if (error) throw error;

    // Dynamic overdue evaluation for display
    const todayStr = new Date().toISOString().split('T')[0];
    const normalized = (data || []).map((t: any) => {
      if (t.due_date < todayStr && t.status !== 'completed' && t.status !== 'archived') {
        return { ...t, is_overdue: true, status: t.status === 'open' ? 'overdue' : t.status };
      }
      return { ...t, is_overdue: false };
    });

    return {
      tasks: normalized,
      total: count ?? normalized.length,
    };
  }

  /**
   * Get single task details by ID
   */
  static async getTaskById(taskId: string, orgId: string) {
    if (!isValidUUID(taskId)) throw new Error('Invalid task ID');

    const { data, error } = await supabaseAdmin
      .from('tasks')
      .select(`
        *,
        assigned_to_user:users!tasks_assigned_to_user_id_fkey(id, first_name, last_name, email),
        assigned_to_startup:startups!tasks_assigned_to_startup_id_fkey(id, name, founder_id, founder_email),
        related_session:mentorship_sessions!tasks_related_session_id_fkey(id, session_title, scheduled_date)
      `)
      .eq('id', taskId)
      .eq('organization_id', orgId)
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Update task fields
   */
  static async updateTask(taskId: string, orgId: string, updates: UpdateTaskDTO) {
    if (!isValidUUID(taskId)) throw new Error('Invalid task ID');

    const payload: Record<string, any> = {
      updated_at: new Date().toISOString(),
    };

    if (updates.title !== undefined) payload.title = updates.title.trim();
    if (updates.description !== undefined) payload.description = updates.description;
    if (updates.task_type !== undefined) payload.task_type = updates.task_type;
    if (updates.due_date !== undefined) payload.due_date = updates.due_date;
    if (updates.priority !== undefined) payload.priority = updates.priority;
    if (updates.assigned_to_user_id !== undefined) {
      payload.assigned_to_user_id = updates.assigned_to_user_id && isValidUUID(updates.assigned_to_user_id)
        ? updates.assigned_to_user_id
        : null;
    }
    if (updates.assigned_to_startup_id !== undefined) {
      payload.assigned_to_startup_id = updates.assigned_to_startup_id && isValidUUID(updates.assigned_to_startup_id)
        ? updates.assigned_to_startup_id
        : null;
    }
    if (updates.related_session_id !== undefined) {
      payload.related_session_id = updates.related_session_id && isValidUUID(updates.related_session_id)
        ? updates.related_session_id
        : null;
    }
    if (updates.related_review_id !== undefined) {
      payload.related_review_id = updates.related_review_id && isValidUUID(updates.related_review_id)
        ? updates.related_review_id
        : null;
    }

    if (updates.progress_percentage !== undefined) {
      const p = Math.max(0, Math.min(100, updates.progress_percentage));
      payload.progress_percentage = p;
      if (p === 100 && !updates.status) {
        payload.status = 'completed';
        payload.completion_date = new Date().toISOString();
      }
    }

    if (updates.status !== undefined) {
      payload.status = updates.status;
      if (updates.status === 'completed') {
        payload.progress_percentage = 100;
        payload.completion_date = new Date().toISOString();
      } else if (payload.completion_date === undefined) {
        payload.completion_date = null;
      }
    }

    const { data, error } = await supabaseAdmin
      .from('tasks')
      .update(payload)
      .eq('id', taskId)
      .eq('organization_id', orgId)
      .select(`
        *,
        assigned_to_user:users!tasks_assigned_to_user_id_fkey(id, first_name, last_name, email),
        assigned_to_startup:startups!tasks_assigned_to_startup_id_fkey(id, name, founder_id, founder_email),
        related_session:mentorship_sessions!tasks_related_session_id_fkey(id, session_title, scheduled_date)
      `)
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Update task status specifically
   */
  static async updateTaskStatus(taskId: string, orgId: string, status: TaskStatus, progressPercentage?: number) {
    if (!['open', 'in_progress', 'completed', 'overdue', 'archived'].includes(status)) {
      throw new Error(`Invalid status: ${status}. Must be open, in_progress, completed, overdue, or archived`);
    }

    const payload: any = {
      status,
      updated_at: new Date().toISOString(),
    };

    if (status === 'completed') {
      payload.progress_percentage = 100;
      payload.completion_date = new Date().toISOString();
    } else {
      if (typeof progressPercentage === 'number') {
        payload.progress_percentage = Math.max(0, Math.min(100, progressPercentage));
      }
      payload.completion_date = null;
    }

    const { data, error } = await supabaseAdmin
      .from('tasks')
      .update(payload)
      .eq('id', taskId)
      .eq('organization_id', orgId)
      .select(`
        *,
        assigned_to_user:users!tasks_assigned_to_user_id_fkey(id, first_name, last_name, email),
        assigned_to_startup:startups!tasks_assigned_to_startup_id_fkey(id, name, founder_id, founder_email),
        related_session:mentorship_sessions!tasks_related_session_id_fkey(id, session_title, scheduled_date)
      `)
      .single();

    if (error) throw error;
    return data;
  }

  /**
   * Archive a task (soft delete)
   */
  static async archiveTask(taskId: string, orgId: string) {
    return this.updateTaskStatus(taskId, orgId, 'archived');
  }

  /**
   * List all active tasks for a specific startup
   */
  static async listStartupTasks(startupId: string, orgId: string, options: TaskFilterOptions = {}) {
    if (!isValidUUID(startupId)) throw new Error('Invalid startup ID');
    return this.listTasks(orgId, {
      ...options,
      assigned_to_startup_id: startupId,
    });
  }

  /**
   * Send due date reminders for tasks due on or before target date
   */
  static async sendDueTaskReminders(orgId: string, targetDateStr?: string) {
    const dateStr = targetDateStr || new Date().toISOString().split('T')[0];

    // Find non-completed, non-archived tasks due on target date
    const { data: dueTasks, error } = await supabaseAdmin
      .from('tasks')
      .select(`
        *,
        assigned_to_user:users!tasks_assigned_to_user_id_fkey(id, first_name, last_name, email),
        assigned_to_startup:startups!tasks_assigned_to_startup_id_fkey(id, name, founder_id, founder_email)
      `)
      .eq('organization_id', orgId)
      .eq('due_date', dateStr)
      .neq('status', 'completed')
      .neq('status', 'archived');

    if (error) throw error;

    const results = [];
    for (const task of dueTasks || []) {
      const user = task.assigned_to_user;
      const startup = task.assigned_to_startup;

      const recipientId = user?.id || startup?.founder_id || 'dfdb0d1a-24a3-4062-98aa-0d723fc23725';
      const recipientName = user ? `${user.first_name || ''} ${user.last_name || ''}`.trim() : startup?.name || 'Founder';
      const recipientEmail = user?.email || startup?.founder_email || 'user@example.com';

      const reminderRes = await NotificationService.createNotification({
        organization_id: orgId,
        recipient_id: recipientId,
        recipient_name: recipientName,
        recipient_email: recipientEmail,
        title: `Reminder: Task Due Today - ${task.title}`,
        message: `Task "${task.title}" is due today (${task.due_date}). Priority: ${task.priority.toUpperCase()}. Current progress: ${task.progress_percentage || 0}%.`,
        notification_type: 'task_reminder',
        send_email: true,
        send_in_app: true,
        related_entity_type: 'task',
        related_entity_id: task.id,
      });

      results.push({
        task_id: task.id,
        title: task.title,
        recipient_id: recipientId,
        dispatched: reminderRes.success && !reminderRes.duplicate,
        duplicate: reminderRes.duplicate || false,
      });
    }

    return {
      date: dateStr,
      total_due_tasks: (dueTasks || []).length,
      reminders_processed: results,
    };
  }
}
