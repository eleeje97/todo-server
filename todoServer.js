const express = require('express');
const connection = require('./db');

const app = express();
const port = 3000;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.send('Hello Express!')
});

// 전체 사용자 조회
app.get('/account/users', (req, res) => {
    const sql = 'select username from User';
    connection.query(sql, (err, results) => {
        if (err) throw err;

        let users = [];
        for (let i = 0; i < results.length; i++) {
            users.push(results[i].username);
        }
        let result = {"users": users}
        console.log(result);
        res.send(result);
    });
});

// 회원가입
app.post('/account/signup', (req, res) => {
    const result = {};
    let msg = '';
    result['username'] = req.body.username;

    // Body 잘 들어왔는지 확인
    if (!req.body.username) {
        result['msg'] = 'No Username!'
        res.send(result);
        return;
    }

    if (!req.body.password) {
        result['msg'] = 'No Password!'
        res.send(result);
        return;
    }
        
    const sql = `select * from User where username='${req.body.username}'`;
    connection.query(sql, (err, results) => {
        if (err) throw err;
        
        // id 중복 체크
        if (results.length > 0) {
            msg = 'User Already Exists';
            result['msg'] = msg;
            console.log('result: ', result);
            res.send(result);
        } else {
            // DB에 저장
            const sql = `insert into User(username, password) values ('${req.body.username}', '${req.body.password}')`;
            connection.query(sql, (err, results) => {
                if (err) throw err;
                msg = 'Account Successfully Created!';
                result['msg'] = msg;
                console.log('result: ', result);
                res.send(result);
            });
        } 
    });

});

// 로그인
app.get('/account/login', (req, res) => {
    const result = {};
    let msg = '';
    result['username'] = req.query.username;

    // 쿼리스트링 잘 들어왔는지 확인
    if (!req.query.username) {
        result['msg'] = 'No Username!'
        res.send(result);
        return;
    }

    if (!req.query.password) {
        result['msg'] = 'No Password!'
        res.send(result);
        return;
    }

    const sql = `select password from User where username='${req.query.username}'`;
    connection.query(sql, (err, results) => {
        if (err) throw err;

        // 존재하는 회원인지 확인
        if (results.length === 0) {
            msg = 'User Not Found';
        } else {
            // 비밀번호 확인
            if (req.query.password == results[0].password) {
                msg = 'Login Success!';
            } else {
                msg = 'Password Incorrect';
            }
        }
        
        result['msg'] = msg;
        console.log('result: ', result);
        res.send(result);
    });
});


app.listen(port, () => {
    console.log(`Todo Server listening on port ${port}`)
});
