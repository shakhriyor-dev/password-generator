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

// Xavfsiz tasodifiy son olish (Web Crypto API)
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

lengthEl.addEventListener('input', () => {
    lengthVal.innerText = lengthEl.value;
});

generateEl.addEventListener('click', () => {
    const length = +lengthEl.value;
    const hasLower = lowercaseEl.checked;
    const hasUpper = uppercaseEl.checked;
    const hasNumber = numbersEl.checked;
    const hasSymbol = symbolsEl.checked;

    const password = generatePassword(hasLower, hasUpper, hasNumber, hasSymbol, length);
    resultEl.innerText = password;
    updateStrength(password);
});

function generatePassword(lower, upper, number, symbol, length) {
    let generatedPassword = '';
    const typesCount = lower + upper + number + symbol;
    const typesArr = [{lower}, {upper}, {number}, {symbol}].filter(item => Object.values(item)[0]);

    if (typesCount === 0) return 'Tanlang!';

    for (let i = 0; i < length; i += typesCount) {
        typesArr.forEach(type => {
            const funcName = Object.keys(type)[0];
            generatedPassword += randomFunc[funcName]();
        });
    }

    return generatedPassword.slice(0, length).split('').sort(() => getRandomByte() - 128).join('');
}

// Parol kuchini yangilash
function updateStrength(password) {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (password.length >= 14) strength += 25;
    if (/[0-9]/.test(password) && /[a-z]/.test(password) && /[A-Z]/.test(password)) strength += 25;
    if (/[^A-Za-z0-9]/.test(password)) strength += 25;

    strengthBar.style.width = strength + '%';
    
    if (strength <= 25) strengthBar.style.backgroundColor = 'var(--danger)';
    else if (strength <= 75) strengthBar.style.backgroundColor = 'var(--warning)';
    else strengthBar.style.backgroundColor = 'var(--success)';
}

clipboardEl.addEventListener('click', () => {
    const password = resultEl.innerText;
    if (!password || password === 'Tanlang!') return;
    navigator.clipboard.writeText(password).then(() => {
        const originalText = resultEl.innerText;
        resultEl.innerText = 'NUSXALANDI!';
        setTimeout(() => resultEl.innerText = originalText, 1000);
    });
});