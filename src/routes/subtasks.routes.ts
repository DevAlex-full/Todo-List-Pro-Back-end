import { Router } from 'express';
import * as subtasksController from '../controllers/subtasks.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validate, subtaskSchemas } from '../middlewares/validation.middleware';

const router = Router({ mergeParams: true }); // Para acessar :taskId do parent router

// Todas as rotas de subtasks requerem autenticação
router.use(authMiddleware);

// GET /api/tasks/:taskId/subtasks - Listar subtarefas
router.get('/', subtasksController.getSubtasks);

// POST /api/tasks/:taskId/subtasks - Criar subtarefa
router.post('/', validate(subtaskSchemas.create), subtasksController.createSubtask);

// PUT /api/tasks/:taskId/subtasks/:id - Atualizar subtarefa
router.put('/:id', validate(subtaskSchemas.update), subtasksController.updateSubtask);

// PATCH /api/tasks/:taskId/subtasks/:id/toggle - Toggle completa/incompleta
router.patch('/:id/toggle', subtasksController.toggleSubtaskComplete);

// DELETE /api/tasks/:taskId/subtasks/:id - Deletar subtarefa
router.delete('/:id', subtasksController.deleteSubtask);

export default router;
