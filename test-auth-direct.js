/**
 * Test authentication flow step by step
 */
const { db } = require('./lib/database');
const { generateToken, verifyToken, verifyPassword } = require('./lib/auth');

async function testAuthenticationFlow() {
  console.log('=== Testing Authentication Flow ===\n');

  try {
    // Step 1: Find user in database
    console.log('1. Looking up user in database...');
    const user = await db.user.findUnique({
      email: 'member@luxylyfe.com'
    });

    if (!user) {
      console.log('❌ User not found in database');
      return;
    }

    console.log('✅ User found:', {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name
    });

    // Step 2: Verify password
    console.log('\n2. Verifying password...');
    const isValidPassword = await verifyPassword('member123', user.password);
    console.log('Password valid:', isValidPassword);

    if (!isValidPassword) {
      console.log('❌ Invalid password');
      return;
    }

    // Step 3: Generate JWT token
    console.log('\n3. Generating JWT token...');
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role
    });
    console.log('✅ Token generated successfully');
    console.log('Token (first 50 chars):', token.substring(0, 50) + '...');

    // Step 4: Verify JWT token
    console.log('\n4. Verifying JWT token...');
    const decoded = verifyToken(token);
    console.log('✅ Token verified successfully:', {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role
    });

    // Step 5: Create session
    console.log('\n5. Creating session...');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    const session = await db.session.create({
      userId: user.id,
      token,
      expiresAt: expiresAt.toISOString()
    });

    console.log('✅ Session created:', {
      id: session.id,
      userId: session.userId,
      expiresAt: session.expiresAt
    });

    // Step 6: Find session by token
    console.log('\n6. Looking up session by token...');
    const foundSession = await db.session.findUnique({ token });
    console.log('Session found:', foundSession ? 'Yes' : 'No');

    if (foundSession) {
      console.log('Session details:', {
        id: foundSession.id,
        userId: foundSession.userId,
        expiresAt: foundSession.expiresAt
      });

      // Check if session is expired
      const sessionExpiresAt = new Date(foundSession.expiresAt);
      const now = new Date();
      console.log('Session expires at:', sessionExpiresAt.toISOString());
      console.log('Current time:', now.toISOString());
      console.log('Is expired?', sessionExpiresAt <= now);
    }

    // Step 7: Find user by session userId
    console.log('\n7. Looking up user by session userId...');
    const sessionUser = await db.user.findUnique({ id: foundSession.userId });
    console.log('User found from session:', sessionUser ? 'Yes' : 'No');

    if (sessionUser) {
      console.log('User details:', {
        id: sessionUser.id,
        email: sessionUser.email,
        role: sessionUser.role,
        name: sessionUser.name
      });
    }

    console.log('\n✅ All authentication steps completed successfully!');

  } catch (error) {
    console.error('❌ Authentication test failed:', error);
  }
}

// Run the test
testAuthenticationFlow();