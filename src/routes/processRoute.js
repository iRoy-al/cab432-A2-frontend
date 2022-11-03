const express = require('express');
const path = require('path');
const multer = require('multer');
const { handleRequest } = require('../requestHandler');
const router = express.Router();
// const result = "";

const upload = multer({
    storage: multer.memoryStorage({}),
    limits: { fileSize: 2000000 },
    fileFilter (_req, file, callback) {
        const filetypes = /jpeg|jpg|png/;
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = filetypes.test(file.mimetype);
        if (mimetype && extname) {
            return callback(null, true);
        } else {
            callback('Error: Wrong image type');
        }
    }
});

router.post('/', upload.array('image'), async (req, res, next) => {
    try{
        const { resize, compression } = req.body;
        const url = await handleRequest(req.files, resize, compression);
        const downloadLink = {"downloadURL": url};
        res.send(downloadLink);
    }
    catch (error) {
        res.status(error.statusCode).json({ error: error.error})
    }
});

// router.get('/download', (req, res) => {
//     res.send(result);
// })

module.exports = router;