/**
 * TanyaAksata — Admin Test
 * Covers: list users, assign/remove role, statistics, activity trend
 *
 * Setup: register user baru sebagai target operasi admin
 */

const API = 'https://api-ta.neverland.my.id/api/v1';
const ts  = Date.now();

const admin    = { email: 'admin@tanyaaksata.com', password: 'password123' };
const testUser = {
  name:                  `AdminTarget ${ts}`,
  email:                 `admintarget${ts}@mail.com`,
  password:              'password123',
  password_confirmation: 'password123',
};

let adminToken = '';
let userToken  = '';
let userId     = '';

const bearer = (token) => ({ Authorization: `Bearer ${token}` });

before(() => {
  // Login admin
  cy.request('POST', `${API}/auth/login`, admin).then((res) => {
    adminToken = res.body.data.token;
  });

  // Register user sebagai target
  cy.request('POST', `${API}/auth/register`, testUser).then((res) => {
    userId    = res.body.data.user.id;
    userToken = res.body.data.token;
  });
});

// ═══════════════════════════════════════════════════════════
//  ADMIN — Users, Roles, Statistics
// ═══════════════════════════════════════════════════════════
describe('Admin', () => {

  // ── List Users ────────────────────────────────────────────

  it('list users — SUCCESS: admin lihat semua user dengan role', () => {
    cy.request({
      method:  'GET',
      url:     `${API}/admin/users`,
      headers: bearer(adminToken),
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body.success).to.be.true;
      expect(res.body.data).to.be.an('array');
      // Verifikasi struktur item
      if (res.body.data.length > 0) {
        expect(res.body.data[0]).to.have.property('id');
        expect(res.body.data[0]).to.have.property('email');
        expect(res.body.data[0]).to.have.property('roles');
      }
    });
  });

  it('list users — FAIL: user biasa tidak bisa akses → 403', () => {
    cy.request({
      method:           'GET',
      url:              `${API}/admin/users`,
      headers:          bearer(userToken),
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(403);
      expect(res.body.success).to.be.false;
    });
  });

  it('list users — FAIL: tanpa token → 401', () => {
    cy.request({
      method:           'GET',
      url:              `${API}/admin/users`,
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(401);
    });
  });

  // ── Assign Role ───────────────────────────────────────────

  it('assign role — SUCCESS: admin beri role moderator ke user', () => {
    cy.request({
      method:  'POST',
      url:     `${API}/admin/users/${userId}/assign-role`,
      headers: bearer(adminToken),
      body:    { role_name: 'moderator' },
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body.success).to.be.true;
    });

    // Verifikasi role tersimpan
    cy.request({
      method:  'GET',
      url:     `${API}/admin/users`,
      headers: bearer(adminToken),
    }).then((res) => {
      const user  = res.body.data.find((u) => u.id === userId);
      const roles = user?.roles?.map((r) => r.name) ?? [];
      expect(roles).to.include('moderator');
    });
  });

  it('assign role — SUCCESS: idempotent — assign role yang sudah ada tidak error', () => {
    cy.request({
      method:  'POST',
      url:     `${API}/admin/users/${userId}/assign-role`,
      headers: bearer(adminToken),
      body:    { role_name: 'moderator' },
    }).then((res) => {
      expect(res.status).to.eq(200);
    });
  });

  it('assign role — FAIL: role tidak ada → 404', () => {
    cy.request({
      method:           'POST',
      url:              `${API}/admin/users/${userId}/assign-role`,
      headers:          bearer(adminToken),
      body:             { role_name: 'superadmin' },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(404);
      expect(res.body.success).to.be.false;
    });
  });

  it('assign role — FAIL: user biasa tidak bisa assign role → 403', () => {
    cy.request({
      method:           'POST',
      url:              `${API}/admin/users/${userId}/assign-role`,
      headers:          bearer(userToken),
      body:             { role_name: 'moderator' },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(403);
    });
  });

  it('assign role — FAIL: tanpa token → 401', () => {
    cy.request({
      method:           'POST',
      url:              `${API}/admin/users/${userId}/assign-role`,
      body:             { role_name: 'moderator' },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(401);
    });
  });

  // ── Remove Role ───────────────────────────────────────────

  it('remove role — SUCCESS: admin cabut role moderator dari user', () => {
    cy.request({
      method:  'POST',
      url:     `${API}/admin/users/${userId}/remove-role`,
      headers: bearer(adminToken),
      body:    { role_name: 'moderator' },
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body.success).to.be.true;
    });

    // Verifikasi role sudah dicabut
    cy.request({
      method:  'GET',
      url:     `${API}/admin/users`,
      headers: bearer(adminToken),
    }).then((res) => {
      const user  = res.body.data.find((u) => u.id === userId);
      const roles = user?.roles?.map((r) => r.name) ?? [];
      expect(roles).not.to.include('moderator');
    });
  });

  it('remove role — FAIL: role tidak ada → 404', () => {
    cy.request({
      method:           'POST',
      url:              `${API}/admin/users/${userId}/remove-role`,
      headers:          bearer(adminToken),
      body:             { role_name: 'superadmin' },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(404);
    });
  });

  it('remove role — FAIL: user biasa tidak bisa remove role → 403', () => {
    cy.request({
      method:           'POST',
      url:              `${API}/admin/users/${userId}/remove-role`,
      headers:          bearer(userToken),
      body:             { role_name: 'user' },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(403);
    });
  });

  // ── Statistics ────────────────────────────────────────────

  it('statistics — SUCCESS: kembalikan data statistik platform', () => {
    cy.request({
      method:  'GET',
      url:     `${API}/admin/statistics`,
      headers: bearer(adminToken),
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body.success).to.be.true;
      expect(res.body.data).to.have.property('users');
      expect(res.body.data).to.have.property('posts');
      expect(res.body.data).to.have.property('comments');
      expect(res.body.data.users).to.have.property('total');
      expect(res.body.data.posts).to.have.property('total');
    });
  });

  it('statistics — FAIL: user biasa tidak bisa akses → 403', () => {
    cy.request({
      method:           'GET',
      url:              `${API}/admin/statistics`,
      headers:          bearer(userToken),
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(403);
    });
  });

  it('statistics — FAIL: tanpa token → 401', () => {
    cy.request({
      method:           'GET',
      url:              `${API}/admin/statistics`,
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(401);
    });
  });

  // ── Activity Trend ────────────────────────────────────────

  it('activity trend — SUCCESS: kembalikan data trend aktivitas', () => {
    cy.request({
      method:  'GET',
      url:     `${API}/admin/statistics/trend`,
      headers: bearer(adminToken),
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body.success).to.be.true;
    });
  });

  it('activity trend — FAIL: user biasa tidak bisa akses → 403', () => {
    cy.request({
      method:           'GET',
      url:              `${API}/admin/statistics/trend`,
      headers:          bearer(userToken),
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(403);
    });
  });

});
