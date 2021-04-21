"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var string_utils_1 = require("./string-utils");
test('stringIsEmpty', function () {
    expect(string_utils_1.stringIsEmpty('')).toBe(true);
    expect(string_utils_1.stringIsEmpty('\t')).toBe(true);
    expect(string_utils_1.stringIsEmpty('  ')).toBe(true);
    expect(string_utils_1.stringIsEmpty('  \t  ')).toBe(true);
    expect(string_utils_1.stringIsEmpty('some')).toBe(false);
    expect(string_utils_1.stringIsEmpty('  some')).toBe(false);
    expect(string_utils_1.stringIsEmpty('some  ')).toBe(false);
});
test('titleCase', function () {
    expect(string_utils_1.titleCase('something')).toBe('Something');
    expect(string_utils_1.titleCase('SOMETHING')).toBe('SOMETHING');
    expect(string_utils_1.titleCase('')).toBe('');
});
test('stripTrailingSlash', function () {
    expect(string_utils_1.stripTrailingSlash(undefined)).toBe(undefined);
    expect(string_utils_1.stripTrailingSlash('something')).toBe('something');
    expect(string_utils_1.stripTrailingSlash('something/')).toBe('something');
    expect(string_utils_1.stripTrailingSlash('something////')).toBe('something');
    expect(string_utils_1.stripTrailingSlash('/something////')).toBe('/something');
    expect(string_utils_1.stripTrailingSlash('http://localhost/')).toBe('http://localhost');
});
//# sourceMappingURL=string-utils.spec.js.map