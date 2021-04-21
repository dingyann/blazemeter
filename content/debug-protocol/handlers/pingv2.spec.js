"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var messages_1 = require("../messages");
var pingv2_1 = require("./pingv2");
window.postMessage = jest.fn();
test('Ping.v2 message handler', function () {
    pingv2_1.pingv2Handler();
    expect(window.postMessage).toBeCalledWith({
        type: messages_1.DEBUGGER_PONG_V2,
    }, window.location.origin);
});
//# sourceMappingURL=pingv2.spec.js.map