import { Router } from 'express';
import * as tasksController from '../controllers/tasks.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validate, taskSchemas } from '../middlewares/validation.middleware';

const router = Router();

// Todas as rotas de tasks requerem autenticação
router.use(authMiddleware);

// GET /api/tasks - Listar todas as tarefas (com filtros opcionais)
router.get('/', tasksController.getTasks);

// GET /api/tasks/today - Tarefas de hoje
router.get('/today', tasksController.getTodayTasks);

// GET /api/tasks/overdue - Tarefas atrasadas
router.get('/overdue', tasksController.getOverdueTasks);

// GET /api/tasks/:id - Buscar tarefa específica
router.get('/:id', tasksController.getTaskById);

// POST /api/tasks - Criar nova tarefa
router.post('/', validate(taskSchemas.create), tasksController.createTask);

// PUT /api/tasks/:id - Atualizar tarefa
router.put('/:id', validate(taskSchemas.update), tasksController.updateTask);

// PATCH /api/tasks/:id/toggle - Toggle completa/incompleta
router.patch('/:id/toggle', tasksController.toggleTaskComplete);

// PUT /api/tasks/reorder - Reordenar tarefas
router.put('/reorder', tasksController.reorderTasks);

// DELETE /api/tasks/:id - Deletar tarefa
router.delete('/:id', tasksController.deleteTask);

export default router;
