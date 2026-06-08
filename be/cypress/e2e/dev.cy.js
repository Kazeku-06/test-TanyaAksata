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
  let userId = '';
  let adminToken = '';
  let adminId = '';
  let categoryId = '';
  let postId = '';
  let commentId = '';
  let reportId = '';
  let bookmarkId = '';

  // Setup: Ambil Admin Token & ID
  before(() => {
    cy.request('POST', `${apiUrl}/auth/login`, {
      email: 'admin@tanyaaksata.com',
      password: 'password123'
    }).then((res) => {
      adminToken = res.body.data.token;
      adminId = res.body.data.user.id;
    });
  });

  // ========== AUTH & PROFILE ==========
  it('1. should register a new user', () => {
    cy.request('POST', `${apiUrl}/auth/register`, testUser).then((res) => {
      expect(res.status).to.eq(201);
      userId = res.body.data.user.id;
    });
  });

  it('2. should login with the new user', () => {
    cy.request('POST', `${apiUrl}/auth/login`, {
      email: testUser.email,
      password: testUser.password
    }).then((res) => {
      expect(res.status).to.eq(200);
      userToken = res.body.data.token;
    });
  });

  it('3. should get current user info (me)', () => {
    cy.request({
      method: 'GET',
      url: `${apiUrl}/auth/me`,
      headers: { Authorization: `Bearer ${userToken}` }
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body.data.email).to.eq(testUser.email);
    });
  });

  it('4. should update user profile', () => {
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

  it('5. should get user badges', () => {
    cy.request({
      method: 'GET',
      url: `${apiUrl}/my-badges`,
      headers: { Authorization: `Bearer ${userToken}` }
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body.data).to.be.an('array');
    });
  });

  // ========== CATEGORIES ==========
  it('6. admin should create a category', () => {
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

  it('7. admin should update the category', () => {
    cy.request({
      method: 'PUT',
      url: `${apiUrl}/categories/${categoryId}`,
      headers: { Authorization: `Bearer ${adminToken}` },
      body: { name: `Updated Tech ${timestamp}` }
    }).then((res) => {
      expect(res.status).to.eq(200);
    });
  });

  // ========== POSTS ==========
  it('8. user should create a post', () => {
    cy.request({
      method: 'POST',
      url: `${apiUrl}/posts`,
      headers: { Authorization: `Bearer ${userToken}` },
      body: {
        title: 'Cypress Journey Post',
        body: 'Testing the full journey from register to post.',
        category_id: categoryId,
        tags: ['cypress', 'automation']
      }
    }).then((res) => {
      expect(res.status).to.eq(201);
      postId = res.body.data.id;
    });
  });

  it('9. user should update their post', () => {
    cy.request({
      method: 'PUT',
      url: `${apiUrl}/posts/${postId}`,
      headers: { Authorization: `Bearer ${userToken}` },
      body: { title: 'Updated Cypress Post' }
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body.data.title).to.eq('Updated Cypress Post');
    });
  });

  it('10. should see trending and search posts', () => {
    cy.request('GET', `${apiUrl}/posts/trending`).then((res) => expect(res.status).to.eq(200));
    cy.request('GET', `${apiUrl}/posts/search?q=Cypress`).then((res) => expect(res.status).to.eq(200));
  });

  // ========== COMMENTS ==========
  it('11. admin should comment on the post', () => {
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
      commentId = res.body.data.id;
    });
  });

  it('12. user should accept the admin comment as answer', () => {
    cy.request({
      method: 'POST',
      url: `${apiUrl}/comments/${commentId}/accept`,
      headers: { Authorization: `Bearer ${userToken}` }
    }).then((res) => {
      expect(res.status).to.eq(200);
    });
  });

  // ========== INTERACTIONS ==========
  it('13. admin should like and vote the users post', () => {
    cy.request({
      method: 'POST',
      url: `${apiUrl}/posts/${postId}/like`,
      headers: { Authorization: `Bearer ${adminToken}` }
    }).then((res) => expect(res.status).to.eq(200));

    cy.request({
      method: 'POST',
      url: `${apiUrl}/posts/${postId}/vote`,
      headers: { Authorization: `Bearer ${adminToken}` },
      body: { vote: 1 }
    }).then((res) => expect(res.status).to.eq(200));
  });

  it('14. user should bookmark the post', () => {
    cy.request({
      method: 'POST',
      url: `${apiUrl}/posts/${postId}/bookmark`,
      headers: { Authorization: `Bearer ${userToken}` }
    }).then((res) => {
      expect(res.status).to.eq(200);
      expect(res.body.data.is_bookmarked).to.be.true;
    });
  });

  it('15. user should follow the admin', () => {
    cy.request({
      method: 'POST',
      url: `${apiUrl}/users/${adminId}/follow`,
      headers: { Authorization: `Bearer ${userToken}` }
    }).then((res) => expect(res.status).to.be.oneOf([200, 201]));
  });

  // ========== NOTIFICATIONS & LEADERBOARD ==========
  it('16. should check notifications and leaderboard', () => {
    cy.request({
      method: 'GET',
      url: `${apiUrl}/notifications`,
      headers: { Authorization: `Bearer ${userToken}` }
    }).then((res) => expect(res.status).to.eq(200));

    cy.request('GET', `${apiUrl}/leaderboard`).then((res) => expect(res.status).to.eq(200));
  });

  // ========== REPORTS & MODERATION ==========
  it('17. user should report the post', () => {
    cy.request({
      method: 'POST',
      url: `${apiUrl}/reports`,
      headers: { Authorization: `Bearer ${userToken}` },
      body: {
        target_id: postId,
        target_type: 'post',
        reason: 'Spamming content',
        description: 'This is a test report'
      }
    }).then((res) => {
      expect(res.status).to.eq(201);
      reportId = res.body.data.id;
    });
  });

  it('18. admin should resolve the report', () => {
    cy.request({
      method: 'PUT',
      url: `${apiUrl}/moderation/reports/${reportId}/resolve`,
      headers: { Authorization: `Bearer ${adminToken}` },
      body: {
        action: 'resolve',
        action_taken: 'ignore',
        resolution_note: 'Post kept'
      }
    }).then((res) => expect(res.status).to.eq(200));
  });

  it('19. admin should warn and ban the user', () => {
    cy.request({
      method: 'POST',
      url: `${apiUrl}/moderation/users/${userId}/warn`,
      headers: { Authorization: `Bearer ${adminToken}` },
      body: { reason: 'Test warning' }
    }).then((res) => expect(res.status).to.eq(200));

    cy.request({
      method: 'POST',
      url: `${apiUrl}/moderation/users/${userId}/ban`,
      headers: { Authorization: `Bearer ${adminToken}` },
      body: { reason: 'Test ban', duration_days: 1 }
    }).then((res) => expect(res.status).to.eq(200));

    cy.request({
      method: 'POST',
      url: `${apiUrl}/moderation/users/${userId}/unban`,
      headers: { Authorization: `Bearer ${adminToken}` }
    }).then((res) => expect(res.status).to.eq(200));
  });

  // ========== SOFT DELETES & CLEANUP ==========
  it('20. should handle soft deletes and cleanup', () => {
    // Delete Post
    cy.request({
      method: 'DELETE',
      url: `${apiUrl}/posts/${postId}`,
      headers: { Authorization: `Bearer ${userToken}` }
    }).then((res) => expect(res.status).to.eq(200));

    // Delete Category
    cy.request({
      method: 'DELETE',
      url: `${apiUrl}/categories/${categoryId}`,
      headers: { Authorization: `Bearer ${adminToken}` }
    }).then((res) => expect(res.status).to.eq(200));
  });

  it('21. should view statistics and logout', () => {
    cy.request({
      method: 'GET',
      url: `${apiUrl}/admin/statistics`,
      headers: { Authorization: `Bearer ${adminToken}` }
    }).then((res) => expect(res.status).to.eq(200));

    cy.request({
      method: 'POST',
      url: `${apiUrl}/auth/logout`,
      headers: { Authorization: `Bearer ${userToken}` }
    }).then((res) => expect(res.status).to.eq(200));
  });

});
