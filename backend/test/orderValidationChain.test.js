const { expect } = require('chai');
const {
    validateOrderRequest,
    OrderValidationError,
} = require('../patterns/chain/ValidationHandler');

describe('Order Validation Chain (Chain of Responsibility)', () => {

    it('passes a well-formed order through the whole chain', () => {
        const context = { items: [{ menuItemId: 'm1', quantity: 2 }, { menuItemId: 'm2', quantity: 1 }] };
        expect(validateOrderRequest(context)).to.equal(true);
    });

    describe('first link: items present', () => {
        it('rejects an empty items array with the preserved message', () => {
            expect(() => validateOrderRequest({ items: [] }))
                .to.throw(OrderValidationError, 'An order must contain at least one item');
        });

        it('rejects a missing/non-array items field', () => {
            expect(() => validateOrderRequest({}))
                .to.throw(OrderValidationError, 'An order must contain at least one item');
        });
    });

    describe('second link: item shape', () => {
        it('rejects an item with no menuItemId and reports its position', () => {
            const context = { items: [{ menuItemId: 'm1', quantity: 1 }, { quantity: 1 }] };
            expect(() => validateOrderRequest(context))
                .to.throw(OrderValidationError, 'position 2 is missing a menuItemId');
        });
    });

    describe('third link: quantity', () => {
        it('rejects a zero quantity', () => {
            expect(() => validateOrderRequest({ items: [{ menuItemId: 'm1', quantity: 0 }] }))
                .to.throw(OrderValidationError, 'quantity of at least 1');
        });

        it('rejects a negative or non-integer quantity', () => {
            expect(() => validateOrderRequest({ items: [{ menuItemId: 'm1', quantity: -3 }] }))
                .to.throw(OrderValidationError);
            expect(() => validateOrderRequest({ items: [{ menuItemId: 'm1', quantity: 1.5 }] }))
                .to.throw(OrderValidationError);
        });

        it('accepts a numeric-string quantity (coerced)', () => {
            expect(validateOrderRequest({ items: [{ menuItemId: 'm1', quantity: '3' }] })).to.equal(true);
        });
    });

    describe('ordering: earlier links short-circuit later ones', () => {
        it('reports "no items" before checking shape/quantity', () => {
            // empty array fails at the first link, never reaching shape/quantity
            expect(() => validateOrderRequest({ items: [] }))
                .to.throw(OrderValidationError, 'at least one item');
        });
    });
});