process.env.NODE_ENV = 'test';
process.env.PORT = '3001'; // Evitar conflito com porta original se estiver rodando

const test = require('node:test');
const assert = require('node:assert');
const request = require('supertest');
const app = require('../server');
const db = require('../db'); // Conexão MySQL

let token;
let chamadoId;
let userId;

test('API EasyDesk - Testes Automatizados (MySQL)', async (t) => {

    t.before(async () => {
        // Limpar possíveis dados residuais do teste anterior caso tenha falhado
        await db.execute(`DELETE FROM usuarios WHERE email = 'tester@email.com'`);
    });

    t.after(async () => {
        // Limpeza dos dados gerados pelo teste
        if (userId) {
            await db.execute(`DELETE FROM usuarios WHERE id = ?`, [userId]);
        }
        // Fechar a conexão MySQL para o processo encerrar (se o pool suportar)
        // db.end() or db.pool.end() if applicable. 
        // We'll trust supertest exits when done.
    });

    await t.test('Deve cadastrar um novo usuário com sucesso (Status 201)', async () => {
        const res = await request(app).post('/usuarios').send({
            nome: 'Tester',
            email: 'tester@email.com',
            senha: '123'
        });
        assert.strictEqual(res.statusCode, 201);
        assert.ok(res.body.id_gerado);
        userId = res.body.id_gerado;
    });

    await t.test('Deve impedir o cadastro de e-mail duplicado (Status 400)', async () => {
        const res = await request(app).post('/usuarios').send({
            nome: 'Tester 2',
            email: 'tester@email.com',
            senha: '321'
        });
        assert.strictEqual(res.statusCode, 400);
        assert.strictEqual(res.body.erro, 'Este e-mail já está cadastrado.');
    });

    await t.test('Deve realizar login e retornar um Token JWT (Status 200)', async () => {
        const res = await request(app).post('/login').send({
            email: 'tester@email.com',
            senha: '123'
        });
        assert.strictEqual(res.statusCode, 200);
        assert.ok(res.body.token);
        token = res.body.token; // Salva o token para as próximas requisições
    });

    await t.test('Deve bloquear a criação de chamados sem Token (Status 401)', async () => {
        const res = await request(app).post('/chamados').send({
            descricao: 'Teste',
            prioridade: 'Alta'
        });
        assert.strictEqual(res.statusCode, 401);
    });

    await t.test('Deve criar um chamado usando o Token (Status 201)', async () => {
        const res = await request(app)
            .post('/chamados')
            .set('Authorization', `Bearer ${token}`)
            .send({
                descricao: 'Problema na impressora de testes',
                prioridade: 'Alta'
            });
        assert.strictEqual(res.statusCode, 201);
        assert.ok(res.body.id_gerado);
        chamadoId = res.body.id_gerado;
    });

    await t.test('Deve listar os chamados e conter o chamado criado (Status 200)', async () => {
        const res = await request(app)
            .get('/chamados')
            .set('Authorization', `Bearer ${token}`);
        
        assert.strictEqual(res.statusCode, 200);
        assert.strictEqual(Array.isArray(res.body), true);
        assert.strictEqual(res.body.length, 1);
        assert.strictEqual(res.body[0].descricao, 'Problema na impressora de testes');
    });

    await t.test('Deve atualizar o status do chamado (Status 200)', async () => {
        const res = await request(app)
            .put(`/chamados/${chamadoId}`)
            .set('Authorization', `Bearer ${token}`)
            .send({ status: 'Concluído' });
        
        assert.strictEqual(res.statusCode, 200);
        
        // Verifica se realmente alterou
        const check = await request(app)
            .get('/chamados')
            .set('Authorization', `Bearer ${token}`);
        assert.strictEqual(check.body[0].status, 'Concluído');
    });

    await t.test('Deve excluir o chamado (Status 200)', async () => {
        const res = await request(app)
            .delete(`/chamados/${chamadoId}`)
            .set('Authorization', `Bearer ${token}`);
        
        assert.strictEqual(res.statusCode, 200);
        
        // Verifica se deletou mesmo
        const check = await request(app)
            .get('/chamados')
            .set('Authorization', `Bearer ${token}`);
        assert.strictEqual(check.body.length, 0);
    });
});
