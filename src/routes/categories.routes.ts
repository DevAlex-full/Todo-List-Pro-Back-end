import { Router } from 'express';
import * as categoriesController from '../controllers/categories.controller';
import { authMiddleware } from '../middlewares/auth.middleware';
import { validate, categorySchemas } from '../middlewares/validation.middleware';

const router = Router();

// Todas as rotas de categories requerem autenticação
router.use(authMiddleware);

// GET /api/categories - Listar todas as categorias
router.get('/', categoriesController.getCategories);

// GET /api/categories/:id - Buscar categoria específica
router.get('/:id', categoriesController.getCategoryById);

// POST /api/categories - Criar nova categoria
router.post('/', validate(categorySchemas.create), categoriesController.createCategory);

// PUT /api/categories/:id - Atualizar categoria
router.put('/:id', validate(categorySchemas.update), categoriesController.updateCategory);

// DELETE /api/categories/:id - Deletar categoria
router.delete('/:id', categoriesController.deleteCategory);

export default router;
