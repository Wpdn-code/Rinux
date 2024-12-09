const express = require('express');
const bodyParser = require('body-parser');
const db = require('./database'); // MySQL 연결 설정
const path = require('path');
const bcrypt = require('bcrypt');

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public'))); // HTML, CSS, JS 파일 제공

// 회원가입 API
app.post('/signup', async (req, res) => {
    const { username, email, password } = req.body;

    try {
        const hashedPassword = await bcrypt.hash(password, 10); // 비밀번호 암호화
        const query = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
        db.query(query, [username, email, hashedPassword], (err) => {
            if (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(400).send('Username or Email already exists');
                }
                throw err;
            }
            res.status(200).send('Sign-Up Successful!');
        });
    } catch (error) {
        res.status(500).send('Error during sign-up');
    }
});

// 로그인 API
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    const query = 'SELECT * FROM users WHERE username = ?';
    db.query(query, [username], async (err, results) => {
        if (err) throw err;

        if (results.length > 0) {
            const user = results[0];
            const passwordMatch = await bcrypt.compare(password, user.password); // 비밀번호 검증
            if (passwordMatch) {
                res.status(200).send('Login Successful!');
            } else {
                res.status(401).send('Invalid Credentials');
            }
        } else {
            res.status(404).send('User not found');
        }
    });
});

// 서버 실행
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
