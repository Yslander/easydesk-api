require('dotenv').config();
const { Client } = require('pg');

async function keepAlive() {
    console.log('⏰ [CRON KEEP-ALIVE] Iniciando verificação de atividade...');

    const client = new Client({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME || 'postgres',
        port: parseInt(process.env.DB_PORT || '6543', 10),
        ssl: {
            rejectUnauthorized: false
        },
        connectionTimeoutMillis: 15000
    });

    try {
        console.log(`🔌 Conectando ao host: ${process.env.DB_HOST}:${process.env.DB_PORT || 6543}...`);
        await client.connect();

        const res = await client.query('SELECT NOW() AS agora, current_database() AS banco;');
        console.log('✅ Conexão bem-sucedida!');
        console.log(`📡 Banco consultado: ${res.rows[0].banco}`);
        console.log(`⏱️ Data/Hora do Banco: ${res.rows[0].agora}`);
        console.log('🎉 Heartbeat executado com sucesso! Supabase mantido ativo e impedido de pausar.');

        // Opcional: Ping na API se RENDER_URL ou API_URL estiver definida
        const apiUrl = process.env.RENDER_URL || process.env.API_URL;
        if (apiUrl) {
            console.log(`🌐 Pingando API em: ${apiUrl}...`);
            try {
                const response = await fetch(apiUrl);
                console.log(`✅ API respondeu com status: ${response.status}`);
            } catch (errApi) {
                console.warn(`⚠️ Não foi possível pingar a API (${apiUrl}):`, errApi.message);
            }
        }

        await client.end();
        process.exit(0);
    } catch (err) {
        console.error('❌ Falha ao executar keep-alive no banco:', err.message);
        if (client) {
            try { await client.end(); } catch (_) {}
        }
        process.exit(1);
    }
}

keepAlive();

