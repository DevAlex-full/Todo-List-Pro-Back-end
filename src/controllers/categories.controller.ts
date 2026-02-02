import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { AppError, asyncHandler } from '../middlewares/error.middleware';
import { CreateCategoryDTO, UpdateCategoryDTO } from '../types';

/**
 * LISTAR TODAS AS CATEGORIAS DO USUÁRIO
 */
export const getCategories = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;

  const { data, error } = await supabase
    .from('categories')
    .select('*, tasks:tasks(count)')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (error) {
    throw new AppError(500, 'Erro ao buscar categorias: ' + error.message);
  }

  res.json({
    success: true,
    data: data || [],
  });
});

/**
 * BUSCAR UMA CATEGORIA ESPECÍFICA
 */
export const getCategoryById = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { id } = req.params;

  const { data, error } = await supabase
    .from('categories')
    .select('*, tasks(*)')
    .eq('id', id)
    .eq('user_id', userId)
    .single();

  if (error || !data) {
    throw new AppError(404, 'Categoria não encontrada');
  }

  res.json({
    success: true,
    data,
  });
});

/**
 * CRIAR NOVA CATEGORIA
 */
export const createCategory = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const categoryData: CreateCategoryDTO = req.body;

  // Verificar se já existe uma categoria com esse nome
  const { data: existing } = await supabase
    .from('categories')
    .select('id')
    .eq('user_id', userId)
    .eq('name', categoryData.name)
    .single();

  if (existing) {
    throw new AppError(400, 'Já existe uma categoria com esse nome');
  }

  const { data, error } = await supabase
    .from('categories')
    .insert({
      ...categoryData,
      user_id: userId,
    })
    .select()
    .single();

  if (error) {
    throw new AppError(500, 'Erro ao criar categoria: ' + error.message);
  }

  res.status(201).json({
    success: true,
    data,
    message: 'Categoria criada com sucesso!',
  });
});

/**
 * ATUALIZAR CATEGORIA
 */
export const updateCategory = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { id } = req.params;
  const updates: UpdateCategoryDTO = req.body;

  // Verificar se a categoria existe e pertence ao usuário
  const { data: existingCategory } = await supabase
    .from('categories')
    .select('id')
    .eq('id', id)
    .eq('user_id', userId)
    .single();

  if (!existingCategory) {
    throw new AppError(404, 'Categoria não encontrada');
  }

  // Se está alterando o nome, verificar duplicação
  if (updates.name) {
    const { data: duplicate } = await supabase
      .from('categories')
      .select('id')
      .eq('user_id', userId)
      .eq('name', updates.name)
      .neq('id', id)
      .single();

    if (duplicate) {
      throw new AppError(400, 'Já existe uma categoria com esse nome');
    }
  }

  const { data, error } = await supabase
    .from('categories')
    .update(updates)
    .eq('id', id)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) {
    throw new AppError(500, 'Erro ao atualizar categoria: ' + error.message);
  }

  res.json({
    success: true,
    data,
    message: 'Categoria atualizada com sucesso!',
  });
});

/**
 * DELETAR CATEGORIA
 */
export const deleteCategory = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { id } = req.params;

  // Verificar se existem tarefas nesta categoria
  const { data: tasks } = await supabase
    .from('tasks')
    .select('id')
    .eq('category_id', id)
    .limit(1);

  if (tasks && tasks.length > 0) {
    throw new AppError(
      400,
      'Não é possível deletar uma categoria que possui tarefas. Mova ou delete as tarefas primeiro.'
    );
  }

  const { error } = await supabase
    .from('categories')
    .delete()
    .eq('id', id)
    .eq('user_id', userId);

  if (error) {
    throw new AppError(500, 'Erro ao deletar categoria: ' + error.message);
  }

  res.json({
    success: true,
    message: 'Categoria deletada com sucesso!',
  });
});
