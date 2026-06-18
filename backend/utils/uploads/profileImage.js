const multer = require("multer");

const storage = multer.diskStorage({
    destination: 'uploads/images/',
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname);
    }
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // 2MB
    fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
            return cb(new Error('ONLY_IMAGES_ALLOWED'));
        }
        cb(null, true);
    }
});

module.exports = upload