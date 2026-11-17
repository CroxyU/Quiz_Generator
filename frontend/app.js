let currentUser = localStorage.getItem('km_user') || null;
let currentQuizData = null;
let sessionStats = { cards: 0, quiz: 0, test: 0, tf: 0 };

document.addEventListener('DOMContentLoaded', () => {
    updateUI();
    renderSets();
    updateTotalCount();
    renderCreateTab('file');
});

// --- UI ---
function updateUI() {
    const dashAvatar = document.getElementById('dashboard-avatar');
    const profAvatar = document.getElementById('profile-avatar');
    const profName = document.getElementById('profile-nickname');
    const landingNav = document.getElementById('nav-actions');

    if (currentUser) {
        if (dashAvatar) dashAvatar.textContent = currentUser.charAt(0).toUpperCase();
        if (profAvatar) profAvatar.textContent = currentUser.charAt(0).toUpperCase();
        if (profName) profName.textContent = currentUser;
        
        if (landingNav) {
            landingNav.innerHTML = `
                <button class="primary-btn small" onclick="navigate('dashboard')">В кабинет</button>
                <button class="text-btn" onclick="logout()">Выйти</button>
            `;
        }
    } else {
        if (dashAvatar) dashAvatar.textContent = 'U';
        if (landingNav) {
            landingNav.innerHTML = `
                <button class="primary-btn" onclick="navigate('auth')">Войти</button>
            `;
        }
    }
}

function logout() {
    currentUser = null;
    localStorage.removeItem('km_user');
    updateUI();
    navigate('landing');
}

// --- НАВИГАЦИЯ ---
function navigate(screenName) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    const target = document.getElementById(`screen-${screenName}`);
    if (target) target.classList.add('active');
    window.scrollTo(0, 0);
}

// --- АВТОРИЗАЦИЯ ---
function switchAuthTab(tab) {
    document.getElementById('tab-login').classList.toggle('active', tab === 'login');
    document.getElementById('tab-register').classList.toggle('active', tab === 'register');
    document.getElementById('form-login').classList.toggle('hidden', tab !== 'login');
    document.getElementById('form-register').classList.toggle('hidden', tab !== 'register');
}

function handleLogin(e) {
    e.preventDefault();
    const user = document.getElementById('login-username').value;
    if (user.length < 3) { document.getElementById('login-error').textContent = "Мин. 3 символа"; return; }
    currentUser = user;
    localStorage.setItem('km_user', currentUser);
    updateUI();
    navigate('dashboard');
}

function handleRegister(e) {
    e.preventDefault();
    const nickname = document.getElementById('reg-nickname').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;
    if (password.length < 6) { document.getElementById('reg-error').textContent = "Пароль: мин. 6 символов"; return; }
    if (!email.includes('@')) { document.getElementById('reg-error').textContent = "Некорректный Email"; return; }
    currentUser = nickname;
    localStorage.setItem('km_user', currentUser);
    updateUI();
    navigate('dashboard');
}

// --- СОЗДАНИЕ КВИЗА ---
function switchCreateSource(type) {
    document.querySelectorAll('.create-tab').forEach(t => t.classList.remove('active'));
    event.target.classList.add('active');
    renderCreateTab(type);
}

function renderCreateTab(type) {
    const zone = document.getElementById('upload-zone');
    if (!zone) return;

    if (type === 'file') {
        zone.innerHTML = `
            <div style="font-size: 3rem; margin-bottom: 20px;">☁️</div>
            <h3>Перетащите конспект сюда</h3>
            <p>или выберите файл на устройстве</p>
            <p style="margin-top: 15px; font-size: 0.8rem; opacity: 0.5;">PDF, DOCX, TXT, MD, JPG, PNG</p>
            <input type="file" style="display:none;" id="file-input">
            <button class="outline-btn mt-20" onclick="document.getElementById('file-input').click()">Выбрать файл</button>
        `;
    } else if (type === 'text') {
        zone.innerHTML = `
            <h3 style="margin-bottom: 15px;">Вставьте текст конспекта</h3>
            <textarea class="main-input" id="source-text" style="height: 200px; resize: none;" placeholder="Вставьте ваш текст здесь..."></textarea>
        `;
    } else if (type === 'topic') {
        zone.innerHTML = `
            <h3 style="margin-bottom: 15px;">Опишите тему</h3>
            <p style="margin-bottom: 15px; color: var(--text-muted);">Например: "Основы квантовой физики"</p>
            <input type="text" class="main-input" id="source-topic" placeholder="Введите тему...">
        `;
    }
}

const counts = { def: 6, quiz: 5, test: 3, tf: 4 };

function updateCount(type, delta) {
    counts[type] = Math.max(0, counts[type] + delta);
    document.getElementById(`count-${type}`).textContent = counts[type];
    updateTotalCount();
}

function updateTotalCount() {
    const total = counts.def + counts.quiz + counts.test + counts.tf;
    const el = document.getElementById('total-cards');
    if (el) el.textContent = total;
}

function createQuiz() {
    const name = document.getElementById('quiz-name').value || "Новый квиз";
    sessionStats = { cards: 0, quiz: 0, test: 0, tf: 0 };
    
    let generatedSummary = "Здесь должен быть распознанный текст вашего конспекта. Так как это демо-версия, мы сгенерировали пример. Вы можете отредактировать этот текст на вкладке 'Конспект'.";
    const textInput = document.getElementById('source-text');
    const topicInput = document.getElementById('source-topic');
    if (textInput && textInput.value) generatedSummary = textInput.value;
    if (topicInput && topicInput.value) generatedSummary = `Сгенерированный конспект по теме: ${topicInput.value}. Основные понятия и определения...`;

    currentQuizData = {
        title: name,
        summary: generatedSummary,
        cards: [
            { q: "Что такое момент силы?", a: "Это векторная величина, равная произведению силы на плечо." },
            { q: "В каких единицах измеряется момент силы?", a: "В Ньютон-метрах (Н·м)." }
        ],
        quiz: [
            { q: "Какой закон описывает момент силы?", opts: ["Закон Ньютона", "Закон Гука", "Правило моментов", "Закон Ома"], correct: 2 }
        ],
        test: [
            { q: "Введите формулу момента силы (M = ...)", a: "F * l" }
        ],
        tf: [
            { q: "Момент силы — это скалярная величина?", a: false }
        ]
    };

    document.getElementById('quiz-title').textContent = currentQuizData.title;
    document.getElementById('summary-text').value = currentQuizData.summary;
    
    loadCard(0);
    switchQuizTab('summary');
    navigate('quiz');
}

// --- РАБОТА КВИЗА ---
function switchQuizTab(tabName) {
    document.querySelectorAll('.quiz-tabs .tab').forEach(t => {
        t.classList.remove('active');
        if (t.textContent.toLowerCase().includes(tabName)) t.classList.add('active');
    });
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    const tab = document.getElementById(`tab-${tabName}`);
    if (tab) tab.classList.add('active');

    if (tabName === 'stats') {
        document.getElementById('stat-cards').textContent = sessionStats.cards;
        document.getElementById('stat-quiz').textContent = sessionStats.quiz;
        document.getElementById('stat-test').textContent = sessionStats.test;
        document.getElementById('stat-tf').textContent = sessionStats.tf;
    }
    // Сброс фидбека при переключении
    document.querySelectorAll('.feedback-box').forEach(el => el.classList.add('hidden'));
}

function saveSummary() {
    const newText = document.getElementById('summary-text').value;
    if (currentQuizData) {
        currentQuizData.summary = newText;
        const btn = event.target;
        const origText = btn.textContent;
        btn.textContent = "Сохранено!";
        btn.style.background = "var(--primary-hover)";
        setTimeout(() => {
            btn.textContent = origText;
            btn.style.background = "var(--primary)";
        }, 2000);
    }
}

// 1. Карточки
let cardIdx = 0;
function loadCard(index) {
    if (!currentQuizData || !currentQuizData.cards[index]) return;
    document.getElementById('card-question').textContent = currentQuizData.cards[index].q;
    document.getElementById('card-answer').textContent = currentQuizData.cards[index].a;
    document.getElementById('flashcard').classList.remove('flipped'); // Сбрасываем переворот
}

function flipCard() {
    document.getElementById('flashcard').classList.toggle('flipped');
}

// Исправленная логика "Не знаю"
function nextCard(isKnown) {
    if (isKnown) {
        sessionStats.cards++;
        cardIdx++;
        if (cardIdx >= currentQuizData.cards.length) cardIdx = 0;
        loadCard(cardIdx);
    } else {
        // Если нажали "Не знаю", просто переворачиваем карточку, чтобы пользователь увидел ответ
        const card = document.getElementById('flashcard');
        if (!card.classList.contains('flipped')) {
            card.classList.add('flipped');
        }
    }
}

// 2. Квиз
let quizIdx = 0;
function loadQuizQuestion() {
    if (!currentQuizData || !currentQuizData.quiz[quizIdx]) return;
    const q = currentQuizData.quiz[quizIdx];
    document.getElementById('quiz-q-text').textContent = q.q;
    const opts = document.getElementById('quiz-options');
    opts.innerHTML = '';
    document.getElementById('quiz-feedback').classList.add('hidden'); // Скрываем старый ответ

    q.opts.forEach((opt, i) => {
        const b = document.createElement('button');
        b.className = 'option-btn';
        b.textContent = opt;
        b.onclick = () => {
            document.querySelectorAll('#quiz-options .option-btn').forEach(x => x.classList.remove('selected'));
            b.classList.add('selected');
            b.dataset.correct = (i === q.correct);
        };
        opts.appendChild(b);
    });
}

function nextQuizQuestion() {
    const selected = document.querySelector('#quiz-options .option-btn.selected');
    if (!selected) return; // Не выбрано — ничего не делаем

    const feedback = document.getElementById('quiz-feedback');
    const isCorrect = selected.dataset.correct === 'true';
    
    if (isCorrect) {
        sessionStats.quiz++;
        feedback.className = 'feedback-box success';
        feedback.innerHTML = `✅ Верно!`;
    } else {
        feedback.className = 'feedback-box error';
        const correctAnswer = currentQuizData.quiz[quizIdx].opts[currentQuizData.quiz[quizIdx].correct];
        feedback.innerHTML = `❌ Неверно. Правильный ответ: <strong>${correctAnswer}</strong>`;
    }
    
    feedback.classList.remove('hidden');

    // Задержка перед следующим вопросом, чтобы пользователь увидел ответ
    setTimeout(() => {
        quizIdx++;
        if (quizIdx >= currentQuizData.quiz.length) quizIdx = 0;
        loadQuizQuestion();
    }, 1500);
}

// 3. Тест
let testIdx = 0;
function loadTestQuestion() {
    if (!currentQuizData || !currentQuizData.test[testIdx]) return;
    document.getElementById('test-q-text').textContent = currentQuizData.test[testIdx].q;
    document.getElementById('test-input').value = '';
    document.getElementById('test-feedback').classList.add('hidden');
}

function checkTestAnswer() {
    const input = document.getElementById('test-input').value.trim().toLowerCase();
    const correct = currentQuizData.test[testIdx].a.toLowerCase();
    const feedback = document.getElementById('test-feedback');
    
    if (input === correct) {
        sessionStats.test++;
        feedback.className = 'feedback-box success';
        feedback.innerHTML = `✅ Верно!`;
    } else {
        feedback.className = 'feedback-box error';
        feedback.innerHTML = `❌ Неверно. Правильный ответ: <strong>${currentQuizData.test[testIdx].a}</strong>`;
    }
    
    feedback.classList.remove('hidden');

    // Задержка перед следующим
    setTimeout(() => {
        testIdx++;
        if (testIdx >= currentQuizData.test.length) testIdx = 0;
        loadTestQuestion();
    }, 2000);
}

// 4. Верно/Неверно
let tfIdx = 0;
function loadTFQuestion() {
    if (!currentQuizData || !currentQuizData.tf[tfIdx]) return;
    document.getElementById('tf-q-text').textContent = currentQuizData.tf[tfIdx].q;
    document.getElementById('tf-feedback').classList.add('hidden');
}

function checkTF(userAnswer) {
    const correct = currentQuizData.tf[tfIdx].a;
    const feedback = document.getElementById('tf-feedback');
    
    if (userAnswer === correct) {
        sessionStats.tf++;
        feedback.className = 'feedback-box success';
        feedback.innerHTML = `✅ Верно!`;
    } else {
        feedback.className = 'feedback-box error';
        feedback.innerHTML = `❌ Неверно. Правильный ответ: <strong>${correct ? 'Верно' : 'Неверно'}</strong>`;
    }
    
    feedback.classList.remove('hidden');

    // Задержка перед следующим
    setTimeout(() => {
        tfIdx++;
        if (tfIdx >= currentQuizData.tf.length) tfIdx = 0;
        loadTFQuestion();
    }, 1500);
}

// --- ДАННЫЕ (МОК) ---
const mockSets = [
    { id: 1, title: "Основы Python", questions: 20, progress: 45 },
    { id: 2, title: "История России", questions: 15, progress: 80 }
];

function renderSets() {
    const allSetsGrid = document.getElementById('all-sets-grid');
    const recentDashboard = document.getElementById('recent-dashboard-sets');

    if (allSetsGrid) {
        allSetsGrid.innerHTML = mockSets.map(set => `
            <div class="set-card">
                <h3 style="font-family:var(--font-sans); margin-bottom:10px;">${set.title}</h3>
                <p class="text-muted" style="font-size:0.9rem;">Вопросов: ${set.questions}</p>
                <div class="progress-bar"><div class="progress-fill" style="width: ${set.progress}%"></div></div>
            </div>
        `).join('');
    }

    if (recentDashboard) {
        recentDashboard.innerHTML = mockSets.slice(0, 2).map(set => `
            <div class="set-card">
                <h4>${set.title}</h4>
                <p class="text-muted" style="font-size:0.85rem;">Вопросов: ${set.questions}</p>
            </div>
        `).join('');
    }
}