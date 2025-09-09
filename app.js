const API_URL = 'http://127.0.0.1:5000/api'; // URL do seu servidor Flask
let currentUser = null;

// Mapeamento dos elementos do DOM
const authSection = document.getElementById('auth-section');
const pageContent = document.getElementById('page-content');

// --- Funções de Autenticação (Login, Cadastro e Logout) ---
window.renderAuthSection = async function() {
    authSection.innerHTML = '';
    const storedUser = localStorage.getItem('currentUser');
    if (storedUser) {
        currentUser = JSON.parse(storedUser);
    }

    if (currentUser) {
        authSection.innerHTML = `
            <span class="font-semibold text-gray-700 hidden md:block">Olá, ${currentUser.name}!</span>
            <button onclick="renderMyServicesPage()" class="px-4 py-2 bg-blue-500 text-white rounded-full font-medium hover:bg-blue-600 transition-colors duration-200">Meus Serviços</button>
            <button onclick="renderAddServicePage()" class="px-4 py-2 bg-green-500 text-white rounded-full font-medium hover:bg-green-600 transition-colors duration-200">Adicionar Serviço</button>
            <button onclick="logout()" class="px-4 py-2 bg-red-500 text-white rounded-full font-medium hover:bg-red-600 transition-colors duration-200">Sair</button>
        `;
    } else {
        authSection.innerHTML = `
            <button onclick="renderRegisterPage()" class="px-4 py-2 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition-colors duration-200">Login/Cadastro</button>
        `;
    }
}

window.renderRegisterPage = function() {
    pageContent.innerHTML = `
        <div class="flex flex-col items-center justify-center space-y-8 p-6">
            <!-- Registration Form -->
            <div class="w-full max-w-md p-6 bg-gray-50 rounded-lg shadow-md">
                <h2 class="text-2xl font-bold text-gray-700 mb-4 text-center">Cadastro</h2>
                <form id="register-form">
                    <div class="mb-4">
                        <label for="register-name" class="block text-gray-700 font-semibold mb-2">Seu Nome</label>
                        <input type="text" id="register-name" class="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                    </div>
                    <div class="mb-4">
                        <label for="register-email" class="block text-gray-700 font-semibold mb-2">E-mail</label>
                        <input type="email" id="register-email" class="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                    </div>
                    <div class="mb-4">
                        <label for="register-password" class="block text-gray-700 font-semibold mb-2">Senha</label>
                        <input type="password" id="register-password" class="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                    </div>
                    <div class="mb-6">
                        <label for="register-confirm-password" class="block text-gray-700 font-semibold mb-2">Confirmar Senha</label>
                        <input type="password" id="register-confirm-password" class="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                    </div>
                    <button type="submit" class="w-full px-4 py-3 bg-green-600 text-white rounded-full font-semibold hover:bg-green-700 transition-colors duration-200">Cadastrar</button>
                </form>
            </div>
            <div class="text-center text-sm text-gray-600">
                Já tem uma conta? <span onclick="renderLoginPage()" class="text-blue-600 cursor-pointer hover:underline">Faça login aqui</span>.
            </div>
        </div>
    `;

    document.getElementById('register-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('register-name').value;
        const email = document.getElementById('register-email').value;
        const password = document.getElementById('register-password').value;
        const confirmPassword = document.getElementById('register-confirm-password').value;

        if (password !== confirmPassword) {
            showModal('Erro', 'As senhas não coincidem!');
            return;
        }

        try {
            const response = await fetch(`${API_URL}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password })
            });
            const result = await response.json();
            if (response.ok) {
                showModal('Sucesso', 'Cadastro realizado com sucesso! Você já pode fazer login.');
                document.getElementById('register-form').reset();
                renderLoginPage();
            } else {
                showModal('Erro', result.error);
            }
        } catch (error) {
            console.error('Registration error:', error);
            showModal('Erro', 'Ocorreu um erro de conexão.');
        }
    });
}

window.renderLoginPage = function() {
    pageContent.innerHTML = `
        <div class="flex flex-col items-center justify-center space-y-8 p-6">
            <!-- Login Form -->
            <div class="w-full max-w-md p-6 bg-gray-50 rounded-lg shadow-md">
                <h2 class="text-2xl font-bold text-gray-700 mb-4 text-center">Login</h2>
                <form id="login-form">
                    <div class="mb-4">
                        <label for="login-email-or-name" class="block text-gray-700 font-semibold mb-2">E-mail ou Nome</label>
                        <input type="text" id="login-email-or-name" class="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                    </div>
                    <div class="mb-6">
                        <label for="login-password" class="block text-gray-700 font-semibold mb-2">Senha</label>
                        <input type="password" id="login-password" class="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required>
                    </div>
                    <button type="submit" class="w-full px-4 py-3 bg-blue-600 text-white rounded-full font-semibold hover:bg-blue-700 transition-colors duration-200">Entrar</button>
                </form>
            </div>
            <div class="text-center text-sm text-gray-600">
                Não tem uma conta? <span onclick="renderRegisterPage()" class="text-green-600 cursor-pointer hover:underline">Cadastre-se aqui</span>.
            </div>
        </div>
    `;

    document.getElementById('login-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const identifier = document.getElementById('login-email-or-name').value;
        const password = document.getElementById('login-password').value;
        try {
            const response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ identifier, password })
            });
            const result = await response.json();
            if (response.ok) {
                currentUser = { uid: result.uid, email: result.email, name: result.name };
                localStorage.setItem('currentUser', JSON.stringify(currentUser));
                showModal('Sucesso', 'Login realizado com sucesso!');
                renderHomePage();
            } else {
                showModal('Erro', result.error);
            }
        } catch (error) {
            console.error('Login error:', error);
            showModal('Erro', 'Ocorreu um erro de conexão.');
        }
    });
}

window.logout = async function() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    showModal('Desconectado', 'Sessão encerrada com sucesso.');
    renderHomePage();
}

// --- Funções de Renderização das Páginas ---
window.renderHomePage = async function() {
    pageContent.innerHTML = `
        <div class="mb-6">
            <h2 class="text-2xl font-bold text-gray-700 mb-4">Serviços no Bairro</h2>
            <div class="flex items-center space-x-2">
                <input type="text" id="search-input" placeholder="Buscar por bairro..." class="flex-grow p-3 border border-gray-300 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                <button onclick="handleSearch()" class="px-6 py-3 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition-colors duration-200">Buscar</button>
            </div>
        </div>
        <div id="service-list" class="flex flex-wrap -m-2">
            <!-- Loading state -->
            <div class="w-full text-center p-4 text-gray-500">Carregando serviços...</div>
        </div>
    `;
    
    try {
        const response = await fetch(`${API_URL}/services`);
        if (!response.ok) {
            throw new Error('Falha ao buscar serviços.');
        }
        const services = await response.json();
        updateServiceList(services);
    } catch (error) {
        showModal('Erro de Conexão', 'Não foi possível carregar os serviços. Verifique se o seu servidor Python está rodando.');
        console.error("Erro:", error);
    }
}

window.renderMyServicesPage = async function() {
    if (!currentUser) {
        showModal('Acesso Negado', 'Você precisa estar logado para ver seus serviços.');
        return;
    }

    pageContent.innerHTML = `
        <div class="mb-6">
            <h2 class="text-2xl font-bold text-gray-700 mb-4">Meus Serviços</h2>
        </div>
        <div id="my-services-list" class="flex flex-wrap -m-2">
            <div class="w-full text-center p-4 text-gray-500">Carregando seus serviços...</div>
        </div>
    `;
    
    try {
        const response = await fetch(`${API_URL}/my-services?userId=${currentUser.uid}`);
        if (!response.ok) {
            throw new Error('Falha ao buscar seus serviços.');
        }
        const services = await response.json();
        
        const myServicesHtml = services.map(service => `
            <div class="w-full md:w-1/2 lg:w-1/3 p-2">
                <div class="bg-gray-100 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow duration-200 h-full flex flex-col">
                    <h2 class="text-xl font-bold text-blue-700">${service.title}</h2>
                    <p class="text-sm text-gray-600 mt-1">Bairro: <span class="font-semibold">${service.neighborhood}</span></p>
                    <p class="text-gray-700 mt-2 flex-grow line-clamp-3">${service.description}</p>
                    <button onclick="renderServicePage('${service.id}')" class="mt-4 px-4 py-2 bg-blue-500 text-white rounded-full font-medium text-sm hover:bg-blue-600 transition-colors duration-200 self-start">Ver Detalhes</button>
                </div>
            </div>
        `).join('');
        
        const myServiceList = document.getElementById('my-services-list');
        if (myServiceList) {
            myServiceList.innerHTML = myServicesHtml || '<div class="w-full text-center p-4 text-gray-500">Você ainda não publicou nenhum serviço.</div>';
        }
    } catch (error) {
        showModal('Erro de Conexão', 'Não foi possível carregar seus serviços. Verifique se o seu servidor Python está rodando.');
        console.error("Erro:", error);
    }
}

window.handleSearch = async function() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    
    try {
        const response = await fetch(`${API_URL}/services`);
        if (!response.ok) {
            throw new Error('Falha ao buscar serviços.');
        }
        const services = await response.json();
        
        const filtered = services.filter(s => 
            s.neighborhood.toLowerCase().includes(searchTerm) || 
            s.title.toLowerCase().includes(searchTerm) || 
            s.description.toLowerCase().includes(searchTerm)
        );

        updateServiceList(filtered);
    } catch (error) {
        showModal('Erro de Conexão', 'Não foi possível carregar os serviços. Verifique se o seu servidor Python está rodando.');
        console.error("Erro:", error);
    }
}

window.updateServiceList = function(services) {
    const listHtml = services.map(service => `
        <div class="w-full md:w-1/2 lg:w-1/3 p-2">
            <div class="bg-gray-100 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow duration-200 h-full flex flex-col">
                <h2 class="text-xl font-bold text-blue-700">${service.title}</h2>
                <p class="text-sm text-gray-600 mt-1">Bairro: <span class="font-semibold">${service.neighborhood}</span></p>
                <p class="text-gray-700 mt-2 flex-grow line-clamp-3">${service.description}</p>
                <button onclick="renderServicePage('${service.id}')" class="mt-4 px-4 py-2 bg-blue-500 text-white rounded-full font-medium text-sm hover:bg-blue-600 transition-colors duration-200 self-start">Ver Detalhes</button>
            </div>
        </div>
    `).join('');
    
    const serviceList = document.getElementById('service-list');
    if (serviceList) {
        serviceList.innerHTML = listHtml || '<div class="w-full text-center p-4 text-gray-500">Nenhum serviço encontrado neste bairro.</div>';
    }
}

window.renderServicePage = async function(serviceId) {
    try {
        const response = await fetch(`${API_URL}/services/${serviceId}`);
        const service = await response.json();
        
        if (!response.ok) {
            showModal('Erro', service.error);
            return;
        }
        
        const providerName = service.providerName || 'Usuário Desconhecido';
        
        pageContent.innerHTML = `
            <div class="flex flex-col md:flex-row md:space-x-8">
                <div class="md:w-2/3">
                    <h2 class="text-3xl font-bold text-blue-700 mb-2">${service.title}</h2>
                    <p class="text-gray-600 mb-4">Oferecido por: <span class="font-semibold">${providerName}</span> em <span class="font-semibold">${service.neighborhood}</span></p>
                    <p class="text-gray-700 leading-relaxed mb-6">${service.description}</p>
                    <button onclick="renderHomePage()" class="px-4 py-2 bg-gray-300 text-gray-800 rounded-full font-medium hover:bg-gray-400 transition-colors duration-200">Voltar para a lista</button>
                    ${currentUser && currentUser.uid !== service.userId ? `
                        <button onclick="renderChatPage('${service.id}')" class="px-4 py-2 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition-colors duration-200 ml-2">Iniciar Negociação</button>
                    ` : ''}
                </div>
            </div>
        `;
    } catch (error) {
        console.error("Erro ao buscar detalhes do serviço:", error);
        showModal('Erro', `Não foi possível carregar os detalhes do serviço. Verifique sua conexão ou as permissões do Firebase.`);
    }
}

window.renderAddServicePage = function() {
    if (!currentUser) {
        showModal('Acesso Negado', 'Você precisa estar logado para adicionar um serviço.');
        return;
    }
    
    pageContent.innerHTML = `
        <h2 class="text-2xl font-bold text-gray-700 mb-6 text-center">Adicionar Novo Serviço</h2>
        <form id="add-service-form" class="max-w-xl mx-auto p-6 bg-gray-50 rounded-lg shadow-md">
            <div class="mb-4">
                <label for="service-title" class="block text-gray-700 font-semibold mb-2">Título do Serviço</label>
                <input type="text" id="service-title" class="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required>
            </div>
            <div class="mb-4">
                <label for="service-description" class="block text-gray-700 font-semibold mb-2">Descrição</label>
                <textarea id="service-description" rows="4" class="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required></textarea>
            </div>
            <div class="mb-4">
                <label for="service-neighborhood" class="block text-gray-700 font-semibold mb-2">Bairro</label>
                <input type="text" id="service-neighborhood" class="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500" required>
            </div>
            <button type="submit" class="w-full px-4 py-3 bg-green-600 text-white rounded-full font-semibold hover:bg-green-700 transition-colors duration-200">Publicar Serviço</button>
            <button type="button" onclick="renderHomePage()" class="w-full mt-4 px-4 py-3 bg-gray-300 text-gray-800 rounded-full font-semibold hover:bg-gray-400 transition-colors duration-200">Cancelar</button>
        </form>
    `;
    
    document.getElementById('add-service-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        const title = document.getElementById('service-title').value;
        const description = document.getElementById('service-description').value;
        const neighborhood = document.getElementById('service-neighborhood').value;
        
        try {
            const response = await fetch(`${API_URL}/services`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: currentUser.uid, title, description, neighborhood })
            });
            const result = await response.json();
            if (response.ok) {
                showModal('Sucesso', 'Serviço publicado com sucesso!');
                renderHomePage();
            } else {
                showModal('Erro', result.error);
            }
        } catch (error) {
            console.error("Error adding document: ", error);
            showModal('Erro', 'Ocorreu um erro ao publicar o serviço.');
        }
    });
}

window.renderChatPage = async function(serviceId) {
    if (!currentUser) {
        showModal('Acesso Negado', 'Você precisa estar logado para iniciar uma negociação.');
        return;
    }

    showModal('Funcionalidade em desenvolvimento', 'A funcionalidade de chat ainda não está conectada ao backend.');
}

window.showModal = function(title, message) {
    const modalHtml = `
        <div id="alert-modal" class="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div class="bg-white rounded-lg shadow-xl p-6 max-w-sm w-full text-center">
                <h3 class="text-lg font-bold mb-4">${title}</h3>
                <p class="text-gray-700 mb-6">${message}</p>
                <button onclick="closeModal('alert-modal');" class="px-4 py-2 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition-colors duration-200">OK</button>
            </div>
        </div>
    `;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

window.closeModal = function(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.remove();
    }
}

// Inicia a aplicação
window.onload = function() {
    renderRegisterPage(); // Primeira página a ser carregada
    renderAuthSection();
};
