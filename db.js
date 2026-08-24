// Importa o driver do PostgreSQL
const { Pool } = require('pg');
require('dotenv').config();

// Supabase Connection String (ou variáveis separadas)
// O ideal é usar a connection string fornecida pelo Supabase na variável DATABASE_URL,
// ou as variáveis DB_HOST, DB_USER, etc.
const pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 5432,
    ssl: {
        rejectUnauthorized: false // Supabase exige SSL, mas geralmente aceitamos os certificados no free tier
    },
    max: 10 // connectionLimit
});

// Testa a conexão assim que o arquivo é lido
pool.connect()
    .then(client => {
        console.log('✅ Conexão com o PostgreSQL (Supabase) estabelecida com sucesso!');
        client.release();
    })
    .catch((err) => console.error('❌ Erro ao conectar no banco:', err));

// Exporta a conexão para ser usada em outros arquivos
module.exports = pool;