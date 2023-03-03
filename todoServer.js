const express = require('express');
const cors = require('cors');
const connection = require('./db');

const app = express();
const port = 3000;
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin: '*'
}));

app.get('/', (req, res) => {
    res.send('Hello Express!')
});


/*** Account API ***/

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


/*** Todo API ***/

// Todo 등록
app.post('/todo/register', (req, res) => {
    const result = {};
    let msg = '';

    let username = req.body.username;
    let user_id = 0;
    let todo = req.body.todo;
    let category = req.body.category;

    result['username'] = username;
    result['todo'] = todo;
    result['category'] = category;

    // username 잘 들어왔는지 확인
    if (!req.body.username) {
        result['msg'] = 'No Username!'
        res.send(result);
        return;
    }

    const sql = `select id from User where username='${username}'`;
    connection.query(sql, (err, results) => {
        if (err) throw err;

        user_id = results[0].id;
        const sql = `insert into Todo(user_id, todo_text, todo_category) values (${user_id}, '${todo}', '${category}')`;
        connection.query(sql, (err, results) => {
            if (err) throw err;

            msg = 'Todo Successfully Registered!';
            result['msg'] = msg;
            console.log('result: ', result);
            res.send(result);
        });
    });

});

// Todo 수정 (todo 내용)
app.put('/todo/update', (req, res) => {

});

// Todo List 조회
app.get('/todo/list', (req, res) => {
    const result = {};
    let username = req.query.username;
    let user_id = 0;

    result['username'] = username;

    // username 잘 들어왔는지 확인
    if (!req.query.username) {
        result['msg'] = 'No Username!'
        res.send(result);
        return;
    }

    const sql = `select id from User where username='${username}'`;
    connection.query(sql, (err, results) => {
        if (err) throw err;

        user_id = results[0].id;
        const sql = `select * from Todo where user_id=${user_id}`;
        connection.query(sql, (err, results) => {
            if (err) throw err;
            
            console.log('results: ', results);
            res.send({"todo list": results});
        });
    });

});

// Todo 체크/체크해제 
app.get('/todo/check/:todo_id', (req, res) => {
    const result = {};
    let username = req.query.username;
    let user_id = 0;

    result['username'] = username;

    // username 잘 들어왔는지 확인
    if (!req.query.username) {
        result['msg'] = 'No Username!'
        res.send(result);
        return;
    }


});

// Todo 삭제
app.delete('/todo/delete/:todo_id', (req, res) => {
    let todo_id = req.params.todo_id;

    const sql = `select todo_id from Todo where todo_id='${todo_id}'`;
    connection.query(sql, (err, results) => {
        if (err) throw err;

        if (results.length === 0) {
            res.send({"msg": "Todo Not Exists"});
            return;
        }

        const sql = `delete from Todo where todo_id=${todo_id}`;
        connection.query(sql, (err, results) => {
            if (err) throw err;
            
            const result = {"todo_id": todo_id,
                            "msg": "Todo Deleted!"};
            console.log(result);
            res.send(result);
        });
    });
    
});

/****************/

app.listen(port, () => {
    console.log(`Todo Server listening on port ${port}`)
});

/*
TODO: todo 관련 API에서 username이 유효한지
TODO: todo list 조회 API에서
1) regDate 날짜 포맷 수정
2) username 추가
3) todo_isCompleted T/F 타입으로 수정
4) todo_id 빼기 -> 안돼 줘야 함
*/ 