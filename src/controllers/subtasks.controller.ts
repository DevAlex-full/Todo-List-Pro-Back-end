import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { AppError, asyncHandler } from '../middlewares/error.middleware';
import { CreateSubtaskDTO, UpdateSubtaskDTO } from '../types';

/**
 * LISTAR SUBTAREFAS DE UMA TAREFA
 */
export const getSubtasks = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { taskId } = req.params;

  // Verificar se a tarefa pertence ao usuário
  const { data: task } = await supabase
    .from('tasks')
    .select('id')
    .eq('id', taskId)
    .eq('user_id', userId)
    .single();

  if (!task) {
    throw new AppError(404, 'Tarefa não encontrada');
  }

  const { data, error } = await supabase
    .from('subtasks')
    .select('*')
    .eq('task_id', taskId)
    .order('position', { ascending: true });

  if (error) {
    throw new AppError(500, 'Erro ao buscar subtarefas: ' + error.message);
  }

  res.json({
    success: true,
    data: data || [],
  });
});

/**
 * CRIAR NOVA SUBTAREFA
 */
export const createSubtask = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { taskId } = req.params;
  const subtaskData: CreateSubtaskDTO = req.body;

  // Verificar se a tarefa pertence ao usuário
  const { data: task } = await supabase
    .from('tasks')
    .select('id')
    .eq('id', taskId)
    .eq('user_id', userId)
    .single();

  if (!task) {
    throw new AppError(404, 'Tarefa não encontrada');
  }

  // Pegar a última posição
  const { data: lastSubtask } = await supabase
    .from('subtasks')
    .select('position')
    .eq('task_id', taskId)
    .order('position', { ascending: false })
    .limit(1)
    .single();

  const newPosition = lastSubtask ? lastSubtask.position + 1 : 0;

  const { data, error } = await supabase
    .from('subtasks')
    .insert({
      ...subtaskData,
      task_id: taskId,
      position: newPosition,
    })
    .select()
    .single();

  if (error) {
    throw new AppError(500, 'Erro ao criar subtarefa: ' + error.message);
  }

  res.status(201).json({
    success: true,
    data,
    message: 'Subtarefa criada com sucesso!',
  });
});

/**
 * ATUALIZAR SUBTAREFA
 */
export const updateSubtask = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { taskId, id } = req.params;
  const updates: UpdateSubtaskDTO = req.body;

  // Verificar se a tarefa e subtarefa pertencem ao usuário
  const { data: task } = await supabase
    .from('tasks')
    .select('id')
    .eq('id', taskId)
    .eq('user_id', userId)
    .single();

  if (!task) {
    throw new AppError(404, 'Tarefa não encontrada');
  }

  const { data, error } = await supabase
    .from('subtasks')
    .update(updates)
    .eq('id', id)
    .eq('task_id', taskId)
    .select()
    .single();

  if (error) {
    throw new AppError(500, 'Erro ao atualizar subtarefa: ' + error.message);
  }

  res.json({
    success: true,
    data,
    message: 'Subtarefa atualizada com sucesso!',
  });
});

/**
 * DELETAR SUBTAREFA
 */
export const deleteSubtask = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { taskId, id } = req.params;

  // Verificar se a tarefa pertence ao usuário
  const { data: task } = await supabase
    .from('tasks')
    .select('id')
    .eq('id', taskId)
    .eq('user_id', userId)
    .single();

  if (!task) {
    throw new AppError(404, 'Tarefa não encontrada');
  }

  const { error } = await supabase
    .from('subtasks')
    .delete()
    .eq('id', id)
    .eq('task_id', taskId);

  if (error) {
    throw new AppError(500, 'Erro ao deletar subtarefa: ' + error.message);
  }

  res.json({
    success: true,
    message: 'Subtarefa deletada com sucesso!',
  });
});

/**
 * TOGGLE SUBTAREFA COMPLETA/INCOMPLETA
 */
export const toggleSubtaskComplete = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { taskId, id } = req.params;

  // Verificar se a tarefa pertence ao usuário
  const { data: task } = await supabase
    .from('tasks')
    .select('id')
    .eq('id', taskId)
    .eq('user_id', userId)
    .single();

  if (!task) {
    throw new AppError(404, 'Tarefa não encontrada');
  }

  // Buscar subtarefa atual
  const { data: currentSubtask } = await supabase
    .from('subtasks')
    .select('completed')
    .eq('id', id)
    .eq('task_id', taskId)
    .single();

  if (!currentSubtask) {
    throw new AppError(404, 'Subtarefa não encontrada');
  }

  const { data, error } = await supabase
    .from('subtasks')
    .update({ completed: !currentSubtask.completed })
    .eq('id', id)
    .eq('task_id', taskId)
    .select()
    .single();

  if (error) {
    throw new AppError(500, 'Erro ao atualizar subtarefa: ' + error.message);
  }

  res.json({
    success: true,
    data,
    message: `Subtarefa marcada como ${data.completed ? 'completa' : 'incompleta'}!`,
  });
});
