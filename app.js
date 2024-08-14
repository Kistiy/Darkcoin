const apiUrl = 'https://your-render-app-url.onrender.com';  // Замените на ваш URL

// Функция для входа пользователя
async function login() {
    const accountNumber = document.getElementById('fromAccount').value;
    const password = document.getElementById('password').value;

    const response = await fetch(`${apiUrl}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountNumber, password })
    });

    const result = await response.json();

    if (result.success) {
        alert('Login successful');
        // Загрузка соответствующего интерфейса для пользователя или мастера
        loadUserInterface(result.isMaster);
    } else {
        alert('Login failed: ' + result.message);
    }
}

// Функция для получения текущего курса
async function fetchRate() {
    const response = await fetch(`${apiUrl}/rate`);
    const data = await response.json();
    document.getElementById('rateDisplay').textContent = `Current DarkCoin Rate: ${data.rate}`;
}

// Функция для перевода средств
async function transfer() {
    const fromAccount = document.getElementById('fromAccount').value;
    const toAccount = document.getElementById('toAccount').value;
    const amount = parseFloat(document.getElementById('amount').value);

    const response = await fetch(`${apiUrl}/transfer`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fromAccount, toAccount, amount })
    });

    const result = await response.json();
    alert(result.message);
}

// Функция для изменения курса (для мастер-аккаунта)
async function updateRate() {
    const newRate = parseFloat(prompt('Enter new DarkCoin rate:'));
    const response = await fetch(`${apiUrl}/update-rate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rate: newRate })
    });

    const result = await response.json();
    alert(result.message);
    fetchRate();  // Обновляем отображение курса
}

// Функция для создания нового аккаунта (для мастер-аккаунта)
async function createAccount() {
    const accountNumber = prompt('Enter new account number:');
    const password = prompt('Enter password for new account:');
    
    const response = await fetch(`${apiUrl}/create-account`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountNumber, password })
    });

    const result = await response.json();
    alert(result.message);
}

// Функция для удаления аккаунта (для мастер-аккаунта)
async function deleteAccount() {
    const accountNumber = prompt('Enter the account number to delete:');
    
    const response = await fetch(`${apiUrl}/delete-account`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountNumber })
    });

    const result = await response.json();
    alert(result.message);
}

// Функция для изменения баланса аккаунта (для мастер-аккаунта)
async function updateBalance() {
    const accountNumber = prompt('Enter account number to update balance:');
    const amount = parseFloat(prompt('Enter new balance:'));
    
    const response = await fetch(`${apiUrl}/update-balance`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountNumber, amount })
    });

    const result = await response.json();
    alert(result.message);
}

// Функция для изменения пароля аккаунта (пользовательская)
async function changePassword() {
    const accountNumber = document.getElementById('fromAccount').value;
    const newPassword = prompt('Enter new password:');
    
    const response = await fetch(`${apiUrl}/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accountNumber, newPassword })
    });

    const result = await response.json();
    alert(result.message);
}

// Функция для получения и отображения последних 10 транзакций (для пользователя)
async function fetchTransactions() {
    const accountNumber = document.getElementById('fromAccount').value;
    
    const response = await fetch(`${apiUrl}/transactions/${accountNumber}`);
    const data = await response.json();
    
    const transactionsList = document.getElementById('transactionsList');
    transactionsList.innerHTML = '';
    data.transactions.forEach(transaction => {
        const li = document.createElement('li');
        li.textContent = transaction;
        transactionsList.appendChild(li);
    });
}

// Функция для загрузки интерфейса после входа
function loadUserInterface(isMaster) {
    // Показываем или скрываем определенные элементы в зависимости от роли пользователя
    if (isMaster) {
        // Показать элементы интерфейса для мастер-аккаунта
        document.getElementById('masterControls').style.display = 'block';
    } else {
        // Показать элементы интерфейса для обычного пользователя
        document.getElementById('userControls').style.display = 'block';
    }
}

// Вызов функции для получения курса при загрузке страницы
document.addEventListener('DOMContentLoaded', fetchRate);
