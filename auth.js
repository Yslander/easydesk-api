const jwt = require('jsonwebtoken');
require('dotenv').config();

function verificarToken(req, res, next) {
    // 1. O cliente (Thunder Client/Navegador) manda o token no "cabeçalho" da requisição
    const tokenHeader = req.headers['authorization'];
    
    // Se não mandou nada, barra a entrada
    if (!tokenHeader) {
        return res.status(401).json({ erro: "Acesso negado. Token não fornecido." });
    }

    try {
        // O padrão da internet é enviar o token assim: "Bearer <token_aqui>"
        // O split separa a palavra "Bearer" do token em si e pega a parte 2 [1]
        const token = tokenHeader.split(' ')[1];
        
        // 2. O leitor verifica se a assinatura do crachá é verdadeira
        const verificado = jwt.verify(token, process.env.JWT_SECRET);
        
        // 3. Se for válido, guarda os dados do usuário e destranca a porta (next)
        req.usuario = verificado; 
        next(); 
        
    } catch (erro) {
        res.status(401).json({ erro: "Token inválido ou expirado." });
    }
}

module.exports = verificarToken;