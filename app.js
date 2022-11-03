const express = require('express');
const path = require('path');
const processRouter = require('./src/routes/processRoute');
const app = express();

const hostname = '127.0.0.1';
const port = 3000

app.use(express.json())
app.use(express.static(path.join(__dirname, '/src/public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/src/index.html'));
});

app.use('/process', processRouter);


app.listen(port, function () {
    console.log(`Express app listening at http://${hostname}:${port}/`);
});