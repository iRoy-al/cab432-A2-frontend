const express = require('express');
const path = require('path');
const multer = require('multer');
const router = express.Router();

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

router.post('/', upload.single('food_image'), async (req, res) => {
    console.log(req.file)
    res.send("Hi")
});

module.exports = router;