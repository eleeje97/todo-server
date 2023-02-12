const express = require('express');
const connection = require('./db');

const app = express();
const port = 3000;


app.get('/', (req, res) => {
    res.send('Hello Express!')
});

app.listen(port, () => {
    console.log(`Todo Server listening on port ${port}`)
});
