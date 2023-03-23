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
        res.status(400).send(result);
        return;
    }

    if (!req.body.password) {
        result['msg'] = 'No Password!'
        res.status(400).send(result);
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
            res.status(409).send(result);
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
app.post('/account/login', (req, res) => {
    const result = {};
    let msg = '';
    result['username'] = req.body.username;

    // Body 잘 들어왔는지 확인
    if (!req.body.username) {
        result['msg'] = 'No Username!'
        res.status(400).send(result);
        return;
    }

    if (!req.body.password) {
        result['msg'] = 'No Password!'
        res.status(400).send(result);
        return;
    }

    const sql = `select password from User where username='${req.body.username}'`;
    connection.query(sql, (err, results) => {
        if (err) throw err;

        // 존재하는 회원인지 확인
        if (results.length === 0) {
            msg = 'User Not Found';
            res.status(400);
        } else {
            // 비밀번호 확인
            if (req.body.password == results[0].password) {
                msg = 'Login Success!';
            } else {
                msg = 'Password Incorrect';
                res.status(401);
            }
        }
        
        result['msg'] = msg;
        console.log('result: ', result);
        res.send(result);
    });
});


/*** Todo API ***/

// Todo 등록
app.post('/todo', (req, res) => {
    const result = {};
    let msg = '';

    let username = req.body.username;
    let user_id = 0;
    let todo = req.body.todo;
    let category = req.body.category;
    let date = req.body.date;

    result['username'] = username;
    result['todo'] = todo;
    result['category'] = category;
    result['date'] = date;

    // username 잘 들어왔는지 확인
    if (!req.body.username) {
        result['msg'] = 'No Username!'
        res.status(400).send(result);
        return;
    }

    const sql = `select id from User where username='${username}'`;
    connection.query(sql, (err, results) => {
        if (err) throw err;

        user_id = results[0].id;
        const sql = `insert into Todo(user_id, todo_text, todo_category, todo_date) values (${user_id}, '${todo}', '${category}', '${date}')`;
        connection.query(sql, (err, results) => {
            if (err) throw err;

            msg = 'Todo Successfully Registered!';
            result['msg'] = msg;
            console.log('result: ', result);
            res.send(result);
        });
    });

});

// Todo 수정 
app.patch('/todo/:todo_id', (req, res) => {
    const result = {};

    let todo_id = req.params.todo_id;

    const sql = `select todo_isCompleted, todo_text from Todo where todo_id='${todo_id}'`;
    connection.query(sql, (err, results) => {
        if (err) throw err;

        if (results.length === 0) {
            res.status(404).send({"msg": "Todo Not Exists"});
            return;
        }

        let todo_isCompleted = results[0].todo_isCompleted == 1 ? true : false;
        let todo_text = results[0].todo_text;

        if (typeof(req.body.todo_isCompleted) === 'boolean') {
            todo_isCompleted = req.body.todo_isCompleted;
        } else if (req.body.todo_isCompleted !== undefined) {
            res.status(400).send({"msg": "todo_isCompleted must be boolean type"});
            return;
        }

        if (req.body.todo_text) {
            todo_text = req.body.todo_text;
        }

        const sql = `update Todo set todo_isCompleted=${todo_isCompleted}, todo_text='${todo_text}' where todo_id=${todo_id}`;
        connection.query(sql, (err, results) => {
            if (err) throw err;
            
            const result = {"todo_id": todo_id,
                            "todo_isCompleted": todo_isCompleted,
                            "todo_text": todo_text};
            console.log(result);
            res.send(result);
        });
    });
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
        res.status(400).send(result);
        return;
    }

    const sql = `select id from User where username='${username}'`;
    connection.query(sql, (err, results) => {
        if (err) throw err;

        user_id = results[0].id;
        const sql = `select * from Todo where user_id=${user_id}`;
        connection.query(sql, (err, results) => {
            if (err) throw err;
            
            for (const idx in results) {
                results[idx].todo_isCompleted = results[idx].todo_isCompleted == 1 ? true : false;
            }

            console.log('results: ', results);
            res.send({"todo list": results});
        });
    });

});


// Todo 삭제
app.delete('/todo/:todo_id', (req, res) => {
    let todo_id = req.params.todo_id;

    const sql = `select todo_id from Todo where todo_id='${todo_id}'`;
    connection.query(sql, (err, results) => {
        if (err) throw err;

        if (results.length === 0) {
            res.status(404).send({"msg": "Todo Not Exists"});
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
