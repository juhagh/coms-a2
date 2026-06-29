const { expect } = require('chai');
const {
    OrderStatusSubject,
    AuditLogObserver,
    KitchenNotifier,
    CustomerNotifier,
} = require('../patterns/observer/OrderEvents');

function fakeLogger() {
    const lines = [];
    const noop = () => {};
    return { lines, info: (m) => lines.push(m), warn: noop, error: noop, debug: noop };
}

describe('Order Events (Observer pattern)', () => {

    describe('subject / observer wiring', () => {
        it('notifies every subscribed observer with the same event', () => {
            const subject = new OrderStatusSubject();
            const received = [];
            subject
                .subscribe({ onStatusChanged: (e) => received.push(['a', e]) })
                .subscribe({ onStatusChanged: (e) => received.push(['b', e]) });

            const event = { orderId: 'o1', from: 'queued', to: 'preparing' };
            subject.notifyStatusChanged(event);

            expect(received.map((r) => r[0])).to.deep.equal(['a', 'b']);
            expect(received[0][1]).to.equal(event);
        });

        it('stops notifying an unsubscribed observer', () => {
            const subject = new OrderStatusSubject();
            let count = 0;
            const observer = { onStatusChanged: () => { count += 1; } };

            subject.subscribe(observer);
            subject.notifyStatusChanged({ orderId: 'o1', from: 'a', to: 'b' });
            subject.unsubscribe(observer);
            subject.notifyStatusChanged({ orderId: 'o1', from: 'b', to: 'c' });

            expect(count).to.equal(1);
        });
    });

    describe('concrete observers', () => {
        it('AuditLogObserver logs every change with from/to and id', () => {
            const logger = fakeLogger();
            new AuditLogObserver(logger).onStatusChanged({ orderId: 'o1', from: 'queued', to: 'preparing' });
            expect(logger.lines).to.have.lengthOf(1);
            expect(logger.lines[0]).to.include('o1').and.to.include('queued').and.to.include('preparing');
        });

        it('KitchenNotifier reacts only when an order becomes queued', () => {
            const logger = fakeLogger();
            const kitchen = new KitchenNotifier(logger);
            kitchen.onStatusChanged({ orderId: 'o1', from: 'submitted', to: 'queued' });
            kitchen.onStatusChanged({ orderId: 'o2', from: 'preparing', to: 'ready' });
            expect(kitchen.queue).to.deep.equal(['o1']);
            expect(logger.lines).to.have.lengthOf(1);
        });

        it('CustomerNotifier reacts only when an order becomes ready', () => {
            const logger = fakeLogger();
            const notifier = new CustomerNotifier(logger);
            notifier.onStatusChanged({ orderId: 'o1', from: 'queued', to: 'preparing' });
            notifier.onStatusChanged({ orderId: 'o1', from: 'preparing', to: 'ready' });
            expect(logger.lines).to.have.lengthOf(1);
            expect(logger.lines[0]).to.include('ready');
        });
    });
});
