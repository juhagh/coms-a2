/**
 * State pattern — order lifecycle.
 * Mirrors the SysML state-machine diagram (Assignment 1, Figure 6).
 *
 * Each lifecycle status is a class that knows which transitions are legal
 * FROM it. The controller no longer owns a transition map; it asks the
 * current state object whether a move is allowed. Adding or changing a
 * state is a localised change (open for extension, closed for modification).
 *
 * OOP principles demonstrated here:
 *   - Abstraction  : OrderState defines the interface every state honours.
 *   - Inheritance  : each concrete state extends OrderState.
 *   - Polymorphism : allowedTransitions() / isTerminal() resolve to the
 *                    concrete state's behaviour at runtime.
 *   - Encapsulation: transition rules live inside each state, not leaked
 *                    into controllers.
 */

class InvalidOrderTransitionError extends Error {
    constructor(from, to) {
        super(`Cannot transition from ${from} to ${to}`);
        this.name = 'InvalidOrderTransitionError';
        this.from = from;
        this.to = to;
    }
}

/** Abstract base state. */
class OrderState {
    /** @returns {string} the status string persisted on the Order document */
    get name() {
        throw new Error('OrderState.name must be implemented by a subclass');
    }

    /** @returns {string[]} statuses this state may legally transition to */
    allowedTransitions() {
        return [];
    }

    /** @param {string} target @returns {boolean} */
    canTransitionTo(target) {
        return this.allowedTransitions().includes(target);
    }

    /** Terminal states accept no further transitions. */
    isTerminal() {
        return this.allowedTransitions().length === 0;
    }
}

class DraftState extends OrderState {
    get name() { return 'draft'; }
    allowedTransitions() { return ['submitted', 'cancelled']; }
}

class SubmittedState extends OrderState {
    get name() { return 'submitted'; }
    allowedTransitions() { return ['queued', 'cancelled']; }
}

class QueuedState extends OrderState {
    get name() { return 'queued'; }
    allowedTransitions() { return ['preparing', 'cancelled']; }
}

class PreparingState extends OrderState {
    get name() { return 'preparing'; }
    allowedTransitions() { return ['ready']; }
}

class ReadyState extends OrderState {
    get name() { return 'ready'; }
    allowedTransitions() { return ['completed']; }
}

class CompletedState extends OrderState {
    get name() { return 'completed'; }
    allowedTransitions() { return []; }
}

class CancelledState extends OrderState {
    get name() { return 'cancelled'; }
    allowedTransitions() { return []; }
}

/**
 * Registry / lightweight factory: maps a status string to its state object.
 * States are stateless, so a single shared instance per status is reused.
 * (This is also the seed of the Factory pattern you'll formalise for users.)
 */
const STATES = {
    draft: new DraftState(),
    submitted: new SubmittedState(),
    queued: new QueuedState(),
    preparing: new PreparingState(),
    ready: new ReadyState(),
    completed: new CompletedState(),
    cancelled: new CancelledState(),
};

/**
 * @param {string} status
 * @returns {OrderState}
 */
function getOrderState(status) {
    const state = STATES[status];
    if (!state) {
        throw new Error(`Unknown order status: ${status}`);
    }
    return state;
}

module.exports = {
    OrderState,
    DraftState,
    SubmittedState,
    QueuedState,
    PreparingState,
    ReadyState,
    CompletedState,
    CancelledState,
    getOrderState,
    InvalidOrderTransitionError,
};
