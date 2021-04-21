"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var webextension_polyfill_ts_1 = require("webextension-polyfill-ts");
function delay(t) {
    return new Promise(function (r) { return setTimeout(r, t); });
}
exports.delay = delay;
function forAllTabs(fn) {
    webextension_polyfill_ts_1.browser.tabs.query({}).then(function (tabs) {
        for (var _i = 0, tabs_1 = tabs; _i < tabs_1.length; _i++) {
            var tab = tabs_1[_i];
            if (!tab.url.startsWith('chrome-extension://') && !tab.url.startsWith('chrome://')) {
                fn(tab);
            }
        }
    });
}
exports.forAllTabs = forAllTabs;
//# sourceMappingURL=utils.js.map