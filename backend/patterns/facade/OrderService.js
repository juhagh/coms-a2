/**
 * Facade pattern — OrderService.
 *
 * A single, simple entry point to the order subsystem. The controller calls
 * placeOrder() / changeStatus() and no longer orchestrates the validation
 * chain, menu lookups, price maths, persistence, state transitions and event
 * publishing itself — the facade coordinates those collaborators behind two
 * methods.
 *
 * Dependencies are injectable (with sensible defaults) so the orchestration can
 * be unit-tested with fakes, without a database.
 *
 * OOP principles demonstrated here:
 *   - Abstraction  : callers see placeOrder()/changeStatus(), not the subsystem.
 *   - Encapsulation: the collaborators and the sequence between them are hidden
 *                    inside the service.
 */

const { validateOrderRequest } = require('../chain/ValidationHandler');
const { transitionOrder } = require('../state/OrderStateMachine');
const { orderStatusSubject } = require('../observer/OrderEvents');

class OrderService {
    constructor(deps = {}) {
        this.Order = deps.Order || require('../../models/Order');
        this.MenuItem = deps.MenuItem || require('../../models/MenuItem');
        this.validate = deps.validate || validateOrderRequest;
        this.transition = deps.transition || transitionOrder;
        this.subject = deps.subject || orderStatusSubject;
    }

    /**
     * Place a new order: validate request -> snapshot menu prices -> persist.
     * @param {{ userId: any, items: Array, notes?: string }} input
     * @returns {Promise<object>} the created order
     * @throws {OrderValidationError} when the request shape is invalid
     * @throws {Error} when a menu item is missing or unavailable
     */
    async placeOrder({ userId, items, notes }) {
        this.validate({ items }); // Chain of Responsibility

        const orderItems = await this._priceItems(items);
        const totalPrice = orderItems.reduce((sum, i) => sum + i.price * i.quantity, 0);

        return this.Order.create({
            createdBy: userId,
            items: orderItems,
            notes,
            totalPrice,
            status: 'queued',
        });
    }

    /**
     * Change an order's status: validate transition (State) -> persist ->
     * publish event (Observer).
     * @param {string} orderId
     * @param {string} targetStatus
     * @returns {Promise<object|null>} updated order, or null if not found
     * @throws {InvalidOrderTransitionError} for an illegal transition
     */
    async changeStatus(orderId, targetStatus) {
        const order = await this.Order.findById(orderId);
        if (!order) return null;

        const from = order.status;
        this.transition(order, targetStatus); // State pattern (throws on illegal move)
        const updated = await order.save();

        this.subject.notifyStatusChanged({
            orderId: updated._id.toString(),
            from,
            to: updated.status,
        });

        return updated;
    }

    async _priceItems(items) {
        return Promise.all(items.map(async (item) => {
            const menuItem = await this.MenuItem.findById(item.menuItemId);
            if (!menuItem) throw new Error(`Menu item ${item.menuItemId} not found`);
            if (!menuItem.available) throw new Error(`${menuItem.name} is not available`);
            return {
                menuItem: menuItem._id,
                name: menuItem.name,
                price: menuItem.price,
                quantity: item.quantity,
                image: menuItem.image || '',
            };
        }));
    }
}

module.exports = {
    OrderService,
    orderService: new OrderService(),
};
