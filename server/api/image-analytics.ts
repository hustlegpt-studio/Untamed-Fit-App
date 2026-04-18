import { Request, Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Exercise library file path
const EXERCISE_LIBRARY_PATH = path.join(__dirname, '..', '..', 'exerciseLibrary.json');

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

export async function registerImageAnalyticsRoutes(app: any) {
  // GET /api/ai/image-analytics/dashboard - Get comprehensive image analytics
  app.get('/api/ai/image-analytics/dashboard', async (req: Request, res: Response) => {
    try {
      const exerciseLibrary = loadExerciseLibrary();
      
      // Calculate overall statistics
      const totalExercises = Object.keys(exerciseLibrary).length;
      let totalImages = 0;
      let totalVariations = 0;
      let totalFileSize = 0;
      
      const styleCounts: { [key: string]: number } = {};
      const sourceCounts: { [key: string]: number } = {};
      const modelCounts: { [key: string]: number } = {};
      
      const recentImages = [];
      const generatedToday = [];
      const generatedThisWeek = [];
      const generatedThisMonth = [];
      
      const now = new Date();
      const today = now.toISOString().split('T')[0];
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      
      for (const [exerciseName, exerciseData] of Object.entries(exerciseLibrary)) {
        const exercise = exerciseData as any;
        
        if (exercise.images && Array.isArray(exercise.images)) {
          totalImages += exercise.images.length;
          totalVariations += exercise.images.length;
          
          exercise.images.forEach((image: any) => {
            // Style statistics
            const style = image.style || 'unknown';
            styleCounts[style] = (styleCounts[style] || 0) + 1;
            
            // Source statistics
            const source = image.source || 'unknown';
            sourceCounts[source] = (sourceCounts[source] || 0) + 1;
            
            // Model statistics
            const model = image.model || 'unknown';
            modelCounts[model] = (modelCounts[model] || 0) + 1;
            
            // File size statistics
            if (image.fileSize) {
              totalFileSize += image.fileSize;
            }
            
            // Recent images (last 10)
            if (recentImages.length < 10) {
              recentImages.push({
                exerciseName,
                imageUrl: image.url,
                generatedAt: image.generatedAt,
                style: image.style,
                source: image.source
              });
            }
            
            // Time-based statistics
            const generatedDate = new Date(image.generatedAt);
            if (generatedDate.toISOString().split('T')[0] === today) {
              generatedToday.push({
                exerciseName,
                generatedAt: image.generatedAt,
                style: image.style
              });
            }
            
            if (generatedDate >= weekAgo) {
              generatedThisWeek.push({
                exerciseName,
                generatedAt: image.generatedAt,
                style: image.style
              });
            }
            
            if (generatedDate >= monthAgo) {
              generatedThisMonth.push({
                exerciseName,
                generatedAt: image.generatedAt,
                style: image.style
              });
            }
          });
        }
      }
      
      // Calculate averages and percentages
      const averageVariations = totalExercises > 0 ? Math.round((totalVariations / totalExercises) * 10) / 10 : 0;
      const userUploadPercentage = totalImages > 0 ? Math.round(((sourceCounts['user-upload'] || 0) / totalImages) * 100) : 0;
      const aiGeneratedPercentage = totalImages > 0 ? Math.round(((sourceCounts['fireworks'] || 0) / totalImages) * 100) : 0;
      
      // Most popular styles
      const popularStyles = Object.entries(styleCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([style, count]) => ({ style, count, percentage: Math.round((count / totalImages) * 100) }));
      
      // Most used sources
      const popularSources = Object.entries(sourceCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([source, count]) => ({ source, count, percentage: Math.round((count / totalImages) * 100) }));
      
      // Most used models
      const popularModels = Object.entries(modelCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([model, count]) => ({ model, count, percentage: Math.round((count / totalImages) * 100) }));
      
      // Exercises with most variations
      const exercisesWithMostVariations = Object.entries(exerciseLibrary)
        .filter(([, exercise]: any) => exercise.images && exercise.images.length > 1)
        .sort(([, a]: any, [, b]: any) => b.images.length - a.images.length)
        .slice(0, 10)
        .map(([name, exercise]: any) => ({
          exerciseName: name,
          variationCount: exercise.images.length,
          styles: exercise.images.map((img: any) => img.style),
          hasUserUploads: exercise.images.some((img: any) => img.source === 'user-upload')
        }));
      
      const analytics = {
        overview: {
          totalExercises,
          totalImages,
          totalVariations,
          averageVariations,
          totalFileSize: Math.round(totalFileSize / 1024 / 1024 * 100) / 100, // MB
          userUploadPercentage,
          aiGeneratedPercentage
        },
        styles: {
          counts: styleCounts,
          popular: popularStyles
        },
        sources: {
          counts: sourceCounts,
          popular: popularSources
        },
        models: {
          counts: modelCounts,
          popular: popularModels
        },
        time: {
          generatedToday: generatedToday.length,
          generatedThisWeek: generatedThisWeek.length,
          generatedThisMonth: generatedThisMonth.length,
          recentImages: recentImages.slice(0, 10)
        },
        exercises: {
          withMostVariations: exercisesWithMostVariations.slice(0, 10)
        }
      };
      
      console.log(`\ud83d\udcca Generated comprehensive image analytics dashboard`);
      
      res.json({
        success: true,
        analytics,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Analytics dashboard error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to generate analytics dashboard',
        timestamp: new Date().toISOString()
      });
    }
  });

  // GET /api/ai/image-analytics/exercises/:exerciseName - Get analytics for specific exercise
  app.get('/api/ai/image-analytics/exercises/:exerciseName', async (req: Request, res: Response) => {
    try {
      const { exerciseName } = req.params;
      const normalizedName = exerciseName.toLowerCase().trim();
      
      const exerciseLibrary = loadExerciseLibrary();
      
      if (!exerciseLibrary[normalizedName]) {
        return res.json({
          success: true,
          exerciseName,
          found: false,
          message: 'Exercise not found in image library'
        });
      }
      
      const exercise = exerciseLibrary[normalizedName] as any;
      const images = exercise.images || [];
      
      // Calculate exercise-specific analytics
      const totalVariations = images.length;
      const styleDistribution: { [key: string]: number } = {};
      const sourceDistribution: { [key: string]: number } = {};
      let totalFileSize = 0;
      
      images.forEach((image: any) => {
        const style = image.style || 'unknown';
        styleDistribution[style] = (styleDistribution[style] || 0) + 1;
        
        const source = image.source || 'unknown';
        sourceDistribution[source] = (sourceDistribution[source] || 0) + 1;
        
        if (image.fileSize) {
          totalFileSize += image.fileSize;
        }
      });
      
      // Sort images by generation date (newest first)
      const sortedImages = images.sort((a: any, b: any) => 
        new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime()
      );
      
      const analytics = {
        exerciseName,
        totalVariations,
        styleDistribution,
        sourceDistribution,
        totalFileSize: Math.round(totalFileSize / 1024), // KB
        averageFileSize: totalVariations > 0 ? Math.round(totalFileSize / totalVariations / 1024) : 0, // KB
        createdAt: exercise.createdAt,
        updatedAt: exercise.updatedAt,
        images: sortedImages.map((img: any) => ({
          id: img.id,
          url: img.url,
          style: img.style,
          source: img.source,
          generatedAt: img.generatedAt,
          fileSize: img.fileSize ? Math.round(img.fileSize / 1024) : null // KB
        }))
      };
      
      console.log(`\ud83d\udcca Generated analytics for exercise: ${exerciseName}`);
      
      res.json({
        success: true,
        analytics,
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Exercise analytics error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to generate exercise analytics',
        timestamp: new Date().toISOString()
      });
    }
  });

  // GET /api/ai/image-analytics/growth - Get image generation growth over time
  app.get('/api/ai/image-analytics/growth', async (req: Request, res: Response) => {
    try {
      const { period = '30' } = req.query; // Default to 30 days
      const days = parseInt(period as string);
      
      const exerciseLibrary = loadExerciseLibrary();
      const now = new Date();
      const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
      
      const dailyData: { [key: string]: any } = {};
      
      // Initialize daily data for the period
      for (let i = 0; i < days; i++) {
        const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
        const dateKey = date.toISOString().split('T')[0];
        dailyData[dateKey] = {
          date: dateKey,
          totalImages: 0,
          newExercises: 0,
          userUploads: 0,
          aiGenerated: 0
        };
      }
      
      // Process all images and group by date
      for (const [exerciseName, exerciseData] of Object.entries(exerciseLibrary)) {
        const exercise = exerciseData as any;
        
        if (exercise.images && Array.isArray(exercise.images)) {
          exercise.images.forEach((image: any) => {
            const generatedDate = new Date(image.generatedAt);
            const dateKey = generatedDate.toISOString().split('T')[0];
            
            if (dailyData[dateKey]) {
              dailyData[dateKey].totalImages++;
              
              if (image.source === 'user-upload') {
                dailyData[dateKey].userUploads++;
              } else {
                dailyData[dateKey].aiGenerated++;
              }
              
              // Check if this is the first image for this exercise (new exercise)
              const isFirstImage = exercise.images.indexOf(image) === 0;
              if (isFirstImage) {
                dailyData[dateKey].newExercises++;
              }
            }
          });
        }
      }
      
      // Convert to array and sort by date
      const growthData = Object.values(dailyData)
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      
      // Calculate cumulative totals
      let cumulativeTotal = 0;
      let cumulativeExercises = 0;
      
      const growthDataWithCumulative = growthData.map(day => {
        cumulativeTotal += day.totalImages;
        cumulativeExercises += day.newExercises;
        
        return {
          ...day,
          cumulativeTotal,
          cumulativeExercises
        };
      });
      
      console.log(`\ud83d\udcca Generated growth analytics for ${days} days`);
      
      res.json({
        success: true,
        period: days,
        growthData: growthDataWithCumulative,
        summary: {
          totalImages: cumulativeTotal,
          totalExercises: cumulativeExercises,
          averagePerDay: Math.round(cumulativeTotal / days * 10) / 10,
          startDate: startDate.toISOString().split('T')[0],
          endDate: now.toISOString().split('T')[0]
        },
        timestamp: new Date().toISOString()
      });

    } catch (error) {
      console.error('Growth analytics error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to generate growth analytics',
        timestamp: new Date().toISOString()
      });
    }
  });

  // GET /api/ai/image-analytics/performance - Get system performance metrics
  app.get('/api/ai/image-analytics/performance', async (req: Request, res: Response) => {
    try {
      const exerciseLibrary = loadExerciseLibrary();
      
      // Calculate performance metrics
      let totalImages = 0;
      let totalFileSize = 0;
      let aiGeneratedCount = 0;
      let userUploadCount = 0;
      
      const generationTimes: number[] = [];
      
      for (const [exerciseName, exerciseData] of Object.entries(exerciseLibrary)) {
        const exercise = exerciseData as any;
        
        if (exercise.images && Array.isArray(exercise.images)) {
          totalImages += exercise.images.length;
          
          exercise.images.forEach((image: any) => {
            if (image.fileSize) {
              totalFileSize += image.fileSize;
            }
            
            if (image.source === 'user-upload') {
              userUploadCount++;
            } else {
              aiGeneratedCount++;
            }
            
            // Calculate generation time (simplified - using timestamp)
            if (image.generatedAt) {
              generationTimes.push(new Date(image.generatedAt).getTime());
            }
          });
        }
      }
      
      // Calculate performance metrics
      const averageFileSize = totalImages > 0 ? Math.round(totalFileSize / totalImages / 1024) : 0; // KB
      const totalSizeMB = Math.round(totalFileSize / 1024 / 1024 * 100) / 100; // MB
      
      // Calculate generation frequency (images per day)
      if (generationTimes.length > 0) {
        generationTimes.sort();
        const timeSpan = generationTimes[generationTimes.length - 1] - generationTimes[0];
        const daysSpan = timeSpan / (1000 * 60 * 60 * 24);
        const averagePerDay = daysSpan > 0 ? Math.round((totalImages / daysSpan) * 10) / 10 : 0;
        
        const performance = {
          totalImages,
          totalSizeMB: totalSizeMB,
          averageFileSizeKB: averageFileSize,
          aiGeneratedCount,
          userUploadCount,
          averagePerDay,
          daysSpan,
          userUploadPercentage: totalImages > 0 ? Math.round((userUploadCount / totalImages) * 100) : 0,
          aiGeneratedPercentage: totalImages > 0 ? Math.round((aiGeneratedCount / totalImages) * 100) : 0
        };
        
        console.log(`\ud83d\udcca Generated performance analytics`);
        
        res.json({
          success: true,
          performance,
          timestamp: new Date().toISOString()
        });
      } else {
        res.json({
          success: true,
          performance: {
            totalImages: 0,
            totalSizeMB: 0,
            averageFileSizeKB: 0,
            aiGeneratedCount: 0,
            userUploadCount: 0,
            averagePerDay: 0,
            daysSpan: 0,
            userUploadPercentage: 0,
            aiGeneratedPercentage: 0
          },
          timestamp: new Date().toISOString()
        });
      }

    } catch (error) {
      console.error('Performance analytics error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to generate performance analytics',
        timestamp: new Date().toISOString()
      });
    }
  });
}
