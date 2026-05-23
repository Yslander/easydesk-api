-- 1. Cria o banco de dados exclusivo do nosso projeto
CREATE DATABASE easydesk;

-- 2. Avisa ao MySQL que todos os comandos a partir de agora vão para este banco
USE easydesk;

-- 3. Cria a nossa tabela "caderninho" permanente
CREATE TABLE chamados (
    id INT AUTO_INCREMENT PRIMARY KEY,
    solicitante VARCHAR(100) NOT NULL,
    descricao TEXT NOT NULL,
    prioridade VARCHAR(20) NOT NULL,
    status VARCHAR(20) DEFAULT 'Pendente',
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Garante que estamos usando o banco correto
USE easydesk;

-- Cria a tabela de usuários
CREATE TABLE usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);