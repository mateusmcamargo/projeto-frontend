const STORAGE_KEY = 'cortafome_users';

let form;
let userNameInput;
let userEmailInput;
let clearBtn;
let deleteAllBtn;
let searchInput;
let userList;
let emptyState;

let users = [];

// Carregar usuários do Local Storage
function loadUsers() {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
}

// Salvar usuários no Local Storage
function saveUsers() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

function addUser(name, email) {
    const user = {
        id: Date.now().toString(),
        name: name.trim(),
        email: email.trim().toLowerCase(),
        date: new Date().toLocaleString('pt-BR')
    };
    users.push(user);
    saveUsers();
    return user;
}

function removeUser(id) {
    users = users.filter(user => user.id !== id);
    saveUsers();
}

function removeAllUsers() {
    users = [];
    localStorage.removeItem(STORAGE_KEY);
}

function searchUsers(query) {
    if (!query.trim()) {
        return users;
    }
    const lowerQuery = query.toLowerCase().trim();

    // filters user name or email (parses all to lowercase first)
    return users.filter(user => 
        user.name.toLowerCase().includes(lowerQuery) ||
        user.email.toLowerCase().includes(lowerQuery)
    );
}

function validateEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}
// Escapar HTML para prevenir XSS
function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

function clearForm() {
    userNameInput.value = '';
    userEmailInput.value = '';
    userNameInput.focus();
}

function handleAddUser(e) {
    e.preventDefault();
    
    const name = userNameInput.value;
    const email = userEmailInput.value;

    // if (!name || !email) {
    //     alert('Por favor, preencha todos os campos obrigatórios.');
    //     return;
    // }

    // if (!validateEmail(email)) {
    //     alert('Por favor, insira um e-mail válido.');
    //     return;
    // }

    addUser(name, email);
    clearForm();
    renderUsers();
    showSuccessMessage();
}

function handleDeleteAll() {
    if (users.length === 0) {
        alert('Não há usuários para excluir.');
        return;
    }

    if (confirm('Tem certeza que deseja excluir todos os usuários? Esta ação não pode ser desfeita.')) {
        removeAllUsers();
        searchInput.value = '';
        renderUsers();
    }
}

function handleDeleteUser(id) {
    removeUser(id);
    renderUsers();
}

function handleSearch(e) {
    const query = e.target.value;
    const results = searchUsers(query);
    renderUsers(results);
}

function createUserElement(user) {
    const li = document.createElement('li');
    li.className = 'user-item';
    li.setAttribute('data-id', user.id);

    li.innerHTML = `
        <div class="user-info">
            <span class="user-date">${user.date}</span>
            <span class="user-name">${escapeHtml(user.name)}</span>
            <span class="user-email">${escapeHtml(user.email)}</span>
        </div>
        <button class="delete-btn" data-id="${user.id}">
            <i class="fa-solid fa-trash"></i>
            Excluir
        </button>
    `;

    // Adicionar evento ao botão excluir
    const deleteBtn = li.querySelector('.delete-btn');
    deleteBtn.addEventListener('click', function() {
        handleDeleteUser(user.id);
    });

    return li;
}

function renderUsers(usersToRender) {
    // Sif no user is passed, render all
    if (!usersToRender) {
        usersToRender = users;
    }
    
    userList.innerHTML = '';

    // check if there are users
    if (usersToRender.length === 0) {
        emptyState.classList.remove('hidden');
        userList.style.display = 'none';
        return;
    }

    emptyState.classList.add('hidden');
    userList.style.display = 'flex';

    usersToRender.forEach(function(user) {
        const listItem = createUserElement(user);
        userList.appendChild(listItem);
    });
}

function showSuccessMessage() {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 12rem;
        right: 4rem;
        background-color: #4caf50;
        color: white;
        padding: 1.6rem 2.4rem;
        border-radius: 0.8rem;
        font-size: 1.4rem;
        font-weight: 600;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        z-index: 1000;
        animation: slideIn 0.3s ease;
    `;
    notification.innerHTML = `
        <i class="fa-solid fa-check-circle" style="margin-right: 1rem; font-size: 1.6rem;"></i>
        Usuário cadastrado com sucesso!
    `;

    // animaition (in & out)
    if (!document.getElementById('notification-style')) {
        const style = document.createElement('style');
        style.id = 'notification-style';
        style.textContent = `
            @keyframes slideIn {
                from {
                    transform: translateX(40rem);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
        `;
        document.head.appendChild(style);
    }

    document.body.appendChild(notification);

    // 3 seconds timout till removal
    setTimeout(function() {
        notification.style.animation = 'slideIn 0.3s ease reverse';
        setTimeout(function() {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

function initEventListeners() {

    form.addEventListener('submit', handleAddUser);
    clearBtn.addEventListener('click', clearForm);
    deleteAllBtn.addEventListener('click', handleDeleteAll);
    searchInput.addEventListener('input', handleSearch);
}

function init() {
    form = document.getElementById('userForm');
    userNameInput = document.getElementById('userName');
    userEmailInput = document.getElementById('userEmail');
    clearBtn = document.getElementById('clearBtn');
    deleteAllBtn = document.getElementById('deleteAllBtn');
    searchInput = document.getElementById('searchInput');
    userList = document.getElementById('userList');
    emptyState = document.getElementById('emptyState');
    
    users = loadUsers();
    
    initEventListeners();
    
    renderUsers();
}

// init when DOM is loaded
document.addEventListener('DOMContentLoaded', init);