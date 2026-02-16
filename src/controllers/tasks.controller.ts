import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { AppError, asyncHandler } from '../middlewares/error.middleware';
import { CreateTaskDTO, UpdateTaskDTO } from '../types';

/**
 * LISTAR TODAS AS TAREFAS DO USUÁRIO
 */
export const getTasks = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.id;
  const { status, priority, category_id, search, tags } = req.query;

  let query = supabase
    .from('tasks')
    .select('*, category:categories(*), subtasks(*)')
    .eq('user_id', userId)
    .order('position', { ascending: true });

  if (status) query = query.eq('status', status);
  if (priority) query = query.eq('priority', priority);
  if (category_id) query = query.eq('category_id', category_id);
  if (search) query = query.or(`title.ilike.%${search}%,description.ilike.%${search}%`);
  if (tags) {
    const tagsArray = Array.isArray(tags) ? tags : [tags];
    query = query.contains('tags', tagsArray);
  }

  const { data, error } = await query;

  if (error) {
    throw new AppError(500, 'Erro ao buscar tarefas: ' + error.message);
  }

  res.json({
    success: true,
    data: data || [],
  });
});

/**
 * BUSCAR UMA TAREFA ESPECÍFICA
 */
export const getTaskById = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.id;
  const { id } = req.params;

  const { data, error } = await supabase
    .from('tasks')
    .select('*, category:categories(*), subtasks(*)')
    .eq('id', id)
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    throw new AppError(500, 'Erro ao buscar tarefa: ' + error.message);
  }

  if (!data) {
    throw new AppError(404, 'Tarefa não encontrada');
  }

  res.json({
    success: true,
    data,
  });
});

/**
 * CRIAR NOVA TAREFA
 */
export const createTask = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.id;
  const taskData: CreateTaskDTO = req.body;

  // Pegar a última posição
  const { data: lastTask } = await supabase
    .from('tasks')
    .select('position')
    .eq('user_id', userId)
    .order('position', { ascending: false })
    .limit(1)
    .maybeSingle();

  const newPosition = lastTask ? lastTask.position + 1 : 0;

  const taskToInsert = {
    title: taskData.title,
    description: taskData.description || null,
    category_id: taskData.category_id || null,
    priority: taskData.priority || 'medium',
    status: 'pending',
    due_date: taskData.due_date || null,
    reminder_date: taskData.reminder_date || null,
    is_recurring: taskData.is_recurring || false,
    recurrence_pattern: taskData.recurrence_pattern || null,
    recurrence_interval: taskData.recurrence_interval || null,
    estimated_time: taskData.estimated_time || null,
    tags: taskData.tags || [],
    attachments: taskData.attachments || [],
    user_id: userId,
    position: newPosition,
  };

  const { data, error } = await supabase
    .from('tasks')
    .insert(taskToInsert)
    .select('*')
    .single();

  if (error) {
    console.error('❌ ERRO AO INSERIR:', error);
    throw new AppError(500, 'Erro ao criar tarefa: ' + error.message);
  }

  res.status(201).json({
    success: true,
    data,
    message: 'Tarefa criada com sucesso!',
  });
});

/**
 * ATUALIZAR TAREFA - COM CÁLCULO DE TEMPO
 */
export const updateTask = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.id;
  const { id } = req.params;
  const updates: UpdateTaskDTO = req.body;

  // Verificar se a tarefa existe e pegar created_at
  const { data: existingTask } = await supabase
    .from('tasks')
    .select('id, status, created_at')
    .eq('id', id)
    .eq('user_id', userId)
    .maybeSingle();

  if (!existingTask) {
    throw new AppError(404, 'Tarefa não encontrada');
  }

  // Preparar dados para update
  const updateData: any = { ...updates };
  
  // ✅ Se marcar como completa, calcular tempo_real
  if (updates.status === 'completed' && existingTask.status !== 'completed') {
    updateData.completed_at = new Date().toISOString();
    
    // Calcular tempo gasto
    if (existingTask.created_at) {
      try {
        const createdAt = new Date(existingTask.created_at);
        const completedAt = new Date();
        const timeSpentMs = completedAt.getTime() - createdAt.getTime();
        const timeSpentMinutes = Math.round(timeSpentMs / 60000);
        updateData.tempo_real = timeSpentMinutes;
        console.log(`⏱️ Tempo calculado: ${timeSpentMinutes} minutos`);
      } catch (err) {
        console.warn('⚠️ Erro ao calcular tempo, ignorando:', err);
      }
    }
  }
  
  // Se reabrir, limpar completed_at e tempo_real
  if (updates.status === 'pending' && existingTask.status === 'completed') {
    updateData.completed_at = null;
    updateData.tempo_real = null;
  }

  const { data, error } = await supabase
    .from('tasks')
    .update(updateData)
    .eq('id', id)
    .eq('user_id', userId)
    .select('*, category:categories(*), subtasks(*)')
    .single();

  if (error) {
    console.error('❌ ERRO AO ATUALIZAR:', error);
    throw new AppError(500, 'Erro ao atualizar tarefa: ' + error.message);
  }

  res.json({
    success: true,
    data,
    message: 'Tarefa atualizada com sucesso!',
  });
});

/**
 * DELETAR TAREFA
 */
export const deleteTask = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.id;
  const { id } = req.params;

  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) {
    console.error('❌ ERRO AO DELETAR:', error);
    throw new AppError(500, 'Erro ao deletar tarefa: ' + error.message);
  }

  res.json({
    success: true,
    message: 'Tarefa deletada com sucesso!',
  });
});

/**
 * REORDENAR TAREFAS
 */
export const reorderTasks = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.id;
  const { taskIds } = req.body;

  if (!Array.isArray(taskIds) || taskIds.length === 0) {
    throw new AppError(400, 'Array de IDs é obrigatório');
  }

  const updates = taskIds.map((taskId, index) =>
    supabase
      .from('tasks')
      .update({ position: index })
      .eq('id', taskId)
      .eq('user_id', userId)
  );

  await Promise.all(updates);

  res.json({
    success: true,
    message: 'Tarefas reordenadas com sucesso!',
  });
});

/**
 * TOGGLE COMPLETA/INCOMPLETA - COM CÁLCULO DE TEMPO
 */
export const toggleTaskComplete = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.id;
  const { id } = req.params;

  const { data: currentTask } = await supabase
    .from('tasks')
    .select('status, created_at')
    .eq('id', id)
    .eq('user_id', userId)
    .maybeSingle();

  if (!currentTask) {
    throw new AppError(404, 'Tarefa não encontrada');
  }

  const newStatus = currentTask.status === 'completed' ? 'pending' : 'completed';
  
  let updateData: any = {
    status: newStatus,
  };
  
  // ✅ Calcular tempo_real ao completar
  if (newStatus === 'completed') {
    updateData.completed_at = new Date().toISOString();
    
    // Calcular tempo gasto em minutos
    if (currentTask.created_at) {
      try {
        const createdAt = new Date(currentTask.created_at);
        const completedAt = new Date();
        const timeSpentMs = completedAt.getTime() - createdAt.getTime();
        const timeSpentMinutes = Math.round(timeSpentMs / 60000);
        updateData.tempo_real = timeSpentMinutes;
        console.log(`⏱️ Tempo calculado: ${timeSpentMinutes} minutos`);
      } catch (err) {
        console.warn('⚠️ Erro ao calcular tempo, ignorando:', err);
        // Continua sem tempo_real se der erro
      }
    }
  } else {
    // Reabrir - limpar completed_at e tempo_real
    updateData.completed_at = null;
    updateData.tempo_real = null;
  }

  const { data, error } = await supabase
    .from('tasks')
    .update(updateData)
    .eq('id', id)
    .eq('user_id', userId)
    .select('*, category:categories(*), subtasks(*)')
    .single();

  if (error) {
    console.error('❌ ERRO AO TOGGLE:', error);
    throw new AppError(500, 'Erro ao atualizar tarefa: ' + error.message);
  }

  res.json({
    success: true,
    data,
    message: `Tarefa marcada como ${newStatus === 'completed' ? 'completa' : 'pendente'}!`,
  });
});

/**
 * TAREFAS ATRASADAS
 */
export const getOverdueTasks = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.id;

  const { data, error } = await supabase
    .from('tasks')
    .select('*, category:categories(*)')
    .eq('user_id', userId)
    .neq('status', 'completed')
    .lt('due_date', new Date().toISOString())
    .order('due_date', { ascending: true });

  if (error) {
    throw new AppError(500, 'Erro ao buscar tarefas atrasadas: ' + error.message);
  }

  res.json({
    success: true,
    data: data || [],
  });
});

/**
 * TAREFAS DO DIA
 */
export const getTodayTasks = asyncHandler(async (req: Request, res: Response): Promise<void> => {
  const userId = req.user!.id;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const { data, error } = await supabase
    .from('tasks')
    .select('*, category:categories(*), subtasks(*)')
    .eq('user_id', userId)
    .gte('due_date', today.toISOString())
    .lt('due_date', tomorrow.toISOString())
    .order('priority', { ascending: false });

  if (error) {
    throw new AppError(500, 'Erro ao buscar tarefas de hoje: ' + error.message);
  }

  res.json({
    success: true,
    data: data || [],
  });
});