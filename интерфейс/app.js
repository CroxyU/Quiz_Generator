// --- СОСТОЯНИЕ ---
let currentUser = localStorage.getItem('km_user') || null;

document.addEventListener('DOMContentLoaded', () => {
    updateGlobalUI();
    renderSets();
});

// Обновление всех элементов, зависящих от пользователя
function updateGlobalUI() {
    // 1. Обновляем кнопку-аватар на главной
    const dashAvatar = document.getElementById('dashboard-avatar');
    if (dashAvatar) {
        if (currentUser) {
            dashAvatar.textContent = currentUser.charAt(0).toUpperCase();
        } else {
            dashAvatar.textContent = '?';
        }
    }

    // 2. Обновляем профиль в ЛК
    const profName = document.getElementById('profile-nickname');
    const profAvatar = document.getElementById('profile-avatar');
    if (profName && profAvatar && currentUser) {
        profName.textContent = currentUser;
        profAvatar.textContent = currentUser.charAt(0).toUpperCase();
    }

    // 3. Обновляем шапку на лендинге (если пользователь зашел)
    const landingNav = document.getElementById('nav-actions');
    if (landingNav) {
        if (currentUser) {
            landingNav.innerHTML = `
                <span class="user-greeting">Привет, <strong>${currentUser}</strong>!</span>
                <button class="primary-btn small" onclick="navigate('dashboard')">В кабинет</button>
                <button class="text-btn" onclick="logout()">Выйти</button>
            `;
        } else {
            landingNav.innerHTML = `
                <button class="text-btn" onclick="navigate('auth')">Войти</button>
                <button class="primary-btn" onclick="navigate('auth')">Начать</button>
            `;
        }
    }
}

function logout() {
    currentUser = null;
    localStorage.removeItem('km_user');
    updateGlobalUI();
    navigate('landing');
}

// --- НАВИГАЦИЯ ---
function navigate(screenName) {
    // Скрываем все экраны
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    
    // Показываем нужный
    const targetScreen = document.getElementById(`screen-${screenName}`);
    if (targetScreen) {
        targetScreen.classList.add('active');
    }
    
    window.scrollTo(0, 0);
}

// --- АВТОРИЗАЦИЯ ---
function switchAuthTab(tab) {
    const tabLogin = document.getElementById('tab-login');
    const tabRegister = document.getElementById('tab-register');
    const formLogin = document.getElementById('form-login');
    const formRegister = document.getElementById('form-register');

    if (tab === 'login') {
        tabLogin.classList.add('active');
        tabRegister.classList.remove('active');
        formLogin.classList.remove('hidden');
        formRegister.classList.add('hidden');
    } else {
        tabRegister.classList.add('active');
        tabLogin.classList.remove('active');
        formRegister.classList.remove('hidden');
        formLogin.classList.add('hidden');
    }
}

function handleLogin(e) {
    e.preventDefault();
    const user = document.getElementById('login-username').value;
    const pass = document.getElementById('login-password').value;
    const error = document.getElementById('login-error');

    if (user.length < 3 || pass.length < 6) {
        error.textContent = "Неверный логин или пароль (мин. 6 символов)";
        return;
    }
    
    error.textContent = "";
    currentUser = user;
    localStorage.setItem('km_user', currentUser);
    
    updateGlobalUI();
    navigate('dashboard'); // После входа - на главную
}

function handleRegister(e) {
    e.preventDefault();
    const nickname = document.getElementById('reg-nickname').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;
    const errorMsg = document.getElementById('reg-error');

    if (!/^[a-zA-Z0-9_]+$/.test(nickname)) {
        errorMsg.textContent = "Никнейм: только латиница, цифры и _";
        return;
    }
    if (password.length < 6) {
        errorMsg.textContent = "Пароль должен быть не менее 6 символов";
        return;
    }
    if (!email.includes('@')) {
        errorMsg.textContent = "Введите корректный Email";
        return;
    }

    errorMsg.textContent = "";
    currentUser = nickname;
    localStorage.setItem('km_user', currentUser);
    
    updateGlobalUI();
    navigate('dashboard'); // После регистрации - на главную
}

function showStreak() {
    alert("🔥 Ваша текущая серия: 5 дней!\nМаксимальная серия: 10 дней.");
}

// --- ДАННЫЕ ---
const mockSets = [
    { id: 1, title: "Основы Python", questions: 20, date: "10.10.2023", progress: 45 },
    { id: 2, title: "История России", questions: 15, date: "12.10.2023", progress: 80 },
    { id: 3, title: "Биология клетки", questions: 30, date: "15.10.2023", progress: 10 },
    { id: 4, title: "Алгебра 9 класс", questions: 25, date: "18.10.2023", progress: 100 }
];

function renderSets() {
    const recentDiv = document.getElementById('recent-quizzes');
    const allSetsGrid = document.getElementById('all-sets-grid');
    const dashboardSets = document.getElementById('dashboard-sets');

    if (recentDiv) recentDiv.innerHTML = '';
    if (allSetsGrid) allSetsGrid.innerHTML = '';
    if (dashboardSets) dashboardSets.innerHTML = '';

    mockSets.forEach(set => {
        // Для дашборда
        if (dashboardSets) {
            dashboardSets.innerHTML += `
                <div class="set-card" onclick="openQuiz(${set.id})">
                    <h4>${set.title}</h4>
                    <p class="text-muted">Вопросов: ${set.questions}</p>
                    <div class="progress-bar"><div class="progress-fill" style="width: ${set.progress}%"></div></div>
                </div>
            `;
        }
        // Для страницы "Все наборы"
        if (allSetsGrid) {
            allSetsGrid.innerHTML += `
                <div class="big-set-card" onclick="openQuiz(${set.id})">
                    <h3>${set.title}</h3>
                    <p class="text-muted">Вопросов: ${set.questions} • Загружен: ${set.date}</p>
                    <div class="progress-bar"><div class="progress-fill" style="width: ${set.progress}%"></div></div>
                </div>
            `;
        }
        // Для ЛК
        if (recentDiv) {
            recentDiv.innerHTML += `
                <div class="set-card" onclick="openQuiz(${set.id})">
                    <h4>${set.title}</h4>
                    <p class="text-muted">${set.questions} вопросов • Прогресс: ${set.progress}%</p>
                </div>
            `;
        }
    });
}

// --- КВИЗ ЛОГИКА ---
let currentQuizData = null;
let currentCardIndex = 0;
let currentQIndex = 0;
let score = 0;
let selectedOption = null;

function generateQuiz() {
    const topic = document.getElementById('topic-input').value;
    const count = parseInt(document.getElementById('q-count').value) || 10;
    
    if (!document.getElementById('file-upload').files[0] && !document.getElementById('text-input').value && !topic) {
        alert("Пожалуйста, загрузите файл, вставьте текст или опишите тему.");
        return;
    }

    const btn = document.querySelector('#screen-create-set .primary-btn');
    const originalText = btn.textContent;
    btn.textContent = "Генерация ИИ...";
    btn.disabled = true;

    setTimeout(() => {
        setupQuiz(topic || "Новый квиз", count);
        btn.textContent = originalText;
        btn.disabled = false;
    }, 1200);
}

function openQuiz(id) {
    const set = mockSets.find(s => s.id === id);
    setupQuiz(set ? set.title : "Квиз", 10);
}

function setupQuiz(title, count) {
    currentQuizData = {
        title: title,
        count: count,
        cards: [
            { question: "Что такое переменная?", answer: "Именованная область памяти для хранения данных." },
            { question: "Что такое цикл?", answer: "Конструкция для многократного выполнения кода." }
        ],
        testQuestions: [
            { q: "Какой тип данных хранит текст?", options: ["Integer", "String", "Boolean", "Float"], correct: 1 },
            { q: "Что делает оператор if?", options: ["Цикл", "Условие", "Массив", "Функция"], correct: 1 },
            { q: "Как вывести текст в консоль?", options: ["print()", "console.log()", "echo", "write()"], correct: 1 }
        ]
    };
    
    document.getElementById('quiz-title').textContent = currentQuizData.title;
    document.getElementById('quiz-count').textContent = `${currentQuizData.count} вопросов`;
    document.getElementById('tab-summary').innerHTML = `<div class="summary-card"><p>Текст вашего конспекта, распознанный ИИ...</p></div>`;
    
    currentQIndex = 0; score = 0; currentCardIndex = 0;
    
    loadQuestion();
    document.querySelector('.card-front p').textContent = currentQuizData.cards[0].question;
    document.querySelector('.card-back p').textContent = currentQuizData.cards[0].answer;

    switchQuizTab('summary');
    navigate('quiz');
}

function switchQuizTab(tabName) {
    document.querySelectorAll('.quiz-tabs .tab').forEach(t => {
        t.classList.remove('active');
        if (t.textContent.toLowerCase().includes(tabName)) t.classList.add('active');
    });
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    const tab = document.getElementById(`tab-${tabName}`);
    if (tab) tab.classList.add('active');
    
    if (tabName === 'cards') {
        const card = document.getElementById('flashcard');
        if (card) card.classList.remove('flipped');
    }
}

function flipCard() {
    const card = document.getElementById('flashcard');
    if (card) card.classList.toggle('flipped');
}

function nextCard(isKnown) {
    if (!currentQuizData) return;
    const card = document.getElementById('flashcard');
    if (card) card.classList.remove('flipped');
    
    setTimeout(() => {
        currentCardIndex++;
        if (currentCardIndex >= currentQuizData.cards.length) currentCardIndex = 0;
        
        const front = document.querySelector('.card-front p');
        const back = document.querySelector('.card-back p');
        if (front && back) {
            front.textContent = currentQuizData.cards[currentCardIndex].question;
            back.textContent = currentQuizData.cards[currentCardIndex].answer;
        }
    }, 300);
}

function loadQuestion() {
    if (!currentQuizData) return;
    
    if (currentQIndex >= currentQuizData.testQuestions.length) {
        document.getElementById('score').textContent = score;
        switchQuizTab('results');
        return;
    }
    
    const q = currentQuizData.testQuestions[currentQIndex];
    document.getElementById('question-text').textContent = q.q;
    
    const qNum = document.getElementById('current-q-num');
    if (qNum) qNum.textContent = currentQIndex + 1;

    const optionsContainer = document.getElementById('options-container');
    optionsContainer.innerHTML = '';
    selectedOption = null;

    q.options.forEach((opt, index) => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.textContent = opt;
        btn.onclick = () => {
            document.querySelectorAll('.option-btn').forEach(b => b.classList.remove('selected'));
            btn.classList.add('selected');
            selectedOption = index;
        };
        optionsContainer.appendChild(btn);
    });
}

function nextQuestion() {
    if (selectedOption === null) {
        alert("Пожалуйста, выберите вариант ответа!");
        return;
    }
    
    if (selectedOption === currentQuizData.testQuestions[currentQIndex].correct) {
        score++;
    }
    
    currentQIndex++;
    loadQuestion();
}