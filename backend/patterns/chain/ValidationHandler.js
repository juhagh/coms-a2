/**
 * Chain of Responsibility — order request validation.
 *
 * Each validation concern is its own handler. A request is passed along the
 * chain; a handler either approves and forwards to the next link, or stops the
 * chain by throwing an OrderValidationError. Adding or reordering a rule means
 * adding/moving a handler, not editing a long inline `if` block in the
 * controller.
 *
 * Note: your Express middleware pipeline (authenticate -> requireRole ->
 * controller) is itself a framework-level Chain of Responsibility. This module
 * is an explicit, ordered, unit-testable GoF chain for the validation stage.
 *
 * OOP principles demonstrated here:
 *   - Abstraction  : ValidationHandler defines the link interface.
 *   - Inheritance  : each concrete handler extends ValidationHandler.
 *   - Polymorphism : handle() resolves to each concrete handler at runtime.
 *   - Encapsulation: each rule (and its message) lives inside its own handler.
 */

class OrderValidationError extends Error {
    constructor(message) {
        super(message);
        this.name = 'OrderValidationError';
    }
}

/** Abstract base link. */
class ValidationHandler {
    constructor() {
        this.next = null;
    }

    /**
     * Link the next handler and return it, so links can be chained fluently:
     * a.setNext(b).setNext(c).
     * @param {ValidationHandler} handler
     * @returns {ValidationHandler} the handler just linked
     */
    setNext(handler) {
        this.next = handler;
        return handler;
    }

    /**
     * Default behaviour: forward to the next link, or finish successfully.
     * Concrete handlers run their check, then call super.handle(context).
     * @param {object} context
     * @returns {boolean} true when the whole chain passes
     */
    handle(context) {
        if (this.next) return this.next.handle(context);
        return true;
    }
}

class ItemsPresentHandler extends ValidationHandler {
    handle(context) {
        const { items } = context;
        if (!Array.isArray(items) || items.length === 0) {
            throw new OrderValidationError('An order must contain at least one item');
        }
        return super.handle(context);
    }
}

class ItemShapeHandler extends ValidationHandler {
    handle(context) {
        const missingAt = context.items.findIndex((i) => !i || !i.menuItemId);
        if (missingAt !== -1) {
            throw new OrderValidationError(
                `Order item at position ${missingAt + 1} is missing a menuItemId`
            );
        }
        return super.handle(context);
    }
}

class QuantityHandler extends ValidationHandler {
    handle(context) {
        const invalid = context.items.some((i) => {
            const quantity = Number(i.quantity);
            return !Number.isInteger(quantity) || quantity < 1;
        });
        if (invalid) {
            throw new OrderValidationError('Each order item must have a quantity of at least 1');
        }
        return super.handle(context);
    }
}

/**
 * Assemble the validation chain in order:
 * items present -> each item well-formed -> each quantity valid.
 * @returns {ValidationHandler} the head of the chain
 */
function buildOrderValidationChain() {
    const present = new ItemsPresentHandler();
    const shape = new ItemShapeHandler();
    const quantity = new QuantityHandler();

    present.setNext(shape).setNext(quantity);
    return present;
}

/**
 * Run a request context through the order validation chain.
 * @param {{ items: any }} context
 * @returns {boolean} true when valid
 * @throws {OrderValidationError} on the first failed rule
 */
function validateOrderRequest(context) {
    return buildOrderValidationChain().handle(context);
}

module.exports = {
    ValidationHandler,
    ItemsPresentHandler,
    ItemShapeHandler,
    QuantityHandler,
    OrderValidationError,
    buildOrderValidationChain,
    validateOrderRequest,
};
