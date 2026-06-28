const { expect } = require('chai');
const {
    getOrderState,
    InvalidOrderTransitionError,
} = require('../patterns/state/OrderState');
const { transitionOrder } = require('../patterns/state/OrderStateMachine');

describe('Order State Machine (State pattern)', () => {

    describe('valid transitions', () => {
        const validCases = [
            ['draft', 'submitted'],
            ['draft', 'cancelled'],
            ['submitted', 'queued'],
            ['submitted', 'cancelled'],
            ['queued', 'preparing'],
            ['queued', 'cancelled'],
            ['preparing', 'ready'],
            ['ready', 'completed'],
        ];

        validCases.forEach(([from, to]) => {
            it(`allows ${from} -> ${to}`, () => {
                const order = { status: from };
                transitionOrder(order, to);
                expect(order.status).to.equal(to);
            });
        });
    });

    describe('invalid transitions', () => {
        const invalidCases = [
            ['queued', 'completed'],
            ['ready', 'preparing'],
            ['preparing', 'cancelled'],
            ['completed', 'queued'],
            ['cancelled', 'queued'],
        ];

        invalidCases.forEach(([from, to]) => {
            it(`blocks ${from} -> ${to}`, () => {
                const order = { status: from };
                expect(() => transitionOrder(order, to))
                    .to.throw(InvalidOrderTransitionError, `Cannot transition from ${from} to ${to}`);
                expect(order.status).to.equal(from); // unchanged on failure
            });
        });
    });

    describe('state objects', () => {
        it('exposes the allowed transitions for a state', () => {
            expect(getOrderState('queued').allowedTransitions())
                .to.have.members(['preparing', 'cancelled']);
        });

        it('marks completed and cancelled as terminal', () => {
            expect(getOrderState('completed').isTerminal()).to.equal(true);
            expect(getOrderState('cancelled').isTerminal()).to.equal(true);
        });

        it('marks active states as non-terminal', () => {
            expect(getOrderState('queued').isTerminal()).to.equal(false);
        });

        it('throws on an unknown status', () => {
            expect(() => getOrderState('frozen')).to.throw('Unknown order status: frozen');
        });
    });

    describe('regression: a draft order no longer crashes the status update', () => {
        it('transitions a draft order without throwing', () => {
            const order = { status: 'draft' };
            expect(() => transitionOrder(order, 'submitted')).to.not.throw();
            expect(order.status).to.equal('submitted');
        });
    });
});
