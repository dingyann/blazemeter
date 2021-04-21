"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var array_utils_1 = require("./array-utils");
test('arraysMatch', function () {
    expect(array_utils_1.arraysMatch([], [])).toBe(true);
    expect(array_utils_1.arraysMatch([1, 2], [1, 2])).toBe(true);
    expect(array_utils_1.arraysMatch(['hello1', 'hello2'], ['hello1', 'hello2'])).toBe(true);
    expect(array_utils_1.arraysMatch([], [1])).toBe(false);
    expect(array_utils_1.arraysMatch(['1'], ['1', 2])).toBe(false);
});
//# sourceMappingURL=array-utils.spec.js.map