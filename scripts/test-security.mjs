import assert from 'node:assert';
import googleAuthHandler from '../api/auth/google.ts';
import guestAuthHandler from '../api/auth/guest.ts';
import meHandler from '../api/auth/me.ts';
import logoutHandler from '../api/auth/logout.ts';
import guestWipeHandler from '../api/auth/guest-wipe.ts';
import diagramsHandler from '../api/diagrams/index.ts';
import diagramByIdHandler from '../api/diagrams/[id].ts';
import { createSessionToken } from '../api/_auth.ts';

function createMockRes() {
  const res = {
    statusCode: 200,
    headers: {},
    data: null,
    status(code) {
      this.statusCode = code;
      return this;
    },
    setHeader(key, val) {
      this.headers[key.toLowerCase()] = val;
      return this;
    },
    json(data) {
      this.data = data;
      return this;
    },
    end() {
      return this;
    }
  };
  return res;
}

async function runTests() {
  console.log('--- Starting ER Diagram Maker Security Tests ---\n');

  // Test 1: POST /api/auth/google with fake email and no credential token
  {
    const req = {
      method: 'POST',
      body: { email: 'fake@example.com', id: '12345' },
      headers: {}
    };
    const res = createMockRes();
    await googleAuthHandler(req, res);
    assert.strictEqual(res.statusCode, 401, 'Should return 401 when credential is missing');
    assert.match(res.data.error, /Missing Google credential token/i);
    console.log('✓ Test 1 Passed: Fake email without valid token returns 401.');
  }

  // Test 2: POST /api/auth/google with invalid/tampered credential token
  {
    const req = {
      method: 'POST',
      body: { credential: 'tampered.jwt.signature' },
      headers: {}
    };
    const res = createMockRes();
    await googleAuthHandler(req, res);
    assert.strictEqual(res.statusCode, 401, 'Should return 401 on forged/invalid token');
    console.log('✓ Test 2 Passed: Invalid JWT token returns 401.');
  }

  // Test 3: GET /api/diagrams with no cookie -> returns 401
  {
    const req = {
      method: 'GET',
      query: { userId: 'victim_user_id' },
      headers: { 'x-user-id': 'victim_user_id' }
    };
    const res = createMockRes();
    await diagramsHandler(req, res);
    assert.strictEqual(res.statusCode, 401, 'Should return 401 with no session cookie');
    console.log('✓ Test 3 Passed: GET /api/diagrams with no cookie returns 401 (client userId/headers rejected).');
  }

  // Test 4: POST /api/auth/guest-wipe with no cookie -> returns 401
  {
    const req = {
      method: 'POST',
      body: { guestId: 'someone_elses_id' },
      headers: {}
    };
    const res = createMockRes();
    await guestWipeHandler(req, res);
    assert.strictEqual(res.statusCode, 401, 'Guest wipe without session must return 401');
    console.log('✓ Test 4 Passed: POST /api/auth/guest-wipe without session returns 401.');
  }

  // Test 5: Guest auth creates server-signed JWT and sets HttpOnly, SameSite=Lax cookie
  {
    const req = { method: 'POST', headers: {} };
    const res = createMockRes();
    await guestAuthHandler(req, res);
    assert.strictEqual(res.statusCode, 200);
    assert.ok(res.data.user.id.startsWith('guest_'), 'Should issue a random guest ID');
    const setCookie = res.headers['set-cookie'];
    assert.ok(setCookie.includes('HttpOnly'), 'Cookie must be HttpOnly');
    assert.ok(setCookie.includes('SameSite=Lax'), 'Cookie must be SameSite=Lax');
    console.log('✓ Test 5 Passed: Guest auth issues secure HttpOnly server session cookie.');
  }

  // Test 6: GET /api/auth/me verifies valid session and rejects missing session
  {
    const reqUnauth = { method: 'GET', headers: {} };
    const resUnauth = createMockRes();
    await meHandler(reqUnauth, resUnauth);
    assert.strictEqual(resUnauth.statusCode, 401);

    const token = await createSessionToken({
      id: 'google_user_test_123',
      email: 'test@example.com',
      name: 'Test User',
      type: 'google'
    });
    const reqAuth = { method: 'GET', headers: { cookie: `erd_session=${token}` } };
    const resAuth = createMockRes();
    await meHandler(reqAuth, resAuth);
    assert.strictEqual(resAuth.statusCode, 200);
    assert.strictEqual(resAuth.data.user.id, 'google_user_test_123');
    console.log('✓ Test 6 Passed: /api/auth/me verifies valid cookie and rejects unauthenticated caller.');
  }

  // Test 7: POST /api/auth/logout clears session cookie
  {
    const req = { method: 'POST', headers: {} };
    const res = createMockRes();
    await logoutHandler(req, res);
    assert.strictEqual(res.statusCode, 200);
    const setCookie = res.headers['set-cookie'];
    assert.ok(setCookie.includes('Max-Age=0') || setCookie.includes('Expires='), 'Logout must expire cookie');
    console.log('✓ Test 7 Passed: /api/auth/logout clears session cookie.');
  }

  // Test 8: Clerk personal account session verification
  {
    const token = await createSessionToken({
      id: 'user_clerk_personal_456',
      email: 'engineer@example.com',
      name: 'Lead Engineer',
      type: 'clerk'
    });
    const req = { method: 'GET', headers: { cookie: `erd_session=${token}` } };
    const res = createMockRes();
    await meHandler(req, res);
    assert.strictEqual(res.statusCode, 200);
    assert.strictEqual(res.data.user.id, 'user_clerk_personal_456');
    assert.strictEqual(res.data.user.type, 'clerk');
    console.log('✓ Test 8 Passed: Clerk personal account operates without organization requirement.');
  }

  console.log('\n--- All Automated Security Assertions Passed Successfully! ---');
}

runTests().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});
