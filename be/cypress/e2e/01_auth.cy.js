/**
 * TanyaAksata — Auth Test
 * Covers: register, login, me, logout
 */

const API = 'https://api-ta.neverland.my.id/api/v1';
const ts  = Date.now();

const testUser = {
  name:                  `AuthTester ${ts}`,
  email:                 `auth${ts}@mail.com`,
  password:              'password123',
  password_confirmation: 'password123',
};

let userToken = '';
let userId    = '';

// ═══════════════════════════════════════════════════════════
//  AUTH — Register, Login, Me, Logout
// ═══════════════════════════════════════════════════════════
describe('Auth', () => {

  // ── Register ─────────────────────────────────────────────

  it('register — SUCCESS: user baru berhasil dibuat', () => {
    cy.request('POST', `${API}/auth/register`, testUser).then((res) => {
      expect(res.status).to.eq(201);
      expect(res.body.success).to.be.true;
      expect(res.body.data.user.email).to.eq(testUser.email);
      expect(res.body.data.token).to.be.a('string');
      userId = res.body.data.user.id;
    });
  });

  it('register — FAIL: email sudah terdaftar → 422', () => {
    cy.request({
      method:           'POST',
      url:              `${API}/auth/register`,
      body:             testUser,
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(422);
      expect(res.body.success).to.be.false;
      expect(res.body.errors).to.have.property('email');
    });
  });

  it('register — FAIL: password confirmation tidak cocok → 422', () => {
    cy.request({
      method:           'POST',
      url:              `${API}/auth/register`,
      body:             { ...testUser, email: `diff${ts}@mail.com`, password_confirmation: 'salah123' },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(422);
      expect(res.body.errors).to.have.property('password');
    });
  });

  it('register — FAIL: field wajib kosong → 422', () => {
    cy.request({
      method:           'POST',
      url:              `${API}/auth/register`,
      body:             { email: `empty${ts}@mail.com` },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(422);
      expect(res.body.errors).to.have.property('password');
    });
  });

  // ── Login ─────────────────────────────────────────────────

  it('login — SUCCESS: dapat token', () => {
    cy.request('POST', `${API}/auth/login`, {
      email:    testUser.email,
      password: testUser.password,
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body.success).to.be.true;
      expect(res.body.data.token).to.be.a('string');
      expect(res.body.data.user.email).to.eq(testUser.email);
      userToken = res.body.data.token;
    });
  });

  it('login — FAIL: password salah → 401', () => {
    cy.request({
      method:           'POST',
      url:              `${API}/auth/login`,
      body:             { email: testUser.email, password: 'wrongpassword' },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(401);
      expect(res.body.success).to.be.false;
    });
  });

  it('login — FAIL: email tidak terdaftar → 401', () => {
    cy.request({
      method:           'POST',
      url:              `${API}/auth/login`,
      body:             { email: 'tidakada@mail.com', password: 'password123' },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(401);
      expect(res.body.success).to.be.false;
    });
  });

  // ── Me ────────────────────────────────────────────────────

  it('me — SUCCESS: kembalikan data user yang sedang login', () => {
    cy.request({
      method:  'GET',
      url:     `${API}/auth/me`,
      headers: { Authorization: `Bearer ${userToken}` },
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body.data.email).to.eq(testUser.email);
      expect(res.body.data.id).to.eq(userId);
    });
  });

  it('me — FAIL: tanpa token → 401', () => {
    cy.request({
      method:           'GET',
      url:              `${API}/auth/me`,
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(401);
    });
  });

  it('me — FAIL: token tidak valid → 401', () => {
    cy.request({
      method:           'GET',
      url:              `${API}/auth/me`,
      headers:          { Authorization: 'Bearer invalidtoken123' },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(401);
    });
  });

  // ── Logout ────────────────────────────────────────────────

  it('logout — SUCCESS: token dihapus', () => {
    cy.request({
      method:  'POST',
      url:     `${API}/auth/logout`,
      headers: { Authorization: `Bearer ${userToken}` },
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body.success).to.be.true;
    });
  });

  it('logout — FAIL: token bekas tidak bisa akses me lagi → 401', () => {
    cy.request({
      method:           'GET',
      url:              `${API}/auth/me`,
      headers:          { Authorization: `Bearer ${userToken}` },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(401);
    });
  });

});
