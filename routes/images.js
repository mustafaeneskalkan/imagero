const express = require('express');
const { uploadImage, getImage, getCustomSizedImage, getCroppedImage } = require('../controllers/images');
const multer = require('multer');
const { v4: uuidv4 } = require('uuid');


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const imageId = uuidv4();
    cb(null, imageId + '.jpg');
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
});


const router = express.Router();


router.post('/upload', upload.single('image'), uploadImage);

router.get('/id/:id', getImage);

router.get('/:x/:y/:id', getCustomSizedImage);

router.get('/crop/:x/:y/:width/:height/:id', getCroppedImage);

module.exports = router;
