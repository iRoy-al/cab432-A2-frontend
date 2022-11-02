const express = require('express');
const path = require('path');
const app = express();

const hostname = '127.0.0.1';
const port = 3000

app.use('/static', express.static('public'))

app.get('/', async (req, res) => {
    res.sendFile(path.join(__dirname, '/index.html'))
});

app.listen(port, function () {
    console.log(`Express app listening at http://${hostname}:${port}/`);
});