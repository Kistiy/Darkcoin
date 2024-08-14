const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(cors());

// Подключение к MongoDB
mongoose.connect(process.env.DATABASE_URL, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error(err));

// Модель пользователя
const userSchema = new mongoose.Schema({
    accountNumber: String,
    password: String,
    balance: { type: Number, default: 0 },
    transactions: [String]  // Список последних 10 транзакций
});

const User = mongoose.model('User', userSchema);

// Модель для хранения курса
const rateSchema = new mongoose.Schema({
    rate: { type: Number, default: 1.0 }
});

const Rate = mongoose.model('Rate', rateSchema);

// Получить текущий курс
app.get('/rate', async (req, res) => {
    const rate = await Rate.findOne();
    res.json({ rate: rate.rate.toFixed(3) });  // Округляем до третьего знака
});

// Перевод средств
app.post('/transfer', async (req, res) => {
    const { fromAccount, toAccount, amount } = req.body;

    const sender = await User.findOne({ accountNumber: fromAccount });
    const receiver = await User.findOne({ accountNumber: toAccount });
    const masterAccount = await User.findOne({ accountNumber: 'master' });

    if (!sender || !receiver) {
        return res.status(400).json({ message: 'Account not found' });
    }

    const commission = Math.max(0.05, (amount * 0.05).toFixed(3));  // Минимальная комиссия 0,05 и округление

    const transferAmount = (amount - commission).toFixed(3);  // Округляем до третьего знака
    if (sender.balance < amount) {
        return res.status(400).json({ message: 'Insufficient funds' });
    }

    sender.balance = (sender.balance - amount).toFixed(3);
    receiver.balance = (receiver.balance + parseFloat(transferAmount)).toFixed(3);
    masterAccount.balance = (masterAccount.balance + parseFloat(commission)).toFixed(3);

    sender.transactions.push(`Sent ${amount} to ${toAccount}, Commission: ${commission}`);
    receiver.transactions.push(`Received ${transferAmount} from ${fromAccount}`);
    if (sender.transactions.length > 10) sender.transactions.shift();
    if (receiver.transactions.length > 10) receiver.transactions.shift();

    await sender.save();
    await receiver.save();
    await masterAccount.save();

    res.json({ message: 'Transfer complete' });
});

// Просмотр всех пользователей (для мастер-аккаунта)
app.get('/users', async (req, res) => {
    const users = await User.find();
    res.json(users);
});

// Изменение баланса пользователя (для мастер-аккаунта)
app.post('/update-balance', async (req, res) => {
    const { accountNumber, amount } = req.body;
    const user = await User.findOne({ accountNumber });

    if (!user) {
        return res.status(400).json({ message: 'Account not found' });
    }

    user.balance = amount.toFixed(3);  // Округляем до третьего знака
    await user.save();
    res.json({ message: 'Balance updated' });
});

// Изменение курса DarkCoin (для мастер-аккаунта)
app.post('/update-rate', async (req, res) => {
    const { rate } = req.body;
    const currentRate = await Rate.findOne();

    if (!currentRate) {
        const newRate = new Rate({ rate });
        await newRate.save();
    } else {
        currentRate.rate = rate.toFixed(3);  // Округляем до третьего знака
        await currentRate.save();
    }

    res.json({ message: 'Rate updated' });
});

// Удаление пользователя (для мастер-аккаунта)
app.post('/delete-account', async (req, res) => {
    const { accountNumber } = req.body;
    await User.deleteOne({ accountNumber });
    res.json({ message: 'Account deleted' });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
