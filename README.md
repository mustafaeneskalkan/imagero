# Imagero - Image Upload and Hosting API

Imagero is a Node.js-based API that allows users to upload images, resize them, and crop them on the fly. The API generates direct URLs for each image in its various formats (original, resized, and cropped), making it easy to integrate image uploading and serving into your web applications.

## Features
- **Image Upload**: Allows users to upload images and generates unique image IDs.
- **Image Resizing**: Resize uploaded images to custom dimensions.
- **Image Cropping**: Crop images based on user-specified dimensions.
- **Dynamic Image URLs**: Each image has its own URL for the full, resized, and cropped versions.

## Getting Started

### Prerequisites
- Ensure you have [Node.js](https://nodejs.org/) and [npm](https://www.npmjs.com/) installed.

### Installation
1. **Clone the repository:**
   ```bash
   git clone https://github.com/mustafaeneskalkan/imagero.git
   cd imagero
2. **Install dependencies:**
   ```bash
   npm i
3. **Configure the .env File for Your Setup**
4. **Run the app!** 
   ```bash
   node index.js
   or
   You can use a tool like PM2

## API Endpoints

### 1. **Upload Image**

- **Endpoint**: `POST /api/images/upload`
- **Description**: Upload an image and receive a response with the URLs for the original, resized, and cropped versions.
- **Request**: Form-data containing the image file.
  - Key: `image` (file)
- **Response**: A JSON object with the following fields:
  - `imageId`: The unique ID for the image.
  - `originalName`: The original name of the uploaded file.
  - `size`: The size of the uploaded image in bytes.
  - `createdAt`: The timestamp of when the image was uploaded.
  - `fullImageUrl`: URL to the original image.
  - `resizedImageUrl`: URL to the resized image.
  - `croppedImageUrl`: URL to the cropped image.
  
Example:

```json
{
  "message": "Image uploaded: Image Id: <imageId>, Filename: <originalName>",
  "data": {
    "imageId": "<imageId>",
    "originalName": "<originalName>",
    "size": 12345,
    "createdAt": "2024-11-18T13:45:30.123Z",
    "fullImageUrl": "<APP_URL>/api/images/id/:imageId",
    "resizedImageUrl": "<APP_URL>/api/images/200/300/:imageId",
    "croppedImageUrl": "<APP_URL>/api/images/crop/0:0/100:100/:imageId"
  }
}
```

### 2. **Get Original Image**

- **Endpoint**: `GET /api/images/id/:imageId`
- **Description**: Fetch the original uploaded image by its `imageId`.
- **Direct Access**: You can directly access the original image by using the URL: ```<APP_URL>/api/images/id/:imageId```

### 3. **Get Resized Image**

- **Endpoint**: `GET /api/images/:x/:y/:imageId`
- **Description**: Fetch a resized image with custom dimensions (width and height).
    *x: Desired width.*
    *y: Desired height.*
- **Direct Access**: You can directly access the resized image by using the URL: ```<APP_URL>/api/images/:width/:height/:imageId```

### 4. **Get Cropped Image**

- **Endpoint**: `GET /api/images/crop/:x:start/:y:start/:width/:height/:imageId`
- **Description**: Fetch a cropped image based on the coordinates (x, y) and desired dimensions (width, height).
    *x:start The x-coordinate of the crop's top-left corner..*
    *y:start The y-coordinate of the crop's top-left corner.*
    *width: Desired width.*
    *height: Desired height.*
- **Direct Access**: You can directly access the resized image by using the URL: ```<APP_URL>/api/images/crop/:x:start/:y:start/:width/:height/:imageId```

## How It Works

- Once an image is uploaded through the `/upload` endpoint, it is stored in the `uploads/` directory.
- Each image gets a unique ID generated using `uuid`, and the image file is saved using that ID as the filename.
- You can directly use the image URLs to access:
  - The original image via `/api/images/id/:id`.
  - The resized image via `/api/images/:x/:y/:id`.
  - The cropped image via `/api/images/crop/:x:start/:y:start/:width/:height/:id`.
- These images are served directly from the server, and you can use these URLs in your applications without needing to make an API request each time.
- For resized and cropped images, the server automatically caches them in the `resized/` and `cropped/` directories to avoid reprocessing the image on subsequent requests.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

