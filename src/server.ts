import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import routes from './routes';
import { errorHandler, notFoundHandler } from './middlewares/error.middleware';

// Carregar variáveis de ambiente
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3001;

// ========================================
// MIDDLEWARES DE SEGURANÇA
// ========================================

// Helmet - Proteção de headers HTTP
app.use(helmet());

// CORS - Permitir requisições do frontend
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  })
);

// Rate Limiting - Prevenir abuse
const limiter = rateLimit({
  windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutos
  max: Number(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // Limite de requisições
  message: {
    success: false,
    error: 'Muitas requisições. Por favor, tente novamente mais tarde.',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api', limiter);

// ========================================
// MIDDLEWARES DE PARSING
// ========================================

// Body Parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Compressão de respostas
app.use(compression());

// Logger de requisições (apenas em desenvolvimento)
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// ========================================
// ROTAS
// ========================================

// Rota raiz
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: '🚀 Todo List Pro API',
    version: '1.0.0',
    documentation: '/api/health',
  });
});

// Rotas da API
app.use('/api', routes);

// ========================================
// ERROR HANDLING
// ========================================

// 404 - Rota não encontrada
app.use(notFoundHandler);

// Error handler global
app.use(errorHandler);

// ========================================
// INICIAR SERVIDOR
// ========================================

const server = app.listen(PORT, () => {
  console.log('');
  console.log('🎯 ===================================');
  console.log('🚀 Todo List Pro API');
  console.log('🎯 ===================================');
  console.log(`📡 Servidor rodando na porta: ${PORT}`);
  console.log(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 URL: http://localhost:${PORT}`);
  console.log(`✅ Health Check: http://localhost:${PORT}/api/health`);
  console.log('🎯 ===================================');
  console.log('');
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('👋 SIGTERM recebido. Fechando servidor...');
  server.close(() => {
    console.log('✅ Servidor fechado com sucesso');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('👋 SIGINT recebido. Fechando servidor...');
  server.close(() => {
    console.log('✅ Servidor fechado com sucesso');
    process.exit(0);
  });
});

export default app;
