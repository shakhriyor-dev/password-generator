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
const exportBtn = document.getElementById('export-btn');

let passwordHistory = JSON.parse(localStorage.getItem('pw-history')) || [];

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

// Generatsiya funksiyasi
function createPassword() {
    const length = +lengthEl.value;
    const hasLower = lowercaseEl.checked;
    const hasUpper = uppercaseEl.checked;
    const hasNumber = numbersEl.checked;
    const hasSymbol = symbolsEl.checked;

    const typesArr = [{lower: hasLower}, {upper: hasUpper}, {number: hasNumber}, {symbol: hasSymbol}].filter(item => Object.values(item)[0]);
    if (typesArr.length === 0) {
        resultEl.innerText = 'Tanlang!';
        return;
    }

    let generatedPassword = '';
    for (let i = 0; i < length; i += typesArr.length) {
        typesArr.forEach(type => {
            generatedPassword += randomFunc[Object.keys(type)[0]]();
        });
    }
    const finalPassword = generatedPassword.slice(0, length).split('').sort(() => getRandomByte() - 128).join('');
    resultEl.innerText = finalPassword;
    updateStrength(finalPassword);
    return finalPassword;
}

// Tarixga qo'shish
function addToHistory(pw) {
    if (pw === 'Tanlang!' || !pw) return;
    passwordHistory.unshift(pw);
    if (passwordHistory.length > 5) passwordHistory.pop();
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

// Export
exportBtn.addEventListener('click', () => {
    if (passwordHistory.length === 0) return;
    const blob = new Blob(["Pass History:\n" + passwordHistory.join('\n')], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'passwords.txt';
    a.click();
});

// --- AVTOMATIK GENERATSIYA VA SAQLASH ---
[lengthEl, uppercaseEl, lowercaseEl, numbersEl, symbolsEl].forEach(el => {
    el.addEventListener('change', createPassword);
    el.addEventListener('input', () => {
        lengthVal.innerText = lengthEl.value;
        if(el === lengthEl) createPassword();
    });
});

generateEl.addEventListener('click', () => {
    const pw = createPassword();
    addToHistory(pw);
});

// Rangni eslab qolish
accentColorInput.addEventListener('input', (e) => {
    const color = e.target.value;
    document.documentElement.style.setProperty('--neon-blue', color);
    localStorage.setItem('pw-accent', color);
});

themeToggle.addEventListener('click', () => {
    const isLight = document.body.classList.toggle('light-mode');
    themeToggle.querySelector('.mode-icon').innerText = isLight ? '☀️' : '🌙';
    localStorage.setItem('pw-theme', isLight ? 'light' : 'dark');
});

clipboardEl.addEventListener('click', () => {
    const pw = resultEl.innerText;
    if (pw === 'Tanlang!') return;
    navigator.clipboard.writeText(pw).then(() => {
        const oldText = resultEl.innerText;
        resultEl.innerText = 'NUSXALANDI! ✅';
        setTimeout(() => resultEl.innerText = oldText, 1000);
    });
});

clearHistoryBtn.addEventListener('click', () => {
    passwordHistory = [];
    localStorage.removeItem('pw-history');
    renderHistory();
});

function updateStrength(password) {
    let strength = 0;
    if (password.length >= 10) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[^A-Za-z0-9]/.test(password)) strength += 25;
    strengthBar.style.width = strength + '%';
    strengthBar.style.backgroundColor = strength <= 25 ? '#ff4d4d' : strength <= 75 ? '#ffbd2e' : '#2ecc71';
}

// Boshlang'ich holat
const savedColor = localStorage.getItem('pw-accent');
if(savedColor) {
    document.documentElement.style.setProperty('--neon-blue', savedColor);
    accentColorInput.value = savedColor;
}

if (localStorage.getItem('pw-theme') === 'light') {
    document.body.classList.add('light-mode');
    themeToggle.querySelector('.mode-icon').innerText = '☀️';
}
renderHistory();
createPassword();