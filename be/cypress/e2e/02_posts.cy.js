/**
 * TanyaAksata — Posts Test
 * Covers: list, trending, search, detail, create, update, delete
 *
 * Setup: buat user + kategori dulu via before(), cleanup di after()
 */

const API = 'https://api-ta.neverland.my.id/api/v1';
const ts  = Date.now();

const admin    = { email: 'admin@tanyaaksata.com', password: 'password123' };
const testUser = {
  name:                  `PostTester ${ts}`,
  email:                 `post${ts}@mail.com`,
  password:              'password123',
  password_confirmation: 'password123',
};

let adminToken  = '';
let userToken   = '';
let userId      = '';
let categoryId  = '';
let postId      = '';

const bearer = (token) => ({ Authorization: `Bearer ${token}` });

// Setup: login admin, register+login user, buat kategori
before(() => {
  // Login admin
  cy.request('POST', `${API}/auth/login`, admin).then((res) => {
    adminToken = res.body.data.token;
  });

  // Register & login user
  cy.request('POST', `${API}/auth/register`, testUser).then((res) => {
    userId    = res.body.data.user.id;
    userToken = res.body.data.token;
  });

  // Buat kategori untuk post
  cy.request({
    method:  'POST',
    url:     `${API}/categories`,
    headers: { Authorization: `Bearer ${adminToken}` },
    body:    { name: `PostCat ${ts}`, description: 'Kategori test posts' },
  }).then((res) => {
    categoryId = res.body.data.id;
  });
});

// Cleanup: hapus kategori setelah semua test selesai
after(() => {
  if (categoryId) {
    cy.request({
      method:           'DELETE',
      url:              `${API}/categories/${categoryId}`,
      headers:          bearer(adminToken),
      failOnStatusCode: false,
    });
  }
});

// ═══════════════════════════════════════════════════════════
//  POSTS — List, Trending, Search, Detail, CRUD
// ═══════════════════════════════════════════════════════════
describe('Posts', () => {

  // ── List & Read (Public) ──────────────────────────────────

  it('list posts — SUCCESS: kembalikan paginated posts', () => {
    cy.request('GET', `${API}/posts`).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body.success).to.be.true;
      expect(res.body.data).to.have.property('data');
      expect(res.body.data.data).to.be.an('array');
      expect(res.body.data).to.have.property('current_page');
      expect(res.body.data).to.have.property('total');
    });
  });

  it('list posts page 2 — SUCCESS', () => {
    cy.request('GET', `${API}/posts?page=2`).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body.data.current_page).to.eq(2);
    });
  });

  it('trending posts — SUCCESS: kembalikan array post trending', () => {
    cy.request('GET', `${API}/posts/trending?limit=5`).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body.data).to.be.an('array');
      expect(res.body.data.length).to.be.lte(5);
    });
  });

  it('search posts — SUCCESS: filter berdasarkan keyword', () => {
    cy.request('GET', `${API}/posts/search?q=laravel`).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body.data.data).to.be.an('array');
    });
  });

  it('search posts — SUCCESS: filter berdasarkan tag', () => {
    cy.request('GET', `${API}/posts/search?tag=javascript`).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body.data.data).to.be.an('array');
    });
  });

  it('search posts — SUCCESS: sort most_voted', () => {
    cy.request('GET', `${API}/posts/search?sort=most_voted`).then((res) => {
      expect(res.status).to.eq(200);
    });
  });

  // ── Create ────────────────────────────────────────────────

  it('create post — SUCCESS: user buat post baru dengan tags', () => {
    cy.request({
      method:  'POST',
      url:     `${API}/posts`,
      headers: bearer(userToken),
      body:    {
        title:       `Cypress Post ${ts}`,
        body:        'Ini adalah isi post dari automated test Cypress.',
        category_id: categoryId,
        tags:        ['cypress', 'test', 'automation'],
      },
    }).then((res) => {
      expect(res.status).to.eq(201);
      expect(res.body.success).to.be.true;
      expect(res.body.data.title).to.eq(`Cypress Post ${ts}`);
      expect(res.body.data.tags).to.be.an('array').with.length(3);
      expect(res.body.data.user_id).to.eq(userId);
      postId = res.body.data.id;
    });
  });

  it('create post — FAIL: tanpa token → 401', () => {
    cy.request({
      method:           'POST',
      url:              `${API}/posts`,
      body:             { title: 'No Auth', body: 'body', category_id: categoryId },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(401);
    });
  });

  it('create post — FAIL: tanpa title → 422', () => {
    cy.request({
      method:           'POST',
      url:              `${API}/posts`,
      headers:          bearer(userToken),
      body:             { body: 'no title', category_id: categoryId },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(422);
      expect(res.body.errors).to.have.property('title');
    });
  });

  it('create post — FAIL: category_id tidak ada → 422', () => {
    cy.request({
      method:           'POST',
      url:              `${API}/posts`,
      headers:          bearer(userToken),
      body:             { title: 'Bad Cat', body: 'isi', category_id: '00000000-0000-0000-0000-000000000000' },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(422);
      expect(res.body.errors).to.have.property('category_id');
    });
  });

  // ── Detail ────────────────────────────────────────────────

  it('get post detail — SUCCESS: views_count bertambah', () => {
    cy.request('GET', `${API}/posts/${postId}`).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body.data.id).to.eq(postId);
      expect(res.body.data).to.have.property('views_count');
      expect(res.body.data).to.have.property('comments');
      expect(res.body.data.is_bookmarked).to.be.false;
    });
  });

  it('get post detail — FAIL: ID tidak ada → 404', () => {
    cy.request({
      method:           'GET',
      url:              `${API}/posts/00000000-0000-0000-0000-000000000000`,
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(404);
      expect(res.body.success).to.be.false;
    });
  });

  it('posts by user — SUCCESS', () => {
    cy.request('GET', `${API}/users/${userId}/posts`).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body.data.data).to.be.an('array');
    });
  });

  // ── Update ────────────────────────────────────────────────

  it('update post — SUCCESS: pemilik update judul dan body', () => {
    cy.request({
      method:  'PATCH',
      url:     `${API}/posts/${postId}`,
      headers: bearer(userToken),
      body:    { title: `Updated Post ${ts}`, edit_summary: 'Update dari cypress test' },
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body.data.title).to.eq(`Updated Post ${ts}`);
    });
  });

  it('update post — FAIL: bukan pemilik tidak bisa edit → 403', () => {
    cy.request({
      method:           'PATCH',
      url:              `${API}/posts/${postId}`,
      headers:          bearer(adminToken),
      body:             { title: 'Admin Override' },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(403);
      expect(res.body.success).to.be.false;
    });
  });

  it('update post — FAIL: tanpa token → 401', () => {
    cy.request({
      method:           'PATCH',
      url:              `${API}/posts/${postId}`,
      body:             { title: 'No Auth Edit' },
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(401);
    });
  });

  // ── Delete ────────────────────────────────────────────────

  it('delete post — FAIL: bukan pemilik tidak bisa hapus → 403', () => {
    cy.request({
      method:           'DELETE',
      url:              `${API}/posts/${postId}`,
      headers:          bearer(adminToken),
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(403);
    });
  });

  it('delete post — SUCCESS: pemilik hapus post sendiri', () => {
    cy.request({
      method:  'DELETE',
      url:     `${API}/posts/${postId}`,
      headers: bearer(userToken),
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body.success).to.be.true;
    });
  });

  it('delete post — FAIL: post sudah dihapus → 404', () => {
    cy.request({
      method:           'DELETE',
      url:              `${API}/posts/${postId}`,
      headers:          bearer(userToken),
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(404);
    });
  });

});
