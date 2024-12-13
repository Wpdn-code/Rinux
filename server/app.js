const express = require('express');
const bodyParser = require('body-parser');
const db = require('./database'); // MySQL 연결 설정 (database.js 또는 db.js 경로와 파일명 확인)
const path = require('path');
const bcrypt = require('bcrypt');
const session = require('express-session');
const { exec } = require('child_process'); // exec 함수 추가

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, '../public'))); // 정적 파일 제공

app.use(session({
    secret: 'your_secret_key', // 실제 서비스에서는 안전한 비밀키 사용
    resave: false,
    saveUninitialized: false
}));

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
                console.error(err);
                return res.status(500).send('Database error');
            }
            res.status(200).send('Sign-Up Successful!');
        });
    } catch (error) {
        console.error(error);
        res.status(500).send('Error during sign-up');
    }
});

// 로그인 API
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    const query = 'SELECT * FROM users WHERE username = ?';
    db.query(query, [username], async (err, results) => {
        if (err) {
            console.error(err);
            return res.status(500).send('Database error');
        }

        if (results.length > 0) {
            const user = results[0];
            const passwordMatch = await bcrypt.compare(password, user.password); // 비밀번호 검증
            if (passwordMatch) {
                // 로그인 성공 시 세션에 user_id 저장
                req.session.user_id = user.id;
                res.status(200).send('Login Successful!');
            } else {
                res.status(401).send('Invalid Credentials');
            }
        } else {
            res.status(404).send('User not found');
        }
    });
});

// 인증 미들웨어: 로그인 상태 확인
function requireLogin(req, res, next) {
    if (!req.session.user_id) {
        return res.status(401).json({ error: 'Not logged in' });
    }
    next();
}

// 이벤트 조회 API(GET) - 로그인 필요
app.get('/api/events', requireLogin, (req, res) => {
    const user_id = req.session.user_id;

    const sql = "SELECT date, text, done, highlighted FROM events WHERE user_id = ?";
    db.query(sql, [user_id], (err, rows) => {
        if (err) {
            console.error(err);
            return res.status(500).json({error: 'Failed to load events'});
        }

        const events = {};
        rows.forEach(row => {
            const dateStr = row.date.toISOString().split('T')[0];
            if (!events[dateStr]) {
                events[dateStr] = [];
            }
            events[dateStr].push({
                text: row.text,
                done: row.done,
                highlighted: row.highlighted
            });
        });

        res.json(events);
    });
});

// 이벤트 저장 API(POST) - 로그인 필요
// 요청 형식: { "YYYY-MM-DD": [ {text: "...", done: 0/1, highlighted: 0/1}, ... ] }
app.post('/api/events', requireLogin, (req, res) => {
    const user_id = req.session.user_id;
    const data = req.body;

    // 모든 이벤트 삭제 후 재삽입
    const deleteSql = "DELETE FROM events WHERE user_id = ?";
    db.query(deleteSql, [user_id], (err) => {
        if (err) {
            console.error(err);
            return res.status(500).json({error: 'Failed to reset events'});
        }

        const insertSql = "INSERT INTO events (user_id, date, text, done, highlighted) VALUES (?, ?, ?, ?, ?)";
        const tasks = [];

        for (const date in data) {
            const plans = data[date];
            plans.forEach(plan => {
                tasks.push(new Promise((resolve, reject) => {
                    db.query(insertSql, [user_id, date, plan.text, plan.done, plan.highlighted], (err) => {
                        if (err) return reject(err);
                        resolve();
                    });
                }));
            });
        }

        Promise.all(tasks)
            .then(() => {
                res.json({status: 'success'});
            })
            .catch(error => {
                console.error(error);
                res.status(500).json({error: 'Failed to save events'});
            });
    });
});

// 백업 API
app.get('/backup', (req, res) => {
    const backupDir = '/path/to/backup'; // 실제 존재하고 쓰기 권한 있는 디렉토리로 변경
    const backupFile = `${backupDir}/backup_${new Date().toISOString().split('T')[0]}.sql`;
    const cmd = `mysqldump -u root --password=123456 todo_app > ${backupFile}`;

    exec(cmd, (error, stdout, stderr) => {
        if (error) {
            console.error(`Backup error: ${error.message}`);
            return res.status(500).send('Backup failed');
        }
        res.send(`Backup completed successfully. File: ${backupFile}`);
    });
});

// 서버 실행
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
