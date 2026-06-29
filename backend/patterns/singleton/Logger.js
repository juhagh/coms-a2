/**
 * Singleton pattern — application logger.
 *
 * One shared Logger instance is used across the app, so log configuration
 * (output sink and minimum level) lives in a single place and every module
 * writes through the same object. The constructor short-circuits to the
 * existing instance, so `new Logger()`, a second `new Logger()`, and
 * `Logger.getInstance()` all return the very same object — there is no way to
 * end up with competing loggers.
 *
 * (Node's module cache already makes a required module singleton-ish; this is
 * the explicit GoF Singleton, which is configurable and unit-testable.)
 *
 * OOP principles demonstrated here:
 *   - Encapsulation: the single instance, level and sink are owned by the
 *                    class; callers cannot construct a competing logger.
 *   - Abstraction  : callers use info()/warn()/error()/debug(), not console
 *                    directly, so the output mechanism can change in one place.
 */

const LEVELS = { error: 0, warn: 1, info: 2, debug: 3 };

class Logger {
    constructor() {
        if (Logger._instance) {
            return Logger._instance; // always hand back the one instance
        }
        this._sink = console;        // where output goes (swappable for tests)
        this._level = 'info';        // minimum level that will be emitted
        Logger._instance = this;
    }

    /** @returns {Logger} the one shared instance */
    static getInstance() {
        return Logger._instance || new Logger();
    }

    /** Config/test seam: redirect output (e.g. to a capture array). */
    setSink(sink) {
        this._sink = sink;
        return this;
    }

    /** Set the minimum level that will be emitted. */
    setLevel(level) {
        if (level in LEVELS) this._level = level;
        return this;
    }

    _emit(level, message) {
        if (LEVELS[level] > LEVELS[this._level]) return false; // below threshold
        const line = `[${new Date().toISOString()}] [${level.toUpperCase()}] ${message}`;
        const fn = this._sink[level] || this._sink.log;
        fn.call(this._sink, line);
        return true;
    }

    error(message) { return this._emit('error', message); }
    warn(message) { return this._emit('warn', message); }
    info(message) { return this._emit('info', message); }
    debug(message) { return this._emit('debug', message); }
}

module.exports = Logger;
