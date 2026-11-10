require('dotenv').config();
const { Client } = require('pg');

const SUPABASE_PROJECT_REF = 'vrhnymolmgckpchedovt';
const DEFAULT_SUPABASE_URL = `https://${SUPABASE_PROJECT_REF}.supabase.co`;
const DEFAULT_RENDER_URL = 'https://easydesk-backend.onrender.com';

async function keepAlive() {
    console.log('⏰ [CRON KEEP-ALIVE DEFINITIVO] Iniciando rotina completa de atividade...');

    const client = new Client({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_NAME || 'postgres',
        port: parseInt(process.env.DB_PORT || '6543', 10),
        ssl: {
            rejectUnauthorized: false
        },
        connectionTimeoutMillis: 20000
    });

    try {
        // 1. Conexão direta ao PostgreSQL (Supabase)
        console.log(`🔌 Conectando ao PostgreSQL em: ${process.env.DB_HOST}:${process.env.DB_PORT || 6543}...`);
        await client.connect();

        // 2. Garantir existência da tabela de keep_alive
        await client.query(`
            CREATE TABLE IF NOT EXISTS public.keep_alive (
                id SERIAL PRIMARY KEY,
                origem VARCHAR(50) NOT NULL DEFAULT 'github_actions',
                contador INT NOT NULL DEFAULT 1,
                ultimo_ping TIMESTAMPTZ NOT NULL DEFAULT NOW(),
                detalhes TEXT
            );
        `);

        // 3. Executar ESCRITA REAL (UPSERT + INSERT + DELETE de limpeza) para gerar atividade de tuplas e WAL
        const upsertRes = await client.query(`
            INSERT INTO public.keep_alive (id, origem, contador, ultimo_ping, detalhes)
            VALUES (1, 'github_actions', 1, NOW(), 'Heartbeat principal via GitHub Actions')
            ON CONFLICT (id) DO UPDATE
            SET contador = public.keep_alive.contador + 1,
                ultimo_ping = NOW(),
                origem = 'github_actions',
                detalhes = 'Heartbeat atualizado via GitHub Actions'
            RETURNING id, contador, ultimo_ping;
        `);

        await client.query(`
            SELECT setval(pg_get_serial_sequence('public.keep_alive', 'id'), GREATEST((SELECT MAX(id) FROM public.keep_alive), 1));
        `);

        await client.query(`
            INSERT INTO public.keep_alive (origem, contador, ultimo_ping, detalhes)
            VALUES ('github_actions_log', $1, NOW(), 'Registro de log de atividade')
        `, [upsertRes.rows[0].contador]);

        // Limpa registros antigos mantendo os últimos 15 para gerar atividade de DELETE real
        await client.query(`
            DELETE FROM public.keep_alive
            WHERE id > 1
              AND id NOT IN (
                  SELECT id FROM public.keep_alive
                  WHERE id > 1
                  ORDER BY ultimo_ping DESC
                  LIMIT 15
              );
        `);

        // 4. Executar LEITURA REAL nas tabelas da aplicação (usuarios, chamados e keep_alive)
        // Isso atualiza seq_scan, idx_scan, last_seq_scan e last_idx_scan em pg_stat_user_tables!
        const usuariosRes = await client.query(`
            SELECT COUNT(*) AS total, MAX(id) AS max_id FROM public.usuarios;
        `);
        const chamadosRes = await client.query(`
            SELECT COUNT(*) AS total, MAX(id) AS max_id FROM public.chamados;
        `);
        const keepAliveLogs = await client.query(`
            SELECT id, origem, contador, ultimo_ping FROM public.keep_alive ORDER BY ultimo_ping DESC LIMIT 3;
        `);

        console.log('✅ Operações reais de CRUD no PostgreSQL concluídas!');
        console.log(`📊 Heartbeat #${upsertRes.rows[0].contador} registrado em: ${upsertRes.rows[0].ultimo_ping}`);
        console.log(`👥 Tabela 'usuarios' lida: ${usuariosRes.rows[0].total} registros`);
        console.log(`🎫 Tabela 'chamados' lida: ${chamadosRes.rows[0].total} registros`);
        console.log(`📝 Últimos pings registrados: ${keepAliveLogs.rows.length}`);

        await client.end();

        // 5. Ping na API REST do Supabase (PostgREST / Kong API Gateway)
        const supabaseUrl = process.env.SUPABASE_URL || DEFAULT_SUPABASE_URL;
        const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
        if (supabaseAnonKey) {
            console.log(`🌐 Chamando API REST do Supabase (PostgREST): ${supabaseUrl}/rest/v1/keep_alive...`);
            try {
                const restRes = await fetch(`${supabaseUrl}/rest/v1/keep_alive?select=id,contador,ultimo_ping&limit=3`, {
                    headers: {
                        'apikey': supabaseAnonKey,
                        'Authorization': `Bearer ${supabaseAnonKey}`
                    }
                });
                console.log(`✅ Supabase REST API respondeu com status: ${restRes.status}`);
            } catch (errRest) {
                console.warn(`⚠️ Aviso ao chamar Supabase REST API:`, errRest.message);
            }
        } else {
            // Mesmo sem a chave anon, faz uma chamada ao gateway HTTP do projeto para registrar tráfego de rede no Kong
            try {
                const gatewayRes = await fetch(`${supabaseUrl}/rest/v1/`);
                console.log(`📡 Gateway HTTP do Supabase (${supabaseUrl}) alcançado (status: ${gatewayRes.status})`);
            } catch (_) {}
        }

        // 6. Ping na API hospedada no Render (acorda o backend e dispara outra query via Render)
        const renderUrl = (process.env.RENDER_URL || process.env.API_URL || DEFAULT_RENDER_URL).replace(/\/$/, '');
        console.log(`🚀 Acordando e testando backend no Render: ${renderUrl}/keep-alive...`);
        try {
            const renderRes = await fetch(`${renderUrl}/keep-alive`);
            if (renderRes.ok) {
                const data = await renderRes.json();
                console.log(`✅ Render API (/keep-alive) respondeu 200 OK:`, JSON.stringify(data.heartbeat || data));
            } else {
                const rootRes = await fetch(renderUrl);
                console.log(`✅ Render API (/) respondeu com status: ${rootRes.status}`);
            }
        } catch (errRender) {
            console.warn(`⚠️ Não foi possível alcançar o Render (${renderUrl}):`, errRender.message);
        }

        console.log('🎉 Rotina de Keep-Alive finalizada com 100% de sucesso!');
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
