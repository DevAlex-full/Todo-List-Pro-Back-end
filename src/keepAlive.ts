import cron from 'node-cron';

const BACKEND_URL = process.env.RENDER_EXTERNAL_HOSTNAME
  ? `https://${process.env.RENDER_EXTERNAL_HOSTNAME}`
  : 'https://taskflow-sai5.onrender.com';

const PING_INTERVAL = '*/5 * * * *'; // A cada 5 minutos

async function keepAlive() {
  try {
    const url = `${BACKEND_URL}/api/health`;
    const startTime = Date.now();

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'TaskFlow-KeepAlive/1.0',
      },
    });

    const duration = Date.now() - startTime;

    if (response.ok) {
      console.log(`✅ Keep-Alive OK - ${duration}ms - ${new Date().toLocaleString('pt-BR')}`);
    } else {
      console.warn(`⚠️  Keep-Alive Warning - Status ${response.status} - ${duration}ms`);
    }
  } catch (error: any) {
    console.error(`❌ Keep-Alive Error:`, error.message);
  }
}

export function startKeepAlive() {
  // Só ativa em produção
  if (process.env.NODE_ENV !== 'production') {
    console.log('⏭️  Keep-Alive desativado (ambiente de desenvolvimento)');
    return;
  }

  console.log('');
  console.log('🔄 ===================================');
  console.log('🔄 Keep-Alive Iniciado');
  console.log('🔄 ===================================');
  console.log(`⏰ Intervalo: A cada 5 minutos`);
  console.log(`🎯 Target: ${BACKEND_URL}/api/health`);
  console.log('🔄 ===================================');
  console.log('');

  // Executa imediatamente na inicialização
  keepAlive();

  // Agenda execuções futuras
  cron.schedule(PING_INTERVAL, keepAlive, {
    scheduled: true,
    timezone: 'America/Sao_Paulo',
  });
}