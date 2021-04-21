"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var background_utils_1 = require("./background-utils");
function createRequest(method, requestId) {
    return {
        method: method,
        requestId: requestId,
        frameId: 0,
        parentFrameId: 0,
        tabId: 0,
        timeStamp: 0,
        type: 'main_frame',
        url: 'https://blazemeter.com',
    };
}
test('generateKey', function () {
    expect(background_utils_1.generateKey(createRequest('POST', '1'))).toBe('POST1');
    expect(background_utils_1.generateKey(createRequest('GET', '1337'))).toBe('GET1337');
    expect(background_utils_1.generateKey(createRequest('PUT', '3256'))).toBe('PUT3256');
    expect(background_utils_1.generateKey(createRequest('PATCH', '1122'))).toBe('PATCH1122');
    expect(background_utils_1.generateKey(createRequest('DELETE', '100'))).toBe('DELETE100');
});
//# sourceMappingURL=background-utils.spec.js.map