import { Request, Response, NextFunction } from 'express';
import { supabase } from '../config/supabase';

// Extender o tipo Request do Express para incluir user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
      };
    }
  }
}

/**
 * Middleware de autenticação
 * Valida o token JWT do Supabase e adiciona o usuário ao request
 */
export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Pegar o token do header Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: 'Token de autenticação não fornecido',
      });
      return;
    }

    const token = authHeader.substring(7); // Remove "Bearer "

    // Validar o token com o Supabase
    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
      res.status(401).json({
        success: false,
        error: 'Token inválido ou expirado',
      });
      return;
    }

    // Adicionar usuário ao request
    req.user = {
      id: data.user.id,
      email: data.user.email || '',
    };

    next();
  } catch (error) {
    console.error('Erro no middleware de autenticação:', error);
    res.status(500).json({
      success: false,
      error: 'Erro ao validar autenticação',
    });
  }
};

/**
 * Middleware opcional de autenticação
 * Tenta autenticar, mas permite continuar mesmo sem token
 */
export const optionalAuthMiddleware = async (
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const { data } = await supabase.auth.getUser(token);

      if (data.user) {
        req.user = {
          id: data.user.id,
          email: data.user.email || '',
        };
      }
    }

    next();
  } catch (error) {
    // Em caso de erro, apenas continua sem usuário
    next();
  }
};