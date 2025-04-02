document.addEventListener('DOMContentLoaded', () => {
    document.body.className = localStorage.getItem('theme') || 'light';


    const authSection = document.getElementById('auth-section');
    const profileSection = document.getElementById('profile-section');
    const registerBtn = document.getElementById('register-btn');
    const loginBtn = document.getElementById('login-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const toggleThemeBtn = document.getElementById('toggle-theme');
    const fetchDataBtn = document.getElementById('fetch-data');
    const errorMessage = document.getElementById('error-message');
    const dataDisplay = document.getElementById('data-display');

    checkAuth();

    registerBtn.addEventListener('click', async () => {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        try {
            const response = await fetch('/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
                credentials: 'include'
            });
            const data = await response.json();
            if (!data.success) showError('Ошибка регистрации');
        } catch (err) {
            showError('Ошибка соединения');
        }
    });

    loginBtn.addEventListener('click', async () => {
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        try {
            const response = await fetch('/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
                credentials: 'include'
            });
            const data = await response.json();
            if (data.success) checkAuth();
            else showError('Неверные учетные данные');
        } catch (err) {
            showError('Ошибка соединения');
        }
    });

    logoutBtn.addEventListener('click', async () => {
        try {
            const response = await fetch('/logout', { method: 'POST', credentials: 'include' });
            if (!response.ok) throw new Error('Ошибка выхода');
            authSection.classList.remove('hidden');
            profileSection.classList.add('hidden');
        } catch (err) {
            showError('Ошибка выхода');
        }
    });
    

    fetchDataBtn.addEventListener('click', async () => {
        try {
            const response = await fetch('/data', { credentials: 'include' });
            if (!response.ok) throw new Error('Ошибка загрузки данных');
            const data = await response.json();
            dataDisplay.textContent = JSON.stringify(data, null, 2);
        } catch (err) {
            showError('Не удалось загрузить данные');
        }
    });
    

    toggleThemeBtn.addEventListener('click', () => {
        const currentTheme = localStorage.getItem('theme') || 'light';
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        document.body.className = newTheme;
        localStorage.setItem('theme', newTheme);
    });

    async function checkAuth() {
        try {
            const response = await fetch('/profile', { credentials: 'include' });
            if (!response.ok) throw new Error('Нет доступа');
            const data = await response.json();
            document.getElementById('username-display').textContent = data.user.username;
            authSection.classList.add('hidden');
            profileSection.classList.remove('hidden');
        } catch (err) {
            authSection.classList.remove('hidden');
            profileSection.classList.add('hidden');
        }
    }
    

    function showError(message) {
        errorMessage.textContent = message;
        errorMessage.classList.remove('hidden');
        setTimeout(() => errorMessage.classList.add('hidden'), 3000);
    }
});
