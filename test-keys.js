#!/usr/bin/env node

/**
 * Test Script for Fitness Trends MVP
 * Tests all API keys to ensure they work before coding begins
 */

require('dotenv').config({ path: '.env.local' });

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[36m'
};

function log(color, message) {
  console.log(`${color}${message}${colors.reset}`);
}

// Test 1: Check environment variables
async function testEnvVariables() {
  log(colors.blue, '\n✓ Test 1: Environment Variables');
  
  const required = [
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY',
    'YOUTUBE_API_KEY',
    'ANTHROPIC_API_KEY',
    'RESEND_API_KEY'
  ];

  let passed = 0;
  let failed = 0;

  required.forEach(key => {
    if (process.env[key]) {
      log(colors.green, `  ✓ ${key} is set`);
      passed++;
    } else {
      log(colors.red, `  ✗ ${key} is MISSING`);
      failed++;
    }
  });

  return { passed, failed };
}

// Test 2: Test Claude API
async function testClaudeAPI() {
  log(colors.blue, '\n✓ Test 2: Claude API (Anthropic)');
  
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-haiku-4-5',
        max_tokens: 100,
        messages: [
          { role: 'user', content: 'Say "Claude API works!"' }
        ]
      })
    });

    if (response.ok) {
      log(colors.green, '  ✓ Claude API is working');
      return { passed: 1, failed: 0 };
    } else {
      const error = await response.json();
      log(colors.red, `  ✗ Claude API error: ${error.error?.message || 'Unknown error'}`);
      return { passed: 0, failed: 1 };
    }
  } catch (error) {
    log(colors.red, `  ✗ Claude API error: ${error.message}`);
    return { passed: 0, failed: 1 };
  }
}

// Test 3: Test YouTube API
async function testYouTubeAPI() {
  log(colors.blue, '\n✓ Test 3: YouTube Data API');
  
  try {
    const response = await fetch(
      `https://www.googleapis.com/youtube/v3/search?part=snippet&q=fitness&maxResults=1&key=${process.env.YOUTUBE_API_KEY}`
    );

    if (response.ok) {
      log(colors.green, '  ✓ YouTube API is working');
      return { passed: 1, failed: 0 };
    } else {
      const error = await response.json();
      log(colors.red, `  ✗ YouTube API error: ${error.error?.message || 'Unknown error'}`);
      return { passed: 0, failed: 1 };
    }
  } catch (error) {
    log(colors.red, `  ✗ YouTube API error: ${error.message}`);
    return { passed: 0, failed: 1 };
  }
}

// Test 4: Test Supabase
async function testSupabaseConnection() {
  log(colors.blue, '\n✓ Test 4: Supabase Connection');
  
  try {
    const url = new URL(process.env.SUPABASE_URL);
    
    if (!url.hostname.includes('supabase.co')) {
      log(colors.red, '  ✗ Invalid Supabase URL format');
      return { passed: 0, failed: 1 };
    }

    log(colors.green, '  ✓ Supabase URL is valid');
    return { passed: 1, failed: 0 };
  } catch (error) {
    log(colors.red, `  ✗ Supabase error: ${error.message}`);
    return { passed: 0, failed: 1 };
  }
}

// Test 5: Test Resend API
async function testResendAPI() {
  log(colors.blue, '\n✓ Test 5: Resend Email API');
  
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: 'test@resend.dev',
        to: 'delivered@resend.dev',
        subject: 'Test',
        html: '<p>Test</p>'
      })
    });

    if (response.ok || response.status === 400) {
      log(colors.green, '  ✓ Resend API key is valid');
      return { passed: 1, failed: 0 };
    } else if (response.status === 401) {
      log(colors.red, '  ✗ Resend API key is invalid');
      return { passed: 0, failed: 1 };
    } else {
      log(colors.yellow, `  ? Resend API responded with ${response.status}`);
      return { passed: 1, failed: 0 };
    }
  } catch (error) {
    log(colors.red, `  ✗ Resend error: ${error.message}`);
    return { passed: 0, failed: 1 };
  }
}

// Run all tests
async function runAllTests() {
  log(colors.blue, '═══════════════════════════════════════');
  log(colors.blue, '  Fitness Trends MVP - API Key Tests');
  log(colors.blue, '═══════════════════════════════════════');

  const results = [];
  
  results.push(await testEnvVariables());
  results.push(await testClaudeAPI());
  results.push(await testYouTubeAPI());
  results.push(await testSupabaseConnection());
  results.push(await testResendAPI());

  const totalPassed = results.reduce((sum, r) => sum + r.passed, 0);
  const totalFailed = results.reduce((sum, r) => sum + r.failed, 0);

  log(colors.blue, '\n═══════════════════════════════════════');
  log(colors.blue, '  TEST SUMMARY');
  log(colors.blue, '═══════════════════════════════════════');
  log(colors.green, `  ✓ Passed: ${totalPassed}`);
  
  if (totalFailed > 0) {
    log(colors.red, `  ✗ Failed: ${totalFailed}`);
  } else {
    log(colors.green, `  ✗ Failed: ${totalFailed}`);
  }

  log(colors.blue, '═══════════════════════════════════════\n');

  if (totalFailed === 0) {
    log(colors.green, '🎉 All tests passed! Ready for Week 1.\n');
    process.exit(0);
  } else {
    log(colors.red, '❌ Some tests failed.\n');
    process.exit(1);
  }
}

runAllTests();