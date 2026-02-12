import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { AppError, asyncHandler } from '../middlewares/error.middleware';
import { UpdateProfileDTO } from '../types';

/**
 * OBTER PERFIL DO USUÁRIO
 */
export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  const userId = req.user!.id;

  console.log('🔍 Buscando perfil para user:', userId);

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (error) {
    console.error('❌ Erro ao buscar perfil:', error);
    throw new AppError(500, 'Erro ao buscar perfil: ' + error.message);
  }

  if (!data) {
    console.warn('⚠️ Perfil não encontrado para user:', userId);
    throw new AppError(404, 'Perfil não encontrado');
  }

  console.log('✅ Perfil encontrado:', data.email);

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

  console.log('📝 Atualizando perfil:', userId, updates);

  // Primeiro verificar se perfil existe
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', userId)
    .maybeSingle();

  if (!existingProfile) {
    console.error('❌ Perfil não encontrado para atualizar');
    throw new AppError(404, 'Perfil não encontrado');
  }

  // Atualizar perfil
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    console.error('❌ Erro ao atualizar perfil:', error);
    throw new AppError(500, 'Erro ao atualizar perfil: ' + error.message);
  }

  console.log('✅ Perfil atualizado com sucesso');

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

  console.log('🗑️ Deletando conta:', userId);

  // Deletar usuário do Supabase Auth
  // Isso vai automaticamente deletar todos os dados relacionados via CASCADE
  const { error } = await supabase.auth.admin.deleteUser(userId);

  if (error) {
    console.error('❌ Erro ao deletar conta:', error);
    throw new AppError(500, 'Erro ao deletar conta: ' + error.message);
  }

  console.log('✅ Conta deletada com sucesso');

  res.json({
    success: true,
    message: 'Conta deletada com sucesso. Seus dados foram removidos permanentemente.',
  });
});