// 1. Importa o framework Express
const express = require('express');

// 2. Inicializa o aplicativo
const app = express();

// 3. Permite que o servidor entenda dados no formato JSON
app.use(express.json());

// 4. Cria a nossa primeira Rota de teste (O "Hello World")
app.get('/', (req, res) => {
    res.json({ mensagem: "Bem-vindo à API do EasyDesk!" });
});

// 5. Define a porta e liga o servidor
const PORTA = 3000;
app.listen(PORTA, () => {
    console.log(`🚀 Servidor rodando na porta ${PORTA}`);
});