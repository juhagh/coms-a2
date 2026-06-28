const { getOrderState, InvalidOrderTransitionError } = require('./OrderState');

/**
 * Validate and apply a status transition to an order.
 *
 * Pure logic — no database — so it can be unit-tested in isolation (which is
 * exactly what the State pattern buys us: the transition rules are no longer
 * tangled inside an async controller). Mutates order.status on success;
 * throws InvalidOrderTransitionError on an illegal move.
 *
 * @param {{status: string}} order  a Mongoose Order document or plain object
 * @param {string} target           the desired next status
 * @returns {{status: string}}      the same order, status updated
 * @throws {InvalidOrderTransitionError}
 */
function transitionOrder(order, target) {
    const current = getOrderState(order.status);
    if (!current.canTransitionTo(target)) {
        throw new InvalidOrderTransitionError(order.status, target);
    }
    order.status = target;
    return order;
}

module.exports = { transitionOrder };
