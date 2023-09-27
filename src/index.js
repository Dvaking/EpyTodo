const express = require('express');
const dotenv = require('dotenv');
const bodyParser = require('body-parser');
const path = require('path');

const AuthToken = require('./middleware/auth');
const notFound = require('./middleware/notFound');
const authRoutes = require('./routes/auth/auth');
const userRoutes = require('./routes/user/user');
const usersRoutes = require('./routes/users/users');
const todoRoutes = require('./routes/todos/todos');

dotenv.config();

const port = process.env.PORT || 3000;

const app = express();

const htmlDirecotory = path.join(__dirname, 'html');

app.use(express.static(htmlDirecotory));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.get('/', (req, res) => {
    res.sendFile(path.join(htmlDirecotory, 'index.html'));
});

app.get('/login', (req, res) => {
    res.sendFile(path.join(htmlDirecotory, 'login.html'));
});

app.get('/register', (req, res) => {
    res.sendFile(path.join(htmlDirecotory, 'register.html'));
});

app.use('/', authRoutes);
app.use('/user', AuthToken.TokenVerifying, userRoutes);
app.use('/users', AuthToken.TokenVerifying, usersRoutes);
app.use('/todos', AuthToken.TokenVerifying, todoRoutes);
app.use(notFound);


app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
