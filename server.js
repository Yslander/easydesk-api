const express = require('express');
const db = require('./db'); // 1. Importa a nossa conexão com o banco

const app = express();
app.use(express.json());

// Rota Base
app.get('/', (req, res) => {
    res.json({ mensagem: "API do EasyDesk conectada ao MySQL com sucesso!" });
});

// ==========================================
// ROTAS DO CRUD LIGADAS AO MYSQL
// ==========================================

// READ: Retorna todos os chamados
app.get('/chamados', async (req, res) => {
    try {
        // Pede ao banco para selecionar tudo da tabela chamados
        const [linhas] = await db.execute('SELECT * FROM chamados');
        res.json(linhas);
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ erro: "Erro ao buscar chamados no banco de dados." });
    }
});

// CREATE: Adiciona um novo chamado
app.post('/chamados', async (req, res) => {
    try {
        const { solicitante, descricao, prioridade } = req.body;
        
        // A query SQL com ? protege contra ataques de Injeção de SQL
        const query = 'INSERT INTO chamados (solicitante, descricao, prioridade) VALUES (?, ?, ?)';
        const [resultado] = await db.execute(query, [solicitante, descricao, prioridade]);
        
        res.status(201).json({ 
            mensagem: "Chamado criado com sucesso!", 
            id_gerado: resultado.insertId 
        });
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ erro: "Erro ao criar chamado no banco." });
    }
});

// UPDATE: Altera o status de um chamado
app.put('/chamados/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const { status } = req.body;
        
        const query = 'UPDATE chamados SET status = ? WHERE id = ?';
        const [resultado] = await db.execute(query, [status, id]);

        // Se nenhuma linha foi afetada, o ID não existe
        if (resultado.affectedRows === 0) {
            return res.status(404).json({ erro: "Chamado não encontrado." });
        }

        res.json({ mensagem: "Status atualizado com sucesso!" });
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ erro: "Erro ao atualizar chamado." });
    }
});

// DELETE: Remove um chamado
app.delete('/chamados/:id', async (req, res) => {
    try {
        const id = req.params.id;
        
        const query = 'DELETE FROM chamados WHERE id = ?';
        const [resultado] = await db.execute(query, [id]);

        if (resultado.affectedRows === 0) {
            return res.status(404).json({ erro: "Chamado não encontrado." });
        }

        res.json({ mensagem: "Chamado excluído com sucesso!" });
    } catch (erro) {
        console.error(erro);
        res.status(500).json({ erro: "Erro ao excluir chamado." });
    }
});

// ==========================================
// LIGANDO O SERVIDOR
// ==========================================
const PORTA = 3000;
app.listen(PORTA, () => {
    console.log(`🚀 Servidor rodando na porta ${PORTA}`);
});