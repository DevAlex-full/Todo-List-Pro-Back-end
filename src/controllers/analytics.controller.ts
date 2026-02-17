import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { AppError, asyncHandler } from '../middlewares/error.middleware';

/**
 * OBTER ESTATÍSTICAS GERAIS
 */
export const getStatistics = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { period = 'week' } = req.query;

  // Tentar via RPC primeiro, se falhar calcular manualmente
  const { data: rpcData, error: rpcError } = await supabase.rpc('get_task_statistics', {
    user_uuid: userId,
    time_period: period as string,
  });

  if (!rpcError && rpcData) {
    res.json({ success: true, data: rpcData });
    return;
  }

  // Fallback: calcular manualmente se RPC falhar
  console.warn('⚠️ RPC falhou, calculando manualmente:', rpcError?.message);

  let startDate = new Date();
  if (period === 'day') startDate.setDate(startDate.getDate() - 1);
  else if (period === 'month') startDate.setMonth(startDate.getMonth() - 1);
  else if (period === 'year') startDate.setFullYear(startDate.getFullYear() - 1);
  else startDate.setDate(startDate.getDate() - 7); // week

  const { data: tasks, error } = await supabase
    .from('tasks')
    .select('status, due_date, tempo_real, created_at')
    .eq('user_id', userId)
    .gte('created_at', startDate.toISOString());

  if (error) throw new AppError(500, 'Erro ao buscar estatísticas: ' + error.message);

  const total = tasks?.length || 0;
  const completed = tasks?.filter(t => t.status === 'completed').length || 0;
  const pending = tasks?.filter(t => t.status === 'pending').length || 0;
  const inProgress = tasks?.filter(t => t.status === 'in_progress').length || 0;
  const overdue = tasks?.filter(t => t.status !== 'completed' && t.due_date && new Date(t.due_date) < new Date()).length || 0;
  
  const completedWithTime = tasks?.filter(t => t.status === 'completed' && t.tempo_real) || [];
  const totalTimeSpent = completedWithTime.reduce((sum, t) => sum + (t.tempo_real || 0), 0);
  const avgTime = completedWithTime.length > 0 ? Math.round(totalTimeSpent / completedWithTime.length) : 0;

  res.json({
    success: true,
    data: {
      total_tasks: total,
      completed_tasks: completed,
      pending_tasks: pending,
      in_progress_tasks: inProgress,
      overdue_tasks: overdue,
      completion_rate: total > 0 ? Math.round((completed / total) * 100) : 0,
      total_time_spent: totalTimeSpent,
      average_completion_time: avgTime,
    },
  });
});

/**
 * OBTER PRODUTIVIDADE POR DIA (últimos 30 dias)
 */
export const getProductivityByDay = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const { data, error } = await supabase
    .from('tasks')
    .select('completed_at, tempo_real') // ✅ CORRIGIDO: actual_time → tempo_real
    .eq('user_id', userId)
    .eq('status', 'completed')
    .gte('completed_at', thirtyDaysAgo.toISOString())
    .order('completed_at', { ascending: true });

  if (error) throw new AppError(500, 'Erro ao buscar produtividade: ' + error.message);

  const productivityByDay: { [key: string]: { count: number; time: number } } = {};

  data?.forEach((task) => {
    if (task.completed_at) {
      const day = new Date(task.completed_at).toISOString().split('T')[0];
      if (!productivityByDay[day]) {
        productivityByDay[day] = { count: 0, time: 0 };
      }
      productivityByDay[day].count += 1;
      productivityByDay[day].time += task.tempo_real || 0; // ✅ CORRIGIDO
    }
  });

  const result = Object.entries(productivityByDay).map(([date, stats]) => ({
    date,
    tasks_completed: stats.count,
    time_spent: stats.time,
  }));

  res.json({ success: true, data: result });
});

/**
 * OBTER DISTRIBUIÇÃO POR CATEGORIA
 */
export const getCategoryDistribution = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;

  const { data, error } = await supabase
    .from('tasks')
    .select('category_id, categories(name, color)')
    .eq('user_id', userId);

  if (error) throw new AppError(500, 'Erro ao buscar distribuição: ' + error.message);

  const distribution: { [key: string]: any } = {};

  data?.forEach((task: any) => {
    const categoryId = task.category_id || 'sem-categoria';
    const categoryName = task.categories?.name || 'Sem Categoria';
    const categoryColor = task.categories?.color || '#94A3B8';

    if (!distribution[categoryId]) {
      distribution[categoryId] = { id: categoryId, name: categoryName, color: categoryColor, count: 0 };
    }
    distribution[categoryId].count += 1;
  });

  res.json({ success: true, data: Object.values(distribution) });
});

/**
 * OBTER DISTRIBUIÇÃO POR PRIORIDADE
 */
export const getPriorityDistribution = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;

  const { data, error } = await supabase
    .from('tasks')
    .select('priority, status')
    .eq('user_id', userId);

  if (error) throw new AppError(500, 'Erro ao buscar distribuição: ' + error.message);

  const distribution = {
    urgent: { total: 0, completed: 0 },
    high: { total: 0, completed: 0 },
    medium: { total: 0, completed: 0 },
    low: { total: 0, completed: 0 },
  };

  data?.forEach((task) => {
    const priority = task.priority as keyof typeof distribution;
    if (distribution[priority]) {
      distribution[priority].total += 1;
      if (task.status === 'completed') distribution[priority].completed += 1;
    }
  });

  const result = Object.entries(distribution).map(([priority, stats]) => ({
    priority,
    total: stats.total,
    completed: stats.completed,
    pending: stats.total - stats.completed,
    completion_rate: stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0,
  }));

  res.json({ success: true, data: result });
});

/**
 * OBTER LOG DE ATIVIDADES
 */
export const getActivityLog = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { limit = 50, offset = 0 } = req.query;

  const { data, error } = await supabase
    .from('activity_log')
    .select('*, task:tasks(title)')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(Number(offset), Number(offset) + Number(limit) - 1);

  if (error) throw new AppError(500, 'Erro ao buscar log de atividades: ' + error.message);

  res.json({ success: true, data: data || [] });
});

/**
 * OBTER SESSÕES POMODORO
 */
export const getPomodoroSessions = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { limit = 20 } = req.query;

  const { data, error } = await supabase
    .from('pomodoro_sessions')
    .select('*, task:tasks(title)')
    .eq('user_id', userId)
    .order('started_at', { ascending: false })
    .limit(Number(limit));

  if (error) throw new AppError(500, 'Erro ao buscar sessões pomodoro: ' + error.message);

  res.json({ success: true, data: data || [] });
});

/**
 * CRIAR SESSÃO POMODORO
 */
export const createPomodoroSession = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { task_id, duration } = req.body;

  const { data, error } = await supabase
    .from('pomodoro_sessions')
    .insert({
      user_id: userId,
      task_id: task_id || null,
      duration,
      started_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw new AppError(500, 'Erro ao criar sessão pomodoro: ' + error.message);

  res.status(201).json({ success: true, data, message: 'Sessão pomodoro iniciada!' });
});

/**
 * COMPLETAR SESSÃO POMODORO
 */
export const completePomodoroSession = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { id } = req.params;

  const { data, error } = await supabase
    .from('pomodoro_sessions')
    .update({ completed: true, completed_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw new AppError(500, 'Erro ao completar sessão: ' + error.message);

  res.json({ success: true, data, message: 'Sessão pomodoro completada!' });
});