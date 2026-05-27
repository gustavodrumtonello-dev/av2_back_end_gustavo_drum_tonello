const API_URL = 'http://localhost:3000';

// Funções de navegação
function showSection(sectionId) {
    // Remove active de todas as sections
    document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Remove active de todos os botões
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Adiciona active na section selecionada
    document.getElementById(sectionId).classList.add('active');
    
    // Adiciona active no botão clicado
    event.target.classList.add('active');
    
    // Carregar dados quando a aba é selecionada
    switch(sectionId) {
        case 'dashboard':
            carregarDashboard();
            break;
        case 'filmes':
            carregarFilmes();
            break;
        case 'usuarios':
            carregarUsuarios();
            break;
        case 'favoritos':
            carregarFavoritos();
            carregarSelectsFavoritos();
            break;
    }
}

// Funções de loading
function showLoading(elementId) {
    document.getElementById(elementId).style.display = 'block';
}

function hideLoading(elementId) {
    document.getElementById(elementId).style.display = 'none';
}

// Função para mostrar mensagens
function showMessage(elementId, message, type = 'success') {
    const element = document.getElementById(elementId);
    element.textContent = message;
    element.className = `message ${type}`;
    
    // Esconder mensagem após 5 segundos
    setTimeout(() => {
        element.className = 'message';
    }, 5000);
}

// ===== DASHBOARD =====
async function carregarDashboard() {
    showLoading('dashboardLoading');
    
    try {
        const [filmesRes, usuariosRes, favoritosRes] = await Promise.all([
            fetch(`${API_URL}/filmes`),
            fetch(`${API_URL}/usuarios`),
            fetch(`${API_URL}/favoritos`)
        ]);
        
        const filmes = await filmesRes.json();
        const usuarios = await usuariosRes.json();
        const favoritos = await favoritosRes.json();
        
        document.getElementById('totalFilmes').textContent = filmes.length;
        document.getElementById('totalUsuarios').textContent = usuarios.length;
        document.getElementById('totalFavoritos').textContent = favoritos.length;
        
    } catch (error) {
        console.error('Erro ao carregar dashboard:', error);
        showMessage('filmeMessage', 'Erro ao carregar dados do dashboard', 'error');
    } finally {
        hideLoading('dashboardLoading');
    }
}

// ===== FILMES =====
async function carregarFilmes() {
    showLoading('filmesLoading');
    
    try {
        const response = await fetch(`${API_URL}/filmes`);
        const filmes = await response.json();
        
        const filmesGrid = document.getElementById('filmesGrid');
        
        filmesGrid.innerHTML = filmes.map(filme => `
            <div class="card">
                <h3 class="card-title">🎬 ${filme.titulo}</h3>
                <p class="card-info"><strong>Gênero:</strong> ${filme.genero}</p>
                <p class="card-info"><strong>Ano:</strong> ${filme.ano_lancamento}</p>
                <p class="card-info"><strong>ID:</strong> #${filme.id}</p>
                <button class="btn btn-danger" onclick="removerFilme(${filme.id})" style="margin-top: 10px;">
                    🗑️ Remover
                </button>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Erro ao carregar filmes:', error);
        showMessage('filmeMessage', 'Erro ao carregar filmes', 'error');
    } finally {
        hideLoading('filmesLoading');
    }
}

async function adicionarFilme() {
    const titulo = document.getElementById('filmeTitulo').value;
    const genero = document.getElementById('filmeGenero').value;
    const ano = document.getElementById('filmeAno').value;

    if (!titulo || !genero || !ano) {
        showMessage('filmeMessage', 'Preencha todos os campos', 'error');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/filmes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                titulo,
                genero,
                ano_lancamento: parseInt(ano)
            })
        });

        if (response.ok) {
            showMessage('filmeMessage', 'Filme adicionado com sucesso!', 'success');
            
            // Limpar campos
            document.getElementById('filmeTitulo').value = '';
            document.getElementById('filmeGenero').value = '';
            document.getElementById('filmeAno').value = '';
            
            // Recarregar dados
            carregarFilmes();
            carregarDashboard();
        }
    } catch (error) {
        showMessage('filmeMessage', 'Erro ao adicionar filme', 'error');
    }
}

async function removerFilme(id) {
    if (confirm('Tem certeza que deseja remover este filme?')) {
        try {
            const response = await fetch(`${API_URL}/filmes/${id}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                showMessage('filmeMessage', 'Filme removido com sucesso!', 'success');
                carregarFilmes();
                carregarDashboard();
            }
        } catch (error) {
            showMessage('filmeMessage', 'Erro ao remover filme', 'error');
        }
    }
}

// ===== USUÁRIOS =====
async function carregarUsuarios() {
    showLoading('usuariosLoading');
    
    try {
        const response = await fetch(`${API_URL}/usuarios`);
        const usuarios = await response.json();
        
        const usuariosGrid = document.getElementById('usuariosGrid');
        
        usuariosGrid.innerHTML = usuarios.map(usuario => `
            <div class="card">
                <h3 class="card-title">👤 ${usuario.nome}</h3>
                <p class="card-info"><strong>Email:</strong> ${usuario.email}</p>
                <p class="card-info">
                    <strong>Plano:</strong> 
                    <span class="badge ${usuario.plano === 'Premium' ? 'badge-success' : ''}">
                        ${usuario.plano}
                    </span>
                </p>
                <p class="card-info"><strong>ID:</strong> #${usuario.id}</p>
                <button class="btn" onclick="atualizarUsuario(${usuario.id})" style="margin-top: 10px;">
                    ✏️ Atualizar
                </button>
            </div>
        `).join('');
        
    } catch (error) {
        console.error('Erro ao carregar usuários:', error);
        showMessage('usuarioMessage', 'Erro ao carregar usuários', 'error');
    } finally {
        hideLoading('usuariosLoading');
    }
}

async function adicionarUsuario() {
    const nome = document.getElementById('usuarioNome').value;
    const email = document.getElementById('usuarioEmail').value;
    const plano = document.getElementById('usuarioPlano').value;

    if (!nome || !email) {
        showMessage('usuarioMessage', 'Preencha todos os campos', 'error');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/usuarios`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ nome, email, plano })
        });

        if (response.ok) {
            showMessage('usuarioMessage', 'Usuário adicionado com sucesso!', 'success');
            
            // Limpar campos
            document.getElementById('usuarioNome').value = '';
            document.getElementById('usuarioEmail').value = '';
            document.getElementById('usuarioPlano').value = 'Básico';
            
            // Recarregar dados
            carregarUsuarios();
            carregarDashboard();
        }
    } catch (error) {
        showMessage('usuarioMessage', 'Erro ao adicionar usuário', 'error');
    }
}

async function atualizarUsuario(id) {
    const novoNome = prompt('Novo nome (deixe em branco para manter):');
    const novoEmail = prompt('Novo email (deixe em branco para manter):');
    const novoPlano = prompt('Novo plano (Básico/Premium) (deixe em branco para manter):');

    if (!novoNome && !novoEmail && !novoPlano) {
        return;
    }

    try {
        const body = {};
        if (novoNome) body.nome = novoNome;
        if (novoEmail) body.email = novoEmail;
        if (novoPlano) body.plano = novoPlano;

        const response = await fetch(`${API_URL}/usuarios/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(body)
        });

        if (response.ok) {
            showMessage('usuarioMessage', 'Usuário atualizado com sucesso!', 'success');
            carregarUsuarios();
        }
    } catch (error) {
        showMessage('usuarioMessage', 'Erro ao atualizar usuário', 'error');
    }
}

// ===== FAVORITOS =====
async function carregarSelectsFavoritos() {
    try {
        const [usuariosRes, filmesRes] = await Promise.all([
            fetch(`${API_URL}/usuarios`),
            fetch(`${API_URL}/filmes`)
        ]);
        
        const usuarios = await usuariosRes.json();
        const filmes = await filmesRes.json();
        
        const favUsuarioSelect = document.getElementById('favUsuario');
        const buscarFavUsuarioSelect = document.getElementById('buscarFavUsuario');
        const favFilmeSelect = document.getElementById('favFilme');
        
        const usuariosOptions = usuarios.map(u => 
            `<option value="${u.id}">${u.nome} (${u.plano})</option>`
        ).join('');
        
        const todosOption = '<option value="">Selecione um usuário</option>';
        const todosBuscaOption = '<option value="">Todos os usuários</option>';
        
        favUsuarioSelect.innerHTML = todosOption + usuariosOptions;
        buscarFavUsuarioSelect.innerHTML = todosBuscaOption + usuariosOptions;
        
        favFilmeSelect.innerHTML = '<option value="">Selecione um filme</option>' + 
            filmes.map(f => `<option value="${f.id}">${f.titulo}</option>`).join('');
            
    } catch (error) {
        console.error('Erro ao carregar selects:', error);
    }
}

async function carregarFavoritos(usuarioId = null) {
    showLoading('favoritosLoading');
    
    try {
        const url = usuarioId 
            ? `${API_URL}/favoritos/usuario/${usuarioId}`
            : `${API_URL}/favoritos`;
        
        const response = await fetch(url);
        const data = await response.json();
        
        const favoritosGrid = document.getElementById('favoritosGrid');
        const favoritosResult = document.getElementById('favoritosResult');
        
        // Mostrar informações do usuário se específico
        if (usuarioId && data.usuario) {
            favoritosResult.innerHTML = `
                <div class="stats" style="margin-bottom: 20px;">
                    <div class="stat-box">
                        <div class="stat-number">${data.total_favoritos}</div>
                        <div class="stat-label">Favoritos de ${data.usuario.nome}</div>
                    </div>
                    <div class="stat-box">
                        <div class="stat-number">${data.usuario.plano}</div>
                        <div class="stat-label">Plano</div>
                    </div>
                </div>
            `;
        } else {
            favoritosResult.innerHTML = '';
        }
        
        const favoritosList = usuarioId ? data.favoritos || [] : data;
        
        favoritosGrid.innerHTML = favoritosList.map(fav => {
            const isUsuarioView = !!usuarioId;
            const filme = isUsuarioView ? fav.filme : fav.filme;
            const usuario = isUsuarioView ? null : fav.usuario;
            
            return `
                <div class="card favorite-card">
                    <h3 class="card-title">❤️ ${filme ? filme.titulo : 'Filme não encontrado'}</h3>
                    ${usuario ? `<p class="card-info"><strong>Usuário:</strong> ${usuario.nome}</p>` : ''}
                    <p class="card-info"><strong>ID Favorito:</strong> #${fav.id || fav.id_favorito}</p>
                    <p class="card-info"><strong>ID Filme:</strong> #${fav.id_filme}</p>
                </div>
            `;
        }).join('');
        
        // Mensagem quando não há favoritos
        if (favoritosList.length === 0) {
            favoritosGrid.innerHTML = '<p style="text-align: center; color: rgba(255,255,255,0.5);">Nenhum favorito encontrado</p>';
        }
        
    } catch (error) {
        console.error('Erro ao carregar favoritos:', error);
        showMessage('favoritoMessage', 'Erro ao carregar favoritos', 'error');
    } finally {
        hideLoading('favoritosLoading');
    }
}

async function adicionarFavorito() {
    const id_usuario = document.getElementById('favUsuario').value;
    const id_filme = document.getElementById('favFilme').value;

    if (!id_usuario || !id_filme) {
        showMessage('favoritoMessage', 'Selecione um usuário e um filme', 'error');
        return;
    }

    try {
        const response = await fetch(`${API_URL}/favoritos`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                id_usuario: parseInt(id_usuario),
                id_filme: parseInt(id_filme)
            })
        });

        if (response.ok) {
            showMessage('favoritoMessage', 'Filme adicionado aos favoritos!', 'success');
            carregarFavoritos();
            carregarDashboard();
        }
    } catch (error) {
        showMessage('favoritoMessage', 'Erro ao adicionar favorito', 'error');
    }
}

async function buscarFavoritos() {
    const usuarioId = document.getElementById('buscarFavUsuario').value;
    
    if (usuarioId) {
        await carregarFavoritos(parseInt(usuarioId));
    } else {
        await carregarFavoritos();
    }
}

// Inicializar o dashboard quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    carregarDashboard();
});