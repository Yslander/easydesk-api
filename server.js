const express = require('express');
const cors = require('cors'); // Importa o CORS
const db = require('./db');
const bcrypt = require('bcrypt'); // Importa o triturador de senhas
const jwt = require('jsonwebtoken'); // Importa o gerador de tokens
const verificarToken = require('./auth'); // Importa o nosso leitor de segurança

const app = express();

app.use(cors()); // Libera a comunicação com o frontend
app.use(express.json());

// Rota Base
app.get('/', (req, res) => {
    res.json({ mensagem: "API do EasyDesk conectada ao MySQL com sucesso!" });
});

// ==========================================
// ROTAS DE USUÁRIOS E SEGURANÇA
// ==========================================

// CREATE: Cadastro de Usuário com Criptografia
app.post('/usuarios', async (req, res) => {
    try {
        const { nome, email, senha } = req.body;

        // O número 10 é o "salt" (força da criptografia). Ele embaralha a senha 10 vezes.
        const senhaCriptografada = await bcrypt.hash(senha, 10);

        const query = 'INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)';
        
        // Salvamos a senha criptografada no banco, NUNCA a original!
        const [resultado] = await db.execute(query, [nome, email, senhaCriptografada]);

        res.status(201).json({ 
            mensagem: "Usuário cadastrado com sucesso!", 
            id_gerado: resultado.insertId 
        });
    } catch (erro) {
        console.error(erro);
        // O MySQL retorna o código 'ER_DUP_ENTRY' se alguém tentar usar um e-mail que já existe
        if (erro.code === 'ER_DUP_ENTRY') {
            return res.status(400).json({ erro: "Este e-mail já está cadastrado." });
        }
        res.status(500).json({ erro: "Erro ao cadastrar usuário." });
    }
});

// READ: Login de Usuário (Geração do Token)
app.post('/login', async (req, res) => {
    try {
        const { email, senha } = req.body;

        // 1. Procura no banco de dados se o e-mail existe
        const [usuarios] = await db.execute('SELECT * FROM usuarios WHERE email = ?', [email]);
        
        // Se o array voltar vazio, o usuário não existe
        if (usuarios.length === 0) {
            return res.status(401).json({ erro: "E-mail ou senha inválidos." });
        }

        const usuario = usuarios[0];

        // 2. Compara a senha digitada em texto puro com o hash embaralhado do banco
        const senhaValida = await bcrypt.compare(senha, usuario.senha);

        if (!senhaValida) {
            return res.status(401).json({ erro: "E-mail ou senha inválidos." });
        }

        // 3. Tudo certo! Gera o Token JWT contendo o ID e o Nome do usuário
        const token = jwt.sign(
            { id: usuario.id, nome: usuario.nome },
            process.env.JWT_SECRET,
            { expiresIn: '2h' } // Segurança: O token expira e perde a validade em 2 horas
        );

        res.json({ 
            mensagem: "Login realizado com sucesso!", 
            token: token 
        });

    } catch (erro) {
        console.error(erro);
        res.status(500).json({ erro: "Erro interno ao realizar login." });
    }
});

// ==========================================
// ROTAS DO CRUD LIGADAS AO MYSQL (CHAMADOS)
// ==========================================

app.get('/chamados', verificarToken, async (req, res) => {
    try {
        const [linhas] = await db.execute('SELECT * FROM chamados');
        res.json(linhas);
    } catch (erro) {
        res.status(500).json({ erro: "Erro ao buscar chamados." });
    }
});

app.post('/chamados', verificarToken, async (req, res) => {
    try {
        const { solicitante, descricao, prioridade } = req.body;
        const query = 'INSERT INTO chamados (solicitante, descricao, prioridade) VALUES (?, ?, ?)';
        const [resultado] = await db.execute(query, [solicitante, descricao, prioridade]);
        res.status(201).json({ mensagem: "Chamado criado com sucesso!", id_gerado: resultado.insertId });
    } catch (erro) {
        res.status(500).json({ erro: "Erro ao criar chamado." });
    }
});

app.put('/chamados/:id', verificarToken, async (req, res) => {
    try {
        const id = req.params.id;
        const { status } = req.body;
        const query = 'UPDATE chamados SET status = ? WHERE id = ?';
        const [resultado] = await db.execute(query, [status, id]);
        if (resultado.affectedRows === 0) return res.status(404).json({ erro: "Chamado não encontrado." });
        res.json({ mensagem: "Status atualizado!" });
    } catch (erro) {
        res.status(500).json({ erro: "Erro ao atualizar chamado." });
    }
});

app.delete('/chamados/:id', verificarToken, async (req, res) => {
    try {
        const id = req.params.id;
        const query = 'DELETE FROM chamados WHERE id = ?';
        const [resultado] = await db.execute(query, [id]);
        if (resultado.affectedRows === 0) return res.status(404).json({ erro: "Chamado não encontrado." });
        res.json({ mensagem: "Chamado excluído!" });
    } catch (erro) {
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