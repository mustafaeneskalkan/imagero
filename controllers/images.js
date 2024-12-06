const sharp = require('sharp');
const fs = require('fs');
const logger = require('../logger');
const path = require('path');


const APP_URL = process.env.APP_URL || 'https://imagero.yourdomain.com';

exports.uploadImage = async (req, res) => {
  try {
    const { originalname, size } = req.file; // No need to get `path` here
    const imageId = req.imageId; // Use the imageId from multer storage
    const date = new Date().toISOString();

    logger.http(`Received upload request for originalName: ${originalname}, size: ${size}`);

    const imageUrl = `${APP_URL}/api/images/id/${imageId}`;
    const resizedImageUrl = `${APP_URL}/api/images/width/height/${imageId}`;
    const croppedImageUrl = `${APP_URL}/api/images/crop/x:start/y:start/width/height/${imageId}`;

    res.json({
      message: `Image uploaded: Image Id: ${imageId}, Filename: ${originalname}`,
      data: {
        imageId,
        originalName: originalname,
        size,
        createdAt: date,
        fullImageUrl: imageUrl,
        resizedImageUrl: resizedImageUrl,
        croppedImageUrl: croppedImageUrl,
      },
    });

    logger.debug(`Image uploaded: Image Id: ${imageId}, Filename: ${originalname}, Size: ${size}`);
  } catch (err) {
    logger.error('Error in uploadImage: ' + err);
    res.status(500).json({ error: err.message });
  }
};

exports.getImage = async (req, res) => {
  const imageId = req.params.id;

  logger.http(`Received request for image. Image Id: ${imageId}`);

  try {
    const uploadsDir = 'uploads/';
    const matchingFiles = fs.readdirSync(uploadsDir)
      .filter(file => file.startsWith(imageId));

    if (matchingFiles.length === 0) {
      logger.info('Image not found for Image Id: ' + imageId);
      return res.status(404).json({ error: 'Image not found' });
    }

    // Take the first matching file (there should only be one)
    const filename = matchingFiles[0];
    const imagePath = path.join(uploadsDir, filename);

    if (fs.existsSync(imagePath)) {
      logger.debug(`Sending original image: ${imagePath}`);
      res.sendFile(imagePath, { root: '.' }, (err) => {
        if (err) {
          logger.error('Error sending image file: ' + err);
          res.status(500).json({ error: 'Error sending image file' });
        }
      });
    } else {
      logger.info('Image not found for Image Id: ' + imageId);
      res.status(404).json({ error: 'Image not found' });
    }
  } catch (err) {
    logger.error('Error in getImage: ' + err);
    res.status(500).json({ error: err.message });
  }
};

exports.getCustomSizedImage = async (req, res) => {
  const { x, y, id: imageId } = req.params;
  const width = parseInt(x, 10);
  const height = parseInt(y, 10);

  logger.http(`Received request for custom-sized image. Image Id: ${imageId}, Dimensions: ${width}x${height}`);

  if (isNaN(width) || isNaN(height)) {
    logger.warn('Invalid dimensions provided: ' + x, y);
    return res.status(400).json({ error: 'Invalid dimensions provided' });
  }

  try {
    const uploadsDir = 'uploads/';
    const matchingFiles = fs.readdirSync(uploadsDir)
      .filter(file => file.startsWith(imageId));

    if (matchingFiles.length === 0) {
      logger.info('Original image not found for Image Id: ' + imageId);
      return res.status(404).json({ error: 'Original image not found' });
    }

    const originalFilename = matchingFiles[0];
    const imagePath = path.join(uploadsDir, originalFilename);
    const fileExt = path.extname(originalFilename);

    // Create resized directory if it doesn't exist
    const resizedDir = 'resized/';
    if (!fs.existsSync(resizedDir)) {
      fs.mkdirSync(resizedDir, { recursive: true });
    }

    const resizedPath = path.join(resizedDir, `${width}x${height}-${imageId}${fileExt}`);

    if (fs.existsSync(resizedPath)) {
      logger.debug(`Returning cached resized image: ${resizedPath}`);
      return res.sendFile(resizedPath, { root: '.' });
    }

    logger.debug(`Resizing image: ${imagePath} to ${resizedPath}`);
    sharp(imagePath)
      .resize(width, height, { fit: 'fill' })
      .toFile(resizedPath, (err) => {
        if (err) {
          logger.error('Image generation failed: ' + err);
          return res.status(500).json({ error: 'Image generation failed' });
        }

        res.sendFile(resizedPath, { root: '.' });
      });
  } catch (err) {
    logger.error('Error processing custom-sized image: ' + err);
    res.status(500).json({ error: err.message });
  }
};

exports.getCroppedImage = async (req, res) => {
  const { x, y, width, height, id: imageId } = req.params;
  const xP = parseInt(x, 10);
  const yP = parseInt(y, 10);
  const widthP = parseInt(width, 10);
  const heightP = parseInt(height, 10);


  logger.http(`Received request for cropped image. Image Id: ${imageId}, Crop Area: ${x},${y},${width},${height}`);

  if (isNaN(xP) || isNaN(yP) || isNaN(widthP) || isNaN(heightP)) {
    logger.warn('Invalid crop dimensions provided: ' + x + ',' + y + ',' + width + ',' + height);
    return res.status(400).json({ error: 'Invalid crop dimensions provided' });
  }

  try {
    const uploadsDir = 'uploads/';
    const matchingFiles = fs.readdirSync(uploadsDir)
      .filter(file => file.startsWith(imageId));

    if (matchingFiles.length === 0) {
      logger.info('Original image not found for Image Id: ' + imageId);
      return res.status(404).json({ error: 'Original image not found' });
    }

    const originalFilename = matchingFiles[0];
    const imagePath = path.join(uploadsDir, originalFilename);
    const fileExt = path.extname(originalFilename);

    // Create cropped directory if it doesn't exist
    const croppedDir = 'cropped/';
    if (!fs.existsSync(croppedDir)) {
      fs.mkdirSync(croppedDir, { recursive: true });
    }

    const croppedPath = path.join(croppedDir, `${x}x${y}-${width}x${height}-${imageId}${fileExt}`);

    if (fs.existsSync(croppedPath)) {
      logger.debug(`Returning cached cropped image: ${croppedPath}`);
      return res.sendFile(croppedPath, { root: '.' });
    }

    logger.debug(`Cropping image: ${imagePath} to ${croppedPath} at (${x}, ${y}), size: ${width}x${height}`);
    sharp(imagePath)
      .extract({ left: xP, top: yP, width: widthP, height: heightP })
      .toFile(croppedPath, (err) => {
        if (err) {
          logger.error('Image cropping failed: ' + err);
          return res.status(500).json({ error: 'Image cropping failed. Please check the cropping parameters and try again.' });
        }

        res.sendFile(croppedPath, { root: '.' });
      });
  } catch (err) {
    logger.error('Error processing cropped image: ' + err);
    res.status(500).json({ error: err.message });
  }
};
