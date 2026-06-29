const { expect } = require('chai');
const { OrderService } = require('../patterns/facade/OrderService');
const { OrderValidationError } = require('../patterns/chain/ValidationHandler');
const { InvalidOrderTransitionError } = require('../patterns/state/OrderState');

const menuItem = (id, price, available = true) => ({
    _id: id, name: `Item ${id}`, price, available, image: '',
});

describe('Order Service (Facade pattern)', () => {

    describe('placeOrder()', () => {
        it('validates, prices from the menu, and persists with the correct total', async () => {
            const menu = { m1: menuItem('m1', 5), m2: menuItem('m2', 3) };
            let created = null;
            const service = new OrderService({
                MenuItem: { findById: async (id) => menu[id] },
                Order: { create: async (doc) => { created = doc; return { _id: 'o1', ...doc }; } },
            });

            const order = await service.placeOrder({
                userId: 'u1',
                items: [{ menuItemId: 'm1', quantity: 2 }, { menuItemId: 'm2', quantity: 1 }],
                notes: 'no sugar',
            });

            expect(created.totalPrice).to.equal(13); // 5*2 + 3*1
            expect(created.status).to.equal('queued');
            expect(created.createdBy).to.equal('u1');
            expect(created.items).to.have.lengthOf(2);
            expect(created.items[0]).to.include({ name: 'Item m1', price: 5, quantity: 2 });
            expect(order._id).to.equal('o1');
        });

        it('rejects an empty order through the validation chain', async () => {
            const service = new OrderService({ MenuItem: {}, Order: {} });
            let err;
            try { await service.placeOrder({ userId: 'u1', items: [] }); } catch (e) { err = e; }
            expect(err).to.be.instanceOf(OrderValidationError);
        });

        it('throws when a menu item does not exist', async () => {
            const service = new OrderService({
                MenuItem: { findById: async () => null },
                Order: { create: async () => ({}) },
            });
            let err;
            try {
                await service.placeOrder({ userId: 'u1', items: [{ menuItemId: 'x', quantity: 1 }] });
            } catch (e) { err = e; }
            expect(err).to.be.an('error');
            expect(err.message).to.include('not found');
        });
    });

    describe('changeStatus()', () => {
        it('applies the transition, saves, and notifies observers', async () => {
            let saved = false;
            const order = {
                _id: { toString: () => 'o1' },
                status: 'queued',
                save: async function () { saved = true; return this; },
            };
            const events = [];
            const service = new OrderService({
                Order: { findById: async () => order },
                subject: { notifyStatusChanged: (e) => events.push(e) },
            });

            const updated = await service.changeStatus('o1', 'preparing');

            expect(updated.status).to.equal('preparing');
            expect(saved).to.equal(true);
            expect(events).to.deep.equal([{ orderId: 'o1', from: 'queued', to: 'preparing' }]);
        });

        it('returns null when the order is not found', async () => {
            const service = new OrderService({ Order: { findById: async () => null } });
            expect(await service.changeStatus('missing', 'preparing')).to.equal(null);
        });

        it('throws InvalidOrderTransitionError for an illegal transition', async () => {
            const order = { _id: { toString: () => 'o1' }, status: 'completed', save: async () => {} };
            const service = new OrderService({
                Order: { findById: async () => order },
                subject: { notifyStatusChanged: () => {} },
            });
            let err;
            try { await service.changeStatus('o1', 'queued'); } catch (e) { err = e; }
            expect(err).to.be.instanceOf(InvalidOrderTransitionError);
        });
    });
});
