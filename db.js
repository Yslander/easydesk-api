// Importa o driver do MySQL e a biblioteca de segurança
const mysql = require('mysql2/promise');
require('dotenv').config();

// Cria um pool de conexões. 
// Isso evita que o banco trave se muitas pessoas acessarem ao mesmo tempo.
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
    ssl: {
        minVersion: 'TLSv1.2',
        rejectUnauthorized: true
    },
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// Testa a conexão assim que o arquivo é lido
pool.getConnection()
    .then((conn) => {
        console.log('✅ Conexão com o MySQL estabelecida com sucesso!');
        conn.release();
    })
    .catch((err) => console.error('❌ Erro ao conectar no banco:', err));

// Exporta a conexão para ser usada em outros arquivos
module.exports = pool;