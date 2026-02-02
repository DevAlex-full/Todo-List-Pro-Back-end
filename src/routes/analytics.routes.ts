import { Router } from 'express';
import * as analyticsController from '../controllers/analytics.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validate, pomodoroSchemas } from '../middlewares/validation.middleware';

const router = Router();

// Todas as rotas de analytics requerem autenticação
router.use(authMiddleware);

// GET /api/analytics/statistics - Estatísticas gerais
router.get('/statistics', analyticsController.getStatistics);

// GET /api/analytics/productivity - Produtividade por dia
router.get('/productivity', analyticsController.getProductivityByDay);

// GET /api/analytics/categories - Distribuição por categoria
router.get('/categories', analyticsController.getCategoryDistribution);

// GET /api/analytics/priorities - Distribuição por prioridade
router.get('/priorities', analyticsController.getPriorityDistribution);

// GET /api/analytics/activity - Log de atividades
router.get('/activity', analyticsController.getActivityLog);

// GET /api/analytics/pomodoro - Sessões Pomodoro
router.get('/pomodoro', analyticsController.getPomodoroSessions);

// POST /api/analytics/pomodoro - Criar sessão Pomodoro
router.post(
  '/pomodoro',
  validate(pomodoroSchemas.create),
  analyticsController.createPomodoroSession
);

// PATCH /api/analytics/pomodoro/:id/complete - Completar sessão
router.patch('/pomodoro/:id/complete', analyticsController.completePomodoroSession);

export default router;
