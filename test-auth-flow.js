/**
 * Direct test of authentication flow to debug the issue
 */

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000';

async function testAuthFlow() {
  console.log('=== Testing Authentication Flow ===\n');

  try {
    // Step 1: Login
    console.log('1. Attempting login...');
    const loginResponse = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'member@luxylyfe.com',
        password: 'member123',
        role: 'MEMBER'
      }),
    });

    console.log('Login Status:', loginResponse.status);
    const loginData = await loginResponse.json();
    console.log('Login Response:', loginData);

    // Extract cookies from response
    const cookies = loginResponse.headers.get('set-cookie');
    console.log('Set-Cookie header:', cookies);

    if (loginResponse.status !== 200) {
      console.log('❌ Login failed');
      return;
    }

    console.log('✅ Login successful\n');

    // Step 2: Test /api/auth/me with cookies
    console.log('2. Testing /api/auth/me with cookies...');
    const authResponse = await fetch(`${BASE_URL}/api/auth/me`, {
      method: 'GET',
      headers: {
        'Cookie': cookies || ''
      },
    });

    console.log('Auth Status:', authResponse.status);
    const authData = await authResponse.json();
    console.log('Auth Response:', authData);

    if (authResponse.status === 200) {
      console.log('✅ Authentication verification successful');
    } else {
      console.log('❌ Authentication verification failed');
    }

  } catch (error) {
    console.error('Test failed with error:', error);
  }
}

testAuthFlow();