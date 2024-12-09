const mysql = require('mysql');

// MySQL 연결 설정
const db = mysql.createConnection({
    host: 'localhost',
    user: 'root', // MySQL 사용자 이름
    password: '123456', // MySQL 비밀번호
    database: 'todo_app', // 데이터베이스 이름
});

// 연결
db.connect((err) => {
    if (err) {
        console.error('MySQL connection failed:', err);
        throw err;
    }
    console.log('Connected to MySQL Database');
});

module.exports = db;
