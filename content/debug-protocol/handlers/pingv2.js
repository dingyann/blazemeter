"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var messages_1 = require("../messages");
function pingv2Handler() {
    window.postMessage({ type: messages_1.DEBUGGER_PONG_V2 }, location.origin);
}
exports.pingv2Handler = pingv2Handler;
//# sourceMappingURL=pingv2.js.map