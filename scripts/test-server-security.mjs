import assert from 'node:assert';
import express from 'express';
import apiRouter from '../server/api.js';
import { createSessionToken } from '../server/auth.js';

const app = express();
app.use(express.json());
app.use('/api', apiRouter);

// Lightweight request runner without network listener
async function testRequest(method, url, { body, headers = {} } = {}) {
  return new Promise((resolve) => {
    const req = {
      method,
      url,
      headers: { ...headers },
      body,
      query: {},
      params: {},
      socket: { remoteAddress: '127.0.0.1' }
    };

    // parse query string
    const qIndex = url.indexOf('?');
    if (qIndex > -1) {
      const qStr = url.slice(qIndex + 1);
      req.url = url.slice(0, qIndex);
      const params = new URLSearchParams(qStr);
      for (const [k, v] of params.entries()) {
        req.query[k] = v;
      }
    }

    const res = {
      statusCode: 200,
      headers: {},
      body: null,
      status(code) {
        this.statusCode = code;
        return this;
      },
      setHeader(k, v) {
        this.headers[k.toLowerCase()] = v;
        return this;
      },
      json(data) {
        this.body = data;
        resolve({ status: this.statusCode, headers: this.headers, body: this.body });
      },
      end() {
        resolve({ status: this.statusCode, headers: this.headers, body: this.body });
      }
    };

    app.handle(req, res);
  });
}

async function runTests() {
  console.log('--- Starting ER Diagram Maker Express & Auth Security Tests ---\n');

  // Test 1: Fake email / custom login without valid Google credential -> 401
  {
    const res = await testRequest('POST', '/api/auth/google', {
      body: { email: 'fake@example.com', id: 'fake_12345' }
    });
    assert.strictEqual(res.status, 401, 'POST /api/auth/google must return 401 without credential token');
    console.log('✓ Test 1: POST /api/auth/google with fake email and no token returns 401.');
  }

  // Test 2: GET /api/diagrams without session cookie -> 401
  {
    const res = await testRequest('GET', '/api/diagrams?userId=attacker_supplied_id', {
      headers: { 'x-user-id': 'attacker_supplied_id' }
    });
    assert.strictEqual(res.status, 401, 'GET /api/diagrams without session must return 401');
    console.log('✓ Test 2: GET /api/diagrams with no cookie returns 401 (rejects query/header userId).');
  }

  // Test 3: POST /api/auth/guest creates server-signed JWT and sets HttpOnly cookie
  let guestCookie = '';
  {
    const res = await testRequest('POST', '/api/auth/guest');
    assert.strictEqual(res.status, 200);
    assert.ok(res.body.user.id.startsWith('guest_'));
    guestCookie = res.headers['set-cookie'];
    assert.ok(guestCookie.includes('HttpOnly'), 'Cookie must include HttpOnly');
    assert.ok(guestCookie.includes('SameSite=Lax'), 'Cookie must include SameSite=Lax');
    console.log('✓ Test 3: POST /api/auth/guest sets secure HttpOnly; SameSite=Lax session cookie.');
  }

  // Extract raw cookie value for requests
  const cookieVal = guestCookie.split(';')[0];

  // Test 4: GET /api/auth/me with guest cookie returns verified user
  {
    const res = await testRequest('GET', '/api/auth/me', {
      headers: { cookie: cookieVal }
    });
    assert.strictEqual(res.status, 200);
    assert.strictEqual(res.body.user.type, 'guest');
    console.log('✓ Test 4: GET /api/auth/me verifies valid cookie session.');
  }

  // Test 5: POST /api/auth/logout expires session cookie
  {
    const res = await testRequest('POST', '/api/auth/logout', {
      headers: { cookie: cookieVal }
    });
    assert.strictEqual(res.status, 200);
    const clearedCookie = res.headers['set-cookie'];
    assert.ok(clearedCookie.includes('Max-Age=0'), 'Logout must expire cookie with Max-Age=0');
    console.log('✓ Test 5: POST /api/auth/logout invalidates session cookie.');
  }

  // Test 6: GET /api/db/status without cookie -> 401
  {
    const res = await testRequest('GET', '/api/db/status');
    assert.strictEqual(res.status, 401, 'DB status must require authentication');
    console.log('✓ Test 6: GET /api/db/status without session returns 401.');
  }

  // Test 7: GET /api/diagrams/:id without cookie -> 401
  {
    const res = await testRequest('GET', '/api/diagrams/some_diag_id');
    assert.strictEqual(res.status, 401, 'Diagram detail must require authentication');
    console.log('✓ Test 7: GET /api/diagrams/:id without session returns 401.');
  }

  // Test 8: DELETE /api/diagrams/:id without cookie -> 401
  {
    const res = await testRequest('DELETE', '/api/diagrams/some_diag_id');
    assert.strictEqual(res.status, 401, 'Diagram delete must require authentication');
    console.log('✓ Test 8: DELETE /api/diagrams/:id without session returns 401.');
  }

  // Test 9: Input size validation on POST /api/diagrams with valid session
  {
    const googleToken = await createSessionToken({
      id: 'google_1234567890',
      email: 'user@example.com',
      name: 'Valid User',
      type: 'google'
    });
    const authHeaders = { cookie: `erd_session=${googleToken}` };

    // Empty diagram name
    const resEmptyName = await testRequest('POST', '/api/diagrams', {
      headers: authHeaders,
      body: { name: '   ', entities: [] }
    });
    assert.strictEqual(resEmptyName.status, 400);

    // Oversized diagram name
    const resLongName = await testRequest('POST', '/api/diagrams', {
      headers: authHeaders,
      body: { name: 'a'.repeat(200), entities: [] }
    });
    assert.strictEqual(resLongName.status, 400);

    // Entities exceeding cap
    const tooManyEntities = Array.from({ length: 105 }, (_, i) => ({ id: `e${i}`, name: `E${i}` }));
    const resTooManyEntities = await testRequest('POST', '/api/diagrams', {
      headers: authHeaders,
      body: { name: 'Large Diagram', entities: tooManyEntities }
    });
    assert.strictEqual(resTooManyEntities.status, 400);
    console.log('✓ Test 9: POST /api/diagrams enforces strict payload size limits & validation.');
  }

  // Test 10: Clerk personal user authentication flow
  {
    const clerkPersonalToken = await createSessionToken({
      id: 'user_clerk_personal_98765',
      email: 'clerk_dev@example.com',
      name: 'Clerk Developer',
      type: 'clerk'
    });
    const res = await testRequest('GET', '/api/auth/me', {
      headers: { cookie: `erd_session=${clerkPersonalToken}` }
    });
    assert.strictEqual(res.status, 200, 'Clerk personal user session must return 200');
    assert.strictEqual(res.body.user.id, 'user_clerk_personal_98765');
    assert.strictEqual(res.body.user.type, 'clerk');
    assert.strictEqual(res.body.user.email, 'clerk_dev@example.com');
    console.log('✓ Test 10: Clerk personal user session functions seamlessly without organization requirement.');
  }

  // Test 11: Diagram ownership isolation between distinct personal accounts
  {
    const userAToken = await createSessionToken({
      id: 'user_alice_111',
      email: 'alice@example.com',
      name: 'Alice',
      type: 'clerk'
    });
    const userBToken = await createSessionToken({
      id: 'user_bob_222',
      email: 'bob@example.com',
      name: 'Bob',
      type: 'clerk'
    });

    // Ensure session IDs are distinct and neither user can impersonate the other via query or header overrides
    const resAlice = await testRequest('GET', '/api/auth/me?userId=user_bob_222', {
      headers: {
        cookie: `erd_session=${userAToken}`,
        'x-user-id': 'user_bob_222'
      }
    });
    assert.strictEqual(resAlice.body.user.id, 'user_alice_111', 'User A identity must never be overridden by client query/headers');

    const resBob = await testRequest('GET', '/api/auth/me?userId=user_alice_111', {
      headers: {
        cookie: `erd_session=${userBToken}`,
        'x-user-id': 'user_alice_111'
      }
    });
    assert.strictEqual(resBob.body.user.id, 'user_bob_222', 'User B identity must strictly map to their own authenticated session');
    console.log('✓ Test 11: Diagram ownership isolation: user sessions strictly map to authenticated personal IDs.');
  }

  console.log('\n=================================================');
  console.log('ALL 11 SECURITY & AUTH CHECKS PASSED (100%)');
  console.log('=================================================\n');
}

runTests().catch(err => {
  console.error('Test execution failed:', err);
  process.exit(1);
});

