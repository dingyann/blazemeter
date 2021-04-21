"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function stringIsEmpty(input) {
    return !/\S/.test(input);
}
exports.stringIsEmpty = stringIsEmpty;
/**
 * Make string title cased
 * @param input
 * @returns {string}
 */
function titleCase(input) {
    return input.charAt(0).toUpperCase() + input.slice(1);
}
exports.titleCase = titleCase;
function stripTrailingSlash(str) {
    if (!str) {
        return str;
    }
    var re = /\/+$/g;
    return str.replace(re, '');
}
exports.stripTrailingSlash = stripTrailingSlash;
//# sourceMappingURL=string-utils.js.map