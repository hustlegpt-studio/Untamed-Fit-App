import { Request, Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Exercise library file path
const EXERCISE_LIBRARY_PATH = path.join(__dirname, '..', '..', 'exerciseLibrary.json');

// Common exercises that should be pre-generated
const COMMON_EXERCISES = [
  "Push-ups",
  "Squats", 
  "Deadlifts",
  "Bench Press",
  "Pull-ups",
  "Rows",
  "Lunges",
  "Planks",
  "Crunches",
  "Jumping Jacks",
  "Burpees",
  "Mountain Climbers",
  "Lateral Raises",
  "Bicep Curls",
  "Tricep Dips",
  "Leg Press",
  "Calf Raises",
  "Shoulder Press",
  "Hammer Curls",
  "Incline Press"
];

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

// Generate image for a single exercise
async function generateImageForExercise(exerciseName: string): Promise<{success: boolean, imageUrl?: string, error?: string}> {
  try {
    console.log(`\ud83c\udfa8 Batch generating image for: ${exerciseName}`);
    
    const response = await fetch('http://localhost:9688/api/ai/generate-exercise-image', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        exerciseName: exerciseName.trim()
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error(`\ud83c\udfa8 Batch generation failed for ${exerciseName}:`, errorData.error);
      return { success: false, error: errorData.error };
    }

    const data = await response.json();
    
    if (data.success && data.imageUrl) {
      console.log(`\u2705 Batch generation successful for ${exerciseName}: ${data.imageUrl}`);
      return { success: true, imageUrl: data.imageUrl };
    } else {
      console.error(`\ud83c\udfa8 No image URL returned for ${exerciseName}`);
      return { success: false, error: 'No image URL returned' };
    }

  } catch (error) {
    console.error(`\ud83c\udfa8 Error in batch generation for ${exerciseName}:`, error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function registerBatchImageGenerationRoutes(app: any) {
  // POST /api/ai/batch-generate-exercise-images - Batch generate images for common exercises
  app.post('/api/ai/batch-generate-exercise-images', async (req: Request, res: Response) => {
    try {
      const { exercises = COMMON_EXERCISES, force = false } = req.body;
      
      console.log(`\ud83c\udfa8 Starting batch image generation for ${exercises.length} exercises...`);
      
      const exerciseLibrary = loadExerciseLibrary();
      const results = [];
      
      for (const exerciseName of exercises) {
        const normalizedName = exerciseName.toLowerCase().trim();
        
        // Skip if image already exists and not forcing regeneration
        if (!force && exerciseLibrary[normalizedName]?.imageUrl) {
          console.log(`\u2705 Skipping ${exerciseName} - image already exists`);
          results.push({
            exercise: exerciseName,
            status: 'skipped',
            reason: 'Image already exists',
            imageUrl: exerciseLibrary[normalizedName].imageUrl
          });
          continue;
        }
        
        // Generate image
        const result = await generateImageForExercise(exerciseName);
        
        if (result.success && result.imageUrl) {
          // Save to library
          exerciseLibrary[normalizedName] = {
            exerciseName,
            imageUrl: result.imageUrl,
            generatedAt: new Date().toISOString(),
            model: 'fireworks/image-gen-diffusion-xl',
            batchGenerated: true
          };
          
          results.push({
            exercise: exerciseName,
            status: 'success',
            imageUrl: result.imageUrl
          });
        } else {
          results.push({
            exercise: exerciseName,
            status: 'failed',
            error: result.error
          });
        }
        
        // Small delay between requests to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
      
      // Save updated library
      saveExerciseLibrary(exerciseLibrary);
      
      const successCount = results.filter(r => r.status === 'success').length;
      const skippedCount = results.filter(r => r.status === 'skipped').length;
      const failedCount = results.filter(r => r.status === 'failed').length;
      
      console.log(`\ud83c\udfa8 Batch generation complete: ${successCount} success, ${skippedCount} skipped, ${failedCount} failed`);
      
      res.json({
        success: true,
        results,
        summary: {
          total: exercises.length,
          success: successCount,
          skipped: skippedCount,
          failed: failedCount
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('\ud83c\udfa8 Batch generation error:', error);
      res.status(500).json({
        success: false,
        error: 'Batch generation failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // GET /api/ai/batch-generate-exercise-images/status - Get batch generation status
  app.get('/api/ai/batch-generate-exercise-images/status', async (req: Request, res: Response) => {
    try {
      const exerciseLibrary = loadExerciseLibrary();
      
      const commonExerciseStatus = COMMON_EXERCISES.map(exercise => {
        const normalizedName = exercise.toLowerCase().trim();
        const hasImage = !!exerciseLibrary[normalizedName]?.imageUrl;
        const isBatchGenerated = exerciseLibrary[normalizedName]?.batchGenerated || false;
        
        return {
          exercise,
          hasImage,
          isBatchGenerated,
          imageUrl: hasImage ? exerciseLibrary[normalizedName].imageUrl : null,
          generatedAt: hasImage ? exerciseLibrary[normalizedName].generatedAt : null
        };
      });
      
      const totalCommon = COMMON_EXERCISES.length;
      const withImages = commonExerciseStatus.filter(e => e.hasImage).length;
      const batchGenerated = commonExerciseStatus.filter(e => e.isBatchGenerated).length;
      
      res.json({
        success: true,
        commonExercises: commonExerciseStatus,
        summary: {
          totalCommon,
          withImages,
          batchGenerated,
          completionPercentage: Math.round((withImages / totalCommon) * 100)
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Status check error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to check batch generation status',
        timestamp: new Date().toISOString()
      });
    }
  });

  // POST /api/ai/batch-generate-exercise-images/missing - Generate images only for missing exercises
  app.post('/api/ai/batch-generate-exercise-images/missing', async (req: Request, res: Response) => {
    try {
      const exerciseLibrary = loadExerciseLibrary();
      
      // Find exercises without images
      const missingExercises = COMMON_EXERCISES.filter(exercise => {
        const normalizedName = exercise.toLowerCase().trim();
        return !exerciseLibrary[normalizedName]?.imageUrl;
      });
      
      if (missingExercises.length === 0) {
        return res.json({
          success: true,
          message: 'All common exercises already have images',
          missingExercises: [],
          timestamp: new Date().toISOString()
        });
      }
      
      console.log(`\ud83c\udfa8 Found ${missingExercises.length} missing exercises, generating images...`);
      
      // Forward to main batch generation endpoint
      const batchResponse = await fetch('http://localhost:9688/api/ai/batch-generate-exercise-images', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          exercises: missingExercises,
          force: false
        }),
      });
      
      const batchData = await batchResponse.json();
      
      res.json({
        success: true,
        message: `Generated images for ${missingExercises.length} missing exercises`,
        missingExercises,
        batchResults: batchData,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Missing generation error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to generate missing exercise images',
        timestamp: new Date().toISOString()
      });
    }
  });
}
