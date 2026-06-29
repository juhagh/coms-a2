const { expect } = require('chai');
const Logger = require('../patterns/singleton/Logger');

// Helper: a sink that captures emitted lines.
function captureSink() {
    const lines = [];
    const push = (l) => lines.push(l);
    return { lines, log: push, info: push, warn: push, error: push, debug: push };
}

describe('Logger (Singleton pattern)', () => {

    describe('single shared instance', () => {
        it('getInstance() always returns the same object', () => {
            expect(Logger.getInstance()).to.equal(Logger.getInstance());
        });

        it('new Logger() returns that same shared instance', () => {
            expect(new Logger()).to.equal(Logger.getInstance());
        });

        it('state set through one reference is visible through another', () => {
            const a = Logger.getInstance();
            const b = new Logger();
            a.setLevel('debug');
            expect(b._level).to.equal('debug'); // same underlying object
        });
    });

    describe('emitting', () => {
        it('writes a timestamped, levelled line to its sink', () => {
            const sink = captureSink();
            Logger.getInstance().setSink(sink).setLevel('info').info('hello');
            expect(sink.lines).to.have.lengthOf(1);
            expect(sink.lines[0]).to.match(/^\[\d{4}-\d{2}-\d{2}T.*\] \[INFO\] hello$/);
        });

        it('suppresses messages below the configured level', () => {
            const sink = captureSink();
            const logger = Logger.getInstance().setSink(sink).setLevel('warn');
            logger.info('quiet'); // below warn -> dropped
            logger.error('loud');
            expect(sink.lines).to.have.lengthOf(1);
            expect(sink.lines[0]).to.include('[ERROR] loud');
        });
    });
});