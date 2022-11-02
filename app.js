const express = require('express');
const path = require('path');
const testRouter = require('./routes/testRoute');
const app = express();

const hostname = '127.0.0.1';
const port = 3000

app.use(express.json())
app.use(express.static(path.join(__dirname, '/public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/index.html'));
});

app.use('/test', testRouter);


app.listen(port, function () {
    console.log(`Express app listening at http://${hostname}:${port}/`);
});