import { fileURLToPath } from "url";
import path from "path";
import { Groq } from "groq-sdk";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { join } from "path";
import { storage } from "./storage";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Groq client
const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY || "",
});

// Exercise library path
const exerciseLibraryPath = join(__dirname, "..", "data", "exerciseLibrary.json");

// Load exercise library
function loadExerciseLibrary() {
  try {
    if (existsSync(exerciseLibraryPath)) {
      const data = readFileSync(exerciseLibraryPath, "utf-8");
      return JSON.parse(data);
    }
    return { exercises: [], lastId: 0 };
  } catch (error) {
    console.error("Error loading exercise library:", error);
    return { exercises: [], lastId: 0 };
  }
}

// Save new exercise to library
function saveExerciseToLibrary(exercise: any) {
  try {
    const library = loadExerciseLibrary();
    const newId = library.lastId + 1;
    const newExercise = { ...exercise, id: newId };
    
    library.exercises.push(newExercise);
    library.lastId = newId;
    library.updated = new Date().toISOString();
    
    writeFileSync(exerciseLibraryPath, JSON.stringify(library, null, 2));
    console.log(`Added new exercise to library: ${exercise.name}`);
    return newExercise;
  } catch (error) {
    console.error("Error saving exercise to library:", error);
    return null;
  }
}

// Conversation state management
interface ConversationState {
  userId?: number;
  goal?: string;
  days?: number;
  equipment?: string;
  duration?: number;
  experience?: string;
  targetDate?: string;
  workoutType?: string;
  bodyParts?: string[];
  missingFields: string[];
  lastIntent?: string;
}

const activeConversations = new Map<string, ConversationState>();

// Hype trainer personality responses
const hypeResponses = {
  greeting: [
    "WHAT'S UP BEAST! 🦁 Ready to crush some goals and build that DREAM physique!",
    "LET'S GOOO! 💪 Your personal trainer Kevin is here to get you SHREDDED!",
    "YOOOO! 🔥 Time to get UNSTOPPABLE and build some serious MUSCLE!",
    "LET'S WORK! 💯 Kevin here to turn your fitness goals into REALITY!"
  ],
  motivation: [
    "THAT'S WHAT I'M TALKING ABOUT! 💥 You got this!",
    "ABSOLUTELY! 🚀 Let's crush this workout!",
    "LET'S GET IT! 🏆 No excuses, just RESULTS!",
    "BEAST MODE ACTIVATED! 🦁 Time to dominate!",
    "CHAMPION MENTALITY! 🏆 Winners train, losers complain!"
  ],
  question: [
    "Alright BEAST, let me get some info to build you the PERFECT plan! 🔥",
    "Tell me what you're working with so I can create something LEGENDARY! 💪",
    "Need some details to craft your CHAMPION workout! 🏆",
    "Let me hook you up with the ultimate plan! What's your situation? 🦁"
  ],
  completion: [
    "BOOM! 💥 Workout plan created! Time to get UNSTOPPABLE!",
    "LET'S GOOO! 🚀 Your personalized workout is ready!",
    "THAT'S HOW WE DO IT! 💯 Plan locked and loaded!",
    "BEAST MODE! 🦁 Your workout is ready to crush goals!"
  ]
};

function getRandomHypeResponse(type: keyof typeof hypeResponses): string {
  const responses = hypeResponses[type];
  return responses[Math.floor(Math.random() * responses.length)];
}

// Intent detection
function detectIntent(message: string): string {
  const lowerMessage = message.toLowerCase();
  
  if (lowerMessage.includes("plan") || lowerMessage.includes("weekly") || lowerMessage.includes("schedule")) {
    return "generate_plan";
  }
  if (lowerMessage.includes("log") || lowerMessage.includes("record") || lowerMessage.includes("did")) {
    return "log_workout";
  }
  if (lowerMessage.includes("add") || lowerMessage.includes("create") || lowerMessage.includes("new")) {
    return "add_workout";
  }
  if (lowerMessage.includes("complete") || lowerMessage.includes("finish") || lowerMessage.includes("done")) {
    return "complete_workout";
  }
  if (lowerMessage.includes("question") || lowerMessage.includes("help") || lowerMessage.includes("how")) {
    return "follow_up";
  }
  
  return "general";
}

// Check for missing information
function getMissingFields(state: ConversationState): string[] {
  const missing: string[] = [];
  
  if (!state.goal) missing.push("fitness goal");
  if (!state.days) missing.push("number of days per week");
  if (!state.equipment) missing.push("available equipment");
  if (!state.duration) missing.push("workout duration");
  if (!state.experience) missing.push("fitness experience level");
  
  return missing;
}

// Generate workout plan using Groq
async function generateWorkoutPlan(state: ConversationState): Promise<any> {
  const exerciseLibrary = loadExerciseLibrary();
  
  const prompt = `
You are Kevin, an intense, motivational fitness trainer. Create a ${state.days}-day workout plan for someone who wants to ${state.goal}.

User Profile:
- Goal: ${state.goal}
- Experience: ${state.experience}
- Equipment: ${state.equipment}
- Duration: ${state.duration} minutes per session
- Days per week: ${state.days}

Requirements:
1. Generate exactly ${state.days} unique workouts (one for each day)
2. Each workout should have: name, bodyPart, reps, sets, duration, type
3. Balance muscle groups throughout the week
4. Use exercises from this library: ${JSON.stringify(exerciseLibrary.exercises.slice(0, 10))}
5. If needed, create new exercises following the same format
6. Avoid repetition of exercises
7. Match difficulty to ${state.experience} level
8. Include variety: strength, HIIT, mobility

Respond with JSON format:
{
  "plan": [
    {
      "day": "Monday",
      "workout": {
        "name": "Workout Name",
        "bodyPart": "Muscle Group",
        "reps": 12,
        "sets": 3,
        "duration": 45,
        "type": "Strength Training"
      }
    }
  ],
  "message": "Motivational hype message"
}

Be intense, motivational, and use Kevin's personality! 🦁💪🔥
`;

  try {
    const response = await groq.chat.completions.create({
      model: "mixtral-8x7b-32768",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const content = response.choices[0]?.message?.content || "";
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch (e) {
        console.error("Failed to parse AI response:", e);
        return { plan: [], message: "Had trouble creating your plan, let's try again!" };
      }
    }
    
    return { plan: [], message: "Let me create that plan for you! 🔥" };
  } catch (error) {
    console.error("Groq API error:", error);
    return { plan: [], message: "AI service temporarily down, but I'm still here to motivate you! 💪" };
  }
}

// Save workout to calendar
async function saveWorkoutToCalendar(workout: any, userId: number, date: string) {
  try {
    const sessionData = {
      userId,
      workoutName: workout.name,
      bodyPart: workout.bodyPart,
      reps: workout.reps,
      sets: workout.sets,
      duration: workout.duration,
      date,
      time: new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false }),
      userWeight: 0,
      calories: Math.round((workout.duration / 60) * 5),
      isCompleted: false,
    };

    const session = await storage.createUserWorkoutSession(sessionData);
    
    // Add to exercise library if new
    if (!exerciseLibrary.exercises.find((ex: any) => ex.name === workout.name)) {
      saveExerciseToLibrary(workout);
    }
    
    return session;
  } catch (error) {
    console.error("Error saving workout:", error);
    return null;
  }
}

// Main AI workout agent handler
export async function handleWorkoutAgentRequest(req: any, res: any) {
  try {
    const { message, userId, targetDate } = req.body;
    
    if (!message || !userId) {
      return res.status(400).json({ 
        message: "Message and userId are required!",
        response: getRandomHypeResponse("question")
      });
    }

    // Get or create conversation state
    const conversationKey = `${userId}_${targetDate || 'default'}`;
    let state = activeConversations.get(conversationKey) || { 
      userId, 
      targetDate, 
      missingFields: [] 
    };

    // Detect intent
    const intent = detectIntent(message);
    state.lastIntent = intent;

    // Handle different intents
    switch (intent) {
      case "generate_plan":
        const missingFields = getMissingFields(state);
        if (missingFields.length > 0) {
          state.missingFields = missingFields;
          activeConversations.set(conversationKey, state);
          
          return res.json({
            message: `${getRandomHypeResponse("question")} I need to know: ${missingFields.join(", ")}. What's your situation? 🦁`,
            needsMoreInfo: true,
            missingFields
          });
        }
        
        // Generate workout plan
        const planResult = await generateWorkoutPlan(state);
        
        // Save workouts to calendar
        for (const dayPlan of planResult.plan) {
          const workoutDate = targetDate || new Date().toISOString().split("T")[0];
          await saveWorkoutToCalendar(dayPlan.workout, userId, workoutDate);
        }
        
        activeConversations.delete(conversationKey);
        
        return res.json({
          message: planResult.message || getRandomHypeResponse("completion"),
          plan: planResult.plan,
          completed: true
        });

      case "log_workout":
        // Parse workout details from message and log
        const workoutMatch = message.match(/(?:did|completed|finished)\s+(.+?)(?:\s+for\s+(\d+)\s*(?:minutes?|mins?))?/i);
        if (workoutMatch) {
          const workoutName = workoutMatch[1]?.trim();
          const duration = parseInt(workoutMatch[2]) || 30;
          
          const workout = {
            name: workoutName,
            bodyPart: "Full Body",
            reps: 10,
            sets: 3,
            duration,
            type: "Strength Training"
          };
          
          const savedWorkout = await saveWorkoutToCalendar(workout, userId, targetDate || new Date().toISOString().split("T")[0]);
          
          return res.json({
            message: `${getRandomHypeResponse("completion")} Logged ${workoutName} - THAT'S HOW WE DO IT! 💥`,
            workout: savedWorkout,
            completed: true
          });
        }
        
        return res.json({
          message: `${getRandomHypeResponse("question")} What workout did you complete? Be specific! 🦁`,
          needsMoreInfo: true
        });

      case "add_workout":
        // Add specific workout to a day
        const addMatch = message.match(/(?:add|create)\s+(.+?)(?:\s+on\s+(.+?))?/i);
        if (addMatch) {
          const workoutName = addMatch[1]?.trim();
          const day = addMatch[2]?.trim() || targetDate;
          
          const exerciseLibrary = loadExerciseLibrary();
          let workout = exerciseLibrary.exercises.find((ex: any) => ex.name.toLowerCase() === workoutName.toLowerCase());
          
          if (!workout) {
            // Create new workout
            workout = {
              name: workoutName,
              bodyPart: "Full Body",
              reps: 10,
              sets: 3,
              duration: 30,
              type: "Strength Training"
            };
          }
          
          const savedWorkout = await saveWorkoutToCalendar(workout, userId, day || new Date().toISOString().split("T")[0]);
          
          return res.json({
            message: `${getRandomHypeResponse("completion")} Added ${workoutName} to your calendar! LET'S GOOO! 🚀`,
            workout: savedWorkout,
            completed: true
          });
        }
        
        return res.json({
          message: `${getRandomHypeResponse("question")} What workout do you want to add? 🦁`,
          needsMoreInfo: true
        });

      case "complete_workout":
        // Mark existing workout as complete
        const completeMatch = message.match(/(?:complete|finish|done)\s+(.+?)/i);
        if (completeMatch) {
          const workoutName = completeMatch[1]?.trim();
          
          // Find and update workout
          const userWorkouts = await storage.getUserWorkoutSessions(userId);
          const workoutToComplete = userWorkouts.find((w: any) => 
            w.workoutName.toLowerCase().includes(workoutName.toLowerCase()) && !w.isCompleted
          );
          
          if (workoutToComplete) {
            await storage.updateUserWorkoutSession(workoutToComplete.id, { isCompleted: true });
            
            return res.json({
              message: `${getRandomHypeResponse("motivation")} ${workoutName} COMPLETED! BEAST MODE! 🦁💪`,
              workout: workoutToComplete,
              completed: true
            });
          }
          
          return res.json({
            message: `Couldn't find ${workoutName} to complete. Did you do it already? 🤔`,
            needsMoreInfo: true
          });
        }
        
        return res.json({
          message: `${getRandomHypeResponse("question")} What workout did you complete? 🦁`,
          needsMoreInfo: true
        });

      case "follow_up":
        return res.json({
          message: `${getRandomHypeResponse("motivation")} I'm here to help you CRUSH your goals! Ask me about:
- Weekly workout plans 📅
- Logging workouts 📝
- Adding workouts to specific days ➕
- Marking workouts complete ✅
- Any fitness questions! 🤔

What do you need, BEAST? 🦁`,
          response: getRandomHypeResponse("greeting")
        });

      default:
        // Extract information from general conversation
        if (message.includes("goal") || message.includes("want to")) {
          const goalMatch = message.match(/(?:want to|goal is)\s+(.+)/i);
          if (goalMatch) {
            state.goal = goalMatch[1].trim();
            activeConversations.set(conversationKey, state);
            
            return res.json({
              message: `${getRandomHypeResponse("motivation")} ${state.goal}! LET'S GET IT! 💥 What's your equipment and experience? 🦁`,
              state,
              needsMoreInfo: true
            });
          }
        }
        
        return res.json({
          message: `${getRandomHypeResponse("question")} Tell me what you need - workout plans, logging, or questions! 🦁`,
          response: getRandomHypeResponse("greeting")
        });
    }
  } catch (error) {
    console.error("Workout agent error:", error);
    return res.status(500).json({ 
      message: `${getRandomHypeResponse("motivation")} Something went wrong, but I'm still here for you! 💪`,
      error: "Internal server error"
    });
  }
}

// Reset conversation state
export function resetConversationState(userId: string, targetDate?: string) {
  const conversationKey = `${userId}_${targetDate || 'default'}`;
  activeConversations.delete(conversationKey);
}
