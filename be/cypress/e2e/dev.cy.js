describe('Full API User Journey', () => {
  const apiUrl = 'http://localhost:8000/api/v1';
  const timestamp = Date.now();
  const testUser = {
    name: `User ${timestamp}`,
    email: `user${timestamp}@test.com`,
    password: 'password123',
    password_confirmation: 'password123'
  };

  let userToken = '';
  let adminToken = '';
  let categoryId = '';
  let postId = '';
  let adminId = '';

  // 1. Ambil Admin Token & ID untuk aksi yang butuh role admin (Kategori) dan interaksi
  before(() => {
    cy.request('POST', `${apiUrl}/auth/login`, {
      email: 'admin@tanyaaksata.com',
      password: 'password123'
    }).then((res) => {
      adminToken = res.body.token;
      adminId = res.body.user.id;
    });
  });

  // ========== FLOW 1: AUTH (REGISTER & LOGIN) ==========
  it('1. should register a new user', () => {
    cy.request('POST', `${apiUrl}/auth/register`, testUser).then((res) => {
      expect(res.status).to.eq(201);
      expect(res.body.data.email).to.eq(testUser.email);
    });
  });

  it('2. should login with the new user', () => {
    cy.request('POST', `${apiUrl}/auth/login`, {
      email: testUser.email,
      password: testUser.password
    }).then((res) => {
      expect(res.status).to.eq(200);
      userToken = res.body.token;
    });
  });

  // ========== FLOW 2: PROFILE ==========
  it('3. should view and update user profile', () => {
    cy.request({
      method: 'PUT',
      url: `${apiUrl}/profile`,
      headers: { Authorization: `Bearer ${userToken}` },
      body: {
        bio: 'I am an automated test user',
        location: 'Cypress Runner'
      }
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body.data.bio).to.eq('I am an automated test user');
    });
  });

  // ========== FLOW 3: CATEGORY (ADMIN ACTION) ==========
  it('4. admin should create a category for the user to use', () => {
    cy.request({
      method: 'POST',
      url: `${apiUrl}/categories`,
      headers: { Authorization: `Bearer ${adminToken}` },
      body: {
        name: `Tech ${timestamp}`,
        description: 'New category for testing'
      }
    }).then((res) => {
      expect(res.status).to.eq(201);
      categoryId = res.body.data.id;
    });
  });

  // ========== FLOW 4: POST & TAGS ==========
  it('5. should create a post with tags using the new category', () => {
    cy.request({
      method: 'POST',
      url: `${apiUrl}/posts`,
      headers: { Authorization: `Bearer ${userToken}` },
      body: {
        title: 'Cypress Journey Post',
        body: 'Testing the full journey from register to post.',
        category_id: categoryId,
        tags: ['cypress', 'automation', 'api']
      }
    }).then((res) => {
      expect(res.status).to.eq(201);
      expect(res.body.data.tags).to.have.length(3);
      postId = res.body.data.id;
    });
  });

  // ========== FLOW 5: INTERACTION (FOLLOW) ==========
  it('6. user should follow admin', () => {
    cy.request({
      method: 'POST',
      url: `${apiUrl}/users/${adminId}/follow`,
      headers: { Authorization: `Bearer ${userToken}` }
    }).then((res) => {
      expect(res.status).to.eq(201).or.eq(200);
      expect(res.body.message).to.contain('followed');
    });
  });

  // ========== FLOW 6: COMMENTS ==========
  it('7. admin should comment on the users post', () => {
    cy.request({
      method: 'POST',
      url: `${apiUrl}/comments`,
      headers: { Authorization: `Bearer ${adminToken}` },
      body: {
        post_id: postId,
        body: 'Nice post! Verified by admin.'
      }
    }).then((res) => {
      expect(res.status).to.eq(201);
      expect(res.body.data.body).to.eq('Nice post! Verified by admin.');
    });
  });

  // ========== CLEANUP / VERIFICATION ==========
  it('8. should see the post with its comments', () => {
    cy.request('GET', `${apiUrl}/posts/${postId}`).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body.data.comments).to.have.length.at.least(1);
    });
  });
});
