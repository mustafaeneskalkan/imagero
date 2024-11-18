require('dotenv').config();
const logger = require('./logger');

const express = require('express');
const cors = require('cors');
const imageRoutes = require('./routes/images');
const fs = require('fs');

const app = express();
app.use(cors());

const port = process.env.PORT || 3000;

const ensureDirectories = () => {
  ['uploads', 'resized', 'cropped'].forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir);
    }
  });
};
ensureDirectories();

app.use('/api/images', imageRoutes);

app.listen(port, () => {
  console.log(`Imagero is running on port ${port}`);
});