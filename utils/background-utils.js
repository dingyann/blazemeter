"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function generateKey(requestInfo) {
    return "" + requestInfo.method + requestInfo.requestId;
}
exports.generateKey = generateKey;
var GLOBAL = window;
GLOBAL.generateKey = generateKey;
//# sourceMappingURL=background-utils.js.map