Aqui está o arquivo `README.md` final para o repositório do back-end. Ele foi estruturado para refletir a maturidade de uma API de mercado, destacando todos os requisitos obrigatórios, de segurança e arquitetura exigidos no edital do Projeto 5 (ConnectHub).

Basta copiar o bloco abaixo e substituir o conteúdo do `README.md` no repositório `easydesk-api`.

---

```markdown
# EasyDesk API (ConnectHub) - Backend 🚀

O **EasyDesk API** é o servidor back-end responsável por gerenciar toda a lógica de negócios, autenticação e persistência de dados do sistema de chamados EasyDesk. Este projeto atende aos requisitos arquiteturais do **Projeto 5 (ConnectHub)**, realizando a transição de uma aplicação de armazenamento local para uma estrutura *full-stack* robusta, segura e relacional.

## 🎯 Principais Funcionalidades

* **Autenticação Segura:** Sistema de login e cadastro com senhas protegidas via *hashing* e controle de sessão através de tokens JWT (JSON Web Token).
* **Autorização e Isolamento:** Acesso restrito em que um usuário autenticado visualiza e manipula apenas os dados que lhe pertencem.
* **CRUD Completo:** Rotas RESTful operantes (`GET`, `POST`, `PUT`, `DELETE`) para o gerenciamento ágil e assíncrono de chamados técnicos.
* **Persistência Relacional:** Banco de dados SQL que substitui o armazenamento efêmero do front-end, garantindo integridade e escalabilidade dos registros.
* **Arquitetura Padrão MVC:** Separação estrita de responsabilidades organizando o projeto em `config/`, `controllers/`, `models/` e `routes/`.

## 💻 Tecnologias Utilizadas

* **Runtime & Framework:** Node.js e Express.js
* **Banco de Dados:** Relacional SQL (Ex: MySQL / PostgreSQL)
* **Segurança de Dados:** `bcrypt` (criptografia) e `jsonwebtoken` (emissão e validação de tokens JWT)
* **Controle de Integração:** `cors` (Cross-Origin Resource Sharing)
* **Gerenciamento de Ambiente:** `dotenv` para isolamento de credenciais e senhas

## ⚙️ Como Instalar e Executar Localmente

**1. Clone o repositório e acesse a pasta:**
```bash
git clone [https://github.com/Yslander/easydesk-api.git](https://github.com/Yslander/easydesk-api.git)
cd easydesk-api

```

**2. Instale as dependências:**

```bash
npm install

```

**3. Configure o Banco de Dados:**
Execute o script fornecido no arquivo `database.sql` em seu SGBD (como DBeaver ou MySQL Workbench) para estruturar as tabelas relacionais de Usuários e Chamados.

**4. Configure as Variáveis de Ambiente:**
Crie um arquivo chamado `.env` na raiz do projeto e insira as credenciais de acordo com o seu ambiente (NUNCA versione este arquivo no Git):

```env
PORT=3000
DB_HOST=localhost
DB_USER=seu_usuario_sql
DB_PASS=sua_senha_sql
DB_NAME=easydesk_db
JWT_SECRET=sua_chave_jwt_super_segura

```

**5. Inicie o Servidor:**

```bash
# Para execução normal:
npm start

# Para execução em ambiente de desenvolvimento (Nodemon):
npm run dev

```

> A API estará escutando as requisições em `http://localhost:3000` (ou na porta configurada no seu `.env`).

## 🔗 Estrutura de Rotas (Endpoints Principais)

* `POST /api/auth/register` - Cadastro de novos usuários.
* `POST /api/auth/login` - Autenticação e retorno do token JWT.
* `GET /api/tickets` - Retorna todos os chamados do usuário logado (Requer JWT).
* `POST /api/tickets` - Cria um novo chamado (Requer JWT).
* `PUT /api/tickets/:id` - Atualiza o status ou descrição de um chamado (Requer JWT).
* `DELETE /api/tickets/:id` - Remove um chamado (Requer JWT).

---

## 👨‍💻 Autores

Desenvolvido por **Yslander Martins de Souza** em parceria com **Lucas Satoshi Cipriano Oikawa**.