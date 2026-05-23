const express = require('express');
const app = express();
app.use(express.json());

// 1. Nosso "Banco de Dados" temporário em memória
let chamados = [];

// Rota Base de Teste
app.get('/', (req, res) => {
    res.json({ mensagem: "API do EasyDesk rodando perfeitamente!" });
});

// ==========================================
// ROTAS DO CRUD (Create, Read, Update, Delete)
// ==========================================

// 2. READ : Retorna todos os chamados
app.get('/chamados', (req, res) => {
    res.json(chamados);
});

// 3. CREATE : Adiciona um novo chamado
app.post('/chamados', (req, res) => {
    const novoChamado = {
        id: Date.now(), // Gera um ID único
        solicitante: req.body.solicitante,
        descricao: req.body.descricao,
        prioridade: req.body.prioridade,
        status: 'Pendente',
        data: new Date().toLocaleDateString('pt-BR')
    };
    
    chamados.push(novoChamado);
    res.status(201).json({ mensagem: "Chamado criado com sucesso!", chamado: novoChamado });
});

// 4. UPDATE : Altera o status de um chamado existente
app.put('/chamados/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const { status } = req.body; // Pega o novo status que o usuário enviou

    const index = chamados.findIndex(c => c.id === id);

    if (index === -1) {
        return res.status(404).json({ erro: "Chamado não encontrado." });
    }

    chamados[index].status = status;
    res.json({ mensagem: "Status atualizado com sucesso!", chamado: chamados[index] });
});

// 5. DELETE : Remove um chamado do sistema
app.delete('/chamados/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const index = chamados.findIndex(c => c.id === id);

    if (index === -1) {
        return res.status(404).json({ erro: "Chamado não encontrado." });
    }

    chamados.splice(index, 1); // Remove 1 item a partir daquela posição
    res.json({ mensagem: "Chamado excluído com sucesso!" });
});

// ==========================================
// LIGANDO O SERVIDOR
// ==========================================
const PORTA = 3000;
app.listen(PORTA, () => {
    console.log(`🚀 Servidor rodando na porta ${PORTA}`);
});