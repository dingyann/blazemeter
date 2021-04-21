"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var webextension_polyfill_ts_1 = require("webextension-polyfill-ts");
var remote_debugger_session_1 = require("./remote-debugger-session");
var DEBUG_PORT_PREFIX = 'dbg-';
var RemoteDebugger = /** @class */ (function () {
    function RemoteDebugger() {
        var _this = this;
        this.sessions = new Map();
        webextension_polyfill_ts_1.browser.runtime.onConnect.addListener(function (port) {
            if (!port.name.startsWith(DEBUG_PORT_PREFIX)) {
                return;
            }
            if (_this.sessions.has(port.name)) {
                console.warn('Session already exists', port);
                return;
            }
            console.info('Creating the session', port);
            _this.sessions.set(port.name, new remote_debugger_session_1.RemoteDebuggerSession(port));
            port.onDisconnect.addListener(function (x) {
                console.info('Deleting the session', x.name);
                _this.sessions.delete(x.name);
            });
        });
    }
    return RemoteDebugger;
}());
// Poor man exports to global scope
var GLOBAL_EXPORT = window;
GLOBAL_EXPORT.remoteDebugger = new RemoteDebugger();
//# sourceMappingURL=remote-debugger.js.map