/**
 * Observer pattern — order status-change notifications.
 *
 * When an order's status changes, the controller publishes a single event to a
 * subject, which fans it out to every subscribed observer. The controller does
 * not know or care who is listening, so new reactions (SMS, websocket push,
 * analytics) are added by subscribing another observer — no controller change.
 *
 * Observers here are deliberately side-effect-light and take an injected logger
 * (the Singleton from patterns/singleton in real use, a fake in tests), which
 * keeps them pure and unit-testable.
 *
 * OOP principles demonstrated here:
 *   - Abstraction  : OrderObserver defines the listener interface.
 *   - Inheritance  : each concrete observer extends OrderObserver.
 *   - Polymorphism : onStatusChanged() resolves to each observer at runtime.
 *   - Encapsulation: the subject owns and manages its observer list.
 */

const Logger = require('../singleton/Logger');

/** Abstract observer. */
class OrderObserver {
    /** @param {{orderId:string, from:string, to:string}} event */
    onStatusChanged(event) {
        throw new Error('OrderObserver.onStatusChanged must be implemented by a subclass');
    }
}

/** Subject/publisher: keeps the observer list and fans out events. */
class OrderStatusSubject {
    constructor() {
        this._observers = [];
    }

    subscribe(observer) {
        this._observers.push(observer);
        return this;
    }

    unsubscribe(observer) {
        this._observers = this._observers.filter((o) => o !== observer);
        return this;
    }

    /** @param {{orderId:string, from:string, to:string}} event */
    notifyStatusChanged(event) {
        this._observers.forEach((o) => o.onStatusChanged(event));
    }
}

/** Records every status change to the shared log (audit trail). */
class AuditLogObserver extends OrderObserver {
    constructor(logger) {
        super();
        this.logger = logger;
    }

    onStatusChanged({ orderId, from, to }) {
        this.logger.info(`Order ${orderId} status changed: ${from} -> ${to}`);
    }
}

/** Reacts when an order enters the kitchen queue. */
class KitchenNotifier extends OrderObserver {
    constructor(logger) {
        super();
        this.logger = logger;
        this.queue = [];
    }

    onStatusChanged({ orderId, to }) {
        if (to === 'queued') {
            this.queue.push(orderId);
            this.logger.info(`Kitchen: new ticket for order ${orderId}`);
        }
    }
}

/** Reacts when an order is ready for the customer. */
class CustomerNotifier extends OrderObserver {
    constructor(logger) {
        super();
        this.logger = logger;
    }

    onStatusChanged({ orderId, to }) {
        if (to === 'ready') {
            this.logger.info(`Customer: order ${orderId} is ready for pickup`);
        }
    }
}

/**
 * Build a subject pre-wired with the default observers.
 * @param {object} [logger] defaults to the shared Logger singleton
 */
function buildOrderStatusSubject(logger = Logger.getInstance()) {
    return new OrderStatusSubject()
        .subscribe(new AuditLogObserver(logger))
        .subscribe(new KitchenNotifier(logger))
        .subscribe(new CustomerNotifier(logger));
}

// Shared, app-wide subject used by the controller.
const orderStatusSubject = buildOrderStatusSubject();

module.exports = {
    OrderObserver,
    OrderStatusSubject,
    AuditLogObserver,
    KitchenNotifier,
    CustomerNotifier,
    buildOrderStatusSubject,
    orderStatusSubject,
};
