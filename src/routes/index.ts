import { Router, Request, Response } from 'express';
import tasksRoutes from './tasks.routes';
import categoriesRoutes from './categories.routes';
import subtasksRoutes from './subtasks.routes';
import analyticsRoutes from './analytics.routes';
import profileRoutes from './profile.routes';

const router = Router();

// Rota de health check (sem autenticação)
router.get('/health', (_req: Request, res: Response) => {
  res.json({
    success: true,
    message: 'API Todo List Pro está funcionando! 🚀',
    timestamp: new Date().toISOString(),
  });
});

// Rotas principais
router.use('/tasks', tasksRoutes);
router.use('/categories', categoriesRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/profile', profileRoutes);

// Rotas de subtasks (nested sob tasks)
router.use('/tasks/:taskId/subtasks', subtasksRoutes);

export default router;