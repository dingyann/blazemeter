"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var url_utils_1 = require("./url-utils");
test('validUrl', function () {
    expect(url_utils_1.validUrl('http://localhost')).toBe(true);
    expect(url_utils_1.validUrl('https://a.blazemeter.com')).toBe(true);
    expect(url_utils_1.validUrl('https://bard.blazemeter.com')).toBe(true);
    expect(url_utils_1.validUrl('https:/com')).toBe(false);
    expect(url_utils_1.validUrl('localhost')).toBe(false);
});
//# sourceMappingURL=url-utils.spec.js.map