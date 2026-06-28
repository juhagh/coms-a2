const request = require('supertest');
const app = require('../server');

let adminToken;

beforeAll(async () => {
    // Register and manually set role via direct DB is complex in tests
    // So we register a user and test menu read (public-ish) endpoints
    const res = await request(app)
        .post('/api/auth/register')
        .send({
            name: 'Menu Tester',
            email: `menutester${Date.now()}@test.com`,
            password: 'password123'
        });
    adminToken = res.body.token;
}, 30000);

describe('Menu API', () => {

    describe('GET /api/menu', () => {
        it('should return menu items for authenticated user', async () => {
            const res = await request(app)
                .get('/api/menu')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
        });

        it('should return 401 without token', async () => {
            const res = await request(app).get('/api/menu');
            expect(res.statusCode).toBe(401);
        });

        it('should filter by category', async () => {
            const res = await request(app)
                .get('/api/menu?category=coffee')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(res.statusCode).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
            res.body.forEach(item => {
                expect(item.category).toBe('coffee');
            });
        });
    });
});
