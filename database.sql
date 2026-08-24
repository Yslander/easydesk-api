-- 1. Cria o banco de dados exclusivo do nosso projeto
CREATE DATABASE IF NOT EXISTS easydesk;

-- 2. Avisa ao MySQL que todos os comandos a partir de agora vão para este banco
USE easydesk;

-- 3. Cria a tabela de usuários (Primeiro, pois 'chamados' depende dela)
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Cria a nossa tabela de chamados permanente com isolamento (usuario_id)
CREATE TABLE chamados (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    solicitante VARCHAR(100) NOT NULL,
    descricao TEXT NOT NULL,
    prioridade VARCHAR(20) NOT NULL,
    status VARCHAR(20) DEFAULT 'Pendente',
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);