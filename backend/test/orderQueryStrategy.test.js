const { expect } = require('chai');
const {
    visibilityStrategyFor,
    sortStrategyFor,
    OwnOrdersStrategy,
    AllOrdersStrategy,
} = require('../patterns/strategy/OrderQueryStrategy');

describe('Order Query Strategy (Strategy pattern)', () => {

    describe('visibility strategy (by role)', () => {
        it('gives staff an own-orders filter scoped to their id', () => {
            const strategy = visibilityStrategyFor('staff');
            expect(strategy).to.be.instanceOf(OwnOrdersStrategy);
            expect(strategy.filter({ _id: 'user-123' })).to.deep.equal({ createdBy: 'user-123' });
        });

        it('gives kitchen an all-orders (empty) filter', () => {
            const strategy = visibilityStrategyFor('kitchen');
            expect(strategy).to.be.instanceOf(AllOrdersStrategy);
            expect(strategy.filter({ _id: 'user-123' })).to.deep.equal({});
        });

        it('gives admin an all-orders (empty) filter', () => {
            expect(visibilityStrategyFor('admin')).to.be.instanceOf(AllOrdersStrategy);
        });

        it('defaults to least-privilege (own orders) for an unknown role', () => {
            const strategy = visibilityStrategyFor('wizard');
            expect(strategy).to.be.instanceOf(OwnOrdersStrategy);
            expect(strategy.filter({ _id: 'u' })).to.deep.equal({ createdBy: 'u' });
        });
    });

    describe('sort strategy (switchable at runtime)', () => {
        it('newest -> createdAt descending', () => {
            expect(sortStrategyFor('newest').sort()).to.deep.equal({ createdAt: -1 });
        });

        it('oldest -> createdAt ascending', () => {
            expect(sortStrategyFor('oldest').sort()).to.deep.equal({ createdAt: 1 });
        });

        it('status -> status then newest', () => {
            expect(sortStrategyFor('status').sort()).to.deep.equal({ status: 1, createdAt: -1 });
        });

        it('defaults to newest-first when no/unknown key is given', () => {
            expect(sortStrategyFor().sort()).to.deep.equal({ createdAt: -1 });
            expect(sortStrategyFor('bogus').sort()).to.deep.equal({ createdAt: -1 });
        });
    });
});
