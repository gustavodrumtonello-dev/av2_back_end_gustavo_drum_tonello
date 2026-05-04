const express = require('express');
const app = express();
app.use(express.json());

/*
 * ESTRUTURA DO BANCO DE DADOS (REFERÊNCIA SQL)
 * Como o banco oficial ainda está sendo configurado,
 * utilizamos Arrays em memória para simular as tabelas.
 *
 * Tabela de Filmes
 * CREATE TABLE filmes (
 *     id INTEGER PRIMARY KEY,
 *     titulo TEXT,
 *     genero TEXT,
 *     ano_lancamento INTEGER
 * );
 *
 * Tabela de Usuários
 * CREATE TABLE usuarios (
 *     id INTEGER PRIMARY KEY,
 *     nome TEXT,
 *     email TEXT,
 *     plano TEXT -- 'Básico', 'Premium'
 * );
 *
 * Tabela de Favoritos (Relaciona Usuário com Filme)
 * CREATE TABLE favoritos (
 *     id INTEGER PRIMARY KEY,
 *     id_usuario INTEGER, -- Relacionado ao ID do Usuário
 *     id_filme INTEGER    -- Relacionado ao ID do Filme
 * );
 */

// ===== SIMULAÇÃO DAS TABELAS DO BANCO =====

// Tabela de Filmes
let filmes = [
    {
        id: 1,
        titulo: "O Poderoso Chefão",
        genero: "Drama",
        ano_lancamento: 1972
    },
    {
        id: 2,
        titulo: "Interestelar",
        genero: "Ficção Científica",
        ano_lancamento: 2014
    },
    {
        id: 3,
        titulo: "Parasita",
        genero: "Drama/Suspense",
        ano_lancamento: 2019
    }
];

// Tabela de Usuários
let usuarios = [
    {
        id: 1,
        nome: "João Silva",
        email: "joao@email.com",
        plano: "Premium"
    },
    {
        id: 2,
        nome: "Maria Santos",
        email: "maria@email.com",
        plano: "Básico"
    }
];

// Tabela de Favoritos (Relaciona Usuário com Filme)
let favoritos = [
    {
        id: 1,
        id_usuario: 1,
        id_filme: 2
    },
    {
        id: 2,
        id_usuario: 1,
        id_filme: 3
    },
    {
        id: 3,
        id_usuario: 2,
        id_filme: 1
    }
];

// Contadores para IDs únicos (simulam o AUTO_INCREMENT)
let proximoIdFilme = 4;
let proximoIdUsuario = 3;
let proximoIdFavorito = 4;

// ====== GESTÃO DE FILMES ======

// GET /filmes - Listar todos os filmes
app.get('/filmes', (req, res) => {
    res.json(filmes);
});

// POST /filmes - Cadastrar novo filme
app.post('/filmes', (req, res) => {
    const { titulo, genero, ano_lancamento } = req.body;
   
    const novoFilme = {
        id: proximoIdFilme++,
        titulo,
        genero,
        ano_lancamento
    };
   
    filmes.push(novoFilme);
    res.status(201).json(novoFilme);
});

// DELETE /filmes/:id - Remover filme
app.delete('/filmes/:id', (req, res) => {
    const id = parseInt(req.params.id);
   
    filmes = filmes.filter(filme => filme.id !== id);
    favoritos = favoritos.filter(fav => fav.id_filme !== id);
   
    res.json({ mensagem: "Filme removido com sucesso" });
});

// ====== GESTÃO DE USUÁRIOS ======

// GET /usuarios - Listar todos os usuários
app.get('/usuarios', (req, res) => {
    res.json(usuarios);
});

// POST /usuarios - Cadastrar novo usuário
app.post('/usuarios', (req, res) => {
    const { nome, email, plano } = req.body;
   
    const novoUsuario = {
        id: proximoIdUsuario++,
        nome,
        email,
        plano: plano || "Básico"
    };
   
    usuarios.push(novoUsuario);
    res.status(201).json(novoUsuario);
});

// PUT /usuarios/:id - Atualizar usuário
app.put('/usuarios/:id', (req, res) => {
    const id = parseInt(req.params.id);
    const { nome, email, plano } = req.body;
   
    usuarios = usuarios.map(user => {
        if (user.id === id) {
            return {
                ...user,
                nome: nome || user.nome,
                email: email || user.email,
                plano: plano || user.plano
            };
        }
        return user;
    });
   
    const usuarioAtualizado = usuarios.find(user => user.id === id);
    res.json(usuarioAtualizado);
});

// ====== SISTEMA DE FAVORITOS ======

// POST /favoritos - Adicionar filme aos favoritos
app.post('/favoritos', (req, res) => {
    const { id_usuario, id_filme } = req.body;
   
    const novoFavorito = {
        id: proximoIdFavorito++,
        id_usuario,
        id_filme
    };
   
    favoritos.push(novoFavorito);
    res.status(201).json(novoFavorito);
});

// GET /favoritos - Listar todos os favoritos
app.get('/favoritos', (req, res) => {
    const favoritosDetalhados = favoritos.map(fav => {
        const usuario = usuarios.find(u => u.id === fav.id_usuario);
        const filme = filmes.find(f => f.id === fav.id_filme);
       
        return {
            id: fav.id,
            id_usuario: fav.id_usuario,
            id_filme: fav.id_filme,
            usuario: usuario ? { id: usuario.id, nome: usuario.nome } : null,
            filme: filme ? { id: filme.id, titulo: filme.titulo } : null
        };
    });
   
    res.json(favoritosDetalhados);
});

// GET /favoritos/usuario/:id_usuario - Listar favoritos de um usuário
app.get('/favoritos/usuario/:id_usuario', (req, res) => {
    const idUsuario = parseInt(req.params.id_usuario);
   
    const usuario = usuarios.find(u => u.id === idUsuario);
   
    const favoritosUsuario = favoritos
        .filter(fav => fav.id_usuario === idUsuario)
        .map(fav => {
            const filme = filmes.find(f => f.id === fav.id_filme);
            return {
                id_favorito: fav.id,
                id_filme: fav.id_filme,
                filme: filme || null
            };
        });
   
    res.json({
        usuario: {
            id: usuario.id,
            nome: usuario.nome,
            email: usuario.email,
            plano: usuario.plano
        },
        total_favoritos: favoritosUsuario.length,
        favoritos: favoritosUsuario
    });
});

// Rota raiz - Informações da API
app.get('/', (req, res) => {
    res.json({
        api: "CineStream API",
        versao: "1.0",
        estrutura_banco: "Baseada no schema SQL fornecido",
        endpoints: {
            filmes: ["GET /filmes", "POST /filmes", "DELETE /filmes/:id"],
            usuarios: ["GET /usuarios", "POST /usuarios", "PUT /usuarios/:id"],
            favoritos: ["POST /favoritos", "GET /favoritos", "GET /favoritos/usuario/:id_usuario"]
        }
    });
});

// Iniciar servidor
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🚀 CineStream API rodando em http://localhost:${PORT}`);
    console.log(`📚 ${filmes.length} filmes carregados`);
    console.log(`👥 ${usuarios.length} usuários carregados`);
    console.log(`❤️ ${favoritos.length} favoritos carregados`);
});