const express = require('express');
const session = require('express-session');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

const app = express();
const PORT = 3000;
const USERS_FILE = path.join(__dirname, 'data', 'users.json');
const CACHE_FILE = path.join(__dirname, 'cache', 'data.json');
const CACHE_DURATION = 60 * 1000; // 1 минута

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use(session({
    secret: 'super_secret_key',
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true, sameSite: 'lax', secure: false }
}));

// Функция чтения и записи пользователей
const readUsers = () => {
    if (!fs.existsSync(USERS_FILE)) return [];
    return JSON.parse(fs.readFileSync(USERS_FILE, 'utf-8'));
};
const writeUsers = (users) => {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
};

// Регистрация
app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Заполните все поля' });

    const users = readUsers();
    if (users.some(u => u.username === username)) {
        return res.status(400).json({ error: 'Пользователь уже существует' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    users.push({ username, password: hashedPassword });
    writeUsers(users);
    
    res.json({ success: true });
});

// Вход
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    const users = readUsers();
    const user = users.find(u => u.username === username);

    if (!user || !(await bcrypt.compare(password, user.password))) {
        return res.status(401).json({ error: 'Неверные учетные данные' });
    }

    req.session.user = { username };
    res.json({ success: true });
});

// Профиль (доступен только авторизованным пользователям)
app.get('/profile', (req, res) => {
    if (!req.session.user) {
        return res.status(401).json({ error: 'Нет доступа' });
    }
    res.json({ user: req.session.user });
});

// Выход
app.post('/logout', (req, res) => {
    req.session.destroy(err => {
        if (err) return res.status(500).json({ error: 'Ошибка при выходе' });
        res.clearCookie('connect.sid');
        res.json({ success: true });
    });
});

// Данные с кэшированием
app.get('/data', (req, res) => {
    if (fs.existsSync(CACHE_FILE)) {
        const cache = JSON.parse(fs.readFileSync(CACHE_FILE, 'utf-8'));
        if (Date.now() - cache.timestamp < CACHE_DURATION) {
            return res.json(cache.data); // Тут cache.data, а не просто cache
        }
    }

    const newData = { 
        data: { random: crypto.randomInt(1, 100) }, // Вложенный объект data
        timestamp: Date.now()
    };
    
    fs.writeFileSync(CACHE_FILE, JSON.stringify(newData));

    res.json(newData.data); // Возвращаем только data
});


app.listen(PORT, () => console.log(`Сервер запущен на http://localhost:${PORT}`));
