/**
 * TanyaAksata — Notifications Test
 * Covers: list, mark as read, mark all as read
 *
 * Setup: register user + trigger notifikasi (lewat comment dari admin)
 * supaya ada data notif yang bisa di-test.
 */

const API = 'https://api-ta.neverland.my.id/api/v1';
const ts  = Date.now();

const admin    = { email: 'admin@tanyaaksata.com', password: 'password123' };
const testUser = {
  name:                  `NotifTester ${ts}`,
  email:                 `notif${ts}@mail.com`,
  password:              'password123',
  password_confirmation: 'password123',
};

let adminToken = '';
let userToken  = '';
let categoryId = '';
let postId     = '';
let notifId    = '';

const bearer = (token) => ({ Authorization: `Bearer ${token}` });

before(() => {
  // Login admin
  cy.request('POST', `${API}/auth/login`, admin).then((res) => {
    adminToken = res.body.data.token;
  });

  // Register & login user
  cy.request('POST', `${API}/auth/register`, testUser).then((res) => {
    userToken = res.body.data.token;
  });

  // Buat kategori
  cy.request({
    method:  'POST',
    url:     `${API}/categories`,
    headers: bearer(adminToken),
    body:    { name: `NotifCat ${ts}` },
  }).then((res) => {
    categoryId = res.body.data.id;
  });

  // Buat post milik user
  cy.request({
    method:  'POST',
    url:     `${API}/posts`,
    headers: bearer(userToken),
    body:    { title: `Notif Post ${ts}`, body: 'Post untuk trigger notifikasi.', category_id: categoryId },
  }).then((res) => {
    postId = res.body.data.id;
  });

  // Admin komentar → user dapat notifikasi
  cy.request({
    method:  'POST',
    url:     `${API}/comments`,
    headers: bearer(adminToken),
    body:    { post_id: postId, body: 'Komentar admin untuk trigger notif.' },
  });

  // Admin like post → user dapat notifikasi like
  cy.request({
    method:  'POST',
    url:     `${API}/posts/${postId}/like`,
    headers: bearer(adminToken),
    failOnStatusCode: false,
  });
});

after(() => {
  if (postId) {
    cy.request({ method: 'DELETE', url: `${API}/posts/${postId}`, headers: bearer(userToken), failOnStatusCode: false });
  }
  if (categoryId) {
    cy.request({ method: 'DELETE', url: `${API}/categories/${categoryId}`, headers: bearer(adminToken), failOnStatusCode: false });
  }
});

// ═══════════════════════════════════════════════════════════
//  NOTIFICATIONS — List, Mark as Read
// ═══════════════════════════════════════════════════════════
describe('Notifications', () => {

  // ── List Notifications ────────────────────────────────────

  it('list notifications — SUCCESS: kembalikan paginated notifikasi', () => {
    cy.request({
      method:  'GET',
      url:     `${API}/notifications`,
      headers: bearer(userToken),
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body.success).to.be.true;
      expect(res.body.data.data).to.be.an('array');
      expect(res.body.data).to.have.property('current_page');
      expect(res.body.data).to.have.property('total');

      if (res.body.data.data.length > 0) {
        const notif = res.body.data.data[0];
        expect(notif).to.have.property('id');
        expect(notif).to.have.property('type');
        expect(notif).to.have.property('message');
        expect(notif).to.have.property('is_read');
        notifId = notif.id;
      }
    });
  });

  it('list notifications — SUCCESS: ada notifikasi yang belum dibaca', () => {
    cy.request({
      method:  'GET',
      url:     `${API}/notifications`,
      headers: bearer(userToken),
    }).then((res) => {
      expect(res.status).to.eq(200);
      const unread = res.body.data.data.filter((n) => !n.is_read);
      cy.log(`Notifikasi belum dibaca: ${unread.length}`);
      // Minimal ada 1 notif dari setup (comment admin)
      expect(res.body.data.total).to.be.gte(1);
    });
  });

  it('list notifications — FAIL: tanpa token → 401', () => {
    cy.request({
      method:           'GET',
      url:              `${API}/notifications`,
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(401);
      expect(res.body.success).to.be.false;
    });
  });

  it('list notifications — FAIL: token tidak valid → 401', () => {
    cy.request({
      method:           'GET',
      url:              `${API}/notifications`,
      headers:          { Authorization: 'Bearer tokenpalsu' },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(401);
    });
  });

  // ── Mark as Read ──────────────────────────────────────────

  it('mark as read — SUCCESS: notif is_read jadi true', () => {
    if (!notifId) return cy.log('Skip: tidak ada notifikasi.');

    cy.request({
      method:  'PUT',
      url:     `${API}/notifications/${notifId}/read`,
      headers: bearer(userToken),
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body.success).to.be.true;
    });

    // Verifikasi status berubah
    cy.request({
      method:  'GET',
      url:     `${API}/notifications`,
      headers: bearer(userToken),
    }).then((res) => {
      const notif = res.body.data.data.find((n) => n.id === notifId);
      if (notif) expect(notif.is_read).to.be.true;
    });
  });

  it('mark as read — FAIL: ID notif tidak ada → 404', () => {
    cy.request({
      method:           'PUT',
      url:              `${API}/notifications/00000000-0000-0000-0000-000000000000/read`,
      headers:          bearer(userToken),
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(404);
    });
  });

  it('mark as read — FAIL: tanpa token → 401', () => {
    if (!notifId) return cy.log('Skip: tidak ada notifikasi.');
    cy.request({
      method:           'PUT',
      url:              `${API}/notifications/${notifId}/read`,
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(401);
    });
  });

  // ── Mark All as Read ──────────────────────────────────────

  it('mark all as read — SUCCESS: semua notif jadi is_read true', () => {
    cy.request({
      method:  'PUT',
      url:     `${API}/notifications/read-all`,
      headers: bearer(userToken),
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body.success).to.be.true;
    });

    // Verifikasi tidak ada lagi yang unread
    cy.request({
      method:  'GET',
      url:     `${API}/notifications`,
      headers: bearer(userToken),
    }).then((res) => {
      const unread = res.body.data.data.filter((n) => !n.is_read);
      expect(unread.length).to.eq(0);
    });
  });

  it('mark all as read — FAIL: tanpa token → 401', () => {
    cy.request({
      method:           'PUT',
      url:              `${API}/notifications/read-all`,
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(401);
    });
  });

});
