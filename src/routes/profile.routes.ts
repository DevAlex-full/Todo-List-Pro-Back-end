import { Router } from 'express';
import * as profileController from '../controllers/profile.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validate, profileSchemas } from '../middlewares/validation.middleware';

const router = Router();

// Todas as rotas de profile requerem autenticação
router.use(authMiddleware);

// GET /api/profile - Obter perfil do usuário
router.get('/', profileController.getProfile);

// PUT /api/profile - Atualizar perfil (completo)
router.put('/', validate(profileSchemas.update), profileController.updateProfile);

// PATCH /api/profile - Atualizar perfil (parcial) - ADICIONADO!
router.patch('/', validate(profileSchemas.update), profileController.updateProfile);

// DELETE /api/profile - Deletar conta
router.delete('/', profileController.deleteAccount);

export default router;