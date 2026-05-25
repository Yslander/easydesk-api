# EasyDesk API — Sistema de Gestão de Chamados

A EasyDesk API é uma solução de backend robusta e estruturada, desenvolvida para gerenciar o núcleo lógico de um sistema corporativo de abertura, acompanhamento e resolução de chamados de suporte técnico. Construída sob o padrão arquitetural RESTful, a API estabelece uma comunicação performática, segura e totalmente escalável entre a interface do usuário e a camada de persistência de dados.

## 🔗 Links do Projeto
* **Deploy do Sistema:** [EasyDesk Central de Suporte](https://easydesk-frontend.vercel.app/index.html)
* **Painel de Gestão (GitHub Projects):** [EasyDesk Kanban Board](https://github.com/users/Yslander/projects/3)

## 🛠️ Arquitetura e Tecnologias Utilizadas
O ecossistema do backend foi projetado utilizando ferramentas consagradas no mercado de desenvolvimento de software, garantindo alta confiabilidade e segurança de nível empresarial:
* **Ambiente de Execução:** Node.js
* **Framework Web:** Express.js
* **Banco de Dados Relacional:** MySQL (Hospedado em nuvem via TiDB Cloud Serverless)
* **Segurança e Autenticação:** JSON Web Tokens (JWT) com tempo de expiração de 2 horas
* **Criptografia de Dados:** Bcrypt para a geração de hashes seguros de senhas (fator de custo/salt igual a 10)
* **Controle de Acesso de Origem:** CORS (Cross-Origin Resource Sharing) ativado para integração com o frontend
* **Gerenciamento de Configurações:** Dotenv para isolamento de credenciais e chaves sensíveis

## 🛡️ Diretrizes de Segurança e Regras de Negócio
* **Controle de Acesso Corporativo Restrito:** Alinhado às boas práticas de segurança industrial e corporativa, o auto-cadastro foi bloqueado. A rota de criação de usuários é estritamente protegida por criptografia, permitindo que apenas um Administrador autenticado consiga cadastrar novos colaboradores ou técnicos no sistema.
* **Autenticação Baseada em Token:** Emissão de credenciais eletrônicas (tokens JWT) no momento do login para autenticar requisições subsequentes de forma stateless.
* **Camada de Conexão Segura:** Integração com o banco de dados em nuvem utilizando transporte criptografado obrigatório via SSL/TLS (mínimo TLSv1.2), evitando interceptação de pacotes de dados.
* **Gerenciamento Completo de Chamados (CRUD):** Operações integradas para criar, ler, atualizar status (para "Concluído") e excluir registros de falhas de equipamentos ou solicitações de TI.

## 🗄️ Modelagem do Banco de Dados
O esquema de dados do projeto conta com duas tabelas principais modeladas no banco de dados relacional:

### Tabela: `usuarios`
Armazena as credenciais criptografadas dos colaboradores autorizados a operar o sistema.
* `id`: INT (Chave Primária, Auto Incremento)
* `nome`: VARCHAR(100) (Obrigatório)
* `email`: VARCHAR(100) (Obrigatório, Único)
* `senha`: VARCHAR(255) (Obrigatório, Armazenada como Hash Criptográfico)

### Tabela: `chamados`
Registra os chamados de suporte técnico abertos pelos setores operacionais.
* `id`: INT (Chave Primária, Auto Incremento)
* `solicitante`: VARCHAR(100) (Obrigatório, ex: Linha de Produção 3)
* `descricao`: TEXT (Obrigatório, detalhamento da falha mecânica ou de software)
* `prioridade`: VARCHAR(20) (Obrigatório: Baixa, Média ou Alta)
* `status`: VARCHAR(20) (Padrão: 'Pendente')

## 🚀 Endpoints da API

| Método | Rota | Descrição | Autenticação |
| :--- | :--- | :--- | :--- |
| **GET** | `/` | Rota base para verificação de conectividade e status da API. | Pública |
| **POST** | `/usuarios` | Cadastra um novo usuário no banco de dados (Restrito ao Admin). | Protegida (JWT) |
| **POST** | `/login` | Valida as credenciais de e-mail e senha, retornando o token JWT. | Pública |
| **GET** | `/chamados` | Retorna a lista de todos os chamados de suporte técnico. | Protegida (JWT) |
| **POST** | `/chamados` | Registra uma nova solicitação de suporte no banco de dados. | Protegida (JWT) |
| **PUT** | `/chamados/:id` | Atualiza o status de um chamado específico para 'Concluído'. | Protegida (JWT) |
| **DELETE** | `/chamados/:id` | Remove permanentemente um chamado do banco de dados. | Protegida (JWT) |

## ⚙️ Estrutura de Variáveis de Ambiente (.env)
Para o correto funcionamento do ecossistema local ou em produção, o painel de variáveis de ambiente do servidor deve conter a seguinte estrutura:

```env
DB_HOST=endereço_do_host_do_banco_em_nuvem
DB_USER=seu_usuario_do_banco
DB_PASSWORD=sua_senha_do_banco
DB_PORT=porta_de_conexao
DB_NAME=nome_do_banco_de_dados
JWT_SECRET=chave_secreta_para_assinatura_do_token