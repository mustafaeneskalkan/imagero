const express = require('express');
const { uploadImage, getImage, getCustomSizedImage, getCroppedImage } = require('../controllers/images');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');
const path = require('path');

const router = express.Router();


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const imageId = uuidv4();
    const ext = path.extname(file.originalname);
    cb(null, imageId + ext);
    req.imageId = imageId;
  },
});


const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type, only images are allowed!'), false);
    }
  },
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB file size limit
  }
});




router.post('/upload', upload.single('image'), uploadImage);

const handleUploadErrors = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        error: 'File too large',
        message: 'File must be less than 50MB'
      });
    }
    return res.status(500).json({
      error: 'Upload error',
      message: err.message
    });
  } else if (err.message.includes('Invalid file type')) {
    return res.status(400).json({
      error: 'Invalid file type',
      message: err.message
    });
  }
  next(err);
};

router.use(handleUploadErrors);


router.get('/id/:id', getImage);

router.get('/:x/:y/:id', getCustomSizedImage);

router.get('/crop/:x/:y/:width/:height/:id', getCroppedImage);

module.exports = router;
