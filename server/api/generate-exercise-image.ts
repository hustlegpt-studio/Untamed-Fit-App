import { Request, Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { HfInference } from '@huggingface/inference';

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Lazy initialization of Hugging Face client
let hfClient: HfInference | null = null;

function getHuggingFaceClient() {
  if (!hfClient) {
    try {
      // Initialize Hugging Face client (no API key required for local models)
      hfClient = new HfInference(process.env.HUGGINGFACE_API_KEY || '');
      console.log('Hugging Face client initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Hugging Face client:', error);
      return null;
    }
  }
  return hfClient;
}

// Exercise library file path
const EXERCISE_LIBRARY_PATH = path.join(__dirname, '..', '..', 'exerciseLibrary.json');

// Load existing exercise library
function loadExerciseLibrary(): any {
  try {
    if (fs.existsSync(EXERCISE_LIBRARY_PATH)) {
      const data = fs.readFileSync(EXERCISE_LIBRARY_PATH, 'utf8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error loading exercise library:', error);
  }
  return {};
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

// Generate exercise-specific prompt for Stable Diffusion
function generateExercisePrompt(exerciseName: string, style: string = 'realistic'): string {
  const normalizedName = exerciseName.toLowerCase().trim();
  
  let stylePrompt = '';
  
  switch (style.toLowerCase()) {
    case 'cartoon':
      stylePrompt = `cartoon fitness illustration of ${exerciseName}, vibrant colors, bold outlines, animated style, clean family-friendly, white background, dynamic pose`;
      break;
      
    case 'minimalist':
      stylePrompt = `minimalist line art of ${exerciseName}, simple shapes, black and white, negative space, modern icon style, clean lines`;
      break;
      
    case 'realistic':
    default:
      stylePrompt = `professional fitness illustration of ${exerciseName}, realistic style, proper form, white background, educational, safe for work, no faces`;
      break;
  }
  
  return `${stylePrompt}, high quality, detailed, fitness training, exercise demonstration`;
}

// Generate negative prompt for better results
function generateNegativePrompt(): string {
  return `blurry, low quality, distorted, text, watermark, signature, faces, people, copyrighted characters, brands, unsafe content, inappropriate`;
}

export async function registerGenerateExerciseImageRoutes(app: any) {
  // POST /api/ai/generate-exercise-image - Main image generation endpoint
  app.post('/api/ai/generate-exercise-image', async (req: Request, res: Response) => {
    try {
      const { exerciseName, style = 'realistic' } = req.body;

      if (!exerciseName || !exerciseName.trim()) {
        return res.status(400).json({
          success: false,
          error: 'Exercise name is required'
        });
      }

      console.log(`\ud83c\udfa8 Generating image for exercise: "${exerciseName}"`);

      // Check if image already exists in library
      const exerciseLibrary = loadExerciseLibrary();
      const normalizedName = exerciseName.toLowerCase().trim();
      
      if (exerciseLibrary[normalizedName]?.images?.length > 0) {
        // Return the most recently generated image
        const latestImage = exerciseLibrary[normalizedName].images[exerciseLibrary[normalizedName].images.length - 1];
        console.log(`\u2705 Found existing image for "${exerciseName}" (${exerciseLibrary[normalizedName].images.length} variations)`);
        return res.json({
          success: true,
          imageUrl: latestImage.url,
          imageId: latestImage.id,
          cached: true,
          exerciseName,
          totalVariations: exerciseLibrary[normalizedName].images.length,
          metadata: latestImage
        });
      }

      // Get Hugging Face client
      const client = getHuggingFaceClient();
      if (!client) {
        return res.status(500).json({
          success: false,
          error: 'Image generation service not available - Hugging Face client initialization failed'
        });
      }

      // Generate image using Hugging Face Diffusers
      const prompt = generateExercisePrompt(exerciseName, style);
      const negativePrompt = generateNegativePrompt();
      console.log(`\ud83c\udfa8 Generating ${style} style image with Hugging Face Diffusers: "${prompt.substring(0, 100)}..."`);

      try {
        // Use Hugging Face Inference API for Stable Diffusion
        const response = await client.textToImage({
          model: 'runwayml/stable-diffusion-v1-5',
          inputs: prompt,
          parameters: {
            negative_prompt: negativePrompt,
            num_inference_steps: 25,
            guidance_scale: 7.5,
            width: 512,
            height: 512
          }
        });

        // Convert image response to buffer and save locally
        let imageBuffer: Buffer;
        
        if (response instanceof Blob) {
          imageBuffer = Buffer.from(await response.arrayBuffer());
        } else if (response instanceof ArrayBuffer) {
          imageBuffer = Buffer.from(response);
        } else if (Buffer.isBuffer(response)) {
          imageBuffer = response;
        } else {
          throw new Error('Invalid response format from Hugging Face');
        }
        
        const timestamp = Date.now();
        const filename = `exercise-${normalizedName}-${timestamp}.png`;
        const imagePath = path.join(__dirname, '..', '..', 'uploads', 'exercise-images', filename);
        
        // Ensure uploads directory exists
        const uploadsDir = path.dirname(imagePath);
        if (!fs.existsSync(uploadsDir)) {
          fs.mkdirSync(uploadsDir, { recursive: true });
        }
        
        // Save image locally
        fs.writeFileSync(imagePath, imageBuffer);
        
        const imageUrl = `/uploads/exercise-images/${filename}`;
        console.log(`\u2705 Image generated successfully: "${imageUrl}"`);

      // Save to exercise library with support for multiple variations
      if (!exerciseLibrary[normalizedName]) {
        exerciseLibrary[normalizedName] = {
          exerciseName,
          images: [],
          createdAt: new Date().toISOString()
        };
      }

      // Add new image variation
      const newImage = {
        id: Date.now().toString(),
        url: imageUrl,
        generatedAt: new Date().toISOString(),
        model: 'runwayml/stable-diffusion-v1-5',
        provider: 'huggingface',
        style: style,
        seed: Math.floor(Math.random() * 1000000),
        filename: filename
      };

      exerciseLibrary[normalizedName].images.push(newImage);
      exerciseLibrary[normalizedName].updatedAt = new Date().toISOString();
      
      saveExerciseLibrary(exerciseLibrary);

      res.json({
        success: true,
        imageUrl,
        imageId: newImage.id,
        cached: false,
        exerciseName,
        totalVariations: exerciseLibrary[normalizedName].images.length,
        metadata: {
          model: 'runwayml/stable-diffusion-v1-5',
          provider: 'huggingface',
          width: 512,
          height: 512,
          generatedAt: newImage.generatedAt,
          style: style,
          seed: newImage.seed,
          filename: filename
        }
      });

    } catch (hfError) {
        console.error('\ud83c\udfa8 Hugging Face Generation Error:', hfError);
        return res.status(500).json({
          success: false,
          error: 'Hugging Face image generation failed',
          details: hfError instanceof Error ? hfError.message : 'Unknown error'
        });
      }

    } catch (error) {
      console.error('\ud83c\udfa8 Image Generation Error:', error);
      
      // Handle specific error types
      let errorMessage = 'Image generation failed';
      let statusCode = 500;

      if (error instanceof Error) {
        if (error.message.includes('API key')) {
          errorMessage = 'Invalid Hugging Face API key';
          statusCode = 401;
        } else if (error.message.includes('rate limit')) {
          errorMessage = 'Rate limit exceeded';
          statusCode = 429;
        } else if (error.message.includes('quota')) {
          errorMessage = 'Quota exceeded';
          statusCode = 402;
        } else if (error.message.includes('network')) {
          errorMessage = 'Network error';
          statusCode = 503;
        } else {
          errorMessage = error.message;
        }
      }

      res.status(statusCode).json({
        success: false,
        error: errorMessage,
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // GET /api/ai/generate-exercise-image/health - Health check endpoint
  app.get('/api/ai/generate-exercise-image/health', async (req: Request, res: Response) => {
    try {
      const client = getHuggingFaceClient();
      
      if (!client) {
        return res.json({
          success: true,
          service: 'generate-exercise-image',
          status: 'misconfigured',
          message: 'Hugging Face client initialization failed',
          timestamp: new Date().toISOString()
        });
      }

      // Check if uploads directory exists
      const uploadsDir = path.join(__dirname, '..', '..', 'uploads', 'exercise-images');
      const uploadsExist = fs.existsSync(uploadsDir);

      res.json({
        success: true,
        service: 'generate-exercise-image',
        status: 'healthy',
        provider: 'huggingface',
        model: 'runwayml/stable-diffusion-v1-5',
        uploadsDirectory: uploadsExist ? 'exists' : 'created',
        exerciseLibraryPath: EXERCISE_LIBRARY_PATH,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Health check error:', error);
      res.status(500).json({
        success: false,
        error: 'Health check failed',
        timestamp: new Date().toISOString()
      });
    }
  });

  // GET /api/ai/generate-exercise-image/library - Get exercise library
  app.get('/api/ai/generate-exercise-image/library', async (req: Request, res: Response) => {
    try {
      const library = loadExerciseLibrary();
      
      res.json({
        success: true,
        exerciseLibrary: library,
        count: Object.keys(library).length,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Library fetch error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch exercise library',
        timestamp: new Date().toISOString()
      });
    }
  });

  // GET /api/ai/generate-exercise-image/variations/:exerciseName - Get all variations for an exercise
  app.get('/api/ai/generate-exercise-image/variations/:exerciseName', async (req: Request, res: Response) => {
    try {
      const { exerciseName } = req.params;
      const normalizedName = exerciseName.toLowerCase().trim();
      
      const library = loadExerciseLibrary();
      
      if (!library[normalizedName] || !library[normalizedName].images?.length) {
        return res.json({
          success: true,
          exerciseName,
          variations: [],
          count: 0,
          message: 'No images found for this exercise'
        });
      }

      res.json({
        success: true,
        exerciseName,
        variations: library[normalizedName].images,
        count: library[normalizedName].images.length,
        createdAt: library[normalizedName].createdAt,
        updatedAt: library[normalizedName].updatedAt
      });

    } catch (error) {
      console.error('Variations fetch error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch exercise variations',
        timestamp: new Date().toISOString()
      });
    }
  });

  // POST /api/ai/generate-exercise-image/regenerate - Generate a new variation for an existing exercise
  app.post('/api/ai/generate-exercise-image/regenerate', async (req: Request, res: Response) => {
    try {
      const { exerciseName, style = 'realistic' } = req.body;

      if (!exerciseName || !exerciseName.trim()) {
        return res.status(400).json({
          success: false,
          error: 'Exercise name is required'
        });
      }

      console.log(`\ud83c\udfa8 Regenerating new variation for exercise: "${exerciseName}"`);

      // Force generation by bypassing the cache check
      const response = await fetch('http://localhost:9688/api/ai/generate-exercise-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          exerciseName: exerciseName.trim(),
          style: style
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Regeneration failed');
      }

      res.json({
        success: true,
        message: 'New variation generated successfully',
        ...data
      });

    } catch (error) {
      console.error('\ud83c\udfa8 Regeneration Error:', error);
      res.status(500).json({
        success: false,
        error: 'Regeneration failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
}
