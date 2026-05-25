const db = require('./db');

async function criarTabelas() {
    try {
        console.log("🛠️ Conectando ao TiDB Cloud para construir as tabelas...");

        // Cria a tabela de usuários
        await db.execute(`
            CREATE TABLE IF NOT EXISTS usuarios (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nome VARCHAR(100) NOT NULL,
                email VARCHAR(100) NOT NULL UNIQUE,
                senha VARCHAR(255) NOT NULL
            )
        `);
        console.log("✅ Tabela 'usuarios' criada com sucesso!");

        // Cria a tabela de chamados
        await db.execute(`
            CREATE TABLE IF NOT EXISTS chamados (
                id INT AUTO_INCREMENT PRIMARY KEY,
                solicitante VARCHAR(100) NOT NULL,
                descricao TEXT NOT NULL,
                prioridade VARCHAR(20) NOT NULL,
                status VARCHAR(20) DEFAULT 'Pendente'
            )
        `);
        console.log("✅ Tabela 'chamados' criada com sucesso!");

        console.log("🚀 Fundação pronta! Pode voltar a testar o cadastro.");
        process.exit(0); // Encerra o script com sucesso
    } catch (erro) {
        console.error("❌ Falha ao criar tabelas:", erro.message);
        process.exit(1);
    }
}

criarTabelas();