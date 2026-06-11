/**
 * TanyaAksata — Bookmarks Test
 * Covers: toggle bookmark, list bookmarks, delete bookmark
 *
 * Setup: register user, buat kategori + post via before()
 * Cleanup: hapus post + kategori via after()
 */

const API = 'https://api-ta.neverland.my.id/api/v1';
const ts  = Date.now();

const admin    = { email: 'admin@tanyaaksata.com', password: 'password123' };
const testUser = {
  name:                  `BookmarkTester ${ts}`,
  email:                 `bm${ts}@mail.com`,
  password:              'password123',
  password_confirmation: 'password123',
};

let adminToken = '';
let userToken  = '';
let categoryId = '';
let postId     = '';
let bookmarkId = '';

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
    body:    { name: `BMCat ${ts}` },
  }).then((res) => {
    categoryId = res.body.data.id;
  });

  // Buat post
  cy.request({
    method:  'POST',
    url:     `${API}/posts`,
    headers: bearer(userToken),
    body:    { title: `BM Post ${ts}`, body: 'Post untuk test bookmark.', category_id: categoryId },
  }).then((res) => {
    postId = res.body.data.id;
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
//  BOOKMARKS — Toggle, List, Delete
// ═══════════════════════════════════════════════════════════
describe('Bookmarks', () => {

  // ── Toggle Bookmark ───────────────────────────────────────

  it('bookmark post — SUCCESS: is_bookmarked jadi true', () => {
    cy.request({
      method:  'POST',
      url:     `${API}/posts/${postId}/bookmark`,
      headers: bearer(userToken),
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body.success).to.be.true;
      expect(res.body.data.is_bookmarked).to.be.true;
    });
  });

  it('bookmark post — FAIL: tanpa token → 401', () => {
    cy.request({
      method:           'POST',
      url:              `${API}/posts/${postId}/bookmark`,
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(401);
    });
  });

  it('toggle bookmark off — SUCCESS: is_bookmarked jadi false', () => {
    cy.request({
      method:  'POST',
      url:     `${API}/posts/${postId}/bookmark`,
      headers: bearer(userToken),
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body.data.is_bookmarked).to.be.false;
    });
  });

  it('toggle bookmark on lagi — SUCCESS: is_bookmarked kembali true', () => {
    cy.request({
      method:  'POST',
      url:     `${API}/posts/${postId}/bookmark`,
      headers: bearer(userToken),
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body.data.is_bookmarked).to.be.true;
    });
  });

  // ── List Bookmarks ────────────────────────────────────────

  it('list bookmarks — SUCCESS: ada minimal 1 bookmark', () => {
    cy.request({
      method:  'GET',
      url:     `${API}/bookmarks`,
      headers: bearer(userToken),
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body.data.data).to.be.an('array').with.length.gte(1);
      // Verifikasi struktur item
      const item = res.body.data.data[0];
      expect(item).to.have.property('id');
      expect(item).to.have.property('post_id');
      expect(item).to.have.property('post');
      bookmarkId = item.id;
    });
  });

  it('list bookmarks — SUCCESS: pagination ada', () => {
    cy.request({
      method:  'GET',
      url:     `${API}/bookmarks`,
      headers: bearer(userToken),
    }).then((res) => {
      expect(res.body.data).to.have.property('current_page');
      expect(res.body.data).to.have.property('total');
    });
  });

  it('list bookmarks — FAIL: tanpa token → 401', () => {
    cy.request({
      method:           'GET',
      url:              `${API}/bookmarks`,
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(401);
    });
  });

  // ── Delete Bookmark ───────────────────────────────────────

  it('delete bookmark — SUCCESS: hapus by bookmark ID', () => {
    cy.request({
      method:  'DELETE',
      url:     `${API}/bookmarks/${bookmarkId}`,
      headers: bearer(userToken),
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body.success).to.be.true;
    });
  });

  it('delete bookmark — FAIL: bookmark ID tidak ada → 404', () => {
    cy.request({
      method:           'DELETE',
      url:              `${API}/bookmarks/00000000-0000-0000-0000-000000000000`,
      headers:          bearer(userToken),
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(404);
    });
  });

  it('delete bookmark — FAIL: tanpa token → 401', () => {
    cy.request({
      method:           'DELETE',
      url:              `${API}/bookmarks/${bookmarkId}`,
      failOnStatusCode: false,
    }).then((res) => {
      expect(res.status).to.eq(401);
    });
  });

  it('list bookmarks setelah delete — SUCCESS: jumlah berkurang', () => {
    cy.request({
      method:  'GET',
      url:     `${API}/bookmarks`,
      headers: bearer(userToken),
    }).then((res) => {
      expect(res.status).to.eq(200);
      const ids = res.body.data.data.map((b) => b.id);
      expect(ids).not.to.include(bookmarkId);
    });
  });

});
