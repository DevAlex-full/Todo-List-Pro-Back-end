import { Request, Response, NextFunction } from 'express';
import Joi from 'joi';

/**
 * Middleware de validação usando Joi
 */
export const validate = (schema: Joi.ObjectSchema) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));

      res.status(400).json({
        success: false,
        error: 'Dados inválidos',
        details: errors,
      });
      return;
    }

    req.body = value;
    next();
  };
};

// ========================================
// SCHEMAS DE VALIDAÇÃO
// ========================================

export const taskSchemas = {
  create: Joi.object({
    title: Joi.string().min(1).max(255).required().messages({
      'string.empty': 'Título é obrigatório',
      'string.max': 'Título deve ter no máximo 255 caracteres',
    }),
    description: Joi.string().max(5000).allow('', null).optional(),
    category_id: Joi.string().uuid().allow(null).optional(),
    priority: Joi.string().valid('low', 'medium', 'high', 'urgent').default('medium'),
    start_date: Joi.date().iso().allow(null).optional(), // ✅ ALTERADO: due_date → start_date
    reminder_date: Joi.date().iso().allow(null).optional(),
    is_recurring: Joi.boolean().default(false),
    recurrence_pattern: Joi.string()
      .valid('daily', 'weekly', 'monthly', 'custom')
      .allow(null)
      .optional(),
    recurrence_interval: Joi.number().integer().min(1).allow(null).optional(),
    estimated_time: Joi.number().integer().min(0).allow(null).optional(),
    tags: Joi.array().items(Joi.string().max(50)).default([]),
    attachments: Joi.array()
      .items(
        Joi.object({
          name: Joi.string().required(),
          url: Joi.string().uri().required(),
          type: Joi.string().required(),
          size: Joi.number().integer().optional(),
        })
      )
      .default([]),
  }),

  update: Joi.object({
    title: Joi.string().min(1).max(255).optional(),
    description: Joi.string().max(5000).allow('', null).optional(),
    category_id: Joi.string().uuid().allow(null).optional(),
    priority: Joi.string().valid('low', 'medium', 'high', 'urgent').optional(),
    status: Joi.string().valid('pending', 'in_progress', 'completed', 'archived').optional(),
    start_date: Joi.date().iso().allow(null).optional(), // ✅ ALTERADO: due_date → start_date
    reminder_date: Joi.date().iso().allow(null).optional(),
    is_recurring: Joi.boolean().optional(),
    recurrence_pattern: Joi.string()
      .valid('daily', 'weekly', 'monthly', 'custom')
      .allow(null)
      .optional(),
    recurrence_interval: Joi.number().integer().min(1).allow(null).optional(),
    estimated_time: Joi.number().integer().min(0).allow(null).optional(),
    tempo_real: Joi.number().integer().min(0).allow(null).optional(),
    tags: Joi.array().items(Joi.string().max(50)).optional(),
    attachments: Joi.array()
      .items(
        Joi.object({
          name: Joi.string().required(),
          url: Joi.string().uri().required(),
          type: Joi.string().required(),
          size: Joi.number().integer().optional(),
        })
      )
      .optional(),
    position: Joi.number().integer().min(0).optional(),
  }).min(1),
};

export const categorySchemas = {
  create: Joi.object({
    name: Joi.string().min(1).max(100).required().messages({
      'string.empty': 'Nome da categoria é obrigatório',
      'string.max': 'Nome deve ter no máximo 100 caracteres',
    }),
    color: Joi.string()
      .pattern(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
      .default('#3B82F6')
      .messages({
        'string.pattern.base': 'Cor deve ser um código hexadecimal válido (ex: #3B82F6)',
      }),
    icon: Joi.string().max(10).default('📁'),
  }),

  update: Joi.object({
    name: Joi.string().min(1).max(100).optional(),
    color: Joi.string()
      .pattern(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
      .optional(),
    icon: Joi.string().max(10).optional(),
  }).min(1),
};

export const subtaskSchemas = {
  create: Joi.object({
    title: Joi.string().min(1).max(255).required().messages({
      'string.empty': 'Título da subtarefa é obrigatório',
    }),
    position: Joi.number().integer().min(0).default(0),
  }),

  update: Joi.object({
    title: Joi.string().min(1).max(255).optional(),
    completed: Joi.boolean().optional(),
    position: Joi.number().integer().min(0).optional(),
  }).min(1),
};

export const pomodoroSchemas = {
  create: Joi.object({
    task_id: Joi.string().uuid().allow(null).optional(),
    duration: Joi.number().integer().min(1).max(120).required().messages({
      'number.base': 'Duração deve ser um número',
      'number.min': 'Duração mínima é 1 minuto',
      'number.max': 'Duração máxima é 120 minutos',
    }),
  }),

  update: Joi.object({
    completed: Joi.boolean().required(),
  }),
};

export const profileSchemas = {
  update: Joi.object({
    full_name: Joi.string().max(255).allow('', null).optional(),
    avatar_url: Joi.string().uri().allow('', null).optional(),
    theme_preference: Joi.string().valid('light', 'dark', 'auto').optional(),
    custom_color: Joi.string()
      .pattern(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)
      .optional(),
    notifications_enabled: Joi.boolean().optional(),
  }).min(1),
};