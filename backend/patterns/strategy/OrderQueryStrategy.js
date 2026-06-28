/**
 * Strategy pattern — interchangeable algorithms for querying orders.
 *
 * Two families of strategy are selected at runtime and composed by the
 * controller:
 *   - Visibility: WHICH orders a user may see (replaces the
 *       `role === 'staff' ? {createdBy} : {}` branch in getOrders).
 *   - Sort: the ORDER results come back in, switchable per request via ?sort=.
 *
 * Each family shares one interface, so the controller delegates to whichever
 * strategy is chosen without knowing the concrete algorithm. New behaviour
 * (e.g. a "today only" visibility, or a "by total" sort) is added as a new
 * class, not by editing the controller (open/closed).
 *
 * OOP principles demonstrated here:
 *   - Abstraction  : the base strategy classes define the interfaces.
 *   - Inheritance  : each concrete strategy extends its base.
 *   - Polymorphism : filter() / sort() resolve to the chosen strategy at runtime.
 *   - Encapsulation: each query rule lives inside its own strategy class.
 */

// ─── Visibility strategies: which orders a user may see ──────────────────────

class OrderVisibilityStrategy {
    /** @param {{_id: any}} user @returns {object} a Mongoose filter */
    filter(user) {
        throw new Error('OrderVisibilityStrategy.filter must be implemented by a subclass');
    }
}

class OwnOrdersStrategy extends OrderVisibilityStrategy {
    filter(user) {
        return { createdBy: user._id };
    }
}

class AllOrdersStrategy extends OrderVisibilityStrategy {
    filter() {
        return {};
    }
}

const VISIBILITY_BY_ROLE = {
    staff: new OwnOrdersStrategy(),
    kitchen: new AllOrdersStrategy(),
    admin: new AllOrdersStrategy(),
};

/**
 * @param {string} role
 * @returns {OrderVisibilityStrategy} defaults to own-orders (least privilege)
 */
function visibilityStrategyFor(role) {
    return VISIBILITY_BY_ROLE[role] || new OwnOrdersStrategy();
}

// ─── Sort strategies: the order results are returned in ──────────────────────

class OrderSortStrategy {
    /** @returns {object} a Mongoose sort spec */
    sort() {
        throw new Error('OrderSortStrategy.sort must be implemented by a subclass');
    }
}

class NewestFirstStrategy extends OrderSortStrategy {
    sort() { return { createdAt: -1 }; }
}

class OldestFirstStrategy extends OrderSortStrategy {
    sort() { return { createdAt: 1 }; }
}

class ByStatusStrategy extends OrderSortStrategy {
    sort() { return { status: 1, createdAt: -1 }; }
}

const SORT_BY_KEY = {
    newest: new NewestFirstStrategy(),
    oldest: new OldestFirstStrategy(),
    status: new ByStatusStrategy(),
};

/**
 * @param {string} [key] one of newest | oldest | status
 * @returns {OrderSortStrategy} defaults to newest-first
 */
function sortStrategyFor(key) {
    return SORT_BY_KEY[key] || new NewestFirstStrategy();
}

module.exports = {
    OrderVisibilityStrategy,
    OwnOrdersStrategy,
    AllOrdersStrategy,
    visibilityStrategyFor,
    OrderSortStrategy,
    NewestFirstStrategy,
    OldestFirstStrategy,
    ByStatusStrategy,
    sortStrategyFor,
};
