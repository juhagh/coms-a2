const request = require('supertest');
const app = require('../server');

describe('Auth API', () => {

    describe('POST /api/auth/register', () => {
        it('should register a new user successfully', async () => {
            const res = await request(app)
                .post('/api/auth/register')
                .send({
                    name: 'Test User',
                    email: `testuser${Date.now()}@test.com`,
                    password: 'password123'
                });
            expect(res.statusCode).toBe(201);
            expect(res.body).toHaveProperty('token');
            expect(res.body).toHaveProperty('role');
            expect(res.body.role).toBe('staff');
        });

        it('should fail if user already exists', async () => {
            const email = `duplicate${Date.now()}@test.com`;
            await request(app)
                .post('/api/auth/register')
                .send({ name: 'User', email, password: 'password123' });

            const res = await request(app)
                .post('/api/auth/register')
                .send({ name: 'User', email, password: 'password123' });

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toBe('User already exists');
        });
    });

    describe('POST /api/auth/login', () => {
        it('should login successfully with correct credentials', async () => {
            const email = `logintest${Date.now()}@test.com`;
            await request(app)
                .post('/api/auth/register')
                .send({ name: 'Login User', email, password: 'password123' });

            const res = await request(app)
                .post('/api/auth/login')
                .send({ email, password: 'password123' });

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('token');
            expect(res.body.email).toBe(email);
        });

        it('should fail with wrong password', async () => {
            const email = `wrongpass${Date.now()}@test.com`;
            await request(app)
                .post('/api/auth/register')
                .send({ name: 'Wrong Pass User', email, password: 'password123' });

            const res = await request(app)
                .post('/api/auth/login')
                .send({ email, password: 'wrongpassword' });

            expect(res.statusCode).toBe(401);
        });

        it('should fail with non-existent email', async () => {
            const res = await request(app)
                .post('/api/auth/login')
                .send({ email: 'nobody@nowhere.com', password: 'password123' });

            expect(res.statusCode).toBe(401);
        });
    });

    describe('GET /api/auth/profile', () => {
        it('should return profile for authenticated user', async () => {
            const email = `profile${Date.now()}@test.com`;
            const register = await request(app)
                .post('/api/auth/register')
                .send({ name: 'Profile User', email, password: 'password123' });

            const token = register.body.token;

            const res = await request(app)
                .get('/api/auth/profile')
                .set('Authorization', `Bearer ${token}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.email).toBe(email);
            expect(res.body).toHaveProperty('role');
        });

        it('should return 401 without token', async () => {
            const res = await request(app)
                .get('/api/auth/profile');

            expect(res.statusCode).toBe(401);
        });
    });
});
