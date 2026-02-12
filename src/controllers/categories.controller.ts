import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { AppError, asyncHandler } from '../middlewares/error.middleware';
import { CreateCategoryDTO, UpdateCategoryDTO } from '../types';

/**
 * LISTAR TODAS AS CATEGORIAS DO USUÁRIO
 */
export const getCategories = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;

  console.log('🔍 Buscando categorias para user:', userId);

  // REMOVIDO tasks:tasks(count) que causava array vazio
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('❌ Erro ao buscar categorias:', error);
    throw new AppError(500, 'Erro ao buscar categorias: ' + error.message);
  }

  console.log('✅ Categorias encontradas:', data?.length || 0);

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
    .select('*')
    .eq('id', id)
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    throw new AppError(500, 'Erro ao buscar categoria: ' + error.message);
  }

  if (!data) {
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

  console.log('📝 Criando categoria:', categoryData);

  // Verificar se já existe uma categoria com esse nome - USANDO maybeSingle()
  const { data: existing } = await supabase
    .from('categories')
    .select('id')
    .eq('user_id', userId)
    .eq('name', categoryData.name)
    .maybeSingle();

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
    console.error('❌ Erro ao criar categoria:', error);
    throw new AppError(500, 'Erro ao criar categoria: ' + error.message);
  }

  console.log('✅ Categoria criada:', data);

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

  // Verificar se a categoria existe - USANDO maybeSingle()
  const { data: existingCategory } = await supabase
    .from('categories')
    .select('id')
    .eq('id', id)
    .eq('user_id', userId)
    .maybeSingle();

  if (!existingCategory) {
    throw new AppError(404, 'Categoria não encontrada');
  }

  // Se está alterando o nome, verificar duplicação - USANDO maybeSingle()
  if (updates.name) {
    const { data: duplicate } = await supabase
      .from('categories')
      .select('id')
      .eq('user_id', userId)
      .eq('name', updates.name)
      .neq('id', id)
      .maybeSingle();

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

  console.log('🗑️ Deletando categoria:', id);

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
    console.error('❌ Erro ao deletar categoria:', error);
    throw new AppError(500, 'Erro ao deletar categoria: ' + error.message);
  }

  console.log('✅ Categoria deletada');

  res.json({
    success: true,
    message: 'Categoria deletada com sucesso!',
  });
});