import { Request, Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import multer from 'multer';

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Exercise library file path
const EXERCISE_LIBRARY_PATH = path.join(__dirname, '..', '..', 'exerciseLibrary.json');

// Create uploads directory if it doesn't exist
const UPLOADS_DIR = path.join(__dirname, '..', '..', 'uploads', 'exercise-images');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    // Create unique filename with timestamp and random string
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 8);
    const extension = path.extname(file.originalname).toLowerCase();
    cb(null, `${timestamp}-${randomString}${extension}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Accept only image files
    const allowedTypes = /jpeg|jpg|png|gif|bmp|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed (JPEG, PNG, GIF, BMP, WebP)'));
    }
  }
});

// Load existing exercise library
function loadExerciseLibrary(): any {
  try {
    if (fs.existsSync(EXERCISE_LIBRARY_PATH)) {
      const data = fs.readFileSync(EXERCISE_LIBRARY_PATH, 'utf8');
      return JSON.parse(data);
    }
    return {};
  } catch (error) {
    console.error('Error loading exercise library:', error);
    return {};
  }
}

// Save exercise library
function saveExerciseLibrary(library: any): void {
  try {
    fs.writeFileSync(EXERCISE_LIBRARY_PATH, JSON.stringify(library, null, 2));
    console.log('Exercise library saved successfully');
  } catch (error) {
    console.error('Error saving exercise library:', error);
    throw error;
  }
}

export async function registerExerciseImageUploadRoutes(app: any) {
  // POST /api/ai/exercise-image/upload - Upload custom exercise image
  app.post('/api/ai/exercise-image/upload', upload.single('image'), async (req: Request, res: Response) => {
    try {
      const { exerciseName, style = 'custom' } = req.body;
      const file = req.file;

      if (!exerciseName || !exerciseName.trim()) {
        return res.status(400).json({
          success: false,
          error: 'Exercise name is required'
        });
      }

      if (!file) {
        return res.status(400).json({
          success: false,
          error: 'Image file is required'
        });
      }

      const normalizedName = exerciseName.toLowerCase().trim();
      const imageUrl = `/uploads/exercise-images/${file.filename}`;

      console.log(`\ud83d\udce4 Uploading custom image for exercise: "${exerciseName}"`);

      // Load exercise library
      const exerciseLibrary = loadExerciseLibrary();

      // Initialize exercise entry if it doesn't exist
      if (!exerciseLibrary[normalizedName]) {
        exerciseLibrary[normalizedName] = {
          exerciseName,
          images: [],
          createdAt: new Date().toISOString()
        };
      }

      // Add uploaded image as a new variation
      const newImage = {
        id: Date.now().toString(),
        url: imageUrl,
        generatedAt: new Date().toISOString(),
        model: 'user-upload',
        style: style,
        source: 'user-upload',
        filename: file.filename,
        originalName: file.originalname,
        fileSize: file.size,
        mimeType: file.mimetype
      };

      exerciseLibrary[normalizedName].images.push(newImage);
      exerciseLibrary[normalizedName].updatedAt = new Date().toISOString();

      // Save updated library
      saveExerciseLibrary(exerciseLibrary);

      console.log(`\u2705 Custom image uploaded successfully for "${exerciseName}"`);

      res.json({
        success: true,
        imageUrl,
        imageId: newImage.id,
        exerciseName,
        totalVariations: exerciseLibrary[normalizedName].images.length,
        metadata: {
          filename: file.filename,
          originalName: file.originalname,
          fileSize: file.size,
          mimeType: file.mimetype,
          style: style,
          source: 'user-upload'
        }
      });

    } catch (error) {
      console.error('\ud83d\udce4 Image Upload Error:', error);
      
      // Clean up uploaded file if there was an error
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      
      res.status(500).json({
        success: false,
        error: 'Image upload failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // DELETE /api/ai/exercise-image/:imageId - Delete a specific exercise image
  app.delete('/api/ai/exercise-image/:imageId', async (req: Request, res: Response) => {
    try {
      const { imageId } = req.params;

      if (!imageId) {
        return res.status(400).json({
          success: false,
          error: 'Image ID is required'
        });
      }

      console.log(`\ud83d\uddd1\ufe0f Deleting exercise image: ${imageId}`);

      const exerciseLibrary = loadExerciseLibrary();
      let deletedImage = null;
      let exerciseName = null;

      // Find and remove the image
      for (const [name, exercise] of Object.entries(exerciseLibrary)) {
        const exerciseData = exercise as any;
        const imageIndex = exerciseData.images?.findIndex((img: any) => img.id === imageId);
        
        if (imageIndex !== -1) {
          deletedImage = exerciseData.images[imageIndex];
          exerciseName = name;
          
          // Remove image from array
          exerciseData.images.splice(imageIndex, 1);
          exerciseData.updatedAt = new Date().toISOString();

          // Delete file from filesystem if it's a user upload
          if (deletedImage.source === 'user-upload' && deletedImage.filename) {
            const filePath = path.join(UPLOADS_DIR, deletedImage.filename);
            if (fs.existsSync(filePath)) {
              fs.unlinkSync(filePath);
              console.log(`\ud83d\uddd1\ufe0f Deleted file: ${deletedImage.filename}`);
            }
          }

          // Remove exercise entry if no images left
          if (exerciseData.images.length === 0) {
            delete exerciseLibrary[name];
            console.log(`\ud83d\uddd1\ufe0f Removed exercise entry: ${name}`);
          }

          break;
        }
      }

      if (!deletedImage) {
        return res.status(404).json({
          success: false,
          error: 'Image not found'
        });
      }

      // Save updated library
      saveExerciseLibrary(exerciseLibrary);

      console.log(`\u2705 Image deleted successfully: ${imageId}`);

      res.json({
        success: true,
        message: 'Image deleted successfully',
        deletedImage,
        exerciseName,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('\ud83d\uddd1\ufe0f Image Deletion Error:', error);
      res.status(500).json({
        success: false,
        error: 'Image deletion failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // GET /api/ai/exercise-image/uploads - Get all user-uploaded images
  app.get('/api/ai/exercise-image/uploads', async (req: Request, res: Response) => {
    try {
      const exerciseLibrary = loadExerciseLibrary();
      const uploadedImages = [];

      for (const [name, exercise] of Object.entries(exerciseLibrary)) {
        const exerciseData = exercise as any;
        const userUploads = exerciseData.images?.filter((img: any) => img.source === 'user-upload') || [];
        
        userUploads.forEach((img: any) => {
          uploadedImages.push({
            exerciseName: name,
            ...img
          });
        });
      }

      res.json({
        success: true,
        uploadedImages,
        count: uploadedImages.length,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Uploads fetch error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch uploaded images',
        timestamp: new Date().toISOString()
      });
    }
  });

  // POST /api/ai/exercise-image/set-primary - Set a specific image as the primary image for an exercise
  app.post('/api/ai/exercise-image/set-primary', async (req: Request, res: Response) => {
    try {
      const { exerciseName, imageId } = req.body;

      if (!exerciseName || !exerciseName.trim()) {
        return res.status(400).json({
          success: false,
          error: 'Exercise name is required'
        });
      }

      if (!imageId) {
        return res.status(400).json({
          success: false,
          error: 'Image ID is required'
        });
      }

      const normalizedName = exerciseName.toLowerCase().trim();
      const exerciseLibrary = loadExerciseLibrary();

      if (!exerciseLibrary[normalizedName] || !exerciseLibrary[normalizedName].images?.length) {
        return res.status(404).json({
          success: false,
          error: 'Exercise or images not found'
        });
      }

      // Find the image and move it to the end (making it the primary/latest)
      const imageIndex = exerciseLibrary[normalizedName].images.findIndex((img: any) => img.id === imageId);
      
      if (imageIndex === -1) {
        return res.status(404).json({
          success: false,
          error: 'Image not found for this exercise'
        });
      }

      const image = exerciseLibrary[normalizedName].images.splice(imageIndex, 1)[0];
      exerciseLibrary[normalizedName].images.push(image);
      exerciseLibrary[normalizedName].updatedAt = new Date().toISOString();

      // Save updated library
      saveExerciseLibrary(exerciseLibrary);

      console.log(`\u2705 Set primary image for "${exerciseName}": ${imageId}`);

      res.json({
        success: true,
        message: 'Primary image set successfully',
        exerciseName,
        primaryImageId: imageId,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Set primary image error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to set primary image',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
}
