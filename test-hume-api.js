/**
 * Hume API Test Script
 * 
 * Run this to test Hume API directly and see the actual response format
 * Usage: node test-hume-api.js
 */

const fs = require('fs');
const path = require('path');

// Configuration
const HUME_API_KEY = process.env.HUME_API_KEY || 'YOUR_KEY_HERE';
const TEST_AUDIO_PATH = './uploads/bcd576c740732afa8d39740a61d355d1.webm'; // Adjust this path

async function testHumeAPI() {
  console.log('🧪 Testing Hume API...\n');

  // Step 1: Create job
  console.log('📤 Step 1: Creating job...');
  
  const FormData = require('form-data');
  const formData = new FormData();
  
  if (!fs.existsSync(TEST_AUDIO_PATH)) {
    console.error('❌ Audio file not found:', TEST_AUDIO_PATH);
    console.log('Please update TEST_AUDIO_PATH in the script');
    return;
  }

  const audioBuffer = fs.readFileSync(TEST_AUDIO_PATH);
  formData.append('file', audioBuffer, 'audio.webm');
  
  const jsonConfig = {
    models: {
      prosody: {}
    }
  };
  formData.append('json', JSON.stringify(jsonConfig));

  try {
    const createResponse = await fetch('https://api.hume.ai/v0/batch/jobs', {
      method: 'POST',
      headers: {
        'X-Hume-Api-Key': HUME_API_KEY,
        ...formData.getHeaders(),
      },
      body: formData,
    });

    if (!createResponse.ok) {
      const errorText = await createResponse.text();
      console.error('❌ Job creation failed:', createResponse.status, errorText);
      return;
    }

    const jobData = await createResponse.json();
    console.log('✅ Job created:', jobData);
    const jobId = jobData.job_id;

    if (!jobId) {
      console.error('❌ No job_id in response');
      return;
    }

    // Step 2: Poll for status
    console.log('\n📊 Step 2: Polling for status...\n');
    
    let attempts = 0;
    const maxAttempts = 120; // 6 minutes max
    const pollInterval = 3000; // 3 seconds

    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, pollInterval));
      attempts++;

      const statusResponse = await fetch(`https://api.hume.ai/v0/batch/jobs/${jobId}`, {
        headers: {
          'X-Hume-Api-Key': HUME_API_KEY,
        },
      });

      if (!statusResponse.ok) {
        console.error('❌ Status check failed:', statusResponse.status);
        break;
      }

      const statusData = await statusResponse.json();
      
      // Show first 3 responses in full
      if (attempts <= 3) {
        console.log(`Attempt ${attempts}:`, JSON.stringify(statusData, null, 2));
      }

      // Try to extract state
      const state = statusData.state || statusData.status || 'UNKNOWN';
      console.log(`[${attempts}/${maxAttempts}] State: ${state}`);

      if (state === 'COMPLETED') {
        console.log('\n✅ Job completed! Fetching predictions...');

        const predictionsResponse = await fetch(
          `https://api.hume.ai/v0/batch/jobs/${jobId}/predictions`,
          {
            headers: {
              'X-Hume-Api-Key': HUME_API_KEY,
            },
          }
        );

        if (!predictionsResponse.ok) {
          console.error('❌ Failed to fetch predictions');
          break;
        }

        const predictions = await predictionsResponse.json();
        console.log('\n📊 Predictions received:');
        console.log(JSON.stringify(predictions, null, 2).substring(0, 1000) + '...');
        
        return predictions;
      } else if (state === 'FAILED') {
        console.error('❌ Job failed:', statusData);
        break;
      }
    }

    console.log('\n⏱️ Timed out after', attempts * pollInterval / 1000, 'seconds');
    console.log('Job ID:', jobId);
    console.log('You can check status manually at: https://platform.hume.ai');

  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  }
}

// Run the test
testHumeAPI();

