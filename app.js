const express = require('express');
const path = require('path');
const processRouter = require('./src/routes/processRoute');
const { processImage } = require('./src/processImage');
const app = express();

const hostname = '127.0.0.1';
const port = 3000

app.use(express.json())
app.use(express.static(path.join(__dirname, '/src/public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '/public/src/index.html'));
});

app.use('/process', processRouter);

app.post('/api/process', async (req, res) => {
    try{
        const {key, resize, compression} = req.body

        const result = await processImage(key, resize, compression);

        console.log(`Processed Image Key: ${result.key}`)
        
        res.status(200).json(result);
    }
    catch (error) {
        res.status(error.statusCode).json({ error: error.error})
    }
});

app.get('/health', (req, res) => {
    res.status(200).json({ health: "Healthy"})
})

app.listen(port, function () {
    console.log(`Express app listening at http://${hostname}:${port}/`);
});