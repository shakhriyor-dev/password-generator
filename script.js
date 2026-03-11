const resultEl = document.getElementById('result');
const lengthEl = document.getElementById('length');
const lengthVal = document.getElementById('length-val');
const uppercaseEl = document.getElementById('uppercase');
const lowercaseEl = document.getElementById('lowercase');
const numbersEl = document.getElementById('numbers');
const symbolsEl = document.getElementById('symbols');
const generateEl = document.getElementById('generate');
const clipboardEl = document.getElementById('clipboard');
const strengthBar = document.getElementById('strength-bar');
const accentColorInput = document.getElementById('accent-color');
const themeToggle = document.getElementById('theme-toggle');
const historyList = document.getElementById('password-history');
const clearHistoryBtn = document.getElementById('clear-history');

let passwordHistory = JSON.parse(localStorage.getItem('pw-history')) || [];

// 1. Xavfsiz generatsiya mantiqi
const getRandomByte = () => {
    const array = new Uint8Array(1);
    window.crypto.getRandomValues(array);
    return array[0];
};

const randomFunc = {
    lower: () => String.fromCharCode((getRandomByte() % 26) + 97),
    upper: () => String.fromCharCode((getRandomByte() % 26) + 65),
    number: () => String.fromCharCode((getRandomByte() % 10) + 48),
    symbol: () => "!@#$%^&*()_+~`|}{[]:;?><,./-=".charAt(getRandomByte() % 29)
};

// 2. Parol yaratish
function generatePassword(lower, upper, number, symbol, length) {
    let generatedPassword = '';
    const typesArr = [{lower}, {upper}, {number}, {symbol}].filter(item => Object.values(item)[0]);
    if (typesArr.length === 0) return 'Tanlang!';

    for (let i = 0; i < length; i += typesArr.length) {
        typesArr.forEach(type => {
            generatedPassword += randomFunc[Object.keys(type)[0]]();
        });
    }
    const finalPassword = generatedPassword.slice(0, length).split('').sort(() => getRandomByte() - 128).join('');
    
    addToHistory(finalPassword);
    return finalPassword;
}

// 3. Tarixni boshqarish
function addToHistory(pw) {
    if (pw === 'Tanlang!') return;
    passwordHistory.unshift(pw); // Boshiga qo'shish
    if (passwordHistory.length > 5) passwordHistory.pop(); // Faqat 5 tasini saqlash
    localStorage.setItem('pw-history', JSON.stringify(passwordHistory));
    renderHistory();
}

function renderHistory() {
    historyList.innerHTML = passwordHistory.map(pw => `
        <li class="history-item" onclick="copyFromHistory('${pw}')">
            <span>${pw.substring(0, 15)}${pw.length > 15 ? '...' : ''}</span>
            <small>📋</small>
        </li>
    `).join('');
}

window.copyFromHistory = (pw) => {
    navigator.clipboard.writeText(pw);
    resultEl.innerText = pw;
    updateStrength(pw);
};

clearHistoryBtn.addEventListener('click', () => {
    passwordHistory = [];
    localStorage.removeItem('pw-history');
    renderHistory();
});

// 4. Event Listeners
generateEl.addEventListener('click', () => {
    const length = +lengthEl.value;
    const password = generatePassword(lowercaseEl.checked, uppercaseEl.checked, numbersEl.checked, symbolsEl.checked, length);
    resultEl.innerText = password;
    updateStrength(password);
});

lengthEl.addEventListener('input', () => lengthVal.innerText = lengthEl.value);

accentColorInput.addEventListener('input', (e) => {
    document.documentElement.style.setProperty('--neon-blue', e.target.value);
});

themeToggle.addEventListener('click', () => {
    const isLight = document.body.classList.toggle('light-mode');
    themeToggle.querySelector('.mode-icon').innerText = isLight ? '☀️' : '🌙';
    localStorage.setItem('pw-theme', isLight ? 'light' : 'dark');
});

clipboardEl.addEventListener('click', () => {
    const password = resultEl.innerText;
    if (!password || password === 'Tanlang!') return;
    navigator.clipboard.writeText(password).then(() => {
        const originalText = resultEl.innerText;
        resultEl.innerText = 'NUSXALANDI! ✅';
        setTimeout(() => resultEl.innerText = originalText, 1000);
    });
});

function updateStrength(password) {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (password.length >= 14) strength += 25;
    if (/[0-9]/.test(password) && /[a-z]/.test(password)) strength += 25;
    if (/[^A-Za-z0-9]/.test(password)) strength += 25;
    strengthBar.style.width = strength + '%';
    strengthBar.style.backgroundColor = strength <= 25 ? 'var(--danger)' : strength <= 75 ? 'var(--warning)' : 'var(--success)';
}

// Dastlabki yuklash
renderHistory();
if (localStorage.getItem('pw-theme') === 'light') {
    document.body.classList.add('light-mode');
    themeToggle.querySelector('.mode-icon').innerText = '☀️';
}