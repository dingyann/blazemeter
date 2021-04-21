"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Simple wrapper for opening and working with long-lived connections in the browser
 */
var DebuggerPort = /** @class */ (function () {
    /**
     * Create the port with the specified name
     * @param name Name of the port
     */
    function DebuggerPort(name) {
        this.port = chrome.runtime.connect({ name: name });
    }
    /**
     * Listen for the messages from the port
     * @param fn Listener function
     */
    DebuggerPort.prototype.listen = function (fn) {
        this.port.onMessage.addListener(fn);
    };
    /**
     * Send message to the port
     * @param data Data to be sent over the port
     */
    DebuggerPort.prototype.send = function (data) {
        this.port.postMessage(data);
    };
    /**
     * Close the port
     */
    DebuggerPort.prototype.close = function () {
        this.port.disconnect();
    };
    return DebuggerPort;
}());
exports.DebuggerPort = DebuggerPort;
//# sourceMappingURL=debugger-port.js.map