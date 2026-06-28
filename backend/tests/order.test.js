const request = require('supertest');
const app = require('../server');

let staffToken;

beforeAll(async () => {
    const res = await request(app)
        .post('/api/auth/register')
        .send({
            name: 'Order Tester',
            email: `ordertester${Date.now()}@test.com`,
            password: 'password123'
        });
    staffToken = res.body.token;
}, 30000);

describe('Order API', () => {

    describe('GET /api/orders', () => {
        it('should return orders for authenticated user', async () => {
            expect(staffToken).toBeDefined();
            const res = await request(app)
                .get('/api/orders')
                .set('Authorization', `Bearer ${staffToken}`);

            expect(res.statusCode).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
        });

        it('should return 401 without token', async () => {
            const res = await request(app).get('/api/orders');
            expect(res.statusCode).toBe(401);
        });
    });

    describe('POST /api/orders', () => {
        it('should reject order creation without token', async () => {
            const res = await request(app)
                .post('/api/orders')
                .send({ items: [], notes: '' });

            expect(res.statusCode).toBe(401);
        });

        it('should reject an order with no items', async () => {
            expect(staffToken).toBeDefined();
            const res = await request(app)
                .post('/api/orders')
                .set('Authorization', `Bearer ${staffToken}`)
                .send({ items: [], notes: '' });
            expect(res.statusCode).toBe(400);
        });
    });

    describe('PUT /api/orders/:id/status', () => {
        it('should reject status update without token', async () => {
            const res = await request(app)
                .put('/api/orders/507f1f77bcf86cd799439011/status')
                .send({ status: 'preparing' });

            expect(res.statusCode).toBe(401);
        });
    });
});
