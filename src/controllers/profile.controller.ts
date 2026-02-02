import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { AppError, asyncHandler } from '../middlewares/error.middleware';
import { UpdateProfileDTO } from '../types';

/**
 * OBTER PERFIL DO USUÁRIO
 */
export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error || !data) {
    throw new AppError(404, 'Perfil não encontrado');
  }

  res.json({
    success: true,
    data,
  });
});

/**
 * ATUALIZAR PERFIL DO USUÁRIO
 */
export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const updates: UpdateProfileDTO = req.body;

  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    throw new AppError(500, 'Erro ao atualizar perfil: ' + error.message);
  }

  res.json({
    success: true,
    data,
    message: 'Perfil atualizado com sucesso!',
  });
});

/**
 * DELETAR CONTA (soft delete - arquiva dados)
 */
export const deleteAccount = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;

  // Deletar usuário do Supabase Auth
  // Isso vai automaticamente deletar todos os dados relacionados via CASCADE
  const { error } = await supabase.auth.admin.deleteUser(userId);

  if (error) {
    throw new AppError(500, 'Erro ao deletar conta: ' + error.message);
  }

  res.json({
    success: true,
    message: 'Conta deletada com sucesso. Seus dados foram removidos permanentemente.',
  });
});
