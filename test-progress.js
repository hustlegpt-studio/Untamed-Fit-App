// Simple test script to verify progress API endpoints
const fetch = require('node-fetch');

async function testProgressAPI() {
  const baseUrl = 'http://localhost:5000';
  const testEmail = 'test@example.com';

  try {
    console.log('🧪 Testing Progress API endpoints...\n');

    // Test 1: Record a workout
    console.log('1. Testing POST /api/progress/record-workout');
    const workoutResponse = await fetch(`${baseUrl}/api/progress/record-workout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userEmail: testEmail,
        workoutId: 'test-workout-1',
        date: new Date().toISOString(),
        exercises: [
          { name: 'bench press', sets: 3, reps: 10, weight: 135, difficulty: 6 },
          { name: 'squat', sets: 3, reps: 12, weight: 185, difficulty: 7 }
        ]
      })
    });
    
    if (workoutResponse.ok) {
      console.log('✅ Workout recorded successfully');
    } else {
      console.log('❌ Failed to record workout:', await workoutResponse.text());
    }

    // Test 2: Get progress summary
    console.log('\n2. Testing GET /api/progress/summary');
    const summaryResponse = await fetch(`${baseUrl}/api/progress/summary?userEmail=${testEmail}`);
    
    if (summaryResponse.ok) {
      const summaryData = await summaryResponse.json();
      console.log('✅ Progress summary retrieved');
      console.log('   - Weekly workouts:', summaryData.data?.weeklyWorkoutCount);
      console.log('   - Consistency score:', summaryData.data?.consistencyScore);
      console.log('   - Total workouts:', summaryData.data?.totalWorkouts);
    } else {
      console.log('❌ Failed to get summary:', await summaryResponse.text());
    }

    // Test 3: Get exercise history
    console.log('\n3. Testing GET /api/progress/exercise-history');
    const historyResponse = await fetch(`${baseUrl}/api/progress/exercise-history?userEmail=${testEmail}&exerciseName=bench%20press`);
    
    if (historyResponse.ok) {
      const historyData = await historyResponse.json();
      console.log('✅ Exercise history retrieved');
      console.log('   - Entries found:', historyData.data?.length);
    } else {
      console.log('❌ Failed to get exercise history:', await historyResponse.text());
    }

    // Test 4: Record body metrics
    console.log('\n4. Testing POST /api/progress/record-body-metrics');
    const metricsResponse = await fetch(`${baseUrl}/api/progress/record-body-metrics`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userEmail: testEmail,
        date: new Date().toISOString(),
        weight: 180,
        bodyFat: 15.5,
        measurements: {
          chest: 42,
          waist: 34,
          arms: 15
        }
      })
    });
    
    if (metricsResponse.ok) {
      console.log('✅ Body metrics recorded successfully');
    } else {
      console.log('❌ Failed to record body metrics:', await metricsResponse.text());
    }

    console.log('\n🎉 Progress API testing complete!');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testProgressAPI();
